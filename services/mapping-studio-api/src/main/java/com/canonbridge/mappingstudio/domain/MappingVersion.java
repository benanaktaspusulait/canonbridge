package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public class MappingVersion {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("draft_id")
    private UUID draftId;

    @JsonProperty("partner_id")
    private UUID partnerId;

    @JsonProperty("event_type")
    private String eventType;

    @JsonProperty("version")
    private Integer version;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("source_type")
    private MappingDraft.SourceType sourceType;

    @JsonProperty("config_json")
    private String configJson;

    @JsonProperty("jsonata_expression")
    private String jsonataExpression;

    @JsonProperty("input_schema")
    private String inputSchema;

    @JsonProperty("canonical_schema_ref")
    private String canonicalSchemaRef;

    @JsonProperty("status")
    private VersionStatus status;

    @JsonProperty("published_at")
    private Instant publishedAt;

    @JsonProperty("deprecated_at")
    private Instant deprecatedAt;

    @JsonProperty("publish_notes")
    private String publishNotes;

    @JsonProperty("checksum")
    private String checksum;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("created_by")
    private String createdBy;

    public MappingVersion() {
        this.status = VersionStatus.PUBLISHED;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public UUID getDraftId() { return draftId; }
    public void setDraftId(UUID draftId) { this.draftId = draftId; }

    public UUID getPartnerId() { return partnerId; }
    public void setPartnerId(UUID partnerId) { this.partnerId = partnerId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public MappingDraft.SourceType getSourceType() { return sourceType; }
    public void setSourceType(MappingDraft.SourceType sourceType) { this.sourceType = sourceType; }

    public String getConfigJson() { return configJson; }
    public void setConfigJson(String configJson) { this.configJson = configJson; }

    public String getJsonataExpression() { return jsonataExpression; }
    public void setJsonataExpression(String jsonataExpression) { this.jsonataExpression = jsonataExpression; }

    public String getInputSchema() { return inputSchema; }
    public void setInputSchema(String inputSchema) { this.inputSchema = inputSchema; }

    public String getCanonicalSchemaRef() { return canonicalSchemaRef; }
    public void setCanonicalSchemaRef(String canonicalSchemaRef) { this.canonicalSchemaRef = canonicalSchemaRef; }

    public VersionStatus getStatus() { return status; }
    public void setStatus(VersionStatus status) { this.status = status; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public Instant getDeprecatedAt() { return deprecatedAt; }
    public void setDeprecatedAt(Instant deprecatedAt) { this.deprecatedAt = deprecatedAt; }

    public String getPublishNotes() { return publishNotes; }
    public void setPublishNotes(String publishNotes) { this.publishNotes = publishNotes; }

    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public enum VersionStatus {
        PUBLISHED,
        DEPRECATED,
        ARCHIVED
    }
}
