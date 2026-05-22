package com.canonbridge.mappingstudio.billing;

import java.util.Map;

/**
 * TASK-024: Plan-based rate limiting configuration.
 * Defines requests-per-second limits for each plan tier.
 */
public final class PlanRateLimitConfig {

    private PlanRateLimitConfig() {}

    private static final Map<String, Integer> PLAN_RATE_LIMITS = Map.of(
        "free", 10,
        "starter", 50,
        "growth", 200,
        "scale", 1000,
        "enterprise", 5000
    );

    /**
     * Get the rate limit (requests per second) for a plan code.
     * Returns 10 (free tier) as default for unknown plans.
     */
    public static int getRateLimit(String planCode) {
        return PLAN_RATE_LIMITS.getOrDefault(planCode, 10);
    }

    /**
     * Get the rate limit window in seconds.
     */
    public static int getWindowSeconds() {
        return 1;
    }
}
