package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.Subscription;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@ApplicationScoped
public class SubscriptionRepository {

    @Inject
    PgPool client;

    public Uni<Subscription> findByOrgId(UUID orgId) {
        String sql = """
            SELECT s.id, s.org_id, s.plan_id, s.status, s.billing_cycle,
                   s.current_period_start, s.current_period_end, s.trial_end,
                   s.cancel_at, s.canceled_at, s.paused_at,
                   s.external_provider, s.external_ref, s.metadata,
                   s.created_at, s.updated_at,
                   p.code AS plan_code, p.name AS plan_name
            FROM subscriptions s
            JOIN plans p ON p.id = s.plan_id
            WHERE s.org_id = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapRow(rowSet.iterator().next());
            });
    }

    public Uni<Subscription> create(Subscription sub) {
        String sql = """
            INSERT INTO subscriptions (id, org_id, plan_id, status, billing_cycle,
                                       current_period_start, current_period_end, trial_end,
                                       external_provider, external_ref, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
            RETURNING id, org_id, plan_id, status, billing_cycle,
                      current_period_start, current_period_end, trial_end,
                      cancel_at, canceled_at, paused_at,
                      external_provider, external_ref, metadata, created_at, updated_at
            """;

        UUID id = sub.getId() != null ? sub.getId() : UUID.randomUUID();
        LocalDateTime periodStart = sub.getCurrentPeriodStart() != null
            ? LocalDateTime.ofInstant(sub.getCurrentPeriodStart(), ZoneOffset.UTC)
            : LocalDateTime.now(ZoneOffset.UTC);
        LocalDateTime periodEnd = sub.getCurrentPeriodEnd() != null
            ? LocalDateTime.ofInstant(sub.getCurrentPeriodEnd(), ZoneOffset.UTC)
            : periodStart.plusMonths(1);
        LocalDateTime trialEnd = sub.getTrialEnd() != null
            ? LocalDateTime.ofInstant(sub.getTrialEnd(), ZoneOffset.UTC)
            : null;

        return client.preparedQuery(sql)
            .execute(SqlParams.of(
                id,
                sub.getOrgId(),
                sub.getPlanId(),
                sub.getStatus().toDbValue(),
                sub.getBillingCycle().toDbValue(),
                periodStart,
                periodEnd,
                trialEnd,
                sub.getExternalProvider(),
                sub.getExternalRef(),
                sub.getMetadata() != null ? sub.getMetadata() : "{}"
            ))
            .map(rowSet -> mapRowBasic(rowSet.iterator().next()));
    }

    public Uni<Subscription> updateStatus(UUID orgId, Subscription.SubscriptionStatus newStatus) {
        String sql = """
            UPDATE subscriptions SET status = $2
            WHERE org_id = $1
            RETURNING id, org_id, plan_id, status, billing_cycle,
                      current_period_start, current_period_end, trial_end,
                      cancel_at, canceled_at, paused_at,
                      external_provider, external_ref, metadata, created_at, updated_at
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, newStatus.toDbValue()))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapRowBasic(rowSet.iterator().next());
            });
    }

    public Uni<Subscription> changePlan(UUID orgId, UUID newPlanId) {
        String sql = """
            UPDATE subscriptions SET plan_id = $2, current_period_start = NOW(),
                   current_period_end = NOW() + INTERVAL '1 month'
            WHERE org_id = $1
            RETURNING id, org_id, plan_id, status, billing_cycle,
                      current_period_start, current_period_end, trial_end,
                      cancel_at, canceled_at, paused_at,
                      external_provider, external_ref, metadata, created_at, updated_at
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, newPlanId))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                return mapRowBasic(rowSet.iterator().next());
            });
    }

    private Subscription mapRow(Row row) {
        Subscription sub = mapRowBasic(row);
        try {
            sub.setPlanCode(row.getString("plan_code"));
            sub.setPlanName(row.getString("plan_name"));
        } catch (Exception ignored) {}
        return sub;
    }

    private Subscription mapRowBasic(Row row) {
        Subscription sub = new Subscription();
        sub.setId(row.getUUID("id"));
        sub.setOrgId(row.getUUID("org_id"));
        sub.setPlanId(row.getUUID("plan_id"));
        sub.setStatus(Subscription.SubscriptionStatus.fromDbValue(row.getString("status")));
        sub.setBillingCycle(Subscription.BillingCycle.fromDbValue(row.getString("billing_cycle")));
        sub.setCurrentPeriodStart(row.getLocalDateTime("current_period_start").toInstant(ZoneOffset.UTC));
        sub.setCurrentPeriodEnd(row.getLocalDateTime("current_period_end").toInstant(ZoneOffset.UTC));
        if (row.getLocalDateTime("trial_end") != null) {
            sub.setTrialEnd(row.getLocalDateTime("trial_end").toInstant(ZoneOffset.UTC));
        }
        if (row.getLocalDateTime("cancel_at") != null) {
            sub.setCancelAt(row.getLocalDateTime("cancel_at").toInstant(ZoneOffset.UTC));
        }
        if (row.getLocalDateTime("canceled_at") != null) {
            sub.setCanceledAt(row.getLocalDateTime("canceled_at").toInstant(ZoneOffset.UTC));
        }
        if (row.getLocalDateTime("paused_at") != null) {
            sub.setPausedAt(row.getLocalDateTime("paused_at").toInstant(ZoneOffset.UTC));
        }
        sub.setExternalProvider(row.getString("external_provider"));
        sub.setExternalRef(row.getString("external_ref"));
        // metadata is JSONB — read as Object and convert to String
        Object metadataObj = row.getValue("metadata");
        sub.setMetadata(metadataObj != null ? metadataObj.toString() : "{}");
        sub.setCreatedAt(row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC));
        sub.setUpdatedAt(row.getLocalDateTime("updated_at").toInstant(ZoneOffset.UTC));
        return sub;
    }
}
