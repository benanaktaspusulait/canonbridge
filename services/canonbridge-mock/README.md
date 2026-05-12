# CanonBridge Mock API ve Simülasyon Ortamı Tasarım Dokümanı

## 1. Amaç

`canonbridge-mock`, CanonBridge platformunun gerçek backend servisleri tamamlanmadan önce Mapping Studio UI'ını test etmek, satış demosu yapmak, entegrasyon senaryolarını göstermek ve hata yönetimi davranışlarını doğrulamak için tasarlanacak bağımsız bir mock/simülasyon ortamıdır.

Bu ortamın temel hedefi yalnızca birkaç statik endpoint sunmak değildir. Hedef, CanonBridge'in gerçek hayatta karşılaşacağı dış sistem çeşitliliğini kontrollü, tekrar üretilebilir ve demo dostu bir şekilde modellemektir:

- REST API ile veri çekme
- SOAP API ile eski sistem entegrasyonu
- Kafka topic'lerinden ham olay tüketme
- Webhook ile olay alma
- Scheduled poll davranışını simüle etme
- API key, Basic Auth ve OAuth2 Client Credentials akışlarını gösterme
- Başarılı ve hatalı partner payload'larını Mapping Studio içinde dönüştürmeye hazır hale getirme
- Retry, DLQ, validation error, timeout ve authentication error gibi operasyonel durumları göstermek

Bu doküman implementasyona geçmeden önce kapsamı, servis sınırlarını, senaryoları, veri şekillerini ve kabul kriterlerini netleştirir.

## 2. Konum ve Proje Sınırı

Mock servis, monorepo içinde aşağıdaki konumda yaşamalıdır:

```text
services/canonbridge-mock/
```

Bu servis CanonBridge'in üretim backend'i değildir. Üretim kodundan bağımsız, demo ve test amaçlı bir companion service olarak ele alınmalıdır.

Mock ortamının sorumlulukları:

- Dış partner sistemlerini temsil eden mock endpoint'ler sağlamak
- Kafka topic'lerine örnek raw event üretmek
- Webhook alımını görünür kılmak
- Mapping Studio UI için gerçekçi input payload'ları sunmak
- Hata senaryolarını kontrollü biçimde tetiklemek
- Geliştirici ve satış demo akışını tek komutla çalıştırılabilir hale getirmek

Mock ortamının sorumluluğu olmayan konular:

- Canonical dönüşüm motorunu uygulamak
- Mapping Studio UI davranışlarını değiştirmek
- Üretim credential store yazmak
- Gerçek partner sistemlerine bağlanmak
- Kalıcı, production-grade event storage sağlamak
- Güvenlik kontrollerini production seviyesinde uygulamak

## 3. Ana Kullanıcılar

Bu ortam üç farklı kullanıcı profiline hizmet eder.

### 3.1. Ürün ve Satış Ekibi

Satış demosunda CanonBridge'in farklı sektörlerden veri alıp normalize edebildiğini göstermek ister.

Beklentiler:

- Ortam tek komutla ayağa kalkmalı
- Demo script'i beş dakika içinde uçtan uca hikaye anlatmalı
- Başarılı ve hatalı senaryolar kolayca tetiklenmeli
- UI'da gösterilecek payload'lar gerçekçi ve etkileyici olmalı

### 3.2. Frontend Geliştiricileri

Mapping Studio UI'ında mapping, validation, test run, error display ve connector configuration ekranlarını gerçekçi veriyle test etmek ister.

Beklentiler:

- Aynı iş verisinin farklı partner formatları bulunmalı
- JSON/XML payload'lar alan çeşitliliği içermeli
- Auth, timeout ve invalid payload gibi edge case'ler bulunmalı
- Endpoint listesi açık ve stabil olmalı

### 3.3. Backend ve Platform Geliştiricileri

İleride yazılacak gerçek CanonBridge backend bileşenlerinin connector, ingestion, retry ve DLQ davranışlarını test etmek ister.

Beklentiler:

- Kafka topic isimleri CanonBridge standardına uygun olmalı
- Event payload'ları envelope ve raw body ayrımını test edebilmeli
- Hata senaryoları tekrar üretilebilir olmalı
- Docker Compose ağı gerçek entegrasyon testlerine uygun olmalı

