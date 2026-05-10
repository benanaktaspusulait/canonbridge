# CanonBridge

**Transform partner data into trusted business events in minutes, not weeks.**

CanonBridge is an event transformation platform for teams that repeatedly onboard partner payloads into a shared canonical event model.

> Current status: this repository is primarily a documentation, architecture, and prepared-infrastructure package. Product implementation, runnable application source code, automated tests, and performance benchmarks still need to be added before production-readiness claims can be treated as proven.

[![Status](https://img.shields.io/badge/status-MVP-yellow.svg)](roadmap.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)

## Why This Product Exists

### The Problem

```text
Building custom adapters for each partner
Weeks to onboard a new partner
Code changes for every mapping update
Tight coupling between partner formats and business logic
Weak visibility into failed transformations
```

### The Product Answer

```text
Generic transformation engine
Versioned mappings without code deployment
Sample-driven schema and fixture creation
Clean separation between partner data and business logic
Operational DLQ, replay, audit, and observability workflows
```

## Product Fit

CanonBridge is most useful for teams with repeated multi-partner integration pain: many external payload formats, frequent mapping changes, operational DLQ/replay needs, and a shared canonical business event model.

It may be overbuilt for 1-2 stable integrations or highly partner-specific business logic.

See [roadmap.md](roadmap.md#-product-necessity-assessment) for the product necessity assessment, current gaps, and first validation step.

## Core Workflow

Mapping Studio is the management UI that should make partner onboarding repeatable:

1. Upload or paste sample partner JSON.
2. Inspect the inferred JSON tree and correct field types.
3. Generate or edit the input schema.
4. Map source fields to canonical fields.
5. Preview transformations with sample payloads.
6. Save fixtures and expected outputs.
7. Review diffs and publish an immutable mapping version.
8. Monitor failures, DLQ entries, replay outcomes, and mapping-version performance.

Start with [Mapping Studio Docs](./README.md).

## Quick Start

### 1. Read the Active Docs

- [Documentation Index](../README.md)
- [Getting Started](../getting-started.md)
- [Mapping Studio Docs](./README.md)

### 2. Evaluate Prepared Infrastructure

The prepared infrastructure package lives under `_implementation-ready/`.

```bash
cd _implementation-ready
cp .env.example .env
make init
make health
```

This brings up the prepared Kafka, PostgreSQL, Redis, Prometheus, Grafana, Jaeger, and Kafka UI stack. Application service builds should be added after the transformer, business service, and UI projects exist.

### 3. Build the Product Incrementally

Follow [Implementation Roadmap](../implementation/roadmap.md), [Implementation Status](../implementation/status.md), and [Implementation-Ready Assets](../implementation/implementation-ready-assets.md). Create the transformer, business service, Mapping Studio UI, schemas, and tests before treating runtime commands as production-ready.

## Documentation

| Document | Purpose |
|----------|---------|
| [../README.md](../README.md) | Complete documentation index |
| [../getting-started.md](../getting-started.md) | First-time concepts and setup |
| [roadmap.md](roadmap.md) | Product vision, fit, and timeline |
| [README.md](README.md) | Mapping Studio documentation |
| [../architecture/](../architecture/) | Architecture decisions |
| [../implementation/](../implementation/) | Implementation patterns |
| [../deployment/](../deployment/) | Deployment and infrastructure guidance |
| [../operations/](../operations/) | Operational procedures |
| [../testing/](../testing/) | Testing strategy |

## Architecture Summary

```text
Partner Systems
    ↓
Kafka Raw Topic
    ↓
Transformer Service
├── JSONata Mapping
├── Ajv Validation
├── Worker Pool
└── Error Handling
    ↓
Kafka Canonical Topic
    ↓
Business Service
├── Idempotency
├── Pending Dependencies
└── Outbox Pattern
    ↓
Database + Business Events
```

## Key Capabilities

### Flexible Transformation

- JSONata for readable transformations.
- Versioned mappings for safe updates.
- Fixtures for repeatable validation.
- Schema generation from representative samples.

### Reliable Processing

- Idempotent event handling.
- Ordering and dependency management.
- Transactional outbox pattern.
- DLQ and retry topics.

### Observable Operations

- Structured logs with correlation IDs.
- Prometheus-compatible metrics.
- Distributed tracing through Jaeger.
- Grafana dashboards.

### Security And Governance

- Tenant-aware access control requirements.
- Audit logging for mapping changes and publishes.
- PII masking in logs and previews.
- Separation between draft and published mapping versions.

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Throughput | 10,000 msg/sec | Target, benchmark needed |
| Latency p99 | < 100ms | Target, benchmark needed |
| Uptime | 99.95% | Target, production proof needed |
| DLQ Rate | < 0.1% | Target, production proof needed |
| Consumer Lag | < 1,000 msg | Target, load test needed |

## Project Structure

```text
etlsolutions/
├── docs/                         # Documentation
├── _implementation-ready/         # Prepared infrastructure assets
├── src/                          # Source code to be implemented
├── partners/                     # Partner configuration packages
├── schemas/                      # Canonical schemas
├── test/                         # Tests
├── docker/                       # Draft Docker assets
├── k8s/                          # Draft Kubernetes manifests
└── scripts/                      # Utility scripts
```

## Testing Status

The test strategy is documented, but executable test suites are still pending with the service implementations. Use [../testing/](../testing/) as the acceptance plan for unit, integration, contract, load, and chaos tests.

## Product Status

| Component | Status | Version |
|-----------|--------|---------|
| Architecture Package | Draft complete | 1.0.0 |
| Prepared Infrastructure | Drafted, validation needed | 1.0.0 |
| Core Platform | Implementation needed | - |
| Mapping Studio | Product docs complete, UI needed | - |
| Testing | Test suite needed | - |
| Production Ready | Not yet proven | - |

## Next Steps

1. Validate the product need with 3-5 real partner onboarding examples.
2. Implement the Mapping Studio skeleton and sample JSON upload flow.
3. Implement transformer dry-run APIs for schema, mapping, and preview.
4. Add mapping package fixtures and contract tests.
5. Promote infrastructure assets after service source code exists.

Last Updated: May 10, 2026
