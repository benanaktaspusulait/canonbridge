# Scaling Guide

## Overview

This document describes scaling strategies for the CanonBridge platform, including horizontal and vertical scaling, auto-scaling configuration, and capacity planning.

## Scaling Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Scaling Strategy                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Horizontal Scaling (Scale Out)                        │
│  ├─ Add more pods                                      │
│  ├─ Distribute load across pods                       │
│  └─ Auto-scaling based on metrics                     │
│                                                         │
│  Vertical Scaling (Scale Up)                           │
│  ├─ Increase CPU/Memory per pod                       │
│  ├─ Optimize resource allocation                      │
│  └─ Right-size containers                             │
│                                                         │
│  Infrastructure Scaling                                │
│  ├─ Add Kubernetes nodes                              │
│  ├─ Scale Kafka brokers                               │
│  └─ Scale database replicas                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Horizontal Pod Autoscaling (HPA)

### Transformer Service HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: transformer-hpa
  namespace: etl-solutions
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: transformer
  minReplicas: 3
  maxReplicas: 20
  metrics:
    # CPU-based scaling
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70

    # Memory-based scaling
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80

    # Custom metric: Kafka consumer lag
    - type: Pods
      pods:
        metric:
          name: kafka_consumer_lag
        target:
          type: AverageValue
          averageValue: "1000"

    # Custom metric: Queue depth
    - type: Pods
      pods:
        metric:
          name: worker_pool_queue_depth
        target:
          type: AverageValue
          averageValue: "100"

  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
        - type: Pods
          value: 2
          periodSeconds: 60
      selectPolicy: Max

    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
        - type: Pods
          value: 1
          periodSeconds: 60
      selectPolicy: Min
```

### Business Service HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: business-service-hpa
  namespace: etl-solutions
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: business-service
  minReplicas: 3
  maxReplicas: 15
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

    # Custom metric: Request rate
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "100"

    # Custom metric: Database connection pool usage
    - type: Pods
      pods:
        metric:
          name: hikaricp_connections_active_percent
        target:
          type: AverageValue
          averageValue: "70"

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
          value: 10
          periodSeconds: 60
```

### Frontend HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: etl-solutions
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 10
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
```

## Vertical Scaling

### Resource Recommendations

#### Transformer Service

```yaml
# Small workload (< 1,000 msg/sec)
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"

# Medium workload (1,000 - 5,000 msg/sec)
resources:
  requests:
    memory: "1Gi"
    cpu: "1000m"
  limits:
    memory: "2Gi"
    cpu: "2000m"

# Large workload (> 5,000 msg/sec)
resources:
  requests:
    memory: "2Gi"
    cpu: "2000m"
  limits:
    memory: "4Gi"
    cpu: "4000m"
```

#### Business Service

```yaml
# Small workload
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"

# Medium workload
resources:
  requests:
    memory: "2Gi"
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"

# Large workload
resources:
  requests:
    memory: "4Gi"
    cpu: "2000m"
  limits:
    memory: "8Gi"
    cpu: "4000m"
```

### Vertical Pod Autoscaler (VPA)

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: transformer-vpa
  namespace: etl-solutions
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: transformer
  updatePolicy:
    updateMode: "Auto"  # or "Recreate" or "Initial"
  resourcePolicy:
    containerPolicies:
      - containerName: transformer
        minAllowed:
          cpu: 500m
          memory: 512Mi
        maxAllowed:
          cpu: 4000m
          memory: 8Gi
        controlledResources:
          - cpu
          - memory
```

## Kafka Scaling

### Add Kafka Brokers

```bash
# Scale Kafka StatefulSet
kubectl scale statefulset kafka -n etl-solutions --replicas=5

# Wait for new brokers to be ready
kubectl wait --for=condition=ready pod -l app=kafka -n etl-solutions --timeout=300s

# Verify brokers
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### Increase Partition Count

```bash
# Increase partitions for high-throughput topics
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 \
  --alter --topic partner.raw.events --partitions 20

# Verify partition count
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 \
  --describe --topic partner.raw.events
```

### Rebalance Partitions

```bash
# Generate partition reassignment plan
cat > topics-to-move.json <<EOF
{
  "topics": [
    {"topic": "partner.raw.events"},
    {"topic": "canonical.events"}
  ],
  "version": 1
}
EOF

# Generate reassignment
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \
  --topics-to-move-json-file /tmp/topics-to-move.json \
  --broker-list "0,1,2,3,4" --generate

# Execute reassignment
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \
  --reassignment-json-file /tmp/reassignment.json --execute

# Verify reassignment
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \
  --reassignment-json-file /tmp/reassignment.json --verify
```

## Database Scaling

### Read Replicas

```yaml
# PostgreSQL read replica
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-replica
  namespace: etl-solutions
