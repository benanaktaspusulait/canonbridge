# Security

## Purpose

Security controls protect tenant data, partner payloads, mapping configuration, credentials, and production publish workflows.

## Baseline Controls

- Enforce tenant isolation on every API and storage operation.
- Require TLS for all service-to-service communication.
- Store secrets in a managed secret store, not environment files committed to Git.
- Encrypt sample payloads, DLQ payloads, and exported artifacts at rest.
- Use RBAC for Mapping Studio draft, review, publish, and rollback actions.
- Audit every mapping change, approval, publish, activation, and rollback.

## Mapping Studio Permissions

| Permission | Purpose |
|------------|---------|
| `mapping:draft:create` | Create draft integrations |
| `mapping:draft:update` | Edit samples, schema, and mapping rules |
| `mapping:draft:validate` | Run previews and validation |
| `mapping:review:approve` | Approve drafts |
| `mapping:version:publish` | Publish immutable versions |
| `mapping:version:rollback` | Roll back active version |
| `mapping:audit:read` | Read audit history |

## Payload Safety

- Never log full payloads.
- Mask PII in logs and UI previews by policy.
- Restrict access to raw samples and DLQ payloads.
- Keep payload retention configurable per tenant.
- Record who viewed or exported sensitive payloads.

## JSONata Safety

- Treat manual JSONata as untrusted user input.
- Apply execution timeouts.
- Block file, network, and secret access.
- Require elevated permission for manual override.
- Require validation and review before publish.

## See Also

- [SaaS Requirements](../product/saas-requirements.md)
- [Logging and Masking](./08-logging-masking.md)
- [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md)

