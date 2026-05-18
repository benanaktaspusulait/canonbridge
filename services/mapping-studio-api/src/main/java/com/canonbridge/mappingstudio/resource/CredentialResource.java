package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.credential.CredentialSecretCodec;
import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.repository.CredentialRepository;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/api/credentials")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Credentials", description = "Credential management operations")
public class CredentialResource {

    @Inject
    CredentialRepository credentialRepository;

    @Inject
    CredentialSecretCodec secretCodec;

    @GET
    @Operation(summary = "List all credentials (metadata only, no secrets)")
    public Uni<List<Credential>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return credentialRepository.findByTenant(tenantId);
    }

    @GET
    @Path("/{credentialId}")
    @Operation(summary = "Get credential by ID (metadata only)")
    public Uni<Response> getById(
            @PathParam("credentialId") UUID credentialId,
            @HeaderParam("X-Tenant-Id") String tenantId) {
        
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        return credentialRepository.findById(credentialId, tenantId)
                .map(credential -> {
                    if (credential == null) {
                        return Response.status(Response.Status.NOT_FOUND).build();
                    }
                    return Response.ok(credential).build();
                });
    }

    @POST
    @Operation(summary = "Create new credential with secret (write-only)")
    public Uni<Response> create(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            CreateCredentialRequest request) {
        
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        String encryptedSecret = secretCodec.encrypt(normalizeSecret(request.secret(), request.authType()));

        Credential credential = new Credential(
                null, // Will be generated
                tenantId,
                request.displayName(),
                request.authType(),
                request.environment(),
                Credential.CredentialStatus.ACTIVE,
                request.rotationDueAt(),
                null,
                userId != null ? userId : "system",
                null,
                null,
                null
        );

        return credentialRepository.create(credential, encryptedSecret)
                .map(created -> Response.status(Response.Status.CREATED).entity(created).build());
    }

    @POST
    @Path("/{credentialId}/disable")
    @Operation(summary = "Disable credential")
    public Uni<Response> disable(
            @PathParam("credentialId") UUID credentialId,
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId) {
        
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        return credentialRepository.updateStatus(
                credentialId, 
                tenantId, 
                Credential.CredentialStatus.INACTIVE,
                userId != null ? userId : "system"
        ).map(updated -> {
            if (updated == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            return Response.ok(updated).build();
        });
    }

    @POST
    @Path("/{credentialId}/rotate")
    @Operation(summary = "Rotate credential secret (write-only)")
    public Uni<Response> rotate(
            @PathParam("credentialId") UUID credentialId,
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            RotateCredentialRequest request) {

        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        return credentialRepository.findById(credentialId, tenantId)
                .chain(existing -> {
                    if (existing == null) {
                        return Uni.createFrom().item(Response.status(Response.Status.NOT_FOUND).build());
                    }
                    Credential.AuthType authType = request.authType() != null ? request.authType() : existing.authType();
                    String encryptedSecret = secretCodec.encrypt(normalizeSecret(request.secret(), authType));
                    return credentialRepository.rotateSecret(
                            credentialId,
                            tenantId,
                            encryptedSecret,
                            request.rotationDueAt(),
                            userId != null ? userId : "system"
                    ).map(updated -> Response.ok(updated).build());
                });
    }


    @SuppressWarnings("unchecked")
    private JsonObject normalizeSecret(Object secret, Credential.AuthType authType) {
        if (secret == null) {
            throw new BadRequestException("Credential secret is required");
        }

        if (secret instanceof JsonObject jsonObject) {
            return jsonObject;
        }

        if (secret instanceof Map<?, ?> map) {
            return new JsonObject((Map<String, Object>) map);
        }

        if (secret instanceof String value && !value.isBlank()) {
            return switch (authType) {
                case API_KEY -> new JsonObject().put("apiKey", value);
                case BEARER_TOKEN -> new JsonObject().put("token", value);
                default -> new JsonObject().put("secret", value);
            };
        }

        throw new BadRequestException("Credential secret must be a non-empty string or JSON object");
    }

    public record CreateCredentialRequest(
            String displayName,
            Credential.AuthType authType,
            Credential.Environment environment,
            Object secret,
            java.time.Instant rotationDueAt
    ) {}

    public record RotateCredentialRequest(
            Credential.AuthType authType,
            Object secret,
            java.time.Instant rotationDueAt
    ) {}
}
