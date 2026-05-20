CREATE TABLE IF NOT EXISTS etl_batch_upload_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    draft_id UUID NOT NULL,
    status VARCHAR(40) NOT NULL CHECK (status IN ('OPEN', 'RECEIVING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED')),
    file_name VARCHAR(500),
    content_type VARCHAR(160),
    expected_chunks INTEGER NOT NULL DEFAULT 0 CHECK (expected_chunks >= 0),
    received_chunks INTEGER NOT NULL DEFAULT 0 CHECK (received_chunks >= 0),
    expected_rows INTEGER NOT NULL DEFAULT 0 CHECK (expected_rows >= 0),
    received_rows INTEGER NOT NULL DEFAULT 0 CHECK (received_rows >= 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    batch_job_id UUID,
    error_message TEXT,
    created_by VARCHAR(120) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT uk_batch_upload_sessions_tenant_session UNIQUE (tenant_id, session_id),
    CONSTRAINT fk_batch_upload_sessions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_batch_upload_sessions_draft FOREIGN KEY (tenant_id, draft_id) REFERENCES mapping_drafts(tenant_id, id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_batch_upload_sessions_job FOREIGN KEY (batch_job_id) REFERENCES etl_batch_jobs(job_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_batch_upload_sessions_draft_created
    ON etl_batch_upload_sessions(tenant_id, draft_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_batch_upload_sessions_status
    ON etl_batch_upload_sessions(tenant_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS etl_batch_upload_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    session_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    row_count INTEGER NOT NULL DEFAULT 0 CHECK (row_count >= 0),
    rows JSONB NOT NULL DEFAULT '[]'::jsonb,
    checksum VARCHAR(128),
    created_by VARCHAR(120) NOT NULL DEFAULT 'system',
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_batch_upload_chunks_session_index UNIQUE (tenant_id, session_id, chunk_index),
    CONSTRAINT fk_batch_upload_chunks_session FOREIGN KEY (tenant_id, session_id)
        REFERENCES etl_batch_upload_sessions(tenant_id, session_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_batch_upload_chunks_session_order
    ON etl_batch_upload_chunks(tenant_id, session_id, chunk_index);
