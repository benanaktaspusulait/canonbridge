package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public class WebhookEndpoint {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("partner_id")
    private UUID partnerId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("path")
    private String path;

    @JsonProperty("secret_hash")
    private String secretHash;

    @JsonProperty("target_topic")
    private String targetTopic;

    @JsonProperty("status")
    private WebhookStatus status;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    @JsonProperty("created_by")
    private String createdBy;

    @JsonProperty("last_received_at")
    private Instant lastReceivedAt;

    @JsonProperty("total_received")
    private long totalReceived;

    public WebhookEndpoint() {
        this.status = WebhookStatus.ACTIVE;
        this.totalReceived = 0;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public UUID getPartnerId() { return partnerId; }
    public void setPartnerId(UUID partnerId) { this.partnerId = partnerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getSecretHash() { return secretHash; }
    public void setSecretHash(String secretHash) { this.secretHash = secretHash; }

    public String getTargetTopic() { return targetTopic; }
    public void setTargetTopic(String targetTopic) { this.targetTopic = targetTopic; }

    public WebhookStatus getStatus() { return status; }
    public void setStatus(WebhookStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getLastReceivedAt() { return lastReceivedAt; }
    public void setLastReceivedAt(Instant lastReceivedAt) { this.lastReceivedAt = lastReceivedAt; }

    public long getTotalReceived() { return totalReceived; }
    public void setTotalReceived(long totalReceived) { this.totalReceived = totalReceived; }

    public enum WebhookStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED
    }
}
