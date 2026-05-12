# Backend Service Requirements

- **Last Updated**: May 12, 2026
- **Scope**: Backend runtime and management services required after the sales-demo UI phase.

This document is the backend implementation source of truth. It reconciles the original Kafka transformer architecture with the newer Mapping Studio, outbound API, credential store, webhook, and scheduled polling requirements.

The current UI may remain demo-only and local-state based. These requirements describe the production backend that will persist mappings, validate publish gates, execute transformations, and connect CanonBridge to external systems.

---

## 1. Backend Service Inventory

| Service | Runtime | Required For MVP | Responsibility |
|---------|---------|------------------|----------------|
| `mapping-studio-api` | Java / Quarkus | Yes | Draft storage, schemas, mappings, fixtures, validation runs, publish workflow, partners, external systems metadata, DLQ/admin actions, audit events. |
| `transformer-service` | Node.js / TypeScript | Yes | Kafka and internal transform execution, JSONata evaluation, Ajv validation, mapping/schema cache, worker pool, retry and DLQ routing. |
| `outbound-call-manager` | Java / Quarkus | Yes for outbound flows | Executes controlled REST/SOAP calls, resolves credential references, applies timeout/retry/circuit breaker policies, stores safe call history. |
| `credential-store` | PostgreSQL encrypted table or Vault integration | Yes for outbound flows | Stores secret material as encrypted write-only blobs and exposes metadata-only reads. |
| `webhook-receiver` | Java / Quarkus, can be module of `mapping-studio-api` | Yes for webhook source type | Accepts inbound partner HTTP payloads, validates inbound key, wraps raw envelopes, publishes to raw Kafka topic. |
| `scheduled-poller` | Java / Quarkus scheduler or Kubernetes CronJob controlled by CanonBridge config | Yes for scheduled source type | Runs periodic external API pulls, tracks checkpoints, hands response payloads to the transformer flow. |
| `business-consumer-service` | Java / Quarkus | Yes for end-to-end business processing | Consumes canonical events, enforces idempotency and ordering, writes domain state and outbox rows in one transaction. |
| `outbox-publisher` | Java / Quarkus poller, CDC later | Yes for event publication | Publishes durable outbox rows to Kafka and marks rows as published. |

### Optional Later Services

| Service | Reason to Defer |
|---------|-----------------|
| Dedicated audit-log service | MVP can write audit rows from `mapping-studio-api` and runtime services. Split only when volume or compliance requires it. |
| Dedicated schema registry service | MVP can version schemas in PostgreSQL and Git-backed artifacts. Add a service when multi-team governance needs it. |
| SFTP/S3 adapters | Keep as protocol extensions after Kafka, webhook, manual, and scheduled API triggers are stable. |
| Airflow | Not required for simple scheduled polling. CanonBridge should schedule its own polling jobs first. |

---

## 2. Required Backend Boundaries

### 2.1 Mapping Studio API Owns Management State

`mapping-studio-api` owns all user-authored configuration before publish:

- Partners and partner onboarding metadata
- Mapping drafts and immutable mapping versions
- Uploaded source samples and inferred field metadata
- Input schemas and canonical schema references
- Source validation rules
- Visual mapping rules and generated JSONata
- Fixture rows, fixture results, and validation runs
- External system connection metadata
- Credential metadata, never raw secret values in read responses
- Publish approvals and audit records

The complete API and database model is maintained in [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md).

### 2.2 Transformer Service Owns Deterministic Transformation

`transformer-service` must stay deterministic:

- It evaluates published mapping artifacts.
- It validates source and canonical JSON with Ajv.
- It produces canonical events or DLQ entries.
- It may call `outbound-call-manager` only through a controlled internal API when a published config declares a required enrichment step.
- It must not embed HTTP clients, credential access, or arbitrary network I/O inside JSONata.

### 2.3 Outbound Call Manager Owns External Network I/O

`outbound-call-manager` is not a public API gateway. It only makes outbound requests on behalf of approved CanonBridge flows.

It must enforce:

- Tenant-scoped connection lookup
- URL allowlists and private IP protection
- Timeout, retry, and circuit breaker policy
- Request/response masking before storage
- Credential resolution through `credential-store`
- REST and SOAP/XML execution paths
- Safe call history for the External Systems health dashboard

### 2.4 Credential Store Owns Secrets

Secret values must never appear in:

- Git
- Mapping JSONata
- Published `config.json`
- Browser local storage
- API read responses
- Audit records
- Logs
- DLQ payload previews

API responses expose credential metadata only. Secret fields are write-only on create, rotate, or replace operations.