spec:
  serviceName: postgres-replica
  replicas: 2
  selector:
    matchLabels:
      app: postgres-replica
  template:
    metadata:
      labels:
        app: postgres-replica
    spec:
      containers:
        - name: postgres
          image: postgres:15
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
            - name: POSTGRES_PRIMARY_HOST
              value: postgres-0.postgres-headless
            - name: POSTGRES_PRIMARY_PORT
              value: "5432"
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi
```

### Connection Pool Scaling

```yaml
# Increase connection pool size
apiVersion: v1
kind: ConfigMap
metadata:
  name: business-service-config
  namespace: etl-solutions
data:
  application.properties: |
    # Connection pool configuration
    quarkus.datasource.jdbc.max-size=50
    quarkus.datasource.jdbc.min-size=10
    quarkus.datasource.jdbc.initial-size=10

    # Connection timeout
    quarkus.datasource.jdbc.acquisition-timeout=30

    # Idle timeout
    quarkus.datasource.jdbc.idle-removal-interval=5M

    # Validation
    quarkus.datasource.jdbc.validation-query-sql=SELECT 1
```

### Database Sharding (Future)

```
┌─────────────────────────────────────────────────────────┐
│                   Database Sharding                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Shard by Partner ID                                   │
│  ├─ Shard 1: Partners A-F                             │
│  ├─ Shard 2: Partners G-M                             │
│  ├─ Shard 3: Partners N-S                             │
│  └─ Shard 4: Partners T-Z                             │
│                                                         │
│  Shard by Date                                         │
│  ├─ Shard 1: Current month                            │
│  ├─ Shard 2: Last month                               │
│  └─ Shard 3: Archive (> 2 months)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Cluster Autoscaling

### Cluster Autoscaler

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      serviceAccountName: cluster-autoscaler
      containers:
        - name: cluster-autoscaler
          image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.27.0
          command:
            - ./cluster-autoscaler
            - --v=4
            - --stderrthreshold=info
            - --cloud-provider=aws  # or gcp, azure
            - --skip-nodes-with-local-storage=false
            - --expander=least-waste
            - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/etl-solutions
            - --balance-similar-node-groups
            - --skip-nodes-with-system-pods=false
          resources:
            limits:
              cpu: 100m
              memory: 300Mi
            requests:
              cpu: 100m
              memory: 300Mi
```

### Node Pool Configuration

```yaml
# AWS EKS Node Group
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: etl-solutions
  region: us-east-1

nodeGroups:
  # General purpose nodes
  - name: general-purpose
    instanceType: t3.xlarge
    minSize: 3
    maxSize: 10
    desiredCapacity: 3
    volumeSize: 100
    labels:
      workload: general
    tags:
      k8s.io/cluster-autoscaler/enabled: "true"
      k8s.io/cluster-autoscaler/etl-solutions: "owned"

  # High-memory nodes for transformer
  - name: transformer-nodes
    instanceType: r5.2xlarge
    minSize: 2
    maxSize: 8
    desiredCapacity: 2
    volumeSize: 100
    labels:
      workload: transformer
    taints:
      - key: workload
        value: transformer
        effect: NoSchedule
    tags:
      k8s.io/cluster-autoscaler/enabled: "true"
      k8s.io/cluster-autoscaler/etl-solutions: "owned"

  # High-CPU nodes for business service
  - name: business-service-nodes
    instanceType: c5.2xlarge
    minSize: 2
    maxSize: 8
    desiredCapacity: 2
    volumeSize: 100
    labels:
      workload: business-service
    taints:
      - key: workload
        value: business-service
        effect: NoSchedule
    tags:
      k8s.io/cluster-autoscaler/enabled: "true"
      k8s.io/cluster-autoscaler/etl-solutions: "owned"
```

## Capacity Planning

### Traffic Patterns

```
┌─────────────────────────────────────────────────────────┐
│                   Daily Traffic Pattern                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Messages/sec                                          │
│  10,000 ┤                    ╭─╮                       │
│   8,000 ┤                 ╭──╯ ╰──╮                    │
│   6,000 ┤              ╭──╯       ╰──╮                 │
│   4,000 ┤           ╭──╯             ╰──╮              │
│   2,000 ┤        ╭──╯                   ╰──╮           │
│       0 ┼────────╯                         ╰────────   │
│         0  2  4  6  8  10 12 14 16 18 20 22 24        │
│                        Hour of Day                      │
│                                                         │
│  Peak Hours: 9 AM - 5 PM                               │
│  Off-Peak: 10 PM - 6 AM                                │
│  Weekend: 50% of weekday traffic                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Resource Calculation