## 4. Yüksek Seviye Mimari

Mock ortamı Docker Compose ile yönetilen, aynı sanal ağ içinde çalışan servislerden oluşmalıdır.

Planlanan bileşenler:

| Bileşen | Amaç | Port | Teknoloji |
|---|---:|---:|---|
| REST Mock | PayFlex ve ShopMax REST API endpoint'leri | 8080 | WireMock |
| SOAP Mock | FastCargo SOAP tracking servisi | 8081 | WireMock |
| Kafka Broker | Raw event ve scheduled update topic'leri | 9092 | Apache Kafka KRaft |
| Webhook Receiver | PayFlex ödeme webhook'larını yakalama | 3000 | Express.js |
| Kafka Init | Topic oluşturma | İç servis | Kafka CLI |
| Event Generator | Periyodik demo event üretimi | İç servis | Shell/Kafka CLI |
| Demo Script | Beş dakikalık satış demo akışı | Lokal script | Shell |

Önerilen servis ilişkisi:

```text
Mapping Studio UI / CanonBridge backend
    |
    | REST
    v
WireMock REST Mock
    |
    | SOAP
    v
WireMock SOAP Mock

CanonBridge Kafka Consumer <--- Kafka Broker <--- Event Generator

Partner Webhook Simulator ---> Webhook Receiver
```

## 5. Planlanan Dosya Yapısı

Hedef dosya yapısı aşağıdaki gibi olmalıdır:

```text
services/canonbridge-mock/
├── README.md
├── docker-compose.yml
├── wiremock/
│   ├── Dockerfile
│   ├── __files/
│   │   ├── payflex/
│   │   └── shopmax/
│   └── mappings/
├── soap-mock/
│   ├── Dockerfile
│   ├── wsdl/
│   └── mappings/
├── kafka/
│   └── docker-compose.kafka.yml
├── webhook-receiver/
│   ├── Dockerfile
│   ├── package.json
│   ├── app.js
│   └── webhooks/
├── scripts/
│   ├── init-kafka.sh
│   ├── send-mock-events.sh
│   ├── trigger-webhook.sh
│   └── demo.sh
└── docs/
    ├── scenarios.md
    ├── payload-catalog.md
    └── demo-runbook.md
```

Bu yapı içinde `README.md` kullanıcı odaklı ana doküman, `docs/` altındaki dosyalar ise daha detaylı senaryo ve payload katalogları için kullanılabilir.

## 6. Simüle Edilecek Partner Sistemleri

Mock ortamı üç sektörü kapsamalıdır:

1. Finans: PayFlex ödeme kuruluşu
2. Lojistik: FastCargo kargo firması
3. E-ticaret: ShopMax pazar yeri

Her partner için en az iki format varyasyonu, bir başarılı senaryo ve birden fazla hata senaryosu bulunmalıdır.

## 7. PayFlex Finans Senaryosu

### 7.1. İş Hikayesi

PayFlex, CanonBridge müşterisinin ödeme emirlerini aldığı dış ödeme kuruluşudur. CanonBridge, PayFlex'ten hem REST API ile ödeme sorgular hem de ödeme onayı webhook'larını alır.

Bu senaryo Mapping Studio'da şu yetenekleri göstermelidir:

- REST connector yapılandırması
- API key credential kullanımı
- Nested JSON alan eşleme
- Alternatif partner formatı yönetimi
- Eksik zorunlu alan validasyonu
- Yetkisiz istek hatası
- Sunucu hatası ve retry/DLQ davranışı
- Webhook ingestion

### 7.2. REST Endpoint'leri

| Endpoint | Method | Auth | Amaç |
|---|---:|---|---|
| `/api/payments/latest` | GET | API Key | Son ödeme emrini döndürür |
| `/api/payments/query` | POST | API Key | Tarih aralığına göre ödeme emirlerini döndürür |
| `/api/payments/latest?format=flat` | GET | API Key | Alternatif düz format döndürür |
| `/api/payments/query?scenario=missing-amount` | POST | API Key | Eksik amount alanı hatası döndürür |
| `/api/payments/query?scenario=server-error` | POST | API Key | 500 server error döndürür |
| `/api/payments/query?scenario=rate-limit` | POST | API Key | 429 rate limit döndürür |
| `/api/payments/query?scenario=timeout` | POST | API Key | Gecikmeli yanıt simüle eder |

