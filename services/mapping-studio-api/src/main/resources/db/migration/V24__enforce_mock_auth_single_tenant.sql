-- Enforce realistic auth for mock-backed external API calls and keep demo data under one tenant.
-- The application login seed uses tenant-acme, so mock credentials/connections must live there too.

-- Remove duplicate tenant-acme templates that were inserted without credentials.
DELETE FROM etl_outbound_connections
WHERE connection_id IN (
    'a1111111-aaaa-1111-1111-111111111111'::uuid,
    'b2222222-bbbb-2222-2222-222222222222'::uuid,
    'c3333333-cccc-3333-3333-333333333333'::uuid,
    'd4444444-dddd-4444-4444-444444444444'::uuid,
    'e5555555-eeee-5555-5555-555555555555'::uuid
);

-- Merge tenant-demo mock data into the single demo tenant.
UPDATE etl_credentials
SET tenant_id = 'tenant-acme', updated_at = NOW()
WHERE tenant_id = 'tenant-demo';

UPDATE etl_outbound_connections
SET tenant_id = 'tenant-acme', updated_at = NOW()
WHERE tenant_id = 'tenant-demo';

UPDATE mapping_drafts
SET tenant_id = 'tenant-acme', updated_at = NOW()
WHERE tenant_id = 'tenant-demo';

UPDATE mapping_versions
SET tenant_id = 'tenant-acme'
WHERE tenant_id = 'tenant-demo';

UPDATE etl_sample_payloads
SET tenant_id = 'tenant-acme'
WHERE tenant_id = 'tenant-demo';

UPDATE webhook_endpoints
SET tenant_id = 'tenant-acme'
WHERE tenant_id = 'tenant-demo';

UPDATE audit_logs
SET tenant_id = 'tenant-acme'
WHERE tenant_id = 'tenant-demo';

UPDATE audit_mapping_events
SET tenant_id = 'tenant-acme'
WHERE tenant_id = 'tenant-demo';

UPDATE partners partner
SET tenant_id = 'tenant-acme',
    updated_at = NOW()
WHERE partner.tenant_id = 'tenant-demo'
  AND NOT EXISTS (
      SELECT 1
      FROM partners existing
      WHERE existing.tenant_id = 'tenant-acme'
        AND existing.external_id = partner.external_id
  );

-- If a tenant-demo schema conflicts with an existing tenant-acme schema, repoint drafts first.
UPDATE mapping_drafts draft
SET canonical_schema_ref = existing.id::text,
    updated_at = NOW()
FROM schemas demo_schema
JOIN schemas existing
  ON existing.tenant_id = 'tenant-acme'
 AND existing.subject = demo_schema.subject
 AND existing.version = demo_schema.version
WHERE demo_schema.tenant_id = 'tenant-demo'
  AND draft.canonical_schema_ref = demo_schema.id::text;

DELETE FROM schemas demo_schema
WHERE demo_schema.tenant_id = 'tenant-demo'
  AND EXISTS (
      SELECT 1
      FROM schemas existing
      WHERE existing.tenant_id = 'tenant-acme'
        AND existing.subject = demo_schema.subject
        AND existing.version = demo_schema.version
  );

UPDATE schemas
SET tenant_id = 'tenant-acme',
    updated_at = NOW()
WHERE tenant_id = 'tenant-demo';

