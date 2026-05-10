# Architecture Overview

## Purpose

This document defines the architecture for a configurable integration/transformation platform where multiple partner systems send JSON payloads with different formats, while the core business logic remains mostly the same.

The main goal is to avoid writing large amounts of partner-specific adapter/client code by introducing a generic transformation service using:

- Node.js
- TypeScript
- JSONata
- Kafka
- Ajv JSON Schema validation
- Worker pool
- Retry / DLQ
- Idempotent business processing
- Outbox pattern
- Observability and structured logging

## Core Design Principle

```text
Partner-specific complexity should stay outside the core business service.
Core business logic should receive clean canonical events.
```

## High-Level Architecture

```text
Partner / Source System
        ↓
Kafka raw topic
        ↓
Node.js JSONata Transformer Service
        - Kafka consumer
        - Mapping cache
        - Schema cache
        - Worker pool
        - Ajv validation
        - Retry / DLQ handling
        ↓
Kafka canonical topic
        ↓
Business Consumer Service
        - Idempotency
        - Ordering / dependency handling
        - DB transaction
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

## Problem Statement

### Without This Architecture

Partner-specific complexity spreads throughout the codebase:

```text
CompanyAClient
CompanyARequestMapper
CompanyAResponseMapper
CompanyAValidator
CompanyAErrorMapper

CompanyBClient
CompanyBRequestMapper
CompanyBResponseMapper
CompanyBValidator
CompanyBErrorMapper

...
```

This leads to:
- Code duplication
- Maintenance burden
- Slow partner onboarding
- Difficult to change mappings
- Tight coupling to partner formats

### With This Architecture

Partner complexity is isolated in configuration:

```text
Generic transformation engine
+
partner-specific JSONata mappings
+
partner-specific config
+
canonical schema validation
```

Benefits:
- New partners onboarded in days, not weeks
- Mapping changes without code deployment
- Centralized business logic
- Scalable and maintainable

## When to Use This Architecture

This architecture is useful when:

```text
business process is mostly the same
partner payload formats are different
new partners may be added frequently
field mapping changes happen often
we want to reduce partner-specific adapter classes
we want mappings to be configurable and versioned
```

## When NOT to Use This Architecture

This architecture may be overkill if:

```text
only 1-2 partners
partner formats are very similar
mappings rarely change
business logic is highly partner-specific
low message volume
```

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
