package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.audit.AuditLogService;
import com.canonbridge.mappingstudio.domain.AuditLog;
import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.outbound.RequestTemplateService;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/mapping-drafts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Mapping Drafts", description = "Mapping draft management operations")
public class MappingDraftResource {

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    AuditLogService auditLogService;

    @Inject
    RequestTemplateService requestTemplateService;

    @GET
    @Operation(summary = "List all mapping drafts for tenant")
    public Uni<List<MappingDraft>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return draftRepository.findByTenantId(tenantId);
    }

    @GET
    @Path("/partner/{partnerId}")
    @Operation(summary = "List mapping drafts by partner")
    public Uni<List<MappingDraft>> listByPartner(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("partnerId") UUID partnerId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return draftRepository.findByPartner(tenantId, partnerId);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get mapping draft by ID")
    public Uni<Response> get(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return draftRepository.findById(tenantId, id)
            .map(draft -> {
                if (draft == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(draft).build();
            });
    }

    @POST
    @Path("/{id}/request-preview")
    @Operation(summary = "Render outbound request template for a mapping draft")
    public Uni<Response> previewRequest(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id,
            RequestPreviewRequest request) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return draftRepository.findById(tenantId, id)
                .map(draft -> {
                    if (draft == null) {
                        return Response.status(Response.Status.NOT_FOUND).build();
                    }
                    JsonObject sourceConfig = parseJsonObject(draft.getSourceConfig(), new JsonObject());
                    JsonObject context = request != null && request.context() != null ? request.context() : new JsonObject();
                    JsonObject body = requestTemplateService.renderFromSourceConfig(sourceConfig, context);
                    JsonObject headers = requestTemplateService.renderHeadersFromSourceConfig(sourceConfig, context);
                    return Response.ok(new RequestPreviewResponse(body, headers)).build();
                });
    }

    @POST
    @Operation(summary = "Create a new mapping draft")
    public Uni<Response> create(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            MappingDraft draft) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        
        draft.setTenantId(tenantId);
        draft.setCreatedBy(userId);
        draft.setUpdatedBy(userId);
        
        return draftRepository.create(draft)
            .flatMap(created -> auditLogService.logSuccess(
                tenantId, userId,
                AuditLog.AuditAction.MAPPING_CREATED,
                "mapping_draft", created.getId() != null ? created.getId().toString() : "",
                "Created mapping draft: " + created.getName(),
                null
            ).map(ignored -> Response.status(Response.Status.CREATED).entity(created).build()));
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update an existing mapping draft")
    public Uni<Response> update(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @PathParam("id") UUID id,
            MappingDraft draft) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        
        draft.setId(id);
        draft.setTenantId(tenantId);
        draft.setUpdatedBy(userId);
        
        return draftRepository.update(draft)
            .map(updated -> {
                if (updated == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(updated).build();
            });
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a mapping draft")
    public Uni<Response> delete(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        
        return draftRepository.delete(tenantId, id)
            .map(deleted -> {
                if (!deleted) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.noContent().build();
            });
    }

    private JsonObject parseJsonObject(String raw, JsonObject fallback) {
        if (raw == null || raw.isBlank()) return fallback;
        try {
            return new JsonObject(raw);
        } catch (Exception e) {
            return fallback;
        }
    }

    public record RequestPreviewRequest(JsonObject context) {}

    public record RequestPreviewResponse(JsonObject payload, JsonObject headers) {}
}
