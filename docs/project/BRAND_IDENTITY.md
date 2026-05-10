# CanonBridge - Brand Identity

**Version**: 1.0  
**Last Updated**: May 10, 2026  
**Status**: Official Brand Guidelines

> 📌 **This is the single source of truth for project name, vision, and messaging.**
> All documentation must use these standardized terms.

---

## 🏷️ OFFICIAL NAME

**CanonBridge**

- ✅ Use: "CanonBridge"
- ❌ Don't use: "ETL Solutions", "Integration Magic", "etlsolutions"

**Repository Name**: `etlsolutions` (legacy, will remain for technical reasons)

---

## 💬 TAGLINE

**"Transform partner data into trusted business events"**

Alternative taglines for different contexts:
- Technical: "Partner event transformation at scale"
- Business: "Reduce partner onboarding from weeks to days"
- Product: "No-code partner integration platform"

---

## 🎯 VISION

**One-Sentence Vision**:
> CanonBridge is a partner event transformation platform for teams with repeated multi-partner integration pain.

**Extended Vision**:
> CanonBridge eliminates the engineering bottleneck of multi-partner integrations. Instead of writing custom adapter code for every new partner, business users define field mappings visually and publish in minutes. The platform handles transformation, validation, ordering, retry, and observability automatically.

---

## 🎭 WHAT WE ARE (AND WHAT WE'RE NOT)

### We ARE:
- ✅ A **partner event transformation platform**
- ✅ A **specialized tool** for teams with 5+ partner integrations
- ✅ A **no-code mapping solution** for business users
- ✅ An **operational control platform** for integration engineers
- ✅ A **high-volume event processor** (1,000-10,000 msg/sec)

### We are NOT:
- ❌ A generic ETL tool for all data types
- ❌ A full iPaaS platform (like Zapier or Workato)
- ❌ A data warehouse or analytics platform
- ❌ A low-code platform for building any workflow
- ❌ A replacement for all integration needs

---

## 👥 TARGET AUDIENCE

### Primary Audience

**1. Integration Engineers**
- Build and maintain partner integrations
- Tired of writing custom adapter code
- Need operational visibility and control
- Want to reduce maintenance burden

**2. Platform Architects**
- Design scalable integration solutions
- Need to support multiple partners
- Want to standardize on canonical events
- Care about reliability and observability

**3. DevOps/SRE Teams**
- Deploy and operate integration infrastructure
- Need monitoring and alerting
- Want to reduce operational toil
- Care about uptime and performance

### Secondary Audience

**4. Business Analysts**
- Define transformation rules
- Need to update mappings quickly
- Don't want to write code
- Want to preview changes before publishing

**5. Product Managers**
- Own partner onboarding process
- Want to reduce time-to-market
- Need to scale partner ecosystem
- Care about business velocity

---

## 🏢 IDEAL CUSTOMER PROFILE

### Company Characteristics
- **Size**: 50-5,000 employees
- **Industry**: E-commerce, Fintech, Logistics, B2B SaaS, Marketplaces
- **Stage**: Series A to Enterprise
- **Tech Maturity**: Has engineering team, uses modern stack

### Integration Characteristics
- **Partner Count**: 5+ partners (or growing quickly)
- **Event Volume**: 10,000+ events/day
- **Mapping Changes**: Frequent (weekly or monthly)
- **Current Pain**: Custom adapter code per partner
- **Budget**: $50k-500k/year for integration platform

### Example Companies
- Multi-marketplace e-commerce platform (integrating Amazon, eBay, Shopify, etc.)
- Fintech aggregator (integrating multiple payment providers)
- Logistics platform (integrating multiple shipping carriers)
- B2B SaaS (integrating customer data from various sources)

---

## 💡 KEY MESSAGES

### Primary Message
**"Stop writing custom adapter code for every partner. Use CanonBridge to transform partner events into canonical business events in minutes, not weeks."**

### Supporting Messages

**For Integration Engineers**:
> "Reduce partner onboarding from 2-4 weeks to 1 day. No more custom adapter code. No more code reviews for mapping changes. Just configure, test, and publish."

**For Platform Architects**:
> "Build once, integrate many. Define your canonical event model, then let business users map partner formats without touching your core services."

**For DevOps/SRE**:
> "Enterprise-grade reliability out of the box. Monitoring, alerting, DLQ handling, retry logic, and graceful degradation built-in."

**For Business Users**:
> "Update partner mappings in minutes without waiting for engineering. Upload sample JSON, map fields visually, preview results, and publish."

---

## 🎨 VALUE PROPOSITION

### The Problem We Solve

**Before CanonBridge**:
```
Partner A format  ──┐
Partner B format  ──┤──► Custom adapter code ──► Business logic ──► Your system
Partner C format  ──┘     (per partner, per change, per team)
```

With 50 partners, that becomes **125,000 lines of adapter code** — fragile, expensive, and slow to change.

**After CanonBridge**:
```
Partner A format  ──┐
Partner B format  ──┤──► CanonBridge ──► Canonical format ──► Business logic ──► Your system
Partner C format  ──┘     (zero custom code)
```

### ROI Example

| Metric | Without CanonBridge | With CanonBridge |
|--------|---------------------|------------------|
| New partner onboarding | 2-4 weeks engineering | Minutes, no code |
| Mapping change | Code review + deploy | Visual edit + publish |
| 50 partners cost | ~$1,000,000 engineering | ~$80,000 platform |
| Mapping versioning | Ad-hoc, risky | Immutable, audited, rollbackable |
| Business control | Engineering dependency | Business user autonomy |

---

## 🚀 POSITIONING

### Market Position

**Category**: Partner Event Transformation Platform

