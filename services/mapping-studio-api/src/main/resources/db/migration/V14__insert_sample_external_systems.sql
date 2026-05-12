-- Sample External System Connections for Testing

-- REST API - Carrier Orders (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, schedule, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'tenant-acme',
    'Carrier A Orders API',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'https://api.carrier-a.example.com/v2/orders',
    'PRODUCTION',
    '*/5 * * * *',
    5000,
    'HEALTHY',
    NOW() - INTERVAL '2 minutes',
    '{"statusCode": 200, "durationMs": 184, "success": true}',
    '{"maxAttempts": 3, "backoff": "exponential", "retryableStatuses": [429, 503, 504]}'::jsonb,
    '{"successField": "orders", "errorField": "error", "pagination": {"type": "cursor", "field": "nextCursor"}}'::jsonb
);

-- Webhook - Shopify Orders (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'tenant-acme',
    'Shopify Order Webhook',
    'SOURCE_PAYLOAD',
    'REST',
    'POST',
    'https://hooks.shopify.example.com/orders/webhook',
    'PRODUCTION',
    3000,
    'HEALTHY',
    NOW() - INTERVAL '1 minute',
    '{"statusCode": 200, "durationMs": 22, "success": true}',
    '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 1000}'::jsonb,
    '{"idempotencyHeader": "X-Shopify-Webhook-Id", "signatureHeader": "X-Shopify-Hmac-SHA256"}'::jsonb
);

-- SOAP - Logistics Tracking (Sandbox, Degraded)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'tenant-acme',
    'Logistics Tracking SOAP Service',
    'ENRICHMENT',
    'SOAP',
    'POST',
    'https://soap.logistics.example.com/tracking/v1',
    'SANDBOX',
    8000,
    'DEGRADED',
    NOW() - INTERVAL '16 minutes',
    '{"statusCode": 500, "durationMs": 1220, "success": false, "error": "SOAP fault: invalid tracking number"}',
    '{"maxAttempts": 3, "backoff": "exponential", "initialBackoffMs": 500}'::jsonb,
    '{"soapAction": "GetTrackingInfo", "namespace": "http://logistics.example.com/tracking/v1"}'::jsonb
);

-- REST API - Payment Risk Score (Production, Failed)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
    'tenant-acme',
    'Payment Risk Score API',
    'ENRICHMENT',
    'REST',
    'POST',
    'https://risk.payment.example.com/v3/score',
    'PRODUCTION',
    10000,
    'FAILED',
    NOW() - INTERVAL '48 minutes',
    '{"statusCode": 503, "durationMs": 3200, "success": false, "error": "Service unavailable after 3 attempts"}',
    '{"maxAttempts": 3, "backoff": "exponential", "maxBackoffMs": 5000}'::jsonb,
    '{"riskThreshold": 85, "requiresReview": true}'::jsonb
);

-- REST API - Inventory Check (Sandbox, Not Tested)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status,
    retry_policy, response_handling
) VALUES (
    'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
    'tenant-acme',
    'Inventory Availability API',
    'ENRICHMENT',
    'REST',
    'GET',
    'https://inventory.warehouse.example.com/api/v1/availability',
    'SANDBOX',
    4000,
    'NOT_TESTED',
    '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 500}'::jsonb,
    '{"cacheEnabled": true, "cacheTtlSeconds": 60}'::jsonb
);

-- GraphQL - Customer Profile (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c',
    'tenant-acme',
    'Customer Profile GraphQL',
    'ENRICHMENT',
    'GRAPHQL',
    'POST',
    'https://api.customer.example.com/graphql',
    'PRODUCTION',
    6000,
    'HEALTHY',
    NOW() - INTERVAL '5 minutes',
    '{"statusCode": 200, "durationMs": 145, "success": true}',
    '{"maxAttempts": 2, "backoff": "exponential"}'::jsonb,
    '{"query": "query GetCustomer($id: ID!) { customer(id: $id) { id name email tier } }"}'::jsonb
);

-- REST API - Order Destination (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d',
    'tenant-acme',
    'Order Management System',
    'DESTINATION',
    'REST',
    'POST',
    'https://oms.internal.example.com/api/v2/orders',
    'PRODUCTION',
    7000,
    'HEALTHY',
    NOW() - INTERVAL '3 minutes',
    '{"statusCode": 201, "durationMs": 234, "success": true}',
    '{"maxAttempts": 5, "backoff": "exponential", "maxBackoffMs": 10000}'::jsonb,
    '{"idempotencyKey": "X-Idempotency-Key", "batchingEnabled": false}'::jsonb
);

-- Comment
COMMENT ON TABLE etl_outbound_connections IS 'Sample external system connections showing various protocols and statuses';
