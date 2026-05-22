package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.billing.ApiKeyService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/api/organizations/{orgId}/api-keys")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "API Keys", description = "Organization-scoped API key management")
@jakarta.annotation.security.RolesAllowed({"admin"})
public class ApiKeyResource {

    @Inject
    ApiKeyService apiKeyService;

    @GET
    @Operation(summary = "List API keys for an organization (masked)")
    public Uni<Response> list(@PathParam("orgId") UUID orgId) {
        return apiKeyService.listByOrgId(orgId)
            .map(keys -> Response.ok(keys).build());
    }

    @POST
    @Operation(summary = "Create a new API key (raw key shown only once)")
    public Uni<Response> create(
            @PathParam("orgId") UUID orgId,
            @HeaderParam("X-User-Id") String userId,
            CreateKeyRequest request) {
        UUID createdBy = userId != null ? UUID.fromString(userId) : null;
        List<String> scopes = request.scopes() != null ? request.scopes() : List.of("read", "write");

        return apiKeyService.createKey(orgId, request.name(), scopes, createdBy)
            .map(result -> Response.status(Response.Status.CREATED)
                .entity(Map.of(
                    "id", result.id().toString(),
                    "raw_key", result.rawKey(),
                    "prefix", result.prefix(),
                    "name", result.name(),
                    "created_at", result.createdAt().toString(),
                    "warning", "Store this key securely. It will not be shown again."
                ))
                .build());
    }

    @DELETE
    @Path("/{keyId}")
    @Operation(summary = "Revoke an API key")
    public Uni<Response> revoke(@PathParam("orgId") UUID orgId, @PathParam("keyId") UUID keyId) {
        return apiKeyService.revokeKey(orgId, keyId)
            .map(revoked -> {
                if (!revoked) return Response.status(Response.Status.NOT_FOUND).build();
                return Response.noContent().build();
            });
    }

    public record CreateKeyRequest(String name, List<String> scopes) {}
}
