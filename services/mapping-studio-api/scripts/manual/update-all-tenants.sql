-- Update all tenant_id fields to 'default-tenant'

UPDATE partners SET tenant_id = 'default-tenant';
UPDATE mapping_drafts SET tenant_id = 'default-tenant';
UPDATE mapping_versions SET tenant_id = 'default-tenant';
UPDATE etl_outbound_connections SET tenant_id = 'default-tenant';
UPDATE etl_sample_payloads SET tenant_id = 'default-tenant';
UPDATE etl_credentials SET tenant_id = 'default-tenant';
UPDATE webhook_endpoints SET tenant_id = 'default-tenant';
UPDATE schemas SET tenant_id = 'default-tenant';
UPDATE users SET tenant_id = 'default-tenant';
UPDATE audit_logs SET tenant_id = 'default-tenant';
UPDATE audit_mapping_events SET tenant_id = 'default-tenant';
UPDATE dlq_messages SET tenant_id = 'default-tenant';

-- Verify
SELECT 'partners' as table_name, COUNT(*) as count FROM partners WHERE tenant_id = 'default-tenant'
UNION ALL
SELECT 'mapping_drafts', COUNT(*) FROM mapping_drafts WHERE tenant_id = 'default-tenant'
UNION ALL
SELECT 'mapping_versions', COUNT(*) FROM mapping_versions WHERE tenant_id = 'default-tenant'
UNION ALL
SELECT 'etl_outbound_connections', COUNT(*) FROM etl_outbound_connections WHERE tenant_id = 'default-tenant'
UNION ALL
SELECT 'etl_sample_payloads', COUNT(*) FROM etl_sample_payloads WHERE tenant_id = 'default-tenant'
UNION ALL
SELECT 'schemas', COUNT(*) FROM schemas WHERE tenant_id = 'default-tenant';
