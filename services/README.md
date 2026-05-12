# CanonBridge Services

Full reactive microservices architecture built with Quarkus, Vert.x, and reactive PostgreSQL.

## Service Inventory

### 1. mapping-studio-api (Port 8080)
**Status**: ✅ Implemented  
**Tech**: Quarkus + Vert.x + Reactive PostgreSQL  
**Purpose**: Mapping draft management, version control, partner management

**Endpoints**:
- `/api/partners` - Partner CRUD
- `/api/mapping-drafts` - Draft management
- `/api/mapping-versions` - Version management
- `/health/*` - Health checks
- `/metrics` - Prometheus metrics

### 2. transformer-service (Port 3000)
**Status**: ✅ Existing (Node.js/TypeScript)  
**Tech**: Node.js + TypeScript + Kafka + JSONata  
**Purpose**: Event transformation, schema validation, DLQ routing

**Endpoints**:
- `POST /v1/transform` - Transform payload
- `POST /v1/validate-expression` - Validate JSONata
- `/health/*` - Health checks
- `/metrics` - Prometheus metrics

### 3. outbound-call-manager (Port 8081)
**Status**: ✅ Implemented  
**Tech**: Quarkus + Vert.x + Reactive HTTP Client  
**Purpose**: Controlled external API calls with SSRF protection

**Endpoints**:
- `POST /internal/outbound/execute` - Execute call
- `POST /internal/outbound/test` - Test connection
- `/health/*` - Health checks
- `/metrics` - Prometheus metrics

**Security Features**:
- Private IP blocking
- URL allowlist enforcement
- Request/response masking
- Circuit breaker + retry

### 4. webhook-receiver (Port 8082)
**Status**: ✅ Implemented  
**Tech**: Quarkus + Vert.x + Reactive Kafka  
**Purpose**: Webhook ingestion from partners

**Endpoints**:
- `POST /webhook/{partnerId}/{eventType}` - Receive webhook

**Features**:
- Webhook key authentication
- Kafka publishing
- Event envelope wrapping

### 5. business-consumer-service (Port 8083)
**Status**: 🚧 To be implemented  
**Tech**: Quarkus + Vert.x + Reactive PostgreSQL  
**Purpose**: Consume canonical events, enforce idempotency, write outbox

**Features**:
- Kafka consumer for canonical events
- Idempotency enforcement
- Ordering guarantees
- Transactional outbox writes

### 6. outbox-publisher (Port 8084)
**Status**: 🚧 To be implemented  
**Tech**: Quarkus + Vert.x + Reactive Kafka  
**Purpose**: Publish outbox rows to Kafka

**Features**:
- Polling-based outbox pattern
- At-least-once delivery
- Mark published rows

### 7. scheduled-poller
**Status**: 🚧 To be implemented  
**Tech**: Quarkus Scheduler or Kubernetes CronJob  
**Purpose**: Periodic external API polling

## Architecture Principles

### Full Reactive Stack
- **No blocking I/O** - All services use reactive patterns
- **Mutiny** - Reactive programming with `Uni` and `Multi`
- **Vert.x** - Event-driven runtime
- **Reactive PostgreSQL Client** - Non-blocking database access
- **Reactive Kafka** - Non-blocking message streaming

### No Panache
- Direct SQL with reactive client
- Full control over queries
- Better performance for high-throughput scenarios

### Multi-tenancy
- All requests require `X-Tenant-Id` header
- Tenant isolation at database level
- Tenant-scoped queries

### Observability
- Structured JSON logging
- Prometheus metrics
- Health checks (liveness + readiness)
- Correlation ID propagation

### Security
- SSRF protection in outbound calls
- Webhook key authentication
- Credential encryption
- PII masking in logs and storage

## Database Schema

All services share a single PostgreSQL database with Flyway migrations:

- `partners` - Partner organizations
- `mapping_drafts` - Work-in-progress mappings
- `mapping_versions` - Immutable published versions
- `outbound_connections` - External system connections
- `call_history` - Outbound call audit log
- `webhook_endpoints` - Webhook configurations
- `credentials` - Encrypted credentials (to be implemented)
- `outbox` - Transactional outbox pattern (to be implemented)

## Running Locally

### Prerequisites
```bash
# PostgreSQL
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_DB=canonbridge \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:15-alpine

# Kafka
docker-compose -f infrastructure/kafka/docker-compose.yml up -d
```

### Start Services

```bash
# mapping-studio-api
cd services/mapping-studio-api
mvn quarkus:dev

# transformer-service (existing)
cd services/transformer
npm run dev

# outbound-call-manager
cd services/outbound-call-manager
mvn quarkus:dev

# webhook-receiver
cd services/webhook-receiver
mvn quarkus:dev
```

## Docker Build

Each service has a multi-stage Dockerfile:

```bash
cd services/mapping-studio-api
docker build -t canonbridge/mapping-studio-api:latest .
```

## Kubernetes Deployment

See `infrastructure/k8s/` for Kubernetes manifests.

## Testing

```bash
# Unit tests
mvn test

# Integration tests
mvn verify -Pit

# Load tests
k6 run tests/load/mapping-studio-api.js
```

## Monitoring

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001`
- **Jaeger**: `http://localhost:16686`

## See Also

- [Backend Service Requirements](../docs/implementation/11-backend-service-requirements.md)
- [Architecture Overview](../docs/architecture/01-overview.md)
- [Deployment Guide](../docs/deployment/KUBERNETES_DEPLOYMENT_GUIDE.md)
