package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.domain.MappingVersion;
import com.canonbridge.mappingstudio.repository.MappingVersionRepository;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Path("/api/mapping-versions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Mapping Versions", description = "Published mapping version operations")
public class MappingVersionResource {
    @Inject
    TenantContext tenantContext;

    @Inject
    MappingVersionRepository versionRepository;

    @GET
    @Operation(summary = "List all mapping versions for tenant")
    public Uni<List<MappingVersion>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return versionRepository.findByTenantId(tenantId);
    }

    @GET
    @Path("/partner/{partnerId}")
    @Operation(summary = "List mapping versions by partner")
    public Uni<List<MappingVersion>> listByPartner(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("partnerId") UUID partnerId) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return versionRepository.findByPartner(tenantId, partnerId);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get mapping version by ID")
    public Uni<Response> get(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return versionRepository.findById(tenantId, id)
            .map(version -> {
                if (version == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(version).build();
            });
    }

    @GET
    @Path("/active/{partnerId}/{eventType}")
    @Operation(summary = "Get active mapping version for partner and event type")
    public Uni<Response> getActive(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("partnerId") UUID partnerId,
            @PathParam("eventType") String eventType) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return versionRepository.findActiveByPartnerAndEventType(tenantId, partnerId, eventType)
            .map(version -> {
                if (version == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(version).build();
            });
    }

    @POST
    @Path("/{id}/deprecate")
    @Operation(summary = "Deprecate a mapping version")
    public Uni<Response> deprecate(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        tenantId = tenantContext.requireTenantId(tenantId);
        
        return versionRepository.deprecate(tenantId, id)
            .map(version -> {
                if (version == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(version).build();
            });
    }

    @POST
    @Path("/bulk/deprecate")
    @Operation(summary = "Deprecate multiple mapping versions")
    public Uni<Response> bulkDeprecate(
            @HeaderParam("X-Tenant-Id") String tenantId,
            JsonObject body) {
        tenantId = tenantContext.requireTenantId(tenantId);
        JsonArray ids = body != null ? body.getJsonArray("ids", new JsonArray()) : new JsonArray();
        if (ids.isEmpty()) {
            throw new BadRequestException("ids array is required");
        }

        List<Uni<JsonObject>> updates = ids.stream()
            .map(String::valueOf)
            .map(raw -> UUID.fromString(raw.replace("\"", "")))
            .map(id -> versionRepository.deprecate(tenantId, id)
                .map(version -> new JsonObject()
                    .put("id", id.toString())
                    .put("status", version == null ? "NOT_FOUND" : "DEPRECATED")))
            .toList();

        return Uni.combine().all().unis(updates).with(results -> Response.ok(new JsonObject()
            .put("results", new JsonArray(results))).build());
    }

    @GET
    @Path("/{leftId}/diff/{rightId}")
    @Operation(summary = "Diff two mapping versions")
    public Uni<Response> diff(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("leftId") UUID leftId,
            @PathParam("rightId") UUID rightId) {
        tenantId = tenantContext.requireTenantId(tenantId);

        return versionRepository.findById(tenantId, leftId)
            .chain(left -> versionRepository.findById(tenantId, rightId)
                .map(right -> {
                    if (left == null || right == null) {
                        return Response.status(Response.Status.NOT_FOUND).build();
                    }
                    return Response.ok(buildDiff(left, right)).build();
                }));
    }

    private JsonObject buildDiff(MappingVersion left, MappingVersion right) {
        JsonArray fields = new JsonArray();
        addDiff(fields, "name", left.getName(), right.getName());
        addDiff(fields, "description", left.getDescription(), right.getDescription());
        addDiff(fields, "source_type", left.getSourceType(), right.getSourceType());
        addDiff(fields, "config_json", normalizeJson(left.getConfigJson()), normalizeJson(right.getConfigJson()));
        addDiff(fields, "jsonata_expression", left.getJsonataExpression(), right.getJsonataExpression());
        addDiff(fields, "input_schema", normalizeJson(left.getInputSchema()), normalizeJson(right.getInputSchema()));
        addDiff(fields, "canonical_schema_ref", left.getCanonicalSchemaRef(), right.getCanonicalSchemaRef());
        addDiff(fields, "status", left.getStatus(), right.getStatus());

        return new JsonObject()
            .put("left", describeVersion(left))
            .put("right", describeVersion(right))
            .put("changed", !fields.isEmpty())
            .put("fields", fields);
    }

    private JsonObject describeVersion(MappingVersion version) {
        return new JsonObject()
            .put("id", version.getId().toString())
            .put("version", version.getVersion())
            .put("name", version.getName())
            .put("status", version.getStatus().name())
            .put("checksum", version.getChecksum());
    }

    private void addDiff(JsonArray fields, String name, Object left, Object right) {
        if (!Objects.equals(left, right)) {
            fields.add(new JsonObject()
                .put("field", name)
                .put("left", left)
                .put("right", right));
        }
    }

    private Object normalizeJson(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return raw.trim().startsWith("[") ? new JsonArray(raw) : new JsonObject(raw);
        } catch (Exception e) {
            return raw;
        }
    }
}
