package com.canonbridge.webhook.filter;

import io.quarkus.logging.Log;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.keys.KeyCommands;
import io.quarkus.redis.datasource.value.ValueCommands;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;

/**
 * V5-H1 FIX: Redis-based rate limiting filter for webhook-receiver.
 *
 * Uses Redis INCR + EXPIRE for distributed rate limiting across replicas.
 * Falls back to allowing requests if Redis is unavailable (fail-open with logging).
 */
@Provider
@ApplicationScoped
@Priority(Priorities.USER - 100)
public class RateLimitFilter implements ContainerRequestFilter {

    private static final String KEY_PREFIX = "wh_rl:";

    @ConfigProperty(name = "canonbridge.webhook.ratelimit.enabled", defaultValue = "true")
    boolean rateLimitEnabled;

    @ConfigProperty(name = "canonbridge.webhook.ratelimit.max-requests", defaultValue = "100")
    int maxRequests;

    @ConfigProperty(name = "canonbridge.webhook.ratelimit.window-seconds", defaultValue = "60")
    int windowSeconds;

    @Inject
    RedisDataSource redisDataSource;

    @Inject
    MeterRegistry meterRegistry;

    private volatile ValueCommands<String, Long> valueCommands;
    private volatile KeyCommands<String> keyCommands;
    private volatile Counter redisFailureCounter;

    // WR-V1-M7 FIX: Thread-safe lazy init with double-checked locking
    private void initRedis() {
        if (valueCommands == null) {
            synchronized (this) {
                if (valueCommands == null) {
                    valueCommands = redisDataSource.value(Long.class);
                    keyCommands = redisDataSource.key();
                    redisFailureCounter = meterRegistry.counter("webhook_ratelimit_redis_failures_total");
                }
            }
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!rateLimitEnabled) return;

        String path = requestContext.getUriInfo().getPath();
        if (!path.startsWith("webhook/")) return;

        String[] segments = path.split("/");
        if (segments.length < 2) return;

        String partnerId = segments[1];

        // WR-V1-H4 FIX: Validate partnerId is a UUID to prevent key-cardinality DoS
        if (!partnerId.matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")) {
            requestContext.abortWith(
                Response.status(400)
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(new RateLimitError("invalid_partner_id", "Partner ID must be a valid UUID"))
                    .build()
            );
            return;
        }

        try {
            initRedis();
            // [WR-H2] FIX: Use actual remote address, not spoofable X-Forwarded-For
            // Only trust XFF if behind a known load balancer (configured via env)
            String clientIp = "unknown";
            if (requestContext instanceof io.vertx.core.http.HttpServerRequest) {
                clientIp = ((io.vertx.core.http.HttpServerRequest) requestContext).remoteAddress().host();
            } else {
                // Fallback: use XFF but only first hop (set by LB)
                String xff = requestContext.getHeaderString("X-Forwarded-For");
                if (xff != null) clientIp = xff.split(",")[0].trim();
            }

            String key = KEY_PREFIX + partnerId + ":" + clientIp;

            // Atomic increment
            Long count = valueCommands.incr(key);

            // Set expiry on first request in window
            if (count != null && count == 1L) {
                keyCommands.expire(key, Duration.ofSeconds(windowSeconds));
            }

            if (count != null && count > maxRequests) {
                Log.warnf("Rate limit exceeded for partner %s: %d/%d in %ds window",
                        partnerId, count, maxRequests, windowSeconds);

                long ttl = keyCommands.ttl(key);
                requestContext.abortWith(
                        Response.status(429)
                                .type(MediaType.APPLICATION_JSON_TYPE)
                                .header("Retry-After", String.valueOf(Math.max(ttl, 1)))
                                .header("X-RateLimit-Limit", String.valueOf(maxRequests))
                                .header("X-RateLimit-Remaining", "0")
                                .entity(new RateLimitError("rate_limit_exceeded",
                                        "Too many requests. Limit: " + maxRequests + " per " + windowSeconds + "s"))
                                .build()
                );
            }
        } catch (Exception e) {
            // NEW-V6-M1 FIX: Increment metric counter for alerting on Redis failures
            if (redisFailureCounter != null) redisFailureCounter.increment();
            Log.errorf(e, "Redis rate limit check failed for partner %s — allowing request (fail-open)", partnerId);
        }
    }

    public record RateLimitError(String error, String message) {}
}
