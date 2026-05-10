# CanonBridge — Product strategy and architecture discussion notes

> This document summarizes a detailed discussion of CanonBridge’s integration platform architecture,
> product strategy, business model, and go-to-market approach.
>
> Date: May 10, 2026

---

## Table of contents

1. [Project profile](#1-project-profile)
2. [Architecture summary](#2-architecture-summary)
3. [Problem definition](#3-problem-definition)
4. [Competitive analysis](#4-competitive-analysis)
5. [Business model](#5-business-model)
6. [Competitive advantage: built-in reliability](#6-competitive-advantage-built-in-reliability)
7. [Additions required for minimum maintenance](#7-additions-required-for-minimum-maintenance)
8. [Go-to-market strategy](#8-go-to-market-strategy)
9. [Risks and mitigation](#9-risks-and-mitigation)

---

## 1. Project profile

| Field | Detail |
|---|---|
| **Product name** | CanonBridge |
| **GitHub** | https://github.com/benanaktaspusulait/canonbridge |
| **Positioning** | Multi-partner integration platform (ETL) |
| **Target audience** | Integration firms, enterprise companies |
| **License** | Proprietary |
| **Status** | Planning & design phase |
| **Role** | Contractor — product owner and architect |

---

## 2. Architecture summary

### 2.1 Technology stack

| Layer | Technology |
|---|---|
| Transformation | Node.js + TypeScript + JSONata + Ajv |
| Business services | Java + Quarkus |
| Message queue | Apache Kafka |
| Database | PostgreSQL |
| Orchestration | Kubernetes |
| Monitoring | Prometheus + Grafana |
| Frontend (later) | React (Mapping Studio UI) |

### 2.2 Core architecture flow

```
Partner / external system
        ↓
Kafka raw topic (partner.raw.events)
        ↓
Node.js JSONata transformer service
    - Kafka consumer
    - Mapping cache (JSONata)
    - Schema cache (Ajv)
    - Worker pool
    - Retry / DLQ handling
        ↓
Kafka canonical topic (canonical.events)
        ↓
Business consumer service (Java/Quarkus)
    - Idempotency (processed_events)
    - Parent-child dependency (pending table)
    - DB transaction
    - Outbox insert
        ↓
Business DB
    - Domain tables
    - processed_events
    - pending_order_lines
    - outbox_events
        ↓
Outbox publisher / CDC
        ↓
Kafka business events (business.events)
        ↓
Downstream services
```

### 2.3 Core principles

- **Partner-specific complexity stays outside** — isolated in the transformation layer
- **Core business logic receives clean canonical events** — standard format in the business layer
- **JSONata is the transformation engine, not the business-rules engine** — payload shaping only
- **Mappings are immutable and versioned** — `partnerId/eventType/inbound/v1.jsonata`
- **Every canonical event passes schema validation** — mandatory Ajv validation
- **At-least-once delivery + idempotent consumers** — no exactly-once claim

### 2.4 Why Node.js + JSONata?

| Traditional approach | CanonBridge approach |
|---|---|
| CompanyAClient, CompanyARequestMapper, CompanyAResponseMapper, CompanyAValidator, CompanyAErrorMapper | Generic transformation engine + partner-specific JSONata mappings |
| New classes for every new partner | New JSONata file for every new partner |
| Code change = redeploy | Mapping change = file update |
| 200 fields = 400 lines of code | 200 fields = 200 lines of JSONata |

---

## 3. Problem definition

### 3.1 Problem being solved

Integration firms and enterprises must write adapter, mapper, and validator code from scratch for every new external system. That is:

- **Repetitive** — same pattern, different format
- **Error-prone** — manual mapping each time
- **Expensive** — ~6 months and 5–10 developers per project
- **Does not scale** — 15 systems means 15 separate codebases
- **Hard to maintain** — every change touches all adapters

### 3.2 Current state (without CanonBridge)

```
Project A (automotive):
    → Adapter code from scratch
    → 6 months development
    → 5 developers
    → Delivery

Project B (retail):
    → Adapter code from scratch
    → 6 months development
    → 5 developers
    → Delivery

Project C (bank):
    → Adapter code from scratch...
```

**Outcome:** The same work is redone every project. It does not scale. Revenue is hourly consulting.

### 3.3 Target state (with CanonBridge)

```
Platform setup (once)
        ↓
Project A (automotive):
    → Partner config + JSONata mapping
    → 2–4 weeks
    → 1–2 developers

Project B (retail):
    → Partner config + JSONata mapping
    → 2–4 weeks
    → 1–2 developers

Project C (bank):
    → Partner config + JSONata mapping...
```

**Outcome:** The platform is built once; each project adds mappings only. Revenue is scalable product income.

### 3.4 Real-world scenario

```
Integration platform for a single enterprise:

External systems:
    API-1:  Government trade registry     → different format
    API-2:  Bank X                        → different format
    API-3:  Bank Y                        → different format
    API-4:  Logistics A                   → different format
    API-5:  Logistics B                   → different format
    API-6:  E-invoice provider            → different format
    API-7:  E-archive provider            → different format
    API-8:  CRM                           → different format
    API-9:  ERP                           → different format
    API-10: Payment gateway               → different format
    ...15 different endpoints

All → CanonBridge → one canonical format → core business logic
```

---

## 4. Competitive analysis

### 4.1 Versus large iPaaS platforms

| Dimension | MuleSoft/Boomi/Workato | CanonBridge |
|---|---|---|
| **Focus** | Connect everything (hub-and-spoke) | Transformation pipeline |
| **User** | Low-code, visual UI | Developer-first, mapping as code |
| **Transformation** | Limited visual mapping | JSONata — powerful, versionable, testable |
| **Reliability** | Basic error handling | DLQ + retry + circuit breaker + idempotency + outbox + pending |
| **Deployment** | Their clouds only | Anywhere (on-premise, AWS, Azure, GCP, OpenShift) |
| **Price** | Very expensive ($100K+/year) | Affordable (€12K–50K/year) |
| **Weight** | Heavy, bureaucratic | Lightweight, container-native |
| **Mapping management** | Manual in UI | Versioned in Git, tested in CI |
| **Contract protection** | Basic | Mandatory Ajv JSON Schema validation |
| **Vendor lock-in** | High (closed system) | Low (open standards: JSONata, JSON Schema, Kafka) |

### 4.2 Where CanonBridge differentiates

1. **Mapping as code**
   - JSONata mappings are versioned in Git
   - Automatically tested in CI
   - Included in code review
   - Rollback in one step

2. **Built-in reliability** — DLQ, retry, circuit breaker, idempotency, outbox, pending table, poison-pill protection, graceful shutdown

3. **Contract protection** — every canonical event validated with Ajv JSON Schema

4. **Hybrid deployment** — on-premise, AWS EKS, Azure AKS, Google GKE, OpenShift, Docker Compose

5. **Lightweight and developer-friendly** — container-native, CI/CD integrated, not a black box

### 4.3 Market positioning

```
High price
    │
    │  MuleSoft ●
    │  Boomi ●
    │  Workato ●
    │
    │       CanonBridge ●  ← Target position
    │
    │  Apache Camel ● (free, open source)
    │
    └──────────────────────────────
    Low reliability    High reliability
```

---

## 5. Business model

### 5.1 Model: product + consulting (not SaaS)

**Why not SaaS?**
- Solo team — 24/7 ops on-call is not realistic
- Enterprises often refuse to send data outside
- On-premise sales cycle can be faster: “we install on your servers”

**Why product + consulting?**
- Platform license gives recurring revenue
- Consulting yields high one-time fees
- 5–10 customers are enough — no pressure to hyper-scale

### 5.2 Deployment model: customer-managed

**“We install wherever you want”**

```
You provide:
  ✅ Helm chart (or Kustomize)
  ✅ Docker Compose (small installs)
  ✅ Configuration templates
  ✅ Migration scripts
  ✅ Kafka topic creation scripts
  ✅ Prometheus + Grafana dashboards
  ✅ Example CI/CD pipelines
  ✅ Installation documentation
  ✅ 1–2 weeks onsite/remote install support

Customer provides:
  ✅ Kubernetes cluster (or container runtime)
  ✅ PostgreSQL (or managed DB)
  ✅ Kafka (or managed Kafka)
  ✅ Storage (PVC), network / ingress, TLS certificates
```

### 5.3 Revenue streams

| Line item | Type | Description |
|---|---|---|
| **Platform license** | Annual recurring | Right to use the platform, updates |
| **Installation** | One-time | Helm deploy, configuration, integration |
| **Mapping development** | Per project | JSONata mapping per partner |
| **Training** | One-time | Developer and operations training |
| **Premium support** | Annual recurring | Priority SLA support |

### 5.4 Pricing table

| Line item | Starter | Professional | Enterprise |
|---|---|---|---|
| **Partner count** | 5 | 20 | Unlimited |
| **Event types** | 10 | 50 | Unlimited |
| **Environments** | 1 (prod) | 3 (dev/staging/prod) | Unlimited |
| **HA** | No | Yes | HA + DR |
| **Basic support** | 48h email | 8h Slack | 24/7 2h SLA |
| **License / year** | €12,000 | €25,000 | €50,000 |
| **Premium support / year** | €0 | €8,000 | €15,000 |

**Optional services:**

| Service | Price range |
|---|---|
| Installation (basic) | €5,000 |
| Installation (enterprise HA) | €15,000 |
| Installation (complex, custom adapter) | €25,000+ |
| Mapping (simple, 10–20 fields) | €1,500 / partner |
| Mapping (medium, 50+ fields) | €4,000 / partner |
| Mapping (complex, multi-level) | €8,000+ / partner |
| Developer training (3 days) | €3,000 |
| Operations training (2 days) | €2,500 |
| Advanced training (1 day) | €2,000 |
| Daily consulting | €800 / day |

### 5.5 Sample customer invoice

**ABC automotive distributor — 10 dealer integrations, HA install**

```
Platform license (Professional):       €25,000 / year
Premium support:                        €8,000 / year
Enterprise installation (HA):          €15,000 (one-time)
10 dealer mappings (medium complexity):  €40,000 (one-time)
Training (developers + operations):     €5,500 (one-time)
─────────────────────────────────────────────────
First year total:                       €93,500
Following years recurring:              €33,000 / year
```

### 5.6 Five-customer portfolio simulation

| Customer | License/year | Support/year | Install* | Mapping* | Year 1 |
|---|---|---|---|---|---|
| Automotive A (Professional) | €25K | €8K | €15K | €40K | €88K |
| Bank B (Enterprise) | €50K | €15K | €25K | €60K | €150K |
| Logistics C (Starter) | €12K | €0 | €5K | €15K | €32K |
| Integration firm D (Professional) | €25K | €8K | €15K | €50K | €98K |
| Retail E (Professional) | €25K | €8K | €10K | €30K | €73K |
| **Total** | **€137K** | **€39K** | **€70K** | **€195K** | **€441K** |

`*` One-time · **Following years recurring: €176K/year**

### 5.7 License management

```
Licensing mechanism:
  - License key (JWT or signed token)
  - Tier in the key (starter/professional/enterprise)
  - Limits in the key (maxPartner, maxEventType, expiryDate)
  - Platform validates key at startup
  - On expiry: 30-day grace period + warning logs
  - No hard stop, but warning on every message in logs
  - Renewal: send new key, restart not required (reload endpoint)
```

---

## 6. Competitive advantage: built-in reliability

### 6.1 Error-handling comparison

| Scenario | Large iPaaS | CanonBridge |
|---|---|---|
| **Transient failure** | Simple retry | Three-tier retry topics (1m, 5m, 30m) + backpressure |
| **Permanent failure** | DLQ (basic) | DLQ + PII mask + encrypted payload + redrive CLI |
| **System crash** | Manual intervention | Circuit breaker → pause consumer → /health/ready 503 → recover |
| **Duplicate event** | Best effort | Mandatory `processed_events` table inside DB transaction |
| **Atomic DB write + event** | Not included (extra cost) | Built-in outbox pattern, same transaction |
| **Missing parent** | Manual workaround | Automatic pending table, processes when parent arrives |
| **Poison message** | Consumer may crash | Try/catch wrapper; one message cannot stop the system |
| **Pod kill** | Data loss risk | Graceful shutdown + manual offset commit + worker drain |
| **Partition ordering** | None | Ordered mode offset tracking |
| **One partner floods** | Whole system slows | Partner rate limiting + per-partner in-flight limit |
| **DLQ grows** | Ops blind spot | DLQ alert + retention policy + redrive |

### 6.2 Customer narrative (value proposition)

```
“When your system fails at 3 a.m.,
MuleSoft sends you an email. You fix it in the morning.

Meanwhile CanonBridge:

✅ Retries automatically if the failure is transient
✅ Sends permanent failures to DLQ, masks PII, gives you metadata
✅ If one partner slows everything, the circuit breaker kicks in
✅ If a line item arrives before the order, it waits in the pending table
✅ If the same message arrives twice, it is skipped (idempotent)
✅ No message loss on pod restart (graceful shutdown)
✅ Worker timeouts cancel the task and route to DLQ

In the morning everything is either processed
or waiting for you in the DLQ.

You only review what is in the DLQ.”
```

### 6.3 Reliability architecture — full flow

```
Message arrives
    ↓
Poison-pill protection (try/catch wrapper)
    ↓
JSON parse + envelope validation
    ↓
Resolve partner and mapping
    ↓
Input schema validation (optional)
    ↓
JSONata transform (worker pool, timeout protected)
    ↓
Canonical schema validation (mandatory, Ajv)
    ↓
EntityId / partition key validation
    ↓
Kafka produce (canonical topic)
    ↓
Success → offset commit
Failure → classify error:
    ├── Transient → retry topic (1m → 5m → 30m → DLQ)
    ├── Permanent → DLQ (metadata + masked payload)
    ├── Circuit breaker → pause consumer
    └── Worker timeout → retry → DLQ

Business service:
    ↓
Consume canonical event
    ↓
Idempotency check (processed_events)
    ├── Already processed → skip, success
    └── New → continue
        ↓
    Parent-child check
    ├── Parent exists → process
    └── Parent missing → pending table
        ↓
    DB transaction:
        - Domain update
        - processed_events insert
        - outbox_events insert
        ↓
    COMMIT → Kafka offset commit
```

---

## 7. Additions required for minimum maintenance

### 7.1 Self-healing mechanisms

| Component | Failure | Automatic behavior |
|---|---|---|
| Worker | Crash | Main thread detects, starts new worker, retries in-flight task |
| Worker | Timeout | Cancel task, retry, DLQ after max retries |
| Consumer | Stall (no heartbeat) | Health check fails, K8s liveness restart |
| DB pool | Exhaustion | Circuit breaker, reconnect attempts, /health/ready 503 |
| Outbox publisher | Stuck | Auto-restart, deduplicate (event_id unique) |
| Pending table | Growth | Scheduled cleanup job, expired → DLQ |
| Kafka producer | Timeout | Circuit breaker, retry topic, cooldown |

### 7.2 Platform upgrade strategy

```
Upgrade method: rolling update (Kubernetes)
  - Helm chart upgrade
  - RollingUpdate (maxUnavailable: 0, maxSurge: 1)
  - Pods replaced sequentially
  - Graceful shutdown drains old pods

DB migration:
  - Flyway or Liquibase
  - Migration script per release
  - Rollback script available
  - Failed migration stops deployment

Mapping compatibility:
  - New platform version supports old mappings
  - All mapping fixtures tested in CI

Canary (optional, later):
  - Deploy new version as canary pod
  - Route 10% of traffic
  - Watch metrics, then go to 100%

Downtime: zero (with rolling update)
```

### 7.3 Remote support and diagnostics

```
support-bundle.sh script:
  Collects in one command:
    - Last hour of logs (masked)
    - Prometheus metrics snapshot
    - Kafka consumer group status
    - DB connection pool status
    - Worker pool status
    - Configuration (secrets masked)
    - Last 100 DLQ messages (metadata only)
  → Packages as .tar.gz
  → Customer sends to you

Health check detail:
  GET /health/ready?detail=true →
    {
      "status": "ready",
      "components": {
        "kafkaConsumer": "connected",
        "kafkaProducer": "connected",
        "mappingCache": "loaded (15 mappings)",
        "schemaCache": "loaded (8 schemas)",
        "workerPool": "healthy (4/4 workers, queue 20/100)",
        "circuitBreaker": "closed",
        "db": "not applicable (transformer has no DB)"
      }
    }
```

### 7.4 Audit logging

```
Audit events:
  - mapping.deployed (which mapping, version, who)
  - mapping.rollback (which mapping, old version, who)
  - schema.updated (which schema, change, who)
  - dlq.redrive (which message, mapping version, who approved)
  - license.renewed (which tier, when)
  - license.expiring (grace period started)
  - config.updated (which setting, old/new value, who)
```

### 7.5 Backup and disaster recovery

```
Must back up:
  1. PostgreSQL → pg_dump, daily, 30-day retention
  2. Mapping files → already in Git
  3. Schema files → already in Git
  4. Platform configuration → GitOps (Helm values)

RPO: DB 24h, mapping/schema instant, Kafka 7-day replay
RTO: DB restore 1–2h, platform restart 5 minutes
```

### 7.6 Platform configuration reference

```
Change at runtime (no restart):
  - WORKER_COUNT, WORKER_TASK_TIMEOUT_MS
  - CB_FAILURE_THRESHOLD, CB_COOLDOWN_MS
  - PARTNER_MAX_IN_FLIGHT, PARTNER_MAX_PAYLOAD_BYTES

Requires restart:
  - WORKER_MAX_OLD_SPACE_MB
  - KAFKA_BROKERS, DB_HOST

Runtime changes: POST /admin/config/reload
```

---

## 8. Go-to-market strategy

### 8.1 Phase 1: foundation

```
✅ Architecture docs complete
✅ GitHub repo created
🔄 Work as Java developer on automotive project
   → Learn the market, note Fabric limits
🔄 Build CanonBridge MVP in spare time
```

### 8.2 Phase 2: MVP and first reference

```
□ Finish CanonBridge MVP (transformer + Kafka + DLQ + health + Helm)
□ Find first reference (connections from automotive project)
□ Sell first installation + consulting package
```

### 8.3 Phase 3: growth

```
□ 3–5 enterprise customers
□ €100K+ annual recurring revenue
□ Mapping Studio UI (React) MVP
□ Reference cases, case studies
```

### 8.4 Phase 4: maturity

```
□ 5–10 customers
□ €150K+ annual recurring revenue
□ Full Mapping Studio UI
□ Optional managed hosting
□ Partner network (other contractors can write mappings)
```

---

## 9. Risks and mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Solo team** | Real | Medium | Consulting model (not SaaS), limited customer count |
| **Long sales cycle** | High | High | Bridge with contractor income; start with smaller firms |
| **Competing open source** | Medium | Medium | Reliability + support + easier deployment differentiate |
| **Partner format changes** | High | Low | Mapping Studio rollback + DLQ replay address this |
| **No first customer** | Medium | High | Use existing relationships; discounted first install |
| **Platform maintenance load** | Medium | Medium | Self-healing + good monitoring → less intervention |

---

## Related documents

- [Business model and pricing](./business-model.md)
- [Competitive analysis](./competitive-analysis.md)
- [Platform upgrade strategy](../deployment/08-platform-upgrade.md)
- [Support and diagnostics](../operations/13-support-diagnostics.md)
- [Architecture overview](../architecture/01-overview.md)
- [ADR folder](../adr/)
