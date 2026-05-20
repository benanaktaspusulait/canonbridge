# CanonBridge Project Summary

**Last Updated**: May 20, 2026  
**Status**: Active development, demo-ready core platform with runtime state and remaining production hardening gaps.

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
| External systems | Implemented with deterministic smoke proof | 10 distinct mock-backed templates are normalized by migration `V38`; `V39` seeds the newest four systems; transformer tests assert one canonical output per system. |
| Mapping Studio UI | Active | Angular app with wizard, Integration Studio, preview, autosave, DLQ handoff, and i18n. |
| Mapping Studio API | Active | Quarkus API with Flyway schema, repositories, security filters, outbound execution, batch/scheduled runtime state, outbox traces, and tests. |
| Transformer | Active | JSONata, Ajv, Kafka runner, enrichment support, metrics, and tests. |
| Webhook receiver | Active | Webhook auth, event envelope creation, Kafka publish path. |
| Production readiness | In progress | See [Project Gaps](./PROJECT_GAPS.md). |

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

## Top Open Gaps

1. Complete production auth hardening and environment-backed secret replacement.
2. Add batch status/history APIs, chunked upload, and retry/redrive semantics.
3. Expose scheduled poller run history and formalize cron/interval contracts.
4. Add outbox replay worker, metrics, and recovery tests.
5. Add live Docker/Testcontainers protocol E2E tests for every mock-backed system.

The canonical gap list is [Project Gaps](./PROJECT_GAPS.md).
