# Node.js + JSONata + Kafka Integration Architecture

## 1. Purpose

This document defines the architecture for a configurable integration/transformation platform where multiple partner systems send JSON payloads with different formats, while the core business logic remains mostly the same.

The main goal is to avoid writing large amounts of partner-specific adapter/client code by introducing a generic transformation service using:

- Node.js
- TypeScript
- JSONata
- Kafka
- Ajv JSON Schema validation
- Worker pool
- Retry / DLQ
- Idempotent business processing
- Outbox pattern
- Observability and structured logging

The system is designed around this principle:

```text
Partner-specific complexity should stay outside the core business service.
Core business logic should receive clean canonical events.
```

---

## 2. High-Level Architecture

```text
Partner / Source System
        ↓
Kafka raw topic
        ↓
Node.js JSONata Transformer Service
        - Kafka consumer
        - Mapping cache
        - Schema cache
        - Worker pool
        - Ajv validation
        - Retry / DLQ handling
        ↓
Kafka canonical topic
        ↓
Business Consumer Service
        - Idempotency
        - Ordering / dependency handling
        - DB transaction
        - Outbox insert
        ↓
Business DB
        - Domain tables
        - Processed events
        - Pending dependency tables
        - Outbox table
        ↓
Outbox Publisher / CDC
        ↓
Kafka business events
        ↓
Downstream services
```

---

## 3. Main Architectural Principle

The system should be split into two clear responsibilities.

### 3.1 Transformation Layer

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

### 3.2 Business Layer

The business service is responsible for:

```text
consume canonical event
check idempotency
apply business rules
handle parent-child dependencies
write to DB
write outbox event in same transaction
```

---

## 4. Why Node.js + JSONata?

This architecture is useful when:

```text
business process is mostly the same
partner payload formats are different
new partners may be added frequently
field mapping changes happen often
we want to reduce partner-specific adapter classes
we want mappings to be configurable and versioned
```

Without JSONata/config-driven mapping, the system may become full of boilerplate code:

```text
CompanyAClient
CompanyARequestMapper
CompanyAResponseMapper
CompanyAValidator
CompanyAErrorMapper

CompanyBClient
CompanyBRequestMapper
CompanyBResponseMapper
CompanyBValidator
CompanyBErrorMapper

...
```

Instead, the preferred model is:

```text
Generic transformation engine
+
partner-specific JSONata mappings
+
partner-specific config
+
canonical schema validation
```

---

## 5. Core Flow

```text
1. Kafka message is consumed from raw topic
2. Message envelope is parsed
3. Partner/event/version is resolved
4. Input schema is optionally validated
5. Inbound JSONata mapping is selected from cache
6. Payload is transformed into canonical format
7. Canonical output is validated with Ajv
8. Valid canonical event is produced to canonical topic
9. Original offset is committed only after successful produce
10. Invalid data goes to DLQ
11. Temporary failures go to retry topic
```

---

## 6. Message Envelope

Every message should have a stable envelope.

Example:

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

### Required Envelope Fields

| Field | Purpose |
|---|---|
| `eventId` | Idempotency key |
| `correlationId` | Distributed tracing and debugging |
| `partnerId` | Partner-specific config/mapping lookup |
| `eventType` | Event-specific mapping/schema lookup |
| `entityType` | Domain grouping |
| `entityId` | Kafka partitioning and ordering |
| `schemaVersion` | Mapping/schema version resolution |
| `occurredAt` | Event timestamp |
| `payload` | Raw partner-specific JSON |

---

## 7. Topic Design

### 7.1 Raw Topic

```text
partner.raw.events
```

Contains original partner/source events wrapped in a standard envelope.

### 7.2 Canonical Topic

```text
canonical.events
```

Contains transformed and validated canonical events.

### 7.3 Retry Topics

Example:

```text
transformation.retry.1m
transformation.retry.5m
transformation.retry.30m
```

Used for temporary failures.

### 7.4 DLQ Topic

```text
transformation.dlq
```

Used for non-recoverable transformation/validation errors.

### 7.5 Business Events Topic

```text
business.events
```

Published through the outbox pattern after successful business processing.

---

## 7.6 Out of Scope: Partner Ingress and Egress Adapters

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

Examples:

```text
HTTP Ingress Adapter      → Kafka raw topic
SFTP File Watcher         → Kafka raw topic
S3/Object Poller          → Kafka raw topic
Partner Callback Service  → Partner HTTP callback
```

Out of scope for this document:

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

## 8. Kafka vs RabbitMQ Decision

### Decision

Use **Kafka**.

### Reason

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

For this architecture:

```text
Kafka is the preferred choice.
```

---

## 9. Framework Decision

### Decision

Use:

```text
Fastify + TypeScript
```

### Reason

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

## 10. JSONata Usage

JSONata should be used for payload shaping only.

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

### Principle

```text
JSONata is a transformation engine, not a business rule engine.
```

---

## 11. Mapping Cache

Mappings should not be loaded or compiled per message.

### Wrong Approach

```text
For every message:
  read JSONata file
  compile expression
  evaluate expression
```

### Correct Approach

```text
On startup:
  load all mapping files
  compile JSONata expressions
  store compiled expressions in memory cache

At runtime:
  resolve mapping key
  get compiled expression from cache
  evaluate payload
```

### Mapping Cache Key

```text
partnerId + eventType + direction + schemaVersion
```

Example:

```text
companyA:OrderCreated:inbound:v1
companyA:OrderCreated:outbound:v1
companyB:OrderLineCreated:inbound:v2
```

---

## 12. Schema Validation with Ajv

Ajv validates plain JavaScript objects against JSON Schema.

There is no need to convert JSON into DTO classes.

### Runtime Flow

```text
Kafka message bytes
   ↓
JSON.parse
   ↓
plain JavaScript object
   ↓
optional input schema validation
   ↓
JSONata transformation
   ↓
plain canonical object
   ↓
mandatory canonical schema validation
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

## 13. Example Canonical JSON Schema

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

---

## 14. Ajv Validator Cache

Schemas should also be compiled and cached.

### Validator Cache Key

```text
eventType + validationStage + schemaVersion
```

Example:

```text
OrderLineCreated:canonical:v1
CompanyA:OrderLineCreated:input:v1
```

### Example TypeScript

```ts
const validatorCache = new Map<string, ValidateFunction>();

validatorCache.set(
  "OrderLineCreated:canonical:v1",
  ajv.compile(orderLineCreatedCanonicalSchema)
);

const validate = validatorCache.get("OrderLineCreated:canonical:v1");

if (!validate) {
  throw new Error("Validator not found");
}

const valid = validate(canonicalEvent);

