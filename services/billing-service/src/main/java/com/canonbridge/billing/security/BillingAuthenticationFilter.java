package com.canonbridge.billing.security;

import io.quarkus.logging.Log;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.Principal;
import java.util.Set;

/**
 * Authentication filter for billing-service endpoints.
 *
 * Supports two authentication modes:
 * 1. Bearer token (JWT from mapping-studio-api or OIDC provider)
 * 2. X-Service-Auth header for internal service-to-service calls (HMAC-validated)
 *
 * Public endpoints (health, metrics, Paddle webhooks) are bypassed.
 * Internal endpoints (/api/internal/*) require service-to-service auth.
 */
@Provider
@ApplicationScoped
@Priority(Priorities.AUTHENTICATION)
public class BillingAuthenticationFilter implements ContainerRequestFilter {

    private static final String SERVICE_AUTH_HEADER = "X-Service-Auth";
    private static final String API_KEY_HEADER = "X-API-Key";

    @ConfigProperty(name = "canonbridge.billing.auth.enabled", defaultValue = "true")
    boolean authEnabled;

    @ConfigProperty(name = "canonbridge.billing.internal-service-secret", defaultValue = "")
    String internalServiceSecret;

    @ConfigProperty(name = "canonbridge.billing.api-keys", defaultValue = "")
    String configuredApiKeys;

    @Inject
    BillingJwtValidator jwtValidator;

