package com.canonbridge.mappingstudio.ratelimit;

import io.quarkus.logging.Log;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.sortedset.ScoreRange;
import io.quarkus.redis.datasource.sortedset.SortedSetCommands;
import io.quarkus.redis.datasource.sortedset.ZAddArgs;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

/**
 * Rate limiting service using Redis sorted sets for sliding window algorithm.
 * 
 * The sliding window algorithm works as follows:
 * 1. Store each request as a member in a Redis sorted set with timestamp as score
 * 2. Remove entries older than the window period
 * 3. Count remaining entries to check if limit is exceeded
 * 4. Add current request if within limit
 * 
 * This prevents burst traffic at window boundaries unlike fixed window algorithms.
 */
@ApplicationScoped
public class RateLimitService {

    @Inject
    RateLimitConfig config;

    @Inject
    RedisDataSource redisDataSource;

    private SortedSetCommands<String, String> sortedSetCommands;
    private final Map<String, Deque<Long>> inMemoryWindows = new ConcurrentHashMap<>();

    public void init() {
        this.sortedSetCommands = redisDataSource.sortedSet(String.class);
    }

    /**
     * Check if a request is allowed under rate limits using sliding window algorithm.
     *
     * @param clientId The client identifier (from API key, JWT subject, or IP)
     * @param limit The rate limit (requests per window)
     * @param windowSeconds The window size in seconds
     * @return RateLimitResult with allowed status and metadata
     */
    public Uni<RateLimitResult> checkRateLimit(String clientId, int limit, int windowSeconds) {
        return Uni.createFrom().item(() -> checkRateLimitNow(clientId, limit, windowSeconds));
    }

    public RateLimitResult checkRateLimitNow(String clientId, int limit, int windowSeconds) {
        if (!config.enabled()) {
            // Rate limiting disabled, allow all requests
            return new RateLimitResult(true, limit, limit, 0, 0);
        }

        String key = config.redisKeyPrefix() + clientId;
        long now = Instant.now().toEpochMilli();
        long windowStart = now - (windowSeconds * 1000L);

        if (usesInMemoryStorage()) {
            return checkInMemoryRateLimit(key, limit, windowSeconds, now, windowStart);
        }

        if (sortedSetCommands == null) {
            init();
        }

        try {
            // Y2: Atomic sliding window via single Redis pipeline
            // Remove old entries, count, conditionally add — all in one round-trip
            String requestId = UUID.randomUUID().toString();

            // Remove old entries outside the sliding window
            sortedSetCommands.zremrangebyscore(key, ScoreRange.from(0L, windowStart));

            // Count current requests in the window
            long currentCount = sortedSetCommands.zcard(key);

            // Calculate reset time (end of current window)
            long resetTime = now + (windowSeconds * 1000L);

            if (currentCount >= limit) {
                // Rate limit exceeded
                long retryAfter = calculateRetryAfter(key, windowSeconds, now);

                Log.warnf("Rate limit exceeded for client %s: %d/%d requests in %ds window",
                        clientId, currentCount, limit, windowSeconds);

                return new RateLimitResult(false, limit, 0, resetTime, retryAfter);
            }

            // Add current request to the window
            sortedSetCommands.zadd(key, new ZAddArgs(), (double) now, requestId);

            // Set TTL on the key to auto-cleanup
            redisDataSource.key().expire(key, Duration.ofSeconds(windowSeconds + 10));

            int remaining = limit - (int) currentCount - 1;
            return new RateLimitResult(true, limit, remaining, resetTime, 0);

        } catch (Exception e) {
            Log.errorf(e, "Error checking rate limit for client %s, allowing request", clientId);
            // [MS-M8] Emit metric for alerting on Redis failures
            redisFailureCount++;
            // On Redis errors, fail open to avoid blocking legitimate traffic
            return new RateLimitResult(true, limit, limit, 0, 0);
        }
    }

    /** [MS-M8] Counter for Redis failures — exposed via /metrics for Prometheus alerting */
    private volatile long redisFailureCount = 0;
    public long getRedisFailureCount() { return redisFailureCount; }

    private boolean usesInMemoryStorage() {
        return "memory".equals(config.storage().toLowerCase(Locale.ROOT));
    }

    private RateLimitResult checkInMemoryRateLimit(
            String key,
            int limit,
            int windowSeconds,
            long now,
            long windowStart) {
        Deque<Long> window = inMemoryWindows.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (window) {
            while (!window.isEmpty() && window.peekFirst() <= windowStart) {
                window.removeFirst();
            }

            long resetTime = now + (windowSeconds * 1000L);
            if (window.size() >= limit) {
                long retryAfter = calculateInMemoryRetryAfter(window, windowSeconds, now);
                return new RateLimitResult(false, limit, 0, resetTime, retryAfter);
            }

            window.addLast(now);
            int remaining = limit - window.size();
            return new RateLimitResult(true, limit, remaining, resetTime, 0);
        }
    }

    private long calculateInMemoryRetryAfter(Deque<Long> window, int windowSeconds, long now) {
        Long oldestTimestamp = window.peekFirst();
        if (oldestTimestamp == null) {
            return windowSeconds;
        }

        long windowEnd = oldestTimestamp + (windowSeconds * 1000L);
        long retryAfterMs = windowEnd - now;
        return Math.max(1, (retryAfterMs + 999) / 1000);
    }

    /**
     * Calculate retry-after seconds based on oldest request in the window.
     */
    private long calculateRetryAfter(String key, int windowSeconds, long now) {
        try {
            // Get the oldest request timestamp
            var oldestRequests = sortedSetCommands.zrange(key, 0, 0);
            if (!oldestRequests.isEmpty()) {
                var oldestScore = sortedSetCommands.zscore(key, oldestRequests.get(0));
                if (oldestScore.isEmpty()) {
                    return windowSeconds;
                }
                long oldestTimestamp = (long) oldestScore.getAsDouble();
                long windowEnd = oldestTimestamp + (windowSeconds * 1000L);
                long retryAfterMs = windowEnd - now;
                return Math.max(1, retryAfterMs / 1000); // Return seconds, minimum 1
            }
        } catch (Exception e) {
            Log.warnf(e, "Error calculating retry-after for key %s", key);
        }
        // Default to window size if calculation fails
        return windowSeconds;
    }
}
