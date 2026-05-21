# CanonBridge — `services/` Backend Audit v1

Kapsam: `services/mapping-studio-api` (Java 21 / Quarkus 3.8.1), `services/webhook-receiver` (Quarkus), `services/transformer` (Node 20 / Fastify 5 / JSONata), `services/lead-capture-edge` (Node 20), `services/canonbridge-mock` (Spring Boot 3.2.5). Repo: `benanaktaspusulait/canonbridge@1bfec8e`.

Yalnızca **hatalar ve eksikler**. Çalışan/iyi olan akışlar listelenmedi.

---

## A. Kritik — güvenlik / production-ready blocker

### A1. `dev-api-key` = `admin` rolü → tüm RBAC bypass
`ApiKeyAuthenticator.authenticateApiKey()`:
```java
return AuthenticationResult.authenticated("api-key", Set.of("admin"));
```
Geçerli API key sunan **her** istemci otomatik olarak `admin` rolünü alıyor. `RoleAuthorizationFilter` admin için tüm gate'leri pas geçiyor (`hasAnyRole(securityContext, ADMIN_ROLE)`). Sonuç: tek bir API key sızıntısı = tüm credential rotate/disable/delete, tüm DLQ redrive, tüm tenant erişimi.

**Aksiyon:** API key başına rol ve tenant set'i konfigürasyondan okunmalı:
```
CANONBRIDGE_API_KEYS=ops:ops-team:tenant-acme:operator,viewer; etl:etl-bot:tenant-acme:integration_author
```
veya API key kullanımını tamamen kaldırıp OIDC + servis hesabı pattern'ine geç.

### A2. RBAC path-string match — kolayca bypass edilebilir
`RoleAuthorizationFilter.allowedRoles(path)` URI path'in **prefix string match**'ine bakıyor:
```java
if (path.startsWith("api/credentials"))     return ADMIN/AUTHOR;
if (path.startsWith("api/dlq"))              return OPERATOR;
```
Sorunlar:
1. `path` JAX-RS'ten gelir; trailing slash, encoded character, double-slash gibi normalize edilmemiş varyantlar farklı davranabilir. `api/credentials` yakalanır ama `api/credentials/../audit-logs` veya `api//credentials` davranışı yöntem default'una düşer (`AUTHOR_ROLES`).
2. **`shouldBypass` "api/" ile başlamayan tüm path'leri pas geçiyor** — `/internal/*`, `/admin/*`, future endpoint'ler RBAC dışı kalır. Şu anda öyle bir resource yok ama bir gün eklenirse sessizce yetkisiz erişime açılır.
3. `@RolesAllowed` annotation **hiç kullanılmıyor** (`grep -r "@RolesAllowed" = 0`). Standart Quarkus security pattern'i atlanmış, bunun yerine elle filter yazılmış.

**Aksiyon:** `@RolesAllowed({"admin","operator"})` ile resource-level annotation; filter'ı meta-veri okuyacak şekilde yeniden yaz veya Quarkus'un built-in `quarkus-security` annotation tabanlı yetkilendirmesine geç.

### A3. Tenant header `X-Tenant-Id` istemciden okunup yetkilendirme yok
`TenantContext.requireTenantId(suppliedTenantId)` istemcinin gönderdiği header'a güveniyor. Tek tenant modunda OK (zaten allowed = default), ama `singleTenantEnabled=false` durumunda:
- JWT içindeki `tenant_id` claim'i ile karşılaştırma yok.
- Yalnızca `TenantIsolationFilter` config'te `canonbridge.tenant.mappings` set edilmişse devreye giriyor (default boş → "dev mode, allow all"). Yani prod'da bu mapping unutulursa **cross-tenant veri sızıntısı**.

**Aksiyon:** `requireTenantId()` JWT `tenant_id` claim'ini header ile cross-check etsin; eşleşmezse 403. `TenantIsolationFilter`'da boş mapping → fail-closed (allow değil, deny).

