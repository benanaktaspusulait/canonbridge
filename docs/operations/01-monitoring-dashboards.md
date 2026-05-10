# Monitoring Dashboards

## Overview

This document describes the monitoring dashboards for ETL Solutions platform, including metrics collection, visualization, and alerting setup.

## Dashboard Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Grafana Dashboards                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   System     │  │ Application  │  │   Business   │ │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Kafka     │  │  Database    │  │   Alerts     │ │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          ↑
                          │
┌─────────────────────────────────────────────────────────┐
│                   Prometheus Metrics                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  • Application Metrics (Fastify, Quarkus)              │
│  • System Metrics (Node Exporter)                      │
│  • Kafka Metrics (JMX Exporter)                        │
│  • Database Metrics (PostgreSQL Exporter)              │
│  • Custom Business Metrics                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Key Dashboards

### 1. System Overview Dashboard

**Purpose**: High-level system health and performance

**Metrics**:
- CPU usage per service
- Memory usage per service
- Network I/O
- Disk I/O
- Pod status and restarts

**Panels**:
```
┌─────────────────────────────────────────────────────────┐
│ System Overview                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CPU Usage (%)          Memory Usage (GB)              │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ [Graph]      │      │ [Graph]      │               │
│  └──────────────┘      └──────────────┘               │
│                                                         │
│  Network I/O (MB/s)     Disk I/O (MB/s)               │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ [Graph]      │      │ [Graph]      │               │
│  └──────────────┘      └──────────────┘               │
│                                                         │
│  Pod Status                                            │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Service          Running  Pending  Failed        │ │
│  │ transformer         3        0        0          │ │
│  │ business-service    3        0        0          │ │
│  │ frontend            2        0        0          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Application Dashboard

**Purpose**: Application-specific metrics and performance

**Metrics**:
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Transformation success rate
- DLQ message count

**Panels**:
```
┌─────────────────────────────────────────────────────────┐
│ Application Metrics                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Request Rate (req/s)   Response Time (ms)             │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ [Graph]      │      │ p50: 45ms    │               │
│  │ Current: 850 │      │ p95: 89ms    │               │
│  └──────────────┘      │ p99: 120ms   │               │
│                        └──────────────┘               │
│                                                         │
│  Error Rate (%)         Success Rate (%)               │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ [Gauge]      │      │ [Gauge]      │               │
│  │ 0.05%        │      │ 99.95%       │               │
│  └──────────────┘      └──────────────┘               │
│                                                         │
│  DLQ Messages           Retry Queue                    │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ [Counter]    │      │ [Counter]    │               │
│  │ 12           │      │ 45           │               │
│  └──────────────┘      └──────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Kafka Dashboard

**Purpose**: Kafka cluster and topic metrics

**Metrics**:
- Consumer lag per topic
- Message rate (in/out)
- Partition count
- Broker health
- Replication status

**Panels**:
```
┌─────────────────────────────────────────────────────────┐
│ Kafka Metrics                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Consumer Lag by Topic                                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Topic                    Lag      Status          │ │
│  │ partner.raw.events       45       ✓ OK           │ │
│  │ canonical.events         12       ✓ OK           │ │
│  │ transformation.dlq       0        ✓ OK           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  Message Rate (msg/s)   Broker Health                  │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ In:  1,250   │      │ Broker 1: ✓  │               │
│  │ Out: 1,245   │      │ Broker 2: ✓  │               │
│  └──────────────┘      │ Broker 3: ✓  │               │
│                        └──────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. Database Dashboard

**Purpose**: PostgreSQL performance and health

**Metrics**:
- Connection pool usage
- Query performance
- Transaction rate
- Lock contention
- Replication lag

**Panels**:
```
┌─────────────────────────────────────────────────────────┐
│ Database Metrics                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Connection Pool        Query Performance              │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ Active: 15   │      │ Avg: 12ms    │               │
│  │ Idle:   35   │      │ p95: 45ms    │               │
│  │ Max:    50   │      │ p99: 89ms    │               │
│  └──────────────┘      └──────────────┘               │
│                                                         │
│  Transaction Rate       Lock Contention                │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ [Graph]      │      │ [Graph]      │               │
│  │ 450 tx/s     │      │ 2 locks      │               │
│  └──────────────┘      └──────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5. Business Metrics Dashboard

