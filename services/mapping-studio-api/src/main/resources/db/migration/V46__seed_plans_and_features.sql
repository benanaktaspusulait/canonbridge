-- TASK-002: Seed default plans and their feature limits.

-- Plans
INSERT INTO plans (id, code, name, description, price_monthly_cents, price_yearly_cents, currency, is_public, sort_order) VALUES
    (gen_random_uuid(), 'free',       'Free',       'For developers and hobby projects',           0,      0, 'USD', TRUE, 1),
    (gen_random_uuid(), 'starter',    'Starter',    'For small teams getting started',          2900,  27840, 'USD', TRUE, 2),
    (gen_random_uuid(), 'growth',     'Growth',     'For growing businesses',                  14900, 143040, 'USD', TRUE, 3),
    (gen_random_uuid(), 'scale',      'Scale',      'For high-volume production workloads',    59900, 575040, 'USD', TRUE, 4),
    (gen_random_uuid(), 'enterprise', 'Enterprise', 'Custom pricing for large organizations',      0,      0, 'USD', FALSE, 5);

-- Feature limits per plan
-- Format: (plan_code, feature_key, limit_value, unit, is_soft_limit)

-- Free plan features
INSERT INTO plan_features (id, plan_id, feature_key, limit_value, unit, is_soft_limit, description)
SELECT gen_random_uuid(), p.id, f.feature_key, f.limit_value, f.unit, f.is_soft_limit, f.description
FROM plans p
CROSS JOIN (VALUES
    ('mapping_runs',       1000,     'per_month', FALSE, 'Mapping executions per month'),
    ('transform_requests', 5000,     'per_month', FALSE, 'Transform requests per month'),
    ('webhook_events',     10000,    'per_month', FALSE, 'Webhook events delivered per month'),
    ('lead_captures',      500,      'per_month', FALSE, 'Lead form submissions per month'),
    ('active_mappings',    3,        'count',     FALSE, 'Maximum active mapping drafts'),
    ('webhook_endpoints',  2,        'count',     FALSE, 'Maximum webhook endpoints'),
    ('seats',              1,        'count',     FALSE, 'Maximum team members'),
    ('retention_days',     7,        'days',      FALSE, 'Log and event retention'),
    ('environments',       1,        'count',     FALSE, 'Deployment environments'),
    ('sso_enabled',        0,        'boolean',   FALSE, 'SSO/SAML support'),
    ('audit_log_days',     0,        'days',      FALSE, 'Audit log retention'),
    ('custom_rbac',        0,        'boolean',   FALSE, 'Custom RBAC roles')
) AS f(feature_key, limit_value, unit, is_soft_limit, description)
WHERE p.code = 'free';

-- Starter plan features
INSERT INTO plan_features (id, plan_id, feature_key, limit_value, unit, is_soft_limit, description)
SELECT gen_random_uuid(), p.id, f.feature_key, f.limit_value, f.unit, f.is_soft_limit, f.description
FROM plans p
CROSS JOIN (VALUES
    ('mapping_runs',       25000,    'per_month', TRUE,  'Mapping executions per month'),
    ('transform_requests', 100000,   'per_month', TRUE,  'Transform requests per month'),
    ('webhook_events',     200000,   'per_month', TRUE,  'Webhook events delivered per month'),
    ('lead_captures',      10000,    'per_month', TRUE,  'Lead form submissions per month'),
    ('active_mappings',    25,       'count',     FALSE, 'Maximum active mapping drafts'),
    ('webhook_endpoints',  10,       'count',     FALSE, 'Maximum webhook endpoints'),
    ('seats',              3,        'count',     FALSE, 'Maximum team members'),
    ('retention_days',     30,       'days',      FALSE, 'Log and event retention'),
    ('environments',       2,        'count',     FALSE, 'Deployment environments (dev + staging)'),
    ('sso_enabled',        0,        'boolean',   FALSE, 'SSO/SAML support'),
    ('audit_log_days',     7,        'days',      FALSE, 'Audit log retention'),
    ('custom_rbac',        0,        'boolean',   FALSE, 'Custom RBAC roles')
) AS f(feature_key, limit_value, unit, is_soft_limit, description)
WHERE p.code = 'starter';