### A4. `CredentialSecretCodec` "plain JSON" envelope'ı encryption olmadan kabul ediyor
```java
if (!envelope.containsKey("alg")) {
    System.out.println("DEBUG: Plain JSON credential detected, returning as-is");
    return envelope;
}
```
Production'da credential tablosunda `alg` field'i olmayan satır varsa **şifrelenmemiş JSON olarak okunup** kullanılıyor — sessizce. Migration regression veya manuel SQL insert ile prod'a düz metin credential yazılır ve kimse fark etmez. Ek olarak `System.out.println` ile debug log production'a çıkıyor.

**Aksiyon:** `alg` yoksa `IllegalStateException` fırlat; ayrıca `System.out` → `LOG.warn` ve hassas içerik loglanmasın.

### A5. JWT default secret kod içinde sabit + `jwt-secret-key.txt` repo'da commit'li
`JwtService.DEFAULT_SECRET = "canonbridge-jwt-secret-key-for-development-only-change-in-production"` ve `src/main/resources/jwt-secret-key.txt` repo'da görünür. `SecurityConfigurationValidator` startup'ta production'da default'ları reddediyor — ama:
1. `ENVIRONMENT` env değişkeni unutulursa `development` varsayılıp validator devre dışı kalır.
2. `jwt-secret-key.txt` classpath'te kalmaya devam ettiği için yanlışlıkla referans verilebilir.

**Aksiyon:** `jwt-secret-key.txt` dosyasını sil; `JwtService.DEFAULT_SECRET` constant'ını da kaldır, `@ConfigProperty` `defaultValue` olmadan zorunlu yap (yoksa app start etmesin).

### A6. JWT manuel `HS256` implementasyonu (`io.smallrye.jwt-build` varken)
`JwtService` `Mac/HmacSHA256` ile elle JWT üretip doğruluyor. `MicroProfile JWT` zaten bağımlılıkta. Manuel implementasyonun riskleri:
- `alg` header'ında `none` saldırısına karşı koruma sadece `!"HS256".equals(...)`; case-sensitive iyi, ama key confusion (`HS256` ↔ `RS256`) ileride algorithm değişirse riskli.
- `kid`, `jti`, `nbf` claim'leri yok → replay/revoke imkânsız.
- Token revoke listesi yok; logout sadece client-side.

**Aksiyon:** `Jwt.claims().sign()` (SmallRye JWT) veya `auth0/java-jwt` kullan; `jti` üret ve Redis'te denylist tut; logout endpoint'i ekle.

### A7. `quarkus-security` annotation altyapısı kapalı
`pom.xml`'de `quarkus-smallrye-jwt` ya da `quarkus-security` dependency yok — sadece manuel filter'lar. Yani `@RolesAllowed`, `@Authenticated`, `@DenyAll` annotation'ları compile olur ama hiçbir şey enforce etmez.

**Aksiyon:** `quarkus-security-jpa` veya `quarkus-smallrye-jwt` ekle; resource'lara annotation ile mark et.

### A8. `webhook-receiver` HMAC doğrulaması optional
`WebhookResource.receive(...)` sadece `X-Webhook-Key` (sabit key) zorunlu. `X-Webhook-Signature` parametre olarak alınıyor ama service tarafında **mutlak gereklilik değil**:
```java
public boolean verifyHmacSignature(String payload, String signatureHeader, String secretKey) {
    if (signatureHeader == null || signatureHeader.isBlank() || secretKey == null) {
        return false;  // returns false but who consumes this?
    }
```
`WebhookService.processWebhook(...)` kaynağına bakılmadan denetlenmesi gerek: sabit key + signature ikisi de zorunlu olmalı, signature yoksa 401.

### A9. Migration sayısı (42 adet) `V1..V37` arasında yığılmış; geri dönüş imkânsız
- `V19__align_mock_connections_with_mappings.sql`, `V22__align_mock_connections_and_studio_samples.sql`, `V28__consolidate_single_tenant.sql`, `V37__create_tenants_and_enforce_single_tenant.sql` gibi data fix migration'ları repo kökündeki `update-all-tenants.sql`, `fix-proxy-mappings.sql`, `db-seed-proxy-mappings.sql` SQL dosyaları ile çakışıyor olabilir.
- `quarkus.flyway.out-of-order=true` aktif → CI'da deterministik değil.
- Flyway `clean` veya rollback yok; bozulan bir migration'dan geri dönüş manuel SQL.

