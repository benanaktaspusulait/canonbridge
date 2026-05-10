# Maintenance Guide

## Overview

This document outlines routine maintenance procedures for the ETL Solutions platform, including scheduled maintenance, updates, backups, and system health checks.

## Maintenance Schedule

### Daily Maintenance

| Task | Time | Duration | Owner |
|------|------|----------|-------|
| Health check review | 9:00 AM | 15 min | Operations |
| Log review | 10:00 AM | 30 min | Operations |
| Metrics review | 2:00 PM | 15 min | Operations |
| Backup verification | 11:00 PM | 10 min | Automated |

### Weekly Maintenance

| Task | Day | Time | Duration | Owner |
|------|-----|------|----------|-------|
| Performance review | Monday | 10:00 AM | 1 hour | Operations + Dev |
| Security updates | Tuesday | 2:00 PM | 2 hours | DevOps |
| Capacity planning | Wednesday | 3:00 PM | 1 hour | Operations |
| Alert review | Thursday | 10:00 AM | 30 min | Operations |
| Documentation update | Friday | 4:00 PM | 1 hour | Team |

### Monthly Maintenance

| Task | Week | Duration | Owner |
|------|------|----------|-------|
| Full system backup test | Week 1 | 4 hours | DevOps |
| Disaster recovery drill | Week 2 | 4 hours | Operations + DevOps |
| Performance optimization | Week 3 | 8 hours | Dev + Operations |
| Security audit | Week 4 | 8 hours | Security Team |

### Quarterly Maintenance

| Task | Duration | Owner |
|------|----------|-------|
| Major version upgrades | 2 days | DevOps + Dev |
| Architecture review | 1 day | Architects + Leads |
| Capacity planning review | 4 hours | Operations + Management |
| Cost optimization | 1 day | DevOps + Finance |

## Daily Maintenance Procedures

### Morning Health Check

```bash
#!/bin/bash
# daily-health-check.sh

echo "=== ETL Solutions Daily Health Check ==="
echo "Date: $(date)"
echo ""

# 1. Check pod status
echo "1. Pod Status:"
kubectl get pods -n etl-solutions | grep -v Running | grep -v Completed || echo "All pods running"
echo ""

# 2. Check service endpoints
echo "2. Service Endpoints:"
kubectl get endpoints -n etl-solutions
echo ""

# 3. Check PVC status
echo "3. Persistent Volume Claims:"
kubectl get pvc -n etl-solutions
echo ""

# 4. Check recent events
echo "4. Recent Events (last 1 hour):"
kubectl get events -n etl-solutions --sort-by='.lastTimestamp' | tail -20
echo ""

# 5. Check resource usage
echo "5. Resource Usage:"
kubectl top pods -n etl-solutions
echo ""

# 6. Check Kafka consumer lag
echo "6. Kafka Consumer Lag:"
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group transformer-group --describe | grep -v "PARTITION\|^$"
echo ""

# 7. Check error rates
echo "7. Error Rates (last 1 hour):"
curl -s 'http://prometheus:9090/api/v1/query?query=rate(transformation_error_total[1h])' | \
  jq -r '.data.result[] | "\(.metric.partner_id): \(.value[1])"'
echo ""

# 8. Check DLQ messages
echo "8. DLQ Message Count:"
curl -s 'http://prometheus:9090/api/v1/query?query=dlq_messages_total' | \
  jq -r '.data.result[] | "\(.metric.partner_id): \(.value[1])"'
echo ""

echo "=== Health Check Complete ==="
```

### Log Review

```bash
#!/bin/bash
# daily-log-review.sh

echo "=== Daily Log Review ==="
echo "Date: $(date)"
echo ""

# 1. Check for errors in last 24 hours
echo "1. Error Summary (last 24 hours):"
kubectl logs -n etl-solutions -l app=transformer --since=24h | \
  grep -i error | wc -l
echo ""

# 2. Top error messages
echo "2. Top Error Messages:"
kubectl logs -n etl-solutions -l app=transformer --since=24h | \
  grep -i error | sort | uniq -c | sort -rn | head -10
echo ""

# 3. Check for warnings
echo "3. Warning Summary:"
kubectl logs -n etl-solutions -l app=transformer --since=24h | \
  grep -i warn | wc -l
echo ""

# 4. Check for slow transformations
echo "4. Slow Transformations (> 1s):"
kubectl logs -n etl-solutions -l app=transformer --since=24h | \
  grep "transformation_duration" | awk '$5 > 1000' | wc -l
echo ""

# 5. Check for database errors
echo "5. Database Errors:"
kubectl logs -n etl-solutions -l app=business-service --since=24h | \
  grep -i "database\|sql" | grep -i error | wc -l
echo ""

echo "=== Log Review Complete ==="
```

