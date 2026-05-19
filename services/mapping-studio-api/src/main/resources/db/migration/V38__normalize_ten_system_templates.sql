-- Normalize system templates after single-tenant consolidation.
-- Earlier migrations created duplicate tenant-demo and tenant-acme templates.
-- This leaves one usable template per demo system and adds four more
-- mock-backed systems so the wizard exposes 10 distinct external systems.

DELETE FROM etl_outbound_connections
WHERE connection_id IN (
    'a1111111-aaaa-1111-1111-111111111111'::uuid,
    'b2222222-bbbb-2222-2222-222222222222'::uuid,
    'c3333333-cccc-3333-3333-333333333333'::uuid,
    'd4444444-dddd-4444-4444-444444444444'::uuid,
    'e5555555-eeee-5555-5555-555555555555'::uuid
);

UPDATE etl_outbound_connections
SET tenant_id = 'tenant-acme',
    url = 'http://canonbridge-mock:8080/grpc/customer.ProfileService/GetCustomer',
    credential_id = '21111111-2222-3333-4444-555555555555'::uuid,
    known_endpoints = '[
        {"path": "/grpc/customer.ProfileService/GetCustomer", "method": "POST", "description": "GetCustomer RPC"},
        {"path": "/grpc/customer.ProfileService/ListCustomerEvents", "method": "POST", "description": "ListCustomerEvents RPC"}
    ]'::jsonb,
    updated_at = NOW()
WHERE connection_id = 'e5555555-5555-5555-5555-555555555555'::uuid;

