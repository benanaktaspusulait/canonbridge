# Audit Logging

**Version**: 1.0  
**Last Updated**: May 10, 2026  
**Status**: Design Document

> ⚠️ **Phase 0 Notice**: This is a design document. No code has been implemented yet.

---

## 📋 OVERVIEW

This document defines audit logging requirements, implementation strategy, and compliance considerations for CanonBridge.

---

## 🎯 AUDIT LOGGING OBJECTIVES

### Purpose

**Why Audit Logging**:
- **Compliance**: Meet regulatory requirements (GDPR, SOC 2, HIPAA)
- **Security**: Detect and investigate security incidents
- **Troubleshooting**: Debug production issues
- **Accountability**: Track who did what and when
- **Analytics**: Understand system usage patterns

### Scope

**What to Audit**:
- Authentication and authorization events
- Data access and modifications
- Configuration changes
- Administrative actions
- Security events
- System errors and failures

**What NOT to Audit**:
- Sensitive data values (PII, passwords, API keys)
- High-frequency read operations (unless suspicious)
- Internal health checks
- Routine monitoring queries

---

## 📝 AUDIT EVENT CATEGORIES

### 1. Authentication Events

**Events to Log**:
- User login (success/failure)
- User logout
- Session creation/expiration
- Password changes
- MFA events
- API key usage
- Service-to-service authentication

**Example**:
```json
{
  "timestamp": "2026-05-10T10:30:00.000Z",
  "event_id": "evt_auth_001",
  "event_type": "authentication",
  "event_category": "user_login",
  "result": "success",
  "actor": {
    "type": "user",
    "id": "user_123",
    "email": "john.doe@example.com",
    "ip_address": "203.0.113.42"
  },
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "session_id": "sess_abc123",
    "mfa_used": true
  }
}
```

### 2. Authorization Events

**Events to Log**:
- Permission checks (denied only)
- Role assignments/removals
- ACL modifications
- Privilege escalations

**Example**:
```json
{
  "timestamp": "2026-05-10T10:31:00.000Z",
  "event_id": "evt_authz_001",
  "event_type": "authorization",
  "event_category": "permission_denied",
  "result": "denied",
  "actor": {
    "type": "user",
    "id": "user_456",
    "email": "jane.smith@example.com"
  },
  "resource": {
    "type": "mapping",
    "id": "mapping_789",
    "action": "delete"
  },
  "reason": "insufficient_permissions",
  "required_role": "admin",
  "actual_role": "viewer"
}
```

### 3. Data Access Events

**Events to Log**:
- Partner data access
- Mapping reads/writes
- Schema modifications
- DLQ access
- Sensitive data access

**Example**:
```json
{
  "timestamp": "2026-05-10T10:32:00.000Z",
  "event_id": "evt_data_001",
  "event_type": "data_access",
  "event_category": "mapping_read",
  "result": "success",
  "actor": {
    "type": "user",
    "id": "user_123",
    "email": "john.doe@example.com"
  },
  "resource": {
    "type": "mapping",
    "id": "mapping_789",
    "partner": "acme-marketplace",
    "event_type": "order-created",
    "version": "v1"
  },
  "metadata": {
    "access_reason": "troubleshooting",
    "ticket_id": "TICKET-1234"
  }
}
```

### 4. Configuration Changes

**Events to Log**:
- Partner configuration changes
- Mapping version publishes
- System configuration changes
- Feature flag changes
- Rate limit changes

**Example**:
```json
{
  "timestamp": "2026-05-10T10:33:00.000Z",
  "event_id": "evt_config_001",
  "event_type": "configuration",
  "event_category": "mapping_published",
  "result": "success",
  "actor": {
    "type": "user",
    "id": "user_123",
    "email": "john.doe@example.com"
  },
  "resource": {
    "type": "mapping",
    "id": "mapping_789",
    "partner": "acme-marketplace",
    "event_type": "order-created"
  },
  "changes": {
    "version": {
      "from": "v1",
      "to": "v2"
    },
    "status": {
      "from": "draft",
      "to": "published"
    }
  },
  "metadata": {
    "change_reason": "Fix field mapping for customer_email",
    "approved_by": "user_789"
  }
}
```