**Purpose**: Business-level KPIs and metrics

**Metrics**:
- Partners onboarded
- Events processed per partner
- Transformation success rate per partner
- Revenue metrics (if applicable)
- SLA compliance

**Panels**:
```
┌─────────────────────────────────────────────────────────┐
│ Business Metrics                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Active Partners        Events Today                   │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ [Counter]    │      │ [Counter]    │               │
│  │ 47           │      │ 1.2M         │               │
│  └──────────────┘      └──────────────┘               │
│                                                         │
│  Success Rate by Partner                               │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Partner          Events    Success    Errors     │ │
│  │ partner-a        450K      99.98%     90        │ │
│  │ partner-b        380K      99.95%     190       │ │
│  │ partner-c        290K      99.99%     29        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  SLA Compliance (%)     Uptime (%)                     │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ [Gauge]      │      │ [Gauge]      │               │
│  │ 99.97%       │      │ 99.98%       │               │
│  └──────────────┘      └──────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Prometheus Configuration

### Scrape Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # Transformer Service
  - job_name: 'transformer'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - etl-solutions
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: transformer
        action: keep
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: ${1}:9090

  # Business Service
  - job_name: 'business-service'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - etl-solutions
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: business-service
        action: keep
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: ${1}:8080

  # Kafka JMX Exporter
  - job_name: 'kafka'
    static_configs:
      - targets:
          - kafka-0.kafka-headless:9308
          - kafka-1.kafka-headless:9308
          - kafka-2.kafka-headless:9308

  # PostgreSQL Exporter
  - job_name: 'postgresql'
    static_configs:
      - targets:
          - postgres-exporter:9187

  # Node Exporter
  - job_name: 'node'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - source_labels: [__address__]
        regex: '(.*):10250'
        replacement: '${1}:9100'
        target_label: __address__
```

### Key Metrics to Collect

#### Application Metrics

```typescript
// Transformer Service (Node.js)
const metrics = {
  // Request metrics
  http_requests_total: new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'path', 'status']
  }),
  
  http_request_duration_ms: new Histogram({
    name: 'http_request_duration_ms',
    help: 'HTTP request duration in milliseconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000]
  }),
  
  // Transformation metrics
  transformation_duration_ms: new Histogram({
    name: 'transformation_duration_ms',
    help: 'Transformation duration in milliseconds',
    labelNames: ['partner_id', 'event_type'],
    buckets: [10, 25, 50, 100, 200, 500, 1000]
  }),
  
  transformation_success_total: new Counter({
    name: 'transformation_success_total',
    help: 'Total successful transformations',
    labelNames: ['partner_id', 'event_type']
  }),
  
  transformation_error_total: new Counter({
    name: 'transformation_error_total',
    help: 'Total transformation errors',
    labelNames: ['partner_id', 'event_type', 'error_type']
  }),
  
  // Kafka metrics
  kafka_consumer_lag: new Gauge({
    name: 'kafka_consumer_lag',
    help: 'Kafka consumer lag',
    labelNames: ['topic', 'partition', 'consumer_group']
  }),
  
  kafka_messages_consumed_total: new Counter({
    name: 'kafka_messages_consumed_total',
    help: 'Total Kafka messages consumed',
    labelNames: ['topic', 'partition']
  }),
  
  kafka_messages_produced_total: new Counter({
    name: 'kafka_messages_produced_total',
    help: 'Total Kafka messages produced',
    labelNames: ['topic']
  }),
  
  // DLQ metrics
  dlq_messages_total: new Counter({
    name: 'dlq_messages_total',
    help: 'Total messages sent to DLQ',
    labelNames: ['partner_id', 'event_type', 'error_type']
  }),
  
  // Worker pool metrics
  worker_pool_size: new Gauge({
    name: 'worker_pool_size',
    help: 'Current worker pool size'
  }),
  
  worker_pool_queue_depth: new Gauge({
    name: 'worker_pool_queue_depth',
    help: 'Current worker pool queue depth'
  })
};
```

