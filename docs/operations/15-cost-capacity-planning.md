# Cost & Capacity Planning

**Version**: 1.0  
**Last Updated**: May 10, 2026  
**Status**: Design Document

> ⚠️ **Phase 0 Notice**: This is a design document. No code has been implemented yet. All cost estimates are projections based on typical cloud pricing and should be validated with actual usage.

---

## 📋 OVERVIEW

This document provides cost estimates and capacity planning guidelines for CanonBridge deployment at different scales.

---

## 💰 COST MODEL

### Deployment Model

**CanonBridge is deployed as**: Single-tenant, on-premise or private cloud

**Cost Structure**:
- Customer pays for their own infrastructure
- No shared infrastructure costs
- Full control over resource allocation
- Predictable costs based on usage

---

## 📊 CAPACITY TIERS

### Tier 1: Starter (Development/Testing)

**Target Workload**:
- 1-5 partners
- 1-10 event types
- 100,000 events/day (~1 event/second)
- Development and testing environments

**Infrastructure Requirements**:

| Component | Specification | Quantity | Monthly Cost (AWS) |
|-----------|--------------|----------|-------------------|
| **Compute** | t3.medium (2 vCPU, 4GB RAM) | 3 | $100 |
| **Kafka** | t3.medium | 1 | $33 |
| **PostgreSQL** | db.t3.medium (2 vCPU, 4GB RAM) | 1 | $60 |
| **Redis** | cache.t3.micro | 1 | $15 |
| **Storage** | 100GB SSD | - | $10 |
| **Network** | 100GB transfer | - | $10 |
| **Monitoring** | CloudWatch/Prometheus | - | $20 |
| **Total** | | | **~$250/month** |

**Kubernetes Resources**:
```yaml
Transformer Service:
  replicas: 2
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi

Business Service:
  replicas: 1
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi
```

**Performance Expectations**:
- Throughput: 100 events/second
- Latency: p99 < 500ms
- Availability: 99% (single instance)

---

### Tier 2: Professional (Small Production)

**Target Workload**:
- 5-20 partners
- 10-50 event types
- 10M events/day (~115 events/second)
- Small production deployments

**Infrastructure Requirements**:

| Component | Specification | Quantity | Monthly Cost (AWS) |
|-----------|--------------|----------|-------------------|
| **Compute** | t3.large (2 vCPU, 8GB RAM) | 6 | $400 |
| **Kafka** | m5.large (2 vCPU, 8GB RAM) | 3 | $360 |
| **PostgreSQL** | db.m5.large (2 vCPU, 8GB RAM) | 1 | $140 |
| **Redis** | cache.m5.large | 1 | $120 |
| **Storage** | 500GB SSD | - | $50 |
| **Network** | 1TB transfer | - | $90 |
| **Monitoring** | CloudWatch/Prometheus | - | $50 |
| **Backup** | S3 + snapshots | - | $30 |
| **Total** | | | **~$1,240/month** |

**Kubernetes Resources**:
```yaml
Transformer Service:
  replicas: 3
  resources:
    requests:
      cpu: 1000m
      memory: 2Gi
    limits:
      cpu: 2000m
      memory: 4Gi
  hpa:
    minReplicas: 3
    maxReplicas: 6
    targetCPU: 70%

Business Service:
  replicas: 2
  resources:
    requests:
      cpu: 1000m
      memory: 2Gi
    limits:
      cpu: 2000m
      memory: 4Gi
  hpa:
    minReplicas: 2
    maxReplicas: 4
    targetCPU: 70%
```

**Performance Expectations**:
- Throughput: 1,000 events/second
- Latency: p99 < 200ms
- Availability: 99.5% (multi-instance)

---

### Tier 3: Enterprise (Large Production)

**Target Workload**:
- 20-100 partners
- 50-200 event types
- 100M events/day (~1,150 events/second)
- Large production deployments

**Infrastructure Requirements**:

