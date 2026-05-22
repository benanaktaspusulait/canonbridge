package com.canonbridge.billing.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.util.UUID;

public record UsageSummary(
    @JsonProperty("org_id") UUID orgId,
    @JsonProperty("metric") String metric,
    @JsonProperty("period") LocalDate period,
    @JsonProperty("qty") long qty,
    @JsonProperty("cost_cents") int costCents
) {}
