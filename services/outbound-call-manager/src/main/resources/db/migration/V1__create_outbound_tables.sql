-- Outbound Connections table
CREATE TABLE IF NOT EXISTS outbound_connections (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    connection_type VARCHAR(50) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    auth_type VARCHAR(50) NOT NULL,
    credential_id UUID,
    timeout_ms INTEGER NOT NULL DEFAULT 30000,
    retry_policy JSONB,
    circuit_breaker_config JSONB,
    headers JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_tested_at TIMESTAMP,
    last_test_result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_outbound_connections_tenant ON outbound_connections(tenant_id);
CREATE INDEX idx_outbound_connections_status ON outbound_connections(tenant_id, status);

-- Call History table
CREATE TABLE IF NOT EXISTS call_history (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    connection_id UUID REFERENCES outbound_connections(id),
    correlation_id VARCHAR(100),
    method VARCHAR(10) NOT NULL,
    url VARCHAR(500) NOT NULL,
    request_headers JSONB,
    request_body_masked TEXT,
    response_status INTEGER,
    response_headers JSONB,
    response_body_masked TEXT,
    duration_ms BIGINT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_call_history_tenant ON call_history(tenant_id);
CREATE INDEX idx_call_history_connection ON call_history(connection_id);
CREATE INDEX idx_call_history_correlation ON call_history(correlation_id);
CREATE INDEX idx_call_history_created_at ON call_history(created_at DESC);
CREATE INDEX idx_call_history_success ON call_history(tenant_id, success);

COMMENT ON TABLE outbound_connections IS 'External system connection configurations';
COMMENT ON TABLE call_history IS 'Audit log of all outbound API calls with masked payloads';
