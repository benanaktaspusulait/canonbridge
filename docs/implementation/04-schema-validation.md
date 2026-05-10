# Schema Validation

## Purpose

Schema validation protects the transformer and business services from malformed partner payloads and invalid canonical events. ETL Solutions uses Ajv-compatible JSON Schema for input and canonical validation.

## Validation Stages

| Stage | Required | Purpose | Failure Handling |
|-------|----------|---------|------------------|
| JSON parse | Yes | Ensure payload is valid JSON | DLQ |
| Envelope validation | Yes | Ensure metadata exists | DLQ |
| Partner input schema | Recommended | Detect partner contract drift early | DLQ or warning by policy |
| Canonical schema | Yes | Protect business service contract | DLQ |
| Output schema | Optional | Validate outbound partner payloads | DLQ |

## Implementation Rules

- Compile schemas at startup or first use and cache compiled validators.
- Key schema cache by `tenantId`, `partnerId`, `eventType`, `schemaKind`, and `schemaVersion`.
- Treat canonical validation failure as a blocking error.
- Include `schemaPath`, `dataPath`, `eventType`, `mappingVersion`, and `correlationId` in validation errors.
- Never silently fall back to older schema versions.
- Keep schema evolution backward-compatible unless a new version is explicitly created.

## Error Contract

```json
{
  "stage": "canonical_schema",
  "code": "required",
  "message": "customer.email is required",
  "schemaPath": "#/properties/customer/required",
  "dataPath": "/customer/email",
  "partnerId": "acme",
  "eventType": "OrderCreated",
  "mappingVersion": "v1",
  "correlationId": "corr-123"
}
```

## Publish Gates

- Input schema compiles with Ajv.
- Canonical schema compiles with Ajv.
- Every valid fixture passes input and canonical validation.
- Invalid fixtures fail for expected paths.
- Required canonical fields are mapped or explicitly waived by reviewer.

## See Also

- [Mapping Studio Validation](../product/04-mapping-studio-validation-testing.md)
- [Mapping Versioning](./03-mapping-versioning.md)
- [Message Design](../architecture/04-message-design.md)

