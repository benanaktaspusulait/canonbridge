package com.canonbridge.mappingstudio.billing;

import io.quarkus.logging.Log;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.hash.HashCommands;
import io.quarkus.redis.datasource.keys.KeyCommands;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.*;

/**
 * Entitlement service for quota checking and usage tracking.
 * Uses Redis as a fast cache with Postgres as the source of truth.
 *
 * Redis key pattern: entitlement:{orgId}:{featureKey}
 * Redis hash fields: limit, used, remaining, resets_at
 */
@ApplicationScoped
public class EntitlementService {

    private static final String KEY_PREFIX = "entitlement:";
    private static final String FIELD_LIMIT = "limit";
    private static final String FIELD_USED = "used";
    private static final String FIELD_REMAINING = "remaining";
    private static final String FIELD_RESETS_AT = "resets_at";

    @Inject
    RedisDataSource redisDataSource;

    @Inject
    PgPool pgPool;

    @ConfigProperty(name = "canonbridge.entitlement.redis-ttl-seconds", defaultValue = "60")
    int redisTtlSeconds;

    @ConfigProperty(name = "canonbridge.entitlement.soft-enforce", defaultValue = "true")
    boolean softEnforce;

    private HashCommands<String, String, String> hashCommands;
    private KeyCommands<String> keyCommands;

    void initRedis() {
        if (hashCommands == null) {
            hashCommands = redisDataSource.hash(String.class, String.class, String.class);
            keyCommands = redisDataSource.key();
        }
    }

    /**
     * Check if the organization has remaining quota for the given feature.
     *
     * @param orgId      Organization UUID
     * @param featureKey Feature key (e.g., "mapping_runs", "transform_requests")
     * @param qty        Quantity to consume
     * @return EntitlementResult with the decision
     */
    public Uni<EntitlementResult> checkQuota(UUID orgId, String featureKey, int qty) {
        return Uni.createFrom().item(() -> checkQuotaSync(orgId, featureKey, qty));
    }

    /**
     * Increment usage for the given feature. Called after a successful operation.
     *
     * @param orgId      Organization UUID
     * @param featureKey Feature key
     * @param qty        Quantity consumed
     */
    public Uni<Void> incrementUsage(UUID orgId, String featureKey, int qty) {
        return Uni.createFrom().item(() -> {
            incrementUsageSync(orgId, featureKey, qty);
            return null;
        }).replaceWithVoid();
    }

