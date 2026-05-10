# Risk Mitigation

## Main Risks and Mitigations

| Risk | Priority | Mitigation |
|---|---:|---|
| JSONata becomes business logic | High | Keep business rules in business service |
| Mapping version mismatch | High | Immutable versioned mappings |
| Invalid canonical output | High | Mandatory Ajv validation |
| Worker pool breaks ordering | High | Ordered mode per event type |
| Message lost from early commit | High | Commit only after output/DLQ |
| Duplicate processing | High | processed_events table |
| DB updated but event not published | High | Outbox pattern |
| OrderLine arrives before Order | High | Pending table |
| Retry storm | Medium | Retry topics with backoff and max retries |
| DLQ becomes graveyard | Medium | DLQ dashboard, alerts, replay process |
| Consumer lag grows unnoticed | Medium | Consumer lag alerts and dashboards |
| PII leakage in logs | Medium | Masking and no full payload logging |
| Config cache inconsistency | Medium | Versioned deployment and smoke tests |
| Slow JSONata mapping | Medium | Metrics and optional code-based mapper |
| Pod killed during processing | Medium | Graceful shutdown |
| Pod receives traffic before ready | Medium | Readiness/startup probes |
| Worker timeout | Low/Medium | Timeout implementation |
| Pending event duplicate | Low/Medium | Pending + processed_events interaction |
| Outbox duplicate publish | Low/Medium | Idempotent downstream |
| Worker memory pressure | Low/Medium | Payload limit + worker heap limit |
| Huge payload transformation | Low/Medium | Bulk pipeline or streaming parse |

## Mitigation Strategies

### 1. JSONata Becomes Business Logic

**Risk**: Complex business rules end up in JSONata mappings.

**Mitigation**:
- Keep JSONata for transformation only
- Move business rules to business service
- Code review mappings for business logic
- Document what belongs in JSONata vs business service

### 2. Mapping Version Mismatch

**Risk**: Wrong mapping version applied to message.

**Mitigation**:
- Immutable versioned mappings
- Explicit version in message envelope
- Fail explicitly if version not found
- Never silently fall back to older version

### 3. Invalid Canonical Output

**Risk**: Invalid data reaches business service.

**Mitigation**:
- Mandatory Ajv validation
- Strict canonical schema
- Reject invalid data to DLQ
- Monitor validation error rate

### 4. Worker Pool Breaks Ordering

**Risk**: Messages from same partition processed out of order.

**Mitigation**:
- Ordered mode for state-dependent events
- Offset tracking per partition
- Sequential processing within partition
- Parallel mode only for independent events

### 5. Message Lost from Early Commit

**Risk**: Offset committed before processing completes.

**Mitigation**:
- Manual offset commit
- Commit only after output/DLQ
- Never commit before processing
- Test graceful shutdown

### 6. Duplicate Processing

**Risk**: Same event processed multiple times.

**Mitigation**:
- processed_events table
- eventId as idempotency key
- Check before processing
- Idempotent success on duplicate

### 7. DB Updated but Event Not Published

**Risk**: DB changed but Kafka event missing.

**Mitigation**:
- Outbox pattern
- Transactional insert
- Separate publisher
- At-least-once delivery

### 8. OrderLine Arrives Before Order

**Risk**: Child event processed before parent.

**Mitigation**:
- Pending table for missing parents
- Cleanup job for expired pending
- Retry or DLQ if parent never arrives
- Aggregate events if possible

### 9. Retry Storm

**Risk**: Repeated failures cause retry flood.

**Mitigation**:
- Retry topics with backoff
- Max retry count
- Circuit breaker
- DLQ after max retries

### 10. DLQ Becomes Graveyard

**Risk**: DLQ messages never investigated or replayed.

**Mitigation**:
- DLQ dashboard
- DLQ rate alerts
- Controlled redrive process
- Regular DLQ review

## Production Readiness Checklist

### Architecture ✅
- [x] Clear separation of concerns
- [x] Idempotency strategy defined
- [x] Outbox pattern documented
- [x] Pending dependency handling
- [x] Error classification strategy
- [x] Retry and DLQ strategy
- [x] Graceful shutdown procedure
- [x] Health check strategy

### Implementation ✅
- [x] Testing strategy at all levels
- [x] Code organization structure
- [x] Configuration management
- [x] Logging and masking strategy
- [x] Metrics and observability
- [x] Security considerations
- [x] Performance optimization

