# Ordering and Dependencies

## Kafka Partitioning and Ordering

Kafka only guarantees ordering within a partition.

Therefore, related events should use the same Kafka key.

### For Order and OrderLine

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

### Important Limitation

Kafka preserves arrival order. It does not fix incorrect source order.

If source sends:

```text
OrderLineCreated
OrderCreated
```

Kafka will preserve that order.

Business handling is still required.

## Order / OrderLine Dependency Problem

If order and order lines arrive separately, several strategies are possible.

### Option A — Aggregate Event

Preferred if the source can send a full aggregate.

Example:

```json
{
  \"eventType\": \"OrderCreated\",
  \"orderId\": \"ORD-123\",
  \"order\": {
    \"customerId\": \"CUST-1\",
    \"createdAt\": \"2026-05-10T10:15:00Z\"
  },
  \"lines\": [
    {
      \"lineId\": \"L1\",
      \"productId\": \"P1\",
      \"quantity\": 2
    }
  ]
}
```

#### Advantages

```text
less ordering complexity
order and order lines can be processed atomically
simpler validation
less pending dependency handling
```

#### Disadvantages

```text
larger payloads
partial updates may be more complex
source system may not support it
```

### Option B — Same Key + Pending Table

This is the most realistic production option when events arrive separately.

Flow:

```text
OrderLineCreated consumed
↓
Check if order exists
↓
If order exists:
  insert order line
↓
If order does not exist:
  insert into pending_order_lines
↓
When OrderCreated arrives:
  insert order
  process pending order lines
```

Required tables:

```text
orders
order_lines
pending_order_lines
processed_events
outbox_events
```

This is the recommended approach when source event order cannot be trusted.

### Option C — Retry Topic for Missing Parent

If `OrderLineCreated` arrives before `OrderCreated`, send it to retry topic.

Flow:

```text
OrderLineCreated
↓
parent order not found
↓
retry after 1 minute
↓
retry after 5 minutes
↓
retry after 30 minutes
↓
DLQ if still missing
```

#### Advantage

Simple implementation.

#### Disadvantage

Operationally noisy. May delay valid events unnecessarily.

### Option D — DLQ Immediately

If parent is missing, put child event into DLQ.

#### Advantage

Simple and safe.

#### Disadvantage

Requires manual replay. Not ideal if out-of-order events are expected.

### Recommended Decision

Use:

```text
Kafka key = orderId
+
business-side pending table
+
idempotency
+
outbox pattern
```

## Worker Pool and Ordering

Worker pool can break ordering if messages from the same Kafka partition are processed in parallel.

Example:

```text
OrderCreated      key=ORD-123
OrderLineCreated  key=ORD-123
```

If these are processed in parallel, `OrderLineCreated` may be published before `OrderCreated`.

### Solution

Use event-type-level processing modes.

```json
{
  \"eventType\": \"OrderLineCreated\",
  \"orderingRequired\": true,
  \"partitionKey\": \"orderId\",
  \"processingMode\": \"ordered\"
}
```

### Ordered Mode

```text
same partition messages processed sequentially
offset committed in order
worker pool concurrency limited
```

### Parallel Mode

```text
messages processed concurrently
used for independent events
higher throughput
```

## Ordered Mode Offset Commit Mechanism

Worker pool introduces ordering and commit complexity.

### Problem

If multiple messages from the same partition are processed in parallel:

```text
offset 10 starts
offset 11 starts
offset 11 finishes first
offset 10 still running
```

The service must not commit offset 11 before offset 10 is safely completed.

### Ordered Mode Rule

```text
Commit only the lowest continuous completed offset.
```

### Example

```text
offset 10 completed = false
offset 11 completed = true
offset 12 completed = true

committable offset = none
```

After offset 10 completes:

```text
offset 10 completed = true
offset 11 completed = true
offset 12 completed = true

committable offset = 12
```

### Ordered Mode Implementation

For each topic-partition maintain:

```text
in-flight offset map
completed offset set
last committed offset
lowest uncommitted offset
```

### Ordered Mode Behavior

```text
- Each partition has its own in-flight tracking
- A later offset may finish earlier but cannot be committed early
- Commit advances only when all previous offsets are complete
- Throughput is lower than parallel mode
- Ordered mode limits concurrency per partition
- If one partition has very high volume, throughput may drop significantly
- This is by design, not a bug
- For partition-level throughput problems, consider increasing partition count and using a better partition key
- Ordering is safer for entity-dependent events
```

### Recommended Use

Use ordered mode for:

```text
OrderCreated
OrderLineCreated
OrderUpdated
PaymentStatusChanged
state transition events
```

Use parallel mode for:

```text
independent audit events
stateless enrichment events
snapshot imports where ordering does not matter
```

---

## Next Steps

1. Review [Outbox Pattern](./09-outbox-pattern.md)
2. Study [Risk Mitigation](./10-risk-mitigation.md)

---

**See Also**:
- [Message Design](./04-message-design.md)
- [Business Layer](./06-business-layer.md)
