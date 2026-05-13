-- Add gRPC as a first-class mock connection protocol.

ALTER TABLE etl_outbound_connections
DROP CONSTRAINT IF EXISTS etl_outbound_connections_protocol_check;

ALTER TABLE etl_outbound_connections
ADD CONSTRAINT etl_outbound_connections_protocol_check
CHECK (protocol IN ('REST', 'SOAP', 'GRAPHQL', 'GRPC'));

INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret_json, created_by, created_at, updated_at
) VALUES (
    '21111111-2222-3333-4444-555555555555'::uuid,
    'tenant-demo',
    'Customer gRPC Demo Bearer',
    'BEARER_TOKEN',
    'SANDBOX',
    'ACTIVE',
    '{"token": "mock-grpc-token"}',
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

INSERT INTO partners (id, tenant_id, external_id, name, description, status, rate_limit_per_minute, created_by, updated_by, created_at, updated_at)
VALUES (
    '13131313-1313-1313-1313-131313131313'::uuid,
    'tenant-demo',
    'customergateway',
    'CustomerGateway gRPC',
    'gRPC-style customer profile service',
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
    '57575757-5757-5757-5757-575757575757'::uuid,
    'tenant-demo',
    'CANONICAL',
    'GrpcCustomerProfile',
    'canonical.GrpcCustomerProfile',
    1,
    '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["customerId","email"],"properties":{"customerId":{"type":"string"},"name":{"type":"string"},"email":{"type":"string","format":"email"},"tier":{"type":"string"},"riskScore":{"type":"number"},"updatedAt":{"type":"string","format":"date-time"}}}'::jsonb,
    'Canonical schema for customer profile data from gRPC services',
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

INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
) VALUES (
    'cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd'::uuid,
    'tenant-demo',
    '13131313-1313-1313-1313-131313131313'::uuid,
    'customer.profile.grpc',
    'CustomerGateway gRPC Customer Mapping',
    'Maps CustomerGateway gRPC profile responses to canonical customer profile format',
    'GRPC',
    '{"connectionId":"e5555555-5555-5555-5555-555555555555","service":"customer.ProfileService","method":"GetCustomer","url":"http://canonbridge-mock:8080/grpc/customer.ProfileService/GetCustomer","sampleJson":"{\"customerId\":\"CUST-GRPC-1001\",\"displayName\":\"Ada Lovelace\",\"email\":\"ada.lovelace@example.com\",\"loyaltyTier\":\"PLATINUM\",\"riskScore\":0.08,\"updatedAt\":\"2026-05-13T10:00:00Z\"}"}'::jsonb,
    '{"type":"object","required":["customerId","email"],"properties":{"customerId":{"type":"string"},"displayName":{"type":"string"},"email":{"type":"string"},"loyaltyTier":{"type":"string"},"riskScore":{"type":"number"},"updatedAt":{"type":"string"}}}'::jsonb,
    '57575757-5757-5757-5757-575757575757',
    '[
        {"field": "customerId", "source": "$.customerId", "transform": "string"},
        {"field": "name", "source": "$.displayName", "transform": "string"},
        {"field": "email", "source": "$.email", "transform": "string"},
        {"field": "tier", "source": "$.loyaltyTier", "transform": "string"},
        {"field": "riskScore", "source": "$.riskScore", "transform": "number"},
        {"field": "updatedAt", "source": "$.updatedAt", "transform": "string"}
    ]'::jsonb,
    '{
        "customerId": $.customerId,
        "name": $.displayName,
        "email": $.email,
        "tier": $.loyaltyTier,
        "riskScore": $.riskScore,
        "updatedAt": $.updatedAt
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

INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, draft_id, name, purpose, protocol, method, url, credential_id,
    environment, timeout_ms, status, last_test_at, last_test_result,
    retry_policy, response_handling, is_system_template, base_url, known_endpoints,
    created_at, updated_at
) VALUES (
    'e5555555-5555-5555-5555-555555555555'::uuid,
    'tenant-demo',
    'cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd'::uuid,
    'CustomerGateway gRPC Profile Service',
    'SOURCE_PAYLOAD',
    'GRPC',
    'POST',
    'http://canonbridge-mock:8080/grpc/customer.ProfileService/GetCustomer',
    '21111111-2222-3333-4444-555555555555'::uuid,
    'SANDBOX',
    5000,
    'HEALTHY',
    NOW() - INTERVAL '3 minutes',
    '{"statusCode": 200, "durationMs": 72, "success": true}',
    '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 500}'::jsonb,
    '{"service": "customer.ProfileService", "method": "GetCustomer", "contentType": "application/grpc+json"}'::jsonb,
    TRUE,
    'http://canonbridge-mock:8080',
    '[
        {"path": "/grpc/customer.ProfileService/GetCustomer", "method": "POST", "description": "GetCustomer RPC"},
        {"path": "/grpc/customer.ProfileService/ListCustomerEvents", "method": "POST", "description": "ListCustomerEvents RPC"}
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
