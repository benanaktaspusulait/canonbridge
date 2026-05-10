# Technology Decisions

## 1. Kafka vs RabbitMQ

### Decision: Use Kafka

### Reasoning

This use case is closer to an event transformation pipeline than a simple task queue.

Kafka is better suited for:

```text
event streaming
replay
audit trail
consumer group scaling
topic retention
multiple consumers reading same event stream
backpressure through consumer lag
```

RabbitMQ is better suited for:

```text
task queue
command processing
routing via exchanges
short-lived job distribution
RPC-like request/reply
```

### Final Decision

```text
Event transformation pipeline → Kafka
Task queue / command routing → RabbitMQ
```

For this architecture: **Kafka is the preferred choice.**

---

## 2. Framework: Fastify + TypeScript

### Decision: Use Fastify + TypeScript

### Reasoning

The transformer service is not a large domain application. It mainly needs:

```text
health endpoints
metrics endpoint
lightweight HTTP admin endpoints
high-performance JSON handling
plugin-based structure
simple deployment
```

Fastify is suitable because:

```text
low overhead
good TypeScript support
good JSON Schema integration
good plugin architecture
less ceremony than NestJS
```

### When NestJS Could Be Considered

NestJS may be useful if the service grows into:

```text
large modular application
complex auth/guards/interceptors
many internal modules
background jobs
large engineering team standardisation
```

For the current integration transformer, NestJS is likely unnecessary.

---

## 3. JSONata for Transformation

### Decision: Use JSONata

### Reasoning

JSONata provides:

```text
powerful JSON transformation
readable syntax
no external dependencies
good performance
easy to test
easy to version
```

### Suitable JSONata Responsibilities

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

### Avoid Putting These in JSONata

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

### Key Principle

```text
JSONata is a transformation engine, not a business rule engine.
```

---

## 4. Ajv for Schema Validation

### Decision: Use Ajv

### Reasoning

Ajv provides:

```text
fast JSON Schema validation
good TypeScript support
compiled validators for performance
good error messages
standard JSON Schema format
```

### Validation Stages

| Stage | Required? | Purpose |
|---|---:|---|
| JSON parse validation | Yes | Ensure message is valid JSON |
| Envelope validation | Yes | Ensure event metadata exists |
| Partner input validation | Optional but recommended | Detect partner contract changes early |
| Canonical validation | Mandatory | Protect the business service |
| Output validation | Optional | Validate partner-specific outbound payload |

---

## 5. Worker Pool for CPU-Bound Work

### Decision: Use Worker Pool (Configurable)

### Reasoning

JSONata transformation and Ajv validation can be CPU-bound.

Node.js event loop should not be blocked by heavy transformation work.

### Execution Modes

```text
direct mode
worker pool mode
```

### Recommended Config

```json
{
  "executionMode": "workerPool",
  "workerCount": 4,
  "maxInFlightMessages": 100
}
```

### Why Not Always Force Worker Pool?

Worker pool has overhead:

```text
message serialization between main thread and worker
more complex offset management
more complex graceful shutdown
potential ordering issues
debugging complexity
worker queue backpressure
```

For very small payloads, direct mode may be faster.

### Recommended Approach

```text
Design worker pool from the beginning
Allow direct/worker mode by config
Measure transform_duration_ms and worker_queue_depth
Use worker pool for heavy mappings and high throughput
```

---

## 6. Manual Kafka Offset Commit

### Decision: Manual Offset Commit

### Reasoning

Automatic offset commit can lose messages if processing fails after commit.

Manual commit ensures:

```text
offset committed only after successful output/DLQ
failed messages are redelivered
no silent data loss
```

### Commit Rule

```text
consume raw message
transform
validate
produce canonical or DLQ
commit offset
```

Never do this:

```text
consume
commit offset
process
```

---

## 7. Retry and DLQ Strategy

### Decision: Separate Retry Topics and DLQ

### Reasoning

Different error types need different handling:

```text
temporary failures → retry topics with backoff
permanent failures → DLQ for investigation
missing dependencies → pending table
duplicates → idempotent success
```

### Retry Topics

```text
transformation.retry.1m
transformation.retry.5m
transformation.retry.30m
```

### DLQ Topic

```text
transformation.dlq
```

---

## 8. Idempotency Strategy

### Decision: Event ID Based Idempotency

### Reasoning

Every message must have a stable idempotency key:

```text
eventId
```

This key is preserved from raw to canonical to business events.

Business service deduplicates using `processed_events` table.

---

## 9. Outbox Pattern for Consistency

### Decision: Use Outbox Pattern

### Reasoning

Protects against:

```text
DB updated but event not published
service crash between DB write and event publish
partial updates
```

### Implementation

Within same DB transaction:

```text
insert/update domain tables
insert processed_events record
insert outbox_events record
commit
```

Separate outbox publisher publishes events to Kafka.

---

## 10. Schema Registry

### Recommendation

| Situation | Decision |
|---|---|
| 1-3 partners, few consumers | Git-based JSON Schema + CI may be enough |
| 5-10+ partners or many consumers | Schema registry strongly recommended |
| Multiple teams producing/consuming | Schema registry should be mandatory |
| Regulated/audited environment | Schema registry strongly recommended |

### Minimum Without Schema Registry

If not using schema registry initially:

```text
schemas must be versioned in Git
schema compatibility checks must run in CI
schema artifacts must be published with service version
consumer fixtures must be tested
schema owner must approve breaking changes
```

---

## Summary Table

| Component | Technology | Rationale |
|---|---|---|
| Message Queue | Kafka | Event streaming, replay, scaling |
| Framework | Fastify | Lightweight, high-performance |
| Language | TypeScript | Type safety, better tooling |
| Transformation | JSONata | Powerful, readable, versioned |
| Validation | Ajv | Fast, standard JSON Schema |
| Concurrency | Worker Pool | CPU-bound work isolation |
| Offset Management | Manual | Data loss prevention |
| Error Handling | DLQ + Retry | Flexible error classification |
| Idempotency | Event ID | Duplicate prevention |
| Consistency | Outbox Pattern | Transactional safety |

---

## Next Steps

1. Review [Message Design](./04-message-design.md)
2. Study [Transformation Layer](./05-transformation-layer.md)
3. Understand [Error Handling](./07-error-handling.md)

---

**See Also**:
- [Core Principles](./02-core-principles.md)
- [Overview](./01-overview.md)
