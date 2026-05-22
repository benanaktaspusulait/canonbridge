-- TASK-001: Organization members — links users to organizations with roles.

CREATE TABLE IF NOT EXISTS org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT org_members_unique UNIQUE (org_id, user_id),
    CONSTRAINT org_members_role_check CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'billing'))
);

CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_id ON org_members(org_id);

COMMENT ON TABLE org_members IS 'Many-to-many relationship between users and organizations with role-based access.';
COMMENT ON COLUMN org_members.role IS 'owner: full control + billing; admin: manage members + settings; member: use features; viewer: read-only; billing: billing only.';
