# Customer discovery kit (Phase 0)

**Goal**: Validate CanonBridge hypotheses in the customer’s own words; gather enough evidence to decide.

---

## 1. Prep (30 min)

- Read the ICP in [STRATEGY.md](./STRATEGY.md) — company size, integration profile, budget assumptions.
- **Do not sell** in this conversation; focus on learning and note-taking.
- Record (with permission) or take live notes. Keep raw notes out of the repo; only add an **anonymous summary** here.

---

## 2. Opening (2 min)

- “I want to understand your experience with X; this is not a product pitch — 25–30 minutes of Q&A.”
- Clarify role and remit (platform vs. integration team vs. product).

---

## 3. Question set

### Problem and pain

1. In the last 12 months, how long on average did it take to add a **new partner or new event type**? Who was involved?
2. What are the **two steps that take the most time** in that process?
3. How often do mappings / formats change (weekly / monthly / rarely)?
4. How often did this show up as **urgent work** from leadership or customers?

### Current solution

5. What **tools and patterns** are used today to get partner data into the system? (custom adapters, iPaaS, ESB, ad-hoc scripts, etc.)
6. How are **errors and reprocessing** handled (DLQ, replay)?
7. What was the **worst integration incident** in production in the last 6 months?

### Economics and buying

8. If they rough-estimate engineering time spent on this problem (person-weeks / year), what do they say?
9. Would they consider **paying to solve this** (internal budget or external vendor)? Under what conditions is that “yes”?
10. Who is at the table in **procurement** (security, purchasing, legal)?

### CanonBridge hypothesis (short)

11. When they hear: “A platform that turns partner JSON into a canonical model using **schema + visual/configuration**, with versioned mappings and operations (DLQ, monitoring),” what is their first reaction?
12. Any **red lines** or “we would never accept” items? (on-prem, Kafka, code generation, data egress, etc.)

---

## 4. Interview note template

Copy and paste:

```text
Date:
Participant role / industry (anonymous):
Problem summary (1 sentence):
Pain score (1–10, their estimate):
Current solution:
Volume / partner count (order of magnitude):
Budget / buying signal (yes / no / unclear):
Anonymous quote (1–2 sentences):
Follow-up:
```

---

## 5. Success threshold (draft)

Align with [STRATEGY.md](./STRATEGY.md); for example:

- At least **5 customers** describe the same problem.
- At least **3 customers** rate pain at 8+/10.
- At least **2** concrete “let’s continue / consider a pilot” signals (LOI not required; clear interest is enough).

Record the decision on [MASTER_ROADMAP.md](./MASTER_ROADMAP.md) and [EXECUTION_BACKLOG.md](./EXECUTION_BACKLOG.md) as go / no-go.

---

## 6. Ethics and data

- Do not put personal data or company secrets in the repo.
- Ask permission before recording or taking detailed notes.
