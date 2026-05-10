# Chaos Tests

## Purpose

Chaos tests validate behavior under dependency failures, restarts, slow services, and partial outages.

## Scenarios

- Kill transformer pod during active processing.
- Kill worker thread during transformation.
- Pause Kafka broker.
- Slow PostgreSQL writes.
- Break schema registry or mapping storage.
- Force producer publish failures.
- Fill worker queue.
- Inject invalid mapping version.

## Expected Behavior

- No committed offset before durable output.
- Temporary failures retry.
- Non-retryable failures go to DLQ.
- Readiness fails during unhealthy state.
- Service recovers without manual data repair.
- Alerts fire with actionable context.

## See Also

- [Graceful Shutdown](../implementation/06-graceful-shutdown.md)
- [Alerting Strategy](../operations/02-alerting-strategy.md)

