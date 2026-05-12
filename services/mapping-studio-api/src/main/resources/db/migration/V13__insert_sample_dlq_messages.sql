-- Sample DLQ Messages for Testing
-- These messages represent various failure scenarios

-- Schema validation error
INSERT INTO dlq_messages (
    id, original_topic, partition, kafka_offset, key, payload,
    error_message, error_stack_trace, failed_at, retry_count, status
) VALUES (
    'dlq-msg-001',
    'partner.shopmax.raw',
    0,
    12345,
    'order-ORD-123',
    '{"orderId":"ORD-123","customerId":"CUST-456","status":"A","total":250.50,"items":[{"productId":"PROD-789","quantity":2,"price":125.25}]}',
    'Schema validation failed: Missing required field ''orderDate''',
    'com.canonbridge.transformer.SchemaValidationException: Missing required field ''orderDate''
    at com.canonbridge.transformer.SchemaValidator.validate(SchemaValidator.java:45)
    at com.canonbridge.transformer.MessageProcessor.process(MessageProcessor.java:78)',
    NOW() - INTERVAL '2 hours',
    0,
    'FAILED'
);

-- Transformation error
INSERT INTO dlq_messages (
    id, original_topic, partition, kafka_offset, key, payload,
    error_message, error_stack_trace, failed_at, retry_count, status
) VALUES (
    'dlq-msg-002',
    'partner.acme.raw',
    1,
    23456,
    'order-ORD-456',
    '{"order_id":"ORD-456","customer":"John Doe","status":"pending","amount":"invalid_number"}',
    'Transformation error: Cannot convert ''invalid_number'' to decimal',
    'com.canonbridge.transformer.TransformationException: Cannot convert ''invalid_number'' to decimal
    at com.canonbridge.transformer.JSONataEngine.transform(JSONataEngine.java:112)
    at com.canonbridge.transformer.MessageProcessor.transform(MessageProcessor.java:92)',
    NOW() - INTERVAL '5 hours',
    2,
    'FAILED'
);

-- Downstream service error
INSERT INTO dlq_messages (
    id, original_topic, partition, kafka_offset, key, payload,
    error_message, error_stack_trace, failed_at, retry_count, status
) VALUES (
    'dlq-msg-003',
    'partner.logistics.raw',
    0,
    34567,
    'shipment-SHP-789',
    '{"shipmentId":"SHP-789","trackingNumber":"TRK-44192","status":"IN_TRANSIT","carrier":"FedEx","estimatedDelivery":"2026-05-14"}',
    'Downstream service unavailable: HTTP 503 Service Unavailable after 3 retry attempts',
    'com.canonbridge.outbound.DownstreamException: HTTP 503 Service Unavailable
    at com.canonbridge.outbound.HttpClient.post(HttpClient.java:156)
    at com.canonbridge.outbound.DestinationService.send(DestinationService.java:89)
    Caused by: java.net.SocketTimeoutException: Read timed out',
    NOW() - INTERVAL '30 minutes',
    3,
    'FAILED'
);

-- Mapping rule error
INSERT INTO dlq_messages (
    id, original_topic, partition, kafka_offset, key, payload,
    error_message, error_stack_trace, failed_at, retry_count, status
) VALUES (
    'dlq-msg-004',
    'partner.shopmax.raw',
    2,
    45678,
    'order-ORD-999',
    '{"orderId":"ORD-999","customerId":"CUST-888","status":"X","total":99.99,"orderDate":"2026-05-13T10:30:00Z"}',
    'Mapping rule error: Unknown status code ''X''. Expected: A, C, S, D',
    'com.canonbridge.transformer.MappingException: Unknown status code ''X''
    at com.canonbridge.transformer.StatusMapper.map(StatusMapper.java:34)
    at com.canonbridge.transformer.JSONataEngine.applyRules(JSONataEngine.java:145)',
    NOW() - INTERVAL '15 minutes',
    1,
    'FAILED'
);

-- JSON parsing error
INSERT INTO dlq_messages (
    id, original_topic, partition, kafka_offset, key, payload,
    error_message, error_stack_trace, failed_at, retry_count, status
) VALUES (
    'dlq-msg-005',
    'partner.acme.raw',
    0,
    56789,
    'order-ORD-777',
    '{"orderId":"ORD-777","customerId":"CUST-666",invalid json here}',
    'JSON parsing error: Unexpected token at position 45',
    'com.fasterxml.jackson.core.JsonParseException: Unexpected character (''}'' (code 125))
    at com.fasterxml.jackson.core.JsonParser.nextToken(JsonParser.java:1234)
    at com.canonbridge.transformer.MessageProcessor.parse(MessageProcessor.java:56)',
    NOW() - INTERVAL '1 hour',
    0,
    'FAILED'
);

-- Successfully redriven message (for history)
INSERT INTO dlq_messages (
    id, original_topic, partition, kafka_offset, key, payload,
    error_message, error_stack_trace, failed_at, retry_count, status, redrive_attempted_at
) VALUES (
    'dlq-msg-006',
    'partner.shopmax.raw',
    1,
    67890,
    'order-ORD-555',
    '{"orderId":"ORD-555","customerId":"CUST-444","status":"A","total":150.00,"orderDate":"2026-05-13T09:00:00Z"}',
    'Temporary downstream timeout',
    'java.net.SocketTimeoutException: Connect timed out',
    NOW() - INTERVAL '3 hours',
    1,
    'REDRIVEN',
    NOW() - INTERVAL '2 hours'
);

-- Comment
COMMENT ON TABLE dlq_messages IS 'Sample DLQ messages showing various failure scenarios for testing';
