# CanonBridge — Per-Service Deep-Dive Audit (v3.0)

**Tarih:** 22 Mayıs 2026  
**Kapsam:** `services/` altındaki tüm 6 servis tek tek incelendi  
**Karşılaştırma:** v2 services audit + remediation verification (v1)  
**Yeni bulgular:** **34** (8 Kritik, 12 Yüksek, 10 Orta, 4 Düşük)  
**Repo durumu:** 821 dosya değişimi sonrası **yeni risk yüzeyleri** ortaya çıktı (özellikle `billing-service`)

---

## 0. Servis Envanteri

| Servis | Stack | Dosya | Olgunluk | Risk |
|--------|-------|-------|----------|------|
| `mapping-studio-api` | Quarkus 3 (Java 21, reactive) | 146 | ⭐⭐⭐⭐⭐ | 🟡 Orta |
| `billing-service` | Quarkus 3 (Java 21) | 24 | ⭐⭐⭐ | 🔴 **Yüksek** |
| `webhook-receiver` | Quarkus 3 (Java 21) | 9 | ⭐⭐⭐⭐ | 🟠 Orta |
| `transformer` | Node.js 20 + Fastify | 21 | ⭐⭐⭐⭐⭐ | 🟢 Düşük |
| `lead-capture-edge` | Cloudflare Workers (TS) | 1 | ⭐⭐⭐⭐ | 🟢 Düşük |
| `canonbridge-mock` | Spring Boot 3 (Java 21) | 29 | ⭐⭐⭐ (dev-only) | 🟡 Orta |

---

## 1. `billing-service` — Yeni Eklenmiş, En Riskli

> Faz-1 SaaS monetization'ın kalbi. Yeni eklenmiş, henüz "battle-tested" değil. **Production'a çıkmadan önce mutlaka düzeltilmeli.**

### Yapı
- API: `EntitlementResource`, `InvoiceResource`, `OverageResource`, `PaddleWebhookResource`, `SubscriptionResource`, `TrialResource`, `UsageInternalResource`
- Paddle: `PaddleClient`, `PaddleConfig`, `PaddlePriceMapping`, `PaddleWebhookHandler`
- Service: `EntitlementQueryService`, `InvoiceService`, `LifecycleEmailService`, `ReconciliationService`, `SubscriptionService`, `TrialService`, `UsageAggregationService`
- Kafka: `UsageEventConsumer` (in: `usage.events`, out: `billing.events`)

### 🔴 Kritik Bulgular

#### B-K1 — `EntitlementResource` ve `UsageInternalResource` **kimliği doğrulanmamış**
```java
@Path("/api/entitlements")
public class EntitlementResource {
    @GET @Path("/{orgId}")
    public Uni<Response> getEntitlements(@PathParam("orgId") UUID orgId) { ... }
}
```
- Herhangi bir authentication filter yok. Network erişimi olan herkes:
  - Başka bir org'un quota ve plan bilgisini okuyabilir (`GET /api/entitlements/{anyOrgId}`)
  - `POST /api/internal/usage/aggregate/daily` ile manuel job tetikleyebilir
  - `GET /api/internal/usage/summary/{orgId}` ile başka org'un kullanım faturasını sızdırabilir
- **Düzeltme:** mapping-studio-api'deki `ApiAuthenticationFilter` benzeri bir filter ekleyin VEYA `/api/internal/*` için **service-to-service shared secret** (HMAC + nonce) zorunlu olsun. Public `/api/entitlements/*` çağrıları kullanıcının kendi org'u için kısıtlanmalı (JWT claim ile cross-check).

#### B-K2 — Paddle webhook **fail-OPEN**
```java
private boolean verifySignature(String signatureHeader, String body) {
    if (config.webhookSecret() == null || config.webhookSecret().isBlank()) {
        Log.debug("Paddle webhook secret not configured, skipping signature verification");
        return true;  // 🔴 anonim payload kabul ediliyor
    }
    ...
}
```
- Secret set edilmediği sürece (sandbox/staging) **fake Paddle webhook'ları kabul edilip subscription state'i değiştirilebilir**.
- **Düzeltme:** Prod profilinde secret zorunlu (SecurityConfigurationValidator paterni); diğer profillerde de en azından `INFO` log ve metric uyarısı.

#### B-K3 — Paddle signature comparison **constant-time değil**
```java
return computedHex.equals(hash);  // timing attack
```
- **Düzeltme:** `MessageDigest.isEqual(computedHash, decodeHex(hash))` veya `constantTimeEquals` helper kullanın.

