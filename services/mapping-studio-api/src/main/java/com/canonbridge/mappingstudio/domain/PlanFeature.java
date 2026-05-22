package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class PlanFeature {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("plan_id")
    private UUID planId;

    @JsonProperty("feature_key")
    private String featureKey;

    @JsonProperty("limit_value")
    private long limitValue;

    @JsonProperty("unit")
    private String unit;

    @JsonProperty("is_soft_limit")
    private boolean softLimit;

    @JsonProperty("description")
    private String description;

    public PlanFeature() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPlanId() { return planId; }
    public void setPlanId(UUID planId) { this.planId = planId; }

    public String getFeatureKey() { return featureKey; }
    public void setFeatureKey(String featureKey) { this.featureKey = featureKey; }

    public long getLimitValue() { return limitValue; }
    public void setLimitValue(long limitValue) { this.limitValue = limitValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public boolean isSoftLimit() { return softLimit; }
    public void setSoftLimit(boolean softLimit) { this.softLimit = softLimit; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    /**
     * Returns true if this feature represents an unlimited quota (-1).
     */
    public boolean isUnlimited() {
        return limitValue == -1;
    }

    /**
     * Returns true if this is a boolean feature (enabled/disabled).
     */
    public boolean isBooleanFeature() {
        return "boolean".equals(unit);
    }
}
