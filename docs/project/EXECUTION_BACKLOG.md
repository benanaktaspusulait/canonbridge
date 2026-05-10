# Execution backlog — closing the gaps

**Last updated**: 2026-05-10  
**Goal**: Move the product from a “documentation package” to a **verifiable, working MVP**.

This file is the single source for: upcoming work, done criteria, and related documents.

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
