-- TASK-003: Subscriptions table — links organizations to plans.

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(40) NOT NULL DEFAULT 'active',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    trial_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    external_provider VARCHAR(50),
    external_ref VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'paused', 'incomplete')),
    CONSTRAINT subscriptions_billing_cycle_check CHECK (billing_cycle IN ('monthly', 'yearly')),
    CONSTRAINT subscriptions_one_active_per_org UNIQUE (org_id) -- one active subscription per org
);

CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_external_ref ON subscriptions(external_ref);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Subscription history for audit trail
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    previous_plan_id UUID REFERENCES plans(id),
    new_plan_id UUID REFERENCES plans(id),
    previous_status VARCHAR(40),
    new_status VARCHAR(40),
    change_reason VARCHAR(255),
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_history_subscription_id ON subscription_history(subscription_id);
CREATE INDEX idx_subscription_history_org_id ON subscription_history(org_id);
CREATE INDEX idx_subscription_history_created_at ON subscription_history(created_at);

-- Trigger to auto-update subscriptions.updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

COMMENT ON TABLE subscriptions IS 'Active subscription linking an organization to a plan. One active subscription per org.';
COMMENT ON TABLE subscription_history IS 'Audit trail of all subscription changes (plan upgrades, downgrades, cancellations).';
