-- Initial Data for CanonBridge Mapping Studio
-- This migration inserts demo/initial data for development and testing

-- Insert demo partners for tenant-acme
INSERT INTO partners (id, tenant_id, external_id, name, description, status, rate_limit_per_minute, created_by, updated_by, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'tenant-acme', 'acme-marketplace', 'ACME Marketplace', 'Primary marketplace partner', 'ACTIVE', 5000, 'system', 'system', NOW(), NOW()),
    (gen_random_uuid(), 'tenant-acme', 'logistics-xpress', 'Logistics Xpress', 'Shipping and tracking events', 'ACTIVE', 3000, 'system', 'system', NOW(), NOW()),
    (gen_random_uuid(), 'tenant-acme', 'payment-gateway', 'Payment Gateway', 'Payment authorization events', 'ACTIVE', 2000, 'system', 'system', NOW(), NOW()),
    (gen_random_uuid(), 'tenant-acme', 'crm-connect', 'CRM Connect', 'Customer data sync', 'INACTIVE', 1000, 'system', 'system', NOW(), NOW()),
    (gen_random_uuid(), 'tenant-acme', 'inventory-hub', 'Inventory Hub', 'Stock level and warehouse events', 'ACTIVE', 1500, 'system', 'system', NOW(), NOW())
ON CONFLICT (tenant_id, external_id) DO NOTHING;

-- Insert demo schemas for canonical events
INSERT INTO schemas (id, tenant_id, schema_type, schema_name, schema_version, schema_definition, description, status, created_by, updated_by, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'tenant-acme', 'CANONICAL', 'OrderCreated', 'v1', 
     '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["orderId","customerName","totalAmount","status"],"properties":{"orderId":{"type":"string"},"customerName":{"type":"string"},"customerEmail":{"type":"string","format":"email"},"status":{"type":"string","enum":["PENDING","ACTIVE","CANCELLED"]},"totalAmount":{"type":"number","minimum":0},"currency":{"type":"string","default":"USD"},"items":{"type":"array","items":{"type":"object","required":["productId","quantity","unitPrice"],"properties":{"productId":{"type":"string"},"productName":{"type":"string"},"quantity":{"type":"integer","minimum":1},"unitPrice":{"type":"number","minimum":0}}}}}}',
     'Canonical schema for order created events', 'ACTIVE', 'system', 'system', NOW(), NOW()),
    (gen_random_uuid(), 'tenant-acme', 'CANONICAL', 'ShipmentCreated', 'v1',
     '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["shipmentId","orderId","carrier","trackingNumber"],"properties":{"shipmentId":{"type":"string"},"orderId":{"type":"string"},"carrier":{"type":"string"},"trackingNumber":{"type":"string"},"estimatedDelivery":{"type":"string","format":"date-time"},"status":{"type":"string","enum":["PENDING","IN_TRANSIT","DELIVERED","FAILED"]}}}',
     'Canonical schema for shipment created events', 'ACTIVE', 'system', 'system', NOW(), NOW()),
    (gen_random_uuid(), 'tenant-acme', 'CANONICAL', 'PaymentProcessed', 'v1',
     '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["paymentId","orderId","amount","status"],"properties":{"paymentId":{"type":"string"},"orderId":{"type":"string"},"amount":{"type":"number","minimum":0},"currency":{"type":"string","default":"USD"},"status":{"type":"string","enum":["PENDING","AUTHORIZED","CAPTURED","FAILED","REFUNDED"]},"paymentMethod":{"type":"string"},"transactionId":{"type":"string"}}}',
     'Canonical schema for payment processed events', 'ACTIVE', 'system', 'system', NOW(), NOW())
ON CONFLICT (tenant_id, schema_type, schema_name, schema_version) DO NOTHING;

-- Insert demo mapping drafts
DO $$
DECLARE
    partner_acme_id UUID;
    partner_logistics_id UUID;
    partner_payment_id UUID;
    schema_order_id UUID;
    schema_shipment_id UUID;
    schema_payment_id UUID;
BEGIN
    -- Get partner IDs
    SELECT id INTO partner_acme_id FROM partners WHERE tenant_id = 'tenant-acme' AND external_id = 'acme-marketplace' LIMIT 1;
    SELECT id INTO partner_logistics_id FROM partners WHERE tenant_id = 'tenant-acme' AND external_id = 'logistics-xpress' LIMIT 1;
    SELECT id INTO partner_payment_id FROM partners WHERE tenant_id = 'tenant-acme' AND external_id = 'payment-gateway' LIMIT 1;
    
    -- Get schema IDs
    SELECT id INTO schema_order_id FROM schemas WHERE tenant_id = 'tenant-acme' AND schema_name = 'OrderCreated' AND schema_version = 'v1' LIMIT 1;
    SELECT id INTO schema_shipment_id FROM schemas WHERE tenant_id = 'tenant-acme' AND schema_name = 'ShipmentCreated' AND schema_version = 'v1' LIMIT 1;
    SELECT id INTO schema_payment_id FROM schemas WHERE tenant_id = 'tenant-acme' AND schema_name = 'PaymentProcessed' AND schema_version = 'v1' LIMIT 1;
    
    -- Insert mapping drafts if partners and schemas exist
    IF partner_acme_id IS NOT NULL AND schema_order_id IS NOT NULL THEN
        INSERT INTO mapping_drafts (id, tenant_id, partner_id, event_type, name, description, source_type, canonical_schema_ref, status, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'tenant-acme', partner_acme_id, 'OrderCreated', 'ACME Order Mapping', 'Maps ACME marketplace orders to canonical format', 'WEBHOOK', schema_order_id::TEXT, 'DRAFT', 'system', 'system', NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF partner_logistics_id IS NOT NULL AND schema_shipment_id IS NOT NULL THEN
        INSERT INTO mapping_drafts (id, tenant_id, partner_id, event_type, name, description, source_type, canonical_schema_ref, status, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'tenant-acme', partner_logistics_id, 'ShipmentCreated', 'Logistics Shipment Mapping', 'Maps logistics shipment events to canonical format', 'WEBHOOK', schema_shipment_id::TEXT, 'DRAFT', 'system', 'system', NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF partner_payment_id IS NOT NULL AND schema_payment_id IS NOT NULL THEN
        INSERT INTO mapping_drafts (id, tenant_id, partner_id, event_type, name, description, source_type, canonical_schema_ref, status, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'tenant-acme', partner_payment_id, 'PaymentProcessed', 'Payment Gateway Mapping', 'Maps payment gateway events to canonical format', 'WEBHOOK', schema_payment_id::TEXT, 'DRAFT', 'system', 'system', NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert demo external systems (for outbound connections)
INSERT INTO external_systems (id, tenant_id, name, description, protocol, base_url, status, created_by, updated_by, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'tenant-acme', 'ERP System', 'Internal ERP for order processing', 'REST', 'https://erp.acme.internal/api', 'ACTIVE', 'system', 'system', NOW(), NOW()),
    (gen_random_uuid(), 'tenant-acme', 'Warehouse Management', 'WMS for inventory updates', 'REST', 'https://wms.acme.internal/api', 'ACTIVE', 'system', 'system', NOW(), NOW()),
    (gen_random_uuid(), 'tenant-acme', 'Customer Portal', 'Customer-facing portal API', 'REST', 'https://portal.acme.com/api', 'ACTIVE', 'system', 'system', NOW(), NOW())
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Initial data inserted successfully for tenant-acme';
END $$;
