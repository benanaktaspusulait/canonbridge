# Troubleshooting Guide

## Overview

This guide provides step-by-step troubleshooting procedures for common issues in the CanonBridge platform.

## Quick Diagnostic Commands

```bash
# Check all pod status
kubectl get pods -n etl-solutions

# Check pod logs
kubectl logs -n etl-solutions <pod-name> --tail=100

# Check pod events
kubectl describe pod -n etl-solutions <pod-name>

# Check service endpoints
kubectl get endpoints -n etl-solutions

# Check Kafka topics
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check consumer lag
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group transformer-group --describe
```

## Common Issues

### 1. Service Not Starting

#### Symptoms
- Pod in `CrashLoopBackOff` state
- Pod in `Error` state
- Service not responding to health checks

#### Diagnosis

```bash
# Check pod status
kubectl get pods -n etl-solutions

# Check pod logs
kubectl logs -n etl-solutions <pod-name>

# Check pod events
kubectl describe pod -n etl-solutions <pod-name>

# Check resource limits
kubectl describe pod -n etl-solutions <pod-name> | grep -A 5 "Limits"
```

#### Common Causes & Solutions

**1. Configuration Error**

```bash
# Check ConfigMap
kubectl get configmap -n etl-solutions transformer-config -o yaml

# Verify environment variables
kubectl exec -n etl-solutions <pod-name> -- env | grep -i config

# Solution: Fix configuration
kubectl edit configmap -n etl-solutions transformer-config
kubectl rollout restart deployment/transformer -n etl-solutions
```

**2. Resource Limits**

```bash
# Check resource usage
kubectl top pod -n etl-solutions <pod-name>

# Solution: Increase limits
kubectl edit deployment -n etl-solutions transformer
# Update resources.limits.memory and resources.limits.cpu
```

**3. Dependency Not Available**

```bash
# Check Kafka connectivity
kubectl exec -n etl-solutions <pod-name> -- \
  nc -zv kafka-0.kafka-headless 9092

# Check PostgreSQL connectivity
kubectl exec -n etl-solutions <pod-name> -- \
  nc -zv postgres 5432

# Solution: Ensure dependencies are running
kubectl get pods -n etl-solutions | grep -E "kafka|postgres"
```

### 2. High Consumer Lag

#### Symptoms
- Kafka consumer lag increasing
- Messages not being processed
- Delayed event processing

#### Diagnosis

```bash
# Check consumer lag
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group transformer-group --describe

# Check consumer metrics
curl http://transformer-service:9090/metrics | grep kafka_consumer_lag

# Check pod CPU/memory
kubectl top pod -n etl-solutions -l app=transformer
```

#### Solutions

**1. Scale Up Consumers**

```bash
# Increase replicas
kubectl scale deployment transformer -n etl-solutions --replicas=5

# Verify scaling
kubectl get pods -n etl-solutions -l app=transformer
```

**2. Increase Worker Pool Size**

```bash
# Update worker pool configuration
kubectl edit configmap -n etl-solutions transformer-config
# Set WORKER_POOL_SIZE=8

# Restart pods
kubectl rollout restart deployment/transformer -n etl-solutions
```

**3. Optimize Transformation Logic**

```bash
# Check transformation duration
curl http://transformer-service:9090/metrics | grep transformation_duration_ms

# Review slow transformations
kubectl logs -n etl-solutions -l app=transformer | \
  grep "transformation_duration" | sort -k5 -n | tail -20
```

### 3. High Error Rate

#### Symptoms
- Increasing DLQ messages
- High transformation_error_total metric
- Partner integration failures

#### Diagnosis

```bash
# Check error metrics
curl http://transformer-service:9090/metrics | grep transformation_error_total

# Check DLQ topic
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic transformation.dlq --from-beginning --max-messages 10

# Check error logs
kubectl logs -n etl-solutions -l app=transformer | grep -i error
```

#### Solutions

**1. Schema Validation Errors**

```bash
# Check validation errors
kubectl logs -n etl-solutions -l app=transformer | \
  grep "schema validation failed"

# Solution: Update schema or fix partner payload
# Review schema: partners/<partner-id>/<event-type>/input.v1.schema.json
# Contact partner if payload format changed
```

**2. Mapping Errors**

```bash
# Check mapping errors
kubectl logs -n etl-solutions -l app=transformer | \
  grep "mapping error"

# Test mapping locally
npm run test:mapping -- --partner=<partner-id> --event=<event-type>

# Solution: Fix JSONata mapping
# Edit: partners/<partner-id>/<event-type>/inbound.v1.jsonata
```

**3. Downstream Service Errors**

