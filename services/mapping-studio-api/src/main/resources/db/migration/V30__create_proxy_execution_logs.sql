-- Phase 1.1: Proxy execution log table
-- Records every proxy call for audit trail, debugging, and analytics.

CREATE TABLE IF NOT EXISTS proxy_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    mapping_id UUID NOT NULL REFERENCES mapping_drafts(id) ON DELETE CASCADE,
    correlation_id VARCHAR(64) NOT NULL,
    
    -- Timing
    request_at TIMESTAMP NOT NULL DEFAULT NOW(),
    response_at TIMESTAMP,
    duration_ms INTEGER,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SUCCESS, ERROR, TIMEOUT
    http_status_code INTEGER,
    error_stage VARCHAR(50), -- REQUEST_TRANSFORM, API_CALL, RESPONSE_TRANSFORM, VALIDATION
    error_message TEXT,
    
    -- Request details
    external_api_url TEXT,
    external_api_method VARCHAR(10),
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    
    -- Optional payload snapshots (for debugging, auto-deleted after retention)
    request_payload JSONB,
    response_payload JSONB,
    transformed_payload JSONB,
    
    -- Metadata
    source_ip VARCHAR(45),
    user_agent VARCHAR(255)
);

CREATE INDEX idx_proxy_logs_tenant_mapping ON proxy_execution_logs(tenant_id, mapping_id, request_at DESC);
CREATE INDEX idx_proxy_logs_correlation ON proxy_execution_logs(correlation_id);
CREATE INDEX idx_proxy_logs_status ON proxy_execution_logs(tenant_id, status, request_at DESC);
CREATE INDEX idx_proxy_logs_request_at ON proxy_execution_logs(request_at DESC);

COMMENT ON TABLE proxy_execution_logs IS 'Audit trail for every proxy endpoint execution';
COMMENT ON COLUMN proxy_execution_logs.correlation_id IS 'Unique ID to trace a request across services';
COMMENT ON COLUMN proxy_execution_logs.error_stage IS 'Which stage failed: REQUEST_TRANSFORM, API_CALL, RESPONSE_TRANSFORM, VALIDATION';
