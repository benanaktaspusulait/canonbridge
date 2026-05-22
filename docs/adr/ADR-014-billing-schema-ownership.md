# ADR-014: Billing Schema Ownership

**Status:** Accepted  
**Date:** 2026-05-22  
**Context:** billing-service reads/writes tables (subscriptions, invoices, usage_events, etc.) that are migrated by mapping-studio-api's Flyway.

## Decision

**mapping-studio-api owns all Flyway migrations** for the shared `canonbridge_db` database. billing-service does NOT run migrations (`quarkus.flyway.migrate-at-start=false`).

## Rationale

1. Single migration owner prevents version conflicts and ordering issues.
2. billing-service is a consumer of the schema, not the owner.
3. In Kubernetes, mapping-studio-api runs as an init container or startup dependency before billing-service.

## Consequences

- billing-service MUST start after mapping-studio-api has completed migrations.
- Docker Compose enforces this via `depends_on: mapping-studio-api: condition: service_healthy`.
- K8s enforces this via init container or ArgoCD sync wave ordering.
- Any new billing tables must be added as migrations in mapping-studio-api.
- billing-service healthcheck should verify required tables exist.

## Alternatives Considered

- Separate `billing` schema with its own Flyway: rejected due to cross-schema FK complexity.
- Shared migration library (JAR): over-engineering for current team size.
