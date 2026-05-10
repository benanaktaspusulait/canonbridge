# Failure Scenarios

## Purpose

This document describes how CanonBridge behaves under each failure condition, what happens to in-flight data, and what operator action is required.

For quick recovery steps, see [Runbook](./08-runbook.md). For disaster recovery procedures, see [Disaster Recovery](./06-disaster-recovery.md).

---

## Failure Classification

| Class | Description | Data Impact | Self-Healing? |
|---|---|---|---|
| **Transient** | Brief unavailability — network blip, restart | None if retried | Yes |
| **Degraded** | Reduced throughput or elevated latency | None if resolved quickly | Partial |
| **Persistent** | Sustained failure requiring operator action | Consumer lag grows | No |
| **Catastrophic** | Data loss risk or multi-component failure | Potential data loss | No |

---

## Scenario 1: Kafka Broker Unavailable

**Trigger:** Kafka broker(s) unreachable — network partition, broker crash, rolling restart.

**System behavior:**
```
Transformer service:
  → Kafka consumer: connection lost
  → Consumer pauses — no messages consumed
  → In-flight messages: workers continue processing messages already in worker queue
  → Kafka produce attempts: fail with retriable error
  → Produce retries: 3 attempts with exponential backoff (1s, 5s, 30s)
  → After retry exhaustion: message routed to in-memory retry buffer (if Kafka fully unavailable)
  → Consumer lag: grows proportionally to outage duration

Business service:
  → Same behavior — consumption pauses, outbox publisher pauses
```

**Data impact:**
- No data loss — messages remain in Kafka log (durable storage)
- Consumer lag grows during outage
- Outbox records accumulate as PENDING — published in burst when Kafka recovers

**Recovery:**
1. Monitor `kafka_broker_available` metric — alert fires automatically
2. If broker restart: consumers reconnect automatically (Kafka client retry)
3. If partition rebalance needed: verify consumer group health after recovery
4. After recovery: consumer lag drains automatically — no operator action for normal outage < 15 minutes
5. For outages > 15 minutes: monitor lag drain rate; scale transformer pods if lag does not drain within 30 minutes

**Alert:** P1 if broker unavailable for > 2 minutes.

---

## Scenario 2: PostgreSQL Database Unavailable

**Trigger:** Database connection failure — network issue, DB crash, failover in progress.

**System behavior:**
```
Business service:
  → Kafka consumption continues
  → DB write fails with connection error
  → Transaction rolled back — processed_events NOT inserted
  → No offset commit (message not marked as processed)
  → Message redelivered by Kafka on consumer restart
  → Consumer pauses if DB errors exceed threshold

Outbox publisher:
  → Poll fails immediately
  → Backs off with retry interval
  → Resumes automatically when DB recovers
```

**Data impact:**
- No data loss — messages remain in Kafka; no offset committed on failure
- Duplicate processing risk after recovery (handled by idempotency)
- Consumer lag grows if pause is long

**Recovery:**
1. Database failover (if HA configured): automatic, typically < 30s
2. Consumer reconnects automatically after DB recovers
3. In-flight events redelivered and processed with idempotency guard — no duplicates
4. Outbox backlog drains automatically

**Alert:** P1 if DB unavailable for > 1 minute.

---

## Scenario 3: Transformer Service Crash / OOM

**Trigger:** Transformer pod crashes — OOM kill, unhandled exception, liveness probe failure.

**System behavior:**
```
Kubernetes:
  → Pod marked unhealthy
  → Kafka consumer group: partition rebalance triggered
  → Rebalance duration: typically 10-30 seconds

Uncommitted messages:
  → Any messages consumed but not yet offset-committed are redelivered
  → In-flight transformations (in worker queue): lost — redelivered by Kafka
  → Committed messages: safe — already produced to canonical topic
```

**Data impact:**
- No data loss — uncommitted messages are redelivered
- Possible duplicate canonical events for messages that were produced but not committed before crash
- Duplicate handling: idempotency in business service prevents double-processing

**Recovery:**
1. Kubernetes restarts pod automatically (restartPolicy: Always)
2. New pod joins consumer group and receives partition assignment
3. Redelivered messages processed normally
4. Monitor for recurring OOM: investigate payload size distribution and worker memory usage

**Alert:** P2 for pod restart. P1 for repeated restarts (> 3 in 10 minutes).

---

## Scenario 4: JSONata Infinite Loop / Timeout

**Trigger:** A published mapping contains a JSONata expression with exponential or infinite complexity.

