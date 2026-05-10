# Support and Diagnostics

## Purpose

Enable rapid diagnosis and resolution of production issues — both by the on-call operator and by remote support. This document defines health check endpoints, the support bundle script, remote log shipping, and diagnostic procedures.

---

## Health Check Endpoints

### Basic Health

```
GET /health/live
```

Returns 200 if the process is alive. Used by Kubernetes liveness probe.

```json
{ "status": "alive" }
```

**Liveness probe fails when:** process is deadlocked, OOM killed, or caught in infinite loop. Kubernetes restarts the pod.

---

```
GET /health/ready
```

Returns 200 if the service is ready to process traffic. Returns 503 if any critical dependency is unavailable. Used by Kubernetes readiness probe.

**Readiness probe fails when:** Kafka connection lost, mapping cache not warmed, circuit breaker open. Kubernetes stops routing traffic to the pod.

---

### Detailed Health (Operator Use)

```
GET /health/ready?detail=true
```

Returns component-level status for diagnosis.

**Example response — healthy:**

```json
{
  "status": "ready",
  "timestamp": "2026-05-10T14:30:00.123Z",
  "version": "1.3.0",
  "uptime": 86400,
  "components": {
    "kafkaConsumer": {
      "status": "connected",
      "brokers": ["kafka-0:9092", "kafka-1:9092", "kafka-2:9092"],
      "consumerGroup": "transformer-prod",
      "assignedPartitions": [0, 1, 2, 3]
    },
    "kafkaProducer": {
      "status": "connected",
      "circuitBreaker": "closed"
    },
    "mappingCache": {
      "status": "loaded",
      "mappingCount": 15,
      "lastReloadAt": "2026-05-10T14:00:00Z"
    },
    "schemaCache": {
      "status": "loaded",
      "schemaCount": 8,
      "lastReloadAt": "2026-05-10T14:00:00Z"
    },
    "workerPool": {
      "status": "healthy",
      "totalWorkers": 4,
      "activeWorkers": 2,
      "queueDepth": 20,
      "queueCapacity": 100
    },
    "circuitBreaker": {
      "status": "closed",
      "failureCount": 0,
      "lastStateChange": "2026-05-09T08:00:00Z"
    }
  }
}
```

**Example response — degraded:**

```json
{
  "status": "not_ready",
  "timestamp": "2026-05-10T14:31:00.123Z",
  "components": {
    "kafkaProducer": {
      "status": "circuit_breaker_open",
      "circuitBreaker": "open",
      "failureCount": 5,
      "cooldownRemainingMs": 25000
    },
    "workerPool": {
      "status": "saturated",
      "queueDepth": 98,
      "queueCapacity": 100
    }
  }
}
```

---

## Admin Endpoints

### Cache Reload

```
POST /admin/cache/reload
Authorization: Bearer <admin-token>
```

Forces mapping and schema cache to reload from the database. Use after:
- New mapping version activated in Mapping Studio
- Schema updated
- Manual debugging

```json
{ "status": "reloaded", "mappings": 16, "schemas": 9 }
```

### Configuration Reload

```
POST /admin/config/reload
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "WORKER_COUNT": 6,
  "WORKER_TASK_TIMEOUT_MS": 750,
  "PARTNER_MAX_IN_FLIGHT": 50
}
```

Changes runtime configuration without restart. See [Platform Upgrade](../deployment/08-platform-upgrade.md) for which parameters require restart.

### License Reload

```
POST /admin/license/reload
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "licenseKey": "<new-jwt>" }
```

Applies a new license key without restart. Use for license renewal.

### Worker Pool Status

```
GET /admin/workers/status
Authorization: Bearer <admin-token>
```

```json
{
  "workers": [
    { "id": 1, "status": "idle", "processedCount": 12450 },
    { "id": 2, "status": "busy", "currentTask": { "partner": "acme", "eventType": "order.created" } },
    { "id": 3, "status": "idle", "processedCount": 11200 },
    { "id": 4, "status": "idle", "processedCount": 13100 }
  ],
  "queueDepth": 5,
  "totalProcessed": 46750
}
```

---

## Support Bundle

The support bundle script collects all diagnostic data needed for remote support in a single command. The customer runs this and sends the output archive.

### What It Collects

```
support-bundle/
├── logs/
│   ├── transformer-last-1h.log          (last 1 hour, PII masked)
│   ├── business-service-last-1h.log
│   └── outbox-publisher-last-1h.log
├── metrics/
│   └── prometheus-snapshot.json         (all current metric values)
├── kafka/
│   ├── consumer-group-status.json       (lag per partition)
│   └── topic-info.json                  (partition count, retention)
├── cluster/
│   ├── pod-status.json                  (all pods, restarts, age)
│   ├── events.json                      (K8s events last 30 min)
│   └── resource-usage.json              (CPU/memory per pod)
├── health/
│   └── health-detail.json               (GET /health/ready?detail=true)
├── config/
│   └── config-masked.json               (all config, secrets replaced with ***)
└── dlq/
    └── dlq-recent-100.json              (metadata only, no payload content)
```

### Script Usage

