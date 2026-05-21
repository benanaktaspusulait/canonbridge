# ADR-011: Production Auth and Local Compatibility Boundaries

**Status**: Accepted

## Context

CanonBridge needs a low-friction local demo path and a fail-closed production security posture. The same service binary runs in local Docker, staging, and production-like environments, so insecure local defaults must be explicitly blocked outside development.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| Keep local login and API keys available everywhere | Simple demos | High production risk and ambiguous operator expectations |
| Require OIDC in every environment | Strong consistency | Slows local development and customer demos |
| Environment-gated compatibility | Supports local workflows while failing closed in production | Requires startup validation and clear config docs |

## Decision

Use environment-gated compatibility.

- Production fails startup when insecure defaults remain enabled.
- OIDC is required by default in production.
- Local login, local JWT, bearer API-key compatibility, and public docs are opt-in and disabled for production.
- Docker Compose passes through the environment variables required for OIDC, API auth, CORS, JWT, docs, and credential encryption.

## Consequences

- Local demos remain fast.
- Production deployments must provide real IdP metadata, client secrets, CORS origins, and secret-manager-backed credentials.
- The service can reject unsafe deployments before it starts accepting traffic.

## Rejected Approaches

- Relying on README warnings without runtime validation.
- Shipping separate local and production service binaries.
