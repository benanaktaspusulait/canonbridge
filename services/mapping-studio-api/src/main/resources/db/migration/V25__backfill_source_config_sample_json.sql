-- Backfill source_config with sourceJson for mapping drafts that are missing sample data.
-- Without sourceJson in source_config, the wizard field mapping step cannot display source fields.

-- PayFlex Payment Webhook Mapping
UPDATE mapping_drafts
SET source_config = source_config || '{"sourceJson": "{\"transactionId\":\"TXN-PAY-001\",\"merchantId\":\"MERCH-001\",\"amount\":1250.50,\"currency\":\"EUR\",\"status\":\"COMPLETED\",\"paymentMethod\":\"CREDIT_CARD\",\"cardLast4\":\"4242\",\"cardBrand\":\"VISA\",\"customerEmail\":\"john.doe@example.com\",\"customerName\":\"John Doe\",\"billingAddress\":{\"street\":\"123 Main St\",\"city\":\"Istanbul\",\"country\":\"TR\"},\"metadata\":{\"orderId\":\"ORD-001\"},\"timestamp\":\"2026-05-14T10:00:00Z\"}"}'::jsonb,
    updated_at = NOW()
WHERE id = '77777777-7777-7777-7777-777777777777'
  AND NOT source_config ? 'sourceJson';

-- FastCargo SOAP Tracking Mapping
UPDATE mapping_drafts
SET source_config = source_config || '{"sourceJson": "{\"trackingNumber\":\"FC-TRACK-001\",\"status\":\"IN_TRANSIT\",\"currentLocation\":{\"city\":\"Istanbul\",\"country\":\"TR\",\"lat\":41.0082,\"lng\":28.9784},\"estimatedDelivery\":\"2026-05-16T14:00:00Z\",\"weight\":2.5,\"weightUnit\":\"kg\",\"dimensions\":{\"length\":30,\"width\":20,\"height\":15},\"history\":[{\"status\":\"PICKED_UP\",\"timestamp\":\"2026-05-13T09:00:00Z\",\"location\":\"Ankara\"}],\"deliveryDetails\":{\"recipientName\":\"Jane Smith\",\"address\":\"456 Oak Ave\"}}"}'::jsonb,
    updated_at = NOW()
WHERE id = '88888888-8888-8888-8888-888888888888'
  AND NOT source_config ? 'sourceJson';

-- ShopMax Order Kafka Mapping
UPDATE mapping_drafts
SET source_config = source_config || '{"sourceJson": "{\"eventId\":\"EVT-ORD-001\",\"timestamp\":\"2026-05-14T10:00:00Z\",\"eventType\":\"order.created\",\"orderId\":\"ORD-SHOP-001\",\"customerId\":\"CUST-001\",\"customerEmail\":\"jane@example.com\",\"items\":[{\"productId\":\"PROD-001\",\"productName\":\"Wireless Mouse\",\"quantity\":2,\"unitPrice\":29.99}],\"subtotal\":59.98,\"taxTotal\":10.80,\"shippingCost\":5.00,\"totalAmount\":75.78,\"currency\":\"USD\",\"paymentMethod\":\"CREDIT_CARD\",\"paymentStatus\":\"PAID\",\"shippingAddress\":{\"street\":\"789 Elm St\",\"city\":\"Izmir\",\"country\":\"TR\"},\"billingAddress\":{\"street\":\"789 Elm St\",\"city\":\"Izmir\",\"country\":\"TR\"},\"shippingMethod\":\"EXPRESS\",\"estimatedDelivery\":\"2026-05-17T18:00:00Z\",\"notes\":\"Please leave at door\",\"source\":\"web\",\"metadata\":{\"campaign\":\"spring-sale\"}}"}'::jsonb,
    updated_at = NOW()
WHERE id = '99999999-9999-9999-9999-999999999999'
  AND NOT source_config ? 'sourceJson';
