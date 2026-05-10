# Metrics and Observability

## Purpose

Observability answers three questions in production:
1. **Is it working?** — health checks, availability metrics
2. **Is it performing?** — latency, throughput, lag
3. **Why did it fail?** — traces, logs, error details

This document defines the observability strategy: metrics, tracing, logging, SLOs, dashboards, and alerting.

---

## SLO / SLI Definitions

Service Level Objectives define the reliability targets for each layer.

### Transformer Service

| SLI | Target | Measurement Window |
|---|---|---|
| Message transformation success rate | ≥ 99.9% | 7-day rolling |
| Transformation p99 latency | < 200ms | 24-hour rolling |
| DLQ rate | < 0.1% of consumed messages | 1-hour rolling |
| Consumer lag | < 1,000 messages | Real-time |
| Service availability (health/ready) | ≥ 99.9% | 30-day rolling |

### Business Consumer Service

| SLI | Target | Measurement Window |
|---|---|---|
| Processing success rate | ≥ 99.95% | 7-day rolling |
| End-to-end latency (consume → DB write) | < 500ms p99 | 24-hour rolling |
| Outbox publish lag | < 2s average | 1-hour rolling |
| Duplicate event rate | < 0.01% | 7-day rolling |

### Mapping Studio API

| SLI | Target | Measurement Window |
|---|---|---|
| API availability | ≥ 99.9% | 30-day rolling |
| API latency (p99) | < 300ms | 24-hour rolling |
| Mapping preview latency (p99) | < 1,000ms | 24-hour rolling |

**Error budget calculation:**
99.9% availability = 43.8 minutes downtime per month allowed.
When the error budget is < 25% remaining, feature work is paused and reliability work takes priority.

---

## Metrics

### Transformer Service

| Metric | Type | Labels | Description |
|---|---|---|---|
| `messages_consumed_total` | Counter | tenant, partner, event_type | Messages consumed from Kafka |
| `messages_transformed_total` | Counter | tenant, partner, event_type, mapping_version, status | Transformed messages (success/failure/dlq) |
| `transformation_duration_ms` | Histogram | partner, event_type, mapping_version | JSONata execution duration |
| `validation_fail_total` | Counter | partner, event_type, stage, error_code | Ajv validation failures per stage |
| `dlq_messages_total` | Counter | partner, event_type, error_code, mapping_version | Messages sent to DLQ |
| `retry_messages_total` | Counter | partner, event_type, retry_delay, attempt_count | Messages sent to retry topics |
| `consumer_lag` | Gauge | topic, partition, consumer_group | Kafka consumer lag |
| `worker_queue_depth` | Gauge | service | Worker pool queue depth |
| `worker_active_count` | Gauge | service | Active workers processing messages |
| `mapping_cache_hit_total` | Counter | tenant, partner, event_type | Mapping cache hits |
| `mapping_cache_miss_total` | Counter | tenant, partner, event_type | Cache misses (DB lookup required) |
| `offset_commit_duration_ms` | Histogram | topic, partition | Kafka offset commit latency |

### Business Consumer Service

| Metric | Type | Labels | Description |
|---|---|---|---|
| `events_processed_total` | Counter | tenant, event_type, status | Events processed (success/duplicate/error) |
| `duplicate_events_total` | Counter | tenant, event_type | Idempotency guard triggers |
| `db_write_duration_ms` | Histogram | tenant, event_type | Database transaction duration |
| `outbox_pending_count` | Gauge | tenant | Outbox records awaiting publish |
| `outbox_publish_lag_ms` | Histogram | tenant | Time from outbox insert to Kafka publish |
| `dependency_pending_count` | Gauge | tenant, event_type | Events waiting for dependencies |

### Mapping Studio API

