package com.canonbridge.billing.api;

import com.canonbridge.billing.service.EntitlementQueryService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/entitlements")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Entitlements", description = "Quota and entitlement queries")
public class EntitlementResource {

    @Inject
    EntitlementQueryService entitlementQueryService;

    @GET
    @Path("/{orgId}")
    @Operation(summary = "Get all entitlements for an organization")
    public Uni<Response> getEntitlements(@PathParam("orgId") UUID orgId) {
        return entitlementQueryService.getEntitlements(orgId)
            .map(entitlements -> Response.ok(entitlements).build());
    }

    @GET
    @Path("/{orgId}/{featureKey}")
    @Operation(summary = "Check a specific entitlement")
    public Uni<Response> checkEntitlement(
            @PathParam("orgId") UUID orgId,
            @PathParam("featureKey") String featureKey) {
        return entitlementQueryService.checkFeature(orgId, featureKey)
            .map(result -> Response.ok(result).build());
    }
}
