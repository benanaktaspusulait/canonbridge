# CanonBridge Transformer (MVP)

Node.js service: **Ajv** input/output validation + **JSONata** mapping, same rules as `mappings/scripts/validate-mapping-fixtures.mjs`.

- **HTTP**: `GET /health`, `POST /v1/transform` (body = raw envelope JSON)
- **Kafka** (optional): set `KAFKA_ENABLED=true` — consumes all `topics.raw` from loaded configs, produces canonical or DLQ payloads

## Prerequisites

- Node 20+
- `mappings/` repo path (default: `../../mappings` relative to compiled `dist/`)

## Local run

```bash
cd services/transformer
npm install
npm run build
npm start
```

Default port **8080**. Override with `PORT`.

## Demo: HTTP transform

From **repo root**:

```bash
curl -sS -X POST http://localhost:8080/v1/transform \
  -H 'Content-Type: application/json' \
  --data-binary @mappings/partners/acme-marketplace/order-created/fixtures/valid-order.input.json
```

From **`services/transformer/`**, use `../../mappings/...` in the `--data-binary` path.

Expect `200` and a JSON body `{ "canonical": { ... } }`.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `MAPPINGS_ROOT` | auto (`../../../mappings` from `dist`) | Root folder containing `partners/` |
| `PORT` | `8080` | HTTP port |
| `LOG_LEVEL` | `info` | Pino log level |
| `KAFKA_ENABLED` | `false` | `true` to start consumer |
| `KAFKA_BROKERS` | `localhost:9092` | Comma-separated brokers |
| `KAFKA_GROUP_ID` | `canonbridge-transformer` | Consumer group |

## Docker Compose (HTTP + Redpanda)

```bash
cd services/transformer
docker compose up --build
```

- Transformer: `http://localhost:8080`
- Kafka API (Redpanda): `localhost:9092` inside the compose network; from host use mapped port if needed.

Set `MAPPINGS_ROOT=/mappings` in compose; repo `mappings/` is mounted read-only.

For Kafka, set `KAFKA_ENABLED=true` and `KAFKA_BROKERS=redpanda:9092` (see `docker-compose.yml`).

## Develop

```bash
npm run dev
```

Uses `tsx` to run TypeScript directly.