```bash
# Check business service logs
kubectl logs -n etl-solutions -l app=business-service | grep -i error

# Check database connectivity
kubectl exec -n etl-solutions business-service-0 -- \
  pg_isready -h postgres -p 5432

# Solution: Fix downstream service or database
```

### 4. Database Connection Issues

#### Symptoms
- Connection pool exhausted
- Slow query performance
- Database connection timeouts

#### Diagnosis

```bash
# Check connection pool metrics
curl http://business-service:8080/metrics | grep hikaricp_connections

# Check active connections
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Check slow queries
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

#### Solutions

**1. Increase Connection Pool Size**

```bash
# Update connection pool configuration
kubectl edit configmap -n etl-solutions business-service-config
# Set DB_POOL_SIZE=50

# Restart service
kubectl rollout restart deployment/business-service -n etl-solutions
```

**2. Optimize Slow Queries**

```bash
# Analyze query plan
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = '123';"

# Add missing indexes
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "CREATE INDEX idx_orders_customer_id ON orders(customer_id);"
```

**3. Check Database Resources**

```bash
# Check database pod resources
kubectl top pod -n etl-solutions postgres-0

# Increase resources if needed
kubectl edit statefulset -n etl-solutions postgres
```

### 5. Kafka Broker Issues

#### Symptoms
- Kafka broker down
- Under-replicated partitions
- High produce/consume latency

#### Diagnosis

```bash
# Check broker status
kubectl get pods -n etl-solutions -l app=kafka

# Check broker logs
kubectl logs -n etl-solutions kafka-0

# Check cluster health
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# Check under-replicated partitions
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 --describe --under-replicated-partitions
```

#### Solutions

**1. Restart Failed Broker**

```bash
# Delete pod to restart
kubectl delete pod -n etl-solutions kafka-0

# Wait for pod to be ready
kubectl wait --for=condition=ready pod -n etl-solutions kafka-0 --timeout=300s
```

**2. Increase Broker Resources**

```bash
# Edit StatefulSet
kubectl edit statefulset -n etl-solutions kafka

# Update resources
spec:
  template:
    spec:
      containers:
      - name: kafka
        resources:
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

**3. Rebalance Partitions**

```bash
# Generate reassignment plan
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \
  --topics-to-move-json-file /tmp/topics.json \
  --broker-list "0,1,2" --generate

# Execute reassignment
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \
  --reassignment-json-file /tmp/reassignment.json --execute
```

### 6. Memory Leaks

#### Symptoms
- Increasing memory usage over time
- OOMKilled pods
- Slow performance

#### Diagnosis

```bash
# Monitor memory usage
kubectl top pod -n etl-solutions -l app=transformer --watch

# Check OOMKilled events
kubectl get events -n etl-solutions | grep OOMKilled

# Get heap dump (Node.js)
kubectl exec -n etl-solutions transformer-0 -- \
  node --expose-gc --inspect=0.0.0.0:9229 &
# Connect with Chrome DevTools and take heap snapshot
```

#### Solutions

**1. Increase Memory Limits**

```bash
# Temporary fix: increase memory
kubectl edit deployment -n etl-solutions transformer
# Update resources.limits.memory: "2Gi"
```

**2. Fix Memory Leak**

```bash
# Analyze heap dump
# Look for retained objects
# Fix code and redeploy

# Common causes:
# - Event listeners not removed
# - Caches not bounded
# - Circular references
# - Large objects in closures
```

**3. Enable Garbage Collection Logging**

```bash
# Add GC flags (Node.js)
kubectl edit deployment -n etl-solutions transformer
# Add to args: --expose-gc --trace-gc

# Monitor GC activity
kubectl logs -n etl-solutions transformer-0 | grep "Scavenge\|Mark-sweep"
```

### 7. Network Issues

#### Symptoms
- Service timeouts
- Connection refused errors
- DNS resolution failures

#### Diagnosis

```bash
# Check service endpoints
kubectl get endpoints -n etl-solutions

# Test DNS resolution
kubectl exec -n etl-solutions transformer-0 -- \
  nslookup kafka-0.kafka-headless.etl-solutions.svc.cluster.local

# Test connectivity
kubectl exec -n etl-solutions transformer-0 -- \
  curl -v http://business-service:8080/health

# Check network policies
kubectl get networkpolicies -n etl-solutions
```

#### Solutions

**1. Fix Service Configuration**

```bash
# Check service definition
kubectl get svc -n etl-solutions transformer-service -o yaml

# Verify selector matches pods
kubectl get pods -n etl-solutions -l app=transformer --show-labels
```

**2. Update Network Policies**

