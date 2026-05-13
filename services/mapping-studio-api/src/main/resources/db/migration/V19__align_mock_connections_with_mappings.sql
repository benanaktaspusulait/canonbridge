-- Align demo connections with the mock service and attach them to mock mapping drafts.
-- V18 introduced system templates, but a few paths were not implemented and the rows lived under tenant-acme.

INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret_json, created_by, created_at, updated_at
) VALUES
    (
        '21111111-2222-3333-4444-555555555551'::uuid,
        'tenant-demo',
        'PayFlex Demo API Key',
        'API_KEY',
        'PRODUCTION',
        'ACTIVE',
        '{"apiKey": "demo-api-key-12345", "headerName": "X-API-Key"}',
        'system',
        NOW(),
        NOW()
    ),
    (
        '21111111-2222-3333-4444-555555555552'::uuid,
        'tenant-demo',
        'FastCargo Demo Basic Auth',
        'BASIC_AUTH',
        'SANDBOX',
        'ACTIVE',
        '{"username": "fastcargo-demo", "password": "fastcargo-secret"}',
        'system',
        NOW(),
        NOW()
    ),
    (
        '21111111-2222-3333-4444-555555555553'::uuid,
        'tenant-demo',
        'ShopMax Demo OAuth2',
        'OAUTH2_CLIENT_CREDENTIALS',
        'PRODUCTION',
        'ACTIVE',
        '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "read:orders write:orders"}',
        'system',
        NOW(),
        NOW()
    ),
    (
        '21111111-2222-3333-4444-555555555554'::uuid,
        'tenant-demo',
        'CanonBridge GraphQL Demo Bearer',
        'BEARER_TOKEN',
        'SANDBOX',
        'ACTIVE',
        '{"token": "mock-graphql-token"}',
        'system',
        NOW(),
        NOW()
    )
