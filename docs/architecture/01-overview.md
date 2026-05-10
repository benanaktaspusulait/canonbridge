# Architecture Overview

## Purpose

This document defines the architecture for **CanonBridge**, a configurable partner-event transformation platform.

**The Vision:**
Business users upload sample JSON, drag-and-drop field mappings, and publish integrations in minutes. Behind this simple interface lies enterprise-grade architecture that handles:
- Multiple partner formats automatically
- Real-time data transformation
- Error handling and retry logic
- Automatic scaling
- Complete observability

**The Magic:**
Users see simplicity. The system delivers enterprise reliability.

## The Core Philosophy

```text
Integration complexity should be invisible to users.
Business users should create integrations without code.
Developers should focus on core product, not adapters.
```

## High-Level Architecture

### What Users See (Simple)

```text
1. Upload sample JSON
2. Drag & drop field mapping
3. Preview transformation
4. Click publish
5. Monitor in real-time
```

### What Happens Behind the Scenes (Complex, but Automatic)

```text
Partner / Source System
        ↓
Kafka raw topic (reliable ingestion)
        ↓
Node.js JSONata Transformer Service
        - Kafka consumer
        - Mapping cache (fast lookups)
        - Schema cache
        - Worker pool (parallel processing)
        - Ajv validation (catch bad data)
        - Retry / DLQ handling (never lose data)
        ↓
Kafka canonical topic
        ↓
Business Consumer Service
        - Idempotency (handle duplicates)
        - Ordering / dependency handling
        - DB transaction (consistency)
        - Outbox insert
        ↓
Business DB
        - Domain tables
        - Processed events
        - Pending dependency tables
        - Outbox table
        ↓
Outbox Publisher / CDC
        ↓
Kafka business events
        ↓
Downstream services
```

**Technology Stack:**
- Node.js + TypeScript (type safety)
- JSONata (powerful transformations)
- Kafka (reliable streaming)
- Ajv (JSON Schema validation)
- Worker pool (CPU-bound work)
- Prometheus + Grafana (observability)

## Problem Statement

### The Old Way (Without CanonBridge)

Every partner needs custom code:

```text
CompanyAClient.java (500 lines)
CompanyARequestMapper.java (300 lines)
CompanyAResponseMapper.java (400 lines)
CompanyAValidator.java (200 lines)
CompanyAErrorMapper.java (150 lines)

CompanyBClient.java (500 lines)
CompanyBRequestMapper.java (300 lines)
CompanyBResponseMapper.java (400 lines)
CompanyBValidator.java (200 lines)
CompanyBErrorMapper.java (150 lines)

... repeat for 50 partners = 125,000 lines of code!
```

**Problems:**
- ❌ 2-4 weeks per partner integration
- ❌ Developers write repetitive adapter code
- ❌ Code changes for every mapping update
- ❌ Difficult to maintain and test
- ❌ Business blocked by engineering capacity
- ❌ Tight coupling to partner formats

### The New Way (With CanonBridge)

**Zero custom code per partner:**

```text
Generic transformation engine (one time)
+
Visual mapping tool (no code)
+
Partner-specific JSONata mappings (generated automatically)
+
Canonical schema validation (automatic)
```

**Benefits:**
- ✅ 10 minutes per partner integration
- ✅ Business users create integrations
- ✅ Mapping changes without deployment
- ✅ Centralized, testable business logic
- ✅ Scalable and maintainable
- ✅ Engineering focuses on core product

**ROI Example:**
- **Old way:** 50 partners × 2 weeks × $10k/week = **$1,000,000**
- **New way:** Platform build once × 8 weeks × $10k/week = **$80,000**
- **Savings:** **$920,000 + ongoing velocity gains**

## When to Use CanonBridge

**Perfect fit when:**

```text
✅ You have 3+ partners/systems to integrate
✅ Partner formats are different but business logic is similar
✅ New partners are added frequently
✅ Field mappings change often
✅ You want business users to own integrations
✅ You need enterprise reliability (10k+ msg/sec)
✅ You want to reduce engineering bottleneck
✅ Mappings should be versioned and testable
```

**Real-world scenarios:**
- E-commerce: Integrate 20+ marketplaces (Amazon, eBay, Shopify...)
- Fintech: Connect 15+ payment providers (Stripe, PayPal, Square...)
- Healthcare: Standardize 50+ hospital systems
- Logistics: Consolidate 30+ shipping carriers
- SaaS: Integrate customer data from various sources

## When NOT to Use CanonBridge

**May be overkill if:**

```text
❌ Only 1-2 stable partners
❌ Partner formats are identical
❌ Mappings never change
❌ Business logic is highly partner-specific
❌ Very low message volume (<100/day)
❌ You prefer writing custom code for everything
```

**In these cases:** Traditional custom adapters might be simpler.

## Key Components

### 1. Transformer Service
- Consumes raw partner events from Kafka
- Resolves partner/event/version
- Loads mapping from cache
- Transforms payload using JSONata
- Validates canonical output with Ajv
- Produces canonical events or sends to DLQ
- Handles retries and failures

### 2. Business Service
- Consumes canonical events
- Checks idempotency
- Applies business rules
- Handles parent-child dependencies
- Writes to DB
- Writes outbox event in same transaction

### 3. Outbox Publisher
- Polls outbox table
- Publishes business events to Kafka
- Marks events as published

### 4. Ingress Adapters (Out of Scope)
- Convert partner protocols to Kafka raw events
- Examples: HTTP, SFTP, S3, webhooks

## Message Flow

```text
1. Kafka message is consumed from raw topic
2. Message envelope is parsed
3. Partner/event/version is resolved
4. Input schema is optionally validated
5. Inbound JSONata mapping is selected from cache
6. Payload is transformed into canonical format
7. Canonical output is validated with Ajv
8. Valid canonical event is produced to canonical topic
9. Original offset is committed only after successful produce
10. Invalid data goes to DLQ
11. Temporary failures go to retry topic
```

## Success Criteria

The architecture is successful when:

```text
✓ New partners can be onboarded in days, not weeks
✓ Mapping changes do not require code deployment
✓ System handles 10,000+ messages/second
✓ No data loss under normal failure scenarios
✓ Duplicate events are handled transparently
✓ DLQ rate is near zero in normal operation
✓ Consumer lag stays below 1,000 messages
✓ Graceful shutdown completes in < 30 seconds
✓ Operational team can investigate issues in < 5 minutes
✓ Rollback can be completed in < 5 minutes
```

## Next Steps

1. Read [Core Principles](./02-core-principles.md) to understand the design philosophy
2. Review [Technology Decisions](./03-technology-decisions.md) for tool choices
3. Study [Message Design](./04-message-design.md) for event structure
4. Explore [Transformation Layer](./05-transformation-layer.md) for mapping strategy
5. Understand [Business Layer](./06-business-layer.md) for processing logic

---

**See Also**:
- [Core Principles](./02-core-principles.md)
- [Technology Decisions](./03-technology-decisions.md)
- [Risk Mitigation](./10-risk-mitigation.md)