### 7.3. Auth Kuralı

PayFlex endpoint'leri `X-API-Key` header'ı beklemelidir.

Geçerli demo anahtar:

```text
demo-api-key-12345
```

Geçersiz veya eksik API key durumunda `401 Unauthorized` dönmelidir.

### 7.4. Format A: Detaylı Nested JSON

Format A gerçekçi, kurumsal ödeme payload'ı gibi tasarlanmalıdır.

Temel alan grupları:

- Payment identity
- Merchant identity
- Amount and currency
- Payer details
- Beneficiary details
- Risk signals
- Settlement details
- Metadata and correlation ids

Mapping Studio'da gösterilecek olası canonical hedef alanlar:

| Partner Alanı | Canonical Alan |
|---|---|
| `payment.id` | `paymentId` |
| `payment.amount.value` | `amount` |
| `payment.amount.currency` | `currency` |
| `payer.account.iban` | `payerIban` |
| `beneficiary.account.iban` | `beneficiaryIban` |
| `settlement.expectedDate` | `settlementDate` |
| `risk.score` | `riskScore` |

### 7.5. Format B: Düz JSON

Format B farklı partner sürümünü veya legacy exporter'ı temsil eder.

Örnek alan isimlendirme tarzı:

- `pay_id`
- `amt`
- `ccy`
- `src_iban`
- `dst_iban`
- `merchant_ref`
- `created_ts`
- `risk_lvl`

Bu format, aynı iş verisinin farklı isimlendirme ve düz yapı ile geldiğini göstermek için kullanılmalıdır.

### 7.6. PayFlex Hata Senaryoları

| Senaryo | HTTP Status | Amaç |
|---|---:|---|
| Eksik API key | 401 | Credential configuration test |
| Geçersiz API key | 401 | Auth failure test |
| Eksik amount | 400 | Schema validation test |
| Geçersiz JSON | 400 | Parser error test |
| Rate limit | 429 | Retry policy test |
| Timeout/gecikme | 200 veya 504 | Timeout handling test |
| Server error | 500 | DLQ/retry behavior test |

### 7.7. PayFlex Webhook

Webhook receiver aşağıdaki endpoint'i sunmalıdır:

| Endpoint | Method | Amaç |
|---|---:|---|
| `/webhook/payment` | POST | Ödeme onayı bildirimi yakalar |

Webhook payload'ı aşağıdaki bilgileri içermelidir:

- Event id
- Event type
- Payment id
- Merchant id
- Status
- Confirmed amount
- Currency
- Confirmation timestamp
- Signature/correlation metadata

Webhook receiver, gelen son event'leri görüntülemek için ayrıca bir listeleme endpoint'i sağlamalıdır:

| Endpoint | Method | Amaç |
|---|---:|---|
| `/webhooks` | GET | Yakalanan webhook kayıtlarını listeler |

## 8. FastCargo Lojistik Senaryosu

### 8.1. İş Hikayesi

FastCargo, eski tip SOAP servisiyle çalışan bir lojistik sağlayıcısıdır. CanonBridge, kargo takip numarasını SOAP üzerinden sorgular ve scheduled poll mantığıyla kargo durum güncellemelerini Kafka'dan alır.

Bu senaryo Mapping Studio'da şu yetenekleri göstermelidir:

- SOAP connector davranışı
- XML parsing ve namespace yönetimi
- Basic Auth credential kullanımı
- SOAP Fault hata gösterimi
- Scheduled polling benzeri event akışı
- Kafka raw event mapping

### 8.2. SOAP Endpoint'leri

| Endpoint | Method | Auth | Amaç |
|---|---:|---|---|
| `/ws/track` | POST | Basic Auth | Kargo takip sorgusu |
| `/wsdl/fastcargo.wsdl` | GET | Yok | Demo WSDL dosyası |

