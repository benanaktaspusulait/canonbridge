# Health Checks

## Purpose

Health checks tell Kubernetes, operators, and deployment automation whether a service should start, receive traffic, or be restarted.

## Endpoints

| Endpoint | Purpose | Should Check |
|----------|---------|--------------|
| `/health/live` | Process is alive | Event loop, fatal state |
| `/health/ready` | Service can process work | Kafka, database, caches, worker queue, shutdown state |
| `/health/startup` | Initial boot complete | Config loaded, schemas/mappings available |

## Readiness Rules

Return not ready when:

- Service is shutting down.
- Kafka consumer is disconnected.
- Producer cannot publish.
- Required database connection is unavailable.
- Worker queue is saturated.
- Required mapping/schema cache cannot load.

Do not fail readiness for optional observability dependencies unless they block processing.

## Response Shape

```json
{
  "status": "ready",
  "service": "transformer",
  "version": "1.0.0",
  "checks": {
    "kafkaConsumer": "ok",
    "kafkaProducer": "ok",
    "mappingCache": "ok",
    "workerPool": "ok"
  }
}
```

## Operational Notes

- Keep liveness lightweight to avoid restart loops.
- Keep readiness strict enough to prevent bad traffic.
- Include dependency latency in metrics, not only status.
- Log health state changes, not every successful probe.

## See Also

- [Graceful Shutdown](./06-graceful-shutdown.md)
- [Monitoring Dashboards](../operations/01-monitoring-dashboards.md)
- [Troubleshooting](../operations/03-troubleshooting.md)

