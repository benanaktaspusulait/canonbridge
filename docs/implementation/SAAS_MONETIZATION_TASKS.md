# CanonBridge — SaaS Monetizasyon Uygulama Task Listesi

> Referans: `canonbridge-saas-monetization-strategy.md`  
> Oluşturulma: 2026-05-22  
> Kapsam: 90 gün (Billing Foundations) + 180 gün (Monetize) + 365 gün (Scale & Enterprise)

---

## Mevcut Durum Özeti

| Bileşen | Durum |
|---------|-------|
| PostgreSQL + Flyway | ✅ 42 migration mevcut, olgun |
| Kafka + Schema Registry | ✅ 7 topic aktif, `usage.events` yok |
| Redis | ✅ Rate limiting + cache için kullanılıyor |
| Auth / Users | ✅ JWT + API Key + OIDC hazır, tek tenant |
| Tenants tablosu | ✅ Var ama singleton (single-tenant) |
| Organization / Team | ❌ Yok — oluşturulacak |
| Billing / Subscription | ❌ Yok — sıfırdan |
| Paddle / Stripe entegrasyonu | ❌ Yok |
| Usage metering | ❌ Yok |
| Pricing sayfası (website) | ❌ Yok |
| Billing UI (mapping-studio-ui) | ❌ Yok |

---

## FAZ 0 — Altyapı & Domain Model (Hafta 1–3)

### TASK-001: Organizations & Multi-Tenancy Geçişi

**Öncelik:** 🔴 Kritik  
**Servis:** `mapping-studio-api`  
**Dosyalar:** Flyway migration (V43+), entity sınıfları, repository  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [x] `organizations` tablosu oluştur (id UUID, name, slug, owner_user_id, billing_email, country, vat_id, status, metadata JSONB, created_at, updated_at)
- [x] `org_members` tablosu oluştur (org_id, user_id, role, invited_at, accepted_at)
- [x] Mevcut `tenants` tablosunu `organizations` ile ilişkilendir (tenant = deployment unit, org = billing unit)
- [x] `users` tablosuna `default_org_id` kolonu ekle
- [x] Sign-up akışında otomatik "Personal" organization oluşturma
- [x] `X-Org-Id` header desteği ekle (mevcut `X-Tenant-Id` yanına)
- [x] Organization CRUD endpoint'leri: `GET/POST/PUT /api/organizations`
- [x] Org member davet/kabul/çıkar endpoint'leri
- [ ] Birim testleri

**Kabul kriterleri:**
- Her kullanıcı en az bir organization'a ait
- Organization bazlı izolasyon çalışıyor
- Mevcut single-tenant verisi migrate edilmiş

---

### TASK-002: Plans & Plan Features Tabloları

**Öncelik:** 🔴 Kritik  
**Servis:** `mapping-studio-api`  
**Dosyalar:** Flyway migration, seed data  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] `plans` tablosu oluştur (id, code VARCHAR UNIQUE, name, price_monthly_cents INT, price_yearly_cents INT, currency, is_public BOOLEAN, sort_order, created_at)
- [ ] `plan_features` tablosu oluştur (plan_id FK, feature_key VARCHAR, limit_value BIGINT, unit VARCHAR, is_soft_limit BOOLEAN)
- [ ] Seed data: Free, Starter ($29), Growth ($149), Scale ($599), Enterprise planları
- [ ] Her plan için feature limitleri seed et (mapping_runs, transform_requests, webhook_events, lead_captures, active_mappings, webhook_endpoints, seats, retention_days, environments)
- [ ] `GET /api/plans` — public plan listesi endpoint'i
- [ ] `GET /api/plans/:code/features` — plan detay endpoint'i

**Kabul kriterleri:**
- 5 plan ve tüm feature limitleri DB'de mevcut
- Public API'den plan bilgileri okunabiliyor
- Plan değişikliği migration ile yönetilebilir

---

### TASK-003: Subscriptions Tablosu & Domain Modeli

**Öncelik:** 🔴 Kritik  
**Servis:** `mapping-studio-api`  
**Dosyalar:** Flyway migration, entity, repository, service  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] `subscriptions` tablosu oluştur (id UUID, org_id FK, plan_id FK, status ENUM[active, trialing, past_due, canceled, paused], current_period_start TIMESTAMPTZ, current_period_end TIMESTAMPTZ, trial_end TIMESTAMPTZ, cancel_at TIMESTAMPTZ, canceled_at TIMESTAMPTZ, external_provider VARCHAR, external_ref VARCHAR, metadata JSONB, created_at, updated_at)
- [ ] `subscription_history` tablosu (audit trail: her değişiklikte eski state kaydı)
- [ ] Yeni organization oluşturulduğunda otomatik Free plan subscription ata
- [ ] Subscription status geçiş kuralları (state machine): `trialing → active → canceled`, `active → past_due → canceled`
- [ ] `GET /api/organizations/:orgId/subscription` endpoint'i
- [ ] Subscription domain event'leri (Kafka `billing.events` topic'ine publish)

**Kabul kriterleri:**
- Her org'un aktif bir subscription'ı var
- Status geçişleri doğrulanmış
- Geçmiş değişiklikler audit edilebilir

---

### TASK-004: Usage Events Altyapısı (Metering)

**Öncelik:** 🔴 Kritik  
**Servis:** `mapping-studio-api`, `transformer`, `webhook-receiver`  
**Dosyalar:** Flyway migration, Kafka topic, publisher sınıfları  
**Durum:** ✅ TAMAMLANDI (DB + Kafka topic + Publisher + tüm servis entegrasyonları hazır)

**Alt görevler:**
- [ ] `usage_events` tablosu oluştur (id UUID, org_id FK, service VARCHAR, metric VARCHAR, qty INT, ts TIMESTAMPTZ DEFAULT NOW(), request_id VARCHAR UNIQUE, metadata JSONB)
- [ ] `usage_aggregates_daily` tablosu (org_id, metric, day DATE, qty BIGINT, cost_cents INT, PRIMARY KEY(org_id, metric, day))
- [ ] `usage_aggregates_monthly` tablosu (org_id, metric, month DATE, qty BIGINT, cost_cents INT)
- [ ] Kafka `usage.events` topic oluştur (6 partition, 30 gün retention)
- [ ] `create-topics.sh`'e `usage.events` ve `billing.events` topic'lerini ekle
- [ ] `UsagePublisher` sınıfı — her servis için ortak Kafka producer interface
- [ ] mapping-studio-api'de mapping execution sonrası `usage.events`'a publish
- [ ] transformer'da transform request sonrası `usage.events`'a publish
- [ ] webhook-receiver'da event delivery sonrası `usage.events`'a publish
- [ ] Usage event consumer: Kafka → `usage_events` tablosuna yaz (idempotent, request_id bazlı)
- [ ] Günlük aggregation cron job (usage_events → usage_aggregates_daily)
- [ ] Aylık aggregation cron job (daily → monthly rollup)
- [ ] Partition ve index stratejisi (ts bazlı range partition önerisi)