ON CONFLICT (credential_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    display_name = EXCLUDED.display_name,
    auth_type = EXCLUDED.auth_type,
    environment = EXCLUDED.environment,
    status = EXCLUDED.status,
    encrypted_secret_json = EXCLUDED.encrypted_secret_json,
    updated_at = NOW();

-- GraphQL demo mapping so every supported connection protocol has a mock-backed mapping.
INSERT INTO partners (id, tenant_id, external_id, name, description, status, rate_limit_per_minute, created_by, updated_by, created_at, updated_at)
VALUES (
    '12121212-1212-1212-1212-121212121212'::uuid,
    'tenant-demo',
    'profilehub',
    'ProfileHub GraphQL',
    'GraphQL customer profile and inventory API',
    'ACTIVE',
    2500,
    'system',
    'system',
    NOW(),
    NOW()
)
ON CONFLICT (tenant_id, external_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO schemas (id, tenant_id, schema_type, name, subject, version, schema_json, description, status, created_by, updated_by, created_at, updated_at)
VALUES (
    '56565656-5656-5656-5656-565656565656'::uuid,
    'tenant-demo',
    'CANONICAL',
    'CustomerProfile',
    'canonical.CustomerProfile',
    1,
    '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["customerId","email"],"properties":{"customerId":{"type":"string"},"name":{"type":"string"},"email":{"type":"string","format":"email"},"tier":{"type":"string"},"marketingOptIn":{"type":"boolean"},"updatedAt":{"type":"string","format":"date-time"}}}'::jsonb,
    'Canonical schema for customer profile data from GraphQL APIs',
    'ACTIVE',
    'system',
    'system',
    NOW(),
    NOW()
)
ON CONFLICT (tenant_id, subject, version) DO UPDATE SET
    schema_json = EXCLUDED.schema_json,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Create the missing draft records that will be referenced by connections
INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
) VALUES 
    (
        '77777777-7777-7777-7777-777777777777'::uuid,
        'tenant-demo',
        '11111111-1111-1111-1111-111111111111'::uuid,
        'payment.received',
        'PayFlex Payment Webhook Mapping',
        'Maps PayFlex webhook payment events to canonical payment format',
        'WEBHOOK',
        '{}'::jsonb,
        '{"type":"object","properties":{"transactionId":{"type":"string"},"amount":{"type":"number"},"currency":{"type":"string"},"status":{"type":"string"}}}'::jsonb,
        NULL,
        '[]'::jsonb,
        '{}',
        '{}'::jsonb,
        'DRAFT',
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '88888888-8888-8888-8888-888888888888'::uuid,
        'tenant-demo',
        '22222222-2222-2222-2222-222222222222'::uuid,
        'shipment.tracking',
        'FastCargo Tracking SOAP Mapping',
        'Maps FastCargo SOAP tracking responses to canonical shipment format',
        'SOAP',
        '{}'::jsonb,
        '{"type":"object","properties":{"trackingNumber":{"type":"string"},"status":{"type":"string"},"location":{"type":"string"}}}'::jsonb,
        NULL,
        '[]'::jsonb,
        '{}',
        '{}'::jsonb,
        'DRAFT',
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '99999999-9999-9999-9999-999999999999'::uuid,
        'tenant-demo',
        '33333333-3333-3333-3333-333333333333'::uuid,
        'order.created',
        'ShopMax Order Mapping',
        'Maps ShopMax order events to canonical order format',
        'KAFKA',
        '{}'::jsonb,
        '{"type":"object","properties":{"orderId":{"type":"string"},"customerId":{"type":"string"},"items":{"type":"array"},"total":{"type":"number"}}}'::jsonb,
        NULL,
        '[]'::jsonb,
        '{}',
        '{}'::jsonb,
        'DRAFT',
        'system',
        'system',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    source_config = EXCLUDED.source_config,
    input_schema = EXCLUDED.input_schema,
    mapping_rules = EXCLUDED.mapping_rules,
    updated_at = NOW();

INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
) VALUES (
    'abababab-abab-abab-abab-abababababab'::uuid,
    'tenant-demo',
    '12121212-1212-1212-1212-121212121212'::uuid,
    'customer.profile',
    'ProfileHub GraphQL Customer Mapping',
    'Maps ProfileHub GraphQL customer responses to canonical customer profile format',
    'API_ENRICHMENT',
    '{"connectionId":"d4444444-4444-4444-4444-444444444444","method":"POST","url":"http://canonbridge-mock:8080/graphql","query":"query Customer($customerId: ID!) { customer(id: $customerId) { id name email tier marketingOptIn updatedAt } }","variables":{"customerId":"CUST-1001"},"sampleJson":"{\"data\":{\"customer\":{\"id\":\"CUST-1001\",\"name\":\"Jane Smith\",\"email\":\"jane.smith@example.com\",\"tier\":\"GOLD\",\"marketingOptIn\":true,\"updatedAt\":\"2026-05-13T10:00:00Z\"}}}"}'::jsonb,
    '{"type":"object","required":["data"],"properties":{"data":{"type":"object","properties":{"customer":{"type":"object","required":["id","email"],"properties":{"id":{"type":"string"},"name":{"type":"string"},"email":{"type":"string"},"tier":{"type":"string"},"marketingOptIn":{"type":"boolean"},"updatedAt":{"type":"string"}}}}}}}'::jsonb,
    '56565656-5656-5656-5656-565656565656',
    '[
        {"field": "customerId", "source": "$.data.customer.id", "transform": "string"},
        {"field": "name", "source": "$.data.customer.name", "transform": "string"},
        {"field": "email", "source": "$.data.customer.email", "transform": "string"},
        {"field": "tier", "source": "$.data.customer.tier", "transform": "string"},
        {"field": "marketingOptIn", "source": "$.data.customer.marketingOptIn", "transform": "boolean"},
        {"field": "updatedAt", "source": "$.data.customer.updatedAt", "transform": "string"}
    ]'::jsonb,
    '{
        "customerId": $.data.customer.id,
        "name": $.data.customer.name,
        "email": $.data.customer.email,
        "tier": $.data.customer.tier,
        "marketingOptIn": $.data.customer.marketingOptIn,
        "updatedAt": $.data.customer.updatedAt
    }',
    '{"required": ["customerId", "email"]}'::jsonb,
    'VALID',
    'system',
    'system',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    source_config = EXCLUDED.source_config,
    input_schema = EXCLUDED.input_schema,
    mapping_rules = EXCLUDED.mapping_rules,
    generated_jsonata = EXCLUDED.generated_jsonata,
    validation_rules = EXCLUDED.validation_rules,
    updated_at = NOW();

DELETE FROM etl_outbound_connections
WHERE tenant_id IN ('tenant-demo', 'tenant-acme')
  AND (
      is_system_template = TRUE
      OR name LIKE 'PayFlex%'
      OR name LIKE 'FastCargo%'
      OR name LIKE 'ShopMax%'
      OR name LIKE 'ProfileHub%'
  );

INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, draft_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES
    (
        'a1111111-1111-1111-1111-111111111111'::uuid,
        'tenant-demo',
        NULL,
        'PayFlex Payment System',
        'SOURCE_PAYLOAD',
        'REST',
        'GET',
        'http://canonbridge-mock:8080/api/payments/latest',
        '21111111-2222-3333-4444-555555555551'::uuid,
        'PRODUCTION',
        5000,
        'HEALTHY',
        NOW() - INTERVAL '2 minutes',
        '{"statusCode": 200, "durationMs": 184, "success": true}',
        '{"maxAttempts": 3, "backoff": "exponential", "retryableStatuses": [429, 503, 504]}'::jsonb,
        '{"successField": "payment", "errorField": "error"}'::jsonb,
        TRUE,
        'http://canonbridge-mock:8080',
        '[
            {"path": "/api/payments/latest", "method": "GET", "description": "Get latest payment"},
            {"path": "/api/payments/query", "method": "POST", "description": "Query payments"},
            {"path": "/api/payments/{id}", "method": "GET", "description": "Get payment by ID"},
            {"path": "/webhook/payment", "method": "POST", "description": "Payment webhook receiver"}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'a1010101-1010-1010-1010-101010101010'::uuid,
        'tenant-demo',
        '77777777-7777-7777-7777-777777777777'::uuid,
        'PayFlex Latest Payment API',
        'SOURCE_PAYLOAD',
        'REST',
        'GET',
        'http://canonbridge-mock:8080/api/payments/latest',
        '21111111-2222-3333-4444-555555555551'::uuid,
        'PRODUCTION',
        5000,
        'HEALTHY',
        NOW() - INTERVAL '2 minutes',
        '{"statusCode": 200, "durationMs": 184, "success": true}',
        '{"maxAttempts": 3, "backoff": "exponential", "retryableStatuses": [429, 503, 504]}'::jsonb,
        '{"successField": "payment", "errorField": "error"}'::jsonb,
        FALSE,
        NULL,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'b2222222-2222-2222-2222-222222222222'::uuid,
        'tenant-demo',
        NULL,
        'ShopMax E-Commerce System',
        'SOURCE_PAYLOAD',
        'REST',
        'GET',
        'http://canonbridge-mock:8080/api/orders/recent',
        '21111111-2222-3333-4444-555555555553'::uuid,
        'PRODUCTION',
        10000,
        'HEALTHY',
        NOW() - INTERVAL '5 minutes',
        '{"statusCode": 200, "durationMs": 320, "success": true}',
        '{"maxAttempts": 3, "backoff": "exponential", "maxBackoffMs": 5000}'::jsonb,
        '{"successField": "orders", "errorField": "error"}'::jsonb,
        TRUE,
        'http://canonbridge-mock:8080',
        '[
            {"path": "/api/orders/recent", "method": "GET", "description": "Get recent orders"},
            {"path": "/api/orders/{id}", "method": "GET", "description": "Get order by ID"},
            {"path": "/api/orders", "method": "POST", "description": "Create order"},
            {"path": "/api/orders/products", "method": "GET", "description": "List products"},
            {"path": "/oauth/token", "method": "POST", "description": "OAuth2 token endpoint"}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'b2020202-2020-2020-2020-202020202020'::uuid,
        'tenant-demo',
        '99999999-9999-9999-9999-999999999999'::uuid,
        'ShopMax Recent Orders API',
        'SOURCE_PAYLOAD',
        'REST',
        'GET',
        'http://canonbridge-mock:8080/api/orders/recent',
        '21111111-2222-3333-4444-555555555553'::uuid,
        'PRODUCTION',
        10000,
        'HEALTHY',
        NOW() - INTERVAL '5 minutes',
        '{"statusCode": 200, "durationMs": 320, "success": true}',
        '{"maxAttempts": 3, "backoff": "exponential", "maxBackoffMs": 5000}'::jsonb,
        '{"successField": "orders", "errorField": "error"}'::jsonb,
        FALSE,
        NULL,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'c3333333-3333-3333-3333-333333333333'::uuid,
        'tenant-demo',
        NULL,
        'FastCargo Logistics System',
        'ENRICHMENT',
        'SOAP',
        'POST',
        'http://canonbridge-mock:8080/ws/track',
        '21111111-2222-3333-4444-555555555552'::uuid,
        'SANDBOX',
        8000,
        'HEALTHY',
        NOW() - INTERVAL '16 minutes',
        '{"statusCode": 200, "durationMs": 1220, "success": true}',
        '{"maxAttempts": 3, "backoff": "exponential", "initialBackoffMs": 500}'::jsonb,
        '{"soapAction": "http://fastcargo.com/tracking/TrackShipment", "namespace": "http://fastcargo.com/tracking"}'::jsonb,
        TRUE,
        'http://canonbridge-mock:8080',
        '[
            {"path": "/ws/track", "method": "POST", "description": "Track shipment SOAP"},
            {"path": "/ws/create", "method": "POST", "description": "Create shipment SOAP"},
            {"path": "/ws/fastcargo.wsdl", "method": "GET", "description": "WSDL definition"}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'c3030303-3030-3030-3030-303030303030'::uuid,
        'tenant-demo',
        '88888888-8888-8888-8888-888888888888'::uuid,
        'FastCargo Tracking SOAP Service',
        'SOURCE_PAYLOAD',
        'SOAP',
        'POST',
        'http://canonbridge-mock:8080/ws/track',
        '21111111-2222-3333-4444-555555555552'::uuid,
        'SANDBOX',
        8000,
        'HEALTHY',
        NOW() - INTERVAL '16 minutes',
        '{"statusCode": 200, "durationMs": 1220, "success": true}',
        '{"maxAttempts": 3, "backoff": "exponential", "initialBackoffMs": 500}'::jsonb,
        '{"soapAction": "http://fastcargo.com/tracking/TrackShipment", "namespace": "http://fastcargo.com/tracking"}'::jsonb,
        FALSE,
        NULL,
        '[]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'd4444444-4444-4444-4444-444444444444'::uuid,
        'tenant-demo',
        'abababab-abab-abab-abab-abababababab'::uuid,
        'ProfileHub GraphQL API',
        'SOURCE_PAYLOAD',
        'GRAPHQL',
        'POST',
        'http://canonbridge-mock:8080/graphql',
        '21111111-2222-3333-4444-555555555554'::uuid,
        'SANDBOX',
        5000,
        'HEALTHY',
        NOW() - INTERVAL '4 minutes',
        '{"statusCode": 200, "durationMs": 95, "success": true}',
        '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 500}'::jsonb,
        '{"dataField": "data", "errorField": "errors"}'::jsonb,
        TRUE,
        'http://canonbridge-mock:8080',
        '[
            {"path": "/graphql", "method": "POST", "description": "Customer and inventory GraphQL endpoint"}
        ]'::jsonb,
        NOW(),
        NOW()
    )
