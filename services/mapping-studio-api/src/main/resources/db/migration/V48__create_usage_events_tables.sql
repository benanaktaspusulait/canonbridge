-- TASK-004: Usage events and aggregation tables for metering.

CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service VARCHAR(50) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_id VARCHAR(255) NOT NULL UNIQUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_usage_events_org_id ON usage_events(org_id);
CREATE INDEX idx_usage_events_org_metric_ts ON usage_events(org_id, metric, ts);
CREATE INDEX idx_usage_events_ts ON usage_events(ts);
CREATE INDEX idx_usage_events_service ON usage_events(service);

-- Daily aggregates (materialized from usage_events)
CREATE TABLE IF NOT EXISTS usage_aggregates_daily (
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric VARCHAR(100) NOT NULL,
    day DATE NOT NULL,
    qty BIGINT NOT NULL DEFAULT 0,
    cost_cents INT NOT NULL DEFAULT 0,
    PRIMARY KEY (org_id, metric, day)
);

CREATE INDEX idx_usage_aggregates_daily_day ON usage_aggregates_daily(day);

-- Monthly aggregates (rolled up from daily)
CREATE TABLE IF NOT EXISTS usage_aggregates_monthly (
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric VARCHAR(100) NOT NULL,
    month DATE NOT NULL,
    qty BIGINT NOT NULL DEFAULT 0,
    cost_cents INT NOT NULL DEFAULT 0,
    PRIMARY KEY (org_id, metric, month)
);

-- Entitlements cache (source of truth for current quota state)
CREATE TABLE IF NOT EXISTS entitlements_cache (
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    limit_value BIGINT NOT NULL DEFAULT 0,
    used_value BIGINT NOT NULL DEFAULT 0,
    remaining BIGINT GENERATED ALWAYS AS (
        CASE WHEN limit_value = -1 THEN 9999999
             ELSE GREATEST(limit_value - used_value, 0)
        END
    ) STORED,
    resets_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (org_id, feature_key)
);

CREATE INDEX idx_entitlements_cache_resets_at ON entitlements_cache(resets_at);

COMMENT ON TABLE usage_events IS 'Raw usage events from all services. Idempotent via request_id unique constraint.';
COMMENT ON TABLE usage_aggregates_daily IS 'Daily rollup of usage per org per metric. Used for billing and dashboards.';
COMMENT ON TABLE usage_aggregates_monthly IS 'Monthly rollup for invoice generation.';
COMMENT ON TABLE entitlements_cache IS 'Current quota state per org. Synced to Redis for fast lookups.';
COMMENT ON COLUMN entitlements_cache.limit_value IS '-1 means unlimited (enterprise).';
COMMENT ON COLUMN entitlements_cache.remaining IS 'Computed column: limit - used (capped at 0). Unlimited shows as 9999999.';
