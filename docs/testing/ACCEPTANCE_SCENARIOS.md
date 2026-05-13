# CanonBridge Güçlü Çalışırlık Kanıt Senaryoları

Bu doküman, CanonBridge projesinin "gerçekten kuvvetli ve çalışıyor" olduğunu göstermek için gereken kabul, kanıt ve test senaryolarını tanımlar.

Amaç yalnızca servislerin ayağa kalktığını göstermek değildir. Amaç şunları kanıtlamaktır:

- Partner verisi güvenilir biçimde içeri alınır.
- Mapping Studio üzerinden üretilen/versiyonlanan mapping gerçek runtime tarafından kullanılır.
- Transformer doğru, deterministik ve valid canonical çıktı üretir.
- Kafka, retry, DLQ, idempotency ve outbox davranışları veri kaybını engeller.
- Sistem kötü veri, duplicate event, geçici dependency hatası, yavaş downstream ve deploy/restart altında tutarlı kalır.
- UI, API, transformer, mock servisler ve altyapı birlikte uçtan uca çalışır.
- Güvenlik, gözlemlenebilirlik, performans ve operasyon kabiliyetleri ölçülebilir kanıt üretir.

Bu doküman bir "demo script" değil, proje kabul planıdır. Demo başarılı olabilir ama kabul başarısız olabilir. Kabul için her senaryonun kanıtı saklanmalıdır.

---

## 1. Kanıt Seviyeleri

| Seviye | Ne kanıtlar? | Minimum çıktı |
|---|---|---|
| L0 - Derlenebilirlik | Kodun bağımlılıklarıyla build edilebildiğini kanıtlar. | `npm run build`, `mvn test`, Angular production build sonuçları |
| L1 - Unit doğruluğu | İzole iş kurallarının deterministik çalıştığını kanıtlar. | Unit test raporları ve coverage |
| L2 - Servis entegrasyonu | Servislerin dependency'lerle gerçek protokoller üzerinden konuştuğunu kanıtlar. | Kafka/PostgreSQL/Redis/WireMock/Testcontainers veya Docker Compose testleri |
| L3 - Uçtan uca akış | Kullanıcı veya event yolculuğunun baştan sona tamamlandığını kanıtlar. | Raw input, canonical output, DB kaydı, audit/DLQ/metric kanıtı |
| L4 - Dayanıklılık | Hata, restart, yavaşlık, duplicate ve overload altında veri kaybı olmadığını kanıtlar. | Chaos/load test raporları, log/metric ekran görüntüleri |
| L5 - Üretim hazırlığı | Güvenlik, gözlemlenebilirlik, deploy, rollback ve operasyon süreçlerinin hazır olduğunu kanıtlar. | Production readiness checklist, runbook tatbikatları, alert testleri |

Bir release "kuvvetli" sayılmak için en az L0-L3 tamamlanmış, L4 kritik senaryoları geçmiş, L5 maddeleri için açık risk listesi hazırlanmış olmalıdır.

---

## 2. Kanıt Dosyası Standardı

Her test koşusu için aşağıdaki bilgiler saklanmalıdır:

```text
Test Run ID: CB-ACCEPT-YYYYMMDD-NN
Git commit:
Branch:
Test environment:
Tester:
Start time:
End time:
Result: PASS / FAIL / PARTIAL
Known gaps:
Evidence folder:
```

Önerilen kanıt klasörü:

```text
docs/testing/evidence/
  CB-ACCEPT-20260513-01/
    00-environment.txt
    01-build-and-unit-tests.log
    02-integration-tests.log
    03-e2e-payflex.log
    04-e2e-fastcargo.log
    05-e2e-shopmax.log
    06-dlq-retry.log
    07-load-test-summary.md
    08-observability-screenshots/
    09-security-checks.log
    10-final-signoff.md
```

Kanıt geçerli sayılması için yalnızca "başarılı" yazması yetmez. Raw input, beklenen çıktı, gerçek çıktı, HTTP status, Kafka offset, DB id veya metric değeri birlikte gösterilmelidir.

---

## 3. Kapsam Haritası

| Alan | Kanıtlanacak kabiliyet | İlgili bileşenler |
|---|---|---|
| Partner ingress | Webhook, SOAP, Kafka kaynaklarından veri kabulü | `services/webhook-receiver`, `services/canonbridge-mock`, Kafka |
| Mapping lifecycle | Draft, preview, publish, immutable version, rollback | `mapping-studio-ui`, `services/mapping-studio-api` |
| Transformation | JSONata mapping, Ajv validation, schema version resolution | `services/transformer` |
| Error handling | Validation error, transient error, retry, DLQ | Transformer, Kafka topics |
| Business reliability | Idempotency, ordering, outbox, DB transaction | Mapping Studio API/business service code paths |
| Security | API key/JWT, webhook auth, credential encryption, masking, rate limit | API, webhook receiver, credential services |
| Observability | Health, metrics, logs, correlation ID, dashboards | Prometheus, Grafana, service logs |
| Performance | Throughput, p95/p99 latency, lag, memory, worker pool | Transformer, Kafka, Kubernetes/Docker |
| Operations | Deploy, graceful shutdown, rollback, DR, runbooks | Docker Compose, Kubernetes manifests, docs/operations |