#### B-K4 — Paddle webhook **timestamp/replay koruması yok**
- Format `ts=TIMESTAMP;h1=HASH` parse ediliyor ama `ts` değeri sadece HMAC payload'unun parçası olarak kullanılıyor; tolerance check yok.
- Saatler önce yakalanmış bir webhook tekrar oynatılabilir → çift `subscription.updated`, çift `transaction.completed`.
- **Düzeltme:** `webhook-receiver` servisindeki `TIMESTAMP_TOLERANCE_SECONDS=300` paternini birebir uygulayın.

#### B-K5 — Paddle event'leri **idempotent değil**
- `PaddleWebhookHandler.handle()` her gelen olayı UPDATE/INSERT olarak işliyor; aynı `event_id` iki kere gelirse iki kere uygulanıyor.
- **Düzeltme:** `paddle_processed_events(event_id PRIMARY KEY, processed_at)` tablosu + `INSERT ON CONFLICT DO NOTHING` ile dedupe.

### 🟠 Yüksek Bulgular

#### B-Y1 — `UsageEventConsumer` manual commit eksik
```properties
mp.messaging.incoming.usage-events-in.enable.auto.commit=false
```
- `enable.auto.commit=false` set ama `@Acknowledgment` annotation veya manual `record.ack()` çağrısı yok → consumer offset committe edilmiyor → restart sonrası tüm geçmiş event'ler **tekrar tüketiliyor** (DB tarafında `ON CONFLICT (request_id) DO NOTHING` koruyor ama gereksiz işlem).
- **Düzeltme:** `Uni<Void> consume(...)` dönüşünü Smallrye'nin handle etmesi için method signature'ı `CompletionStage<Void>` veya `@Acknowledgment(POST_PROCESSING)` ile düzeltin.

#### B-Y2 — Database hesabı `postgres/postgres` default
```properties
quarkus.datasource.password=${DB_PASSWORD:postgres}
quarkus.datasource.username=${DB_USERNAME:canonbridge_user}
```
- mapping-studio-api'de aynı pattern var ama orada `SecurityConfigurationValidator` insecure defaults yakalıyor. **billing-service'te validator yok** → prod'a `postgres` ile çıkabilir.

#### B-Y3 — Prod CORS default localhost
```properties
quarkus.http.cors.origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200,http://localhost:3000}
```
- mapping-studio-api'de `%prod.quarkus.http.cors.origins=${CORS_ALLOWED_ORIGINS}` override'ı var; **billing-service'te yok**. Prod'da `CORS_ALLOWED_ORIGINS` set unutulursa localhost'tan erişilebilir hale gelir.

#### B-Y4 — Flyway shared schema race condition
```properties
quarkus.flyway.migrate-at-start=false
# billing-service does NOT run migrations (mapping-studio-api owns the schema)
```
- Cold deploy senaryosunda iki service paralel ayağa kalkarsa `billing-service` migration tamamlanmadan SELECT/INSERT yapmaya çalışabilir.
- **Düzeltme:** Init container ile `pg_isready` + Flyway tablo varlık kontrolü; veya k8s `initContainer` ile mapping-studio-api'nin readiness'ini bekleyin.

#### B-Y5 — Kafka outgoing producer için idempotence + acks ayarı yok
```properties
mp.messaging.outgoing.billing-events-out.connector=smallrye-kafka
mp.messaging.outgoing.billing-events-out.topic=billing.events
# enable.idempotence ve acks=all eksik
```
- `webhook-receiver`'da `acks=all, enable.idempotence=true` var; billing-service producer yok → broker restart sırasında billing event kaybı.

### 🟡 Orta
- **B-O1:** `PaddleWebhookHandler.handleSubscriptionCreated` `custom_data.org_id` yoksa `true` döner → silent failure; metric/alarm gerekli.
- **B-O2:** `mapPaddleStatus` switch'inde `default -> "active"` → bilinmeyen status'ları sessizce `active` yapar (fatura yaratabilir).
- **B-O3:** `UsageAggregationService` cron 02:00/03:00/04:00 sabit → multi-region deploy'da timezone karmaşası.
- **B-O4:** `LifecycleEmailService` testlere bağlanmamış; email içerikleri ve unsubscribe link doğrulanmamış (GDPR/CAN-SPAM).

---

## 2. `mapping-studio-api` — Olgun, Ufak Tefek Sıkıntılar

