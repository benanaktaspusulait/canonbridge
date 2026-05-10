# End-to-End Tests

## Scope

E2E tests validate the full user or message journey across services.

## Critical Journeys

- Create Mapping Studio draft from sample JSON, publish mapping v1, process sample raw event.
- Process happy-path order event from raw topic to canonical topic and business database.
- Duplicate event is accepted once and ignored on replay.
- Invalid partner payload appears in DLQ with actionable metadata.
- DLQ event is imported as a Mapping Studio sample for a fix draft.
- Rollback activates previous mapping version.

## UI Coverage

- Sample JSON upload/paste.
- JSON tree inspection.
- Schema builder.
- Canonical mapping builder.
- Transform preview.
- Review and publish.

## Acceptance

E2E tests must run against staging-like infrastructure before GA and before high-risk Mapping Studio releases.

## See Also

- [Mapping Studio UX Flow](../product/02-mapping-studio-ux-flow.md)
- [Deployment Checklist](../deployment/01-deployment-checklist.md)

