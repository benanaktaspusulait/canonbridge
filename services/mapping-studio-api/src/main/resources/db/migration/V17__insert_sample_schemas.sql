-- Insert sample canonical schemas for testing
INSERT INTO schemas (
    id, tenant_id, name, schema_type, subject, version,
    schema_json, compatibility_mode, status, description,
    created_by, updated_by, created_at, updated_at
)
VALUES
    (
        gen_random_uuid(),
        'tenant-acme',
        'Canonical Order Schema',
        'CANONICAL',
        'canonical.order.v1',
        1,
        '{
            "type": "object",
            "properties": {
                "orderId": {"type": "string"},
                "customerId": {"type": "string"},
                "orderDate": {"type": "string", "format": "date-time"},
                "totalAmount": {"type": "number"},
                "currency": {"type": "string"},
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "productId": {"type": "string"},
                            "quantity": {"type": "integer"},
                            "price": {"type": "number"}
                        }
                    }
                }
            },
            "required": ["orderId", "customerId", "orderDate"]
        }',
        'BACKWARD',
        'ACTIVE',
        'Canonical schema for order events',
        (SELECT id FROM users WHERE email = 'admin@canonbridge.io' LIMIT 1),
        (SELECT id FROM users WHERE email = 'admin@canonbridge.io' LIMIT 1),
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'tenant-acme',
        'Canonical Customer Schema',
        'CANONICAL',
        'canonical.customer.v1',
        1,
        '{
            "type": "object",
            "properties": {
                "customerId": {"type": "string"},
                "email": {"type": "string", "format": "email"},
                "name": {"type": "string"},
                "phone": {"type": "string"},
                "address": {
                    "type": "object",
                    "properties": {
                        "street": {"type": "string"},
                        "city": {"type": "string"},
                        "country": {"type": "string"},
                        "postalCode": {"type": "string"}
                    }
                }
            },
            "required": ["customerId", "email"]
        }',
        'BACKWARD',
        'ACTIVE',
        'Canonical schema for customer events',
        (SELECT id FROM users WHERE email = 'admin@canonbridge.io' LIMIT 1),
        (SELECT id FROM users WHERE email = 'admin@canonbridge.io' LIMIT 1),
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'tenant-acme',
        'Canonical Shipment Schema',
        'CANONICAL',
        'canonical.shipment.v1',
        1,
        '{
            "type": "object",
            "properties": {
                "shipmentId": {"type": "string"},
                "orderId": {"type": "string"},
                "trackingNumber": {"type": "string"},
                "carrier": {"type": "string"},
                "status": {"type": "string"},
                "estimatedDelivery": {"type": "string", "format": "date-time"}
            },
            "required": ["shipmentId", "orderId", "trackingNumber"]
        }',
        'BACKWARD',
        'ACTIVE',
        'Canonical schema for shipment events',
        (SELECT id FROM users WHERE email = 'admin@canonbridge.io' LIMIT 1),
        (SELECT id FROM users WHERE email = 'admin@canonbridge.io' LIMIT 1),
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'tenant-acme',
        'Canonical Payment Schema',
        'CANONICAL',
        'canonical.payment.v1',
        1,
        '{
            "type": "object",
            "properties": {
                "paymentId": {"type": "string"},
                "orderId": {"type": "string"},
                "amount": {"type": "number"},
                "currency": {"type": "string"},
                "status": {"type": "string"},
                "paymentMethod": {"type": "string"},
                "transactionDate": {"type": "string", "format": "date-time"}
            },
            "required": ["paymentId", "orderId", "amount", "currency"]
        }',
        'BACKWARD',
        'ACTIVE',
        'Canonical schema for payment events',
        (SELECT id FROM users WHERE email = 'admin@canonbridge.io' LIMIT 1),
        (SELECT id FROM users WHERE email = 'admin@canonbridge.io' LIMIT 1),
        NOW(),
        NOW()
    )
ON CONFLICT DO NOTHING;

COMMENT ON TABLE schemas IS 'Sample canonical schemas for testing';
