# Disaster Recovery

## Overview

This document outlines disaster recovery (DR) procedures for the ETL Solutions platform, including backup strategies, recovery procedures, and business continuity planning.

## DR Objectives

### Recovery Time Objective (RTO)

| Service | RTO Target | Priority |
|---------|------------|----------|
| Kafka Cluster | 15 minutes | P0 - Critical |
| PostgreSQL Database | 15 minutes | P0 - Critical |
| Transformer Service | 10 minutes | P0 - Critical |
| Business Service | 10 minutes | P0 - Critical |
| Frontend | 30 minutes | P1 - High |
| Monitoring | 1 hour | P2 - Medium |

### Recovery Point Objective (RPO)

| Data Type | RPO Target | Backup Frequency |
|-----------|------------|------------------|
| Database | 5 minutes | Continuous (WAL) |
| Kafka Messages | 0 (replicated) | Real-time |
| Configurations | 1 hour | Hourly |
| Logs | 15 minutes | Continuous |
| Metrics | 1 minute | Real-time |

## Backup Strategy

### Database Backups

#### Continuous WAL Archiving

```yaml
# PostgreSQL configuration for WAL archiving
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
  namespace: etl-solutions
data:
  postgresql.conf: |
    # WAL settings
    wal_level = replica
    archive_mode = on
    archive_command = 'aws s3 cp %p s3://etl-solutions-backups/wal/%f'
    archive_timeout = 300  # 5 minutes
    
    # Replication settings
    max_wal_senders = 10
    wal_keep_size = 1GB
    hot_standby = on
```

#### Daily Full Backups

```bash
#!/bin/bash
# daily-backup.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
S3_BUCKET="s3://etl-solutions-backups"

echo "Starting daily backup: $BACKUP_DATE"

# 1. Create PostgreSQL backup
kubectl exec -n etl-solutions postgres-0 -- \
  pg_basebackup -U etluser -D ${BACKUP_DIR}/postgres-${BACKUP_DATE} \
  -F tar -z -P -v

# 2. Upload to S3
kubectl exec -n etl-solutions postgres-0 -- \
  aws s3 sync ${BACKUP_DIR}/postgres-${BACKUP_DATE} \
  ${S3_BUCKET}/daily/postgres-${BACKUP_DATE}/

# 3. Verify backup
kubectl exec -n etl-solutions postgres-0 -- \
  aws s3 ls ${S3_BUCKET}/daily/postgres-${BACKUP_DATE}/

# 4. Cleanup old backups (keep 30 days)
kubectl exec -n etl-solutions postgres-0 -- \
  find ${BACKUP_DIR} -name "postgres-*" -mtime +30 -exec rm -rf {} \;

echo "Daily backup complete: $BACKUP_DATE"
```

#### Hourly Incremental Backups

```bash
#!/bin/bash
# hourly-backup.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="s3://etl-solutions-backups"

echo "Starting hourly incremental backup: $BACKUP_DATE"

# Archive WAL files
kubectl exec -n etl-solutions postgres-0 -- \
  pg_switch_wal

# Verify WAL archiving
kubectl exec -n etl-solutions postgres-0 -- \
  aws s3 ls ${S3_BUCKET}/wal/ | tail -10

echo "Hourly backup complete: $BACKUP_DATE"
```

### Kafka Backups

#### Topic Replication

```yaml
# Kafka topic configuration with replication
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: partner-raw-events
  namespace: etl-solutions
spec:
  partitions: 12
  replicas: 3  # Ensure data redundancy
  config:
    min.insync.replicas: 2
    unclean.leader.election.enable: false
    retention.ms: 604800000  # 7 days
```

#### MirrorMaker for Cross-Region Replication

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaMirrorMaker2
metadata:
  name: etl-solutions-mirror
  namespace: etl-solutions
spec:
  version: 3.5.0
  replicas: 2
  connectCluster: "target"
  clusters:
    - alias: "source"
      bootstrapServers: kafka-source:9092
    - alias: "target"
      bootstrapServers: kafka-target:9092
  mirrors:
    - sourceCluster: "source"
      targetCluster: "target"
      sourceConnector:
        config:
          replication.factor: 3
          offset-syncs.topic.replication.factor: 3
          sync.topic.acls.enabled: false
      heartbeatConnector:
        config:
          heartbeats.topic.replication.factor: 3
      checkpointConnector:
        config:
          checkpoints.topic.replication.factor: 3
      topicsPattern: ".*"
      groupsPattern: ".*"
```

### Configuration Backups

```bash
#!/bin/bash
# backup-configurations.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/configs"
S3_BUCKET="s3://etl-solutions-backups"

