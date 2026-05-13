-- Mock Service Mappings for PayFlex, FastCargo, and ShopMax
-- This migration creates realistic mappings that work with canonbridge-mock service

-- Insert PayFlex, FastCargo, and ShopMax partners
INSERT INTO partners (id, tenant_id, external_id, name, description, status, rate_limit_per_minute, created_by, updated_by, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'tenant-demo', 'payflex', 'PayFlex Payment Gateway', 'Payment processing and webhook events', 'ACTIVE', 5000, 'system', 'system', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'tenant-demo', 'fastcargo', 'FastCargo Logistics', 'SOAP-based shipment tracking', 'ACTIVE', 3000, 'system', 'system', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'tenant-demo', 'shopmax', 'ShopMax E-Commerce', 'E-commerce order events via Kafka', 'ACTIVE', 4000, 'system', 'system', NOW(), NOW())
ON CONFLICT (tenant_id, external_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();


-- Insert canonical schemas for mock services
INSERT INTO schemas (id, tenant_id, schema_type, name, subject, version, schema_json, description, status, created_by, updated_by, created_at, updated_at)
VALUES
    ('44444444-4444-4444-4444-444444444444'::uuid, 'tenant-demo', 'CANONICAL', 'PaymentCompleted', 'canonical.PaymentCompleted', 1,
     '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["transactionId","amount","currency","status"],"properties":{"transactionId":{"type":"string"},"merchantId":{"type":"string"},"amount":{"type":"number","minimum":0},"currency":{"type":"string"},"status":{"type":"string","enum":["SUCCESS","FAILED","REFUNDED"]},"paymentMethod":{"type":"string"},"cardLast4":{"type":"string"},"cardBrand":{"type":"string"},"customerEmail":{"type":"string","format":"email"},"customerName":{"type":"string"},"billingAddress":{"type":"object"},"metadata":{"type":"object"},"timestamp":{"type":"string","format":"date-time"}}}'::jsonb,
     'Canonical schema for payment completed events from PayFlex', 'ACTIVE', 'system', 'system', NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'tenant-demo', 'CANONICAL', 'ShipmentStatus', 'canonical.ShipmentStatus', 1,
     '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["trackingNumber","status"],"properties":{"trackingNumber":{"type":"string"},"status":{"type":"string","enum":["PICKED_UP","IN_TRANSIT","DELIVERED","FAILED"]},"currentLocation":{"type":"object","properties":{"facility":{"type":"string"},"city":{"type":"string"},"state":{"type":"string"},"country":{"type":"string"},"timestamp":{"type":"string","format":"date-time"}}},"estimatedDelivery":{"type":"string","format":"date-time"},"weight":{"type":"number"},"weightUnit":{"type":"string"},"deliveryDetails":{"type":"object"},"history":{"type":"array"}}}'::jsonb,
     'Canonical schema for shipment status from FastCargo', 'ACTIVE', 'system', 'system', NOW(), NOW()),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'tenant-demo', 'CANONICAL', 'OrderCreated', 'canonical.OrderCreated', 1,
     '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","required":["orderId","customerId","totalAmount","currency"],"properties":{"eventId":{"type":"string"},"orderId":{"type":"string"},"customerId":{"type":"string"},"customerEmail":{"type":"string","format":"email"},"items":{"type":"array","items":{"type":"object","required":["sku","name","quantity","unitPrice"],"properties":{"sku":{"type":"string"},"name":{"type":"string"},"category":{"type":"string"},"quantity":{"type":"integer","minimum":1},"unitPrice":{"type":"number"},"totalPrice":{"type":"number"},"taxAmount":{"type":"number"}}}},"subtotal":{"type":"number"},"taxTotal":{"type":"number"},"shippingCost":{"type":"number"},"totalAmount":{"type":"number"},"currency":{"type":"string"},"paymentMethod":{"type":"string"},"paymentStatus":{"type":"string"},"shippingAddress":{"type":"object"},"billingAddress":{"type":"object"},"shippingMethod":{"type":"string"},"estimatedDelivery":{"type":"string","format":"date-time"},"timestamp":{"type":"string","format":"date-time"}}}'::jsonb,
     'Canonical schema for order created events from ShopMax', 'ACTIVE', 'system', 'system', NOW(), NOW())
ON CONFLICT (tenant_id, subject, version) DO UPDATE SET
    schema_json = EXCLUDED.schema_json,
    description = EXCLUDED.description,
    updated_at = NOW();


