package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.auth.AuthResponse;
import com.canonbridge.mappingstudio.auth.AuthService;
import com.canonbridge.mappingstudio.auth.LoginRequest;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication operations")
public class AuthResource {

    @Inject
    AuthService authService;

    @Inject
    SecurityIdentity securityIdentity;

    @ConfigProperty(name = "canonbridge.auth.local-login.enabled", defaultValue = "true")
    boolean localLoginEnabled;

    @POST
    @Path("/login")
    @io.smallrye.common.annotation.Blocking
    @Operation(summary = "Login with email and password")
    public Uni<Response> login(@Valid LoginRequest request) {
        if (!localLoginEnabled) {
            return Uni.createFrom().item(
                    Response.status(Response.Status.FORBIDDEN)
                            .entity(new ErrorResponse("Local login is disabled"))
                            .build()
            );
        }
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            return Uni.createFrom().item(
                Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Email and password are required"))
                    .build()
            );
        }
        
        return authService.login(request.getEmail(), request.getPassword())
            .map(authResponse -> Response.ok(authResponse).build())
            .onFailure(AuthService.AuthException.class)
            .recoverWithItem(error ->
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(error.getMessage()))
                    .build()
            )
            .onFailure().recoverWithItem(error ->
                Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Authentication failed: " + error.getMessage()))
                    .build()
            );
    }

    @GET
    @Path("/me")
    @Operation(summary = "Get current user info")
    public Uni<Response> getCurrentUser(
            @HeaderParam("Authorization") String authHeader,
            @Context SecurityContext securityContext) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (isOidcAuthenticated(securityContext)) {
                return Uni.createFrom().item(Response.ok(oidcUser()).build());
            }
            return Uni.createFrom().item(
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("Missing or invalid authorization header"))
                    .build()
            );
        }

        String token = authHeader.substring(7);
        return authService.validateToken(token)
            .map(user -> Response.ok(user).build())
            .onFailure(AuthService.AuthException.class)
            .recoverWithItem(error ->
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(error.getMessage()))
                    .build()
            );
    }

    @POST
    @Path("/refresh")
    @Operation(summary = "Refresh current access token")
    public Uni<Response> refresh(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Uni.createFrom().item(
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("Missing or invalid authorization header"))
                    .build()
            );
        }

        String token = authHeader.substring(7);
        return authService.refresh(token)
            .map(authResponse -> Response.ok(authResponse).build())
            .onFailure(AuthService.AuthException.class)
            .recoverWithItem(error ->
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(error.getMessage()))
                    .build()
            );
    }

    private boolean isOidcAuthenticated(SecurityContext securityContext) {
        return securityIdentity != null
                && !securityIdentity.isAnonymous()
                && securityContext != null
                && securityContext.getUserPrincipal() != null;
    }

    private JsonObject oidcUser() {
        JsonArray roles = new JsonArray();
        securityIdentity.getRoles().stream().sorted().forEach(roles::add);
        return new JsonObject()
                .put("principal", securityIdentity.getPrincipal().getName())
                .put("roles", roles)
                .put("authType", "OIDC");
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