-- Token-backed mock APIs use OAuth2 client credentials; API key/basic auth remain credential-backed too.
INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret_json, created_by, created_at, updated_at
) VALUES
    (
        '11111111-2222-3333-4444-555555555551'::uuid,
        'tenant-acme',
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
        '11111111-2222-3333-4444-555555555552'::uuid,
        'tenant-acme',
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
        '11111111-2222-3333-4444-555555555553'::uuid,
        'tenant-acme',
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
        '11111111-2222-3333-4444-555555555554'::uuid,
        'tenant-acme',
        'ProfileHub GraphQL Demo OAuth2',
        'OAUTH2_CLIENT_CREDENTIALS',
        'SANDBOX',
        'ACTIVE',
        '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "graphql:query"}',
        'system',
        NOW(),
        NOW()
    ),
    (
        '11111111-2222-3333-4444-555555555555'::uuid,
        'tenant-acme',
        'CustomerGateway gRPC Demo OAuth2',
        'OAUTH2_CLIENT_CREDENTIALS',
        'SANDBOX',
        'ACTIVE',
        '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "grpc:profile"}',
        'system',
        NOW(),
        NOW()
    ),
    (
        '11111111-2222-3333-4444-555555555556'::uuid,
        'tenant-acme',
        'PayFlex Webhook Demo Key',
        'API_KEY',
        'PRODUCTION',
        'ACTIVE',
        '{"apiKey": "payflex-secret-key", "headerName": "X-Webhook-Key"}',
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

-- Keep legacy mock credential ids tenant-acme as well, but convert bearer-only entries to OAuth2.
UPDATE etl_credentials
SET tenant_id = 'tenant-acme',
    auth_type = 'OAUTH2_CLIENT_CREDENTIALS',
    display_name = 'ProfileHub GraphQL Demo OAuth2',
    encrypted_secret_json = '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "graphql:query"}',
    updated_at = NOW()
WHERE credential_id = '21111111-2222-3333-4444-555555555554'::uuid;

UPDATE etl_credentials
SET tenant_id = 'tenant-acme',
    auth_type = 'OAUTH2_CLIENT_CREDENTIALS',
    display_name = 'CustomerGateway gRPC Demo OAuth2',
    encrypted_secret_json = '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "grpc:profile"}',
    updated_at = NOW()
WHERE credential_id = '21111111-2222-3333-4444-555555555555'::uuid;

-- Attach every mock API connection to the credential it needs before the mock endpoint will answer.
UPDATE etl_outbound_connections
SET credential_id = '11111111-2222-3333-4444-555555555551'::uuid,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND url LIKE '%/api/payments/%';

UPDATE etl_outbound_connections
SET credential_id = '11111111-2222-3333-4444-555555555552'::uuid,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND (url LIKE '%/ws/track%' OR url LIKE '%/ws/create%');

UPDATE etl_outbound_connections
SET credential_id = '11111111-2222-3333-4444-555555555552'::uuid,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND url LIKE '%fastcargo.wsdl%';

UPDATE etl_outbound_connections
SET credential_id = '11111111-2222-3333-4444-555555555556'::uuid,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND url LIKE '%/webhook/payment%';

UPDATE etl_outbound_connections
SET credential_id = '11111111-2222-3333-4444-555555555553'::uuid,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND url LIKE '%/api/orders/%';

UPDATE etl_outbound_connections
SET credential_id = '11111111-2222-3333-4444-555555555554'::uuid,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND (protocol = 'GRAPHQL' OR url LIKE '%/graphql%');

UPDATE etl_outbound_connections
SET credential_id = '11111111-2222-3333-4444-555555555555'::uuid,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND (protocol = 'GRPC' OR url LIKE '%/grpc/%');

-- Store the intended auth shape in wizard source configs too.
UPDATE mapping_drafts
SET source_config = COALESCE(source_config, '{}'::jsonb) || '{"authType":"WEBHOOK_KEY","apiKeyHeader":"X-Webhook-Key","webhookKey":"payflex-secret-key"}'::jsonb,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND (
      source_config ->> 'connectionUrl' LIKE '%/webhook/payment%'
      OR source_config ->> 'endpoint' LIKE '%/webhook/payment%'
  );

UPDATE mapping_drafts
SET source_config = COALESCE(source_config, '{}'::jsonb) || '{"authType":"OAUTH2_CLIENT_CREDENTIALS","tokenUrl":"http://canonbridge-mock:8080/oauth/token","scope":"read:orders write:orders"}'::jsonb,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND source_config ->> 'connectionUrl' LIKE '%/api/orders/%';

UPDATE mapping_drafts
SET source_config = COALESCE(source_config, '{}'::jsonb) || '{"authType":"OAUTH2_CLIENT_CREDENTIALS","tokenUrl":"http://canonbridge-mock:8080/oauth/token","scope":"graphql:query"}'::jsonb,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND (source_config ->> 'url' LIKE '%/graphql%' OR source_type = 'API_ENRICHMENT');

UPDATE mapping_drafts
SET source_config = COALESCE(source_config, '{}'::jsonb) || '{"authType":"OAUTH2_CLIENT_CREDENTIALS","tokenUrl":"http://canonbridge-mock:8080/oauth/token","scope":"grpc:profile"}'::jsonb,
    updated_at = NOW()
WHERE tenant_id = 'tenant-acme'
  AND (source_config ->> 'url' LIKE '%/grpc/%' OR source_type = 'GRPC');
