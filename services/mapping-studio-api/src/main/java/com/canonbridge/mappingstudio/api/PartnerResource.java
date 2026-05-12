package com.canonbridge.mappingstudio.api;

import com.canonbridge.mappingstudio.domain.Partner;
import com.canonbridge.mappingstudio.dto.PartnerCreateRequest;
import com.canonbridge.mappingstudio.dto.PartnerResponse;
import com.canonbridge.mappingstudio.dto.PartnerUpdateRequest;
import com.canonbridge.mappingstudio.service.PartnerService;
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
    PartnerService partnerService;

    @GET
    @Operation(summary = "List all partners for tenant")
    public List<PartnerResponse> listPartners(
            @HeaderParam("X-Tenant-Id") String tenantId) {
        return partnerService.listPartners(tenantId);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get partner by ID")
    public PartnerResponse getPartner(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        return partnerService.getPartner(tenantId, id);
    }

    @POST
    @Operation(summary = "Create a new partner")
    public Response createPartner(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @Valid PartnerCreateRequest request) {
        PartnerResponse partner = partnerService.createPartner(tenantId, userId, request);
        return Response.status(Response.Status.CREATED).entity(partner).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update partner")
    public PartnerResponse updatePartner(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @PathParam("id") UUID id,
            @Valid PartnerUpdateRequest request) {
        return partnerService.updatePartner(tenantId, userId, id, request);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete partner")
    public Response deletePartner(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        partnerService.deletePartner(tenantId, id);
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}/status")
    @Operation(summary = "Update partner status")
    public PartnerResponse updatePartnerStatus(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @PathParam("id") UUID id,
            @QueryParam("status") Partner.PartnerStatus status) {
        return partnerService.updatePartnerStatus(tenantId, userId, id, status);
    }
}