**System behavior:**
```
Worker thread:
  → Execution starts for event
  → JSONata expression runs beyond timeout (500ms)
  → Worker thread receives SIGALRM
  → Execution terminated forcefully
  → Error: TRANSFORM_TIMEOUT

Transformer:
  → Message classified as permanent failure
  → Message routed to DLQ with error code TRANSFORM_TIMEOUT
  → Offset committed
  → Processing continues for next messages (poison pill isolated)

DLQ record:
  → Includes: event envelope, error details, mapping version, timeout value
```

**Data impact:**
- Affected events go to DLQ — no data loss
- Other partners/event types are unaffected (per-worker isolation)
- Mapping must be fixed and events replayed from DLQ

**Recovery:**
1. Alert fires: DLQ spike for specific partner/event type
2. Identify mapping version from DLQ records
3. Roll back mapping to previous version (< 30 seconds)
4. Analyze JSONata expression — identify complexity source
5. Fix mapping, validate with dry-run, get review, publish corrected version
6. Replay DLQ events with corrected mapping

---

## Scenario 5: Poison Pill — Malformed Partner Payload

**Trigger:** Partner sends a payload that cannot be parsed as JSON, or has structural corruption.

**System behavior:**
```
Transformer:
  → JSON.parse() fails
  → Error classified as ENVELOPE_PARSE_ERROR
  → Message routed to DLQ immediately (no transformation attempted)
  → Offset committed
  → Alert counter incremented

OR:
  → JSON valid but envelope validation fails (missing required fields)
  → Error: ENVELOPE_VALIDATION_FAILED
  → DLQ route
  → Offset committed
```

**Data impact:**
- Affected message in DLQ — no processing
- Partition processing continues immediately (no blocking)
- Other messages from same partner not affected

**Recovery:**
1. Inspect DLQ record — examine original payload
2. Notify partner of payload contract violation
3. Partner fixes payload format
4. If partner cannot fix: create input schema exception rule in Mapping Studio
5. Optionally replay if partner resends corrected events

**Note:** Poison pills are isolated. One malformed message cannot block the entire partition.

---

## Scenario 6: Consumer Lag Explosion

**Trigger:** Message volume spike exceeds processing capacity (e.g., partner sends backlog, batch job runs).

**System behavior:**
```
Kafka:
  → Messages accumulate in topic faster than consumed
  → consumer_lag metric grows

Transformer:
  → Processing continues at max throughput
  → Backpressure: worker queue fills up
  → worker_queue_depth metric grows
  → New messages wait in queue (no dropping)
```

**Data impact:**
- No data loss — messages retained in Kafka log
- Processing latency increases for new messages
- SLO: consumer lag < 1,000 messages may be breached

**Recovery:**
1. Monitor `consumer_lag` and `worker_queue_depth`
2. If HPA is configured: automatic scale-out (requires KEDA or custom Prometheus adapter)
3. Manual scale: `kubectl scale deployment transformer --replicas=8`
4. After scaling: verify partitions are sufficient (partitions ≥ replicas for parallel processing)
5. If sustained: review Kafka partition count — increase partitions + increase replicas

---

## Scenario 7: Schema Validation Failure Spike

**Trigger:** Partner changes their payload format without notice, breaking input schema validation.

**System behavior:**
```
Transformer:
  → Input schema validation fails (if input schema validation is enabled)
  → Error: INPUT_SCHEMA_VIOLATION
  → DLQ route for affected events
  → Counter: validation_fail_total{stage="input"} spikes

OR (if input validation is disabled):
  → JSONata transformation runs on changed payload
  → Output may fail canonical schema validation
  → Error: CANONICAL_SCHEMA_VIOLATION
  → DLQ route
```

**Data impact:**
- Affected events in DLQ — no loss
- Partner integration effectively paused for new format

**Recovery:**
1. Inspect DLQ — examine payload diff vs previous format
2. Contact partner — confirm format change was intentional vs bug
3. If intentional: author new mapping version in Mapping Studio
   - Upload new sample payload
   - Update mapping to handle new format
   - Validate with dry-run
   - Publish and activate
4. Replay DLQ events with corrected mapping

---

## Scenario 8: Duplicate Event Storm

**Trigger:** Consumer group rebalance, service restart, or upstream replay causes large volume of duplicate events.

**System behavior:**
```
Business service:
  → Receives duplicate canonical events
  → For each event: INSERT INTO processed_events ... ON CONFLICT DO NOTHING
  → If 0 rows inserted: event already processed — skip immediately
  → No domain write attempted
  → Offset committed

Performance impact:
  → Each duplicate: 1 DB read + 1 no-op INSERT
  → Significantly faster than full processing
  → System remains healthy under moderate duplicate storm
```

