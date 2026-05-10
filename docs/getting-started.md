# Getting Started with ETL Solutions

Welcome to ETL Solutions! This guide will help you get up and running quickly.

## 🚀 Quick Start (5 minutes)

### 1. Understand the Problem

**Before ETL Solutions**:
```
Partner A sends JSON → Custom adapter → Business logic
Partner B sends JSON → Custom adapter → Business logic
Partner C sends JSON → Custom adapter → Business logic
```

**With ETL Solutions**:
```
Partner A sends JSON ─┐
Partner B sends JSON ─┼→ Transformer (JSONata) → Canonical Events → Business logic
Partner C sends JSON ─┘
```

### 2. Key Concepts

| Concept | Meaning |
|---------|---------|
| **Raw Event** | Partner's original JSON payload |
| **Canonical Event** | Standardized business event |
| **Mapping** | JSONata transformation rule |
| **Schema** | JSON Schema validation rule |
| **DLQ** | Dead Letter Queue for errors |

### 3. The Flow

```
1. Partner sends JSON to Kafka raw topic
2. Transformer reads message
3. Transformer applies JSONata mapping
4. Transformer validates with Ajv schema
5. Transformer publishes canonical event
6. Business service consumes canonical event
7. Business service updates database
8. Outbox publisher sends business events
```

## 📖 Documentation Paths

### I want to understand the architecture
→ Start with `docs/architecture/01-overview.md`

### I want to set up development
→ Start with `docs/implementation/01-project-structure.md`

### I want to deploy to production
→ Start with `docs/deployment/01-deployment-checklist.md`

### I want to operate the system
→ Start with `docs/operations/08-runbook.md`

### I want to see the product roadmap
→ Read `product/roadmap.md`

## 🛠️ Local Development Setup

### Prerequisites
```bash
# Required
- Node.js 18+
- Docker & Docker Compose
- Git

# Optional
- VS Code
- Postman
```

### Quick Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd etlsolutions

# 2. Install dependencies
npm install

# 3. Start infrastructure
docker-compose up -d

# 4. Run tests
npm test

# 5. Start development server
npm run dev
```

### Verify Setup
```bash
# Check health
curl http://localhost:3000/health/live

# Check readiness
curl http://localhost:3000/health/ready

# View metrics
curl http://localhost:9090/metrics
```

## 📝 First Integration (30 minutes)

### Step 1: Define Your Partner

Create `partners/my-partner/order-created/config.json`:

```json
{
  "partnerId": "my-partner",
  "eventType": "OrderCreated",
  "schemaVersion": "v1",
  "direction": "inbound",
  "inputSchema": "partners/my-partner/order-created/input.v1.schema.json",
  "mapping": "partners/my-partner/order-created/inbound.v1.jsonata",
  "canonicalSchema": "schemas/canonical/order-created.v1.schema.json",
  "kafka": {
    "inputTopic": "partner.raw.events",
    "outputTopic": "canonical.events",
    "dlqTopic": "transformation.dlq",
    "partitionKeyPath": "$.entityId"
  }
}
```

### Step 2: Create Input Schema

Create `partners/my-partner/order-created/input.v1.schema.json`:

```json
{
  "$id": "my-partner.order-created.input.v1",
  "type": "object",
  "required": ["order_id", "customer_id", "amount"],
  "properties": {
    "order_id": { "type": "string" },
    "customer_id": { "type": "string" },
    "amount": { "type": "number" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "product_id": { "type": "string" },
          "quantity": { "type": "integer" }
        }
      }
    }
  }
}
```

### Step 3: Create Mapping

Create `partners/my-partner/order-created/inbound.v1.jsonata`:

```jsonata
{
  "orderId": order_id,
  "customerId": customer_id,
  "totalAmount": amount,
  "items": items.{
    "productId": product_id,
    "quantity": quantity
  }
}
```

### Step 4: Create Canonical Schema

Create `schemas/canonical/order-created.v1.schema.json`:

```json
{
  "$id": "canonical.order-created.v1",
  "type": "object",
  "required": ["eventId", "orderId", "customerId", "totalAmount"],
  "properties": {
    "eventId": { "type": "string" },
    "orderId": { "type": "string" },
    "customerId": { "type": "string" },
    "totalAmount": { "type": "number" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["productId", "quantity"],
        "properties": {
          "productId": { "type": "string" },
          "quantity": { "type": "integer" }
        }
      }
    }
  }
}
```

### Step 5: Test the Mapping

```bash
# Use the dry-run endpoint
curl -X POST http://localhost:3000/admin/transform/test \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId": "my-partner",
    "eventType": "OrderCreated",
    "schemaVersion": "v1",
    "direction": "inbound",
    "rawMessage": {
      "eventId": "evt-123",
      "payload": {
        "order_id": "ORD-001",
        "customer_id": "CUST-001",
        "amount": 99.99,
        "items": [
          {"product_id": "P-001", "quantity": 2}
        ]
      }
    }
  }'
