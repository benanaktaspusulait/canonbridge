# CanonBridge No-Code API Integration Kanıt Senaryoları

Bu doküman, CanonBridge projesinin ana ürün iddiasını kanıtlamak için gereken kabul, kanıt ve test senaryolarını tanımlar:

> CanonBridge, business kullanıcıların kod yazmadan farklı API, webhook, SOAP, Kafka ve dosya/event kaynaklarını canonical modele bağlayabildiği no-code integration platformudur.

Amaç yalnızca servislerin ayağa kalktığını göstermek değildir. Amaç şunları kanıtlamaktır:

- Farklı integration tipleri aynı no-code modelle tanımlanır.
- Business kullanıcı Mapping Studio üzerinden kaynak sample'ı içeri alır, field mapping yapar, preview eder ve publish eder.
- Publish edilen integration runtime tarafından gerçek event/API trafiğinde kullanılır.
- REST, webhook, SOAP/XML, Kafka, scheduled polling, outbound API enrichment ve DLQ replay gibi farklı akışlar ortak integration lifecycle içinde çalışır.
- JSON, XML/SOAP, nested payload, array, enum, tarih, para ve optional field dönüşümleri kod yazmadan yönetilir.
- Credential, authentication, retry, timeout, rate limit, masking ve audit gibi enterprise ihtiyaçları no-code integration akışının parçasıdır.
- Transformer doğru, deterministik ve valid canonical çıktı üretir.
- Kafka, retry, DLQ, idempotency ve outbox davranışları veri kaybını engeller.
- Sistem kötü veri, duplicate event, geçici dependency hatası, yavaş downstream ve deploy/restart altında tutarlı kalır.
- UI, API, transformer, mock servisler ve altyapı birlikte uçtan uca çalışır.
- Güvenlik, gözlemlenebilirlik, performans ve operasyon kabiliyetleri ölçülebilir kanıt üretir.

Bu doküman bir "demo script" değil, ürün kabul planıdır. Demo başarılı olabilir ama kabul başarısız olabilir. Kabul için her senaryonun no-code kurulum adımları, runtime çıktısı ve operasyonel kanıtı saklanmalıdır.

---

## 0. Ürün İddiası ve Kanıt Mantığı

CanonBridge'in pazardaki ana vaadi şudur:

```text
Yeni bir partner entegrasyonu için custom adapter kodu yazmak yerine:

1. Kaynağı seç
2. Örnek payload'u al
3. Auth/credential bilgilerini güvenli tanımla
4. Alanları canonical modele map et
5. Preview/test et
6. Publish et
7. Canlı trafikte izle
8. Hata olursa DLQ'dan sample'a dönüştürüp düzelt
```

Bu nedenle kabul senaryoları sadece "PayFlex çalıştı" gibi tekil entegrasyonlardan oluşmamalıdır. Her senaryo şu soruya cevap vermelidir:

> Bu integration tipi business kullanıcı tarafından kod yazmadan tanımlanabiliyor, test edilebiliyor, yayınlanabiliyor ve işletilebiliyor mu?

### Kanıtlanması Gereken Integration Tipleri

| Integration tipi | Örnek partner | Kaynak formatı | Trigger | CanonBridge kanıtı |
|---|---|---|---|---|
| Inbound webhook | PayFlex | JSON | HTTP POST | Webhook auth, raw event, canonical transform |
| Inbound REST API | Partner REST push veya manual test | JSON | HTTP POST/PUT | Request body/header mapping, API key/JWT |
| Outbound REST polling | PayFlex transaction query | JSON | Schedule/manual | Credential, query params, response mapping |
| SOAP/XML API | FastCargo | SOAP XML | Manual/scheduled call | XML parse, SOAP fault handling, canonical shipment |
| Kafka event stream | ShopMax | JSON event | Kafka topic | Topic-based resolution, consumer group, canonical output |
| File/batch import | Marketplace CSV/JSONL feed | CSV/JSONL/JSON | Upload/scheduled file pickup | Row-level mapping, partial failure, batch report |
| API enrichment | Order event + customer lookup | JSON + REST response | Inline outbound call | Multi-step mapping, timeout/retry, secret masking |
| DLQ replay/fix loop | Any failed partner | Original failed payload | Operator action | No-code fix draft, preview, publish, replay |

