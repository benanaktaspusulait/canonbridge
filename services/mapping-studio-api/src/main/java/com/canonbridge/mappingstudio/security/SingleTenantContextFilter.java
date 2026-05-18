package com.canonbridge.mappingstudio.security;

import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@Provider
@ApplicationScoped
@Priority(Priorities.AUTHENTICATION + 2)
public class SingleTenantContextFilter implements ContainerRequestFilter {

    public static final String TENANT_ID_PROPERTY = "canonbridge.tenant.id";

    @ConfigProperty(name = "canonbridge.tenant.single-tenant.enabled", defaultValue = "true")
    boolean singleTenantEnabled;

    @ConfigProperty(name = "canonbridge.tenant.default-id", defaultValue = "tenant-acme")
    String defaultTenantId;

    @ConfigProperty(name = "canonbridge.tenant.header-name", defaultValue = "X-Tenant-Id")
    String tenantHeaderName;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!singleTenantEnabled || shouldBypass(requestContext)) {
            return;
        }

        String requestedTenantId = trimToNull(requestContext.getHeaderString(tenantHeaderName));
        if (requestedTenantId != null && !defaultTenantId.equals(requestedTenantId)) {
            requestContext.abortWith(Response.status(Response.Status.FORBIDDEN)
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(new TenantErrorResponse("invalid_tenant", "Only tenant '" + defaultTenantId + "' is available"))
                    .build());
            return;
        }

        requestContext.getHeaders().putSingle(tenantHeaderName, defaultTenantId);
        requestContext.setProperty(TENANT_ID_PROPERTY, defaultTenantId);
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

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public record TenantErrorResponse(String error, String message) {
    }
}