---

## 4. Ön Koşullar

### 4.1 Lokal/Staging Servisleri

Minimum test ortamında şu servisler çalışmalıdır:

- Kafka veya Redpanda
- PostgreSQL
- Redis, rate limit/cache testleri için
- Mapping Studio API
- Transformer
- Mapping Studio UI
- CanonBridge Mock
- Webhook Receiver, ayrı test ediliyorsa
- Prometheus/Grafana, gözlemlenebilirlik senaryoları için

### 4.2 Sağlık Kontrolleri

```bash
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8081/health/live
curl -f http://localhost:8081/health/ready
curl -f http://localhost:3000/health/liveness
curl -f http://localhost:3000/health/readiness
curl -f http://localhost:4200
```

Not: Portlar ortam değişkenlerine göre değişebilir. `scripts/test-end-to-end.sh` varsayılan olarak `MOCK_SERVICE_URL`, `TRANSFORMER_URL`, `MAPPING_API_URL` ve `KAFKA_CONTAINER` değişkenlerini destekler.

### 4.3 Test Veri Setleri

Gerekli fixture sınıfları:

- Valid happy path payload
- Required field missing payload
- Invalid type payload
- Unknown partner payload
- Unknown event type payload
- Unsupported schema version payload
- Duplicate event payload
- Large payload
- Complex nested payload
- PII içeren payload
- Partner-specific edge case payload

Mevcut örnek kaynaklar:

- `services/transformer/partners/acme-marketplace/order-created/fixtures/`
- `services/canonbridge-mock/docs/payload-catalog.md`
- `services/canonbridge-mock/docs/scenarios.md`
- `TESTING_GUIDE.md`

---

## 5. Release Kabul Kapıları

| Kapı | Bloklayıcı mı? | Başarı kriteri |
|---|---:|---|
| Build | Evet | Backend, frontend ve transformer build hatasız |
| Unit tests | Evet | Tüm unit testler geçer |
| Mapping fixture validation | Evet | Tüm mapping fixture çiftleri beklenen canonical çıktıyı üretir |
| Schema compatibility | Evet | Backward incompatible değişiklik versiyonsuz geçmez |
| Core E2E | Evet | PayFlex, FastCargo, ShopMax akışları geçer |
| DLQ/retry | Evet | Bad payload DLQ'ya, transient hata retry'a gider |
| Security smoke | Evet | Yetkisiz istekler reddedilir, secret/PII loglanmaz |
| Observability smoke | Evet | Health, metrics, structured logs görünür |
| Load smoke | Evet | MVP hedefleri altında lag büyümez |
| Full production readiness | GA için evet | `docs/operations/11-production-readiness.md` tamamlanır |

---

## 6. Komut Bazlı Temel Kanıt Paketi

Bu bölüm, "önce projeyi kırık mı değil mi görelim" kanıtıdır.

### 6.1 Transformer

```bash
cd services/transformer
npm install
npm run typecheck
npm run build
npm test
npm run test:mapping-fixtures
npm run test:schema-compatibility
```

Başarı kriterleri:

- TypeScript typecheck hatasızdır.
- Build `dist/` üretir.
- Vitest testleri geçer.
- Mapping fixture validasyonu expected output ile birebir eşleşir.
- Schema compatibility script'i incompatible değişiklikleri yakalar.

### 6.2 Mapping Studio UI

```bash
cd mapping-studio-ui
npm install
npm run build
npm test -- --run
npm run format:check
```

Başarı kriterleri:

- Angular production build başarılıdır.
- UI unit/integration spec'leri geçer.
- Mapping wizard, rule-to-jsonata ve transform parameter label testleri geçer.
- Format kontrolü hatasızdır.

### 6.3 Mapping Studio API

```bash
cd services/mapping-studio-api
mvn test
```

Başarı kriterleri:

- API resource testleri geçer.
- Credential encryption/decryption testleri geçer.
- Rate limit testleri geçer.
- Kafka producer, outbound HTTP, graceful shutdown ve security testleri geçer.

### 6.4 Webhook Receiver

```bash
cd services/webhook-receiver
mvn test
```

Başarı kriterleri:

- Webhook resource testleri geçer.
- Webhook auth testleri geçer.
- Webhook service testleri geçer.
- Unauthorized ve malformed request senaryoları beklenen HTTP cevaplarını üretir.

### 6.5 Uçtan Uca Script

```bash
./scripts/test-end-to-end.sh
```

Başarı kriterleri:

- Mock service health geçer.
- Transformer health geçer.
- Mapping API health geçer.
- PayFlex transform başarılıdır.
- ShopMax Kafka event publish edilir ve transformer tarafından işlenebilir.
- FastCargo SOAP response alınır.
- Mapping configuration doğrulanır.

---

## 7. Kritik E2E Senaryo Seti

### E2E-001 PayFlex Webhook Happy Path

Amaç: PayFlex ödeme webhook'unun güvenli biçimde alınmasını, raw event'e dönüşmesini ve canonical çıktıya gitmesini kanıtlamak.

