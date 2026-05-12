# Demo Runbook

Step-by-step guide for running CanonBridge sales demos.

---

## Pre-Demo Checklist

### 1. Environment Setup

```bash
# Clone repository
git clone <repo-url>
cd etlsolutions/services/canonbridge-mock

# Start services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Initialize Kafka topics
./scripts/init-kafka.sh

# Verify health
curl http://localhost:8080/actuator/health
```

### 2. Verify Services

| Service | Port | Health Check | Status |
|---------|------|--------------|--------|
| CanonBridge Mock | 8080 | `curl http://localhost:8080/actuator/health` | ✅ |
| Kafka | 9092 | `docker exec canonbridge-kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092` | ✅ |

### 3. Prepare Demo Data

```bash
# Send initial test events
./scripts/send-mock-events.sh

# Verify events in Kafka
./scripts/consume-events.sh
```

---

## Demo Script

### Introduction (2 minutes)

**Talking Points**:
- CanonBridge is an event-driven integration platform
- Supports multiple ingestion methods: Webhooks, REST, SOAP, Kafka
- Transforms partner-specific formats to canonical events
- Enables real-time business workflows

**Show**:
- Architecture diagram
- Service overview

---

### Demo 1: Webhook Ingestion (5 minutes)

**Scenario**: PayFlex sends payment notification via webhook

**Steps**:

1. **Explain the flow**:
   ```
   PayFlex → Webhook → CanonBridge → Kafka → Transformer → Canonical Event
   ```

2. **Show webhook endpoint**:
   ```bash
   curl http://localhost:8080/webhook/payflex/payment \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Key: payflex-secret-key" \
     -d '{
       "transactionId": "TXN-DEMO-001",
       "amount": 149.99,
       "status": "SUCCESS",
       "customerEmail": "demo@example.com"
     }'
   ```

3. **Show response**:
   ```json
   {
     "eventId": "evt-123",
     "status": "ACCEPTED",
     "message": "Webhook received and queued"
   }
   ```

4. **Verify in Kafka**:
   ```bash
   ./scripts/consume-events.sh
   # Select: partner.payflex.raw
   ```

5. **Show webhook history**:
   ```bash
   curl http://localhost:8080/admin/webhooks | jq .
   ```

**Key Points**:
- ✅ Webhook authentication with key
- ✅ Immediate 202 Accepted response
- ✅ Event published to Kafka
- ✅ Audit trail maintained

---

### Demo 2: SOAP API Integration (5 minutes)

**Scenario**: Query shipment status from FastCargo SOAP API

**Steps**:

1. **Explain the flow**:
   ```
   CanonBridge → SOAP Request → FastCargo → SOAP Response → Transform → Canonical Event
   ```

2. **Show SOAP request**:
   ```bash
   curl -X POST http://localhost:8080/ws/track \
     -H "Content-Type: text/xml" \
     -H "SOAPAction: getShipmentStatus" \
     -d '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                           xmlns:trac="http://fastcargo.com/tracking">
            <soapenv:Body>
               <trac:GetShipmentStatusRequest>
                  <trac:trackingNumber>FC123456789</trac:trackingNumber>
               </trac:GetShipmentStatusRequest>
            </soapenv:Body>
         </soapenv:Envelope>'
   ```

3. **Show SOAP response**:
   ```xml
   <soap:Envelope>
      <soap:Body>
         <GetShipmentStatusResponse>
            <trackingNumber>FC123456789</trackingNumber>
            <status>IN_TRANSIT</status>
            <location>Distribution Center NYC</location>
         </GetShipmentStatusResponse>
      </soap:Body>
   </soap:Envelope>
   ```

4. **Explain transformation**:
   - SOAP XML → JSON
   - Partner format → Canonical format
   - Published to `canonical.shipment.updated`

**Key Points**:
- ✅ SOAP/XML support
- ✅ Legacy system integration
- ✅ Scheduled polling capability
- ✅ Transformation to canonical format

---

### Demo 3: Kafka Direct Integration (5 minutes)

**Scenario**: ShopMax publishes orders directly to Kafka

**Steps**:

1. **Explain the flow**:
   ```
   ShopMax → Kafka Topic → CanonBridge Transformer → Canonical Event
   ```

2. **Show Kafka producer**:
   ```bash
   echo '{
     "eventId": "sm-demo-001",
     "eventType": "order.created",
     "orderId": "ORD-DEMO-001",
     "customerId": "CUST-12345",
     "totalAmount": 99.99,
     "items": [
       {
         "sku": "PROD-001",
         "name": "Wireless Headphones",
         "quantity": 1,
         "price": 79.99
       }
     ]
   }' | docker exec -i canonbridge-kafka kafka-console-producer.sh \
     --bootstrap-server localhost:9092 \
     --topic partner.shopmax.raw
   ```