---

## 3. Trigger and Source Requirements

A transformation flow can start in four ways:

| Source Type | Backend Owner | Flow |
|-------------|---------------|------|
| Kafka topic | `transformer-service` | Kafka raw event -> transform -> canonical Kafka event |
| Webhook | `webhook-receiver` | External HTTP request -> raw envelope -> Kafka raw topic -> transform |
| Scheduled external API | `scheduled-poller` + `outbound-call-manager` | Schedule tick -> outbound API call -> response payload -> transform |
| Manual test | `mapping-studio-api` + `transformer-service` | UI/API submits sample payload -> internal transform test -> validation result |

Manual tests must not publish business events unless explicitly marked as a controlled dry-run or replay operation.

---

## 4. Data Stores

| Store | Required | Contents |
|-------|----------|----------|
| PostgreSQL | Yes | Mapping drafts, mapping versions, partners, schemas metadata, validation runs, fixtures, credentials metadata/encrypted blobs, outbound connections, webhook endpoints, call history, audit log, business domain tables, outbox. |
| Kafka | Yes | Raw partner events, canonical events, retry topics, DLQ topic, business events. |
| Redis | Optional | Mapping/schema cache, OAuth token cache, rate-limit counters. Must be replaceable by in-process cache in MVP. |
| Object storage | Later | Large payload samples, large fixture packs, long-retention call previews. MVP can store small masked samples in PostgreSQL. |

PostgreSQL table definitions for Mapping Studio state live in [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md). Runtime business tables are covered by [Business Layer](../architecture/06-business-layer.md) and [Outbox Pattern](../architecture/09-outbox-pattern.md).

---

## 5. Internal API Requirements

### 5.1 Mapping Studio API

Minimum route groups:

- `/api/partners`
- `/api/mapping-drafts`
- `/api/mapping-versions`
- `/api/credentials`
- `/api/outbound-connections`
- `/api/webhook-endpoints`
- `/api/validation-runs`
- `/api/fixtures`
- `/api/dlq`
- `/api/audit-events`

