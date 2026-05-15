package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonArray;
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
        @JsonProperty("updated_at") Instant updatedAt,
        @JsonProperty("is_system_template") Boolean isSystemTemplate,
        @JsonProperty("base_url") String baseUrl,
        @JsonProperty("known_endpoints") JsonArray knownEndpoints
) {
    public OutboundConnection(
            UUID connectionId,
            String tenantId,
            UUID draftId,
            String name,
            ConnectionPurpose purpose,
            Protocol protocol,
            String method,
            String url,
            UUID credentialId,
            Credential.Environment environment,
            String schedule,
            Integer timeoutMs,
            JsonObject retryPolicy,
            JsonObject responseHandling,
            ConnectionStatus status,
            Instant lastTestAt,
            String lastTestResult,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(
                connectionId,
                tenantId,
                draftId,
                name,
                purpose,
                protocol,
                method,
                url,
                credentialId,
                environment,
                schedule,
                timeoutMs,
                retryPolicy,
                responseHandling,
                status,
                lastTestAt,
                lastTestResult,
                createdAt,
                updatedAt,
                false,
                null,
                new JsonArray()
        );
    }

    public OutboundConnection withUrl(String newUrl) {
        return new OutboundConnection(
                connectionId, tenantId, draftId, name, purpose, protocol, method,
                newUrl, credentialId, environment, schedule, timeoutMs,
                retryPolicy, responseHandling, status, lastTestAt, lastTestResult,
                createdAt, updatedAt, isSystemTemplate, baseUrl, knownEndpoints
        );
    }

    public enum ConnectionPurpose {
        SOURCE_PAYLOAD,
        ENRICHMENT,
        DESTINATION,
        MANUAL_TEST
    }

    public enum Protocol {
        REST,
        SOAP,
        GRAPHQL,
        GRPC
    }

    public enum ConnectionStatus {
        NOT_TESTED,
        HEALTHY,
        DEGRADED,
        FAILED,
        DISABLED
    }
}