| Component | Specification | Quantity | Monthly Cost (AWS) |
|-----------|--------------|----------|-------------------|
| **Compute** | m5.xlarge (4 vCPU, 16GB RAM) | 12 | $2,300 |
| **Kafka** | m5.2xlarge (8 vCPU, 32GB RAM) | 3 | $1,200 |
| **PostgreSQL** | db.m5.2xlarge (8 vCPU, 32GB RAM) | 1 + 1 replica | $1,100 |
| **Redis** | cache.m5.xlarge | 2 | $480 |
| **Storage** | 2TB SSD | - | $200 |
| **Network** | 10TB transfer | - | $850 |
| **Monitoring** | CloudWatch/Prometheus | - | $150 |
| **Backup** | S3 + snapshots | - | $100 |
| **Load Balancer** | ALB | 1 | $25 |
| **Total** | | | **~$6,400/month** |

**Kubernetes Resources**:
```yaml
Transformer Service:
  replicas: 6
  resources:
    requests:
      cpu: 2000m
      memory: 4Gi
    limits:
      cpu: 4000m
      memory: 8Gi
  hpa:
    minReplicas: 6
    maxReplicas: 12
    targetCPU: 70%

Business Service:
  replicas: 4
  resources:
    requests:
      cpu: 2000m
      memory: 4Gi
    limits:
      cpu: 4000m
      memory: 8Gi
  hpa:
    minReplicas: 4
    maxReplicas: 8
    targetCPU: 70%
```

**Performance Expectations**:
- Throughput: 10,000 events/second
- Latency: p99 < 100ms
- Availability: 99.9% (multi-AZ)

---

### Tier 4: Scale (Very Large Production)

**Target Workload**:
- 100+ partners
- 200+ event types
- 1B events/day (~11,500 events/second)
- Very large production deployments

**Infrastructure Requirements**:

| Component | Specification | Quantity | Monthly Cost (AWS) |
|-----------|--------------|----------|-------------------|
| **Compute** | m5.2xlarge (8 vCPU, 32GB RAM) | 24 | $9,200 |
| **Kafka** | m5.4xlarge (16 vCPU, 64GB RAM) | 6 | $4,800 |
| **PostgreSQL** | db.m5.4xlarge (16 vCPU, 64GB RAM) | 1 + 2 replicas | $4,500 |
| **Redis** | cache.m5.2xlarge | 3 | $1,440 |
| **Storage** | 10TB SSD | - | $1,000 |
| **Network** | 50TB transfer | - | $4,250 |
| **Monitoring** | CloudWatch/Prometheus | - | $500 |
| **Backup** | S3 + snapshots | - | $300 |
| **Load Balancer** | ALB | 2 | $50 |
| **Total** | | | **~$26,000/month** |

**Kubernetes Resources**:
```yaml
Transformer Service:
  replicas: 12
  resources:
    requests:
      cpu: 4000m
      memory: 8Gi
    limits:
      cpu: 8000m
      memory: 16Gi
  hpa:
    minReplicas: 12
    maxReplicas: 24
    targetCPU: 70%

Business Service:
  replicas: 8
  resources:
    requests:
      cpu: 4000m
      memory: 8Gi
    limits:
      cpu: 8000m
      memory: 16Gi
  hpa:
    minReplicas: 8
    maxReplicas: 16
    targetCPU: 70%
```

**Performance Expectations**:
- Throughput: 50,000+ events/second
- Latency: p99 < 50ms
- Availability: 99.95% (multi-region)

---

## 📈 CAPACITY PLANNING

### Sizing Calculator

**Formula**:
```
Required Throughput (events/sec) = Daily Events / 86,400
Peak Throughput = Required Throughput × Peak Factor (2-5x)
Required CPU = Peak Throughput / Events per CPU per Second
Required Memory = Active Connections × Memory per Connection
```

**Example Calculation**:
```
Daily Events: 10,000,000
Required Throughput: 10M / 86,400 = 115 events/sec
Peak Factor: 3x
Peak Throughput: 115 × 3 = 345 events/sec

Transformer Service:
- Events per CPU per second: ~50
- Required CPUs: 345 / 50 = 7 CPUs
- Recommended: 3 pods × 2 CPUs = 6 CPUs (with HPA to 12 CPUs)

Business Service:
- Events per CPU per second: ~30
- Required CPUs: 345 / 30 = 12 CPUs
- Recommended: 2 pods × 2 CPUs = 4 CPUs (with HPA to 8 CPUs)
```

