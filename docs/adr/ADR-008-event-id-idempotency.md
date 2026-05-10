# ADR-008: Event ID-Based Idempotency Strategy

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

Kafka provides at-least-once delivery semantics. Under normal operation — consumer rebalancing, service restarts, network timeouts, offset commit failures — the same message can be delivered more than once.

The business service must handle duplicate events without:
- Inserting duplicate records
- Double-charging or double-processing
- Sending duplicate downstream events

The idempotency strategy must be simple, auditable, and work without distributed locks.

---

## Options Considered

### Option A: Natural key deduplication

**How it works:**
Use business-domain unique keys (e.g., order_id + status) as database unique constraints.

**Strengths:**
- No extra infrastructure
- Business-meaningful keys

**Weaknesses:**
- Different event types have different natural keys — no uniform strategy
- Some events have no natural unique key
- Does not provide a single audit table for "processed events"
- Does not handle idempotency at the event level — only at the record level

### Option B: Idempotency key in HTTP header (request-level)

**How it works:**
Caller provides `Idempotency-Key` header. Server stores response for N minutes and returns cached response on retry.

**Weaknesses:**
- Not applicable to Kafka-based event processing
- Requires external cache (Redis) for state storage

### Option C: Event ID in a `processed_events` table

**How it works:**
Every incoming event carries a stable `eventId`. Before processing, the service checks if `eventId` exists in `processed_events`. If yes: skip (idempotent success). If no: process and insert in the same transaction.

```sql
-- On every event:
INSERT INTO processed_events (event_id, processed_at, source_topic, source_partition, source_offset)
VALUES ($eventId, NOW(), $topic, $partition, $offset)
ON CONFLICT (event_id) DO NOTHING;

-- Check: if 0 rows inserted → already processed → skip
-- If 1 row inserted → process domain logic in same transaction
```

**Strengths:**
- Universal: works for any event type
- Single audit table: all processed events are queryable
- Atomic with domain write (same transaction — no race conditions)
- `eventId` preserved from raw event → canonical event → business event (full lineage)
- Replay safety: replaying any event range is safe

**Weaknesses:**
- `processed_events` table grows indefinitely (requires archival/cleanup)
- Additional write on every event processing (low cost — single INSERT)
- Requires `eventId` to be stable and globally unique across all events

---

## Decision

**Use event ID-based idempotency via `processed_events` table.**

**Requirements on `eventId`:**
- Set by the source system or ingress adapter at event creation
- Preserved through all Kafka hops (raw → canonical → business)
- Must be a UUID or equivalent globally unique identifier
- Immutable: never changes once assigned

**eventId propagation:**

```
Partner payload →
  Raw Kafka message: headers["x-event-id"] = "uuid-123"
    ↓
  Canonical Kafka message: headers["x-event-id"] = "uuid-123" (preserved)
    ↓
  Business service: INSERT INTO processed_events WHERE event_id = "uuid-123"
```

---

## Consequences

**Positive:**
- Safe at-least-once redelivery — any duplicate is silently skipped after first processing
- Complete audit: `processed_events` records every event with source offset, timestamp, topic
- Replay is always safe: replaying a Kafka partition range re-inserts already-processed IDs, which are safely skipped
- Debugging: "was event uuid-123 processed?" is a simple database query

**Negative:**
- `processed_events` table grows with every event — requires periodic archival (retain 30 days, archive older)
- `eventId` must be enforced at ingestion — missing or non-unique IDs break the guarantee
- Requires careful handling at ingress adapters to assign stable, unique IDs before events enter Kafka

**Archival policy:**
Retain `processed_events` for 30 days (configurable per tenant). Events older than 30 days are moved to archive storage. Re-replay of events older than 30 days requires manual intervention (idempotency guard is bypassed — operator confirms intent).

---

## eventId Contract

```typescript
interface EventEnvelope {
  eventId: string;       // UUID v4, stable, globally unique, immutable
  eventType: string;     // e.g., "order.created"
  tenantId: string;
  partnerId: string;
  schemaVersion: string;
  timestamp: string;     // ISO 8601
  payload: unknown;
}
```

Ingress adapters that do not receive an `eventId` from the partner system must generate one deterministically (e.g., hash of partner ID + partner's internal reference + event type) to ensure replay produces the same ID.
