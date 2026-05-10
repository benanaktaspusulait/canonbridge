# Mapping Studio API and Data Model

## Overview

Mapping Studio produces configuration artifacts for the transformer service. The management API should store drafts, samples, inferred schema metadata, mapping rules, validation runs, approvals, and published immutable versions.

The transformer runtime should consume only published artifacts. It should not depend on draft tables or UI availability.

## Core Entities

### Partner

```json
{
  "tenantId": "tenant-001",
  "partnerId": "acme-marketplace",
  "name": "Acme Marketplace",
  "status": "active",
  "createdAt": "2026-05-10T10:00:00Z",
  "createdBy": "user-001"
}
```

### Partner Event Draft

```json
{
  "draftId": "draft-001",
  "tenantId": "tenant-001",
  "partnerId": "acme-marketplace",
  "eventType": "OrderCreated",
  "canonicalEventType": "CanonicalOrderCreated",
  "canonicalSchemaVersion": "v1",
  "status": "draft",
  "ownerUserId": "user-001",
  "reviewerGroupId": "integration-reviewers",
  "changeReason": "Initial onboarding",
  "createdAt": "2026-05-10T10:00:00Z",
  "updatedAt": "2026-05-10T10:20:00Z"
}
```

### Sample Payload

```json
{
  "sampleId": "sample-001",
  "draftId": "draft-001",
  "name": "happy-path-order",
  "tag": "valid",
  "contentType": "application/json",
  "payloadStorageRef": "s3://tenant-001/mapping-samples/sample-001.json",
  "payloadSha256": "abc123",
  "sizeBytes": 15342,
  "containsPii": true,
  "createdBy": "user-001",
  "createdAt": "2026-05-10T10:05:00Z"
}
```

### Field Inventory Item

```json
{
  "fieldId": "field-001",
  "draftId": "draft-001",
  "jsonPointer": "/customer/email",
  "jsonPath": "$.customer.email",
  "displayName": "customer.email",
  "observedTypes": ["string"],
  "sampleValues": ["a@example.com", "b@example.com"],
  "occurrenceCount": 3,
  "sampleCount": 3,
  "nullable": false,
  "arrayContext": null,
  "piiHint": "email",
  "ignored": false
}
```

### Schema Draft

```json
{
  "schemaDraftId": "schema-draft-001",
  "draftId": "draft-001",
  "schemaKind": "input",
  "schemaVersion": "v1",
  "jsonSchema": {
    "type": "object",
    "required": ["orderId", "customer"],
    "properties": {
      "orderId": { "type": "string" },
      "customer": {
        "type": "object",
        "required": ["email"],
        "properties": {
          "email": { "type": "string", "format": "email" }
        }
      }
    }
  },
  "updatedBy": "user-001",
  "updatedAt": "2026-05-10T10:12:00Z"
}
```

### Mapping Rule

```json
{
  "ruleId": "rule-001",
  "draftId": "draft-001",
  "sourcePath": "$.customer.email",
  "targetPath": "$.customer.email",
  "ruleType": "direct",
  "required": true,
  "defaultValue": null,
  "expression": null,
  "notes": "Customer email is required for order notifications"
}
```

### Mapping Draft Artifact

```json
{
  "mappingDraftId": "mapping-draft-001",
  "draftId": "draft-001",
  "mode": "visual_rules",
  "generatedJsonata": "{ \"customer\": { \"email\": customer.email } }",
  "manualJsonata": null,
  "artifactSha256": "def456",
  "updatedBy": "user-001",
  "updatedAt": "2026-05-10T10:25:00Z"
}
```

### Validation Run

```json
{
  "validationRunId": "run-001",
  "draftId": "draft-001",
  "status": "passed",
  "startedAt": "2026-05-10T10:30:00Z",
  "finishedAt": "2026-05-10T10:30:03Z",
  "inputSchemaPassed": true,
  "jsonataPassed": true,
  "canonicalSchemaPassed": true,
  "fixturePassed": true,
  "durationMs": 3021,
  "summary": {
    "samplesTested": 3,
    "fixturesTested": 4,
    "errorCount": 0,
    "warningCount": 1
  }
}
```

