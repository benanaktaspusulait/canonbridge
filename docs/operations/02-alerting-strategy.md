# Alerting Strategy

## Overview

This document defines the alerting strategy for ETL Solutions platform, including alert rules, severity levels, notification channels, and escalation procedures.

## Alert Philosophy

### Core Principles

1. **Alert on Symptoms, Not Causes**: Alert when users are affected
2. **Actionable Alerts Only**: Every alert must have a clear action
3. **Reduce Alert Fatigue**: Minimize false positives
4. **Context is Key**: Provide enough information to diagnose
5. **Escalate Appropriately**: Route alerts to the right team

### Alert Severity Levels

| Level | Description | Response Time | Notification |
|-------|-------------|---------------|--------------|
| **P1 - Critical** | Service down, data loss | Immediate | PagerDuty + Phone |
| **P2 - High** | Degraded performance, high error rate | 15 minutes | PagerDuty + Slack |
| **P3 - Medium** | Warning signs, approaching limits | 1 hour | Slack + Email |
| **P4 - Low** | Informational, no immediate action | 24 hours | Email only |

## Alert Rules

### 1. Service Availability Alerts

#### Service Down (P1)

```yaml
# Prometheus Alert Rule
- alert: ServiceDown
  expr: up{job=~"transformer|business-service"} == 0
  for: 1m
  labels:
    severity: critical
    team: platform
  annotations:
    summary: "Service {{ $labels.job }} is down"
    description: "{{ $labels.job }} has been down for more than 1 minute"
    runbook: "https://docs.etlsolutions.com/runbook#service-down"
    action: "Check pod status, logs, and restart if necessary"
```

#### High Pod Restart Rate (P2)

```yaml
- alert: HighPodRestartRate
  expr: rate(kube_pod_container_status_restarts_total{namespace="etl-solutions"}[15m]) > 0.1
  for: 5m
  labels:
    severity: high
    team: platform
  annotations:
    summary: "High pod restart rate for {{ $labels.pod }}"
    description: "Pod {{ $labels.pod }} is restarting frequently"
    runbook: "https://docs.etlsolutions.com/runbook#pod-restarts"
```

### 2. Performance Alerts

#### High Response Time (P2)

```yaml
- alert: HighResponseTime
  expr: histogram_quantile(0.99, rate(http_request_duration_ms_bucket[5m])) > 1000
  for: 10m
  labels:
    severity: high
    team: platform
  annotations:
    summary: "High response time on {{ $labels.job }}"
    description: "P99 response time is {{ $value }}ms (threshold: 1000ms)"
    runbook: "https://docs.etlsolutions.com/runbook#high-latency"
```

#### High CPU Usage (P3)

```yaml
- alert: HighCPUUsage
  expr: rate(container_cpu_usage_seconds_total{namespace="etl-solutions"}[5m]) * 100 > 80
  for: 15m
  labels:
    severity: medium
    team: platform
  annotations:
    summary: "High CPU usage on {{ $labels.pod }}"
    description: "CPU usage is {{ $value }}% (threshold: 80%)"
    runbook: "https://docs.etlsolutions.com/runbook#high-cpu"
```

#### High Memory Usage (P3)

```yaml
- alert: HighMemoryUsage
  expr: (container_memory_usage_bytes{namespace="etl-solutions"} / container_spec_memory_limit_bytes{namespace="etl-solutions"}) * 100 > 85
  for: 15m
  labels:
    severity: medium
    team: platform
  annotations:
    summary: "High memory usage on {{ $labels.pod }}"
    description: "Memory usage is {{ $value }}% (threshold: 85%)"
    runbook: "https://docs.etlsolutions.com/runbook#high-memory"
```

### 3. Application Alerts

#### High Error Rate (P2)

```yaml
- alert: HighErrorRate
  expr: (rate(transformation_error_total[5m]) / rate(transformation_success_total[5m])) * 100 > 1
  for: 5m
  labels:
    severity: high
    team: application
  annotations:
    summary: "High transformation error rate"
    description: "Error rate is {{ $value }}% (threshold: 1%)"
    partner: "{{ $labels.partner_id }}"
    runbook: "https://docs.etlsolutions.com/runbook#high-error-rate"
```

