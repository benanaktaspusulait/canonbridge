# Getting Started with CanonBridge

CanonBridge is a partner-event transformation platform. Its job is to turn many partner-specific JSON payloads into trusted canonical business events without writing a custom adapter for every partner.

> Current repository status: core services, Mapping Studio UI, transformer, mock service, Docker Compose, Kubernetes manifests, and automated tests exist. Production readiness still depends on the gaps tracked in [Project Gaps](./project/PROJECT_GAPS.md).

## Quick Start

### 1. Understand the Flow

```text
Partner JSON
  -> Kafka raw topic
  -> Transformer service
  -> JSONata mapping
  -> JSON Schema validation
  -> Kafka canonical topic
  -> Business service
  -> Database and outbox events
```

### 2. Start Local Infrastructure

Prerequisites:

- Docker Desktop or Docker with Docker Compose
- Git
- Node.js 20+
- Java 21

```bash
cp .env.example .env
docker compose up -d postgres kafka zookeeper redis canonbridge-mock
```

This starts the core local dependencies plus the mock external systems.

Useful local URLs:

| Service | URL |
|---------|-----|
| Kafka UI | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| Jaeger | http://localhost:16686 |

Application health endpoints such as `/health/live`, `/health/ready`, and `/metrics` become relevant after the API and transformer services are started.

### 3. Read the Core Product Docs

- [Documentation Index](./README.md)
- [Product Overview](./product/overview.md)
- [Mapping Studio Docs](./product/README.md)
- [Project Gaps](./project/PROJECT_GAPS.md)
- [10 System Support Audit](./project/10_SYSTEM_SUPPORT_AUDIT.md)

## Key Concepts

| Concept | Meaning |
|---------|---------|
| Raw Event | Original partner payload plus envelope metadata |
| Canonical Event | Standardized business event consumed by internal systems |
| Mapping | Versioned JSONata transformation from source fields to canonical fields |
| Input Schema | JSON Schema that validates partner payload shape |
| Canonical Schema | JSON Schema that validates transformed business events |
| Fixture | Sample input and expected output used to test a mapping |
| DLQ | Dead letter queue for events that cannot be transformed safely |

## First Mapping Package

For static transformer mapping packages, use this package shape.

```text
partners/my-partner/order-created/
├── config.json
├── input.v1.schema.json
├── inbound.v1.jsonata
├── canonical.v1.schema.json
└── fixtures/
    ├── valid-order.input.json
    └── valid-order.expected.json
```

Example `config.json`:

```json
{
  "partnerId": "my-partner",
  "eventType": "OrderCreated",
  "schemaVersion": "v1",
  "direction": "inbound",
  "inputSchema": "partners/my-partner/order-created/input.v1.schema.json",
  "mapping": "partners/my-partner/order-created/inbound.v1.jsonata",
  "canonicalSchema": "services/transformer/schemas/canonical/order-created.v1.schema.json",
  "kafka": {
    "inputTopic": "partner.raw.events",
    "outputTopic": "canonical.events",
    "dlqTopic": "transformation.dlq",
    "partitionKeyPath": "$.entityId"
  }
}
```

Example input schema:

```json
{
  "$id": "my-partner.order-created.input.v1",
  "type": "object",
  "required": ["order_id", "customer_id", "amount"],
  "properties": {
    "order_id": { "type": "string" },
    "customer_id": { "type": "string" },
    "amount": { "type": "number" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "product_id": { "type": "string" },
          "quantity": { "type": "integer" }
        }
      }
    }
  }
}
```

Example JSONata mapping:

```jsonata
{
  "orderId": order_id,
  "customerId": customer_id,
  "totalAmount": amount,
  "items": items.{
    "productId": product_id,
    "quantity": quantity
  }
}
```

## Mapping Studio Workflow

The management UI should make this workflow possible without hand-editing every file:

1. Upload or paste sample partner JSON.
2. Inspect the inferred JSON tree and correct field types.
3. Generate or edit the input schema.
4. Map source fields to canonical fields with preview.
5. Save fixtures from sample inputs and expected outputs.
6. Review diffs and publish an immutable mapping version.
7. Monitor failures, DLQ entries, and mapping-version performance.

See [Mapping Studio Product Requirements](./product/01-mapping-studio-product-requirements.md) and [Mapping Studio UX Flow](./product/02-mapping-studio-ux-flow.md).

## Next Paths

| Role | Next docs |
|------|-----------|
| Product | [Product Roadmap](./product/roadmap.md), [SaaS Requirements](./product/saas-requirements.md) |
| Frontend | [Mapping Studio UX Flow](./product/02-mapping-studio-ux-flow.md), [Angular UI README](../mapping-studio-ui/README.md) |
| Backend | [Transformation Layer](./architecture/05-transformation-layer.md), [Transformer Node.js Guide](./implementation/TRANSFORMER_NODEJS_GUIDE.md) |
| DevOps | [Setup Guide](./deployment/setup-guide.md), [Docker Compose Local](./deployment/DOCKER_COMPOSE_LOCAL.md) |
| QA | [Test Environment](./testing/07-test-environment.md), [Contract Tests](./testing/06-contract-tests.md) |

## Readiness Checklist

- [ ] Local infrastructure starts with `docker compose up`.
- [ ] Health checks pass for Mapping Studio API, transformer, webhook receiver, and mock service.
- [ ] First partner mapping package is drafted.
- [ ] Transformer service can dry-run mappings.
- [ ] Mapping Studio can upload sample JSON and publish versions.
- [ ] Automated unit, integration, contract, and load tests exist.
- [ ] Monitoring dashboards and alerts are connected to live metrics.
- [ ] Deployment and rollback procedures are tested in staging.

**Last Updated**: May 19, 2026
