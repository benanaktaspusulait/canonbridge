package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.audit.AuditLogService;
import com.canonbridge.mappingstudio.domain.AuditLog;
import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.outbound.RequestTemplateService;
import com.canonbridge.mappingstudio.outbound.RequestValidationService;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.jboss.logging.Logger;

@Path("/api/mapping-drafts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Mapping Drafts", description = "Mapping draft management operations")
public class MappingDraftResource {

    private static final Logger LOG = Logger.getLogger(MappingDraftResource.class);

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    AuditLogService auditLogService;

    @Inject
    RequestTemplateService requestTemplateService;

    @Inject
    RequestValidationService requestValidationService;

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
            JsonObject request) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return draftRepository.findById(tenantId, id)
                .chain(draft -> {
                    if (draft == null) {
                        return Uni.createFrom().item(Response.status(Response.Status.NOT_FOUND).build());
                    }
                    JsonObject sourceConfig = parseJsonObject(draft.getSourceConfig(), new JsonObject());
                    JsonObject context = request != null ? request.getJsonObject("context", new JsonObject()) : new JsonObject();
                    return requestTemplateService.renderFromSourceConfig(sourceConfig, context)
                            .map(body -> {
                                JsonObject headers = requestTemplateService.renderHeadersFromSourceConfig(sourceConfig, context);
                                return Response.ok(new RequestPreviewResponse(
                                        body != null ? body.getMap() : Map.of(),
                                        headers != null ? headers.getMap() : Map.of()
                                )).build();
                            });
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
            JsonObject request) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        return draftRepository.findById(tenantId, id)
            .chain(existing -> {
                if (existing == null) {
                    return Uni.createFrom().item(Response.status(Response.Status.NOT_FOUND).build());
                }

                try {
                    applyDraftUpdate(existing, request);
                } catch (IllegalArgumentException e) {
                    return Uni.createFrom().failure(new BadRequestException("Invalid mapping draft update: " + e.getMessage()));
                }

                existing.setId(id);
                existing.setTenantId(tenantId);
                existing.setUpdatedBy(userId);

                return draftRepository.update(existing)
                    .map(updated -> {
                        if (updated == null) {
                            return Response.status(Response.Status.NOT_FOUND).build();
                        }
                        return Response.ok(updated).build();
                    });
            });
    }

    @POST
    @Path("/{id}/validate-request")
    @Operation(summary = "Validate request payload against field validation rules")
    public Uni<Response> validateRequest(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id,
            JsonObject body) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        if (body == null) {
            throw new BadRequestException("Request body is required");
        }

        JsonObject payload = body.getJsonObject("payload");
        JsonArray rules = body.getJsonArray("rules");

        if (payload == null) {
            JsonObject errorResponse = new JsonObject()
                .put("valid", false)
                .put("errors", new JsonArray().add(new JsonObject()
                    .put("field", "_payload")
                    .put("type", "MISSING")
                    .put("message", "Request payload is required for validation")));
            return Uni.createFrom().item(Response.ok(errorResponse).build());
        }

        if (rules == null || rules.isEmpty()) {
            JsonObject response = new JsonObject()
                .put("valid", true)
                .put("errors", new JsonArray())
                .put("message", "No validation rules defined");
            return Uni.createFrom().item(Response.ok(response).build());
        }

        RequestValidationService.ValidationResult result = requestValidationService.validate(payload, rules);

        JsonArray errorsJson = new JsonArray(result.errors().stream()
            .map(e -> new JsonObject()
                .put("field", e.field())
                .put("type", e.type())
                .put("message", e.message()))
            .toList());

        JsonObject response = new JsonObject()
            .put("valid", result.valid())
            .put("errors", errorsJson)
            .put("totalErrors", errorsJson.size())
            .put("message", result.valid() 
                ? "Validation successful - all fields are valid" 
                : String.format("Validation failed with %d error(s)", errorsJson.size()));

        return Uni.createFrom().item(Response.ok(response).build());
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

    private void applyDraftUpdate(MappingDraft draft, JsonObject request) {
        if (request.containsKey("partner_id")) {
            draft.setPartnerId(parseUuid(request.getValue("partner_id"), "partner_id"));
        }
        if (request.containsKey("event_type")) {
            draft.setEventType(request.getString("event_type"));
        }
        if (request.containsKey("name")) {
            draft.setName(request.getString("name"));
        }
        if (request.containsKey("description")) {
            draft.setDescription(request.getString("description"));
        }
        if (request.containsKey("source_type")) {
            String sourceType = request.getString("source_type");
            if (sourceType != null && !sourceType.isBlank()) {
                draft.setSourceType(MappingDraft.SourceType.valueOf(sourceType));
            }
        }
        if (request.containsKey("source_config")) {
            draft.setSourceConfig(jsonValueAsString(request.getValue("source_config")));
        }
        if (request.containsKey("input_schema")) {
            draft.setInputSchema(jsonValueAsString(request.getValue("input_schema")));
        }
        if (request.containsKey("canonical_schema_ref")) {
            draft.setCanonicalSchemaRef(request.getString("canonical_schema_ref"));
        } else if (request.containsKey("target_schema_ref")) {
            draft.setCanonicalSchemaRef(request.getString("target_schema_ref"));
        }
        if (request.containsKey("mapping_rules")) {
            draft.setMappingRules(jsonValueAsString(request.getValue("mapping_rules")));
        } else if (request.containsKey("transformation_rules")) {
            draft.setMappingRules(jsonValueAsString(request.getValue("transformation_rules")));
        }
        if (request.containsKey("generated_jsonata")) {
            draft.setGeneratedJsonata(request.getString("generated_jsonata"));
        }
        if (request.containsKey("validation_rules")) {
            draft.setValidationRules(jsonValueAsString(request.getValue("validation_rules")));
        }
        if (request.containsKey("status")) {
            String status = request.getString("status");
            if (status != null && !status.isBlank()) {
                draft.setStatus(MappingDraft.DraftStatus.valueOf(status));
            }
        }
        if (request.containsKey("last_validated_at")) {
            String lastValidatedAt = request.getString("last_validated_at");
            draft.setLastValidatedAt(
                    lastValidatedAt == null || lastValidatedAt.isBlank() ? null : Instant.parse(lastValidatedAt)
            );
        }
        if (request.containsKey("validation_result")) {
            draft.setValidationResult(jsonValueAsString(request.getValue("validation_result")));
        }
    }

    private UUID parseUuid(Object value, String fieldName) {
        if (value == null) {
            return null;
        }
        try {
            return UUID.fromString(String.valueOf(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(fieldName + " must be a valid UUID");
        }
    }

    private String jsonValueAsString(Object value) {
        if (value == null) {
            return null;
        }
        LOG.infof("[jsonValueAsString] type=%s, value=%s", value.getClass().getName(), 
            String.valueOf(value).length() > 100 ? String.valueOf(value).substring(0, 100) + "..." : String.valueOf(value));
        
        if (value instanceof JsonObject jsonObject) {
            return jsonObject.encode();
        }
        if (value instanceof io.vertx.core.json.JsonArray jsonArray) {
            return jsonArray.encode();
        }
        if (value instanceof String str) {
            String trimmed = str.trim();
            if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                try {
                    if (trimmed.startsWith("{")) {
                        return new JsonObject(trimmed).encode();
                    } else {
                        return new io.vertx.core.json.JsonArray(trimmed).encode();
                    }
                } catch (Exception e) {
                    LOG.warnf("[jsonValueAsString] Failed to parse as JSON: %s", e.getMessage());
                    return str;
                }
            }
            return str;
        }
        return String.valueOf(value);
    }

    public record RequestPreviewResponse(Map<String, Object> payload, Map<String, Object> headers) {}
}
