package com.canonbridge.billing.service;

import com.canonbridge.billing.domain.SubscriptionRequest;
import com.canonbridge.billing.domain.SubscriptionResponse;
import com.canonbridge.billing.paddle.PaddleClient;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.ZoneOffset;
import java.util.UUID;

@ApplicationScoped
public class SubscriptionService {

    @Inject
    PgPool client;

    @Inject
    PaddleClient paddleClient;

    public Uni<SubscriptionResponse> getByOrgId(UUID orgId) {
        String sql = """
            SELECT s.id, s.org_id, s.status, s.billing_cycle,
                   s.current_period_start, s.current_period_end,
                   s.trial_end, s.cancel_at, s.external_provider, s.external_ref,
                   p.code AS plan_code, p.name AS plan_name
            FROM subscriptions s
            JOIN plans p ON p.id = s.plan_id
            WHERE s.org_id = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                Row row = rowSet.iterator().next();
                return new SubscriptionResponse(
                    row.getUUID("id"),
                    row.getUUID("org_id"),
                    row.getString("plan_code"),
                    row.getString("plan_name"),
                    row.getString("status"),
                    row.getString("billing_cycle"),
                    row.getLocalDateTime("current_period_start").toInstant(ZoneOffset.UTC),
                    row.getLocalDateTime("current_period_end").toInstant(ZoneOffset.UTC),
                    row.getLocalDateTime("trial_end") != null ? row.getLocalDateTime("trial_end").toInstant(ZoneOffset.UTC) : null,
                    row.getLocalDateTime("cancel_at") != null ? row.getLocalDateTime("cancel_at").toInstant(ZoneOffset.UTC) : null,
                    null,
                    null
                );
            });
    }

    public Uni<SubscriptionResponse> createOrUpgrade(SubscriptionRequest request) {
        // 1. Find the target plan
        String findPlanSql = "SELECT id, code, name FROM plans WHERE code = $1";

        return client.preparedQuery(findPlanSql)
            .execute(Tuple.of(request.planCode()))
            .flatMap(planRows -> {
                if (planRows.size() == 0) {
                    return Uni.createFrom().failure(new IllegalArgumentException("Plan not found: " + request.planCode()));
                }
                Row planRow = planRows.iterator().next();
                UUID planId = planRow.getUUID("id");
                String planCode = planRow.getString("code");
                String planName = planRow.getString("name");

                // 2. Check if org already has a subscription
                String checkSql = "SELECT id, plan_id, status FROM subscriptions WHERE org_id = $1";
                return client.preparedQuery(checkSql)
                    .execute(Tuple.of(request.orgId()))
                    .flatMap(subRows -> {
                        if (subRows.size() == 0) {
                            // Create new subscription
                            return createSubscription(request.orgId(), planId, request.billingCycleOrDefault());
                        } else {
                            // Upgrade existing
                            return upgradeSubscription(request.orgId(), planId, request.billingCycleOrDefault());
                        }
                    })
                    .flatMap(sub -> {
                        // If paid plan, create Paddle checkout
                        if (!"free".equals(planCode)) {
                            return paddleClient.createCheckoutUrl(request.orgId(), planCode, request.billingCycleOrDefault(), request.returnUrl())
                                .map(checkoutUrl -> new SubscriptionResponse(
                                    sub.id(), sub.orgId(), planCode, planName,
                                    sub.status(), sub.billingCycle(),
                                    sub.currentPeriodStart(), sub.currentPeriodEnd(),
                                    sub.trialEnd(), sub.cancelAt(),
                                    checkoutUrl, null
                                ));
                        }
                        return Uni.createFrom().item(new SubscriptionResponse(
                            sub.id(), sub.orgId(), planCode, planName,
                            sub.status(), sub.billingCycle(),
                            sub.currentPeriodStart(), sub.currentPeriodEnd(),
                            sub.trialEnd(), sub.cancelAt(),
                            null, null
                        ));
                    });
            });
    }

    public Uni<SubscriptionResponse> cancel(UUID orgId) {
        String sql = """
            UPDATE subscriptions
            SET cancel_at = current_period_end, status = 'active'
            WHERE org_id = $1
            RETURNING id, org_id, status, billing_cycle, current_period_start, current_period_end, trial_end, cancel_at
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                Row row = rowSet.iterator().next();
                return mapBasicResponse(row);
            });
    }

    public Uni<SubscriptionResponse> pause(UUID orgId) {
        String sql = """
            UPDATE subscriptions SET status = 'paused', paused_at = NOW()
            WHERE org_id = $1 AND status = 'active'
            RETURNING id, org_id, status, billing_cycle, current_period_start, current_period_end, trial_end, cancel_at
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                Row row = rowSet.iterator().next();
                return mapBasicResponse(row);
            });
    }

    public Uni<SubscriptionResponse> resume(UUID orgId) {
        String sql = """
            UPDATE subscriptions SET status = 'active', paused_at = NULL
            WHERE org_id = $1 AND status = 'paused'
            RETURNING id, org_id, status, billing_cycle, current_period_start, current_period_end, trial_end, cancel_at
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                if (rowSet.size() == 0) return null;
                Row row = rowSet.iterator().next();
                return mapBasicResponse(row);
            });
    }

    private Uni<SubscriptionResponse> createSubscription(UUID orgId, UUID planId, String billingCycle) {
        String sql = """
            INSERT INTO subscriptions (id, org_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
            VALUES ($1, $2, $3, 'active', $4, NOW(), NOW() + INTERVAL '1 month')
            RETURNING id, org_id, status, billing_cycle, current_period_start, current_period_end, trial_end, cancel_at
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(UUID.randomUUID(), orgId, planId, billingCycle))
            .map(rowSet -> mapBasicResponse(rowSet.iterator().next()));
    }

    private Uni<SubscriptionResponse> upgradeSubscription(UUID orgId, UUID planId, String billingCycle) {
        String sql = """
            UPDATE subscriptions
            SET plan_id = $2, billing_cycle = $3, current_period_start = NOW(),
                current_period_end = NOW() + INTERVAL '1 month', cancel_at = NULL, canceled_at = NULL
            WHERE org_id = $1
            RETURNING id, org_id, status, billing_cycle, current_period_start, current_period_end, trial_end, cancel_at
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId, planId, billingCycle))
            .map(rowSet -> mapBasicResponse(rowSet.iterator().next()));
    }

    private SubscriptionResponse mapBasicResponse(Row row) {
        return new SubscriptionResponse(
            row.getUUID("id"),
            row.getUUID("org_id"),
            null, null,
            row.getString("status"),
            row.getString("billing_cycle"),
            row.getLocalDateTime("current_period_start").toInstant(ZoneOffset.UTC),
            row.getLocalDateTime("current_period_end").toInstant(ZoneOffset.UTC),
            row.getLocalDateTime("trial_end") != null ? row.getLocalDateTime("trial_end").toInstant(ZoneOffset.UTC) : null,
            row.getLocalDateTime("cancel_at") != null ? row.getLocalDateTime("cancel_at").toInstant(ZoneOffset.UTC) : null,
            null, null
        );
    }
}
