# Unit Tests

## Scope

Unit tests cover deterministic logic without Kafka, databases, or external services.

## Test Targets

- JSONata mapping helpers.
- Schema validation wrappers.
- Error classification.
- Mapping version resolution.
- Idempotency key generation.
- Masking utilities.
- Mapping Studio field inference and rule validation.

## Minimum Coverage

| Component | Target |
|-----------|--------|
| Mapping/schema logic | 90% |
| Error handling | 90% |
| Utility functions | 85% |
| UI reducers/forms | 80% |

## Required Cases

- Valid mapping transforms expected payload.
- Invalid mapping returns structured error.
- Missing mapping version never falls back silently.
- Required field validation fails with schema path.
- PII masking does not leak raw values.

## See Also

- [Mapping Studio Validation](../product/04-mapping-studio-validation-testing.md)
- [Transformer Node.js Guide](../implementation/TRANSFORMER_NODEJS_GUIDE.md)

