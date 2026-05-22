package com.canonbridge.billing.service;

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
import java.util.*;

@ApplicationScoped
public class InvoiceService {

    @Inject
    PgPool client;

    /**
     * Monthly invoice generation — runs on the 1st of each month at 05:00 UTC.
     */
    @Scheduled(cron = "0 0 5 1 * ?", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    public void scheduledInvoiceGeneration() {
        generateMonthlyInvoices()
            .subscribe().with(
                count -> Log.infof("Monthly invoice generation completed: %d invoices", count),
                error -> Log.errorf(error, "Monthly invoice generation failed")
            );
    }

    /**
     * V5-L2 FIX: Purge paddle_processed_events older than 90 days.
     * Runs daily at 06:00 UTC.
     */
    @Scheduled(cron = "0 0 6 * * ?", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    public void purgeOldProcessedEvents() {
        String sql = "DELETE FROM paddle_processed_events WHERE processed_at < NOW() - INTERVAL '90 days'";
        client.preparedQuery(sql).execute(Tuple.tuple())
            .subscribe().with(
                result -> { if (result.rowCount() > 0) Log.infof("Purged %d old paddle_processed_events", result.rowCount()); },
                error -> Log.errorf(error, "Failed to purge paddle_processed_events")
            );
    }

    public Uni<Long> generateMonthlyInvoices() {
        LocalDate lastMonth = LocalDate.now(ZoneOffset.UTC).minusMonths(1).withDayOfMonth(1);
        LocalDate periodEnd = lastMonth.plusMonths(1).minusDays(1);

        String sql = """
            INSERT INTO invoices (id, org_id, period_start, period_end, subtotal_cents, tax_cents, total_cents, status)
            SELECT
                gen_random_uuid(),
                s.org_id,
                $1::date,
                $2::date,
                COALESCE(p.price_monthly_cents, 0),
                0,
                COALESCE(p.price_monthly_cents, 0),
                CASE WHEN p.price_monthly_cents = 0 THEN 'paid' ELSE 'open' END
            FROM subscriptions s
            JOIN plans p ON p.id = s.plan_id
            WHERE s.status IN ('active', 'past_due')
              AND NOT EXISTS (
                SELECT 1 FROM invoices i
                WHERE i.org_id = s.org_id AND i.period_start = $1::date
              )
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(lastMonth, periodEnd))
            .flatMap(rowSet -> {
                long count = rowSet.rowCount();
                if (count > 0) {
                    return generateLineItems(lastMonth, periodEnd).map(v -> count);
                }
                return Uni.createFrom().item(count);
            });
    }

    private Uni<Void> generateLineItems(LocalDate periodStart, LocalDate periodEnd) {
        // Base plan line item
        String baseSql = """
            INSERT INTO invoice_line_items (id, invoice_id, description, metric, qty, unit_price_cents, amount_cents, line_type)
            SELECT
                gen_random_uuid(),
                i.id,
                p.name || ' plan (' || s.billing_cycle || ')',
                'base_plan',
                1,
                p.price_monthly_cents,
                p.price_monthly_cents,
                'base'
            FROM invoices i
            JOIN subscriptions s ON s.org_id = i.org_id
            JOIN plans p ON p.id = s.plan_id
            WHERE i.period_start = $1::date
              AND NOT EXISTS (
                SELECT 1 FROM invoice_line_items li WHERE li.invoice_id = i.id AND li.line_type = 'base'
              )
            """;

        // Overage line items
        String overageSql = """
            INSERT INTO invoice_line_items (id, invoice_id, description, metric, qty, unit_price_cents, amount_cents, line_type)
            SELECT
                gen_random_uuid(),
                i.id,
                'Overage: ' || uam.metric,
                uam.metric,
                GREATEST(uam.qty - COALESCE(pf.limit_value, 0), 0),
                0,
                0,
                'overage'
            FROM invoices i
            JOIN usage_aggregates_monthly uam ON uam.org_id = i.org_id AND uam.month = $1::date
            JOIN subscriptions s ON s.org_id = i.org_id
            LEFT JOIN plan_features pf ON pf.plan_id = s.plan_id AND pf.feature_key = uam.metric
            WHERE i.period_start = $1::date
              AND uam.qty > COALESCE(pf.limit_value, 0)
              AND pf.limit_value > 0
            """;

        return client.preparedQuery(baseSql)
            .execute(Tuple.of(periodStart))
            .flatMap(r -> client.preparedQuery(overageSql).execute(Tuple.of(periodStart)))
            .replaceWithVoid();
    }

    public Uni<List<Map<String, Object>>> listByOrgId(UUID orgId) {
        String sql = """
            SELECT id, org_id, period_start, period_end, subtotal_cents, tax_cents,
                   total_cents, currency, status, pdf_url, created_at, paid_at
            FROM invoices
            WHERE org_id = $1
            ORDER BY period_start DESC
            LIMIT 24
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                List<Map<String, Object>> invoices = new ArrayList<>();
                for (Row row : rowSet) {
                    Map<String, Object> inv = new LinkedHashMap<>();
                    inv.put("id", row.getUUID("id").toString());
                    inv.put("org_id", row.getUUID("org_id").toString());
                    inv.put("period_start", row.getLocalDate("period_start").toString());
                    inv.put("period_end", row.getLocalDate("period_end").toString());
                    inv.put("subtotal_cents", row.getInteger("subtotal_cents"));
                    inv.put("tax_cents", row.getInteger("tax_cents"));
                    inv.put("total_cents", row.getInteger("total_cents"));
                    inv.put("currency", row.getString("currency"));
                    inv.put("status", row.getString("status"));
                    inv.put("pdf_url", row.getString("pdf_url"));
                    inv.put("created_at", row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC).toString());
                    inv.put("paid_at", row.getLocalDateTime("paid_at") != null ? row.getLocalDateTime("paid_at").toInstant(ZoneOffset.UTC).toString() : null);
                    invoices.add(inv);
                }
                return invoices;
            });
    }

    public Uni<Map<String, Object>> getById(UUID invoiceId) {
        String sql = """
            SELECT i.id, i.org_id, i.period_start, i.period_end, i.subtotal_cents, i.tax_cents,
                   i.total_cents, i.currency, i.status, i.pdf_url, i.created_at, i.paid_at
            FROM invoices i WHERE i.id = $1
            """;

        String linesSql = """
            SELECT id, description, metric, qty, unit_price_cents, amount_cents, line_type
            FROM invoice_line_items WHERE invoice_id = $1 ORDER BY line_type, metric
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(invoiceId))
            .flatMap(rowSet -> {
                if (rowSet.size() == 0) return Uni.createFrom().item(Map.<String, Object>of());
                Row row = rowSet.iterator().next();
                Map<String, Object> inv = new LinkedHashMap<>();
                inv.put("id", row.getUUID("id").toString());
                inv.put("org_id", row.getUUID("org_id").toString());
                inv.put("period_start", row.getLocalDate("period_start").toString());
                inv.put("period_end", row.getLocalDate("period_end").toString());
                inv.put("subtotal_cents", row.getInteger("subtotal_cents"));
                inv.put("tax_cents", row.getInteger("tax_cents"));
                inv.put("total_cents", row.getInteger("total_cents"));
                inv.put("currency", row.getString("currency"));
                inv.put("status", row.getString("status"));
                inv.put("pdf_url", row.getString("pdf_url"));

                return client.preparedQuery(linesSql)
                    .execute(Tuple.of(invoiceId))
                    .map(linesSet -> {
                        List<Map<String, Object>> lines = new ArrayList<>();
                        for (Row lr : linesSet) {
                            lines.add(Map.of(
                                "id", lr.getUUID("id").toString(),
                                "description", lr.getString("description"),
                                "metric", lr.getString("metric") != null ? lr.getString("metric") : "",
                                "qty", lr.getLong("qty"),
                                "unit_price_cents", lr.getInteger("unit_price_cents"),
                                "amount_cents", lr.getInteger("amount_cents"),
                                "line_type", lr.getString("line_type")
                            ));
                        }
                        inv.put("line_items", lines);
                        return inv;
                    });
            });
    }

    public Uni<Boolean> markPaid(UUID invoiceId, String providerRef) {
        String sql = "UPDATE invoices SET status = 'paid', paid_at = NOW(), provider_ref = $2 WHERE id = $1";
        return client.preparedQuery(sql)
            .execute(Tuple.of(invoiceId, providerRef))
            .map(r -> r.rowCount() > 0);
    }

    /**
     * NEW-Y3 FIX: Update invoice tax from Paddle transaction data.
     * Called when transaction.completed webhook arrives with tax details.
     */
    public Uni<Boolean> updateTaxFromPaddle(UUID orgId, int taxCents, String currency) {
        String sql = """
            UPDATE invoices
            SET tax_cents = $2, total_cents = subtotal_cents + $2, currency = COALESCE($3, currency)
            WHERE org_id = $1 AND status = 'open'
              AND period_start = date_trunc('month', CURRENT_DATE)::date
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, taxCents, currency))
            .map(r -> r.rowCount() > 0);
    }
}
