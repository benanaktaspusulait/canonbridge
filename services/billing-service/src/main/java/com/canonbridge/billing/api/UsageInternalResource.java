package com.canonbridge.billing.api;

import com.canonbridge.billing.service.UsageAggregationService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/internal/usage")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Usage (Internal)", description = "Internal usage recording from other services")
public class UsageInternalResource {

    @Inject
    UsageAggregationService usageAggregationService;

    @POST
    @Path("/aggregate/daily")
    @Operation(summary = "Trigger daily usage aggregation (normally runs via cron)")
    public Uni<Response> triggerDailyAggregation() {
        return usageAggregationService.runDailyAggregation()
            .map(count -> Response.ok(new AggregationResult(count, "daily")).build());
    }

    @POST
    @Path("/aggregate/monthly")
    @Operation(summary = "Trigger monthly usage aggregation (normally runs via cron)")
    public Uni<Response> triggerMonthlyAggregation() {
        return usageAggregationService.runMonthlyAggregation()
            .map(count -> Response.ok(new AggregationResult(count, "monthly")).build());
    }

    @GET
    @Path("/summary/{orgId}")
    @Operation(summary = "Get usage summary for an organization")
    public Uni<Response> getUsageSummary(@PathParam("orgId") UUID orgId) {
        return usageAggregationService.getMonthlyUsage(orgId)
            .map(summary -> Response.ok(summary).build());
    }

    public record AggregationResult(long rowsProcessed, String type) {}
}