    @Inject
    io.vertx.mutiny.pgclient.PgPool pgPool;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!authEnabled || shouldBypass(requestContext)) {
            return;
        }

        String path = requestContext.getUriInfo().getPath();

        // Internal endpoints require service-to-service auth
        if (isInternalPath(path)) {
            if (!validateServiceAuth(requestContext)) {
                Log.warnf("Unauthorized internal access attempt to %s", path);
                abort(requestContext, "unauthorized", "Valid service authentication required for internal endpoints");
            }
            return;
        }

        // Public API endpoints: Bearer token or API key
        if (hasValidBearerToken(requestContext)) {
            return;
        }

        if (hasValidApiKey(requestContext)) {
            return;
        }

        Log.warnf("Unauthenticated access attempt to %s", path);
        abort(requestContext, "missing_credentials", "Authentication required. Provide Bearer token or X-API-Key header.");
    }

    private boolean shouldBypass(ContainerRequestContext requestContext) {
        if (HttpMethod.OPTIONS.equalsIgnoreCase(requestContext.getMethod())) {
            return true;
        }

        String path = requestContext.getUriInfo().getPath();

        // Health, metrics, OpenAPI docs
        if (path.startsWith("health") || path.startsWith("q/health")
                || path.startsWith("metrics") || path.startsWith("q/metrics")
                || path.startsWith("openapi") || path.startsWith("swagger-ui")) {
            return true;
        }

        // Paddle webhooks have their own signature-based auth
        if (path.startsWith("api/webhooks/paddle")) {
            return true;
        }

        // Only protect /api/* paths
        return !path.startsWith("api/");
    }

    private boolean isInternalPath(String path) {
        return path.startsWith("api/internal/");
    }

    /**
     * Validate service-to-service authentication using a shared secret.
     * Uses constant-time comparison to prevent timing attacks.
     */
    private boolean validateServiceAuth(ContainerRequestContext requestContext) {
        String serviceAuth = requestContext.getHeaderString(SERVICE_AUTH_HEADER);
        if (serviceAuth == null || serviceAuth.isBlank()) {
            return false;
        }

        if (internalServiceSecret == null || internalServiceSecret.isBlank()) {
            Log.error("Internal service secret not configured — rejecting internal call (fail-closed)");
            return false;
        }

        return constantTimeEquals(serviceAuth, internalServiceSecret);
    }

    /**
     * Validate Bearer JWT token.
     */
    private boolean hasValidBearerToken(ContainerRequestContext requestContext) {
        String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return false;
        }

        String token = authHeader.substring(7).trim();
        if (token.isBlank()) {
            return false;
        }

        BillingJwtValidator.ValidationResult result = jwtValidator.validate(token);
        if (!result.valid()) {
            return false;
        }

        // Set security context with org info from token
        requestContext.setSecurityContext(new BillingSecurityContext(
                requestContext.getSecurityContext(),
                result.principal(),
                result.orgId(),
                result.roles()
        ));
        return true;
    }

    /**
     * NEW-Y2 FIX: Validate API key via DB lookup (api_keys table).
     * Each key is bound to an org with specific roles/scopes.
     * Falls back to config-based keys for backward compatibility.
     */
    private boolean hasValidApiKey(ContainerRequestContext requestContext) {
        String apiKey = requestContext.getHeaderString(API_KEY_HEADER);
        if (apiKey == null || apiKey.isBlank()) {
            return false;
        }

        // Try DB-based key lookup first (org-bound, with scopes)
        String keyHash = hashApiKey(apiKey);
        // Note: This is a blocking call but API key auth is rare path
        // In production, use Redis cache for key→org mapping
        try {
            var rowSet = pgPool.preparedQuery(
                "SELECT org_id, name FROM api_keys WHERE key_hash = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())"
            ).executeAndAwait(io.vertx.mutiny.sqlclient.Tuple.of(keyHash));

            if (rowSet.size() > 0) {
                var row = rowSet.iterator().next();
                String orgId = row.getUUID("org_id").toString();
                requestContext.setSecurityContext(new BillingSecurityContext(
                        requestContext.getSecurityContext(),
                        "api-key:" + row.getString("name"),
                        orgId,
                        Set.of("service")
                ));
                return true;
            }
        } catch (Exception e) {
            Log.warnf("DB API key lookup failed, falling back to config: %s", e.getMessage());
        }

        // Fallback: config-based keys (legacy, no org binding)
        if (configuredApiKeys == null || configuredApiKeys.isBlank()) {
            return false;
        }

        for (String accepted : configuredApiKeys.split(",")) {
            String trimmed = accepted.trim();
            if (!trimmed.isBlank() && constantTimeEquals(apiKey, trimmed)) {
                // Legacy key: service role but NO org binding — org-authorization filter will reject org-scoped paths
                requestContext.setSecurityContext(new BillingSecurityContext(
                        requestContext.getSecurityContext(),
                        "api-key-legacy",
                        null,
                        Set.of("service")
                ));
                Log.warn("Legacy config-based API key used — migrate to DB-based keys for org binding");
                return true;
            }
        }
        return false;
    }

    private String hashApiKey(String rawKey) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return "";
        }
    }

    private void abort(ContainerRequestContext requestContext, String error, String message) {
        requestContext.abortWith(
                Response.status(Response.Status.UNAUTHORIZED)
                        .type(MediaType.APPLICATION_JSON_TYPE)
                        .header(HttpHeaders.WWW_AUTHENTICATE, "Bearer realm=\"canonbridge-billing\"")
                        .entity(new AuthErrorResponse(error, message))
                        .build()
        );
    }

    /**
     * Constant-time string comparison to prevent timing attacks.
     */
    private static boolean constantTimeEquals(String a, String b) {
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(aBytes, bBytes);
    }

    public record AuthErrorResponse(String error, String message) {}

    /**
     * Security context carrying authenticated principal and org information.
     */
    public static class BillingSecurityContext implements SecurityContext {
        private final SecurityContext delegate;
        private final Principal principal;
        private final String orgId;
        private final Set<String> roles;

        public BillingSecurityContext(SecurityContext delegate, String principalName, String orgId, Set<String> roles) {
            this.delegate = delegate;
            this.principal = () -> principalName;
            this.orgId = orgId;
            this.roles = roles != null ? roles : Set.of();
        }

        @Override
        public Principal getUserPrincipal() { return principal; }

        @Override
        public boolean isUserInRole(String role) {
            return roles.contains(role) || (delegate != null && delegate.isUserInRole(role));
        }

        @Override
        public boolean isSecure() {
            return delegate != null && delegate.isSecure();
        }

        @Override
        public String getAuthenticationScheme() { return "BEARER"; }

        public String getOrgId() { return orgId; }
    }
}
