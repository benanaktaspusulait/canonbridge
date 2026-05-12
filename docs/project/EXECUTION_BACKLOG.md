# CanonBridge Execution Backlog

**Last updated**: 2026-05-12  
**Goal**: Move the full CanonBridge ecosystem from demo-ready UI/documentation toward a verifiable pilot/customer delivery.

This file is the single source for: upcoming work, done criteria, and related documents.

---

## Task List - 2026-05-12 Ecosystem Review

### P0 - Critical Demo/Pilot Blockers

- [x] **CB-P0-001 - Add API authentication**  
  **Repo**: `services/mapping-studio-api`  
  **Done when**: protected endpoints require JWT or API key auth, auth failures return consistent errors, and at least one automated test covers unauthorized access.  
  **Completed**: 2026-05-12 - `/api/*` now requires `X-API-Key` or `Authorization: Bearer <key>`; health/metrics/OpenAPI routes remain public.

- [x] **CB-P0-002 - Add API CRUD endpoints and database persistence**  
  **Repo**: `services/mapping-studio-api`  
  **Done when**: mappings, partners, schemas, and external system connections can be created, listed, updated, and deleted against PostgreSQL-backed storage.  
  **Completed**: 2026-05-12 - partner/mapping CRUD existed; added schema and external-system CRUD, fixed Flyway migration ordering, and verified Quarkus package build.

- [ ] **CB-P0-003 - Add outbound HTTP client and credential store service**  
  **Repo**: `services/mapping-studio-api`, `services/outbound-call-manager`, `services/credential-store` if split later  
  **Done when**: external API calls use stored credential metadata, secrets are write-only/encrypted, and request/response failures are logged safely.

- [ ] **CB-P0-004 - Finish custom transformation UIs**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: `enum_map` uses a key/value table, `conditional_value` uses IF/ELSE blocks, and `template_string` supports variable insertion instead of plain text only.

- [ ] **CB-P0-005 - Add live transformation preview**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: mapping changes immediately run against sample JSON, preview canonical output updates without leaving the wizard, and invalid JSONata/input states are shown inline.

- [ ] **CB-P0-006 - Add mock environment compose and demo script**  
  **Repo**: `canonbridge-mock` or `services/canonbridge-mock`  
  **Done when**: `docker-compose.yml` starts the mock stack with dependencies and `demo.sh` runs the scripted five-step sales/demo flow end to end.

### P1 - High Priority Platform Gaps

- [ ] **CB-P1-001 - Add source-type configuration panels**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: Kafka, Webhook, and External API source types expose the required broker/topic, URL/API key, and auth configuration fields in the wizard.

- [ ] **CB-P1-002 - Add dynamic transform parameter labels**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: generic `paramA/B/C` labels are replaced with transform-specific labels such as input format, output format, map table, or default value.

- [ ] **CB-P1-003 - Add nested object/array mapping support**  
  **Repo**: `mapping-studio-ui`, `services/mapping-studio-api`  
  **Done when**: object/array target fields can be expanded into sub-field mappings and the saved model preserves nested rules.

- [ ] **CB-P1-004 - Add wizard autosave**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: draft wizard changes are saved to local storage or the backend and restored after refresh/session interruption.

- [ ] **CB-P1-005 - Add DLQ detail and redrive actions**  
  **Repo**: `mapping-studio-ui`, backend service that owns DLQ operations  
  **Done when**: users can inspect message payload/error details and redrive one or more DLQ messages.

- [ ] **CB-P1-006 - Add Credential Store UI**  
  **Repo**: `mapping-studio-ui`, `services/mapping-studio-api`  
  **Done when**: users can create/update credential metadata, rotate secrets, and never read raw secret values back from the UI.

- [ ] **CB-P1-007 - Add Kafka integration to Mapping Studio API**  
  **Repo**: `services/mapping-studio-api`  
  **Done when**: the API can publish/consume the required integration events and handles connection failures gracefully.

- [ ] **CB-P1-008 - Add backend unit tests**  
  **Repo**: `services/mapping-studio-api`  
  **Done when**: core auth, CRUD, transform, credential, and error-path behavior have automated coverage in CI.

- [ ] **CB-P1-009 - Add Kafka topic init script for mock/demo stack**  
  **Repo**: `canonbridge-mock`, `infrastructure`, or `scripts`  
  **Done when**: required topics are created automatically before demo messages are produced.

### P2 - Medium Priority Product Polish

- [ ] **CB-P2-001 - Enable GitHub Topics and Pages**  
  **Repo**: `canonbridge` GitHub settings  
  **Done when**: repository topics include `jsonata`, `kafka`, `etl`, and `integration-platform`, and GitHub Pages publishes from `docs/`.

- [ ] **CB-P2-002 - Decide the fate of `PHASE2_COMPLETE.md`**  
  **Repo**: `canonbridge`  
  **Done when**: the file is either updated as historical reference or removed from active navigation.

- [ ] **CB-P2-003 - Add expert JSONata preview panel**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: users can inspect the generated JSONata from visual mapping rules without editing raw expressions by default.

- [ ] **CB-P2-004 - Add undo/redo for mapping rules**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: add/remove/update mapping rule actions can be reverted and re-applied with buttons and keyboard shortcuts.

