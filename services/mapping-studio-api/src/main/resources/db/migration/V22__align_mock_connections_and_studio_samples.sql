-- Align example connections and mock mapping draft source configs with canonbridge-mock.

INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret_json, created_by, created_at, updated_at
) VALUES
    ('11111111-2222-3333-4444-555555555551'::uuid, 'tenant-acme', 'PayFlex Demo API Key', 'API_KEY', 'PRODUCTION', 'ACTIVE', '{"apiKey": "demo-api-key-12345", "headerName": "X-API-Key"}', 'system', NOW(), NOW()),
    ('11111111-2222-3333-4444-555555555552'::uuid, 'tenant-acme', 'FastCargo Demo Basic Auth', 'BASIC_AUTH', 'SANDBOX', 'ACTIVE', '{"username": "fastcargo-demo", "password": "fastcargo-secret"}', 'system', NOW(), NOW()),
    ('11111111-2222-3333-4444-555555555553'::uuid, 'tenant-acme', 'ShopMax Demo OAuth2', 'OAUTH2_CLIENT_CREDENTIALS', 'PRODUCTION', 'ACTIVE', '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "read:orders write:orders"}', 'system', NOW(), NOW()),
    ('21111111-2222-3333-4444-555555555551'::uuid, 'tenant-demo', 'PayFlex Demo API Key', 'API_KEY', 'PRODUCTION', 'ACTIVE', '{"apiKey": "demo-api-key-12345", "headerName": "X-API-Key"}', 'system', NOW(), NOW()),
    ('21111111-2222-3333-4444-555555555552'::uuid, 'tenant-demo', 'FastCargo Demo Basic Auth', 'BASIC_AUTH', 'SANDBOX', 'ACTIVE', '{"username": "fastcargo-demo", "password": "fastcargo-secret"}', 'system', NOW(), NOW()),
    ('21111111-2222-3333-4444-555555555553'::uuid, 'tenant-demo', 'ShopMax Demo OAuth2', 'OAUTH2_CLIENT_CREDENTIALS', 'PRODUCTION', 'ACTIVE', '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "read:orders write:orders"}', 'system', NOW(), NOW())
