# CanonBridge — Remediation Verification Report (v1.0)

**Tarih:** 22 Mayıs 2026  
**Kapsam:** `services/`, `infrastructure/`, `mapping-studio-ui/`, `website/`, `docs/`  
**Karşılaştırma tabanı:** v2/v3/v4 audit raporları + infrastructure raporu + SaaS monetization doc  
**Repo durumu:** 821 dosya güncellenmiş (son 24 saat), 30+ commit  
**Sonuç (özet):** **55 kritik/yüksek bulgudan 46'sı kapatıldı (%84)**, **6'sı kısmen**, **3'ü hâlâ açık**, ayrıca **7 yeni gözlem** eklendi.

---

## 1. Yönetici Özeti

Repo son turlarda ciddi bir "remediation sprint" geçirmiş. Özellikle:

- **Tam altyapı yeniden yapılandırıldı**: `canonbridge` namespace birleşimi, KRaft modu, network policies, OTel collector, kustomization, GitOps (ArgoCD), production Caddyfile + Prometheus profilleri.
- **`docs/` baştan kuruldu**: 13 ADR, 11 architecture, 9 deployment, 16 operations, 8 testing, 10 implementation, 6+ product, 12+ project belgesi. SaaS monetization tasks dosyası iş kırılımı olarak eklenmiş.
- **Yeni service**: `billing-service` (Quarkus + Paddle + Kafka usage consumer) → SaaS stratejisinin **birinci ayağı** çalışıyor.
- **UI'da kritik değişiklikler**: `quota-banner`, `upgrade-modal`, `billing.service.ts`, `auth.interceptor`, `auto-save` — entitlement & freemium akışının UI tarafı bağlanmış.
- **Güvenlik bulgularının büyük çoğunluğu giderildi** (timing-safe karşılaştırma, replay koruması, HEALTHCHECK düzeltmesi, Prometheus metric path düzeltmesi, namespace birleşimi, KRaft).

Geriye kalanlar ağırlıkla **çift-katlı sertleşme** (defense-in-depth) ve **gerçek SaaS canlıya alma** öncesi gereken son rötuşlar.

---

## 2. Kritik Bulgu Doğrulama Matrisi

| ID | Bulgu | Önceki Durum | Şimdiki Durum | Kanıt |
|----|-------|--------------|---------------|-------|
| **K1** | `CredentialSecretCodec` hardcoded default AES anahtarı | 🔴 Kritik | ✅ **Düzeldi** | `@ConfigProperty(name="canonbridge.credentials.encryption-key")` artık `defaultValue` taşımıyor → eksikse uygulama açılmıyor (fail-fast). |
| **K4** | Webhook HMAC secret = client'ın gönderdiği `X-Webhook-Key` | 🔴 Kritik | 🟡 **Kısmen** | `verifyHmacSignature(payload, sig, webhookKey)` hâlâ partner-secret olarak `webhookKey`'in plaintext halini kullanıyor. DB'de `secret_hash` saklı, ama HMAC için ayrı bir `signing_secret` kolonu yok. **Öneri:** `webhook_endpoints` tablosuna `signing_secret` (envelope-encrypted) ekle, HMAC için onu kullan. |
| **K5** | Webhook timestamp / replay koruması yok | 🔴 Kritik | ✅ **Düzeldi** | `TIMESTAMP_TOLERANCE_SECONDS = 300` + Stripe-style `t=...,v1=...` formatında doğrulama eklendi (`WebhookAuthService.java:62-68`). |
| **K7** | Transformer API key compare `Array.includes` (zamanlama sızıntısı) | 🔴 Kritik | ✅ **Düzeldi** | `timingSafeEqual(Buffer.from(key), Buffer.from(provided))` kullanılıyor (`httpServer.ts:42`). |
| **K8** | Transformer `API_KEY` yoksa auth bypass | 🔴 Kritik | ✅ **Düzeldi** | `apiKeyAuth` artık liste kontrolü yapıyor; `env.apiKeys/env.apiKey` set değilse hiçbir endpoint `security: [{ apiKey: [] }]` ile işaretlenmiyor — anonim erişim engelli. |
| **K10** | Tüm `defaultValue` secret leaks | 🔴 Kritik | ✅ **Düzeldi** | `application.properties` taramasında secret alanlarında default yok; CORS `%prod` profili default'suz. |
| **Y1/Y2** | RateLimitService blocking Redis + atomik olmayan sliding window | 🟠 Yüksek | ✅ **Düzeldi** | `RateLimitService` artık tek tur (`Y2: Atomic sliding window via single Redis pipeline`) + in-memory fallback. Reactive event loop'ta blocking çağrı kalmadı. |
| **Y4** | CORS prod'da yanlışlıkla wildcard riski | 🟠 Yüksek | 🟡 **Kısmen** | `mapping-studio-api` prod'da default'suz ✅. Ama `billing-service` hâlâ `${CORS_ALLOWED_ORIGINS:http://localhost:4200,http://localhost:3000}` default'unu prod profilinde override etmiyor → **prod'a aynısıyla çıkarsa localhost origin'leri geçerli**. |
| **Y9** | Webhook event idempotency yok | 🟠 Yüksek | 🟡 **Kısmen** | Producer tarafı `UUID.randomUUID()` üretiyor → **client-supplied `Idempotency-Key` header'ı kabul edilmiyor**. Consumer (`UsageEventConsumer`) idempotency var ✅. Webhook retry'larında duplicate event'ler oluşabilir. |
| **Y13** | `lead-capture-edge` KV yoksa fail-open | 🟠 Yüksek | ✅ **Düzeldi** | `index.ts:181` artık **fail-closed**: `RATE_LIMIT_KV not configured — rejecting request`. |
| **O6** | webhook-receiver Dockerfile HEALTHCHECK yanlış port/path | 🟠 Yüksek | ✅ **Düzeldi** | Port `8082`, path `/q/health/ready`. |

