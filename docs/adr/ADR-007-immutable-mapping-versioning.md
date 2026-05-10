# ADR-007: Immutable Mapping Versions with Semantic Versioning

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

Partner integration mappings (JSONata expressions + schemas) change over time. Partners update their payload formats. Business requirements evolve. Mapping bugs are discovered in production.

The versioning strategy must answer:
- How do we roll back a broken mapping in production without a deployment?
- How do we trace which mapping version processed a specific event?
- How do we safely test a new mapping before activating it?
- How do we prevent unauthorized changes to active production mappings?

---

## Options Considered

### Option A: Mutable mappings (overwrite in place)

**How it works:**
Each partner has a single active mapping record. Updating the mapping overwrites it.

**Weaknesses:**
- No rollback — previous state is lost
- Cannot trace which mapping processed a historical event
- Concurrent edits can corrupt state
- No pre-activation testing against production traffic
- Audit: "who changed what" requires external audit log

### Option B: Git-based versioning only

**How it works:**
Mappings stored as files in Git. Git history provides versioning.

**Strengths:**
- Full history via Git log
- PR-based review workflow

**Weaknesses:**
- Deployment required for every mapping change
- Business users cannot manage mappings without Git access
- Live switching between versions requires deployment
- Production rollback requires emergency deploy

### Option C: Immutable versioned records + semantic versioning

**How it works:**
Each published mapping is an immutable database record. Active version pointer is separate.

```
mapping_definitions:
  id: uuid
  partner_id: uuid
  event_type: string
  version: "2.1.0"
  mapping_expression: text (JSONata)
  input_schema: jsonb
  output_schema: jsonb
  status: DRAFT | PUBLISHED | DEPRECATED
  published_at: timestamp
  published_by: user_id
  approved_by: user_id
  created_at: timestamp

active_mapping_versions:
  partner_id: uuid
  event_type: string
  active_version_id: uuid  → FK to mapping_definitions
  activated_at: timestamp
  activated_by: user_id
```

**Version rules:**
- `MAJOR.MINOR.PATCH`
- Major: breaking change to input schema (partner payload structure changed)
- Minor: new output fields added (canonical schema extended, backwards compatible)
- Patch: bug fix (same input/output contract, fixed logic)

**Strengths:**
- Rollback: update `active_mapping_versions.active_version_id` — instantaneous, no deploy
- Audit: every processed event can be joined to its mapping version
- Safe testing: publish v2.0.0, keep v1.9.0 active, validate v2.0.0 against samples, then activate
- Approval workflow: DRAFT → approved → PUBLISHED → ACTIVE
- No mutable state: published records are immutable

**Weaknesses:**
- Database growth (every version is a permanent record)
- More complex API than simple CRUD
- Schema migration needed when mapping definition structure changes

---

## Decision

**Use immutable versioned mapping records with semantic versioning.**

This design is the core of the Mapping Studio product. It enables the key operational capability: **rollback a broken production mapping in seconds, without a deployment.**

**Lifecycle:**

```
Draft created
    │
    ▼
Validation run (samples, schema check)
    │
    ▼
Peer review / approval
    │
    ▼
Version published (immutable)
    │
    ▼
Version activated (active pointer updated)
    │
    ▼     ← mapping version mismatch detected in production
Rollback (previous version activated, takes effect immediately)
```

---

## Consequences

**Positive:**
- Production rollback in seconds — no deployment, no downtime
- Complete audit trail: every mapping change has author, approver, timestamp
- Historical analysis: which mapping version caused a DLQ spike?
- Safe A/B validation: publish new version, validate against sample set, then activate
- Immutable records can never be tampered with after publish
- Canonical events carry mapping version in headers for traceability

**Negative:**
- `mapping_definitions` table grows indefinitely (mitigated by retention policy: DEPRECATED versions archived after 90 days)
- Activation requires a separate step after publish (intentional — prevents accidental activation)
- Semantic version choice requires discipline from mapping authors

**Mapping headers on canonical events:**
```json
{
  "headers": {
    "x-mapping-version": "2.1.0",
    "x-mapping-id": "3f4a-...",
    "x-partner-id": "partner-acme"
  }
}
```

This enables post-hoc analysis: "all events processed by mapping 2.1.0 that are in the DLQ."
