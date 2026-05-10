# CI/CD Pipeline

## Purpose

The CI/CD pipeline validates code, schemas, mappings, fixtures, containers, and deployment manifests before release.

## Pipeline Stages

```text
lint -> unit tests -> integration tests -> mapping validation -> build image -> scan -> deploy staging -> smoke -> promote
```

## Required Checks

- TypeScript/Java compilation.
- Unit tests.
- Integration tests.
- Mapping fixture tests.
- JSON Schema compile checks.
- JSONata parse and preview checks.
- Container vulnerability scan.
- Kubernetes manifest validation.
- Migration dry run.

## Release Artifacts

- Container image digest.
- Mapping artifact package.
- Schema artifact package.
- Migration bundle.
- Test report.
- SBOM/security scan result.

## Promotion Rules

- Main branch deploys to staging automatically.
- Production deploy requires approval.
- Mapping publish requires Mapping Studio approval workflow.
- Rollback path must be known before production promotion.

## See Also

- [Deployment Checklist](./01-deployment-checklist.md)
- [Mapping Studio Validation](../product/04-mapping-studio-validation-testing.md)

