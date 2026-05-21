# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for CanonBridge.

Each ADR documents a significant architectural decision: the context that required a decision, the options considered, the decision made, and the consequences (positive and negative).

## Format

Each ADR follows this structure:
- **Status**: Proposed / Accepted / Superseded / Deprecated
- **Context**: Why a decision was needed
- **Options Considered**: Alternatives evaluated with tradeoffs
- **Decision**: What was chosen and why
- **Consequences**: Expected outcomes, positive and negative
- **Rejected Approaches**: What was explicitly ruled out

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./ADR-001-kafka-over-rabbitmq.md) | Apache Kafka for event streaming | Accepted |
| [ADR-002](./ADR-002-jsonata-transformation-engine.md) | JSONata as the transformation DSL | Accepted |
| [ADR-003](./ADR-003-fastify-over-nestjs.md) | Fastify over NestJS for the transformer service | Accepted |
| [ADR-004](./ADR-004-manual-kafka-offset-commit.md) | Manual Kafka offset commit strategy | Accepted |
| [ADR-005](./ADR-005-outbox-pattern.md) | Outbox pattern for transactional consistency | Accepted |
| [ADR-006](./ADR-006-worker-pool-cpu-isolation.md) | Worker pool for CPU-bound transformation work | Accepted |
| [ADR-007](./ADR-007-immutable-mapping-versioning.md) | Immutable mapping versions with semantic versioning | Accepted |
| [ADR-008](./ADR-008-event-id-idempotency.md) | Event ID-based idempotency strategy | Accepted |
| [ADR-009](./ADR-009-security-threat-model.md) | Security threat model and control selection | Accepted |
| [ADR-010](./ADR-010-schema-registry-strategy.md) | Schema registry strategy | Accepted |
| [ADR-011](./ADR-011-production-auth-and-local-compatibility.md) | Production auth and local compatibility boundaries | Accepted |
| [ADR-012](./ADR-012-runtime-recovery-and-outbox-replay.md) | Runtime recovery and outbox replay | Accepted |
| [ADR-013](./ADR-013-shared-brand-tokens.md) | Shared brand tokens for product and website UI | Accepted |

## How to Add a New ADR

1. Copy the template from any existing ADR.
2. Use the next available number.
3. Set status to `Proposed`.
4. Add to the index above.
5. Discuss in PR. Update status to `Accepted` or `Superseded` after review.

ADRs are never deleted. If a decision is reversed, the original ADR is marked `Superseded` and a new ADR documents the new decision with a back-reference.