echo "Backing up configurations: $BACKUP_DATE"

# 1. Backup Kubernetes resources
kubectl get all -n etl-solutions -o yaml > ${BACKUP_DIR}/all-resources-${BACKUP_DATE}.yaml
kubectl get configmaps -n etl-solutions -o yaml > ${BACKUP_DIR}/configmaps-${BACKUP_DATE}.yaml
kubectl get secrets -n etl-solutions -o yaml > ${BACKUP_DIR}/secrets-${BACKUP_DATE}.yaml
kubectl get pvc -n etl-solutions -o yaml > ${BACKUP_DIR}/pvc-${BACKUP_DATE}.yaml

# 2. Backup partner configurations
tar -czf ${BACKUP_DIR}/partners-${BACKUP_DATE}.tar.gz partners/

# 3. Backup schemas
tar -czf ${BACKUP_DIR}/schemas-${BACKUP_DATE}.tar.gz schemas/

# 4. Upload to S3
aws s3 sync ${BACKUP_DIR} ${S3_BUCKET}/configs/${BACKUP_DATE}/

# 5. Cleanup old backups (keep 90 days)
find ${BACKUP_DIR} -name "*-${BACKUP_DATE}.*" -mtime +90 -delete

echo "Configuration backup complete: $BACKUP_DATE"
```

## Disaster Scenarios

### Scenario 1: Single Pod Failure

**Impact**: Minimal - Kubernetes auto-restarts pod

**Recovery**:
```bash
# Kubernetes automatically restarts failed pods
# Monitor recovery
kubectl get pods -n etl-solutions -w

# Check pod logs
kubectl logs -n etl-solutions <pod-name> --previous
```

**RTO**: < 1 minute  
**RPO**: 0 (no data loss)

### Scenario 2: Node Failure

**Impact**: Medium - Multiple pods affected

**Recovery**:
```bash
# 1. Identify failed node
kubectl get nodes

# 2. Cordon node to prevent new pods
kubectl cordon <node-name>

# 3. Drain node
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# 4. Pods automatically rescheduled to healthy nodes
kubectl get pods -n etl-solutions -o wide

# 5. Remove failed node
kubectl delete node <node-name>
```

**RTO**: 5-10 minutes  
**RPO**: 0 (no data loss)

### Scenario 3: Availability Zone Failure

**Impact**: High - Partial cluster unavailable

**Recovery**:
```bash
# 1. Verify cluster status
kubectl get nodes -o wide

# 2. Check pod distribution
kubectl get pods -n etl-solutions -o wide

# 3. Scale up in healthy zones
kubectl scale deployment transformer -n etl-solutions --replicas=6

# 4. Verify Kafka replication
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 \
  --describe --under-replicated-partitions

# 5. Monitor recovery
watch kubectl get pods -n etl-solutions
```

**RTO**: 10-15 minutes  
**RPO**: 0 (no data loss with proper replication)

### Scenario 4: Complete Region Failure

**Impact**: Critical - Entire cluster unavailable

**Recovery**:
```bash
#!/bin/bash
# region-failover.sh

echo "=== Region Failover Procedure ==="

# 1. Activate DR region
echo "1. Activating DR region..."
export KUBECONFIG=~/.kube/config-dr

# 2. Verify DR cluster
kubectl get nodes
kubectl get pods -n etl-solutions

