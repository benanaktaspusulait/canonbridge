# Payload Catalog

Complete reference of all payloads used in CanonBridge Mock.

---

## PayFlex Payloads

### Payment Completed (Webhook)

```json
{
  "transactionId": "TXN-20260512-001",
  "merchantId": "MERCH-001",
  "amount": 149.99,
  "currency": "USD",
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "cardLast4": "4242",
  "cardBrand": "VISA",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "billingAddress": {
    "street": "456 Payment St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "metadata": {
    "orderId": "ORD-12345",
    "invoiceNumber": "INV-67890"
  },
  "timestamp": "2026-05-12T10:30:00Z"
}
```

### Payment Failed

```json
{
  "transactionId": "TXN-20260512-002",
  "merchantId": "MERCH-001",
  "amount": 299.99,
  "currency": "USD",
  "status": "FAILED",
  "paymentMethod": "CREDIT_CARD",
  "cardLast4": "0002",
  "errorCode": "INSUFFICIENT_FUNDS",
  "errorMessage": "Card declined due to insufficient funds",
  "customerEmail": "customer@example.com",
  "timestamp": "2026-05-12T10:35:00Z"
}
```

### Refund Processed

```json
{
  "transactionId": "TXN-20260512-003",
  "originalTransactionId": "TXN-20260512-001",
  "merchantId": "MERCH-001",
  "amount": 149.99,
  "currency": "USD",
  "status": "REFUNDED",
  "refundReason": "Customer request",
  "timestamp": "2026-05-12T11:00:00Z"
}
```

---

## FastCargo Payloads

### SOAP Request - Get Shipment Status

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:trac="http://fastcargo.com/tracking">
   <soapenv:Header>
      <trac:Authentication>
         <trac:username>fastcargo-demo</trac:username>
         <trac:password>fastcargo-secret</trac:password>
      </trac:Authentication>
   </soapenv:Header>
   <soapenv:Body>
      <trac:GetShipmentStatusRequest>
         <trac:trackingNumber>FC123456789</trac:trackingNumber>
      </trac:GetShipmentStatusRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

### SOAP Response - In Transit

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
      <GetShipmentStatusResponse xmlns="http://fastcargo.com/tracking">
         <trackingNumber>FC123456789</trackingNumber>
         <status>IN_TRANSIT</status>
         <currentLocation>
            <facility>Distribution Center NYC</facility>
            <city>New York</city>
            <state>NY</state>
            <country>USA</country>
            <timestamp>2026-05-12T08:30:00Z</timestamp>
         </currentLocation>
         <estimatedDelivery>2026-05-14T18:00:00Z</estimatedDelivery>
         <weight>2.5</weight>
         <weightUnit>kg</weightUnit>
         <dimensions>
            <length>30</length>
            <width>20</width>
            <height>15</height>
            <unit>cm</unit>
         </dimensions>
         <history>
            <event>
               <status>PICKED_UP</status>
               <location>Warehouse - San Francisco</location>
               <timestamp>2026-05-11T14:00:00Z</timestamp>
            </event>
            <event>
               <status>IN_TRANSIT</status>
               <location>Distribution Center NYC</location>
               <timestamp>2026-05-12T08:30:00Z</timestamp>
            </event>
         </history>
      </GetShipmentStatusResponse>
   </soap:Body>
</soap:Envelope>
```

### SOAP Response - Delivered

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
      <GetShipmentStatusResponse xmlns="http://fastcargo.com/tracking">
         <trackingNumber>FC987654321</trackingNumber>
         <status>DELIVERED</status>
         <deliveryDetails>
            <deliveredAt>2026-05-12T16:45:00Z</deliveredAt>
            <signedBy>John Smith</signedBy>
            <location>Front Door</location>
         </deliveryDetails>
      </GetShipmentStatusResponse>
   </soap:Body>
</soap:Envelope>
```

### SOAP Fault - Not Found

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
      <soap:Fault>
         <faultcode>soap:Client</faultcode>
         <faultstring>Tracking number not found</faultstring>
         <detail>
            <error xmlns="http://fastcargo.com/tracking">
               <code>TRACKING_NOT_FOUND</code>
               <message>The tracking number INVALID does not exist in our system</message>
            </error>
         </detail>
      </soap:Fault>
   </soap:Body>
