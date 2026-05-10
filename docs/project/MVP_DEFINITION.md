# CanonBridge - MVP Definition

**Version**: 1.0  
**Last Updated**: May 10, 2026  
**Status**: Official MVP Scope

> 📌 **This document defines the Minimum Viable Product (MVP) scope.**
> This is what we build in Phase 1 to prove core technical value.

---

## 🎯 WHAT IS MVP?

**MVP = Minimum Viable Product**

The smallest thing that:
1. Proves the core technical concept works
2. Delivers value to the first customer
3. Can be built quickly (4 weeks)
4. Provides learning for next phase

**MVP is NOT**:
- ❌ A complete product
- ❌ Production-ready at scale
- ❌ Feature-complete
- ❌ Polished UI

**MVP IS**:
- ✅ Working end-to-end
- ✅ Usable by first customer
- ✅ Technically validated
- ✅ Foundation for iteration

---

## ✅ IN SCOPE

### Core Functionality

**1. Single Partner Integration**
- Support exactly 1 partner
- Support exactly 1 event type (e.g., OrderCreated)
- Manual configuration (JSON files, no UI)

**2. Event Transformation**
- Kafka consumer (read from raw topic)
- JSONata transformation engine
- Ajv schema validation (input and output)
- Kafka producer (write to canonical topic)

**3. Error Handling**
- DLQ for invalid events
- Basic retry logic (3 attempts)
- Error logging

**4. Configuration**
- Partner configuration file (JSON)
- Input schema (JSON Schema)
- Canonical schema (JSON Schema)
- Mapping file (JSONata)

**5. Observability**
- Basic logging (structured JSON)
- Simple health check endpoint
- Basic metrics (events processed, errors)

**6. Deployment**
- Docker containerization
- Docker Compose for local development
- Basic README for setup

---

## ❌ OUT OF SCOPE

### Not in MVP

**1. Mapping Studio UI**
- No web interface
- No visual field mapping
- No sample JSON upload
- No preview functionality
- ➡️ Deferred to Phase 2

**2. Multiple Partners**
- No multi-partner support
- No partner-specific configuration
- No partner isolation
- ➡️ Deferred to Phase 4

**3. Advanced Features**
- No worker pool
- No circuit breaker
- No rate limiting
- No advanced monitoring (Prometheus, Grafana)
- No distributed tracing
- ➡️ Deferred to Phase 3

**4. Business Service**
- No idempotency handling
- No ordering logic
- No outbox pattern
- No database integration
- ➡️ Deferred to Phase 5

**5. Enterprise Features**
- No multi-tenancy
- No RBAC
- No audit trail
- No encryption
- ➡️ Deferred to Phase 7

**6. Production Infrastructure**
- No Kubernetes deployment
- No CI/CD pipeline
- No auto-scaling
- No blue-green deployment
- ➡️ Deferred to Phase 6

---

## 📋 DETAILED REQUIREMENTS

### 1. Kafka Consumer

**Requirements**:
- Connect to Kafka broker
- Subscribe to `partner.raw.events` topic
- Consume messages one at a time
- Parse message envelope
- Extract partner ID, event type, version
- Manual offset commit (after successful processing)

**Configuration**:
```json
{
  "kafka": {
    "brokers": ["localhost:9092"],
    "groupId": "canonbridge-transformer",
    "topics": {
      "input": "partner.raw.events",
      "output": "canonical.events",
      "dlq": "transformation.dlq"
    }
  }
}
```

---

### 2. JSONata Transformation

**Requirements**:
- Load mapping file for partner/event/version
- Execute JSONata transformation
- Handle transformation errors
- Return transformed payload

**Example Mapping File** (`partners/acme/order-created/v1/mapping.jsonata`):
```jsonata
{
  "orderId": order_id,
  "customerId": customer_id,
  "totalAmount": amount,
  "currency": "USD",
  "items": items.{
    "productId": product_id,
    "quantity": quantity,
    "price": price
  },
  "createdAt": $now()
}
```

---

### 3. Schema Validation

**Requirements**:
- Load input schema (optional)
- Load canonical schema (required)
- Validate input payload (if schema exists)
- Validate output payload (always)
- Return validation errors

