# CanonBridge Documentation

**🪄 Complete guide to solving integration problems without code**

> ⚠️ **Project Status**: This project is currently in the **DEMO + BACKEND DESIGN PHASE**.
> - Mapping Studio UI demo screens and transformer scaffold exist in the repository
> - Backend production services are specified but not fully implemented
> - Customer validation has not been completed
> - All performance claims are targets, not measured results
> 
> See [project/MASTER_ROADMAP.md](./project/MASTER_ROADMAP.md) for current phase.

This is the central hub for all CanonBridge documentation. Whether you're a business user creating integrations, a developer understanding the architecture, or a DevOps engineer deploying to production - start here.

---

## 🚀 Quick Navigation

| I want to... | Go here | Time |
|--------------|---------|------|
| **See docs by phase** | [Documentation by Phase](./DOCUMENTATION_BY_PHASE.md) | 5 min |
| **Create my first integration** | [Getting Started](./getting-started.md) | 10 min |
| **See what's possible** | [Product Overview](./product/overview.md) | 5 min |
| **Understand the project** | [Project Summary](./project/PROJECT_SUMMARY.md) | 10 min |
| **See the roadmap** | [Master Roadmap](./project/MASTER_ROADMAP.md) | 15 min |
| **Learn the Mapping Studio** | [Mapping Studio Guide](./product/README.md) | 15 min |
| **Understand the architecture** | [Architecture Overview](./architecture/01-overview.md) | 20 min |
| **Deploy to production** | [Deployment Guide](./deployment/setup-guide.md) | 1 hour |
| **Check implementation status** | [Implementation Status](./implementation/status.md) | 5 min |

---

## 👥 Documentation by Role

### 🎨 For Business Users (No Code!)
**You create integrations without coding:**
1. [Getting Started](./getting-started.md) - Your first integration in 10 minutes
2. [Mapping Studio Guide](./product/README.md) - Master the visual interface
3. [Visual JSONata Design](./product/06-mapping-studio-visual-jsonata-design.md) - Use transformations without code
4. [Common Patterns](./product/02-mapping-studio-ux-flow.md) - Tips and tricks

### 📊 For Product Managers
**You understand the value and roadmap:**
1. [Project Summary](./project/PROJECT_SUMMARY.md) - Quick overview
2. [Product Overview](./product/overview.md) - Features and benefits
3. [Master Roadmap](./project/MASTER_ROADMAP.md) - What's coming next
4. [Strategy](./project/STRATEGY.md) - Validation and go-to-market

### 💻 For Developers
**You understand the architecture:**
1. [Architecture Overview](./architecture/01-overview.md) - How it works
2. [MVP Definition](./project/MVP_DEFINITION.md) - What we build first
3. [Transformation Layer](./architecture/05-transformation-layer.md) - JSONata deep dive
4. [Implementation Guides](./implementation/) - Build and extend

### 🔧 For DevOps Engineers
**You deploy and monitor:**
1. [Setup Guide](./deployment/setup-guide.md) - Local and production setup
2. [Kubernetes Guide](./deployment/KUBERNETES_DEPLOYMENT_GUIDE.md) - K8s deployment
3. [Operations Runbook](./operations/08-runbook.md) - Day-to-day operations
4. [Performance Targets](./project/PERFORMANCE_TARGETS.md) - What to aim for

### 🧪 For QA Engineers
**You test and validate:**
1. [Test Environment](./testing/07-test-environment.md) - Setup test environment
2. [Testing Strategy](./testing/) - All test types
3. [Contract Tests](./testing/06-contract-tests.md) - API contracts

---

## 📚 Active Documentation Map

### Project Planning & Strategy

- **[Documentation by Phase](./DOCUMENTATION_BY_PHASE.md)** - Which docs to read for each phase ⭐
- [Project Summary](./project/PROJECT_SUMMARY.md) - Quick overview
- [Master Roadmap](./project/MASTER_ROADMAP.md) - Official project plan
- [Brand Identity](./project/BRAND_IDENTITY.md) - Name, vision, messaging
- [MVP Definition](./project/MVP_DEFINITION.md) - What we build first
- [Strategy](./project/STRATEGY.md) - Validation and go-to-market
- [Performance Targets](./project/PERFORMANCE_TARGETS.md) - Performance goals
- [10 System Support Audit](./project/10_SYSTEM_SUPPORT_AUDIT.md) - Current implementation gaps