### Published Mapping Version

```json
{
  "mappingVersionId": "mv-001",
  "tenantId": "tenant-001",
  "partnerId": "acme-marketplace",
  "eventType": "OrderCreated",
  "mappingVersion": "v1",
  "canonicalSchemaVersion": "v1",
  "status": "active",
  "sourceDraftId": "draft-001",
  "validationRunId": "run-001",
  "approvedBy": "user-002",
  "publishedBy": "user-002",
  "publishedAt": "2026-05-10T10:40:00Z",
  "artifactRefs": {
    "config": "partners/acme-marketplace/order-created/config.json",
    "inputSchema": "partners/acme-marketplace/order-created/input.v1.schema.json",
    "mapping": "partners/acme-marketplace/order-created/inbound.v1.jsonata",
    "fixtures": "partners/acme-marketplace/order-created/fixtures/"
  }
}
```

## State Model

```text
draft
  -> validating
  -> draft
  -> ready_for_review
  -> changes_requested
  -> ready_for_review
  -> approved
  -> published
  -> archived
```

Rules:

- Only `draft` and `changes_requested` states are editable.
- `ready_for_review` is locked except for comments.
- `approved` can be published by an authorized user.
- `published` versions are immutable.
- `archived` drafts cannot be published.

## API Endpoints

### Drafts

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mapping-drafts` | Create draft |
| `GET` | `/api/mapping-drafts` | List drafts |
| `GET` | `/api/mapping-drafts/{draftId}` | Get draft |
| `PATCH` | `/api/mapping-drafts/{draftId}` | Update editable draft metadata |
| `POST` | `/api/mapping-drafts/{draftId}/clone` | Clone from draft or published version |
| `POST` | `/api/mapping-drafts/{draftId}/submit-review` | Submit for review |
| `POST` | `/api/mapping-drafts/{draftId}/archive` | Archive draft |

### Samples

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mapping-drafts/{draftId}/samples` | Upload or paste sample JSON |
| `GET` | `/api/mapping-drafts/{draftId}/samples` | List samples |
| `GET` | `/api/mapping-drafts/{draftId}/samples/{sampleId}` | Get sample metadata and payload |
| `PATCH` | `/api/mapping-drafts/{draftId}/samples/{sampleId}` | Update sample name, tag, notes |
| `DELETE` | `/api/mapping-drafts/{draftId}/samples/{sampleId}` | Delete sample |
| `POST` | `/api/mapping-drafts/{draftId}/samples/import-dlq` | Import a DLQ payload as sample |

### Field Inventory and Schema

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mapping-drafts/{draftId}/field-inventory/infer` | Infer field inventory from samples |
| `GET` | `/api/mapping-drafts/{draftId}/field-inventory` | Read inferred fields |
| `PATCH` | `/api/mapping-drafts/{draftId}/field-inventory/{fieldId}` | Update labels, ignore flags, notes |
| `POST` | `/api/mapping-drafts/{draftId}/schemas/input/generate` | Generate input JSON Schema |
| `GET` | `/api/mapping-drafts/{draftId}/schemas/input` | Read input schema draft |
| `PUT` | `/api/mapping-drafts/{draftId}/schemas/input` | Replace input schema draft |
| `POST` | `/api/mapping-drafts/{draftId}/schemas/input/validate` | Validate samples against input schema |

### Mapping Rules and JSONata

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/canonical-schemas` | List canonical schemas |
| `GET` | `/api/canonical-schemas/{eventType}/{version}` | Get canonical schema |
| `POST` | `/api/mapping-drafts/{draftId}/rules` | Create mapping rule |
| `GET` | `/api/mapping-drafts/{draftId}/rules` | List mapping rules |
| `PATCH` | `/api/mapping-drafts/{draftId}/rules/{ruleId}` | Update mapping rule |
| `DELETE` | `/api/mapping-drafts/{draftId}/rules/{ruleId}` | Delete mapping rule |
| `POST` | `/api/mapping-drafts/{draftId}/jsonata/generate` | Generate JSONata from rules |
| `PUT` | `/api/mapping-drafts/{draftId}/jsonata/manual` | Save manual JSONata override |
| `POST` | `/api/mapping-drafts/{draftId}/preview` | Run transform preview |

