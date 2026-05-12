# Quick Start Guide

## Prerequisites

1. **Java 17+**
```bash
java -version
```

2. **Maven 3.9+**
```bash
mvn -version
```

3. **PostgreSQL**
```bash
docker run -d --name canonbridge-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=canonbridge \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:15-alpine
```

4. **Kafka**
```bash
cd infrastructure/kafka
docker-compose up -d
```

## Start Services

### 1. Mapping Studio API (Port 8080)
```bash
cd services/mapping-studio-api
mvn quarkus:dev
```

Test:
```bash
curl http://localhost:8080/health/live
curl http://localhost:8080/metrics
```

### 2. Outbound Call Manager (Port 8081)
```bash
cd services/outbound-call-manager
mvn quarkus:dev
```

Test:
```bash
curl http://localhost:8081/health/live
```

### 3. Webhook Receiver (Port 8082)
```bash
cd services/webhook-receiver
mvn quarkus:dev
```

Test:
```bash
curl http://localhost:8082/health/live
```

### 4. Transformer Service (Port 3000)
```bash
cd services/transformer
npm install
npm run dev
```

Test:
```bash
curl http://localhost:3000/health/live
```

## Test End-to-End Flow

### 1. Create a Partner
```bash
curl -X POST http://localhost:8080/api/partners \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: test-tenant" \
  -H "X-User-Id: admin" \
  -d '{
    "externalId": "partner-001",
    "name": "Test Partner",
    "description": "Test partner for demo",
    "status": "ACTIVE"
  }'
```

### 2. Create a Mapping Draft
```bash
curl -X POST http://localhost:8080/api/mapping-drafts \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: test-tenant" \
  -H "X-User-Id: admin" \
  -d '{
    "partnerId": "<PARTNER_ID_FROM_STEP_1>",
    "eventType": "order.created",
    "name": "Order Created Mapping",
    "sourceType": "WEBHOOK",
    "status": "DRAFT"
  }'
```

### 3. Send a Webhook
```bash
curl -X POST http://localhost:8082/webhook/<PARTNER_ID>/order.created \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Key: test-key-123" \
  -d '{
    "orderId": "ORD-001",
    "customerId": "CUST-001",
    "amount": 99.99
  }'
```

### 4. Check Kafka Topic
```bash
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic raw-partner-events \
  --from-beginning
```

## Swagger UI

- Mapping Studio API: http://localhost:8080/swagger-ui
- Outbound Call Manager: http://localhost:8081/swagger-ui
- Webhook Receiver: http://localhost:8082/swagger-ui

## Prometheus Metrics

- Mapping Studio API: http://localhost:8080/metrics
- Outbound Call Manager: http://localhost:8081/metrics
- Webhook Receiver: http://localhost:8082/metrics
- Transformer: http://localhost:3000/metrics

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U postgres -d canonbridge
```

### Kafka Connection Issues
```bash
# Check Kafka is running
docker ps | grep kafka

# List topics
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### Port Already in Use
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

## Development Mode Features

Quarkus dev mode includes:
- Live reload on code changes
- Dev UI at http://localhost:8080/q/dev
- Continuous testing
- Database dev services

## Next Steps

1. Implement business-consumer-service
2. Implement outbox-publisher
3. Add credential-store
4. Configure OIDC authentication
5. Deploy to Kubernetes

## Support

See [Services README](./README.md) for detailed documentation.
