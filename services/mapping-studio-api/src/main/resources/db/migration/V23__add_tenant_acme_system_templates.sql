-- ============================================================================
-- V23: Add System Templates for tenant-acme
-- ============================================================================
-- Purpose: Ensure tenant-acme has system templates for the wizard to display
-- Background: Wizard filters external systems by is_system_template = TRUE
--             Previous migrations only created templates for tenant-demo
-- ============================================================================

-- Add PayFlex Payment System template for tenant-acme
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'a1111111-aaaa-1111-1111-111111111111'::uuid,
    'tenant-acme',
    'PayFlex Payment System',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'http://canonbridge-mock:8080/api/payments/latest',
    NULL,
    'PRODUCTION',
    5000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/api/payments/latest", "method": "GET", "description": "Get Latest Payment"},
        {"path": "/api/payments/query", "method": "POST", "description": "Query Payments by Date Range"},
        {"path": "/api/payments/{id}", "method": "GET", "description": "Get Payment by ID"},
        {"path": "/webhook/payment", "method": "POST", "description": "Payment Webhook Receiver"}
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (connection_id) DO UPDATE SET
    is_system_template = EXCLUDED.is_system_template,
    base_url = EXCLUDED.base_url,
    known_endpoints = EXCLUDED.known_endpoints,
    updated_at = NOW();

-- Add ShopMax E-Commerce System template for tenant-acme
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'b2222222-bbbb-2222-2222-222222222222'::uuid,
    'tenant-acme',
    'ShopMax E-Commerce System',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'http://canonbridge-mock:8080/api/orders/recent',
    NULL,
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
        {"path": "/api/orders/products", "method": "GET", "description": "List Products"}
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (connection_id) DO UPDATE SET
    is_system_template = EXCLUDED.is_system_template,
    base_url = EXCLUDED.base_url,
    known_endpoints = EXCLUDED.known_endpoints,
    updated_at = NOW();

-- Add FastCargo Logistics System template for tenant-acme (SOAP)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'c3333333-cccc-3333-3333-333333333333'::uuid,
    'tenant-acme',
    'FastCargo Logistics System',
    'ENRICHMENT',
    'SOAP',
    'POST',
    'http://canonbridge-mock:8080/ws/track',
    NULL,
    'SANDBOX',
    8000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/ws/track", "method": "POST", "description": "Track Shipment"},
        {"path": "/ws/fastcargo.wsdl", "method": "GET", "description": "WSDL Definition"}
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (connection_id) DO UPDATE SET
    is_system_template = EXCLUDED.is_system_template,
    base_url = EXCLUDED.base_url,
    known_endpoints = EXCLUDED.known_endpoints,
    updated_at = NOW();

-- Add ProfileHub GraphQL API template for tenant-acme
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'd4444444-dddd-4444-4444-444444444444'::uuid,
    'tenant-acme',
    'ProfileHub GraphQL API',
    'ENRICHMENT',
    'GRAPHQL',
    'POST',
    'http://canonbridge-mock:8080/graphql',
    NULL,
    'PRODUCTION',
    6000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/graphql", "method": "POST", "description": "GraphQL Endpoint"},
        {"path": "/graphql/schema", "method": "GET", "description": "GraphQL Schema"}
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (connection_id) DO UPDATE SET
    is_system_template = EXCLUDED.is_system_template,
    base_url = EXCLUDED.base_url,
    known_endpoints = EXCLUDED.known_endpoints,
    updated_at = NOW();

-- Add CustomerGateway gRPC Profile Service template for tenant-acme
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'e5555555-eeee-5555-5555-555555555555'::uuid,
    'tenant-acme',
    'CustomerGateway gRPC Profile Service',
    'ENRICHMENT',
    'GRPC',
    'POST',
    'http://canonbridge-mock:8080/grpc/CustomerService/GetProfile',
    NULL,
    'PRODUCTION',
    7000,
    'HEALTHY',
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/grpc/CustomerService/GetProfile", "method": "POST", "description": "Get Customer Profile"},
        {"path": "/grpc/CustomerService/UpdateProfile", "method": "POST", "description": "Update Customer Profile"}
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (connection_id) DO UPDATE SET
    is_system_template = EXCLUDED.is_system_template,
    base_url = EXCLUDED.base_url,
    known_endpoints = EXCLUDED.known_endpoints,
    updated_at = NOW();
