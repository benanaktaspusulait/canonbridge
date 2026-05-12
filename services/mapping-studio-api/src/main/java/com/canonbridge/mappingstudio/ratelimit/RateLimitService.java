package com.canonbridge.mappingstudio.ratelimit;

import io.quarkus.logging.Log;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.sortedset.SortedSetCommands;
import io.quarkus.redis.datasource.sortedset.ZAddArgs;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Duration;
import java.time.Instant;
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
        if (!config.enabled()) {
            // Rate limiting disabled, allow all requests
            return Uni.createFrom().item(new RateLimitResult(true, limit, limit, 0, 0));
        }

        if (sortedSetCommands == null) {
            init();
        }

        String key = config.redisKeyPrefix() + clientId;
        long now = Instant.now().toEpochMilli();
        long windowStart = now - (windowSeconds * 1000L);

        return Uni.createFrom().item(() -> {
            try {
                // Remove old entries outside the sliding window
                sortedSetCommands.zremrangebyscore(key, 0, windowStart);

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
                String requestId = UUID.randomUUID().toString();
                sortedSetCommands.zadd(key, now, requestId, new ZAddArgs());

                // Set TTL on the key to auto-cleanup
                redisDataSource.key().expire(key, Duration.ofSeconds(windowSeconds + 10));

                int remaining = limit - (int) currentCount - 1;
                return new RateLimitResult(true, limit, remaining, resetTime, 0);

            } catch (Exception e) {
                Log.errorf(e, "Error checking rate limit for client %s, allowing request", clientId);
                // On Redis errors, fail open to avoid blocking legitimate traffic
                return new RateLimitResult(true, limit, limit, 0, 0);
            }
        });
    }

    /**
     * Calculate retry-after seconds based on oldest request in the window.
     */
    private long calculateRetryAfter(String key, int windowSeconds, long now) {
        try {
            // Get the oldest request timestamp
            var oldestRequests = sortedSetCommands.zrange(key, 0, 0);
            if (!oldestRequests.isEmpty()) {
                double oldestScore = sortedSetCommands.zscore(key, oldestRequests.get(0));
                long oldestTimestamp = (long) oldestScore;
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
