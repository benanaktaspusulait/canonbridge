-- Mapping Versions table (immutable published versions)
CREATE TABLE IF NOT EXISTS mapping_versions (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    draft_id UUID NOT NULL REFERENCES mapping_drafts(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    event_type VARCHAR(100) NOT NULL,
    version INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_type VARCHAR(50) NOT NULL,
    config_json JSONB NOT NULL,
    jsonata_expression TEXT NOT NULL,
    input_schema JSONB,
    canonical_schema_ref VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
    published_at TIMESTAMP,
    deprecated_at TIMESTAMP,
    publish_notes TEXT,
    checksum VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    CONSTRAINT uk_mapping_versions_partner_event_version UNIQUE (tenant_id, partner_id, event_type, version)
);

CREATE INDEX idx_mapping_versions_tenant_id ON mapping_versions(tenant_id);
CREATE INDEX idx_mapping_versions_draft_id ON mapping_versions(draft_id);
CREATE INDEX idx_mapping_versions_partner_event ON mapping_versions(tenant_id, partner_id, event_type);
CREATE INDEX idx_mapping_versions_status ON mapping_versions(tenant_id, status);
CREATE INDEX idx_mapping_versions_version ON mapping_versions(tenant_id, partner_id, event_type, version DESC);

COMMENT ON TABLE mapping_versions IS 'Immutable published mapping versions';
COMMENT ON COLUMN mapping_versions.version IS 'Monotonically increasing version number per partner/event';
COMMENT ON COLUMN mapping_versions.config_json IS 'Complete runtime configuration snapshot';
COMMENT ON COLUMN mapping_versions.jsonata_expression IS 'Immutable JSONata transformation';
COMMENT ON COLUMN mapping_versions.status IS 'PUBLISHED, DEPRECATED, ARCHIVED';
COMMENT ON COLUMN mapping_versions.checksum IS 'SHA-256 hash of config_json for integrity';
