package com.canonbridge.billing.service;

import com.canonbridge.billing.domain.UsageSummary;
import io.quarkus.logging.Log;
import io.quarkus.scheduler.Scheduled;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Aggregates raw usage_events into daily and monthly rollups.
 * Runs on a cron schedule and can be triggered manually via API.
 */
@ApplicationScoped
public class UsageAggregationService {

    @Inject
    PgPool client;

    /**
     * Daily aggregation: usage_events → usage_aggregates_daily.
     * Runs at 02:00 UTC every day.
     */
    @Scheduled(cron = "${canonbridge.billing.usage-aggregation-cron}", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    public void scheduledDailyAggregation() {
        runDailyAggregation()
            .subscribe().with(
                count -> Log.infof("Daily usage aggregation completed: %d rows", count),
                error -> Log.errorf(error, "Daily usage aggregation failed")
            );
    }

    /**
     * Monthly aggregation: usage_aggregates_daily → usage_aggregates_monthly.
     * Runs at 04:00 UTC on the 1st of each month.
     */
    @Scheduled(cron = "${canonbridge.billing.monthly-invoice-cron}", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    public void scheduledMonthlyAggregation() {
        runMonthlyAggregation()
            .subscribe().with(
                count -> Log.infof("Monthly usage aggregation completed: %d rows", count),
                error -> Log.errorf(error, "Monthly usage aggregation failed")
            );
    }

    public Uni<Long> runDailyAggregation() {
        // Aggregate yesterday's usage events into daily rollup
        String sql = """
            INSERT INTO usage_aggregates_daily (org_id, metric, day, qty, cost_cents)
            SELECT org_id, metric, date_trunc('day', ts)::date AS day, SUM(qty), 0
            FROM usage_events
            WHERE ts >= (CURRENT_DATE - INTERVAL '1 day')
              AND ts < CURRENT_DATE
            GROUP BY org_id, metric, date_trunc('day', ts)::date
            ON CONFLICT (org_id, metric, day) DO UPDATE SET
                qty = EXCLUDED.qty,
                cost_cents = EXCLUDED.cost_cents
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.tuple())
            .map(rowSet -> (long) rowSet.rowCount());
    }

    public Uni<Long> runMonthlyAggregation() {
        // Aggregate last month's daily data into monthly rollup
        String sql = """
            INSERT INTO usage_aggregates_monthly (org_id, metric, month, qty, cost_cents)
            SELECT org_id, metric, date_trunc('month', day)::date AS month, SUM(qty), SUM(cost_cents)
            FROM usage_aggregates_daily
            WHERE day >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
              AND day < date_trunc('month', CURRENT_DATE)
            GROUP BY org_id, metric, date_trunc('month', day)::date
            ON CONFLICT (org_id, metric, month) DO UPDATE SET
                qty = EXCLUDED.qty,
                cost_cents = EXCLUDED.cost_cents
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.tuple())
            .map(rowSet -> (long) rowSet.rowCount());
    }

    public Uni<List<UsageSummary>> getMonthlyUsage(UUID orgId) {
        String sql = """
            SELECT org_id, metric, month, qty, cost_cents
            FROM usage_aggregates_monthly
            WHERE org_id = $1
            ORDER BY month DESC, metric
            LIMIT 100
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                List<UsageSummary> summaries = new ArrayList<>();
                for (Row row : rowSet) {
                    summaries.add(new UsageSummary(
                        row.getUUID("org_id"),
                        row.getString("metric"),
                        row.getLocalDate("month"),
                        row.getLong("qty"),
                        row.getInteger("cost_cents")
                    ));
                }
                return summaries;
            });
    }
}
