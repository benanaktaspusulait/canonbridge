# Mapping Studio Implementation Plan

## Goal

Deliver a management workflow that can produce a valid, reviewed, versioned transformer mapping package from sample partner JSON.

## Architecture Placement

```text
React Management Shell
    -> Mapping Studio route
    -> Angular/Forms or React form modules
    -> Management API
    -> Mapping Studio storage
    -> Artifact exporter
    -> Published mapping package
    -> Transformer service consumes published artifacts
```

The UI can be implemented in React only, Angular forms only, or a React shell with embedded form modules. The product behavior should stay the same regardless of frontend framework.

## Recommended Modules

Frontend modules:

- `MappingStudioHome`
- `DraftSetupStep`
- `SampleJsonStep`
- `JsonStructureExplorer`
- `InputSchemaBuilder`
- `CanonicalMappingBuilder`
- `JsonataCodeView`
- `TransformPreview`
- `FixtureManager`
- `ReviewPublishStep`
- `ValidationRunDetails`
- `PublishedVersionList`

Backend modules:

- Draft service
- Sample payload service
- Field inventory service
- Schema generation service
- Canonical schema service
- Mapping rule service
- JSONata generation service
- Preview execution service
- Validation run service
- Review workflow service
- Artifact export service
- Audit service

## Phase 1: Product Spike

Target: prove that sample JSON can produce a draft mapping package.

Deliverables:

- Static canonical schema fixture.
- Paste JSON sample.
- Field inventory inference.
- Basic source-to-target mapping rules.
- JSONata generation for direct mappings.
- Transform preview.
- Generated artifact files in memory or local storage.

Exit criteria:

- One sample order payload can transform into one canonical order event.
- Required canonical fields are checked.
- JSONata output can be copied into the transformer service guide layout.

## Phase 2: MVP

Target: create a usable draft-to-publish workflow.

Deliverables:

- Draft CRUD API.
- Sample upload and storage.
- JSON tree explorer.
- Input schema builder.
- Canonical schema browser.
- Mapping rule editor.
- JSONata code view.
- Full preview and validation run.
- Fixture manager.
- Review and publish state machine.
- Artifact export.
- Audit events.

Exit criteria:

- A user can create partner/event mapping v1 without editing files manually.
- Publish is blocked unless validation gates pass.
- Exported artifacts match transformer service expected layout.

## Phase 3: Operational Integration

Target: connect Mapping Studio to runtime operations.

Deliverables:

- Published version activation/deactivation.
- Rollback workflow.
- Version comparison.
- DLQ event import.
- Links from validation errors to mapping rules.
- Links from runtime DLQ messages to mapping versions.
- Metrics for preview, validation, and publish.

Exit criteria:

- An operator can identify which mapping version caused a DLQ event.
- A failed production payload can become a sample in a fix draft.
- Rollback can activate the previous mapping version with audit trail.

## Phase 4: Governance and Scale

Target: support enterprise workflow and many partners.

Deliverables:

- Tenant policy for approval requirements.
- Reviewer groups.
- Manual JSONata permission controls.
- PII masking policies.
- Bulk sample import.
- Multi-sample schema inference conflict UI.
- Reusable mapping templates.
- Compatibility testing against historical samples.

Exit criteria:

- Tenant admins can enforce separation of duties.
- Reviewers can compare v1 and v2 before approval.
- Large partner portfolios remain searchable and manageable.

## Data Storage Decisions

Recommended storage:

- PostgreSQL for drafts, rules, validation summaries, reviews, and audit.
- Object storage for raw sample payloads and exported artifact packages.
- Redis only for short-lived preview/cache data.

Do not store raw sample JSON only in browser state. Draft work must survive browser refresh and user session expiry.

## Generated Artifact Contract

Each published version should produce:

```text
config.json
input.{schemaVersion}.schema.json
inbound.{mappingVersion}.jsonata
canonical.{canonicalSchemaVersion}.schema.json
fixtures/valid/*.json
fixtures/invalid/*.json
fixtures/expected/*.json
```

Artifact checks:

- File names match version metadata.
- JSON Schema files compile.
- JSONata parses.
- Fixtures pass.
- Artifact checksums are stored.

## Frontend Implementation Notes

- Use virtualized tree rendering for large payloads.
- Keep long JSON paths copyable.
- Use split panes for source, mapping, and target panels.
- Never rely only on drag-and-drop.
- Run expensive inference and preview work on the backend.
- Debounce autosave for mapping rule edits.
- Keep validation run status pollable and later upgrade to WebSocket/SSE.

## Backend Implementation Notes

- Treat preview execution as untrusted user input.
- Add timeout and memory controls around JSONata execution.
- Keep preview deterministic.
- Use request correlation IDs through upload, preview, validation, and publish.
- Use optimistic locking on drafts to avoid overwriting another user's changes.
- Use immutable artifact records for published versions.

## API Dependencies

Mapping Studio depends on:

- Auth/RBAC service.
- Tenant service.
- Canonical schema registry or canonical schema table.
- Transformer artifact format.
- Audit log service.
- Object storage.

Mapping Studio should not depend on:

- Live Kafka availability for the MVP.
- Production transformer pods.
- Business service database writes.

## Risks

| Risk | Mitigation |
|------|------------|
| Users publish wrong mapping | Required validation run, fixtures, review workflow |
| Inferred schema is too strict | Show occurrence counts, require user confirmation for required fields |
| JSONata manual override becomes unsafe | Permission gate, linting, timeout, review |
| Large samples freeze UI | Backend parsing, payload limits, virtualized tree |
| PII leaks through samples | PII detection, masking, encrypted storage, no raw payload logs |
| Canonical schema changes break mappings | Versioned canonical schemas and compatibility checks |
| UI-generated artifacts diverge from runtime needs | Artifact export contract and transformer contract tests |

## Definition of Done

- Product requirements are approved.
- UX flow covers happy, error, review, and rollback states.
- API contracts are implemented or tracked as backlog items.
- Validation pipeline blocks unsafe publish.
- Published artifacts run successfully in transformer tests.
- Audit events cover every state-changing action.
- Documentation index links users to Mapping Studio docs.

