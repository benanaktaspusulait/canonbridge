# Message Design

## Message Envelope

Every message should have a stable envelope.

### Example

```json
{
  "eventId": "evt-123",
  "correlationId": "corr-456",
  "sourceSystem": "companyA",
  "partnerId": "companyA",
  "eventType": "OrderLineCreated",
  "entityType": "ORDER",
  "entityId": "ORD-123",
  "schemaVersion": "v1",
  "occurredAt": "2026-05-10T10:15:00Z",
  "payload": {
    "order_id": "ORD-123",
    "line_id": "LINE-1",
    "product_code": "P-100",
    "qty": 2
  }
}
```

## Required Envelope Fields

| Field | Purpose | Example |
|---|---|---|
| `eventId` | Idempotency key | `evt-123` |
| `correlationId` | Distributed tracing | `corr-456` |
| `partnerId` | Partner-specific config lookup | `companyA` |
| `eventType` | Event-specific mapping lookup | `OrderLineCreated` |
| `entityType` | Domain grouping | `ORDER` |
| `entityId` | Kafka partitioning and ordering | `ORD-123` |
| `schemaVersion` | Mapping/schema version resolution | `v1` |
| `occurredAt` | Event timestamp | `2026-05-10T10:15:00Z` |
| `payload` | Raw partner-specific JSON | `{...}` |

## Topic Design

### Raw Topic

```text
partner.raw.events
```

Contains original partner/source events wrapped in a standard envelope.

### Canonical Topic

```text
canonical.events
```

Contains transformed and validated canonical events.

### Retry Topics

```text
transformation.retry.1m
transformation.retry.5m
transformation.retry.30m
```

Used for temporary failures with exponential backoff.

### DLQ Topic

```text
transformation.dlq
```

Used for non-recoverable transformation/validation errors.

### Business Events Topic

```text
business.events
```

Published through the outbox pattern after successful business processing.

## Partition Key Strategy

### For Order-Related Events

Use:

```text
Kafka key = orderId
```

Example:

```text
OrderCreated       key=ORD-123
OrderLineCreated   key=ORD-123
OrderLineUpdated   key=ORD-123
OrderCancelled     key=ORD-123
```

This ensures all events for the same order go to the same partition.

### For Customer-Related Events

Use:

```text
Kafka key = customerId
```

### For Independent Events

Use:

```text
Kafka key = eventId
```

## Canonical Event Example

```json
{
  "eventId": "evt-123",
  "correlationId": "corr-456",
  "partnerId": "companyA",
  "eventType": "OrderLineCreated",
  "entityType": "ORDER",
  "entityId": "ORD-123",
  "schemaVersion": "v1",
  "occurredAt": "2026-05-10T10:15:00Z",
  "payload": {
    "orderId": "ORD-123",
    "lineId": "LINE-1",
    "productId": "P-100",
    "quantity": 2
  }
}
```

## Canonical Schema Example

```json
{
  "$id": "canonical.order-line-created.v1",
  "type": "object",
  "required": [
    "eventId",
    "correlationId",
    "partnerId",
    "eventType",
    "entityType",
    "entityId",
    "occurredAt",
    "payload"
  ],
  "additionalProperties": false,
  "properties": {
    "eventId": {
      "type": "string",
      "minLength": 1
    },
    "correlationId": {
      "type": "string",
      "minLength": 1
    },
    "partnerId": {
      "type": "string",
      "minLength": 1
    },
    "eventType": {
      "type": "string",
      "enum": ["OrderLineCreated"]
    },
    "entityType": {
      "type": "string",
      "enum": ["ORDER"]
    },
    "entityId": {
      "type": "string",
      "minLength": 1
    },
    "occurredAt": {
      "type": "string",
      "format": "date-time"
    },
    "payload": {
      "type": "object",
      "required": ["orderId", "lineId", "productId", "quantity"],
      "additionalProperties": false,
      "properties": {
        "orderId": {
          "type": "string",
          "minLength": 1
        },
        "lineId": {
          "type": "string",
          "minLength": 1
        },
        "productId": {
          "type": "string",
          "minLength": 1
        },
        "quantity": {
          "type": "integer",
          "minimum": 1
        }
      }
    }
  }
}
```

## Schema Evolution Rules

### Default Rule

Canonical schemas should aim for:

```text
FULL compatibility where possible
BACKWARD compatibility as the minimum default
```

### Compatibility Types

| Type | Meaning | Example |
|---|---|---|
| BACKWARD | New consumer can read old producer data | Consumer v2 reads event v1 |
| FORWARD | Old consumer can read new producer data | Consumer v1 reads event v2 |
| FULL | Both backward and forward compatible | Ideal for shared canonical topics |

### Evolution Rules

```text
1. New fields added to canonical schema MUST be optional by default.
2. Required fields MUST NOT be removed.
3. Existing field types MUST NOT change.
4. Existing field meaning MUST NOT change silently.
5. New required fields require a new schema version.
6. Breaking changes require coordinated consumer migration.
7. Field rename should be treated as add new field + deprecate old field.
8. Consumers should ignore unknown optional fields where possible.
9. Schema changes must be validated in CI using producer and consumer fixtures.
10. Every canonical event must include schemaVersion.
```

## Out of Scope: Partner Ingress and Egress Adapters

This document focuses on the internal Kafka-based transformation architecture.

In real systems, partners usually do not write directly to Kafka. They may send data through:

```text
HTTP APIs
webhooks
SFTP
S3/object storage
email/file drops
database extracts
third-party middleware
```

These should be handled by separate ingress adapters.

### Examples

```text
HTTP Ingress Adapter      → Kafka raw topic
SFTP File Watcher         → Kafka raw topic
S3/Object Poller          → Kafka raw topic
Partner Callback Service  → Partner HTTP callback
```

### Out of Scope

```text
partner authentication
HTTP/SFTP/S3 ingestion
partner callback delivery
partner notification retries
partner-specific network/security setup
```

The transformer starts from this boundary:

```text
Kafka raw topic
```

---

## Next Steps

1. Review [Transformation Layer](./05-transformation-layer.md)
2. Study [Business Layer](./06-business-layer.md)
3. Understand [Error Handling](./07-error-handling.md)

---

**See Also**:
- [Core Principles](./02-core-principles.md)
- [Technology Decisions](./03-technology-decisions.md)