#### DLQ Messages Accumulating (P2)

```yaml
- alert: DLQMessagesAccumulating
  expr: increase(dlq_messages_total[15m]) > 100
  for: 5m
  labels:
    severity: high
    team: application
  annotations:
    summary: "DLQ messages accumulating"
    description: "{{ $value }} messages added to DLQ in last 15 minutes"
    partner: "{{ $labels.partner_id }}"
    runbook: "https://docs.etlsolutions.com/runbook#dlq-accumulation"
```

#### Transformation Latency High (P3)

```yaml
- alert: TransformationLatencyHigh
  expr: histogram_quantile(0.99, rate(transformation_duration_ms_bucket[5m])) > 500
  for: 10m
  labels:
    severity: medium
    team: application
  annotations:
    summary: "High transformation latency"
    description: "P99 transformation time is {{ $value }}ms (threshold: 500ms)"
    partner: "{{ $labels.partner_id }}"
    runbook: "https://docs.etlsolutions.com/runbook#slow-transformation"
```

### 4. Kafka Alerts

#### High Consumer Lag (P2)

```yaml
- alert: HighConsumerLag
  expr: kafka_consumer_lag > 10000
  for: 10m
  labels:
    severity: high
    team: platform
  annotations:
    summary: "High Kafka consumer lag"
    description: "Consumer lag is {{ $value }} messages (threshold: 10000)"
    topic: "{{ $labels.topic }}"
    consumer_group: "{{ $labels.consumer_group }}"
    runbook: "https://docs.etlsolutions.com/runbook#consumer-lag"
```

#### Kafka Broker Down (P1)

```yaml
- alert: KafkaBrokerDown
  expr: kafka_server_broker_state < 1
  for: 1m
  labels:
    severity: critical
    team: platform
  annotations:
    summary: "Kafka broker {{ $labels.broker }} is down"
    description: "Kafka broker has been down for more than 1 minute"
    runbook: "https://docs.etlsolutions.com/runbook#kafka-broker-down"
```

#### Under-Replicated Partitions (P2)

```yaml
- alert: UnderReplicatedPartitions
  expr: kafka_server_replicamanager_underreplicatedpartitions > 0
  for: 5m
  labels:
    severity: high
    team: platform
  annotations:
    summary: "Kafka has under-replicated partitions"
    description: "{{ $value }} partitions are under-replicated"
    runbook: "https://docs.etlsolutions.com/runbook#under-replicated"
```

### 5. Database Alerts

#### Database Connection Pool Exhausted (P1)

```yaml
- alert: DatabaseConnectionPoolExhausted
  expr: (hikaricp_connections_active / hikaricp_connections_max) * 100 > 95
  for: 2m
  labels:
    severity: critical
    team: platform
  annotations:
    summary: "Database connection pool exhausted"
    description: "Connection pool usage is {{ $value }}% (threshold: 95%)"
    runbook: "https://docs.etlsolutions.com/runbook#connection-pool"
```

#### High Database Query Time (P3)

```yaml
- alert: HighDatabaseQueryTime
  expr: histogram_quantile(0.99, rate(pg_stat_statements_mean_exec_time_bucket[5m])) > 1000
  for: 10m
  labels:
    severity: medium
    team: application
  annotations:
    summary: "High database query time"
    description: "P99 query time is {{ $value }}ms (threshold: 1000ms)"
    runbook: "https://docs.etlsolutions.com/runbook#slow-queries"
```

#### Database Replication Lag (P2)

```yaml
- alert: DatabaseReplicationLag
  expr: pg_replication_lag_seconds > 60
  for: 5m
  labels:
    severity: high
    team: platform
  annotations:
    summary: "High database replication lag"
    description: "Replication lag is {{ $value }} seconds (threshold: 60s)"
    runbook: "https://docs.etlsolutions.com/runbook#replication-lag"
```

### 6. Business Alerts

#### Partner Integration Failing (P2)

