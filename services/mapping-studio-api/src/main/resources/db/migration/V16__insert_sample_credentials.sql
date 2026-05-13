-- Sample Credentials for Mock Services
-- This migration inserts demo credentials for PayFlex, FastCargo, and ShopMax mock services

-- PayFlex API Key Credential
INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret, secret_metadata, created_by, updated_by, created_at, updated_at
) VALUES (
    'payflex-api-key'::uuid,
    'tenant-acme',
    'PayFlex Demo API Key',
    'API_KEY',
    'PRODUCTION',
    'ACTIVE',
    'demo-api-key-12345', -- In production, this should be encrypted
    '{"keyName": "X-API-Key", "keyLocation": "header"}'::jsonb,
    'system',
    'system',
    NOW(),
    NOW()
) ON CONFLICT (credential_id) DO UPDATE SET
    encrypted_secret = EXCLUDED.encrypted_secret,
    updated_at = NOW();

-- FastCargo Basic Auth Credential
INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret, secret_metadata, created_by, updated_by, created_at, updated_at
) VALUES (
    'fastcargo-basic-auth'::uuid,
    'tenant-acme',
    'FastCargo Demo Basic Auth',
    'BASIC_AUTH',
    'SANDBOX',
    'ACTIVE',
    'fastcargo-demo:fastcargo-secret', -- In production, this should be encrypted
    '{"username": "fastcargo-demo", "password": "fastcargo-secret"}'::jsonb,
    'system',
    'system',
    NOW(),
    NOW()
) ON CONFLICT (credential_id) DO UPDATE SET
    encrypted_secret = EXCLUDED.encrypted_secret,
    updated_at = NOW();

-- ShopMax OAuth2 Client Credentials
INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret, secret_metadata, created_by, updated_by, created_at, updated_at
) VALUES (
    'shopmax-oauth2'::uuid,
    'tenant-acme',
    'ShopMax Demo OAuth2',
    'OAUTH2_CLIENT_CREDENTIALS',
    'PRODUCTION',
    'ACTIVE',
    'shopmax-demo-client:shopmax-demo-secret', -- In production, this should be encrypted
    '{"clientId": "shopmax-demo-client", "clientSecret": "shopmax-demo-secret", "tokenUrl": "http://canonbridge-mock:8080/oauth/token", "scope": "orders.read"}'::jsonb,
    'system',
    'system',
    NOW(),
    NOW()
) ON CONFLICT (credential_id) DO UPDATE SET
    encrypted_secret = EXCLUDED.encrypted_secret,
    updated_at = NOW();

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Sample credentials inserted successfully for mock services';
END $$;