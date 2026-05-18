# CanonBridge - Observability & Production Readiness Roadmap

> REST API proxy akışı uçtan uca çalışıyor. Sıradaki adımlar: loglama, observability, hata yönetimi ve production readiness.

---

## Phase 1: Execution Logging & Audit Trail

Her proxy çağrısının izlenebilir olması — debug ve müşteri desteği için kritik.

- [x] **1.1** Proxy execution log tablosu oluştur (`proxy_execution_logs`)
  - mapping_id, tenant_id, correlation_id, request_at, response_at, duration_ms
  - status (SUCCESS, ERROR, TIMEOUT), http_status_code
  - external_api_url, request_size_bytes, response_size_bytes
  - error_message, error_stage (REQUEST_TRANSFORM, API_CALL, RESPONSE_TRANSFORM)
- [x] **1.2** Backend: Her proxy çağrısında execution log kaydı oluştur
  - `MappingExecutionService.executeMapping` içinde başlangıç/bitiş zamanı
  - Başarılı/başarısız durumları kaydet
  - CorrelationId üret ve tüm log'lara ekle
- [x] **1.3** Backend: Execution logs API endpoint'leri
  - `GET /api/proxy/{mappingId}/logs` — son çağrıları listele
  - `GET /api/proxy/{mappingId}/logs/{logId}` — detay (request/response body opsiyonel)
  - `GET /api/proxy/{mappingId}/stats` — success/error count ve rate
- [x] **1.4** Frontend: Test & Publish step'te "Recent Executions" bölümü
  - Son 10 çağrıyı tablo olarak göster (correlation, durum, süre, zaman)
  - Tıklayınca detay açılır (error message, external API URL, transformed response)
  - Stats strip: total, success, errors, success rate
  - Test sonrası otomatik yenileme
- [x] **1.5** Frontend: Mappings listesinde son çağrı durumu göster
  - Health column: success rate badge (yeşil ≥95%, sarı ≥50%, kırmızı <50%)
  - Her mapping için /stats endpoint'inden veri çekiliyor

---

## Phase 2: Real Metrics (Prometheus)

Hardcoded stub'ları gerçek metriklerle değiştir.

- [x] **2.1** Backend: Micrometer/MicroProfile Metrics entegrasyonu
  - `proxy_requests_total{mapping_id, status}` — Counter
  - `proxy_request_duration_seconds{mapping_id}` — Timer (p50, p95, p99)
  - `proxy_external_api_duration_seconds{mapping_id}` — Timer
  - `proxy_transform_duration_seconds{mapping_id, stage}` — Timer
  - `proxy_errors_total{mapping_id, error_stage, error_type}` — Counter
- [x] **2.2** Backend: MetricsResource'u gerçek verilerle doldur
  - Dashboard stats → DB'den gerçek mapping count
  - Prometheus/Grafana URL'leri expose
- [ ] **2.3** Transformer service: Eksik metrikleri ekle
  - `consumer_lag` gauge
  - `validation_fail_total` counter
  - `mapping_cache_hit_total` / `mapping_cache_miss_total`
- [x] **2.4** Prometheus scrape config doğrula
  - mapping-studio-api `/metrics` çalışıyor ✓
  - Custom proxy metrics expose ediliyor ✓
  - Prometheus config düzeltildi (`/q/metrics` → `/metrics`)

---

## Phase 3: Grafana Dashboards

Mevcut tek dashboard'u genişlet, proxy-specific dashboard ekle.

- [x] **3.1** Proxy Performance Dashboard
  - Request rate (req/sec) by mapping
  - Latency (p50, p95, p99) by mapping
  - Error rate by mapping and stage
  - Success rate gauge
  - HTTP server metrics for proxy endpoints
  - Service up/down status
- [ ] **3.2** Partner/Mapping Health Dashboard
  - Success rate per partner
  - DLQ rate per partner
  - Last successful call per mapping
  - Active vs inactive mappings
- [ ] **3.3** System Overview Dashboard güncelle
  - Mevcut dashboard'a proxy metrics ekle
  - Service up/down status düzelt

---

## Phase 4: Structured Logging & Correlation

Tüm servisler arası izlenebilirlik.