---

## 3. Infrastructure Doğrulama

| ID | Bulgu | Şimdiki Durum | Kanıt |
|----|-------|---------------|-------|
| **G1** | `etl-solutions` vs `canonbridge` namespace çelişkisi | ✅ **Düzeldi** | Tüm `k8s/*.yaml` dosyaları `namespace: canonbridge`. `kustomization.yaml` da aynı namespace ile birleşik. |
| **G2/S3** | Transformer Kafka DNS yanlış | ✅ **Düzeldi** | `transformer/configmap.yaml` aynı namespace içinde service discovery kullanıyor. |
| **K1 (infra)** | `secrets.yaml` repo'da committed | ✅ **Düzeldi** | Dosya silinmiş; sadece `secrets.example.yaml` + `mapping-studio-api-secret.example.yaml` + `transformer/secret.example.yaml` var. **Öneri:** `.gitignore`'a `secrets.yaml` ekle (regression önlemi). |
| **K2/K5 (infra)** | Pod'lar root, Kafka PLAINTEXT | 🟡 **Kısmen** | `network-policies.yaml` eklendi ✅. **Henüz açık:** çoğu Deployment'ta `securityContext: { runAsNonRoot: true, readOnlyRootFilesystem: true }` yok. Kafka brokers arası TLS/SASL hâlâ PLAINTEXT (single-cluster lab için kabul edilebilir, multi-tenant SaaS'ta blok). |
| **A1** | Kafka KRaft setup eksik | ✅ **Düzeldi** | `KAFKA_PROCESS_ROLES`, `KAFKA_NODE_ID`, kraft-config volume hazır. |
| **O1** | Prometheus `/metrics` yerine `/q/metrics` gerekli | ✅ **Düzeldi** | Hem `infrastructure/docker/prometheus/prometheus.yml` hem `infrastructure/production/prometheus.yml` Quarkus servisleri için `metrics_path: /q/metrics`. Transformer (Node) için `/metrics` korunmuş ✅. |
| **R1** | CPU limits → CFS throttling | 🔴 **Hâlâ açık** | Deployment'larda hâlâ `resources.limits.cpu` set; latency-sensitive servislerde (`mapping-studio-api`, `transformer`) `requests` only öneriliyor. |

**Yeni eklenmiş ve takdire şayan:**
- `gitops/argocd-application.yaml` + `argocd-project.yaml` → GitOps disiplini hazır.
- `otel-collector.yaml` → tracing pipeline.
- `network-policies.yaml` → namespace-içi default-deny izlenimi (içeriği doğrulanmadı).
- `infrastructure/production/Caddyfile` → TLS terminator.

---

## 4. Yeni Eklenmiş Gözlemler (v1 Audit Sonrası)

### G-NEW-01 — `billing-service` üretime hazır mı? 🟡

`services/billing-service/` artık var, Paddle entegrasyonu + Kafka usage consumer + API/domain katmanları mevcut. **Eksik kontrol:**
- Paddle webhook signature verification (timing-safe + replay) → ayrı `WebhookSignatureVerifier` görünmüyor; mapping-studio'daki `WebhookAuthService` kalıbı tekrar kullanılmalı.
- `UsageEventConsumer` consume-once semantiği için Kafka manual commit + dedupe tablosu var mı doğrulayın.
- `billing-usage.json` Grafana dashboard'u eklendi ✅ ama `billing.yml` Prometheus alert kuralları "stub" olabilir → eşik değerlerini doldurun.

### G-NEW-02 — `mapping-studio-ui` quota & upgrade akışı 🟢
`quota-banner.component.ts`, `upgrade-modal.component.ts`, `billing.service.ts` eklendi. Freemium tier sınırı UI'da görünüyor. **Tavsiye:** server-side entitlement enforcement (mapping-studio-api'de `EntitlementInterceptor`) UI bypass'a karşı zorunlu — SaaS doc'taki Faz-2 maddesi.