INSERT INTO etl_credentials (
    credential_id, tenant_id, display_name, auth_type, environment, status,
    encrypted_secret_json, created_by, created_at, updated_at
) VALUES
    (
        '30000000-0000-4000-8000-000000000001'::uuid,
        'tenant-acme',
        'InventoryPro Demo Bearer Token',
        'BEARER_TOKEN',
        'SANDBOX',
        'ACTIVE',
        '{"token": "demo-bearer-token-inventorypro"}',
        'system',
        NOW(),
        NOW()
    ),
    (
        '30000000-0000-4000-8000-000000000002'::uuid,
        'tenant-acme',
        'TicketDesk Demo Bearer Token',
        'BEARER_TOKEN',
        'SANDBOX',
        'ACTIVE',
        '{"token": "demo-bearer-token-ticketdesk"}',
        'system',
        NOW(),
        NOW()
    ),
    (
        '30000000-0000-4000-8000-000000000003'::uuid,
        'tenant-acme',
        'CloudBill Demo Bearer Token',
        'BEARER_TOKEN',
        'SANDBOX',
        'ACTIVE',
        '{"token": "demo-bearer-token-cloudbill"}',
        'system',
        NOW(),
        NOW()
    ),
    (
        '30000000-0000-4000-8000-000000000004'::uuid,
        'tenant-acme',
        'PeopleOps Demo Bearer Token',
        'BEARER_TOKEN',
        'SANDBOX',
        'ACTIVE',
        '{"token": "demo-bearer-token-peopleops"}',
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

INSERT INTO etl_outbound_connections (
    connection_id, tenant_id, draft_id, name, purpose, protocol, method, url,
    credential_id, environment, schedule, timeout_ms, retry_policy,
    response_handling, status, last_test_at, last_test_result,
    is_system_template, base_url, known_endpoints, created_at, updated_at
) VALUES
    (
        '40000000-0000-4000-8000-000000000001'::uuid,
        'tenant-acme',
        NULL,
        'InventoryPro Warehouse System',
        'SOURCE_PAYLOAD',
        'REST',
        'GET',
        'http://canonbridge-mock:8080/api/inventorypro/items/SKU-1001',
        '30000000-0000-4000-8000-000000000001'::uuid,
        'SANDBOX',
        NULL,
        5000,
        '{"maxAttempts": 3, "backoff": "exponential", "retryableStatuses": [429, 503, 504]}'::jsonb,
        '{"successField": "sku", "errorField": "error"}'::jsonb,
        'HEALTHY',
        NOW(),
        '{"statusCode": 200, "durationMs": 110, "success": true}',
        TRUE,
        'http://canonbridge-mock:8080',
        '[
            {"path": "/api/inventorypro/items/{sku}", "method": "GET", "description": "Get item stock and warehouse metadata"},
            {"path": "/api/inventorypro/stock", "method": "GET", "description": "List stock by warehouse"}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        '40000000-0000-4000-8000-000000000002'::uuid,
        'tenant-acme',
        NULL,
        'TicketDesk Support System',
        'SOURCE_PAYLOAD',
        'REST',
        'GET',
        'http://canonbridge-mock:8080/api/ticketdesk/tickets/TCK-1001',
        '30000000-0000-4000-8000-000000000002'::uuid,
        'SANDBOX',
        NULL,
        5000,
        '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 500}'::jsonb,
        '{"successField": "ticketId", "errorField": "error"}'::jsonb,
        'HEALTHY',
        NOW(),
        '{"statusCode": 200, "durationMs": 95, "success": true}',
        TRUE,
        'http://canonbridge-mock:8080',
        '[
            {"path": "/api/ticketdesk/tickets/{ticketId}", "method": "GET", "description": "Get ticket detail"},
            {"path": "/api/ticketdesk/tickets", "method": "GET", "description": "List tickets by status"}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        '40000000-0000-4000-8000-000000000003'::uuid,
        'tenant-acme',
        NULL,
        'CloudBill Billing System',
        'SOURCE_PAYLOAD',
        'REST',
        'GET',
        'http://canonbridge-mock:8080/api/cloudbill/invoices/INV-1001',
        '30000000-0000-4000-8000-000000000003'::uuid,
        'SANDBOX',
        NULL,
        5000,
        '{"maxAttempts": 3, "backoff": "exponential"}'::jsonb,
        '{"successField": "invoiceId", "errorField": "error"}'::jsonb,
        'HEALTHY',
        NOW(),
        '{"statusCode": 200, "durationMs": 120, "success": true}',
        TRUE,
        'http://canonbridge-mock:8080',
        '[
            {"path": "/api/cloudbill/invoices/{invoiceId}", "method": "GET", "description": "Get invoice detail"},
            {"path": "/api/cloudbill/usage", "method": "GET", "description": "List usage by account"}
        ]'::jsonb,
        NOW(),
        NOW()
    ),
    (
        '40000000-0000-4000-8000-000000000004'::uuid,
        'tenant-acme',
        NULL,
        'PeopleOps HR System',
        'SOURCE_PAYLOAD',
        'REST',
        'GET',
        'http://canonbridge-mock:8080/api/peopleops/employees/EMP-1001',
        '30000000-0000-4000-8000-000000000004'::uuid,
        'SANDBOX',
        NULL,
        5000,
        '{"maxAttempts": 2, "backoff": "fixed", "backoffMs": 750}'::jsonb,
        '{"successField": "employeeId", "errorField": "error"}'::jsonb,
        'HEALTHY',
        NOW(),
        '{"statusCode": 200, "durationMs": 105, "success": true}',
        TRUE,
        'http://canonbridge-mock:8080',
        '[
            {"path": "/api/peopleops/employees/{employeeId}", "method": "GET", "description": "Get employee profile"},
            {"path": "/api/peopleops/employees", "method": "GET", "description": "List employees by department"}
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
    schedule = EXCLUDED.schedule,
    timeout_ms = EXCLUDED.timeout_ms,
    retry_policy = EXCLUDED.retry_policy,
    response_handling = EXCLUDED.response_handling,
    status = EXCLUDED.status,
    last_test_at = EXCLUDED.last_test_at,
    last_test_result = EXCLUDED.last_test_result,
    is_system_template = EXCLUDED.is_system_template,
    base_url = EXCLUDED.base_url,
    known_endpoints = EXCLUDED.known_endpoints,
    updated_at = NOW();
