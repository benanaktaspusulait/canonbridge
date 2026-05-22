package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.billing.EntitlementService;
import com.canonbridge.mappingstudio.billing.EntitlementStatus;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Path("/api/organizations/{orgId}/usage")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Usage", description = "Usage metrics and entitlement status")
@jakarta.annotation.security.RolesAllowed({"admin", "integration_author", "operator", "viewer"})
public class UsageResource {

    @Inject
    EntitlementService entitlementService;

    @Inject
    PgPool pgPool;

    @GET
    @Operation(summary = "Get current usage summary (all metered features)")
    public Uni<List<EntitlementStatus>> getUsageSummary(@PathParam("orgId") UUID orgId) {
        return entitlementService.getUsageSummary(orgId);
    }

    @GET
    @Path("/history")
    @Operation(summary = "Get daily usage history for the last N days")
    public Uni<Response> getUsageHistory(
            @PathParam("orgId") UUID orgId,
            @QueryParam("days") @DefaultValue("30") int days,
            @QueryParam("metric") String metric) {

        String sql;
        Object[] params;

        if (metric != null && !metric.isBlank()) {
            sql = """
                SELECT metric, day, qty, cost_cents
                FROM usage_aggregates_daily
                WHERE org_id = $1 AND day >= $2 AND metric = $3
                ORDER BY day DESC, metric
                """;
            params = new Object[]{orgId, LocalDate.now(ZoneOffset.UTC).minusDays(days), metric};
        } else {
            sql = """
                SELECT metric, day, qty, cost_cents
                FROM usage_aggregates_daily
                WHERE org_id = $1 AND day >= $2
                ORDER BY day DESC, metric
                """;
            params = new Object[]{orgId, LocalDate.now(ZoneOffset.UTC).minusDays(days)};
        }

        io.vertx.mutiny.sqlclient.Tuple tuple = io.vertx.mutiny.sqlclient.Tuple.tuple();
        for (Object p : params) {
            tuple.addValue(p);
        }

        return pgPool.preparedQuery(sql)
            .execute(tuple)
            .map(rowSet -> {
                List<Map<String, Object>> history = new ArrayList<>();
                for (Row row : rowSet) {
                    history.add(Map.of(
                        "metric", row.getString("metric"),
                        "day", row.getLocalDate("day").toString(),
                        "qty", row.getLong("qty"),
                        "cost_cents", row.getInteger("cost_cents")
                    ));
                }
                return Response.ok(history).build();
            });
    }

    @GET
    @Path("/entitlements")
    @Operation(summary = "Get current entitlement/quota status")
    public Uni<List<EntitlementStatus>> getEntitlements(@PathParam("orgId") UUID orgId) {
        return entitlementService.getUsageSummary(orgId);
    }
}