```bash
# Run on a machine with kubectl access to the cluster
./scripts/support-bundle.sh \
  --namespace canonbridge \
  --output /tmp/canonbridge-support-$(date +%Y%m%d-%H%M%S).tar.gz

# Output:
# Collecting logs...         ✓
# Collecting metrics...      ✓
# Collecting Kafka status... ✓
# Collecting cluster info... ✓
# Collecting health data...  ✓
# Masking sensitive data...  ✓
# Packaging archive...       ✓
# Support bundle: /tmp/canonbridge-support-20260510-143045.tar.gz
# Size: 2.4 MB
#
# Send this file to support@canonbridge.io
```

### Security

- All secret values replaced with `***REDACTED***` before inclusion
- No payload content — DLQ section contains only metadata (event ID, type, partner, timestamp, error code)
- Log lines pass through the same PII masking rules as production logs
- Archive is safe to email or upload to support portal

---

## Self-Healing Mechanisms

The platform recovers from most failure conditions automatically. Operator action is needed only for sustained or complex failures.

| Component | Failure | Automatic Recovery |
|---|---|---|
| Worker thread | Crash / exception | Main thread detects worker exit, spawns replacement, in-flight task retried |
| Worker thread | Timeout (> configured limit) | Task cancelled, message sent to retry topic or DLQ |
| Kafka consumer | Connection lost | Client reconnects with exponential backoff (max 30s between attempts) |
| Kafka consumer | Stall (no heartbeat) | Liveness probe fails → Kubernetes restarts pod |
| Kafka producer | Timeout / connection failure | Circuit breaker opens, consumer pauses, readiness probe fails, Kubernetes stops routing |
| Circuit breaker (open) | Automatic cooldown period | After cooldown, circuit breaker moves to half-open, resumes consuming |
| DB connection pool | Exhaustion | Connection wait with timeout, circuit breaker triggers, `/health/ready` returns 503 |
| Outbox publisher | Crash | Kubernetes restarts, pending records remain in DB, burst publish on restart |
| Outbox publisher | Stall (no poll activity) | Liveness probe detects stall, Kubernetes restarts |
| Pending dependency table | Excessive growth | Scheduled cleanup job archives expired pending events to DLQ |

---

## Remote Log Shipping (Optional)

For customers who cannot send support bundles directly, log shipping can be configured to push logs to a remote collector.

### Option A: Grafana Loki (Recommended)

```yaml
# Promtail configuration for log shipping
# k8s/monitoring/promtail-config.yaml

scrape_configs:
  - job_name: canonbridge
    kubernetes_sd_configs:
      - role: pod
    pipeline_stages:
      - match:
          selector: '{namespace="canonbridge"}'
          stages:
            - json:
                expressions:
                  tenant: tenantId
                  partner: partnerId
                  level: level
            - labels:
                tenant:
                partner:
                level:
```

### Option B: Push to Customer SIEM

Log lines are structured JSON. They can be forwarded to any SIEM (Splunk, Elastic, Datadog) via Fluentd or Fluent Bit sidecar.

### Option C: CloudWatch / Azure Monitor / GCP Logging

Platform logs are container stdout/stderr — automatically captured by cloud provider logging agents when running on managed Kubernetes.

---

## Common Diagnostic Queries

### Find all DLQ events for a partner in the last 24 hours

```sql
SELECT
  event_id,
  event_type,
  partner_id,
  error_code,
  mapping_version,
  created_at
FROM dlq_events
WHERE partner_id = 'acme'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Find events that are taking longest to process

```promql
# In Prometheus / Grafana
topk(5,
  histogram_quantile(0.99,
    rate(transformation_duration_ms_bucket[5m])
  ) by (partner_id, event_type)
)
```

### Check if a specific eventId was processed

```sql
SELECT event_id, processed_at, source_topic, source_partition, source_offset
FROM processed_events
WHERE event_id = 'uuid-1234-5678';
```

If no row: event has not been processed. Check if it's in the DLQ or still in Kafka.

### Find stuck pending dependencies

```sql
SELECT
  event_type,
  parent_event_type,
  COUNT(*) AS pending_count,
  MIN(created_at) AS oldest_pending
FROM pending_events
GROUP BY event_type, parent_event_type
ORDER BY oldest_pending ASC;
```

Events pending for more than 30 minutes likely indicate a parent event that was lost or went to DLQ.

---

## Escalation Path

| Issue | First Responder | Escalate To | SLA |
|---|---|---|---|
| DLQ rate spike | On-call operator | Backend team if mapping cause confirmed | P1: 30 min |
| Consumer lag growing | On-call operator | SRE if scaling required | P1: 30 min |
| Pod crash loop | On-call operator | Backend team if not self-resolving | P2: 2h |
| DB write failures | On-call operator → DBA | Platform team if schema issue | P1: 30 min |
| Mapping publish incident | Integration engineer | Platform team for rollback support | P2: 1h |
| Security incident | Security team | Immediate escalation | P0: 15 min |

---

## See Also

- [Runbook](./08-runbook.md)
- [Failure Scenarios](./09-failure-scenarios.md)
- [Monitoring Dashboards](./01-monitoring-dashboards.md)
- [Alerting Strategy](./02-alerting-strategy.md)
- [Metrics and Observability](../implementation/09-metrics-observability.md)