**Aksiyon:** `out-of-order=false`; bekleyen migration'ları squash; `update-all-tenants.sql` repo kökünden `services/mapping-studio-api/scripts/manual/`'a taşı ve `migrate-at-start=true` ile bağlantısını kes.

---

## B. Yüksek — fonksiyonel eksikler / dayanıklılık

### B1. `KafkaConsumerService.processRawEvent()` boş — sadece TODO
```java
private void processRawEvent(String key, String payload) {
    // TODO: Implement transformation logic
    LOG.debugf(...);
}
```
Yani `mapping-studio-api` ham eventleri Kafka'dan okuyor ama **dönüşüm yapmadan sessizce yutuyor**. `transformer/` Node servisi var ama bu iki servis arasındaki iş bölümü kod ve `application.properties`'te belirsiz. Pazarlama sayfasındaki "real-time transformation" iddiası boş döngüye bağlı.

### B2. `DlqResource./stats` endpoint'i boş
```java
// TODO: Implement statistics query
```
DLQ dashboard çalışmıyor. Pazarlama'da "per-partner health scores and SLO tracking" iddiası mevcut — bu endpoint olmadan UI doldurulamaz.

### B3. `transformer` outbox `OUTBOX_DATABASE_URL` zorunlu ama default boş; sessiz fallback yok
`src/index.ts`:
```ts
if (env.outboxEnabled && !env.outboxDatabaseUrl) {
  throw new Error('OUTBOX_DATABASE_URL is required when OUTBOX_ENABLED=true');
}
```
İyi. Ama `OUTBOX_ENABLED=false` durumunda transformer **exactly-once** garantisi vermiyor → "Zero data loss / at-least-once with idempotency" iddiasını karşılamak için outbox prod'da default-on olmalı; readme buna işaret etmiyor.

### B4. `transformer` JSONata expression validation production'da kullanılmıyor
`jsonataCheck.ts` `/jsonata/check` HTTP endpoint'inde var; ama `/transform/:partnerId` çalışma yolunda expression sandbox sınırı yok (timeout, memory cap). JSONata sonsuz döngü veya regex DoS riski; `workerPool` ile çalıştırılsa da timeout yok.

**Aksiyon:** `WorkerPool` task'ına `timeoutMs` ekle, aşılırsa worker terminate.

### B5. `mapping-studio-api` `quarkus.http.cors.origins=http://localhost:4200,http://localhost:3000` default
Production override eklenmezse CORS hâlâ localhost'a açık. `SecurityConfigurationValidator` `localhost` içeren CORS'u prod'da reddediyor — ama dev/staging ortamlarında yine de gerçek origin yerine localhost devrede. Staging için ayrı `%staging.quarkus.http.cors.origins` profili eklenmeli.

### B6. `transformer` `bodyLimit: 2 * 1024 * 1024` (2 MB) — partner payload'ları için darbe alabilir
EDI/XML batch dosyaları kolay 5–20 MB. Şu an 2 MB üzerinde transformer 413 dönüyor — webhook-receiver `HTTP_MAX_BODY_SIZE:2M`, mapping-studio-api `1M`. Servisler arası limit tutarsız (`1M`, `2M`, `2M`) ve EDI batch endpoint'i `/api/mapping-drafts/{id}/batch/ingest` için ayrı bir limit yok.

### B7. `lead-capture-edge` rate limit yok
`handleLeadRequest`:
- Origin check ✅
- Body size cap (16 KB) ✅
- Turnstile siteverify ✅ (yalnız `TURNSTILE_SECRET_KEY` boşsa siteverify atlanıyor → prod env unutulursa korumasız).
- **Rate limit / brute force / abuse guard yok.** `CF-Connecting-IP` zaten okunuyor, KV ile 1m/IP sayım eklenmeli.
- `TURNSTILE_SECRET_KEY` yoksa "true" döndürmek **fail-open** — prod'da config eksikliği güvenliği bypass eder. Fail-closed olmalı.