Not: Bazı tipler MVP'de tam runtime olarak tamamlanmamış olabilir. Bu durumda doküman, "kanıtlandı", "kısmen kanıtlandı" ve "backlog" ayrımını açıkça göstermelidir. Ürün iddiası açısından boş kalan integration tipi varsa bu release notunda risk olarak yazılmalıdır.

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
| No-code integration builder | Kaynak seçimi, sample alma, auth tanımı, mapping, preview, publish | `mapping-studio-ui`, `services/mapping-studio-api` |
| Partner ingress | Webhook, REST, SOAP, Kafka, batch kaynaklarından veri kabulü | `services/webhook-receiver`, `services/canonbridge-mock`, Kafka |
| Outbound API integration | REST/SOAP çağrısı, credential resolver, timeout/retry, response mapping | Mapping Studio API outbound services, mock APIs |
| Mapping lifecycle | Draft, preview, publish, immutable version, rollback | `mapping-studio-ui`, `services/mapping-studio-api` |
| Transformation | JSONata mapping, Ajv validation, schema version resolution | `services/transformer` |
| Error handling | Validation error, transient error, retry, DLQ | Transformer, Kafka topics |
| Business reliability | Idempotency, ordering, outbox, DB transaction | Mapping Studio API/business service code paths |
| Security | API key/JWT, webhook auth, credential encryption, masking, rate limit | API, webhook receiver, credential services |
| Observability | Health, metrics, logs, correlation ID, dashboards | Prometheus, Grafana, service logs |
| Performance | Throughput, p95/p99 latency, lag, memory, worker pool | Transformer, Kafka, Kubernetes/Docker |
| Operations | Deploy, graceful shutdown, rollback, DR, runbooks | Docker Compose, Kubernetes manifests, docs/operations |

---

## 3.1 No-Code Integration Coverage Matrisi

Bu matristeki amaç, CanonBridge'in yalnızca bir transformer olmadığını; business kullanıcının farklı entegrasyon tiplerini aynı ürün deneyimiyle kurabildiğini kanıtlamaktır.

| ID | Integration tipi | No-code kurulumda kullanıcı ne yapar? | Örnek senaryo | Runtime kanıtı |
|---|---|---|---|---|
| NC-001 | Webhook JSON inbound | Webhook source seçer, secret/header tanımlar, sample payload alır, canonical alanlara map eder | PayFlex `payment.completed` | HTTP webhook -> raw topic -> canonical payment |
| NC-002 | REST JSON inbound | REST endpoint contract tanımlar, request body/header mapping yapar | Generic partner order push | HTTP request -> validation -> canonical order |
| NC-003 | Outbound REST pull | Base URL, auth, method, path, query params ve schedule tanımlar | PayFlex transaction detail lookup | Scheduled/manual call -> response mapping -> canonical payment detail |
| NC-004 | SOAP/XML | WSDL/endpoint veya sample SOAP response tanımlar, XML alanlarını canonical modele map eder | FastCargo shipment tracking | SOAP response -> normalized JSON -> canonical shipment |
| NC-005 | Kafka inbound | Topic, key strategy, envelope/topic partner resolution tanımlar | ShopMax `order.created` | Kafka raw topic -> transformer -> canonical order |
| NC-006 | File/batch | CSV/JSONL/JSON file sample yükler, kolon/field mapping yapar | Marketplace daily product feed | Batch rows -> canonical events + row error report |
| NC-007 | API enrichment | Ana event'e ek olarak outbound lookup step'i ekler | Order event -> customer API lookup | Combined payload -> enriched canonical order |
| NC-008 | Error recovery | DLQ payload'u sample olarak draft'a alır, mapping/schema düzeltir | Invalid PayFlex payload | DLQ -> fix draft -> publish -> replay success |
| NC-009 | Versioning/rollback | v1/v2 mapping versiyonlarını UI'da yönetir | Hatalı status enum mapping rollback | Active version switch -> runtime output change |
| NC-010 | Monitoring/operation | Partner health, DLQ, throughput ve errors izler | Mixed partner traffic | Dashboard/metrics/audit evidence |

Her NC senaryosunda aşağıdaki üç kanıt birlikte aranır:

1. **No-code setup kanıtı**: UI/API üzerinden integration tanımı, credential metadata, sample, mapping rule ve publish kaydı.
2. **Runtime kanıtı**: Gerçek HTTP/SOAP/Kafka/file event'i canonical output üretir veya beklenen DLQ/retry davranışını gösterir.
3. **Operasyon kanıtı**: Audit log, metric, structured log, health/readiness veya dashboard üzerinde iz bırakır.

### MVP Durum Etiketi