### 8.3. Basic Auth Kuralı

FastCargo SOAP endpoint'i Basic Auth beklemelidir.

Demo credential:

```text
username: fastcargo-demo
password: fastcargo-secret
```

Yetkisiz isteklerde `401 Unauthorized` dönmelidir.

### 8.4. Başarılı SOAP Yanıtı

Başarılı takip yanıtı aşağıdaki bilgileri içermelidir:

- Tracking number
- Shipment id
- Current status
- Last checkpoint
- Delivered timestamp
- Receiver city
- Carrier branch
- Proof of delivery reference

Minimum iş sonucu:

```text
status = DELIVERED
```

### 8.5. SOAP Fault Yanıtı

Bulunamayan takip numarası için SOAP Fault dönmelidir.

Ana hata mesajı:

```text
Tracking Number Not Found
```

Bu senaryo UI'ın SOAP fault içeriğini, hata kodunu ve raw response detayını gösterebilmesini test eder.

### 8.6. Scheduled Poll Simülasyonu

FastCargo scheduled poll gerçek bir cron job yerine Kafka event generator ile simüle edilmelidir.

Topic:

```text
cargo.updates
```

Davranış:

- Her 2 dakikada bir yeni cargo update event'i üretilir
- Event içinde tracking number, status, checkpoint, timestamp ve route bilgisi bulunur
- Bazı event'ler sıradışı statüler içerebilir: `DELAYED`, `CUSTOMS_HOLD`, `ADDRESS_EXCEPTION`

## 9. ShopMax E-Ticaret Senaryosu

### 9.1. İş Hikayesi

ShopMax, CanonBridge müşterisinin sipariş aldığı pazar yeridir. Siparişler hem REST API üzerinden sorgulanabilir hem de Kafka raw event olarak akabilir.

Bu senaryo Mapping Studio'da şu yetenekleri göstermelidir:

- OAuth2 Client Credentials token alma
- Bearer token ile REST endpoint çağırma
- E-ticaret order payload mapping
- Line item, shipment, customer, discount, tax alanlarının dönüştürülmesi
- Kafka raw order event mapping
- Compact ve detailed format farkı
- 503 servis kesintisi senaryosu

### 9.2. OAuth2 Token Endpoint'i

| Endpoint | Method | Auth | Amaç |
|---|---:|---|---|
| `/oauth/token` | POST | Client Credentials | Access token üretir |

Demo credential:

```text
client_id: shopmax-demo-client
client_secret: shopmax-demo-secret
grant_type: client_credentials
```

Token response aşağıdaki alanları içermelidir:

- `access_token`
- `token_type`
- `expires_in`
- `scope`

### 9.3. REST Endpoint'leri

| Endpoint | Method | Auth | Amaç |
|---|---:|---|---|
| `/api/orders/recent` | GET | Bearer Token | Son siparişleri döndürür |
| `/api/orders/recent?format=compact` | GET | Bearer Token | Kompakt formatta sipariş döndürür |
| `/api/orders/recent?scenario=unavailable` | GET | Bearer Token | 503 servis kesintisi döndürür |
| `/api/orders/recent?scenario=rate-limit` | GET | Bearer Token | 429 rate limit döndürür |

### 9.4. Format A: Geniş Sipariş JSON'u

Format A, pazar yeri siparişinin ayrıntılı hali olmalıdır.

Alan grupları:

- Order identity
- Marketplace identity
- Buyer profile
- Billing address
- Shipping address
- Line items
- Product identifiers
- Discounts
- Tax breakdown
- Payment summary
- Fulfillment instruction
- SLA/estimated delivery dates
- Metadata and correlation ids

Mapping Studio için bu format, nested array mapping ve monetary transformation senaryolarında kullanılmalıdır.

### 9.5. Format B: Kompakt Sipariş JSON'u

Format B daha küçük, farklı isimlendirme kullanan bir event/export formatını temsil etmelidir.

Örnek alan isimlendirme tarzı:

- `oid`
- `buyer`
- `ship_to`
- `lines`
- `sku`
- `qty`
- `gross`
- `cur`
- `ts`

