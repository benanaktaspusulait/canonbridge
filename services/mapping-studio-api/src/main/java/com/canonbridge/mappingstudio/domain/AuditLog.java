package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public class AuditLog {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("action")
    private AuditAction action;

    @JsonProperty("resource_type")
    private String resourceType;

    @JsonProperty("resource_id")
    private String resourceId;

    @JsonProperty("details")
    private String details;

    @JsonProperty("outcome")
    private AuditOutcome outcome;

    @JsonProperty("ip_address")
    private String ipAddress;

    @JsonProperty("correlation_id")
    private String correlationId;

    @JsonProperty("created_at")
    private Instant createdAt;

    public AuditLog() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public AuditAction getAction() { return action; }
    public void setAction(AuditAction action) { this.action = action; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public AuditOutcome getOutcome() { return outcome; }
    public void setOutcome(AuditOutcome outcome) { this.outcome = outcome; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public enum AuditAction {
        MAPPING_CREATED,
        MAPPING_UPDATED,
        MAPPING_DELETED,
        MAPPING_PUBLISHED,
        MAPPING_VALIDATED,
        DLQ_REDRIVE,
        DLQ_DISCARD,
        PARTNER_CREATED,
        PARTNER_UPDATED,
        PARTNER_DELETED,
        CREDENTIAL_CREATED,
        CREDENTIAL_UPDATED,
        CREDENTIAL_DELETED,
        WEBHOOK_CREATED,
        WEBHOOK_DELETED,
        WEBHOOK_STATUS_CHANGED,
        EXTERNAL_SYSTEM_CREATED,
        EXTERNAL_SYSTEM_UPDATED,
        EXTERNAL_SYSTEM_DELETED,
        LOGIN,
        LOGOUT
    }

    public enum AuditOutcome {
        SUCCESS,
        FAILURE,
        PARTIAL
    }
}
