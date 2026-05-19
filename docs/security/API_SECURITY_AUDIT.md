# CanonBridge API Security Audit

**Tarih:** 19 Mayis 2026
**Durum:** Denetim Tamamlandi — Kritik Bulgular Giderildi
**Kapsam:** Mapping Studio API, Transformer Service, Webhook Receiver, Mock Services

---

## 1. Yonetici Ozeti

Bu belge, CanonBridge'in tum servislerindeki guvenlik kontrollerini gercek kod tabanina dayanarak denetler. Her kontrol icin **mevcut durum**, **kod referansi**, **risk seviyesi** ve **aksiyonlar** belirlenmistir.

### Giderilen Bulgular (19 Mayis 2026)

| Bulgu | Cozum |
|-------|-------|
| HDR-001: HTTP guvenlik basliklari eksik | `SecurityHeadersFilter` eklendi (3 servis) |
| AUTH-007: Timing attack'a acik webhook key karsilastirmasi | `MessageDigest.isEqual()` ile degistirildi |
| AUTH-008: HMAC imza dogrulamasi eksik | `verifyHmacSignature()` + `X-Webhook-Signature` header destegi eklendi |
| JSONATA-001/003: Blocked function kontrolu yok | `containsBlockedFunction()` ile 10 tehlikeli fonksiyon engellendi |
| INPUT-003/004: Body boyut limiti yapilandirilmamis | Fastify `bodyLimit: 2MB`, Webhook `max-body-size: 2M` eklendi |
| TENANT-001: Tenant izolasyonu varsayilan kapali | Varsayilan `true` olarak degistirildi |

### Ozet Tablo

| Kategori | Uygulanan | Eksik / Kismi | Kritik Eksik |
|----------|-----------|---------------|--------------|
| Kimlik dogrulama (AuthN) | 5 | 0 | 0 |
| Yetkilendirme (AuthZ) | 3 | 1 | 0 |
| Tenant izolasyonu | 3 | 0 | 0 |
| Sifreleme | 2 | 2 | 1 |
| Rate limiting | 1 | 1 | 0 |
| Giris dogrulama | 4 | 1 | 0 |
| HTTP guvenlik basliklari | 3 | 0 | 0 |
| Loglama ve denetim | 2 | 1 | 0 |
| Uretim ortami korumasi | 1 | 2 | 1 |

---

## 2. Servis Bazinda Kimlik Dogrulama (AuthN)

### 2.1 Mapping Studio API (Quarkus, port 8080)

**Durum: UYGULANMIS**

| Kontrol | Dosya | Detay |
|---------|-------|-------|
| API Key auth | `ApiAuthenticationFilter.java` | `X-API-Key` header, config: `canonbridge.auth.api-keys` |
| Bearer token (JWT) | `ApiKeyAuthenticator.java` + `JwtService.java` | `Authorization: Bearer <token>`, HMAC-SHA256 imza |
| JWT uretimi | `JwtService.java` | HS256, konfigurasyon: `canonbridge.jwt.secret`, TTL: 28800s (8 saat) |
| Auth devre disi birakma | `ApiAuthenticationFilter.java` | `canonbridge.auth.enabled=false` ile devre disi birakilabilir |
| Bypass yollari | `ApiAuthenticationFilter.java` | OPTIONS, health, metrics, openapi, swagger-ui, api/auth/login, api/auth/refresh |

**Kod Referansi:**
```
services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/security/ApiAuthenticationFilter.java
services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/security/ApiKeyAuthenticator.java
services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/auth/JwtService.java
```

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| AUTH-001 | JWT HS256 kullaniliyor; RS256/ES256 daha guvenli | ORTA | Kabul edilebilir (tek servis icinde) |
| AUTH-002 | Varsayilan JWT secret: `canonbridge-jwt-secret-key-for-development-only-change-in-production` | KRITIK (prod) | `SecurityConfigurationValidator` prod ortaminda engelliyor |
| AUTH-003 | Varsayilan API key: `dev-api-key` | KRITIK (prod) | `SecurityConfigurationValidator` prod ortaminda engelliyor |
| AUTH-004 | `constantTimeEquals` kullaniliyor (timing attack koruması) | OLUMLU | JwtService satir 71 |