### B8. `lead-capture-edge` Node `http` server adapter Workers değil
`src/server.js` `node:http` ile çalışıyor → Cloudflare Worker'a deploy edilmiyor; klasik Node host gerekli. README/Dockerfile bunu netleştirmiyor. Eğer hedef Cloudflare Worker ise `addEventListener('fetch', ...)` veya `export default { fetch }` pattern'i gerekir.

### B9. `webhook-receiver` Kafka producer ack stratejisi yok
`application.properties` `mp.messaging.outgoing.raw-events` için `acks`, `enable.idempotence`, `retries`, `compression.type` parametreleri belirtilmemiş. Default `acks=1` ile broker crash'inde event kaybı olur. Producer **`enable.idempotence=true`** + `acks=all` ile çalışmalı.

### B10. `application.properties` Kafka consumer `auto.offset.reset=earliest`
Production'da bir consumer group ilk kez deploy edilirse tüm geçmiş event'leri replay edecek → DLQ patlaması, çift işleme. Prod'da `latest` + ayrı bootstrap script önerilir.

### B11. `Outbox replay` ve `Scheduled poller` default-on
```
canonbridge.outbox.replay.enabled=${OUTBOX_REPLAY_ENABLED:true}
canonbridge.scheduled-poller.enabled=${SCHEDULED_POLLER_ENABLED:true}
```
Tek bir replica deploy modelinde sorun yok; ama HA modunda **birden fazla pod aynı outbox satırlarını process etmeye çalışır**. Leader election (Postgres advisory lock veya Quarkus scheduled `concurrent-execution: SKIP`) gerekli.

### B12. `RateLimitFilter` `@Blocking` Redis çağrısı — reactive pipeline'ı bloklar
Mapping-studio-api reactive (Vert.x). `RateLimitFilter` `@Blocking` ile işaretli, her istek Redis'i sync çağırıyor. Yüksek RPS'te worker thread havuzu doluyor; "10,000 events/sec" iddiası bu mimaride imkânsız. Reactive Redis API (`quarkus-redis-client` zaten reactive) ile non-blocking varyant yaz.

---

## C. Orta — kod kalitesi / mimari tutarlılığı

### C1. Spring Boot 3.2.5 — out-of-date
`canonbridge-mock` 3.2.5 (Eylül 2024). Güncel 3.4.x serisi. CVE'ler için `spring-boot-starter-parent` upgrade edilmeli.

### C2. Quarkus 3.8.1 — out-of-date
`mapping-studio-api` ve `webhook-receiver` Quarkus 3.8.1 (Mart 2024). LTS 3.15 / current 3.17 mevcut. Reactive Pg client ve Mutiny iyileştirmeleri kaçırılıyor.

### C3. `services/mapping-studio-api/pom.xml` `<skipITs>true</skipITs>` default
Integration test'ler hiçbir zaman CI'da çalışmıyor. `mvn clean verify -B` integration test step'i pas geçiyor. Sadece unit test koşuyor.

### C4. Resource'larda `Uni<Response>` + `try/catch` karışık + bazı yerlerde `Response.ok(entity).build()` body olmadan
`WebhookResource.receive` `recoverWithItem` zincirinde uzun. ResourceException mapper (`@Provider ExceptionMapper<...>`) yok → her resource kendi error handling'i yazıyor. Tutarsız hata JSON şekilleri (`{"error": "..."}` vs `{"message": "..."}` vs `ErrorResponse`).

### C5. `repository/Tuples.java` — adlandırma kötü, içerik belirsiz
Domain'e ait olmayan bir util class repository paketinde. Yeniden adlandırılıp `infrastructure/` veya `util/`'e taşınmalı.

### C6. `notification/NotificationSocket.java` WebSocket auth yok mu?
WebSocket endpoint `@ServerEndpoint` üzerinden JAX-RS filter zincirine girmiyor — `ApiAuthenticationFilter`, `RateLimitFilter`, `RoleAuthorizationFilter` WS handshake'inde çalışmaz. Doğrulanmalı.