Akış:

```text
PayFlex mock payload
  -> Webhook endpoint
  -> Raw Kafka topic: partner.payflex.raw
  -> Transformer
  -> Canonical topic / HTTP transform response
  -> Metrics/log/audit
```

Test adımları:

1. Mock service çalışır durumda doğrulanır.
2. Geçerli `X-Webhook-Key` ile başarılı ödeme payload'u gönderilir.
3. HTTP 202 veya 200 sınıfı kabul cevabı alınır.
4. Kafka raw topic'te event görülür.
5. Transformer event'i işler.
6. Canonical output'ta `transactionId`, `amount`, `currency`, `status`, `customerEmail` beklenen değerlerle bulunur.
7. Metric counter artar.

Başarı kriterleri:

- Event kaybolmaz.
- Partner alanları canonical alanlara doğru taşınır.
- PII loglarda full payload olarak görünmez.
- Yanlış webhook key ile aynı payload 401 döner.

Kanıt:

- Request payload
- Response body/status
- Kafka raw offset
- Canonical output
- Transformer log satırı
- Prometheus metric snapshot

### E2E-002 PayFlex Webhook Invalid Auth

Amaç: Yetkisiz webhook'ların işlenmediğini kanıtlamak.

Test:

```bash
curl -i -X POST http://localhost:8080/webhook/payflex/payment \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Key: wrong-key" \
  -d '{"transactionId":"TXN-DENY-001","amount":149.99}'
```

Başarı kriterleri:

- HTTP 401 döner.
- Kafka raw topic'e event yazılmaz.
- Audit/security log'da reason görünür.
- Secret değer loglanmaz.

### E2E-003 PayFlex Validation Error

Amaç: Required field eksik olduğunda sistemin sessizce canonical event üretmediğini kanıtlamak.

Test:

- `amount`, `currency` veya `transactionId` eksik payload gönderilir.

Başarı kriterleri:

- Request ingress katmanında 400 döner veya transformer validation stage'de DLQ üretir.
- Hata mesajında schema path/stage bulunur.
- Canonical topic'e event yazılmaz.

### E2E-004 FastCargo SOAP Happy Path

Amaç: SOAP/XML legacy partner entegrasyonunun çalıştığını kanıtlamak.

Akış:

```text
SOAP request
  -> FastCargo mock
  -> SOAP XML response
  -> XML to JSON normalization
  -> Transformer
  -> canonical shipment status
```

Test adımları:

1. `POST /ws/track` endpoint'ine geçerli SOAP envelope gönderilir.
2. `FC123456789` için `IN_TRANSIT` response alınır.
3. Response normalized JSON haline getirilip transformer'a gönderilir.
4. Canonical output'ta tracking number, status, current location, estimated delivery doğrulanır.

Başarı kriterleri:

- SOAP XML parse edilebilir.
- Bilinen tracking number doğru response üretir.
- Invalid tracking number SOAP Fault üretir.
- Fault canonical success event'e dönüşmez.

### E2E-005 ShopMax Kafka Happy Path

Amaç: Partner'ın doğrudan Kafka'ya event bastığı senaryoda transformer'ın raw event'i canonical event'e dönüştürdüğünü kanıtlamak.

Akış:

```text
ShopMax producer
  -> Kafka topic: partner.shopmax.raw
  -> Transformer consumer group
  -> canonical.order.created
```

Başarı kriterleri:

- Event raw topic'e yazılır.
- Transformer consumer lag'i stabil kalır.
- Canonical event schema-valid olur.
- `orderId`, `customerId`, `items`, `totalAmount`, `shippingAddress` doğru taşınır.
- Offset yalnızca başarılı produce veya DLQ sonrası commit edilir.

### E2E-006 Mapping Studio Draft to Publish

Amaç: Kullanıcının no-code mapping oluşturup publish ettiği mapping'in runtime tarafından kullanılabildiğini kanıtlamak.

Akış:

```text
UI sample upload/paste
  -> JSON tree inspection
  -> Field mapping
  -> Live preview
  -> Server-side validation
  -> Publish immutable version
  -> Transformer reload/cache
  -> Runtime transform
```

Başarı kriterleri:

- Draft oluşturulur.
- Sample payload kaydedilir.
- Visual rule JSONata'ya deterministik çevrilir.
- Preview expected output üretir.
- Publish sonrası immutable `mapping_versions` kaydı oluşur.
- Published version değiştirilemez.
- Transformer yeni versiyonu kullanır.

Kanıt:

- UI ekran görüntüleri
- API request/response kayıtları
- DB `mapping_drafts` ve `mapping_versions` kayıtları
- Transformer reload sonucu
- Runtime transform çıktısı

### E2E-007 Mapping Rollback

Amaç: Hatalı mapping publish edildiğinde önceki versiyona hızlı ve güvenli dönüş yapılabildiğini kanıtlamak.

Test:

1. v1 mapping publish edilir.
2. v2 mapping publish edilir.
3. v2 ile event işlenir.
4. Rollback ile v1 aktif edilir.
5. Aynı input tekrar işlenir.

