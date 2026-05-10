# Mapping Studio Validation and Testing

## Validation Goals

Mapping Studio must prevent unsafe mapping packages from reaching the transformer service. Validation should catch syntax errors, schema conflicts, unmapped required fields, broken JSONata, fixture failures, and risky governance changes before publish.

## Validation Pipeline

```text
Sample JSON syntax
    -> Field inventory inference
    -> Input schema validation
    -> Mapping rule validation
    -> JSONata generation/lint
    -> Transform preview
    -> Canonical schema validation
    -> Fixture assertions
    -> Publish gate
```

## Stage 1: Sample JSON Validation

Checks:

- Payload is valid JSON.
- Payload size is within tenant limit.
- Top-level shape is supported.
- Sample is tagged.
- Duplicate sample hash is detected.
- Potential PII fields are flagged.

Failure examples:

- Invalid JSON syntax.
- Empty object.
- Unsupported top-level array in MVP.
- File exceeds max size.

## Stage 2: Field Inventory Inference

Inference should produce:

- JSON Pointer path.
- JSONPath-style path.
- Observed primitive type.
- Array context.
- Nullability.
- Occurrence count.
- Sample values.
- Type conflicts.
- PII hints.

Conflict rules:

- `string` plus `null` becomes nullable string.
- `integer` plus `number` becomes number unless user pins integer.
- Multiple primitive types require user resolution.
- Object/array conflicts are blocking.
- Missing field in valid samples means optional unless user forces required.

## Stage 3: Input Schema Validation

Checks:

- Generated JSON Schema is syntactically valid.
- Ajv can compile the schema.
- Every valid sample passes input schema unless explicitly marked as invalid.
- Every invalid sample fails for an expected reason.
- Required fields are present in all valid samples.
- `additionalProperties` setting matches governance rules.

Warnings:

- Required field inferred from only one sample.
- Enum inferred from too few values.
- Date-like string has no date format.
- Numeric-looking string may need conversion.

## Stage 4: Mapping Rule Validation

Checks:

- Source path exists in the field inventory unless the rule is constant-only.
- Target path exists in canonical schema.
- Required target fields are mapped or explicitly waived.
- Source and target types are compatible or conversion is configured.
- One target path has only one active rule.
- Array mappings define item-level behavior.
- Ignored source fields have a reason.

Blocking failures:

- Required canonical field unmapped.
- Target path not found.
- Duplicate target mapping.
- Invalid conversion.
- Rule references ignored source field.

## Stage 5: JSONata Validation

Checks:

- Generated JSONata parses.
- Manual JSONata parses.
- JSONata does not use blocked functions.
- Expression execution stays within timeout.
- Expression output is valid JSON-compatible data.
- Expression does not read unapproved external context.

Blocked behavior:

- Network access.
- File access.
- Runtime-only secrets.
- Non-deterministic functions unless explicitly approved.

## Stage 6: Transform Preview Validation

Checks for each sample:

- Input validation result matches sample tag.
- Transform execution completes.
- Output is an object.
- Output contains required envelope/domain fields.
- Canonical validation result matches expectation.
- Errors include source path, target path, rule ID, and schema path when possible.

Preview should report:

- `passed`
- `failed`
- `warning`
- `skipped`

## Stage 7: Fixture Assertions

Fixture types:

| Fixture Type | Expected Result |
|--------------|-----------------|
| `valid` | Input validates, transform succeeds, canonical output validates |
| `invalid_input` | Input schema validation fails with expected path |
| `transform_error` | JSONata or mapping execution fails with expected code |
| `invalid_canonical` | Canonical validation fails with expected path |
| `edge_case` | Output equals stored expected canonical JSON |

Minimum fixture coverage:

- At least one valid fixture.
- At least one fixture covering every required canonical field.
- At least one invalid fixture for required input field missing.
- At least one edge-case fixture for arrays when arrays exist.

## Publish Gates

A draft can be submitted for review only when:

- At least one sample exists.
- Input schema compiles with Ajv.
- Mapping JSONata parses.
- All required canonical fields are mapped or waived.
- At least one validation run exists.
- Latest validation run has no blocking errors.
- Fixture minimum coverage is met.

A draft can be published only when:

- It is approved.
- The approving user is not the only author, unless tenant policy allows self-approval.
- Latest validation run is still valid for the current draft checksum.
- Artifact export has been generated.
- Artifact checksums are stored.

## Test Strategy

### Unit Tests

Cover:

- JSON parser error formatting.
- Field inventory inference.
- Type conflict detection.
- JSON Schema generation.
- Mapping rule validation.
- JSONata generation from rules.
- Permission checks.
- State transition rules.

### Integration Tests

Cover:

- Upload sample -> infer fields -> generate schema.
- Create mapping rules -> generate JSONata -> preview.
- Full validation run with valid and invalid fixtures.
- Review and publish flow.
- Export package layout.
- Rollback activation.

### End-to-End Tests

Critical user journeys:

- Create new partner event from pasted JSON and publish v1.
- Clone published version, add a field, validate, approve, publish v2.
- Upload invalid JSON and see actionable error.
- Map source field to wrong target type and see validation failure.
- Manual JSONata override requires permission and successful validation.
- Import DLQ event as sample and create a fixed draft.

### Contract Tests

Contract boundaries:

- Management API to frontend.
- Management API to artifact exporter.
- Published artifacts to transformer service.
- Canonical schema registry to Mapping Studio.
- Auth/RBAC provider to management API.

## Observability

Metrics:

- `mapping_draft_created_total`
- `mapping_sample_uploaded_total`
- `mapping_validation_run_total`
- `mapping_validation_fail_total`
- `mapping_publish_total`
- `mapping_publish_blocked_total`
- `mapping_preview_duration_ms`
- `mapping_jsonata_generation_duration_ms`

Logs:

- Draft ID and tenant ID.
- Validation run ID.
- Error code and schema path.
- Artifact checksum.
- Actor user ID.
- Correlation ID.

Never log raw sample payloads or unmasked PII values.

## Quality Checklist

- [ ] Invalid JSON upload is blocked.
- [ ] Field inventory is generated from sample payloads.
- [ ] Required/optional schema rules are editable.
- [ ] Input schema compiles with Ajv.
- [ ] Canonical schema is loaded and displayed.
- [ ] Direct mapping rule generates JSONata.
- [ ] Manual JSONata override is permission-gated.
- [ ] Preview shows canonical output and validation errors.
- [ ] Fixtures are saved and rerunnable.
- [ ] Publish is blocked by failed validation.
- [ ] Published artifact layout matches transformer expectations.
- [ ] Audit events are written for every state-changing action.