Bu format, Mapping Studio'nun farklı partner şemalarına aynı canonical modele mapping yapabilmesini göstermek için kullanılmalıdır.

### 9.6. Kafka Topic

Topic:

```text
partner.shopmax.raw
```

Davranış:

- Her 30 saniyede bir örnek sipariş event'i üretilir
- Event key order id olmalıdır
- Event payload raw partner formatını içermelidir
- Bazı event'ler hata testleri için eksik veya bozuk alanlarla üretilebilir

## 10. Kafka Topic Kataloğu

Mock ortamının oluşturması gereken topic'ler:

| Topic | Üreten | Tüketen | Amaç |
|---|---|---|---|
| `partner.payflex.raw` | Demo script veya webhook bridge | CanonBridge | PayFlex raw payment event |
| `partner.shopmax.raw` | Event generator | CanonBridge | ShopMax raw order event |
| `cargo.updates` | Cargo poller | CanonBridge | FastCargo scheduled update |
| `canonbridge.retry.demo` | Test script | CanonBridge | Retry policy testi |
| `canonbridge.dlq.demo` | Test script | CanonBridge/UI | DLQ gösterimi |

Topic ayarları demo ortamında sade tutulabilir:

- Tek partition yeterlidir
- Replication factor `1` olmalıdır
- Retention kısa olabilir
- Auto-create kapalı olmalıdır; topic'ler init script ile açıkça oluşturulmalıdır

## 11. Güvenlik Simülasyonları

Mock ortam production güvenliği sağlamaz; ancak CanonBridge UI'da credential configuration ve auth failure davranışlarını göstermek için kontrollü auth simülasyonları sağlamalıdır.

### 11.1. API Key

Kullanıldığı yer:

```text
PayFlex REST API
```

Header:

```text
X-API-Key
```

Demo değer:

```text
demo-api-key-12345
```

### 11.2. Basic Auth

Kullanıldığı yer:

```text
FastCargo SOAP API
```

Credential:

```text
fastcargo-demo / fastcargo-secret
```

### 11.3. OAuth2 Client Credentials

Kullanıldığı yer:

```text
ShopMax REST API
```

Token endpoint:

```text
POST /oauth/token
```

Bearer token kullanılan endpoint:

```text
GET /api/orders/recent
```

## 12. Hata ve Edge Case Kataloğu

Mock ortamı yalnızca happy path üretmemelidir. Aşağıdaki hata kategorileri özellikle desteklenmelidir.

| Kategori | Örnek | Beklenen Test |
|---|---|---|
| Authentication | 401 invalid API key | Credential error display |
| Authorization | 403 insufficient scope | Permission error display |
| Validation | 400 missing amount | Schema validation |
| Parsing | malformed JSON/XML | Raw payload parser |
| Rate limiting | 429 too many requests | Retry/backoff policy |
| Temporary outage | 503 unavailable | Retry then DLQ |
| Server error | 500 internal error | Incident/error display |
| Timeout | delayed response | Connector timeout behavior |
| SOAP Fault | tracking not found | SOAP error parsing |
| Partial data | missing optional nested object | Mapping fallback/defaults |
| Type mismatch | amount as string instead of number | Validation and transform error |

## 13. Gecikme Simülasyonu

Gerçek dünya koşullarını göstermek için WireMock yanıtlarında kontrollü gecikmeler kullanılmalıdır.

Önerilen gecikme profilleri:

| Profil | Gecikme | Amaç |
|---|---:|---|
| Normal | 100-400 ms | Gerçekçi API hissi |
| Slow | 2-5 saniye | UI loading ve timeout yaklaşımı |
| Timeout | 10+ saniye | Connector timeout testi |

Demo sırasında default endpoint'ler hızlı kalmalı, gecikmeli endpoint'ler query parameter ile açıkça seçilmelidir.

## 14. Demo Akışı

Beş dakikalık satış demosu aşağıdaki hikayeyi anlatmalıdır.

### 14.1. Başlangıç

Anlatılacak mesaj:

```text
CanonBridge farklı partner sistemlerinden REST, SOAP, Kafka ve Webhook üzerinden veri alabilir.
Bu veriler farklı formatlarda gelse bile Mapping Studio içinde standart canonical modele dönüştürülebilir.
```

### 14.2. Adım 1: ShopMax Kafka Siparişi

Demo script Kafka'ya bir ShopMax sipariş event'i gönderir.

Gösterilecek yetenek:

- Event-driven ingestion
- Raw event visibility
- Order canonical mapping

### 14.3. Adım 2: PayFlex REST Başarılı Yanıt

Demo script PayFlex latest payment endpoint'ini çağırır.

Gösterilecek yetenek:

- API key credential
- REST connector
- Nested JSON mapping

### 14.4. Adım 3: FastCargo SOAP Başarılı Yanıt

Demo script SOAP tracking endpoint'ini çağırır.

Gösterilecek yetenek:

- Legacy SOAP integration
- XML transformation
- Basic Auth

### 14.5. Adım 4: PayFlex Eksik Alan Hatası

Demo script eksik amount senaryosunu tetikler.

Gösterilecek yetenek:

- Validation failure
- DLQ/retry karar noktası
- Hata detaylarının UI'da görünmesi

### 14.6. Adım 5: PayFlex Webhook

Demo script ödeme onayı webhook'u gönderir.

Gösterilecek yetenek:

- Inbound webhook handling
- Event correlation
- Payment status update

## 15. Mapping Studio İçin Beklenen Kullanım

Mapping Studio bu mock ortamı şu ekranlarda kullanabilmelidir:

| UI Alanı | Mock Kullanımı |
|---|---|
| External Systems | PayFlex, FastCargo, ShopMax connector tanımları |
| Credentials | API Key, Basic Auth, OAuth2 demo credential'ları |
| Mapping Studio | REST/SOAP/Kafka raw payload mapping |
| Test Runner | Başarılı ve hatalı örnek payload'lar |
| Monitoring | Event akışı, hata oranı, retry simülasyonu |
| DLQ | Invalid payload ve server error senaryoları |

## 16. Canonical Model Beklentileri

Mock payload'ları CanonBridge canonical modellerine bağlanabilir şekilde hazırlanmalıdır.

Önerilen canonical iş nesneleri:

| İş Nesnesi | Kaynak Partner | Örnek Canonical Alanlar |
|---|---|---|
| Payment | PayFlex | paymentId, amount, currency, payer, beneficiary, status |
| Shipment | FastCargo | trackingNumber, status, checkpoint, deliveryDate |
| Order | ShopMax | orderId, buyer, lineItems, totals, shippingAddress |

## 17. Ortam Değişkenleri

Mock servisler mümkün olduğunca varsayılanlarla çalışmalıdır. Gelişmiş kullanım için aşağıdaki environment variable'lar desteklenebilir.