-- Growth plan features
INSERT INTO plan_features (id, plan_id, feature_key, limit_value, unit, is_soft_limit, description)
SELECT gen_random_uuid(), p.id, f.feature_key, f.limit_value, f.unit, f.is_soft_limit, f.description
FROM plans p
CROSS JOIN (VALUES
    ('mapping_runs',       250000,   'per_month', TRUE,  'Mapping executions per month'),
    ('transform_requests', 1000000,  'per_month', TRUE,  'Transform requests per month'),
    ('webhook_events',     2000000,  'per_month', TRUE,  'Webhook events delivered per month'),
    ('lead_captures',      100000,   'per_month', TRUE,  'Lead form submissions per month'),
    ('active_mappings',    200,      'count',     FALSE, 'Maximum active mapping drafts'),
    ('webhook_endpoints',  50,       'count',     FALSE, 'Maximum webhook endpoints'),
    ('seats',              10,       'count',     FALSE, 'Maximum team members'),
    ('retention_days',     90,       'days',      FALSE, 'Log and event retention'),
    ('environments',       3,        'count',     FALSE, 'Deployment environments (dev + staging + prod)'),
    ('sso_enabled',        1,        'boolean',   FALSE, 'Google Workspace SSO'),
    ('audit_log_days',     30,       'days',      FALSE, 'Audit log retention'),
    ('custom_rbac',        0,        'boolean',   FALSE, 'Custom RBAC roles')
) AS f(feature_key, limit_value, unit, is_soft_limit, description)
WHERE p.code = 'growth';

-- Scale plan features
INSERT INTO plan_features (id, plan_id, feature_key, limit_value, unit, is_soft_limit, description)
SELECT gen_random_uuid(), p.id, f.feature_key, f.limit_value, f.unit, f.is_soft_limit, f.description
FROM plans p
CROSS JOIN (VALUES
    ('mapping_runs',       2000000,  'per_month', TRUE,  'Mapping executions per month'),
    ('transform_requests', 10000000, 'per_month', TRUE,  'Transform requests per month'),
    ('webhook_events',     20000000, 'per_month', TRUE,  'Webhook events delivered per month'),
    ('lead_captures',      1000000,  'per_month', TRUE,  'Lead form submissions per month'),
    ('active_mappings',    2000,     'count',     FALSE, 'Maximum active mapping drafts'),
    ('webhook_endpoints',  500,      'count',     FALSE, 'Maximum webhook endpoints'),
    ('seats',              25,       'count',     FALSE, 'Maximum team members'),
    ('retention_days',     180,      'days',      FALSE, 'Log and event retention'),
    ('environments',       6,        'count',     FALSE, 'Deployment environments'),
    ('sso_enabled',        1,        'boolean',   FALSE, 'SAML/OIDC SSO'),
    ('audit_log_days',     180,      'days',      FALSE, 'Audit log retention'),
    ('custom_rbac',        1,        'boolean',   FALSE, 'Custom RBAC roles')
) AS f(feature_key, limit_value, unit, is_soft_limit, description)
WHERE p.code = 'scale';

-- Enterprise plan features (all unlimited = -1)
INSERT INTO plan_features (id, plan_id, feature_key, limit_value, unit, is_soft_limit, description)
SELECT gen_random_uuid(), p.id, f.feature_key, f.limit_value, f.unit, f.is_soft_limit, f.description
FROM plans p
CROSS JOIN (VALUES
    ('mapping_runs',       -1, 'per_month', TRUE,  'Unlimited (fair-use)'),
    ('transform_requests', -1, 'per_month', TRUE,  'Unlimited (fair-use)'),
    ('webhook_events',     -1, 'per_month', TRUE,  'Unlimited (fair-use)'),
    ('lead_captures',      -1, 'per_month', TRUE,  'Unlimited (fair-use)'),
    ('active_mappings',    -1, 'count',     FALSE, 'Unlimited'),
    ('webhook_endpoints',  -1, 'count',     FALSE, 'Unlimited'),
    ('seats',              -1, 'count',     FALSE, 'Unlimited'),
    ('retention_days',     365, 'days',     FALSE, '365+ days retention'),
    ('environments',       -1, 'count',     FALSE, 'Unlimited environments'),
    ('sso_enabled',        1,  'boolean',   FALSE, 'SAML/OIDC + SCIM'),
    ('audit_log_days',     365, 'days',     FALSE, '365 days + export'),
    ('custom_rbac',        1,  'boolean',   FALSE, 'Custom RBAC + ABAC')
) AS f(feature_key, limit_value, unit, is_soft_limit, description)
WHERE p.code = 'enterprise';