Her integration tipi test run sonunda şu etiketlerden biriyle raporlanmalıdır:

| Etiket | Anlamı |
|---|---|
| `PROVEN` | UI/API kurulumu ve runtime akışı uçtan uca kanıtlandı |
| `RUNTIME_ONLY` | Runtime çalışıyor, no-code kurulum deneyimi eksik veya manuel |
| `DESIGN_ONLY` | Mimari/doküman var, çalışan runtime yok |
| `PARTIAL` | Ana akış çalışıyor ama auth, schedule, replay veya observability eksik |
| `BLOCKED` | Ürün iddiasını desteklemek için kritik eksik var |

Release notunda en az NC-001, NC-004, NC-005 ve NC-008 `PROVEN` veya açıkça gerekçelendirilmiş `PARTIAL` olmalıdır. No-code API integration ana iddiası için NC-003 ve NC-007 de production öncesi kritik kabul edilir.

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
| No-code authoring coverage | Evet | En az webhook, REST/Kafka, SOAP ve DLQ fix flow no-code kurulabilir |
| Integration type coverage | Evet | Her desteklenen integration tipi `PROVEN/PARTIAL/DESIGN_ONLY` etiketiyle raporlanır |
| Mapping fixture validation | Evet | Tüm mapping fixture çiftleri beklenen canonical çıktıyı üretir |
| Schema compatibility | Evet | Backward incompatible değişiklik versiyonsuz geçmez |
| Core E2E | Evet | PayFlex, FastCargo, ShopMax akışları geçer |
| Outbound API E2E | Beta/GA için evet | Credential'lı REST/SOAP outbound çağrı ve response mapping kanıtlanır |
| DLQ/retry | Evet | Bad payload DLQ'ya, transient hata retry'a gider |
| Security smoke | Evet | Yetkisiz istekler reddedilir, secret/PII loglanmaz |
| Observability smoke | Evet | Health, metrics, structured logs görünür |
| Load smoke | Evet | MVP hedefleri altında lag büyümez |
| Full production readiness | GA için evet | `docs/operations/11-production-readiness.md` tamamlanır |

---

## 6. Komut Bazlı Temel Kanıt Paketi

Bu bölüm, "önce projeyi kırık mı değil mi görelim" kanıtıdır. No-code API integration iddiası için bu komutlar tek başına yeterli değildir; sadece teknik baseline sağlar. Asıl ürün kanıtı, Section 3.1 ve Section 7'deki integration type coverage ile tamamlanır.

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

Bu bölümdeki her senaryo iki açıdan değerlendirilmelidir:

- **No-code authoring**: Integration Mapping Studio/API üzerinden kod yazmadan tanımlanabiliyor mu?
- **Runtime execution**: Tanımlanan integration gerçek protokolüyle çalışıp canonical çıktı üretiyor mu?

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
- Webhook source, secret header ve mapping rule'ları UI/API üzerinden no-code tanımlanabilir.

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
- Topic adı, key strategy ve partner/event resolution no-code integration metadata'sında tanımlanabilir.

### E2E-006 Inbound REST API Push

Amaç: Webhook dışındaki standart REST JSON push entegrasyonlarının da no-code tanımlanabildiğini kanıtlamak.

Örnek:

```text
Partner REST client
  -> CanonBridge inbound REST endpoint
  -> Request body/header validation
  -> Transformer
  -> canonical.customer.updated veya canonical.order.created
```

No-code kurulum:

1. Kullanıcı `REST inbound` source seçer.
2. HTTP method, path, required headers ve auth tipi tanımlar.
3. Sample JSON request body yükler.
4. Request body alanlarını canonical modele map eder.
5. Header veya path parametrelerini mapping expression içinde kullanır.
6. Preview yapar ve publish eder.

Test örneği:

```bash
curl -i -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: generic-rest-partner" \
  -H "X-Event-Type: customer.updated" \
  -d '{
    "customer_id": "CUST-1001",
    "email": "ada@example.com",
    "status": "active",
    "updated_at": "2026-05-13T09:00:00Z"
  }'
```

Başarı kriterleri:

- REST source no-code tanımlanır.
- Request validation required body/header alanlarını uygular.
- Canonical output schema-valid olur.
- Auth eksikse request reddedilir.
- Header/path/body alanları mapping'de kullanılabilir.

### E2E-007 Outbound REST Polling

Amaç: CanonBridge'in yalnızca gelen eventleri değil, dış REST API'lerden veri çekme entegrasyonlarını da no-code kurabildiğini kanıtlamak.

