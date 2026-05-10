# Mapping Studio UX Flow

## Navigation Model

Mapping Studio should be a first-class area in the management UI, not hidden under generic settings.

Recommended navigation:

```text
Dashboard
Partners
Mapping Studio
Schemas
Validation Runs
Published Versions
DLQ
Settings
```

## Main User Flow

```text
Partner/Event Setup
    -> Sample JSON
    -> JSON Structure
    -> Input Schema
    -> Canonical Mapping
    -> Preview
    -> Fixtures
    -> Review
    -> Publish
```

Each step should be resumable. Users should be able to leave a draft and return later without losing context.

## Screen 1: Draft Setup

Purpose: create the working container for a partner event mapping.

Fields:

- Partner ID
- Partner name
- Event type
- Source system description
- Canonical event type
- Canonical schema version
- Owner
- Reviewer group
- Change reason

Primary actions:

- Create draft
- Clone from published version
- Import existing mapping package

Validation:

- Partner ID must be unique within tenant.
- Event type must be unique within partner unless creating a new version.
- Canonical event type must exist.

## Screen 2: Sample JSON Intake

Purpose: collect representative examples before schema and mapping work starts.

Input modes:

- Paste JSON
- Upload `.json`
- Upload multiple `.json` files
- Import from DLQ event
- Import from raw Kafka sample in non-production environments

UI requirements:

- Syntax validation before save.
- Pretty-printed preview.
- File name, sample name, tag, and notes.
- Sample tag selector: `valid`, `invalid`, `edge_case`, `production_failure`.
- Sensitive field detection warning for likely PII fields.

Error states:

- Invalid JSON syntax.
- Payload exceeds configured limit.
- Empty payload.
- Top-level array not supported for MVP unless explicitly enabled.

## Screen 3: JSON Structure Explorer

Purpose: help users understand the payload without reading raw JSON line by line.

Layout:

```text
Left: JSON tree
Right: Field details
Bottom: Sample values and occurrence stats
```

Field tree should show:

- Field name
- Full path
- Inferred type
- Required/optional suggestion
- Array indicator
- Nullability
- Sample value preview
- Conflict indicator when samples disagree

Field details should show:

- JSON Pointer path, for example `/customer/email`
- JSONPath-style path, for example `$.customer.email`
- Observed types
- Observed values
- Occurrence count across samples
- PII warning
- User label
- Notes

Required interactions:

- Expand/collapse object nodes.
- Search by field name or value.
- Filter by required, optional, type conflict, PII warning, unmapped.
- Select fields for schema.
- Mark a field as ignored with reason.

## Screen 4: Input Schema Builder

Purpose: convert discovered partner payload structure into a controlled input contract.

Layout:

```text
Left: selected source field list
Center: constraint editor
Right: generated JSON Schema preview
```

Supported controls:

- Required toggle.
- Type selector.
- Format selector for strings.
- Enum selector from observed values.
- Min/max constraints.
- Array item schema editor.
- Object property editor.
- Additional properties toggle.
- Nullable toggle.

Schema preview:

- Read-only by default.
- Advanced code edit mode available to users with permission.
- Live Ajv validation against all samples.

Warnings:

- Field appears in only some valid samples.
- Field has multiple observed types.
- Field selected as required but missing from a valid sample.
- String looks like date but no format selected.
- Value may contain PII.

## Screen 5: Canonical Mapping Builder

Purpose: define how partner fields become canonical business event fields.

Recommended layout:

```text
Source fields            Mapping rule editor          Canonical fields
JSON tree/list      ->   transform/defaults      ->   target schema tree
```

Source field panel:

- Searchable.
- Filter by unmapped/mapped/ignored/conflict.
- Shows sample values and source path.

Canonical field panel:

- Shows target schema path.
- Shows required fields prominently.
- Shows field description and expected type.
- Shows whether field is already mapped.

Rule editor:

- Direct mapping.
- Type conversion.
- Constant value.
- Default value.
- Conditional mapping.
- Array mapping.
- Concatenation.
- Date/time formatting.
- Lookup table placeholder.
- Manual JSONata expression.

Required interactions:

- Click source field, click target field, choose mapping type.
- Edit generated rule.
- Delete mapping rule.
- Mark target field intentionally unmapped with reason.
- Duplicate rule for similar fields.
- View generated JSONata.

## Screen 6: JSONata Code View

Purpose: let advanced users inspect and edit the generated transformation.

Capabilities:

- Syntax highlighting.
- JSONata parse validation.
- Diff against generated rule model.
- Read-only generated mode by default.
- Manual override mode with warning.
- Formatting.
- Find references to source paths.

Rules:

- Manual code changes must be tested before save.
- If manual mode is enabled, visual rule editing should show that the mapping has custom code.
- The system should preserve comments only if supported by the chosen artifact format.

## Screen 7: Transform Preview

Purpose: prove that the mapping produces valid canonical output.

Layout:

```text
Sample selector
Source JSON | Canonical output | Validation/errors
```

Preview should show:

- Transformed canonical JSON.
- JSONata execution errors.
- Input schema validation errors.
- Canonical schema validation errors.
- Missing required target fields.
- Type conversion warnings.
- Execution duration.

Interactions:

- Switch between samples.
- Run all samples.
- Copy output.
- Add transformed output as expected fixture.
- Jump from error to mapping rule.
- Jump from error to target schema field.

## Screen 8: Fixture Manager

Purpose: turn samples and expected outputs into repeatable tests.

Fixture types:

- Valid input should transform and validate.
- Invalid input should fail input schema validation.
- Transformation error should fail with known error code.
- Canonical validation failure should fail with known schema path.
- Edge case should produce expected canonical output.

Fixture table columns:

- Name
- Type
- Sample tag
- Last run status
- Expected result
- Last updated by
- Last updated at

Minimum publish gate:

- At least one valid fixture.
- Every required canonical field covered by at least one valid fixture.
- Every fixture run is passing or intentionally waived by a reviewer.

## Screen 9: Review and Publish

Purpose: make production changes controlled and auditable.

Review summary:

- Partner ID
- Event type
- Draft version
- Target mapping version
- Canonical schema version
- Changed source fields
- Changed target fields
- Added/removed required fields
- Validation run status
- Fixture coverage
- Risk level

Reviewer actions:

- Approve
- Reject with comment
- Request changes
- Publish now
- Schedule activation

Publish result:

- Immutable mapping version created.
- Artifact checksums generated.
- Activation state recorded.
- Audit event stored.
- Export package generated.

## Empty States

- No partners: show create partner action.
- No samples: show paste/upload actions.
- No canonical schemas: show schema setup dependency.
- No mappings: show source and target panels with empty mapping list.
- No validation runs: show run validation action.

## Error States

- Invalid JSON upload.
- Conflicting inferred types.
- Mapping target already mapped.
- Required canonical field unmapped.
- JSONata syntax error.
- Transform timeout.
- Canonical validation failure.
- Publish blocked by failed validation.
- Publish blocked by missing approval.

## Keyboard and Accessibility

- Tree navigation supports keyboard expand/collapse.
- Mapping rules are editable without drag-and-drop.
- Error messages identify the field and required action.
- Color is not the only signal for status.
- Long paths can be copied.
- Large JSON payloads remain scrollable without locking the full page.

## UX Principles

- Show raw JSON when needed, but do not force users to work only in raw JSON.
- Always connect an error to a source path, target path, mapping rule, or schema rule.
- Make generated artifacts visible and exportable.
- Make publish feel deliberate.
- Keep runtime and design-time concepts distinct: drafts are editable, published versions are immutable.