</soap:Envelope>
```

---

## ShopMax Payloads

### Order Created (Kafka)

```json
{
  "eventId": "sm-550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-12T10:30:00Z",
  "eventType": "order.created",
  "orderId": "ORD-20260512-001",
  "customerId": "CUST-12345",
  "customerEmail": "customer@shopmax.com",
  "items": [
    {
      "sku": "PROD-001",
      "name": "Wireless Headphones",
      "category": "Electronics",
      "quantity": 1,
      "unitPrice": 79.99,
      "totalPrice": 79.99,
      "taxAmount": 6.40
    },
    {
      "sku": "PROD-002",
      "name": "USB-C Cable",
      "category": "Accessories",
      "quantity": 2,
      "unitPrice": 9.99,
      "totalPrice": 19.98,
      "taxAmount": 1.60
    }
  ],
  "subtotal": 99.97,
  "taxTotal": 8.00,
  "shippingCost": 5.99,
  "totalAmount": 113.96,
  "currency": "USD",
  "paymentMethod": "CREDIT_CARD",
  "paymentStatus": "PAID",
  "shippingAddress": {
    "recipientName": "Jane Doe",
    "street": "123 Main St",
    "apartment": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA",
    "phone": "+1-415-555-0123"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  },
  "shippingMethod": "STANDARD",
  "estimatedDelivery": "2026-05-17T18:00:00Z",
  "notes": "Please leave at front door",
  "source": "WEB",
  "metadata": {
    "campaignId": "SPRING2026",
    "referrer": "google_ads"
  }
}
```

### Order Cancelled

```json
{
  "eventId": "sm-660e8400-e29b-41d4-a716-446655440001",
  "timestamp": "2026-05-12T11:00:00Z",
  "eventType": "order.cancelled",
  "orderId": "ORD-20260512-001",
  "customerId": "CUST-12345",
  "cancellationReason": "Customer request",
  "refundAmount": 113.96,
  "refundStatus": "PENDING"
}
```

### Order Shipped

```json
{
  "eventId": "sm-770e8400-e29b-41d4-a716-446655440002",
  "timestamp": "2026-05-13T09:00:00Z",
  "eventType": "order.shipped",
  "orderId": "ORD-20260512-001",
  "trackingNumber": "FC123456789",
  "carrier": "FastCargo",
  "shippedAt": "2026-05-13T09:00:00Z",
  "estimatedDelivery": "2026-05-15T18:00:00Z"
}
```

---

## Canonical Event Formats

### Canonical Payment Completed

```json
{
  "eventId": "canonical-payment-001",
  "eventType": "payment.completed",
  "timestamp": "2026-05-12T10:30:00Z",
  "source": "payflex",
  "version": "1.0",
  "data": {
    "transactionId": "TXN-20260512-001",
    "amount": {
      "value": 149.99,
      "currency": "USD"
    },
    "status": "SUCCESS",
    "paymentMethod": "CREDIT_CARD",
    "customer": {
      "email": "customer@example.com",
      "name": "John Doe"
    },
    "metadata": {
      "orderId": "ORD-12345",
      "merchantId": "MERCH-001"
    }
  }
}
```

### Canonical Shipment Updated

```json
{
  "eventId": "canonical-shipment-001",
  "eventType": "shipment.updated",
  "timestamp": "2026-05-12T08:30:00Z",
  "source": "fastcargo",
  "version": "1.0",
  "data": {
    "trackingNumber": "FC123456789",
    "status": "IN_TRANSIT",
    "location": {
      "facility": "Distribution Center NYC",
      "city": "New York",
      "state": "NY",
      "country": "USA"
    },
    "estimatedDelivery": "2026-05-14T18:00:00Z",
    "weight": {
      "value": 2.5,
      "unit": "kg"
    }
  }
}
```

### Canonical Order Created

```json
{
  "eventId": "canonical-order-001",
  "eventType": "order.created",
  "timestamp": "2026-05-12T10:30:00Z",
  "source": "shopmax",
  "version": "1.0",
  "data": {
    "orderId": "ORD-20260512-001",
    "customerId": "CUST-12345",
    "totalAmount": {
      "value": 113.96,
      "currency": "USD"
    },
    "items": [
      {
        "sku": "PROD-001",
        "name": "Wireless Headphones",
        "quantity": 1,
        "price": {
          "value": 79.99,
          "currency": "USD"
        }
      }
    ],
    "status": "PENDING",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "country": "USA"
    }
  }
}
```

---

## Error Payloads

### Validation Error

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid payload format",
  "details": [
    {
      "field": "amount",
      "error": "must be a positive number"
    },
    {
      "field": "currency",
      "error": "must be a valid ISO 4217 currency code"
    }
  ],
  "timestamp": "2026-05-12T10:30:00Z"
}
```

### Authentication Error

```json
{
  "error": "AUTHENTICATION_FAILED",
  "message": "Invalid API key or webhook key",
  "timestamp": "2026-05-12T10:30:00Z"
}
```

### Rate Limit Error

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "timestamp": "2026-05-12T10:30:00Z"
}
```

---

## Usage Examples

### cURL Examples

```bash
# PayFlex Webhook
curl -X POST http://localhost:8080/webhook/payflex/payment \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Key: payflex-secret-key" \
  -d @payloads/payflex-payment-success.json

# FastCargo SOAP
curl -X POST http://localhost:8080/ws/track \
  -H "Content-Type: text/xml" \
  -H "SOAPAction: getShipmentStatus" \
  -d @payloads/fastcargo-track-request.xml

# PayFlex REST API
curl -X GET http://localhost:8080/api/payflex/transactions/TXN-12345 \
  -H "X-API-Key: demo-api-key-12345"
```

### Kafka Producer

```bash
# ShopMax Order
echo '{"eventId":"sm-001","eventType":"order.created",...}' | \
  docker exec -i canonbridge-kafka kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic partner.shopmax.raw
```

---

## See Also

- [Scenarios](./scenarios.md)
- [Demo Runbook](./demo-runbook.md)
- [API Examples](../API_EXAMPLES.md)
