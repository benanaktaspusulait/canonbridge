package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Credential record for storing authentication credentials
 * Secrets are write-only and never returned in API responses
 */
public record Credential(
        @JsonProperty("credential_id") UUID credentialId,
        @JsonProperty("tenant_id") String tenantId,
        @JsonProperty("display_name") String displayName,
        @JsonProperty("auth_type") AuthType authType,
        @JsonProperty("environment") Environment environment,
        @JsonProperty("status") CredentialStatus status,
        @JsonProperty("rotation_due_at") Instant rotationDueAt,
        @JsonProperty("last_used_at") Instant lastUsedAt,
        @JsonProperty("created_by") String createdBy,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_by") String updatedBy,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public enum AuthType {
        API_KEY,
        BASIC_AUTH,
        BEARER_TOKEN,
        OAUTH2_CLIENT_CREDENTIALS
    }

    public enum Environment {
        SANDBOX,
        PRODUCTION
    }

    public enum CredentialStatus {
        ACTIVE,
        INACTIVE,
        EXPIRED,
        ROTATION_REQUIRED
    }
}
