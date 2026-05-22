package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.audit.AuditLogService;
import com.canonbridge.mappingstudio.credential.CredentialSecretCodec;
import com.canonbridge.mappingstudio.domain.AuditLog;
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
@jakarta.annotation.security.RolesAllowed({"admin", "integration_author"})
public class CredentialResource {
    @Inject
    TenantContext tenantContext;

    @Inject
    CredentialRepository credentialRepository;

    @Inject
    CredentialSecretCodec secretCodec;

    @Inject
    AuditLogService auditLogService;

    @GET
    @Operation(summary = "List all credentials (metadata only, no secrets)")
    public Uni<List<Credential>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return credentialRepository.findByTenant(tenantId);
    }

    @GET
    @Path("/{credentialId}")
    @Operation(summary = "Get credential by ID (metadata only)")
    public Uni<Response> getById(
            @PathParam("credentialId") UUID credentialId,
            @HeaderParam("X-Tenant-Id") String tenantId) {
        
        tenantId = tenantContext.requireTenantId(tenantId);

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
    @jakarta.annotation.security.RolesAllowed({"admin"})
    public Uni<Response> create(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            CreateCredentialRequest request) {
        
        String requiredTenantId = tenantContext.requireTenantId(tenantId);
        String actor = actor(userId);

        String encryptedSecret = secretCodec.encrypt(normalizeSecret(request.secret(), request.authType()));

        Credential credential = new Credential(
                null, // Will be generated
                requiredTenantId,
                request.displayName(),
                request.authType(),
                request.environment(),
                Credential.CredentialStatus.ACTIVE,
                request.rotationDueAt(),
                null,
                actor,
                null,
                null,
                null
        );

        return credentialRepository.create(credential, encryptedSecret)
                .chain(created -> auditCredentialSuccess(
                                requiredTenantId,
                                actor,
                                AuditLog.AuditAction.CREDENTIAL_CREATED,
                                created.credentialId(),
                                "Created credential metadata")
                        .replaceWith(Response.status(Response.Status.CREATED).entity(created).build()))
                .onFailure().call(error -> auditCredentialFailure(
                        requiredTenantId,
                        actor,
                        AuditLog.AuditAction.CREDENTIAL_CREATED,
                        null,
                        "Credential create failed: " + safeMessage(error)));
    }

    @POST
    @Path("/{credentialId}/disable")
    @Operation(summary = "Disable credential")
    @jakarta.annotation.security.RolesAllowed({"admin"})
    public Uni<Response> disable(
            @PathParam("credentialId") UUID credentialId,
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId) {
        
        String requiredTenantId = tenantContext.requireTenantId(tenantId);
        String actor = actor(userId);

        return credentialRepository.updateStatus(
                credentialId, 
                requiredTenantId,
                Credential.CredentialStatus.INACTIVE,
                actor
        ).chain(updated -> {
            if (updated == null) {
                return auditCredentialFailure(
                                requiredTenantId,
                                actor,
                                AuditLog.AuditAction.CREDENTIAL_UPDATED,
                                credentialId,
                                "Credential disable failed: credential not found")
                        .replaceWith(Response.status(Response.Status.NOT_FOUND).build());
            }
            return auditCredentialSuccess(
                            requiredTenantId,
                            actor,
                            AuditLog.AuditAction.CREDENTIAL_UPDATED,
                            credentialId,
                            "Disabled credential")
                    .replaceWith(Response.ok(updated).build());
        }).onFailure().call(error -> auditCredentialFailure(
                requiredTenantId,
                actor,
                AuditLog.AuditAction.CREDENTIAL_UPDATED,
                credentialId,
                "Credential disable failed: " + safeMessage(error)));
    }

    @POST
    @Path("/{credentialId}/rotate")
    @Operation(summary = "Rotate credential secret (write-only)")
    @jakarta.annotation.security.RolesAllowed({"admin"})
    public Uni<Response> rotate(
            @PathParam("credentialId") UUID credentialId,
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            RotateCredentialRequest request) {

        String requiredTenantId = tenantContext.requireTenantId(tenantId);
        String actor = actor(userId);
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        return credentialRepository.findById(credentialId, requiredTenantId)
                .chain(existing -> {
                    if (existing == null) {
                        return auditCredentialFailure(
                                        requiredTenantId,
                                        actor,
                                        AuditLog.AuditAction.CREDENTIAL_UPDATED,
                                        credentialId,
                                        "Credential rotation failed: credential not found")
                                .replaceWith(Response.status(Response.Status.NOT_FOUND).build());
                    }
                    Credential.AuthType authType = request.authType() != null ? request.authType() : existing.authType();
                    String encryptedSecret = secretCodec.encrypt(normalizeSecret(request.secret(), authType));
                    return credentialRepository.rotateSecret(
                            credentialId,
                            requiredTenantId,
                            encryptedSecret,
                            request.rotationDueAt(),
                            actor
                    ).chain(updated -> auditCredentialSuccess(
                                    requiredTenantId,
                                    actor,
                                    AuditLog.AuditAction.CREDENTIAL_UPDATED,
                                    credentialId,
                                    "Rotated credential secret")
                            .replaceWith(Response.ok(updated).build()));
                }).onFailure().call(error -> auditCredentialFailure(
                        requiredTenantId,
                        actor,
                        AuditLog.AuditAction.CREDENTIAL_UPDATED,
                        credentialId,
                        "Credential rotation failed: " + safeMessage(error)));
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

    private Uni<Void> auditCredentialSuccess(
            String tenantId,
            String userId,
            AuditLog.AuditAction action,
            UUID credentialId,
            String details) {
        return auditLogService.logSuccess(tenantId, userId, action, "credential", resourceId(credentialId), details, null);
    }

    private Uni<Void> auditCredentialFailure(
            String tenantId,
            String userId,
            AuditLog.AuditAction action,
            UUID credentialId,
            String details) {
        return auditLogService.logFailure(tenantId, userId, action, "credential", resourceId(credentialId), details, null);
    }

    private static String actor(String userId) {
        return userId != null && !userId.isBlank() ? userId : "system";
    }

    private static String resourceId(UUID credentialId) {
        return credentialId != null ? credentialId.toString() : "";
    }

    private static String safeMessage(Throwable error) {
        return error != null && error.getMessage() != null ? error.getMessage() : "unknown error";
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
