-- Mapping Drafts table
CREATE TABLE IF NOT EXISTS mapping_drafts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_type VARCHAR(50) NOT NULL,
    source_config JSONB,
    input_schema JSONB,
    canonical_schema_ref VARCHAR(255),
    mapping_rules JSONB,
    generated_jsonata TEXT,
    validation_rules JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    last_validated_at TIMESTAMP,
    validation_result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_mapping_drafts_tenant_id ON mapping_drafts(tenant_id);
CREATE INDEX idx_mapping_drafts_partner_id ON mapping_drafts(partner_id);
CREATE INDEX idx_mapping_drafts_event_type ON mapping_drafts(tenant_id, event_type);
CREATE INDEX idx_mapping_drafts_status ON mapping_drafts(tenant_id, status);
CREATE INDEX idx_mapping_drafts_updated_at ON mapping_drafts(updated_at DESC);

COMMENT ON TABLE mapping_drafts IS 'Work-in-progress mapping configurations before publish';
COMMENT ON COLUMN mapping_drafts.source_type IS 'KAFKA, WEBHOOK, REST_API, SCHEDULED_API, GRAPHQL, SOAP, FILE_BATCH, API_ENRICHMENT, MANUAL';
COMMENT ON COLUMN mapping_drafts.source_config IS 'Source-specific configuration (topic name, webhook URL, etc.)';
COMMENT ON COLUMN mapping_drafts.input_schema IS 'JSON Schema for source validation';
COMMENT ON COLUMN mapping_drafts.canonical_schema_ref IS 'Reference to canonical schema';
COMMENT ON COLUMN mapping_drafts.mapping_rules IS 'Visual mapping rules from UI';
COMMENT ON COLUMN mapping_drafts.generated_jsonata IS 'Generated JSONata transformation expression';
COMMENT ON COLUMN mapping_drafts.status IS 'DRAFT, VALIDATING, VALID, INVALID, READY_TO_PUBLISH';
