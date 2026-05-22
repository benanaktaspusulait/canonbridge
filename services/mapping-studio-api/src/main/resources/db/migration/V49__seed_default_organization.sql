-- TASK-001: Seed default organization for existing tenant-acme data.
-- Removes the singleton constraint to allow multi-tenant SaaS mode.

-- Remove the single-tenant singleton index (allow multiple tenants in SaaS mode)
DROP INDEX IF EXISTS uk_tenants_singleton;

-- Update tenants metadata to reflect SaaS mode
UPDATE tenants
SET metadata = metadata || '{"deploymentModel": "saas"}'::jsonb,
    updated_at = NOW()
WHERE id = 'tenant-acme';

-- Create default organization for existing tenant
INSERT INTO organizations (id, tenant_id, name, slug, billing_email, status, metadata)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'tenant-acme',
    'Acme Corporation',
    'acme',
    'billing@acme.example.com',
    'ACTIVE',
    '{"migrated_from_single_tenant": true}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Link existing users to the default organization as owners/members
INSERT INTO org_members (id, org_id, user_id, role, invited_at, accepted_at)
SELECT
    gen_random_uuid(),
    'a0000000-0000-0000-0000-000000000001'::uuid,
    u.id,
    CASE WHEN u.role = 'admin' THEN 'owner' ELSE 'member' END,
    NOW(),
    NOW()
FROM users u
WHERE u.tenant_id = 'tenant-acme'
ON CONFLICT (org_id, user_id) DO NOTHING;

-- Create a Free plan subscription for the default org
INSERT INTO subscriptions (id, org_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
SELECT
    gen_random_uuid(),
    'a0000000-0000-0000-0000-000000000001'::uuid,
    p.id,
    'active',
    'monthly',
    NOW(),
    NOW() + INTERVAL '1 month'
FROM plans p
WHERE p.code = 'free'
ON CONFLICT (org_id) DO NOTHING;

-- Initialize entitlements cache for the default org
INSERT INTO entitlements_cache (org_id, feature_key, limit_value, used_value, resets_at)
SELECT
    'a0000000-0000-0000-0000-000000000001'::uuid,
    pf.feature_key,
    pf.limit_value,
    0,
    date_trunc('month', NOW()) + INTERVAL '1 month'
FROM plan_features pf
JOIN plans p ON p.id = pf.plan_id
WHERE p.code = 'free'
  AND pf.unit = 'per_month'
ON CONFLICT (org_id, feature_key) DO NOTHING;

COMMENT ON COLUMN organizations.id IS 'Default org UUID is deterministic for migration purposes.';
