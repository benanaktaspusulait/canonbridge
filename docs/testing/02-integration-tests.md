# Integration Tests

## Scope

Integration tests verify service boundaries with real or test-container dependencies.

## Test Targets

- Transformer with Kafka test topics.
- Business service with PostgreSQL.
- Outbox publisher with database and Kafka.
- Mapping Studio API with PostgreSQL/object storage test doubles.
- Schema and artifact export flow.

## Core Scenarios

- Raw event consumed and canonical event produced.
- Invalid payload goes to DLQ.
- Temporary publish failure retries.
- Business service handles duplicate event idempotently.
- Mapping draft exports artifact package.
- Published mapping version is loaded by transformer test harness.

## Environment

Use Docker Compose or Testcontainers for Kafka, PostgreSQL, Redis, and local object storage.

## See Also

- [Test Environment](./07-test-environment.md)
- [Docker Compose Local](../deployment/DOCKER_COMPOSE_LOCAL.md)

