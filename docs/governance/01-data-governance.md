# Data Governance

## Purpose

CanonBridge is a data pipeline platform. Every partner event that enters the system represents a business transaction. Data governance defines how that data is retained, protected, audited, replayed, and retired.

---

## Data Classification

| Class | Description | Examples | Controls |
|---|---|---|---|
| **PII** | Personally identifiable information | Name, email, address, national ID, phone | Masking in logs, encryption at rest, tenant-scoped retention, right-to-erasure |
| **Financial** | Payment or financial transaction data | Account numbers, amounts, currency codes | Encryption at rest, restricted access, audit on read |
| **Partner Confidential** | Partner-proprietary business data | Order IDs, SKUs, partner pricing | Tenant isolation, no cross-tenant leakage |
| **Operational** | Internal platform metadata | Event IDs, offsets, mapping versions, error codes | Standard retention, no special classification |

Classification is declared per event type in the mapping definition and applied to:
- Log masking rules
- Payload encryption configuration
- Retention policy selection
- DLQ payload access control

---

## Data Lineage

Every event has a traceable lineage from source to destination.

```
Partner System
  │  Raw partner payload (unstructured, partner-specific format)
  │  eventId assigned at ingestion
  ▼
Kafka: raw.events
  │  Envelope: eventId, tenantId, partnerId, eventType, timestamp
  │  Payload: original partner JSON (unchanged)
  ▼
Transformer Service
  │  Mapping version applied: {mappingId, mappingVersion, activatedAt}
  │  Input validated against: {inputSchemaId, inputSchemaVersion}
  │  Output validated against: {canonicalSchemaId, canonicalSchemaVersion}
  ▼
Kafka: canonical.events
  │  Headers: x-event-id, x-mapping-version, x-canonical-schema-version
  │  Payload: canonical JSON (partner-independent)
  ▼
Business Consumer Service
  │  processed_events: event_id, processed_at, source_topic, source_offset
  │  Domain tables: business records with event_id FK
  │  outbox_events: event_id → business event
  ▼
Kafka: business.events
  │  Downstream consumers
  ▼
Downstream Services
```

### Lineage Query

Given any `eventId`, an operator can reconstruct the full lineage:

```sql
-- Find all processing steps for an event
SELECT
  'raw_event' AS stage,
  re.topic, re.partition, re.offset, re.received_at
FROM raw_event_index re WHERE re.event_id = $eventId

UNION ALL

SELECT
  'processed' AS stage,
  pe.source_topic, pe.source_partition, pe.source_offset, pe.processed_at
FROM processed_events pe WHERE pe.event_id = $eventId

UNION ALL

SELECT
  'business_event' AS stage,
  oe.topic, NULL, NULL, oe.published_at
FROM outbox_events oe WHERE oe.event_id = $eventId;
```

---

## Data Retention Policy

Retention balances compliance requirements against storage cost.

| Data Type | Default Retention | Configurable Per Tenant | Reason |
|---|---|---|---|
| Raw partner events (Kafka) | 7 days | Yes (1–90 days) | Replay window for mapping fixes |
| Canonical events (Kafka) | 30 days | Yes (7–365 days) | Downstream replay, audit |
| Business events (Kafka) | 90 days | Yes (30–365 days) | Downstream consumer replay |
| `processed_events` table | 30 days | Yes (7–90 days) | Idempotency guard window |
| `outbox_events` table | 7 days after PUBLISHED | No | Archival after publish |
| DLQ payloads | 90 days | Yes (30–365 days) | Investigation window |
| Mapping Studio samples | Tenant lifetime | No | Required for preview/validation |
| Audit logs | 7 years | No | Compliance requirement |

**Archival**: Records past retention period are moved to cold storage (e.g., S3 Glacier), not deleted. Deletion requires explicit tenant request (GDPR right to erasure).

---

## Right to Erasure (GDPR)

When a data subject requests erasure:

