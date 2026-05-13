-- Sample External System Connections for Testing

-- PayFlex REST API - Payment Latest (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'tenant-acme',
    'PayFlex Latest Payments API',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'http://canonbridge-mock:8080/api/payments/latest',
    '11111111-2222-3333-4444-555555555551'::uuid,
    'PRODUCTION',
    5000,
    'HEALTHY',
    NOW() - INTERVAL '2 minutes',
    '{"statusCode": 200, "durationMs": 184, "success": true}',
    '{"maxAttempts": 3, "backoff": "exponential", "retryableStatuses": [429, 503, 504]}'::jsonb,
    '{"successField": "payment", "errorField": "error"}'::jsonb
);

-- PayFlex REST API - Payment Query (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'tenant-acme',
    'PayFlex Payment Query API',
    'SOURCE_PAYLOAD',
    'REST',
    'POST',
    'http://canonbridge-mock:8080/api/payments/query',
    '11111111-2222-3333-4444-555555555551'::uuid,
    'PRODUCTION',
    3000,
    'HEALTHY',
    NOW() - INTERVAL '1 minute',
    '{"statusCode": 200, "durationMs": 22, "success": true}',
    '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 1000}'::jsonb,
    '{"successField": "payments", "errorField": "error"}'::jsonb
);

-- FastCargo SOAP API - Tracking Service (Sandbox, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'tenant-acme',
    'FastCargo Tracking SOAP Service',
    'ENRICHMENT',
    'SOAP',
    'POST',
    'http://canonbridge-mock:8080/ws/track',
    '11111111-2222-3333-4444-555555555552'::uuid,
    'SANDBOX',
    8000,
    'HEALTHY',
    NOW() - INTERVAL '16 minutes',
    '{"statusCode": 200, "durationMs": 1220, "success": true, "responseBody": "<?xml version=\"1.0\"?><soap:Envelope><soap:Body><TrackingResponse><trackingNumber>TRK-12345</trackingNumber><status>DELIVERED</status></TrackingResponse></soap:Body></soap:Envelope>"}',
    '{"maxAttempts": 3, "backoff": "exponential", "initialBackoffMs": 500}'::jsonb,
    '{"soapAction": "GetTrackingInfo", "namespace": "http://fastcargo.example.com/tracking/v1"}'::jsonb
);

-- ShopMax REST API - Recent Orders (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
    'tenant-acme',
    'ShopMax Recent Orders API',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'http://canonbridge-mock:8080/api/orders/recent',
    '11111111-2222-3333-4444-555555555553'::uuid,
    'PRODUCTION',
    10000,
    'HEALTHY',
    NOW() - INTERVAL '48 minutes',
    '{"statusCode": 200, "durationMs": 320, "success": true}',
    '{"maxAttempts": 3, "backoff": "exponential", "maxBackoffMs": 5000}'::jsonb,
    '{"successField": "orders", "errorField": "error"}'::jsonb
);

-- ShopMax OAuth2 Token Endpoint (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
    'tenant-acme',
    'ShopMax OAuth2 Token API',
    'ENRICHMENT',
    'REST',
    'POST',
    'http://canonbridge-mock:8080/oauth/token',
    'PRODUCTION',
    4000,
    'HEALTHY',
    NOW() - INTERVAL '5 minutes',
    '{"statusCode": 200, "durationMs": 145, "success": true, "responseBody": "{\"access_token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\",\"token_type\":\"bearer\",\"expires_in\":3600}"}',
    '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 500}'::jsonb,
    '{"contentType": "application/x-www-form-urlencoded"}'::jsonb
);

-- PayFlex Webhook Receiver (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c',
    'tenant-acme',
    'PayFlex Webhook Receiver',
    'DESTINATION',
    'REST',
    'POST',
    'http://canonbridge-mock:8080/webhook/payment',
    'PRODUCTION',
    6000,
    'HEALTHY',
    NOW() - INTERVAL '5 minutes',
    '{"statusCode": 200, "durationMs": 145, "success": true}',
    '{"maxAttempts": 2, "backoff": "exponential"}'::jsonb,
    '{"idempotencyHeader": "X-PayFlex-Webhook-Id", "signatureHeader": "X-PayFlex-Signature"}'::jsonb
);

-- FastCargo WSDL Endpoint (Production, Healthy)
INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, name, purpose, protocol, method, url,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling
) VALUES (
    'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d',
    'tenant-acme',
    'FastCargo WSDL Service',
    'MANUAL_TEST',
    'REST',
    'GET',
    'http://canonbridge-mock:8080/wsdl/fastcargo.wsdl',
    'PRODUCTION',
    7000,
    'HEALTHY',
    NOW() - INTERVAL '3 minutes',
    '{"statusCode": 200, "durationMs": 234, "success": true}',
    '{"maxAttempts": 5, "backoff": "exponential", "maxBackoffMs": 10000}'::jsonb,
    '{"contentType": "text/xml"}'::jsonb
);

-- Comment
COMMENT ON TABLE etl_outbound_connections IS 'Sample external system connections showing various protocols and statuses';