ON CONFLICT (connection_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    draft_id = EXCLUDED.draft_id,
    name = EXCLUDED.name,
    purpose = EXCLUDED.purpose,
    protocol = EXCLUDED.protocol,
    method = EXCLUDED.method,
    url = EXCLUDED.url,
    credential_id = EXCLUDED.credential_id,
    environment = EXCLUDED.environment,
    timeout_ms = EXCLUDED.timeout_ms,
    status = EXCLUDED.status,
    last_test_at = EXCLUDED.last_test_at,
    last_test_result = EXCLUDED.last_test_result,
    retry_policy = EXCLUDED.retry_policy,
    response_handling = EXCLUDED.response_handling,
    is_system_template = EXCLUDED.is_system_template,
    base_url = EXCLUDED.base_url,
    known_endpoints = EXCLUDED.known_endpoints,
    updated_at = NOW();

UPDATE mapping_drafts
SET source_config = source_config || '{"connectionId":"a1010101-1010-1010-1010-101010101010","connectionUrl":"http://canonbridge-mock:8080/api/payments/latest","method":"GET"}'::jsonb,
    updated_at = NOW()
WHERE id = '77777777-7777-7777-7777-777777777777'::uuid;

UPDATE mapping_drafts
SET source_config = source_config || '{"connectionId":"c3030303-3030-3030-3030-303030303030","endpoint":"http://canonbridge-mock:8080/ws/track","wsdlUrl":"http://canonbridge-mock:8080/ws/fastcargo.wsdl","authType":"BASIC_AUTH","soapAction":"http://fastcargo.com/tracking/TrackShipment"}'::jsonb,
    updated_at = NOW()
WHERE id = '88888888-8888-8888-8888-888888888888'::uuid;

UPDATE mapping_drafts
SET source_config = source_config || '{"connectionId":"b2020202-2020-2020-2020-202020202020","connectionUrl":"http://canonbridge-mock:8080/api/orders/recent","method":"GET"}'::jsonb,
    updated_at = NOW()
WHERE id = '99999999-9999-9999-9999-999999999999'::uuid;