```python
# Calculate required resources

# Input parameters
messages_per_second = 10000
transformation_time_ms = 50
cpu_per_transformation = 0.1  # CPU cores
memory_per_pod_mb = 2048
safety_margin = 1.5  # 50% overhead

# Calculate required pods
transformations_per_second = messages_per_second
cpu_per_pod = 2  # cores
transformations_per_pod = cpu_per_pod / cpu_per_transformation
pods_required = (transformations_per_second / transformations_per_pod) * safety_margin

print(f"Required pods: {int(pods_required)}")
print(f"Total CPU cores: {int(pods_required * cpu_per_pod)}")
print(f"Total memory: {int(pods_required * memory_per_pod_mb / 1024)} GB")

# Output:
# Required pods: 8
# Total CPU cores: 16
# Total memory: 16 GB
```

### Growth Projections

| Metric | Current | 3 Months | 6 Months | 12 Months |
|--------|---------|----------|----------|-----------|
| Messages/day | 100M | 250M | 500M | 1B |
| Partners | 50 | 100 | 200 | 500 |
| Peak msg/sec | 5,000 | 10,000 | 20,000 | 40,000 |
| Transformer pods | 5 | 10 | 20 | 40 |
| Business pods | 5 | 10 | 15 | 30 |
| Kafka brokers | 3 | 5 | 7 | 10 |
| DB replicas | 2 | 3 | 5 | 8 |
| Total CPU cores | 30 | 60 | 120 | 240 |
| Total memory (GB) | 60 | 120 | 240 | 480 |

## Scaling Procedures

### Scale Up Procedure

```bash
# 1. Monitor current load
kubectl top pods -n etl-solutions
kubectl top nodes

# 2. Check HPA status
kubectl get hpa -n etl-solutions

# 3. Manual scale if needed
kubectl scale deployment transformer -n etl-solutions --replicas=10

# 4. Verify scaling
kubectl get pods -n etl-solutions -l app=transformer

# 5. Monitor metrics
watch kubectl top pods -n etl-solutions -l app=transformer

# 6. Check consumer lag
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group transformer-group --describe
```

### Scale Down Procedure

```bash
# 1. Check current load
kubectl top pods -n etl-solutions

# 2. Verify low traffic
curl http://prometheus:9090/api/v1/query?query=rate(http_requests_total[5m])

# 3. Gradual scale down
kubectl scale deployment transformer -n etl-solutions --replicas=5

# 4. Wait and monitor
sleep 300
kubectl top pods -n etl-solutions

# 5. Continue if stable
kubectl scale deployment transformer -n etl-solutions --replicas=3

# 6. Verify consumer lag remains low
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group transformer-group --describe
```

## Performance Testing

### Load Test

```bash
# Install k6
brew install k6  # macOS
# or
apt-get install k6  # Ubuntu

# Run load test
k6 run --vus 100 --duration 30m load-test.js

# Monitor during test
watch kubectl top pods -n etl-solutions
watch kubectl get hpa -n etl-solutions
```

### Load Test Script

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '5m', target: 100 },   // Ramp up
    { duration: '20m', target: 100 },  // Steady state
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  const payload = JSON.stringify({
    eventId: `evt-${Date.now()}`,
    partnerId: 'test-partner',
    eventType: 'OrderCreated',
    payload: {
      order_id: `ORD-${Date.now()}`,
      customer_id: 'CUST-001',
      amount: 99.99,
    },
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://transformer-service/transform', payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

## Best Practices

### Scaling Strategy

1. **Start Small**: Begin with minimum replicas
2. **Monitor Closely**: Watch metrics during scaling
3. **Scale Gradually**: Avoid sudden large changes
4. **Test Thoroughly**: Load test before production
5. **Plan Capacity**: Project growth and plan ahead

### Auto-Scaling Configuration

1. **Set Appropriate Thresholds**: Balance responsiveness and stability
2. **Use Multiple Metrics**: CPU, memory, and custom metrics
3. **Configure Stabilization**: Prevent flapping
4. **Set Realistic Limits**: Min/max replicas based on capacity
5. **Monitor HPA Events**: Track scaling decisions

### Cost Optimization

1. **Right-Size Resources**: Don't over-provision
2. **Use Spot Instances**: For non-critical workloads
3. **Scale Down Off-Peak**: Reduce replicas during low traffic
4. **Use Reserved Instances**: For baseline capacity
5. **Monitor Costs**: Track spending per service

## Next Steps

1. **Configure HPA**: Set up auto-scaling for all services
2. **Load Test**: Verify scaling behavior under load
3. **Monitor Metrics**: Track scaling events and performance
4. **Plan Capacity**: Project growth and resource needs
5. **Optimize Costs**: Right-size resources and use cost-effective instances

## See Also

- [Performance Tuning](./07-performance-tuning.md)
- [Monitoring Dashboards](./01-monitoring-dashboards.md)
- [Troubleshooting Guide](./03-troubleshooting.md)
- [Runbook](./08-runbook.md)

---

**Last Updated**: May 10, 2026
**Version**: 1.0