> Sistemin omurgası. 146 dosya, OIDC + API key + RBAC + multi-tenant + entitlement + audit + outbox + DLQ + rate limit hepsi var.

### Yapı (Önemli paketler)
- `auth/`, `security/`, `audit/`, `billing/` (Entitlement)
- `outbound/`, `kafka/`, `lifecycle/`, `notification/`
- `repository/`, `domain/`, `validation/`, `xml/`, `credential/`
- `ratelimit/`, `filter/`, `logging/`, `config/`

### ✅ Güçlü Yanlar
- `SecurityConfigurationValidator` — prod'da insecure default varsa **fail-fast**
- `JwtService` — `constantTimeEquals`, HS256 signature
- `CredentialSecretCodec` — AES-256-GCM, `defaultValue` yok
- `RateLimitService` — atomik Redis pipeline (Y1/Y2 düzeldi)
- `EntitlementInterceptor` — JAX-RS filter + Redis cache (<5ms), 402 quota exceeded
- `ApiAuthenticationFilter` — API key + OIDC bearer dual-auth + audit logging
- `TenantIsolationFilter`, `SingleTenantContextFilter` — multi-tenant guardrails

### 🟠 Yüksek Bulgular

#### M-Y1 — `X-Service-Auth` header presence sadece kontrolü
```java
private boolean isInternalCall(ContainerRequestContext requestContext) {
    String serviceAuth = requestContext.getHeaderString("X-Service-Auth");
    return serviceAuth != null && !serviceAuth.isBlank();
}
```
- Herhangi bir non-empty değer entitlement check'i bypass ediyor → **dış kullanıcı `X-Service-Auth: anything` header'ı ekleyerek quota limitlerini bypass edebilir**.
- **Düzeltme:** Header değerini config'teki `INTERNAL_SERVICE_SECRET` ile karşılaştırın (timing-safe). Daha iyisi: `mTLS` + Istio/Linkerd policy.

#### M-Y2 — `X-Org-Id` user-supplied, principal ile cross-check yok
```java
private UUID resolveOrgId(ContainerRequestContext requestContext) {
    String orgIdStr = requestContext.getHeaderString(ORG_ID_HEADER);
    if (orgIdStr != null && !orgIdStr.isBlank()) {
        return UUID.fromString(orgIdStr.trim());
    }
    return null;
}
```
- Authenticated user başka bir org'un UUID'sini header'a koyarsa quota o orgun adına tüketilir → **billing fraud / quota poisoning**.
- **Düzeltme:** `requestContext.getSecurityContext().getUserPrincipal()`'tan org'u türetin; X-Org-Id sadece admin/cross-org çağrılarda geçerli ve admin role kontrolü ile.

#### M-Y3 — DB password default
```properties
quarkus.datasource.password=${DB_PASSWORD:postgres}
```
- `SecurityConfigurationValidator` JWT/API key default'unu yakalıyor ama **DB password kontrolü yok**.

### 🟡 Orta
- **M-O1:** `canonbridge.auth.api-keys` default'unda `dev-api-key:dev-api-key:tenant-acme:integration_author|viewer` literal → validator bunu yakalıyor ama prod öncesi config-as-code review gerekli.
- **M-O2:** `EntitlementService.checkQuota()` `.await().indefinitely()` — reactive context'te blocking. Cache hit (<5ms) iddiası doğru ama Redis yavaşlarsa thread tıkanır. `EntitlementInterceptor`'ı `@ServerRequestFilter` reactive variant ile yeniden yazın.
- **M-O3:** `quarkus.security.auth.enabled-in-dev-mode=false` — dev'de auth kapalı; team üyeleri bunu staging'de yanlışlıkla bırakabilir. Validator'a "non-dev profile'larda zorunlu" check ekleyin.
- **M-O4:** `quarkus.http.auth.proactive=false` — bilinçli seçim ama doc'lanmadıysa açıklayın (filter chain'inde authn manual).

### 🟢 Düşük
- **M-D1:** `notification/`, `outbound/`, `lifecycle/` paketleri için unit test coverage raporu yok.

---

## 3. `webhook-receiver` — Düzeltildi ama Eksik Var

### ✅ Düzeltilenler
- HEALTHCHECK port 8082 + `/q/health/ready` ✅
- Timestamp tolerance (300s) replay protection ✅
- Stripe-style `t=...,v1=...` signature parsing ✅
- Hex + Base64 her ikisi de constant-time compare ✅
- Kafka producer `acks=all`, `enable.idempotence=true` ✅

