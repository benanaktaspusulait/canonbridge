# Mapping Versioning

## Versioning Strategy

Mapping versioning must follow a strict workflow to prevent silent failures.

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

## File Naming Convention

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

## Mapping Version Resolution

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

## Important Rule

```text
Never silently fall back to an older mapping version.
Always fail explicitly if requested version is not available.
```

## Deployment Strategy

### Scenario A — Mappings Packaged in Container Image

This is safer for MVP.

Rollback means:

```text
rollback to previous container image
```

Advantages:

```text
simple
auditable
same mapping version across all pods
easy rollback through deployment tooling
```

Disadvantages:

```text
slower than external config
requires redeployment
```

### Scenario B — Mappings in External Store

Examples:

```text
S3
Git-backed config store
database
configuration service
```

Rollback means:

```text
activate previous mapping version
```

Important rule:

```text
A mapping version should be immutable.
Do not overwrite an existing mapping version.
Activate/deactivate versions instead.
```

---

**See Also**:
- [Project Structure](./01-project-structure.md)
- [Configuration](./02-configuration.md)
- [Transformation Layer](../architecture/05-transformation-layer.md)