-- PayFlex Payment Webhook Mapping (Nested JSON Format)
INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
) VALUES (
    '77777777-7777-7777-7777-777777777777'::uuid,
    'tenant-demo',
    '11111111-1111-1111-1111-111111111111'::uuid,
    'payment.completed',
    'PayFlex Payment Webhook Mapping',
    'Maps PayFlex payment webhook events to canonical payment format',
    'WEBHOOK',
    '{"endpoint": "/webhook/payflex/payment", "method": "POST", "authType": "WEBHOOK_KEY", "webhookKey": "payflex-secret-key"}'::jsonb,
    '{"type":"object","required":["transactionId","amount","currency","status"],"properties":{"transactionId":{"type":"string"},"merchantId":{"type":"string"},"amount":{"type":"number"},"currency":{"type":"string"},"status":{"type":"string"},"paymentMethod":{"type":"string"},"cardLast4":{"type":"string"},"cardBrand":{"type":"string"},"customerEmail":{"type":"string"},"customerName":{"type":"string"},"billingAddress":{"type":"object"},"metadata":{"type":"object"},"timestamp":{"type":"string"}}}'::jsonb,
    '44444444-4444-4444-4444-444444444444',
    '[
        {"field": "transactionId", "source": "$.transactionId", "transform": "string"},
        {"field": "merchantId", "source": "$.merchantId", "transform": "string"},
        {"field": "amount", "source": "$.amount", "transform": "number"},
        {"field": "currency", "source": "$.currency", "transform": "string"},
        {"field": "status", "source": "$.status", "transform": "string"},
        {"field": "paymentMethod", "source": "$.paymentMethod", "transform": "string"},
        {"field": "cardLast4", "source": "$.cardLast4", "transform": "string"},
        {"field": "cardBrand", "source": "$.cardBrand", "transform": "string"},
        {"field": "customerEmail", "source": "$.customerEmail", "transform": "string"},
        {"field": "customerName", "source": "$.customerName", "transform": "string"},
        {"field": "billingAddress", "source": "$.billingAddress", "transform": "object"},
        {"field": "metadata", "source": "$.metadata", "transform": "object"},
        {"field": "timestamp", "source": "$.timestamp", "transform": "string"}
    ]'::jsonb,
    '{
        "transactionId": $.transactionId,
        "merchantId": $.merchantId,
        "amount": $.amount,
        "currency": $.currency,
        "status": $.status,
        "paymentMethod": $.paymentMethod,
        "cardLast4": $.cardLast4,
        "cardBrand": $.cardBrand,
        "customerEmail": $.customerEmail,
        "customerName": $.customerName,
        "billingAddress": $.billingAddress,
        "metadata": $.metadata,
        "timestamp": $.timestamp
    }',
    '{"required": ["transactionId", "amount", "currency", "status"]}'::jsonb,
    'VALID',
    'system',
    'system',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    mapping_rules = EXCLUDED.mapping_rules,
    generated_jsonata = EXCLUDED.generated_jsonata,
    updated_at = NOW();


-- FastCargo SOAP Shipment Tracking Mapping
INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
) VALUES (
    '88888888-8888-8888-8888-888888888888'::uuid,
    'tenant-demo',
    '22222222-2222-2222-2222-222222222222'::uuid,
    'shipment.status',
    'FastCargo SOAP Tracking Mapping',
    'Maps FastCargo SOAP shipment tracking responses to canonical format',
    'SOAP',
    '{"endpoint": "http://canonbridge-mock:8080/ws/track", "wsdlUrl": "http://canonbridge-mock:8080/wsdl/fastcargo.wsdl", "authType": "BASIC_AUTH", "username": "fastcargo-demo", "password": "fastcargo-secret", "soapAction": "getShipmentStatus"}'::jsonb,
    '{"type":"object","required":["trackingNumber","status"],"properties":{"trackingNumber":{"type":"string"},"status":{"type":"string"},"currentLocation":{"type":"object"},"estimatedDelivery":{"type":"string"},"weight":{"type":"number"},"weightUnit":{"type":"string"},"dimensions":{"type":"object"},"history":{"type":"array"},"deliveryDetails":{"type":"object"}}}'::jsonb,
    '55555555-5555-5555-5555-555555555555',
    '[
        {"field": "trackingNumber", "source": "$.trackingNumber", "transform": "string"},
        {"field": "status", "source": "$.status", "transform": "string"},
        {"field": "currentLocation", "source": "$.currentLocation", "transform": "object"},
        {"field": "estimatedDelivery", "source": "$.estimatedDelivery", "transform": "string"},
        {"field": "weight", "source": "$.weight", "transform": "number"},
        {"field": "weightUnit", "source": "$.weightUnit", "transform": "string"},
        {"field": "deliveryDetails", "source": "$.deliveryDetails", "transform": "object"},
        {"field": "history", "source": "$.history", "transform": "array"}
    ]'::jsonb,
    '{
        "trackingNumber": $.trackingNumber,
        "status": $.status,
        "currentLocation": $.currentLocation,
        "estimatedDelivery": $.estimatedDelivery,
        "weight": $.weight,
        "weightUnit": $.weightUnit,
        "deliveryDetails": $.deliveryDetails,
        "history": $.history
    }',
    '{"required": ["trackingNumber", "status"]}'::jsonb,
    'VALID',
    'system',
    'system',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    mapping_rules = EXCLUDED.mapping_rules,
    generated_jsonata = EXCLUDED.generated_jsonata,
    updated_at = NOW();


