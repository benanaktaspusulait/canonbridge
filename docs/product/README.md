# Product Documentation

This section defines the product behavior for the ETL Solutions management experience. The main focus is Mapping Studio: the workflow that lets a user upload or paste sample partner JSON, inspect the payload structure, define schemas, create mappings, test transformations, and publish versioned integration configuration.

## Documents

| Document | Purpose |
|----------|---------|
| [01-mapping-studio-product-requirements.md](./01-mapping-studio-product-requirements.md) | Product requirements, scope, personas, acceptance criteria |
| [02-mapping-studio-ux-flow.md](./02-mapping-studio-ux-flow.md) | Screen-by-screen UX flow for sample JSON, schema, mapping, testing, and publishing |
| [03-mapping-studio-api-data-model.md](./03-mapping-studio-api-data-model.md) | API contracts, domain entities, state model, and permissions |
| [04-mapping-studio-validation-testing.md](./04-mapping-studio-validation-testing.md) | Validation pipeline, fixture strategy, test coverage, and quality gates |
| [05-mapping-studio-implementation-plan.md](./05-mapping-studio-implementation-plan.md) | Delivery plan, architecture integration, milestones, and risks |

## Product Boundary

Mapping Studio is not a separate ETL engine. It is the management layer for producing safe, reviewable, versioned configuration consumed by the transformer service.

It owns:

- Sample payload capture
- JSON structure inspection
- Input schema drafting
- Source-to-canonical field mapping
- JSONata generation and manual override
- Fixture creation
- Transformation preview
- Validation runs
- Review and publish workflow
- Audit history for mapping changes

It does not own:

- Runtime Kafka consumption
- Business event processing
- Outbox publishing
- Long-running data repair jobs
- Partner authentication protocols outside the raw-event boundary

## MVP Flow

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

## Primary Users

- Integration engineers create and maintain mappings.
- Business analysts review business meaning and field choices.
- Platform architects govern canonical models and schema evolution.
- SRE/operators inspect published versions and investigate failed transformations.
- Tenant admins control access, approvals, and audit scope.

## Success Criteria

- A new partner event can be configured from sample JSON without writing adapter code.
- Generated artifacts are compatible with the transformer service project structure.
- Every published mapping version has fixtures, validation results, owner, reviewer, and audit history.
- A non-developer can inspect field names, sample values, and required/optional choices without reading raw JSON only.
- Runtime failures can be traced back to the mapping version, schema version, sample payload, and validation run that produced the published config.

