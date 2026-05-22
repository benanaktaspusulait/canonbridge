package com.canonbridge.billing.api;

import com.canonbridge.billing.domain.SubscriptionRequest;
import com.canonbridge.billing.domain.SubscriptionResponse;
import com.canonbridge.billing.service.SubscriptionService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/subscriptions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Subscriptions", description = "Subscription lifecycle management")
public class SubscriptionResource {

    @Inject
    SubscriptionService subscriptionService;

    @GET
    @Path("/{orgId}")
    @Operation(summary = "Get subscription for an organization")
    public Uni<Response> getSubscription(@PathParam("orgId") UUID orgId) {
        return subscriptionService.getByOrgId(orgId)
            .map(sub -> {
                if (sub == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(sub).build();
            });
    }

    @POST
    @Operation(summary = "Create or upgrade a subscription")
    public Uni<Response> createOrUpgrade(@Valid SubscriptionRequest request) {
        return subscriptionService.createOrUpgrade(request)
            .map(result -> Response.ok(result).build());
    }

    @POST
    @Path("/{orgId}/cancel")
    @Operation(summary = "Cancel a subscription (effective at period end)")
    public Uni<Response> cancel(@PathParam("orgId") UUID orgId) {
        return subscriptionService.cancel(orgId)
            .map(result -> Response.ok(result).build());
    }

    @POST
    @Path("/{orgId}/pause")
    @Operation(summary = "Pause a subscription")
    public Uni<Response> pause(@PathParam("orgId") UUID orgId) {
        return subscriptionService.pause(orgId)
            .map(result -> Response.ok(result).build());
    }

    @POST
    @Path("/{orgId}/resume")
    @Operation(summary = "Resume a paused subscription")
    public Uni<Response> resume(@PathParam("orgId") UUID orgId) {
        return subscriptionService.resume(orgId)
            .map(result -> Response.ok(result).build());
    }
}