**Data impact:**
- No duplicate records
- Outbox events: not re-published (no duplicate business events downstream)
- Minor increase in DB read load

**Recovery:**
- Typically self-healing — duplicates processed and skipped automatically
- If duplicate volume is extreme (millions): monitor DB connection pool utilization
- Alert if duplicate rate > 1% sustained for > 5 minutes — indicates upstream replay issue

---

## Scenario 9: Mapping Rollback — Active Version Produces Errors

**Trigger:** A newly published mapping version produces unexpected DLQ entries after activation.

**System behavior:**
```
DLQ rate spikes after mapping activation.
Mapping version identifier visible in DLQ records: x-mapping-version header.
```

**Recovery (SLA: < 5 minutes from detection to rollback):**

1. Open Mapping Studio → Mapping versions for affected partner/event type
2. Confirm DLQ records reference the newly activated version
3. Click "Rollback to previous version" → confirm
4. API updates `active_mapping_versions` immediately
5. Mapping cache invalidated
6. Next Kafka message uses previous version
7. DLQ rate should drop within 1–2 minutes

**After rollback:**
1. Preserve new (bad) version — do not delete (audit requirement)
2. Import DLQ samples into Mapping Studio as test cases
3. Debug mapping expression against failing samples
4. Create corrected version, validate, review, publish, activate

---

## Scenario 10: Outbox Publisher Stall

**Trigger:** Outbox publisher process stops polling (crash, Kafka connectivity issue, DB lock).

**System behavior:**
```
Business service:
  → Continues processing events
  → Domain writes succeed
  → Outbox records accumulate as PENDING
  → Downstream consumers: no new events

outbox_pending_count metric grows.
Downstream consumers: processing stops.
```

**Data impact:**
- No data loss — outbox records are durable in PostgreSQL
- Downstream consumers are starved (no new events)
- Business data is being written correctly

**Recovery:**
1. Check outbox publisher pod health: `kubectl get pods -l app=outbox-publisher`
2. If crashed: restart pod — accumulation publishes in burst
3. If Kafka issue: resolve Kafka connectivity, outbox resumes
4. If DB lock: check for long-running transactions; kill blocking query if safe
5. Monitor `outbox_pending_count` — should drain to 0 after recovery

---

## Scenario 11: Exactly-Once vs At-Least-Once

**Clarification:** CanonBridge provides **at-least-once** delivery with **idempotent processing**.

This means:
- Every event is guaranteed to be processed **at least once**
- Duplicate deliveries are handled by the idempotency guard
- The effective behavior from the business perspective is **effectively-once**

**True exactly-once** (Kafka transactions end-to-end) is not implemented. The tradeoffs:
- Kafka transactions require all producers and consumers in the chain to participate
- Adds significant complexity and latency
- Idempotency approach achieves the same outcome at lower complexity cost

---

## Failure Mode Summary

| Failure | Data Loss? | Auto-Recover? | Operator Action |
|---|---|---|---|
| Kafka broker down | No | Yes (client retry) | Monitor lag drain |
| PostgreSQL down | No | Yes (client retry) | Monitor outbox drain |
| Transformer crash | No | Yes (K8s restart) | Monitor for repeat crashes |
| JSONata timeout | DLQ (no loss) | Yes (isolated) | Fix mapping, replay DLQ |
| Poison pill payload | DLQ (no loss) | Yes (isolated) | Notify partner |
| Consumer lag explosion | No | Partial (HPA) | Scale if HPA insufficient |
| Schema validation failure | DLQ (no loss) | No | Update mapping |
| Duplicate event storm | No | Yes (idempotency) | Monitor DB load |
| Bad mapping version | DLQ (no loss) | No | Rollback mapping |
| Outbox publisher stall | No | Partial | Restart publisher |

---

## See Also

- [Runbook](./08-runbook.md) — Quick actions for each scenario
- [Disaster Recovery](./06-disaster-recovery.md) — Full DR procedures
- [Alerting Strategy](./02-alerting-strategy.md) — Alert thresholds and escalation
- [ADR-004: Manual Offset Commit](../adr/ADR-004-manual-kafka-offset-commit.md)
- [ADR-005: Outbox Pattern](../adr/ADR-005-outbox-pattern.md)
- [ADR-008: Idempotency](../adr/ADR-008-event-id-idempotency.md)
- [Sequence Diagrams](../architecture/11-sequence-diagrams.md)