**Example Input Schema** (`partners/acme/order-created/v1/input-schema.json`):
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["order_id", "customer_id", "amount"],
  "properties": {
    "order_id": { "type": "string" },
    "customer_id": { "type": "string" },
    "amount": { "type": "number", "minimum": 0 },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["product_id", "quantity"],
        "properties": {
          "product_id": { "type": "string" },
          "quantity": { "type": "integer", "minimum": 1 },
          "price": { "type": "number", "minimum": 0 }
        }
      }
    }
  }
}
```

---

### 4. Kafka Producer

**Requirements**:
- Produce to `canonical.events` topic
- Include correlation ID
- Include metadata (partner, event type, version)
- Wait for acknowledgment
- Handle produce errors

**Canonical Event Format**:
```json
{
  "metadata": {
    "eventId": "uuid",
    "correlationId": "uuid",
    "eventType": "OrderCreated",
    "version": "v1",
    "timestamp": "2026-05-10T12:00:00Z",
    "source": {
      "partnerId": "acme",
      "originalEventType": "order_created"
    }
  },
  "payload": {
    "orderId": "12345",
    "customerId": "67890",
    "totalAmount": 99.99,
    "currency": "USD",
    "items": [
      {
        "productId": "ABC",
        "quantity": 2,
        "price": 49.99
      }
    ],
    "createdAt": "2026-05-10T12:00:00Z"
  }
}
```

---

### 5. Error Handling

**Requirements**:
- Classify errors (validation, transformation, system)
- Send validation errors to DLQ immediately
- Retry transformation errors (3 attempts)
- Send to DLQ after max retries
- Log all errors with context

**DLQ Message Format**:
```json
{
  "originalMessage": { ... },
  "error": {
    "type": "ValidationError",
    "message": "Invalid input: missing required field 'customer_id'",
    "timestamp": "2026-05-10T12:00:00Z",
    "attemptCount": 1
  },
  "metadata": {
    "partnerId": "acme",
    "eventType": "order_created",
    "version": "v1"
  }
}
```

---

### 6. Configuration Management

**Partner Configuration** (`partners/acme/config.json`):
```json
{
  "partnerId": "acme",
  "name": "ACME Corporation",
  "events": {
    "order_created": {
      "versions": {
        "v1": {
          "inputSchema": "partners/acme/order-created/v1/input-schema.json",
          "mapping": "partners/acme/order-created/v1/mapping.jsonata",
          "canonicalSchema": "schemas/canonical/order-created-v1.json",
          "canonicalEventType": "OrderCreated",
          "canonicalVersion": "v1"
        }
      }
    }
  }
}
```

---

### 7. Logging

**Requirements**:
- Structured JSON logging
- Include correlation ID in all logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Log key events: message received, transformation started, validation passed/failed, message produced

**Example Log Entry**:
```json
{
  "timestamp": "2026-05-10T12:00:00Z",
  "level": "INFO",
  "message": "Message transformed successfully",
  "correlationId": "uuid",
  "partnerId": "acme",
  "eventType": "order_created",
  "version": "v1",
  "duration": 45
}
```

---

### 8. Health Check

**Requirements**:
- HTTP endpoint: `GET /health`
- Check Kafka connectivity
- Return 200 if healthy, 503 if unhealthy

**Response**:
```json
{
  "status": "healthy",
  "checks": {
    "kafka": "connected",
    "uptime": 3600
  }
}
```

---

### 9. Metrics

**Requirements**:
- Count events processed
- Count events failed
- Count DLQ messages
- Expose via HTTP endpoint: `GET /metrics`

**Response**:
```json
{
  "eventsProcessed": 1000,
  "eventsFailed": 5,
  "dlqMessages": 2,
  "uptime": 3600
}
```

---

## 🏗️ ARCHITECTURE

### MVP Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Partner System                      │
│                  (sends order events)                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Kafka: partner.raw.events                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              CanonBridge Transformer (MVP)              │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Kafka      │  │   JSONata    │  │     Ajv      │ │
│  │  Consumer    │  │    Engine    │  │  Validator   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Config     │  │    Error     │  │    Kafka     │ │
│  │   Loader     │  │   Handler    │  │   Producer   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│            Kafka: canonical.events                      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Downstream Services                        │
│           (consume canonical events)                    │
└─────────────────────────────────────────────────────────┘

                         │ (errors)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Kafka: transformation.dlq                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 PROJECT STRUCTURE

```
canonbridge-transformer/
├── src/
│   ├── index.ts                 # Entry point
│   ├── consumer.ts              # Kafka consumer
│   ├── producer.ts              # Kafka producer
│   ├── transformer.ts           # JSONata transformation
│   ├── validator.ts             # Ajv validation
│   ├── config-loader.ts         # Configuration management
│   ├── error-handler.ts         # Error handling
│   ├── logger.ts                # Logging
│   └── health.ts                # Health check
├── partners/
│   └── acme/
│       ├── config.json
│       └── order-created/
│           └── v1/
│               ├── input-schema.json
│               ├── mapping.jsonata
│               └── fixtures/
│                   ├── valid-order.input.json
│                   └── valid-order.expected.json
├── schemas/
│   └── canonical/
│       └── order-created-v1.json
├── test/
│   ├── unit/
│   │   ├── transformer.test.ts
│   │   └── validator.test.ts
│   └── integration/
│       └── end-to-end.test.ts
├── docker-compose.yml           # Local Kafka + PostgreSQL
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

