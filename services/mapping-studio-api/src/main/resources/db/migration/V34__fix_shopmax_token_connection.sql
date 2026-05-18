UPDATE etl_outbound_connections
SET
  credential_id = '11111111-2222-3333-4444-555555555553',
  url = 'http://canonbridge-mock:8080/oauth/token?grant_type=client_credentials&client_id=shopmax-demo-client&client_secret=shopmax-demo-secret'
WHERE connection_id = 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b'
  AND credential_id IS NULL;
