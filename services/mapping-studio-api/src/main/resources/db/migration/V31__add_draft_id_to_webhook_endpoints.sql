-- Link webhook endpoints to their source mapping draft
ALTER TABLE webhook_endpoints ADD COLUMN IF NOT EXISTS draft_id UUID REFERENCES mapping_drafts(id) ON DELETE SET NULL;
ALTER TABLE webhook_endpoints ADD COLUMN IF NOT EXISTS webhook_key VARCHAR(255);

-- Drop the unique constraint on path (multiple tenants can have same path)
ALTER TABLE webhook_endpoints DROP CONSTRAINT IF EXISTS webhook_endpoints_path_key;
CREATE UNIQUE INDEX IF NOT EXISTS uk_webhook_endpoints_tenant_path ON webhook_endpoints(tenant_id, path);

COMMENT ON COLUMN webhook_endpoints.draft_id IS 'Source mapping draft that created this endpoint';
COMMENT ON COLUMN webhook_endpoints.webhook_key IS 'Plain text key for demo/dev (production uses secret_hash)';
