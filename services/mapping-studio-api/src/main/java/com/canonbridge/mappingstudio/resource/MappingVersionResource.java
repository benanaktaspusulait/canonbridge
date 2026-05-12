package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.MappingVersion;
import com.canonbridge.mappingstudio.repository.MappingVersionRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/mapping-versions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Mapping Versions", description = "Published mapping version operations")
public class MappingVersionResource {

    @Inject
    MappingVersionRepository versionRepository;

    @GET
    @Operation(summary = "List all mapping versions for tenant")
    public Uni<List<MappingVersion>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return versionRepository.findByTenantId(tenantId);
    }

    @GET
    @Path("/partner/{partnerId}")
    @Operation(summary = "List mapping versions by partner")
    public Uni<List<MappingVersion>> listByPartner(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("partnerId") UUID partnerId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return versionRepository.findByPartner(tenantId, partnerId);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get mapping version by ID")
    public Uni<Response> get(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
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
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
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
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        
        return versionRepository.deprecate(tenantId, id)
            .map(version -> {
                if (version == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(version).build();
            });
    }
}
