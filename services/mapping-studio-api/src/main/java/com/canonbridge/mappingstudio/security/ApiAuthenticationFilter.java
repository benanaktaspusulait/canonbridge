package com.canonbridge.mappingstudio.security;

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

@Provider
@ApplicationScoped
@Priority(Priorities.AUTHENTICATION)
public class ApiAuthenticationFilter implements ContainerRequestFilter {

    private static final String AUTHENTICATE_HEADER = "Bearer realm=\"canonbridge-mapping-studio\"";

    @Inject
    ApiKeyAuthenticator authenticator;

    @ConfigProperty(name = "canonbridge.auth.enabled", defaultValue = "true")
    boolean authEnabled;

    @ConfigProperty(name = "canonbridge.auth.api-key-header", defaultValue = "X-API-Key")
    String apiKeyHeaderName;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!authEnabled || shouldBypass(requestContext)) {
            return;
        }

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(
                requestContext.getHeaderString(HttpHeaders.AUTHORIZATION),
                requestContext.getHeaderString(apiKeyHeaderName)
        );

        if (!result.authenticated()) {
            abort(requestContext, result);
            return;
        }

        requestContext.setSecurityContext(new ApiKeySecurityContext(
                requestContext.getSecurityContext(),
                result.principal()
        ));
    }

    private boolean shouldBypass(ContainerRequestContext requestContext) {
        if (HttpMethod.OPTIONS.equalsIgnoreCase(requestContext.getMethod())) {
            return true;
        }

        String path = requestContext.getUriInfo().getPath();
        
        // Bypass health, metrics, swagger, auth, and proxy endpoints
        return path.startsWith("health") || 
               path.startsWith("metrics") || 
               path.startsWith("swagger-ui") || 
               path.startsWith("openapi") ||
               path.startsWith("api/auth/login") ||
               path.startsWith("api/proxy/") ||
               (!path.startsWith("api/"));
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

        ApiKeySecurityContext(SecurityContext delegate, String principalName) {
            this.delegate = delegate;
            this.principal = () -> principalName;
        }

        @Override
        public Principal getUserPrincipal() {
            return principal;
        }

        @Override
        public boolean isUserInRole(String role) {
            return delegate != null && delegate.isUserInRole(role);
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