3. **Verify consumption**:
   ```bash
   ./scripts/consume-events.sh
   # Select: partner.shopmax.raw
   ```

4. **Show canonical output**:
   ```bash
   ./scripts/consume-events.sh
   # Select: canonical.order.created
   ```

**Key Points**:
- ✅ Native Kafka integration
- ✅ High throughput
- ✅ Real-time processing
- ✅ Scalable architecture

---

### Demo 4: REST API Query (3 minutes)

**Scenario**: Query transaction details via REST API

**Steps**:

1. **Show REST endpoint**:
   ```bash
   curl -X GET http://localhost:8080/api/payflex/transactions/TXN-12345 \
     -H "X-API-Key: demo-api-key-12345" | jq .
   ```

2. **Show response**:
   ```json
   {
     "transactionId": "TXN-12345",
     "amount": 149.99,
     "status": "SUCCESS",
     "customerEmail": "customer@example.com",
     "createdAt": "2026-05-12T10:30:00Z"
   }
   ```

**Key Points**:
- ✅ RESTful API support
- ✅ API key authentication
- ✅ JSON responses
- ✅ Standard HTTP methods

---

### Demo 5: End-to-End Flow (5 minutes)

**Scenario**: Complete order-to-delivery flow

**Steps**:

1. **Run full demo script**:
   ```bash
   ./scripts/demo-full.sh
   ```

2. **Walk through each step**:
   - ✅ Order created (ShopMax Kafka)
   - ✅ Payment processed (PayFlex Webhook)
   - ✅ Shipment created (FastCargo SOAP)
   - ✅ All events in canonical format
   - ✅ Ready for business logic consumption

3. **Show observability**:
   ```bash
   # Metrics
   curl http://localhost:8080/actuator/metrics | jq .
   
   # Health
   curl http://localhost:8080/actuator/health | jq .
   
   # Kafka topics
   docker exec canonbridge-kafka kafka-topics.sh \
     --bootstrap-server localhost:9092 --list
   ```

---

## Q&A Preparation

### Common Questions

**Q: How do you handle authentication?**
A: Multiple methods:
- Webhook keys (SHA-256 hashed)
- API keys (header-based)
- SOAP username/password
- OAuth2 (planned)

**Q: What about error handling?**
A: 
- Validation errors → 400 Bad Request
- Auth errors → 401 Unauthorized
- DLQ for failed transformations
- Retry with exponential backoff

**Q: How scalable is this?**
A:
- Kafka partitioning for parallelism
- Stateless services (horizontal scaling)
- Reactive non-blocking I/O
- Kubernetes-ready

**Q: What about data privacy?**
A:
- PII masking in logs
- Encrypted credentials
- Audit trail for all events
- GDPR compliance ready

**Q: Integration time?**
A:
- Simple webhook: 1 day
- REST API: 2-3 days
- SOAP: 3-5 days
- Kafka direct: 1-2 days

---

## Post-Demo Actions

### 1. Cleanup
```bash
# Stop services
docker-compose down

# Remove volumes (optional)
docker-compose down -v
```

### 2. Follow-up Materials
- Architecture diagrams
- API documentation
- Integration guides
- Pricing information

### 3. Next Steps
- Schedule technical deep-dive
- Provide sandbox environment
- Share integration examples
- Discuss custom requirements

---

## Troubleshooting

### Services Not Starting
```bash
# Check logs
docker-compose logs

# Restart specific service
docker-compose restart canonbridge-mock

# Rebuild
docker-compose up -d --build
```

### Kafka Issues
```bash
# Check Kafka health
docker exec canonbridge-kafka kafka-broker-api-versions.sh \
  --bootstrap-server localhost:9092

# Recreate topics
./scripts/init-kafka.sh
```

### Webhook Not Received
```bash
# Check logs
docker logs canonbridge-mock

# Verify webhook key
curl http://localhost:8080/admin/webhooks
```

---

## Demo Variations

### Quick Demo (10 minutes)
- Run `./scripts/demo-full.sh`
- Show Kafka topics
- Show webhook history

### Technical Deep-Dive (30 minutes)
- All 5 demos
- Show code
- Explain architecture
- Discuss scalability

### Executive Demo (5 minutes)
- Show architecture diagram
- Run full demo script
- Highlight business value
- Discuss ROI

---

## Success Metrics

Track these during demo:
- ✅ All services healthy
- ✅ All webhooks received (202 response)
- ✅ All events in Kafka
- ✅ No errors in logs
- ✅ Response times < 100ms

---

## See Also

- [Scenarios](./scenarios.md)
- [Payload Catalog](./payload-catalog.md)
- [API Examples](../API_EXAMPLES.md)
- [Quick Start](../QUICKSTART.md)
