package com.canonbridge.outbound.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public class OutboundConnection {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("connection_type")
    private ConnectionType connectionType;

    @JsonProperty("base_url")
    private String baseUrl;

    @JsonProperty("auth_type")
    private AuthType authType;

    @JsonProperty("credential_id")
    private UUID credentialId;

    @JsonProperty("timeout_ms")
    private Integer timeoutMs;

    @JsonProperty("retry_policy")
    private String retryPolicy;

    @JsonProperty("circuit_breaker_config")
    private String circuitBreakerConfig;

    @JsonProperty("headers")
    private String headers;

    @JsonProperty("status")
    private ConnectionStatus status;

    @JsonProperty("last_tested_at")
    private Instant lastTestedAt;

    @JsonProperty("last_test_result")
    private String lastTestResult;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    @JsonProperty("created_by")
    private String createdBy;

    @JsonProperty("updated_by")
    private String updatedBy;

    public OutboundConnection() {
        this.status = ConnectionStatus.ACTIVE;
        this.timeoutMs = 30000;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ConnectionType getConnectionType() { return connectionType; }
    public void setConnectionType(ConnectionType connectionType) { this.connectionType = connectionType; }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public AuthType getAuthType() { return authType; }
    public void setAuthType(AuthType authType) { this.authType = authType; }

    public UUID getCredentialId() { return credentialId; }
    public void setCredentialId(UUID credentialId) { this.credentialId = credentialId; }

    public Integer getTimeoutMs() { return timeoutMs; }
    public void setTimeoutMs(Integer timeoutMs) { this.timeoutMs = timeoutMs; }

    public String getRetryPolicy() { return retryPolicy; }
    public void setRetryPolicy(String retryPolicy) { this.retryPolicy = retryPolicy; }

    public String getCircuitBreakerConfig() { return circuitBreakerConfig; }
    public void setCircuitBreakerConfig(String circuitBreakerConfig) { this.circuitBreakerConfig = circuitBreakerConfig; }

    public String getHeaders() { return headers; }
    public void setHeaders(String headers) { this.headers = headers; }

    public ConnectionStatus getStatus() { return status; }
    public void setStatus(ConnectionStatus status) { this.status = status; }

    public Instant getLastTestedAt() { return lastTestedAt; }
    public void setLastTestedAt(Instant lastTestedAt) { this.lastTestedAt = lastTestedAt; }

    public String getLastTestResult() { return lastTestResult; }
    public void setLastTestResult(String lastTestResult) { this.lastTestResult = lastTestResult; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public enum ConnectionType {
        REST,
        SOAP,
        GRAPHQL
    }

    public enum AuthType {
        NONE,
        BASIC,
        BEARER,
        API_KEY,
        OAUTH2_CLIENT_CREDENTIALS
    }

    public enum ConnectionStatus {
        ACTIVE,
        INACTIVE,
        TESTING,
        FAILED
    }
}
