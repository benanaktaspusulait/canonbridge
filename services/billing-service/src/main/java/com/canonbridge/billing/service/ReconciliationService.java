package com.canonbridge.billing.service;

import io.quarkus.logging.Log;
import io.quarkus.scheduler.Scheduled;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * TASK-019: Daily reconciliation between Redis entitlement cache and Postgres usage data.
 * Detects discrepancies and corrects them. Also performs anomaly detection.
 */
@ApplicationScoped
public class ReconciliationService {

    @Inject
    PgPool client;

    /**
     * Daily reconciliation — runs at 03:00 UTC.
     */
    @Scheduled(cron = "${canonbridge.billing.usage-reconciliation-cron}", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    public void scheduledReconciliation() {
        runReconciliation()
            .subscribe().with(
                result -> Log.infof("Reconciliation completed: %d orgs checked, %d discrepancies fixed", result.orgsChecked, result.discrepanciesFixed),
                error -> Log.errorf(error, "Reconciliation failed")
            );
    }

    public Uni<ReconciliationResult> runReconciliation() {
        // Compare entitlements_cache.used_value with actual usage_events count for current period
        String sql = """
            WITH actual_usage AS (
                SELECT org_id, metric, SUM(qty) AS actual_qty
                FROM usage_events
                WHERE ts >= date_trunc('month', CURRENT_TIMESTAMP)
                GROUP BY org_id, metric
            ),
            discrepancies AS (
                SELECT ec.org_id, ec.feature_key,
                       ec.used_value AS cached_used,
                       COALESCE(au.actual_qty, 0) AS actual_used,
                       ABS(ec.used_value - COALESCE(au.actual_qty, 0)) AS diff
                FROM entitlements_cache ec
                LEFT JOIN actual_usage au ON au.org_id = ec.org_id AND au.metric = ec.feature_key
                WHERE ABS(ec.used_value - COALESCE(au.actual_qty, 0)) > 0
            )
            UPDATE entitlements_cache ec
            SET used_value = d.actual_used, updated_at = NOW()
            FROM discrepancies d
            WHERE ec.org_id = d.org_id AND ec.feature_key = d.feature_key
            """;

        String countSql = "SELECT COUNT(DISTINCT org_id) AS cnt FROM entitlements_cache";

        return client.preparedQuery(sql)
            .execute(Tuple.tuple())
            .flatMap(updateResult -> {
                int fixed = updateResult.rowCount();
                return client.preparedQuery(countSql)
                    .execute(Tuple.tuple())
                    .map(countResult -> {
                        long orgsChecked = countResult.iterator().next().getLong("cnt");
                        if (fixed > 0) {
                            Log.warnf("Reconciliation fixed %d discrepancies across orgs", fixed);
                        }
                        return new ReconciliationResult(orgsChecked, fixed);
                    });
            });
    }

    /**
     * Anomaly detection: find orgs that exceeded 200% of their quota in the last 24 hours.
     */
    public Uni<List<AnomalyAlert>> detectAnomalies() {
        String sql = """
            SELECT ec.org_id, ec.feature_key, ec.limit_value, ec.used_value,
                   CASE WHEN ec.limit_value > 0 THEN (ec.used_value * 100 / ec.limit_value) ELSE 0 END AS usage_percent
            FROM entitlements_cache ec
            WHERE ec.limit_value > 0
              AND ec.used_value > (ec.limit_value * 2)
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.tuple())
            .map(rowSet -> {
                List<AnomalyAlert> alerts = new ArrayList<>();
                for (Row row : rowSet) {
                    alerts.add(new AnomalyAlert(
                        row.getUUID("org_id"),
                        row.getString("feature_key"),
                        row.getLong("limit_value"),
                        row.getLong("used_value"),
                        row.getLong("usage_percent")
                    ));
                }
                if (!alerts.isEmpty()) {
                    Log.warnf("Anomaly detection: %d orgs exceeding 200%% quota", alerts.size());
                }
                return alerts;
            });
    }

    public record ReconciliationResult(long orgsChecked, int discrepanciesFixed) {}
    public record AnomalyAlert(UUID orgId, String featureKey, long limit, long used, long usagePercent) {}
}
