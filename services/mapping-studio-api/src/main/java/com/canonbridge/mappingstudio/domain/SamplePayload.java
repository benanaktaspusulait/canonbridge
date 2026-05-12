package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;
import java.time.Instant;
import java.util.UUID;

/**
 * Sample payload for testing and validation
 */
public record SamplePayload(
        @JsonProperty("sample_id") UUID sampleId,
        @JsonProperty("tenant_id") String tenantId,
        @JsonProperty("draft_id") UUID draftId,
        @JsonProperty("source_config_id") UUID sourceConfigId,
        @JsonProperty("name") String name,
        @JsonProperty("tag") SampleTag tag,
        @JsonProperty("content_type") String contentType,
        @JsonProperty("payload") JsonObject payload,
        @JsonProperty("payload_sha256") String payloadSha256,
        @JsonProperty("size_bytes") Long sizeBytes,
        @JsonProperty("contains_pii") Boolean containsPii,
        @JsonProperty("created_by") String createdBy,
        @JsonProperty("created_at") Instant createdAt
) {
    public enum SampleTag {
        VALID,
        INVALID,
        EDGE_CASE,
        PRODUCTION_FAILURE,
        EXTERNAL_API_RESPONSE,
        WEBHOOK_CAPTURE,
        KAFKA_SAMPLE
    }
}
