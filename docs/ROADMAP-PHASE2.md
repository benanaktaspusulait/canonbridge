# CanonBridge - Phase 2 Roadmap

> Phase 1 tamamlandı: REST API proxy, wizard, observability, versioning, webhook, CI/CD, multi-tenant.
> Phase 2: Kalan source type'lar, production hardening, ve platform olgunlaştırma.

---

## Phase 9: Kafka Source Type (Wizard Integration)

Transformer service zaten Kafka'dan okuyor. Eksik olan: wizard'dan Kafka mapping oluşturulduğunda transformer'ın bunu kullanması.

- [x] **9.1** Wizard'da Kafka mapping oluşturulduğunda `source_config`'e topic/consumerGroup kaydet
- [x] **9.2** Transformer service: mapping_drafts tablosundan mapping config'i oku
- [x] **9.3** Transformer service: partner registry'yi DB'den yükle (Redis cache ile)
- [x] **9.4** Test: Kafka topic/sample → transformer mapping → canonical output
- [x] **9.5** Frontend: Kafka mapping test UI (topic/sample ve canonical output)

---

## Phase 10: SOAP Source Type

- [x] **10.1** Mock SOAP service endpoint'i doğrula (FastCargo WSDL)
- [x] **10.2** Backend: SOAP request builder (XML envelope oluşturma)
- [x] **10.3** Backend: SOAP response parser (XML → JSON dönüşümü)
- [x] **10.4** Proxy endpoint'te SOAP protocol desteği
- [x] **10.5** Wizard'da SOAP config (WSDL URL, operation, auth)
- [x] **10.6** Test: SOAP proxy uçtan uca

---

## Phase 11: GraphQL Source Type

- [x] **11.1** Mock GraphQL service endpoint'i doğrula (ProfileHub)
- [x] **11.2** Backend: GraphQL query execution (query + variables → response)
- [x] **11.3** Proxy endpoint'te GraphQL protocol desteği
- [x] **11.4** Wizard'da GraphQL config (query editor, variables)
- [x] **11.5** Test: GraphQL proxy uçtan uca

---

## Phase 12: Production Hardening

- [x] **12.1** Rate limiting per tenant (Redis-based sliding window)
  - Zaten mevcut: RateLimitFilter + RateLimitService
  - Config: authenticated vs unauthenticated limits
  - Response: 429 Too Many Requests
- [x] **12.2** Circuit breaker for external API calls
  - Failure threshold: 5 consecutive failures → OPEN
  - Half-open after 30s → test with 1 request
  - Reset after success
  - Per-URL circuit (each external API has its own breaker)
- [x] **12.3** Request timeout configuration per mapping
  - Default: 5s (source_config.timeoutMs)
  - Configurable per mapping in source_config
- [x] **8.3 (Phase 1)** Request size limits (1MB)
- [x] **12.4** Graceful shutdown
  - Drain in-flight requests (30s grace period)
  - Stop accepting new requests
  - Complete pending Kafka commits
- [x] **12.5** Connection pool tuning
  - PostgreSQL: min=5, max=20, idle-timeout=5m
  - Redis: max=10
  - HTTP client: max-connections=50 per host

---

## Phase 13: DLQ Management UI

- [x] **13.1-13.5** DLQ Management — Zaten implement edilmiş (DlqResource, DlqComponent, redrive)

---

## Phase 14: Dashboard & Monitoring UI Improvements

- [x] **14.1** Dashboard gerçek metriklerle doluyor (execution logs, mapping count, partner count)
- [x] **14.2** Monitoring sayfasında Grafana iframe embed
- [x] **14.3** Per-mapping health detail sayfası
  - Execution history trend
  - Average latency trend
  - Last 50 executions table
- [x] **14.4** Real-time notifications (WebSocket)
  - Alert fired → toast notification
  - Mapping published → notification

---

## Phase 15: Advanced Mapping Features

- [x] **15.1** Mapping export (GET /{id}/export)
- [x] **15.2** Mapping clone (POST /{id}/clone + UI butonu)
- [x] **15.3** Mapping diff (compare two versions)
- [x] **15.4** Mapping templates
- [x] **15.5** Bulk operations

---

## Phase 16: Security Hardening

- [x] **16.1** JWT authentication (OIDC integration)
  - Keycloak/Auth0 integration
  - Token refresh
  - Role-based access (admin, editor, viewer)
- [x] **16.2** Audit log UI
  - Who did what, when
  - Filter by user, action, resource
- [x] **16.3** Secret management
  - Encrypt credentials at rest (AES-256)
  - Rotate API keys
  - Mask secrets in logs and UI
- [x] **16.4** CORS configuration
  - Whitelist allowed origins
  - Preflight caching

---

## Tamamlanan İşler (Phase 1) ✅

- [x] REST API proxy uçtan uca (URL params, auth, JSONata transform)
- [x] Wizard UI (source type → config → sample → request mapping → target schema → field mapping → test & publish)
- [x] Field mapping (visual + expression mode, 20+ transforms)
- [x] Target schema versioning per mapping
- [x] Execution logging & audit trail
- [x] Prometheus custom metrics (proxy_requests, duration, errors)
- [x] Grafana dashboard (Proxy Performance)
- [x] Alert rules (5 rules: error rate, latency, service down, timeouts, no traffic)
- [x] Structured logging (JSON + correlationId)
- [x] Retry mechanism (UI + API)
- [x] Mapping versioning & publish (draft → immutable version)
- [x] Webhook source type (auto-register endpoint on publish)
- [x] CI/CD pipeline (GitHub Actions: build → test → staging → canary → production)
- [x] Multi-tenant isolation (API key → tenant mapping, filter)
- [x] PostgreSQL exporter
- [x] Request size limits (1MB)
- [x] Health check endpoints

---

## Öncelik Sırası

1. **Phase 9** (Kafka) — Transformer zaten var, sadece wizard integration
2. **Phase 12** (Production Hardening) — Deploy öncesi şart
3. **Phase 13** (DLQ UI) — Operasyonel ihtiyaç
4. **Phase 14** (Dashboard) — Kullanıcı deneyimi
5. **Phase 10-11** (SOAP/GraphQL) — Ek protocol desteği
6. **Phase 15-16** (Advanced/Security) — Olgunlaştırma