### 5. Administrative Actions

**Events to Log**:
- User management (create/update/delete)
- Role assignments
- System maintenance actions
- Backup/restore operations
- Database migrations

**Example**:
```json
{
  "timestamp": "2026-05-10T10:34:00.000Z",
  "event_id": "evt_admin_001",
  "event_type": "administrative",
  "event_category": "user_created",
  "result": "success",
  "actor": {
    "type": "user",
    "id": "user_admin",
    "email": "admin@example.com"
  },
  "resource": {
    "type": "user",
    "id": "user_new",
    "email": "new.user@example.com"
  },
  "changes": {
    "roles": ["viewer"],
    "status": "active"
  }
}
```

### 6. Security Events

**Events to Log**:
- Failed authentication attempts
- Suspicious activity
- Rate limit violations
- Certificate operations
- Encryption key usage

**Example**:
```json
{
  "timestamp": "2026-05-10T10:35:00.000Z",
  "event_id": "evt_security_001",
  "event_type": "security",
  "event_category": "suspicious_activity",
  "severity": "high",
  "result": "blocked",
  "actor": {
    "type": "unknown",
    "ip_address": "198.51.100.42"
  },
  "details": {
    "pattern": "brute_force_attempt",
    "failed_attempts": 10,
    "time_window": "5m",
    "action_taken": "ip_blocked"
  }
}
```

### 7. System Events

**Events to Log**:
- Service starts/stops
- Deployment events
- Scaling events
- Error spikes
- Performance degradation

**Example**:
```json
{
  "timestamp": "2026-05-10T10:36:00.000Z",
  "event_id": "evt_system_001",
  "event_type": "system",
  "event_category": "service_deployed",
  "result": "success",
  "resource": {
    "type": "service",
    "name": "transformer-service",
    "version": "v1.2.3"
  },
  "metadata": {
    "deployment_strategy": "rolling_update",
    "replicas": 3,
    "deployed_by": "ci-cd-pipeline",
    "git_commit": "abc123def456"
  }
}
```

---

## 🏗️ AUDIT LOG ARCHITECTURE

### Storage Strategy

**Multi-Tier Storage**:

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (Generates audit events)               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Hot Storage (PostgreSQL)           │
│  - Last 30 days                         │
│  - Fast queries                         │
│  - Indexed for search                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Warm Storage (S3/Object Storage)   │
│  - 30-365 days                          │
│  - Compressed                           │
│  - Queryable via Athena                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Cold Storage (S3 Glacier)          │
│  - 1+ years                             │
│  - Highly compressed                    │
│  - Compliance retention                 │
└─────────────────────────────────────────┘
```

### Database Schema

**PostgreSQL Audit Table**:
```sql
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    result VARCHAR(20) NOT NULL,
    severity VARCHAR(20),
    
    -- Actor information
    actor_type VARCHAR(50),
    actor_id VARCHAR(100),
    actor_email VARCHAR(255),
    actor_ip_address INET,
    
    -- Resource information
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    
    -- Changes (for configuration events)
    changes JSONB,
    
    -- Additional metadata
    metadata JSONB,
    
    -- Indexes
    CONSTRAINT audit_log_timestamp_idx 
        CHECK (timestamp >= '2026-01-01' AND timestamp < '2027-01-01')
);

-- Partition by month for performance
CREATE TABLE audit_log_2026_05 PARTITION OF audit_log
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

