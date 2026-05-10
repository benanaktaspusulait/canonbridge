# Business Layer

## Core Responsibility

The business service is responsible for:

```text
consume canonical event
check idempotency
apply business rules
handle parent-child dependencies
write to DB
write outbox event in same transaction
```

## Idempotency

Kafka systems should assume duplicate delivery can happen.

### Duplicates Can Happen Because Of

```text
consumer retry
producer retry
DLQ replay
service crash after DB write but before offset commit
manual replay
```

### Required Idempotency Key

Use:

```text
eventId
```

### Business Service Table

```sql
CREATE TABLE processed_events (
    event_id VARCHAR(255) PRIMARY KEY,
    partner_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Processing Rule

Inside the same DB transaction:

```text
1. Check if eventId exists in processed_events
2. If exists, skip processing and treat as success
3. If not exists, process domain update
4. Insert event_id into processed_events
5. Insert outbox event
6. Commit transaction
```

## Outbox Pattern

### Problem

A business service may update the DB successfully but fail to publish a Kafka event.

Example:

```text
consume canonical event
write order to DB
service crashes before publishing OrderProcessed event
```

Result:

```text
DB changed
Kafka event missing
system inconsistent
```

### Solution

Use transactional outbox.

Within the same DB transaction:

```text
insert/update domain tables
insert processed_events record
insert outbox_events record
commit
```

Then a separate outbox publisher publishes events from the outbox table to Kafka.

### Outbox Table Example

```sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    headers JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL
);
```

## Business Transaction Example

```text
BEGIN TRANSACTION

1. Check processed_events by eventId
2. If already processed:
     COMMIT and return success
3. Apply business update:
     insert order
     insert order line
     update status
4. Insert processed_events(event_id)
5. Insert outbox_events(...)
6. COMMIT
```

If any step fails:

```text
ROLLBACK
```

## Outbox Publisher

The outbox publisher can be implemented in two ways.

### Option A — Polling Publisher

```text
select pending outbox events
publish to Kafka
mark as published
```

#### Pros

```text
simple
easy to implement
no CDC dependency
```

#### Cons

```text
polling delay
duplicate publish possible
requires idempotent consumers
```

### Option B — CDC / Transaction Log Tailing

Use Debezium or equivalent CDC tool.

```text
DB transaction log
↓
CDC connector
↓
Kafka topic
```

#### Pros

```text
more scalable
near real-time
cleaner event publishing
```

#### Cons

```text
more infrastructure
more operational complexity
```

### Recommended Start

Start with polling outbox if the system is small/medium.

Move to CDC when volume and operational maturity require it.

## Pending Dependency Table

For order/orderLine dependency:

```sql
CREATE TABLE pending_order_lines (
    id UUID PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    order_id VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    correlation_id VARCHAR(255),
    partner_id VARCHAR(100),
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    retry_count INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
);
```

### Rule

```text
OrderLineCreated arrives
↓
if order exists:
  process normally
else:
  store in pending_order_lines
```

When `OrderCreated` arrives:

```text
insert order
find pending_order_lines by orderId
process them
mark pending records as PROCESSED
write outbox events
commit transaction
```

## Pending Dependency Cleanup

Pending tables must not grow forever.

### Problem

```text
OrderLineCreated arrives
OrderCreated never arrives
pending_order_lines grows forever
```

### Required Cleanup Job

A scheduled cleanup job should scan pending records.

Example rule:

```text
pending record older than 7 days
        ↓
check if parent exists
        ↓
if still missing:
  mark as EXPIRED
  publish to dependency DLQ or alert
```

### Cleanup Job Behaviour

```text
find PENDING records older than threshold
recheck parent existence
if parent exists:
  process pending event
if parent missing:
  mark EXPIRED
  produce dependency DLQ event
  alert if count exceeds threshold
```

## Kafka Offset Commit Strategy

Disable auto-commit for critical consumers.

### Business Consumer Commit Rule

```text
consume canonical event
execute DB transaction
commit DB transaction
commit Kafka offset
```

### Never Do This

```text
consume
commit offset
process
```

This can cause data loss.

---

## Next Steps

1. Review [Error Handling](./07-error-handling.md)
2. Study [Ordering and Dependencies](./08-ordering-dependencies.md)
3. Understand [Outbox Pattern](./09-outbox-pattern.md)

---

**See Also**:
- [Transformation Layer](./05-transformation-layer.md)
- [Idempotency](./06-business-layer.md)
