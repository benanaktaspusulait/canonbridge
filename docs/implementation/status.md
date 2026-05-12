# CanonBridge - Implementation Status

> See [MASTER_ROADMAP.md](../project/MASTER_ROADMAP.md) for the official product roadmap. This page tracks the practical implementation state as of the latest repository review.

- **Date**: May 12, 2026
- **Phase**: Demo UI + Backend Requirements Consolidation
- **Status**: In progress

---

## Overall Progress

| Area | Status | Notes |
|------|--------|-------|
| Mapping Studio demo UI | In progress, demo-capable | Angular demo screens exist under [`mapping-studio-ui/`](../../mapping-studio-ui/). Backend calls are intentionally simulated/local for now. |
| Transformer service | Scaffold exists | `services/transformer/` contains a Node.js/TypeScript scaffold with HTTP transform, Kafka runner, worker pool, cache, metrics, tests, Docker, and Kubernetes assets. |
| Backend production services | Requirements defined | Service inventory and acceptance criteria are captured in [Backend Service Requirements](./11-backend-service-requirements.md). |
| Mapping Studio API/data model | Specified | Data model, API surface, publish gates, credential metadata, outbound connections, webhook metadata, fixtures, and audit tables are specified in [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md). |
| Outbound API and Credential Store | Specified | V7 architecture defines `outbound-call-manager`, Credential Store, REST/SOAP support, scheduled polling, webhook source, and security controls. |
| Business consumer and outbox | Designed | Architecture exists; production service implementation is not complete. |
| End-to-end backend tests | Not complete | Transformer unit-level assets exist, but full Kafka/PostgreSQL/backend integration tests remain to be implemented. |

---

## Completed or Available

- Architecture documentation for Kafka transformation, business processing, outbox, errors, ordering, observability, and security.
- V7 outbound architecture covering REST/SOAP calls, Credential Store, webhook receiver, scheduled poller, and manual triggers.
- Mapping Studio API/data model specification covering drafts, versions, fixtures, source validation, credentials metadata, outbound connections, webhook endpoints, call history, and audit events.
- Mapping Studio UI demo work for no-code field mapping, visual transform configuration, fixtures, import/export, and operational demo screens.
- Transformer scaffold under [`services/transformer/`](../../services/transformer/) with service code and deployment assets.
- Partner/schema example assets under `partners/` and `schemas/`.

---

## Backend Scope Now Locked

The active backend implementation target is:

1. `mapping-studio-api`
2. `transformer-service`
3. `outbound-call-manager`
4. `credential-store`
5. `webhook-receiver`
6. `scheduled-poller`
7. `business-consumer-service`
8. `outbox-publisher`

The following are explicitly not required for the next backend phase:

- A second production frontend in React.
- Per-partner custom adapter code.
- JSONata functions that directly perform HTTP calls.
- Raw secrets inside mapping artifacts, exported configs, logs, or browser storage.
- Airflow for simple scheduled polling.
- SFTP/S3/EDI adapters before Kafka, webhook, manual, and scheduled API triggers are working.

---

## Current Gaps

| Gap | Impact | Owner Document |
|-----|--------|----------------|
| Mapping Studio API service not implemented | UI cannot persist real drafts, publish versions, credentials metadata, fixtures, or DLQ actions yet | [Backend Service Requirements](./11-backend-service-requirements.md) |
| Credential Store not implemented | External API flows cannot safely store API keys, Basic Auth, Bearer tokens, or OAuth2 secrets yet | [Architecture V7](../architecture/architecture-v7-outbound.md) |
| Outbound call manager not implemented | External Systems tests and scheduled API pulls remain simulated in UI | [Architecture V7](../architecture/architecture-v7-outbound.md) |
| Webhook receiver not implemented | Webhook source type cannot receive production partner traffic yet | [Backend Service Requirements](./11-backend-service-requirements.md) |
| Scheduled poller not implemented | External API polling cannot run automatically yet | [Backend Service Requirements](./11-backend-service-requirements.md) |
| Full Kafka/PostgreSQL integration tests missing | Backend behavior is not proven end to end | [Testing Strategy](../testing/) |
| Publish gates not enforced server-side | UI checks are demo-only until API gates exist | [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md) |

---

## Recommended Implementation Order

1. Lock migrations and repositories for Mapping Studio API state.
2. Implement `mapping-studio-api` draft, partner, fixture, validation, credential metadata, outbound metadata, webhook metadata, DLQ, and audit endpoints.
3. Harden `services/transformer/` around config loading, Kafka smoke tests, DLQ, dry-run API, metrics, and publish-version artifact loading.
4. Implement Credential Store encryption and write-only secret handling.
5. Implement `outbound-call-manager` REST execution, test endpoint, masking, allowlist, retry, and call history.
6. Add webhook receiver and scheduled poller modules.
7. Add business consumer and outbox publisher for end-to-end canonical processing.
8. Add contract, integration, fixture, and load tests.

---

## Readiness Checklist

### Backend Requirements

- [x] Service inventory defined
- [x] Trigger/source model defined
- [x] Credential and outbound security rules defined
- [x] Mapping Studio API/data model defined
- [x] Publish gates defined
- [x] Observability requirements defined
- [ ] Backend services implemented
- [ ] Full integration tests passing
- [ ] Production deployment validated

### Demo UI

- [x] Local no-code Mapping Studio demo direction established
- [x] Demo-only external system and operational screens represented
- [ ] Backend persistence connected
- [ ] Real outbound tests connected
- [ ] Real DLQ/redrive connected

---

## Key Documents

- [Backend Service Requirements](./11-backend-service-requirements.md)
- [Architecture Overview](../architecture/01-overview.md)
- [Architecture V7 - Outbound API Calling and Credential Store](../architecture/architecture-v7-outbound.md)
- [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md)
- [Transformer Node.js Guide](./TRANSFORMER_NODEJS_GUIDE.md)
- [Business Services Java/Quarkus Guide](./SERVICES_JAVA_QUARKUS_GUIDE.md)

---

- **Current Status**: Demo UI exists, transformer scaffold exists, backend production requirements are now consolidated.
- **Next Milestone**: Implement `mapping-studio-api` and harden `transformer-service` for an end-to-end backend smoke test.
- **Last Updated**: May 12, 2026
