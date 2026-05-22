package com.canonbridge.mappingstudio.billing;

import io.quarkus.logging.Log;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * JAX-RS filter that enforces entitlement quotas on annotated endpoints.
 * 
 * Checks the {@link EntitlementCheck} annotation on resource methods.
 * If quota is exceeded, returns HTTP 402 Payment Required.
 * If quota is at warning level (80%+), adds X-Quota-Warning header.
 * 
 * Resolves org_id from:
 * 1. X-Org-Id header (preferred)
 * 2. Falls back to default org for single-tenant mode
 */
@Provider
public class EntitlementInterceptor implements ContainerRequestFilter, ContainerResponseFilter {

    private static final String ORG_ID_HEADER = "X-Org-Id";
    private static final String QUOTA_WARNING_HEADER = "X-Quota-Warning";
    private static final String ENTITLEMENT_RESULT_PROPERTY = "entitlement.result";
    private static final int CIRCUIT_BREAKER_THRESHOLD = 5;
    private final ConcurrentHashMap<UUID, Integer> failureCount = new ConcurrentHashMap<>();

    @Inject
    EntitlementService entitlementService;

    @Context
    ResourceInfo resourceInfo;

    @ConfigProperty(name = "canonbridge.entitlement.enabled", defaultValue = "true")
    boolean entitlementEnabled;

    @ConfigProperty(name = "canonbridge.entitlement.bypass-internal", defaultValue = "true")
    boolean bypassInternal;

    @ConfigProperty(name = "canonbridge.billing.internal-service-secret")
    Optional<String> internalServiceSecret;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!entitlementEnabled) return;

        Method method = resourceInfo.getResourceMethod();
        if (method == null) return;

        EntitlementCheck check = method.getAnnotation(EntitlementCheck.class);
        if (check == null) {
            // Check class-level annotation
            check = resourceInfo.getResourceClass().getAnnotation(EntitlementCheck.class);
        }
        if (check == null) return;

        // Bypass for internal service-to-service calls
        if (bypassInternal && isInternalCall(requestContext)) {
            return;
        }

        // Resolve org ID
        UUID orgId = resolveOrgId(requestContext);
        if (orgId == null) {
            // No org context — skip entitlement check (will be caught by auth)
            return;
        }

        // NEW-O1 FIX: Circuit breaker — track failures per org, fail-closed after threshold
        EntitlementResult result;
        try {
            result = entitlementService.checkQuota(orgId, check.metric(), check.qty())
                .await().atMost(java.time.Duration.ofMillis(500));
            // Reset failure count on success
            failureCount.remove(orgId);
        } catch (Exception e) {
            int failures = failureCount.merge(orgId, 1, Integer::sum);
            if (failures > CIRCUIT_BREAKER_THRESHOLD) {
                // Too many failures for this org — fail-closed to prevent abuse
                Log.errorf("Entitlement circuit breaker OPEN for org=%s (failures=%d) — blocking request", orgId, failures);
                requestContext.abortWith(
                    Response.status(503)
                        .type(MediaType.APPLICATION_JSON)
                        .entity(Map.of("error", "service_unavailable", "message", "Quota service temporarily unavailable. Please retry later."))
                        .build()
                );
                return;
            }
            // Below threshold — fail-open (allow request, log warning)
            Log.warnf("Entitlement check failed for org=%s metric=%s (failure %d/%d) — allowing request",
                orgId, check.metric(), failures, CIRCUIT_BREAKER_THRESHOLD);
            return;
        }

        // Store result for response filter (to add headers)
        requestContext.setProperty(ENTITLEMENT_RESULT_PROPERTY, result);

        if (result.isExceeded()) {
            Log.infof("Entitlement blocked: org=%s metric=%s used=%d limit=%d",
                orgId, check.metric(), result.used(), result.limit());

            requestContext.abortWith(
                Response.status(402)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of(
                        "error", "quota_exceeded",
                        "metric", check.metric(),
                        "used", result.used(),
                        "limit", result.limit(),
                        "message", result.message(),
                        "upgrade_url", "/billing/upgrade"
                    ))
                    .build()
            );
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        Object resultObj = requestContext.getProperty(ENTITLEMENT_RESULT_PROPERTY);
        if (resultObj instanceof EntitlementResult result) {
            if (result.isWarning() || result.isSoftExceeded()) {
                responseContext.getHeaders().putSingle(QUOTA_WARNING_HEADER, result.message());
            }
        }
    }

    /**
     * M-Y2 FIX: Resolve org ID from the authenticated principal's claims,
     * NOT from user-supplied X-Org-Id header (which can be spoofed).
     * X-Org-Id is only trusted for internal service calls (already validated by isInternalCall).
     */
    private UUID resolveOrgId(ContainerRequestContext requestContext) {
        // For internal calls, trust the X-Org-Id header (already validated by service secret)
        if (bypassInternal && isInternalCall(requestContext)) {
            String orgIdStr = requestContext.getHeaderString(ORG_ID_HEADER);
            if (orgIdStr != null && !orgIdStr.isBlank()) {
                try {
                    return UUID.fromString(orgIdStr.trim());
                } catch (IllegalArgumentException e) {
                    Log.warnf("Invalid X-Org-Id header value from internal call: %s", orgIdStr);
                }
            }
            return null;
        }

        // For external calls, derive org from security context (JWT claim)
        var securityContext = requestContext.getSecurityContext();
        if (securityContext != null && securityContext.getUserPrincipal() != null) {
            // Try to get org_id from a property set by the auth filter
            Object orgIdProp = requestContext.getProperty("canonbridge.orgId");
            if (orgIdProp instanceof UUID orgUuid) {
                return orgUuid;
            }
            if (orgIdProp instanceof String orgStr && !orgStr.isBlank()) {
                try {
                    return UUID.fromString(orgStr.trim());
                } catch (IllegalArgumentException e) {
                    // fall through
                }
            }
        }

        // Fallback: use X-Org-Id only if user has admin role (cross-org access)
        if (securityContext != null && securityContext.isUserInRole("admin")) {
            String orgIdStr = requestContext.getHeaderString(ORG_ID_HEADER);
            if (orgIdStr != null && !orgIdStr.isBlank()) {
                try {
                    return UUID.fromString(orgIdStr.trim());
                } catch (IllegalArgumentException e) {
                    Log.warnf("Invalid X-Org-Id header value: %s", orgIdStr);
                }
            }
        }

        return null;
    }

    /**
     * M-Y1 FIX: Validate X-Service-Auth header against the configured internal secret.
     * Uses constant-time comparison to prevent timing attacks.
     * Previously, any non-empty value was accepted — now the actual secret is verified.
     */
    private boolean isInternalCall(ContainerRequestContext requestContext) {
        String serviceAuth = requestContext.getHeaderString("X-Service-Auth");
        if (serviceAuth == null || serviceAuth.isBlank()) {
            return false;
        }

        if (internalServiceSecret.isEmpty() || internalServiceSecret.get().isBlank()) {
            Log.warn("Internal service secret not configured — rejecting X-Service-Auth (fail-closed)");
            return false;
        }

        byte[] presentedBytes = serviceAuth.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] expectedBytes = internalServiceSecret.get().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return java.security.MessageDigest.isEqual(presentedBytes, expectedBytes);
    }
}
