# ADR-010: Schema Registry Strategy

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

CanonBridge processes Kafka messages with defined schemas. As the platform scales:
- Multiple partners produce events with different schema versions simultaneously
- Multiple downstream consumers depend on canonical event schema stability
- Schema breaking changes must not silently corrupt downstream data
- Schema evolution must be governed (reviewed, tested, approved)

A schema registry provides a central catalog of schema versions with compatibility enforcement.

---

## Decision Matrix

| Condition | Recommendation |
|---|---|
| 1–3 partners, single team, low volume | Git-based JSON Schema + CI validation (no registry) |
| 4–10 partners, multiple consumers | Schema registry strongly recommended |
| 10+ partners or multiple teams producing/consuming | Schema registry mandatory |
| Regulated or audited environment | Schema registry mandatory |
| Multi-tenant SaaS with schema-per-tenant | Schema registry per tenant namespace |

**CanonBridge target position:** Multi-tenant SaaS with 10+ partners per tenant → **Schema registry required for production.**

---

## Options Considered

### Option A: Git-based JSON Schema (no registry)

**How it works:**
Schemas stored as JSON files in Git. CI validates compatibility on PR merge.

**Strengths:**
- No additional infrastructure
- PR review is the governance mechanism
- Works well at small scale

**Weaknesses:**
- No runtime schema enforcement — producers can publish non-compliant messages
- No consumer protection — consumers may receive messages that violate their registered schema
- Schema evolution is not automatically validated (breaking changes require manual review)
- No schema discovery at runtime — consumers must bundle schemas at build time

**Use when:** 1–3 partners, controlled environment, small team.

### Option B: Confluent Schema Registry (Avro/JSON/Protobuf)

**How it works:**
Central registry stores schema versions. Producers serialize with registered schema ID. Consumers deserialize using schema ID from message header.

**Compatibility modes:**
- `BACKWARD`: New schema can read data written by old schema
- `FORWARD`: Old schema can read data written by new schema
- `FULL`: Both backward and forward compatible
- `NONE`: No compatibility checking

**Strengths:**
- Runtime enforcement — incompatible messages are rejected at produce time
- Consumer protection — consumers registered to a schema version are protected from breaking changes
- Schema discovery at runtime
- Supports Avro (most efficient), JSON Schema, Protobuf

**Weaknesses:**
- Additional infrastructure (registry service)
- Schema evolution requires registry access at produce and consume time
- Avro requires schema at deserialization — adds coupling

### Option C: AsyncAPI / OpenAPI Schema Contracts (design-time only)

**Strengths:**
- Human-readable contract documentation
- Generates client code

**Weaknesses:**
- Design-time only — no runtime enforcement
- Does not protect consumers at runtime

---

## Decision

**Phase 1 (initial):** Git-based JSON Schema with CI compatibility checks.

**Phase 2 (production, 5+ partners):** Confluent Schema Registry with JSON Schema format and `BACKWARD` compatibility mode for canonical topic.

Rationale for deferred registry adoption:
- Registry adds operational complexity that is disproportionate at early stage
- Git-based approach with strict CI is sufficient for 1–4 partners
- Clear trigger for adoption: ≥5 distinct partners or ≥3 consumer teams

**If starting without registry, these controls are mandatory:**

```text
1. Schemas versioned in Git with semantic versions
2. Schema compatibility check runs in CI on every PR that touches schemas
3. Schema artifacts published alongside service versions
4. Consumer contract tests exercise schema compatibility
5. Schema owner must approve any breaking change (distinct from author)
6. Breaking changes require major version bump + migration period
```

---

## Canonical Schema Evolution Rules

Regardless of registry usage:

| Change Type | Allowed | Version Impact |
|---|---|---|
| Add optional field to canonical output | Yes | Minor version |
| Add required field to canonical output | No (breaking) | Requires migration plan |
| Remove field from canonical output | No (breaking) | Requires migration plan |
| Change field type | No (breaking) | Requires migration plan |
| Change field from required to optional | Yes (backward compatible) | Minor version |
| Rename field | No (breaking) | Requires migration plan |

**Breaking change process:**
1. Introduce new canonical schema version
2. Run both old and new schema in parallel for migration period
3. Consumers migrated to new schema
4. Old schema deprecated and retired

---

## Consequences

**Phase 1:**
- Simple infrastructure — no registry service to operate
- CI enforces compatibility — human review for breaking changes
- Acceptable risk at small partner count

**Phase 2:**
- Runtime protection for consumers — incompatible produce rejected immediately
- Schema discovery enables dynamic consumer configuration
- Operational cost: registry cluster requires HA deployment, monitoring, backup

**Registry adoption trigger:**
When the platform reaches 5+ active partners or the first external team starts consuming canonical events, registry adoption must be initiated. This decision should be logged as a project milestone in the roadmap.