if (!valid) {
  throw new ValidationError("CANONICAL_VALIDATION_FAILED", validate.errors);
}
```

---

## 15. What Schema Validation Solves

Schema validation helps detect:

```text
missing required fields
wrong field types
invalid date formats
invalid enum values
unexpected additional fields
incorrect JSONata output
partner payload contract changes
canonical contract violations
```

---

## 16. What Schema Validation Does Not Solve

Schema validation does not solve:

```text
duplicate events
message ordering
parent-child dependency
DB transaction consistency
event publish failure after DB write
business-level correctness
cross-message validation
replay safety
```

For those, the architecture needs:

```text
idempotency
Kafka key strategy
pending table
outbox pattern
retry/DLQ strategy
manual offset commit
```

---

## 17. Worker Pool Decision

### Decision

Use a worker pool, but make it configurable.

### Why

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

## 18. Worker Pool + Kafka Offset Commit

Offset commit must happen only after successful processing.

### Wrong Flow

```text
consume
commit offset
send to worker
transform
produce output
```

If the worker or produce step fails, the message is lost.

### Correct Flow

```text
consume
send to worker
transform
validate
produce output or DLQ
commit offset
```

---

## 19. Ordering Risk with Worker Pool

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
  "eventType": "OrderLineCreated",
  "orderingRequired": true,
  "partitionKey": "orderId",
  "processingMode": "ordered"
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

---

## 20. Kafka Partitioning and Ordering

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

---

## 21. Order / OrderLine Dependency Problem

If order and order lines arrive separately, several strategies are possible.

---

### Option A — Aggregate Event

Preferred if the source can send a full aggregate.

Example:

```json
{
  "eventType": "OrderCreated",
  "orderId": "ORD-123",
  "order": {
    "customerId": "CUST-1",
    "createdAt": "2026-05-10T10:15:00Z"
  },
  "lines": [
    {
      "lineId": "L1",
      "productId": "P1",
      "quantity": 2
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

---

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

---

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

---

### Option D — DLQ Immediately

If parent is missing, put child event into DLQ.

#### Advantage

Simple and safe.

#### Disadvantage

Requires manual replay. Not ideal if out-of-order events are expected.

---

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

---

## 22. Idempotency

Kafka systems should assume duplicate delivery can happen.

Duplicates can happen because of:

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

---

## 23. Outbox Pattern

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

---

## 24. Outbox Table Example

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

---

## 25. Business Transaction Example

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

---

## 26. Outbox Publisher

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

---

## 27. Retry / DLQ / Pending Decision

Not all errors should be handled the same way.

### Error Classification

| Error Type | Example | Action |
|---|---|---|
| Invalid JSON | malformed JSON | DLQ |
| Unknown partner | no config found | DLQ |
| Unknown mapping version | v3 not found | DLQ |
| JSONata evaluation error | mapping cannot evaluate | DLQ |
| Canonical validation failed | missing required field | DLQ |
| Kafka produce timeout | temporary infra issue | Retry |
| DB unavailable | temporary infra issue | Retry |
| Worker timeout | maybe temporary | Retry then DLQ |
| Parent missing | order not found for line | Pending |
| Duplicate event | eventId already processed | Idempotent success |

---

## 28. Retry Topics

Use delayed retry topics.

Example:

```text
transformation.retry.1m
transformation.retry.5m
transformation.retry.30m
```

Add retry metadata:

```json
{
  "retryCount": 2,
  "firstFailedAt": "2026-05-10T10:15:00Z",
  "lastFailedAt": "2026-05-10T10:20:00Z",
  "lastErrorType": "KAFKA_PRODUCE_TIMEOUT"
}
```

### Retry Rule

```text
temporary error
↓
retry topic
↓
retry count increased
↓
max retry exceeded
↓
DLQ
```

---

## 29. DLQ Message Format

A DLQ message should include enough context to debug and replay.

```json
{
  "originalTopic": "partner.raw.events",
  "originalPartition": 2,
  "originalOffset": "15422",
  "partnerId": "companyA",
  "eventType": "OrderLineCreated",
  "schemaVersion": "v1",
  "mappingVersion": "v1.2.0",
  "errorType": "CANONICAL_VALIDATION_FAILED",
  "errorCode": "VAL_001",
  "stage": "CANONICAL_VALIDATION",
  "errorMessage": "Required field missing",
  "errorPath": "/payload/orderId",
  "correlationId": "corr-456",
  "eventId": "evt-123",
  "failedAt": "2026-05-10T10:15:00Z"
}
```

### Payload Handling

Do not log/store full sensitive payload by default.

Options:

```text
store masked payload
store encrypted payload
store reference to secure object storage
store no payload, only metadata
```

---

## 30. Pending Dependency Table

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

---

## 31. Kafka Offset Commit Strategy

Disable auto-commit for critical consumers.

### Transformer Commit Rule

```text
consume raw message
transform
validate
produce canonical event or DLQ
commit offset
```

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

## 31.1 Does the Transformer Need Its Own Outbox?

The transformer service does not need its own database outbox in the MVP architecture.

Transformer flow:

```text
consume raw
transform
validate
produce canonical or DLQ
commit offset
```

### Important Failure Case

If Kafka produce succeeds but offset commit fails:

```text
canonical event may already be published
same raw message may be consumed again
canonical event may be published again
```

This creates a duplicate canonical event.

### Decision

This is acceptable because:

```text
business service must be idempotent anyway
eventId is preserved from raw to canonical event
duplicates are handled by processed_events table
adding an outbox to transformer would duplicate complexity
transformer has no business DB transaction to protect
```

### Required Condition

The transformer must preserve a stable idempotency key:

```text
eventId
```

from raw message to canonical message.

Downstream business services must deduplicate using that key.


---

## 32. Backpressure

Backpressure is required because worker pool and downstream systems can become overloaded.

### Risks

```text
worker queue grows without limit
memory usage increases
consumer fetches too many messages
Kafka lag grows
retry storm happens
```

### Controls

```text
max in-flight messages
bounded worker queue
pause/resume Kafka consumer
consumer lag monitoring
worker queue depth metric
HPA scaling
rate limits per partner/event type
```

---

## 33. Observability

The system must expose metrics, logs, and traces.

### Metrics

```text
transform_duration_ms
validation_duration_ms
worker_queue_depth
worker_active_count
kafka_consumer_lag
mapping_error_total
validation_fail_total
dlq_total
retry_total
canonical_publish_duration_ms
business_processing_duration_ms
outbox_pending_count
outbox_publish_fail_total
pending_dependency_count
```

### Useful Labels

```text
partnerId
eventType
schemaVersion
mappingVersion
stage
errorType
```


### Recommended Alerts

Example alert thresholds should be tuned per environment, but the service should define alert categories from the beginning.

```text
Transformer consumer lag > 1,000 messages       → warning
Transformer consumer lag > 10,000 messages      → critical
Business consumer lag > 500 messages            → warning
DLQ message count > 0                            → warning
Retry topic backlog > 100 messages              → warning
Outbox pending count growing for 10+ minutes     → warning
Worker queue depth near max capacity             → warning
Repeated circuit breaker open events             → critical
```

Important principle:

```text
Any DLQ message is operationally important.
A DLQ is not normal business flow.
```


---

## 34. Structured Logging

Logs should be JSON structured.

### Example Validation Failure Log

```json
{
  "level": "warn",
  "event": "canonical_validation_failed",
  "partnerId": "companyA",
  "eventType": "OrderLineCreated",
  "schemaVersion": "v1",
  "mappingVersion": "v1.2.0",
  "correlationId": "corr-456",
  "eventId": "evt-123",
  "errors": [
    {
      "path": "/payload/orderId",
      "message": "is required"
    }
  ],
  "payloadSizeBytes": 1824,
  "transformDurationMs": 4,
  "validationDurationMs": 1
}
```

---

## 35. PII and Sensitive Data Logging

Do not log full payloads by default.

Sensitive fields include:

```text
name
email
phone
address
dateOfBirth
nationalInsuranceNumber
passportNumber
bankAccount
cardNumber
```

### Recommended Policy

```text
log metadata
log error paths
log error codes
log masked values only if needed
store raw failed payload only in encrypted secure storage with retention policy
```

---

## 36. Mapping Versioning

Mapping must be immutable once released.

### Bad

```text
companyA/inbound.jsonata overwritten in place
```

### Good

```text
companyA/OrderCreated/inbound.v1.jsonata
companyA/OrderCreated/inbound.v2.jsonata
companyA/OrderCreated/inbound.v3.jsonata
```

Messages should specify schema/mapping version.

### Activation Rule

```text
message schemaVersion decides mapping version
```

or:

```text
partner config maps schemaVersion to mappingVersion
```

---

## 37. Mapping Deployment Strategy

Avoid uncontrolled hot reload at the beginning.

### Recommended Initial Strategy

```text
mappings packaged with service image
CI validates mapping fixtures
deploy new version
rollback if needed
```

### Later Option

```text
external mapping config store
signed mapping versions
approval workflow
hot reload with validation
```

Hot reload is powerful but dangerous if not controlled.

---

## 38. Mapping Fixture Tests

Every mapping should have tests.

Recommended structure:

```text
partners/
  company-a/
    order-created/
      inbound.v1.jsonata
      input.sample.1.json
      expected.canonical.1.json
      input.schema.v1.json
      canonical.schema.v1.json
```

CI should verify:

```text
input sample validates against input schema
JSONata transformation succeeds
output matches expected canonical JSON
output validates against canonical schema
```

---

## 39. Suggested Project Structure

```text
partner-transformer-service/
  src/
    app.ts
    server.ts

    kafka/
      consumer.ts
      producer.ts
      offset-manager.ts

    workers/
      transform-worker.ts
      worker-pool.ts

    services/
      partner-resolver.ts
      mapping-cache.ts
      schema-cache.ts
      jsonata-transformer.ts
      validator.ts
      retry-handler.ts
      dlq-publisher.ts
      error-classifier.ts

    plugins/
      logger.ts
      metrics.ts
      tracing.ts
      healthcheck.ts

    types/
      envelope.ts
      errors.ts
      config.ts

  partners/
    company-a/
      order-created/
        config.json
        input.v1.schema.json
        inbound.v1.jsonata
        canonical.v1.schema.json
        fixtures/
          input-1.json
          expected-1.json

      order-line-created/
        config.json
        input.v1.schema.json
        inbound.v1.jsonata
        canonical.v1.schema.json
        fixtures/
          input-1.json
          expected-1.json

  schemas/
    envelope.schema.json
    canonical/
      order-created.v1.schema.json
      order-line-created.v1.schema.json

  test/
    mapping-fixtures.test.ts
    validator.test.ts
    error-classifier.test.ts
```

---

## 40. Partner/Event Config Example

```json
{
  "partnerId": "companyA",
  "eventType": "OrderLineCreated",
  "schemaVersion": "v1",
  "direction": "inbound",
  "inputSchema": "partners/company-a/order-line-created/input.v1.schema.json",
  "mapping": "partners/company-a/order-line-created/inbound.v1.jsonata",
  "canonicalSchema": "schemas/canonical/order-line-created.v1.schema.json",
  "kafka": {
    "inputTopic": "partner.raw.events",
    "outputTopic": "canonical.events",
    "dlqTopic": "transformation.dlq",
    "retryTopics": [
      "transformation.retry.1m",
      "transformation.retry.5m",
      "transformation.retry.30m"
    ],
    "partitionKeyPath": "$.entityId"
  },
  "processing": {
    "orderingRequired": true,
    "mode": "ordered",
    "maxRetries": 3,
    "workerPoolEnabled": true
  },
  "logging": {
    "logPayload": false,
    "maskSensitiveFields": true
  }
}
```

---

## 41. Updated Architecture Decisions Summary

| Decision | Choice |
|---|---|
| Messaging platform | Kafka |
| Transformation service | Node.js + TypeScript |
| HTTP/admin framework | Fastify |
| Transformation language | JSONata |
| Validation | Ajv + JSON Schema |
| Config/mapping loading | Compile/cache at startup |
| Worker model | Configurable worker pool |
| Offset commit | Manual commit after successful output/DLQ |
| Invalid data | DLQ |
| Temporary infra failure | Retry topics |
| Missing parent dependency | Pending table |
| Duplicate event | Idempotent success |
| Business DB + event publish | Outbox pattern |
| Ordering key | entityId / orderId |
| Mapping versioning | Mandatory |
| KStream/Kafka Streams | Not needed initially |
| RabbitMQ | Not preferred for this event pipeline |

---

## 42. Main Risks and Mitigations

| Risk | Mitigation |
|---|---|
| JSONata becomes business logic | Keep business rules in business service |
| Mapping version mismatch | Immutable versioned mappings |
| Invalid canonical output | Mandatory Ajv validation |
| Worker pool breaks ordering | Ordered mode per event type |
| Message lost after early commit | Commit only after output/DLQ |
| Duplicate processing | processed_events table |
| DB updated but event not published | Outbox pattern |
| OrderLine arrives before Order | Pending table |
| Retry storm | Retry topics with backoff and max retries |
| DLQ becomes graveyard | DLQ dashboard, alerts, replay process |
| Consumer lag grows unnoticed | Consumer lag alerts and dashboards |
| PII leakage in logs | Masking and no full payload logging |
| Config cache inconsistency | Versioned deployment and smoke tests |
| Slow JSONata mapping | Metrics and optional code-based mapper |

---

## 43. What Not To Build Initially

Avoid over-engineering in the first version.

Do not build initially:

```text
Kafka Streams / KStream topology
dynamic UI mapping editor
complex hot-reload mapping platform
database-backed rule engine
stateful stream joins
windowed aggregations
custom replay UI
complex workflow engine
```

These can be added later if real requirements appear.

---

## 44. Recommended MVP Scope

The first production-ready version should include:

```text
KafkaJS consumer/producer
Fastify health/metrics endpoint
compiled JSONata mapping cache
compiled Ajv schema cache
manual offset commit
bounded worker pool
input envelope validation
canonical validation
retry topics
DLQ topic
structured masked logs
mapping fixture tests
correlationId and eventId support
basic metrics dashboard
consumer lag alerts
```

Business service should include:

```text
processed_events table
idempotent processing
pending table for parent-child dependency
outbox_events table
transactional DB update
outbox publisher
```

---

## 45. Final Recommended Architecture

```text
Kafka raw topic
   ↓
Node.js JSONata Transformer
   - KafkaJS
   - Fastify health/metrics
   - Worker pool
   - Mapping cache
   - Schema cache
   - Ajv validation
   - Retry/DLQ
   ↓
Kafka canonical topic
   ↓
Business Service
   - Idempotency
   - Parent-child dependency handling
   - DB transaction
   - Outbox insert
   ↓
Outbox Publisher / CDC
   ↓
Kafka business events
```

Final design principle:

```text
Transformation service keeps partner complexity outside.
Business service owns business correctness.
Kafka provides durable event flow.
Ajv protects contracts.
Outbox protects transactional consistency.
Idempotency protects replay/retry.
Pending tables protect parent-child ordering issues.
```


---

# 46. Production Hardening Addendum

This section adds further production-level decisions and clarifications that are important for running the system safely in Kubernetes and in high-throughput partner integration scenarios.

---

## 46.1 Graceful Shutdown

Graceful shutdown is mandatory for a Kafka consumer + worker pool based service.

Without graceful shutdown, the service may:

```text
lose in-flight messages
commit offsets too early
terminate workers before processing finishes
publish duplicate or partial outputs
fail during Kubernetes rolling updates
```

### Shutdown Trigger

The service should listen for:

```text
SIGTERM
SIGINT
```

Kubernetes usually sends `SIGTERM` before terminating a pod.

### Required Shutdown Flow

```text
SIGTERM / SIGINT received
        ↓
mark service as shutting down
        ↓
/health/ready starts returning 503
        ↓
pause Kafka consumer
        ↓
stop accepting new work
        ↓
wait for in-flight messages to complete
        ↓
drain worker pool with max timeout
        ↓
flush Kafka producer
        ↓
commit completed offsets
        ↓
close Kafka consumer and producer
        ↓
exit process
```

### Recommended Sequence

```text
1. Set shutdown flag = true
2. Readiness endpoint returns 503
3. Pause Kafka consumer
4. Stop fetching new messages
5. Wait for current batch / in-flight tasks
6. Worker pool drain
7. Produce pending output/DLQ messages
8. Commit only safely completed offsets
9. Producer flush
10. Disconnect Kafka consumer/producer
11. Exit
```

### Timeout Strategy

Graceful shutdown should have a maximum timeout.

Example:

```json
{
  "shutdown": {
    "gracePeriodMs": 30000,
    "workerDrainTimeoutMs": 20000,
    "producerFlushTimeoutMs": 5000
  }
}
```

If tasks do not finish within the timeout:

```text
do not commit unfinished offsets
allow Kafka to redeliver them after restart
```

### Kubernetes Recommendation

Set `terminationGracePeriodSeconds` longer than the application shutdown timeout.

Example:

```yaml
terminationGracePeriodSeconds: 45
```

If the app needs 30 seconds to drain, Kubernetes should allow more than 30 seconds before force killing the pod.

---

## 46.1.1 Kafka Consumer Group Rebalance Behaviour

Kafka consumer group rebalancing can happen when:

```text
a pod starts
a pod stops
a consumer crashes
partition assignment changes
the consumer exceeds max poll interval
```

During rebalance:

```text
partitions may be revoked temporarily
in-flight messages may not finish
offset commit attempts may fail
the same message may be redelivered later
```

### Required Behaviour

The service should not panic during rebalance.

Recommended behaviour:

```text
if partition is revoked before processing completes:
  do not commit unfinished offsets
  allow Kafka to redeliver messages

if offset commit fails during rebalance:
  treat it as non-fatal
  rely on redelivery and idempotency

if worker task is still running for a revoked partition:
  discard result if it cannot be safely produced/committed
  or let the message be reprocessed after reassignment
```

### Important Rule

```text
Do not send rebalance-related unfinished messages to DLQ.
DLQ is for data/config/mapping problems, not normal consumer group movement.
```

This is consistent with the general rule:

```text
unfinished message + no committed offset = Kafka redelivers
```


---

## 46.2 Health Check Strategy

The service should expose separate health endpoints.

### `/health/live`

Purpose:

```text
Is the process alive?
```

Should not depend on Kafka connection.

Use for Kubernetes livenessProbe.

Expected behavior:

```text
200 if process/event loop is alive
500 only if process is unrecoverably broken
```

### `/health/ready`

Purpose:

```text
Can this pod receive/process traffic now?
```

Use for Kubernetes readinessProbe.

Should check:

```text
Kafka consumer connected
Kafka producer connected
mapping cache loaded
schema cache loaded
worker pool available
service not shutting down
circuit breaker not open
```

If any required dependency is unavailable:

```text
return 503
```

### `/health/startup`

Purpose:

```text
Has the application completed initial startup?
```

Use for Kubernetes startupProbe.

Should check:

```text
configuration loaded
mapping cache built
schema cache built
Kafka client initialised
```

### Health Endpoint Summary

| Endpoint | K8s Probe | Dependency Checks? | Purpose |
|---|---|---:|---|
| `/health/live` | livenessProbe | No | Process is alive |
| `/health/ready` | readinessProbe | Yes | Pod can process messages |
| `/health/startup` | startupProbe | Startup only | Initial boot completed |

---

## 46.3 Dry-Run Mapping Test Capability

The system should support a dry-run transform mode for debugging mappings.

This is especially useful for:

```text
testing new mappings before deployment
debugging DLQ messages
checking what a new mapping version would produce
validating partner onboarding samples
supporting operational investigation
```

### Admin Endpoint Example

```text
POST /admin/transform/test
```

Request:

```json
{
  "partnerId": "companyA",
  "eventType": "OrderLineCreated",
  "schemaVersion": "v1",
  "direction": "inbound",
  "rawMessage": {
    "eventId": "evt-123",
    "payload": {
      "order_id": "ORD-123",
      "line_id": "LINE-1"
    }
  }
}
```

Response:

```json
{
  "success": false,
  "canonicalOutput": {
    "eventId": "evt-123",
    "eventType": "OrderLineCreated"
  },
  "validationErrors": [
    {
      "path": "/payload/orderId",
      "message": "is required"
    }
  ],
  "durationMs": 4
}
```

### Important Rule

Dry-run must not:

```text
commit Kafka offsets
produce Kafka messages
write to database
modify DLQ/retry state
```

It is read-only and diagnostic.

---

## 46.4 Mapping Rollback Strategy

Mapping rollback depends on how mappings are deployed.

### Scenario A — Mappings Packaged in Container Image

This is safer for MVP.

Rollback means:

```text
rollback to previous container image
```

Advantages:

```text
simple
auditable
same mapping version across all pods
easy rollback through deployment tooling
```

Disadvantages:

```text
slower than external config
requires redeployment
```

### Scenario B — Mappings in External Store

Examples:

```text
S3
Git-backed config store
database
configuration service
```

Rollback means:

```text
activate previous mapping version
```

Important rule:

```text
A mapping version should be immutable.
Do not overwrite an existing mapping version.
Activate/deactivate versions instead.
```

### New Messages vs Old Messages

If mappings are externally managed:

```text
new incoming messages should use the active mapping version
old already-processed offsets should not be silently reprocessed with a different mapping
```

If old messages need to be reprocessed:

```text
explicit replay job required
replay must specify mapping version
output must be traceable as replay/compensation
```

---

## 46.4.1 Mapping Versioning and Deployment Workflow

Mapping versioning must follow a strict workflow to prevent silent failures.

### Mapping Version Lifecycle

```text
1. Mapping created and tested locally
2. Mapping added to Git with version tag
3. CI validates mapping against fixtures
4. Mapping packaged with service image
5. Service deployed with new mapping version
6. Mapping version is immutable in production
7. If rollback needed, deploy previous service image
```

### Mapping File Naming Convention

```text
partners/
  company-a/
    order-created/
      inbound.v1.jsonata
      inbound.v2.jsonata
      inbound.v3.jsonata
      input.v1.schema.json
      input.v2.schema.json
      canonical.v1.schema.json
      fixtures/
        v1/
          input-1.json
          expected-1.json
        v2/
          input-1.json
          expected-1.json
```

### Mapping Version Resolution

Message envelope specifies:

```json
{
  "schemaVersion": "v2",
  "mappingVersion": "v2"
}
```

Service resolves:

```text
partners/company-a/order-created/inbound.v2.jsonata
```

If mapping version is not found:

```text
DLQ with error: MAPPING_VERSION_NOT_FOUND
```

### Important Rule

```text
Never silently fall back to an older mapping version.
Always fail explicitly if requested version is not available.
```

---

## 46.5 Compensation Strategy for Wrong Mapping Output

A serious case:

```text
wrong mapping produced invalid-but-schema-valid canonical messages
those messages reached canonical topic
business service processed them
```

Schema validation may not catch semantically wrong but structurally valid data.

### Required Compensation Options

Depending on domain criticality:

```text
publish compensating event
replay original raw events with corrected mapping
mark affected events as corrected
rebuild downstream projection
manually fix business records
```

### Compensation Event Example

```json
{
  "eventType": "OrderLineCorrected",
  "correlationId": "corr-456",
  "originalEventId": "evt-123",
  "reason": "MAPPING_BUG",
  "correctedPayload": {
    "orderId": "ORD-123",
    "lineId": "LINE-1",
    "quantity": 2
  }
}
```

### Required Metadata

All produced canonical events should include:

```text
mappingVersion
schemaVersion
transformerServiceVersion
sourceTopic
sourcePartition
sourceOffset
```

This makes impact analysis possible.

---

## 46.6 PII Masking Strategy

Logging must support configurable field-level masking.

### Partner Config Example

```json
{
  "logging": {
    "logPayload": false,
    "maskSensitiveFields": true,
    "maskRules": {
      "payload.customer.email": "email",
      "payload.customer.phone": "phone",
      "payload.payment.cardNumber": "cardLast4",
      "payload.customer.dateOfBirth": "fullMask",
      "payload.customer.name": "name"
    }
  }
}
```

### Mask Rule Path Format

The examples above use simple dot-notation paths.

Example:

```text
payload.customer.email
payload.payment.cardNumber
```

This assumes the implementation resolves paths using a dot-notation resolver such as `lodash.get`.

If the implementation uses standard JSONPath, use the explicit JSONPath format instead:

```text
$.payload.customer.email
$.payload.payment.cardNumber
```

The implementation must choose one format and document it clearly. For MVP, dot-notation is simpler and sufficient.

### Masking Types

| Type | Example Input | Example Output |
|---|---|---|
| `fullMask` | `1981-09-13` | `***` |
| `email` | `john.smith@test.com` | `j***h@test.com` |
| `phone` | `+447700900123` | `+44*******123` |
| `cardLast4` | `4111111111111111` | `************1111` |
| `name` | `Benan Aktas` | `B*** A***` |

### Default Policy

```text
Do not log full payloads by default.
Log metadata, error paths, error codes, and masked values only when needed.
```

---

## 46.7 DLQ Payload Storage and Retention

DLQ may contain sensitive data.

### Storage Options

| Option | Description |
|---|---|
| Metadata only | Safest, but harder to replay |
| Masked payload | Useful for debugging, limited replay value |
| Encrypted payload | Best for replay, requires strict controls |
| External secure storage reference | DLQ stores reference, payload stored securely |

### Recommended MVP Policy

```text
DLQ topic contains metadata + masked payload
original raw payload stored only if encryption and retention policy exist
```

### Retention Policy

Example:

```json
{
  "dlqRetention": {
    "metadataRetentionDays": 90,
    "encryptedPayloadRetentionDays": 14,
    "autoDeletePayloadAfterDays": 14
  }
}
```

---

## 46.8 Multi-Partner Rate Limiting

A single partner should not be able to overload the whole transformer.

Risk examples:

```text
partner sends massive invalid payloads
partner creates DLQ flood
partner causes retry storm
partner monopolises worker pool
```

### Partner Rate Limit Config

```json
{
  "rateLimits": {
    "companyA": {
      "maxInFlightMessages": 50,
      "maxRetryPerMinute": 100,
      "maxDlqPerMinute": 200,
      "maxPayloadBytes": 1048576
    },
    "companyB": {
      "maxInFlightMessages": 10,
      "maxRetryPerMinute": 20,
      "maxDlqPerMinute": 50,
      "maxPayloadBytes": 262144
    }
  }
}
```

### Controls

```text
per-partner in-flight limit
per-partner retry limit
per-partner DLQ rate alert
payload size limit
consumer pause by partner/topic if needed
```

---

## 46.9 Circuit Breaker

Circuit breaker protects the system from repeated dependency failures.

### Possible Circuit Breakers

```text
Kafka producer circuit breaker
Kafka consumer circuit breaker
business service circuit breaker
schema registry/config store circuit breaker
outbox publisher circuit breaker
```

### Example Rule

```text
consecutive Kafka produce failures > threshold
        ↓
open circuit
        ↓
pause consumer
        ↓
/health/ready returns 503
        ↓
wait cool-down period
        ↓
half-open test
        ↓
close circuit if successful
```

### Config Example

```json
{
  "circuitBreaker": {
    "kafkaProducer": {
      "failureThreshold": 10,
      "cooldownMs": 30000,
      "halfOpenMaxAttempts": 3
    }
  }
}
```

---

## 46.10 Ordered Mode Offset Commit Mechanism

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

## 46.11 Pending Table and Idempotency Interaction

The pending table must work with `processed_events`.

### Scenario

```text
1. OrderLineCreated arrives
2. Parent Order does not exist
3. Event is stored in pending_order_lines
4. Later OrderCreated arrives
5. Pending OrderLineCreated is processed
6. Same OrderLineCreated arrives again as duplicate
```

### Correct Behavior

The duplicate should be treated as idempotent success.

### Required Rule

When a pending event is finally processed:

```text
insert eventId into processed_events in the same transaction
mark pending record as PROCESSED
apply business update
insert outbox event
```

### Duplicate Handling Flow

```text
OrderLineCreated consumed
        ↓
check processed_events(eventId)
        ↓
if exists:
  treat as success
  commit Kafka offset
        ↓
if not exists:
  check parent order
        ↓
if parent exists:
  process and insert processed_events
        ↓
if parent missing:
  insert into pending_order_lines if not already exists
```

### Pending Table Constraint

```sql
ALTER TABLE pending_order_lines
ADD CONSTRAINT uq_pending_order_lines_event_id UNIQUE (event_id);
```

### Processed Events Constraint

```sql
ALTER TABLE processed_events
ADD CONSTRAINT uq_processed_events_event_id UNIQUE (event_id);
```

### Important

A pending event should not be inserted into `processed_events` until it is actually applied to the domain model.

Otherwise, it may be skipped forever without being processed.

---

## 46.12 Outbox Publisher At-Least-Once Reality

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

### Outbox Table Enhancement

```sql
ALTER TABLE outbox_events
ADD COLUMN event_id VARCHAR(255) NOT NULL,
ADD COLUMN publish_attempt_count INT NOT NULL DEFAULT 0,
ADD COLUMN last_publish_attempt_at TIMESTAMP NULL,
ADD COLUMN published_at TIMESTAMP NULL,
ADD COLUMN last_error TEXT NULL;
```

### Recommended Outbox Event Fields

```text
id
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

---

## 46.13 Canonical Schema eventType Validation

There are two valid approaches.

### Option A — One Schema Per Event Type

Example:

```json
{
  "eventType": {
    "type": "string",
    "enum": ["OrderLineCreated"]
  }
}
```

Advantages:

```text
strict
clear contract
event-specific validation
easy to catch wrong mapping/schema combination
```

Disadvantages:

```text
more schema files
more version management
```

### Option B — Generic Event Type Pattern

Example:

```json
{
  "eventType": {
    "type": "string",
    "pattern": "^[A-Z][a-zA-Z]+$"
  }
}
```

Advantages:

```text
fewer schemas
more generic
```

Disadvantages:

```text
less strict
wrong event type may pass schema validation
more validation needed in code
```

### Recommended Decision

Use **one canonical schema per event type** for important domain events.

Reason:

```text
strict contracts are more valuable than fewer schema files
```

For generic audit/logging events, a generic schema is acceptable.

---

## 46.14 Worker Pool Memory Limits

Worker pool may become memory-bound, not only CPU-bound.

Each worker has its own V8 heap.

### Risks

```text
large payload copied to worker
many workers multiply memory usage
large JSON.parse result retained in memory
worker queue holds many payloads
```

### Controls

```text
limit payload size
limit worker count
limit worker queue depth
set container memory limits
monitor heap usage
restart unhealthy workers
```

### Example Config

```json
{
  "workerPool": {
    "enabled": true,
    "workerCount": 4,
    "maxQueueSize": 100,
    "maxPayloadBytes": 1048576,
    "workerMaxOldSpaceMb": 256
  }
}
```

### Node.js Worker Resource Limit Implementation

If using `worker_threads`, memory can be limited with `resourceLimits`.

Example:

```ts
new Worker(workerFile, {
  resourceLimits: {
    maxOldGenerationSizeMb: 256
  }
});
```

If using child processes instead of worker threads, use the V8 flag:

```text
--max-old-space-size=256
```

### Large Payload Option

For very large payloads, consider:

```text
streaming JSON parsing
splitting bulk files into smaller events before transformation
offloading bulk transformation to a separate bulk pipeline
```

Possible libraries:

```text
stream-json
JSONStream
```

For MVP, do not use streaming JSON parsing unless payload size requires it.

---

## 46.15 Bulk Processing Clarification

Kafka Streams / KStream is not required initially.

Bulk volume alone does not require Kafka Streams.

### Use Node.js Kafka Consumer When

```text
each event is independent
transformation is stateless
no join
no windowing
no aggregation
no state store
```

### Consider Kafka Streams / Flink / Spark When

```text
stateful joins are needed
windowed aggregation is needed
deduplication requires state store
batch completion tracking is complex
large file processing requires distributed compute
```

### Current Decision

```text
KStream/Kafka Streams is over-engineering for the current transformer.
Use KafkaJS consumer/producer first.
```

---

## 46.16 Nice-to-Have After MVP

These should not block MVP, but can be useful later.

```text
DLQ replay UI
partner onboarding checklist
mapping validation CLI
mapping dry-run UI
mapping canary deployment
mapping A/B testing
automatic schema compatibility checks
compensation event tooling
secure payload viewer with audit log
```

---

## 46.17 Updated Production Scope

This section replaces the earlier MVP/Should-Have distinction with a stricter production readiness view.

### Production Must Have — Transformer Service

```text
graceful shutdown
consumer rebalance handling
/health/live, /health/ready, /health/startup
manual Kafka offset commit
compiled mapping cache
compiled schema cache
canonical Ajv validation
DLQ + retry topics
structured masked logs
ordered mode with offset tracking
circuit breaker, at least Kafka producer
partner rate limiting, at least maxInFlightMessages and maxPayloadBytes
dry-run mapping endpoint
mapping rollback strategy
consumer lag alerts
DLQ retention policy
basic operational metrics dashboard
```

### Production Must Have — Business Service

```text
processed_events table
idempotent processing
pending dependency table
outbox_events table
transactional outbox insert
outbox publisher, polling acceptable initially
idempotent downstream consumption contract
```

### Production Must Have — Infrastructure / Operations

```text
Kafka topic sizing
Kafka replication and min.insync.replicas
Kafka authentication and authorization
TLS encryption in transit
secret management
log aggregation and retention policy
monitoring dashboards
documented replay strategy
failure injection tests
capacity planning baseline
```

### Should Have

```text
compensation event tooling
partner onboarding checklist
mapping validation CLI
schema compatibility checks in CI
DLQ replay scripts
```

### Later

```text
DLQ replay UI
mapping dry-run UI
mapping canary deployment
mapping A/B testing
secure payload viewer with audit log
Kafka Streams/Flink/Spark for stateful bulk processing
```

---

## 46.18 Updated Risk Table

| Risk | Priority | Mitigation |
|---|---:|---|
| Pod killed during processing | High | Graceful shutdown |
| Pod receives traffic before ready | High | Readiness/startup probes |
| Message loss from early offset commit | High | Commit only after output/DLQ |
| Worker pool breaks ordering | High | Ordered mode offset tracker |
| Duplicate processing | High | processed_events table |
| DB update without event publish | High | Outbox pattern |
| PII leak in logs/DLQ | High | Masking + retention policy |
| Mapping bug reaches business system | Medium | Fixture tests + dry-run + compensation |
| Partner floods system | Medium | Rate limiting |
| Dependency repeated failures | Medium | Circuit breaker |
| Pending event duplicate | Medium | Pending + processed_events interaction |
| Outbox duplicate publish | Medium | Idempotent downstream |
| Worker memory pressure | Low/Medium | Payload limit + worker heap limit |
| Consumer lag grows unnoticed | Medium | Lag alerts and dashboards |
| Huge payload transformation | Low/Medium | Bulk pipeline or streaming parse |

---

## 46.19 Final Updated Decision

The architecture remains:

```text
Kafka
+
Node.js / TypeScript
+
JSONata
+
Ajv
+
Worker pool
+
DLQ / Retry
+
Business idempotency
+
Outbox
```

But production readiness requires these additional controls:

```text
graceful shutdown
separate live/ready/startup health checks
ordered-mode commit tracking
PII masking and DLQ retention
partner rate limits
circuit breakers
dry-run mapping tests
mapping rollback/compensation strategy
outbox at-least-once awareness
worker memory limits
```

Final principle:

```text
The transformer should be simple in business logic,
but very strong in operational correctness.
```


---

# 47. Production Operations Addendum

This section covers operational requirements that must be defined before production rollout. These topics are not transformation logic, but they determine whether the architecture can be safely operated.

---

## 47.1 Schema Evolution and Compatibility

Mapping versioning alone is not enough. Canonical schemas also need explicit evolution rules.

### Problem

In production, canonical events will evolve.

Examples:

```text
new field added
field renamed
field type changed
required field removed
new event type introduced
old consumer still running
new producer already deployed
```

Without schema evolution rules, producers and consumers may break each other.

---

### Default Rule

Canonical schemas should aim for:

```text
FULL compatibility where possible
BACKWARD compatibility as the minimum default
```

---

### Compatibility Types

| Type | Meaning | Example |
|---|---|---|
| BACKWARD | New consumer can read old producer data | Consumer v2 reads event v1 |
| FORWARD | Old consumer can read new producer data | Consumer v1 reads event v2 |
| FULL | Both backward and forward compatible | Ideal for shared canonical topics |

---

### Canonical Schema Evolution Rules

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

---

### Safe Change Examples

#### Adding Optional Field

```json
{
  "customerId": "CUST-1",
  "email": "a@test.com",
  "marketingConsent": true
}
```

If `marketingConsent` is optional, older consumers can ignore it.

#### Adding New Event Type

Safe if no existing consumer is forced to process it.

---

### Breaking Change Examples

```text
string orderId → number orderId
required field removed
field renamed without keeping old field
date format changed
enum value removed
payload structure completely changed under same schemaVersion
```

These require a new schema version.

---

### Schema Registry Decision

A schema registry is recommended if canonical schemas become shared across many teams or services.

Possible options:

```text
Confluent Schema Registry
Apicurio Registry
custom Git-based schema registry
schema package published as versioned artifact
```

For MVP, Git-based JSON Schema files plus CI compatibility checks may be enough.

For larger production usage, use a schema registry.

---

### CI Compatibility Checks

Every schema change should run:

```text
old sample events validate against new consumer expectations
new sample events validate against old consumer expectations where forward compatibility is required
mapping fixture tests
canonical schema validation
consumer fixture tests
```

---

## 47.2 Kafka Topic Configuration Reference

Topic configuration must be explicitly defined before production.

### Recommended Starting Configuration

| Topic | Partitions | Retention | Cleanup Policy | Rationale |
|---|---:|---|---|---|
| `partner.raw.events` | 12-24 | 7 days | delete | Replay buffer and audit trail |
| `canonical.events` | 12-24 | 7 days | delete | Replay buffer for business service |
| `transformation.retry.1m` | 6-12 | 1 hour | delete | Short retry level |
| `transformation.retry.5m` | 6-12 | 6 hours | delete | Medium retry level |
| `transformation.retry.30m` | 6-12 | 24 hours | delete | Long retry level |
| `transformation.dlq` | 6 | 90 days | delete | Investigation and controlled replay |
| `business.events` | 12-24 | 7 days | delete | Downstream consumption window |
| `outbox.events` if CDC-based | 12-24 | 7 days | delete | Business event publishing |

---

### Replication

Production baseline:

```text
replication.factor = 3
min.insync.replicas = 2
acks = all
```

This allows one broker failure without losing write availability, assuming enough brokers remain in sync.

---

### Partition Count Guidance

Partition count determines maximum parallelism per consumer group.

Rule of thumb:

```text
partition count >= expected maximum consumer pods
```

If ordering is by `orderId`, all messages for the same order go to the same partition.

Increasing partitions later is possible but may affect key distribution and operational expectations. Choose a reasonable initial partition count.

---

### Retention Guidance

Raw and canonical topics should retain enough data for replay.

Retry topics should have shorter retention.

DLQ should retain long enough for investigation, but not forever.

---

### Compaction

Do not use compaction for raw event topics unless the topic represents latest state by key.

For this architecture:

```text
raw event topics → delete retention
canonical event topics → delete retention
retry topics → delete retention
DLQ topics → delete retention
```

Compaction may be useful for reference data topics, but that is outside the core transformer flow.

---

## 47.3 Monitoring Dashboard Requirements

Metrics exist only to support decisions. Dashboards should be designed around operational questions.

---

### Operational Dashboard

Audience:

```text
on-call engineer
platform team
SRE
```

Should show:

```text
consumer lag by consumer group and topic
DLQ message rate
retry topic depth
circuit breaker state
pod restart count
Kafka producer error rate
worker queue depth
worker active count
event loop lag
CPU and memory by pod
error rate by partner
```

Primary questions:

```text
Is the system processing?
Is it falling behind?
Is one partner causing failure?
Is Kafka/downstream unhealthy?
Are pods restarting?
```

---

### Partner Support Dashboard

Audience:

```text
integration support
partner support team
operations team
```

Should show:

```text
messages processed per partner
DLQ count per partner
retry count per partner
validation error rate per partner
average transform duration per partner
top validation error paths
payload size distribution per partner
```

Primary questions:

```text
Which partner is failing?
Did a partner payload change?
Is one partner sending too much data?
Which field is causing failures?
```

---

### Business Dashboard

Audience:

```text
business service owner
domain team
product operations
```

Should show:

```text
canonical events produced rate
business events published rate
outbox pending count
outbox publish failure count
pending dependency count
end-to-end latency: raw → canonical → business event
processed event count
duplicate event count
```

Primary questions:

```text
Are transformed events becoming business events?
Is outbox stuck?
Are parent-child dependencies accumulating?
Are duplicates increasing?
```

---

## 47.4 Alerting Strategy

Example thresholds must be tuned in production, but alert categories should exist from day one.

### Suggested Alerts

| Alert | Severity | Reason |
|---|---|---|
| Transformer consumer lag > 1,000 | Warning | Processing delay |
| Transformer consumer lag > 10,000 | Critical | System falling behind |
| Business consumer lag > 500 | Warning | Business processing delay |
| DLQ message count > 0 | Warning | Invalid data/config issue |
| DLQ rate spike | Critical | Partner or mapping broken |
| Retry topic backlog > 100 | Warning | Temporary failures accumulating |
| Circuit breaker open | Critical | Dependency unhealthy |
| Outbox pending count growing for 10+ minutes | Warning | Publisher stuck |
| Worker queue > 80% capacity | Warning | Backpressure close to limit |
| Pod restart count increasing | Warning | Stability issue |
| Pending dependency count growing | Warning | Parent-child ordering issue |

### Principle

```text
DLQ is not normal business flow.
Every DLQ event should be visible.
```

---

## 47.5 Replay Strategy

Replay must be documented and tested before production.

---

### Replay Use Cases

```text
business DB restored from backup
wrong mapping fixed and events need reprocessing
downstream projection needs rebuilding
DLQ messages investigated and approved for replay
partial partner data needs reprocessing
```

---

### Full Replay from Canonical Topic

Use when business service needs to rebuild from canonical events.

```text
1. Stop or isolate business consumer group
2. Reset consumer offset to desired timestamp/offset
3. Ensure processed_events strategy is compatible with replay
4. Reprocess canonical events
5. Outbox publishes business events again
6. Downstream consumers deduplicate by event_id
```

### Important

If `processed_events` still contains old event IDs, replay may be skipped.

Options:

```text
clear processed_events for replay scope
use a separate replay consumer group and replay mode
write to a rebuilt projection instead of live tables
use compensation events instead of raw replay
```

---

### Partial Replay from Raw Topic

Use when specific partner/event messages need to go through transformation again.

```text
1. Identify source topic, partition, offset/time window
2. Filter by partnerId/eventType/entityId
3. Choose explicit mapping version
4. Run replay transformer job
5. Produce canonical replay events
6. Business service consumes normally or through replay route
```

Replay events should include metadata:

```text
isReplay = true
replayId
originalTopic
originalPartition
originalOffset
mappingVersion
replayedAt
```

---

### DLQ Replay

DLQ replay must not be automatic.

Required steps:

```text
1. Investigate root cause
2. Fix mapping/schema/config/data
3. Run dry-run transform
4. Approve replay
5. Replay with explicit mapping version
6. Monitor result
```

---

### Replay Risks

```text
duplicates
out-of-order events
live traffic interleaving with replay traffic
pending dependency conflicts
downstream reprocessing side effects
incorrect mapping version used
```

### Replay Rule

```text
Replay requires idempotent consumers.
Replay must be traceable.
Replay must be deliberate, not automatic.
```

---

## 47.6 Kafka Security

Kafka security is an operational prerequisite.

The application does not implement Kafka security itself, but it must support the required configuration.

### Required Controls

```text
TLS encryption in transit
SASL/SCRAM or mTLS authentication
service-account-based Kafka identities
topic-level ACLs
least privilege permissions
```

### Example ACL Model

| Service | Read | Write |
|---|---|---|
| Transformer | `partner.raw.events`, retry topics | `canonical.events`, retry topics, `transformation.dlq` |
| Business Service | `canonical.events` | business DB, outbox table |
| Outbox Publisher | outbox DB table | `business.events` |
| Support Replay Job | approved source topics/DLQ | approved replay target topics |

### Principle

```text
A service should only read/write the topics required for its role.
```

---

## 47.7 Secret Management

Secrets must not be stored in source code, container images, or plain config files.

### Secrets Include

```text
Kafka credentials
database credentials
partner API keys
TLS private keys
schema registry credentials
Vault tokens
```

### Supported Approaches

Choose based on infrastructure:

```text
Kubernetes Secrets mounted as files
HashiCorp Vault
AWS Secrets Manager
GCP Secret Manager
Azure Key Vault
Sealed Secrets
External Secrets Operator
```

### Rules

```text
secrets are read at startup
service fails fast if required secret is missing
secrets are not logged
secrets are not included in crash dumps
rotation procedure must be documented
```

### Preferred Runtime Pattern

```text
mount secrets as files
read into memory at startup
do not expose through config/debug endpoints
```

---

## 47.8 Log Levels, Aggregation and Retention

Structured logging is required, but retention and log levels must be controlled.

### Log Levels

| Level | Example | Production Retention |
|---|---|---|
| ERROR | Circuit breaker open, Kafka connection lost | 30 days |
| WARN | Validation failed, DLQ produced, retry initiated | 30 days |
| INFO | Cache loaded, message processed summary, offset committed | 14 days |
| DEBUG | Masked payload details, mapping internals | 7 days or disabled |

### Production Default

```text
INFO
```

DEBUG should not be permanently enabled in production.

If dynamic log level changes are supported, they should be:

```text
temporary
audited
limited to specific partner/event/correlationId where possible
```

### Aggregation

Logs should be shipped to a central platform, for example:

```text
ELK / OpenSearch
Grafana Loki
Splunk
CloudWatch
Datadog
New Relic
```

---

## 47.9 Capacity Planning Starting Points

Capacity must be measured, but the system needs sensible starting points.

---

### Transformer Pod Sizing

| Metric | Starting Value | Notes |
|---|---:|---|
| CPU request | 1 core | JSONata/Ajv can be CPU-bound |
| CPU limit | 2 cores | Tune after load test |
| Memory request | 512Mi | Depends on payload size |
| Memory limit | 1Gi | Increase for large payloads |
| Worker count | 2-4 per pod | Usually close to CPU cores |
| Max in-flight messages | 100-200 per pod | Tune by payload size and latency |
| Max payload size | 256KiB-1MiB | Partner-specific |
| Kafka partitions | >= max expected pods | Determines consumer parallelism |

---

### Business Service Pod Sizing

| Metric | Starting Value |
|---|---:|
| CPU request | 500m-1 core |
| Memory request | 512Mi-1Gi |
| DB connection pool | 10-20 per pod |
| Max in-flight messages | Based on DB capacity |

---

### Scaling Strategy

```text
scale horizontally before vertically
increase partitions if consumer parallelism is capped
do not exceed DB connection limits when scaling business pods
watch worker queue depth and consumer lag
watch payload size distribution
```

### HPA Signals

Possible scaling signals:

```text
CPU usage
Kafka consumer lag
worker queue depth
processing latency
```

Kafka lag based autoscaling can be implemented with tools such as KEDA.

---

## 47.10 Failure Injection / Chaos Test Cases

Before production, the system should be tested against known failure modes.

| Test | Expected Behaviour |
|---|---|
| Kill transformer pod mid-batch | No message loss; Kafka redelivers unfinished messages |
| Kill business service pod mid-transaction | DB transaction rolls back; canonical event redelivered |
| Kafka broker restart | Circuit breaker opens; consumer pauses; system recovers |
| Kafka producer timeout | Retry/circuit breaker behaviour triggers |
| DB connection pool exhaustion | Business service becomes unready; no data corruption |
| Fill worker queue to max | Backpressure triggers; consumer pauses; no OOM |
| Deploy wrong mapping version | Schema validation or dry-run catches it; bad data goes DLQ |
| Network partition transformer → Kafka | Produce fails; circuit breaker opens; no offset commit |
| Outbox publisher crash after produce before DB update | Duplicate publish possible; downstream idempotency handles it |
| Parent Order missing for OrderLine | Pending table stores child event |
| Duplicate canonical event | processed_events prevents duplicate domain update |
| Large payload above limit | Message rejected/DLQ based on policy |
| DLQ spike from one partner | Partner rate limit and alerts trigger |

---

## 47.11 Ingress and Egress Bridge Clarification

The transformer architecture begins at Kafka.

It does not define how partners deliver data into Kafka.

### Separate Concerns

```text
HTTP ingress adapter
SFTP file watcher
S3/object storage poller
partner webhook receiver
partner callback sender
partner authentication
partner-specific network allowlisting
```

These are separate adapter services.

### Boundary

```text
Ingress adapter responsibility:
  external partner protocol → Kafka raw topic

Transformer responsibility:
  Kafka raw topic → canonical Kafka topic

Business service responsibility:
  canonical Kafka topic → domain state + business events
```

This separation keeps the transformer focused and testable.

---

## 47.12 Updated Production Readiness Checklist

### Transformer Service

```text
[ ] graceful shutdown implemented
[ ] rebalance handling tested
[ ] liveness/readiness/startup probes implemented
[ ] manual offset commit implemented
[ ] mapping cache compiled at startup
[ ] schema cache compiled at startup
[ ] canonical Ajv validation mandatory
[ ] retry and DLQ topics configured
[ ] ordered mode implemented for state-sensitive events
[ ] circuit breaker implemented for Kafka producer
[ ] per-partner max in-flight and payload size limits implemented
[ ] dry-run transform endpoint implemented
[ ] DLQ redrive CLI or controlled admin endpoint implemented
[ ] mapping rollback procedure documented and tested
[ ] consumer lag alerts configured
[ ] DLQ retention policy configured
[ ] strict DLQ PII masking/encryption policy implemented
[ ] structured masked logs implemented
[ ] worker task timeout implemented
[ ] poison pill protection implemented
[ ] entityId / partition key validation implemented
[ ] OpenTelemetry trace propagation implemented
```

### Business Service

```text
[ ] processed_events table exists
[ ] idempotent processing implemented
[ ] pending dependency table implemented where required
[ ] pending dependency cleanup job implemented
[ ] expired pending dependency handling implemented
[ ] outbox_events table includes event_id
[ ] business update and outbox insert are transactional
[ ] outbox publisher implemented
[ ] downstream idempotency contract documented
```

### Infrastructure / Operations

```text
[ ] Kafka topic partitions defined
[ ] Kafka retention policies defined
[ ] Kafka replication.factor=3 or equivalent production standard
[ ] min.insync.replicas=2 or equivalent production standard
[ ] TLS enabled
[ ] SASL/mTLS configured
[ ] Kafka ACLs configured
[ ] secrets managed outside source code/images
[ ] log aggregation configured
[ ] dashboards created
[ ] replay strategy documented and tested
[ ] capacity baseline defined
[ ] failure injection tests completed
[ ] worst-case JSONata load tests completed
[ ] memory growth tests completed
```

---

## 47.13 Final Production Position

The production-grade architecture is not just:

```text
Node.js + JSONata + Kafka
```

It is:

```text
Node.js + JSONata + Kafka
+
schema evolution discipline
+
topic configuration
+
security
+
idempotency
+
outbox
+
replay strategy
+
operational dashboards
+
capacity planning
+
failure testing
```

Final principle:

```text
A simple transformer can be production-grade only when the operational controls around it are strong.
```


---

# 48. Bulletproofing Addendum

This section captures additional hardening decisions required to reduce operational risk and make the architecture safer under failure, high volume, bad partner data, and compliance constraints.

---

## 48.1 JSONata Worker Timeout and Memory Safety

JSONata is powerful, but complex expressions and large payloads can create CPU and memory pressure.

### Risks

```text
complex JSONata expression consumes 100% CPU
large array transformation takes too long
worker becomes stuck
worker queue stops draining
pod memory grows because large objects are retained
mapping bug causes repeated slow processing
```

### Required Control

Every worker task must have a timeout.

Example:

```json
{
  "workerPool": {
    "enabled": true,
    "workerCount": 4,
    "taskTimeoutMs": 5000,
    "maxQueueSize": 100,
    "maxPayloadBytes": 1048576,
    "workerMaxOldSpaceMb": 256
  }
}
```

### Timeout Behaviour

```text
worker task exceeds timeout
        ↓
cancel/terminate worker task
        ↓
classify error as WORKER_TIMEOUT
        ↓
retry if likely temporary
        ↓
DLQ after max retry
        ↓
start replacement worker if needed
```

### Important Rule

A stuck transformation must not block the whole process.

### Load Test Focus

Performance tests must include:

```text
large arrays
deeply nested JSON
worst-case partner payload
high-cardinality partner traffic
slow JSONata mappings
invalid payload bursts
worker timeout scenarios
memory growth over long runs
```

### Metrics

```text
jsonata_transform_duration_ms
worker_task_timeout_total
worker_restart_total
worker_memory_usage_bytes
worker_queue_depth
payload_size_bytes
```

---

## 48.2 Transformer-Level Idempotency and Kafka Idempotent Producer

The architecture accepts that the transformer may publish duplicate canonical events if produce succeeds but offset commit fails.

### Failure Scenario

```text
1. Transformer consumes raw event
2. Transformer produces canonical event successfully
3. Transformer crashes before committing raw offset
4. Kafka redelivers raw event
5. Transformer produces same canonical event again
6. Business service receives duplicate eventId
```

### Current Decision

The transformer does not need its own database outbox for MVP.

This is acceptable if:

```text
eventId is stable and preserved
business service deduplicates using processed_events
downstream consumers are idempotent
duplicate canonical events are tolerated operationally
```

### Additional Hardening

Kafka producers should enable idempotent producer semantics where supported by the client and broker.

Recommended producer config conceptually:

```text
acks = all
enable idempotence = true
retries enabled
max in-flight requests configured safely
```

In KafkaJS, the exact support and configuration depends on the KafkaJS version and broker capabilities. The architecture decision is:

```text
Use Kafka producer idempotence where available.
Still design downstream as idempotent.
Do not rely on producer idempotence as the only duplicate protection.
```

### Strictly-Once Requirement

If near strictly-once transformation output is required, add a transformer-side durable deduplication store:

```text
sent_events(event_id, output_topic, output_partition, output_offset, produced_at)
```

However, this adds:

```text
database dependency to transformer
more latency
more operational complexity
another transactional boundary
```

### Recommended Position

```text
Default production:
  no transformer DB outbox
  Kafka idempotent producer where available
  business idempotency mandatory

Strict mode:
  transformer sent_events store
  replay-aware deduplication
  higher operational complexity accepted
```

---

## 48.3 Poison Pill Protection

A poison pill is a message that repeatedly crashes or blocks the consumer.

### Risk

```text
bad JSON
unexpected payload shape
JSON.parse crash
JSONata evaluation crash
Ajv crash due to unexpected input
application bug triggered by one payload
```

### Required Rule

All message processing must be wrapped in defensive error handling.

Processing boundary:

```text
try:
  parse envelope
  validate envelope
  resolve config
  run input validation
  transform
  validate canonical
  produce output
catch:
  classify error
  produce DLQ or retry
  never crash main process for a single message
```

### Error Classification

```text
JSON_PARSE_ERROR             → DLQ
ENVELOPE_VALIDATION_FAILED   → DLQ
UNKNOWN_PARTNER              → DLQ
MAPPING_NOT_FOUND            → DLQ
JSONATA_EVALUATION_FAILED    → DLQ unless timeout/retryable
CANONICAL_VALIDATION_FAILED  → DLQ
WORKER_TIMEOUT               → retry then DLQ
UNEXPECTED_PROCESSING_ERROR  → retry with max attempts, then DLQ
```

### Important Rule

```text
A single bad message must not crash the consumer loop.
```

---

## 48.4 DLQ Redrive Mechanism

DLQ is not useful unless there is a controlled way to reprocess messages.

### Redrive Use Cases

```text
mapping bug fixed
schema fixed
partner payload corrected
temporary dependency recovered
manual investigation approved replay
```

### Required Redrive Flow

```text
1. Identify DLQ message or DLQ batch
2. Investigate root cause
3. Fix mapping/schema/config/data
4. Run dry-run transform
5. Approve redrive
6. Redrive with explicit mapping version
7. Monitor canonical output and DLQ rate
```

### Redrive Must Not Be Automatic

```text
DLQ replay requires human or controlled workflow approval.
```

### Redrive Metadata

Redriven messages should include:

```json
{
  "isRedrive": true,
  "redriveId": "redrive-2026-05-10-001",
  "originalDlqTopic": "transformation.dlq",
  "originalErrorType": "CANONICAL_VALIDATION_FAILED",
  "approvedBy": "operator-id",
  "redrivenAt": "2026-05-10T12:00:00Z",
  "mappingVersion": "v1.2.1"
}
```

### Redrive Options

| Option | Description |
|---|---|
| CLI script | Good MVP option |
| Admin endpoint | Good controlled operational option |
| Admin UI | Later enhancement |
| Batch replay job | Good for large DLQ batches |

### MVP Recommendation

Implement at least:

```text
DLQ redrive CLI or restricted admin endpoint
dry-run before redrive
explicit mapping version selection
audit log for every redrive
```

---

## 48.5 Pending Dependency Housekeeping

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

### Pending Table Additional Columns

```sql
ALTER TABLE pending_order_lines
ADD COLUMN expires_at TIMESTAMP NULL,
ADD COLUMN last_checked_at TIMESTAMP NULL,
ADD COLUMN expired_reason TEXT NULL;
```

### Suggested Statuses

```text
PENDING
PROCESSED
EXPIRED
FAILED
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

### Metrics

```text
pending_dependency_count
pending_dependency_expired_total
pending_dependency_oldest_age_seconds
```

---

## 48.6 Strict PII Policy for DLQ

DLQ often contains the most problematic data, including malformed or unexpected payloads.

### Required Rule

```text
Never put raw sensitive payload into DLQ in plaintext.
```

### Allowed DLQ Payload Strategies

| Strategy | Use |
|---|---|
| Metadata only | Safest, but no replay from DLQ payload |
| Masked payload | Useful for debugging |
| Encrypted payload | Required if replay from DLQ is needed |
| Secure storage reference | Best for large/sensitive payloads |

### Recommended Policy

```text
DLQ topic:
  metadata + masked payload only

Secure object store:
  encrypted original payload if replay is required
  short retention
  strict access control
  audit logging
```

### Compliance Notes

For GDPR/KVKK-style compliance:

```text
define retention period
define access control
log access to raw/encrypted payload
support deletion/anonymisation process where legally required
avoid storing unnecessary PII
```

### Data Retention Example

```json
{
  "dlq": {
    "metadataRetentionDays": 90,
    "maskedPayloadRetentionDays": 30,
    "encryptedRawPayloadRetentionDays": 14
  }
}
```

---

## 48.7 Entity ID and Partition Key Validation

Kafka ordering depends on a correct key.

### Risk

If `entityId` or `orderId` is missing or wrong:

```text
related events may go to different partitions
ordering guarantee is lost
pending logic may misbehave
business state may become inconsistent
```

### Required Rule

Before producing to canonical topic:

```text
validate entityId exists
validate entityId is not empty
validate entityId matches canonical payload identity
validate partition key path is configured
```

### Example Validation

```text
envelope.entityId == canonical.payload.orderId
```

If not:

```text
ENTITY_ID_MISMATCH → DLQ
```

### Partition Key Decision

For order-related events:

```text
partition key = orderId
```

For customer-related events:

```text
partition key = customerId
```

For independent events:

```text
partition key may be eventId
```

---

## 48.8 Multi-Tenant Cache Key Extension

If the platform is multi-tenant, mapping and schema cache keys must include tenant context.

### Current Key

```text
partnerId + eventType + direction + schemaVersion
```

### Multi-Tenant Key

```text
tenantId + partnerId + eventType + direction + schemaVersion + environment
```

Example:

```text
tenantA:companyA:OrderCreated:inbound:v1:prod
tenantA:companyA:OrderCreated:inbound:v1:stage
tenantB:companyA:OrderCreated:inbound:v1:prod
```

### Decision

If the same partner can have different mappings per tenant, include `tenantId`.

If mappings are global per partner, tenantId is not required in the mapping key, but should still be present in message metadata for audit and routing.

---

## 48.9 Schema Registry Reclassification

Schema registry was previously described as optional.

This decision should depend on scale.

### Recommendation

| Situation | Decision |
|---|---|
| 1-3 partners, few consumers | Git-based JSON Schema + CI may be enough |
| 5-10+ partners or many consumers | Schema registry strongly recommended |
| Multiple teams producing/consuming canonical events | Schema registry should be mandatory |
| Regulated/audited environment | Schema registry strongly recommended |

### Production Decision

For a multi-partner production platform, schema registry should be treated as:

```text
Strongly recommended baseline
Mandatory once partner/consumer count grows beyond small scale
```

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

## 48.10 Backpressure Trigger Details

Backpressure must be driven by measurable signals.

### Trigger Conditions

Pause or slow Kafka consumption when:

```text
worker queue depth > 80%
worker active count == worker count for sustained period
producer latency above threshold
retry topic backlog increasing rapidly
memory usage above threshold
business service lag critical
circuit breaker open
```

### Consumer Pause/Resume Behaviour

```text
if backpressure triggered:
  pause consumer partitions
  continue processing in-flight messages
  resume only when queue/latency returns below threshold
```

### Example Config

```json
{
  "backpressure": {
    "workerQueueHighWatermarkPercent": 80,
    "workerQueueLowWatermarkPercent": 40,
    "producerLatencyHighMs": 1000,
    "memoryHighWatermarkPercent": 85,
    "pauseCheckIntervalMs": 1000
  }
}
```

### Important Rule

```text
Backpressure should protect memory and downstream systems before failure occurs.
```

---

## 48.11 OpenTelemetry Distributed Tracing

`correlationId` is useful, but distributed tracing is needed to understand end-to-end latency.

### Required Trace Path

```text
Ingress adapter
  ↓
Kafka raw event
  ↓
Transformer
  ↓
Kafka canonical event
  ↓
Business service
  ↓
DB transaction
  ↓
Outbox publisher
  ↓
Kafka business event
  ↓
Downstream consumer
```

### Trace Context

Kafka headers should carry:

```text
traceparent
tracestate
correlationId
eventId
partnerId
```

### Spans

Recommended spans:

```text
consume raw event
resolve mapping
JSONata transform
Ajv validation
produce canonical event
business consume
business DB transaction
outbox insert
outbox publish
```

### Observability Stack

Possible tools:

```text
OpenTelemetry Collector
Jaeger
Tempo
Zipkin
New Relic
Datadog
SigNoz
```

### Required Metrics + Traces Link

Every error log should include:

```text
traceId
spanId
correlationId
eventId
partnerId
```

This makes investigation much faster.

---

## 48.12 Updated Production Must-Have Additions

The following items should be considered production must-have additions.

### Transformer Service

```text
worker task timeout
poison pill protection
DLQ redrive CLI or controlled admin endpoint
strict DLQ PII policy
entityId / partition key validation
backpressure triggered by worker queue depth
OpenTelemetry trace propagation
Kafka idempotent producer where supported
```

### Business Service

```text
pending dependency cleanup job
expired pending dependency handling
dependency DLQ / alerting
```

### Infrastructure / Operations

```text
schema registry strongly recommended for multi-partner scale
load tests for worst-case JSONata mappings
memory growth tests
trace backend configured
```

---

## 48.13 Updated Final Position

The system is production-ready only if it handles:

```text
bad data
slow mappings
duplicate events
missing parent events
partner floods
Kafka failures
pod termination
rebalance
DLQ investigation
replay/redrive
PII compliance
traceability
capacity pressure
```

The core architecture remains valid:

```text
Kafka
+
Node.js / TypeScript
+
JSONata
+
Ajv
+
Worker pool
+
DLQ / Retry
+
Idempotent business service
+
Outbox
```

The bulletproof version adds:

```text
worker timeout
poison pill protection
DLQ redrive
pending cleanup
strict DLQ encryption/masking policy
partition key validation
schema registry at scale
backpressure triggers
OpenTelemetry tracing
```

Final principle:

```text
A transformation platform fails less because of clever mapping,
and more because of operational guardrails.
```


---

# 49. Implementation Guardrails Addendum

This section clarifies implementation-level details that are easy to miss during coding. These are not new architectural decisions, but they must be implemented correctly.

---

## 49.1 Graceful Shutdown: Worker Pool Drain

Graceful shutdown must explicitly drain the worker pool.

### Required Behaviour

When `SIGTERM` or `SIGINT` is received:

```text
1. Mark service as shutting down
2. /health/ready returns 503
3. Pause Kafka consumer
4. Stop fetching new messages
5. Stop accepting new worker tasks
6. Wait for active worker tasks to complete
7. Produce successful outputs/DLQ messages
8. Commit offsets only for safely completed messages
9. Flush Kafka producer
10. Shutdown worker pool
11. Disconnect Kafka clients
12. Exit process
```

### Worker Drain Rule

```text
Do not kill active workers immediately unless shutdown timeout is exceeded.
```

If timeout is exceeded:

```text
do not commit unfinished offsets
let Kafka redeliver unfinished messages after restart
```

### Config Example

```json
{
  "shutdown": {
    "gracePeriodMs": 30000,
    "workerDrainTimeoutMs": 20000,
    "forceExitAfterMs": 45000
  }
}
```

### Key Principle

```text
Finished work may be committed.
Unfinished work must be redelivered.
```

---

## 49.2 JSONata Worker Sandbox and Restart Policy

JSONata execution must be isolated enough that one bad mapping or large payload cannot take down the whole service.

### Required Worker Controls

```text
task timeout
max payload size
worker heap limit
worker restart on crash
bounded worker queue
memory monitoring
```

### Worker Threads Resource Limit Example

```ts
new Worker(workerFile, {
  resourceLimits: {
    maxOldGenerationSizeMb: 256
  }
});
```

### Child Process Alternative

If child processes are used instead of worker threads:

```text
--max-old-space-size=256
```

### Worker Crash Handling

```text
worker crashes
        ↓
main thread records worker_crash_total
        ↓
in-flight task is marked failed
        ↓
message is retried or sent to DLQ based on error classification
        ↓
replacement worker is started
```

### Custom JSONata Functions

If custom JSONata functions are added:

```text
they must be deterministic
they must not perform network calls
they must not access filesystem
they must not mutate global state
they must have bounded execution time
```

### Key Principle

```text
Treat JSONata execution as untrusted transformation code.
Run it with strict CPU, memory, and time boundaries.
```

---

## 49.3 Partner-Level Fairness and Rate Limiting

Global backpressure protects the service, but partner-level rate limiting protects healthy partners from noisy partners.

### Risk

```text
CompanyA sends a huge burst of invalid messages
        ↓
worker pool and DLQ producer become busy
        ↓
CompanyB messages are delayed
        ↓
healthy partners suffer because of one bad partner
```

### Required Controls

At minimum:

```text
maxPayloadBytes per partner
maxInFlightMessages per partner
maxWorkerSlots per partner or weighted fair scheduling
DLQ rate alert per partner
retry rate alert per partner
```

### Config Example

```json
{
  "partnerLimits": {
    "companyA": {
      "maxPayloadBytes": 1048576,
      "maxInFlightMessages": 50,
      "maxWorkerSlots": 2,
      "maxDlqPerMinute": 200
    },
    "companyB": {
      "maxPayloadBytes": 262144,
      "maxInFlightMessages": 20,
      "maxWorkerSlots": 1,
      "maxDlqPerMinute": 50
    }
  }
}
```

### Fairness Strategy Options

| Strategy | Description |
|---|---|
| Per-partner in-flight limit | Simple and effective |
| Per-partner worker slot quota | Prevents one partner from occupying all workers |
| Separate topics per partner | Strong isolation but more topics |
| Separate consumer groups/services per high-volume partner | Strongest isolation |
| Weighted fair queue | Useful when partners have different priorities |

### Recommended MVP

```text
single raw topic is acceptable
but enforce per-partner maxInFlightMessages and maxPayloadBytes
```

### Recommended Scale-Up

For high-volume or risky partners:

```text
dedicated topic
dedicated consumer group
dedicated transformer deployment
separate DLQ/retry topics
```

### Key Principle

```text
One partner must not be able to degrade all other partners.
```

---

## 49.4 Final Implementation Reminder

At this stage, the main risks are no longer architectural. They are implementation mistakes.

Most important implementation rules:

```text
wrap every message in try/catch
never commit before output/DLQ is produced
drain workers on shutdown
bound worker CPU/memory/time
validate entityId before partitioning
enforce partner-level limits
preserve eventId across all stages
mask or encrypt sensitive DLQ payloads
emit traceId/correlationId/eventId in every log
```

Final principle:

```text
The architecture is strong only if the implementation preserves its failure guarantees.
```


---

# 50. Testing Strategy Addendum

This section defines testing requirements at different levels to ensure the architecture is reliable and maintainable.

---

## 50.1 Unit Tests

Unit tests should focus on isolated components.

### Mapping Fixture Tests

Every mapping must have fixtures.

```text
partners/company-a/order-created/
  fixtures/
    v1/
      input-1.json
      expected-1.json
      input-2.json
      expected-2.json
```

Test flow:

```text
1. Load input JSON
2. Validate against input schema
3. Apply JSONata mapping
4. Validate output against canonical schema
5. Compare with expected output
6. Assert exact match
```

### Error Classifier Tests

```ts
test('classifies JSON parse error as DLQ', () => {
  const error = new SyntaxError('Unexpected token');
  const classification = classifyError(error);
  expect(classification.action).toBe('DLQ');
});

test('classifies Kafka timeout as retry', () => {
  const error = new KafkaError('Request timed out');
  const classification = classifyError(error);
  expect(classification.action).toBe('RETRY');
});
```

### Validator Tests

```ts
test('rejects missing required field', () => {
  const invalid = { eventId: 'evt-1' };
  const result = validate(invalid);
  expect(result.valid).toBe(false);
  expect(result.errors[0].path).toBe('/correlationId');
});
```

### Idempotency Tests

```ts
test('duplicate event is treated as success', async () => {
  const event = { eventId: 'evt-1', ... };
  
  // First processing
  const result1 = await processEvent(event);
  expect(result1.success).toBe(true);
  
  // Duplicate
  const result2 = await processEvent(event);
  expect(result2.success).toBe(true);
  expect(result2.isDuplicate).toBe(true);
});
```

---

## 50.2 Integration Tests

Integration tests verify components working together.

### Transformer Integration Test

```ts
test('transforms raw event to canonical', async () => {
  const rawEvent = {
    eventId: 'evt-1',
    partnerId: 'companyA',
    eventType: 'OrderCreated',
    payload: { order_id: 'ORD-1' }
  };
  
  const result = await transformer.transform(rawEvent);
  
  expect(result.canonical.eventId).toBe('evt-1');
  expect(result.canonical.payload.orderId).toBe('ORD-1');
  expect(result.valid).toBe(true);
});
```

### Kafka Consumer/Producer Integration

```ts
test('consumes raw, produces canonical', async () => {
  // Produce raw event
  await rawTopic.produce(rawEvent);
  
  // Run transformer
  await transformer.run();
  
  // Verify canonical event
  const canonical = await canonicalTopic.consume();
  expect(canonical.eventId).toBe(rawEvent.eventId);
});
```

### Business Service Integration

```ts
test('processes canonical event idempotently', async () => {
  const canonical = { eventId: 'evt-1', ... };
  
  // First processing
  await businessService.process(canonical);
  const order1 = await db.getOrder('ORD-1');
  
  // Duplicate
  await businessService.process(canonical);
  const order2 = await db.getOrder('ORD-1');
  
  expect(order1).toEqual(order2);
});
```

---

## 50.3 End-to-End Tests

E2E tests verify the full flow.

### Happy Path E2E

```ts
test('full flow: raw → canonical → business event', async () => {
  // 1. Produce raw event
  const rawEvent = createRawEvent();
  await rawTopic.produce(rawEvent);
  
  // 2. Transformer processes
  await transformer.run();
  
  // 3. Verify canonical
  const canonical = await canonicalTopic.consume();
  expect(canonical.valid).toBe(true);
  
  // 4. Business service processes
  await businessService.run();
  
  // 5. Verify business event
  const businessEvent = await businessEventTopic.consume();
  expect(businessEvent.eventType).toBe('OrderProcessed');
  
  // 6. Verify DB state
  const order = await db.getOrder(canonical.payload.orderId);
  expect(order.status).toBe('PROCESSED');
});
```

### Duplicate Event E2E

```ts
test('duplicate event is handled idempotently', async () => {
  const rawEvent = createRawEvent();
  
  // Produce twice
  await rawTopic.produce(rawEvent);
  await rawTopic.produce(rawEvent);
  
  // Process
  await transformer.run();
  await businessService.run();
  
  // Verify only one business event
  const events = await businessEventTopic.consumeAll();
  expect(events.length).toBe(1);
  
  // Verify DB state is correct
  const order = await db.getOrder(rawEvent.payload.orderId);
  expect(order.processedCount).toBe(1);
});
```

### Missing Parent E2E

```ts
test('child event waits for parent', async () => {
  // Produce child first
  const childEvent = createOrderLineEvent('ORD-1');
  await rawTopic.produce(childEvent);
  
  // Process
  await transformer.run();
  await businessService.run();
  
  // Verify child is pending
  const pending = await db.getPendingOrderLines('ORD-1');
  expect(pending.length).toBe(1);
  
  // Produce parent
  const parentEvent = createOrderEvent('ORD-1');
  await rawTopic.produce(parentEvent);
  
  // Process again
  await transformer.run();
  await businessService.run();
  
  // Verify both are processed
  const order = await db.getOrder('ORD-1');
  expect(order.lines.length).toBe(1);
  
  // Verify pending is cleared
  const stillPending = await db.getPendingOrderLines('ORD-1');
  expect(stillPending.length).toBe(0);
});
```

---

## 50.4 Load Tests

Load tests verify the system handles volume.

### JSONata Performance Test

```ts
test('transforms 10k messages in < 5 seconds', async () => {
  const messages = generateMessages(10000);
  
  const start = Date.now();
  for (const msg of messages) {
    await transformer.transform(msg);
  }
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(5000);
});
```

### Worker Pool Throughput Test

```ts
test('worker pool processes 1000 messages concurrently', async () => {
  const messages = generateMessages(1000);
  
  const start = Date.now();
  await Promise.all(
    messages.map(msg => workerPool.process(msg))
  );
  const duration = Date.now() - start;
  
  const throughput = 1000 / (duration / 1000);
  expect(throughput).toBeGreaterThan(100); // 100 msg/sec
});
```

### Memory Growth Test

```ts
test('memory does not grow unbounded', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  for (let i = 0; i < 100; i++) {
    const messages = generateMessages(1000);
    await Promise.all(
      messages.map(msg => transformer.transform(msg))
    );
    
    // Force GC if available
    if (global.gc) global.gc();
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const growth = finalMemory - initialMemory;
  
  // Memory should not grow more than 50MB
  expect(growth).toBeLessThan(50 * 1024 * 1024);
});
```

---

## 50.5 Chaos / Failure Injection Tests

Chaos tests verify failure handling.

### Worker Timeout Test

```ts
test('worker timeout sends message to DLQ', async () => {
  const slowMapping = 'slow_expression_that_takes_10_seconds';
  const event = createEventWithMapping(slowMapping);
  
  const result = await transformer.transform(event, { timeoutMs: 1000 });
  
  expect(result.action).toBe('DLQ');
  expect(result.error).toContain('WORKER_TIMEOUT');
});
```

### Kafka Producer Failure Test

```ts
test('Kafka produce failure triggers retry', async () => {
  kafkaProducer.simulateFailure();
  
  const event = createEvent();
  const result = await transformer.transform(event);
  
  expect(result.action).toBe('RETRY');
  expect(result.retryCount).toBe(1);
});
```

### Circuit Breaker Test

```ts
test('circuit breaker opens after repeated failures', async () => {
  kafkaProducer.simulateFailure();
  
  // Trigger multiple failures
  for (let i = 0; i < 15; i++) {
    await transformer.transform(createEvent());
  }
  
  expect(circuitBreaker.state).toBe('OPEN');
  expect(kafkaConsumer.isPaused()).toBe(true);
});
```

### Graceful Shutdown Test

```ts
test('graceful shutdown drains worker pool', async () => {
  const messages = generateMessages(100);
  
  // Start processing
  const processing = Promise.all(
    messages.map(msg => transformer.transform(msg))
  );
  
  // Trigger shutdown after 100ms
  setTimeout(() => transformer.shutdown(), 100);
  
  // Wait for completion
  const results = await processing;
  
  // Verify all messages were processed
  expect(results.filter(r => r.success).length).toBe(100);
  
  // Verify offsets were committed
  expect(kafkaConsumer.committedOffsets()).toBeGreaterThan(0);
});
```

---

## 50.6 Contract Tests

Contract tests verify producer/consumer compatibility.

### Canonical Schema Contract Test

```ts
test('transformer produces valid canonical events', async () => {
  const rawEvents = loadFixtures('raw-events');
  
  for (const raw of rawEvents) {
    const canonical = await transformer.transform(raw);
    
    // Validate against canonical schema
    const valid = canonicalSchema.validate(canonical);
    expect(valid.errors).toEqual([]);
  }
});
```

### Business Service Consumer Contract Test

```ts
test('business service accepts all canonical events', async () => {
  const canonicalEvents = loadFixtures('canonical-events');
  
  for (const event of canonicalEvents) {
    const result = await businessService.process(event);
    expect(result.success).toBe(true);
  }
});
```

---

## 50.7 Test Coverage Goals

Recommended coverage targets:

| Component | Target |
|---|---:|
| Error classification | 95%+ |
| Idempotency logic | 95%+ |
| Offset commit logic | 95%+ |
| Mapping cache | 90%+ |
| Schema cache | 90%+ |
| Worker pool | 85%+ |
| Graceful shutdown | 85%+ |
| Overall | 80%+ |

---

## 50.8 Test Environment Setup

### Local Development

```text
Docker Compose with:
  Kafka
  Zookeeper
  PostgreSQL
  Redis (optional)
```

### CI/CD

```text
GitHub Actions / GitLab CI with:
  unit tests
  integration tests
  contract tests
  linting
  type checking
  security scanning
```

### Staging

```text
Full production-like environment
with real Kafka cluster
with real database
with monitoring
```

---

## 50.9 Test Data Management

### Fixture Organization

```text
test/fixtures/
  raw-events/
    company-a/
      order-created/
        valid-1.json
        valid-2.json
        invalid-missing-field.json
        invalid-wrong-type.json
  canonical-events/
    order-created/
      valid-1.json
      valid-2.json
  business-events/
    order-processed/
      valid-1.json
```

### Fixture Naming Convention

```text
valid-*.json       → should pass validation
invalid-*.json     → should fail validation
edge-case-*.json   → boundary conditions
```

### Sensitive Data in Tests

```text
never use real customer data
use anonymized/masked fixtures
use generated test data
use faker libraries for realistic data
```

---

## 50.10 Observability in Tests

Tests should emit metrics and logs.

### Test Metrics

```ts
test('measures transform duration', async () => {
  const metrics = new Metrics();
  
  const start = Date.now();
  await transformer.transform(event, { metrics });
  const duration = Date.now() - start;
  
  expect(metrics.get('transform_duration_ms')).toBe(duration);
});
```

### Test Logs

```ts
test('logs transformation steps', async () => {
  const logs = [];
  const logger = {
    info: (msg) => logs.push(msg)
  };
  
  await transformer.transform(event, { logger });
  
  expect(logs).toContain('envelope_validated');
  expect(logs).toContain('mapping_resolved');
  expect(logs).toContain('jsonata_transformed');
  expect(logs).toContain('canonical_validated');
});
```

---

# 51. Deployment and Rollout Strategy

This section defines how to safely deploy the transformer service and business service to production.

---

## 51.1 Deployment Checklist

Before deploying to production:

```text
[ ] All unit tests passing
[ ] All integration tests passing
[ ] All E2E tests passing
[ ] Load tests completed and acceptable
[ ] Chaos tests completed
[ ] Code review approved
[ ] Security scan passed
[ ] No breaking schema changes
[ ] Mapping fixtures validated
[ ] Rollback plan documented
[ ] Runbook created
[ ] On-call team trained
[ ] Monitoring dashboards ready
[ ] Alerts configured
[ ] Capacity planning completed
[ ] Graceful shutdown tested
[ ] Health checks verified
```

---

## 51.2 Canary Deployment

Recommended deployment strategy:

```text
1. Deploy to canary environment (1-2 pods)
2. Route 5% of traffic to canary
3. Monitor metrics for 30 minutes
4. If healthy, increase to 25%
5. Monitor for 30 minutes
6. If healthy, increase to 50%
7. Monitor for 30 minutes
8. If healthy, complete rollout to 100%
```

### Canary Metrics to Monitor

```text
error rate
latency (p50, p95, p99)
DLQ rate
retry rate
consumer lag
worker queue depth
memory usage
CPU usage
```

### Canary Rollback Trigger

Automatic rollback if:

```text
error rate > 1%
DLQ rate > 100 messages/minute
consumer lag growing
memory usage > 90%
circuit breaker open
```

---

## 51.3 Blue-Green Deployment

Alternative to canary for lower-risk deployments:

```text
1. Deploy new version to green environment
2. Run smoke tests on green
3. Switch traffic from blue to green
4. Keep blue running for quick rollback
5. Monitor green for 1 hour
6. Decommission blue
```

### Advantages

```text
instant traffic switch
easy rollback
no gradual traffic shift
```

### Disadvantages

```text
requires double resources
more complex state management
```

---

## 51.4 Rollback Procedure

If deployment fails:

```text
1. Identify failure (metrics, logs, alerts)
2. Trigger rollback
3. Revert to previous image version
4. Verify health checks pass
5. Monitor metrics
6. Investigate root cause
7. Fix and redeploy
```

### Rollback Time Target

```text
< 5 minutes from decision to rollback complete
```

---

## 51.5 Database Migration Strategy

If schema changes are needed:

```text
1. Deploy backward-compatible schema change
2. Deploy new application code
3. Verify new code works with new schema
4. Remove old schema columns in future deployment
```

### Example: Adding Column

```sql
-- Step 1: Add column as nullable
ALTER TABLE orders ADD COLUMN new_field VARCHAR(255) NULL;

-- Step 2: Deploy new code that populates new_field
-- Step 3: Backfill existing rows
UPDATE orders SET new_field = ... WHERE new_field IS NULL;

-- Step 4: Make column NOT NULL (optional, in future deployment)
ALTER TABLE orders ALTER COLUMN new_field SET NOT NULL;
```

---

## 51.6 Configuration Deployment

Configuration changes should be:

```text
versioned
tested
reviewed
deployed separately from code
monitored for impact
```

### Configuration Change Procedure

```text
1. Update configuration in Git
2. Review and approve
3. Deploy to staging
4. Test with staging data
5. Deploy to production
6. Monitor metrics
7. Verify no errors
```

---

## 51.7 Mapping Deployment

Mapping changes follow the same procedure as code:

```text
1. Create new mapping version
2. Add fixtures
3. CI validates mapping
4. Code review
5. Package with service image
6. Deploy service
7. Monitor DLQ rate
```

### Mapping Deployment Risks

```text
wrong mapping produces invalid canonical events
mapping bug causes DLQ flood
mapping performance degrades
```

### Mitigation

```text
fixture tests
dry-run endpoint
canary deployment
DLQ monitoring
performance tests
```

---

## 51.8 Kubernetes Deployment Manifest

Example Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: transformer
  namespace: etl
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: transformer
  template:
    metadata:
      labels:
        app: transformer
    spec:
      terminationGracePeriodSeconds: 45
      containers:
      - name: transformer
        image: transformer:v1.2.3
        ports:
        - containerPort: 3000
        env:
        - name: KAFKA_BROKERS
          value: kafka-0.kafka:9092,kafka-1.kafka:9092
        - name: NODE_ENV
          value: production
        resources:
          requests:
            cpu: 1000m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        startupProbe:
          httpGet:
            path: /health/startup
            port: 3000
          initialDelaySeconds: 0
          periodSeconds: 5
          failureThreshold: 30
```

---

## 51.9 Monitoring During Deployment

During deployment, monitor:

```text
pod startup time
health check pass rate
error rate
DLQ rate
consumer lag
latency
memory usage
CPU usage
```

### Deployment Metrics Dashboard

Should show:

```text
old pods terminating
new pods starting
traffic shifting
error rate trend
latency trend
```

---

## 51.10 Post-Deployment Validation

After deployment:

```text
1. Verify all pods are healthy
2. Verify consumer lag is normal
3. Verify DLQ rate is normal
4. Verify error rate is normal
5. Verify latency is normal
6. Run smoke tests
7. Check business metrics
8. Monitor for 1 hour
```

---

# 52. Operational Runbook

This section provides quick reference for common operational tasks.

---

## 52.1 Investigating High DLQ Rate

### Steps

```text
1. Check DLQ topic for recent messages
2. Identify common error type
3. Identify affected partner
4. Check mapping version
5. Check schema version
6. Review recent deployments
7. Check partner payload samples
8. Run dry-run transform
9. Determine root cause
10. Fix and redeploy or redrive
```

### Common Causes

| Cause | Fix |
|---|---|
| Partner payload changed | Update mapping or schema |
| Mapping bug | Fix mapping, redeploy |
| Schema validation too strict | Relax schema or fix mapping |
| Partner sending invalid data | Contact partner |
| Deployment issue | Rollback |

---

## 52.2 Investigating High Consumer Lag

### Steps

```text
1. Check consumer lag metric
2. Check transformer pod count
3. Check worker queue depth
4. Check error rate
5. Check latency
6. Check Kafka broker health
7. Check database health
8. Scale up if needed
9. Check for stuck messages
```

### Common Causes

| Cause | Fix |
|---|---|
| Transformer pods down | Restart pods |
| Worker queue full | Increase worker count |
| Slow transformation | Optimize mapping |
| Kafka broker issue | Check Kafka cluster |
| Database slow | Check database |

---

## 52.3 Redriving DLQ Messages

### Procedure

```text
1. Identify DLQ message
2. Investigate root cause
3. Fix mapping/schema/config
4. Run dry-run transform
5. Approve redrive
6. Execute redrive CLI
7. Monitor canonical topic
8. Verify business processing
```

### Redrive CLI Example

```bash
npm run redrive-dlq \
  --dlq-topic transformation.dlq \
  --dlq-partition 0 \
  --dlq-offset 1000 \
  --mapping-version v1.2.1 \
  --output-topic canonical.events \
  --dry-run
```

---

## 52.4 Scaling the Transformer

### Horizontal Scaling

```text
1. Increase replica count in Kubernetes
2. Monitor pod startup
3. Verify health checks pass
4. Monitor consumer lag
5. Verify error rate stable
```

### Vertical Scaling

```text
1. Increase CPU/memory requests/limits
2. Redeploy pods
3. Monitor resource usage
4. Verify performance improvement
```

---

## 52.5 Emergency Procedures

### Circuit Breaker Open

```text
1. Check Kafka broker health
2. Check network connectivity
3. Check producer configuration
4. Restart transformer pods
5. Monitor circuit breaker state
```

### Memory Leak Suspected

```text
1. Check memory usage trend
2. Check for large payloads
3. Check worker pool health
4. Restart pods
5. Monitor memory after restart
```

### Pending Dependencies Growing

```text
1. Check pending table size
2. Identify missing parents
3. Check if parent events are delayed
4. Run pending cleanup job
5. Monitor pending count
```

---

## 52.6 Maintenance Windows

### Planned Maintenance

```text
1. Announce maintenance window
2. Pause ingress adapters
3. Wait for consumer lag to reach zero
4. Perform maintenance
5. Verify health checks
6. Resume ingress adapters
7. Monitor metrics
```

### Kafka Maintenance

```text
1. Pause transformer consumer
2. Perform Kafka maintenance
3. Verify Kafka health
4. Resume transformer consumer
5. Monitor consumer lag
```

---

## 52.7 Disaster Recovery

### Data Loss Scenario

```text
1. Identify scope of data loss
2. Determine recovery strategy
3. Restore from backup if needed
4. Replay events from Kafka if available
5. Verify data consistency
6. Resume normal operations
```

### Service Failure Scenario

```text
1. Identify failure cause
2. Rollback to previous version
3. Verify health checks pass
4. Monitor metrics
5. Investigate root cause
6. Fix and redeploy
```

---

## 52.8 Performance Tuning

### Slow Transformation

```text
1. Profile JSONata mapping
2. Identify slow expressions
3. Optimize mapping
4. Test with load
5. Redeploy
```

### High Memory Usage

```text
1. Check payload sizes
2. Check worker count
3. Check worker queue depth
4. Reduce worker count or payload size
5. Monitor memory after change
```

### High CPU Usage

```text
1. Check transformation complexity
2. Check worker count
3. Increase worker count if needed
4. Monitor CPU after change
```

---

# 53. Conclusion

This comprehensive architecture document defines a production-grade event transformation platform built on Node.js, JSONata, and Kafka.

## Key Principles

```text
1. Partner complexity stays outside core business logic
2. Transformation is stateless and scalable
3. Idempotency protects against duplicates
4. Outbox pattern protects transactional consistency
5. Pending tables handle parent-child dependencies
6. DLQ is for investigation and controlled replay
7. Operational controls are as important as architecture
8. Graceful shutdown and health checks are mandatory
9. Monitoring and observability are built-in
10. Testing at all levels ensures reliability
```

## Implementation Priority

### Phase 1 (MVP)

```text
Kafka consumer/producer
JSONata transformation
Ajv validation
DLQ and retry topics
Graceful shutdown
Health checks
Structured logging
Basic metrics
```

### Phase 2 (Production Hardening)

```text
Worker pool
Circuit breaker
Partner rate limiting
Pending dependency table
Outbox pattern
Comprehensive monitoring
Chaos testing
```

### Phase 3 (Operational Excellence)

```text
Schema registry
Canary deployment
Advanced observability
Automated remediation
Self-healing capabilities
```

## Success Criteria

The architecture is successful when:

```text
✓ New partners can be onboarded in days, not weeks
✓ Mapping changes do not require code deployment
✓ System handles 10,000+ messages/second
✓ No data loss under normal failure scenarios
✓ Duplicate events are handled transparently
✓ DLQ rate is near zero in normal operation
✓ Consumer lag stays below 1,000 messages
✓ Graceful shutdown completes in < 30 seconds
✓ Operational team can investigate issues in < 5 minutes
✓ Rollback can be completed in < 5 minutes
```

## Final Thought

```text
The best architecture is one that is simple to understand,
strong in failure handling,
and easy to operate.

This document aims to achieve all three.
```