- [x] **4.1** CorrelationId middleware (Backend)
  - Her request'e UUID correlationId atanıyor
  - Request header'dan gelen `X-Correlation-Id` varsa korunuyor
  - MDC'ye ekleniyor → tüm JSON log satırlarında görünüyor
  - Response header'da döndürülüyor
- [x] **4.2** Structured log format standardize et
  - JSON format: timestamp, level, service, correlationId, tenantId, message
  - Quarkus logging config güncellendi (environment field eklendi)
- [ ] **4.3** PII Masking
  - Log'larda email, phone, token gibi alanları maskele
  - Request/response body log'larken sensitive field'ları `***` ile değiştir
- [ ] **4.4** Transformer service logging iyileştir
  - Pino logger'a correlationId context ekle
  - Kafka message processing log'larını zenginleştir

---

## Phase 5: Alerting

Sorunları proaktif tespit et.

- [x] **5.1** Prometheus alert rules dosyası oluştur
  - `ProxyHighErrorRate` — %5 error rate 5 dakika boyunca (P2)
  - `ProxyHighLatency` — p99 > 5s 10 dakika boyunca (P2)
  - `ExternalAPITimeouts` — timeout oranı > %10 (P3)
  - `ServiceDown` — up == 0 1 dakika boyunca (P1)
  - `ProxyNoTraffic` — 30 dakika trafik yok (P3)
- [ ] **5.2** Alertmanager container ekle (docker-compose)
  - Slack webhook entegrasyonu
  - Alert routing (critical → immediate, warning → channel)
- [ ] **5.3** Frontend: Alert/notification gösterimi
  - Dashboard'da aktif alert'ler
  - Mapping detayında health indicator

---

## Phase 6: Error Management & Retry

Başarısız çağrıları yönet.

- [x] **6.1** Failed executions UI
  - Recent Executions bölümünde error satırları kırmızı highlight
  - Tıklayınca error detayı, external API URL, transformed response
  - Error classification otomatik (API_CALL, VALIDATION, TRANSFORM)
- [x] **6.2** Retry mekanizması
  - `POST /api/proxy/{mappingId}/retry/{logId}` endpoint
  - UI'da error detayında "Retry" butonu
  - Retry sonrası log listesi otomatik yenileniyor
  - Request payload execution log'da saklanıyor (retry için)
- [ ] **6.3** Error classification
  - AUTH_ERROR — token expired/invalid
  - TIMEOUT — external API yanıt vermedi
  - TRANSFORM_ERROR — JSONata evaluation hatası
  - VALIDATION_ERROR — response schema uyumsuz
  - NETWORK_ERROR — connection refused

---

## Phase 7: Infrastructure Exporters

Altyapı seviyesi monitoring.

- [x] **7.1** PostgreSQL Exporter ekle (docker-compose)
  - Container çalışıyor, port 9187
  - DB size, connection pool, query metrics expose ediliyor
- [x] **7.2** Kafka Exporter ekle
  - Consumer lag, message rate, broker health
- [x] **7.3** Node Exporter ekle
  - CPU, memory, disk, network (host level)

---

## Phase 8: Production Hardening

- [ ] **8.1** Rate limiting per mapping/tenant
- [ ] **8.2** Circuit breaker for external API calls
- [x] **8.3** Request/response size limits (1MB max payload)
- [ ] **8.4** Graceful shutdown (in-flight requests complete)
- [x] **8.5** Health check endpoints standardize (`/health/live`, `/health/ready`) — Quarkus SmallRye Health

---

## Tamamlanan İşler ✅

- [x] REST API proxy uçtan uca çalışıyor
- [x] URL path parameter substitution (`{orderId}`)
- [x] Bearer token auth (source_config'ten)
- [x] JSONata response transformation
- [x] Wizard: field mapping, save, test
- [x] Wizard: target schema snapshot per mapping
- [x] Prometheus + Grafana container'lar ayakta
- [x] Transformer /metrics endpoint (5 metrik)
- [x] Basic Grafana system-overview dashboard
- [x] Single tenant consolidation
- [x] External system endpoint management

---

## Notlar

- Her phase bağımsız deploy edilebilir
- Phase 1 en yüksek öncelik — debug için şart
- Phase 2-3 birlikte yapılabilir (metrics + dashboard)
- Phase 4 production'a çıkmadan önce olmalı
- Phase 5-6 production sonrası ilk sprint
- Phase 7-8 scale-up öncesi
