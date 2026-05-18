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
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.security.Principal;
import java.util.Locale;
import java.util.Set;

@Provider
@ApplicationScoped
@Priority(Priorities.AUTHORIZATION)
public class RoleAuthorizationFilter implements ContainerRequestFilter {

    private static final Set<String> ALL_AUTHENTICATED_ROLES = Set.of("admin", "integration_author", "operator", "viewer");
    private static final Set<String> AUTHOR_ROLES = Set.of("admin", "integration_author");
    private static final Set<String> OPERATOR_ROLES = Set.of("admin", "operator");
    private static final Set<String> ADMIN_ROLE = Set.of("admin");

    @ConfigProperty(name = "canonbridge.auth.enabled", defaultValue = "true")
    boolean authEnabled;

    @ConfigProperty(name = "canonbridge.rbac.enabled", defaultValue = "true")
    boolean rbacEnabled;

    @ConfigProperty(name = "canonbridge.tenant.default-id", defaultValue = "tenant-acme")
    String defaultTenantId;

    @ConfigProperty(name = "canonbridge.tenant.header-name", defaultValue = "X-Tenant-Id")
    String tenantHeaderName;

    @Inject
    AuditLogService auditLogService;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!authEnabled || !rbacEnabled || shouldBypass(requestContext)) {
            return;
        }

        SecurityContext securityContext = requestContext.getSecurityContext();
        Principal principal = securityContext != null ? securityContext.getUserPrincipal() : null;
        if (principal == null) {
            return;
        }

        Set<String> allowedRoles = allowedRoles(requestContext.getMethod(), requestContext.getUriInfo().getPath());
        if (allowedRoles.isEmpty() || hasAnyRole(securityContext, ADMIN_ROLE) || hasAnyRole(securityContext, allowedRoles)) {
            return;
        }

        auditDenied(requestContext, principal.getName(), allowedRoles);
        requestContext.abortWith(Response.status(Response.Status.FORBIDDEN)
                .type(MediaType.APPLICATION_JSON_TYPE)
                .entity(new AuthorizationErrorResponse(
                        "insufficient_role",
                        "This endpoint requires one of: " + String.join(", ", allowedRoles)))
                .build());
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

    private Set<String> allowedRoles(String method, String path) {
        String normalizedMethod = method == null ? "" : method.toUpperCase(Locale.ROOT);

        if (path.startsWith("api/audit-logs")) {
            return OPERATOR_ROLES;
        }

        if (path.startsWith("api/credentials")) {
            return HttpMethod.GET.equals(normalizedMethod) ? AUTHOR_ROLES : ADMIN_ROLE;
        }

        if (path.startsWith("api/dlq")) {
            return HttpMethod.GET.equals(normalizedMethod) ? OPERATOR_ROLES : OPERATOR_ROLES;
        }

        if (path.startsWith("api/proxy/")) {
            if (path.matches("api/proxy/[^/]+/?")) {
                return Set.of("admin", "integration_author", "operator");
            }
            if (path.contains("/retry/")) {
                return OPERATOR_ROLES;
            }
            return ALL_AUTHENTICATED_ROLES;
        }

        if (HttpMethod.GET.equals(normalizedMethod) || HttpMethod.HEAD.equals(normalizedMethod)) {
            return ALL_AUTHENTICATED_ROLES;
        }

        if (HttpMethod.DELETE.equals(normalizedMethod)) {
            return ADMIN_ROLE;
        }

        if (path.startsWith("api/mapping-drafts")
                || path.startsWith("api/mapping-versions")
                || path.startsWith("api/partners")
                || path.startsWith("api/schemas")
                || path.startsWith("api/external-systems")
                || path.startsWith("api/webhooks")) {
            return AUTHOR_ROLES;
        }

        return AUTHOR_ROLES;
    }

    private boolean hasAnyRole(SecurityContext securityContext, Set<String> allowedRoles) {
        return allowedRoles.stream().anyMatch(role ->
                securityContext.isUserInRole(role)
                        || securityContext.isUserInRole(role.toUpperCase(Locale.ROOT))
                        || securityContext.isUserInRole(role.replace('_', '-'))
        );
    }

    private void auditDenied(ContainerRequestContext requestContext, String principal, Set<String> allowedRoles) {
        if (auditLogService == null) {
            return;
        }

        String tenantId = requestContext.getHeaderString(tenantHeaderName);
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = defaultTenantId;
        }

        auditLogService.logFailure(
                        tenantId,
                        principal,
                        AuditLog.AuditAction.SECURITY_RBAC_DENIED,
                        "api_request",
                        requestContext.getUriInfo().getPath(),
                        "Required role: " + String.join(", ", allowedRoles),
                        correlationId(requestContext))
                .subscribe().with(ignored -> {}, ignored -> {});
    }

    private String correlationId(ContainerRequestContext requestContext) {
        Object value = requestContext.getProperty("correlationId");
        return value != null ? value.toString() : requestContext.getHeaderString("X-Correlation-Id");
    }

    public record AuthorizationErrorResponse(String error, String message) {
    }
}