The detailed route list is defined in [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md#7-api-surface).

### 5.2 Transformer Internal API

```http
POST /v1/transform
POST /v1/validate-expression
GET  /health/live
GET  /health/ready
GET  /metrics
```

`POST /v1/transform` must accept a payload, partner/event/version context, and an optional dry-run flag. Dry runs return transformed output and validation messages without producing to Kafka.

### 5.3 Outbound Manager Internal API

```http
POST /internal/outbound/execute
POST /internal/outbound/test
GET  /internal/outbound/connections/{connectionId}/health
GET  /internal/outbound/calls
GET  /health/live
GET  /health/ready
GET  /metrics
```

`execute` is used by runtime flows. `test` is used by Mapping Studio and must be permission-gated and rate-limited.

---

## 6. Configuration Requirements

Configuration is split into two layers:

1. Runtime environment variables for service infrastructure.
2. Published partner/event configuration for per-flow behavior.

Published config may contain:

- Source type and trigger policy
- Kafka topic names
- Webhook endpoint reference
- Scheduled polling policy
- Outbound connection references
- Credential references
- Mapping artifact references
- Schema artifact references
- Retry and DLQ policy

Published config must not contain raw secrets.

See [Configuration Management](./02-configuration.md) for environment variables and [Architecture V7](../architecture/architecture-v7-outbound.md#40-partnerevent-configuration-update) for an outbound-aware `config.json` example.

---

## 7. Validation and Publish Gates

A mapping version cannot be published unless these checks pass:

1. Source JSON parses and source validation rules pass for at least one sample.
2. Input schema, when present, validates the sample.
3. Required canonical fields are mapped.
4. Generated JSONata parses and executes.
5. Canonical output validates against the selected canonical schema.
6. Fixture batch passes or has an explicit reviewer override.
7. External API connections referenced by the mapping have a successful test or approved exception.
8. Credential references are active, tenant-scoped, and usable by the publishing actor.
9. Outbound URLs pass allowlist and private-network checks.
10. Audit events are written for publish attempt, result, and version metadata.

---

## 8. Security Requirements

### Required Controls

- Tenant ID is mandatory in every management and runtime request.
- RBAC must cover mapping drafts, publish, credentials, outbound testing, DLQ redrive/discard, and audit read access.
- Credential values use envelope encryption or Vault.
- OAuth2 client credentials tokens are cached only in memory or Redis with expiry.
- Logs use structured JSON and mask configured PII and secret paths.
- Payload previews are masked before persistence.
- SSRF protection is mandatory for outbound URLs.
- Webhook keys are rotatable and stored as credentials.
- DLQ payload inspector must show masked payloads by default.

### Required Audit Events

- `mapping.draft.created`
- `mapping.version.published`
- `mapping.version.deprecated`
- `credential.created`
- `credential.rotated`
- `credential.disabled`
- `credential.used`
- `outbound.connection.created`
- `outbound.connection.tested`
- `outbound.call.succeeded`
- `outbound.call.failed`
- `webhook.key.rotated`
- `scheduled_poll.checkpoint_updated`
- `dlq.message.redriven`
- `dlq.message.discarded`
- `settings.api_key.generated`
- `settings.api_key.revoked`

---

## 9. Observability Requirements

Each backend service must expose:

- `/health/live`
- `/health/ready`
- `/metrics`
- Correlation ID propagation
- Tenant, partner, event type, mapping version, and source type dimensions where safe

Minimum metrics:

- `transform_duration_ms`
- `transform_total`
- `transform_failure_total`
- `jsonata_eval_duration_ms`
- `ajv_validation_failure_total`
- `dlq_total`
- `outbound_call_duration_ms`
- `outbound_call_total`
- `outbound_retry_total`
- `credential_access_total`
- `scheduled_poll_lag_seconds`
- `webhook_delivery_total`
- `outbox_publish_total`
- `business_consumer_lag`

---

## 10. Test Requirements

### Unit Tests

- JSONata generation for every visual transform kind
- Ajv schema validation helpers
- Error classification
- Credential masking
- URL allowlist and private IP blocking
- SOAP envelope building and XML conversion

### Contract Tests

- Mapping Studio API request/response DTOs
- Transformer `/v1/transform`
- Outbound manager `execute` and `test`
- Webhook receiver authentication and envelope shape

### Integration Tests

- PostgreSQL migrations and repository behavior
- Kafka raw -> transformer -> canonical happy path
- Invalid payload -> DLQ
- Outbound required failure -> retry/DLQ
- Scheduled poll checkpoint update
- Publish gates with valid and invalid mappings

### Fixture Tests

Every published partner/event mapping must include:

- At least one happy-path fixture
- Missing required field fixture
- Invalid type fixture
- Optional field missing fixture when applicable
- Outbound failure fixture when applicable

---

## 11. Excess or Conflicting Requirements Removed

The following should not be treated as current backend requirements:

- A second production frontend in React. Current active UI direction is Angular Mapping Studio.
- Custom backend adapter code per partner.
- JSONata functions that directly call external APIs or read credentials.
- A public inbound API gateway role for `outbound-call-manager`.
- Separate Airflow dependency for basic scheduled polling.
- Raw secret values in exported Studio configuration.
- Treating webhook and scheduled polling as out of scope.
- Treating the existing demo UI as proof that backend runtime calls are complete.

---

## 12. Implementation Order

1. Lock PostgreSQL schema and migrations for Mapping Studio API state.
2. Implement `mapping-studio-api` draft, credential metadata, outbound metadata, fixture, validation, and publish endpoints.
3. Harden `transformer-service` around the existing scaffold: config loading, Kafka smoke test, metrics, DLQ, dry-run validation.
4. Implement `credential-store` encryption and metadata-only API behavior.
5. Implement `outbound-call-manager` REST execution, test endpoint, masking, allowlist, retry, and call history.
6. Add webhook receiver and scheduled poller modules.
7. Add business consumer and outbox publisher for end-to-end canonical event processing.
8. Add contract, integration, fixture, and load tests.

---

## 13. Acceptance Criteria

Backend requirements are satisfied when:

- A mapping can be created, validated, published, deprecated, and version-inspected through APIs.
- A Kafka raw event can be transformed into a canonical event and produced.
- A webhook payload can enter the same raw event flow.
- A scheduled external API call can fetch data and transform it without Airflow.
- REST and SOAP outbound calls can be tested and executed without exposing secrets.
- Credential access is encrypted, tenant-scoped, authorized, and audited.
- DLQ redrive/discard actions are persisted and audited.
- External Systems health uses stored call history and safe previews.
- All publish gates are enforced server-side.
- The UI can stay demo-friendly while backend behavior remains production-grade.

---

## See Also

- [Architecture Overview](../architecture/01-overview.md)
- [Architecture V7 - Outbound API Calling and Credential Store](../architecture/architecture-v7-outbound.md)
- [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md)
- [Transformer Node.js Guide](./TRANSFORMER_NODEJS_GUIDE.md)
- [Business Services Java/Quarkus Guide](./SERVICES_JAVA_QUARKUS_GUIDE.md)