    /**
     * Get usage summary for all metered features of an organization.
     */
    public Uni<List<EntitlementStatus>> getUsageSummary(UUID orgId) {
        String sql = """
            SELECT feature_key, limit_value, used_value, remaining, resets_at
            FROM entitlements_cache
            WHERE org_id = $1
            ORDER BY feature_key
            """;

        return pgPool.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                List<EntitlementStatus> statuses = new ArrayList<>();
                for (Row row : rowSet) {
                    statuses.add(new EntitlementStatus(
                        row.getString("feature_key"),
                        row.getLong("limit_value"),
                        row.getLong("used_value"),
                        row.getLong("remaining"),
                        row.getLocalDateTime("resets_at").toInstant(ZoneOffset.UTC)
                    ));
                }
                return statuses;
            });
    }

    /**
     * Reset all usage counters for an organization (called at period start).
     */
    public Uni<Void> resetQuotas(UUID orgId) {
        String sql = """
            UPDATE entitlements_cache
            SET used_value = 0, resets_at = $2, updated_at = NOW()
            WHERE org_id = $1
            """;

        Instant nextReset = Instant.now().atZone(ZoneOffset.UTC)
            .plusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
            .toInstant();

        return pgPool.preparedQuery(sql)
            .execute(Tuple.of(orgId, java.time.LocalDateTime.ofInstant(nextReset, ZoneOffset.UTC)))
            .flatMap(ignored -> {
                // Invalidate Redis cache
                invalidateCache(orgId);
                return Uni.createFrom().voidItem();
            });
    }

    /**
     * Refresh entitlements cache when plan changes.
     */
    public Uni<Void> refreshEntitlements(UUID orgId, UUID planId) {
        String sql = """
            INSERT INTO entitlements_cache (org_id, feature_key, limit_value, used_value, resets_at)
            SELECT $1, pf.feature_key, pf.limit_value, 0,
                   date_trunc('month', NOW()) + INTERVAL '1 month'
            FROM plan_features pf
            WHERE pf.plan_id = $2 AND pf.unit = 'per_month'
            ON CONFLICT (org_id, feature_key) DO UPDATE SET
                limit_value = EXCLUDED.limit_value,
                updated_at = NOW()
            """;

        return pgPool.preparedQuery(sql)
            .execute(Tuple.of(orgId, planId))
            .flatMap(ignored -> {
                invalidateCache(orgId);
                return Uni.createFrom().voidItem();
            });
    }

    // --- Internal sync methods ---

    private EntitlementResult checkQuotaSync(UUID orgId, String featureKey, int qty) {
        initRedis();
        String key = KEY_PREFIX + orgId + ":" + featureKey;

        try {
            Map<String, String> cached = hashCommands.hgetall(key);

            long limit;
            long used;
            long remaining;

            if (cached == null || cached.isEmpty()) {
                // Cache miss — load from Postgres
                EntitlementStatus status = loadFromPostgres(orgId, featureKey);
                if (status == null) {
                    // No entitlement record — allow (feature not metered for this org)
                    return EntitlementResult.allowed(featureKey, -1, 0, -1);
                }
                limit = status.limit();
                used = status.used();
                remaining = status.remaining();

                // Populate cache
                writeToCache(key, limit, used, status.resetsAt());
            } else {
                limit = Long.parseLong(cached.getOrDefault(FIELD_LIMIT, "-1"));
                used = Long.parseLong(cached.getOrDefault(FIELD_USED, "0"));
                remaining = Long.parseLong(cached.getOrDefault(FIELD_REMAINING, "9999999"));
            }

            // Unlimited check
            if (limit == -1) {
                return EntitlementResult.allowed(featureKey, limit, used, -1);
            }

            // Soft limit warning at 80%
            double usagePercent = (double) used / limit * 100;
            if (remaining < qty) {
                if (softEnforce) {
                    // Soft enforce: warn but allow
                    Log.warnf("Soft-enforce: org %s exceeded quota for %s (used=%d, limit=%d)",
                        orgId, featureKey, used, limit);
                    return EntitlementResult.softLimitExceeded(featureKey, limit, used, remaining);
                }
                return EntitlementResult.hardLimitExceeded(featureKey, limit, used, remaining);
            }

            if (usagePercent >= 80) {
                return EntitlementResult.warning(featureKey, limit, used, remaining);
            }

            return EntitlementResult.allowed(featureKey, limit, used, remaining);

        } catch (Exception e) {
            Log.errorf(e, "Error checking entitlement for org %s feature %s, allowing (graceful degradation)",
                orgId, featureKey);
            // Graceful degradation: allow on Redis/DB failure
            return EntitlementResult.allowed(featureKey, -1, 0, -1);
        }
    }

    private void incrementUsageSync(UUID orgId, String featureKey, int qty) {
        initRedis();
        String key = KEY_PREFIX + orgId + ":" + featureKey;

        try {
            // Increment in Redis
            Map<String, String> cached = hashCommands.hgetall(key);
            if (cached != null && !cached.isEmpty()) {
                long used = Long.parseLong(cached.getOrDefault(FIELD_USED, "0")) + qty;
                long limit = Long.parseLong(cached.getOrDefault(FIELD_LIMIT, "-1"));
                long remaining = limit == -1 ? 9999999 : Math.max(limit - used, 0);

                hashCommands.hset(key, FIELD_USED, String.valueOf(used));
                hashCommands.hset(key, FIELD_REMAINING, String.valueOf(remaining));
            }

            // Async update to Postgres (fire-and-forget for performance)
            String sql = """
                UPDATE entitlements_cache
                SET used_value = used_value + $3, updated_at = NOW()
                WHERE org_id = $1 AND feature_key = $2
                """;

            pgPool.preparedQuery(sql)
                .execute(Tuple.of(orgId, featureKey, qty))
                .subscribe().with(
                    success -> {},
                    error -> Log.errorf(error, "Failed to persist usage increment for org %s feature %s", orgId, featureKey)
                );

        } catch (Exception e) {
            Log.errorf(e, "Error incrementing usage for org %s feature %s", orgId, featureKey);
        }
    }

    private EntitlementStatus loadFromPostgres(UUID orgId, String featureKey) {
        try {
            String sql = """
                SELECT feature_key, limit_value, used_value, remaining, resets_at
                FROM entitlements_cache
                WHERE org_id = $1 AND feature_key = $2
                """;

            var rowSet = pgPool.preparedQuery(sql)
                .executeAndAwait(Tuple.of(orgId, featureKey));

            if (rowSet.size() == 0) return null;

            Row row = rowSet.iterator().next();
            return new EntitlementStatus(
                row.getString("feature_key"),
                row.getLong("limit_value"),
                row.getLong("used_value"),
                row.getLong("remaining"),
                row.getLocalDateTime("resets_at").toInstant(ZoneOffset.UTC)
            );
        } catch (Exception e) {
            Log.errorf(e, "Failed to load entitlement from Postgres for org %s feature %s", orgId, featureKey);
            return null;
        }
    }

    private void writeToCache(String key, long limit, long used, Instant resetsAt) {
        try {
            long remaining = limit == -1 ? 9999999 : Math.max(limit - used, 0);
            Map<String, String> fields = Map.of(
                FIELD_LIMIT, String.valueOf(limit),
                FIELD_USED, String.valueOf(used),
                FIELD_REMAINING, String.valueOf(remaining),
                FIELD_RESETS_AT, resetsAt.toString()
            );
            hashCommands.hset(key, fields);
            keyCommands.expire(key, Duration.ofSeconds(redisTtlSeconds));
        } catch (Exception e) {
            Log.warnf(e, "Failed to write entitlement cache for key %s", key);
        }
    }

    private void invalidateCache(UUID orgId) {
        try {
            initRedis();
            // We can't easily enumerate all keys for an org without SCAN,
            // so we rely on TTL expiry. For immediate invalidation on plan change,
            // we delete known feature keys.
            String[] knownFeatures = {
                "mapping_runs", "transform_requests", "webhook_events",
                "lead_captures", "active_mappings", "webhook_endpoints", "seats"
            };
            for (String feature : knownFeatures) {
                String key = KEY_PREFIX + orgId + ":" + feature;
                keyCommands.del(key);
            }
        } catch (Exception e) {
            Log.warnf(e, "Failed to invalidate entitlement cache for org %s", orgId);
        }
    }
}
