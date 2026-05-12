# CanonBridge Transformer (MVP)

Node.js service: **Ajv** input/output validation + **JSONata** mapping, same rules as `mappings/scripts/validate-mapping-fixtures.mjs`.

- **HTTP**: `GET /health`, `POST /v1/transform` (body = raw envelope JSON), `GET /metrics` (Prometheus), `POST /v1/admin/reload`, `POST /v1/jsonata/check-batch`, `GET /docs` (Swagger UI)
- **Kafka** (optional): set `KAFKA_ENABLED=true` — consumes all `topics.raw` from loaded configs, produces canonical or DLQ payloads
- **Tests**: `npm test` — 40 unit + integration tests with Vitest

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
| **HTTP Auth** | | |
| `API_KEY` | (unset) | If set, requires `X-Api-Key` header on `/v1/*` endpoints |
| `CORS_ORIGINS` | (empty) | Comma-separated allowed origins; empty = allow all |
| **Kafka** | | |
| `KAFKA_ENABLED` | `false` | `true` to start consumer |
| `KAFKA_BROKERS` | `localhost:9092` | Comma-separated broker list |
| `KAFKA_GROUP_ID` | `canonbridge-transformer` | Consumer group ID |
| `KAFKA_FALLBACK_DLQ_TOPIC` | `canonbridge.dlq` | Fallback DLQ for invalid JSON |
| `KAFKA_CONNECT_RETRIES` | `10` | Max connection retry attempts |
| `KAFKA_CONNECT_RETRY_DELAY_MS` | `3000` | Initial retry delay (exponential backoff) |
| **Kafka SSL/SASL** | | |
| `KAFKA_SSL_ENABLED` | `false` | Enable SSL/TLS |
| `KAFKA_SASL_MECHANISM` | (unset) | `plain`, `scram-sha-256`, or `scram-sha-512` |
| `KAFKA_SASL_USERNAME` | (unset) | SASL username |
| `KAFKA_SASL_PASSWORD` | (unset) | SASL password |
| **Cache** | | |
| `REDIS_URL` | (unset) | Redis connection URL (e.g., `redis://localhost:6379`). If unset, uses in-memory cache |
| `REDIS_CACHE_TTL_SECONDS` | `3600` | TTL for cached compiled mappings in Redis |
| **Worker Pool** | | |
| `WORKER_POOL_ENABLED` | `false` | Enable worker thread pool for CPU-intensive JSONata evaluations |
| `WORKER_POOL_SIZE` | `0` | Worker pool size (0 = auto: CPU count - 1) |
| **Outbox Pattern** | | |
| `OUTBOX_ENABLED` | `false` | Enable outbox pattern for exactly-once delivery |
| `OUTBOX_DATABASE_URL` | (unset) | PostgreSQL connection string |
| `OUTBOX_POLL_INTERVAL_MS` | `1000` | Outbox relay poll interval |
| `OUTBOX_BATCH_SIZE` | `100` | Messages per batch in outbox relay |

## Production Features

### 🔒 Security & Authentication
- **API Key Auth**: Set `API_KEY` env variable to require `X-Api-Key` header
- **CORS Whitelist**: Configure `CORS_ORIGINS` for explicit origin control
- **Kafka SSL/SASL**: Full support for production Kafka clusters

### 🔄 Flexible Partner Resolution
- **Envelope-based** (default): `partnerId` and `eventType` in message root
- **Topic-based** (fallback): Parse from Kafka topic name when envelope fields missing
  - Format: `tenant-{id}.raw.{partnerId}.{eventType}`
  - Example: `tenant-001.raw.acme-marketplace.order-created`
  - Extracted values injected into envelope for validation
  - Backward compatible: envelope values always take precedence

### 📊 Observability
- **Prometheus Metrics** (`GET /metrics`):
  - `transform_requests_total{status, stage, partner, event_type}` — Request counter
  - `transform_duration_ms{partner, event_type}` — Latency histogram
  - `kafka_messages_total{result}` — Kafka message counter (ok/dlq/skip)
  - `transform_engine_cache_size` — Cache size gauge
  - `partner_registry_size` — Loaded partner count
- **Structured Logging**: All logs include `{ topic, partition, offset, partnerId, eventType, durationMs }`

### 🔄 Operational
- **Hot-Reload**: `POST /v1/admin/reload` — Reload partner configs without restart; protected by `X-Api-Key` when `API_KEY` is set
- **Graceful Shutdown**: SIGINT/SIGTERM handling with connection cleanup
- **Connection Retry**: Exponential backoff for Kafka connection failures
- **Manual Offset Commit**: Prevents data loss on crash (commit after DLQ write)
- **Redis Cache** (optional): Persistent cache across restarts, shared between instances
  - Set `REDIS_URL` to enable (e.g., `redis://localhost:6379`)
  - Falls back to in-memory cache if not configured
  - Stores raw schemas/mappings; compilation happens on cache miss
  - Configurable TTL via `REDIS_CACHE_TTL_SECONDS`
- **Schema Version Resolution**: Partner configs can use `version` or `schemaVersion`; envelopes with `schemaVersion` resolve the matching immutable mapping version

### ✅ Testing
- **40 Passing Tests**: Unit + integration tests with Vitest
- **Test Coverage**: Run `npm run test:coverage` for detailed report
- **CI/CD Ready**: All tests run in < 1 second

## Kubernetes Deployment

Production-ready manifests in `k8s/`:

```bash
kubectl apply -k k8s/
```

Includes:
- Deployment with resource limits and probes
- HorizontalPodAutoscaler (CPU-based)
- PodDisruptionBudget for high availability
- ServiceMonitor for Prometheus scraping
- ConfigMap and Secret for configuration

See `k8s/README.md` for details.

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
npm run dev        # Watch mode with tsx
npm test           # Run all tests
npm run test:watch # Watch mode for tests
npm run test:coverage # Generate coverage report
npm run typecheck  # TypeScript type checking
```

Uses `tsx` to run TypeScript directly.
