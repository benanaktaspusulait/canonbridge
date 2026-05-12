package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.auth.AuthResponse;
import com.canonbridge.mappingstudio.auth.AuthService;
import com.canonbridge.mappingstudio.auth.LoginRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication operations")
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    @Operation(summary = "Login with email and password")
    public Uni<Response> login(@Valid LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword())
            .map(authResponse -> Response.ok(authResponse).build())
            .onFailure(AuthService.AuthException.class)
            .recoverWithItem(error -> {
                error.printStackTrace(); // Log the error
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(error.getMessage()))
                    .build();
            })
            .onFailure().recoverWithItem(error -> {
                error.printStackTrace(); // Log the error
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Authentication failed: " + error.getMessage()))
                    .build();
            });
    }

    @GET
    @Path("/me")
    @Operation(summary = "Get current user info")
    public Uni<Response> getCurrentUser(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
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

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
