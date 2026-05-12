-- Add rate_limit_per_minute column to partners table for per-tenant rate limit overrides
ALTER TABLE partners ADD COLUMN rate_limit_per_minute INTEGER;

-- Add comment explaining the column
COMMENT ON COLUMN partners.rate_limit_per_minute IS 'Per-tenant rate limit override in requests per minute. NULL means use default rate limit.';

-- Create index for efficient lookups
CREATE INDEX idx_partners_tenant_id_rate_limit ON partners(tenant_id, rate_limit_per_minute) WHERE rate_limit_per_minute IS NOT NULL;
