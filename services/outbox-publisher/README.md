# Outbox Publisher

Reactive Quarkus service for publishing outbox rows to Kafka with at-least-once delivery guarantees.

## Features

- **Polling-based** - Query unpublished outbox rows
- **Reactive Publishing** - Non-blocking Kafka producer
- **Mark Published** - Update outbox status after successful publish
- **Retry Logic** - Exponential backoff for failed publishes
- **Ordering** - Maintain event order per aggregate

## Flow

1. Poll outbox table for unpublished rows (status = 'PENDING')
2. Order by created_at ASC
3. Publish to Kafka topic
4. On success, update status = 'PUBLISHED', published_at = NOW()
5. On failure, increment retry_count, update next_retry_at

## Configuration

```bash
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
DB_URL=postgresql://localhost:5432/canonbridge
OUTBOX_POLL_INTERVAL_MS=1000
OUTBOX_BATCH_SIZE=100
```

## Running

```bash
mvn quarkus:dev
```

## See Also

- [Outbox Pattern](../../docs/architecture/09-outbox-pattern.md)
