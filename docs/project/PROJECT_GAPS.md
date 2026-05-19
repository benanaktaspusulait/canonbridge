# CanonBridge Project Gaps

**Date**: 2026-05-19  
**Purpose**: Single active gap register after the end-to-end project review.

## Executive Summary

The project has working core surfaces: Mapping Studio API, Angular Mapping Studio UI, transformer, webhook receiver, mock external systems, Docker Compose, Kubernetes manifests, and CI jobs.

The largest remaining gaps are production hardening and proof depth. The 10-system target is now represented by 10 distinct mock-backed templates, but the four newest systems still need mapping drafts, fixtures, and E2E acceptance coverage.

## Gaps

| ID | Area | Gap | Priority | Next Action |
|---|---|---|---|---|
| PG-001 | 10 systems | InventoryPro, TicketDesk, CloudBill, and PeopleOps have mock endpoints and templates, but no seeded mapping drafts or fixtures. | High | Add schemas, sample payloads, mapping rules, and expected canonical outputs. |
| PG-002 | E2E proof | Acceptance docs cover many scenarios, but CI does not assert one full flow per external system. | High | Add smoke/E2E tests for all 10 templates. |
| PG-003 | DB quality gate | Duplicate system templates were possible after tenant consolidation. | High | Add a migration/test guard for 10 distinct template names under `tenant-acme`. |
| PG-004 | REST inbound semantics | `RestInboundResource` validates and publishes accepted payloads, but does not transform into canonical form before publishing. | High | Route accepted REST payloads through `MappingExecutionService.testSourceMapping()` before Kafka publish. |
| PG-005 | File/batch operations | Batch ingest accepts normalized rows, but has no persistent batch job state, streaming upload, or file-level retry model. | Medium | Add batch job table, status API, chunked upload, and retry/redrive semantics. |
| PG-006 | Scheduled API operations | Poller keeps `lastRuns` in memory and supports only lightweight interval parsing. | Medium | Persist last/next run state, expose run history, and add full cron support or an explicit interval contract. |
| PG-007 | Schema validation depth | Mapping proxy validates inline `target_schema_json` with a subset of JSON Schema. | Medium | Resolve `canonical_schema_ref` from the schema repository and expand keyword coverage. |
| PG-008 | Production auth | Demo credentials and local auth paths remain in seed/config. | High | Replace demo auth with OIDC/OAuth2 integration and environment-backed secrets. |
| PG-009 | Outbox chain | Architecture documents require transactional outbox, but production outbox publisher is still not a complete service path. | High | Implement/pin outbox publisher behavior and add recovery tests. |
| PG-010 | Documentation hygiene | Several historical docs still describe earlier phases and planned-only services. | Medium | Continue pruning or rewriting docs as code changes land; keep this file as the status source. |

## Removed As Unnecessary

The review removed root-level one-off or stale documents:

- `TESTING_GUIDE.md`: covered only the old three-system demo and conflicted with `docs/testing/ACCEPTANCE_SCENARIOS.md`.
- `PROXY_SYSTEM_README.md`: one-off debug/testing note for a previous request-mapping issue.
- `GITHUB_SETUP.md`: repository setup checklist, not active product or engineering documentation.
- `website/CLAUDE.md`: duplicate agent-specific pointer; `website/AGENTS.md` remains.

## Current Verification Commands

```bash
node scripts/no-code-acceptance-coverage.mjs --strict --markdown
cd services/canonbridge-mock && mvn test
cd services/transformer && npm test
cd mapping-studio-ui && npm test -- --run
```