---

## ✅ SUCCESS CRITERIA

### Functional Requirements
- [ ] Consumes messages from Kafka
- [ ] Transforms using JSONata
- [ ] Validates with Ajv
- [ ] Produces to canonical topic
- [ ] Sends errors to DLQ
- [ ] Logs all operations
- [ ] Health check works
- [ ] Metrics endpoint works

### Performance Requirements
- [ ] Process 100 events/second
- [ ] p99 latency < 500ms
- [ ] Zero data loss in normal operation
- [ ] Graceful handling of invalid events

### Quality Requirements
- [ ] Unit test coverage > 70%
- [ ] Integration test passes
- [ ] Can be deployed with Docker Compose
- [ ] README explains setup and usage

### Customer Requirements
- [ ] First customer can use it
- [ ] Processes real partner events
- [ ] Produces valid canonical events
- [ ] Errors are visible and actionable

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1: Foundation
- Day 1-2: Project setup + Kafka consumer
- Day 3-4: Kafka producer + basic flow
- Day 5: Testing + documentation

**Deliverable**: Messages flow from input to output topic

---

### Week 2: Transformation
- Day 1-2: JSONata integration
- Day 3-4: Configuration loading
- Day 5: Testing + documentation

**Deliverable**: Transformation works with sample data

---

### Week 3: Validation & Error Handling
- Day 1-2: Ajv validation
- Day 3-4: Error handling + DLQ
- Day 5: Testing + documentation

**Deliverable**: Invalid events go to DLQ

---

### Week 4: Polish & Deploy
- Day 1-2: Health check + metrics
- Day 3: Integration testing
- Day 4: Docker containerization
- Day 5: Documentation + handoff

**Deliverable**: MVP ready for first customer

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Transformer logic
- Validator logic
- Error handler
- Config loader

### Integration Tests
- End-to-end flow
- Kafka integration
- Error scenarios
- DLQ handling

### Manual Tests
- Deploy locally
- Send test events
- Verify canonical output
- Verify DLQ for errors
- Check logs
- Check metrics

---

## 📚 DOCUMENTATION

### Required Documentation
- [ ] README.md (setup and usage)
- [ ] Architecture diagram
- [ ] Configuration guide
- [ ] Partner onboarding guide
- [ ] Troubleshooting guide

### README Structure
```markdown
# CanonBridge Transformer (MVP)

## What is this?
[Brief description]

## Quick Start
[5-minute setup]

## Configuration
[How to configure partner]

## Testing
[How to test]

## Troubleshooting
[Common issues]
```

---

## 🚀 DEPLOYMENT

### Local Development
```bash
# Start Kafka
docker-compose up -d

# Install dependencies
npm install

# Run transformer
npm start

# Send test event
npm run test:send-event

# Check output
npm run test:check-output
```

### Docker Deployment
```bash
# Build image
docker build -t canonbridge-transformer:mvp .

# Run container
docker run -d \
  --name transformer \
  -e KAFKA_BROKERS=kafka:9092 \
  canonbridge-transformer:mvp
```

---

## 🔄 WHAT COMES AFTER MVP?

### Phase 2: Mapping Studio UI
- Visual field mapping
- Sample JSON upload
- Preview functionality
- No-code for business users

### Phase 3: Production Hardening
- Monitoring (Prometheus + Grafana)
- Advanced error handling
- Performance optimization
- Load testing

### Phase 4: Multi-Partner Support
- Multiple partners
- Partner-specific configuration
- Partner isolation

---

## 📞 QUESTIONS?

For MVP-related questions:
- **Technical**: [Tech Lead]
- **Product**: [Product Manager]
- **Timeline**: [Project Manager]

---

## 🔄 CHANGE LOG

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-05-10 | 1.0 | Initial MVP definition | Kiro AI |

---

**This is the official MVP scope. Do not add features without updating this document.**