| Metric | Type | Labels | Description |
|---|---|---|---|
| `api_request_total` | Counter | endpoint, method, status_code | API request count |
| `api_request_duration_ms` | Histogram | endpoint, method | API response time |
| `mapping_publish_total` | Counter | tenant, partner, event_type | Mapping versions published |
| `mapping_rollback_total` | Counter | tenant, partner, event_type | Mapping rollbacks |
| `mapping_preview_duration_ms` | Histogram | tenant | Preview execution latency |

### High-Cardinality Warning

`tenant`, `partner`, and `event_type` labels multiply metric series. With 100 tenants × 10 partners × 5 event types = 5,000 series per metric. Use recording rules to aggregate:

```yaml
# Prometheus recording rules
- record: job:messages_transformed:rate5m
  expr: sum by (job) (rate(messages_transformed_total[5m]))

- record: tenant:transformation_errors:rate5m
  expr: sum by (tenant) (rate(messages_transformed_total{status="error"}[5m]))
```

---

## Distributed Tracing

### Trace Propagation

Trace context propagated through all hops using W3C TraceContext standard (`traceparent`, `tracestate` headers).

```
HTTP request (Ingress)
  │  traceparent: 00-{traceId}-{spanId}-01
  ▼
Kafka raw.events message
  │  Header: traceparent = {original trace context}
  ▼
Transformer Service
  │  Creates child span for: consume, mapping-resolve, transform, validate, produce
  ▼
Kafka canonical.events message
  │  Header: traceparent = {trace context preserved}
  ▼
Business Consumer Service
  │  Creates child span for: consume, idempotency-check, db-write, outbox-insert
  ▼
Kafka business.events
```

### Correlation ID

In addition to W3C trace context, a `correlationId` is carried through:
- Set at ingestion (equals `eventId` if single event, or generated UUID for batch)
- Logged on every service log line
- Included in DLQ records for cross-system correlation
- Available in Mapping Studio for "trace this event" UX

### Span Naming Convention

```
transformer.kafka.consume
transformer.mapping.resolve
transformer.jsonata.execute
transformer.validation.input
transformer.validation.canonical
transformer.kafka.produce
transformer.kafka.commit

business.kafka.consume
business.idempotency.check
business.db.transaction
business.outbox.insert
business.kafka.publish
```

### Sampling Policy

| Environment | Sampling Rate | Strategy |
|---|---|---|
| Production (normal) | 1% of all transactions | Head-based probabilistic |
| Production (errors) | 100% of error transactions | Tail-based error sampling |
| Production (DLQ) | 100% of DLQ routes | Always sample |
| Production (high-value tenants) | 10% | Tenant-configurable |
| Staging | 100% | Always sample |
| Development | 100% | Always sample |

Tail-based sampling requires OpenTelemetry Collector with tail sampler processor.

---

## Log Schema

Structured logging in JSON format. Every log entry must include the mandatory fields.

