# Core Architectural Principles

## 1. Separation of Concerns

The system is split into two clear responsibilities:

### Transformation Layer
The Node.js + JSONata service is responsible for:

```text
consume raw JSON
identify partner/event/version
load mapping from cache
transform payload using JSONata
validate canonical output
publish canonical event
send invalid messages to DLQ
send temporary failures to retry
```

It should **not** contain core business decisions.

### Business Layer
The business service is responsible for:

```text
consume canonical event
check idempotency
apply business rules
handle parent-child dependencies
write to DB
write outbox event in same transaction
```

## 2. Stateless Transformation

JSONata transformation must be:

```text
deterministic
idempotent
stateless
side-effect free
```

This allows:
- Horizontal scaling
- Easy replay
- Predictable behavior
- Simple testing

## 3. Idempotency First

Every message must be processable multiple times with the same result:

```text
duplicate events → idempotent success
retry after failure → same outcome
replay from DLQ → safe reprocessing
```

## 4. Fail Fast, Fail Clearly

Errors should be:

```text
classified immediately
sent to appropriate queue (DLQ, retry, pending)
logged with full context
never silently ignored
```

## 5. Ordering Within Partitions

Kafka guarantees ordering within a partition:

```text
use consistent partition key (e.g., orderId)
related events go to same partition
business service respects order
```

## 6. Transactional Consistency

Business updates and event publishing must be atomic:

```text
DB update + outbox insert in same transaction
commit together or rollback together
no partial updates
```

## 7. Observable by Default

Every operation must be observable:

```text
structured logs with context
metrics for every stage
traces for end-to-end visibility
alerts for anomalies
```

## 8. Graceful Degradation

System should handle failures gracefully:

```text
circuit breaker for dependencies
backpressure when overloaded
health checks for readiness
graceful shutdown for clean termination
```

## 9. Configuration Over Code

Partner-specific logic should be configuration:

```text
mappings in files, not code
schemas versioned separately
configuration deployed independently
no code changes for new partners
```

## 10. Immutable Versioning

Once released, versions should never change:

```text
mapping v1 is immutable
schema v1 is immutable
config v1 is immutable
new changes = new version
```

## Design Patterns Used

### 1. Event Sourcing
- Raw events are immutable source of truth
- Canonical events are derived from raw
- Business events are derived from canonical

### 2. CQRS (Command Query Responsibility Segregation)
- Transformer: read raw, write canonical
- Business service: read canonical, write domain
- Outbox publisher: read outbox, write business events

### 3. Saga Pattern
- Parent-child dependencies handled via pending table
- Compensating events for corrections
- Eventual consistency

### 4. Outbox Pattern
- Transactional outbox for consistency
- Separate publisher for reliability
- At-least-once delivery guarantee

### 5. Circuit Breaker
- Protect against cascading failures
- Automatic recovery
- Graceful degradation

### 6. Bulkhead Pattern
- Per-partner rate limiting
- Worker pool isolation
- Resource boundaries

## Architectural Constraints

### What JSONata Should Do

```text
field renaming
date format conversion
enum mapping
nested JSON flattening
nested JSON expansion
array mapping
default values
simple conditional mapping
partner-specific input/output shaping
```

### What JSONata Should NOT Do

```text
core business decisions
payment rules
eligibility rules
fraud rules
workflow state transitions
database-dependent logic
cross-event dependency handling
complex domain validation
```

### Key Rule

```text
JSONata is a transformation engine, not a business rule engine.
```

## Failure Modes and Handling

| Failure | Cause | Action |
|---------|-------|--------|
| Invalid JSON | Malformed input | DLQ |
| Unknown partner | Config missing | DLQ |
| Mapping not found | Version mismatch | DLQ |
| JSONata error | Mapping bug | DLQ |
| Validation failed | Wrong data | DLQ |
| Kafka timeout | Infra issue | Retry |
| DB unavailable | Infra issue | Retry |
| Parent missing | Ordering issue | Pending |
| Duplicate event | Normal case | Idempotent success |

## Scalability Considerations

### Horizontal Scaling
- Stateless transformer scales linearly
- Add more pods = more throughput
- Kafka partitions determine max parallelism

### Vertical Scaling
- Increase worker count for CPU-bound work
- Increase memory for large payloads
- Tune GC for latency-sensitive operations

### Bottlenecks
- Kafka broker capacity
- Database connection pool
- Worker pool size
- Memory per pod

## Consistency Model

### Eventual Consistency
- Raw → Canonical: immediate
- Canonical → Business: eventual (seconds)
- Business → Downstream: eventual (seconds)

### Idempotency Window
- Duplicates within 24 hours are deduplicated
- Older duplicates may be reprocessed
- Configurable per use case

### Ordering Guarantees
- Within partition: strict ordering
- Across partitions: no guarantee
- Business service must handle out-of-order

## Next Steps

1. Review [Technology Decisions](./03-technology-decisions.md)
2. Study [Message Design](./04-message-design.md)
3. Understand [Error Handling](./07-error-handling.md)

---

**See Also**:
- [Overview](./01-overview.md)
- [Technology Decisions](./03-technology-decisions.md)
- [Risk Mitigation](./10-risk-mitigation.md)
