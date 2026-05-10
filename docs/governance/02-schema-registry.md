# Schema Registry Strategy

## Purpose

Define how CanonBridge manages, versions, and enforces schemas across the Kafka event pipeline.

For the full architectural decision including tradeoffs, see [ADR-010](../adr/ADR-010-schema-registry-strategy.md).

---

## Schema Types

The platform uses three distinct schema types:

| Schema Type | Purpose | Location | Owner |
|---|---|---|---|
| **Partner Input Schema** | Validates raw partner payload before transformation | Mapping definition | Integration engineer |
| **Canonical Schema** | Defines the stable business domain event format | Platform schema catalog | Platform team |
| **Business Output Schema** | Validates business event produced by business service | Business service | Domain team |

---

## Canonical Schema Catalog

The canonical schema is the platform's contract. All partner payloads must be transformable into a canonical event. The canonical schema is:

- **Versioned**: `canonical/{eventType}/v{major}.{minor}.{patch}`
- **Immutable**: Published versions are never modified
- **Backward-compatible by default**: Minor versions must not break existing consumers
- **Formally validated**: CI enforces compatibility on every schema change PR

### Example Canonical Event Structure

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "canonical/order.created/v1.2.0",
  "type": "object",
  "required": ["eventId", "eventType", "tenantId", "timestamp", "payload"],
  "properties": {
    "eventId": { "type": "string", "format": "uuid" },
    "eventType": { "type": "string", "enum": ["order.created"] },
    "tenantId": { "type": "string" },
    "schemaVersion": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "timestamp": { "type": "string", "format": "date-time" },
    "payload": {
      "type": "object",
      "required": ["orderId", "status", "customerId", "lineItems"],
      "properties": {
        "orderId": { "type": "string" },
        "status": { "type": "string", "enum": ["CREATED", "CONFIRMED", "CANCELLED"] },
        "customerId": { "type": "string" },
        "lineItems": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["sku", "quantity", "unitPrice"],
            "properties": {
              "sku": { "type": "string" },
              "quantity": { "type": "integer", "minimum": 1 },
              "unitPrice": { "type": "number", "minimum": 0 }
            }
          }
        }
      }
    }
  }
}
```

---

## Schema Versioning Rules

### Semantic Version Assignment

| Change Type | Version Bump | Example | Breaking? |
|---|---|---|---|
| Bug fix in description/documentation | Patch | 1.0.0 → 1.0.1 | No |
| Add optional field | Minor | 1.0.0 → 1.1.0 | No |
| Add new enum value | Minor | 1.0.0 → 1.1.0 | Possibly — consumers must handle unknown values |
| Remove field | Major | 1.0.0 → 2.0.0 | Yes |
| Add required field | Major | 1.0.0 → 2.0.0 | Yes |
| Change field type | Major | 1.0.0 → 2.0.0 | Yes |
| Rename field | Major | 1.0.0 → 2.0.0 | Yes |
| Remove enum value | Major | 1.0.0 → 2.0.0 | Yes |

### Compatibility Check in CI

```yaml
# .github/workflows/schema-compatibility.yml
- name: Check schema backward compatibility
  run: |
    npx ajv-cli validate \
      --schema schemas/canonical/order.created/v1.2.0.json \
      --data test/fixtures/canonical-samples/*.json

    node scripts/check-schema-compatibility.js \
      --base schemas/canonical/order.created/v1.1.0.json \
      --new  schemas/canonical/order.created/v1.2.0.json \
      --mode BACKWARD
```

---

## Schema Adoption Phases

### Phase 1: Git + CI (initial deployment)

**When:** 1–4 partners, single team

```
schemas/
  canonical/
    order.created/
      v1.0.0.json
      v1.1.0.json
    shipment.updated/
      v1.0.0.json
  partner-input/
    partner-acme/
      order/
        v2.json
        v3.json
```

- All schema changes via PR
- CI runs compatibility check on PR merge
- Schemas bundled with service at build time

### Phase 2: Confluent Schema Registry (scale)

**When:** 5+ partners or multiple consumer teams

```
Registry URL: https://schema-registry.internal

Subjects:
  raw.events-value          → JSON Schema
  canonical.events-value    → JSON Schema (BACKWARD compatibility)
  business.events-value     → JSON Schema

Producer config:
  schema.registry.url = https://schema-registry.internal
  value.serializer = JsonSchemaSerializer

Consumer config:
  schema.registry.url = https://schema-registry.internal
  value.deserializer = JsonSchemaDeserializer
```

**Registry HA requirements:**
- 3-node registry cluster
- Backed by Kafka topics (built-in durability)
- TLS + basic auth for registry API
- Prometheus exporter for registry metrics

---

## Schema Change Process

```
1. Author creates PR with new schema file
2. CI runs:
   a. JSON Schema validation (schema is valid JSON Schema)
   b. Compatibility check (BACKWARD against previous version)
   c. Sample validation (all test fixtures pass new schema)
3. Peer review (schema owner approval required for breaking changes)
4. Merge → schema version published to registry (Phase 2) or deployed (Phase 1)
5. Transformer service configuration updated to use new schema version
6. Mapping Studio updated to reflect new canonical schema fields
7. Downstream consumer teams notified (via changelog + Slack)
```

---

## Partner Input Schema

Partner input schemas are managed per-partner in Mapping Studio.

- Each mapping version references a specific input schema version
- Input schema validation is **optional but strongly recommended** — catches partner payload changes early
- Input schema failures route to DLQ with error code `INPUT_SCHEMA_VIOLATION`
- Partners are notified via webhook when their payload fails input schema validation (configurable)

---

## See Also

- [ADR-010: Schema Registry Strategy](../adr/ADR-010-schema-registry-strategy.md)
- [Data Governance](./01-data-governance.md)
- [Mapping Versioning](../implementation/03-mapping-versioning.md)
- [Schema Validation](../implementation/04-schema-validation.md)
