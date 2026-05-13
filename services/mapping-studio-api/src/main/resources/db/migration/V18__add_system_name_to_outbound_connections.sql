-- Add columns to support system templates with known endpoints
ALTER TABLE etl_outbound_connections 
ADD COLUMN is_system_template BOOLEAN DEFAULT FALSE,
ADD COLUMN base_url TEXT,
ADD COLUMN known_endpoints JSONB DEFAULT '[]'::jsonb;

-- Create PayFlex Payment System template
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'tenant-acme',
    'PayFlex Payment System',
    'SOURCE_PAYLOAD',
    'REST',
    'POST',
    'http://canonbridge-mock:8080',
    '11111111-2222-3333-4444-555555555551'::uuid,
    'PRODUCTION',
    5000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/api/payments/latest", "method": "GET", "description": "Get Latest Payments"},
        {"path": "/api/payments/query", "method": "POST", "description": "Query Payments"},
        {"path": "/api/payments/{id}", "method": "GET", "description": "Get Payment by ID"},
        {"path": "/webhook/payment", "method": "POST", "description": "Payment Webhook Receiver"}
    ]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (connection_id) DO UPDATE SET
    is_system_template = TRUE,
    base_url = 'http://canonbridge-mock:8080',
    known_endpoints = '[
        {"path": "/api/payments/latest", "method": "GET", "description": "Get Latest Payments"},
        {"path": "/api/payments/query", "method": "POST", "description": "Query Payments"},
        {"path": "/api/payments/{id}", "method": "GET", "description": "Get Payment by ID"},
        {"path": "/webhook/payment", "method": "POST", "description": "Payment Webhook Receiver"}
    ]'::jsonb;

-- Create ShopMax E-Commerce System template
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'tenant-acme',
    'ShopMax E-Commerce System',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'http://canonbridge-mock:8080',
    '11111111-2222-3333-4444-555555555553'::uuid,
    'PRODUCTION',
    10000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/api/orders/recent", "method": "GET", "description": "Get Recent Orders"},
        {"path": "/api/orders/{id}", "method": "GET", "description": "Get Order by ID"},
        {"path": "/api/orders", "method": "POST", "description": "Create Order"},
        {"path": "/api/products", "method": "GET", "description": "List Products"},
        {"path": "/oauth/token", "method": "POST", "description": "OAuth2 Token Endpoint"}
    ]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (connection_id) DO UPDATE SET
    is_system_template = TRUE,
    base_url = 'http://canonbridge-mock:8080',
    known_endpoints = '[
        {"path": "/api/orders/recent", "method": "GET", "description": "Get Recent Orders"},
        {"path": "/api/orders/{id}", "method": "GET", "description": "Get Order by ID"},
        {"path": "/api/orders", "method": "POST", "description": "Create Order"},
        {"path": "/api/products", "method": "GET", "description": "List Products"},
        {"path": "/oauth/token", "method": "POST", "description": "OAuth2 Token Endpoint"}
    ]'::jsonb;

-- Create FastCargo Logistics System template
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'tenant-acme',
    'FastCargo Logistics System',
    'ENRICHMENT',
    'SOAP',
    'POST',
    'http://canonbridge-mock:8080',
    '11111111-2222-3333-4444-555555555552'::uuid,
    'SANDBOX',
    8000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/ws/track", "method": "POST", "description": "Track Shipment (SOAP)"},
        {"path": "/ws/create", "method": "POST", "description": "Create Shipment (SOAP)"},
        {"path": "/wsdl/fastcargo.wsdl", "method": "GET", "description": "WSDL Definition"}
    ]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (connection_id) DO UPDATE SET
    is_system_template = TRUE,
    base_url = 'http://canonbridge-mock:8080',
    known_endpoints = '[
        {"path": "/ws/track", "method": "POST", "description": "Track Shipment (SOAP)"},
        {"path": "/ws/create", "method": "POST", "description": "Create Shipment (SOAP)"},
        {"path": "/wsdl/fastcargo.wsdl", "method": "GET", "description": "WSDL Definition"}
    ]'::jsonb;

-- Delete old non-template connections
DELETE FROM etl_outbound_connections 
WHERE is_system_template = FALSE OR is_system_template IS NULL;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_outbound_connections_is_template ON etl_outbound_connections(is_system_template);

COMMENT ON COLUMN etl_outbound_connections.is_system_template IS 'TRUE if this is a system template (e.g., ShopMax, PayFlex), FALSE if it is a specific endpoint configuration';
COMMENT ON COLUMN etl_outbound_connections.base_url IS 'Base URL for the external system (used when is_system_template = TRUE)';
COMMENT ON COLUMN etl_outbound_connections.known_endpoints IS 'Array of known endpoints for this system template: [{"path": "/api/orders", "method": "GET", "description": "Orders API"}]';


