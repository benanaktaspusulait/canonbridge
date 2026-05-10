# ETL Solutions Documentation

This is the single active entry point for the ETL Solutions documentation. All documentation lives under `docs/`; root-level Markdown files have been moved here or archived to avoid duplicate navigation.

## Start Here

| Need | Read |
|------|------|
| Product overview | [product/overview.md](./product/overview.md) |
| Product fit and roadmap | [product/roadmap.md](./product/roadmap.md) |
| Mapping Studio management UI | [product/README.md](./product/README.md) |
| First-time setup and concepts | [getting-started.md](./getting-started.md) |
| Technology stack | [architecture/tech-stack.md](./architecture/tech-stack.md) |
| Implementation plan | [implementation/roadmap.md](./implementation/roadmap.md) |
| Archived/deprecated docs | [archive/README.md](./archive/README.md) |

## Active Documentation Map

### Product

- [Product Overview](./product/overview.md)
- [Product Roadmap](./product/roadmap.md)
- [SaaS Requirements](./product/saas-requirements.md)
- [Mapping Studio Docs](./product/README.md)

Mapping Studio is the core management workflow: upload or paste sample JSON, inspect the inferred JSON tree, generate an input schema, map source fields to canonical fields, preview transformations, create fixtures, review, and publish immutable mapping versions.

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

### Implementation

- [Implementation Roadmap](./implementation/roadmap.md)
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
- [Frontend React Guide](./implementation/FRONTEND_REACT_GUIDE.md)
- [Forms Angular Guide](./implementation/FORMS_ANGULAR_GUIDE.md)
- [Transformer Node.js Guide](./implementation/TRANSFORMER_NODEJS_GUIDE.md)
- [Business Services Java/Quarkus Guide](./implementation/SERVICES_JAVA_QUARKUS_GUIDE.md)

### Deployment

- [Deployment Checklist](./deployment/01-deployment-checklist.md)
- [Canary Deployment](./deployment/02-canary-deployment.md)
- [Blue-Green Deployment](./deployment/03-blue-green-deployment.md)
- [Rollback Procedure](./deployment/04-rollback-procedure.md)
- [Database Migrations](./deployment/05-database-migrations.md)
- [Kubernetes Manifests](./deployment/06-kubernetes-manifests.md)
- [CI/CD Pipeline](./deployment/07-ci-cd-pipeline.md)
- [Docker Compose Local](./deployment/DOCKER_COMPOSE_LOCAL.md)
- [Kubernetes Deployment Guide](./deployment/KUBERNETES_DEPLOYMENT_GUIDE.md)

### Operations

- [Monitoring Dashboards](./operations/01-monitoring-dashboards.md)
- [Alerting Strategy](./operations/02-alerting-strategy.md)
- [Troubleshooting](./operations/03-troubleshooting.md)
- [Scaling](./operations/04-scaling.md)
- [Maintenance](./operations/05-maintenance.md)
- [Disaster Recovery](./operations/06-disaster-recovery.md)
- [Performance Tuning](./operations/07-performance-tuning.md)
- [Runbook](./operations/08-runbook.md)

### Testing

- [Unit Tests](./testing/01-unit-tests.md)
- [Integration Tests](./testing/02-integration-tests.md)
- [End-to-End Tests](./testing/03-e2e-tests.md)
- [Load Tests](./testing/04-load-tests.md)
- [Chaos Tests](./testing/05-chaos-tests.md)
- [Contract Tests](./testing/06-contract-tests.md)
- [Test Environment](./testing/07-test-environment.md)

## Role-Based Paths

| Role | Path |
|------|------|
| Product Manager | [product/overview.md](./product/overview.md) -> [product/roadmap.md](./product/roadmap.md) -> [product/README.md](./product/README.md) |
| Frontend Developer | [product/02-mapping-studio-ux-flow.md](./product/02-mapping-studio-ux-flow.md) -> [implementation/FRONTEND_REACT_GUIDE.md](./implementation/FRONTEND_REACT_GUIDE.md) -> [implementation/FORMS_ANGULAR_GUIDE.md](./implementation/FORMS_ANGULAR_GUIDE.md) |
| Backend Developer | [architecture/05-transformation-layer.md](./architecture/05-transformation-layer.md) -> [implementation/TRANSFORMER_NODEJS_GUIDE.md](./implementation/TRANSFORMER_NODEJS_GUIDE.md) -> [implementation/03-mapping-versioning.md](./implementation/03-mapping-versioning.md) |
| DevOps/SRE | [deployment/DOCKER_COMPOSE_LOCAL.md](./deployment/DOCKER_COMPOSE_LOCAL.md) -> [deployment/KUBERNETES_DEPLOYMENT_GUIDE.md](./deployment/KUBERNETES_DEPLOYMENT_GUIDE.md) -> [operations/08-runbook.md](./operations/08-runbook.md) |
| QA | [testing/07-test-environment.md](./testing/07-test-environment.md) -> [testing/01-unit-tests.md](./testing/01-unit-tests.md) -> [testing/03-e2e-tests.md](./testing/03-e2e-tests.md) |

## Maintenance Rules

- Keep active documentation under `docs/`.
- Use `docs/README.md` as the only active navigation hub.
- Move deprecated or duplicate summaries to `docs/archive/`.
- Do not create new root-level Markdown files.
- Update this index whenever a new active document is added.