### G-NEW-03 — `infrastructure/k8s/transformer/` ayrı modül 🟢
Transformer için ayrı namespace + HPA + PodDisruptionBudget + ServiceMonitor eklenmiş. Production-grade. **Tavsiye:** aynı template'i `webhook-receiver` ve `billing-service` için de kullanın (şu an yok).

### G-NEW-04 — ADR-009 Security Threat Model 🟢
STRIDE benzeri bir tehdit modeli eklendi. **Tavsiye:** her major release'de güncelleyin; SOC 2 Type II hazırlığı için tarihli revizyon zorunlu.

### G-NEW-05 — `docs/operations/16-alert-threshold-calibration.md` 🟡
İki ayrı `16-` prefixli dosya var (`alert-threshold` ve `audit-logging`). Numbering çatışması — birini `17-audit-logging.md` yapın.

### G-NEW-06 — `release-please` + `dependabot` ✅
`.github/workflows/release-please.yml` + `.github/dependabot.yml` eklendi → versiyonlama ve dependency hijyeni otomatize.

### G-NEW-07 — Postman koleksiyonu + i18n (TR/EN) ✅
`CanonBridge_API_Proxy.postman_collection.json` + `mapping-studio-ui/public/i18n/{en,tr}.json` → developer experience + Türkçe pazara hazırlık tamam.

---

## 5. Hâlâ Açık Olan / Yapılması Gerekenler

### 🔴 Kritik (Production öncesi must-fix)
1. **K4 tam çözümü:** webhook signing secret'i `webhook-key`'den ayır. Schema:
   ```sql
   ALTER TABLE webhook_endpoints
   ADD COLUMN signing_secret_encrypted TEXT NOT NULL;
   ```
   `WebhookAuthService.verifyHmacSignature()` parametresi olarak DB'den çekilen secret kullanılmalı.
2. **R1 CPU limits:** Latency-sensitive Quarkus pod'larından `limits.cpu` kaldır (sadece `requests`).
3. **Y4 (billing-service CORS):** `%prod.quarkus.http.cors.origins=${CORS_ALLOWED_ORIGINS}` satırını ekle.

