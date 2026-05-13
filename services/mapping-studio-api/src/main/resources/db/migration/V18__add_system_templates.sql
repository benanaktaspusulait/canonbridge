-- Add columns to support system templates with known endpoints
ALTER TABLE etl_outbound_connections 
ADD COLUMN IF NOT EXISTS is_system_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS base_url TEXT,
ADD COLUMN IF NOT EXISTS known_endpoints JSONB DEFAULT '[]'::jsonb;

-- Delete all existing connections to start fresh
DELETE FROM etl_outbound_connections;

-- ============================================================================
-- SYSTEM TEMPLATES - Mock External Systems
-- ============================================================================

-- 1. PayFlex Payment Gateway (REST API)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'tenant-acme',
    'PayFlex Payment Gateway',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'http://canonbridge-mock:8080/api/payments/latest',
    '11111111-2222-3333-4444-555555555551'::uuid,
    'PRODUCTION',
    5000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/api/payments/latest", "method": "GET", "description": "Get Latest Payment"},
        {"path": "/api/payments/query", "method": "POST", "description": "Query Payments by Date Range"},
        {"path": "/api/payments/{id}", "method": "GET", "description": "Get Payment by ID"},
        {"path": "/api/payments/latest?format=flat", "method": "GET", "description": "Get Latest Payment (Flat Format)"},
        {"path": "/webhook/payment", "method": "POST", "description": "Payment Webhook Receiver"}
    ]'::jsonb,
    NOW(),
    NOW()
);

-- 2. ShopMax E-Commerce Platform (REST API with OAuth2)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'tenant-acme',
    'ShopMax E-Commerce Platform',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'http://canonbridge-mock:8080/api/orders/recent',
    '11111111-2222-3333-4444-555555555553'::uuid,
    'PRODUCTION',
    10000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/oauth/token", "method": "POST", "description": "OAuth2 Token Endpoint"},
        {"path": "/api/orders/recent", "method": "GET", "description": "Get Recent Orders"},
        {"path": "/api/orders/{id}", "method": "GET", "description": "Get Order by ID"},
        {"path": "/api/orders", "method": "POST", "description": "Create New Order"},
        {"path": "/api/orders/recent?format=compact", "method": "GET", "description": "Get Recent Orders (Compact Format)"},
        {"path": "/api/orders/products", "method": "GET", "description": "List Products"}
    ]'::jsonb,
    NOW(),
    NOW()
);

-- 3. FastCargo Logistics (SOAP API)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'tenant-acme',
    'FastCargo Logistics',
    'ENRICHMENT',
    'SOAP',
    'POST',
    'http://canonbridge-mock:8080/ws/track',
    '11111111-2222-3333-4444-555555555552'::uuid,
    'SANDBOX',
    8000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/ws/track", "method": "POST", "description": "Track Shipment Status"},
        {"path": "/ws/create", "method": "POST", "description": "Create New Shipment"},
        {"path": "/ws/fastcargo.wsdl", "method": "GET", "description": "WSDL Definition"}
    ]'::jsonb,
    NOW(),
    NOW()
);

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_outbound_connections_is_template ON etl_outbound_connections(is_system_template);
CREATE INDEX IF NOT EXISTS idx_outbound_connections_protocol ON etl_outbound_connections(protocol);
CREATE INDEX IF NOT EXISTS idx_outbound_connections_tenant_template ON etl_outbound_connections(tenant_id, is_system_template);

COMMENT ON COLUMN etl_outbound_connections.is_system_template IS 'TRUE if this is a system template (e.g., ShopMax, PayFlex), FALSE if it is a specific endpoint configuration';
COMMENT ON COLUMN etl_outbound_connections.base_url IS 'Base URL for the external system (used when is_system_template = TRUE)';
COMMENT ON COLUMN etl_outbound_connections.known_endpoints IS 'Array of known endpoints for this system template: [{"path": "/api/orders", "method": "GET", "description": "Orders API"}]';

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_outbound_connections_is_template ON etl_outbound_connections(is_system_template);
CREATE INDEX IF NOT EXISTS idx_outbound_connections_protocol ON etl_outbound_connections(protocol);
CREATE INDEX IF NOT EXISTS idx_outbound_connections_tenant_template ON etl_outbound_connections(tenant_id, is_system_template);

COMMENT ON COLUMN etl_outbound_connections.is_system_template IS 'TRUE if this is a system template (e.g., ShopMax, PayFlex), FALSE if it is a specific endpoint configuration';
COMMENT ON COLUMN etl_outbound_connections.base_url IS 'Base URL for the external system (used when is_system_template = TRUE)';
COMMENT ON COLUMN etl_outbound_connections.known_endpoints IS 'Array of known endpoints for this system template: [{"path": "/api/orders", "method": "GET", "description": "Orders API"}]';