### C7. `transformer` `swagger-ui` her ortamda `/docs`'ta açık
`httpServer.ts` `routePrefix: '/docs'` koşulsuz. Prod'da API key arkasına alınmalı veya `NODE_ENV=production` ise kaydedilmemeli.

### C8. `transformer` `apiKey` tek string — rotation yok
`API_KEY` env tek değer. Rotation sırasında zero-downtime için en az iki key kabul edilmeli (`API_KEY_PRIMARY`, `API_KEY_SECONDARY`).

### C9. Hardcoded magic numbers
- `RateLimitConfig` 100/min authenticated, 10/min unauthenticated — config yok mu? Var ama tenant başına override edilemiyor.
- `JwtService.ttlSeconds = 28800` (8 saat) — refresh token endpoint var ama refresh token rotation yok.
- `lead-capture-edge` `MAX_BODY_BYTES = 16 * 1024` — env override yok.

### C10. `canonbridge-mock` Spring Boot servisi production image olarak oluşturuluyor mu?
`Dockerfile` mevcut ama CI'da `cd.yml` push edip etmediği netleşmeli. Mock service prod'a deploy edilirse gerçek partner yerine sahte payload akar.

### C11. `services/transformer/src/index.ts` graceful shutdown eksik
`SIGTERM` üzerine Kafka consumer'ı stop, in-flight transform'ları drain etme, outbox relay flush kodu görünmüyor (sadece `kafkaShutdown` değişkeni var, sonuna kadar takip edilmedi). `mapping-studio-api`'da `GracefulShutdownManager` var, transformer'da yok.

### C12. Test coverage çok düşük (msa)
20 test dosyası, 95 production sınıfı. `resource/*Resource.java` çoğu integration test gerektiriyor ama IT'ler skip. Coverage raporu CI'da yok.

### C13. `webhook-receiver` tek `WebhookService`, fan-out partner-specific logic yok
Tüm partner'lar aynı kod yolundan geçiyor. Partner-specific signature scheme (Stripe `t=` + `v1=`, Shopify `X-Shopify-Hmac-Sha256` base64, GitHub `sha256=` hex) farklıdır — tek `verifyHmacSignature` bunları desteklemiyor.

### C14. `mapping-studio-api` `OutboundHttpService` circuit breaker var ama timeout yok
`CircuitBreaker.java` failure ratio tabanlı, ama HTTP timeout'u `quarkus.rest-client` default'una bırakılmış. Hung partner endpoint'i thread havuzunu tıkar. Per-connection timeout config'i ekle.

### C15. `application.properties` log JSON additional-field hardcoded `environment=development`
`${ENVIRONMENT:development}` default'u prod'da override edilmediği takdirde log analizinde dev/prod karışır.

---

## D. Düşük — temizlik / governance

### D1. `System.out.println` production kodunda
`CredentialSecretCodec.java:71` — debug log production'a yazıyor (A4'le çakışıyor).

### D2. `LOG.warnf("🚫 Tenant isolation violation: ...")`
Emoji log mesajları — JSON log parser'larda görseldir ama prod log pipeline (Datadog/ELK) için gereksiz.

### D3. `pom.xml` `quarkus.platform.version` tek satırda hardcoded
`<quarkus.platform.version>3.8.1</quarkus.platform.version>` her servis için ayrı dosyada. `dependabot.yml` veya `renovate.json` yoksa upgrade unutuluyor. (`.github/dependabot.yml` var mı kontrol et.)

### D4. `services/canonbridge-mock` ile `services/mapping-studio-api` ortak `domain/*.java` paylaşmıyor
Mock servis muhtemelen kendi DTO'larını duplike ediyor. `packages/` altında ortak bir `shared-types` Java modülü yok. Şema değişiminde her iki tarafı manuel günce zorlu.

### D5. `infrastructure/`, `scripts/`, `docs/` README'lerle bağlı değil
Klasör mevcut ama proje genel README'sinden derinlemesine link yok. Operator onboarding belirsiz.