Örnek:

```text
Schedule/manual trigger
  -> PayFlex REST API transaction query
  -> Credential resolver
  -> Response mapping
  -> canonical.payment.detail
```

No-code kurulum:

1. Kullanıcı `Outbound REST` integration tipi seçer.
2. Base URL, method, path template ve query params tanımlar.
3. Credential tipi seçer: API key, bearer token, basic auth veya OAuth2 client credentials.
4. Timeout, retry ve rate limit ayarlarını girer.
5. Response sample'ını import eder.
6. Response alanlarını canonical modele map eder.
7. Manual test veya schedule ile çalıştırır.

Test örneği:

```bash
curl -i http://localhost:8080/api/payflex/transactions/TXN-12345 \
  -H "X-API-Key: demo-api-key-12345"
```

Başarı kriterleri:

- Credential secret write-only kalır.
- API key/bearer/basic auth header'ı runtime'da eklenir ama loglanmaz.
- 200 response canonical output üretir.
- 401/403 credential error olarak sınıflandırılır.
- 404 business-not-found olarak yönetilir.
- 500/502/503/504 transient retry politikasına girer.

### E2E-008 SOAP/XML API Integration

Amaç: SOAP/XML legacy API'lerin de no-code integration modeliyle temsil edilebildiğini kanıtlamak.

Bu senaryo E2E-004'ün ürün odaklı genişletilmiş halidir.

No-code kurulum:

1. Kullanıcı `SOAP/XML` integration tipi seçer.
2. Endpoint, SOAPAction, auth ve request template tanımlar.
3. XML response sample'ı yükler veya mock response alır.
4. XML path alanlarını canonical modele map eder.
5. SOAP fault mapping kurallarını tanımlar.
6. Preview/test çalıştırır ve publish eder.

Başarı kriterleri:

- XML namespace'leri doğru parse edilir.
- SOAP body içindeki alanlar canonical modele taşınır.
- SOAP Fault success event üretmez.
- Basic auth/credential loglarda maskelenir.
- Aynı no-code publish/versioning akışına dahildir.

### E2E-009 File / Batch Import

Amaç: API dışı batch entegrasyon ihtiyacının da ürün kapsamına alınabileceğini ve kabul kriterlerinin net olduğunu göstermek.

Örnek:

```text
Marketplace daily CSV feed
  -> File upload veya scheduled pickup
  -> Row parser
  -> Row-level mapping
  -> canonical.product.updated events
  -> Batch report
```

No-code kurulum:

1. Kullanıcı `File/batch` source seçer.
2. CSV, JSONL veya JSON array sample yükler.
3. Delimiter, header row, encoding ve date/number formatlarını tanımlar.
4. Kolonları canonical modele map eder.
5. Row-level validation kurallarını belirler.
6. Batch preview ile success/error row sayısını görür.
7. Publish eder.

Başarı kriterleri:

- Valid rows canonical event'e dönüşür.
- Invalid rows tüm batch'i düşürmeden row error report'a yazılır.
- Batch report success/failed/skipped sayıları verir.
- Re-run idempotency veya duplicate handling politikası belgelenir.
- Bu runtime henüz implement değilse senaryo `DESIGN_ONLY` veya `PARTIAL` olarak açık işaretlenir.

### E2E-010 API Enrichment / Multi-Step Integration

Amaç: Tek payload mapping'in ötesinde, event işlenirken dış API'den zenginleştirme yapılabildiğini kanıtlamak.

Örnek:

```text
ShopMax order.created
  -> Extract customerId
  -> Customer REST API lookup
  -> Merge order + customer response
  -> canonical.order.created enriched
```

No-code kurulum:

1. Kullanıcı ana source olarak Kafka/REST/Webhook seçer.
2. Mapping flow'a `Outbound REST lookup` step'i ekler.
3. Lookup request path/query parametresini ana payload'dan bağlar.
4. Credential seçer.
5. Response sample'ını canonical mapping'e dahil eder.
6. Timeout/fallback politikasını tanımlar.

Başarı kriterleri:

- Lookup başarılıysa canonical event enriched alanları içerir.
- Lookup timeout olursa configured fallback/retry uygulanır.
- Credential secret görünmez.
- Enrichment failure'ın DLQ mı partial success mi olacağı integration metadata'sında açıkça tanımlıdır.
- Audit log multi-step flow'u takip edilebilir kılar.