### Mandatory Fields

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "service": "transformer",
  "version": "1.2.3",
  "environment": "production",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "correlationId": "evt-uuid-1234",
  "tenantId": "tenant-acme",
  "partnerId": "partner-xyz",
  "eventType": "order.created",
  "message": "Transformation completed",
  "durationMs": 45
}
```

### Optional Context Fields

```json
{
  "mappingVersion": "2.1.0",
  "mappingId": "uuid-...",
  "kafkaTopic": "raw.events",
  "kafkaPartition": 3,
  "kafkaOffset": 12345,
  "errorCode": "SCHEMA_VALIDATION_FAILED",
  "errorMessage": "Field 'orderId' is required",
  "retryAttempt": 2,
  "payloadSizeBytes": 1024
}
```

### What Is Never Logged

```json
{
  "payload": "NEVER — full payload never logged",
  "customerEmail": "NEVER — PII never logged",
  "creditCard": "NEVER — financial data never logged",
  "jwtToken": "NEVER — credentials never logged",
  "dbPassword": "NEVER — secrets never logged"
}
```

### Log Levels

| Level | Use |
|---|---|
| ERROR | Processing failed permanently — DLQ, unrecoverable errors |
| WARN | Retryable failure, degraded state, approaching limits |
| INFO | Normal processing milestones (consume, transform, produce, commit) |
| DEBUG | Diagnostic detail (cache hit/miss, worker assignment) — disabled in production |

---

## Dashboards

### Dashboard 1: System Overview

Purpose: At-a-glance platform health for on-call.

Panels:
- Message throughput (messages/sec) — all tenants
- DLQ rate (%) — alert threshold line
- Consumer lag — all partitions
- Transformation p99 latency
- Error budget burn rate (30-day SLO)
- Active transformer pods
- Kafka broker health

### Dashboard 2: Partner Health

Purpose: Per-partner integration health.

Panels:
- Messages consumed per partner (time series)
- DLQ rate per partner (sorted, highlight outliers)
- Transformation latency per partner (p50/p95/p99)
- Validation failure breakdown (by stage, by schema path)
- Active mapping versions per partner
- Last successful message timestamp per partner

### Dashboard 3: DLQ Analysis

Purpose: Investigate and resolve DLQ entries.

Panels:
- DLQ rate over time (with mapping publish events overlaid)
- Error code breakdown (pie chart)
- Top failing partners (by volume)
- Top failing event types
- DLQ entries by mapping version (detect bad publish)
- Time-to-resolve DLQ incidents (SLA tracking)

### Dashboard 4: Kafka Infrastructure

Purpose: Kafka cluster and consumer group health.

Panels:
- Consumer lag per topic/partition/consumer-group
- Produce rate vs consume rate
- Replication factor health
- Leader election events
- Message size distribution
- Topic retention usage

### Dashboard 5: Mapping Studio Activity

Purpose: Track mapping lifecycle events.

Panels:
- Mappings published per day (per tenant)
- Rollbacks per day (spike = incident)
- Time-in-review (draft → published duration)
- Mapping preview usage
- Active mapping versions per partner

### Dashboard 6: Business Service

Purpose: Business domain processing health.

Panels:
- Events processed per event type
- Duplicate event rate (idempotency guard)
- DB write latency (p99)
- Outbox publish lag
- Pending dependency count (growing = ordering problem)
- Transaction error rate

---

## Alerting

Detailed alert rules with runbook links are in [Alerting Strategy](../operations/02-alerting-strategy.md). Key thresholds:

| Alert | Severity | Threshold | Action |
|---|---|---|---|
| DLQ rate > 1% | P1 | 5-minute window | Immediate investigation |
| Consumer lag > 5,000 | P1 | Sustained 5 min | Scale or pause |
| Transformation p99 > 500ms | P2 | 10-minute window | Review mapping complexity |
| Worker queue depth > 500 | P2 | Sustained 3 min | Scale transformer pods |
| Error budget burn rate > 5x | P2 | 1-hour window | Reliability review |
| Mapping rollback event | P2 | Any occurrence | Confirm intentional |
| DLQ rate > 0.1% | P3 | 30-minute window | Investigate partner |
| Consumer lag > 1,000 | P3 | Sustained 10 min | Monitor trend |

---

## OpenTelemetry Collector Configuration

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: "0.0.0.0:4317"

processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100000
    policies:
      - name: errors-policy
        type: status_code
        status_code:
          status_codes: [ERROR]
      - name: probabilistic-policy
        type: probabilistic
        probabilistic:
          sampling_percentage: 1

  resource:
    attributes:
      - key: environment
        value: production
        action: upsert

exporters:
  jaeger:
    endpoint: "jaeger-collector:14250"
    tls:
      insecure: false
  prometheusremotewrite:
    endpoint: "https://prometheus:9090/api/v1/write"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [tail_sampling, resource]
      exporters: [jaeger]
```

---

## See Also

- [Monitoring Dashboards](../operations/01-monitoring-dashboards.md)
- [Alerting Strategy](../operations/02-alerting-strategy.md)
- [ADR-006: Worker Pool](../adr/ADR-006-worker-pool-cpu-isolation.md)
- [Logging and Masking](./08-logging-masking.md)
