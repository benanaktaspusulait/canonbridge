-- =====================================================
-- Seed Data for Proxy Mappings (GET and POST Examples)
-- =====================================================
-- Run this with: docker exec -i canonbridge-postgres psql -U canonbridge_user -d canonbridge_db < db-seed-proxy-mappings.sql

-- First, ensure we have a partner
INSERT INTO partners (id, tenant_id, name, status, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'default-tenant',
    'CanonBridge Mock API',
    'ACTIVE',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 1. POST Mapping: Payment Query with Request Body
-- =====================================================

-- Create draft for POST mapping
INSERT INTO mapping_drafts (
    id,
    tenant_id,
    partner_id,
    event_type,
    name,
    description,
    source_type,
    source_config,
    canonical_schema_ref,
    mapping_rules,
    status,
    created_at,
    updated_at,
    created_by
) VALUES (
    'b3bb5c80-7966-4014-a2b4-235539f36b1a',
    'default-tenant',
    '11111111-1111-1111-1111-111111111111',
    'PaymentQuery',
    'Payment Proxy - POST Example',
    'POST request to query payments with request body transformation',
    'REST_API',
    jsonb_build_object(
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
    '55b83ac8-e5c9-45e8-80f1-2728b51f4097',
    jsonb_build_array(
        jsonb_build_object(
            'id', 'rule-1',
            'targetKey', 'paymentId',
            'sourcePath', 'payment_id',
            'transform', 'direct',
            'mode', 'visual'
        ),
        jsonb_build_object(
            'id', 'rule-2',
            'targetKey', 'amount',
            'sourcePath', 'total_amount',
            'transform', 'number_coerce',
            'mode', 'visual'
        ),
        jsonb_build_object(
            'id', 'rule-3',
            'targetKey', 'currency',
            'sourcePath', 'currency_code',
            'transform', 'string_uppercase',
            'mode', 'visual'
        ),
        jsonb_build_object(
            'id', 'rule-4',
            'targetKey', 'status',
            'sourcePath', 'payment_status',
            'transform', 'direct',
            'mode', 'visual'
        )
    ),
    'DRAFT',
    NOW(),
    NOW(),
    'admin@example.com'
) ON CONFLICT (id) DO UPDATE SET
    source_config = EXCLUDED.source_config,
    mapping_rules = EXCLUDED.mapping_rules,
    updated_at = NOW();

-- Create published version for POST mapping
INSERT INTO mapping_versions (
    id,
    tenant_id,
    draft_id,
    partner_id,
    event_type,
    version,
    name,
    description,
    source_type,
    config_json,
    jsonata_expression,
    canonical_schema_ref,
    status,
    published_at,
    created_at,
    created_by
) VALUES (
    'b3bb5c80-7966-4014-a2b4-235539f36b1b',
    'default-tenant',
    'b3bb5c80-7966-4014-a2b4-235539f36b1a',
    '11111111-1111-1111-1111-111111111111',
    'PaymentQuery',
    1,
    'Payment Proxy - POST Example',
    'POST request to query payments with request body transformation',
    'REST_API',
    jsonb_build_object(
        'url', 'http://canonbridge-mock:8080/api/payments/query',
        'method', 'POST'
    ),
    '$merge([{"paymentId": payment_id, "amount": $number(total_amount), "currency": $uppercase(currency_code), "status": payment_status}])',
    '55b83ac8-e5c9-45e8-80f1-2728b51f4097',
    'PUBLISHED',
    NOW(),
    NOW(),
    'admin@example.com'
) ON CONFLICT (id) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    jsonata_expression = EXCLUDED.jsonata_expression;

-- =====================================================
-- 2. GET Mapping: Payment Latest with Query Parameters
-- =====================================================

-- Create draft for GET mapping
INSERT INTO mapping_drafts (
    id,
    tenant_id,
    partner_id,
    event_type,
    name,
    description,
    source_type,
    source_config,
    canonical_schema_ref,
    mapping_rules,
    status,
    created_at,
    updated_at,
    created_by
) VALUES (
    'e87b7f54-0e6a-4606-9c43-61b0891ce2ba',
    'default-tenant',
    '11111111-1111-1111-1111-111111111111',
    'PaymentLatest',
    'Payment Proxy - GET Example',
    'GET request to fetch latest payments using query parameters',
    'REST_API',
    jsonb_build_object(
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
    '55b83ac8-e5c9-45e8-80f1-2728b51f4097',
    jsonb_build_array(
        jsonb_build_object(
            'id', 'rule-1',
            'targetKey', 'paymentId',
            'sourcePath', 'id',
            'transform', 'direct',
            'mode', 'visual'
        ),
        jsonb_build_object(
            'id', 'rule-2',
            'targetKey', 'amount',
            'sourcePath', 'amount',
            'transform', 'number_coerce',
            'mode', 'visual'
        ),
        jsonb_build_object(
            'id', 'rule-3',
            'targetKey', 'currency',
            'sourcePath', 'currency',
            'transform', 'string_uppercase',
            'mode', 'visual'
        ),
        jsonb_build_object(
            'id', 'rule-4',
            'targetKey', 'status',
            'sourcePath', 'status',
            'transform', 'direct',
            'mode', 'visual'
        )
    ),
    'DRAFT',
    NOW(),
    NOW(),
    'admin@example.com'
) ON CONFLICT (id) DO UPDATE SET
    source_config = EXCLUDED.source_config,
    mapping_rules = EXCLUDED.mapping_rules,
    updated_at = NOW();

-- Create published version for GET mapping
INSERT INTO mapping_versions (
    id,
    tenant_id,
    draft_id,
    partner_id,
    event_type,
    version,
    name,
    description,
    source_type,
    config_json,
    jsonata_expression,
    canonical_schema_ref,
    status,
    published_at,
    created_at,
    created_by
) VALUES (
    'e87b7f54-0e6a-4606-9c43-61b0891ce2be',
    'default-tenant',
    'e87b7f54-0e6a-4606-9c43-61b0891ce2ba',
    '11111111-1111-1111-1111-111111111111',
    'PaymentLatest',
    1,
    'Payment Proxy - GET Example',
    'GET request to fetch latest payments using query parameters',
    'REST_API',
    jsonb_build_object(
        'url', 'http://canonbridge-mock:8080/api/payments/latest',
        'method', 'GET'
    ),
    '$merge([{"paymentId": id, "amount": $number(amount), "currency": $uppercase(currency), "status": status}])',
    '55b83ac8-e5c9-45e8-80f1-2728b51f4097',
    'PUBLISHED',
    NOW(),
    NOW(),
    'admin@example.com'
) ON CONFLICT (id) DO UPDATE SET
    config_json = EXCLUDED.config_json,
    jsonata_expression = EXCLUDED.jsonata_expression;

-- =====================================================
-- Verification Queries
-- =====================================================

\echo '=== Created Mappings ==='
SELECT 
    mv.id,
    mv.name,
    mv.source_type,
    md.id as draft_id
FROM mapping_versions mv
JOIN mapping_drafts md ON mv.draft_id = md.id
WHERE mv.id IN (
    'b3bb5c80-7966-4014-a2b4-235539f36b1b',
    'e87b7f54-0e6a-4606-9c43-61b0891ce2be'
);

\echo ''
\echo '=== POST Mapping Source Config ==='
SELECT 
    jsonb_pretty(source_config)
FROM mapping_drafts
WHERE id = 'b3bb5c80-7966-4014-a2b4-235539f36b1a';

\echo ''
\echo '=== GET Mapping Source Config ==='
SELECT 
    jsonb_pretty(source_config)
FROM mapping_drafts
WHERE id = 'e87b7f54-0e6a-4606-9c43-61b0891ce2ba';
