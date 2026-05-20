ALTER TABLE etl_batch_jobs
    ADD COLUMN IF NOT EXISTS input_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS retry_of_job_id UUID;

ALTER TABLE etl_batch_jobs
    DROP CONSTRAINT IF EXISTS fk_batch_jobs_retry_of;

ALTER TABLE etl_batch_jobs
    ADD CONSTRAINT fk_batch_jobs_retry_of
    FOREIGN KEY (retry_of_job_id) REFERENCES etl_batch_jobs(job_id)
    ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_batch_jobs_retry_of ON etl_batch_jobs(tenant_id, retry_of_job_id);

CREATE TABLE IF NOT EXISTS etl_scheduled_api_run_history (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    draft_id UUID NOT NULL,
    status VARCHAR(40) NOT NULL CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    duration_ms INTEGER,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    result_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_scheduled_history_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_scheduled_history_draft FOREIGN KEY (tenant_id, draft_id) REFERENCES mapping_drafts(tenant_id, id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scheduled_history_draft_started
    ON etl_scheduled_api_run_history(tenant_id, draft_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_scheduled_history_status
    ON etl_scheduled_api_run_history(tenant_id, status, started_at DESC);

ALTER TABLE outbox_events
    ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS replayed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_outbox_events_replayable
    ON outbox_events(status, next_attempt_at, created_at)
    WHERE status IN ('PENDING', 'FAILED');
