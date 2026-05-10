# Test Environment

## Purpose

The test environment should make local and CI validation repeatable.

## Required Services

- Kafka.
- PostgreSQL.
- Redis.
- Object storage or local substitute.
- Transformer service.
- Business service.
- Mapping Studio API/UI.
- Prometheus/Grafana for observability tests when needed.

## Local Setup

Use [Docker Compose Local](../deployment/DOCKER_COMPOSE_LOCAL.md) for local dependencies.

## Test Data

- Keep partner fixtures under versioned partner/event folders.
- Store valid, invalid, edge-case, and expected canonical outputs separately.
- Mask sensitive values in committed fixtures.
- Include one fixture per required canonical field.

## CI Requirements

- Spin up dependencies.
- Apply database migrations.
- Create Kafka topics.
- Seed canonical schemas and mapping fixtures.
- Run unit, integration, contract, and selected E2E tests.
- Publish test reports.

## See Also

- [CI/CD Pipeline](../deployment/07-ci-cd-pipeline.md)
- [Mapping Studio Validation](../product/04-mapping-studio-validation-testing.md)

