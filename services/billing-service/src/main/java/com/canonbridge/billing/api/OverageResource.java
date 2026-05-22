package com.canonbridge.billing.api;

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

import java.util.Map;
import java.util.UUID;

@Path("/api/organizations/{orgId}/overage")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Overage", description = "Overage billing opt-in/out and cap management")
public class OverageResource {

    @Inject
    PgPool client;

    @GET
    @Operation(summary = "Get overage settings for an organization")
    public Uni<Response> getSettings(@PathParam("orgId") UUID orgId) {
        String sql = "SELECT * FROM org_billing_settings WHERE org_id = $1";
        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                if (rowSet.size() == 0) {
                    return Response.ok(Map.of("overage_enabled", false, "overage_cap_cents", 0)).build();
                }
                Row row = rowSet.iterator().next();
                return Response.ok(Map.of(
                    "overage_enabled", row.getBoolean("overage_enabled"),
                    "overage_cap_cents", row.getInteger("overage_cap_cents"),
                    "notification_threshold_percent", row.getInteger("overage_notification_threshold_percent")
                )).build();
            });
    }

    @POST
    @Path("/enable")
    @Operation(summary = "Enable overage billing")
    public Uni<Response> enable(@PathParam("orgId") UUID orgId, OverageSettings settings) {
        String sql = """
            INSERT INTO org_billing_settings (org_id, overage_enabled, overage_cap_cents, overage_notification_threshold_percent)
            VALUES ($1, TRUE, $2, $3)
            ON CONFLICT (org_id) DO UPDATE SET
                overage_enabled = TRUE,
                overage_cap_cents = $2,
                overage_notification_threshold_percent = $3,
                updated_at = NOW()
            """;
        int cap = settings != null && settings.capCents() > 0 ? settings.capCents() : 10000;
        int threshold = settings != null && settings.thresholdPercent() > 0 ? settings.thresholdPercent() : 80;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, cap, threshold))
            .map(r -> Response.ok(Map.of("overage_enabled", true, "overage_cap_cents", cap)).build());
    }

    @POST
    @Path("/disable")
    @Operation(summary = "Disable overage billing")
    public Uni<Response> disable(@PathParam("orgId") UUID orgId) {
        String sql = """
            INSERT INTO org_billing_settings (org_id, overage_enabled)
            VALUES ($1, FALSE)
            ON CONFLICT (org_id) DO UPDATE SET overage_enabled = FALSE, updated_at = NOW()
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(r -> Response.ok(Map.of("overage_enabled", false)).build());
    }

    public record OverageSettings(int capCents, int thresholdPercent) {}
}
