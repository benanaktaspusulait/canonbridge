package com.canonbridge.billing.service;

import io.quarkus.logging.Log;
import io.quarkus.scheduler.Scheduled;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * TASK-020: Trial mechanism — 14-day Growth trial, no credit card required.
 * Automatically downgrades to Free when trial expires.
 */
@ApplicationScoped
public class TrialService {

    @Inject
    PgPool client;

    @Inject
    LifecycleEmailService emailService;

    /**
     * Start a 14-day Growth trial for an organization.
     * Returns false if org already used a trial.
     */
    public Uni<Boolean> startTrial(UUID orgId) {
        // Check if org already had a trial
        String checkSql = """
            SELECT COUNT(*) AS cnt FROM subscription_history
            WHERE org_id = $1 AND change_reason = 'trial_started'
            """;
        // [BS-M6] NOTE: Add unique partial index to prevent race condition:
        // CREATE UNIQUE INDEX idx_trial_one_per_org ON subscription_history (org_id) WHERE change_reason = 'trial_started';
        // With this index, the INSERT in the chain below will fail with a constraint violation if two concurrent requests race.

        return client.preparedQuery(checkSql)
            .execute(Tuple.of(orgId))
            .flatMap(checkResult -> {
                long count = checkResult.iterator().next().getLong("cnt");
                if (count > 0) {
                    Log.infof("Org %s already used trial", orgId);
                    return Uni.createFrom().item(false);
                }

                // Find Growth plan
                String findPlanSql = "SELECT id FROM plans WHERE code = 'growth'";
                return client.preparedQuery(findPlanSql)
                    .execute(Tuple.tuple())
                    .flatMap(planResult -> {
                        if (planResult.size() == 0) return Uni.createFrom().item(false);
                        UUID growthPlanId = planResult.iterator().next().getUUID("id");

                        LocalDateTime trialEnd = LocalDateTime.now(ZoneOffset.UTC).plusDays(14);

                        String updateSql = """
                            UPDATE subscriptions
                            SET plan_id = $2, status = 'trialing', trial_end = $3,
                                current_period_start = NOW(), current_period_end = $3
                            WHERE org_id = $1
                            """;

                        return client.preparedQuery(updateSql)
                            .execute(Tuple.of(orgId, growthPlanId, trialEnd))
                            .flatMap(r -> {
                                // Record in history
                                String historySql = """
                                    INSERT INTO subscription_history (id, subscription_id, org_id, new_plan_id, new_status, change_reason)
                                    SELECT gen_random_uuid(), s.id, $1, $2, 'trialing', 'trial_started'
                                    FROM subscriptions s WHERE s.org_id = $1
                                    """;
                                return client.preparedQuery(historySql)
                                    .execute(Tuple.of(orgId, growthPlanId));
                            })
                            .map(r -> {
                                emailService.sendTrialStarted(orgId);
                                return true;
                            });
                    });
            });
    }

    /**
     * Scheduled job: expire trials that have ended.
     * Runs every hour, downgrades expired trials to Free.
     */
    @Scheduled(cron = "0 0 * * * ?", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    public void expireTrials() {
        expireExpiredTrials()
            .subscribe().with(
                count -> { if (count > 0) Log.infof("Expired %d trials", count); },
                error -> Log.errorf(error, "Trial expiration failed")
            );
    }

    public Uni<Integer> expireExpiredTrials() {
        String sql = """
            UPDATE subscriptions s
            SET plan_id = (SELECT id FROM plans WHERE code = 'free'),
                status = 'active',
                trial_end = NULL
            WHERE s.status = 'trialing'
              AND s.trial_end <= NOW()
            RETURNING s.org_id
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.tuple())
            .map(rowSet -> {
                int count = rowSet.rowCount();
                for (Row row : rowSet) {
                    emailService.sendTrialExpired(row.getUUID("org_id"));
                }
                return count;
            });
    }

    /**
     * Scheduled job: send trial ending warnings (3 days and 1 day before).
     */
    @Scheduled(cron = "0 0 9 * * ?", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    public void sendTrialWarnings() {
        // 3-day warning
        String sql3 = """
            SELECT org_id FROM subscriptions
            WHERE status = 'trialing' AND trial_end BETWEEN NOW() + INTERVAL '2 days' AND NOW() + INTERVAL '3 days'
            """;
        // 1-day warning
        String sql1 = """
            SELECT org_id FROM subscriptions
            WHERE status = 'trialing' AND trial_end BETWEEN NOW() AND NOW() + INTERVAL '1 day'
            """;

        client.preparedQuery(sql3).execute(Tuple.tuple())
            .subscribe().with(rows -> {
                for (Row row : rows) emailService.sendTrialEndingWarning(row.getUUID("org_id"), 3);
            }, e -> Log.error("Trial 3-day warning failed", e));

        client.preparedQuery(sql1).execute(Tuple.tuple())
            .subscribe().with(rows -> {
                for (Row row : rows) emailService.sendTrialEndingWarning(row.getUUID("org_id"), 1);
            }, e -> Log.error("Trial 1-day warning failed", e));
    }
}
