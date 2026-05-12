-- Partners table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    external_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT uk_partners_tenant_external UNIQUE (tenant_id, external_id)
);

CREATE INDEX idx_partners_tenant_id ON partners(tenant_id);
CREATE INDEX idx_partners_status ON partners(tenant_id, status);
CREATE INDEX idx_partners_created_at ON partners(created_at DESC);

COMMENT ON TABLE partners IS 'Partner organizations that send or receive data';
COMMENT ON COLUMN partners.tenant_id IS 'Multi-tenant isolation key';
COMMENT ON COLUMN partners.external_id IS 'Partner identifier from external system';
COMMENT ON COLUMN partners.status IS 'ACTIVE, INACTIVE, SUSPENDED, ARCHIVED';
COMMENT ON COLUMN partners.metadata IS 'Additional partner metadata as JSON';
