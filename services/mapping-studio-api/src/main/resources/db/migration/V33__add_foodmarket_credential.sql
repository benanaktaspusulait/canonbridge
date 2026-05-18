INSERT INTO etl_credentials (credential_id, tenant_id, display_name, auth_type, environment, status, encrypted_secret_json, created_by)
VALUES (
  'f7000000-7777-7777-7777-000000000001',
  'tenant-acme',
  'FoodMarket Demo Bearer Token',
  'BEARER_TOKEN',
  'SANDBOX',
  'ACTIVE',
  '{"token": "demo-bearer-token-foodmarket"}',
  'system'
)
ON CONFLICT (credential_id) DO NOTHING;

UPDATE etl_outbound_connections
SET credential_id = 'f7000000-7777-7777-7777-000000000001'
WHERE connection_id = 'f7777777-7777-7777-7777-777777777777'
  AND credential_id IS NULL;