### Validation, Review, Publish

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mapping-drafts/{draftId}/validation-runs` | Run full validation |
| `GET` | `/api/mapping-drafts/{draftId}/validation-runs` | List validation runs |
| `GET` | `/api/validation-runs/{validationRunId}` | Get validation details |
| `POST` | `/api/mapping-drafts/{draftId}/review/approve` | Approve draft |
| `POST` | `/api/mapping-drafts/{draftId}/review/reject` | Reject draft |
| `POST` | `/api/mapping-drafts/{draftId}/publish` | Publish approved version |
| `GET` | `/api/mapping-versions` | List published versions |
| `POST` | `/api/mapping-versions/{mappingVersionId}/activate` | Activate version |
| `POST` | `/api/mapping-versions/{mappingVersionId}/rollback` | Roll back to version |
| `GET` | `/api/mapping-versions/{mappingVersionId}/export` | Export artifact package |

## Preview Request and Response

Request:

```json
{
  "sampleId": "sample-001",
  "useManualJsonata": false
}
```

Response:

```json
{
  "status": "failed",
  "durationMs": 42,
  "canonicalOutput": {
    "orderId": "ORD-123"
  },
  "errors": [
    {
      "stage": "canonical_schema",
      "code": "required",
      "message": "customer.email is required",
      "sourcePath": "$.customer.email",
      "targetPath": "$.customer.email",
      "schemaPath": "#/properties/customer/required",
      "ruleId": "rule-001"
    }
  ],
  "warnings": []
}
```

## Artifact Export Format

Published versions should export to the existing transformer service layout:

```text
partners/{partnerId}/{eventType}/
  config.json
  input.{schemaVersion}.schema.json
  inbound.{mappingVersion}.jsonata
  canonical.{canonicalSchemaVersion}.schema.json
  fixtures/
    valid/
    invalid/
    expected/
```

## Database Tables

Recommended tables:

- `partners`
- `partner_event_drafts`
- `sample_payloads`
- `field_inventory`
- `schema_drafts`
- `mapping_rules`
- `mapping_draft_artifacts`
- `fixtures`
- `validation_runs`
- `validation_run_errors`
- `review_requests`
- `published_mapping_versions`
- `mapping_version_artifacts`
- `mapping_audit_events`

Every table should include `tenant_id`, created/updated timestamps where applicable, and row-level authorization checks.

## Audit Events

Audit event types:

- `draft.created`
- `sample.uploaded`
- `field.ignored`
- `schema.generated`
- `schema.edited`
- `mapping.rule.created`
- `mapping.rule.updated`
- `jsonata.manual_override.enabled`
- `validation.run.completed`
- `review.submitted`
- `review.approved`
- `review.rejected`
- `version.published`
- `version.activated`
- `version.rolled_back`
- `version.archived`

Audit records should include actor, tenant, draft/version, timestamp, before/after summary, and request correlation ID.

## Security Rules

- Store sample payloads encrypted at rest.
- Mask sample values in logs.
- Never log raw uploaded JSON.
- Enforce tenant isolation on every endpoint.
- Require approval for publish in production environments.
- Require elevated permission for manual JSONata override.
- Validate exported artifacts before making them available to transformer deployment.
- Preserve audit events even if drafts are archived.

