# Operations Runbook

## Purpose

This runbook gives operators quick actions for common production issues.

## High DLQ Rate

1. Open DLQ dashboard.
2. Group errors by partner, event type, mapping version, and stage.
3. Check for recent mapping/schema publish.
4. If caused by new mapping, roll back mapping version.
5. If partner payload changed, create Mapping Studio fix draft from sample.
6. Replay only after fix is validated.

## Growing Consumer Lag

1. Check transformer pod health and restarts.
2. Check worker queue depth and CPU.
3. Check Kafka broker health.
4. Pause problematic partner if isolated.
5. Scale transformer pods if partitions allow.
6. Run load/performance review if recurring.

## Transformation Latency Spike

1. Identify affected partner/event.
2. Compare mapping version before and after spike.
3. Check payload size distribution.
4. Review JSONata complexity.
5. Enable or tune worker pool.
6. Consider mapping rollback if newly introduced.

## Business Service Write Failures

1. Check database health.
2. Check migration status.
3. Check idempotency table and locks.
4. Confirm outbox inserts are successful.
5. Pause consumers if database cannot recover quickly.

## Mapping Publish Incident

1. Identify published mapping version.
2. Review validation run and approver.
3. Activate previous known-good mapping version.
4. Preserve bad version for audit.
5. Import failed payloads as Mapping Studio samples.
6. Create fix draft and run validation.

## Emergency Contacts

| Area | Owner |
|------|-------|
| Kafka/runtime | SRE |
| Transformer | Backend team |
| Mapping Studio | Frontend/platform team |
| Business service | Domain team |
| Security/data leak | Security team |

## Self-Healing Reference

Most failures recover automatically. This table is for awareness — operator action is only needed for sustained failures.

| Component | Failure | Auto Recovery |
|---|---|---|
| Worker thread | Crash | Main thread detects, spawns replacement, in-flight task retried |
| Worker thread | Timeout | Task cancelled → retry topic or DLQ |
| Kafka consumer | Connection lost | Client reconnects (exponential backoff, max 30s) |
| Kafka consumer | Stall | Liveness probe → Kubernetes restarts pod |
| Kafka producer | Timeout | Circuit breaker opens → consumer pauses → readiness 503 |
| Circuit breaker | Open | Cooldown period → half-open → resumes consuming |
| DB pool | Exhaustion | Wait with timeout → circuit breaker → /health/ready 503 |
| Outbox publisher | Crash | Kubernetes restarts → pending records published in burst |
| Pending table | Excessive growth | Scheduled cleanup archives expired events to DLQ |

For full self-healing details: [Support and Diagnostics](./13-support-diagnostics.md#self-healing-mechanisms)

## See Also

- [Troubleshooting](./03-troubleshooting.md)
- [Rollback Procedure](../deployment/04-rollback-procedure.md)
- [Disaster Recovery](./06-disaster-recovery.md)
- [Failure Scenarios](./09-failure-scenarios.md)
- [Support and Diagnostics](./13-support-diagnostics.md)

