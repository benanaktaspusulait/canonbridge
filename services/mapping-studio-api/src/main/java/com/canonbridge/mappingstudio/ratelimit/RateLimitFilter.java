package com.canonbridge.mappingstudio.ratelimit;

import io.smallrye.mutiny.Uni;
import io.vertx.core.http.HttpServerRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;
import org.jboss.resteasy.reactive.server.ServerResponseFilter;

import java.security.MessageDigest;
import java.security.Principal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.Map;

/**
 * Reactive rate limiting filter for API endpoints.
 * 
 * Uses Quarkus RESTEasy Reactive {@code @ServerRequestFilter} to avoid blocking
 * the Vert.x event loop when Redis is used as the rate limit storage backend.
 * 
 * Rate limits are applied based on:
 * - Authenticated requests: client identifier from JWT subject or API key
 * - Unauthenticated requests: client IP address
 */
@ApplicationScoped
public class RateLimitFilter {

    private static final String RATE_LIMIT_RESULT_KEY = "canonbridge.ratelimit.result";

    @Inject
    RateLimitService rateLimitService;

    @Inject
    RateLimitConfig config;

    @Context
    HttpServerRequest request;

    @ServerRequestFilter(priority = jakarta.ws.rs.Priorities.AUTHORIZATION + 10)
    public Uni<Response> filter(ContainerRequestContext requestContext) {
        if (!config.enabled()) {
            return Uni.createFrom().nullItem();
        }

        // Skip only infrastructure and documentation endpoints.
        String path = requestContext.getUriInfo().getPath();
        if (path.startsWith("health") || path.startsWith("metrics") ||
            path.startsWith("openapi") || path.startsWith("swagger-ui")) {
            return Uni.createFrom().nullItem();
        }

        // Determine client identifier and rate limit
        String clientId;
        int limit;
        int windowSeconds;
        Principal principal = requestContext.getSecurityContext() != null
                ? requestContext.getSecurityContext().getUserPrincipal()
                : null;
        boolean isAuthenticated = principal != null;

        if (isAuthenticated) {
            clientId = principal.getName();
            limit = config.authenticated().defaultLimit();
            windowSeconds = config.authenticated().windowSeconds();
        } else {
            String apiKey = requestContext.getHeaderString("X-API-Key");
            clientId = apiKey != null && !apiKey.isBlank() ? "api-key:" + fingerprint(apiKey) : "ip:" + getClientIp();
            limit = config.unauthenticated().defaultLimit();
            windowSeconds = config.unauthenticated().windowSeconds();
        }

        final int finalWindowSeconds = windowSeconds;

        // Non-blocking rate limit check
        return rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .map(result -> {
                    requestContext.setProperty(RATE_LIMIT_RESULT_KEY, result);

                    if (!result.isAllowed()) {
                        Map<String, Object> errorBody = new HashMap<>();
                        errorBody.put("error", "rate_limit_exceeded");
                        errorBody.put("message", String.format(
                                "Rate limit exceeded. Maximum %d requests per %d seconds allowed.",
                                result.getLimit(), finalWindowSeconds));
                        errorBody.put("limit", result.getLimit());
                        errorBody.put("window_seconds", finalWindowSeconds);
                        errorBody.put("retry_after_seconds", result.getRetryAfter());

                        return Response.status(429)
                                .entity(errorBody)
                                .header("Retry-After", String.valueOf(result.getRetryAfter()))
                                .header("X-RateLimit-Limit", String.valueOf(result.getLimit()))
                                .header("X-RateLimit-Remaining", "0")
                                .header("X-RateLimit-Reset", String.valueOf(result.getResetTime()))
                                .build();
                    }

                    return (Response) null;
                });
    }

    /**
     * Add rate limit headers to the response.
     */
    @ServerResponseFilter
    public void responseFilter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        RateLimitResult result = (RateLimitResult) requestContext.getProperty(RATE_LIMIT_RESULT_KEY);
        if (result == null) {
            return;
        }

        responseContext.getHeaders().putSingle("X-RateLimit-Limit", String.valueOf(result.getLimit()));
        responseContext.getHeaders().putSingle("X-RateLimit-Remaining", String.valueOf(result.getRemaining()));
        responseContext.getHeaders().putSingle("X-RateLimit-Reset", String.valueOf(result.getResetTime()));
    }

    /**
     * Extract client IP address from request.
     */
    /**
     * MS-V1-M7 FIX: Only trust X-Forwarded-For when peer is a known proxy.
     * In production behind a load balancer, the LB sets XFF.
     * Direct clients can spoof XFF to bypass rate limits.
     */
    private String getClientIp() {
        String remoteAddress = request.remoteAddress() != null ? request.remoteAddress().host() : null;

        // Only trust XFF if the immediate peer is a trusted proxy (loopback or private range)
        if (remoteAddress != null && isTrustedProxy(remoteAddress)) {
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return forwardedFor.split(",")[0].trim();
            }
        }

        return remoteAddress != null ? remoteAddress : "unknown";
    }

    private static boolean isTrustedProxy(String ip) {
        return ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("172.") ||
               ip.startsWith("192.168.") || "::1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip);
    }

    private static String fingerprint(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, 16);
        } catch (Exception error) {
            throw new IllegalStateException("Unable to fingerprint rate limit client", error);
        }
    }
}