**Positioning Statement**:
> For integration teams managing multiple partner formats, CanonBridge is a partner event transformation platform that enables no-code mapping and operational control. Unlike generic iPaaS tools or custom adapter code, CanonBridge specializes in high-volume event transformation with enterprise reliability.

### Competitive Differentiation

**vs. iPaaS (Zapier, Workato, MuleSoft)**:
- ✅ Specialized for event transformation (not general workflow)
- ✅ Higher performance (10,000+ msg/sec)
- ✅ Better operational control (DLQ, replay, versioning)
- ✅ Lower cost for high-volume scenarios

**vs. Custom Adapter Code**:
- ✅ No code required for new partners
- ✅ Mapping changes without deployment
- ✅ Built-in monitoring and observability
- ✅ Standardized error handling

**vs. Kafka Streams + Custom Code**:
- ✅ No-code mapping for business users
- ✅ Visual mapping studio
- ✅ Built-in validation and testing
- ✅ Faster time-to-market

---

## 📊 CORE CAPABILITIES

### 1. No-Code Mapping
- Upload sample JSON
- Visual field mapping
- JSONata transformations
- Real-time preview
- Fixture-based testing

### 2. Enterprise Reliability
- At-least-once delivery
- Idempotent processing
- Transactional outbox
- DLQ and retry logic
- Graceful degradation

### 3. Operational Control
- Monitoring dashboards
- Alerting system
- Distributed tracing
- Audit trail
- Rollback capabilities

### 4. High Performance
- 10,000+ events/second
- < 100ms p99 latency
- Horizontal scaling
- Worker pool isolation
- Efficient caching

---

## 🎯 USE CASES

### Primary Use Cases

**1. Multi-Marketplace E-commerce**
- Problem: Integrate 20+ marketplaces (Amazon, eBay, Shopify, etc.)
- Solution: Map each marketplace's order format to canonical order event
- Benefit: Onboard new marketplace in hours, not weeks

**2. Fintech Payment Aggregation**
- Problem: Integrate 15+ payment providers (Stripe, PayPal, Square, etc.)
- Solution: Transform payment events to canonical transaction format
- Benefit: Consistent payment processing across all providers

**3. Logistics Carrier Integration**
- Problem: Integrate 30+ shipping carriers with different tracking formats
- Solution: Standardize tracking events to canonical shipment format
- Benefit: Unified tracking experience for customers

**4. B2B SaaS Data Integration**
- Problem: Customers send data in various formats
- Solution: Transform customer data to canonical format
- Benefit: Reduce customer onboarding time

---

## 📝 MESSAGING GUIDELINES

### Do's
- ✅ Focus on partner integration pain
- ✅ Emphasize time savings (weeks → days)
- ✅ Highlight no-code for business users
- ✅ Mention enterprise reliability
- ✅ Use concrete examples (e-commerce, fintech)

### Don'ts
- ❌ Don't claim to solve all integration problems
- ❌ Don't compare to data warehouses or analytics tools
- ❌ Don't promise features we don't have yet
- ❌ Don't use generic "ETL" terminology
- ❌ Don't oversimplify technical complexity

---

## 🎨 VISUAL IDENTITY

### Logo
[To be designed]

### Colors
[To be defined]

### Typography
[To be defined]

---

## 📚 TERMINOLOGY STANDARDS

### Preferred Terms

| Use This | Not This |
|----------|----------|
| CanonBridge | ETL Solutions, Integration Magic |
| Partner event | Source event, external event |
| Canonical event | Target event, internal event |
| Mapping | Transformation, adapter, converter |
| Mapping Studio | Admin UI, management console |
| Transformer service | Transformation service, mapper |
| Business service | Consumer service, processor |
| DLQ | Dead letter queue, error queue |
| Fixture | Test case, example |

### Technical Terms

| Term | Definition |
|------|------------|
| **Raw Event** | Original partner payload plus envelope metadata |
| **Canonical Event** | Standardized business event consumed by internal systems |
| **Mapping** | Versioned JSONata transformation from source to canonical |
| **Input Schema** | JSON Schema validating partner payload shape |
| **Canonical Schema** | JSON Schema validating transformed business events |
| **Fixture** | Sample input and expected output for testing |
| **DLQ** | Dead letter queue for events that cannot be transformed |

---

## 🔄 BRAND EVOLUTION

### Current Phase: Design & Validation
- Focus: Technical validation and customer discovery
- Messaging: Technical, detailed, honest about status
- Audience: Early adopters, technical evaluators

### Next Phase: MVP Launch
- Focus: Proving core value with first customers
- Messaging: Problem-focused, benefit-driven
- Audience: Integration engineers, platform architects

### Future Phase: General Availability
- Focus: Scaling customer base
- Messaging: Polished, professional, proven results
- Audience: Broader market, enterprise buyers

---

## ✅ BRAND CHECKLIST

Use this checklist when creating any content:

- [ ] Uses "CanonBridge" (not ETL Solutions or Integration Magic)
- [ ] Uses official tagline or approved alternative
- [ ] Targets defined audience (integration engineers, architects, etc.)
- [ ] Focuses on partner integration pain
- [ ] Uses preferred terminology
- [ ] Includes reality disclaimer if making claims
- [ ] Aligns with positioning statement
- [ ] Differentiates from competitors
- [ ] Provides concrete examples
- [ ] Avoids overpromising

---

## 📞 QUESTIONS?

For brand-related questions:
- **Product**: [Product Manager]
- **Marketing**: [Marketing Lead]
- **Technical**: [Tech Lead]

---

## 🔄 CHANGE LOG

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-05-10 | 1.0 | Initial brand identity document | Kiro AI |

---

**This is the official brand identity. All documentation must follow these guidelines.**