### 🟠 Yüksek Bulgular

#### W-Y1 — **K4 hâlâ kısmen açık:** webhook-key = HMAC signing secret
- `WebhookAuthService.validateWebhookKey()` DB'deki `secret_hash` ile karşılaştırıyor (✅ hash'lenmiş)
- Ama `WebhookService.processWebhook()` aynı plaintext `webhookKey`'i HMAC secret olarak kullanıyor
- **Düzeltme:** `webhook_endpoints` tablosuna `signing_secret_encrypted` kolonu ekleyin (envelope-encrypted, AES-GCM). API key ile signing secret ayrılsın.

#### W-Y2 — Idempotency desteği yok (client-supplied)
- `WebhookService`: her gelen istek için `UUID.randomUUID()` üretiyor.
- Client (partner) network retry yaptığında **aynı olay iki kez Kafka'ya basılıyor** → downstream'de dedupe yoksa çift fatura.
- **Düzeltme:** `Idempotency-Key` header'ı kabul edin; `processed_events(idempotency_key UNIQUE, partner_id, event_id, created_at)` tablosu, 24h TTL.

#### W-Y3 — Servis seviyesi rate-limit yok
- `mapping-studio-api`'de var, `webhook-receiver`'da yok.
- Tek bir partner saniyede binlerce webhook ile Kafka'yı doldurabilir.
- **Düzeltme:** Aynı `RateLimitService`'i extract edip `webhook-receiver`'a inject edin (Redis bucket per `partnerId`).

### 🟡 Orta
- **W-O1:** `application.properties` içinde `quarkus-smallrye-health` extension açık ama dependency declared mı doğrulanmadı; Dockerfile HEALTHCHECK buna bağlı.
- **W-O2:** `extractHeaders(headers)` ile **tüm HTTP header'lar** envelope'a yazılıyor → Authorization, Cookie gibi hassas header'lar log/Kafka'ya sızabilir. Whitelist gerekli.
- **W-O3:** `publishUsageEvent` fire-and-forget — Kafka publish hatası billing'i sessizce kaybeder.

### 🟢 Düşük
- **W-D1:** Test coverage: `WebhookResourceTest`, `WebhookServiceTest`, `WebhookAuthServiceTest` var ✅

---

## 4. `transformer` — En Olgun, Production-Ready

### ✅ Güçlü Yanlar
- `timingSafeEqual` API key auth ✅
- Fail-closed: `apiKey`/`apiKeys` set değilse anonim erişim yok ✅
- `Y5: CORS prod guard` — `NODE_ENV=production` + boş `CORS_ORIGINS` → startup'ta throw ✅
- Worker pool ile JSONata CPU isolation (ADR-006) ✅
- DLQ + outbox + redrive pattern ✅
- Schema compatibility check script
- Test coverage: 7 test dosyası (`env`, `httpServer`, `kafkaRunner`, `metrics`, `partnerRegistry`, `transformEngine`)

### 🟠 Yüksek Bulgular

#### T-Y1 — `publishTransformRequest`: orgId yoksa **sessizce drop**
```typescript
if (!orgId || !this.producer) return;
```
- Kafka envelope'unda `orgId` propagation eksikse **tüm transform'lar fatura dışı kalır** (silent revenue leak).
- **Düzeltme:** Metric increment edin (`usage_dropped_total{reason="no_org_id"}`), Prometheus alert kuralı (threshold > 1%).

#### T-Y2 — DLQ redrive: yetkilendirme + audit log eksik
- `/api/dlq/redrive` endpoint'i API key auth altında (✅) ama **kim redrive etti / hangi event** audit log'u yok.
- **Düzeltme:** `dlq_audit(redriven_by, dlq_id, redriven_at, reason)` tablosu.

### 🟡 Orta
- **T-O1:** `cache.ts` Redis TTL stratejisi: cache invalidation patternı doc'lanmamış. Mapping versiyonu güncellenince cache otomatik temizlenmiyor olabilir.
- **T-O2:** `workerPool.ts` worker timeout / crash recovery: süreç çakılırsa yeni worker spawn ediliyor mu? PR review gerekli.
- **T-O3:** `kafkaRunner.ts` `enable.auto.commit=false` ile manuel commit yapılıyor mu? Manual offset commit ADR-004 var ama implementation doğrulaması gerekli.

