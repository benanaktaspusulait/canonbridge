UPDATE etl_outbound_connections
SET credential_id = '11111111-2222-3333-4444-555555555551'
WHERE connection_id = 'f1a2b3c4-0001-4001-8001-000000000001'
  AND credential_id IS NULL;
