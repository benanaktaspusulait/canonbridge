-- Insert sample mapping drafts for testing
INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'tenant-acme',
    p.id,
    'order.created',
    'Order Created Mapping',
    'Maps incoming order.created events to canonical format',
    'WEBHOOK',
    '{"endpoint": "/webhook/orders", "method": "POST"}',
    '{"type": "object", "properties": {"orderId": {"type": "string"}}}',
    'canonical.order.v1',
    '[{"field": "orderId", "source": "$.order.id", "transform": "string"}]',
    '$merge([$.order, {"canonicalType": "order"}])',
    '{"required": ["orderId"]}',
    'DRAFT',
    (SELECT id FROM users WHERE email = 'engineer@canonbridge.io' LIMIT 1),
    (SELECT id FROM users WHERE email = 'engineer@canonbridge.io' LIMIT 1),
    NOW(),
    NOW()
FROM partners p
WHERE p.tenant_id = 'tenant-acme'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'tenant-acme',
    p.id,
    'customer.updated',
    'Customer Update Mapping',
    'Maps customer update events',
    'KAFKA',
    '{"topic": "customer-updates", "consumerGroup": "mapping-studio"}',
    '{"type": "object", "properties": {"customerId": {"type": "string"}}}',
    'canonical.customer.v1',
    '[{"field": "customerId", "source": "$.customer.id", "transform": "string"}]',
    '$merge([$.customer, {"canonicalType": "customer"}])',
    '{"required": ["customerId"]}',
    'VALID',
    (SELECT id FROM users WHERE email = 'engineer@canonbridge.io' LIMIT 1),
    (SELECT id FROM users WHERE email = 'engineer@canonbridge.io' LIMIT 1),
    NOW(),
    NOW()
FROM partners p
WHERE p.tenant_id = 'tenant-acme'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE mapping_drafts IS 'Sample mapping drafts for testing the UI';
