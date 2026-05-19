package com.canonbridge.mappingstudio.ratelimit;

import io.smallrye.common.annotation.Blocking;
import io.vertx.core.http.HttpServerRequest;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.security.MessageDigest;
import java.security.Principal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.Map;

/**
 * JAX-RS filter that enforces rate limiting on API endpoints.
 * 
 * Rate limits are applied based on:
 * - Authenticated requests: client identifier from JWT subject or API key
 * - Unauthenticated requests: client IP address
 */
@Provider
@Priority(Priorities.AUTHORIZATION + 10)
@ApplicationScoped
@Blocking
public class RateLimitFilter implements ContainerRequestFilter, ContainerResponseFilter {

    private static final String RATE_LIMIT_RESULT_KEY = "canonbridge.ratelimit.result";

    @Inject
    RateLimitService rateLimitService;

    @Inject
    RateLimitConfig config;

    @Context
    HttpServerRequest request;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!config.enabled()) {
            return;
        }

        // Skip only infrastructure and documentation endpoints.
        String path = requestContext.getUriInfo().getPath();
        if (path.startsWith("health") || path.startsWith("metrics") || 
            path.startsWith("openapi") || path.startsWith("swagger-ui")) {
            return;
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
            // Authenticated request - use principal name (JWT subject or API key).
            clientId = principal.getName();
            limit = config.authenticated().defaultLimit();
            windowSeconds = config.authenticated().windowSeconds();
        } else {
            // Unauthenticated request - prefer a presented API key as a stable client id in test/dev,
            // then fall back to IP address.
            String apiKey = requestContext.getHeaderString("X-API-Key");
            clientId = apiKey != null && !apiKey.isBlank() ? "api-key:" + fingerprint(apiKey) : "ip:" + getClientIp();
            limit = config.unauthenticated().defaultLimit();
            windowSeconds = config.unauthenticated().windowSeconds();
        }

        // Check rate limit
        RateLimitResult result = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .await().indefinitely();

        requestContext.setProperty(RATE_LIMIT_RESULT_KEY, result);

        if (!result.isAllowed()) {
            // Rate limit exceeded - return 429
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("error", "rate_limit_exceeded");
            errorBody.put("message", String.format(
                    "Rate limit exceeded. Maximum %d requests per %d seconds allowed.",
                    result.getLimit(), windowSeconds));
            errorBody.put("limit", result.getLimit());
            errorBody.put("window_seconds", windowSeconds);
            errorBody.put("retry_after_seconds", result.getRetryAfter());

            Response response = Response.status(429)
                    .entity(errorBody)
                    .header("Retry-After", String.valueOf(result.getRetryAfter()))
                    .header("X-RateLimit-Limit", String.valueOf(result.getLimit()))
                    .header("X-RateLimit-Remaining", "0")
                    .header("X-RateLimit-Reset", String.valueOf(result.getResetTime()))
                    .build();

            requestContext.abortWith(response);
        }
    }

    /**
     * Add rate limit headers to the response.
     */
    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
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
    private String getClientIp() {
        // Check X-Forwarded-For header first (for proxied requests)
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            // Take the first IP in the chain
            return forwardedFor.split(",")[0].trim();
        }

        // Fall back to remote address
        String remoteAddress = request.remoteAddress().host();
        return remoteAddress != null ? remoteAddress : "unknown";
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
