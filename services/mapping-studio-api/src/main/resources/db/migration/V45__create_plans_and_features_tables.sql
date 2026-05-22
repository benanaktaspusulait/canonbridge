-- TASK-002: Plans and plan features for SaaS pricing tiers.

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly_cents INT NOT NULL DEFAULT 0,
    price_yearly_cents INT NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    limit_value BIGINT NOT NULL DEFAULT -1,
    unit VARCHAR(50) NOT NULL DEFAULT 'count',
    is_soft_limit BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    CONSTRAINT plan_features_unique UNIQUE (plan_id, feature_key)
);

CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_feature_key ON plan_features(feature_key);

COMMENT ON TABLE plans IS 'SaaS pricing plans. limit_value of -1 means unlimited.';
COMMENT ON COLUMN plan_features.feature_key IS 'e.g. mapping_runs, transform_requests, webhook_events, active_mappings, seats, retention_days';
COMMENT ON COLUMN plan_features.limit_value IS '-1 means unlimited (enterprise/fair-use). 0 means feature disabled.';
COMMENT ON COLUMN plan_features.is_soft_limit IS 'If true, exceeding shows warning but does not block. If false, hard block at limit.';