Başarı kriterleri:

- Aktif mapping versiyonu v1'e döner.
- Audit log rollback işlemini kaydeder.
- v2 immutable kalır, silinmez.
- Transformer cache reload sonrası v1 çıktısını üretir.

### E2E-008 DLQ to Fix Draft Loop

Amaç: DLQ'ya düşen event'in Mapping Studio'da düzeltme sürecini başlatabildiğini kanıtlamak.

Akış:

```text
Invalid partner event
  -> Transformer validation failure
  -> DLQ
  -> DLQ UI/API
  -> sample payload olarak draft'a import
  -> mapping/schema fix
  -> preview
  -> publish
  -> replay
```

Başarı kriterleri:

- DLQ kaydında `partnerId`, `eventType`, `schemaVersion`, `mappingVersion`, `stage`, `correlationId`, hata detayı bulunur.
- DLQ payload yetkisiz kullanıcıya gösterilmez.
- Import edilen sample ile preview yapılır.
- Fix sonrası replay success olur.

---

## 8. Transformation Correctness Senaryoları

### TRN-001 Fixture Golden Master

Amaç: Her mapping fixture input'unun beklenen canonical output ile birebir eşleştiğini kanıtlamak.

Komut:

```bash
cd services/transformer
npm run test:mapping-fixtures
```

Başarı kriterleri:

- Her partner/event klasöründe valid input ve expected output vardır.
- Output stable/deterministic olur.
- Tarih, amount, enum, trimming, default value ve nested field dönüşümleri beklenen şekilde çalışır.

### TRN-002 Schema Validation - Input Reject

Amaç: Partner input schema'ya uymayan payload'un işlenmediğini kanıtlamak.

Başarı kriterleri:

- Required field eksikse hata döner.
- Type mismatch varsa schema path ile hata döner.
- Unknown field politikası dokümana göre uygulanır.
- Invalid input canonical event üretmez.

### TRN-003 Schema Validation - Output Reject

Amaç: Mapping yanlış canonical shape üretirse output validation'ın bunu yakaladığını kanıtlamak.

Başarı kriterleri:

- JSONata expression çalışsa bile canonical schema'ya uymayan çıktı success sayılmaz.
- Hata stage'i `output_validation` gibi ayırt edilebilir olur.
- Event DLQ'ya gider veya HTTP dry-run structured error döner.

### TRN-004 Schema Version Resolution

Amaç: `schemaVersion` veya config version alanının doğru mapping versiyonunu seçtiğini kanıtlamak.

Başarı kriterleri:

- v1 event v1 mapping ile işlenir.
- v2 event v2 mapping ile işlenir.
- Version yoksa default/fallback davranışı dokümana uygundur.
- Unknown version sessizce başka mapping'e düşmez.

### TRN-005 Complex JSONata

Amaç: Nested array, conditional, default, enum normalize ve calculated field dönüşümlerinin doğru çalıştığını kanıtlamak.

Başarı kriterleri:

- Array item mapping sırası korunur.
- Monetary fields precision kaybetmez.
- Empty string/null/default politikası tutarlıdır.
- Enum normalize kuralları beklenir.

### TRN-006 Timeout and Sandbox

Amaç: Pahalı veya hatalı JSONata expression'ın worker/event loop'u kilitlemediğini kanıtlamak.

Başarı kriterleri:

- Execution timeout uygulanır.
- Worker pool enabled ise ana event loop bloke olmaz.
- Timeout DLQ/error olarak görünür.
- Service restart gerekmez.

---

## 9. Reliability Senaryoları

### REL-001 Duplicate Event Idempotency

Amaç: Aynı `eventId` tekrar geldiğinde business etkisinin bir kez oluştuğunu kanıtlamak.

Test:

1. Aynı event iki kez raw topic'e yazılır.
2. Transformer iki kez canonical üretebilir veya downstream'e iletebilir.
3. Business layer duplicate event'i idempotency guard ile yakalar.

Başarı kriterleri:

- Domain DB kaydı tek kez değişir.
- `processed_events` unique guard duplicate'i engeller.
- Duplicate event audit/metric olarak görünür.
- Hata olarak page açmaz.

### REL-002 Manual Offset Commit

Amaç: Transformer offset'i output durable olmadan commit etmediğini kanıtlamak.

Test:

1. Canonical publish sırasında hata enjekte edilir.
2. Transformer crash/restart edilir.
3. Aynı message yeniden işlenir.

Başarı kriterleri:

- Event kaybolmaz.
- Offset success veya DLQ produce sonrası commit edilir.
- Restart sonrası message tekrar consume edilir.

### REL-003 Retry Topics

Amaç: Geçici hataların DLQ'ya direkt düşmeden retry edildiğini kanıtlamak.

Başarı kriterleri:

- 1m, 5m, 30m retry topic akışı çalışır.
- Retry count metadata olarak taşınır.
- Maksimum retry sonrası DLQ'ya düşer.
- Non-retryable validation error retry edilmez.

### REL-004 Poison Pill Isolation

Amaç: Tek bir bozuk mesajın partition'ı sonsuza kadar bloke etmediğini kanıtlamak.

