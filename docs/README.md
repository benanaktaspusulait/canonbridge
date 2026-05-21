# CanonBridge Documentation

This is the active documentation hub for the CanonBridge integration platform.

## Start Here

| Need | Document |
|---|---|
| Project overview | [Project Summary](./project/PROJECT_SUMMARY.md) |
| Local setup | [Getting Started](./getting-started.md) |
| Current gaps | [Project Gaps](./project/PROJECT_GAPS.md) |
| 10-system readiness | [10 System Support Audit](./project/10_SYSTEM_SUPPORT_AUDIT.md) |
| Product direction | [Product Overview](./product/overview.md) |
| Architecture | [Architecture Overview](./architecture/01-overview.md) |
| API docs | [API Documentation](./api/README.md) |
| Operations | [Runbook](./operations/08-runbook.md) |
| Testing | [Acceptance Scenarios](./testing/ACCEPTANCE_SCENARIOS.md) |

## Active Documentation Map

### Project

- [Project Summary](./project/PROJECT_SUMMARY.md)
- [Project Gaps](./project/PROJECT_GAPS.md)
- [10 System Support Audit](./project/10_SYSTEM_SUPPORT_AUDIT.md)
- [Master Roadmap](./project/MASTER_ROADMAP.md)
- [MVP Definition](./project/MVP_DEFINITION.md)
- [Strategy](./project/STRATEGY.md)
- [Performance Targets](./project/PERFORMANCE_TARGETS.md)
- [Brand Identity](./project/BRAND_IDENTITY.md)

### Product

- [Product Overview](./product/overview.md)
- [Mapping Studio Docs](./product/README.md)
- [Mapping Studio UX Flow](./product/02-mapping-studio-ux-flow.md)
- [Mapping Studio API/Data Model](./product/03-mapping-studio-api-data-model.md)
- [Mapping Studio Validation Testing](./product/04-mapping-studio-validation-testing.md)
- [Mapping Studio Implementation Plan](./product/05-mapping-studio-implementation-plan.md)
- [Visual JSONata Design](./product/06-mapping-studio-visual-jsonata-design.md)

### Architecture

- [Architecture Overview](./architecture/01-overview.md)
- [Core Principles](./architecture/02-core-principles.md)
- [Technology Decisions](./architecture/03-technology-decisions.md)
- [Tech Stack](./architecture/tech-stack.md)
- [Message Design](./architecture/04-message-design.md)
- [Transformation Layer](./architecture/05-transformation-layer.md)
- [Business Layer](./architecture/06-business-layer.md)
- [Error Handling](./architecture/07-error-handling.md)
- [Ordering and Dependencies](./architecture/08-ordering-dependencies.md)
- [Outbox Pattern](./architecture/09-outbox-pattern.md)
- [Risk Mitigation](./architecture/10-risk-mitigation.md)
- [Sequence Diagrams](./architecture/11-sequence-diagrams.md)

### Implementation

- [Project Structure](./implementation/01-project-structure.md)
- [Configuration](./implementation/02-configuration.md)
- [Mapping Versioning](./implementation/03-mapping-versioning.md)
- [Schema Validation](./implementation/04-schema-validation.md)
- [Worker Pool](./implementation/05-worker-pool.md)
- [Graceful Shutdown](./implementation/06-graceful-shutdown.md)
- [Health Checks](./implementation/07-health-checks.md)
- [Logging and Masking](./implementation/08-logging-masking.md)
- [Metrics and Observability](./implementation/09-metrics-observability.md)
- [Security](./implementation/10-security.md)
- [Backend Service Requirements](./implementation/11-backend-service-requirements.md)
- [i18n Contributor Guide](./implementation/12-i18n-contributor-guide.md)
- [Transformer Node.js Guide](./implementation/TRANSFORMER_NODEJS_GUIDE.md)
- [Services Java/Quarkus Guide](./implementation/SERVICES_JAVA_QUARKUS_GUIDE.md)

### Deployment And Operations

- [Deployment Setup Guide](./deployment/setup-guide.md)
- [Docker Compose Local](./deployment/DOCKER_COMPOSE_LOCAL.md)
- [Kubernetes Deployment Guide](./deployment/KUBERNETES_DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](./deployment/01-deployment-checklist.md)
- [Database Migrations](./deployment/05-database-migrations.md)
- [Production Environment And Secrets](./deployment/09-production-env-and-secrets.md)
- [Runbook](./operations/08-runbook.md)
- [Production Readiness](./operations/11-production-readiness.md)
- [Security Operations](./operations/14-security-operations.md)
- [Alert Threshold Calibration](./operations/16-alert-threshold-calibration.md)

### Testing

- [Unit Tests](./testing/01-unit-tests.md)
- [Integration Tests](./testing/02-integration-tests.md)
- [E2E Tests](./testing/03-e2e-tests.md)
- [Load Tests](./testing/04-load-tests.md)
- [Chaos Tests](./testing/05-chaos-tests.md)
- [Contract Tests](./testing/06-contract-tests.md)
- [Test Environment](./testing/07-test-environment.md)
- [UI E2E Strategy](./testing/08-ui-e2e-strategy.md)
- [Acceptance Scenarios](./testing/ACCEPTANCE_SCENARIOS.md)
- [No-Code Integration Gap Register](./testing/NO_CODE_INTEGRATION_GAP_REGISTER.md)

## Maintenance Rules

- Keep active documentation under `docs/` unless it is a service-local README.
- Do not add one-off debug notes as root-level Markdown.
- Prefer updating [Project Gaps](./project/PROJECT_GAPS.md) over creating another status report.
- Update this index when an active document is added or removed.
