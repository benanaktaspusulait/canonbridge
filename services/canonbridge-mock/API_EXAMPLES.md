# CanonBridge Mock API Examples

Bu doküman tüm endpoint'ler için detaylı örnekler içerir.

## 📋 İçindekiler

1. [PayFlex REST API](#payflex-rest-api)
2. [ShopMax OAuth2 & REST API](#shopmax-oauth2--rest-api)
3. [FastCargo SOAP API](#fastcargo-soap-api)
4. [Webhook API](#webhook-api)
5. [Kafka Events](#kafka-events)

---

## PayFlex REST API

### 1. Başarılı Ödeme Sorgusu (Detailed Format)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/payments/latest" \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Accept: application/json"
```

**Response (200 OK):**
```json
{
  "payment": {
    "id": "PAY-A1B2C3D4",
    "amount": {
      "value": 1250.50,
      "currency": "EUR"
    },
    "status": "COMPLETED",
    "type": "INSTANT_TRANSFER",
    "createdAt": "2024-05-12T09:30:00Z",
    "updatedAt": "2024-05-12T10:30:00Z"
  },
  "merchant": {
    "id": "MERCH-12345",
    "name": "TechStore GmbH",
    "category": "ELECTRONICS",
    "reference": "ORDER-2024-05-001"
  },
  "payer": {
    "name": "John Doe",
    "account": {
      "iban": "DE89370400440532013000",
      "accountNumber": "532013000",
      "bankName": "Deutsche Bank"
    },
    "email": "john.doe@example.com",
    "phone": "+49301234567"
  },
  "beneficiary": {
    "name": "TechStore GmbH",
    "account": {
      "iban": "DE89370400440532099999",
      "accountNumber": "532099999",
      "bankName": "Commerzbank"
    },
    "bankCode": "COBADEFF"
  },
  "risk": {
    "score": 0.15,
    "level": "LOW",
    "flags": ["VERIFIED_ACCOUNT", "REGULAR_CUSTOMER"]
  },
  "settlement": {
    "expectedDate": "2024-05-13T10:30:00Z",
    "status": "PENDING",
    "batchId": "BATCH-2024-05-12-001"
  },
  "metadata": {
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "traceId": "TRACE-1715508600000",
    "source": "PAYFLEX_API",
    "timestamp": "2024-05-12T10:30:00Z"
  }
}
```

### 2. Flat Format

**Request:**
```bash
curl -X GET "http://localhost:8080/api/payments/latest?format=flat" \
  -H "X-API-Key: demo-api-key-12345"
```

**Response (200 OK):**
```json
{
  "pay_id": "PAY-A1B2C3D4",
  "amt": 1250.50,
  "ccy": "EUR",
  "src_iban": "DE89370400440532013000",
  "dst_iban": "DE89370400440532099999",
  "merchant_ref": "ORDER-2024-05-001",
  "created_ts": "2024-05-12T09:30:00Z",
  "risk_lvl": "LOW",
  "status": "COMPLETED",
  "payer_name": "John Doe",
  "beneficiary_name": "TechStore GmbH",
  "settlement_date": "2024-05-13T10:30:00Z",
  "correlation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 3. Validation Error (Missing Amount)

**Request:**
```bash
curl -X POST "http://localhost:8080/api/payments/query?scenario=missing-amount" \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "message": "Required field 'amount' is missing",
  "field": "payment.amount.value"
}
```

### 4. Rate Limit Error

**Request:**
```bash
curl -X POST "http://localhost:8080/api/payments/query?scenario=rate-limit" \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (429 Too Many Requests):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

### 5. Server Error

**Request:**
```bash
curl -X POST "http://localhost:8080/api/payments/query?scenario=server-error" \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

### 6. Unauthorized (Invalid API Key)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/payments/latest" \
  -H "X-API-Key: invalid-key"
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid or missing API key"
}
```

---

## ShopMax OAuth2 & REST API

### 1. OAuth2 Token Request

**Request:**
```bash
curl -X POST "http://localhost:8080/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=shopmax-demo-client" \
  -d "client_secret=shopmax-demo-secret"
```

**Response (200 OK):**
```json
{
  "token_type": "Bearer",
  "access_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "expires_in": 3600,
  "scope": "read:orders write:orders"
}
```

### 2. Recent Orders (Detailed Format)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/orders/recent" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**Response (200 OK):**
```json
[
  {
    "order": {
      "id": "ORD-X1Y2Z3W4",
      "status": "CONFIRMED",
      "createdAt": "2024-05-12T08:30:00Z",
      "updatedAt": "2024-05-12T10:30:00Z"
    },
    "marketplace": {
      "id": "SHOPMAX-EU",
      "name": "ShopMax Europe",
      "region": "EU-WEST"
    },
    "buyer": {
      "id": "BUYER-98765",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+44207123456"
    },
    "billingAddress": {
      "street": "123 Oxford Street",
      "city": "London",
      "state": "Greater London",
      "postalCode": "W1D 1BS",
      "country": "GB"
    },
    "shippingAddress": {
      "street": "456 Baker Street",
      "city": "London",
      "state": "Greater London",
      "postalCode": "NW1 6XE",
      "country": "GB"
    },
    "lineItems": [
      {
        "sku": "SKU-LAPTOP-001",
        "productName": "Premium Laptop 15 inch",
        "quantity": 1,
        "unitPrice": {
          "amount": 899.99,
          "currency": "GBP"
        },
        "totalPrice": {
          "amount": 899.99,
          "currency": "GBP"
        },
        "discount": {
          "type": "PERCENTAGE",
          "amount": 50.0,
          "code": "SPRING10"
        },
        "tax": {
          "type": "VAT",
          "rate": 0.20,
          "amount": 169.99
        }
      },
      {
        "sku": "SKU-MOUSE-002",
        "productName": "Wireless Mouse",
        "quantity": 2,
        "unitPrice": {
          "amount": 29.99,
          "currency": "GBP"
        },
        "totalPrice": {
          "amount": 59.98,
          "currency": "GBP"
        },
        "discount": null,
        "tax": {
          "type": "VAT",
          "rate": 0.20,
          "amount": 11.99
        }
      }
    ],
    "payment": {
      "subtotal": {
        "amount": 959.97,
        "currency": "GBP"
      },
      "totalDiscount": {
        "amount": 50.0,
        "currency": "GBP"
      },
      "totalTax": {
        "amount": 181.98,
        "currency": "GBP"
      },
      "shippingCost": {
        "amount": 9.99,
        "currency": "GBP"
      },
      "grandTotal": {
        "amount": 1101.94,
        "currency": "GBP"
      },
      "method": "CREDIT_CARD",
      "status": "PAID"
    },
    "fulfillment": {
      "method": "STANDARD_SHIPPING",
      "carrier": "Royal Mail",
      "trackingNumber": "RM123456789GB",
      "estimatedDelivery": "2024-05-15T10:30:00Z",
      "sla": "3_DAYS"
    },
    "metadata": {
      "correlationId": "660e8400-e29b-41d4-a716-446655440000",
      "source": "SHOPMAX_API",
      "timestamp": "2024-05-12T10:30:00Z"
    }
  }
]
```

### 3. Recent Orders (Compact Format)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/orders/recent?format=compact" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**Response (200 OK):**
```json
[
  {
    "oid": "ORD-X1Y2Z3W4",
    "buyer": "Jane Smith",
    "ship_to": "456 Baker Street, London, NW1 6XE, GB",
    "lines": [
      {
        "sku": "SKU-LAPTOP-001",
        "qty": 1,
        "price": 899.99
      },
      {
        "sku": "SKU-MOUSE-002",
        "qty": 2,
        "price": 29.99
      }
    ],
    "gross": 1101.94,
    "cur": "GBP",
    "ts": "2024-05-12T10:30:00Z",
    "status": "CONFIRMED"
  }
]
```

---

## FastCargo SOAP API

### 1. Successful Tracking Query

**Request:**
```bash
curl -X POST "http://localhost:8080/ws/track" \
  -u "fastcargo-demo:fastcargo-secret" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:fc="http://fastcargo.com/tracking">
    <soap:Body>
        <fc:TrackShipmentRequest>
            <fc:trackingNumber>FC123456789</fc:trackingNumber>
        </fc:TrackShipmentRequest>
    </soap:Body>
</soap:Envelope>'
```

**Response (200 OK):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:fc="http://fastcargo.com/tracking">
    <soap:Body>
        <fc:TrackShipmentResponse>
            <fc:Shipment>
                <fc:TrackingNumber>FC123456789</fc:TrackingNumber>
                <fc:ShipmentId>SHIP-123456789</fc:ShipmentId>
                <fc:Status>DELIVERED</fc:Status>
                <fc:LastCheckpoint>
                    <fc:Location>London Distribution Center</fc:Location>
                    <fc:City>London</fc:City>
                    <fc:Country>GB</fc:Country>
                    <fc:Timestamp>2024-05-12T09:30:00Z</fc:Timestamp>
                    <fc:Description>Package delivered to recipient</fc:Description>
                </fc:LastCheckpoint>
                <fc:DeliveredTimestamp>2024-05-12T09:30:00Z</fc:DeliveredTimestamp>
                <fc:ReceiverCity>London</fc:ReceiverCity>
                <fc:CarrierBranch>London Central</fc:CarrierBranch>
                <fc:ProofOfDelivery>POD-FC123456789</fc:ProofOfDelivery>
                <fc:Weight>2.5</fc:Weight>
                <fc:WeightUnit>KG</fc:WeightUnit>
            </fc:Shipment>
        </fc:TrackShipmentResponse>
    </soap:Body>
</soap:Envelope>
```

### 2. Tracking Not Found (SOAP Fault)

**Request:**
```bash
curl -X POST "http://localhost:8080/ws/track" \
  -u "fastcargo-demo:fastcargo-secret" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:fc="http://fastcargo.com/tracking">
    <soap:Body>
        <fc:TrackShipmentRequest>
            <fc:trackingNumber>UNKNOWN-123</fc:trackingNumber>
        </fc:TrackShipmentRequest>
    </soap:Body>
</soap:Envelope>'
```

**Response (200 OK with SOAP Fault):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <soap:Fault>
            <faultcode>soap:Server</faultcode>
            <faultstring>Tracking Number Not Found</faultstring>
            <detail>
                <error xmlns="http://fastcargo.com/tracking">
                    <code>TrackingNotFound</code>
                    <message>Tracking Number Not Found</message>
                </error>
            </detail>
        </soap:Fault>
    </soap:Body>
</soap:Envelope>
```

### 3. Get WSDL

**Request:**
```bash
curl -X GET "http://localhost:8080/ws/fastcargo.wsdl"
```

**Response:** WSDL XML document

---

## Webhook API

### 1. Send Payment Webhook

**Request:**
```bash
curl -X POST "http://localhost:8080/webhook/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_123456",
    "eventType": "PAYMENT_CONFIRMED",
    "paymentId": "PAY-DEMO-001",
    "merchantId": "MERCH-12345",
    "status": "CONFIRMED",
    "amount": 1250.50,
    "currency": "EUR",
    "confirmedAt": "2024-05-12T10:30:00Z",
    "signature": "demo_signature_123456"
  }'
```

**Response (200 OK):**
```json
{
  "status": "received",
  "message": "Payment webhook processed successfully"
}
```

### 2. List Webhooks

**Request:**
```bash
curl -X GET "http://localhost:8080/webhook/webhooks?type=payment&limit=5"
```

**Response (200 OK):**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "type": "payment",
    "payload": {
      "eventId": "evt_123456",
      "eventType": "PAYMENT_CONFIRMED",
      "paymentId": "PAY-DEMO-001",
      "merchantId": "MERCH-12345",
      "status": "CONFIRMED",
      "amount": 1250.50,
      "currency": "EUR",
      "confirmedAt": "2024-05-12T10:30:00Z",
      "signature": "demo_signature_123456"
    },
    "receivedAt": "2024-05-12T10:30:15Z"
  }
]
```

### 3. Clear Webhooks

**Request:**
```bash
curl -X DELETE "http://localhost:8080/webhook/webhooks"
```

**Response (200 OK):**
```json
{
  "status": "cleared",
  "message": "All webhooks cleared successfully"
}
```

---

## Kafka Events

### ShopMax Order Event

**Topic:** `partner.shopmax.raw`

**Event Example:**
```json
{
  "eventId": "880e8400-e29b-41d4-a716-446655440000",
  "eventType": "ORDER_CREATED",
  "timestamp": "2024-05-12T10:30:00Z",
  "source": "SHOPMAX_KAFKA",
  "order": {
    "orderId": "ORD-K1L2M3N4",
    "buyer": "Customer-5678",
    "items": [
      {
        "sku": "SKU-456",
        "quantity": 2,
        "price": 149.99
      }
    ],
    "total": 299.98,
    "currency": "EUR",
    "status": "CONFIRMED"
  }
}
```

### Cargo Update Event

**Topic:** `cargo.updates`

**Event Example:**
```json
{
  "eventId": "990e8400-e29b-41d4-a716-446655440000",
  "eventType": "CARGO_UPDATE",
  "timestamp": "2024-05-12T10:30:00Z",
  "source": "FASTCARGO_POLLER",
  "shipment": {
    "trackingNumber": "FC654321",
    "status": "IN_TRANSIT",
    "checkpoint": {
      "location": "Distribution Center",
      "city": "Berlin",
      "country": "DE",
      "timestamp": "2024-05-12T10:30:00Z",
      "description": "Package in transit"
    },
    "weight": 3.5,
    "weightUnit": "KG"
  }
}
```

---

## Health & Monitoring

### Health Check

**Request:**
```bash
curl -X GET "http://localhost:8080/actuator/health"
```

**Response (200 OK):**
```json
{
  "status": "UP",
  "components": {
    "diskSpace": {
      "status": "UP"
    },
    "kafka": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```