| Değişken | Varsayılan | Amaç |
|---|---|---|
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:29092` | Container içi Kafka bağlantısı |
| `PAYFLEX_API_KEY` | `demo-api-key-12345` | PayFlex demo key |
| `SHOPMAX_CLIENT_ID` | `shopmax-demo-client` | OAuth client id |
| `SHOPMAX_CLIENT_SECRET` | `shopmax-demo-secret` | OAuth client secret |
| `FASTCARGO_USERNAME` | `fastcargo-demo` | SOAP Basic Auth username |
| `FASTCARGO_PASSWORD` | `fastcargo-secret` | SOAP Basic Auth password |
| `WEBHOOK_STORAGE_DIR` | `/app/webhooks` | Yakalanan webhook kayıtları |

## 18. Çalıştırma Deneyimi

Hedef geliştirici deneyimi:

```text
cd services/canonbridge-mock
docker compose up -d
./scripts/demo.sh
```

Ortam kapatma:

```text
docker compose down
```

Temiz sıfırlama:

```text
docker compose down -v
```

## 19. Gözlemlenebilirlik

Demo ortamında production observability şart değildir; ancak geliştirici deneyimi için aşağıdaki kontroller bulunmalıdır.

| Kontrol | Amaç |
|---|---|
| WireMock request journal | Gelen REST/SOAP isteklerini görmek |
| Webhook receiver `/webhooks` | Yakalanan webhook'ları görmek |
| Kafka topic consume örnekleri | Topic'e event düşüp düşmediğini doğrulamak |
| Container logs | Demo sırasında hızlı debug |
| Health endpoint'leri | Servis hazır mı kontrolü |

## 20. Kabul Kriterleri

Implementasyon tamamlandığında aşağıdaki kriterlerin hepsi sağlanmalıdır.

### 20.1. Kurulum

- `services/canonbridge-mock` altında tüm dosyalar bulunur
- `docker compose up -d` tek komutla ortamı başlatır
- Kafka topic'leri otomatik oluşturulur
- REST mock portu erişilebilirdir
- SOAP mock portu erişilebilirdir
- Webhook receiver portu erişilebilirdir

### 20.2. PayFlex

- Geçerli API key ile başarılı ödeme yanıtı alınır
- Geçersiz API key ile 401 alınır
- Nested ve flat formatlar desteklenir
- Eksik amount senaryosu 400 döndürür
- 429, 500 ve timeout senaryoları tetiklenebilir
- Webhook receiver ödeme event'ini kabul eder ve listeler

### 20.3. FastCargo

- WSDL dosyası servis edilir
- Basic Auth ile SOAP tracking sorgusu başarılı döner
- Tracking bulunamadı senaryosu SOAP Fault döndürür
- Scheduled poll simülasyonu Kafka `cargo.updates` topic'ine event üretir

### 20.4. ShopMax

- OAuth2 token endpoint'i access token döndürür
- Bearer token ile recent orders endpoint'i çalışır
- Detailed ve compact formatlar desteklenir
- 503 ve 429 hata senaryoları tetiklenebilir
- Kafka `partner.shopmax.raw` topic'ine periyodik order event'i gönderilir

### 20.5. Demo

- `scripts/demo.sh` beş adımlı demo akışını çalıştırır
- Her adım terminalde okunabilir çıktı verir
- Başarılı ve hatalı senaryolar aynı demo içinde gösterilir
- Demo tekrar çalıştırılabilir ve deterministik kalır

## 21. İlk Implementasyon Sırası

Kodlamaya geçildiğinde önerilen sıra:

1. README ve senaryo kataloglarını tamamla
2. Docker Compose iskeletini kur
3. WireMock REST PayFlex endpoint'lerini ekle
4. ShopMax OAuth2 ve REST endpoint'lerini ekle
5. FastCargo WSDL ve SOAP mapping'lerini ekle
6. Kafka topic init script'ini ekle
7. Kafka event generator script'lerini ekle
8. Webhook receiver'ı ekle
9. Demo script'i ekle
10. Uçtan uca doğrulama ve README komutlarını test et

## 22. Riskler ve Tasarım Kararları

| Risk | Etki | Yaklaşım |
|---|---|---|
| Mock çok statik kalır | Demo etkisi azalır | Birden fazla format ve scenario parametresi kullan |
| Kafka startup race condition | Event generator hata verir | Kafka init servisi ve health/retry bekleme ekle |
| SOAP mapping karmaşıklaşır | Bakım zorlaşır | Minimum ama gerçekçi WSDL ve net SOAP action kullan |
| Auth simülasyonu aşırı karmaşık olur | Demo kırılganlaşır | Credential'ları sabit demo değerlerde tut |
| Hata senaryoları demo akışını bozabilir | Satış demosu aksar | Hatalı senaryoları açık parametrelerle tetikle |

## 23. Sonuç

`canonbridge-mock`, CanonBridge'in ürün demosu, Mapping Studio testleri ve entegrasyon geliştirme süreci için kritik bir destek servisidir. Başarılı olduğunda ekip, gerçek partner bağlantıları hazır olmadan önce CanonBridge'in değer önerisini uçtan uca gösterebilir:

- Farklı protokoller
- Farklı veri formatları
- Farklı auth tipleri
- Gerçekçi hata durumları
- Kafka ve webhook tabanlı event akışları
- Mapping Studio içinde kullanılabilir ham veri örnekleri

Bu doküman implementasyona başlamadan önce ortak referans olarak kullanılmalıdır.

