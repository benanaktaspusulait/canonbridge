# ADR-004: Manual Kafka Offset Commit Strategy

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

Kafka consumers can commit offsets automatically (at a configurable interval) or manually (after processing is complete). The choice directly determines the data loss vs. reprocessing tradeoff.

CanonBridge processes partner events through a transformation pipeline. Lost events mean lost business data. Silent data loss is unacceptable.

---

## Options Considered

### Option A: Automatic Offset Commit (`enable.auto.commit=true`)

**How it works:**
Kafka client commits offsets on a timer (default: every 5 seconds), regardless of whether the message was processed successfully.

**Failure scenario:**
```
1. Message consumed
2. Auto-commit fires → offset advanced
3. Transformation fails
4. Message is gone — not redelivered
```

**Strengths:**
- Simple — no explicit commit calls in code
- Higher throughput (no synchronous commit per message)

**Weaknesses:**
- Data loss risk: if processing fails after auto-commit, message is skipped
- No control over commit point
- At-most-once semantics in failure scenarios

### Option B: Manual Offset Commit (after successful produce or DLQ)

**How it works:**
Offset is committed only after the message has been either:
- Successfully produced to the canonical topic, OR
- Written to the DLQ topic

**Processing sequence:**
```
1. Consume message
2. Transform
3. Validate
4. Produce to canonical topic OR DLQ
5. Commit offset
```

**Strengths:**
- At-least-once delivery guaranteed
- No silent data loss — every message reaches either canonical topic or DLQ
- Processing failures result in redelivery, not data loss

**Weaknesses:**
- Offset commit is a synchronous operation per batch — adds latency
- More complex code: explicit commit call with error handling
- Potential for duplicate processing if service crashes between produce and commit (handled by idempotency — see ADR-008)

---

## Decision

**Use manual offset commit.**

Data loss is more damaging than duplicate delivery. Duplicates are handled by idempotent processing (ADR-008). Silent data loss has no recovery path.

**The rule is absolute:**

```
✅ consume → transform → validate → produce canonical/DLQ → commit offset
❌ consume → commit offset → process  (NEVER)
```

---

## Consequences

**Positive:**
- Every message reaches a defined outcome (canonical topic or DLQ)
- No silent data loss under any failure scenario
- Audit trail is complete — every raw event has a corresponding transformed event or DLQ record

**Negative:**
- Synchronous commit adds ~1–5ms per batch
- If service crashes between produce and commit, message is redelivered and processed twice — must be handled by idempotency layer
- Offset commit errors must be handled explicitly (retry, alert, shutdown)

**Mitigations:**
- Commit errors → log, metric increment, alert, graceful shutdown (do not silently ignore)
- Duplicate redelivery → handled by idempotency table in business service (ADR-008)
- Batch commit (commit once per N messages) acceptable for high-throughput scenarios where latency is not critical

---

## Operational Note

Monitor `consumer_group_lag` metric. If lag grows consistently, the commit rate may need tuning. But never trade lag reduction for data loss risk by switching to auto-commit.