### Operations ✅
- [x] Deployment procedures
- [x] Rollback procedures
- [x] Monitoring dashboards
- [x] Alerting strategy
- [x] Troubleshooting guides
- [x] Scaling procedures
- [x] Disaster recovery
- [x] Maintenance procedures

### Compliance ✅
- [x] PII handling and masking
- [x] Data retention policies
- [x] Audit logging
- [x] Security controls
- [x] Schema evolution rules

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

## Implementation Phases

### Phase 1: MVP (Weeks 1-4)
- Kafka consumer/producer
- JSONata transformation
- Ajv validation
- DLQ and retry topics
- Graceful shutdown
- Health checks
- Structured logging

### Phase 2: Production Hardening (Weeks 5-8)
- Worker pool
- Circuit breaker
- Partner rate limiting
- Pending dependency table
- Outbox pattern
- Comprehensive monitoring
- Chaos testing

### Phase 3: Operational Excellence (Weeks 9-12)
- Schema registry
- Canary deployment
- Advanced observability
- Automated remediation
- Self-healing capabilities

---

## Full Reliability Flow

Every message passes through the following pipeline. Each stage has explicit failure handling.

```
Incoming Kafka message
        │
        ▼
┌───────────────────────────────┐
│  Poison pill wrapper          │ ← try/catch around entire pipeline
│  Any unhandled exception →    │   captured here, never crashes consumer
│  DLQ route                    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  JSON parse + envelope        │
│  validation                   │ ← fail → DLQ (ENVELOPE_PARSE_ERROR)
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  Partner + mapping            │
│  resolution                   │ ← fail → DLQ (MAPPING_NOT_FOUND)
│  (cache or DB lookup)         │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  Input schema validation      │
│  (optional, Ajv)              │ ← fail → DLQ (INPUT_SCHEMA_VIOLATION)
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  JSONata transformation       │
│  (worker pool, timeout guard) │ ← timeout → retry → DLQ (TRANSFORM_TIMEOUT)
│                               │   error → DLQ (TRANSFORM_ERROR)
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  Canonical schema validation  │
│  (mandatory, Ajv)             │ ← fail → DLQ (CANONICAL_SCHEMA_VIOLATION)
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  Kafka produce                │
│  (canonical topic)            │ ── temporary failure ──► retry.1m
│                               │                           → retry.5m
│                               │                           → retry.30m
│                               │                           → DLQ (EXHAUSTED)
│                               │ ── permanent failure ───► DLQ (PRODUCE_ERROR)
│                               │ ── circuit breaker ─────► pause consumer
└───────────────┬───────────────┘
                │ (success)
                ▼
        Commit offset
        (only here, never earlier)

─────────────────────────────────────────────────────────────────

Business Consumer Service:

Incoming canonical event
        │
        ▼
┌───────────────────────────────┐
│  Idempotency check            │
│  processed_events lookup      │ ── already processed ──► skip (idempotent success)
└───────────────┬───────────────┘
                │ (new event)
                ▼
┌───────────────────────────────┐
│  Parent-child dependency      │
│  check                        │ ── parent missing ──► pending table
│                               │                       (retry when parent arrives)
└───────────────┬───────────────┘
                │ (parent present)
                ▼
┌───────────────────────────────┐
│  DB transaction               │
│  ├─ domain table write        │ ── fail → rollback → redelivery
│  ├─ processed_events insert   │   (manual offset commit protects)
│  └─ outbox_events insert      │
└───────────────┬───────────────┘
                │ (COMMIT)
                ▼
        Commit Kafka offset

─────────────────────────────────────────────────────────────────

Outbox Publisher:

        Poll outbox_events WHERE status = PENDING
                │
                ▼
        Produce to business.events
                │
                ▼
        UPDATE outbox_events SET status = PUBLISHED
        (if this fails: record stays PENDING, re-published next poll → idempotency downstream)
```

## Next Steps

1. Review [Implementation](../implementation/)
2. Study [Testing](../testing/)
3. Plan [Deployment](../deployment/)
4. Review [Failure Scenarios](../operations/09-failure-scenarios.md) for per-failure operator guidance

---

**See Also**:
- [Core Principles](./02-core-principles.md)
- [Overview](./01-overview.md)
- [Sequence Diagrams](./11-sequence-diagrams.md)
- [ADR-004: Manual Offset Commit](../adr/ADR-004-manual-kafka-offset-commit.md)
- [ADR-005: Outbox Pattern](../adr/ADR-005-outbox-pattern.md)
- [ADR-008: Idempotency](../adr/ADR-008-event-id-idempotency.md)
