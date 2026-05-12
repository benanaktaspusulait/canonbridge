package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.Partner;
import com.canonbridge.mappingstudio.repository.PartnerRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/partners")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Partners", description = "Partner management operations")
public class PartnerResource {

    @Inject
    PartnerRepository partnerRepository;

    @GET
    @Operation(summary = "List all partners for tenant")
    public Uni<List<Partner>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return partnerRepository.findByTenantId(tenantId);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get partner by ID")
    public Uni<Response> get(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return partnerRepository.findById(tenantId, id)
            .map(partner -> {
                if (partner == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(partner).build();
            });
    }

    @GET
    @Path("/external/{externalId}")
    @Operation(summary = "Get partner by external ID")
    public Uni<Response> getByExternalId(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("externalId") String externalId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return partnerRepository.findByExternalId(tenantId, externalId)
            .map(partner -> {
                if (partner == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(partner).build();
            });
    }

    @POST
    @Operation(summary = "Create a new partner")
    public Uni<Response> create(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @Valid Partner partner) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        
        partner.setTenantId(tenantId);
        partner.setCreatedBy(userId);
        partner.setUpdatedBy(userId);
        
        return partnerRepository.create(partner)
            .map(created -> Response.status(Response.Status.CREATED).entity(created).build());
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update an existing partner")
    public Uni<Response> update(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @PathParam("id") UUID id,
            @Valid Partner partner) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        
        partner.setId(id);
        partner.setTenantId(tenantId);
        partner.setUpdatedBy(userId);
        
        return partnerRepository.update(partner)
            .map(updated -> {
                if (updated == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(updated).build();
            });
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a partner")
    public Uni<Response> delete(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        
        return partnerRepository.delete(tenantId, id)
            .map(deleted -> {
                if (!deleted) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.noContent().build();
            });
    }
}
