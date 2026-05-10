# ADR-003: Fastify over NestJS for the Transformer Service

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

The Node.js transformer service needs an HTTP framework to expose:

- `/health/live` and `/health/ready` — Kubernetes health checks
- `/metrics` — Prometheus scrape endpoint
- `/admin/mappings/reload` — internal cache invalidation
- `/admin/workers/status` — worker pool diagnostics

This service is **not** a user-facing API. Its primary function is Kafka consumption and transformation. HTTP endpoints are operational surfaces only.

---

## Options Considered

### Option A: Fastify

**Strengths:**
- Lowest overhead HTTP framework in Node.js ecosystem (benchmarks consistently show 2–3x faster than Express)
- Built-in JSON Schema validation (powered by Ajv internally)
- Plugin-based architecture with clear lifecycle hooks
- Excellent TypeScript support with typed request/reply
- Minimal boilerplate — no decorators, no dependency injection container
- Good for services with small, well-defined HTTP surfaces

**Weaknesses:**
- Plugin ecosystem smaller than Express
- Less familiar to NestJS-experienced teams
- No built-in DI container (may be seen as a weakness for large applications)

### Option B: NestJS

**Strengths:**
- Opinionated structure with DI container, modules, guards, interceptors
- Large ecosystem and community
- Built-in support for background jobs, WebSockets, microservices
- Good for large teams with standardization requirements
- Familiar to Angular developers

**Weaknesses:**
- Significant overhead for a service with 3–4 endpoints
- Decorator-based programming model adds indirection
- DI container startup time is measurable
- Overkill for a service whose primary concern is Kafka consumer throughput
- More ceremony: modules, controllers, providers for each endpoint

### Option C: Plain Node.js HTTP / Express

**Strengths:**
- Maximum familiarity
- Zero framework overhead

**Weaknesses:**
- Express is significantly slower than Fastify
- More boilerplate for type safety
- No built-in JSON Schema validation

---

## Decision

**Use Fastify.**

The transformer service's HTTP surface is small and operational. The service's performance-critical path is Kafka message processing, not HTTP. Fastify's low overhead is appropriate for this use case.

NestJS would be reconsidered if the service grows to:
- Multiple domain modules with complex business logic
- Large team requiring standardized patterns across services
- Complex auth, guards, and interceptors
- Background job scheduling built into the framework

None of these conditions apply to the transformer service.

---

## Consequences

**Positive:**
- Minimal HTTP overhead does not interfere with Kafka processing throughput
- Small, readable codebase — no framework ceremony for 4 endpoints
- Fast startup time — important for Kubernetes pod scheduling and rolling updates
- Ajv integration is native — consistent validation with the transformation layer

**Negative:**
- Team members familiar with NestJS need to learn Fastify patterns
- No built-in DI container — dependency wiring is manual (acceptable at this scale)
- Plugin discovery is less automatic than NestJS module system

**If the service grows:** If the transformer service expands to include user-facing APIs, complex auth, or many modules, NestJS should be evaluated as a migration path. This ADR should be revisited.

---

## Rejected Approaches

**NestJS for a 4-endpoint operational service**: Framework cost exceeds benefit. NestJS is the right choice for the Mapping Studio API service (Java/Quarkus) but not for a small transformation worker.