### D6. `db-seed-proxy-mappings.sql`, `fix-proxy-mappings.sql`, `update-all-tenants.sql` repo kökünde
Bunlar prod-hotfix SQL'leri. `services/mapping-studio-api/scripts/operational-sql/` altına alınmalı; git history hotfix yapıldığı için silinmemeli ama yer değiştirmeli.

### D7. `notification/NotificationService.java` ile email/Slack/PagerDuty entegrasyonu var mı?
Pazarlama sayfasında "Alerting: PagerDuty, Slack, email" iddiası. Kod tarafında sadece `NotificationService.java` (içeriği denetlenmeli) ve WebSocket var. SMTP/Slack webhook adapter görünmüyor.

---

## E. Servis-bazlı özet matrisi

| Servis | Stack | Açık kritik | Yüksek | Orta | Düşük |
|---|---|---|---|---|---|
| mapping-studio-api | Quarkus 3.8.1 / Java 21 | 9 (A1-A9) | 6 | 9 | 4 |
| webhook-receiver | Quarkus 3.8.1 | 1 (A8) | 2 (B9,B10) | 1 (C13) | 0 |
| transformer | Node 20 / Fastify 5 | 0 | 3 (B3,B4,B6) | 3 (C7,C8,C11) | 0 |
| lead-capture-edge | Node 20 | 0 | 2 (B7,B8) | 0 | 0 |
| canonbridge-mock | Spring Boot 3.2.5 | 0 | 0 | 2 (C1,C10) | 1 (D4) |

---

## F. Top 10 — şu hafta yapılmalı

1. **A1** — API key → role mapping (sabit `admin` rolü kaldır).
2. **A2** — `@RolesAllowed` annotation tabanlı RBAC'e geç; path-string filter'ı sil.
3. **A4** — `CredentialSecretCodec` plain JSON fallback'i kaldır + `System.out` temizle.
4. **A5** — `jwt-secret-key.txt` dosyasını sil; default secret constant'ı kaldır.
5. **A8** — Webhook signature zorunlu yap; partner-specific signature scheme'leri destekle (C13).
6. **B1** — `KafkaConsumerService.processRawEvent()` ya gerçekten implement et ya da bean'i devre dışı bırak (yanıltıcı).
7. **B7** — Lead capture: `TURNSTILE_SECRET_KEY` yoksa fail-closed; KV-tabanlı rate limit.
8. **B11** — Outbox replay & scheduled poller için Postgres advisory lock ile leader election.
9. **B12** — RateLimitFilter reactive Redis API'ye çevir (`@Blocking` kaldır).
10. **A9** — Migration `out-of-order=false`; bekleyen V*'ları squash + repo kökündeki SQL hotfix'leri taşı.

---

## G. Pazarlama → kod boşlukları

Website'in iddia ettiği capability'ler ile koddaki durum:

| Pazarlama iddiası | Kod gerçekliği |
|---|---|
| "10,000+ events/sec, p99 200ms" | RateLimitFilter `@Blocking` (B12), Kafka producer `acks=1` (B9) — bu rakamlar kanıtlanmamış. |
| "Zero data loss, at-least-once + idempotency" | Outbox default-off (B3); `KafkaConsumerService` TODO (B1). |
| "Per-partner health, DLQ" | DLQ stats endpoint TODO (B2). |
| "JSONata visual mapping + auto-generated expressions" | Transformer'da expression sandbox/timeout yok (B4). |
| "PagerDuty, Slack, email alerting" | Notification adapter implementasyonu görünmüyor (D7). |
| "mTLS, RBAC, PII masking" | RBAC string-match (A2); mTLS config'i `nginx.conf`'a yok; `PiiMasker` var ama coverage testi yok. |
| "Multi-tenant isolation" | `TenantIsolationFilter` default fail-open (A3). |

Toplam açık: **38 madde** (9 Kritik / 12 Yüksek / 15 Orta / 6 Düşük + 7 pazarlama-gap).
