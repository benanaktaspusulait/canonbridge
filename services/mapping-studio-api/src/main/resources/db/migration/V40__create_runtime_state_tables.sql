CREATE TABLE IF NOT EXISTS etl_batch_jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    draft_id UUID NOT NULL,
    status VARCHAR(40) NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED')),
    total_rows INTEGER NOT NULL DEFAULT 0,
    succeeded_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    result_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by VARCHAR(120) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT fk_batch_jobs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_batch_jobs_draft FOREIGN KEY (tenant_id, draft_id) REFERENCES mapping_drafts(tenant_id, id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_tenant_created ON etl_batch_jobs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_draft_created ON etl_batch_jobs(tenant_id, draft_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON etl_batch_jobs(tenant_id, status);

CREATE TABLE IF NOT EXISTS etl_scheduled_api_runs (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    draft_id UUID NOT NULL,
    status VARCHAR(40) NOT NULL CHECK (status IN ('IDLE', 'RUNNING', 'SUCCESS', 'FAILED')),
    last_started_at TIMESTAMPTZ,
    last_completed_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    duration_ms INTEGER,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    last_result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_scheduled_api_runs_tenant_draft UNIQUE (tenant_id, draft_id),
    CONSTRAINT fk_scheduled_runs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_scheduled_runs_draft FOREIGN KEY (tenant_id, draft_id) REFERENCES mapping_drafts(tenant_id, id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scheduled_runs_next ON etl_scheduled_api_runs(tenant_id, next_run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_runs_status ON etl_scheduled_api_runs(tenant_id, status);

CREATE TABLE IF NOT EXISTS outbox_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    event_key VARCHAR(300) NOT NULL,
    partner_id VARCHAR(120),
    event_type VARCHAR(120),
    payload JSONB NOT NULL,
    status VARCHAR(40) NOT NULL CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_outbox_events_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_status_created ON outbox_events(status, created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_events_tenant_status ON outbox_events(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_outbox_events_key ON outbox_events(event_key);
