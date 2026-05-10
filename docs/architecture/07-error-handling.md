# Error Handling

## Error Classification

Not all errors should be handled the same way.

### Error Classification Table

| Error Type | Example | Action |
|---|---|---|
| Invalid JSON | malformed JSON | DLQ |
| Unknown partner | no config found | DLQ |
| Unknown mapping version | v3 not found | DLQ |
| JSONata evaluation error | mapping cannot evaluate | DLQ |
| Canonical validation failed | missing required field | DLQ |
| Kafka produce timeout | temporary infra issue | Retry |
| DB unavailable | temporary infra issue | Retry |
| Worker timeout | maybe temporary | Retry then DLQ |
| Parent missing | order not found for line | Pending |
| Duplicate event | eventId already processed | Idempotent success |

## DLQ (Dead Letter Queue)

### Purpose

DLQ is for non-recoverable errors that require investigation.

### DLQ Message Format

A DLQ message should include enough context to debug and replay.

```json
{
  \"originalTopic\": \"partner.raw.events\",
  \"originalPartition\": 2,
  \"originalOffset\": \"15422\",
  \"partnerId\": \"companyA\",
  \"eventType\": \"OrderLineCreated\",
  \"schemaVersion\": \"v1\",
  \"mappingVersion\": \"v1.2.0\",
  \"errorType\": \"CANONICAL_VALIDATION_FAILED\",
  \"errorCode\": \"VAL_001\",
  \"stage\": \"CANONICAL_VALIDATION\",
  \"errorMessage\": \"Required field missing\",
  \"errorPath\": \"/payload/orderId\",
  \"correlationId\": \"corr-456\",
  \"eventId\": \"evt-123\",
  \"failedAt\": \"2026-05-10T10:15:00Z\"
}
```

### Payload Handling

Do not log/store full sensitive payload by default.

Options:

```text
store masked payload
store encrypted payload
store reference to secure object storage
store no payload, only metadata
```

### DLQ Retention Policy

Example:

```json
{
  \"dlqRetention\": {
    \"metadataRetentionDays\": 90,
    \"encryptedPayloadRetentionDays\": 14,
    \"autoDeletePayloadAfterDays\": 14
  }
}
```

## Retry Topics

Use delayed retry topics.

### Retry Topic Names

```text
transformation.retry.1m
transformation.retry.5m
transformation.retry.30m
```

### Retry Metadata

Add retry metadata:

```json
{
  \"retryCount\": 2,
  \"firstFailedAt\": \"2026-05-10T10:15:00Z\",
  \"lastFailedAt\": \"2026-05-10T10:20:00Z\",
  \"lastErrorType\": \"KAFKA_PRODUCE_TIMEOUT\"
}
```

### Retry Rule

```text
temporary error
↓
retry topic
↓
retry count increased
↓
max retry exceeded
↓
DLQ
```

## Poison Pill Protection

A poison pill is a message that repeatedly crashes or blocks the consumer.

### Risk

```text
bad JSON
unexpected payload shape
JSON.parse crash
JSONata evaluation crash
Ajv crash due to unexpected input
application bug triggered by one payload
```

### Required Rule

All message processing must be wrapped in defensive error handling.

Processing boundary:

```text
try:
  parse envelope
  validate envelope
  resolve config
  run input validation
  transform
  validate canonical
  produce output
catch:
  classify error
  produce DLQ or retry
  never crash main process for a single message
```

### Important Rule

```text
A single bad message must not crash the consumer loop.
```

## DLQ Redrive Mechanism

DLQ is not useful unless there is a controlled way to reprocess messages.

### Redrive Use Cases

```text
mapping bug fixed
schema fixed
partner payload corrected
temporary dependency recovered
manual investigation approved replay
```

### Required Redrive Flow

```text
1. Identify DLQ message or DLQ batch
2. Investigate root cause
3. Fix mapping/schema/config/data
4. Run dry-run transform
5. Approve redrive
6. Redrive with explicit mapping version
7. Monitor canonical output and DLQ rate
```

### Important Rule

```text
DLQ replay requires human or controlled workflow approval.
```

### Redrive Metadata

Redriven messages should include:

```json
{
  \"isRedrive\": true,
  \"redriveId\": \"redrive-2026-05-10-001\",
  \"originalDlqTopic\": \"transformation.dlq\",
  \"originalErrorType\": \"CANONICAL_VALIDATION_FAILED\",
  \"approvedBy\": \"operator-id\",
  \"redrivenAt\": \"2026-05-10T12:00:00Z\",
  \"mappingVersion\": \"v1.2.1\"
}
```

## Backpressure

Backpressure is required because worker pool and downstream systems can become overloaded.

### Risks

```text
worker queue grows without limit
memory usage increases
consumer fetches too many messages
Kafka lag grows
retry storm happens
```

### Controls

```text
max in-flight messages
bounded worker queue
pause/resume Kafka consumer
consumer lag monitoring
worker queue depth metric
HPA scaling
rate limits per partner/event type
```

---

## Next Steps

1. Review [Ordering and Dependencies](./08-ordering-dependencies.md)
2. Study [Outbox Pattern](./09-outbox-pattern.md)
3. Understand [Risk Mitigation](./10-risk-mitigation.md)

---

**See Also**:
- [Business Layer](./06-business-layer.md)
- [Core Principles](./02-core-principles.md)
