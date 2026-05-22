package com.canonbridge.billing.paddle;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Maps internal plan codes + billing cycles to Paddle price IDs.
 * Loaded from environment variables or database.
 *
 * Environment variable pattern: PADDLE_PRICE_{PLAN}_{CYCLE}
 * Example: PADDLE_PRICE_STARTER_MONTHLY=pri_01abc123
 */
@ApplicationScoped
public class PaddlePriceMapping {

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    @Inject
    PgPool client;

    /**
     * Get the Paddle price ID for a plan + billing cycle combination.
     */
    public Uni<String> getPriceId(String planCode, String billingCycle) {
        String key = planCode + "_" + billingCycle;

        // Check cache first
        String cached = cache.get(key);
        if (cached != null) {
            return Uni.createFrom().item(cached);
        }

        // Check environment variable
        String envKey = String.format("PADDLE_PRICE_%s_%s", planCode.toUpperCase(), billingCycle.toUpperCase());
        String envValue = System.getenv(envKey);
        if (envValue != null && !envValue.isBlank()) {
            cache.put(key, envValue);
            return Uni.createFrom().item(envValue);
        }

        // Fallback: sandbox placeholder
        String placeholder = String.format("pri_%s_%s", planCode, billingCycle);
        return Uni.createFrom().item(placeholder);
    }

    /**
     * Get all configured price mappings.
     */
    public Map<String, String> getAllMappings() {
        Map<String, String> mappings = new HashMap<>();
        String[] plans = {"starter", "growth", "scale"};
        String[] cycles = {"monthly", "yearly"};

        for (String plan : plans) {
            for (String cycle : cycles) {
                String envKey = String.format("PADDLE_PRICE_%s_%s", plan.toUpperCase(), cycle.toUpperCase());
                String value = System.getenv(envKey);
                if (value != null && !value.isBlank()) {
                    mappings.put(plan + "_" + cycle, value);
                }
            }
        }
        return mappings;
    }
}
