-- Sample Credentials for Mock Services
-- This migration inserts demo credentials for PayFlex, FastCargo, and ShopMax mock services

-- PayFlex API Key Credential
INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret_json, created_by, created_at, updated_at
) VALUES (
    '11111111-2222-3333-4444-555555555551'::uuid,
    'tenant-acme',
    'PayFlex Demo API Key',
    'API_KEY',
    'PRODUCTION',
    'ACTIVE',
    '{"apiKey": "demo-api-key-12345", "headerName": "X-API-Key"}', -- In production, this should be encrypted
    'system',
    NOW(),
    NOW()
);

-- FastCargo Basic Auth Credential
INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret_json, created_by, created_at, updated_at
) VALUES (
    '11111111-2222-3333-4444-555555555552'::uuid,
    'tenant-acme',
    'FastCargo Demo Basic Auth',
    'BASIC_AUTH',
    'SANDBOX',
    'ACTIVE',
    '{"username": "fastcargo-demo", "password": "fastcargo-secret"}', -- In production, this should be encrypted
    'system',
    NOW(),
    NOW()
);

-- ShopMax OAuth2 Client Credentials
INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret_json, created_by, created_at, updated_at
) VALUES (
    '11111111-2222-3333-4444-555555555553'::uuid,
    'tenant-acme',
    'ShopMax Demo OAuth2',
    'OAUTH2_CLIENT_CREDENTIALS',
    'PRODUCTION',
    'ACTIVE',
    '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "orders.read"}', -- In production, this should be encrypted
    'system',
    NOW(),
    NOW()
);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Sample credentials inserted successfully for mock services';
END $$;