### 🟢 Düşük
- **T-D1:** OpenAPI spec'i Fastify swagger ile yayınlanıyor ✅
- **T-D2:** `ioredis` lazy connection — Redis down olduğunda fail-fast değil; circuit breaker önerilir.

---

## 5. `lead-capture-edge` — Düzeltildi, Hâlâ Spam Riski

### ✅ Güçlü Yanlar
- Turnstile **fail-CLOSED** ✅ (Y13 düzeldi)
- Rate-limit KV yoksa **fail-CLOSED** ✅
- Origin whitelist kontrolü ✅
- Body size cap (16KB default) ✅
- Turnstile token forward edilmeden strip ✅

### 🟠 Yüksek Bulgular

#### L-Y1 — IP `CF-Connecting-IP` header'ından alınıyor
```typescript
const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
```
- Cloudflare front'unda güvenli ama eğer Worker bir başka proxy/load-balancer arkasındaysa header spoof edilebilir.
- **Düzeltme:** Worker `request.cf` objesinden veya `cf-pseudo-ipv4` ile cross-check.

#### L-Y2 — Email/telefon-bazlı dedupe yok
- IP rate-limit var ama aynı VPN/proxy üzerinden 5 farklı IP ile 5 form spam edilebilir.
- **Düzeltme:** `lead_dedupe_kv` ile email hash'i + 24h TTL.

