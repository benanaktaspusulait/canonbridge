# Product Documentation

This section contains active product documentation for CanonBridge.

## Product Documents

| Document | Purpose |
|----------|---------|
| [overview.md](./overview.md) | Product overview, value proposition, use cases, status |
| [roadmap.md](./roadmap.md) | Product fit, Mapping Studio strategy, roadmap, metrics |
| [saas-requirements.md](./saas-requirements.md) | Multi-tenancy, billing, tenant onboarding, security |

## Mapping Studio Documents

Mapping Studio is the management UI for configuring partner integrations from sample JSON.

| Document | Purpose |
|----------|---------|
| [01-mapping-studio-product-requirements.md](./01-mapping-studio-product-requirements.md) | Product requirements, personas, acceptance criteria |
| [02-mapping-studio-ux-flow.md](./02-mapping-studio-ux-flow.md) | Screen-by-screen UX flow for sample JSON, schema, mapping, preview, review, publish |
| [03-mapping-studio-api-data-model.md](./03-mapping-studio-api-data-model.md) | API contracts, domain entities, state model, permissions |
| [04-mapping-studio-validation-testing.md](./04-mapping-studio-validation-testing.md) | Validation pipeline, fixtures, quality gates, test strategy |
| [05-mapping-studio-implementation-plan.md](./05-mapping-studio-implementation-plan.md) | Delivery plan, architecture integration, milestones, risks |
| [06-mapping-studio-visual-jsonata-design.md](./06-mapping-studio-visual-jsonata-design.md) | Visual JSONata UI design, transform catalog, generator API, roles, validation |

## Mapping Studio MVP Flow

```text
Create partner/event
    -> Upload or paste sample JSON
    -> Inspect inferred JSON tree
    -> Confirm input schema fields
    -> Map source fields to canonical fields
    -> Preview JSONata and transformed output
    -> Save valid and invalid fixtures
    -> Run validation
    -> Submit for review
    -> Publish immutable mapping version
```

## Product Boundary

Mapping Studio owns design-time configuration: samples, schemas, mapping rules, fixtures, validation runs, approvals, and published artifacts.

It does not own runtime Kafka consumption, business event processing, outbox publishing, or long-running data repair jobs.

## See Also

- [Architecture Overview](../architecture/01-overview.md)
- [Transformation Layer](../architecture/05-transformation-layer.md)
- [Mapping Versioning](../implementation/03-mapping-versioning.md)
- [Visual JSONata Design](./06-mapping-studio-visual-jsonata-design.md)
- [Transformer Node.js Guide](../implementation/TRANSFORMER_NODEJS_GUIDE.md)