### Kafka Capacity Planning

**Partition Sizing**:
```
Partitions per Topic = Desired Throughput / Partition Throughput
Partition Throughput ≈ 10MB/sec or 10,000 messages/sec

Example:
- Desired: 1,000 events/sec
- Partition Throughput: 10,000 events/sec
- Required Partitions: 1,000 / 10,000 = 1 partition (minimum 3 for redundancy)
```

**Storage Sizing**:
```
Storage per Day = Events per Day × Average Event Size × Retention Days

Example:
- Events: 10M/day
- Event Size: 5KB
- Retention: 7 days
- Storage: 10M × 5KB × 7 = 350GB
- Recommended: 500GB (with 30% buffer)
```

**Broker Sizing**:
```
Brokers = max(
  Partitions / 2000,  # Max partitions per broker
  Storage / Broker Storage Capacity,
  3  # Minimum for HA
)

Example:
- Partitions: 100
- Storage: 500GB
- Broker Capacity: 1TB
- Brokers: max(100/2000, 500/1000, 3) = 3 brokers
```

### PostgreSQL Capacity Planning

**Connection Sizing**:
```
Max Connections = (Services × Replicas × Connection Pool Size) + Buffer

Example:
- Transformer: 3 replicas × 20 connections = 60
- Business: 2 replicas × 20 connections = 40
- Monitoring: 1 × 5 connections = 5
- Buffer: 20%
- Total: (60 + 40 + 5) × 1.2 = 126 connections
```

**Storage Sizing**:
```
Storage = (Events per Day × Event Size × Retention Days) + Indexes + Buffer

Example:
- Events: 10M/day
- Event Size: 2KB (after normalization)
- Retention: 30 days
- Indexes: 30% overhead
- Buffer: 50%
- Storage: (10M × 2KB × 30) × 1.3 × 1.5 = 1.17TB
```

**IOPS Sizing**:
```
IOPS = (Writes per Second + Reads per Second) × Safety Factor

Example:
- Writes: 115 events/sec
- Reads: 50 queries/sec
- Safety Factor: 3x
- IOPS: (115 + 50) × 3 = 495 IOPS
- Recommended: 1,000 IOPS (provisioned)
```

---

## 🔍 MONITORING CAPACITY

### Key Metrics to Monitor

**Compute Resources**:
```yaml
# CPU utilization
- alert: HighCPUUsage
  expr: avg(rate(container_cpu_usage_seconds_total[5m])) > 0.8
  
# Memory utilization
- alert: HighMemoryUsage
  expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85

# Disk utilization
- alert: HighDiskUsage
  expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes > 0.85
```

**Kafka Metrics**:
```yaml
# Partition lag
- alert: HighConsumerLag
  expr: kafka_consumer_lag > 10000

# Disk usage
- alert: KafkaDiskFull
  expr: kafka_log_size_bytes / kafka_log_size_limit_bytes > 0.85

# Under-replicated partitions
- alert: UnderReplicatedPartitions
  expr: kafka_server_replicamanager_underreplicatedpartitions > 0
```

**Database Metrics**:
```yaml
# Connection pool exhaustion
- alert: ConnectionPoolExhausted
  expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.9

# Slow queries
- alert: SlowQueries
  expr: rate(pg_stat_statements_mean_time_ms[5m]) > 1000

# Replication lag
- alert: ReplicationLag
  expr: pg_replication_lag_seconds > 60
```

### Capacity Alerts

```yaml
# Approaching capacity limits
- alert: ApproachingCapacity
  expr: |
    (
      avg(rate(events_processed_total[1h])) / 
      avg(events_capacity_total)
    ) > 0.7
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "System at 70% capacity"
    description: "Consider scaling up resources"

# At capacity
- alert: AtCapacity
  expr: |
    (
      avg(rate(events_processed_total[5m])) / 
      avg(events_capacity_total)
    ) > 0.9
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "System at 90% capacity"
    description: "Immediate scaling required"
```

