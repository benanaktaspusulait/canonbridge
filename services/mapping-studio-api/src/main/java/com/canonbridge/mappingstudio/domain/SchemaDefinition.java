package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public record SchemaDefinition(
        @JsonProperty("id") UUID id,
        @JsonProperty("tenant_id") String tenantId,
        @JsonProperty("name") String name,
        @JsonProperty("schema_type") SchemaType schemaType,
        @JsonProperty("subject") String subject,
        @JsonProperty("version") Integer version,
        @JsonProperty("schema_json") String schemaJson,
        @JsonProperty("compatibility_mode") CompatibilityMode compatibilityMode,
        @JsonProperty("status") SchemaStatus status,
        @JsonProperty("description") String description,
        @JsonProperty("created_by") String createdBy,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_by") String updatedBy,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public enum SchemaType {
        SOURCE,
        CANONICAL,
        OUTPUT,
        EXTERNAL_API_RESPONSE
    }

    public enum CompatibilityMode {
        NONE,
        BACKWARD,
        FORWARD,
        FULL
    }

    public enum SchemaStatus {
        DRAFT,
        ACTIVE,
        DEPRECATED,
        ARCHIVED
    }
}
