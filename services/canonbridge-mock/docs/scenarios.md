# CanonBridge Mock - Test Scenarios

## Overview

This document describes all test scenarios supported by the CanonBridge Mock service.

---

## 1. PayFlex Payment Webhook

### Happy Path

**Scenario**: Customer completes payment successfully

**Source**: Webhook (HTTP POST)

**Endpoint**: `POST /webhook/payflex/payment`

**Headers**:
```
Content-Type: application/json
X-Webhook-Key: payflex-secret-key
```

**Payload**:
```json
{
  "transactionId": "TXN-12345",
  "merchantId": "MERCH-001",
  "amount": 149.99,
  "currency": "USD",
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "cardLast4": "4242",
  "customerEmail": "customer@example.com",
  "timestamp": "2026-05-12T10:30:00Z"
}
```

**Expected Behavior**:
- Webhook validated with key
- Event published to `partner.payflex.raw` Kafka topic
- Returns 202 Accepted with event ID

### Error Scenarios

#### Invalid Webhook Key
```bash
curl -X POST http://localhost:8080/webhook/payflex/payment \
  -H "X-Webhook-Key: wrong-key" \
  -d '{...}'
# Expected: 401 Unauthorized
```

#### Missing Required Fields
```bash
curl -X POST http://localhost:8080/webhook/payflex/payment \
  -H "X-Webhook-Key: payflex-secret-key" \
  -d '{"transactionId": "TXN-123"}'
# Expected: 400 Bad Request
```

---

## 2. FastCargo SOAP Tracking

### Happy Path

**Scenario**: Query shipment status

**Source**: SOAP/XML

**Endpoint**: `POST /ws/track`

**Headers**:
```
Content-Type: text/xml
SOAPAction: getShipmentStatus
```

**Request**:
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:trac="http://fastcargo.com/tracking">
   <soapenv:Header/>
   <soapenv:Body>
      <trac:GetShipmentStatusRequest>
         <trac:trackingNumber>FC123456789</trac:trackingNumber>
      </trac:GetShipmentStatusRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

**Response**:
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
      <GetShipmentStatusResponse xmlns="http://fastcargo.com/tracking">
         <trackingNumber>FC123456789</trackingNumber>
         <status>IN_TRANSIT</status>
         <location>Distribution Center - NYC</location>
         <estimatedDelivery>2026-05-14T18:00:00Z</estimatedDelivery>
      </GetShipmentStatusResponse>
   </soap:Body>
</soap:Envelope>
```

### Error Scenarios

#### Tracking Number Not Found
```xml
<trac:trackingNumber>INVALID</trac:trackingNumber>
<!-- Expected: SOAP Fault with "Tracking number not found" -->
```

#### Invalid SOAP Format
```bash
curl -X POST http://localhost:8080/ws/track \
  -H "Content-Type: text/xml" \
  -d '<invalid>xml</invalid>'
# Expected: 500 SOAP Fault
```

---

## 3. ShopMax Kafka Direct

### Happy Path

**Scenario**: Partner publishes order directly to Kafka

**Source**: Kafka Producer

**Topic**: `partner.shopmax.raw`

**Event**:
```json
{
  "eventId": "sm-uuid-here",
  "timestamp": "2026-05-12T10:30:00Z",
  "eventType": "order.created",
  "orderId": "ORD-12345",
  "customerId": "CUST-67890",
  "items": [
    {
      "sku": "PROD-001",
      "name": "Wireless Headphones",
      "quantity": 1,
      "price": 79.99
    }
  ],
  "totalAmount": 79.99,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  }
}
```

**Expected Behavior**:
- Event consumed by transformer service
- Validated against schema
- Transformed to canonical format
- Published to `canonical.order.created`

---

## 4. PayFlex REST API

### Happy Path

**Scenario**: Query transaction details

**Source**: REST API

**Endpoint**: `GET /api/payflex/transactions/{transactionId}`

**Headers**:
```
X-API-Key: demo-api-key-12345
```

**Response**:
```json
{
  "transactionId": "TXN-12345",
  "merchantId": "MERCH-001",
  "amount": 149.99,
  "currency": "USD",
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "cardLast4": "4242",
  "customerEmail": "customer@example.com",
  "createdAt": "2026-05-12T10:30:00Z",
  "completedAt": "2026-05-12T10:30:05Z"
}
```

### Error Scenarios

#### Invalid API Key
```bash
curl -X GET http://localhost:8080/api/payflex/transactions/TXN-12345 \
  -H "X-API-Key: invalid-key"
# Expected: 401 Unauthorized
```

#### Transaction Not Found
```bash
curl -X GET http://localhost:8080/api/payflex/transactions/INVALID \
  -H "X-API-Key: demo-api-key-12345"
# Expected: 404 Not Found
```

---

## 5. Delay Simulation

### Slow Response

**Scenario**: Simulate slow external API

**Endpoint**: `GET /api/payflex/transactions/{id}?delay=5000`

**Expected**: Response after 5 seconds

### Timeout

**Scenario**: Simulate timeout

**Endpoint**: `GET /api/payflex/transactions/{id}?delay=60000`

**Expected**: Client timeout (if configured < 60s)

---

## 6. Error Injection

### 500 Internal Server Error

**Endpoint**: `POST /webhook/payflex/payment?error=500`

**Expected**: 500 response

### 503 Service Unavailable

**Endpoint**: `POST /webhook/payflex/payment?error=503`

**Expected**: 503 response

---

## Test Execution

### Run All Scenarios
```bash
./scripts/demo-full.sh
```

### Run Individual Scenario
```bash
# PayFlex Webhook
./scripts/trigger-webhook.sh payflex

# FastCargo SOAP
curl -X POST http://localhost:8080/ws/track \
  -H "Content-Type: text/xml" \
  -d @soap-mock/examples/track-request.xml

# ShopMax Kafka
./scripts/send-mock-events.sh
```

### Verify Results
```bash
# Check Kafka topics
./scripts/consume-events.sh

# Check webhook history
curl http://localhost:8080/admin/webhooks | jq .

# Check health
curl http://localhost:8080/actuator/health | jq .
```

---

## Performance Testing

### Load Test with k6
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  let res = http.post('http://localhost:8080/webhook/payflex/payment',
    JSON.stringify({
      transactionId: `TXN-${Date.now()}`,
      amount: 99.99,
      status: 'SUCCESS'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Key': 'payflex-secret-key'
      }
    }
  );
  check(res, { 'status is 202': (r) => r.status === 202 });
}
```

Run:
```bash
k6 run load-test.js
```

---

## Troubleshooting

### Webhook Not Received
1. Check service is running: `docker ps`
2. Check logs: `docker logs canonbridge-mock`
3. Verify webhook key is correct
4. Check network connectivity

### Kafka Events Not Appearing
1. Verify Kafka is running: `docker ps | grep kafka`
2. Check topic exists: `docker exec canonbridge-kafka kafka-topics.sh --list --bootstrap-server localhost:9092`
3. Check consumer group lag
4. Verify producer configuration

### SOAP Errors
1. Validate XML format with xmllint
2. Check SOAPAction header
3. Verify namespace URIs
4. Check WSDL definition

---

## See Also

- [Payload Catalog](./payload-catalog.md)
- [Demo Runbook](./demo-runbook.md)
- [API Examples](../API_EXAMPLES.md)
