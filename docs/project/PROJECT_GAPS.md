# CanonBridge Project Gaps

**Date**: 2026-05-20  
**Purpose**: Single active gap register after the end-to-end project review.

## Executive Summary

The project has working core surfaces: Mapping Studio API, Angular Mapping Studio UI, transformer, webhook receiver, mock external systems, Docker Compose, Kubernetes manifests, and CI jobs.

The largest remaining gaps are production hardening and operational recovery depth. The 10-system target is represented by 10 distinct mock-backed templates, `V39__seed_new_system_mapping_drafts.sql` adds mapping drafts, canonical schemas, and source samples for the four newest systems, and transformer tests include deterministic source-to-canonical smoke fixtures for all 10 systems.

Runtime state now exists for batch jobs, scheduled API runs, and canonical-event outbox traces. The remaining runtime risk is recovery depth: status/history APIs, retry workers, full cron semantics, and live Docker-backed protocol E2E should still be expanded.

## Gaps

| ID | Area | Status | Gap | Priority | Next Action |
|---|---|---|---|---|---|
| PG-001 | 10 systems | Done | InventoryPro, TicketDesk, CloudBill, and PeopleOps now have seeded partners, canonical schemas, mapping drafts, connection links, and source samples. | High | Keep seed fixtures aligned as mock payloads evolve. |
| PG-002 | E2E proof | Done | `services/transformer/fixtures/ten-system-smoke.json` and `scripts/validate-ten-system-smoke.mjs` assert one source-to-canonical output per external system through `npm test`. | High | Add live protocol E2E coverage on top of deterministic fixtures. |
| PG-003 | DB quality gate | Done | Duplicate system templates were possible after tenant consolidation. | High | Keep the `V39` migration guard that asserts 10 `tenant-acme` template rows and 10 distinct names. |
| PG-004 | REST inbound semantics | Done | `RestInboundResource` now transforms accepted REST payloads through `MappingExecutionService.testSourceMapping()` and publishes canonical payloads. | High | Add API-level regression test once Testcontainers is stable in CI. |
| PG-005 | File/batch operations | Partial | `V40__create_runtime_state_tables.sql` adds `etl_batch_jobs`; `FileBatchResource` now creates a job, persists final status, and returns `jobId`/`jobStatus`. Streaming upload, status API, and file-level retry/redrive are still missing. | Medium | Add batch status/history endpoint, chunked upload, and row/file retry semantics. |
| PG-006 | Scheduled API operations | Partial | `ScheduledApiPollerService` now reads/writes `etl_scheduled_api_runs` for last start, next run, result, duration, and failure state. Full cron support and run-history API are still missing. | Medium | Expose scheduled run history and formalize cron/interval contract. |
| PG-007 | Schema validation depth | Done | Mapping draft reads now resolve active `canonical_schema_ref` records into `target_schema_json` fallback validation. | Medium | Expand JSON Schema keyword coverage as new canonical schemas require it. |
| PG-008 | Production auth | Open | Demo credentials and local auth paths remain in seed/config. | High | Replace demo auth with OIDC/OAuth2 integration and environment-backed secrets. |
| PG-009 | Outbox chain | Partial | `outbox_events` exists and `KafkaProducerService` now creates PENDING records before publish, then marks PUBLISHED or FAILED. A background recovery publisher and retry tests are still missing. | High | Add pending/failed outbox replay worker, metrics, and recovery tests. |
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
cd services/mapping-studio-api && mvn test
cd services/transformer && npm test
cd services/canonbridge-mock && mvn test
cd mapping-studio-ui && npm test -- --run
```

Local note: when Docker/Testcontainers is unavailable, Mapping Studio API tests can run against a temporary local PostgreSQL with `QUARKUS_DATASOURCE_DEVSERVICES_ENABLED=false`; this was used on 2026-05-20 and produced 74 passing API tests.
