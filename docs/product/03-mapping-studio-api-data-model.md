# Mapping Studio API and Data Model

## Overview

Mapping Studio produces configuration artifacts for the transformer service. The management API stores drafts, source samples, inferred field metadata, schema drafts, source validation rules, canonical target fields, mapping rules, fixtures, validation runs, reviews, credentials metadata, outbound connection configuration, webhook metadata, and published immutable versions.

PostgreSQL is the system of record for Mapping Studio. The transformer runtime consumes only published artifacts and published connection metadata. It must not depend on draft tables, browser local storage, or UI availability.

## UI Review Findings

The current Angular UI under `mapping-studio-ui/` implies a wider data model than the original draft:

- `IntegrationStudioComponent` is a five-step wizard: source/trigger, canonical schema, field mapping, unresolved gaps, and test/validate/publish.
- Source setup supports `kafka`, `webhook`, `externalApi`, and `manual` modes.
- Webhook setup needs a generated URL, masked inbound key, key rotation metadata, delivery capture, and captured sample payloads.
- External API setup needs method, URL, schedule, selected credential, test result, timeout/retry policy later, and response samples.
- Credential UX supports API key, Basic Auth, Bearer token, and OAuth2 client credentials. Secret fields are write-only.
- Mapping rules include visual transform types, positional order, params, and optional advanced JSONata expression.
- Canonical fields can be manually created or loaded from canonical schema JSON.
- Source validation rules exist separately from output/canonical validation.
- Fixtures are first-class rows with input JSON, expected JSON, run status, actual output, error message, and diffs.
- The mapping catalog and External Systems pages need published versions, transformation counts, checksums, connection health, recent call history, and "use sample in Studio" handoff.

## PostgreSQL Modeling Decisions

- Use `uuid` primary keys with `uuid_generate_v4()` because the local PostgreSQL init already enables `uuid-ossp`.
- Use `timestamptz` for all persisted timestamps.
- Use `jsonb` for JSON Schema documents, source configs, rule params, fixture diffs, validation summaries, request/response previews, and generated artifact manifests.
- Use `text` for JSONata expressions and encrypted secret payloads.
- Store raw sample and fixture payloads in PostgreSQL `jsonb` for the MVP. Keep optional `payload_storage_ref` columns for later object-storage archival, but do not make object storage required.
- Store secret material only in encrypted application-managed blobs such as `credential_records.encrypted_secret_json`; API responses return metadata only.
- Put `tenant_id` on every tenant-scoped table and enforce tenant isolation in application queries, plus PostgreSQL RLS when multi-tenant deployment starts.
- Use optimistic locking with `version integer` on editable draft/config tables.
- Keep published versions immutable. Activation changes create new activation/audit rows or update status fields without modifying artifact content.

## Core Entities

### Partner

```json
{
  "partnerId": "acme-marketplace",
  "tenantId": "tenant-001",
  "slug": "acme-marketplace",
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
  "eventType": "order.created",
  "canonicalEventType": "CanonicalOrderCreated",
  "canonicalSchemaVersion": "v1",
  "status": "draft",
  "environment": "sandbox",
  "ownerUserId": "user-001",
  "reviewerGroupId": "integration-reviewers",
  "changeReason": "Initial onboarding",
  "sourceType": "external_api_poll",
  "createdAt": "2026-05-10T10:00:00Z",
  "updatedAt": "2026-05-10T10:20:00Z",
  "version": 4
}
```

### Draft Source Configuration

```json
{
  "sourceConfigId": "source-001",
  "draftId": "draft-001",
  "sourceType": "external_api_poll",
  "config": {
    "method": "GET",
    "url": "https://api.carrier-a.example/v1/orders",
    "schedule": "*/5 * * * *",
    "selectedCredentialId": "cred-001",
    "checkpointMode": "watermark"
  },
  "lastSampleId": "sample-001",
  "lastTestStatus": "passed",
  "lastTestedAt": "2026-05-10T10:18:00Z"
}
```

Allowed `sourceType` values:

- `kafka_topic`
- `webhook`
- `external_api_poll`
- `manual_upload`

### Credential Record

```json
{
  "credentialId": "cred-001",
  "tenantId": "tenant-001",
  "displayName": "Carrier A Production OAuth2",
  "authType": "oauth2_client_credentials",
  "environment": "production",
  "status": "active",
  "rotationDueAt": "2026-08-11T00:00:00Z",
  "lastUsedAt": "2026-05-10T10:18:00Z",
  "createdBy": "user-001",
  "createdAt": "2026-05-10T09:40:00Z"
}
```

Secret values are accepted only on create/update and are never returned. Supported `authType` values:

