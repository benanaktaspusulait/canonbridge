package com.canonbridge.mappingstudio.billing;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Usage event published to Kafka usage.events topic.
 * Each event represents a single billable action (mapping run, transform, webhook delivery, etc.)
 */
public record UsageEvent(
    @JsonProperty("id") UUID id,
    @JsonProperty("org_id") UUID orgId,
    @JsonProperty("service") String service,
    @JsonProperty("metric") String metric,
    @JsonProperty("qty") int qty,
    @JsonProperty("ts") Instant ts,
    @JsonProperty("request_id") String requestId,
    @JsonProperty("metadata") Map<String, Object> metadata
) {

    public static UsageEvent create(UUID orgId, String service, String metric, int qty, String requestId) {
        return new UsageEvent(
            UUID.randomUUID(),
            orgId,
            service,
            metric,
            qty,
            Instant.now(),
            requestId,
            Map.of()
        );
    }

    public static UsageEvent create(UUID orgId, String service, String metric, int qty, String requestId, Map<String, Object> metadata) {
        return new UsageEvent(
            UUID.randomUUID(),
            orgId,
            service,
            metric,
            qty,
            Instant.now(),
            requestId,
            metadata
        );
    }
}
