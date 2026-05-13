package com.canonbridge.mappingstudio.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public class MappingDraft {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("partner_id")
    private UUID partnerId;

    @JsonProperty("event_type")
    private String eventType;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("source_type")
    private SourceType sourceType;

    @JsonProperty("source_config")
    private String sourceConfig;

    @JsonProperty("input_schema")
    private String inputSchema;

    @JsonProperty("canonical_schema_ref")
    private String canonicalSchemaRef;

    @JsonProperty("mapping_rules")
    private String mappingRules;

    @JsonProperty("generated_jsonata")
    private String generatedJsonata;

    @JsonProperty("validation_rules")
    private String validationRules;

    @JsonProperty("status")
    private DraftStatus status;

    @JsonProperty("last_validated_at")
    private Instant lastValidatedAt;

    @JsonProperty("validation_result")
    private String validationResult;

    @JsonProperty("created_at")
    private Instant createdAt;

    @JsonProperty("updated_at")
    private Instant updatedAt;

    @JsonProperty("created_by")
    private String createdBy;

    @JsonProperty("updated_by")
    private String updatedBy;

    public MappingDraft() {
        this.status = DraftStatus.DRAFT;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public UUID getPartnerId() { return partnerId; }
    public void setPartnerId(UUID partnerId) { this.partnerId = partnerId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SourceType getSourceType() { return sourceType; }
    public void setSourceType(SourceType sourceType) { this.sourceType = sourceType; }

    public String getSourceConfig() { return sourceConfig; }
    public void setSourceConfig(String sourceConfig) { this.sourceConfig = sourceConfig; }

    public String getInputSchema() { return inputSchema; }
    public void setInputSchema(String inputSchema) { this.inputSchema = inputSchema; }

    public String getCanonicalSchemaRef() { return canonicalSchemaRef; }
    public void setCanonicalSchemaRef(String canonicalSchemaRef) { this.canonicalSchemaRef = canonicalSchemaRef; }

    public String getMappingRules() { return mappingRules; }
    public void setMappingRules(String mappingRules) { this.mappingRules = mappingRules; }

    public String getGeneratedJsonata() { return generatedJsonata; }
    public void setGeneratedJsonata(String generatedJsonata) { this.generatedJsonata = generatedJsonata; }

    public String getValidationRules() { return validationRules; }
    public void setValidationRules(String validationRules) { this.validationRules = validationRules; }

    public DraftStatus getStatus() { return status; }
    public void setStatus(DraftStatus status) { this.status = status; }

    public Instant getLastValidatedAt() { return lastValidatedAt; }
    public void setLastValidatedAt(Instant lastValidatedAt) { this.lastValidatedAt = lastValidatedAt; }

    public String getValidationResult() { return validationResult; }
    public void setValidationResult(String validationResult) { this.validationResult = validationResult; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public enum SourceType {
        KAFKA,
        WEBHOOK,
        REST_API,
        SCHEDULED_API,
        SOAP,
        FILE_BATCH,
        API_ENRICHMENT,
        MANUAL
    }

    public enum DraftStatus {
        DRAFT,
        VALIDATING,
        VALID,
        INVALID,
        READY_TO_PUBLISH
    }
}
