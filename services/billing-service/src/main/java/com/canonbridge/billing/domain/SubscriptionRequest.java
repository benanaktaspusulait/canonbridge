package com.canonbridge.billing.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubscriptionRequest(
    @JsonProperty("org_id") @NotNull UUID orgId,
    @JsonProperty("plan_code") @NotBlank String planCode,
    @JsonProperty("billing_cycle") String billingCycle,
    @JsonProperty("coupon_code") String couponCode,
    @JsonProperty("return_url") String returnUrl
) {
    public String billingCycleOrDefault() {
        return billingCycle != null ? billingCycle : "monthly";
    }
}