```bash
# Allow traffic between services
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-transformer-to-kafka
  namespace: etl-solutions
spec:
  podSelector:
    matchLabels:
      app: transformer
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: kafka
    ports:
    - protocol: TCP
      port: 9092
EOF
```

### 8. Deployment Failures

#### Symptoms
- Deployment stuck in progress
- Pods not reaching ready state
- Rollout timeout

#### Diagnosis

```bash
# Check deployment status
kubectl rollout status deployment/transformer -n etl-solutions

# Check replica sets
kubectl get rs -n etl-solutions -l app=transformer

# Check pod events
kubectl get events -n etl-solutions --sort-by='.lastTimestamp'
```

#### Solutions

**1. Rollback Deployment**

```bash
# Rollback to previous version
kubectl rollout undo deployment/transformer -n etl-solutions

# Rollback to specific revision
kubectl rollout undo deployment/transformer -n etl-solutions --to-revision=2
```

**2. Fix Image Pull Errors**

```bash
# Check image pull secrets
kubectl get secrets -n etl-solutions

# Create image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<username> \
  --docker-password=<password> \
  -n etl-solutions

# Update deployment to use secret
kubectl patch deployment transformer -n etl-solutions \
  -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"regcred"}]}}}}'
```

## Diagnostic Tools

### Log Analysis

```bash
# Search logs for errors
kubectl logs -n etl-solutions -l app=transformer --since=1h | grep -i error

# Follow logs in real-time
kubectl logs -n etl-solutions -l app=transformer -f

# Export logs for analysis
kubectl logs -n etl-solutions transformer-0 > transformer.log
```

### Metrics Analysis

```bash
# Query Prometheus
curl 'http://prometheus:9090/api/v1/query?query=rate(http_requests_total[5m])'

# Check specific metric
curl http://transformer-service:9090/metrics | grep transformation_duration_ms
```

### Distributed Tracing

```bash
# Access Jaeger UI
kubectl port-forward -n monitoring svc/jaeger-query 16686:16686

# Open http://localhost:16686
# Search for traces by service, operation, or tags
```

## Emergency Procedures

### Complete System Restart

```bash
# 1. Scale down all services
kubectl scale deployment --all --replicas=0 -n etl-solutions

# 2. Restart Kafka
kubectl rollout restart statefulset/kafka -n etl-solutions
kubectl wait --for=condition=ready pod -l app=kafka -n etl-solutions --timeout=300s

# 3. Restart PostgreSQL
kubectl rollout restart statefulset/postgres -n etl-solutions
kubectl wait --for=condition=ready pod -l app=postgres -n etl-solutions --timeout=300s

# 4. Scale up services
kubectl scale deployment transformer --replicas=3 -n etl-solutions
kubectl scale deployment business-service --replicas=3 -n etl-solutions
kubectl scale deployment frontend --replicas=2 -n etl-solutions
```

### Data Recovery

```bash
# Restore from backup
kubectl exec -n etl-solutions postgres-0 -- \
  pg_restore -U etluser -d etldb /backups/etldb-backup.dump

# Replay Kafka messages
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic partner.raw.events --from-beginning | \
  kafka-console-producer.sh --bootstrap-server localhost:9092 \
  --topic partner.raw.events.replay
```

## Prevention

### Proactive Monitoring

1. **Set Up Alerts**: Configure alerts for all critical metrics
2. **Regular Health Checks**: Monitor dashboards daily
3. **Capacity Planning**: Review resource usage weekly
4. **Performance Testing**: Run load tests before major releases
5. **Chaos Engineering**: Test failure scenarios regularly

### Best Practices

1. **Use Health Checks**: Implement liveness and readiness probes
2. **Set Resource Limits**: Prevent resource exhaustion
3. **Enable Logging**: Structured logging with correlation IDs
4. **Implement Retries**: With exponential backoff
5. **Use Circuit Breakers**: Prevent cascade failures

## Next Steps

1. **Review Runbook**: See [08-runbook.md](./08-runbook.md) for operational procedures
2. **Check Monitoring**: See [01-monitoring-dashboards.md](./01-monitoring-dashboards.md)
3. **Review Alerts**: See [02-alerting-strategy.md](./02-alerting-strategy.md)
4. **Plan Disaster Recovery**: See [06-disaster-recovery.md](./06-disaster-recovery.md)

## See Also

- [Monitoring Dashboards](./01-monitoring-dashboards.md)
- [Alerting Strategy](./02-alerting-strategy.md)
- [Scaling Guide](./04-scaling.md)
- [Performance Tuning](./07-performance-tuning.md)
- [Runbook](./08-runbook.md)

---

**Last Updated**: May 10, 2026
**Version**: 1.0
