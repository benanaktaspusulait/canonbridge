package com.canonbridge.billing.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public record SubscriptionResponse(
    @JsonProperty("id") UUID id,
    @JsonProperty("org_id") UUID orgId,
    @JsonProperty("plan_code") String planCode,
    @JsonProperty("plan_name") String planName,
    @JsonProperty("status") String status,
    @JsonProperty("billing_cycle") String billingCycle,
    @JsonProperty("current_period_start") Instant currentPeriodStart,
    @JsonProperty("current_period_end") Instant currentPeriodEnd,
    @JsonProperty("trial_end") Instant trialEnd,
    @JsonProperty("cancel_at") Instant cancelAt,
    @JsonProperty("checkout_url") String checkoutUrl,
    @JsonProperty("customer_portal_url") String customerPortalUrl
) {}
