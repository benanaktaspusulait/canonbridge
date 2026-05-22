package com.canonbridge.mappingstudio.billing;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

/**
 * Current entitlement status for a single feature of an organization.
 */
public record EntitlementStatus(
    @JsonProperty("feature_key") String featureKey,
    @JsonProperty("limit") long limit,
    @JsonProperty("used") long used,
    @JsonProperty("remaining") long remaining,
    @JsonProperty("resets_at") Instant resetsAt
) {

    /**
     * Usage percentage (0-100+). Returns 0 for unlimited features.
     */
    public int usagePercent() {
        if (limit <= 0) return 0;
        return (int) ((double) used / limit * 100);
    }

    /**
     * Whether this feature is unlimited (-1).
     */
    public boolean isUnlimited() {
        return limit == -1;
    }
}
