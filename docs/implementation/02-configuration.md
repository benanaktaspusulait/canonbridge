# Configuration Management

## Environment Variables

Configuration should be managed through environment variables for production deployments.

### Required Environment Variables

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

See [Project Structure](./01-project-structure.md) for partner configuration examples.

---

**See Also**:
- [Project Structure](./01-project-structure.md)
- [Mapping Versioning](./03-mapping-versioning.md)