- `api_key`
- `basic_auth`
- `bearer_token`
- `oauth2_client_credentials`

### Webhook Endpoint

```json
{
  "webhookEndpointId": "wh-001",
  "draftId": "draft-001",
  "tenantId": "tenant-001",
  "partnerId": "acme-marketplace",
  "eventType": "order.created",
  "publicPath": "/webhooks/acme-marketplace/order.created/wh_7R9k2",
  "credentialId": "cred-webhook-001",
  "status": "active",
  "keyLastRotatedAt": "2026-05-10T10:02:00Z",
  "createdAt": "2026-05-10T10:02:00Z"
}
```

### Outbound Connection

```json
{
  "connectionId": "conn-001",
  "tenantId": "tenant-001",
  "draftId": "draft-001",
  "name": "Carrier A Orders",
  "purpose": "source_payload",
  "protocol": "rest",
  "method": "GET",
  "url": "https://api.carrier-a.example/v1/orders",
  "credentialId": "cred-001",
  "environment": "production",
  "schedule": "*/5 * * * *",
  "timeoutMs": 5000,
  "retryPolicy": {
    "maxAttempts": 3,
    "backoff": "exponential"
  },
  "responseHandling": {
    "bodyType": "json",
    "itemsPath": "$.orders",
    "nextCheckpointPath": "$.nextUpdatedSince"
  },
  "status": "not_tested"
}
```

Connection `purpose` values:

- `source_payload`
- `enrichment`
- `destination`
- `manual_test`

### Sample Payload

```json
{
  "sampleId": "sample-001",
  "draftId": "draft-001",
  "sourceConfigId": "source-001",
  "name": "carrier-orders-response",
  "tag": "valid",
  "contentType": "application/json",
  "payload": {
    "orders": [
      {
        "id": "ORD-5521",
        "quantity": 4
      }
    ]
  },
  "payloadSha256": "abc123",
  "sizeBytes": 15342,
  "containsPii": true,
  "createdBy": "user-001",
  "createdAt": "2026-05-10T10:05:00Z"
}
```

Allowed `tag` values:

- `valid`
- `invalid`
- `edge_case`
- `production_failure`
- `external_api_response`
- `webhook_capture`
- `kafka_sample`

### Field Inventory Item

```json
{
  "fieldId": "field-001",
  "draftId": "draft-001",
  "sampleId": "sample-001",
  "jsonPointer": "/orders/0/customer/name",
  "jsonPath": "$.orders[0].customer.name",
  "displayName": "orders[].customer.name",
  "observedTypes": ["string"],
  "sampleValues": ["Ayse Yilmaz"],
  "occurrenceCount": 3,
  "sampleCount": 3,
  "nullable": false,
  "arrayContext": "$.orders[]",
  "piiHint": "name",
  "ignored": false
}
```

### Source Validation Rule

```json
{
  "sourceValidationRuleId": "sv-001",
  "draftId": "draft-001",
  "path": "customer.status",
  "kind": "enum",
  "paramA": "A,B,C",
  "paramB": "",
  "enabled": true,
  "orderIndex": 20
}
```

Supported source validation `kind` values:

- `required`
- `type`
- `enum`
- `min`
- `max`
- `min_length`
- `max_length`
- `regex`

### Schema Draft

```json
{
  "schemaDraftId": "schema-draft-001",
  "draftId": "draft-001",
  "schemaKind": "input",
  "schemaVersion": "v1",
  "schemaMeta": {
    "title": "Carrier Orders Input",
    "$id": "canonbridge://schemas/acme/order-created/input/v1"
  },
  "jsonSchema": {
    "type": "object",
    "required": ["orders"],
    "properties": {
      "orders": {
        "type": "array",
        "items": { "type": "object" }
      }
    }
  },
  "updatedBy": "user-001",
  "updatedAt": "2026-05-10T10:12:00Z"
}
```

Allowed `schemaKind` values:

- `input`
- `canonical`
- `published_input_snapshot`
- `published_canonical_snapshot`

### Canonical Target Field

```json
{
  "targetFieldId": "target-001",
  "draftId": "draft-001",
  "key": "customer.name",
  "type": "string",
  "required": true,
  "description": "Canonical customer display name",
  "source": "schema",
  "orderIndex": 10
}
```

The UI currently supports target field types `string`, `number`, and `date`. The API may accept the broader JSON Schema type set after canonical schema browser work is complete.

### Mapping Rule

