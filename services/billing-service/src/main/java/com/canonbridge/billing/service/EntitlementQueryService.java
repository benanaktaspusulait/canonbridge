package com.canonbridge.billing.service;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class EntitlementQueryService {

    @Inject
    PgPool client;

    public Uni<List<Map<String, Object>>> getEntitlements(UUID orgId) {
        String sql = """
            SELECT ec.feature_key, ec.limit_value, ec.used_value, ec.remaining, ec.resets_at,
                   pf.unit, pf.is_soft_limit, pf.description
            FROM entitlements_cache ec
            LEFT JOIN subscriptions s ON s.org_id = ec.org_id
            LEFT JOIN plan_features pf ON pf.plan_id = s.plan_id AND pf.feature_key = ec.feature_key
            WHERE ec.org_id = $1
            ORDER BY ec.feature_key
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                List<Map<String, Object>> entitlements = new ArrayList<>();
                for (Row row : rowSet) {
                    entitlements.add(Map.of(
                        "feature_key", row.getString("feature_key"),
                        "limit", row.getLong("limit_value"),
                        "used", row.getLong("used_value"),
                        "remaining", row.getLong("remaining"),
                        "resets_at", row.getLocalDateTime("resets_at").toInstant(ZoneOffset.UTC).toString(),
                        "unit", row.getString("unit") != null ? row.getString("unit") : "count",
                        "is_soft_limit", row.getBoolean("is_soft_limit") != null ? row.getBoolean("is_soft_limit") : false
                    ));
                }
                return entitlements;
            });
    }

    public Uni<Map<String, Object>> checkFeature(UUID orgId, String featureKey) {
        String sql = """
            SELECT feature_key, limit_value, used_value, remaining, resets_at
            FROM entitlements_cache
            WHERE org_id = $1 AND feature_key = $2
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, featureKey))
            .map(rowSet -> {
                if (rowSet.size() == 0) {
                    return Map.<String, Object>of(
                        "feature_key", featureKey,
                        "allowed", true,
                        "message", "No quota configured for this feature"
                    );
                }
                Row row = rowSet.iterator().next();
                long limit = row.getLong("limit_value");
                long used = row.getLong("used_value");
                long remaining = row.getLong("remaining");
                boolean allowed = limit == -1 || remaining > 0;

                return Map.<String, Object>of(
                    "feature_key", featureKey,
                    "limit", limit,
                    "used", used,
                    "remaining", remaining,
                    "allowed", allowed,
                    "resets_at", row.getLocalDateTime("resets_at").toInstant(ZoneOffset.UTC).toString()
                );
            });
    }
}
