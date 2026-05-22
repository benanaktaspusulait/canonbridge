package com.canonbridge.mappingstudio.billing;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Result of an entitlement check. Used by EntitlementInterceptor to decide
 * whether to allow, warn, or block a request.
 */
public record EntitlementResult(
    @JsonProperty("decision") Decision decision,
    @JsonProperty("feature_key") String featureKey,
    @JsonProperty("limit") long limit,
    @JsonProperty("used") long used,
    @JsonProperty("remaining") long remaining,
    @JsonProperty("message") String message
) {

    public enum Decision {
        ALLOWED,
        WARNING,
        SOFT_LIMIT_EXCEEDED,
        HARD_LIMIT_EXCEEDED
    }

    public boolean isAllowed() {
        return decision == Decision.ALLOWED || decision == Decision.WARNING || decision == Decision.SOFT_LIMIT_EXCEEDED;
    }

    public boolean isWarning() {
        return decision == Decision.WARNING;
    }

    public boolean isExceeded() {
        return decision == Decision.HARD_LIMIT_EXCEEDED;
    }

    public boolean isSoftExceeded() {
        return decision == Decision.SOFT_LIMIT_EXCEEDED;
    }

    public static EntitlementResult allowed(String featureKey, long limit, long used, long remaining) {
        return new EntitlementResult(Decision.ALLOWED, featureKey, limit, used, remaining, null);
    }

    public static EntitlementResult warning(String featureKey, long limit, long used, long remaining) {
        String msg = String.format("Quota warning: %d%% used for %s (%d/%d)",
            (int) ((double) used / limit * 100), featureKey, used, limit);
        return new EntitlementResult(Decision.WARNING, featureKey, limit, used, remaining, msg);
    }

    public static EntitlementResult softLimitExceeded(String featureKey, long limit, long used, long remaining) {
        String msg = String.format("Quota exceeded for %s (%d/%d) — soft enforce mode, request allowed",
            featureKey, used, limit);
        return new EntitlementResult(Decision.SOFT_LIMIT_EXCEEDED, featureKey, limit, used, remaining, msg);
    }

    public static EntitlementResult hardLimitExceeded(String featureKey, long limit, long used, long remaining) {
        String msg = String.format("Quota exceeded for %s (%d/%d). Upgrade your plan to continue.",
            featureKey, used, limit);
        return new EntitlementResult(Decision.HARD_LIMIT_EXCEEDED, featureKey, limit, used, remaining, msg);
    }
}
