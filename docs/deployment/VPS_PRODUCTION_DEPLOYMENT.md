# CanonBridge VPS Production Deployment

This runbook deploys CanonBridge on a single rented Linux server with Docker Compose, Caddy-managed TLS, and the public domain `canonbridge.io`.

## Public Endpoints

| Host | Service |
| --- | --- |
| `https://canonbridge.io` | Marketing website |
| `https://www.canonbridge.io` | Marketing website |
| `https://studio.canonbridge.io` | Mapping Studio UI |
| `https://api.canonbridge.io` | Mapping Studio API |
| `https://hooks.canonbridge.io` | Webhook receiver |

Grafana, Prometheus, Kafka UI, Postgres, Redis, Kafka, and mock connectors are not exposed publicly. Grafana and Prometheus bind to `127.0.0.1` only.

## Server Baseline

Use a fresh Ubuntu LTS VPS with at least:

- 4 vCPU
- 8 GB RAM
- 80 GB SSD
- Docker Engine and Docker Compose plugin
- Firewall allowing only `22/tcp`, `80/tcp`, and `443/tcp`

Recommended DNS records:

```text
A  canonbridge.io         <SERVER_PUBLIC_IP>
A  www.canonbridge.io     <SERVER_PUBLIC_IP>
A  studio.canonbridge.io  <SERVER_PUBLIC_IP>
A  api.canonbridge.io     <SERVER_PUBLIC_IP>
A  hooks.canonbridge.io   <SERVER_PUBLIC_IP>
```

Wait until DNS resolves before starting Caddy, otherwise Let's Encrypt issuance will retry until the records are correct.

## First Deploy

Clone the repository on the server:

```bash
git clone <repo-url> /opt/canonbridge
cd /opt/canonbridge
```

Create production secrets:

```bash
cp .env.production.example .env.production
openssl rand -base64 32
openssl rand -base64 48
openssl rand -hex 32
```

Edit `.env.production` and replace every `REPLACE_WITH_*` value. Important fields:

- `ACME_EMAIL`: email used by Let's Encrypt.
- `POSTGRES_PASSWORD`: long random password.
- `CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY`: base64 value from `openssl rand -base64 32`.
- `CANONBRIDGE_API_KEYS`: comma-separated production API keys, no `dev-api-key`.
- `OIDC_SERVER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`: production identity provider values.
- `GF_SECURITY_ADMIN_PASSWORD`: Grafana admin password.

Validate before starting:

```bash
node scripts/validate-production-env.mjs --env-file .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml config
```

Build and start:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Follow startup:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f caddy mapping-studio-api
```

## Smoke Tests

```bash
curl -I https://canonbridge.io/
curl -I https://studio.canonbridge.io/
curl -i https://api.canonbridge.io/health
curl -i https://hooks.canonbridge.io/q/health/live
```

Expected results:

- Website and Studio return `200`.
- API health returns `status: UP`.
- Webhook health returns `status: UP`.
- `https://api.canonbridge.io/openapi` returns `404` in production.

Check the ten built-in system templates through the API after authenticating with OIDC or a production `X-API-Key`:

```bash
curl -s \
  -H "X-API-Key: <production-api-key>" \
  -H "X-Tenant-Id: tenant-acme" \
  https://api.canonbridge.io/api/external-systems
```

## Operations

Use the production compose file for all server operations:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Access internal dashboards with SSH tunnels:

```bash
ssh -L 3000:127.0.0.1:3000 -L 9090:127.0.0.1:9090 user@canonbridge.io
```

Then open:

- Grafana: `http://127.0.0.1:3000`
- Prometheus: `http://127.0.0.1:9090`

Kafka UI is opt-in:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml --profile ops up -d kafka-ui
ssh -L 8080:127.0.0.1:8080 user@canonbridge.io
```

## Backup

Database backup:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > canonbridge-$(date +%F).sql
```

Persist these Docker volumes in server snapshots or external backups:

- `postgres-data`
- `caddy-data`
- `grafana-data`
- `prometheus-data`
- `kafka-data`
- `zookeeper-data`
- `redis-data`

## Auth Notes

The production template is intentionally strict:

- OIDC is required.
- local email/password login is disabled.
- local JWT fallback is disabled.
- public Swagger/OpenAPI docs are disabled.

For a temporary private pilot without an identity provider, use a separate staging env and explicitly set `CANONBRIDGE_PRODUCTION_ALLOWS_LOCAL_LOGIN=true`, `CANONBRIDGE_LOCAL_LOGIN_ENABLED=true`, and `CANONBRIDGE_LOCAL_JWT_ENABLED=true`. Do not use that mode for public production.
