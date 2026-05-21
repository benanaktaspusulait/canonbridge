# API Documentation

**Status**: Active  
**Last updated**: 2026-05-21

The Mapping Studio API publishes OpenAPI from the running Quarkus service:

- OpenAPI JSON/YAML: `/openapi`
- Swagger UI: `/swagger-ui` when explicitly enabled

Production guardrails keep public API docs disabled unless `CANONBRIDGE_PUBLIC_DOCS_ENABLED=true` is intentionally set outside production. In production, docs should be exposed only through an authenticated internal developer portal or an exported OpenAPI artifact.

## Local Usage

```bash
curl http://localhost:8082/openapi
```

For a static viewer, point Redoc, Scalar, or another OpenAPI renderer at an exported `/openapi` document generated from a trusted build.

## Ownership

- Resource annotations live in `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/resource`.
- Security and public-doc behavior is enforced by `ApiAuthenticationFilter` and `SecurityConfigurationValidator`.
- Endpoint behavior changes must update resource annotations, service README examples, and tests.