-- ShopMax Kafka Order Created Mapping
INSERT INTO mapping_drafts (
    id, tenant_id, partner_id, event_type, name, description,
    source_type, source_config, input_schema, canonical_schema_ref,
    mapping_rules, generated_jsonata, validation_rules,
    status, created_by, updated_by, created_at, updated_at
) VALUES (
    '99999999-9999-9999-9999-999999999999'::uuid,
    'tenant-demo',
    '33333333-3333-3333-3333-333333333333'::uuid,
    'order.created',
    'ShopMax Order Created Kafka Mapping',
    'Maps ShopMax order.created events from Kafka to canonical order format',
    'KAFKA',
    '{"topic": "partner.shopmax.raw", "consumerGroup": "canonbridge-transformer", "bootstrapServers": "kafka:29092"}'::jsonb,
    '{"type":"object","required":["eventId","orderId","customerId","totalAmount","currency"],"properties":{"eventId":{"type":"string"},"timestamp":{"type":"string"},"eventType":{"type":"string"},"orderId":{"type":"string"},"customerId":{"type":"string"},"customerEmail":{"type":"string"},"items":{"type":"array"},"subtotal":{"type":"number"},"taxTotal":{"type":"number"},"shippingCost":{"type":"number"},"totalAmount":{"type":"number"},"currency":{"type":"string"},"paymentMethod":{"type":"string"},"paymentStatus":{"type":"string"},"shippingAddress":{"type":"object"},"billingAddress":{"type":"object"},"shippingMethod":{"type":"string"},"estimatedDelivery":{"type":"string"},"notes":{"type":"string"},"source":{"type":"string"},"metadata":{"type":"object"}}}'::jsonb,
    '66666666-6666-6666-6666-666666666666',
    '[
        {"field": "eventId", "source": "$.eventId", "transform": "string"},
        {"field": "orderId", "source": "$.orderId", "transform": "string"},
        {"field": "customerId", "source": "$.customerId", "transform": "string"},
        {"field": "customerEmail", "source": "$.customerEmail", "transform": "string"},
        {"field": "items", "source": "$.items", "transform": "array"},
        {"field": "subtotal", "source": "$.subtotal", "transform": "number"},
        {"field": "taxTotal", "source": "$.taxTotal", "transform": "number"},
        {"field": "shippingCost", "source": "$.shippingCost", "transform": "number"},
        {"field": "totalAmount", "source": "$.totalAmount", "transform": "number"},
        {"field": "currency", "source": "$.currency", "transform": "string"},
        {"field": "paymentMethod", "source": "$.paymentMethod", "transform": "string"},
        {"field": "paymentStatus", "source": "$.paymentStatus", "transform": "string"},
        {"field": "shippingAddress", "source": "$.shippingAddress", "transform": "object"},
        {"field": "billingAddress", "source": "$.billingAddress", "transform": "object"},
        {"field": "shippingMethod", "source": "$.shippingMethod", "transform": "string"},
        {"field": "estimatedDelivery", "source": "$.estimatedDelivery", "transform": "string"},
        {"field": "timestamp", "source": "$.timestamp", "transform": "string"}
    ]'::jsonb,
    '{
        "eventId": $.eventId,
        "orderId": $.orderId,
        "customerId": $.customerId,
        "customerEmail": $.customerEmail,
        "items": $.items,
        "subtotal": $.subtotal,
        "taxTotal": $.taxTotal,
        "shippingCost": $.shippingCost,
        "totalAmount": $.totalAmount,
        "currency": $.currency,
        "paymentMethod": $.paymentMethod,
        "paymentStatus": $.paymentStatus,
        "shippingAddress": $.shippingAddress,
        "billingAddress": $.billingAddress,
        "shippingMethod": $.shippingMethod,
        "estimatedDelivery": $.estimatedDelivery,
        "timestamp": $.timestamp
    }',
    '{"required": ["orderId", "customerId", "totalAmount", "currency"]}'::jsonb,
    'VALID',
    'system',
    'system',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    mapping_rules = EXCLUDED.mapping_rules,
    generated_jsonata = EXCLUDED.generated_jsonata,
    updated_at = NOW();

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Mock service mappings inserted successfully for PayFlex, FastCargo, and ShopMax';
END $$;
