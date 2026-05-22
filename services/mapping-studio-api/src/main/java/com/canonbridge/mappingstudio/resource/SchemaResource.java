package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.domain.SchemaDefinition;
import com.canonbridge.mappingstudio.repository.SchemaRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/schemas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Schemas", description = "JSON schema management operations")
@jakarta.annotation.security.RolesAllowed({"admin", "integration_author"})
public class SchemaResource {
    @Inject
    TenantContext tenantContext;

    @Inject
    SchemaRepository schemaRepository;

    @GET
    @Operation(summary = "List all schemas for tenant")
    public Uni<List<SchemaDefinition>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        return schemaRepository.findByTenantId(requireTenantId(tenantId));
    }

    @GET
    @Path("/type/{schemaType}")
    @Operation(summary = "List schemas by type")
    public Uni<List<SchemaDefinition>> listByType(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("schemaType") SchemaDefinition.SchemaType schemaType) {
        return schemaRepository.findByType(requireTenantId(tenantId), schemaType);
    }

    @GET
    @Path("/subject/{subject}")
    @Operation(summary = "List schema versions by subject")
    public Uni<List<SchemaDefinition>> listBySubject(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("subject") String subject) {
        return schemaRepository.findBySubject(requireTenantId(tenantId), subject);
    }

    @GET
    @Path("/subject/{subject}/latest")
    @Operation(summary = "Get latest active schema by subject")
    public Uni<Response> getLatestActive(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("subject") String subject) {
        return schemaRepository.findLatestActive(requireTenantId(tenantId), subject)
                .map(this::okOrNotFound);
    }

    @GET
    @Path("/{subject}")
    @Operation(summary = "Get schema by subject (shorthand for latest active)")
    public Uni<Response> getBySubject(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("subject") String subject) {
        // If subject looks like a UUID, treat it as ID lookup
        try {
            UUID id = UUID.fromString(subject);
            return schemaRepository.findById(requireTenantId(tenantId), id)
                    .map(this::okOrNotFound);
        } catch (IllegalArgumentException e) {
            // Not a UUID, treat as subject name - return latest active
            return schemaRepository.findLatestActive(requireTenantId(tenantId), subject)
                    .map(this::okOrNotFound);
        }
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get schema by ID")
    public Uni<Response> get(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        return schemaRepository.findById(requireTenantId(tenantId), id)
                .map(this::okOrNotFound);
    }

    @POST
    @Operation(summary = "Create a schema")
    public Uni<Response> create(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            SchemaDefinition schema) {
        SchemaDefinition toCreate = withTenantAndUser(requireTenantId(tenantId), userId, schema);
        return schemaRepository.create(toCreate)
                .map(created -> Response.status(Response.Status.CREATED).entity(created).build());
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update a schema")
    public Uni<Response> update(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @PathParam("id") UUID id,
            SchemaDefinition schema) {
        SchemaDefinition patch = withTenantAndUser(requireTenantId(tenantId), userId, schema);
        return schemaRepository.update(patch.tenantId(), id, patch)
                .map(this::okOrNotFound);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a schema")
    public Uni<Response> delete(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        return schemaRepository.delete(requireTenantId(tenantId), id)
                .map(deleted -> deleted ? Response.noContent().build() : Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @Path("/{id}/validate")
    @Operation(summary = "Validate schema rules for consistency")
    public Uni<Response> validateSchema(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id,
            io.vertx.core.json.JsonObject body) {
        return schemaRepository.findById(requireTenantId(tenantId), id)
                .map(schema -> {
                    if (schema == null) {
                        return Response.status(Response.Status.NOT_FOUND).build();
                    }

                    io.vertx.core.json.JsonArray rules = body.getJsonArray("rules", new io.vertx.core.json.JsonArray());
                    java.util.List<io.vertx.core.json.JsonObject> errors = new java.util.ArrayList<>();

                    for (int i = 0; i < rules.size(); i++) {
                        io.vertx.core.json.JsonObject rule = rules.getJsonObject(i);
                        if (rule == null) continue;

                        String field = rule.getString("field", "");
                        String type = rule.getString("type", "any");
                        boolean required = Boolean.TRUE.equals(rule.getBoolean("required"));

                        // Validate min/max consistency for numbers
                        if ("number".equals(type) || "integer".equals(type)) {
                            Double minVal = rule.getDouble("minValue");
                            Double maxVal = rule.getDouble("maxValue");
                            if (minVal != null && maxVal != null && minVal > maxVal) {
                                errors.add(new io.vertx.core.json.JsonObject()
                                    .put("field", field)
                                    .put("type", "RANGE")
                                    .put("message", String.format("Min value (%.2f) cannot be greater than max value (%.2f)", minVal, maxVal)));
                            }
                        }

                        // Validate minLength/maxLength consistency for strings
                        if ("string".equals(type)) {
                            Integer minLen = rule.getInteger("minLength");
                            Integer maxLen = rule.getInteger("maxLength");
                            if (minLen != null && maxLen != null && minLen > maxLen) {
                                errors.add(new io.vertx.core.json.JsonObject()
                                    .put("field", field)
                                    .put("type", "LENGTH")
                                    .put("message", String.format("Min length (%d) cannot be greater than max length (%d)", minLen, maxLen)));
                            }
                            if (minLen != null && minLen < 0) {
                                errors.add(new io.vertx.core.json.JsonObject()
                                    .put("field", field)
                                    .put("type", "LENGTH")
                                    .put("message", "Min length cannot be negative"));
                            }

                            // Validate regex pattern
                            String pattern = rule.getString("pattern");
                            if (pattern != null && !pattern.isBlank()) {
                                try {
                                    java.util.regex.Pattern.compile(pattern);
                                } catch (java.util.regex.PatternSyntaxException e) {
                                    errors.add(new io.vertx.core.json.JsonObject()
                                        .put("field", field)
                                        .put("type", "PATTERN")
                                        .put("message", String.format("Invalid regex pattern: %s", e.getMessage())));
                                }
                            }
                        }

                        // Validate enum values not empty if field is required
                        io.vertx.core.json.JsonArray enumValues = rule.getJsonArray("enumValues");
                        if (required && enumValues != null && enumValues.isEmpty()) {
                            errors.add(new io.vertx.core.json.JsonObject()
                                .put("field", field)
                                .put("type", "ENUM")
                                .put("message", "Required field with enum constraint must have at least one allowed value"));
                        }
                    }

                    io.vertx.core.json.JsonObject response = new io.vertx.core.json.JsonObject()
                        .put("valid", errors.isEmpty())
                        .put("errors", new io.vertx.core.json.JsonArray(errors))
                        .put("totalErrors", errors.size());

                    return Response.ok(response).build();
                });
    }

    private String requireTenantId(String tenantId) {
        return tenantContext.requireTenantId(tenantId);
    }

    private Response okOrNotFound(SchemaDefinition schema) {
        if (schema == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(schema).build();
    }

    private SchemaDefinition withTenantAndUser(String tenantId, String userId, SchemaDefinition schema) {
        String actor = userId != null && !userId.isBlank() ? userId : "system";
        return new SchemaDefinition(
                schema.id(),
                tenantId,
                schema.name(),
                schema.schemaType(),
                schema.subject(),
                schema.version(),
                schema.schemaJson(),
                schema.compatibilityMode(),
                schema.status(),
                schema.description(),
                actor,
                schema.createdAt(),
                actor,
                schema.updatedAt()
        );
    }
}