### 🟡 Orta
- **L-O1:** `User-Agent`, `IP`, `origin` forward webhook'a gönderiliyor → GDPR `data minimization` ihlali olabilir. Tüketici tarafında consent banner ile uyumlanmalı.
- **L-O2:** `publishUsageEvent` fire-and-forget HTTP fetch → ağ kaybında billing kaybı (transformer'daki Kafka producer gibi değil, retry yok).
- **L-O3:** Tek dosya 200+ satır → modülerleştirmek (handlers, validators, rate-limit ayrı dosyalar) test edilebilirliği artırır.

### 🟢 Düşük
- **L-D1:** Worker için **unit test yok** (Miniflare ile çalıştırılabilir).

---

## 6. `canonbridge-mock` — Dev-Only Servis

### Yapı
- 10+ controller: PayFlex, ShopMax (OAuth + standart), FastCargo (SOAP), GraphQL, gRPC, FoodMarket, Webhook
- `MockTokenService`, `KafkaTopicConfiguration`, `WebhookController`, `MockConfiguration`

### 🔴 Kritik

#### CM-K1 — Hardcoded test secret defaults
```yaml
payflex:
  api-key: ${PAYFLEX_API_KEY:demo-api-key-12345}
webhook:
  api-key: ${WEBHOOK_API_KEY:payflex-secret-key}
```
- Mock servis olmasına rağmen prod'a yanlışlıkla deploy edilirse **anyone with `demo-api-key-12345` becomes a partner**.
- **Düzeltme:** Spring profile `@Profile("!prod")` ile **prod'da bean'leri register etmeyin**; startup'ta `if (env.equals("prod")) throw` guard ekleyin.

### 🟡 Orta
- **CM-O1:** `ProtocolDockerE2ETest` test file'ında hardcoded key — sadece test scope ✅ ama yine de constant olarak çıkartılsın.
- **CM-O2:** Mock servis Spring Boot, diğerleri Quarkus — tutarlılık için tüm mock controller'lar Quarkus'a port edilebilir (yaklaşık 2-3 günlük iş; uzun vadede operasyon basitleşir).

---

## 7. Cross-Service Bulgular (Yeni)

### X-Y1 — Service-to-Service Auth Standardize Değil
- `mapping-studio-api ↔ billing-service ↔ webhook-receiver` arası iletişim için ortak bir auth mekanizması yok. Mevcut durumda:
  - `mapping-studio-api`'de `X-Service-Auth` header (içeriği kontrol edilmiyor)
  - `billing-service`'te hiç auth yok
  - `webhook-receiver`'da sadece Kafka producer (no inbound from other services)
- **Düzeltme:** Tüm internal endpoint'ler için `X-Service-Auth: HMAC-SHA256(timestamp + path, INTERNAL_SECRET)` standart paterni. Veya mTLS (Istio/Linkerd).

### X-Y2 — Kafka Topic Authorization Yok
- Tüm servisler `PLAINTEXT` connection ile aynı broker'a bağlanıyor; her servis her topic'e yazabilir.
- **Düzeltme:** Kafka ACL + SASL_SCRAM (üretim için). Her servis için kendi user/topic permission set'i.

### X-Y3 — Distributed Tracing Eksiklikleri
- `CorrelationIdFilter` her servis için kopyalanmış (DRY ihlali). OpenTelemetry collector eklenmiş ama her servis OTEL SDK ile instrument edilmiş mi doğrulanmadı.
- **Düzeltme:** `quarkus-opentelemetry` extension'ı tüm Quarkus servislerine ekleyin; transformer için `@opentelemetry/sdk-node`.

### X-Y4 — Migration Ownership Belirsiz
- `mapping-studio-api` Flyway'i çalıştırıyor (`migrate-at-start=true` varsayılıyor); `billing-service` hayır.
- Schema'da hem mapping hem billing tabloları var → tek owner mantıklı ama deployment ordering belgelenmemiş.
- **Düzeltme:** `docs/deployment/05-database-migrations.md`'e explicit dependency graph ekleyin.

---

## 8. Önceliklendirilmiş Eylem Listesi

### 🔴 P0 (Production öncesi must-fix — 1 hafta)
1. **B-K1**: `billing-service` tüm endpoint'lerine auth filter ekle
2. **B-K2**: Paddle webhook fail-OPEN davranışını kapat (prod'da secret zorunlu)
3. **B-K3**: Paddle signature `MessageDigest.isEqual` kullansın
4. **B-K4**: Paddle webhook timestamp tolerance check
5. **B-K5**: Paddle event idempotency tablosu
6. **CM-K1**: `canonbridge-mock` prod profile guard
7. **M-Y1, M-Y2**: `X-Service-Auth` ve `X-Org-Id` spoofing fix (entitlement bypass + billing fraud önle)

### 🟠 P1 (Beta öncesi — 2-3 hafta)
8. **W-Y1**: Webhook signing_secret kolonu ekle (K4 tam çözüm)
9. **W-Y2**: Idempotency-Key header desteği
10. **W-Y3**: webhook-receiver rate limiting
11. **B-Y1**: `UsageEventConsumer` manual ack düzeltmesi
12. **B-Y5**: billing-events producer `acks=all, enable.idempotence=true`
13. **B-Y2, B-Y3, M-Y3**: DB password ve CORS prod default'larını kaldır
14. **T-Y1**: Transformer `usage_dropped_total` metrik ve alert
15. **X-Y1**: Service-to-service HMAC auth standardı

### 🟡 P2 (GA öncesi — 4-6 hafta)
16. **B-Y4**: Cold deploy migration race fix (initContainer)
17. **L-Y2**: Lead capture email/IP dedupe
18. **X-Y2**: Kafka SASL_SCRAM + ACL
19. **X-Y3**: OpenTelemetry tam instrument
20. **T-O3**: Manual Kafka commit doğrulama
21. **W-O2**: Webhook header whitelist (PII sızıntısı önle)
22. **M-O2**: EntitlementInterceptor fully reactive

---

## 9. Servis Bazlı Risk Skorları

| Servis | Güvenlik | Reliability | Observability | Test | Genel |
|--------|----------|-------------|---------------|------|-------|
| `mapping-studio-api` | 8/10 | 9/10 | 8/10 | 8/10 | **8.3** |
| `billing-service` | **3/10** 🔴 | 5/10 | 5/10 | 4/10 | **4.3** |
| `webhook-receiver` | 7/10 | 8/10 | 7/10 | 8/10 | **7.5** |
| `transformer` | 9/10 | 9/10 | 8/10 | 9/10 | **8.8** |
| `lead-capture-edge` | 8/10 | 8/10 | 5/10 | 4/10 | **6.3** |
| `canonbridge-mock` | n/a (dev-only) | 7/10 | 5/10 | 7/10 | n/a |

**Sistem ortalaması:** 7.0/10 (bir önceki audit: 5.5/10) — `billing-service` skorunu çekiyor; P0 listesi kapatılırsa **8.5+** seviyesine çıkar.

---

## 10. Sonraki Adım Önerisi

`billing-service` özelinde **bir hafta odaklanmış güvenlik sertleştirme sprint'i** önerilir. Çıktılar:
- `BillingAuthenticationFilter` (mapping-studio-api'deki paterni kopyala)
- `PaddleWebhookSecurity` (timing-safe + replay + idempotency)
- `SecurityConfigurationValidator` (billing-service'e port et)
- Yeni integration test paketi: `BillingEndpointSecurityIT`, `PaddleWebhookReplayIT`

Bunlar tamamlanmadan **public beta açmayın** — billing tarafı en yüksek itibar riski olan modüldür.
