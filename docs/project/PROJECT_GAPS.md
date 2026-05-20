# CanonBridge Project Gaps

**Date**: 2026-05-19  
**Purpose**: Single active gap register after the end-to-end project review.

## Executive Summary

The project has working core surfaces: Mapping Studio API, Angular Mapping Studio UI, transformer, webhook receiver, mock external systems, Docker Compose, Kubernetes manifests, and CI jobs.

The largest remaining gaps are production hardening and deeper operational resilience. The 10-system target is now represented by 10 distinct mock-backed templates, `V39__seed_new_system_mapping_drafts.sql` adds mapping drafts, canonical schemas, and source samples for the four newest systems, and transformer tests include deterministic source-to-canonical smoke fixtures for all 10 systems.

The remaining runtime risk is live protocol depth: CI now proves source-to-canonical transformation per system, but live Docker-backed protocol E2E should still be expanded when the Testcontainers/Docker socket environment is stable.

## Gaps

| ID | Area | Status | Gap | Priority | Next Action |
|---|---|---|---|---|---|
| PG-001 | 10 systems | Done | InventoryPro, TicketDesk, CloudBill, and PeopleOps now have seeded partners, canonical schemas, mapping drafts, connection links, and source samples. | High | Keep seed fixtures aligned as mock payloads evolve. |
| PG-002 | E2E proof | Done | `services/transformer/fixtures/ten-system-smoke.json` and `scripts/validate-ten-system-smoke.mjs` assert one source-to-canonical output per external system through `npm test`. | High | Add live protocol E2E coverage on top of deterministic fixtures. |
| PG-003 | DB quality gate | Done | Duplicate system templates were possible after tenant consolidation. | High | Keep the `V39` migration guard that asserts 10 `tenant-acme` template rows and 10 distinct names. |
| PG-004 | REST inbound semantics | Done | `RestInboundResource` now transforms accepted REST payloads through `MappingExecutionService.testSourceMapping()` and publishes canonical payloads. | High | Add API-level regression test once Testcontainers is stable in CI. |
| PG-005 | File/batch operations | Open | Batch ingest accepts normalized rows, but has no persistent batch job state, streaming upload, or file-level retry model. | Medium | Add batch job table, status API, chunked upload, and retry/redrive semantics. |
| PG-006 | Scheduled API operations | Open | Poller keeps `lastRuns` in memory and supports only lightweight interval parsing. | Medium | Persist last/next run state, expose run history, and add full cron support or an explicit interval contract. |
| PG-007 | Schema validation depth | Done | Mapping draft reads now resolve active `canonical_schema_ref` records into `target_schema_json` fallback validation. | Medium | Expand JSON Schema keyword coverage as new canonical schemas require it. |
| PG-008 | Production auth | Open | Demo credentials and local auth paths remain in seed/config. | High | Replace demo auth with OIDC/OAuth2 integration and environment-backed secrets. |
| PG-009 | Outbox chain | Open | Architecture documents require transactional outbox, but production outbox publisher is still not a complete service path. | High | Implement/pin outbox publisher behavior and add recovery tests. |
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
cd services/transformer && npm test
cd services/canonbridge-mock && mvn test
cd mapping-studio-ui && npm test -- --run
```
