# Business Model and Pricing

## Positioning

CanonBridge is sold as an **on-premise software license with professional services** — not SaaS.

**Why not SaaS:**
- Enterprise customers do not want their integration data leaving their infrastructure
- Security approval cycles for SaaS tools can take months in regulated industries
- Customer-managed deployment eliminates 24/7 infrastructure on-call for a solo operator
- "Deploy to your servers" closes sales faster than "send us your data"

**Why Product + Consulting:**
- Platform license creates recurring annual revenue
- Consulting (installation, mapping authoring, training) creates high-margin project revenue
- 5–10 enterprise customers is a sustainable, high-value portfolio without SaaS scale pressure
- Deep customer relationships reduce churn

---

## Deployment Model

**"Deploy it wherever you want."**

| Provided by CanonBridge | Provided by Customer |
|---|---|
| Helm chart (or Kustomize manifests) | Kubernetes cluster (or container runtime) |
| Docker Compose for small deployments | PostgreSQL (or managed DB) |
| Configuration templates | Kafka (or managed Kafka) |
| Database migration scripts | Storage (PVC) |
| Kafka topic provisioning scripts | Network / ingress |
| Prometheus + Grafana dashboards | SSL certificates |
| CI/CD pipeline examples | |
| Installation documentation | |
| 1–2 weeks onsite/remote setup support | |

**Broker flexibility:** If a customer uses Azure Service Bus instead of Kafka, an adapter layer can be built in approximately 1 week. Large iPaaS vendors cannot accommodate this. CanonBridge can.

---

## Revenue Streams

| Stream | Type | Description |
|---|---|---|
| Platform License | Annual recurring | Right to run the platform, receive updates |
| Installation | One-time project | Helm deploy, configuration, infrastructure integration |
| Mapping Authoring | Per-project | JSONata mapping development per partner |
| Training | One-time | Developer and operations team training |
| Premium Support | Annual recurring | SLA-backed priority support |

---

## License Tiers

| | Starter | Professional | Enterprise |
|---|---|---|---|
| Partners | 5 | 20 | Unlimited |
| Event types | 10 | 50 | Unlimited |
| Environments | 1 (prod) | 3 (dev/staging/prod) | Unlimited |
| High availability | No | Yes | Yes + DR |
| Support response | 48h email | 8h Slack | 24/7, 2h SLA |
| **License/year** | **€12,000** | **€25,000** | **€50,000** |
| **Premium support/year** | — | €8,000 | €15,000 |

---

## Professional Services Rates

| Service | Price |
|---|---|
| Basic installation | €5,000 |
| Enterprise HA installation | €15,000 |
| Complex installation (custom adapters) | €25,000+ |
| Mapping authoring — simple (10–20 fields) | €1,500 / partner |
| Mapping authoring — medium (50+ fields) | €4,000 / partner |
| Mapping authoring — complex (multi-level) | €8,000+ / partner |
| Developer training (3 days) | €3,000 |
| Operations training (2 days) | €2,500 |
| Advanced training (1 day) | €2,000 |
| Daily consulting | €800 / day |

---

## Example Customer Invoice

**Automotive Distributor — 10 dealer integrations, HA deployment**

```
Platform License (Professional):        €25,000 / year
Premium Support:                         €8,000 / year
Enterprise HA Installation:             €15,000 (one-time)
10 dealer mappings (medium complexity): €40,000 (one-time)
Training (developer + operations):      €5,500 (one-time)
─────────────────────────────────────────────────────────
Year 1 total:                           €93,500
Recurring from Year 2:                  €33,000 / year
```

---

## 5-Customer Portfolio Simulation

| Customer | License/yr | Support/yr | Install* | Mapping* | Year 1 |
|---|---|---|---|---|---|
| Automotive A (Professional) | €25K | €8K | €15K | €40K | **€88K** |
| Bank B (Enterprise) | €50K | €15K | €25K | €60K | **€150K** |
| Logistics C (Starter) | €12K | — | €5K | €15K | **€32K** |
| Integration Firm D (Professional) | €25K | €8K | €15K | €50K | **€98K** |
| Retail E (Professional) | €25K | €8K | €10K | €30K | **€73K** |
| **Total** | **€137K** | **€39K** | **€70K** | **€195K** | **€441K** |

`*` One-time

**Recurring from Year 2: €176,000 / year**

---

## License Enforcement

```
License key format: JWT (signed, RS256)

Payload:
  {
    "tier": "professional",
    "maxPartners": 20,
    "maxEventTypes": 50,
    "maxEnvironments": 3,
    "issuedAt": "2026-01-01",
    "expiresAt": "2027-01-01",
    "licensee": "Acme Corp"
  }

Enforcement:
  - Platform validates key signature on startup
  - Limit checks on partner/event-type registration
  - Grace period: 30 days after expiry (warnings logged, no hard stop)
  - Renewal: deliver new key → POST /admin/license/reload (no restart required)
  - Log warning on every message during grace period
```

---

## Go-to-Market Phases

### Phase 1 — Foundation
- Complete architecture documentation
- Build CanonBridge MVP (transformer + Kafka + DLQ + health + Helm)
- Gain market insight from enterprise integration project work

### Phase 2 — First Reference
- Find first customer via existing network
- Offer discounted first installation as reference case
- Deliver and document the case study

### Phase 3 — Growth
- 3–5 enterprise customers
- €100K+ annual recurring revenue
- Mapping Studio UI MVP (React)
- Publish case studies and references

### Phase 4 — Scale
- 5–10 customers
- €150K+ annual recurring revenue
- Full Mapping Studio UI
- Optional managed hosting (dedicated instance on customer cloud)
- Partner network (other contractors can author mappings)

---

## See Also

- [Product Strategy](./product-strategy.md)
- [Competitive Analysis](./competitive-analysis.md)
- [Product Overview](./overview.md)
- [Mapping Studio Requirements](./01-mapping-studio-product-requirements.md)