**Kabul kriterleri:**
- Her mapping run, transform request, webhook event bir usage event üretiyor
- Idempotent yazım (aynı request_id tekrar yazılmıyor)
- Günlük aggregate doğru hesaplanıyor
- Kafka consumer lag < 1000 normal yükte

---

### TASK-005: Entitlements Cache & Redis Yapısı

**Öncelik:** 🔴 Kritik  
**Servis:** `mapping-studio-api`  
**Dosyalar:** Redis key design, EntitlementService, Flyway migration  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] `entitlements_cache` tablosu (org_id, feature_key, limit_value BIGINT, used_value BIGINT, remaining BIGINT, resets_at TIMESTAMPTZ, updated_at)
- [ ] Redis key tasarımı: `entitlement:{org_id}:{feature_key}` → JSON `{limit, used, remaining, resets_at}`
- [ ] `EntitlementService` sınıfı:
  - `checkQuota(orgId, featureKey, requestedQty)` → ALLOWED / SOFT_LIMIT / HARD_LIMIT
  - `incrementUsage(orgId, featureKey, qty)` → Redis INCRBY + async DB sync
  - `resetQuotas(orgId)` → period başında sıfırla
  - `getUsageSummary(orgId)` → tüm metriklerin özeti
- [ ] Redis TTL: 60 saniye (cache miss → Postgres'ten yükle)
- [ ] Period reset logic: her ayın 1'inde veya subscription anniversary'de
- [ ] Cache invalidation: plan değişikliğinde Redis key'leri sil

**Kabul kriterleri:**
- Redis'ten < 5ms'de entitlement kontrolü yapılabiliyor
- Cache miss durumunda Postgres fallback çalışıyor
- Ay başında kullanım sıfırlanıyor
- Plan upgrade'de yeni limitler anında aktif

---

## FAZ 1 — Billing Service & Entitlement Enforcement (Hafta 3–6)

### TASK-006: billing-service Skeleton Oluşturma

**Öncelik:** 🟠 Yüksek  
**Servis:** Yeni — `services/billing-service`  
**Tech:** Quarkus 3.15.1 + Reactive PG + Kafka + Redis  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] Maven proje yapısı oluştur (pom.xml, Quarkus BOM, dependencies)
- [ ] Dockerfile (multi-stage build, mapping-studio-api ile aynı pattern)
- [ ] `docker-compose.yml`'e billing-service ekle (port 8086)
- [ ] application.properties (DB, Kafka, Redis bağlantıları)
- [ ] Health check endpoint'leri (`/health/live`, `/health/ready`)
- [ ] Prometheus metrics endpoint (`/metrics`)
- [ ] Temel paket yapısı:
  ```
  com.canonbridge.billing/
  ├── api/          (REST endpoints)
  ├── domain/       (entities, value objects)
  ├── service/      (business logic)
  ├── repository/   (reactive PG queries)
  ├── kafka/        (consumers & producers)
  ├── paddle/       (Paddle API client)
  └── config/       (configuration classes)
  ```
- [ ] CI pipeline'a billing-service build step ekle

**Kabul kriterleri:**
- `mvn quarkus:dev` ile ayağa kalkıyor
- Health check ve metrics çalışıyor
- Docker image build ediliyor
- docker-compose ile diğer servislerle birlikte çalışıyor

---

### TASK-007: Paddle Entegrasyonu (Merchant of Record)

**Öncelik:** 🟠 Yüksek  
**Servis:** `billing-service`  
**Bağımlılık:** TASK-006  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] Paddle Sandbox hesabı oluştur
- [ ] Paddle'da ürün ve fiyat objeleri tanımla (Free hariç 4 plan × aylık + yıllık = 8 price)
- [ ] Paddle Java/HTTP client wrapper sınıfı (`PaddleClient`):
  - `createSubscription(orgId, planCode, billingCycle)`
  - `updateSubscription(subscriptionId, newPlanCode)`
  - `cancelSubscription(subscriptionId, effectiveDate)`
  - `getSubscription(subscriptionId)`
  - `createCustomer(org)`
- [ ] Paddle Webhook endpoint: `POST /api/webhooks/paddle`
  - HMAC signature doğrulama
  - Event routing: `subscription.created`, `subscription.updated`, `subscription.canceled`, `subscription.past_due`, `transaction.completed`, `transaction.payment_failed`
