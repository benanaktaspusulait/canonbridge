-- TASK-023: API Keys table (org-scoped, hashed)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key_hash VARCHAR(128) NOT NULL UNIQUE,
    key_prefix VARCHAR(12) NOT NULL,
    name VARCHAR(100) NOT NULL,
    scopes JSONB NOT NULL DEFAULT '["read","write"]'::jsonb,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- TASK-028: Org billing settings (overage opt-in, caps)
CREATE TABLE IF NOT EXISTS org_billing_settings (
    org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    overage_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    overage_cap_cents INT NOT NULL DEFAULT 0,
    overage_notification_threshold_percent INT NOT NULL DEFAULT 80,
    pause_plan_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TASK-021: Discount codes
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
    value INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    max_uses INT NOT NULL DEFAULT 0,
    current_uses INT NOT NULL DEFAULT 0,
    applicable_plans JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT discounts_type_check CHECK (discount_type IN ('percentage', 'fixed_amount', 'trial_extension'))
);

COMMENT ON TABLE api_keys IS 'Organization-scoped API keys. Key is shown once at creation, stored as SHA-256 hash.';
COMMENT ON TABLE org_billing_settings IS 'Per-org billing preferences: overage opt-in, caps, pause settings.';
COMMENT ON TABLE discounts IS 'Coupon/discount codes for checkout. Supports percentage, fixed amount, and trial extensions.';
