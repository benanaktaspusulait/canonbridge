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
| Mapping Studio API | Active | Quarkus API with Flyway schema, repositories, security filters, OIDC production guardrails, outbound execution, batch status/retry/chunked upload sessions, scheduled run history, outbox replay, and tests. |
| Transformer | Active | JSONata, Ajv, Kafka runner, enrichment support, metrics, and tests. |
| Webhook receiver | Active | Webhook auth, event envelope creation, Kafka publish path. |
| Production readiness | Hardened for local/staging proof | Core guardrails, replay paths, CI protocol E2E, runtime dashboards, and alert rules are implemented; real environment IdP/secrets remain deployment inputs. |

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

## Deployment Inputs And Follow-Ups

1. Supply real production IdP/secrets through each target deployment secret manager.
2. Set `NEXT_PUBLIC_LEAD_WEBHOOK_URL` to the chosen CRM/Supabase/webhook destination for production website builds.
3. Add browser resumable-upload UX on top of the batch session APIs when large-file workflows are prioritized.
4. Complete the alert calibration sign-off after staging traffic establishes baselines.
5. Keep Playwright/axe and component-gallery coverage current as the UI evolves.

The canonical gap list is [Project Gaps](./PROJECT_GAPS.md).