### 2.2 Transformer Service (Node.js/Fastify, port 3000)

**Durum: UYGULANMIS (Basit)**

| Kontrol | Dosya | Detay |
|---------|-------|-------|
| API Key auth | `httpServer.ts:23-29` | `X-Api-Key` header, env: `API_KEY` |
| Auth devre disi birakma | `httpServer.ts:24` | `API_KEY` bos ise auth atlanir |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| AUTH-005 | Tek statik API key; tenant bazli ayrim yok | DUSUK | Icsel servis, kabul edilebilir |
| AUTH-006 | `/health`, `/metrics` auth bypass | OLUMLU | Dogru tasarim |

### 2.3 Webhook Receiver (Quarkus, port 8092)

**Durum: UYGULANMIS**

| Kontrol | Dosya | Detay |
|---------|-------|-------|
| Webhook key dogrulama | `WebhookAuthService.java` | SHA-256 hash karsilastirmasi, DB'den `secret_hash` okunuyor |
| Hassas header maskeleme | `WebhookService.java:71-72` | `X-Webhook-Key` ve `Authorization` loglara yazilmiyor |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| AUTH-007 | SHA-256 karsilastirmasi `storedHash.equals(providedHash)` — timing attack'a acik | ORTA | `MessageDigest.isEqual()` veya constant-time karsilastirma kullanilmali |
| AUTH-008 | HMAC imza dogrulamasi yok (docs'ta iddia edilmesine ragmen) | YUKSEK | Webhook body butunlugu dogrulanmiyor; HMAC-SHA256 eklenmeli |

---

## 3. Yetkilendirme (AuthZ)

### 3.1 Rol Tabanli Erisim Kontrolu (RBAC)

**Durum: UYGULANMIS**

**Dosya:** `RoleAuthorizationFilter.java`

| Rol | Erisim |
|-----|--------|
| `admin` | Tum islemler + DELETE + credential yazma |
| `integration_author` | Draft/version/partner/schema/webhook CRUD + proxy calistirma |
| `operator` | DLQ yonetimi + audit log okuma + proxy retry |
| `viewer` | Yalnizca GET/HEAD |

**Yol Bazli Kurallar:**

| Yol | GET | POST/PUT | DELETE |
|-----|-----|----------|--------|
| `api/audit-logs` | operator+ | operator+ | admin |
| `api/credentials` | author+ | admin | admin |
| `api/dlq` | operator+ | operator+ | admin |
| `api/mapping-drafts` | herkes | author+ | admin |
| `api/proxy/{id}` | herkes | author+operator | admin |
| `api/proxy/*/retry` | operator+ | operator+ | admin |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| AUTHZ-001 | RBAC `canonbridge.rbac.enabled=false` ile devre disi birakilabilir | ORTA | Prod'da aktif olmali |
| AUTHZ-002 | Yetki reddi audit log'a yaziliyor (`SECURITY_RBAC_DENIED`) | OLUMLU | Dogru uygulama |
| AUTHZ-003 | `api/jsonata/evaluate` proxy endpoint icin RBAC kurali eksik; `AUTHOR_ROLES` fallback'e dusuyor | DUSUK | Acik RBAC kurali eklenmeli |

### 3.2 Tenant Izolasyonu

**Durum: UYGULANMIS (Kismi)**

**Dosya:** `TenantIsolationFilter.java`

| Kontrol | Detay |
|---------|-------|
| Filter onceligi | `Priorities.AUTHENTICATION + 1` (auth'tan hemen sonra) |
| Konfigurasyon | `canonbridge.tenant.isolation.enabled` (varsayilan: `false`) |
| Principal-tenant esleme | `canonbridge.tenant.mappings=api-key:tenant-acme,...` |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| TENANT-001 | Tenant izolasyonu varsayilan olarak **KAPALI** (`false`) | YUKSEK | Prod'da `true` olmali |
| TENANT-002 | Izolasyon kapaliyken herhangi bir kullanici herhangi bir tenant verisine erisebilir | YUKSEK | Dev/test icin kabul edilebilir, prod'da tehlikeli |
| TENANT-003 | `X-Tenant-Id` header yoksa filter geciliyor (resource'a birakiliyor) | ORTA | Varsayilan tenant-id atanmamali; 400 donmeli |

---

## 4. Sifreleme

### 4.1 Credential Sifrelemesi (At-Rest)

**Durum: UYGULANMIS**

**Dosya:** `CredentialSecretCodec.java`

| Kontrol | Detay |
|---------|-------|
| Algoritma | AES-256-GCM (AEAD) |
| IV | 12 byte, `SecureRandom` |
| GCM tag | 128 bit |
| Anahtar | Base64-encoded, config: `canonbridge.credentials.encryption-key` |
| Format | `{"v":1,"alg":"AES-256-GCM","iv":"...","ciphertext":"..."}` |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| CRYPTO-001 | Varsayilan sifreleme anahtari: `MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=` | KRITIK (prod) | `SecurityConfigurationValidator` prod'da engelliyor |
| CRYPTO-002 | Anahtar rotasyonu mekanizmasi yok; `v:1` alani ileride destekleyebilir | ORTA | Anahtar rotasyon API'si planlanmali |

### 4.2 Transport Sifrelemesi (In-Transit)

**Durum: KISMI**

| Kontrol | Detay |
|---------|-------|
| Servisler arasi TLS | Docker Compose'da yok; Kubernetes'te Istio mTLS planlanmis |
| Disari donen HTTP | `OutboundHttpService` HTTPS URL'lerini destekliyor |
| Kafka TLS | Konfigurasyon mevcut ancak yerel ortamda aktif degil |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| CRYPTO-003 | Yerel Docker Compose ortaminda servisler arasi trafik sifrelenmemis | DUSUK | Prod'da Istio mTLS zorunlu |
| CRYPTO-004 | Kafka broker baglantisi PLAINTEXT | ORTA | Prod'da SSL/SASL zorunlu |

---

## 5. Rate Limiting

**Durum: UYGULANMIS**

**Dosya:** `RateLimitFilter.java`, `RateLimitService.java`, `RateLimitConfig.java`

| Kontrol | Detay |
|---------|-------|
| Algoritma | Sliding window (Redis-backed) |
| Kimlikli istek | Varsayilan 100 req/min |
| Kimligi belirsiz istek | Varsayilan 10 req/min, IP veya API key fingerprint |
| Response headers | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| Asim durumu | HTTP 429 + `Retry-After` header |
| Bypass | health, metrics, openapi, swagger-ui |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| RATE-001 | Redis baglantisi kesilirse rate limit uygulanmiyor olabilir (fail-open/fail-closed?) | ORTA | Fail-open davranisi kontrol edilmeli |
| RATE-002 | Transformer Service'te rate limit yok | DUSUK | Icsel servis; Kubernetes NetworkPolicy ile koruma yeterli |

---

## 6. Giris Dogrulama (Input Validation)

### 6.1 Mapping Studio API

| Kontrol | Dosya | Detay |
|---------|-------|-------|
| JSON body validation | Quarkus JAX-RS | Otomatik JSON parse |
| XML escape | `OutboundHttpService.java` | `escapeXml()` fonksiyonu SOAP payload'lari icin |
| SQL injection | Quarkus Panache / prepared queries | Parametreli sorgular |
| Webhook key hash | `WebhookAuthService.java` | Girdi hashleniyor, dogrudan DB'ye yazilmiyor |

### 6.2 Transformer Service

| Kontrol | Dosya | Detay |
|---------|-------|-------|
| Body schema validation | `httpServer.ts:102-165` | Fastify JSON Schema (partnerId, eventType required) |
| Ajv 2020-12 | Transform engine | Input + output schema validation |
| JSONata timeout | Transform engine | Worker pool ile CPU izolasyonu |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| INPUT-001 | JSONata expression sandbox'u yok — `$eval`, `$millis`, `$now` gibi fonksiyonlar engellenmemis | YUKSEK | Validation pipeline Stage 5'te blocked function check tanimlanmis ama runtime'da uygulanmiyor |
| INPUT-002 | `/v1/jsonata/evaluate` endpoint'ine gelen expression dogrudan calistiriliyor; DoS riski | YUKSEK | Expression boyut limiti + zaman asimi zorunlu |
| INPUT-003 | Request body boyut limiti (Fastify varsayilani 1MB) acikca yapilandirilmamis | ORTA | `bodyLimit` konfigurasyon edilmeli |
| INPUT-004 | Mapping Studio API'de request body boyut limiti yapilmadirilmamis | ORTA | `quarkus.http.limits.max-body-size` yapilmali |

---

## 7. HTTP Guvenlik Basliklari

**Durum: UYGULANMAMIS**

Hicbir serviste asagidaki HTTP guvenlik basliklarai bulunamadi:

| Baslik | Beklenen Deger | Durum |
|--------|---------------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | EKSIK |
| `X-Content-Type-Options` | `nosniff` | EKSIK |
| `X-Frame-Options` | `DENY` | EKSIK |
| `Content-Security-Policy` | `default-src 'self'` | EKSIK |
| `X-XSS-Protection` | `0` (modern tarayicilar icin) | EKSIK |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | EKSIK |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | EKSIK |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| HDR-001 | Hicbir serviste HTTP guvenlik basligi yok | YUKSEK | Response filter eklenmelidir |
| HDR-002 | CORS yapilandirmasi mevcut ve dogru (explicit origins) | OLUMLU | Prod'da localhost kaldirilmali |

**Onerilen Uygulama:**

Mapping Studio API icin:
```java
@Provider
@Priority(Priorities.HEADER_DECORATOR)
public class SecurityHeadersFilter implements ContainerResponseFilter {
    @Override
    public void filter(ContainerRequestContext req, ContainerResponseContext res) {
        res.getHeaders().putSingle("X-Content-Type-Options", "nosniff");
        res.getHeaders().putSingle("X-Frame-Options", "DENY");
        res.getHeaders().putSingle("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        res.getHeaders().putSingle("Content-Security-Policy", "default-src 'self'");
        res.getHeaders().putSingle("Referrer-Policy", "strict-origin-when-cross-origin");
        res.getHeaders().putSingle("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    }
}
```

Transformer Service icin:
```typescript
app.addHook('onSend', async (_request, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});
```

---

## 8. Uretim Ortami Korumasi

### 8.1 SecurityConfigurationValidator

**Durum: UYGULANMIS**

**Dosya:** `SecurityConfigurationValidator.java`

Uygulama baslarken asagidaki kontrolleri yapar (`canonbridge.security.environment=production` ise):

| Kontrol | Aciklama |
|---------|----------|
| API key | `dev-api-key` icermemeli |
| JWT secret | Varsayilan secret kullanilmamali |
| Credential key | Varsayilan sifreleme anahtari kullanilmamali |
| CORS origins | Wildcard veya localhost icermemeli |
| Swagger UI | Prod'da aktif olmamali |
| Public docs | Prod'da devre disi olmali |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| PROD-001 | Validator yalnizca `production`/`prod` ortaminda calisir; `staging` icin kontrol yok | ORTA | Staging icin de aktif olmali |
| PROD-002 | Transformer Service'te benzer bir validator yok | ORTA | Node.js tarafinda da startup kontrolu eklenmeli |
| PROD-003 | `canonbridge.security.fail-on-insecure-defaults=false` ile tum kontroller atlanabilir | DUSUK | Prod imajinda bu bayrak kaldirilmali |

---

## 9. Loglama ve Denetim Izi

### 9.1 Audit Log

**Durum: UYGULANMIS**

| Kontrol | Dosya | Detay |
|---------|-------|-------|
| RBAC reddi loglama | `RoleAuthorizationFilter.java` | `SECURITY_RBAC_DENIED` aksiyonu |
| Auth hatasi loglama | `ApiAuthenticationFilter.java` | Basarisiz girisler loglanir |
| Hassas header maskeleme | `WebhookService.java` | `X-Webhook-Key`, `Authorization` loglardan cikarilir |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| LOG-001 | Basarili auth olaylari loglanmiyor (yalnizca hatalar) | ORTA | Basarili girisler de audit trail'e eklenmeli |
| LOG-002 | Rate limit asimlari WARN seviyesinde loglanir | OLUMLU | Dogru uygulama |
| LOG-003 | Transformer Service'te auth olaylari loglanmiyor | DUSUK | Icsel servis; kabul edilebilir |

---

## 10. JSONata Sandbox Guvenligi

### 10.1 Mevcut Durum

Validation pipeline dokumani (Stage 5) asagidakileri tanimlar:
- JSONata lint
- Blocked function check (network/file/non-deterministic)

**Ancak runtime'da bu kontrol UYGULANMAMIS.**

### 10.2 Risk Analizi

| Senaryo | Risk | Aciklama |
|---------|------|----------|
| `$eval()` kullananmi | YUKSEK | Keyfi ifade calistirma |
| `$millis()` / `$now()` | ORTA | Non-deterministic cikti, test tekrarlanabilirligini bozar |
| Sonsuz dongu | YUKSEK | Worker thread'i kitler |
| Asiri bellek kullanan ifade | YUKSEK | OOM crash |

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| JSONATA-001 | Runtime'da blocked function kontrolu yok | YUKSEK | Compile asamasinda AST taramasi ile engellenmeli |
| JSONATA-002 | Worker pool CPU izolasyonu mevcut | OLUMLU | Tek bir ifade tum event loop'u kilitleyemez |
| JSONATA-003 | `/v1/jsonata/evaluate` endpoint'i — kullanici tarafindan saglanan expression dogrudan calistiriliyor | YUKSEK | Expression whitelist / AST scan uygulanmali |

**Onerilen Blocked Functions:**
```
$eval, $environment, $import, $require, $fetch, $http
```

---

## 11. CORS Yapilandirmasi

**Durum: DOGRU YAPILANDIRILMIS**

**Dosya:** `application.properties:8-13`

```properties
quarkus.http.cors=true
quarkus.http.cors.origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200,http://localhost:3000}
quarkus.http.cors.methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
quarkus.http.cors.headers=accept,authorization,content-type,x-requested-with,x-tenant-id,x-user-id,x-correlation-id,x-api-key
quarkus.http.cors.exposed-headers=X-Correlation-Id,X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset
quarkus.http.cors.access-control-max-age=24H
```

**Bulgular:**

| ID | Bulgu | Risk | Durum |
|----|-------|------|-------|
| CORS-001 | Varsayilan origin'ler `localhost` iceriyor; prod'da degistirilmeli | DUSUK | `SecurityConfigurationValidator` prod'da engelliyor |
| CORS-002 | `access-control-max-age=24H` makul | OLUMLU | - |
| CORS-003 | Exposed header'lar yalnizca gerekli olanlari iceriyor | OLUMLU | - |

---

## 12. Oncelikli Aksiyon Plani

### Kritik (Hemen)

| # | Aksiyon | Ilgili Bulgu | Efor |
|---|---------|-------------|------|
| 1 | HTTP guvenlik basliklari ekle (tum servisler) | HDR-001 | 2 saat |
| 2 | JSONata blocked function AST taramasi ekle | JSONATA-001, JSONATA-003 | 4 saat |
| 3 | Webhook HMAC-SHA256 body signature dogrulamasi ekle | AUTH-008 | 3 saat |
| 4 | Webhook key karsilastirmasini constant-time yap | AUTH-007 | 30 dk |

### Yuksek (1 Hafta Icinde)

| # | Aksiyon | Ilgili Bulgu | Efor |
|---|---------|-------------|------|
| 5 | Tenant izolasyonunu varsayilan olarak aktif yap | TENANT-001 | 1 saat |
| 6 | Request body boyut limitlerini yapilandir | INPUT-003, INPUT-004 | 1 saat |
| 7 | Prod'da Kafka SSL/SASL yapilandir | CRYPTO-004 | 4 saat |
| 8 | `/v1/jsonata/evaluate` expression boyut limiti ekle | INPUT-002 | 1 saat |

### Orta (Sprint Icinde)

| # | Aksiyon | Ilgili Bulgu | Efor |
|---|---------|-------------|------|
| 9 | Basarili auth olaylarini audit log'a yaz | LOG-001 | 2 saat |
| 10 | Credential anahtar rotasyon mekanizmasi | CRYPTO-002 | 8 saat |
| 11 | Transformer Service startup guvenlik kontrolu | PROD-002 | 2 saat |
| 12 | Staging ortami icin SecurityConfigurationValidator genislet | PROD-001 | 1 saat |
| 13 | Rate limit fail-open/fail-closed davranisini belirle | RATE-001 | 2 saat |

---

## 13. Kontrol Matrisi

| Kontrol | Studio API | Transformer | Webhook Receiver |
|---------|-----------|-------------|-----------------|
| Authentication | API Key + JWT | API Key | Webhook Key (SHA-256) |
| Authorization (RBAC) | 4 rol | Yok (tek servis) | Yok |
| Tenant isolation | Filter (varsayilan kapali) | Topic-based | Partner-based |
| Rate limiting | Redis sliding window | Yok | Yok |
| Credential encryption | AES-256-GCM | N/A | N/A |
| Input validation | JAX-RS + Ajv | Fastify schema + Ajv | Body parse |
| SQL injection koruması | Prepared queries | N/A | Prepared queries |
| XSS koruması | JSON API (HTML yok) | JSON API | JSON API |
| CSRF koruması | API-only (cookie yok) | API-only | API-only |
| CORS | Explicit origins | Configurable | N/A |
| HTTP security headers | EKSIK | EKSIK | EKSIK |
| HMAC signature | N/A | N/A | EKSIK |
| Audit logging | Var | Yok | Yok |
| Prod config validator | Var | Yok | Yok |
| Body size limit | Yapilandirilmamis | Fastify varsayilani (1MB) | Yapilandirilmamis |
| JSONata sandbox | EKSIK | Worker pool (CPU) | N/A |

---

## 14. Referanslar

| Dosya | Aciklama |
|-------|----------|
| `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/security/ApiAuthenticationFilter.java` | Ana auth filter |
| `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/security/ApiKeyAuthenticator.java` | API key + JWT dogrulama |
| `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/security/RoleAuthorizationFilter.java` | RBAC filter |
| `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/security/TenantIsolationFilter.java` | Tenant izolasyon filter |
| `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/security/SecurityConfigurationValidator.java` | Prod guvenlik kontrolu |
| `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/ratelimit/RateLimitFilter.java` | Rate limit filter |
| `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/credential/CredentialSecretCodec.java` | AES-256-GCM codec |
| `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/auth/JwtService.java` | JWT uretim/dogrulama |
| `services/transformer/src/httpServer.ts` | Transformer auth + API |
| `services/webhook-receiver/src/main/java/com/canonbridge/webhook/service/WebhookAuthService.java` | Webhook key dogrulama |
| `services/webhook-receiver/src/main/java/com/canonbridge/webhook/service/WebhookService.java` | Webhook isleme |
| `docs/adr/ADR-009-security-threat-model.md` | Tehdit modeli |
| `docs/implementation/10-security.md` | Guvenlik gereksinimleri |
| `docs/operations/14-security-operations.md` | Operasyonel guvenlik |