### Product

- [Product Overview](./product/overview.md)
- [Product Roadmap](./product/roadmap.md)
- [SaaS Requirements](./product/saas-requirements.md)
- [Mapping Studio Docs](./product/README.md)
- [Visual JSONata Design](./product/06-mapping-studio-visual-jsonata-design.md)
- [Mapping Studio UI V2](./product/mapping-studio-ui-v2.md)
- [Mapping Studio Design System](./product/mapping-studio-design-system.md)

Mapping Studio is the core management workflow: upload or paste sample JSON, inspect the inferred JSON tree, generate an input schema, map source fields to canonical fields, preview transformations, create fixtures, review, and publish immutable mapping versions.

### Architecture

- [Architecture Overview](./architecture/01-overview.md)
- [Architecture V7 - Outbound API Calling and Credential Store](./architecture/architecture-v7-outbound.md)
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
- [Implementation Status](./implementation/status.md)
- [Backend Service Requirements](./implementation/11-backend-service-requirements.md)
- [Implementation-Ready Assets](./implementation/implementation-ready-assets.md)
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
- [Legacy Frontend React Guide](./implementation/FRONTEND_REACT_GUIDE.md)
- [Legacy Forms Angular Guide](./implementation/FORMS_ANGULAR_GUIDE.md)
- [Transformer Node.js Guide](./implementation/TRANSFORMER_NODEJS_GUIDE.md)
- [Business Services Java/Quarkus Guide](./implementation/SERVICES_JAVA_QUARKUS_GUIDE.md)

The active Studio UI direction is the Angular Mapping Studio demo. The legacy React and forms guides are retained for historical reference and should not be treated as a second production frontend requirement.

### Deployment

- [Deployment Checklist](./deployment/01-deployment-checklist.md)
- [Local Setup Guide](./deployment/setup-guide.md)
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
- [Failure Scenarios](./operations/09-failure-scenarios.md)
- [Schema Evolution](./operations/10-schema-evolution.md)
- [Production Readiness](./operations/11-production-readiness.md)
- [Replay & Recovery](./operations/12-replay-recovery.md)
- [Support Diagnostics](./operations/13-support-diagnostics.md)
- [Security Operations](./operations/14-security-operations.md)
- [Cost & Capacity Planning](./operations/15-cost-capacity-planning.md)
- [Audit Logging](./operations/16-audit-logging.md)

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
| Frontend Developer | [product/mapping-studio-ui-v2.md](./product/mapping-studio-ui-v2.md) -> [product/mapping-studio-design-system.md](./product/mapping-studio-design-system.md) -> [product/06-mapping-studio-visual-jsonata-design.md](./product/06-mapping-studio-visual-jsonata-design.md) |
| Backend Developer | [implementation/11-backend-service-requirements.md](./implementation/11-backend-service-requirements.md) -> [architecture/architecture-v7-outbound.md](./architecture/architecture-v7-outbound.md) -> [product/03-mapping-studio-api-data-model.md](./product/03-mapping-studio-api-data-model.md) -> [implementation/TRANSFORMER_NODEJS_GUIDE.md](./implementation/TRANSFORMER_NODEJS_GUIDE.md) |
| DevOps/SRE | [deployment/setup-guide.md](./deployment/setup-guide.md) -> [deployment/DOCKER_COMPOSE_LOCAL.md](./deployment/DOCKER_COMPOSE_LOCAL.md) -> [deployment/KUBERNETES_DEPLOYMENT_GUIDE.md](./deployment/KUBERNETES_DEPLOYMENT_GUIDE.md) -> [operations/08-runbook.md](./operations/08-runbook.md) |
| QA | [testing/07-test-environment.md](./testing/07-test-environment.md) -> [testing/01-unit-tests.md](./testing/01-unit-tests.md) -> [testing/03-e2e-tests.md](./testing/03-e2e-tests.md) |

## Maintenance Rules

- Keep active documentation under `docs/`.
- Use `docs/README.md` as the only active navigation hub.
- Move deprecated, generated, or duplicate summaries to `docs/archive/`.
- Do not create new root-level Markdown files.
- Update this index whenever a new active document is added.
