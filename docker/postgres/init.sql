CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS canonbridge;
CREATE SCHEMA IF NOT EXISTS audit;

SET search_path TO canonbridge, public;

CREATE TABLE IF NOT EXISTS mapping_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) NOT NULL,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    visual_config JSONB NOT NULL,
    jsonata_script TEXT,
    jsonata_script_hash VARCHAR(64),
    author VARCHAR(100),
    published_by VARCHAR(100),
    published_at TIMESTAMP,
    git_commit_hash VARCHAR(40),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mapping_status_check CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'))
);

CREATE TABLE IF NOT EXISTS mapping_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mapping_id UUID REFERENCES mapping_definitions(id),
    fixture_name VARCHAR(200),
    sample_input JSONB,
    sample_output JSONB,
    validation_passed BOOLEAN,
    validation_errors JSONB,
    duration_ms INTEGER,
    tested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tested_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS processed_events (
    event_id VARCHAR(200) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    partner_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(200) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mapping_definitions_partner_event
    ON mapping_definitions(partner_id, event_type, schema_version, version);

CREATE INDEX IF NOT EXISTS idx_mapping_test_results_mapping
    ON mapping_test_results(mapping_id, tested_at DESC);

CREATE INDEX IF NOT EXISTS idx_outbox_events_status
    ON outbox_events(status, created_at);

INSERT INTO mapping_definitions (
    partner_id,
    event_type,
    schema_version,
    version,
    status,
    visual_config,
    jsonata_script_hash,
    author
) VALUES (
    'acme-marketplace',
    'OrderCreated',
    'v1',
    'v1',
    'DRAFT',
    '{"source":"partners/acme-marketplace/order-created/config.json"}',
    'fixture-seed',
    'system'
) ON CONFLICT DO NOTHING;