```yaml
- alert: PartnerIntegrationFailing
  expr: (rate(transformation_error_total{partner_id!=""}[15m]) / rate(transformation_success_total{partner_id!=""}[15m])) * 100 > 5
  for: 10m
  labels:
    severity: high
    team: integration
  annotations:
    summary: "Partner {{ $labels.partner_id }} integration failing"
    description: "Error rate is {{ $value }}% for partner {{ $labels.partner_id }}"
    partner: "{{ $labels.partner_id }}"
    runbook: "https://docs.etlsolutions.com/runbook#partner-failure"
```

#### SLA Breach Warning (P3)

```yaml
- alert: SLABreachWarning
  expr: (rate(transformation_success_total[1h]) / (rate(transformation_success_total[1h]) + rate(transformation_error_total[1h]))) * 100 < 99.9
  for: 30m
  labels:
    severity: medium
    team: platform
  annotations:
    summary: "SLA breach warning"
    description: "Success rate is {{ $value }}% (SLA: 99.9%)"
    runbook: "https://docs.etlsolutions.com/runbook#sla-breach"
```

## Notification Channels

### Channel Configuration

```yaml
# Alertmanager configuration
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  
  routes:
    # Critical alerts go to PagerDuty
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true
    
    # High severity to PagerDuty and Slack
    - match:
        severity: high
      receiver: 'pagerduty-high'
      continue: true
    
    # Medium severity to Slack
    - match:
        severity: medium
      receiver: 'slack-medium'
    
    # Low severity to email
    - match:
        severity: low
      receiver: 'email-low'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
        severity: 'critical'
        description: '{{ .GroupLabels.alertname }}: {{ .CommonAnnotations.summary }}'
  
  - name: 'pagerduty-high'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
        severity: 'error'
        description: '{{ .GroupLabels.alertname }}: {{ .CommonAnnotations.summary }}'
  
  - name: 'slack-medium'
    slack_configs:
      - channel: '#alerts-medium'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  
  - name: 'email-low'
    email_configs:
      - to: 'team@etlsolutions.com'
        from: 'alerts@etlsolutions.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@etlsolutions.com'
        auth_password: 'YOUR_PASSWORD'
```

### Slack Integration

```yaml
# Slack webhook configuration
slack_configs:
  - channel: '#alerts'
    username: 'Prometheus'
    icon_emoji: ':prometheus:'
    title: '{{ .GroupLabels.alertname }}'
    text: |
      *Alert:* {{ .GroupLabels.alertname }}
      *Severity:* {{ .CommonLabels.severity }}
      *Summary:* {{ .CommonAnnotations.summary }}
      *Description:* {{ .CommonAnnotations.description }}
      *Runbook:* {{ .CommonAnnotations.runbook }}
      *Action:* {{ .CommonAnnotations.action }}
    send_resolved: true
```

## Escalation Procedures

### Escalation Matrix

```
┌─────────────────────────────────────────────────────────┐
│                   Escalation Flow                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  P1 (Critical)                                         │
│  ├─ 0 min:  PagerDuty → On-call Engineer              │
│  ├─ 5 min:  Escalate to Team Lead                     │
│  ├─ 15 min: Escalate to Engineering Manager           │
│  └─ 30 min: Escalate to CTO                           │
│                                                         │
│  P2 (High)                                             │
│  ├─ 0 min:  PagerDuty + Slack → On-call Engineer      │
│  ├─ 15 min: Escalate to Team Lead                     │
│  └─ 1 hour: Escalate to Engineering Manager           │
│                                                         │
│  P3 (Medium)                                           │
│  ├─ 0 min:  Slack → Team Channel                      │
│  └─ 1 hour: Assign to team member                     │
│                                                         │
│  P4 (Low)                                              │
│  ├─ 0 min:  Email → Team                              │
│  └─ 24 hours: Review in daily standup                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### On-Call Schedule

```yaml
# PagerDuty schedule configuration
schedules:
  - name: "Primary On-Call"
    time_zone: "UTC"
    layers:
      - name: "Weekly Rotation"
        start: "2026-05-10T00:00:00Z"
        rotation_virtual_start: "2026-05-10T00:00:00Z"
        rotation_turn_length_seconds: 604800  # 1 week
        users:
          - user1@etlsolutions.com
          - user2@etlsolutions.com
          - user3@etlsolutions.com
  
  - name: "Secondary On-Call"
    time_zone: "UTC"
    layers:
      - name: "Weekly Rotation"
        start: "2026-05-10T00:00:00Z"
        rotation_virtual_start: "2026-05-10T00:00:00Z"
        rotation_turn_length_seconds: 604800
        users:
          - lead1@etlsolutions.com
          - lead2@etlsolutions.com
