-- Document tenant isolation strategy.
-- All tables with tenant_id already enforce isolation at the application level
-- (every query includes WHERE tenant_id = $1).
--
-- For production, consider enabling PostgreSQL Row Level Security (RLS):
--
-- ALTER TABLE mapping_drafts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation_drafts ON mapping_drafts
--   USING (tenant_id = current_setting('app.current_tenant'));
--
-- This requires setting the session variable before each query:
-- SET app.current_tenant = 'tenant-acme';
--
-- For now, application-level isolation is sufficient.
-- This migration is a documentation placeholder.

COMMENT ON TABLE mapping_drafts IS 'Tenant-isolated: all queries filter by tenant_id';
COMMENT ON TABLE mapping_versions IS 'Tenant-isolated: all queries filter by tenant_id';
COMMENT ON TABLE proxy_execution_logs IS 'Tenant-isolated: all queries filter by tenant_id';
COMMENT ON TABLE partners IS 'Tenant-isolated: all queries filter by tenant_id';
COMMENT ON TABLE schemas IS 'Tenant-isolated: all queries filter by tenant_id';
COMMENT ON TABLE etl_outbound_connections IS 'Tenant-isolated: all queries filter by tenant_id';
