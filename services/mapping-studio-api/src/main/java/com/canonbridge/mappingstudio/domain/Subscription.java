package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public class Subscription {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("org_id")
    private UUID orgId;

    @JsonProperty("plan_id")
    private UUID planId;

    @JsonProperty("status")
    private SubscriptionStatus status;

    @JsonProperty("billing_cycle")
    private BillingCycle billingCycle;

    @JsonProperty("current_period_start")
    private Instant currentPeriodStart;

    @JsonProperty("current_period_end")
    private Instant currentPeriodEnd;

    @JsonProperty("trial_end")
    private Instant trialEnd;

    @JsonProperty("cancel_at")
    private Instant cancelAt;

    @JsonProperty("canceled_at")
    private Instant canceledAt;

    @JsonProperty("paused_at")
    private Instant pausedAt;

    @JsonProperty("external_provider")
    private String externalProvider;

    @JsonProperty("external_ref")
    private String externalRef;

    @JsonProperty("metadata")
    private String metadata;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    // Joined field
    @JsonProperty("plan_code")
    private String planCode;

    @JsonProperty("plan_name")
    private String planName;

    public Subscription() {
        this.status = SubscriptionStatus.ACTIVE;
        this.billingCycle = BillingCycle.MONTHLY;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOrgId() { return orgId; }
    public void setOrgId(UUID orgId) { this.orgId = orgId; }

    public UUID getPlanId() { return planId; }
    public void setPlanId(UUID planId) { this.planId = planId; }

    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }

    public BillingCycle getBillingCycle() { return billingCycle; }
    public void setBillingCycle(BillingCycle billingCycle) { this.billingCycle = billingCycle; }

    public Instant getCurrentPeriodStart() { return currentPeriodStart; }
    public void setCurrentPeriodStart(Instant currentPeriodStart) { this.currentPeriodStart = currentPeriodStart; }

    public Instant getCurrentPeriodEnd() { return currentPeriodEnd; }
    public void setCurrentPeriodEnd(Instant currentPeriodEnd) { this.currentPeriodEnd = currentPeriodEnd; }

    public Instant getTrialEnd() { return trialEnd; }
    public void setTrialEnd(Instant trialEnd) { this.trialEnd = trialEnd; }

    public Instant getCancelAt() { return cancelAt; }
    public void setCancelAt(Instant cancelAt) { this.cancelAt = cancelAt; }

    public Instant getCanceledAt() { return canceledAt; }
    public void setCanceledAt(Instant canceledAt) { this.canceledAt = canceledAt; }

    public Instant getPausedAt() { return pausedAt; }
    public void setPausedAt(Instant pausedAt) { this.pausedAt = pausedAt; }

    public String getExternalProvider() { return externalProvider; }
    public void setExternalProvider(String externalProvider) { this.externalProvider = externalProvider; }

    public String getExternalRef() { return externalRef; }
    public void setExternalRef(String externalRef) { this.externalRef = externalRef; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public enum SubscriptionStatus {
        ACTIVE,
        TRIALING,
        PAST_DUE,
        CANCELED,
        PAUSED,
        INCOMPLETE;

        public String toDbValue() {
            return name().toLowerCase();
        }

        public static SubscriptionStatus fromDbValue(String value) {
            return valueOf(value.toUpperCase());
        }
    }

    public enum BillingCycle {
        MONTHLY,
        YEARLY;

        public String toDbValue() {
            return name().toLowerCase();
        }

        public static BillingCycle fromDbValue(String value) {
            return valueOf(value.toUpperCase());
        }
    }
}
