# Replay & Disaster Recovery

**Status**: Design Phase  
**Last Updated**: May 10, 2026

> ⚠️ **Note**: This document defines replay and disaster recovery procedures. Implementation will occur in Phase 3-6.

---

## 🎯 Overview

Replay and disaster recovery capabilities are essential for:
- Recovering from data corruption
- Reprocessing events after bug fixes
- Migrating to new mapping versions
- Testing new transformations
- Disaster recovery scenarios

---

## 🔄 REPLAY SCENARIOS

### 1. Bug Fix Replay

**Scenario**: Transformation bug caused incorrect canonical events

**Steps**:
1. Fix the bug in mapping
2. Deploy new mapping version
3. Identify affected time range
4. Replay raw events from Kafka
5. Validate corrected output

**Example**:
```bash
# Replay events from May 1-10
./scripts/replay.sh \
  --topic partner.raw.events \
  --start-date 2026-05-01 \
  --end-date 2026-05-10 \
  --mapping-version v1.2.0
```

---

### 2. Mapping Version Migration

**Scenario**: New mapping version with improved logic

**Steps**:
1. Deploy new mapping version (v2.0.0)
2. Run both versions in parallel
3. Compare outputs
4. Replay historical events with new version
5. Switch to new version

**Timeline**:
- Week 1: Deploy v2.0.0 alongside v1.0.0
- Week 2: Replay last 30 days with v2.0.0
- Week 3: Compare and validate
- Week 4: Switch all traffic to v2.0.0

---

### 3. Partner Data Correction

**Scenario**: Partner sent incorrect data, then corrected

**Steps**:
1. Partner provides corrected data
2. Identify original event IDs
3. Mark original events as superseded
4. Replay corrected events
5. Validate downstream systems updated

---

### 4. Disaster Recovery

**Scenario**: Complete system failure, need to rebuild

**Steps**:
1. Restore infrastructure
2. Restore database from backup
3. Replay Kafka events from last checkpoint
4. Validate data consistency
5. Resume normal operations

**RTO**: < 4 hours  
**RPO**: < 15 minutes

---

## 🛠️ REPLAY MECHANISMS

### Mechanism 1: Kafka Offset Reset

**Use Case**: Replay recent events (within retention period)

**How It Works**:
1. Stop consumer
2. Reset offset to earlier position
3. Restart consumer
4. Events reprocessed automatically

**Commands**:
```bash
# Reset to specific timestamp
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group canonbridge-transformer \
  --topic partner.raw.events \
  --reset-offsets --to-datetime 2026-05-01T00:00:00.000 \
  --execute

# Reset to beginning
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group canonbridge-transformer \
  --topic partner.raw.events \
  --reset-offsets --to-earliest \
  --execute
```

**Limitations**:
- Only works within Kafka retention period (default: 7 days)
- Replays ALL events, not selective
- Requires consumer downtime

---

### Mechanism 2: Selective Replay from Database

**Use Case**: Replay specific events or date ranges

**How It Works**:
1. Query events from `processed_events` table
2. Republish to replay topic
3. Transformer consumes from replay topic
4. New canonical events generated

**SQL**:
```sql
-- Find events to replay
SELECT event_id, raw_payload
FROM processed_events
WHERE partner_id = 'acme-marketplace'
  AND event_type = 'OrderCreated'
  AND processed_at BETWEEN '2026-05-01' AND '2026-05-10'
  AND status = 'FAILED';

-- Mark for replay
UPDATE processed_events
SET replay_requested = true,
    replay_requested_at = NOW()
WHERE event_id IN (...);
```

**Replay Service**:
```javascript
// Pseudo-code
async function replayEvents(eventIds) {
  for (const eventId of eventIds) {
    const event = await db.getEvent(eventId);
    await kafka.produce('partner.raw.events.replay', event);
  }
}
```

**Benefits**:
- Selective replay (specific events)
- Works beyond Kafka retention
- No consumer downtime
- Can use different mapping version

---

### Mechanism 3: Partner Resubmission

**Use Case**: Partner sends corrected data

**How It Works**:
1. Partner resubmits events with same `eventId`
2. System detects duplicate `eventId`
3. Marks original as superseded
4. Processes new version
5. Updates downstream systems

**Idempotency Logic**:
```javascript
async function processEvent(event) {
  const existing = await db.findByEventId(event.eventId);
  
  if (existing) {
    // Mark original as superseded
    await db.update(existing.id, {
      status: 'SUPERSEDED',
      superseded_at: new Date(),
      superseded_by: event.eventId
    });
  }
  
  // Process new version
  await transformAndStore(event);
}
```

---

## 🗄️ DATA RETENTION