---

## 📊 COST OPTIMIZATION

### Optimization Strategies

**1. Right-Sizing**:
- Monitor actual resource usage
- Adjust pod resources based on metrics
- Use HPA for automatic scaling
- Scale down during off-peak hours

**2. Reserved Instances**:
- Use reserved instances for baseline capacity
- Save 30-60% on compute costs
- 1-year or 3-year commitments

**3. Spot Instances**:
- Use spot instances for non-critical workloads
- Save up to 90% on compute costs
- Implement graceful handling of interruptions

**4. Storage Optimization**:
- Use lifecycle policies for old data
- Compress historical data
- Archive to cheaper storage (S3 Glacier)
- Implement data retention policies

**5. Network Optimization**:
- Use VPC endpoints to avoid data transfer costs
- Compress data in transit
- Batch operations to reduce API calls
- Use CloudFront/CDN for static assets

### Cost Monitoring

**Track Costs by**:
- Service (Transformer, Business, Kafka, etc.)
- Environment (Dev, Staging, Production)
- Partner (if multi-tenant)
- Resource type (Compute, Storage, Network)

**Cost Alerts**:
```yaml
# Monthly cost exceeds budget
- alert: MonthlyBudgetExceeded
  expr: aws_billing_estimated_charges > 10000
  labels:
    severity: warning
  annotations:
    summary: "Monthly costs exceed $10,000"

# Unexpected cost spike
- alert: CostSpike
  expr: |
    (
      aws_billing_estimated_charges - 
      aws_billing_estimated_charges offset 1d
    ) > 1000
  labels:
    severity: critical
  annotations:
    summary: "Daily cost increased by $1,000"
```

---

## 🎯 SCALING STRATEGIES

### Horizontal Scaling

**When to Scale Out**:
- CPU utilization > 70% for 5 minutes
- Memory utilization > 80% for 5 minutes
- Consumer lag > 10,000 messages
- Request latency p99 > target SLA

**Scaling Configuration**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: transformer-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: transformer-service
  minReplicas: 3
  maxReplicas: 12
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: kafka_consumer_lag
      target:
        type: AverageValue
        averageValue: "5000"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 25
        periodSeconds: 60
```

### Vertical Scaling

**When to Scale Up**:
- Consistent high resource usage
- Cannot scale horizontally (stateful services)
- Cost-effective for baseline capacity

**Process**:
1. Monitor resource usage patterns
2. Identify bottlenecks
3. Test with larger instance types
4. Implement rolling update
5. Verify performance improvement

---

## ✅ CAPACITY PLANNING CHECKLIST

### Initial Planning

- [ ] Estimate daily event volume
- [ ] Calculate peak throughput requirements
- [ ] Determine retention requirements
- [ ] Select appropriate tier
- [ ] Calculate infrastructure costs
- [ ] Get budget approval

### Pre-Production

- [ ] Load test at expected capacity
- [ ] Load test at 2x expected capacity
- [ ] Verify auto-scaling works
- [ ] Test failure scenarios
- [ ] Validate cost estimates
- [ ] Set up capacity monitoring
- [ ] Configure capacity alerts

### Ongoing

- [ ] Review capacity metrics weekly
- [ ] Review costs monthly
- [ ] Adjust resources based on usage
- [ ] Plan for growth (quarterly)
- [ ] Optimize costs (quarterly)
- [ ] Update capacity plan (annually)

---

## 📚 RELATED DOCUMENTS

- [Scaling Guide](./04-scaling.md)
- [Performance Tuning](./07-performance-tuning.md)
- [Monitoring Dashboards](./01-monitoring-dashboards.md)
- [Production Readiness](./11-production-readiness.md)

---

**Status**: Design Document  
**Phase**: Phase 0 (Validation)  
**Implementation**: Phase 3+