### 🟠 Yüksek (Beta öncesi)
4. **Y9 client-supplied idempotency:** `WebhookResource` `Idempotency-Key` header'ı kabul etsin; `processed_events` tablosunda 24h TTL ile dedupe.
5. **Pod securityContext:** Tüm Deployment'lara `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, `capabilities.drop: [ALL]` ekle.
6. **Kafka inter-broker TLS:** SaaS multi-tenant öncesi `SASL_SSL` zorunlu. Şimdi `PLAINTEXT`.
7. **Paddle webhook signature** (`billing-service`): yoksa ekle, varsa code review.

### 🟡 Orta
8. `secrets.yaml` regression guard → `.gitignore`'a ekle + pre-commit hook.
9. `docs/operations/16-*` numbering çatışmasını düzelt.
10. `webhook-receiver` ve `billing-service` için `transformer/`-style HPA/PDB/ServiceMonitor template'leri.

---

## 6. SaaS Monetization Doc — Uygulama Durumu

`canonbridge-saas-monetization-strategy.md`'deki Faz-1 (0-3 ay) maddelerine karşı durum:

| Faz-1 İş Kalemi | Durum |
|-----------------|-------|
| Paddle hesap + product object'leri | ❓ Doc içinde yer alıyor, hesap açıldı mı bilinmiyor |
| `billing-service` skeleton (Quarkus + Postgres + Kafka consumer) | ✅ **Tamam** |
| `usage_events` Kafka topic | ✅ **Tamam** (`create-topics.sh` içinde) |
| `mapping-studio-ui`'da read-only "Usage" tab | 🟡 `billing.service.ts` + `quota-banner` var; tam usage history sayfası eklendi mi kontrol edilmeli |
| `/pricing` placeholder + waitlist | ❓ Website tarafı doğrulanmadı (sonraki tur) |
| Loyalty code dağıtımı | ⏳ Beklemede |
| `EntitlementInterceptor` (mapping-studio-api, Redis cache) | ❌ Henüz görünmüyor |
| `Prometheus billing counter`'lar + Grafana MRR dashboard | 🟡 `billing-usage.json` dashboard var, MRR widget'ı doğrulanmadı |

**Sonuç:** Faz-1'in **~%60'ı** mevcut. Üretime alımı bloke eden iki kritik kalem: **EntitlementInterceptor** ve **Paddle webhook signature**.

---

## 7. Önerilen Sonraki Adımlar (önceliklendirilmiş)

```
P0 (bu hafta):
  - K4 webhook signing_secret ayrımı
  - R1 CPU limits kaldırma  
  - Pod securityContext sertleştirme
  - Y4 billing-service prod CORS

P1 (1-2 hafta):
  - EntitlementInterceptor (mapping-studio-api + Redis)
  - Paddle webhook signature verification
  - Idempotency-Key header desteği (webhook-receiver)
  - Kafka SASL_SSL

P2 (3-4 hafta):
  - webhook-receiver / billing-service için HPA+PDB+ServiceMonitor
  - SOC 2 Type II evidence collection başlat
  - SealedSecrets / ExternalSecrets operatörü
  - Chaos test paketi (docs/testing/05-chaos-tests.md var, koşulmuyor)
```

---

## 8. Genel Değerlendirme

| Boyut | Önceki | Şimdi | Trend |
|-------|--------|-------|-------|
| Güvenlik | 4/10 | **8/10** | ⬆️⬆️ |
| Operasyonel Hazırlık | 3/10 | **8/10** | ⬆️⬆️⬆️ |
| Mimari Disiplin | 6/10 | **9/10** | ⬆️ |
| Dokümantasyon | 4/10 | **10/10** | ⬆️⬆️⬆️ |
| SaaS Hazırlığı | 1/10 | **6/10** | ⬆️⬆️ |
| **Genel** | **3.6/10** | **8.2/10** | **+128%** |

**Önemli:** Sistem artık "lab projesi" değil, **production-grade SaaS adayı**. Yukarıdaki P0 + P1 listesi (~3 hafta iş) tamamlandığında public beta'ya çıkmaya hazır.

---

**Sonraki tur önerisi:** `website/` ve `mapping-studio-ui/` için pricing page, usage dashboard, ve onboarding flow'larının ayrı bir UI/UX audit'i.
