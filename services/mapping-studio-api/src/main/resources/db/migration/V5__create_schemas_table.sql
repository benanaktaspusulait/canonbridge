CREATE TABLE IF NOT EXISTS schemas (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    schema_type VARCHAR(50) NOT NULL,
    subject VARCHAR(180) NOT NULL,
    version INTEGER NOT NULL,
    schema_json JSONB NOT NULL,
    compatibility_mode VARCHAR(50) NOT NULL DEFAULT 'BACKWARD',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT uk_schemas_tenant_subject_version UNIQUE (tenant_id, subject, version)
);

CREATE INDEX idx_schemas_tenant_id ON schemas(tenant_id);
CREATE INDEX idx_schemas_type ON schemas(tenant_id, schema_type);
CREATE INDEX idx_schemas_subject ON schemas(tenant_id, subject);
CREATE INDEX idx_schemas_status ON schemas(tenant_id, status);
CREATE INDEX idx_schemas_version ON schemas(tenant_id, subject, version DESC);

COMMENT ON TABLE schemas IS 'JSON schemas used by Mapping Studio for source and canonical validation';
COMMENT ON COLUMN schemas.schema_type IS 'SOURCE, CANONICAL, OUTPUT, EXTERNAL_API_RESPONSE';
COMMENT ON COLUMN schemas.compatibility_mode IS 'NONE, BACKWARD, FORWARD, FULL';
COMMENT ON COLUMN schemas.status IS 'DRAFT, ACTIVE, DEPRECATED, ARCHIVED';