Test:

1. Raw topic'e sırayla invalid, valid, valid event yazılır.
2. Invalid event DLQ'ya gider.
3. Sonraki valid event'ler işlenmeye devam eder.

Başarı kriterleri:

- Consumer invalid mesajda takılmaz.
- DLQ kaydı actionable metadata taşır.
- Sonraki valid event'ler canonical topic'e ulaşır.

### REL-005 Graceful Shutdown

Amaç: Deploy/restart sırasında in-flight işler tamamlanmadan process'in kapanmadığını kanıtlamak.

Test:

1. Aktif load altında SIGTERM gönderilir.
2. Service readiness false olur.
3. In-flight işler drain edilir.
4. Producer flush tamamlanır.
5. Process timeout içinde kapanır.

Başarı kriterleri:

- In-flight message kaybı yoktur.
- Yeni request kabulü durur.
- Shutdown süresi konfigüre edilen limit içindedir.

### REL-006 Outbox Durability

Amaç: DB write başarılı ama Kafka publish başarısız olduğunda event'in kaybolmadığını kanıtlamak.

Başarı kriterleri:

- Domain transaction ve outbox insert birlikte commit edilir.
- Kafka publish fail olursa outbox pending kalır.
- Relay tekrar denediğinde event publish edilir.
- Duplicate publish idempotent yönetilir.

### REL-007 Ordering and Dependencies

Amaç: Bir business event kendisinden önce gelmesi gereken dependency yoksa doğru bekletildiğini kanıtlamak.

Örnek:

- `order.cancelled` event'i `order.created` event'inden önce gelir.

Başarı kriterleri:

- Cancel event kaybolmaz.
- Pending dependency olarak saklanır.
- Create geldiğinde bekleyen event işlenir.
- Timeout sonrası operasyonel uyarı oluşur.

---

## 10. Security Senaryoları

### SEC-001 API Key Authentication

Amaç: Protected endpoint'lerin API key olmadan kullanılamadığını kanıtlamak.

Başarı kriterleri:

- `/v1/*` transformer endpoint'leri `API_KEY` set edildiğinde `X-Api-Key` ister.
- Mapping Studio API protected endpoint'leri geçersiz key/JWT ile reddeder.
- Health/metrics/openapi politikası dokümana göre ayrıdır.

### SEC-002 Webhook Authentication

Amaç: Partner webhook secret/key doğrulamasının çalıştığını kanıtlamak.

Başarı kriterleri:

- Doğru key success.
- Yanlış key 401.
- Eksik key 401/403.
- Key değeri loglarda maskelenir.

### SEC-003 Credential Secret Storage

Amaç: Credential secret'ların write-only ve encrypted olduğunu kanıtlamak.

Başarı kriterleri:

- Credential create response secret döndürmez.
- DB'de raw secret görünmez.
- Disable edilen credential kullanılamaz.
- AES-256-GCM decrypt/encrypt testleri geçer.

### SEC-004 Rate Limiting

Amaç: Abuse ve tenant bazlı limitlerin çalıştığını kanıtlamak.

Başarı kriterleri:

- Limit aşımında HTTP 429 döner.
- `Retry-After`, `X-RateLimit-*` header'ları gelir.
- Authenticated/unauthenticated limit ayrımı çalışır.
- Per-tenant override çalışır.

### SEC-005 PII Masking

Amaç: Log, metric, preview ve DLQ görüntüleme sırasında PII sızıntısı olmadığını kanıtlamak.

Başarı kriterleri:

- Email, card last4 dışındaki hassas kart bilgisi, API key, bearer token maskelenir.
- Full payload loglanmaz.
- DLQ payload access role-based kısıtlanır.
- Preview UI hassas alanları maskeleme politikasına uyar.

### SEC-006 Tenant Isolation

Amaç: Bir tenant'ın mapping, DLQ, credential ve event verisine başka tenant erişemediğini kanıtlamak.

Başarı kriterleri:

- Cross-tenant API request 403/404 döner.
- Transformer mapping resolution tenant scope dışına çıkmaz.
- Audit log tenant ID taşır.

---

## 11. Observability Senaryoları

### OBS-001 Health Probes

Amaç: Liveness/readiness endpoint'lerinin gerçek servis durumunu yansıttığını kanıtlamak.

Başarı kriterleri:

- Liveness process canlılığını gösterir.
- Readiness dependency hazır değilken false olur.
- Kafka/DB down durumunda readiness davranışı dokümana uygundur.

### OBS-002 Prometheus Metrics

Amaç: Sistem davranışının metriklerle ölçülebildiğini kanıtlamak.

Kontrol edilecek metrikler:

- Transform request count
- Transform latency histogram
- Kafka messages total
- DLQ count
- Cache size
- Partner registry size
- Rate limit rejection count
- Consumer lag, ortam destekliyorsa

Başarı kriterleri:

- `/metrics` scrape edilebilir.
- Success/failure label'ları doğru artar.
- High-cardinality alanlar kontrol altındadır.

### OBS-003 Structured Logs and Correlation

