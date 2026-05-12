-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Partners table
CREATE TABLE IF NOT EXISTS etl_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    external_id VARCHAR(120) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(120),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, external_id)
);

CREATE INDEX idx_partners_tenant ON etl_partners(tenant_id);
CREATE INDEX idx_partners_status ON etl_partners(status);

-- Mapping drafts table
CREATE TABLE IF NOT EXISTS etl_mapping_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    partner_id UUID NOT NULL REFERENCES etl_partners(id) ON DELETE CASCADE,
    event_type VARCHAR(120) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    source_type VARCHAR(40) NOT NULL CHECK (source_type IN ('KAFKA', 'WEBHOOK', 'SCHEDULED_API', 'MANUAL')),
    source_config JSONB DEFAULT '{}'::jsonb,
    input_schema JSONB,
    canonical_schema_ref VARCHAR(200),
    mapping_rules JSONB DEFAULT '[]'::jsonb,
    generated_jsonata TEXT,
    validation_rules JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(40) NOT NULL CHECK (status IN ('DRAFT', 'VALIDATING', 'VALID', 'INVALID', 'READY_TO_PUBLISH')),
    last_validated_at TIMESTAMPTZ,
    validation_result JSONB,
    version INTEGER NOT NULL DEFAULT 1,
    created_by VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(120),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mapping_drafts_tenant ON etl_mapping_drafts(tenant_id);
CREATE INDEX idx_mapping_drafts_partner ON etl_mapping_drafts(partner_id);
CREATE INDEX idx_mapping_drafts_status ON etl_mapping_drafts(status);

-- Mapping versions table (immutable published versions)
CREATE TABLE IF NOT EXISTS etl_mapping_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    partner_id UUID NOT NULL REFERENCES etl_partners(id),
    event_type VARCHAR(120) NOT NULL,
    mapping_version VARCHAR(40) NOT NULL,
    canonical_schema_version VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL CHECK (status IN ('ACTIVE', 'DEPRECATED', 'ARCHIVED')),
    source_type VARCHAR(40) NOT NULL,
    source_draft_id UUID REFERENCES etl_mapping_drafts(id),
    artifact_refs JSONB NOT NULL,
    published_by VARCHAR(120) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deprecated_at TIMESTAMPTZ,
    deprecated_by VARCHAR(120),
    UNIQUE (tenant_id, partner_id, event_type, mapping_version)
);

CREATE INDEX idx_mapping_versions_tenant ON etl_mapping_versions(tenant_id);
CREATE INDEX idx_mapping_versions_partner ON etl_mapping_versions(partner_id);
CREATE INDEX idx_mapping_versions_status ON etl_mapping_versions(status);
CREATE INDEX idx_mapping_versions_active ON etl_mapping_versions(tenant_id, partner_id, event_type, status) WHERE status = 'ACTIVE';

-- Credentials table
CREATE TABLE IF NOT EXISTS etl_credentials (
    credential_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    auth_type VARCHAR(40) NOT NULL CHECK (auth_type IN ('API_KEY', 'BASIC_AUTH', 'BEARER_TOKEN', 'OAUTH2_CLIENT_CREDENTIALS')),
    environment VARCHAR(40) NOT NULL CHECK (environment IN ('SANDBOX', 'PRODUCTION')),
    status VARCHAR(40) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'ROTATION_REQUIRED')),
    encrypted_secret_json TEXT NOT NULL,
    rotation_due_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_by VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(120),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credentials_tenant ON etl_credentials(tenant_id);
CREATE INDEX idx_credentials_status ON etl_credentials(status);

-- Sample payloads table
CREATE TABLE IF NOT EXISTS etl_sample_payloads (
    sample_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    draft_id UUID NOT NULL REFERENCES etl_mapping_drafts(id) ON DELETE CASCADE,
    source_config_id UUID,
    name VARCHAR(180) NOT NULL,
    tag VARCHAR(40) NOT NULL CHECK (tag IN ('VALID', 'INVALID', 'EDGE_CASE', 'PRODUCTION_FAILURE', 'EXTERNAL_API_RESPONSE', 'WEBHOOK_CAPTURE', 'KAFKA_SAMPLE')),
    content_type VARCHAR(120) NOT NULL DEFAULT 'application/json',
    payload JSONB NOT NULL,
    payload_sha256 VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    contains_pii BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sample_payloads_draft ON etl_sample_payloads(draft_id);
CREATE INDEX idx_sample_payloads_tag ON etl_sample_payloads(tag);

-- Outbound connections table
CREATE TABLE IF NOT EXISTS etl_outbound_connections (
    connection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    draft_id UUID REFERENCES etl_mapping_drafts(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    purpose VARCHAR(40) NOT NULL CHECK (purpose IN ('SOURCE_PAYLOAD', 'ENRICHMENT', 'DESTINATION', 'MANUAL_TEST')),
    protocol VARCHAR(40) NOT NULL CHECK (protocol IN ('REST', 'SOAP', 'GRAPHQL')),
    method VARCHAR(20),
    url TEXT NOT NULL,
    credential_id UUID REFERENCES etl_credentials(credential_id),
    environment VARCHAR(40) NOT NULL CHECK (environment IN ('SANDBOX', 'PRODUCTION')),
    schedule VARCHAR(100),
    timeout_ms INTEGER DEFAULT 5000,
    retry_policy JSONB DEFAULT '{"maxAttempts": 3, "backoff": "exponential"}'::jsonb,
    response_handling JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(40) NOT NULL CHECK (status IN ('NOT_TESTED', 'HEALTHY', 'DEGRADED', 'FAILED', 'DISABLED')),
    last_test_at TIMESTAMPTZ,
    last_test_result TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbound_connections_tenant ON etl_outbound_connections(tenant_id);
CREATE INDEX idx_outbound_connections_draft ON etl_outbound_connections(draft_id);
CREATE INDEX idx_outbound_connections_status ON etl_outbound_connections(status);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_mapping_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID NOT NULL,
    user_id VARCHAR(120) NOT NULL,
    correlation_id VARCHAR(120),
    action VARCHAR(80) NOT NULL,
    changes JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_tenant ON audit_mapping_events(tenant_id);
CREATE INDEX idx_audit_events_entity ON audit_mapping_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_created ON audit_mapping_events(created_at DESC);
