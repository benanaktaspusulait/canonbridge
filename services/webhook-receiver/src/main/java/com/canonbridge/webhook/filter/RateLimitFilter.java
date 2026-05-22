package com.canonbridge.webhook.filter;

import io.quarkus.logging.Log;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * W-Y3 FIX: In-memory rate limiting filter for webhook-receiver.
 *
 * Limits requests per partner to prevent a single partner from flooding
 * the Kafka topic with excessive webhook events.
 *
 * Uses a simple sliding window counter per partnerId stored in-memory.
 * For multi-instance deployments, this should be replaced with Redis-based
 * rate limiting (add quarkus-redis dependency).
 *
 * Note: In-memory rate limiting is per-instance. With N replicas, effective
 * limit is N * maxRequests. This is acceptable for initial protection.
 */
@Provider
@ApplicationScoped
@Priority(Priorities.USER - 100)
public class RateLimitFilter implements ContainerRequestFilter {

    private final ConcurrentHashMap<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    @ConfigProperty(name = "canonbridge.webhook.ratelimit.enabled", defaultValue = "true")
    boolean rateLimitEnabled;

    @ConfigProperty(name = "canonbridge.webhook.ratelimit.max-requests", defaultValue = "100")
    int maxRequests;

    @ConfigProperty(name = "canonbridge.webhook.ratelimit.window-seconds", defaultValue = "60")
    int windowSeconds;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!rateLimitEnabled) return;

        String path = requestContext.getUriInfo().getPath();
        if (!path.startsWith("webhook/")) return;

        // Extract partnerId from path: /webhook/{partnerId}/{eventType}
        String[] segments = path.split("/");
        if (segments.length < 2) return;

        String partnerId = segments[1];
        RateLimitBucket bucket = buckets.computeIfAbsent(partnerId, k -> new RateLimitBucket());

        if (!bucket.tryAcquire(maxRequests, windowSeconds)) {
            Log.warnf("Rate limit exceeded for partner %s: max %d requests per %ds",
                    partnerId, maxRequests, windowSeconds);

            requestContext.abortWith(
                    Response.status(429)
                            .type(MediaType.APPLICATION_JSON_TYPE)
                            .header("Retry-After", String.valueOf(windowSeconds))
                            .header("X-RateLimit-Limit", String.valueOf(maxRequests))
                            .header("X-RateLimit-Remaining", "0")
                            .entity(new RateLimitError("rate_limit_exceeded",
                                    "Too many requests. Limit: " + maxRequests + " per " + windowSeconds + "s"))
                            .build()
            );
        }
    }

    /**
     * Simple fixed-window rate limit bucket.
     * Resets counter when the window expires.
     */
    private static class RateLimitBucket {
        private final AtomicInteger count = new AtomicInteger(0);
        private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());

        boolean tryAcquire(int maxRequests, int windowSeconds) {
            long now = System.currentTimeMillis();
            long windowMs = windowSeconds * 1000L;

            // Check if window has expired
            long start = windowStart.get();
            if (now - start > windowMs) {
                // Reset window
                if (windowStart.compareAndSet(start, now)) {
                    count.set(1);
                    return true;
                }
                // Another thread reset it — retry
                return count.incrementAndGet() <= maxRequests;
            }

            return count.incrementAndGet() <= maxRequests;
        }
    }

    public record RateLimitError(String error, String message) {}
}
