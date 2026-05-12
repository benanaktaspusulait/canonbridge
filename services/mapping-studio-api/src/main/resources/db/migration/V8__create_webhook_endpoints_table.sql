CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(255) NOT NULL,
    partner_id      UUID,
    name            VARCHAR(255) NOT NULL,
    path            VARCHAR(500) NOT NULL UNIQUE,
    secret_hash     VARCHAR(500),
    target_topic    VARCHAR(255) NOT NULL DEFAULT 'partner.webhook.raw',
    status          VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    last_received_at TIMESTAMP,
    total_received  BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_tenant ON webhook_endpoints (tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_path   ON webhook_endpoints (path);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_status ON webhook_endpoints (status);
