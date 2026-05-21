# Production Environment And Secrets

**Status**: Active  
**Last updated**: 2026-05-21

This closes the production IdP/secrets setup as a deployable contract. Real values still come from the target secret manager, but the required keys and validation gate are now explicit.

## Required Secret Sources

Use your production secret manager to render:

- `infrastructure/k8s/mapping-studio-api-secret.example.yaml`
- `.env` for Docker Compose or one-off release validation

Never commit rendered secret values.

## Validation

Validate a production `.env` before release:

```bash
node scripts/validate-production-env.mjs --env-file .env.production
```

The validator fails when:

- `ENVIRONMENT` is not `production`.
- OIDC is disabled or missing issuer/client/secret values.
- Local login, local JWT, bearer API-key compatibility, or public docs are enabled.
- Placeholder values such as `CHANGE_ME`, `REPLACE_WITH`, or `example.com` remain.
- The credential encryption key is not valid base64 for exactly 32 bytes.

## OIDC Minimums

Required:

- `OIDC_ENABLED=true`
- `OIDC_SERVER_URL`
- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `CORS_ALLOWED_ORIGINS`

Production compatibility flags:

- `CANONBRIDGE_LOCAL_LOGIN_ENABLED=false`
- `CANONBRIDGE_LOCAL_JWT_ENABLED=false`
- `CANONBRIDGE_BEARER_API_KEY_ENABLED=false`
- `CANONBRIDGE_PUBLIC_DOCS_ENABLED=false`

## Lead Capture

For the website, set `NEXT_PUBLIC_LEAD_ENDPOINT=/api/leads` at build time. Caddy routes that same-origin path to `lead-capture-edge`, where the private CRM/Supabase/webhook URL and auth token live as server-side secrets:

- `LEAD_ALLOWED_ORIGINS`
- `LEAD_UPSTREAM_URL`
- `LEAD_UPSTREAM_AUTH_HEADER`
- `LEAD_UPSTREAM_AUTH_VALUE`
- `TURNSTILE_SECRET_KEY`

Do not expose the upstream lead destination as a `NEXT_PUBLIC_*` variable.
