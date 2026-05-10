# Metrics and Observability

## Purpose

Observability should make partner integration health visible: throughput, latency, failures, lag, retries, DLQ rate, mapping versions, and validation errors.

## Core Metrics

| Metric | Type | Labels |
|--------|------|--------|
| `messages_consumed_total` | Counter | tenant, partner, eventType |
| `messages_transformed_total` | Counter | tenant, partner, eventType, mappingVersion |
| `transformation_duration_ms` | Histogram | partner, eventType |
| `validation_fail_total` | Counter | partner, eventType, stage, schemaPath |
| `dlq_messages_total` | Counter | partner, eventType, errorCode |
| `retry_messages_total` | Counter | partner, eventType, retryDelay |
| `consumer_lag` | Gauge | topic, partition, consumerGroup |
| `worker_queue_depth` | Gauge | service |

## Tracing

Propagate trace/correlation IDs through:

```text
ingress -> raw Kafka message -> transformer -> canonical Kafka message -> business service -> outbox event
```

Trace spans should cover:

- Kafka consume.
- Mapping/schema resolution.
- JSONata execution.
- Input and canonical validation.
- Kafka produce.
- Database transaction.

## Dashboards

Minimum dashboards:

- System overview.
- Partner health.
- DLQ and validation failures.
- Kafka lag.
- Worker pool.
- Mapping Studio validation and publish activity.

## Alerts

- DLQ rate above threshold.
- Consumer lag growing.
- Transformation p99 above target.
- Worker queue saturation.
- Validation failures spike for one partner.
- Published mapping version causes new errors.

## See Also

- [Monitoring Dashboards](../operations/01-monitoring-dashboards.md)
- [Alerting Strategy](../operations/02-alerting-strategy.md)
- [Mapping Studio Validation](../product/04-mapping-studio-validation-testing.md)