### Kafka Retention

**Raw Events Topic**:
- Retention: 7 days (configurable)
- Reason: Balance storage cost vs replay capability
- Can be extended to 30 days for critical partners

**Canonical Events Topic**:
- Retention: 30 days
- Reason: Downstream consumers may need replay
- Longer retention for audit purposes

**DLQ Topic**:
- Retention: 90 days
- Reason: Need time to investigate and fix issues

### Database Retention

**processed_events Table**:
- Retention: 1 year
- Partitioned by month
- Older partitions archived to S3

**Archival Strategy**:
```sql
-- Archive events older than 1 year
INSERT INTO processed_events_archive
SELECT * FROM processed_events
WHERE processed_at < NOW() - INTERVAL '1 year';

-- Drop old partition
ALTER TABLE processed_events
DROP PARTITION processed_events_2025_05;
```

---

## 💾 BACKUP STRATEGY

### Database Backups

**Full Backup**:
- Frequency: Daily at 2 AM
- Retention: 30 days
- Storage: S3 with encryption
- Restore Time: ~2 hours

**Incremental Backup**:
- Frequency: Every 6 hours
- Retention: 7 days
- Storage: S3
- Restore Time: ~30 minutes

**Point-in-Time Recovery**:
- Enabled via WAL archiving
- Granularity: 1 minute
- Retention: 7 days

### Kafka Backups

**Topic Snapshots**:
- Frequency: Weekly
- Method: MirrorMaker to backup cluster
- Retention: 4 weeks
- Use Case: Disaster recovery

---

## 🚨 DISASTER RECOVERY PROCEDURES

### Scenario 1: Database Corruption

**Detection**:
- Data validation checks fail
- Inconsistent event counts
- Duplicate events detected

**Recovery**:
1. Stop all consumers
2. Identify corruption time range
3. Restore database from backup (before corruption)
4. Replay Kafka events from corruption point
5. Validate data consistency
6. Resume operations

**Timeline**: 2-4 hours

---

### Scenario 2: Complete System Failure

**Detection**:
- All services down
- Infrastructure unavailable
- Data center outage

**Recovery**:
1. Activate DR site
2. Restore database from latest backup
3. Point Kafka consumers to DR cluster
4. Replay events from last checkpoint
5. Validate critical paths
6. Switch DNS to DR site

**Timeline**: 4-8 hours  
**Data Loss**: < 15 minutes (RPO)

---

### Scenario 3: Kafka Cluster Failure

**Detection**:
- Kafka brokers unreachable
- Consumer lag increasing
- Producer errors

**Recovery**:
1. Assess Kafka cluster state
2. If recoverable: Restart brokers
3. If not: Restore from backup cluster
4. Verify topic data integrity
5. Resume consumers
6. Check for data gaps

**Timeline**: 1-2 hours

---

## 🧪 TESTING PROCEDURES

### Replay Testing

**Monthly Test**:
1. Select random 1-day period
2. Replay all events
3. Compare output with original
4. Validate 100% match
5. Document any discrepancies

**Quarterly DR Drill**:
1. Simulate complete failure
2. Execute full DR procedure
3. Measure RTO and RPO
4. Document lessons learned
5. Update procedures

---

## 📊 MONITORING

### Replay Metrics

- **Replay Queue Size**: Events waiting to be replayed
- **Replay Throughput**: Events replayed per second
- **Replay Success Rate**: % of successful replays
- **Replay Lag**: Time between request and completion

### Alerts

- ⚠️ **Warning**: Replay queue > 10,000 events
- 🚨 **Critical**: Replay success rate < 95%
- 📊 **Info**: Replay completed successfully

---

## 🎯 BEST PRACTICES

### For Operations Team

1. **Test Regularly**: Run replay tests monthly
2. **Document Everything**: Keep detailed runbooks
3. **Automate When Possible**: Script common replay scenarios
4. **Monitor Closely**: Watch replay progress
5. **Validate Results**: Always verify replay output

### For Development Team

1. **Design for Replay**: Make transformations idempotent
2. **Preserve Raw Data**: Never delete raw events
3. **Version Everything**: Track mapping versions
4. **Test Replay Scenarios**: Include in integration tests
5. **Handle Duplicates**: Implement proper idempotency

---

## 🔗 RELATED DOCUMENTS

- [Disaster Recovery](./06-disaster-recovery.md)
- [Backup Procedures](./05-maintenance.md)
- [Idempotency](../architecture/08-ordering-dependencies.md)
- [Kafka Configuration](../deployment/06-kubernetes-manifests.md)

---

**Replay and recovery capabilities are essential for production reliability. Test regularly and document thoroughly.**
