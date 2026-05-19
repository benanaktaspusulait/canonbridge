-- Seed mapping drafts, canonical schemas, and source samples for the four
-- additional mock-backed systems introduced in V38.

INSERT INTO partners (
    id, tenant_id, external_id, name, description, status,
    rate_limit_per_minute, created_by, updated_by, created_at, updated_at
) VALUES
    (
        '41000000-0000-4000-8000-000000000001'::uuid,
        'tenant-acme',
        'inventorypro',
        'InventoryPro Warehouse System',
        'Warehouse stock and replenishment API',
        'ACTIVE',
        3000,
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '41000000-0000-4000-8000-000000000002'::uuid,
        'tenant-acme',
        'ticketdesk',
        'TicketDesk Support System',
        'Customer support ticketing API',
        'ACTIVE',
        2500,
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '41000000-0000-4000-8000-000000000003'::uuid,
        'tenant-acme',
        'cloudbill',
        'CloudBill Billing System',
        'Billing, invoice, and usage API',
        'ACTIVE',
        2000,
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '41000000-0000-4000-8000-000000000004'::uuid,
        'tenant-acme',
        'peopleops',
        'PeopleOps HR System',
        'Employee profile and department API',
        'ACTIVE',
        1500,
        'system',
        'system',
        NOW(),
        NOW()
    )
