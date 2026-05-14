-- =====================================================
-- Fix Proxy Mappings - Add External System and Update Configs
-- =====================================================

-- Create external system for CanonBridge Mock API
INSERT INTO etl_outbound_connections (
    connection_id,
    tenant_id,
    name,
    purpose,
    protocol,
    method,
    url,
    environment,
    status,
    is_system_template,
    base_url,
    known_endpoints,
    created_at,
    updated_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'default-tenant',
    'CanonBridge Mock API',
    'SOURCE_PAYLOAD',
    'REST',
    'GET',
    'http://canonbridge-mock:8080',
    'SANDBOX',
    'HEALTHY',
    true,
    'http://canonbridge-mock:8080',
    jsonb_build_array(
        jsonb_build_object(
            'id', 'payment-query',
            'path', '/api/payments/query',
            'method', 'POST',
            'description', 'Query payments with filters'
        ),
        jsonb_build_object(
            'id', 'payment-latest',
            'path', '/api/payments/latest',
            'method', 'GET',
            'description', 'Get latest payments'
        )
    ),
    NOW(),
    NOW()
) ON CONFLICT (connection_id) DO UPDATE SET
    known_endpoints = EXCLUDED.known_endpoints,
    updated_at = NOW();

-- Update POST mapping with correct structure
UPDATE mapping_drafts
SET source_config = jsonb_build_object(
    'externalSystemId', '22222222-2222-2222-2222-222222222222',
    'path', '/api/payments/query',
    'url', 'http://canonbridge-mock:8080/api/payments/query',
    'method', 'POST',
    'headers', jsonb_build_object(
        'X-API-Key', 'demo-api-key-12345',
        'Content-Type', 'application/json'
    ),
    'requestTransformation', jsonb_build_object(
        'mode', 'template',
        'template', jsonb_build_object(
            'customerId', '{{customer_id}}',
            'format', '{{partner_format}}',
            'filters', jsonb_build_object(
                'status', 'completed',
                'minAmount', 100
            )
        ),
        'jsonata', '',
        'headers', jsonb_build_object()
    ),
    'sampleJson', jsonb_build_object(
        'customer_id', 'CUST-12345',
        'partner_format', 'detailed',
        'transaction_type', 'payment',
        'amount', 150.00,
        'currency', 'USD',
        'date_range', jsonb_build_object(
            'start', '2024-01-01',
            'end', '2024-12-31'
        )
    )
),
updated_at = NOW()
WHERE id = 'b3bb5c80-7966-4014-a2b4-235539f36b1a';

-- Update GET mapping with correct structure
UPDATE mapping_drafts
SET source_config = jsonb_build_object(
    'externalSystemId', '22222222-2222-2222-2222-222222222222',
    'path', '/api/payments/latest',
    'url', 'http://canonbridge-mock:8080/api/payments/latest',
    'method', 'GET',
    'headers', jsonb_build_object(
        'X-API-Key', 'demo-api-key-12345'
    ),
    'requestTransformation', jsonb_build_object(
        'mode', 'template',
        'template', jsonb_build_object(
            'queryParams', jsonb_build_object(
                'format', '{{partner_format}}',
                'limit', '{{limit}}',
                'customerId', '{{customer_id}}'
            )
        ),
        'jsonata', '',
        'headers', jsonb_build_object()
    ),
    'sampleJson', jsonb_build_object(
        'partner_format', 'detailed',
        'limit', 10,
        'customer_id', 'CUST-12345',
        'include_metadata', true
    )
),
updated_at = NOW()
WHERE id = 'e87b7f54-0e6a-4606-9c43-61b0891ce2ba';

-- Verification
\echo ''
\echo '=== External System ==='
SELECT 
    connection_id,
    name,
    base_url,
    jsonb_array_length(known_endpoints) as endpoint_count
FROM etl_outbound_connections
WHERE connection_id = '22222222-2222-2222-2222-222222222222';

\echo ''
\echo '=== POST Mapping Config ==='
SELECT 
    id,
    name,
    source_config->>'externalSystemId' as external_system_id,
    source_config->>'path' as path,
    source_config->>'method' as method
FROM mapping_drafts
WHERE id = 'b3bb5c80-7966-4014-a2b4-235539f36b1a';

\echo ''
\echo '=== GET Mapping Config ==='
SELECT 
    id,
    name,
    source_config->>'externalSystemId' as external_system_id,
    source_config->>'path' as path,
    source_config->>'method' as method
FROM mapping_drafts
WHERE id = 'e87b7f54-0e6a-4606-9c43-61b0891ce2ba';

\echo ''
\echo '=== POST Mapping Full Config ==='
SELECT jsonb_pretty(source_config)
FROM mapping_drafts
WHERE id = 'b3bb5c80-7966-4014-a2b4-235539f36b1a';
