# CanonBridge Project Gaps

**Date**: 2026-05-20  
**Purpose**: Single active gap register after the end-to-end project review.

## Executive Summary

The project has working core surfaces: Mapping Studio API, Angular Mapping Studio UI, transformer, webhook receiver, mock external systems, Docker Compose, Kubernetes manifests, and CI jobs.

The largest previous gaps were production hardening and operational recovery depth. The 10-system target is represented by 10 distinct mock-backed templates, `V39__seed_new_system_mapping_drafts.sql` adds mapping drafts, canonical schemas, and source samples for the four newest systems, and transformer tests include deterministic source-to-canonical smoke fixtures for all 10 systems.

Runtime state now exists for batch jobs, scheduled API runs, scheduled run history, and canonical-event outbox traces. Batch jobs have status/history plus retry/redrive APIs; scheduled API polling has interval and cron contracts plus run history; outbox has background replay, metrics, manual replay, and recovery tests; and the mock service has opt-in Docker/Testcontainers protocol E2E coverage for all 10 systems.

## Gaps

| ID | Area | Status | Gap | Priority | Next Action |
|---|---|---|---|---|---|
| PG-001 | 10 systems | Done | InventoryPro, TicketDesk, CloudBill, and PeopleOps now have seeded partners, canonical schemas, mapping drafts, connection links, and source samples. | High | Keep seed fixtures aligned as mock payloads evolve. |
| PG-002 | E2E proof | Done | `services/transformer/fixtures/ten-system-smoke.json` and `scripts/validate-ten-system-smoke.mjs` assert one source-to-canonical output per external system through `npm test`; `ProtocolDockerE2ETest` adds opt-in Docker/Testcontainers protocol checks for all 10 mock systems. | High | Run the opt-in Docker protocol E2E in CI once Docker capacity is available. |
| PG-003 | DB quality gate | Done | Duplicate system templates were possible after tenant consolidation. | High | Keep the `V39` migration guard that asserts 10 `tenant-acme` template rows and 10 distinct names. |
| PG-004 | REST inbound semantics | Done | `RestInboundResource` now transforms accepted REST payloads through `MappingExecutionService.testSourceMapping()` and publishes canonical payloads. | High | Add API-level regression test once Testcontainers is stable in CI. |
| PG-005 | File/batch operations | Partial | `FileBatchResource` now creates durable jobs, exposes job list/detail, stores original rows, and supports retry-all plus failed-row redrive. Chunked upload for very large files remains the only batch runtime gap. | Medium | Add chunked upload/session APIs when large-file ingestion is prioritized. |
| PG-006 | Scheduled API operations | Done | `ScheduledApiPollerService` now persists current state and per-run history, supports ISO durations, short intervals, 5-field cron, and 6-field cron-with-seconds contracts, and exposes status/history APIs. | Medium | Add CI E2E assertions around a live scheduled poll once the full Docker stack is stable in CI. |
| PG-007 | Schema validation depth | Done | Mapping draft reads now resolve active `canonical_schema_ref` records into `target_schema_json` fallback validation. | Medium | Expand JSON Schema keyword coverage as new canonical schemas require it. |
| PG-008 | Production auth | Done | Production startup now fails closed on insecure defaults, requires OIDC by default, rejects bearer API-key compatibility in production, supports disabling local login/JWT, and requires environment-backed API, JWT, OIDC, CORS, and credential secrets. | High | Provide real IdP/secrets per environment; keep demo credentials dev-only. |
| PG-009 | Outbox chain | Done | `KafkaProducerService` creates PENDING records, marks PUBLISHED/FAILED, assigns retry backoff, and `OutboxReplayService` replays due pending/failed records with metrics, manual API trigger, and recovery tests. | High | Add dashboard panels/alerts around the new outbox counters. |
| PG-010 | Documentation hygiene | In progress | Several historical docs still describe earlier phases and planned-only services. | Medium | Continue pruning or rewriting docs as code changes land; keep this file as the status source. |

## Removed As Unnecessary

The review removed root-level one-off or stale documents:

- `TESTING_GUIDE.md`: covered only the old three-system demo and conflicted with `docs/testing/ACCEPTANCE_SCENARIOS.md`.
- `PROXY_SYSTEM_README.md`: one-off debug/testing note for a previous request-mapping issue.
- `GITHUB_SETUP.md`: repository setup checklist, not active product or engineering documentation.
- `website/CLAUDE.md`: duplicate agent-specific pointer; `website/AGENTS.md` remains.

## Current Verification Commands

```bash
node scripts/no-code-acceptance-coverage.mjs --strict --markdown
cd services/mapping-studio-api && mvn -DskipTests package
cd services/mapping-studio-api && mvn -Dtest=ApiKeyAuthenticatorTest,ApiAuthenticationFilterTest,KafkaProducerServiceTest,ScheduleExpressionTest,OutboxReplayServiceTest test
cd services/mapping-studio-api && mvn test
cd services/transformer && npm test
cd services/canonbridge-mock && mvn test
cd mapping-studio-ui && npm test -- --run
```

Local note: when Docker/Testcontainers is unavailable, Mapping Studio API tests can run against a temporary local PostgreSQL with `QUARKUS_DATASOURCE_DEVSERVICES_ENABLED=false`; this was used on 2026-05-20 and produced 74 passing API tests.

Docker protocol E2E is opt-in to avoid starting the full stack in normal unit runs:

```bash
cd services/canonbridge-mock && CANONBRIDGE_PROTOCOL_E2E=true mvn -Dtest=ProtocolDockerE2ETest test
```
