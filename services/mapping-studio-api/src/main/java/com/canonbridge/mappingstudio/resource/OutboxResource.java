package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.repository.OutboxEventRepository;
import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.service.OutboxReplayService;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/outbox")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Outbox", description = "Outbox event replay and recovery operations")
@jakarta.annotation.security.RolesAllowed({"admin", "operator"})
public class OutboxResource {

    @Inject
    TenantContext tenantContext;

    @Inject
    OutboxEventRepository outboxEventRepository;

    @Inject
    OutboxReplayService outboxReplayService;

    @GET
    @Path("/events")
    @Operation(summary = "List outbox events for the current tenant")
    public Uni<Response> listEvents(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @QueryParam("status") String status,
            @QueryParam("limit") @DefaultValue("50") int limit,
            @QueryParam("offset") @DefaultValue("0") int offset) {
        String requiredTenantId = tenantContext.requireTenantId(tenantId);
        return outboxEventRepository.list(requiredTenantId, status, limit, offset)
                .map(events -> Response.ok(new JsonObject()
                        .put("tenantId", requiredTenantId)
                        .put("events", new JsonArray(events))
                        .put("limit", Math.max(1, Math.min(limit, 200)))
                        .put("offset", Math.max(0, offset)))
                        .build());
    }

    @GET
    @Path("/stats")
    @Operation(summary = "Get outbox status counts for the current tenant")
    public Uni<Response> stats(@HeaderParam("X-Tenant-Id") String tenantId) {
        String requiredTenantId = tenantContext.requireTenantId(tenantId);
        return outboxEventRepository.stats(requiredTenantId).map(stats -> Response.ok(stats).build());
    }

    @POST
    @Path("/replay")
    @Operation(summary = "Manually trigger replay for due pending or failed outbox events")
    public Uni<Response> replayDue(@HeaderParam("X-Tenant-Id") String tenantId) {
        tenantContext.requireTenantId(tenantId);
        return outboxReplayService.replayDueEvents()
                .map(count -> Response.accepted(new JsonObject()
                        .put("status", "ACCEPTED")
                        .put("replayed", count))
                        .build());
    }
}