```

### Step 6: Send Test Message

```bash
# Produce a test message to Kafka
npm run kafka:produce -- \
  --topic partner.raw.events \
  --key ORD-001 \
  --value '{
    "eventId": "evt-123",
    "correlationId": "corr-456",
    "partnerId": "my-partner",
    "eventType": "OrderCreated",
    "entityType": "ORDER",
    "entityId": "ORD-001",
    "schemaVersion": "v1",
    "occurredAt": "2026-05-10T10:15:00Z",
    "payload": {
      "order_id": "ORD-001",
      "customer_id": "CUST-001",
      "amount": 99.99,
      "items": [
        {"product_id": "P-001", "quantity": 2}
      ]
    }
  }'
```

### Step 7: Verify Output

```bash
# Check canonical topic
npm run kafka:consume -- \
  --topic canonical.events \
  --from-beginning \
  --max-messages 1
```

## 📊 Monitoring Your Integration

### Health Checks

```bash
# Liveness (is it running?)
curl http://localhost:3000/health/live

# Readiness (can it process?)
curl http://localhost:3000/health/ready

# Startup (is it initialized?)
curl http://localhost:3000/health/startup
```

### Metrics

```bash
# View Prometheus metrics
curl http://localhost:9090/metrics

# Key metrics to watch:
# - transform_duration_ms
# - validation_fail_total
# - dlq_total
# - kafka_consumer_lag
```

### Logs

```bash
# View structured logs
docker logs transformer-service | jq .

# Filter by level
docker logs transformer-service | jq 'select(.level=="error")'

# Filter by partner
docker logs transformer-service | jq 'select(.partnerId=="my-partner")'
```

## 🐛 Troubleshooting

### Messages going to DLQ

1. Check the error message in DLQ
2. Run dry-run transform to debug
3. Verify schemas are correct
4. Check mapping syntax
5. Review logs for details

### High consumer lag

1. Check transformer pod logs
2. Monitor worker queue depth
3. Increase worker count if needed
4. Check Kafka broker health
5. Review transformation performance

### Validation failures

1. Check input schema
2. Verify partner payload matches schema
3. Run dry-run transform
4. Check canonical schema
5. Review mapping output

## 📚 Next Steps

### For Developers
1. Read `docs/implementation/01-project-structure.md`
2. Explore the codebase
3. Run the tests
4. Create your first mapping
5. Submit a pull request

### For Operations
1. Read `docs/operations/08-runbook.md`
2. Set up monitoring dashboards
3. Configure alerting
4. Test disaster recovery
5. Document procedures

### For Product Managers
1. Read `product/roadmap.md`
2. Review success metrics
3. Plan feature releases
4. Gather customer feedback
5. Iterate on roadmap

## 🎓 Learning Resources

### Documentation
- `README.md` - Full documentation index
- `docs/architecture/` - Architecture decisions
- `docs/implementation/` - Implementation patterns
- `docs/operations/` - Operational procedures
- `docs/deployment/` - Deployment strategies
- `docs/testing/` - Testing strategies

### Code Examples
- `partners/` - Partner configuration examples
- `schemas/` - Schema examples
- `test/` - Test examples

### Videos (Coming Soon)
- Architecture overview
- First integration walkthrough
- Deployment procedures
- Troubleshooting guide

## 💬 Getting Help

### Documentation
- Check `README.md` for navigation
- Search for your topic
- Review examples

### Community
- GitHub Issues
- Slack community
- Email support

### Support Tiers
- **Free**: Community support
- **Professional**: Email support (24 hours)
- **Enterprise**: 24/7 phone/email support

## ✅ Checklist

Before going to production:

- [ ] Read architecture documentation
- [ ] Set up local development
- [ ] Create first integration
- [ ] Write unit tests
- [ ] Run integration tests
- [ ] Set up monitoring
- [ ] Configure alerting
- [ ] Test disaster recovery
- [ ] Document procedures
- [ ] Train team

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Understand the architecture
- ✅ Set up development
- ✅ Create your first integration
- ✅ Monitor and operate the system
- ✅ Deploy to production

**Next**: Choose your path above and dive in!

---

**Questions?** Check `README.md` or `README.md`

**Last Updated**: May 10, 2026
