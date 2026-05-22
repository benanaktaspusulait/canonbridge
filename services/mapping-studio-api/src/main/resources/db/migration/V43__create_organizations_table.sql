-- TASK-001: Organizations table for SaaS multi-tenancy billing model.
-- An organization is the billing unit; a tenant is the deployment/isolation unit.
-- In SaaS mode, each organization maps to its own tenant.

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    billing_email VARCHAR(255),
    country VARCHAR(3),
    vat_id VARCHAR(50),
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT organizations_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'))
);

CREATE INDEX idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX idx_organizations_owner_user_id ON organizations(owner_user_id);
CREATE INDEX idx_organizations_status ON organizations(status);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_organizations_updated_at();

COMMENT ON TABLE organizations IS 'Billing and team unit. Each org belongs to a tenant and holds subscriptions, usage, and members.';
COMMENT ON COLUMN organizations.tenant_id IS 'Links to the deployment/isolation tenant.';
COMMENT ON COLUMN organizations.slug IS 'URL-safe unique identifier for the organization.';