```json
{
  "ruleId": "rule-001",
  "draftId": "draft-001",
  "sourcePath": "orders[0].customer.name",
  "targetKey": "customer.name",
  "transform": "direct",
  "params": {
    "paramA": "",
    "paramB": "",
    "paramC": ""
  },
  "advancedExpression": "",
  "jsonataExpression": null,
  "orderIndex": 10,
  "enabled": true,
  "notes": "Generated from visual rule"
}
```

Supported visual transform values are:

- `direct`
- `date_format`
- `enum_map`
- `number_coerce`
- `default_value`
- `combine`
- `string_uppercase`
- `string_lowercase`
- `string_trim`
- `string_substring`
- `string_replace`
- `array_join`
- `array_first`
- `array_last`
- `array_element`
- `array_count`
- `array_filter_equals`
- `math_sum`
- `math_average`
- `math_min`
- `math_max`
- `conditional_value`
- `template_string`

### Mapping Draft Artifact

```json
{
  "mappingDraftArtifactId": "mapping-draft-001",
  "draftId": "draft-001",
  "mode": "visual_rules",
  "generatedJsonata": "{ \"customer\": { \"name\": orders[0].customer.name } }",
  "manualJsonata": null,
  "artifactSha256": "def456",
  "updatedBy": "user-001",
  "updatedAt": "2026-05-10T10:25:00Z"
}
```

### Fixture

```json
{
  "fixtureId": "fixture-001",
  "draftId": "draft-001",
  "name": "happy-path-order",
  "configPath": "fixtures/valid-order.input.json",
  "inputJson": { "customer": { "name": "Ayse Yilmaz" } },
  "expectedJson": { "customer": { "name": "Ayse Yilmaz" } },
  "status": "passed",
  "actualJson": { "customer": { "name": "Ayse Yilmaz" } },
  "diffs": [],
  "errorMessage": null,
  "lastRunAt": "2026-05-10T10:31:00Z"
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
  "sourceRulesPassed": true,
  "jsonataPassed": true,
  "canonicalSchemaPassed": true,
  "fixturePassed": true,
  "outboundTestPassed": true,
  "durationMs": 3021,
  "summary": {
    "samplesTested": 3,
    "fixturesTested": 4,
    "errorCount": 0,
    "warningCount": 1
  }
}
```

### Validation Issue

```json
{
  "validationIssueId": "issue-001",
  "validationRunId": "run-001",
  "stage": "canonical_schema",
  "severity": "error",
  "code": "required",
  "message": "customer.email is required",
  "sourcePath": "customer.email",
  "targetKey": "customer.email",
  "schemaPath": "#/properties/customer/required",
  "ruleId": "rule-001"
}
```

### Review Request

```json
{
  "reviewRequestId": "review-001",
  "draftId": "draft-001",
  "status": "approved",
  "submittedBy": "user-001",
  "submittedAt": "2026-05-10T10:34:00Z",
  "reviewedBy": "user-002",
  "reviewedAt": "2026-05-10T10:38:00Z",
  "comment": "Approved for sandbox activation"
}
```

### Published Mapping Version

