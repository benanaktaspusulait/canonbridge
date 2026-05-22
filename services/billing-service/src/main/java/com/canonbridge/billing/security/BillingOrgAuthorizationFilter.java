package com.canonbridge.billing.security;

import io.quarkus.logging.Log;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Authorization filter that ensures authenticated users can only access
 * their own organization's data. Prevents cross-org data access (B-K1 fix).
 *
 * Extracts orgId from the URL path and compares it against the authenticated
 * principal's org claim. Service accounts (internal calls) bypass this check.
 */
@Provider
@ApplicationScoped
@Priority(Priorities.AUTHORIZATION)
public class BillingOrgAuthorizationFilter implements ContainerRequestFilter {

    // Matches orgId UUID in common billing API paths
    private static final Pattern ORG_ID_PATTERN = Pattern.compile(
            "/api/(?:entitlements|subscriptions|organizations|invoices/org|trial)/([0-9a-f\\-]{36})"
    );

    private static final Pattern ORG_ID_OVERAGE_PATTERN = Pattern.compile(
            "/api/organizations/([0-9a-f\\-]{36})/overage"
    );

    @Override
    public void filter(ContainerRequestContext requestContext) {
        SecurityContext securityContext = requestContext.getSecurityContext();
        if (securityContext == null || securityContext.getUserPrincipal() == null) {
            // Not authenticated — BillingAuthenticationFilter will handle rejection
            return;
        }

        // Service accounts (internal calls) can access any org
        if (securityContext.isUserInRole("service") || securityContext.isUserInRole("admin")) {
            return;
        }

        // Internal paths are already protected by service auth
        String path = requestContext.getUriInfo().getPath();
        if (path.startsWith("api/internal/") || path.startsWith("api/webhooks/")) {
            return;
        }

        // Extract orgId from path
        String requestedOrgId = extractOrgId(path);
        if (requestedOrgId == null) {
            // No org-scoped path — allow (e.g., /api/invoices/generate is admin-only, handled separately)
            return;
        }

        // Get authenticated user's org from security context
        if (securityContext instanceof BillingAuthenticationFilter.BillingSecurityContext billingCtx) {
            String userOrgId = billingCtx.getOrgId();
            if (userOrgId == null) {
                // Token doesn't carry org_id — reject for safety
                Log.warnf("Token missing org_id claim, denying access to org %s", requestedOrgId);
                abortForbidden(requestContext, requestedOrgId);
                return;
            }

            if (!userOrgId.equals(requestedOrgId)) {
                Log.warnf("Cross-org access denied: user org=%s tried to access org=%s", userOrgId, requestedOrgId);
                abortForbidden(requestContext, requestedOrgId);
            }
        }
    }

    private String extractOrgId(String path) {
        Matcher matcher = ORG_ID_PATTERN.matcher("/" + path);
        if (matcher.find()) {
            return matcher.group(1);
        }
        matcher = ORG_ID_OVERAGE_PATTERN.matcher("/" + path);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private void abortForbidden(ContainerRequestContext requestContext, String orgId) {
        requestContext.abortWith(
                Response.status(Response.Status.FORBIDDEN)
                        .type(MediaType.APPLICATION_JSON_TYPE)
                        .entity(new ForbiddenResponse("access_denied",
                                "You do not have permission to access organization " + orgId))
                        .build()
        );
    }

    public record ForbiddenResponse(String error, String message) {}
}
