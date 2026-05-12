# Business Consumer Service

Reactive Quarkus service for consuming canonical events and writing to business domain tables with transactional outbox pattern.

## Features

- **Kafka Consumer** - Reactive consumption of canonical events
- **Idempotency** - Event ID based deduplication
- **Ordering** - Per-entity ordering guarantees
- **Transactional Outbox** - Atomic domain write + outbox insert
- **Manual Offset Commit** - Commit only after successful processing

## Flow

1. Consume canonical event from Kafka
2. Check idempotency (event_id already processed?)
3. Validate business rules
4. Begin transaction
5. Write to domain tables
6. Insert outbox row
7. Commit transaction
8. Commit Kafka offset

## Configuration

```bash
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
DB_URL=postgresql://localhost:5432/canonbridge
```

## Running

```bash
mvn quarkus:dev
```

## See Also

- [Business Layer](../../docs/architecture/06-business-layer.md)
- [Outbox Pattern](../../docs/architecture/09-outbox-pattern.md)