```

## Alert Suppression

### Maintenance Windows

```yaml
# Suppress alerts during maintenance
inhibit_rules:
  - source_match:
      alertname: 'MaintenanceMode'
    target_match_re:
      severity: 'critical|high|medium'
    equal: ['cluster', 'service']
```

### Dependent Alerts

```yaml
# Suppress dependent alerts
inhibit_rules:
  # If service is down, suppress all other alerts for that service
  - source_match:
      alertname: 'ServiceDown'
    target_match_re:
      alertname: 'HighResponseTime|HighErrorRate|HighCPUUsage'
    equal: ['job']
  
  # If Kafka broker is down, suppress consumer lag alerts
  - source_match:
      alertname: 'KafkaBrokerDown'
    target_match:
      alertname: 'HighConsumerLag'
    equal: ['cluster']
```

## Alert Testing

### Test Alert

```bash
# Send test alert to Alertmanager
curl -X POST http://alertmanager:9093/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "medium",
      "team": "platform"
    },
    "annotations": {
      "summary": "This is a test alert",
      "description": "Testing alert routing and notifications"
    }
  }]'
```

### Verify Alert Rules

```bash
# Check Prometheus alert rules
promtool check rules /etc/prometheus/rules/*.yml

# Test alert expression
curl 'http://prometheus:9090/api/v1/query?query=up{job="transformer"}==0'
```

## Best Practices

### Alert Design

1. **Make Alerts Actionable**: Include runbook links
2. **Provide Context**: Add relevant labels and annotations
3. **Set Appropriate Thresholds**: Balance sensitivity and noise
4. **Use Appropriate Durations**: Avoid flapping alerts
5. **Test Regularly**: Verify alerts fire correctly

### Alert Management

1. **Review Alerts Weekly**: Tune thresholds and rules
2. **Document Runbooks**: Keep runbooks up-to-date
3. **Track Alert Metrics**: Monitor alert frequency and resolution time
4. **Conduct Post-Mortems**: Learn from incidents
5. **Maintain On-Call Schedule**: Ensure coverage

### Alert Fatigue Prevention

1. **Reduce False Positives**: Tune alert thresholds
2. **Group Related Alerts**: Avoid alert storms
3. **Use Inhibition Rules**: Suppress dependent alerts
4. **Set Maintenance Windows**: Suppress during planned maintenance
5. **Regular Alert Audits**: Remove unnecessary alerts

## Troubleshooting

### Alerts Not Firing

```bash
# Check Prometheus rules
kubectl exec -n monitoring prometheus-0 -- \
  promtool check rules /etc/prometheus/rules/*.yml

# Check Alertmanager status
kubectl logs -n monitoring alertmanager-0

# Verify alert expression
curl 'http://prometheus:9090/api/v1/query?query=YOUR_ALERT_EXPRESSION'
```

### Notifications Not Received

```bash
# Check Alertmanager logs
kubectl logs -n monitoring alertmanager-0 | grep -i error

# Test webhook
curl -X POST YOUR_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test message"}'

# Check routing configuration
kubectl exec -n monitoring alertmanager-0 -- \
  amtool config routes show
```

## Next Steps

1. **Configure Notification Channels**: Set up Slack, PagerDuty, email
2. **Define On-Call Schedule**: Create rotation schedule
3. **Write Runbooks**: Document response procedures (see [08-runbook.md](./08-runbook.md))
4. **Test Alerts**: Verify all alerts fire correctly
5. **Train Team**: Ensure team knows how to respond

## See Also

- [Monitoring Dashboards](./01-monitoring-dashboards.md)
- [Troubleshooting Guide](./03-troubleshooting.md)
- [Runbook](./08-runbook.md)
- [Disaster Recovery](./06-disaster-recovery.md)

---

**Last Updated**: May 10, 2026  
**Version**: 1.0
