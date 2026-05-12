package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.repository.CredentialRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/credentials")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Credentials", description = "Credential management operations")
public class CredentialResource {

    @Inject
    CredentialRepository credentialRepository;

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

        // TODO: Encrypt the secret before storing
        String encryptedSecret = encryptSecret(request.secret());

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

    // TODO: Implement proper encryption
    private String encryptSecret(String secret) {
        // Placeholder - should use proper encryption (AES-256-GCM)
        return "ENCRYPTED:" + secret;
    }

    public record CreateCredentialRequest(
            String displayName,
            Credential.AuthType authType,
            Credential.Environment environment,
            String secret,
            java.time.Instant rotationDueAt
    ) {}
}
