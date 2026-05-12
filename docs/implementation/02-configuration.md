# Configuration Management

## Environment Variables

Configuration should be managed through environment variables for production deployments. Partner-specific behavior belongs in published partner/event configuration, not in service environment variables.

Secrets should be injected through Kubernetes Secrets, Vault, or an equivalent secret manager. Published mapping artifacts and exported Studio configs must contain credential references only, never raw secret values.

## Backend Service Configuration Matrix

| Service | Required Configuration | Notes |
|---------|------------------------|-------|
| `mapping-studio-api` | `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_ISSUER`, `JWT_AUDIENCE`, `ENCRYPTION_KEY_REF`, `AUDIT_ENABLED`, `TRANSFORMER_BASE_URL`, `OUTBOUND_MANAGER_BASE_URL` | Owns management APIs, publish gates, metadata, and audit events. |
| `transformer-service` | `KAFKA_BROKERS`, `KAFKA_CONSUMER_GROUP`, `KAFKA_INPUT_TOPIC`, `KAFKA_OUTPUT_TOPIC`, `KAFKA_DLQ_TOPIC`, `PARTNER_CONFIG_ROOT`, `SCHEMA_ROOT`, `OUTBOUND_MANAGER_BASE_URL` | Existing Node.js service. Can run HTTP dry-run mode and/or Kafka mode. |
| `outbound-call-manager` | `DATABASE_URL`, `CREDENTIAL_STORE_MODE`, `ENCRYPTION_KEY_REF`, `EGRESS_ALLOWLIST`, `PRIVATE_IP_BLOCK_ENABLED`, `DEFAULT_TIMEOUT_MS`, `DEFAULT_RETRY_MAX`, `OAUTH_TOKEN_CACHE_TTL_SECONDS` | Executes external REST/SOAP calls and stores safe call history. |
| `webhook-receiver` | `DATABASE_URL`, `KAFKA_BROKERS`, `KAFKA_RAW_TOPIC`, `WEBHOOK_PUBLIC_BASE_URL`, `WEBHOOK_RATE_LIMIT_PER_MINUTE` | May be deployed as a module inside `mapping-studio-api` for MVP. |
| `scheduled-poller` | `DATABASE_URL`, `OUTBOUND_MANAGER_BASE_URL`, `KAFKA_BROKERS`, `KAFKA_RAW_TOPIC`, `SCHEDULER_ENABLED`, `SCHEDULER_LOCK_TTL_SECONDS` | May be deployed as a module inside `outbound-call-manager` for MVP. |
| `business-consumer-service` | `DATABASE_URL`, `KAFKA_BROKERS`, `KAFKA_CANONICAL_TOPIC`, `KAFKA_CONSUMER_GROUP`, `IDEMPOTENCY_TTL_DAYS` | Consumes canonical events and writes business state plus outbox rows. |
| `outbox-publisher` | `DATABASE_URL`, `KAFKA_BROKERS`, `KAFKA_BUSINESS_TOPIC`, `OUTBOX_BATCH_SIZE`, `OUTBOX_POLL_INTERVAL_MS` | Publishes durable outbox records. |

## Common Variables

```bash
SERVICE_NAME=canonbridge-service
SERVICE_ENV=production
LOG_LEVEL=info
TENANT_MODE=multi
METRICS_PORT=9090
TRACING_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
```

### Transformer Service Required Environment Variables

```bash
# Kafka
KAFKA_BROKERS=kafka-0:9092,kafka-1:9092,kafka-2:9092
KAFKA_CONSUMER_GROUP=transformer-service
KAFKA_SECURITY_PROTOCOL=SASL_SSL
KAFKA_SASL_MECHANISM=SCRAM-SHA-512
KAFKA_SASL_USERNAME=transformer
KAFKA_SASL_PASSWORD=<secret>

# Service
NODE_ENV=production
SERVICE_PORT=3000
SERVICE_NAME=transformer-service
LOG_LEVEL=info
PARTNER_CONFIG_ROOT=/app/partners
SCHEMA_ROOT=/app/schemas
OUTBOUND_MANAGER_BASE_URL=http://outbound-call-manager:8080

# Processing
WORKER_POOL_ENABLED=true
WORKER_COUNT=4
MAX_IN_FLIGHT_MESSAGES=100
WORKER_TIMEOUT_MS=5000

# Monitoring
METRICS_PORT=9090
TRACING_ENABLED=true
JAEGER_AGENT_HOST=jaeger
JAEGER_AGENT_PORT=6831
```

### Mapping Studio API Environment Variables

```bash
SERVICE_NAME=mapping-studio-api
HTTP_PORT=8080
DATABASE_URL=jdbc:postgresql://postgres:5432/canonbridge
DATABASE_USERNAME=canonbridge
DATABASE_PASSWORD=<secret>
JWT_ISSUER=https://auth.example.com/
JWT_AUDIENCE=canonbridge
ENCRYPTION_KEY_REF=kms://canonbridge/prod/credential-key
TRANSFORMER_BASE_URL=http://transformer-service:3000
OUTBOUND_MANAGER_BASE_URL=http://outbound-call-manager:8080
AUDIT_ENABLED=true
```

### Outbound Call Manager Environment Variables

```bash
SERVICE_NAME=outbound-call-manager
HTTP_PORT=8080
DATABASE_URL=jdbc:postgresql://postgres:5432/canonbridge
CREDENTIAL_STORE_MODE=postgres_encrypted
ENCRYPTION_KEY_REF=kms://canonbridge/prod/credential-key
EGRESS_ALLOWLIST=api.partner-a.com,*.carrier.example
PRIVATE_IP_BLOCK_ENABLED=true
DEFAULT_TIMEOUT_MS=5000
DEFAULT_RETRY_MAX=3
DEFAULT_RETRY_BACKOFF_MS=500
OAUTH_TOKEN_CACHE_TTL_SECONDS=300
SOAP_ENABLED=true
```

### Webhook and Scheduler Environment Variables

```bash
WEBHOOK_PUBLIC_BASE_URL=https://hooks.canonbridge.example.com
WEBHOOK_RATE_LIMIT_PER_MINUTE=120
KAFKA_RAW_TOPIC=partner.raw.events

SCHEDULER_ENABLED=true
SCHEDULER_LOCK_TTL_SECONDS=120
SCHEDULED_POLL_MAX_CONCURRENCY=20
```

### Business and Outbox Environment Variables

```bash
KAFKA_CANONICAL_TOPIC=canonical.events
KAFKA_BUSINESS_TOPIC=business.events
IDEMPOTENCY_TTL_DAYS=30
OUTBOX_BATCH_SIZE=100
OUTBOX_POLL_INTERVAL_MS=1000
```

### Optional Environment Variables

```bash
# Development
DEBUG=transformer:*

# Performance
MAPPING_CACHE_SIZE=1000
SCHEMA_CACHE_SIZE=500
WORKER_QUEUE_SIZE=1000

# Retry
RETRY_MAX_ATTEMPTS=3
RETRY_BACKOFF_MS=1000

# Graceful Shutdown
SHUTDOWN_GRACE_PERIOD_MS=30000
WORKER_DRAIN_TIMEOUT_MS=20000
```

## Configuration File

See [Project Structure](./01-project-structure.md) for the minimal transformer configuration example and [Architecture V7](../architecture/architecture-v7-outbound.md#40-partnerevent-configuration-update) for the full source, trigger, authentication, and outbound configuration shape.

---

**See Also**:
- [Project Structure](./01-project-structure.md)
- [Backend Service Requirements](./11-backend-service-requirements.md)
- [Mapping Versioning](./03-mapping-versioning.md)