## Weekly Maintenance Procedures

### Security Updates

```bash
#!/bin/bash
# weekly-security-updates.sh

echo "=== Weekly Security Updates ==="
echo "Date: $(date)"
echo ""

# 1. Check for image vulnerabilities
echo "1. Scanning images for vulnerabilities..."
for image in $(kubectl get pods -n etl-solutions -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n' | sort -u); do
  echo "Scanning: $image"
  trivy image --severity HIGH,CRITICAL $image
done
echo ""

# 2. Update base images
echo "2. Checking for base image updates..."
docker pull node:18-alpine
docker pull openjdk:21-jdk-slim
docker pull postgres:15
docker pull confluentinc/cp-kafka:7.5.0
echo ""

# 3. Update Kubernetes components
echo "3. Checking Kubernetes component updates..."
kubectl version
helm list -n etl-solutions
echo ""

# 4. Update dependencies
echo "4. Checking dependency updates..."
# Run in each service directory
# npm outdated
# mvn versions:display-dependency-updates
echo ""

echo "=== Security Updates Complete ==="
```

### Performance Review

```bash
#!/bin/bash
# weekly-performance-review.sh

echo "=== Weekly Performance Review ==="
echo "Date: $(date)"
echo ""

# 1. Average response times
echo "1. Average Response Times (last 7 days):"
curl -s 'http://prometheus:9090/api/v1/query?query=avg_over_time(http_request_duration_ms[7d])' | \
  jq -r '.data.result[] | "\(.metric.job): \(.value[1])ms"'
echo ""

# 2. Throughput
echo "2. Average Throughput (msg/sec, last 7 days):"
curl -s 'http://prometheus:9090/api/v1/query?query=avg_over_time(rate(transformation_success_total[7d])[7d:])' | \
  jq -r '.data.result[] | "\(.metric.partner_id): \(.value[1])"'
echo ""

# 3. Error rates
echo "3. Error Rates (last 7 days):"
curl -s 'http://prometheus:9090/api/v1/query?query=avg_over_time(rate(transformation_error_total[7d])[7d:])' | \
  jq -r '.data.result[] | "\(.metric.partner_id): \(.value[1])"'
echo ""

# 4. Resource utilization
echo "4. Average Resource Utilization:"
kubectl top pods -n etl-solutions
echo ""

# 5. Database performance
echo "5. Database Query Performance:"
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
echo ""

echo "=== Performance Review Complete ==="
```

## Monthly Maintenance Procedures

### Full Backup Test

```bash
#!/bin/bash
# monthly-backup-test.sh

echo "=== Monthly Backup Test ==="
echo "Date: $(date)"
echo ""

# 1. Create full backup
echo "1. Creating full backup..."
BACKUP_DATE=$(date +%Y%m%d)

# Backup PostgreSQL
kubectl exec -n etl-solutions postgres-0 -- \
  pg_dump -U etluser -d etldb -F c -f /backups/etldb-${BACKUP_DATE}.dump
echo "PostgreSQL backup created"

# Backup Kafka topics
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-mirror-maker.sh --consumer.config /tmp/consumer.properties \
  --producer.config /tmp/producer.properties \
  --whitelist ".*" --num.streams 2
echo "Kafka backup created"

# Backup configurations
kubectl get configmaps -n etl-solutions -o yaml > configmaps-${BACKUP_DATE}.yaml
kubectl get secrets -n etl-solutions -o yaml > secrets-${BACKUP_DATE}.yaml
echo "Configuration backup created"
echo ""

# 2. Test restore in test environment
echo "2. Testing restore in test environment..."
# Create test namespace
kubectl create namespace etl-solutions-test

# Restore PostgreSQL
kubectl exec -n etl-solutions-test postgres-0 -- \
  pg_restore -U etluser -d etldb /backups/etldb-${BACKUP_DATE}.dump
echo "PostgreSQL restore tested"

# Verify data
kubectl exec -n etl-solutions-test postgres-0 -- \
  psql -U etluser -d etldb -c "SELECT COUNT(*) FROM orders;"
echo "Data verification complete"

# Cleanup test environment
kubectl delete namespace etl-solutions-test
echo ""

# 3. Verify backup integrity
echo "3. Verifying backup integrity..."
md5sum /backups/etldb-${BACKUP_DATE}.dump
echo ""

# 4. Upload to remote storage
echo "4. Uploading to remote storage..."
aws s3 cp /backups/etldb-${BACKUP_DATE}.dump \
  s3://etl-solutions-backups/monthly/${BACKUP_DATE}/
echo "Upload complete"
echo ""

echo "=== Backup Test Complete ==="
```

