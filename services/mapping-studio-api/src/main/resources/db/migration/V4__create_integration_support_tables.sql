CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS etl_sample_payloads (
    sample_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    draft_id UUID NOT NULL REFERENCES mapping_drafts(id) ON DELETE CASCADE,
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
CREATE INDEX idx_sample_payloads_tenant ON etl_sample_payloads(tenant_id);
CREATE INDEX idx_sample_payloads_tag ON etl_sample_payloads(tag);

CREATE TABLE IF NOT EXISTS etl_outbound_connections (
    connection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(80) NOT NULL,
    draft_id UUID REFERENCES mapping_drafts(id) ON DELETE CASCADE,
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
