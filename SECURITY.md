# Security Policy

CanonBridge handles integration metadata, partner credentials, and operational event traces. Treat security issues as private until triaged.

## Reporting

Email security reports to `security@canonbridge.io` with:

- Affected component and version or commit.
- Reproduction steps.
- Impact and exploitability.
- Any logs, payloads, or screenshots that help verify the issue.

Do not open public issues for vulnerabilities.

## Supported Surfaces

- `services/mapping-studio-api`
- `services/transformer`
- `services/webhook-receiver`
- `services/canonbridge-mock`
- `mapping-studio-ui`
- `website`
- Docker, Kubernetes, and monitoring assets under `infrastructure/`

## Baseline Expectations

- Production deployments must use OIDC and real secret-manager-backed credentials.
- Local API keys, local JWTs, demo login, and public docs must remain disabled in production.
- Credential values must not be committed to this repository.
- Vulnerability fixes should include a regression test or explicit verification note.