```json
{
  "mappingVersionId": "mv-001",
  "tenantId": "tenant-001",
  "partnerId": "acme-marketplace",
  "eventType": "order.created",
  "mappingVersion": "v1",
  "canonicalSchemaVersion": "v1",
  "status": "active",
  "sourceType": "external_api_poll",
  "sourceDraftId": "draft-001",
  "validationRunId": "run-001",
  "reviewRequestId": "review-001",
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

### Outbound Call History

```json
{
  "outboundCallHistoryId": "och-001",
  "tenantId": "tenant-001",
  "connectionId": "conn-001",
  "mappingVersionId": "mv-001",
  "correlationId": "corr-123",
  "requestId": "req-car-1842",
  "startedAt": "2026-05-10T10:41:00Z",
  "finishedAt": "2026-05-10T10:41:00.184Z",
  "durationMs": 184,
  "httpStatus": 200,
  "attemptCount": 1,
  "result": "success",
  "safeRequestPreview": {
    "method": "GET",
    "path": "/orders?limit=10"
  },
  "safeResponsePreview": {
    "orders": []
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
- External API and webhook drafts cannot publish until their source-specific gates pass.

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

### Source and Trigger

| Method | Path | Purpose |
|--------|------|---------|
| `PUT` | `/api/mapping-drafts/{draftId}/source` | Save source type and source config |
| `GET` | `/api/mapping-drafts/{draftId}/source` | Read source config |
| `POST` | `/api/mapping-drafts/{draftId}/source/analyze` | Build field inventory from selected source sample |
| `POST` | `/api/mapping-drafts/{draftId}/source/kafka/fetch-sample` | Fetch allowed non-production Kafka sample |
| `POST` | `/api/mapping-drafts/{draftId}/source/external-api/test` | Execute source API test through outbound-call-manager |

### Webhooks

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mapping-drafts/{draftId}/webhook` | Create webhook endpoint and inbound credential |
| `GET` | `/api/mapping-drafts/{draftId}/webhook` | Read webhook metadata |
| `POST` | `/api/mapping-drafts/{draftId}/webhook/rotate-secret` | Rotate inbound secret |
| `GET` | `/api/mapping-drafts/{draftId}/webhook/deliveries` | List recent deliveries |
| `POST` | `/api/mapping-drafts/{draftId}/webhook/capture-next` | Capture next delivery as sample |

### Credentials

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/credentials` | List credential metadata only |
| `POST` | `/api/credentials` | Create credential with write-only secret payload |
| `PATCH` | `/api/credentials/{credentialId}` | Update metadata or replace secret |
| `POST` | `/api/credentials/{credentialId}/rotate` | Replace secret value |
| `POST` | `/api/credentials/{credentialId}/disable` | Disable credential |

### Outbound Connections and External Systems

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mapping-drafts/{draftId}/outbound-connections` | Add source/enrichment/destination connection |
| `GET` | `/api/mapping-drafts/{draftId}/outbound-connections` | List draft connections |
| `PATCH` | `/api/mapping-drafts/{draftId}/outbound-connections/{connectionId}` | Update connection |
| `DELETE` | `/api/mapping-drafts/{draftId}/outbound-connections/{connectionId}` | Remove connection |
| `POST` | `/api/mapping-drafts/{draftId}/outbound-connections/{connectionId}/test` | Execute permission-gated test call |
| `GET` | `/api/external-systems` | List connection health summaries |
| `GET` | `/api/external-systems/{connectionId}` | Get connection detail |
| `GET` | `/api/external-systems/{connectionId}/calls` | List safe call history |
| `POST` | `/api/external-systems/{connectionId}/test` | Run live connection test |

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
| `POST` | `/api/mapping-drafts/{draftId}/source-validation-rules` | Create source validation rule |
| `GET` | `/api/mapping-drafts/{draftId}/source-validation-rules` | List source validation rules |
| `PATCH` | `/api/mapping-drafts/{draftId}/source-validation-rules/{ruleId}` | Update source validation rule |
| `DELETE` | `/api/mapping-drafts/{draftId}/source-validation-rules/{ruleId}` | Delete source validation rule |
| `POST` | `/api/mapping-drafts/{draftId}/schemas/input/generate` | Generate input JSON Schema |
| `GET` | `/api/mapping-drafts/{draftId}/schemas/input` | Read input schema draft |
| `PUT` | `/api/mapping-drafts/{draftId}/schemas/input` | Replace input schema draft |
| `POST` | `/api/mapping-drafts/{draftId}/schemas/input/validate` | Validate samples against input schema |

### Canonical Fields, Mapping Rules, and JSONata

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/canonical-schemas` | List canonical schemas |
| `GET` | `/api/canonical-schemas/{eventType}/{version}` | Get canonical schema |
| `PUT` | `/api/mapping-drafts/{draftId}/target-fields` | Replace canonical target field list |
| `POST` | `/api/mapping-drafts/{draftId}/rules` | Create mapping rule |
| `GET` | `/api/mapping-drafts/{draftId}/rules` | List mapping rules |
| `PATCH` | `/api/mapping-drafts/{draftId}/rules/{ruleId}` | Update mapping rule |
| `DELETE` | `/api/mapping-drafts/{draftId}/rules/{ruleId}` | Delete mapping rule |
| `POST` | `/api/mapping-drafts/{draftId}/jsonata/generate` | Generate JSONata from rules |
| `PUT` | `/api/mapping-drafts/{draftId}/jsonata/manual` | Save manual JSONata override |
| `POST` | `/api/mapping-drafts/{draftId}/preview` | Run transform preview |

### Fixtures, Validation, Review, Publish

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mapping-drafts/{draftId}/fixtures` | Create fixture |
| `GET` | `/api/mapping-drafts/{draftId}/fixtures` | List fixtures |
| `PATCH` | `/api/mapping-drafts/{draftId}/fixtures/{fixtureId}` | Update fixture |
| `DELETE` | `/api/mapping-drafts/{draftId}/fixtures/{fixtureId}` | Delete fixture |
| `POST` | `/api/mapping-drafts/{draftId}/fixtures/run` | Run all fixtures |
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
  "useManualJsonata": false,
  "runExternalApiTest": true
}
```

Response:

```json
{
  "status": "failed",
  "durationMs": 42,
  "sourceTest": {
    "connectionId": "conn-001",
    "status": "passed",
    "httpStatus": 200,
    "durationMs": 184
  },
  "canonicalOutput": {
    "orderId": "ORD-123"
  },
  "errors": [
    {
      "stage": "canonical_schema",
      "code": "required",
      "message": "customer.email is required",
      "sourcePath": "$.customer.email",
      "targetKey": "customer.email",
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
  outbound/
    request-templates/
    wsdl/
```

Published `config.json` may contain source, trigger, authentication references, outbound connection definitions, schema refs, mapping refs, and fixture refs. It must not contain raw secret values.

## PostgreSQL Physical Model

Recommended schema prefix: `etl` for product tables and `audit` for append-only audit tables.

### Table Inventory

| Table | Purpose |
|-------|---------|
| `etl.partners` | Tenant partner catalog |
| `etl.partner_event_drafts` | Editable partner/event mapping workspace |
| `etl.draft_source_configs` | Source type and trigger/source settings |
| `etl.sample_payloads` | Source samples and captured responses stored as JSONB |
| `etl.source_field_inventory` | Inferred source field paths and stats |
| `etl.source_validation_rules` | Source-side validation rules from the UI |
| `etl.schema_drafts` | Input/canonical schema docs attached to draft |
| `etl.canonical_target_fields` | Target field rows shown in canonical step |
| `etl.mapping_rules` | Ordered visual/advanced mapping rules |
| `etl.mapping_draft_artifacts` | Generated/manual JSONata draft artifact |
| `etl.fixtures` | Fixture input, expected output, run result, diffs |
| `etl.validation_runs` | Validation run summary |
| `etl.validation_run_issues` | Validation errors and warnings |
| `etl.review_requests` | Review workflow state |
| `etl.published_mapping_versions` | Immutable published version metadata |
| `etl.mapping_version_artifacts` | Published artifact refs and checksums |
| `etl.credential_records` | Credential metadata and encrypted secret blob |
| `etl.outbound_connections` | Draft/published REST, SOAP, webhook, or scheduled poll config |
| `etl.outbound_call_history` | Safe request/response previews and health history |
| `etl.webhook_endpoints` | Generated webhook endpoint metadata |
| `etl.webhook_deliveries` | Recent webhook delivery metadata and optional captured sample ref |
| `audit.mapping_audit_events` | Append-only mapping/audit event log |

### DDL Sketch

This is a product-model sketch, not a migration file. Production migrations should follow the expand-and-contract process in `docs/deployment/05-database-migrations.md`.

```sql
create table if not exists etl.partners (
  tenant_id varchar(80) not null,
  partner_id varchar(120) not null,
  name varchar(200) not null,
  status varchar(30) not null check (status in ('active', 'inactive', 'archived')),
  created_by varchar(120) not null,
  created_at timestamptz not null default now(),
  updated_by varchar(120),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, partner_id)
);

create table if not exists etl.partner_event_drafts (
  draft_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  partner_id varchar(120) not null,
  event_type varchar(120) not null,
  canonical_event_type varchar(120) not null,
  canonical_schema_version varchar(40) not null,
  status varchar(40) not null check (status in (
    'draft', 'validating', 'ready_for_review', 'changes_requested',
    'approved', 'published', 'archived'
  )),
  environment varchar(40) not null check (environment in ('sandbox', 'production')),
  source_type varchar(40) not null check (source_type in (
    'kafka_topic', 'webhook', 'external_api_poll', 'manual_upload'
  )),
  owner_user_id varchar(120) not null,
  reviewer_group_id varchar(120),
  change_reason text,
  version integer not null default 1,
  created_by varchar(120) not null,
  created_at timestamptz not null default now(),
  updated_by varchar(120),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, partner_id) references etl.partners(tenant_id, partner_id)
);

create table if not exists etl.draft_source_configs (
  source_config_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  source_type varchar(40) not null,
  config jsonb not null default '{}'::jsonb,
  last_sample_id uuid null,
  last_test_status varchar(30) null,
  last_tested_at timestamptz null,
  version integer not null default 1,
  created_by varchar(120) not null,
  created_at timestamptz not null default now(),
  updated_by varchar(120),
  updated_at timestamptz not null default now(),
  unique (draft_id)
);

create table if not exists etl.sample_payloads (
  sample_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  source_config_id uuid null references etl.draft_source_configs(source_config_id) on delete set null,
  name varchar(180) not null,
  tag varchar(40) not null,
  content_type varchar(120) not null default 'application/json',
  payload jsonb not null,
  payload_storage_ref text null,
  payload_sha256 varchar(128) not null,
  size_bytes bigint not null,
  contains_pii boolean not null default false,
  created_by varchar(120) not null,
  created_at timestamptz not null default now()
);

create table if not exists etl.source_field_inventory (
  field_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  sample_id uuid null references etl.sample_payloads(sample_id) on delete set null,
  json_pointer text not null,
  json_path text not null,
  display_name varchar(240) not null,
  observed_types jsonb not null default '[]'::jsonb,
  sample_values jsonb not null default '[]'::jsonb,
  occurrence_count integer not null default 0,
  sample_count integer not null default 0,
  nullable boolean not null default false,
  array_context text null,
  pii_hint varchar(80),
  ignored boolean not null default false,
  ignored_reason text,
  updated_at timestamptz not null default now(),
  unique (draft_id, json_path)
);

create table if not exists etl.source_validation_rules (
  source_validation_rule_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  path text not null,
  kind varchar(40) not null check (kind in (
    'required', 'type', 'enum', 'min', 'max', 'min_length', 'max_length', 'regex'
  )),
  param_a text not null default '',
  param_b text not null default '',
  enabled boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists etl.schema_drafts (
  schema_draft_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  schema_kind varchar(40) not null check (schema_kind in (
    'input', 'canonical', 'published_input_snapshot', 'published_canonical_snapshot'
  )),
  schema_version varchar(40) not null,
  schema_meta jsonb not null default '{}'::jsonb,
  json_schema jsonb not null,
  updated_by varchar(120) not null,
  updated_at timestamptz not null default now(),
  unique (draft_id, schema_kind, schema_version)
);

create table if not exists etl.canonical_target_fields (
  target_field_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  key text not null,
  type varchar(40) not null,
  required boolean not null default false,
  description text not null default '',
  source varchar(30) not null check (source in ('manual', 'schema')),
  order_index integer not null default 0,
  unique (draft_id, key)
);

create table if not exists etl.mapping_rules (
  rule_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  source_path text not null default '',
  target_key text not null default '',
  transform varchar(60) not null,
  params jsonb not null default '{}'::jsonb,
  advanced_expression text not null default '',
  jsonata_expression text null,
  enabled boolean not null default true,
  order_index integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists etl.mapping_draft_artifacts (
  mapping_draft_artifact_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  mode varchar(40) not null check (mode in ('visual_rules', 'manual_jsonata', 'hybrid')),
  generated_jsonata text not null,
  manual_jsonata text null,
  artifact_sha256 varchar(128) not null,
  updated_by varchar(120) not null,
  updated_at timestamptz not null default now(),
  unique (draft_id)
);

create table if not exists etl.fixtures (
  fixture_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  name varchar(180) not null,
  config_path text null,
  input_json jsonb not null,
  expected_json jsonb null,
  status varchar(30) not null default 'idle' check (status in ('idle', 'passed', 'failed', 'error')),
  actual_json jsonb null,
  diffs jsonb not null default '[]'::jsonb,
  error_message text null,
  last_run_at timestamptz null,
  updated_by varchar(120),
  updated_at timestamptz not null default now()
);

create table if not exists etl.validation_runs (
  validation_run_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  status varchar(30) not null check (status in ('running', 'passed', 'failed', 'error')),
  input_schema_passed boolean not null default false,
  source_rules_passed boolean not null default false,
  jsonata_passed boolean not null default false,
  canonical_schema_passed boolean not null default false,
  fixture_passed boolean not null default false,
  outbound_test_passed boolean not null default false,
  duration_ms integer,
  summary jsonb not null default '{}'::jsonb,
  started_by varchar(120) not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz null
);

create table if not exists etl.validation_run_issues (
  validation_issue_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  validation_run_id uuid not null references etl.validation_runs(validation_run_id) on delete cascade,
  stage varchar(60) not null,
  severity varchar(20) not null check (severity in ('info', 'warning', 'error')),
  code varchar(80) not null,
  message text not null,
  source_path text,
  target_key text,
  schema_path text,
  rule_id uuid null references etl.mapping_rules(rule_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists etl.review_requests (
  review_request_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid not null references etl.partner_event_drafts(draft_id) on delete cascade,
  validation_run_id uuid null references etl.validation_runs(validation_run_id),
  status varchar(30) not null check (status in ('submitted', 'approved', 'rejected', 'changes_requested')),
  submitted_by varchar(120) not null,
  submitted_at timestamptz not null default now(),
  reviewed_by varchar(120),
  reviewed_at timestamptz,
  comment text
);

create table if not exists etl.published_mapping_versions (
  mapping_version_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  partner_id varchar(120) not null,
  event_type varchar(120) not null,
  mapping_version varchar(40) not null,
  canonical_schema_version varchar(40) not null,
  source_type varchar(40) not null,
  status varchar(30) not null check (status in ('active', 'inactive', 'deprecated', 'archived')),
  source_draft_id uuid not null references etl.partner_event_drafts(draft_id),
  validation_run_id uuid not null references etl.validation_runs(validation_run_id),
  review_request_id uuid null references etl.review_requests(review_request_id),
  artifact_sha256 varchar(128) not null,
  transformation_count bigint not null default 0,
  approved_by varchar(120) not null,
  published_by varchar(120) not null,
  published_at timestamptz not null default now(),
  activated_at timestamptz null,
  unique (tenant_id, partner_id, event_type, mapping_version),
  foreign key (tenant_id, partner_id) references etl.partners(tenant_id, partner_id)
);

create table if not exists etl.mapping_version_artifacts (
  artifact_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  mapping_version_id uuid not null references etl.published_mapping_versions(mapping_version_id) on delete cascade,
  artifact_type varchar(40) not null,
  artifact_ref text not null,
  artifact_sha256 varchar(128) not null,
  content_snapshot jsonb null,
  created_at timestamptz not null default now(),
  unique (mapping_version_id, artifact_type)
);

create table if not exists etl.credential_records (
  credential_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  display_name varchar(180) not null,
  auth_type varchar(40) not null check (auth_type in (
    'api_key', 'basic_auth', 'bearer_token', 'oauth2_client_credentials'
  )),
  environment varchar(40) not null check (environment in ('sandbox', 'production')),
  encrypted_secret_json text not null,
  key_version varchar(80) not null,
  status varchar(30) not null check (status in ('active', 'disabled', 'rotation_due')),
  rotation_due_at timestamptz null,
  created_by varchar(120) not null,
  created_at timestamptz not null default now(),
  updated_by varchar(120) not null,
  updated_at timestamptz not null default now(),
  last_used_at timestamptz null
);

create table if not exists etl.outbound_connections (
  connection_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid null references etl.partner_event_drafts(draft_id) on delete cascade,
  mapping_version_id uuid null references etl.published_mapping_versions(mapping_version_id) on delete cascade,
  name varchar(180) not null,
  purpose varchar(40) not null check (purpose in ('source_payload', 'enrichment', 'destination', 'manual_test')),
  protocol varchar(30) not null check (protocol in ('rest', 'soap', 'webhook', 'scheduled_poll')),
  method varchar(10) not null check (method in ('GET', 'POST', 'PUT')),
  url text not null,
  credential_id uuid null references etl.credential_records(credential_id),
  environment varchar(40) not null check (environment in ('sandbox', 'production')),
  headers jsonb not null default '{}'::jsonb,
  query_params jsonb not null default '{}'::jsonb,
  body_template text null,
  schedule text null,
  timeout_ms integer not null default 3000,
  retry_policy jsonb not null default '{}'::jsonb,
  response_handling jsonb not null default '{}'::jsonb,
  wsdl_ref text null,
  status varchar(30) not null default 'not_tested',
  last_tested_at timestamptz null,
  created_by varchar(120) not null,
  created_at timestamptz not null default now(),
  updated_by varchar(120),
  updated_at timestamptz not null default now(),
  check (draft_id is not null or mapping_version_id is not null)
);

create table if not exists etl.outbound_call_history (
  outbound_call_history_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  connection_id uuid not null references etl.outbound_connections(connection_id),
  mapping_version_id uuid null references etl.published_mapping_versions(mapping_version_id),
  draft_id uuid null references etl.partner_event_drafts(draft_id),
  correlation_id varchar(120) not null,
  request_id varchar(120),
  started_at timestamptz not null default now(),
  finished_at timestamptz null,
  duration_ms integer,
  http_status integer,
  attempt_count integer not null default 1,
  result varchar(30) not null check (result in ('success', 'failed')),
  error_code varchar(120),
  safe_error_message text,
  safe_request_preview jsonb not null default '{}'::jsonb,
  safe_response_preview jsonb not null default '{}'::jsonb
);

create table if not exists etl.webhook_endpoints (
  webhook_endpoint_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  draft_id uuid null references etl.partner_event_drafts(draft_id) on delete cascade,
  mapping_version_id uuid null references etl.published_mapping_versions(mapping_version_id),
  partner_id varchar(120) not null,
  event_type varchar(120) not null,
  public_path text not null,
  credential_id uuid not null references etl.credential_records(credential_id),
  status varchar(30) not null check (status in ('active', 'disabled', 'rotating')),
  key_last_rotated_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (tenant_id, public_path),
  foreign key (tenant_id, partner_id) references etl.partners(tenant_id, partner_id)
);

create table if not exists etl.webhook_deliveries (
  webhook_delivery_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  webhook_endpoint_id uuid not null references etl.webhook_endpoints(webhook_endpoint_id),
  sample_id uuid null references etl.sample_payloads(sample_id),
  correlation_id varchar(120) not null,
  received_at timestamptz not null default now(),
  http_status integer,
  result varchar(30) not null check (result in ('accepted', 'rejected', 'failed')),
  safe_error_message text,
  payload_sha256 varchar(128),
  size_bytes bigint
);

create table if not exists audit.mapping_audit_events (
  audit_event_id uuid primary key default uuid_generate_v4(),
  tenant_id varchar(80) not null,
  actor_user_id varchar(120) not null,
  event_type varchar(120) not null,
  draft_id uuid null,
  mapping_version_id uuid null,
  connection_id uuid null,
  credential_id uuid null,
  correlation_id varchar(120),
  before_summary jsonb,
  after_summary jsonb,
  result varchar(30) not null default 'success',
  created_at timestamptz not null default now()
);
```

### Required Indexes

```sql
create index if not exists idx_mapping_drafts_tenant_status
  on etl.partner_event_drafts (tenant_id, status, updated_at desc);

create index if not exists idx_mapping_drafts_partner_event
  on etl.partner_event_drafts (tenant_id, partner_id, event_type);

create index if not exists idx_samples_draft
  on etl.sample_payloads (tenant_id, draft_id, created_at desc);

create index if not exists idx_samples_payload_gin
  on etl.sample_payloads using gin (payload);

create index if not exists idx_field_inventory_draft_path
  on etl.source_field_inventory (tenant_id, draft_id, json_path);

create index if not exists idx_mapping_rules_draft_order
  on etl.mapping_rules (tenant_id, draft_id, order_index);

create index if not exists idx_mapping_versions_active
  on etl.published_mapping_versions (tenant_id, partner_id, event_type, status);

create index if not exists idx_credential_records_tenant
  on etl.credential_records (tenant_id, auth_type, environment, status);

create index if not exists idx_outbound_connections_lookup
  on etl.outbound_connections (tenant_id, draft_id, mapping_version_id, purpose);

create index if not exists idx_outbound_call_history_connection_time
  on etl.outbound_call_history (tenant_id, connection_id, started_at desc);

create index if not exists idx_webhook_deliveries_endpoint_time
  on etl.webhook_deliveries (tenant_id, webhook_endpoint_id, received_at desc);

create index if not exists idx_mapping_audit_tenant_time
  on audit.mapping_audit_events (tenant_id, created_at desc);
```

## Audit Events

Audit event types:

- `draft.created`
- `draft.source.updated`
- `sample.uploaded`
- `field.ignored`
- `schema.generated`
- `schema.edited`
- `source_validation.rule.created`
- `source_validation.rule.updated`
- `mapping.rule.created`
- `mapping.rule.updated`
- `jsonata.manual_override.enabled`
- `fixture.created`
- `fixture.run.completed`
- `validation.run.completed`
- `review.submitted`
- `review.approved`
- `review.rejected`
- `version.published`
- `version.activated`
- `version.rolled_back`
- `version.archived`
- `credential.created`
- `credential.updated`
- `credential.disabled`
- `credential.attached_to_draft`
- `webhook.created`
- `webhook.secret_rotated`
- `webhook.sample_captured`
- `outbound.connection.created`
- `outbound.connection.updated`
- `outbound.connection.tested`
- `external_system.health_viewed`

Audit records should include actor, tenant, draft/version/connection/credential identifiers, timestamp, safe before/after summary, result, and request correlation ID. Secret values must never appear in audit records.

## Security Rules

- Store sample payloads and fixtures in PostgreSQL with encryption at rest at the database/disk layer; encrypt specific high-sensitivity payload columns at the application layer if tenant policy requires it.
- Store credential secret blobs encrypted with envelope encryption. PostgreSQL stores ciphertext only.
- Mask sample values in logs.
- Never log raw uploaded JSON, raw outbound responses, webhook secrets, API keys, bearer tokens, Basic Auth material, OAuth client secrets, or generated Authorization headers.
- Enforce tenant isolation on every endpoint.
- Require approval for publish in production environments.
- Require elevated permission for manual JSONata override.
- Require `credential:use` before attaching credentials to source or outbound config.
- Validate URL allowlists, private IP protections, timeout/retry policy, active credential references, fixtures, and canonical schema before publish.
- Preserve audit events even if drafts are archived.