Amaç: Bir event'in ingress'ten output'a kadar izlenebildiğini kanıtlamak.

Başarı kriterleri:

- Loglar JSON structured format taşır.
- `correlationId`, `eventId`, `partnerId`, `eventType`, `topic`, `partition`, `offset` gibi alanlar görünür.
- Error log actionable stage bilgisi taşır.
- PII görünmez.

### OBS-004 Grafana Dashboard Smoke

Amaç: Operasyon ekibinin sistemi dashboard üzerinden anlayabildiğini kanıtlamak.

Başarı kriterleri:

- System overview dashboard veri gösterir.
- Transformer throughput/latency paneli çalışır.
- DLQ paneli invalid event sonrası artışı gösterir.
- Kafka lag paneli load altında anlamlı veri gösterir.

### OBS-005 Alert Firing

Amaç: Kritik arızalarda alert üretildiğini kanıtlamak.

Testler:

- DLQ spike
- Transformer readiness down
- Kafka consumer lag high
- Error rate high
- DB unavailable

Başarı kriterleri:

- Alert fire eder.
- Notification doğru kanala gider.
- Alert mesajında runbook linki ve context vardır.

---

## 12. Performance ve Load Senaryoları

### PERF-001 MVP Throughput Smoke

Amaç: Sistem MVP hedefi olan 1,000 msg/sec seviyesine yaklaşırken stabil kaldığını kanıtlamak.

Başarı kriterleri:

- Sustained load sırasında process crash olmaz.
- p99 transformation latency hedef altında kalır veya sapma raporlanır.
- Kafka lag sürekli büyümez.
- CPU/memory plato yapar, sınırsız artmaz.

### PERF-002 Multiple Partner Mixed Load

Amaç: Tek partner değil, karışık partner/event load altında mapping resolution ve cache'in doğru çalıştığını kanıtlamak.

Başarı kriterleri:

- PayFlex, FastCargo, ShopMax ve Acme event'leri karışık işlenir.
- Partner registry doğru mapping seçer.
- Cache hit oranı gözlemlenebilir.
- Hiçbir partner diğerini bloke etmez.

### PERF-003 Large Payload

Amaç: Büyük payload'larda latency, memory ve validation davranışını kanıtlamak.

Başarı kriterleri:

- Belirlenen maksimum payload boyutuna kadar success.
- Limit üstü payload beklenen HTTP/Kafka error davranışını üretir.
- Memory leak gözlenmez.

### PERF-004 Worker Pool Saturation

Amaç: CPU-heavy JSONata expression'ların event loop'u kilitlemediğini kanıtlamak.

Başarı kriterleri:

- Worker queue depth ölçülür.
- Readiness/load davranışı stabil kalır.
- Timeout'lar structured error üretir.
- Horizontal scaling önerisi ölçüme bağlanır.

---

## 13. UI Kabul Senaryoları

### UI-001 Login and Auth Guard

Amaç: Yetkisiz kullanıcının Mapping Studio ekranlarına erişemediğini kanıtlamak.

Başarı kriterleri:

- Login başarılı/başarısız durumları doğru gösterilir.
- Token/API auth state korunur.
- Protected route guard çalışır.

### UI-002 Mapping Wizard

Amaç: Business kullanıcının sample'dan mapping oluşturabildiğini kanıtlamak.

Başarı kriterleri:

- JSON paste/upload çalışır.
- JSON tree doğru alanları gösterir.
- Canonical fields listelenir.
- Drag/drop veya rule builder ile field mapping yapılır.
- Preview real-time güncellenir.

### UI-003 Rule to JSONata Determinism

Amaç: UI rule builder'ın ürettiği JSONata'nın deterministic ve testlenebilir olduğunu kanıtlamak.

Başarı kriterleri:

- Aynı rule aynı expression'ı üretir.
- Transform param label testleri geçer.
- Nested mapping ve array mapping doğru expression üretir.

### UI-004 Accessibility and Keyboard Flow

Amaç: Mapping Studio'nun klavye ve erişilebilirlik açısından kullanılabilir olduğunu kanıtlamak.

Başarı kriterleri:

- Skip links çalışır.
- Keyboard shortcuts dialog erişilebilir.
- Focus trap/modal davranışı doğrudur.
- Kritik akış mouse olmadan tamamlanabilir.

### UI-005 DLQ Management

Amaç: DLQ ekranının operasyonel düzeltme akışını desteklediğini kanıtlamak.

Başarı kriterleri:

- DLQ listesi filtrelenir.
- Error detail anlaşılırdır.
- Payload masking uygulanır.
- "Create fix draft/import sample" akışı çalışır.

---

## 14. API Kabul Senaryoları

### API-001 Partner CRUD

Başarı kriterleri:

- Partner create/list/get/update/delete veya disable davranışları beklenen status code üretir.
- `externalId` ile lookup çalışır.
- Tenant scope uygulanır.

### API-002 Mapping Draft CRUD

Başarı kriterleri:

- Draft create/update/list/get/delete çalışır.
- Invalid draft valid status'a geçmez.
- Draft publish edilmeden runtime active mapping olmaz.