1. Identify `tenantId` and the subject's identifiers (email, customer ID)
2. Locate all events containing PII for this subject:
   - Raw Kafka events (if within retention window)
   - DLQ payloads
   - Domain tables
   - Audit logs (event metadata only — PII masked, audit record retained)
3. Execute erasure per data class:
   - Domain tables: DELETE or pseudonymize (replace PII with hash)
   - Kafka: Cannot delete individual messages — set short retention or use compaction tombstone
   - Audit logs: Retain event record, remove PII fields
4. Log erasure action in compliance audit table
5. Confirm completion within 30 days (GDPR requirement)

**Erasure limitations with Kafka:**
Kafka does not support message deletion. For strict erasure compliance:
- Use payload-level encryption with per-subject keys — key deletion renders payload unreadable
- Set tenant-specific short retention for PII-heavy topics
- Document Kafka retention approach in privacy notice

---

## Event Replay

Replay is the ability to reprocess historical events — typically needed after:
- Mapping version rollback (reprocess affected events with correct mapping)
- Bug fix in business service (reprocess events that were incorrectly processed)
- Schema migration (reprocess events with new canonical schema)
- Data recovery (restore from Kafka after database incident)

### Replay Prerequisites

Before replaying any range of events:

| Prerequisite | Check |
|---|---|
| Correct mapping version is active | Confirm in Mapping Studio |
| Idempotency window covers replay range | If events > 30 days old, idempotency guard is bypassed |
| Downstream consumers are replay-safe | Confirm idempotent on duplicate events |
| DLQ cleared or scoped | Avoid confusion with existing DLQ entries |
| Tenant notified | Replay may cause downstream re-processing |

### Replay Procedure

```bash
# Replay raw events for a partner within a time range
# (conceptual — adapt to specific Kafka tooling)

kafka-replay \
  --topic raw.events \
  --tenant-id tenant-acme \
  --partner-id partner-xyz \
  --from "2024-01-15T00:00:00Z" \
  --to   "2024-01-15T06:00:00Z" \
  --target-consumer-group transformer-replay-group
```

Replay uses a separate consumer group to avoid disrupting live processing.

---

## Schema Governance

Schema changes must not silently break consumers.

### Change Classification

| Change | Classification | Process |
|---|---|---|
| Add optional field | Non-breaking | PR + peer review |
| Add required field | Breaking | Migration plan required |
| Remove field | Breaking | Deprecation period + migration |
| Change field type | Breaking | Migration plan required |
| Change enum values | Breaking | Migration plan required |

### Migration Process for Breaking Changes

1. Introduce new schema version (e.g., canonical/v2)
2. Deploy transformer that produces both v1 and v2 in parallel
3. Migrate all consumers to v2
4. Remove v1 production — set deprecation date (minimum 30 days notice)
5. Document in changelog

---

## Audit Trail

The audit trail covers all privileged actions in the platform.

| Event | Logged Fields |
|---|---|
| Mapping published | user_id, tenant_id, mapping_id, version, timestamp, ip_address |
| Mapping rolled back | user_id, tenant_id, mapping_id, from_version, to_version, reason, timestamp |
| DLQ payload accessed | user_id, tenant_id, event_id, timestamp, ip_address |
| Partner onboarded | user_id, tenant_id, partner_id, timestamp |
| Tenant configuration changed | user_id, tenant_id, field, old_value_hash, new_value_hash, timestamp |
| Data erasure executed | user_id, tenant_id, subject_id_hash, affected_tables, timestamp |

Audit records are immutable — no UPDATE or DELETE is permitted. Retention: 7 years.

---

## See Also

- [ADR-007: Immutable Mapping Versioning](../adr/ADR-007-immutable-mapping-versioning.md)
- [ADR-009: Security Threat Model](../adr/ADR-009-security-threat-model.md)
- [ADR-010: Schema Registry Strategy](../adr/ADR-010-schema-registry-strategy.md)
- [Security Controls](../implementation/10-security.md)
- [Disaster Recovery](../operations/06-disaster-recovery.md)
