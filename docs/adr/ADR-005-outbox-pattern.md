# ADR-005: Outbox Pattern for Transactional Consistency

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

The business consumer service must:
1. Write domain data to PostgreSQL (e.g., update order status, create shipment)
2. Publish a business event to Kafka for downstream consumers

These two operations — database write and Kafka produce — happen in two different systems. Without coordination, one can succeed and the other fail, leaving the system in an inconsistent state.

**Failure scenarios without coordination:**
```
Scenario A: DB written, then service crashes before Kafka produce
→ Downstream consumers never see the event
→ Business data and event stream are out of sync

Scenario B: Kafka produced, then DB write fails
→ Downstream consumers processed an event for data that doesn't exist
→ Phantom events in the event stream
```

This is a distributed systems consistency problem — two-phase commit (2PC) is the classical solution, but it is operationally complex and has poor performance characteristics.

---

## Options Considered

### Option A: Dual Write (direct)

**How it works:**
```
1. Write to PostgreSQL
2. Produce to Kafka
3. Return success
```

**Weaknesses:**
- Step 2 can fail after step 1 succeeds — event is lost
- No recovery mechanism
- Race condition between DB commit visibility and Kafka produce timing

### Option B: Kafka-first

**How it works:**
```
1. Produce to Kafka
2. Write to PostgreSQL
```

**Weaknesses:**
- Step 2 can fail after step 1 — phantom event with no DB record
- Kafka produce can fail — then DB write never happens
- Rollback is impossible once Kafka message is produced

### Option C: Two-Phase Commit (2PC)

**How it works:**
Distributed transaction coordinator spans both PostgreSQL and Kafka.

**Weaknesses:**
- Kafka does not natively support XA transactions (pre-3.0)
- 2PC significantly reduces throughput
- Complex failure recovery
- Operational burden

### Option D: Transactional Outbox Pattern

**How it works:**
```
Within a single PostgreSQL transaction:
  1. Write domain tables (order, shipment, etc.)
  2. Write processed_events record (idempotency)
  3. Write to outbox_events table (pending = true)
  4. COMMIT

Separate outbox publisher process:
  5. Poll outbox_events WHERE pending = true
  6. Produce to Kafka
  7. Mark outbox record as published
```

**Strengths:**
- Domain write and outbox write are atomic — one transaction, no partial state
- If publish fails, outbox record remains pending — publisher retries
- If publisher crashes after produce but before marking published, message is re-published (idempotency handles duplicate)
- No distributed transactions required
- PostgreSQL handles the durability guarantee

**Weaknesses:**
- Additional table and polling process
- Publish latency includes polling interval (typically 100–500ms)
- At-least-once publish (duplicate protection downstream via idempotency)

---

## Decision

**Use the Transactional Outbox Pattern.**

The outbox pattern is the standard solution for this problem class. It provides strong consistency guarantees without distributed transactions and works within PostgreSQL's existing durability model.

**Implementation:**

```sql
-- Within business service transaction:
INSERT INTO domain_table (...) VALUES (...);

INSERT INTO processed_events (event_id, processed_at)
VALUES ($eventId, NOW())
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO outbox_events (id, topic, payload, status, created_at)
VALUES (gen_random_uuid(), 'business.events', $payload, 'PENDING', NOW());

COMMIT;
```

```
-- Outbox publisher (separate process):
SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY created_at LIMIT 100;
-- Produce to Kafka
-- UPDATE outbox_events SET status = 'PUBLISHED' WHERE id = $id;
```

---

## Consequences

**Positive:**
- Domain write and event emit are always consistent
- Publisher failures are self-healing (pending records are retried)
- Complete audit trail: every business event has a corresponding outbox record
- Replay is possible by setting outbox records back to PENDING

**Negative:**
- Additional outbox table in schema
- Polling interval introduces publish latency (100–500ms typically)
- At-least-once semantics — downstream consumers must handle duplicates (via idempotency key)
- Outbox table growth must be managed (archive published records periodically)

**Alternatives if latency is critical:**
- CDC (Change Data Capture) via Debezium can reduce latency to near-zero by reading PostgreSQL WAL instead of polling

---

## Rejected Approaches

**Dual write**: Fundamentally unreliable — no recovery from partial failures.

**Kafka transactions (exactly-once)**: Available in Kafka 0.11+ but requires Kafka transactional producer and does not help with the DB+Kafka cross-system atomicity problem.

**Saga pattern**: Appropriate for multi-step distributed workflows, not for the simpler "write data + emit event" pattern in this service.