### Disaster Recovery Drill

```bash
#!/bin/bash
# monthly-dr-drill.sh

echo "=== Disaster Recovery Drill ==="
echo "Date: $(date)"
echo ""

# 1. Simulate failure
echo "1. Simulating complete cluster failure..."
kubectl scale deployment --all --replicas=0 -n etl-solutions
kubectl scale statefulset --all --replicas=0 -n etl-solutions
echo "All services stopped"
echo ""

# 2. Wait for monitoring to detect
echo "2. Waiting for monitoring to detect failure..."
sleep 60
echo ""

# 3. Execute recovery procedure
echo "3. Executing recovery procedure..."

# Restore infrastructure
kubectl scale statefulset kafka -n etl-solutions --replicas=3
kubectl scale statefulset postgres -n etl-solutions --replicas=1
kubectl wait --for=condition=ready pod -l app=kafka -n etl-solutions --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres -n etl-solutions --timeout=300s
echo "Infrastructure restored"

# Restore applications
kubectl scale deployment transformer -n etl-solutions --replicas=3
kubectl scale deployment business-service -n etl-solutions --replicas=3
kubectl scale deployment frontend -n etl-solutions --replicas=2
kubectl wait --for=condition=ready pod -l app=transformer -n etl-solutions --timeout=300s
echo "Applications restored"
echo ""

# 4. Verify recovery
echo "4. Verifying recovery..."
curl http://transformer-service:3000/health/ready
curl http://business-service:8080/health/ready
echo "Health checks passed"

# Check consumer lag
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group transformer-group --describe
echo "Consumer lag checked"
echo ""

# 5. Calculate RTO/RPO
echo "5. Recovery Time Objective (RTO): $(date)"
echo "Recovery Point Objective (RPO): Last backup"
echo ""

echo "=== DR Drill Complete ==="
```

## Database Maintenance

### Vacuum and Analyze

```bash
#!/bin/bash
# database-maintenance.sh

echo "=== Database Maintenance ==="
echo "Date: $(date)"
echo ""

# 1. Vacuum full database
echo "1. Running VACUUM ANALYZE..."
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c "VACUUM ANALYZE;"
echo ""

# 2. Reindex tables
echo "2. Reindexing tables..."
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c "REINDEX DATABASE etldb;"
echo ""

# 3. Update statistics
echo "3. Updating statistics..."
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c "ANALYZE;"
echo ""

# 4. Check for bloat
echo "4. Checking for table bloat..."
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
echo ""

# 5. Archive old data
echo "5. Archiving old data (> 90 days)..."
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "DELETE FROM events WHERE created_at < NOW() - INTERVAL '90 days';"
echo ""

echo "=== Database Maintenance Complete ==="
```

### Index Maintenance

```sql
-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Remove unused indexes
DROP INDEX IF EXISTS idx_unused_index;

-- Create missing indexes
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);
CREATE INDEX CONCURRENTLY idx_events_created_at ON events(created_at);
CREATE INDEX CONCURRENTLY idx_events_partner_id ON events(partner_id);
```

## Kafka Maintenance

### Topic Cleanup