- [ ] Webhook → internal subscription state güncelleme
- [ ] Paddle Checkout URL oluşturma (frontend'e dönecek)
- [ ] Paddle Customer Portal URL oluşturma
- [ ] Retry mekanizması (Paddle webhook'ları için idempotency key)
- [ ] Sandbox → Production geçiş konfigürasyonu (env bazlı)

**Kabul kriterleri:**
- Sandbox'ta subscription oluşturulabiliyor
- Webhook'lar doğru işleniyor ve DB güncelleniyor
- Signature doğrulama başarısız olursa 401 dönüyor
- Idempotent: aynı webhook tekrar gelirse hata vermiyor

---

### TASK-008: EntitlementInterceptor (Kota Kontrolü)

**Öncelik:** 🟠 Yüksek  
**Servis:** `mapping-studio-api`  
**Bağımlılık:** TASK-005  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] `@EntitlementCheck` custom annotation oluştur (metric, qty parametreleri)
- [ ] `EntitlementInterceptor` (JAX-RS ContainerRequestFilter):
  - Request'ten `X-Org-Id` veya JWT'den org bilgisi çıkar
  - Redis'ten entitlement kontrolü yap
  - Soft limit (%80): `X-Quota-Warning` response header ekle
  - Hard limit (%100): HTTP 402 `Payment Required` dön
  - Response body: `{"error": "quota_exceeded", "metric": "mapping_runs", "used": 1000, "limit": 1000, "upgrade_url": "/billing/upgrade"}`
- [ ] Mapping execution endpoint'lerine `@EntitlementCheck(metric="mapping_runs", qty=1)` ekle
- [ ] Active mapping sayısı kontrolü (mapping oluşturma endpoint'inde)
- [ ] Webhook endpoint sayısı kontrolü
- [ ] Seat limiti kontrolü (kullanıcı davet endpoint'inde)
- [ ] Feature-gate kontrolü (SSO, audit log gibi boolean feature'lar)
- [ ] Bypass mekanizması: internal servis çağrıları için (service-to-service auth)
- [ ] Soft-enforce modu: ilk 90 gün sadece uyarı, block yok (config flag)

**Kabul kriterleri:**
- Kota aşımında 402 dönüyor (hard-enforce modunda)
- Soft-enforce modunda sadece header uyarısı
- Internal çağrılar bypass edebiliyor
- Redis down olursa graceful degradation (allow + log)

---

### TASK-009: Invoices Tablosu & Fatura Oluşturma

**Öncelik:** 🟡 Orta  
**Servis:** `billing-service`  
**Bağımlılık:** TASK-006, TASK-007

**Alt görevler:**
- [ ] `invoices` tablosu oluştur (id UUID, org_id FK, period_start DATE, period_end DATE, subtotal_cents INT, tax_cents INT, total_cents INT, currency, status ENUM[draft, open, paid, void, uncollectible], provider_ref VARCHAR, pdf_url VARCHAR, created_at, paid_at)
- [ ] `invoice_line_items` tablosu (invoice_id FK, description, metric, qty, unit_price_cents, amount_cents)
- [ ] Aylık invoice generation cron:
  - Base plan ücreti (line item)
  - Overage hesaplama (usage_aggregates_monthly - plan limit) × overage birim fiyat
  - Add-on'lar (extra seat, extra env, extended retention)
- [ ] Invoice PDF oluşturma (basit HTML → PDF veya Paddle'dan çekme)
- [ ] `GET /api/organizations/:orgId/invoices` — fatura listesi
- [ ] `GET /api/invoices/:id` — fatura detayı
- [ ] `GET /api/invoices/:id/pdf` — PDF indirme
- [ ] Paddle transaction.completed → invoice status güncelleme

**Kabul kriterleri:**
- Ay sonunda otomatik invoice oluşuyor
- Overage doğru hesaplanıyor
- Paddle ödeme onayı ile status "paid" oluyor
- Fatura geçmişi API'den listelenebiliyor

---

## FAZ 2 — Frontend & UX (Hafta 4–8)

### TASK-010: Mapping Studio UI — Billing & Usage Sayfası

**Öncelik:** 🟠 Yüksek  
**Servis:** `mapping-studio-ui` (Angular 21)  
**Bağımlılık:** TASK-002, TASK-004, TASK-005  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] Yeni route: `/settings/billing`
- [ ] Billing overview component:
  - Mevcut plan adı ve fiyatı
  - Sonraki fatura tarihi ve tahmini tutar
  - Ödeme yöntemi özeti (Paddle'dan)
- [ ] Usage dashboard component:
  - Servis bazlı kullanım grafikleri (mapping runs, transforms, webhooks)
  - Progress bar: kullanılan / limit (renk kodlu: yeşil < %60, sarı %60-80, kırmızı > %80)
  - Günlük/haftalık/aylık görünüm toggle
  - Period reset countdown
- [ ] Plan karşılaştırma tablosu component (modal veya ayrı sayfa)
- [ ] Fatura geçmişi tablosu (tarih, tutar, status, PDF indirme)
- [ ] Organization settings:
  - Billing email, vergi numarası, adres
  - Team üyeleri listesi + davet
- [ ] API service layer: `BillingApiService` (HttpClient ile backend çağrıları)
- [ ] PrimeNG components: DataTable (faturalar), Chart (kullanım), ProgressBar (kotalar)

**Kabul kriterleri:**
- Kullanım grafikleri gerçek zamanlı veri gösteriyor
- Plan bilgisi ve kota durumu doğru
- Fatura PDF indirilebiliyor
- Responsive tasarım (mobile uyumlu)

---

### TASK-011: Upgrade Modal & Upsell Akışları

**Öncelik:** 🟠 Yüksek  
**Servis:** `mapping-studio-ui`  
**Bağımlılık:** TASK-010

**Alt görevler:**
- [ ] Upgrade modal component:
  - Mevcut plan vs önerilen plan karşılaştırması
  - Fiyat farkı gösterimi
  - "Upgrade Now" → Paddle Checkout açma
  - "Compare All Plans" → plan tablosuna yönlendirme
- [ ] Kota uyarı banner component:
  - %80 aşımda: sarı banner "Kotanızın %80'ini kullandınız"
  - %100 aşımda: kırmızı banner + "Upgrade or wait until reset"
  - Dismissable ama her session'da tekrar göster
- [ ] 402 response interceptor:
  - HTTP 402 yakalandığında otomatik upgrade modal aç
  - Hata mesajını kullanıcı dostu göster
- [ ] Feature-gate UI:
  - Kilitli özellikler için "Available on [Plan]" badge
  - Tıklandığında upgrade modal aç (ilgili plan pre-selected)
- [ ] Overage opt-in toggle (billing sayfasında):
  - "Kota aşımında otomatik ücretlendir" switch
  - Aylık overage cap ayarı
- [ ] Toast notifications: "Free planında 999 run kaldı" gibi

**Kabul kriterleri:**
- Kota %80'de uyarı görünüyor
- 402'de modal açılıyor
- Paddle Checkout başarıyla açılıyor
- Feature-gate badge'leri doğru plana yönlendiriyor

---

### TASK-012: Website — /pricing Sayfası

**Öncelik:** 🟠 Yüksek  
**Servis:** `website` (Next.js 16 + React 19 + Tailwind 4)  
**Bağımlılık:** Yok (paralel çalışılabilir)  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] `/pricing` route oluştur
- [ ] Plan karşılaştırma tablosu (responsive):
  - Aylık / Yıllık toggle (yıllık %20 indirim gösterimi)
  - 5 plan kolonu (Free, Starter, Growth, Scale, Enterprise)
  - Feature satırları (strateji dokümanındaki matris)
  - CTA butonları: "Start Free", "Subscribe", "Contact Sales"
- [ ] Overage fiyatlandırma bölümü (accordion veya tab)
- [ ] Add-on'lar bölümü
- [ ] FAQ bölümü (SSS):
  - "Kota aşılırsa ne olur?"
  - "Plan değişikliği nasıl çalışır?"
  - "Yıllık ödeme avantajı nedir?"
  - "Enterprise için nasıl iletişime geçerim?"
  - "Verilerim güvende mi?"
- [ ] ROI hesaplayıcı widget (opsiyonel, interaktif):
  - Aylık mapping run, transform, webhook tahmini gir
  - Önerilen plan ve maliyet göster
- [ ] i18n: Türkçe + İngilizce çeviriler
- [ ] SEO: meta tags, structured data (Product schema)
- [ ] "Enterprise" için Calendly/demo form entegrasyonu
- [ ] Mobile responsive tasarım

**Kabul kriterleri:**
- Tüm planlar ve özellikleri doğru gösteriliyor
- Aylık/yıllık toggle çalışıyor
- CTA'lar doğru yönlendiriyor (sign-up veya Paddle checkout)
- Lighthouse performance skoru > 90
- TR + EN dil desteği

---

### TASK-013: Website — ToS, Privacy Policy, DPA Sayfaları

**Öncelik:** 🟡 Orta  
**Servis:** `website`  
**Bağımlılık:** Yok

**Alt görevler:**
- [ ] `/terms` — Terms of Service sayfası
- [ ] `/privacy` — Privacy Policy sayfası (GDPR/KVKK uyumlu)
- [ ] `/dpa` — Data Processing Agreement sayfası
- [ ] `/acceptable-use` — Acceptable Use Policy (anti-abuse kuralları)
- [ ] `/subprocessors` — Alt işlemci listesi (public)
- [ ] Footer'a tüm legal linkleri ekle
- [ ] Sign-up akışında ToS + Privacy kabul checkbox'ı
- [ ] i18n: TR + EN

**Kabul kriterleri:**
- Tüm legal sayfalar erişilebilir
- GDPR/KVKK gereksinimleri karşılanıyor
- Sign-up'ta kabul zorunlu

---

## FAZ 3 — Servis Entegrasyonları (Hafta 5–9)

### TASK-014: Transformer Service — Usage Metering Entegrasyonu

**Öncelik:** 🟠 Yüksek  
**Servis:** `transformer` (Node.js + Fastify + KafkaJS)  
**Bağımlılık:** TASK-004  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] `X-Org-Id` header zorunluluğu ekle (middleware)
- [ ] Her transform request sonrası `usage.events` topic'ine publish:
  ```json
  {"org_id": "...", "service": "transformer", "metric": "transform_requests", "qty": 1, "request_id": "...", "ts": "..."}
  ```
- [ ] Payload boyutu metering (MB cinsinden, ikincil metrik)
- [ ] CPU-saniye metering (transform süresi)
- [ ] API key → org_id mapping (Redis lookup veya mapping-studio-api'den)
- [ ] Entitlement pre-check: transform öncesi kota kontrolü (billing-service'e HTTP call veya Redis direct)
- [ ] Rate limiting: org bazlı eşzamanlılık limiti (plan'a göre)
- [ ] Graceful degradation: billing-service unreachable ise allow + log

**Kabul kriterleri:**
- Her transform request bir usage event üretiyor
- Org-Id olmadan 400 dönüyor
- Kota aşımında 402 dönüyor
- Billing service down olursa transform çalışmaya devam ediyor

---

### TASK-015: Webhook Receiver — Usage Metering & Org İzolasyonu

**Öncelik:** 🟠 Yüksek  
**Servis:** `webhook-receiver` (Quarkus)  
**Bağımlılık:** TASK-004  
**Durum:** ✅ TAMAMLANDI

**Alt görevler:**
- [ ] Webhook endpoint URL'ine org slug ekle: `/webhook/{orgSlug}/{partnerId}/{eventType}`
- [ ] Her delivered event sonrası `usage.events`'a publish (metric: `webhook_events`)
- [ ] Endpoint sayısı kontrolü (plan limitine göre)
- [ ] Retention TTL'i plan'a göre ayarla (Free: 7 gün, Starter: 30 gün, vb.)
- [ ] Org bazlı event delivery sayacı (Prometheus counter)
- [ ] Retry hacmi metering (ikincil metrik)
- [ ] Webhook endpoint oluşturma sırasında entitlement check

**Kabul kriterleri:**
- Her webhook event bir usage event üretiyor
- Endpoint limiti aşılırsa yeni endpoint oluşturulamıyor
- Retention süresi plan'a göre farklılaşıyor
- Org bazlı metrikler Prometheus'ta görünüyor

---

### TASK-016: Lead Capture Edge — Usage Metering

**Öncelik:** 🟡 Orta  
**Servis:** `lead-capture-edge` (Cloudflare Worker)  
**Bağımlılık:** TASK-004

**Alt görevler:**
- [ ] Form key → org_id mapping (Cloudflare KV'den)
- [ ] Her lead submission sonrası usage event HTTP push (batched, 10 event/batch):
  - Endpoint: billing-service `POST /api/internal/usage` (veya mapping-studio-api)
  - Fallback: Cloudflare Queue → async processing
- [ ] Form sayısı limiti kontrolü (KV'den plan bilgisi)
- [ ] Rate-limit eşiği plan'a göre ayarla
- [ ] Lead submission sayacı (org bazlı, KV counter)
- [ ] Kota aşımında form'da "limit reached" mesajı göster

**Kabul kriterleri:**
- Her lead submission metering ediliyor
- Batch push çalışıyor (network efficiency)
- Kota aşımında form devre dışı kalıyor
- KV lookup < 10ms

---

### TASK-017: Mapping Studio API — Org/Plan Endpoint'leri

**Öncelik:** 🟠 Yüksek  
**Servis:** `mapping-studio-api`  
**Bağımlılık:** TASK-001, TASK-002, TASK-003

**Alt görevler:**
- [ ] `GET /api/organizations/:orgId/usage` — kullanım özeti (tüm metrikler)
- [ ] `GET /api/organizations/:orgId/usage/history` — günlük kullanım geçmişi (son 30 gün)
- [ ] `GET /api/organizations/:orgId/entitlements` — mevcut kota durumu
- [ ] `POST /api/organizations/:orgId/subscription/upgrade` — plan yükseltme (Paddle checkout URL dön)
- [ ] `POST /api/organizations/:orgId/subscription/cancel` — iptal (period sonunda)
- [ ] `POST /api/organizations/:orgId/subscription/pause` — dondurma (3 ay, $5/ay)
- [ ] `PUT /api/organizations/:orgId/billing` — billing bilgileri güncelle
- [ ] `GET /api/organizations/:orgId/invoices` — fatura listesi (proxy to billing-service)
- [ ] `POST /api/organizations/:orgId/overage/enable` — overage opt-in
- [ ] `POST /api/organizations/:orgId/overage/disable` — overage opt-out
- [ ] RBAC: sadece org admin billing işlemleri yapabilir

**Kabul kriterleri:**
- Tüm endpoint'ler çalışıyor ve doğru yetkilendirme yapıyor
- Usage verileri doğru dönüyor
- Paddle checkout URL oluşturuluyor
- Non-admin kullanıcılar billing endpoint'lerine erişemiyor

---

## FAZ 4 — Observability & Telemetri (Hafta 6–8)

### TASK-018: Prometheus Metrikleri & Grafana Dashboard'ları

**Öncelik:** 🟡 Orta  
**Servis:** Tüm servisler + `infrastructure/docker/grafana`  
**Bağımlılık:** TASK-004

**Alt görevler:**
- [ ] Prometheus counter: `cb_usage_total{service, metric, org_id, plan}` — her serviste
- [ ] Prometheus gauge: `cb_entitlement_remaining{org_id, metric}` — mapping-studio-api
- [ ] Prometheus histogram: `cb_entitlement_check_duration_seconds` — interceptor latency
- [ ] Grafana dashboard: "MRR & Revenue"
  - Toplam MRR (plan bazlı breakdown)
  - ARR projeksiyonu
  - Yeni subscription / churn (günlük)
  - Plan dağılımı (pie chart)
- [ ] Grafana dashboard: "Usage & Quotas"
  - Top-10 org kullanım (servis bazlı)
  - Kota doluluk oranları (heatmap)
  - Overage miktarları
  - Usage trend (haftalık)
- [ ] Grafana dashboard: "Billing Health"
  - Paddle webhook latency
  - Failed payments
  - Invoice generation success rate
  - Entitlement check latency (p50, p95, p99)
- [ ] Alert rules:
  - Org %200 kota aşımı (anomaly / abuse)
  - Paddle webhook 5xx > 3 dakika
  - Usage event consumer lag > 5000
  - Entitlement check latency p99 > 100ms
- [ ] Prometheus scrape config'e billing-service ekle

**Kabul kriterleri:**
- 3 dashboard çalışıyor ve veri gösteriyor
- Alert'ler doğru tetikleniyor
- Tüm servislerden metrik toplanıyor

---

### TASK-019: Usage Reconciliation & Anomaly Detection

**Öncelik:** 🟡 Orta  
**Servis:** `billing-service`  
**Bağımlılık:** TASK-004, TASK-006

**Alt görevler:**
- [ ] Günlük reconciliation job:
  - Redis entitlement cache vs Postgres usage_aggregates karşılaştır
  - Fark varsa Redis'i düzelt + alert üret
  - Reconciliation raporu (log + metric)
- [ ] Anomaly detection:
  - Bir org'un son 24 saatteki kullanımı planın %200'ünü aşarsa alert
  - Ani spike detection (son 1 saat vs son 7 gün ortalaması × 5)
  - Potansiyel abuse pattern'leri: aynı IP'den çoklu org, bot-like request pattern
- [ ] "Good-faith refund" SLA:
  - Over-billing tespit edilirse otomatik kredi oluştur
  - Admin notification + manual review queue
- [ ] Reconciliation sonuçları Grafana'da görünür

**Kabul kriterleri:**
- Günlük reconciliation çalışıyor
- Redis-Postgres farkı < %0.1
- Anomaly alert'leri doğru tetikleniyor
- Over-billing durumunda otomatik kredi oluşuyor

---

## FAZ 5 — Trial, Discount & Lifecycle (Hafta 8–12)

### TASK-020: Trial Mekanizması

**Öncelik:** 🟡 Orta  
**Servis:** `billing-service`, `mapping-studio-api`  
**Bağımlılık:** TASK-003, TASK-007

**Alt görevler:**
- [ ] 14 gün Growth trial başlatma (kart gerektirmez):
  - Subscription status: `trialing`, trial_end = now + 14 gün
  - Growth plan limitleri aktif
- [ ] Trial countdown: UI'da "X gün kaldı" gösterimi
- [ ] Trial bitiş 3 gün önce email uyarısı
- [ ] Trial bitiş 1 gün önce email uyarısı
- [ ] Trial bittiğinde otomatik Free'ye düşürme:
  - Subscription status: `active`, plan: `free`
  - Entitlement cache güncelle
  - Email: "Trial bitti, upgrade et veya Free'de kal"
- [ ] Trial sırasında upgrade: trial iptal, ödeme başla
- [ ] Bir org sadece 1 kez trial kullanabilir (DB constraint)

**Kabul kriterleri:**
- Trial başlatılabiliyor (kart olmadan)
- 14 gün sonra otomatik Free'ye düşüyor
- Email uyarıları zamanında gidiyor
- Tekrar trial başlatılamıyor

---

### TASK-021: Yıllık Ödeme & İndirim Sistemi

**Öncelik:** 🟡 Orta  
**Servis:** `billing-service`, `website`, `mapping-studio-ui`  
**Bağımlılık:** TASK-007

**Alt görevler:**
- [ ] Paddle'da yıllık fiyat objeleri oluştur (%20 indirim):
  - Starter: $29 × 12 × 0.8 = $278/yıl ($23.17/ay)
  - Growth: $149 × 12 × 0.8 = $1,430/yıl ($119.17/ay)
  - Scale: $599 × 12 × 0.8 = $5,750/yıl ($479.17/ay)
- [ ] Billing cycle switch endpoint: aylık ↔ yıllık
- [ ] Proration hesaplama (aylık → yıllık geçişte kalan günler)
- [ ] Website pricing toggle: "Monthly / Yearly (Save 20%)"
- [ ] UI'da yıllık seçenekte "2 ay bedava" badge
- [ ] Coupon/discount code sistemi:
  - `discounts` tablosu (code, type[percentage/fixed], value, valid_until, max_uses, current_uses)
  - Checkout sırasında coupon uygulama
  - Paddle coupon API entegrasyonu
- [ ] Özel programlar:
  - Startup: 1 yıl Growth ücretsiz (başvuru formu + admin onay)
  - Education: Growth $9/ay (edu email doğrulama)
  - Open-source/nonprofit: %50 indirim
- [ ] Referral sistemi: $25 kredi (iki tarafa)

**Kabul kriterleri:**
- Yıllık ödeme çalışıyor ve %20 indirim uygulanıyor
- Coupon kodu checkout'ta uygulanabiliyor
- Proration doğru hesaplanıyor
- Özel program başvuruları admin panel'den yönetilebiliyor

---

### TASK-022: Churn Prevention & Lifecycle Emails

**Öncelik:** 🟡 Orta  
**Servis:** `billing-service`  
**Bağımlılık:** TASK-007, TASK-020

**Alt görevler:**
- [ ] Email template sistemi (Paddle transactional emails veya SendGrid/Resend):
  - Welcome email (sign-up sonrası)
  - Trial başlangıç
  - Trial bitiş uyarıları (3 gün, 1 gün)
  - Trial bitti
  - Kota %80 uyarısı
  - Kota %100 — upgrade CTA
  - Ödeme başarısız (dunning)
  - Plan upgrade/downgrade onayı
  - Fatura hazır
  - 7. gün retention (use-case önerileri)
  - 30. gün inaktif kullanıcı re-engagement
- [ ] Downgrade öncesi "pause plan" seçeneği:
  - 3 ay, $5/ay'a kotalar dondurulur
  - Veriler korunur, aktif kullanım yok
  - Pause bitiminde: resume veya cancel
- [ ] Downgrade öncesi kullanım özet emaili:
  - "Son 30 günde X mapping run, Y transform kullandınız"
  - "Free planda bunların Z'si kullanılabilir"
  - "Verileriniz 30 gün korunur, sonra silinir"
- [ ] Cancellation survey (neden iptal ediyorsunuz?)
- [ ] Win-back email (iptalden 7 gün sonra: %20 indirim teklifi)

**Kabul kriterleri:**
- Tüm lifecycle email'leri doğru zamanda gönderiliyor
- Pause plan çalışıyor
- Cancellation survey verisi kaydediliyor
- Win-back email gönderiliyor

---

## FAZ 6 — Güvenlik & Compliance (Hafta 9–12)

### TASK-023: API Key → Organization Mapping

**Öncelik:** 🟠 Yüksek  
**Servis:** `mapping-studio-api`  
**Bağımlılık:** TASK-001

**Alt görevler:**
- [ ] `api_keys` tablosu oluştur (id UUID, org_id FK, key_hash VARCHAR, key_prefix VARCHAR(8), name VARCHAR, scopes JSONB, last_used_at, expires_at, created_by FK, created_at, revoked_at)
- [ ] API key oluşturma endpoint: `POST /api/organizations/:orgId/api-keys`
  - Key sadece oluşturma anında gösterilir (hash'lenerek saklanır)
  - Prefix ile tanımlama: `cb_live_xxxx...` veya `cb_test_xxxx...`
- [ ] API key doğrulama: hash lookup → org_id çözümleme
- [ ] API key revoke endpoint: `DELETE /api/organizations/:orgId/api-keys/:id`
- [ ] API key listesi: `GET /api/organizations/:orgId/api-keys` (masked, son kullanım)
- [ ] Scope bazlı yetkilendirme (read, write, admin)
- [ ] Mevcut `CANONBRIDGE_API_KEYS` env var sisteminden migration path
- [ ] Rate limiting: API key bazlı (plan'a göre)

**Kabul kriterleri:**
- API key ile org_id çözümlenebiliyor
- Key oluşturma/revoke çalışıyor
- Scope kontrolü aktif
- Eski API key sistemi ile geriye uyumlu

---

### TASK-024: Abuse Protection & Rate Limiting

**Öncelik:** 🟡 Orta  
**Servis:** `mapping-studio-api`, `webhook-receiver`  
**Bağımlılık:** TASK-005, TASK-023

**Alt görevler:**
- [ ] Plan bazlı rate limiting (Redis sliding window):
  - Free: 10 req/s
  - Starter: 50 req/s
  - Growth: 200 req/s
  - Scale: 1000 req/s
  - Enterprise: custom
- [ ] IP reputation check (opsiyonel, 3rd party veya basit blocklist)
- [ ] Free plan için ek korumalar:
  - Email doğrulama zorunlu (sign-up sonrası)
  - Aynı IP'den max 3 Free org
  - Suspicious pattern detection (çok hızlı mapping oluşturma)
- [ ] Abuse alert: anomaly detection tetiklendiğinde admin notification
- [ ] Manual org suspend endpoint (admin): `POST /api/admin/organizations/:orgId/suspend`
- [ ] Suspended org'lar için tüm API çağrıları 403

**Kabul kriterleri:**
- Rate limiting plan'a göre çalışıyor
- Free plan abuse korumaları aktif
- Admin org suspend edebiliyor
- Suspended org API kullanamıyor

---

### TASK-025: Audit Log v1

**Öncelik:** 🟡 Orta  
**Servis:** `mapping-studio-api`  
**Bağımlılık:** TASK-001

**Alt görevler:**
- [ ] Mevcut `audit_logs` tablosunu billing event'leri için genişlet:
  - Event types: `subscription.created`, `subscription.upgraded`, `subscription.canceled`, `payment.completed`, `payment.failed`, `api_key.created`, `api_key.revoked`, `member.invited`, `member.removed`, `org.settings_changed`
- [ ] Billing audit event'lerini otomatik kaydet (interceptor/decorator pattern)
- [ ] `GET /api/organizations/:orgId/audit-log` endpoint'i:
  - Filtreleme: event_type, user_id, date range
  - Pagination
  - Plan bazlı retention (Free: yok, Starter: 7g, Growth: 30g, Scale: 180g)
- [ ] Audit log UI component (mapping-studio-ui'de)
- [ ] Retention cleanup job (plan'a göre eski kayıtları sil)

**Kabul kriterleri:**
- Billing event'leri audit log'a yazılıyor
- API'den filtrelenebilir şekilde okunabiliyor
- Retention plan'a göre çalışıyor
- UI'da görüntülenebiliyor

---

## FAZ 7 — 180 Gün Hedefleri (Hafta 12–24)

### TASK-026: Hard-Enforce Kotalar & 402 Akışı

**Öncelik:** 🟠 Yüksek  
**Servis:** Tüm servisler  
**Bağımlılık:** TASK-008 (soft-enforce tamamlandıktan sonra)

**Alt görevler:**
- [ ] Soft-enforce → hard-enforce geçiş (config flag flip)
- [ ] Free plan: hard cap (429 Too Many Requests + upgrade CTA)
- [ ] Paid planlar: soft limit (%80 uyarı) → hard limit (%100 block, overage opt-in yoksa)
- [ ] Overage opt-in olan org'lar: %100 sonrası overage fiyatlandırma başlar, %120'de üst sınır (overage cap)
- [ ] Tüm servislerde tutarlı 402 response format
- [ ] Graceful degradation: kota aşımında mevcut işlemler tamamlanır, yeni işlemler reddedilir
- [ ] E2E test: Free org → kota aşımı → 402 → upgrade → devam

**Kabul kriterleri:**
- Free'de hard cap çalışıyor
- Paid'de overage opt-in/out doğru çalışıyor
- Overage cap aşılırsa block
- Tüm servisler tutarlı davranıyor

---

### TASK-027: SSO — Google Workspace Entegrasyonu

**Öncelik:** 🟡 Orta  
**Servis:** `mapping-studio-api`, `mapping-studio-ui`  
**Bağımlılık:** TASK-001, plan: Growth+

**Alt görevler:**
- [ ] Google OAuth2 / OpenID Connect entegrasyonu (Quarkus OIDC zaten hazır)
- [ ] Google Workspace domain doğrulama (org'a bağlama)
- [ ] SSO ile giriş yapan kullanıcıları otomatik org'a ekle
- [ ] SSO-only mode: org admin "sadece SSO ile giriş" zorunlu kılabilir
- [ ] UI: Login sayfasında "Sign in with Google" butonu
- [ ] Feature-gate: Growth+ planlarda aktif, altında "Available on Growth" badge
- [ ] JIT (Just-in-Time) provisioning: ilk SSO girişinde kullanıcı otomatik oluştur

**Kabul kriterleri:**
- Google ile giriş çalışıyor
- Domain bazlı otomatik org ataması
- SSO-only mode aktif edilebiliyor
- Free/Starter'da SSO butonu görünmüyor (feature-gate)

---

### TASK-028: Overage Opt-in & Cap Mekanizması

**Öncelik:** 🟡 Orta  
**Servis:** `billing-service`, `mapping-studio-api`  
**Bağımlılık:** TASK-008, TASK-009

**Alt görevler:**
- [ ] `org_billing_settings` tablosu (org_id, overage_enabled BOOLEAN, overage_cap_cents INT, overage_notification_threshold_percent INT)
- [ ] Overage enable/disable endpoint
- [ ] Overage cap ayarlama (aylık max overage tutarı)
- [ ] Kota aşımında overage hesaplama:
  - Plan birim fiyatı × aşım miktarı
  - Cap'e ulaşılırsa hard block
- [ ] Overage tracking: `usage_aggregates_daily`'de overage_qty ve overage_cost_cents
- [ ] Fatura'da overage line item'ları
- [ ] UI: Overage ayarları (billing sayfasında)
- [ ] Email: "Bu ay $X overage ücretiniz oluştu" (haftalık özet)

**Kabul kriterleri:**
- Overage opt-in çalışıyor
- Cap'e ulaşılınca block
- Faturada overage doğru görünüyor
- Kullanıcı cap'i ayarlayabiliyor

---

### TASK-029: Lead Capture Branded Form Add-on

**Öncelik:** 🟢 Düşük  
**Servis:** `lead-capture-edge`, `billing-service`  
**Bağımlılık:** TASK-016, TASK-007

**Alt görevler:**
- [ ] Add-on: "Branded Form" ($19/ay)
  - Custom domain desteği (CNAME)
  - Logo ve renk özelleştirme
  - "Powered by CanonBridge" kaldırma
- [ ] Add-on subscription yönetimi (Paddle'da ayrı ürün)
- [ ] `org_addons` tablosu (org_id, addon_code, status, external_ref, created_at)
- [ ] Form builder'da branding ayarları (UI)
- [ ] Custom domain SSL provisioning (Cloudflare API)

**Kabul kriterleri:**
- Add-on satın alınabiliyor
- Custom domain çalışıyor
- Branding kaldırılabiliyor
- İptal edilince varsayılan branding geri geliyor

---

## FAZ 8 — 365 Gün Hedefleri (Hafta 24–52)

### TASK-030: SAML/OIDC + SCIM

**Öncelik:** 🟢 Düşük (Scale+ plan)  
**Servis:** `mapping-studio-api`  
**Bağımlılık:** TASK-027

**Alt görevler:**
- [ ] SAML 2.0 SP (Service Provider) implementasyonu
- [ ] OIDC generic provider desteği (Okta, Azure AD, Auth0)
- [ ] SCIM 2.0 provisioning endpoint'leri (user sync)
- [ ] SSO configuration UI (admin panel)
- [ ] IdP metadata upload / URL
- [ ] Feature-gate: Scale+ planlarda

---

### TASK-031: VPC Peering & Private Networking

**Öncelik:** 🟢 Düşük (Scale+ plan)  
**Servis:** Infrastructure  
**Bağımlılık:** Kubernetes deployment

**Alt görevler:**
- [ ] AWS VPC Peering setup (Scale plan)
- [ ] AWS PrivateLink setup (Enterprise plan)
- [ ] Terraform/Pulumi modülleri
- [ ] Customer onboarding runbook
- [ ] Network policy enforcement

---

### TASK-032: AI Mapping Assistant (Usage-Based)

**Öncelik:** 🟢 Düşük  
**Servis:** `mapping-studio-api`, `mapping-studio-ui`  
**Bağımlılık:** TASK-004, TASK-008

**Alt görevler:**
- [ ] AI Gateway entegrasyonu (OpenAI / Anthropic API)
- [ ] JSONata expression önerisi (source + target schema → mapping suggestion)
- [ ] Token metering: input/output token sayımı → usage_events
- [ ] Fiyatlandırma: $0.002/1K input, $0.006/1K output
- [ ] UI: "Suggest Mapping" butonu (mapping editor'de)
- [ ] Rate limiting: plan bazlı günlük token limiti
- [ ] Tüm planlarda kullanılabilir (usage-based)

---

### TASK-033: Connector Marketplace (Beta)

**Öncelik:** 🟢 Düşük  
**Servis:** Yeni — marketplace service  
**Bağımlılık:** Tüm billing altyapısı

**Alt görevler:**
- [ ] Connector marketplace domain modeli (connectors, publishers, installs, reviews)
- [ ] 3rd-party connector submission flow
- [ ] Revenue share modeli (%20 platform, %80 publisher)
- [ ] Connector install → org subscription'a bağlama
- [ ] Marketplace UI (website'da)
- [ ] Publisher dashboard
- [ ] Review & rating sistemi

---

### TASK-034: EU Region & Data Residency

**Öncelik:** 🟢 Düşük (Scale+ plan)  
**Servis:** Infrastructure  
**Bağımlılık:** Kubernetes multi-region

**Alt görevler:**
- [ ] EU region Kubernetes cluster setup
- [ ] Data residency routing (org → region mapping)
- [ ] Cross-region billing aggregation
- [ ] Region selection UI (org settings)
- [ ] GDPR compliance documentation update

---

## Bağımlılık Grafiği

```
TASK-001 (Organizations) ─────┬──→ TASK-003 (Subscriptions)
                               ├──→ TASK-017 (Org/Plan Endpoints)
                               ├──→ TASK-023 (API Keys)
                               └──→ TASK-025 (Audit Log)

TASK-002 (Plans) ─────────────┬──→ TASK-003 (Subscriptions)
                               └──→ TASK-005 (Entitlements)

TASK-004 (Usage Events) ──────┬──→ TASK-014 (Transformer Metering)
                               ├──→ TASK-015 (Webhook Metering)
                               ├──→ TASK-016 (Lead Capture Metering)
                               └──→ TASK-018 (Observability)

TASK-005 (Entitlements) ──────→ TASK-008 (EntitlementInterceptor)
                               └──→ TASK-026 (Hard-Enforce)

TASK-006 (billing-service) ───┬──→ TASK-007 (Paddle)
                               ├──→ TASK-009 (Invoices)
                               └──→ TASK-019 (Reconciliation)

TASK-007 (Paddle) ────────────┬──→ TASK-020 (Trial)
                               ├──→ TASK-021 (Yıllık Ödeme)
                               └──→ TASK-022 (Lifecycle Emails)

TASK-008 (Interceptor) ───────→ TASK-026 (Hard-Enforce)

TASK-010 (Billing UI) ────────→ TASK-011 (Upgrade Modal)
```

---

## Öncelik Sıralaması (Önerilen Uygulama Sırası)

### Sprint 1 (Hafta 1–2)
| # | Task | Paralel? |
|---|------|----------|
| 1 | TASK-001: Organizations & Multi-Tenancy | ❌ Temel |
| 2 | TASK-002: Plans & Plan Features | ✅ TASK-001 ile paralel |
| 3 | TASK-012: Website /pricing | ✅ Backend'den bağımsız |

### Sprint 2 (Hafta 3–4)
| # | Task | Paralel? |
|---|------|----------|
| 4 | TASK-003: Subscriptions | ❌ TASK-001+002 sonrası |
| 5 | TASK-004: Usage Events Altyapısı | ✅ TASK-003 ile paralel |
| 6 | TASK-005: Entitlements Cache | ✅ TASK-004 ile paralel |
| 7 | TASK-006: billing-service Skeleton | ✅ Paralel |

### Sprint 3 (Hafta 5–6)
| # | Task | Paralel? |
|---|------|----------|
| 8 | TASK-007: Paddle Entegrasyonu | ❌ TASK-006 sonrası |
| 9 | TASK-008: EntitlementInterceptor | ✅ TASK-007 ile paralel |
| 10 | TASK-023: API Key → Org Mapping | ✅ Paralel |
| 11 | TASK-013: ToS/Privacy/DPA | ✅ Paralel |

### Sprint 4 (Hafta 7–8)
| # | Task | Paralel? |
|---|------|----------|
| 12 | TASK-010: Billing UI | ❌ Backend hazır sonrası |
| 13 | TASK-011: Upgrade Modal | ✅ TASK-010 ile paralel |
| 14 | TASK-014: Transformer Metering | ✅ Paralel |
| 15 | TASK-015: Webhook Metering | ✅ Paralel |

### Sprint 5 (Hafta 9–10)
| # | Task | Paralel? |
|---|------|----------|
| 16 | TASK-017: Org/Plan Endpoints | ❌ |
| 17 | TASK-009: Invoices | ✅ Paralel |
| 18 | TASK-018: Grafana Dashboards | ✅ Paralel |
| 19 | TASK-016: Lead Capture Metering | ✅ Paralel |

### Sprint 6 (Hafta 11–12)
| # | Task | Paralel? |
|---|------|----------|
| 20 | TASK-019: Reconciliation | ❌ |
| 21 | TASK-020: Trial Mekanizması | ✅ Paralel |
| 22 | TASK-024: Abuse Protection | ✅ Paralel |
| 23 | TASK-025: Audit Log | ✅ Paralel |

### Sprint 7–12 (Hafta 13–24) — "Monetize" Fazı
| # | Task |
|---|------|
| 24 | TASK-026: Hard-Enforce |
| 25 | TASK-021: Yıllık Ödeme & İndirimler |
| 26 | TASK-022: Lifecycle Emails |
| 27 | TASK-027: Google SSO |
| 28 | TASK-028: Overage Opt-in |
| 29 | TASK-029: Branded Form Add-on |

### Sprint 13+ (Hafta 25–52) — "Scale & Enterprise" Fazı
| # | Task |
|---|------|
| 30 | TASK-030: SAML/OIDC + SCIM |
| 31 | TASK-031: VPC Peering |
| 32 | TASK-032: AI Mapping Assistant |
| 33 | TASK-033: Connector Marketplace |
| 34 | TASK-034: EU Region |

---

## Teknik Notlar

### Veritabanı Migration Sırası
```
V43__create_organizations_table.sql
V44__create_org_members_table.sql
V45__create_plans_table.sql
V46__create_plan_features_table.sql
V47__seed_plans_and_features.sql
V48__create_subscriptions_table.sql
V49__create_subscription_history_table.sql
V50__create_usage_events_table.sql
V51__create_usage_aggregates_tables.sql
V52__create_entitlements_cache_table.sql
V53__create_invoices_table.sql
V54__create_invoice_line_items_table.sql
V55__create_api_keys_table.sql
V56__create_org_billing_settings_table.sql
V57__create_discounts_table.sql
V58__create_org_addons_table.sql
V59__link_users_to_organizations.sql
V60__assign_existing_data_to_default_org.sql
```

### Kafka Topic'ler (Yeni)
```
usage.events          — 6 partition, 30 gün retention
billing.events        — 6 partition, 90 gün retention
```

### Redis Key Pattern'leri
```
entitlement:{org_id}:{feature_key}  → JSON {limit, used, remaining, resets_at}
usage:counter:{org_id}:{metric}:{period}  → INT (atomic counter)
api_key:{key_hash}  → JSON {org_id, scopes, expires_at}
rate_limit:{org_id}:{endpoint}  → sliding window counter
```

### Environment Variables (Yeni)
```env
# Billing Service
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
PADDLE_ENVIRONMENT=sandbox|production
PADDLE_SELLER_ID=

# Entitlement
ENTITLEMENT_SOFT_ENFORCE=true
ENTITLEMENT_REDIS_TTL_SECONDS=60
ENTITLEMENT_PERIOD_RESET_CRON=0 0 1 * *

# Usage
USAGE_AGGREGATION_CRON=0 0 2 * * *
USAGE_RECONCILIATION_CRON=0 0 3 * * *

# Email (SendGrid veya Resend)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=
EMAIL_FROM=billing@canonbridge.io
```

---

## Başarı Kriterleri (90 Gün Sonunda)

- [ ] Tüm yeni org'lar Free plan ile başlıyor
- [ ] Usage metering 3 ana serviste çalışıyor (mapping, transform, webhook)
- [ ] Soft-enforce aktif (uyarı veriyor, henüz block yok)
- [ ] Paddle sandbox'ta subscription oluşturulabiliyor
- [ ] Billing UI'da kullanım grafikleri görünüyor
- [ ] Website'da /pricing sayfası yayında
- [ ] Grafana'da MRR ve usage dashboard'ları çalışıyor
- [ ] API key → org mapping çalışıyor
- [ ] Günlük reconciliation job çalışıyor
- [ ] Tüm billing event'leri audit log'da

---

*Bu doküman, `canonbridge-saas-monetization-strategy.md` referans alınarak oluşturulmuştur. Her task bağımsız bir PR olarak implement edilebilir.*