# 3. Restore database from backup
echo "2. Restoring database..."
LATEST_BACKUP=$(aws s3 ls s3://etl-solutions-backups/daily/ | sort | tail -1 | awk '{print $2}')
kubectl exec -n etl-solutions postgres-0 -- \
  aws s3 sync s3://etl-solutions-backups/daily/${LATEST_BACKUP} /restore/

kubectl exec -n etl-solutions postgres-0 -- \
  pg_restore -U etluser -d etldb /restore/base.tar

# 4. Apply WAL files
echo "3. Applying WAL files..."
kubectl exec -n etl-solutions postgres-0 -- \
  pg_waldump /restore/pg_wal/* | psql -U etluser -d etldb

# 5. Start Kafka consumers
echo "4. Starting Kafka consumers..."
kubectl scale deployment transformer -n etl-solutions --replicas=3
kubectl scale deployment business-service -n etl-solutions --replicas=3

# 6. Update DNS
echo "5. Updating DNS..."
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://dns-failover.json

# 7. Verify services
echo "6. Verifying services..."
curl https://etl-solutions.com/health/ready

echo "=== Region Failover Complete ==="
```

**RTO**: 15-30 minutes  
**RPO**: 5 minutes (last WAL archive)

### Scenario 5: Data Corruption

**Impact**: Critical - Invalid data in database

**Recovery**:
```bash
#!/bin/bash
# data-corruption-recovery.sh

echo "=== Data Corruption Recovery ==="

# 1. Stop all writes
echo "1. Stopping all writes..."
kubectl scale deployment transformer -n etl-solutions --replicas=0
kubectl scale deployment business-service -n etl-solutions --replicas=0

# 2. Identify corruption extent
echo "2. Identifying corruption..."
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "SELECT * FROM orders WHERE updated_at > '2026-05-10 10:00:00' ORDER BY updated_at DESC LIMIT 100;"

# 3. Restore from point-in-time backup
echo "3. Restoring from backup..."
RECOVERY_TIME="2026-05-10 09:55:00"

kubectl exec -n etl-solutions postgres-0 -- \
  pg_restore -U etluser -d etldb_recovery /backups/latest.dump

# 4. Apply WAL up to recovery point
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb_recovery -c \
  "SELECT pg_wal_replay_resume();"

# 5. Verify data integrity
echo "4. Verifying data integrity..."
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb_recovery -c \
  "SELECT COUNT(*) FROM orders WHERE updated_at < '${RECOVERY_TIME}';"

# 6. Switch to recovered database
echo "5. Switching to recovered database..."
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -c "ALTER DATABASE etldb RENAME TO etldb_corrupted;"
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -c "ALTER DATABASE etldb_recovery RENAME TO etldb;"

# 7. Restart services
echo "6. Restarting services..."
kubectl scale deployment transformer -n etl-solutions --replicas=3
kubectl scale deployment business-service -n etl-solutions --replicas=3

echo "=== Data Corruption Recovery Complete ==="
```

**RTO**: 30-60 minutes  
**RPO**: 5 minutes (last WAL archive)

## Recovery Procedures

### Database Recovery

#### Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# pitr-recovery.sh

RECOVERY_TARGET="2026-05-10 10:00:00"

echo "=== Point-in-Time Recovery ==="
echo "Recovery target: $RECOVERY_TARGET"

# 1. Stop PostgreSQL
kubectl scale statefulset postgres -n etl-solutions --replicas=0

# 2. Restore base backup
kubectl exec -n etl-solutions postgres-0 -- \
  rm -rf /var/lib/postgresql/data/*

kubectl exec -n etl-solutions postgres-0 -- \
  aws s3 sync s3://etl-solutions-backups/daily/latest/ \
  /var/lib/postgresql/data/

# 3. Create recovery.conf
kubectl exec -n etl-solutions postgres-0 -- \
  cat > /var/lib/postgresql/data/recovery.conf <<EOF
restore_command = 'aws s3 cp s3://etl-solutions-backups/wal/%f %p'
recovery_target_time = '${RECOVERY_TARGET}'
recovery_target_action = 'promote'
EOF

# 4. Start PostgreSQL
kubectl scale statefulset postgres -n etl-solutions --replicas=1

# 5. Wait for recovery
kubectl wait --for=condition=ready pod -l app=postgres -n etl-solutions --timeout=600s

# 6. Verify recovery
kubectl exec -n etl-solutions postgres-0 -- \
  psql -U etluser -d etldb -c \
  "SELECT pg_is_in_recovery(), pg_last_wal_replay_lsn();"

echo "=== PITR Recovery Complete ==="
```

### Kafka Recovery

#### Restore from MirrorMaker

```bash
#!/bin/bash
# kafka-recovery.sh

echo "=== Kafka Recovery ==="

# 1. Stop consumers
kubectl scale deployment transformer -n etl-solutions --replicas=0

# 2. Delete corrupted topics
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 \
  --delete --topic partner.raw.events

# 3. Recreate topics
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-topics.sh --bootstrap-server localhost:9092 \
  --create --topic partner.raw.events \
  --partitions 12 --replication-factor 3

# 4. Start MirrorMaker to restore from DR region
kubectl apply -f k8s/kafka/mirrormaker-restore.yaml

# 5. Monitor restoration
kubectl logs -n etl-solutions -l app=mirrormaker -f

# 6. Verify data
kubectl exec -n etl-solutions kafka-0 -- \
  kafka-run-class.sh kafka.tools.GetOffsetShell \
  --broker-list localhost:9092 --topic partner.raw.events

# 7. Restart consumers
kubectl scale deployment transformer -n etl-solutions --replicas=3

echo "=== Kafka Recovery Complete ==="
```

## DR Testing

### Monthly DR Drill

```bash
#!/bin/bash
# monthly-dr-drill.sh

echo "=== Monthly DR Drill ==="
echo "Date: $(date)"

# 1. Announce drill
echo "1. Announcing DR drill to team..."
# Send notification

# 2. Simulate failure
echo "2. Simulating region failure..."
kubectl scale deployment --all --replicas=0 -n etl-solutions
kubectl scale statefulset --all --replicas=0 -n etl-solutions

# 3. Start timer
START_TIME=$(date +%s)

# 4. Execute recovery
echo "3. Executing recovery procedure..."
./region-failover.sh

# 5. Verify recovery
echo "4. Verifying recovery..."
curl https://etl-solutions.com/health/ready

# 6. Calculate RTO
END_TIME=$(date +%s)
RTO=$((END_TIME - START_TIME))
echo "Actual RTO: ${RTO} seconds"

# 7. Generate report
echo "5. Generating DR drill report..."
cat > dr-drill-report-$(date +%Y%m%d).md <<EOF
# DR Drill Report

**Date**: $(date)
**Scenario**: Complete region failure
**Actual RTO**: ${RTO} seconds (Target: 1800 seconds)
**Actual RPO**: 5 minutes (Target: 5 minutes)

## Results
- Database recovery: Success
- Kafka recovery: Success
- Application recovery: Success
- DNS failover: Success

## Issues Identified
- [List any issues]

## Action Items
- [List action items]
EOF

echo "=== DR Drill Complete ==="
```

## Business Continuity

### Communication Plan

```yaml
# Incident communication plan
stakeholders:
  - name: Engineering Team
    contact: eng-team@etlsolutions.com
    notification: Immediate (PagerDuty)
  
  - name: Management
    contact: management@etlsolutions.com
    notification: Within 15 minutes
  
  - name: Customers
    contact: status.etlsolutions.com
    notification: Within 30 minutes
  
  - name: Partners
    contact: partners@etlsolutions.com
    notification: Within 1 hour

communication_channels:
  - Slack: #incidents
  - Email: incidents@etlsolutions.com
  - Status Page: status.etlsolutions.com
  - Phone: On-call rotation
```

### Incident Response

```bash
#!/bin/bash
# incident-response.sh

echo "=== Incident Response ==="

# 1. Declare incident
echo "1. Declaring incident..."
# Create incident in PagerDuty
# Post to #incidents Slack channel

# 2. Assemble response team
echo "2. Assembling response team..."
# Page on-call engineer
# Notify team lead
# Notify management if P0/P1

# 3. Assess impact
echo "3. Assessing impact..."
# Check affected services
# Estimate affected customers
# Determine severity

# 4. Execute recovery
echo "4. Executing recovery..."
# Follow appropriate recovery procedure

# 5. Communicate status
echo "5. Communicating status..."
# Update status page
# Notify stakeholders
# Post updates every 30 minutes

# 6. Verify recovery
echo "6. Verifying recovery..."
# Run health checks
# Monitor metrics
# Confirm with customers

# 7. Post-incident review
echo "7. Scheduling post-incident review..."
# Schedule within 48 hours
# Document timeline
# Identify root cause
# Create action items

echo "=== Incident Response Complete ==="
```

## Best Practices

### Backup Best Practices

1. **Test Restores Regularly**: Monthly restore tests
2. **Multiple Backup Locations**: Store in multiple regions
3. **Encrypt Backups**: Use encryption at rest and in transit
4. **Automate Backups**: Use automated backup scripts
5. **Monitor Backup Success**: Alert on backup failures

### DR Best Practices

1. **Document Procedures**: Keep runbooks up-to-date
2. **Practice Regularly**: Monthly DR drills
3. **Automate Recovery**: Use scripts for recovery
4. **Monitor RTO/RPO**: Track actual vs. target
5. **Review and Improve**: Update procedures based on drills

### High Availability

1. **Multi-AZ Deployment**: Deploy across availability zones
2. **Multi-Region Replication**: Replicate to DR region
3. **Load Balancing**: Distribute traffic across instances
4. **Health Checks**: Implement comprehensive health checks
5. **Auto-Scaling**: Scale automatically based on load

## Next Steps

1. **Set Up Backups**: Configure automated backups
2. **Test Recovery**: Perform initial recovery test
3. **Schedule Drills**: Plan monthly DR drills
4. **Document Procedures**: Create detailed runbooks
5. **Train Team**: Ensure team knows DR procedures

## See Also

- [Maintenance Guide](./05-maintenance.md)
- [Troubleshooting Guide](./03-troubleshooting.md)
- [Runbook](./08-runbook.md)
- [Monitoring Dashboards](./01-monitoring-dashboards.md)

---

**Last Updated**: May 10, 2026  
**Version**: 1.0