ON CONFLICT (credential_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    display_name = EXCLUDED.display_name,
    auth_type = EXCLUDED.auth_type,
    environment = EXCLUDED.environment,
    status = EXCLUDED.status,
    encrypted_secret_json = EXCLUDED.encrypted_secret_json,
    updated_at = NOW();

INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, draft_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES
    ('a1010101-1010-1010-1010-101010101010'::uuid, 'tenant-demo', '77777777-7777-7777-7777-777777777777'::uuid, 'PayFlex Payment Webhook Receiver', 'SOURCE_PAYLOAD', 'REST', 'POST', 'http://canonbridge-mock:8080/webhook/payment', '21111111-2222-3333-4444-555555555551'::uuid, 'PRODUCTION', 5000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 145, "success": true}', '{"maxAttempts": 2, "backoff": "exponential"}'::jsonb, '{"idempotencyHeader": "X-PayFlex-Webhook-Id", "signatureHeader": "X-PayFlex-Signature"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('c3030303-3030-3030-3030-303030303030'::uuid, 'tenant-demo', '88888888-8888-8888-8888-888888888888'::uuid, 'FastCargo Tracking SOAP Service', 'SOURCE_PAYLOAD', 'SOAP', 'POST', 'http://canonbridge-mock:8080/ws/track', '21111111-2222-3333-4444-555555555552'::uuid, 'SANDBOX', 8000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 1220, "success": true}', '{"maxAttempts": 3, "backoff": "exponential", "initialBackoffMs": 500}'::jsonb, '{"soapAction": "http://fastcargo.com/tracking/TrackShipment", "namespace": "http://fastcargo.com/tracking"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('b2020202-2020-2020-2020-202020202020'::uuid, 'tenant-demo', '99999999-9999-9999-9999-999999999999'::uuid, 'ShopMax Recent Orders API', 'SOURCE_PAYLOAD', 'REST', 'GET', 'http://canonbridge-mock:8080/api/orders/recent', '21111111-2222-3333-4444-555555555553'::uuid, 'PRODUCTION', 10000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 320, "success": true}', '{"maxAttempts": 3, "backoff": "exponential", "maxBackoffMs": 5000}'::jsonb, '{"successField": "orders", "errorField": "error"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::uuid, 'tenant-acme', NULL, 'PayFlex Latest Payments API', 'SOURCE_PAYLOAD', 'REST', 'GET', 'http://canonbridge-mock:8080/api/payments/latest', '11111111-2222-3333-4444-555555555551'::uuid, 'PRODUCTION', 5000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 184, "success": true}', '{"maxAttempts": 3, "backoff": "exponential", "retryableStatuses": [429, 503, 504]}'::jsonb, '{"successField": "payment", "errorField": "error"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'::uuid, 'tenant-acme', NULL, 'PayFlex Payment Query API', 'SOURCE_PAYLOAD', 'REST', 'POST', 'http://canonbridge-mock:8080/api/payments/query', '11111111-2222-3333-4444-555555555551'::uuid, 'PRODUCTION', 3000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 22, "success": true}', '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 1000}'::jsonb, '{"successField": "payments", "errorField": "error"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f'::uuid, 'tenant-acme', NULL, 'FastCargo Tracking SOAP Service', 'ENRICHMENT', 'SOAP', 'POST', 'http://canonbridge-mock:8080/ws/track', '11111111-2222-3333-4444-555555555552'::uuid, 'SANDBOX', 8000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 1220, "success": true}', '{"maxAttempts": 3, "backoff": "exponential", "initialBackoffMs": 500}'::jsonb, '{"soapAction": "http://fastcargo.com/tracking/TrackShipment", "namespace": "http://fastcargo.com/tracking"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a'::uuid, 'tenant-acme', NULL, 'ShopMax Recent Orders API', 'SOURCE_PAYLOAD', 'REST', 'GET', 'http://canonbridge-mock:8080/api/orders/recent', '11111111-2222-3333-4444-555555555553'::uuid, 'PRODUCTION', 10000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 320, "success": true}', '{"maxAttempts": 3, "backoff": "exponential", "maxBackoffMs": 5000}'::jsonb, '{"successField": "orders", "errorField": "error"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b'::uuid, 'tenant-acme', NULL, 'ShopMax OAuth2 Token API', 'ENRICHMENT', 'REST', 'POST', 'http://canonbridge-mock:8080/oauth/token', NULL, 'PRODUCTION', 4000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 145, "success": true}', '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 500}'::jsonb, '{"contentType": "application/x-www-form-urlencoded"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c'::uuid, 'tenant-acme', NULL, 'PayFlex Webhook Receiver', 'DESTINATION', 'REST', 'POST', 'http://canonbridge-mock:8080/webhook/payment', NULL, 'PRODUCTION', 6000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 145, "success": true}', '{"maxAttempts": 2, "backoff": "exponential"}'::jsonb, '{"idempotencyHeader": "X-PayFlex-Webhook-Id", "signatureHeader": "X-PayFlex-Signature"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW()),
    ('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d'::uuid, 'tenant-acme', NULL, 'FastCargo WSDL Service', 'MANUAL_TEST', 'REST', 'GET', 'http://canonbridge-mock:8080/ws/fastcargo.wsdl', NULL, 'PRODUCTION', 7000, 'HEALTHY', NOW(), '{"statusCode": 200, "durationMs": 234, "success": true}', '{"maxAttempts": 5, "backoff": "exponential", "maxBackoffMs": 10000}'::jsonb, '{"contentType": "text/xml"}'::jsonb, FALSE, NULL, '[]'::jsonb, NOW(), NOW())
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

UPDATE etl_outbound_connections
SET url = 'http://canonbridge-mock:8080/api/payments/latest',
    method = 'GET',
    credential_id = '11111111-2222-3333-4444-555555555551'::uuid,
    base_url = 'http://canonbridge-mock:8080',
    known_endpoints = '[
        {"path": "/api/payments/latest", "method": "GET", "description": "Get latest payment"},
        {"path": "/api/payments/query", "method": "POST", "description": "Query payments"},
        {"path": "/api/payments/{id}", "method": "GET", "description": "Get payment by ID"},
        {"path": "/webhook/payment", "method": "POST", "description": "Payment webhook receiver"}
    ]'::jsonb,
    updated_at = NOW()
WHERE connection_id = 'a1111111-1111-1111-1111-111111111111'::uuid;

UPDATE etl_outbound_connections
SET url = 'http://canonbridge-mock:8080/api/orders/recent',
    method = 'GET',
    credential_id = '11111111-2222-3333-4444-555555555553'::uuid,
    base_url = 'http://canonbridge-mock:8080',
    known_endpoints = '[
        {"path": "/api/orders/recent", "method": "GET", "description": "Get recent orders"},
        {"path": "/api/orders/{id}", "method": "GET", "description": "Get order by ID"},
        {"path": "/api/orders", "method": "POST", "description": "Create order"},
        {"path": "/api/orders/products", "method": "GET", "description": "List products"},
        {"path": "/oauth/token", "method": "POST", "description": "OAuth2 token endpoint"}
    ]'::jsonb,
    updated_at = NOW()
WHERE connection_id = 'b2222222-2222-2222-2222-222222222222'::uuid;

UPDATE etl_outbound_connections
SET url = 'http://canonbridge-mock:8080/ws/track',
    method = 'POST',
    credential_id = '11111111-2222-3333-4444-555555555552'::uuid,
    base_url = 'http://canonbridge-mock:8080',
    known_endpoints = '[
        {"path": "/ws/track", "method": "POST", "description": "Track shipment SOAP"},
        {"path": "/ws/create", "method": "POST", "description": "Create shipment SOAP"},
        {"path": "/ws/fastcargo.wsdl", "method": "GET", "description": "WSDL definition"}
    ]'::jsonb,
    updated_at = NOW()
WHERE connection_id = 'c3333333-3333-3333-3333-333333333333'::uuid;

UPDATE mapping_drafts
SET source_config = $$
{
  "connectionId": "a1010101-1010-1010-1010-101010101010",
  "connectionUrl": "http://canonbridge-mock:8080/webhook/payment",
  "endpoint": "/webhook/payment",
  "method": "POST",
  "sourceType": "webhook",
  "sourceJson": "{\"transactionId\":\"TXN-DEMO-001\",\"merchantId\":\"MERCHANT-100\",\"amount\":129.99,\"currency\":\"USD\",\"status\":\"SUCCESS\",\"paymentMethod\":\"CARD\",\"cardLast4\":\"4242\",\"cardBrand\":\"VISA\",\"customerEmail\":\"jane.smith@example.com\",\"customerName\":\"Jane Smith\",\"billingAddress\":{\"city\":\"London\",\"country\":\"GB\"},\"metadata\":{\"channel\":\"demo\"},\"timestamp\":\"2026-05-13T10:00:00Z\"}",
  "authType": "WEBHOOK_KEY",
  "webhookKey": "payflex-secret-key",
  "requestTransformation": {
    "mode": "template",
    "headers": {
      "X-PayFlex-Webhook-Id": "demo-webhook-001"
    },
    "template": {
      "transactionId": "TXN-DEMO-001",
      "merchantId": "MERCHANT-100",
      "amount": 129.99,
      "currency": "USD",
      "status": "SUCCESS",
      "paymentMethod": "CARD",
      "cardLast4": "4242",
      "cardBrand": "VISA",
      "customerEmail": "jane.smith@example.com",
      "customerName": "Jane Smith",
      "timestamp": "2026-05-13T10:00:00Z"
    }
  }
}
$$::jsonb,
    updated_at = NOW()
WHERE id = '77777777-7777-7777-7777-777777777777'::uuid;

UPDATE mapping_drafts
SET source_config = $$
{
  "connectionId": "c3030303-3030-3030-3030-303030303030",
  "endpoint": "http://canonbridge-mock:8080/ws/track",
  "wsdlUrl": "http://canonbridge-mock:8080/ws/fastcargo.wsdl",
  "sourceType": "soap",
  "sourceJson": "{\"trackingNumber\":\"TRK-DEMO-001\",\"status\":\"DELIVERED\",\"currentLocation\":{\"facility\":\"London Hub\",\"city\":\"London\",\"country\":\"GB\",\"timestamp\":\"2026-05-13T10:00:00Z\"},\"estimatedDelivery\":\"2026-05-14T18:00:00Z\",\"weight\":2.4,\"weightUnit\":\"KG\",\"deliveryDetails\":{\"signedBy\":\"Jane Smith\"},\"history\":[{\"status\":\"PICKED_UP\",\"timestamp\":\"2026-05-12T09:00:00Z\"},{\"status\":\"DELIVERED\",\"timestamp\":\"2026-05-13T10:00:00Z\"}]}",
  "authType": "BASIC_AUTH",
  "username": "fastcargo-demo",
  "password": "fastcargo-secret",
  "soapAction": "http://fastcargo.com/tracking/TrackShipment",
  "requestTransformation": {
    "mode": "template",
    "template": {
      "operation": "TrackShipment",
      "trackingNumber": "TRK-DEMO-001"
    }
  }
}
$$::jsonb,
    updated_at = NOW()
WHERE id = '88888888-8888-8888-8888-888888888888'::uuid;

UPDATE mapping_drafts
SET source_config = $$
{
  "connectionId": "b2020202-2020-2020-2020-202020202020",
  "connectionUrl": "http://canonbridge-mock:8080/api/orders/recent",
  "method": "GET",
  "sourceType": "kafka",
  "sourceJson": "{\"eventId\":\"evt-shopmax-1001\",\"timestamp\":\"2026-05-13T10:00:00Z\",\"eventType\":\"order.created\",\"orderId\":\"ORD-1001\",\"customerId\":\"CUST-1001\",\"customerEmail\":\"jane.smith@example.com\",\"items\":[{\"sku\":\"SKU-001\",\"name\":\"Wireless Keyboard\",\"category\":\"electronics\",\"quantity\":1,\"unitPrice\":79.99,\"totalPrice\":79.99,\"taxAmount\":8.0}],\"subtotal\":79.99,\"taxTotal\":8.0,\"shippingCost\":5.99,\"totalAmount\":93.98,\"currency\":\"USD\",\"paymentMethod\":\"CARD\",\"paymentStatus\":\"PAID\",\"shippingAddress\":{\"city\":\"London\",\"country\":\"GB\"},\"billingAddress\":{\"city\":\"London\",\"country\":\"GB\"},\"shippingMethod\":\"STANDARD\",\"estimatedDelivery\":\"2026-05-16T18:00:00Z\",\"source\":\"shopmax\",\"metadata\":{\"channel\":\"demo\"}}",
  "topic": "partner.shopmax.raw",
  "consumerGroup": "canonbridge-transformer",
  "bootstrapServers": "kafka:29092"
}
$$::jsonb,
    updated_at = NOW()
WHERE id = '99999999-9999-9999-9999-999999999999'::uuid;