### API-003 Mapping Version Immutability

Başarı kriterleri:

- Publish yeni immutable version oluşturur.
- Published version update edilemez.
- Deprecate/rollback controlled endpoint ile yapılır.

### API-004 Schema Management

Başarı kriterleri:

- Canonical/input schema create edilir.
- Latest active schema doğru döner.
- Backward incompatible değişiklik versiyon gerektirir.

### API-005 External System Test

Başarı kriterleri:

- Outbound connection test endpoint'i credential resolver ile çalışır.
- Timeout/retry/circuit breaker davranışı beklenen şekilde oluşur.
- Secret response veya loglarda görünmez.

---

## 15. Mock ve Demo Kabul Senaryoları

### MOCK-001 PayFlex

Başarı kriterleri:

- Successful payment webhook 202 Accepted üretir.
- Failed payment payload gerçekçi response üretir.
- Refund payload desteklenir.
- Unauthorized webhook reddedilir.

### MOCK-002 FastCargo

Başarı kriterleri:

- Valid SOAP tracking number response üretir.
- Delivered ve in-transit varyantları vardır.
- Invalid tracking number SOAP fault üretir.
- Basic auth davranışı testlenir.

### MOCK-003 ShopMax

Başarı kriterleri:

- Order created payload Kafka'ya basılabilir.
- Order cancelled payload desteklenir.
- Topic isimleri dokümanla uyumludur.

### MOCK-004 Fault Injection

Başarı kriterleri:

- 500, 502, 503, 504 mapping'leri çalışır.
- Timeout 10s/30s senaryoları çalışır.
- Malformed/empty/connection reset fault'ları gerçekçi davranır.
- Transformer/outbound retry politikası bu fault'larla doğrulanır.

---

## 16. Data Governance ve Audit Senaryoları

### GOV-001 Audit Trail

Başarı kriterleri:

- Partner create/update
- Credential create/disable
- Draft create/update
- Publish
- Rollback
- DLQ replay
- Login/security-sensitive action

Bu aksiyonların tamamı audit log'a user, tenant, timestamp, action, target ve correlation ID ile düşmelidir.

### GOV-002 Append-only Audit

Başarı kriterleri:

- Audit log application kullanıcısı tarafından update/delete edilemez.
- Düzeltme gerekiyorsa yeni audit kaydı yazılır.

### GOV-003 Data Retention

Başarı kriterleri:

- Raw, canonical, DLQ ve audit retention politikaları dokümante edilir.
- Kafka retention ayarları beklenen politikalara uygundur.
- DLQ payload'ları hassas veri politikasına göre korunur.

---

## 17. Kubernetes ve Deployment Senaryoları

### DEP-001 Docker Compose Local

Amaç: Yeni bir geliştiricinin projeyi lokal ayağa kaldırabildiğini kanıtlamak.

Başarı kriterleri:

- Docker Compose bağımlılıkları başlatır.
- Migration'lar uygulanır.
- Seed/mock mapping'ler oluşur.
- UI ve API erişilebilir.

### DEP-002 Kubernetes Manifest Validation

Başarı kriterleri:

```bash
kubectl apply -k infrastructure/k8s/transformer --dry-run=server
```

- Deployment valid.
- Service valid.
- HPA valid.
- PDB valid.
- ServiceMonitor valid.
- ConfigMap/Secret referansları tutarlı.

### DEP-003 Rolling Deploy

Başarı kriterleri:

- Eski pod drain olur.
- Yeni pod readiness true olmadan traffic almaz.
- In-flight event kaybolmaz.
- Consumer group yeniden dengelenir.

### DEP-004 Rollback

Başarı kriterleri:

- Hatalı image deploy edilir.
- Health/readiness failure gözlenir.
- Önceki image'a rollback yapılır.
- Event processing kaldığı yerden devam eder.

---

## 18. Failure Mode Kabul Matrisi

| Hata | Beklenen davranış | Kanıt |
|---|---|---|
| Invalid JSON | 400 veya DLQ | Error response/DLQ kaydı |
| Unknown partner | DLQ veya structured error | `partnerId` ile error |
| Unknown event type | DLQ veya structured error | `eventType` ile error |
| Missing mapping | Retry edilmez, actionable DLQ | `stage=mapping_resolution` |
| Invalid mapping expression | Publish gate engeller veya runtime DLQ | Validation sonucu |
| Output schema invalid | Canonical publish olmaz | `stage=output_validation` |
| Kafka unavailable | Readiness false, retry/backoff | Logs/metrics |
| PostgreSQL unavailable | API readiness false, graceful error | Health/log |
| Redis unavailable | Rate limit/cache fallback politikası uygulanır | Health/log |
| Downstream timeout | Retry/circuit breaker | Retry count/log |
| Process killed | Offset commit davranışı veri kaybını önler | Replay evidence |
| Duplicate event | Idempotent ignore | DB row count |
| DLQ spike | Alert fire eder | Alert screenshot |
| PII payload | Masked logs | Log sample |

---

## 19. Minimum Otomasyon Backlog'u

Bu senaryolar manuel kalırsa kabul maliyeti yüksek olur. Aşağıdaki otomasyonlar önceliklidir:

