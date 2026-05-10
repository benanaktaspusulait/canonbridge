# Mapping Studio Product Requirements

## Summary

Mapping Studio is the management screen that turns messy partner JSON into trusted canonical events. It should let users upload or paste sample JSON, inspect the JSON structure, choose field types and requirements, map partner fields to canonical fields, test the transformation, and publish an immutable versioned mapping package.

The product exists because the highest-value workflow in CanonBridge is not the dashboard. The highest-value workflow is teaching the platform how a new partner event should be understood, validated, transformed, and operated safely.

## Problem

Partner integrations are slow because teams repeatedly do the same work by hand:

- Read unfamiliar partner payloads.
- Discover field paths and array shapes.
- Decide which fields are required.
- Write JSON Schema by hand.
- Write JSONata by hand.
- Create fixtures manually.
- Test happy and failure paths manually.
- Coordinate approvals through chats, tickets, and pull requests.
- Debug production DLQ events without a clear link to mapping versions.

This creates slow onboarding, hidden mapping mistakes, inconsistent schema governance, and unnecessary dependency on senior engineers for routine partner changes.

## Product Thesis

```text
If CanonBridge can turn sample partner JSON into a reviewed, tested, versioned mapping package, partner onboarding becomes a repeatable product workflow instead of a custom engineering project.
```

## Primary Personas

| Persona | Goal | Needs |
|---------|------|-------|
| Integration Engineer | Configure partner events quickly and safely | JSON tree, schema editor, mapping editor, test preview, fixture management |
| Business Analyst | Confirm business meaning of mapped fields | Human-readable field labels, sample values, canonical field descriptions |
| Platform Architect | Protect canonical model quality | Schema compatibility, mapping review, version governance |
| SRE/Operator | Diagnose runtime failures | Version lineage, validation results, DLQ links, audit trail |
| Tenant Admin | Control access and compliance | RBAC, approval rules, audit exports, tenant isolation |

## Jobs To Be Done

- When I receive a new partner payload, I want to load representative examples so that I can discover the structure without hand-reading raw JSON.
- When I inspect fields, I want inferred types and sample values so that I can define an input schema quickly.
- When I map fields, I want canonical field descriptions and validation feedback so that I do not produce invalid business events.
- When transformation logic is simple, I want the product to generate JSONata so that I avoid repetitive mapping code.
- When transformation logic is complex, I want to edit JSONata manually and test it immediately.
- When I publish a mapping, I want review, fixtures, validation, and audit trail so that runtime changes are controlled.
- When something fails in production, I want to know which mapping version created the bad output so that I can fix and replay safely.

## MVP Scope

The MVP should support one tenant, one partner, one event type, and one canonical event family. The first release should optimize for proving the onboarding loop, not full SaaS administration.

Required MVP capabilities:

- Create partner and event draft.
- Upload or paste one or more sample JSON payloads.
- Parse JSON and display an expandable tree.
- Infer JSON paths, primitive types, arrays, nullability, sample values, and occurrence count.
- Mark fields as required or optional.
- Generate a draft input JSON Schema.
- Select canonical event type and schema version.
- Map source JSON paths to canonical JSON paths.
- Support direct mapping, constant value, default value, simple expression, and manual JSONata override.
- Preview transformed canonical output for each sample.
- Validate output against canonical schema.
- Save generated mapping, input schema, canonical schema reference, and fixtures as a draft.
- Run validation before publish.
- Submit mapping draft for review.
- Publish immutable mapping version after approval.
- Export mapping package in the file structure expected by the transformer service.

## Later Scope

- Multi-sample schema inference with conflict resolution.
- Drag-and-drop mapping canvas.
- AI-assisted field suggestions.
- Canonical model browser with lineage.
- Live DLQ-to-draft workflow: create a fix directly from failed production messages.
- Compatibility checks against historical payloads.
- Team comments and inline review.
- Bulk partner onboarding.
- Marketplace of reusable mapping templates.
- Sandbox Kafka replay from UI.

## Non-Goals

- Replacing a full data catalog.
- Replacing business process modeling.
- Building a general-purpose visual programming environment.
- Supporting arbitrary binary, XML, CSV, or EDI formats in the first release.
- Allowing unreviewed production mapping changes.
- Editing canonical schemas freely without governance.

