# Graceful Shutdown

## Purpose

Graceful shutdown prevents data loss and duplicate side effects when pods restart, deploy, or rebalance. The service should stop accepting new work, finish or safely abandon in-flight work, flush producers, and commit offsets only after successful processing.

## Shutdown Flow

```text
SIGTERM
  -> mark service not ready
  -> pause Kafka consumption
  -> stop accepting new HTTP work
  -> drain worker jobs within timeout
  -> flush Kafka producer
  -> commit safe offsets
  -> close database/cache clients
  -> exit
```

## Kubernetes Requirements

- Readiness should fail immediately after shutdown starts.
- `terminationGracePeriodSeconds` must exceed max drain time.
- Use `preStop` only for short readiness delay, not long business logic.
- Avoid killing pods before producer flush completes.

## Offset Rule

Commit an offset only after:

- Transformation succeeded and canonical event was produced, or
- Message was safely written to DLQ, or
- Business service transaction and outbox insert completed.

Never commit before the durable result exists.

## Timeouts

| Timeout | Recommendation |
|---------|----------------|
| Readiness fail delay | Immediate |
| Kafka pause | Immediate |
| Worker drain | 20-30 seconds |
| Producer flush | 5-10 seconds |
| Total shutdown | Under Kubernetes grace period |

## Verification

- Send SIGTERM during load test.
- Confirm no message loss.
- Confirm duplicates are idempotently handled.
- Confirm readiness flips before shutdown.
- Confirm logs include drain counts and final status.

## See Also

- [Health Checks](./07-health-checks.md)
- [Deployment Checklist](../deployment/01-deployment-checklist.md)
- [Rollback Procedure](../deployment/04-rollback-procedure.md)

