package com.canonbridge.mappingstudio.security;

import com.canonbridge.mappingstudio.audit.AuditLogService;
import com.canonbridge.mappingstudio.domain.AuditLog;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Set;

/**
 * [A-V8-H2] Tenant context is now derived from the authenticated principal's
 * JWT claims (via {@link ApiAuthenticationFilter#AUTHORIZED_TENANTS_PROPERTY}),
 * NOT from client-supplied X-Tenant-Id headers.
 *
 * In single-tenant mode, this filter enforces that the authenticated user
 * belongs to the configured default tenant.
 */
@Provider
@ApplicationScoped
@Priority(Priorities.AUTHENTICATION + 2)
public class SingleTenantContextFilter implements ContainerRequestFilter {

    public static final String TENANT_ID_PROPERTY = "canonbridge.tenant.id";
    public static final String USER_ID_PROPERTY = "canonbridge.user.id";

    @ConfigProperty(name = "canonbridge.tenant.single-tenant.enabled", defaultValue = "true")
    boolean singleTenantEnabled;

    @ConfigProperty(name = "canonbridge.tenant.default-id", defaultValue = "tenant-acme")
    String defaultTenantId;

    @Inject
    AuditLogService auditLogService;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!singleTenantEnabled || shouldBypass(requestContext)) {
            return;
        }

        // Derive tenant from authenticated JWT claims, not from client headers
        Set<String> authorizedTenants = getAuthorizedTenants(requestContext);

        String resolvedTenantId;
        if (authorizedTenants.isEmpty() || authorizedTenants.contains("*")) {
            // Wildcard (API key with all-tenant access) or unauthenticated — use default
            resolvedTenantId = defaultTenantId;
        } else if (authorizedTenants.contains(defaultTenantId)) {
            resolvedTenantId = defaultTenantId;
        } else {
            // Authenticated user's tenant doesn't match the single-tenant config
            String attemptedTenant = authorizedTenants.iterator().next();
            auditTenantDenied(requestContext, attemptedTenant);
            requestContext.abortWith(Response.status(Response.Status.FORBIDDEN)
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(new TenantErrorResponse("invalid_tenant",
                            "Only tenant '" + defaultTenantId + "' is available"))
                    .build());
            return;
        }

        // Set tenant context for downstream resources — ignore any client-supplied header
        requestContext.setProperty(TENANT_ID_PROPERTY, resolvedTenantId);

        // Override the X-Tenant-Id header with the JWT-derived value so that
        // existing @HeaderParam("X-Tenant-Id") annotations in resources work correctly.
        // This ensures client-supplied values are NEVER trusted.
        requestContext.getHeaders().putSingle("X-Tenant-Id", resolvedTenantId);

        // Extract user ID from principal (format: "user:<uuid>")
        if (requestContext.getSecurityContext() != null
                && requestContext.getSecurityContext().getUserPrincipal() != null) {
            String principal = requestContext.getSecurityContext().getUserPrincipal().getName();
            if (principal != null && principal.startsWith("user:")) {
                String userId = principal.substring(5);
                requestContext.setProperty(USER_ID_PROPERTY, userId);
                // Override X-User-Id header with JWT-derived value
                requestContext.getHeaders().putSingle("X-User-Id", userId);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private Set<String> getAuthorizedTenants(ContainerRequestContext requestContext) {
        Object value = requestContext.getProperty(ApiAuthenticationFilter.AUTHORIZED_TENANTS_PROPERTY);
        if (value instanceof Set<?> tenants) {
            return (Set<String>) tenants;
        }
        return Set.of();
    }

    private boolean shouldBypass(ContainerRequestContext requestContext) {
        if (HttpMethod.OPTIONS.equalsIgnoreCase(requestContext.getMethod())) {
            return true;
        }

        String path = requestContext.getUriInfo().getPath();
        return !path.startsWith("api/")
                || path.startsWith("api/auth/login")
                || path.startsWith("api/auth/refresh")
                || path.startsWith("api/auth/me");
    }

    private void auditTenantDenied(ContainerRequestContext requestContext, String requestedTenantId) {
        if (auditLogService == null) {
            return;
        }

        String principal = requestContext.getSecurityContext() != null
                && requestContext.getSecurityContext().getUserPrincipal() != null
                ? requestContext.getSecurityContext().getUserPrincipal().getName()
                : "anonymous";

        auditLogService.logFailure(
                        defaultTenantId,
                        principal,
                        AuditLog.AuditAction.SECURITY_TENANT_DENIED,
                        "tenant",
                        requestedTenantId,
                        "Rejected request for non-default tenant '" + requestedTenantId + "'",
                        correlationId(requestContext))
                .subscribe().with(ignored -> {}, ignored -> {});
    }

    private String correlationId(ContainerRequestContext requestContext) {
        Object value = requestContext.getProperty("correlationId");
        return value != null ? value.toString() : requestContext.getHeaderString("X-Correlation-Id");
    }

    public record TenantErrorResponse(String error, String message) {
    }
}
