# CanonBridge Project Summary

**Last Updated**: May 20, 2026  
**Status**: Active development, demo-ready core platform with durable runtime state and production hardening guardrails.

## What CanonBridge Is

CanonBridge is an enterprise integration platform for turning partner-specific payloads into canonical business events without writing a custom adapter for every partner.

The platform combines:

- Angular Mapping Studio for no-code mapping design.
- Java/Quarkus Mapping Studio API for mappings, credentials, partners, schemas, proxy execution, DLQ, audit, and external systems.
- Node.js/Fastify transformer for JSONata execution, schema validation, Kafka processing, retry, and DLQ.
- Quarkus webhook receiver.
- Spring Boot `canonbridge-mock` service for demo external systems.
- Docker Compose, Kubernetes manifests, Prometheus, Grafana, and CI workflows.

## Current State

| Area | Status | Notes |
|---|---|---|
| Source types | Implemented | UI/backend model includes 10 integration source types. |
| External systems | Implemented with deterministic and live protocol proof | 10 distinct mock-backed templates are normalized by migration `V38`; `V39` seeds the newest four systems; transformer tests assert one canonical output per system; opt-in Docker/Testcontainers E2E calls all 10 live mock protocols. |
| Mapping Studio UI | Active | Angular app with wizard, Integration Studio, preview, autosave, DLQ handoff, and i18n. |
| Mapping Studio API | Active | Quarkus API with Flyway schema, repositories, security filters, OIDC production guardrails, outbound execution, batch status/retry, scheduled run history, outbox replay, and tests. |
| Transformer | Active | JSONata, Ajv, Kafka runner, enrichment support, metrics, and tests. |
| Webhook receiver | Active | Webhook auth, event envelope creation, Kafka publish path. |
| Production readiness | In progress | Core guardrails and replay paths are implemented; see [Project Gaps](./PROJECT_GAPS.md) for remaining ops follow-through. |

## Key Documents

- [Project Gaps](./PROJECT_GAPS.md)
- [10 System Support Audit](./10_SYSTEM_SUPPORT_AUDIT.md)
- [Master Roadmap](./MASTER_ROADMAP.md)
- [MVP Definition](./MVP_DEFINITION.md)
- [Strategy](./STRATEGY.md)
- [Performance Targets](./PERFORMANCE_TARGETS.md)
- [Documentation Hub](../README.md)

## Project Structure

```text
etlsolutions/
├── README.md
├── docker-compose.yml
├── docs/
├── infrastructure/
├── mapping-studio-ui/
├── services/
│   ├── canonbridge-mock/
│   ├── mapping-studio-api/
│   ├── transformer/
│   └── webhook-receiver/
├── website/
└── scripts/
```

## Top Remaining Follow-Ups

1. Wire real production IdP/secrets and keep local demo auth disabled in production environments.
2. Add chunked upload/session APIs for very large file batch ingestion.
3. Run the opt-in Docker/Testcontainers protocol E2E in CI.
4. Add Grafana/alert panels for outbox replay counters and batch/scheduled failure rates.

The canonical gap list is [Project Gaps](./PROJECT_GAPS.md).