-- Indexes for common queries
CREATE INDEX idx_audit_log_timestamp ON audit_log (timestamp DESC);
CREATE INDEX idx_audit_log_event_type ON audit_log (event_type);
CREATE INDEX idx_audit_log_actor_id ON audit_log (actor_id);
CREATE INDEX idx_audit_log_resource_id ON audit_log (resource_type, resource_id);
CREATE INDEX idx_audit_log_result ON audit_log (result) WHERE result = 'denied' OR result = 'failed';

-- GIN index for JSONB columns
CREATE INDEX idx_audit_log_metadata ON audit_log USING GIN (metadata);
CREATE INDEX idx_audit_log_changes ON audit_log USING GIN (changes);
```

### Archival Process

**Automated Archival**:
```sql
-- Archive old audit logs to S3
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS void AS $$
DECLARE
    archive_date DATE;
BEGIN
    archive_date := CURRENT_DATE - INTERVAL '30 days';
    
    -- Export to S3 (using pg_dump or COPY)
    COPY (
        SELECT * FROM audit_log 
        WHERE timestamp < archive_date
    ) TO PROGRAM 'aws s3 cp - s3://canonbridge-audit-logs/audit_log_' || archive_date || '.csv.gz --sse AES256'
    WITH (FORMAT CSV, HEADER, COMPRESSION gzip);
    
    -- Delete archived records
    DELETE FROM audit_log WHERE timestamp < archive_date;
    
    -- Vacuum to reclaim space
    VACUUM ANALYZE audit_log;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily archival
SELECT cron.schedule('archive-audit-logs', '0 2 * * *', 'SELECT archive_old_audit_logs()');
```

---

## 💻 IMPLEMENTATION

### Node.js (Transformer Service)

**Audit Logger Module**:
```typescript
// audit-logger.ts
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