- [ ] **CB-P2-005 - Add test diff viewer**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: failed tests visually compare expected vs actual output.

- [ ] **CB-P2-006 - Add empty states across UI**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: mapping list, DLQ, partners, and external systems show useful empty-state guidance instead of blank tables.

- [ ] **CB-P2-007 - Add API documentation**  
  **Repo**: `services/mapping-studio-api`  
  **Done when**: OpenAPI/Swagger docs are generated and available locally.

- [ ] **CB-P2-008 - Dockerize Mapping Studio API**  
  **Repo**: `services/mapping-studio-api`  
  **Done when**: the API has a Dockerfile and can run through local compose.

- [ ] **CB-P2-009 - Add SOAP/XML support**  
  **Repo**: `services/mapping-studio-api`, `services/outbound-call-manager`  
  **Done when**: XML input/output can be converted to/from JSON for SOAP-style integrations.

- [ ] **CB-P2-010 - Add mock docs and WireMock migration decision**  
  **Repo**: `canonbridge-mock` or `services/canonbridge-mock`  
  **Done when**: demo runbook, payload catalog, scenarios, and a decision on Spring controllers vs WireMock are documented.

### P3 - Lower Priority Hardening

- [ ] **CB-P3-001 - Review UI accessibility**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: ARIA labels, keyboard navigation, focus states, and screen-reader behavior are checked for core workflows.

- [ ] **CB-P3-002 - Add keyboard shortcuts**  
  **Repo**: `mapping-studio-ui`  
  **Done when**: `Ctrl/Cmd+S`, `Ctrl/Cmd+Enter`, and `Ctrl/Cmd+Z` are wired to save/test/undo where appropriate.

- [ ] **CB-P3-003 - Add API graceful shutdown**  
  **Repo**: `services/mapping-studio-api`  
  **Done when**: `SIGTERM`/`SIGINT` close HTTP, DB, Kafka, and background resources cleanly.

- [ ] **CB-P3-004 - Add rate limiting**  
  **Repo**: `services/mapping-studio-api`  
  **Done when**: public or sensitive endpoints enforce sensible rate limits and return documented errors.

- [ ] **CB-P3-005 - Add mock latency/failure simulation**  
  **Repo**: `canonbridge-mock` or `services/canonbridge-mock`  
  **Done when**: slow, timeout, and error scenarios can be selected for demo and resilience testing.

### Suggested Execution Order

1. Complete `CB-P0-001` through `CB-P0-003` to make the backend persistable and safe enough for pilot usage.
2. Complete `CB-P0-004` and `CB-P0-005` so the Mapping Studio wizard proves the no-code value proposition.
3. Complete `CB-P0-006` so sales/demo flows are repeatable with one command.
4. Pull P1 items into the sprint only when they unblock the P0 demo path or pilot customer flow.

---

## Step 0 — Already in this repo

- [x] Architecture, MVP scope, strategy drafts
- [x] Example partner under `mappings/` + fixtures + schema validation scripts
- [x] Transformer service skeleton (`services/transformer/`) — HTTP transform + optional Kafka

---

## Step 1 — Customer discovery (Phase 0)

**Output**: At least 5–10 interview notes + summary (problem, pain, current solution, budget signal).

- [ ] Target list (20 organizations) + ICP check
- [ ] Interview questions and note template → [CUSTOMER_DISCOVERY_KIT.md](./CUSTOMER_DISCOVERY_KIT.md)
- [ ] Run interviews and collect notes under `docs/project/interviews/` (do not commit PII to git; a summary MD is enough)
- [ ] Go / no-go decision → update [STRATEGY.md](./STRATEGY.md) and [MASTER_ROADMAP.md](./MASTER_ROADMAP.md)

**Done when**: Hypotheses marked `[TO BE VALIDATED]` are updated with at least three corroborated findings.

---

## Step 2 — Working core (Phase 1 MVP)

**Output**: End-to-end transformation proof with one partner / one event.

- [x] Transformer: local `npm run build && npm start` + `POST /v1/transform`
- [ ] CI: `mappings` fixture tests + transformer build
- [ ] Docker Compose: Kafka + transformer integration test (manual or scripted)
- [ ] One-page “demo script” → inside `services/transformer/README.md`

**Done when**: A newcomer can turn a raw event into canonical output using the README within ~30 minutes.

---

## Step 3 — Visibility and trust (sales / enterprise)

- [ ] One-page **trust summary** (data, logs, PII, audit — summarize from existing ops docs)
- [ ] **Positioning** (one page: who, why CanonBridge, vs. competitors) → update `docs/product/`
- [ ] Pricing / packaging hypothesis (on-prem install, support tier)

---

## Step 4 — Mapping Studio (Phase 2)

- [ ] Vertical slice: upload sample JSON → schema / preview (MVP UI)
- [ ] Align with API contract (`docs/product/03-mapping-studio-api-data-model.md`)

---

## Quick links

| Topic | File |
|------|--------|
| Interview kit | [CUSTOMER_DISCOVERY_KIT.md](./CUSTOMER_DISCOVERY_KIT.md) |
| MVP scope | [MVP_DEFINITION.md](./MVP_DEFINITION.md) |
| Transformer | [../../services/transformer/README.md](../../services/transformer/README.md) |
| Mapping assets | [../../mappings/package.json](../../mappings/package.json) |