## Functional Requirements

### Partner Event Draft

- Users can create a draft with `partnerId`, `partnerName`, `eventType`, `schemaVersion`, owner, and description.
- Drafts have lifecycle states: `draft`, `validating`, `ready_for_review`, `approved`, `published`, `archived`.
- Drafts autosave after meaningful user changes.
- Drafts can be cloned from an existing mapping version.

### Sample JSON Intake

- Users can paste JSON text or upload `.json` files.
- The system validates JSON syntax before creating a sample.
- The system stores raw sample payloads as test fixtures, with optional masking for sensitive fields.
- Users can tag samples as `valid`, `invalid`, `edge_case`, or `production_failure`.
- The UI shows parse errors with line and column when possible.

### JSON Structure Detection

- The system produces a field inventory with JSON Pointer and JSONPath-style paths.
- Each field shows inferred type, nullable flag, array context, sample values, and occurrence count.
- For arrays, the UI shows item shape and repeated field paths.
- Users can rename display labels without changing source paths.

### Schema Builder

- Users can mark fields required or optional.
- Users can select type constraints: string, number, integer, boolean, object, array, null.
- Users can add string format hints such as date, date-time, email, uuid, uri, and custom regex.
- Users can define enum values from observed samples.
- Users can define min/max constraints for strings, numbers, and arrays.
- The system generates JSON Schema draft output compatible with Ajv.
- The generated schema can be edited in code view by advanced users.

### Mapping Builder

- Users can select a canonical event type and target schema version.
- The UI shows source fields and target canonical fields side by side.
- Users can create mapping rules:
  - direct source path to target path
  - source path with type conversion
  - constant value
  - default value if missing
  - conditional expression
  - array mapping
  - manual JSONata expression
- The system generates a JSONata mapping from the mapping rules.
- Advanced users can switch to raw JSONata mode, with validation warnings.

### Preview and Validation

- Users can run transformation preview against every sample.
- The UI shows source JSON, generated canonical JSON, validation errors, and JSONata errors.
- Validation errors link to the target schema path and the mapping rule that produced the value.
- Users cannot submit for review until required validation gates pass.

### Review and Publish

- Reviewers can compare previous mapping version and draft version.
- Reviewers can see changed source paths, changed target paths, schema changes, fixtures, validation results, and risk level.
- Publishing creates an immutable mapping version.
- Published versions can be activated, deactivated, or superseded, but not edited.
- Rollback activates a previous version and records an audit event.

## Non-Functional Requirements

- UI should handle sample payloads up to 1 MB in MVP without freezing.
- Parsing and inference should complete in under 2 seconds for typical payloads.
- Draft save operations should be idempotent.
- All changes to mapping rules, schemas, fixtures, approvals, and publish actions must be audited.
- Tenant data must be isolated.
- Sensitive sample values must be maskable before storage.
- Published artifacts must be reproducible from stored draft state.
- The transformer service must not depend on UI availability at runtime.

## Permissions

| Permission | Description |
|------------|-------------|
| `mapping:draft:create` | Create partner event drafts |
| `mapping:draft:update` | Edit sample payloads, schemas, and mappings |
| `mapping:draft:validate` | Run validation preview |
| `mapping:review:submit` | Submit a draft for review |
| `mapping:review:approve` | Approve or reject a draft |
| `mapping:version:publish` | Publish approved mapping version |
| `mapping:version:rollback` | Activate previous mapping version |
| `mapping:audit:read` | View mapping audit history |

## Acceptance Criteria

- A user can upload sample JSON and see an expandable field tree.
- A user can generate an input schema from the sample and edit required fields.
- A user can map at least 10 source fields to canonical target fields.
- The system generates JSONata and stores it with the draft.
- Preview produces canonical JSON for valid samples.
- Invalid output shows actionable validation errors.
- A mapping cannot be published without at least one valid fixture and one successful validation run.
- Published artifacts can be exported to the transformer service partner config layout.
- Every publish action records owner, reviewer, version, timestamp, validation run, and artifact checksums.

