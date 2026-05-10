# Outbox Pattern

## Problem

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

## Solution

Use transactional outbox.

Within the same DB transaction:

```text
insert/update domain tables
insert processed_events record
insert outbox_events record
commit
```

Then a separate outbox publisher publishes events from the outbox table to Kafka.

## Outbox Table Schema

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
    publish_attempt_count INT NOT NULL DEFAULT 0,
    last_publish_attempt_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    last_error TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

## Outbox Publisher Implementation

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

## Polling Outbox Publisher Algorithm

```text
1. Query outbox_events WHERE status = 'PENDING' ORDER BY created_at LIMIT 100
2. For each event:
   a. Publish to Kafka
   b. If publish succeeds:
      - Update status = 'PUBLISHED'
      - Update published_at = NOW()
   c. If publish fails:
      - Increment publish_attempt_count
      - Update last_publish_attempt_at = NOW()
      - Update last_error = error message
      - If attempt_count > max_attempts:
        - Update status = 'FAILED'
        - Alert
3. Sleep for polling_interval
4. Repeat
```

## At-Least-Once Delivery Reality

Polling outbox publisher is usually at-least-once.

### Race Condition

```text
Publisher selects PENDING outbox row
Kafka produce succeeds
Database update to PUBLISHED fails
Publisher restarts
Same PENDING row is selected again
Same event is published again
```

### Consequence

Downstream consumers must be idempotent.

### Required Downstream Rule

Every downstream consumer should deduplicate by:

```text
event_id
```

or by a stable domain idempotency key.

### Important Decision

```text
Do not claim exactly-once end-to-end semantics.
Design for at-least-once delivery and idempotent consumers.
```

## Outbox Event Metadata

Outbox events should include:

```text
event_id
aggregate_type
aggregate_id
event_type
payload
headers
status
publish_attempt_count
last_publish_attempt_at
published_at
last_error
created_at
```

## Outbox Event Example

```json
{
  \"id\": \"uuid-1\",
  \"event_id\": \"evt-123\",
  \"aggregate_type\": \"Order\",
  \"aggregate_id\": \"ORD-123\",
  \"event_type\": \"OrderProcessed\",
  \"payload\": {
    \"orderId\": \"ORD-123\",
    \"status\": \"PROCESSED\",
    \"processedAt\": \"2026-05-10T10:15:00Z\"
  },
  \"headers\": {
    \"correlationId\": \"corr-456\",
    \"partnerId\": \"companyA\"
  },
  \"status\": \"PENDING\",
  \"publish_attempt_count\": 0,
  \"last_publish_attempt_at\": null,
  \"published_at\": null,
  \"last_error\": null,
  \"created_at\": \"2026-05-10T10:15:00Z\"
}
```

## Outbox Monitoring

### Metrics

```text
outbox_pending_count
outbox_publish_fail_total
outbox_publish_duration_ms
outbox_oldest_pending_age_seconds
```

### Alerts

```text
outbox_pending_count > 1000
outbox_pending_count growing for 10+ minutes
outbox_publish_fail_total increasing
outbox_oldest_pending_age > 5 minutes
```

---

## Next Steps

1. Review [Risk Mitigation](./10-risk-mitigation.md)
2. Study [Implementation](../implementation/)

---

**See Also**:
- [Business Layer](./06-business-layer.md)
- [Error Handling](./07-error-handling.md)