ON CONFLICT (tenant_id, external_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    updated_at = NOW();

INSERT INTO schemas (
    id, tenant_id, schema_type, name, subject, version,
    schema_json, description, status, created_by, updated_by, created_at, updated_at
) VALUES
    (
        '42000000-0000-4000-8000-000000000001'::uuid,
        'tenant-acme',
        'CANONICAL',
        'InventoryStockSnapshot',
        'canonical.InventoryStockSnapshot',
        1,
        '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["sku","availableQuantity","warehouseId","updatedAt"],"properties":{"stockItemId":{"type":"string"},"sku":{"type":"string"},"name":{"type":"string"},"category":{"type":"string"},"availableQuantity":{"type":"integer"},"reservedQuantity":{"type":"integer"},"warehouseId":{"type":"string"},"warehouseCity":{"type":"string"},"reorderPoint":{"type":"integer"},"updatedAt":{"type":"string","format":"date-time"}}}'::jsonb,
        'Canonical inventory stock snapshot from warehouse APIs',
        'ACTIVE',
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '42000000-0000-4000-8000-000000000002'::uuid,
        'tenant-acme',
        'CANONICAL',
        'SupportTicketUpdated',
        'canonical.SupportTicketUpdated',
        1,
        '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["ticketId","status","priority","updatedAt"],"properties":{"ticketId":{"type":"string"},"status":{"type":"string"},"priority":{"type":"string"},"subject":{"type":"string"},"customerId":{"type":"string"},"customerName":{"type":"string"},"customerTier":{"type":"string"},"assigneeId":{"type":"string"},"assigneeName":{"type":"string"},"tags":{"type":"array","items":{"type":"string"}},"updatedAt":{"type":"string","format":"date-time"}}}'::jsonb,
        'Canonical support ticket update event',
        'ACTIVE',
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '42000000-0000-4000-8000-000000000003'::uuid,
        'tenant-acme',
        'CANONICAL',
        'BillingInvoiceIssued',
        'canonical.BillingInvoiceIssued',
        1,
        '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["invoiceId","accountId","currency","totalAmount"],"properties":{"invoiceId":{"type":"string"},"accountId":{"type":"string"},"currency":{"type":"string"},"status":{"type":"string"},"periodStart":{"type":"string","format":"date"},"periodEnd":{"type":"string","format":"date"},"lineCount":{"type":"integer"},"totalAmount":{"type":"number"},"dueDate":{"type":"string","format":"date"},"lines":{"type":"array","items":{"type":"object"}}}}'::jsonb,
        'Canonical invoice issued event',
        'ACTIVE',
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '42000000-0000-4000-8000-000000000004'::uuid,
        'tenant-acme',
        'CANONICAL',
        'EmployeeProfileUpdated',
        'canonical.EmployeeProfileUpdated',
        1,
        '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["employeeId","email","employmentStatus","updatedAt"],"properties":{"employeeId":{"type":"string"},"externalRef":{"type":"string"},"fullName":{"type":"string"},"email":{"type":"string","format":"email"},"department":{"type":"string"},"title":{"type":"string"},"employmentStatus":{"type":"string"},"updatedAt":{"type":"string","format":"date-time"}}}'::jsonb,
        'Canonical employee profile update event',
        'ACTIVE',
        'system',
        'system',
        NOW(),
        NOW()
    )
ON CONFLICT (tenant_id, subject, version) DO UPDATE SET
    schema_json = EXCLUDED.schema_json,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
) VALUES
    (
        '43000000-0000-4000-8000-000000000001'::uuid,
        'tenant-acme',
        '41000000-0000-4000-8000-000000000001'::uuid,
        'inventory.stock.snapshot',
        'InventoryPro Stock Snapshot Mapping',
        'Maps InventoryPro item stock responses to canonical inventory snapshots',
        'REST_API',
        jsonb_build_object(
            'connectionId', '40000000-0000-4000-8000-000000000001',
            'path', '/api/inventorypro/items/SKU-1001',
            'method', 'GET',
            'sourceJson', '{"sku":"SKU-1001","name":"Replacement Motor Assembly","category":"MRO","availableQuantity":17,"reservedQuantity":4,"warehouse":{"id":"WH-LON-01","city":"London","country":"GB"},"reorderPoint":20,"updatedAt":"2026-05-19T15:45:00Z"}'
        ),
        '{"type":"object","required":["sku","availableQuantity","warehouse","updatedAt"],"properties":{"sku":{"type":"string"},"name":{"type":"string"},"category":{"type":"string"},"availableQuantity":{"type":"integer"},"reservedQuantity":{"type":"integer"},"warehouse":{"type":"object"},"reorderPoint":{"type":"integer"},"updatedAt":{"type":"string"}}}'::jsonb,
        '42000000-0000-4000-8000-000000000001',
        '[
            {"field":"stockItemId","source":"$.sku","transform":"string"},
            {"field":"sku","source":"$.sku","transform":"string"},
            {"field":"name","source":"$.name","transform":"string"},
            {"field":"category","source":"$.category","transform":"string"},
            {"field":"availableQuantity","source":"$.availableQuantity","transform":"number"},
            {"field":"reservedQuantity","source":"$.reservedQuantity","transform":"number"},
            {"field":"warehouseId","source":"$.warehouse.id","transform":"string"},
            {"field":"warehouseCity","source":"$.warehouse.city","transform":"string"},
            {"field":"reorderPoint","source":"$.reorderPoint","transform":"number"},
            {"field":"updatedAt","source":"$.updatedAt","transform":"string"}
        ]'::jsonb,
        '{"stockItemId": $.sku, "sku": $.sku, "name": $.name, "category": $.category, "availableQuantity": $.availableQuantity, "reservedQuantity": $.reservedQuantity, "warehouseId": $.warehouse.id, "warehouseCity": $.warehouse.city, "reorderPoint": $.reorderPoint, "updatedAt": $.updatedAt}',
        '{"required":["sku","availableQuantity","warehouse","updatedAt"]}'::jsonb,
        'VALID',
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '43000000-0000-4000-8000-000000000002'::uuid,
        'tenant-acme',
        '41000000-0000-4000-8000-000000000002'::uuid,
        'support.ticket.updated',
        'TicketDesk Support Ticket Mapping',
        'Maps TicketDesk ticket details to canonical support ticket updates',
        'REST_API',
        jsonb_build_object(
            'connectionId', '40000000-0000-4000-8000-000000000002',
            'path', '/api/ticketdesk/tickets/TCK-1001',
            'method', 'GET',
            'sourceJson', '{"ticketId":"TCK-1001","status":"OPEN","priority":"HIGH","subject":"Webhook retries failing","customer":{"id":"CUST-4421","name":"Northstar Retail","tier":"ENTERPRISE"},"assignee":{"id":"USR-19","name":"Selin Kaya"},"tags":["integration","partner-api"],"updatedAt":"2026-05-19T15:15:00Z"}'
        ),
        '{"type":"object","required":["ticketId","status","priority","updatedAt"],"properties":{"ticketId":{"type":"string"},"status":{"type":"string"},"priority":{"type":"string"},"subject":{"type":"string"},"customer":{"type":"object"},"assignee":{"type":"object"},"tags":{"type":"array"},"updatedAt":{"type":"string"}}}'::jsonb,
        '42000000-0000-4000-8000-000000000002',
        '[
            {"field":"ticketId","source":"$.ticketId","transform":"string"},
            {"field":"status","source":"$.status","transform":"string"},
            {"field":"priority","source":"$.priority","transform":"string"},
            {"field":"subject","source":"$.subject","transform":"string"},
            {"field":"customerId","source":"$.customer.id","transform":"string"},
            {"field":"customerName","source":"$.customer.name","transform":"string"},
            {"field":"customerTier","source":"$.customer.tier","transform":"string"},
            {"field":"assigneeId","source":"$.assignee.id","transform":"string"},
            {"field":"assigneeName","source":"$.assignee.name","transform":"string"},
            {"field":"tags","source":"$.tags","transform":"array"},
            {"field":"updatedAt","source":"$.updatedAt","transform":"string"}
        ]'::jsonb,
        '{"ticketId": $.ticketId, "status": $.status, "priority": $.priority, "subject": $.subject, "customerId": $.customer.id, "customerName": $.customer.name, "customerTier": $.customer.tier, "assigneeId": $.assignee.id, "assigneeName": $.assignee.name, "tags": $.tags, "updatedAt": $.updatedAt}',
        '{"required":["ticketId","status","priority","updatedAt"]}'::jsonb,
        'VALID',
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '43000000-0000-4000-8000-000000000003'::uuid,
        'tenant-acme',
        '41000000-0000-4000-8000-000000000003'::uuid,
        'billing.invoice.issued',
        'CloudBill Invoice Mapping',
        'Maps CloudBill invoice details to canonical billing events',
        'REST_API',
        jsonb_build_object(
            'connectionId', '40000000-0000-4000-8000-000000000003',
            'path', '/api/cloudbill/invoices/INV-1001',
            'method', 'GET',
            'sourceJson', '{"invoiceId":"INV-1001","accountId":"ACCT-9001","currency":"USD","status":"ISSUED","periodStart":"2026-05-01","periodEnd":"2026-05-31","lines":[{"sku":"CB-EVENTS","description":"Processed events","quantity":125000,"amount":875.0},{"sku":"CB-CONNECTORS","description":"Active connectors","quantity":10,"amount":300.0}],"totalAmount":1175.0,"dueDate":"2026-06-15"}'
        ),
        '{"type":"object","required":["invoiceId","accountId","currency","totalAmount"],"properties":{"invoiceId":{"type":"string"},"accountId":{"type":"string"},"currency":{"type":"string"},"status":{"type":"string"},"periodStart":{"type":"string"},"periodEnd":{"type":"string"},"lines":{"type":"array"},"totalAmount":{"type":"number"},"dueDate":{"type":"string"}}}'::jsonb,
        '42000000-0000-4000-8000-000000000003',
        '[
            {"field":"invoiceId","source":"$.invoiceId","transform":"string"},
            {"field":"accountId","source":"$.accountId","transform":"string"},
            {"field":"currency","source":"$.currency","transform":"string"},
            {"field":"status","source":"$.status","transform":"string"},
            {"field":"periodStart","source":"$.periodStart","transform":"string"},
            {"field":"periodEnd","source":"$.periodEnd","transform":"string"},
            {"field":"lines","source":"$.lines","transform":"array"},
            {"field":"totalAmount","source":"$.totalAmount","transform":"number"},
            {"field":"dueDate","source":"$.dueDate","transform":"string"}
        ]'::jsonb,
        '{"invoiceId": $.invoiceId, "accountId": $.accountId, "currency": $.currency, "status": $.status, "periodStart": $.periodStart, "periodEnd": $.periodEnd, "lineCount": $count($.lines), "lines": $.lines, "totalAmount": $.totalAmount, "dueDate": $.dueDate}',
        '{"required":["invoiceId","accountId","currency","totalAmount"]}'::jsonb,
        'VALID',
        'system',
        'system',
        NOW(),
        NOW()
    ),
    (
        '43000000-0000-4000-8000-000000000004'::uuid,
        'tenant-acme',
        '41000000-0000-4000-8000-000000000004'::uuid,
        'employee.profile.updated',
        'PeopleOps Employee Profile Mapping',
        'Maps PeopleOps employee profiles to canonical employee profile updates',
        'REST_API',
        jsonb_build_object(
            'connectionId', '40000000-0000-4000-8000-000000000004',
            'path', '/api/peopleops/employees/EMP-1001',
            'method', 'GET',
            'sourceJson', '{"employeeId":"EMP-1001","externalRef":"PO-EMP-1001","firstName":"Deniz","lastName":"Arslan","email":"emp-1001@example.com","department":"Engineering","title":"Integration Lead","employmentStatus":"ACTIVE","updatedAt":"2026-05-19T15:00:00Z"}'
        ),
        '{"type":"object","required":["employeeId","email","employmentStatus","updatedAt"],"properties":{"employeeId":{"type":"string"},"externalRef":{"type":"string"},"firstName":{"type":"string"},"lastName":{"type":"string"},"email":{"type":"string"},"department":{"type":"string"},"title":{"type":"string"},"employmentStatus":{"type":"string"},"updatedAt":{"type":"string"}}}'::jsonb,
        '42000000-0000-4000-8000-000000000004',
        '[
            {"field":"employeeId","source":"$.employeeId","transform":"string"},
            {"field":"externalRef","source":"$.externalRef","transform":"string"},
            {"field":"fullName","source":"$.firstName","transform":"concat","params":{"paramA":"lastName","paramB":" "}},
            {"field":"email","source":"$.email","transform":"string"},
            {"field":"department","source":"$.department","transform":"string"},
            {"field":"title","source":"$.title","transform":"string"},
            {"field":"employmentStatus","source":"$.employmentStatus","transform":"string"},
            {"field":"updatedAt","source":"$.updatedAt","transform":"string"}
        ]'::jsonb,
        '{"employeeId": $.employeeId, "externalRef": $.externalRef, "fullName": $.firstName & " " & $.lastName, "email": $.email, "department": $.department, "title": $.title, "employmentStatus": $.employmentStatus, "updatedAt": $.updatedAt}',
        '{"required":["employeeId","email","employmentStatus","updatedAt"]}'::jsonb,
        'VALID',
        'system',
        'system',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    partner_id = EXCLUDED.partner_id,
    event_type = EXCLUDED.event_type,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    source_type = EXCLUDED.source_type,
    source_config = EXCLUDED.source_config,
    input_schema = EXCLUDED.input_schema,
    canonical_schema_ref = EXCLUDED.canonical_schema_ref,
    mapping_rules = EXCLUDED.mapping_rules,
    generated_jsonata = EXCLUDED.generated_jsonata,
    validation_rules = EXCLUDED.validation_rules,
    status = EXCLUDED.status,
    updated_at = NOW();

