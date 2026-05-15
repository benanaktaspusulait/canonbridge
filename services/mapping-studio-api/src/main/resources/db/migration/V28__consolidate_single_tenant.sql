-- Consolidate all data into a single tenant: tenant-acme.
-- This eliminates multi-tenant confusion in the local/demo environment.
-- Strategy: delete duplicates from non-tenant-acme tenants when they would conflict, then move the rest.

-- Delete duplicate partners (keep tenant-acme version when external_id collides)
DELETE FROM partners p1
WHERE p1.tenant_id != 'tenant-acme'
  AND EXISTS (
    SELECT 1 FROM partners p2
    WHERE p2.tenant_id = 'tenant-acme'
      AND p2.external_id = p1.external_id
  );

-- Delete duplicate schemas (keep tenant-acme version when subject+version collides)
DELETE FROM schemas s1
WHERE s1.tenant_id != 'tenant-acme'
  AND EXISTS (
    SELECT 1 FROM schemas s2
    WHERE s2.tenant_id = 'tenant-acme'
      AND s2.subject = s1.subject
      AND s2.version = s1.version
  );

-- Now move everything to tenant-acme
UPDATE audit_logs SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE audit_mapping_events SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE etl_credentials SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE etl_outbound_connections SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE etl_sample_payloads SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE mapping_drafts SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE mapping_versions SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE partners SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE schemas SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE users SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
UPDATE webhook_endpoints SET tenant_id = 'tenant-acme' WHERE tenant_id IS NOT NULL AND tenant_id != 'tenant-acme';