### E2E-011 Mapping Studio Draft to Publish

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
- Integration type metadata'sı mapping version ile birlikte saklanır.
- Aynı authoring deneyimi REST, webhook, SOAP ve Kafka senaryolarında tekrar kullanılabilir.

Kanıt:

- UI ekran görüntüleri
- API request/response kayıtları
- DB `mapping_drafts` ve `mapping_versions` kayıtları
- Transformer reload sonucu
- Runtime transform çıktısı

### E2E-012 Mapping Rollback

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

### E2E-013 DLQ to Fix Draft Loop

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
| Build/test baseline | 10 | Tüm build ve unit testler geçer |
| No-code integration authoring | 20 | Kaynak seçimi, credential, sample, mapping, preview, publish akışı çalışır |
| Integration type coverage | 20 | Webhook, REST, SOAP/XML, Kafka, outbound API ve DLQ fix loop kanıtlanır veya açık etiketlenir |
| Core transformation | 15 | Fixture, schema, JSONata, version resolution geçer |
| E2E journeys | 15 | PayFlex, FastCargo, ShopMax, REST/outbound ve Mapping Studio publish geçer |
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

No-code authoring olmadan yalnızca runtime transformer testleri geçiyorsa skor en fazla 70 kabul edilmelidir. Çünkü ürün iddiası "kod yazmadan integration kurmak"tır; sadece backend transform başarısı bu iddiayı tek başına kanıtlamaz.

---

## 21. Integration Coverage Rapor Şablonu

Her kabul koşusunda bu tablo doldurulmalıdır:

| Integration tipi | MVP durumu | No-code setup kanıtı | Runtime kanıtı | Eksik/risk |
|---|---|---|---|---|
| Webhook JSON inbound |  |  |  |  |
| REST JSON inbound |  |  |  |  |
| Outbound REST polling |  |  |  |  |
| SOAP/XML |  |  |  |  |
| Kafka inbound |  |  |  |  |
| File/batch |  |  |  |  |
| API enrichment |  |  |  |  |
| DLQ replay/fix loop |  |  |  |  |
| Versioning/rollback |  |  |  |  |
| Monitoring/operation |  |  |  |  |

Karar kuralı:

- `PROVEN`: Sales demo, beta ve production claim için kullanılabilir.
- `PARTIAL`: Demo'da gösterilebilir ama eksik açıkça söylenmelidir.
- `DESIGN_ONLY`: Ürün vizyonu olarak anlatılabilir, çalışan özellik gibi sunulmamalıdır.
- `BLOCKED`: Release riskidir.

---

## 22. Final Sign-off Şablonu

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
- [ ] No-code integration authoring
- [ ] Integration type coverage matrix
- [ ] Integration tests
- [ ] Contract tests
- [ ] Core E2E
- [ ] Outbound API E2E
- [ ] DLQ/retry
- [ ] Security smoke
- [ ] Observability smoke
- [ ] Load smoke
- [ ] Deploy/rollback smoke

## Evidence
- Build logs:
- Test reports:
- No-code setup screenshots:
- Published integration IDs:
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

## 23. En Kısa "No-Code API Integration Çalışıyor" Demo Paketi

Zaman çok sınırlıysa, aşağıdaki paket minimum ikna setidir. Bu production kabul yerine geçmez ama projenin ana ürün iddiasının gerçek olduğunu güçlü biçimde gösterir.

1. Mapping Studio'da yeni integration oluştur: source type olarak `Webhook JSON` seç.
2. PayFlex sample payload'u yükle, credential/header secret tanımla, fields -> canonical payment mapping yap.
3. Preview çalıştır, publish et, published version ID göster.
4. Gerçek PayFlex webhook request gönder ve canonical payment output'u göster.
5. Aynı no-code akışla `Kafka inbound` integration göster: ShopMax topic + sample + mapping + canonical order.
6. Aynı no-code akışla `SOAP/XML` integration göster: FastCargo SOAP response sample + XML field mapping + canonical shipment.
7. Outbound REST capability göster: PayFlex transaction API credential metadata + response mapping + successful test call.
8. Invalid payload gönder, DLQ'ya düşür, DLQ payload'unu sample olarak fix draft'a import et.
9. Mapping düzeltmesini preview et, publish et, replay ile success göster.
10. `/metrics`, health endpoint'leri, audit log ve structured correlation log'larını canlı göster.

Bu 10 madde canlı ve kanıtlı gösterilebiliyorsa proje "sadece transformer değil, no-code integration platform çekirdeği var" seviyesini ispatlar.

---

## 24. İlgili Dokümanlar

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