## Grafana Dashboard Setup

### Installation

```bash
# Add Grafana Helm repository
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set persistence.enabled=true \
  --set persistence.size=10Gi \
  --set adminPassword=admin123
```

### Dashboard Import

1. **Access Grafana**:
   ```bash
   kubectl port-forward -n monitoring svc/grafana 3000:80
   ```
   Open http://localhost:3000

2. **Add Prometheus Data Source**:
   - Go to Configuration → Data Sources
   - Add Prometheus
   - URL: `http://prometheus-server.monitoring.svc.cluster.local`

3. **Import Dashboards**:
   - Go to Dashboards → Import
   - Upload JSON files from `k8s/monitoring/dashboards/`

### Dashboard JSON Examples

#### System Overview Dashboard

```json
{
  "dashboard": {
    "title": "ETL Solutions - System Overview",
    "panels": [
      {
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total{namespace=\"etl-solutions\"}[5m]) * 100"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "container_memory_usage_bytes{namespace=\"etl-solutions\"} / 1024 / 1024 / 1024"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

## Alert Integration

### Grafana Alerts

```yaml
# Alert rules in Grafana
alerts:
  - name: High Error Rate
    condition: avg() OF query(A, 5m, now) IS ABOVE 1
    query: rate(transformation_error_total[5m]) * 100
    for: 5m
    annotations:
      summary: "High transformation error rate"
      description: "Error rate is {{ $value }}%"
    
  - name: High Consumer Lag
    condition: avg() OF query(A, 5m, now) IS ABOVE 1000
    query: kafka_consumer_lag
    for: 10m
    annotations:
      summary: "High Kafka consumer lag"
      description: "Consumer lag is {{ $value }} messages"
```

## Best Practices

### Dashboard Design

1. **Keep it Simple**: Focus on key metrics
2. **Use Consistent Colors**: Red for errors, green for success
3. **Add Context**: Include descriptions and units
4. **Group Related Metrics**: Organize panels logically
5. **Set Appropriate Time Ranges**: Default to last 1 hour

### Metric Collection

1. **Use Labels Wisely**: Don't create high-cardinality labels
2. **Set Appropriate Buckets**: For histograms
3. **Use Counters for Totals**: Use gauges for current values
4. **Add Business Context**: Include partner_id, event_type
5. **Monitor Collection Performance**: Ensure scraping doesn't impact performance

### Performance

1. **Optimize Queries**: Use recording rules for complex queries
2. **Set Retention Policies**: Balance storage and history
3. **Use Downsampling**: For long-term storage
4. **Cache Dashboard Results**: For frequently accessed dashboards
5. **Limit Data Points**: Use appropriate time ranges

## Troubleshooting

### Common Issues

#### Dashboard Not Loading

```bash
# Check Grafana logs
kubectl logs -n monitoring deployment/grafana

# Check Prometheus connectivity
kubectl exec -n monitoring deployment/grafana -- \
  curl http://prometheus-server.monitoring.svc.cluster.local:9090/-/healthy
```

#### Missing Metrics

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-server 9090:80
# Open http://localhost:9090/targets

# Check service metrics endpoint
kubectl exec -n etl-solutions deployment/transformer -- \
  curl http://localhost:9090/metrics
```

#### High Memory Usage

```bash
# Check Prometheus memory
kubectl top pod -n monitoring

# Reduce retention period
helm upgrade prometheus prometheus-community/prometheus \
  --set server.retention=7d
```

## Next Steps

1. **Set Up Alerts**: Configure alerting rules (see [02-alerting-strategy.md](./02-alerting-strategy.md))
2. **Create Custom Dashboards**: Build team-specific dashboards
3. **Integrate with Incident Management**: Connect to PagerDuty/Opsgenie
4. **Document Runbooks**: Create operational procedures (see [08-runbook.md](./08-runbook.md))

## See Also

- [Alerting Strategy](./02-alerting-strategy.md)
- [Troubleshooting Guide](./03-troubleshooting.md)
- [Performance Tuning](./07-performance-tuning.md)
- [Runbook](./08-runbook.md)

---

**Last Updated**: May 10, 2026  
**Version**: 1.0
