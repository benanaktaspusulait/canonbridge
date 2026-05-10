# Transformation Layer

## Core Responsibility

The Node.js + JSONata service is responsible for:

```text
consume raw JSON
identify partner/event/version
load mapping from cache
transform payload using JSONata
validate canonical output
publish canonical event
send invalid messages to DLQ
send temporary failures to retry
```

It should **not** contain core business decisions.

## Transformation Flow

```text
1. Kafka message is consumed from raw topic
2. Message envelope is parsed
3. Partner/event/version is resolved
4. Input schema is optionally validated
5. Inbound JSONata mapping is selected from cache
6. Payload is transformed into canonical format
7. Canonical output is validated with Ajv
8. Valid canonical event is produced to canonical topic
9. Original offset is committed only after successful produce
10. Invalid data goes to DLQ
11. Temporary failures go to retry topic
```

## Mapping Cache

Mappings should not be loaded or compiled per message.

### Wrong Approach

```text
For every message:
  read JSONata file
  compile expression
  evaluate expression
```

### Correct Approach

```text
On startup:
  load all mapping files
  compile JSONata expressions
  store compiled expressions in memory cache

At runtime:
  resolve mapping key
  get compiled expression from cache
  evaluate payload
```

### Mapping Cache Key

```text
partnerId + eventType + direction + schemaVersion
```

Example:

```text
companyA:OrderCreated:inbound:v1
companyA:OrderCreated:outbound:v1
companyB:OrderLineCreated:inbound:v2
```

## Schema Cache

Schemas should also be compiled and cached.

### Validator Cache Key

```text
eventType + validationStage + schemaVersion
```

Example:

```text
OrderLineCreated:canonical:v1
CompanyA:OrderLineCreated:input:v1
```

### Example TypeScript

```ts
const validatorCache = new Map<string, ValidateFunction>();

validatorCache.set(
  \"OrderLineCreated:canonical:v1\",
  ajv.compile(orderLineCreatedCanonicalSchema)
);

const validate = validatorCache.get(\"OrderLineCreated:canonical:v1\");

if (!validate) {
  throw new Error(\"Validator not found\");
}

const valid = validate(canonicalEvent);

if (!valid) {
  throw new ValidationError(\"CANONICAL_VALIDATION_FAILED\", validate.errors);
}
```

## JSONata Usage Guidelines

### Suitable JSONata Responsibilities

```text
field renaming
date format conversion
enum mapping
nested JSON flattening
nested JSON expansion
array mapping
default values
simple conditional mapping
partner-specific input/output shaping
```

### Avoid Putting These in JSONata

```text
core business decisions
payment rules
eligibility rules
fraud rules
workflow state transitions
database-dependent logic
cross-event dependency handling
complex domain validation
```

### Key Principle

```text
JSONata is a transformation engine, not a business rule engine.
```

## Mapping Versioning

### Mapping Version Lifecycle

```text
1. Mapping created and tested locally
2. Mapping added to Git with version tag
3. CI validates mapping against fixtures
4. Mapping packaged with service image
5. Service deployed with new mapping version
6. Mapping version is immutable in production
7. If rollback needed, deploy previous service image
```

### File Naming Convention

```text
partners/
  company-a/
    order-created/
      inbound.v1.jsonata
      inbound.v2.jsonata
      inbound.v3.jsonata
      input.v1.schema.json
      input.v2.schema.json
      canonical.v1.schema.json
      fixtures/
        v1/
          input-1.json
          expected-1.json
        v2/
          input-1.json
          expected-1.json
```

### Mapping Version Resolution

Message envelope specifies:

```json
{
  \"schemaVersion\": \"v2\",
  \"mappingVersion\": \"v2\"
}
```

Service resolves:

```text
partners/company-a/order-created/inbound.v2.jsonata
```

If mapping version is not found:

```text
DLQ with error: MAPPING_VERSION_NOT_FOUND
```

### Important Rule

```text
Never silently fall back to an older mapping version.
Always fail explicitly if requested version is not available.
```

## Mapping Fixture Tests

Every mapping should have tests.

### Recommended Structure

```text
partners/company-a/order-created/
  inbound.v1.jsonata
  input.v1.schema.json
  canonical.v1.schema.json
  fixtures/
    v1/
      input-1.json
      expected-1.json
      input-2.json
      expected-2.json
```

### CI Validation

CI should verify:

```text
input sample validates against input schema
JSONata transformation succeeds
output matches expected canonical JSON
output validates against canonical schema
```

## Dry-Run Transform Capability

The system should support a dry-run transform mode for debugging mappings.

### Admin Endpoint Example

```text
POST /admin/transform/test
```

Request:

```json
{
  \"partnerId\": \"companyA\",
  \"eventType\": \"OrderLineCreated\",
  \"schemaVersion\": \"v1\",
  \"direction\": \"inbound\",
  \"rawMessage\": {
    \"eventId\": \"evt-123\",
    \"payload\": {
      \"order_id\": \"ORD-123\",
      \"line_id\": \"LINE-1\"
    }
  }
}
```

Response:

```json
{
  \"success\": false,
  \"canonicalOutput\": {
    \"eventId\": \"evt-123\",
    \"eventType\": \"OrderLineCreated\"
  },
  \"validationErrors\": [
    {
      \"path\": \"/payload/orderId\",
      \"message\": \"is required\"
    }
  ],
  \"durationMs\": 4
}
```

### Important Rule

Dry-run must not:

```text
commit Kafka offsets
produce Kafka messages
write to database
modify DLQ/retry state
```

It is read-only and diagnostic.

---

## Next Steps

1. Review [Business Layer](./06-business-layer.md)
2. Study [Error Handling](./07-error-handling.md)
3. Understand [Ordering and Dependencies](./08-ordering-dependencies.md)

---

**See Also**:
- [Message Design](./04-message-design.md)
- [Technology Decisions](./03-technology-decisions.md)
