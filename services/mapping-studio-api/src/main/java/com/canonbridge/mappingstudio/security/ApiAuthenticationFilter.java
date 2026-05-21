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
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.security.Principal;
import java.util.Set;

@Provider
@ApplicationScoped
@Priority(Priorities.AUTHENTICATION)
public class ApiAuthenticationFilter implements ContainerRequestFilter {

    private static final String AUTHENTICATE_HEADER = "Bearer realm=\"canonbridge-mapping-studio\"";
    public static final String AUTHORIZED_TENANTS_PROPERTY = "canonbridge.authorizedTenants";

    @Inject
    ApiKeyAuthenticator authenticator;

    @ConfigProperty(name = "canonbridge.auth.enabled", defaultValue = "true")
    boolean authEnabled;

    @ConfigProperty(name = "canonbridge.auth.api-key-header", defaultValue = "X-API-Key")
    String apiKeyHeaderName;

    @ConfigProperty(name = "canonbridge.auth.public-docs.enabled", defaultValue = "false")
    boolean publicDocsEnabled;

    @ConfigProperty(name = "quarkus.oidc.enabled", defaultValue = "false")
    boolean oidcEnabled;

    @ConfigProperty(name = "canonbridge.tenant.default-id", defaultValue = "tenant-acme")
    String defaultTenantId;

    @ConfigProperty(name = "canonbridge.tenant.header-name", defaultValue = "X-Tenant-Id")
    String tenantHeaderName;

    @Inject
    AuditLogService auditLogService;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!authEnabled || shouldBypass(requestContext)) {
            return;
        }

        if (oidcEnabled && hasAuthenticatedSecurityContext(requestContext)) {
            return;
        }

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(
                requestContext.getHeaderString(HttpHeaders.AUTHORIZATION),
                requestContext.getHeaderString(apiKeyHeaderName)
        );

        if (!result.authenticated()) {
            auditFailure(requestContext, result);
            abort(requestContext, result);
            return;
        }

        requestContext.setSecurityContext(new ApiKeySecurityContext(
                requestContext.getSecurityContext(),
                result.principal(),
                result.roles()
        ));
        requestContext.setProperty(AUTHORIZED_TENANTS_PROPERTY, result.tenantIds());
    }

    private boolean shouldBypass(ContainerRequestContext requestContext) {
        if (HttpMethod.OPTIONS.equalsIgnoreCase(requestContext.getMethod())) {
            return true;
        }

        String path = requestContext.getUriInfo().getPath();
        
        if (path.startsWith("health") || path.startsWith("metrics") || path.startsWith("api/auth/login")) {
            return true;
        }

        if (publicDocsEnabled && (path.startsWith("swagger-ui") || path.startsWith("openapi"))) {
            return true;
        }

        return !path.startsWith("api/");
    }

    private boolean hasAuthenticatedSecurityContext(ContainerRequestContext requestContext) {
        SecurityContext securityContext = requestContext.getSecurityContext();
        return securityContext != null && securityContext.getUserPrincipal() != null;
    }

    private void auditFailure(ContainerRequestContext requestContext, ApiKeyAuthenticator.AuthenticationResult result) {
        if (auditLogService == null) {
            return;
        }

        String tenantId = requestContext.getHeaderString(tenantHeaderName);
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = defaultTenantId;
        }

        String details = "Authentication failed for path " + requestContext.getUriInfo().getPath()
                + ": " + result.error();
        auditLogService.logFailure(
                        tenantId,
                        "anonymous",
                        AuditLog.AuditAction.SECURITY_AUTH_FAILED,
                        "api_request",
                        requestContext.getUriInfo().getPath(),
                        details,
                        correlationId(requestContext))
                .subscribe().with(ignored -> {}, ignored -> {});
    }

    private String correlationId(ContainerRequestContext requestContext) {
        Object value = requestContext.getProperty("correlationId");
        return value != null ? value.toString() : requestContext.getHeaderString("X-Correlation-Id");
    }

    private void abort(ContainerRequestContext requestContext, ApiKeyAuthenticator.AuthenticationResult result) {
        Response.Status status = "auth_misconfigured".equals(result.error())
                ? Response.Status.SERVICE_UNAVAILABLE
                : Response.Status.UNAUTHORIZED;

        Response.ResponseBuilder response = Response.status(status)
                .type(MediaType.APPLICATION_JSON_TYPE)
                .entity(new AuthErrorResponse(result.error(), result.message()));

        if (status == Response.Status.UNAUTHORIZED) {
            response.header(HttpHeaders.WWW_AUTHENTICATE, AUTHENTICATE_HEADER);
        }

        requestContext.abortWith(response.build());
    }

    public record AuthErrorResponse(String error, String message) {
    }

    private static class ApiKeySecurityContext implements SecurityContext {

        private final SecurityContext delegate;
        private final Principal principal;
        private final Set<String> roles;

        ApiKeySecurityContext(SecurityContext delegate, String principalName, Set<String> roles) {
            this.delegate = delegate;
            this.principal = () -> principalName;
            this.roles = roles != null ? roles : Set.of();
        }

        @Override
        public Principal getUserPrincipal() {
            return principal;
        }

        @Override
        public boolean isUserInRole(String role) {
            return roles.contains(role) || (delegate != null && delegate.isUserInRole(role));
        }

        @Override
        public boolean isSecure() {
            return delegate != null && delegate.isSecure();
        }

        @Override
        public String getAuthenticationScheme() {
            return "API_KEY";
        }
    }
}
