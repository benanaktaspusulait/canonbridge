package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;
import java.time.Instant;
import java.util.UUID;

/**
 * Outbound connection configuration for external APIs
 */
public record OutboundConnection(
        @JsonProperty("connection_id") UUID connectionId,
        @JsonProperty("tenant_id") String tenantId,
        @JsonProperty("draft_id") UUID draftId,
        @JsonProperty("name") String name,
        @JsonProperty("purpose") ConnectionPurpose purpose,
        @JsonProperty("protocol") Protocol protocol,
        @JsonProperty("method") String method,
        @JsonProperty("url") String url,
        @JsonProperty("credential_id") UUID credentialId,
        @JsonProperty("environment") Credential.Environment environment,
        @JsonProperty("schedule") String schedule,
        @JsonProperty("timeout_ms") Integer timeoutMs,
        @JsonProperty("retry_policy") JsonObject retryPolicy,
        @JsonProperty("response_handling") JsonObject responseHandling,
        @JsonProperty("status") ConnectionStatus status,
        @JsonProperty("last_test_at") Instant lastTestAt,
        @JsonProperty("last_test_result") String lastTestResult,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public enum ConnectionPurpose {
        SOURCE_PAYLOAD,
        ENRICHMENT,
        DESTINATION,
        MANUAL_TEST
    }

    public enum Protocol {
        REST,
        SOAP,
        GRAPHQL
    }

    public enum ConnectionStatus {
        NOT_TESTED,
        HEALTHY,
        DEGRADED,
        FAILED,
        DISABLED
    }
}