UPDATE etl_outbound_connections
SET draft_id = CASE connection_id
    WHEN '40000000-0000-4000-8000-000000000001'::uuid THEN '43000000-0000-4000-8000-000000000001'::uuid
    WHEN '40000000-0000-4000-8000-000000000002'::uuid THEN '43000000-0000-4000-8000-000000000002'::uuid
    WHEN '40000000-0000-4000-8000-000000000003'::uuid THEN '43000000-0000-4000-8000-000000000003'::uuid
    WHEN '40000000-0000-4000-8000-000000000004'::uuid THEN '43000000-0000-4000-8000-000000000004'::uuid
    ELSE draft_id
END,
updated_at = NOW()
WHERE connection_id IN (
    '40000000-0000-4000-8000-000000000001'::uuid,
    '40000000-0000-4000-8000-000000000002'::uuid,
    '40000000-0000-4000-8000-000000000003'::uuid,
    '40000000-0000-4000-8000-000000000004'::uuid
);

INSERT INTO etl_sample_payloads (
    sample_id, tenant_id, draft_id, source_config_id, name, tag,
    content_type, payload, payload_sha256, size_bytes, contains_pii,
    created_by, created_at
) VALUES
    (
        '44000000-0000-4000-8000-000000000001'::uuid,
        'tenant-acme',
        '43000000-0000-4000-8000-000000000001'::uuid,
        '40000000-0000-4000-8000-000000000001'::uuid,
        'InventoryPro stock item sample',
        'EXTERNAL_API_RESPONSE',
        'application/json',
        '{"sku":"SKU-1001","name":"Replacement Motor Assembly","category":"MRO","availableQuantity":17,"reservedQuantity":4,"warehouse":{"id":"WH-LON-01","city":"London","country":"GB"},"reorderPoint":20,"updatedAt":"2026-05-19T15:45:00Z"}'::jsonb,
        '0000000000000000000000000000000000000000000000000000000000000001',
        226,
        FALSE,
        'system',
        NOW()
    ),
    (
        '44000000-0000-4000-8000-000000000002'::uuid,
        'tenant-acme',
        '43000000-0000-4000-8000-000000000002'::uuid,
        '40000000-0000-4000-8000-000000000002'::uuid,
        'TicketDesk ticket sample',
        'EXTERNAL_API_RESPONSE',
        'application/json',
        '{"ticketId":"TCK-1001","status":"OPEN","priority":"HIGH","subject":"Webhook retries failing","customer":{"id":"CUST-4421","name":"Northstar Retail","tier":"ENTERPRISE"},"assignee":{"id":"USR-19","name":"Selin Kaya"},"tags":["integration","partner-api"],"updatedAt":"2026-05-19T15:15:00Z"}'::jsonb,
        '0000000000000000000000000000000000000000000000000000000000000002',
        297,
        TRUE,
        'system',
        NOW()
    ),
    (
        '44000000-0000-4000-8000-000000000003'::uuid,
        'tenant-acme',
        '43000000-0000-4000-8000-000000000003'::uuid,
        '40000000-0000-4000-8000-000000000003'::uuid,
        'CloudBill invoice sample',
        'EXTERNAL_API_RESPONSE',
        'application/json',
        '{"invoiceId":"INV-1001","accountId":"ACCT-9001","currency":"USD","status":"ISSUED","periodStart":"2026-05-01","periodEnd":"2026-05-31","lines":[{"sku":"CB-EVENTS","description":"Processed events","quantity":125000,"amount":875.0},{"sku":"CB-CONNECTORS","description":"Active connectors","quantity":10,"amount":300.0}],"totalAmount":1175.0,"dueDate":"2026-06-15"}'::jsonb,
        '0000000000000000000000000000000000000000000000000000000000000003',
        382,
        FALSE,
        'system',
        NOW()
    ),
    (
        '44000000-0000-4000-8000-000000000004'::uuid,
        'tenant-acme',
        '43000000-0000-4000-8000-000000000004'::uuid,
        '40000000-0000-4000-8000-000000000004'::uuid,
        'PeopleOps employee sample',
        'EXTERNAL_API_RESPONSE',
        'application/json',
        '{"employeeId":"EMP-1001","externalRef":"PO-EMP-1001","firstName":"Deniz","lastName":"Arslan","email":"emp-1001@example.com","department":"Engineering","title":"Integration Lead","employmentStatus":"ACTIVE","updatedAt":"2026-05-19T15:00:00Z"}'::jsonb,
        '0000000000000000000000000000000000000000000000000000000000000004',
        244,
        TRUE,
        'system',
        NOW()
    )
ON CONFLICT (sample_id) DO UPDATE SET
    payload = EXCLUDED.payload,
    payload_sha256 = EXCLUDED.payload_sha256,
    size_bytes = EXCLUDED.size_bytes,
    contains_pii = EXCLUDED.contains_pii;

DO $$
DECLARE
    template_rows INTEGER;
    template_count INTEGER;
BEGIN
    SELECT COUNT(*), COUNT(DISTINCT name)
    INTO template_rows, template_count
    FROM etl_outbound_connections
    WHERE tenant_id = 'tenant-acme'
      AND is_system_template IS TRUE;

    IF template_rows <> 10 OR template_count <> 10 THEN
        RAISE EXCEPTION 'Expected 10 tenant-acme system template rows with 10 distinct names, found % rows and % distinct names',
            template_rows, template_count;
    END IF;
END $$;
