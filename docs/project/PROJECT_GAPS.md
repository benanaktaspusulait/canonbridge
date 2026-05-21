# CanonBridge Project Gaps

**Date**: 2026-05-20  
**Purpose**: Single active gap register after the end-to-end project review.

## Executive Summary

The project has working core surfaces: Mapping Studio API, Angular Mapping Studio UI, transformer, webhook receiver, mock external systems, Docker Compose, Kubernetes manifests, and CI jobs.

The largest previous gaps were production hardening and operational recovery depth. The 10-system target is represented by 10 distinct mock-backed templates, `V39__seed_new_system_mapping_drafts.sql` adds mapping drafts, canonical schemas, and source samples for the four newest systems, and transformer tests include deterministic source-to-canonical smoke fixtures for all 10 systems.

Runtime state now exists for batch jobs, chunked batch upload sessions, scheduled API runs, scheduled run history, and canonical-event outbox traces. Batch jobs have status/history plus retry/redrive APIs and large-file session/chunk upload APIs; scheduled API polling has interval and cron contracts plus run history; outbox has background replay, metrics, manual replay, recovery tests, dashboard panels, and alert rules; and the mock service has Docker/Testcontainers protocol E2E coverage for all 10 systems wired into CI.

The 2026-05-20 UI/documentation findings review has also been remediated for the repository-owned items: shared brand tokens, website SEO/mobile/contact/static asset checks, SVG brand assets, website test/build CI, Mapping Studio runtime `env.js`, license/security/contributing/changelog docs, i18n guide, API docs, UI E2E strategy, ADR coverage, and a doc-to-component UX cross-reference are now present.

Deployment-specific items are tracked separately from product gaps. Real IdP credentials, secret-manager values, lead-capture destination, staging alert thresholds, and future browser/axe/Storybook expansion require target environment or dependency decisions rather than core code changes.

## Gaps

| ID | Area | Status | Gap | Priority | Next Action |
|---|---|---|---|---|---|
| PG-001 | 10 systems | Done | InventoryPro, TicketDesk, CloudBill, and PeopleOps now have seeded partners, canonical schemas, mapping drafts, connection links, and source samples. | High | Keep seed fixtures aligned as mock payloads evolve. |
| PG-002 | E2E proof | Done | `services/transformer/fixtures/ten-system-smoke.json` and `scripts/validate-ten-system-smoke.mjs` assert one source-to-canonical output per external system through `npm test`; `ProtocolDockerE2ETest` adds opt-in Docker/Testcontainers protocol checks for all 10 mock systems and `.github/workflows/ci.yml` runs it as `mock-protocol-e2e`. | High | Keep CI Docker capacity available for the protocol E2E job. |
| PG-003 | DB quality gate | Done | Duplicate system templates were possible after tenant consolidation. | High | Keep the `V39` migration guard that asserts 10 `tenant-acme` template rows and 10 distinct names. |
| PG-004 | REST inbound semantics | Done | `RestInboundResource` now transforms accepted REST payloads through `MappingExecutionService.testSourceMapping()` and publishes canonical payloads. | High | Add API-level regression test once Testcontainers is stable in CI. |
| PG-005 | File/batch operations | Done | `FileBatchResource` now creates durable jobs, exposes job list/detail, stores original rows, supports retry-all plus failed-row redrive, and provides chunked upload session APIs for large files. | Medium | Add UI affordances for resumable uploads when large-file workflows move into the browser. |
| PG-006 | Scheduled API operations | Done | `ScheduledApiPollerService` now persists current state and per-run history, supports ISO durations, short intervals, 5-field cron, and 6-field cron-with-seconds contracts, and exposes status/history APIs. | Medium | Add CI E2E assertions around a live scheduled poll once the full Docker stack is stable in CI. |
| PG-007 | Schema validation depth | Done | Mapping draft reads now resolve active `canonical_schema_ref` records into `target_schema_json` fallback validation. | Medium | Expand JSON Schema keyword coverage as new canonical schemas require it. |
| PG-008 | Production auth | Done | Production startup now fails closed on insecure defaults, requires OIDC by default, rejects bearer API-key compatibility in production, supports disabling local login/JWT, and Docker Compose passes through environment-backed API, JWT, OIDC, CORS, and credential settings. | High | Supply real IdP/secrets through the target deployment secret manager. |
| PG-009 | Outbox chain | Done | `KafkaProducerService` creates PENDING records, marks PUBLISHED/FAILED, assigns retry backoff, and `OutboxReplayService` replays due pending/failed records with metrics, manual API trigger, recovery tests, Grafana runtime panels, and Prometheus alerts. | High | Tune alert thresholds after staging traffic establishes baselines. |
| PG-010 | Documentation hygiene | Done | Current status docs, service overview, product overview, runtime testing notes, and operations docs now reflect the implemented services, CI Docker E2E, chunked batch APIs, and runtime dashboards/alerts. | Medium | Keep this file as the status source as new work lands. |

## Deployment Inputs And Future Enhancements

These are not open implementation gaps in the current local/staging MVP:

| Area | Status | Owner / Trigger |
|---|---|---|
| Production IdP and secrets | Closed as deployable contract | `infrastructure/k8s/mapping-studio-api-secret.example.yaml` and `scripts/validate-production-env.mjs` define and validate required production values. |
| Website lead capture destination | Closed as configurable webhook | `NEXT_PUBLIC_LEAD_WEBHOOK_URL` posts to CRM/Supabase/webhook with `mailto:` fallback when unset. |
| Browser E2E + axe automation | Closed | Website Playwright + axe tests run through `npm run test:e2e` and CI. |
| Component gallery | Closed | `/component-gallery` documents shared tokens, controls, cards, and lucide icon usage. |
| Alert thresholds | Closed as runbook | [Alert Threshold Calibration](../operations/16-alert-threshold-calibration.md) defines the staging baseline and sign-off process. |

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
cd services/mapping-studio-api && mvn -Dtest=ApiKeyAuthenticatorTest,ApiAuthenticationFilterTest,KafkaProducerServiceTest,ScheduleExpressionTest,OutboxReplayServiceTest,FileBatchResourceTest test
cd services/mapping-studio-api && mvn test
cd services/transformer && npm test
cd services/canonbridge-mock && mvn test
cd mapping-studio-ui && npm test -- --run
```

Local note: when Docker/Testcontainers is unavailable, Mapping Studio API tests can run against a temporary local PostgreSQL with `QUARKUS_DATASOURCE_DEVSERVICES_ENABLED=false`; this was used on 2026-05-20 and produced 87 passing API tests.

Docker protocol E2E is opt-in to avoid starting the full stack in normal unit runs:

```bash
cd services/canonbridge-mock
CANONBRIDGE_PROTOCOL_E2E=true TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock \
  mvn -Ddocker.host=unix://${HOME}/.docker/run/docker.sock \
      -Dapi.version=1.44 \
      -Dtest=ProtocolDockerE2ETest test
```

Docker Desktop 29+ may require the explicit `docker.host` and `api.version` Maven properties because Docker Java/Testcontainers otherwise negotiates an older API version.