```bash
#!/bin/bash
# kafka-maintenance.sh

echo "=== Kafka Maintenance ==="
echo "Date: $(date)"
echo ""

# 1. Check disk usage
echo "1. Checking disk usage..."
kubectl exec -n etl-solutions kafka-0 -- df -h /var/lib/kafka
echo ""

# 2. Clean up old segments
echo "2. Cleaning up old segments..."
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-configs.sh --bootstrap-server localhost:9092 \
  --entity-type topics --entity-name partner.raw.events \
  --alter --add-config retention.ms=604800000  # 7 days
echo ""

# 3. Check under-replicated partitions
echo "3. Checking under-replicated partitions..."
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 \
  --describe --under-replicated-partitions
echo ""

# 4. Rebalance partitions
echo "4. Checking partition balance..."
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 --describe
echo ""

# 5. Compact topics
echo "5. Running log compaction..."
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-configs.sh --bootstrap-server localhost:9092 \
  --entity-type topics --entity-name canonical.events \
  --alter --add-config cleanup.policy=compact
echo ""

echo "=== Kafka Maintenance Complete ==="
```

## Certificate Renewal

```bash
#!/bin/bash
# certificate-renewal.sh

echo "=== Certificate Renewal ==="
echo "Date: $(date)"
echo ""

# 1. Check certificate expiration
echo "1. Checking certificate expiration..."
kubectl get certificates -n etl-solutions
echo ""

# 2. Renew certificates
echo "2. Renewing certificates..."
kubectl delete certificate etl-solutions-tls -n etl-solutions
kubectl apply -f k8s/certificates/etl-solutions-tls.yaml
echo ""

# 3. Verify new certificates
echo "3. Verifying new certificates..."
kubectl describe certificate etl-solutions-tls -n etl-solutions
echo ""

# 4. Restart services to pick up new certificates
echo "4. Restarting services..."
kubectl rollout restart deployment/transformer -n etl-solutions
kubectl rollout restart deployment/business-service -n etl-solutions
kubectl rollout restart deployment/frontend -n etl-solutions
echo ""

echo "=== Certificate Renewal Complete ==="
```

## Maintenance Windows

### Scheduled Maintenance

```yaml
# Maintenance window configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: maintenance-schedule
  namespace: etl-solutions
data:
  schedule: |
    # Weekly maintenance window
    # Every Sunday 2:00 AM - 4:00 AM UTC
    0 2 * * 0
    
    # Monthly maintenance window
    # First Sunday of month 2:00 AM - 6:00 AM UTC
    0 2 1-7 * 0
```

### Maintenance Mode

```bash
#!/bin/bash
# enable-maintenance-mode.sh

echo "=== Enabling Maintenance Mode ==="

# 1. Set maintenance flag
kubectl create configmap maintenance-mode \
  --from-literal=enabled=true \
  -n etl-solutions

# 2. Scale down non-critical services
kubectl scale deployment frontend -n etl-solutions --replicas=1

# 3. Stop consuming from Kafka
kubectl scale deployment transformer -n etl-solutions --replicas=0

# 4. Update ingress to show maintenance page
kubectl apply -f k8s/maintenance/maintenance-ingress.yaml

echo "=== Maintenance Mode Enabled ==="
```

## Best Practices

### Maintenance Planning

1. **Schedule During Low Traffic**: Perform maintenance during off-peak hours
2. **Communicate Early**: Notify stakeholders 48 hours in advance
3. **Have Rollback Plan**: Prepare rollback procedures
4. **Test in Staging**: Test all maintenance procedures in staging first
5. **Monitor Closely**: Watch metrics during and after maintenance

### Documentation

1. **Document Procedures**: Keep runbooks up-to-date
2. **Record Changes**: Log all maintenance activities
3. **Track Issues**: Document problems and solutions
4. **Share Knowledge**: Conduct post-maintenance reviews
5. **Update Schedules**: Keep maintenance schedules current

### Automation

1. **Automate Routine Tasks**: Use cron jobs for daily/weekly tasks
2. **Use GitOps**: Manage configurations with Git
3. **Implement CI/CD**: Automate deployments
4. **Monitor Automation**: Alert on automation failures
5. **Test Automation**: Regularly verify automated procedures

## Next Steps

1. **Set Up Automation**: Automate routine maintenance tasks
2. **Create Runbooks**: Document all procedures
3. **Schedule Maintenance**: Plan maintenance windows
4. **Train Team**: Ensure team knows maintenance procedures
5. **Review Regularly**: Update procedures based on lessons learned

## See Also

- [Disaster Recovery](./06-disaster-recovery.md)
- [Troubleshooting Guide](./03-troubleshooting.md)
- [Runbook](./08-runbook.md)
- [Monitoring Dashboards](./01-monitoring-dashboards.md)

---

**Last Updated**: May 10, 2026  
**Version**: 1.0
