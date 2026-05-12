CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(255),
    user_id         VARCHAR(255),
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(100),
    resource_id     VARCHAR(255),
    details         TEXT,
    outcome         VARCHAR(50)  NOT NULL DEFAULT 'SUCCESS',
    ip_address      VARCHAR(50),
    correlation_id  VARCHAR(255),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant     ON audit_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource   ON audit_logs (tenant_id, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