1. `scripts/test-end-to-end.sh` script'i gerçek canonical output assertion'ları yapmalı.
2. Kafka E2E testleri canonical topic consume edip JSON schema validation yapmalı.
3. DLQ senaryosu otomatik invalid payload üretip DLQ kaydını assert etmeli.
4. Mapping Studio API publish/rollback E2E testleri eklenmeli.
5. UI wizard için Playwright/Cypress akışı eklenmeli.
6. Load smoke için tek komutla rapor üreten k6/Artillery senaryosu eklenmeli.
7. Security smoke için auth/rate-limit/masking testleri tek komutta koşmalı.
8. Observability smoke için `/metrics` üzerinde metric existence assertion yapılmalı.
9. Kubernetes manifest validation CI job'a bağlanmalı.
10. Evidence klasörü CI artifact olarak publish edilmeli.

---

## 20. Kabul Puanlama Modeli

| Alan | Ağırlık | PASS koşulu |
|---|---:|---|
| Build/test baseline | 15 | Tüm build ve unit testler geçer |
| Core transformation | 20 | Fixture, schema, JSONata, version resolution geçer |
| E2E journeys | 20 | PayFlex, FastCargo, ShopMax, Mapping Studio publish geçer |
| Reliability | 15 | Duplicate, retry, DLQ, graceful shutdown, offset commit kanıtlanır |
| Security | 10 | Auth, credential, masking, rate limit geçer |
| Observability | 10 | Health, metrics, logs, dashboards, alerts çalışır |
| Performance | 5 | MVP load smoke geçer |
| Operations | 5 | Deploy/rollback/runbook smoke geçer |

Release sınıflandırması:

- 90-100: Kuvvetli production candidate
- 80-89: Staging/limited beta için kuvvetli
- 70-79: Demo için yeterli, production için riskli
- 60-69: Temel akış var, güvenilirlik eksik
- <60: Çalışıyor iddiası zayıf

Bloklayıcı bir güvenlik veya veri kaybı hatası varsa toplam puan ne olursa olsun release production candidate sayılamaz.

---

## 21. Final Sign-off Şablonu

```markdown
# CanonBridge Acceptance Sign-off

Test Run ID:
Git commit:
Environment:
Date:

## Summary
- Result:
- Score:
- Blockers:
- Known risks:

## Passed Gates
- [ ] Build
- [ ] Unit tests
- [ ] Integration tests
- [ ] Contract tests
- [ ] Core E2E
- [ ] DLQ/retry
- [ ] Security smoke
- [ ] Observability smoke
- [ ] Load smoke
- [ ] Deploy/rollback smoke

## Evidence
- Build logs:
- Test reports:
- E2E logs:
- Metrics screenshots:
- Dashboard screenshots:
- Security logs:

## Open Issues
| ID | Severity | Owner | Target date | Notes |
|---|---|---|---|---|

## Approval
| Role | Name | Date | Decision |
|---|---|---|---|
| Engineering | | | |
| Product | | | |
| Security | | | |
| Operations | | | |
```

---

## 22. En Kısa "Gerçekten Çalışıyor" Demo Paketi

Zaman çok sınırlıysa, aşağıdaki paket minimum ikna setidir. Bu production kabul yerine geçmez ama projenin gerçek olduğunu güçlü biçimde gösterir.

1. `npm test` ve `npm run build` transformer için geçer.
2. `mvn test` Mapping Studio API için geçer.
3. `npm run build` Mapping Studio UI için geçer.
4. Docker Compose ile Kafka/Postgres/mock servisler ayağa kalkar.
5. PayFlex webhook event'i canonical payment çıktısı üretir.
6. ShopMax Kafka order event'i canonical order çıktısı üretir.
7. FastCargo SOAP request valid XML response üretir ve normalized transform yapılır.
8. Invalid payload DLQ'ya düşer.
9. Mapping Studio'da sample upload -> preview -> publish akışı gösterilir.
10. `/metrics`, health endpoint'leri ve log correlation canlı gösterilir.

Bu 10 madde canlı ve kanıtlı gösterilebiliyorsa proje "sadece doküman değil, çalışan ürün çekirdeği var" seviyesini ispatlar.

---

## 23. İlgili Dokümanlar

- `README.md`
- `TESTING_GUIDE.md`
- `docs/testing/01-unit-tests.md`
- `docs/testing/02-integration-tests.md`
- `docs/testing/03-e2e-tests.md`
- `docs/testing/04-load-tests.md`
- `docs/testing/05-chaos-tests.md`
- `docs/testing/06-contract-tests.md`
- `docs/testing/07-test-environment.md`
- `docs/operations/11-production-readiness.md`
- `docs/operations/09-failure-scenarios.md`
- `docs/operations/08-runbook.md`
- `docs/architecture/01-overview.md`
- `services/transformer/README.md`
- `services/mapping-studio-api/README.md`
- `mapping-studio-ui/README.md`
- `services/canonbridge-mock/docs/scenarios.md`
- `services/canonbridge-mock/docs/demo-runbook.md`