interface AuditEvent {
  eventType: string;
  eventCategory: string;
  result: 'success' | 'failed' | 'denied';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  actor?: {
    type: string;
    id: string;
    email?: string;
    ipAddress?: string;
  };
  resource?: {
    type: string;
    id: string;
  };
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async log(event: AuditEvent): Promise<void> {
    const eventId = `evt_${event.eventType}_${uuidv4().substring(0, 8)}`;
    
    try {
      await this.pool.query(
        `INSERT INTO audit_log (
          event_id, event_type, event_category, result, severity,
          actor_type, actor_id, actor_email, actor_ip_address,
          resource_type, resource_id, changes, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          eventId,
          event.eventType,
          event.eventCategory,
          event.result,
          event.severity || 'low',
          event.actor?.type,
          event.actor?.id,
          event.actor?.email,
          event.actor?.ipAddress,
          event.resource?.type,
          event.resource?.id,
          event.changes ? JSON.stringify(event.changes) : null,
          event.metadata ? JSON.stringify(event.metadata) : null,
        ]
      );
    } catch (error) {
      // Never fail the main operation due to audit logging failure
      console.error('Failed to write audit log:', error);
      // Send to dead letter queue or alternative logging
    }
  }

  // Convenience methods
  async logAuthentication(
    userId: string,
    email: string,
    ipAddress: string,
    result: 'success' | 'failed'
  ): Promise<void> {
    await this.log({
      eventType: 'authentication',
      eventCategory: 'user_login',
      result,
      actor: {
        type: 'user',
        id: userId,
        email,
        ipAddress,
      },
    });
  }

  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<void> {
    await this.log({
      eventType: 'data_access',
      eventCategory: `${resourceType}_${action}`,
      result: 'success',
      actor: {
        type: 'user',
        id: userId,
      },
      resource: {
        type: resourceType,
        id: resourceId,
      },
    });
  }

  async logConfigurationChange(
    userId: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, any>,
    reason?: string
  ): Promise<void> {
    await this.log({
      eventType: 'configuration',
      eventCategory: `${resourceType}_updated`,
      result: 'success',
      actor: {
        type: 'user',
        id: userId,
      },
      resource: {
        type: resourceType,
        id: resourceId,
      },
      changes,
      metadata: reason ? { change_reason: reason } : undefined,
    });
  }
}
```

**Usage in Application**:
```typescript
// In your route handler
app.post('/api/mappings/:id/publish', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Perform the operation
    const oldVersion = await getMappingVersion(id);
    await publishMapping(id);
    const newVersion = await getMappingVersion(id);
    
    // Log the audit event
    await auditLogger.logConfigurationChange(
      userId,
      'mapping',
      id,
      {
        version: { from: oldVersion, to: newVersion },
        status: { from: 'draft', to: 'published' },
      },
      req.body.reason
    );
    
    res.json({ success: true });
  } catch (error) {
    // Log failed attempt
    await auditLogger.log({
      eventType: 'configuration',
      eventCategory: 'mapping_publish_failed',
      result: 'failed',
      actor: { type: 'user', id: userId },
      resource: { type: 'mapping', id },
      metadata: { error: error.message },
    });
    
    res.status(500).json({ error: error.message });
  }
});
```

### Java (Business Service)

**Audit Logger**:
```java
@ApplicationScoped
public class AuditLogger {
    
    @Inject
    EntityManager em;
    
    public void log(AuditEvent event) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setEventId(generateEventId(event.getEventType()));
            auditLog.setTimestamp(Instant.now());
            auditLog.setEventType(event.getEventType());
            auditLog.setEventCategory(event.getEventCategory());
            auditLog.setResult(event.getResult());
            auditLog.setSeverity(event.getSeverity());
            
            if (event.getActor() != null) {
                auditLog.setActorType(event.getActor().getType());
                auditLog.setActorId(event.getActor().getId());
                auditLog.setActorEmail(event.getActor().getEmail());
                auditLog.setActorIpAddress(event.getActor().getIpAddress());
            }
            
            if (event.getResource() != null) {
                auditLog.setResourceType(event.getResource().getType());
                auditLog.setResourceId(event.getResource().getId());
            }
            
            auditLog.setChanges(event.getChanges());
            auditLog.setMetadata(event.getMetadata());
            
            em.persist(auditLog);
        } catch (Exception e) {
            // Never fail the main operation
            log.error("Failed to write audit log", e);
        }
    }
    
    @Transactional
    public void logBusinessEventProcessed(
        String eventId,
        String partnerId,
        String eventType,
        boolean success
    ) {
        log(AuditEvent.builder()
            .eventType("business_processing")
            .eventCategory("event_processed")
            .result(success ? "success" : "failed")
            .actor(Actor.builder()
                .type("service")
                .id("business-service")
                .build())
            .resource(Resource.builder()
                .type("canonical_event")
                .id(eventId)
                .build())
            .metadata(Map.of(
                "partner_id", partnerId,
                "event_type", eventType
            ))
            .build());
    }
}
```

---

## 🔍 QUERYING AUDIT LOGS

### Common Queries

**1. Find all actions by a user**:
```sql
SELECT 
    timestamp,
    event_category,
    result,
    resource_type,
    resource_id
FROM audit_log
WHERE actor_id = 'user_123'
ORDER BY timestamp DESC
LIMIT 100;
```

**2. Find all failed authentication attempts**:
```sql
SELECT 
    timestamp,
    actor_email,
    actor_ip_address,
    metadata->>'user_agent' as user_agent
FROM audit_log
WHERE event_type = 'authentication'
  AND result = 'failed'
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

**3. Find all configuration changes to a specific mapping**:
```sql
SELECT 
    timestamp,
    actor_email,
    changes,
    metadata->>'change_reason' as reason
FROM audit_log
WHERE event_type = 'configuration'
  AND resource_type = 'mapping'
  AND resource_id = 'mapping_789'
ORDER BY timestamp DESC;
```

**4. Find suspicious activity patterns**:
```sql
-- Multiple failed logins from same IP
SELECT 
    actor_ip_address,
    COUNT(*) as failed_attempts,
    MIN(timestamp) as first_attempt,
    MAX(timestamp) as last_attempt
FROM audit_log
WHERE event_type = 'authentication'
  AND result = 'failed'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY actor_ip_address
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC;
```

**5. Compliance report - who accessed sensitive data**:
```sql
SELECT 
    DATE(timestamp) as date,
    actor_email,
    COUNT(*) as access_count,
    ARRAY_AGG(DISTINCT resource_id) as accessed_resources
FROM audit_log
WHERE event_type = 'data_access'
  AND resource_type = 'partner_data'
  AND timestamp >= '2026-05-01'
  AND timestamp < '2026-06-01'
GROUP BY DATE(timestamp), actor_email
ORDER BY date DESC, access_count DESC;
```

---

## 📊 AUDIT DASHBOARDS

### Grafana Dashboard Panels

**1. Authentication Activity**:
```promql
# Successful logins
sum(rate(audit_log_authentication_success_total[5m]))

# Failed logins
sum(rate(audit_log_authentication_failed_total[5m]))

# Failed login rate
sum(rate(audit_log_authentication_failed_total[5m])) / 
sum(rate(audit_log_authentication_total[5m]))
```

**2. Configuration Changes**:
```promql
# Configuration changes per hour
sum(increase(audit_log_configuration_total[1h]))

# Changes by type
sum by (event_category) (
  increase(audit_log_configuration_total[1h])
)
```

**3. Security Events**:
```promql
# Security events by severity
sum by (severity) (
  rate(audit_log_security_total[5m])
)

# High severity security events
sum(rate(audit_log_security_total{severity="high"}[5m]))
```

---

## 🔒 COMPLIANCE CONSIDERATIONS

### GDPR Compliance

**Right to Access**:
```sql
-- Export all audit logs for a user
SELECT * FROM audit_log
WHERE actor_email = 'user@example.com'
ORDER BY timestamp DESC;
```

**Right to Erasure**:
```sql
-- Anonymize user data in audit logs
UPDATE audit_log
SET 
    actor_email = 'anonymized@example.com',
    actor_id = 'anonymized_' || MD5(actor_id),
    metadata = metadata - 'email' - 'phone'
WHERE actor_email = 'user@example.com';
```

### SOC 2 Compliance

**Requirements**:
- [ ] All administrative actions logged
- [ ] All data access logged
- [ ] All configuration changes logged
- [ ] Logs are tamper-proof (write-once)
- [ ] Logs retained for required period
- [ ] Regular log reviews conducted
- [ ] Audit log access is restricted

### HIPAA Compliance

**Requirements**:
- [ ] All PHI access logged
- [ ] Logs retained for 6 years
- [ ] Logs encrypted at rest and in transit
- [ ] Regular audit log reviews
- [ ] Breach notification procedures

---

## ✅ AUDIT LOGGING CHECKLIST

### Implementation

- [ ] Audit log database schema created
- [ ] Audit logger implemented in all services
- [ ] All critical events logged
- [ ] Sensitive data masked in logs
- [ ] Archival process implemented
- [ ] Query interfaces created
- [ ] Dashboards configured

### Security

- [ ] Audit logs encrypted at rest
- [ ] Audit logs encrypted in transit
- [ ] Access to audit logs restricted
- [ ] Audit log tampering prevented
- [ ] Audit log backup configured

### Compliance

- [ ] Retention policy defined
- [ ] GDPR requirements met
- [ ] SOC 2 requirements met
- [ ] Regular reviews scheduled
- [ ] Compliance reports automated

---

## 📚 RELATED DOCUMENTS

- [Security Operations](./14-security-operations.md)
- [Monitoring Dashboards](./01-monitoring-dashboards.md)
- [Production Readiness](./11-production-readiness.md)

---

**Status**: Design Document  
**Phase**: Phase 0 (Validation)  
**Implementation**: Phase 3+

