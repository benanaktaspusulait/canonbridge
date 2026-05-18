-- Promote tenant-acme to a first-class tenant and make the database enforce the
-- single-tenant deployment model.

CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(100) PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tenants_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'))
);

-- This product deployment is single tenant. The table still gives every row a
-- real parent, while this index prevents accidental second-tenant creation.
CREATE UNIQUE INDEX IF NOT EXISTS uk_tenants_singleton ON tenants ((TRUE));

INSERT INTO tenants (id, slug, name, status, metadata, created_at, updated_at)
VALUES (
    'tenant-acme',
    'acme',
    'Acme Demo Tenant',
    'ACTIVE',
    '{"deploymentModel": "single-tenant"}'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    metadata = tenants.metadata || EXCLUDED.metadata,
    updated_at = NOW();

UPDATE audit_logs SET tenant_id = 'tenant-acme' WHERE tenant_id IS NULL OR tenant_id <> 'tenant-acme';
UPDATE audit_mapping_events SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE etl_credentials SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE etl_outbound_connections SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE etl_sample_payloads SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE mapping_drafts SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE mapping_versions SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE partners SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE proxy_execution_logs SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE schemas SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE users SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';
UPDATE webhook_endpoints SET tenant_id = 'tenant-acme' WHERE tenant_id <> 'tenant-acme';

ALTER TABLE audit_logs ALTER COLUMN tenant_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_partners_tenant_id_id ON partners (tenant_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_mapping_drafts_tenant_id_id ON mapping_drafts (tenant_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_etl_credentials_tenant_credential_id ON etl_credentials (tenant_id, credential_id);

ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_logs_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE audit_mapping_events
    ADD CONSTRAINT fk_audit_mapping_events_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE etl_credentials
    ADD CONSTRAINT fk_etl_credentials_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE etl_outbound_connections
    ADD CONSTRAINT fk_etl_outbound_connections_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE etl_sample_payloads
    ADD CONSTRAINT fk_etl_sample_payloads_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE mapping_drafts
    ADD CONSTRAINT fk_mapping_drafts_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE mapping_versions
    ADD CONSTRAINT fk_mapping_versions_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE partners
    ADD CONSTRAINT fk_partners_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE proxy_execution_logs
    ADD CONSTRAINT fk_proxy_execution_logs_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE schemas
    ADD CONSTRAINT fk_schemas_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE users
    ADD CONSTRAINT fk_users_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE webhook_endpoints
    ADD CONSTRAINT fk_webhook_endpoints_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE mapping_drafts
    ADD CONSTRAINT fk_mapping_drafts_tenant_partner
    FOREIGN KEY (tenant_id, partner_id) REFERENCES partners(tenant_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE mapping_versions
    ADD CONSTRAINT fk_mapping_versions_tenant_draft
    FOREIGN KEY (tenant_id, draft_id) REFERENCES mapping_drafts(tenant_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE mapping_versions
    ADD CONSTRAINT fk_mapping_versions_tenant_partner
    FOREIGN KEY (tenant_id, partner_id) REFERENCES partners(tenant_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE etl_sample_payloads
    ADD CONSTRAINT fk_etl_sample_payloads_tenant_draft
    FOREIGN KEY (tenant_id, draft_id) REFERENCES mapping_drafts(tenant_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE etl_outbound_connections
    ADD CONSTRAINT fk_etl_outbound_connections_tenant_draft
    FOREIGN KEY (tenant_id, draft_id) REFERENCES mapping_drafts(tenant_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE etl_outbound_connections
    ADD CONSTRAINT fk_etl_outbound_connections_tenant_credential
    FOREIGN KEY (tenant_id, credential_id) REFERENCES etl_credentials(tenant_id, credential_id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE proxy_execution_logs
    ADD CONSTRAINT fk_proxy_execution_logs_tenant_mapping
    FOREIGN KEY (tenant_id, mapping_id) REFERENCES mapping_drafts(tenant_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE webhook_endpoints
    ADD CONSTRAINT fk_webhook_endpoints_tenant_partner
    FOREIGN KEY (tenant_id, partner_id) REFERENCES partners(tenant_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

COMMENT ON TABLE tenants IS 'Single tenant registry. The singleton index intentionally allows only one tenant row.';
COMMENT ON COLUMN tenants.id IS 'Canonical tenant identifier used by all tenant_id foreign keys.';
