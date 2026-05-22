# CanonBridge — SaaS Monetizasyon & Fiyatlandırma Stratejisi

> Sürüm: v1.0 • Hazırlayan: Lovable Audit • Kapsam: `services/`, `mapping-studio-ui`, `website`, `infrastructure`

Bu doküman, CanonBridge'in mevcut servis mimarisini (Mapping Studio API, Webhook Receiver, Transformer, Lead Capture Edge, Canonbridge Mock) referans alarak **freemium → pay‑as‑you‑grow → enterprise** modeline geçişi için ürün, paketleme, teknik altyapı ve go‑to‑market planı sunar.

---

## 1. Stratejik Çerçeve

### 1.1 Vizyon
CanonBridge'i "geliştirici‑dostu, MoR (Merchant of Record) hizmet alabilen, entegrasyon ve veri dönüşümünde sektör standardı" bir iPaaS / Integration‑as‑a‑Service ürününe dönüştürmek.

### 1.2 Monetizasyon Prensipleri
1. **Time‑to‑value < 5 dakika** — Sign‑up → ilk mapping çalıştırma arasında ödeme bariyeri olmamalı.
2. **Free forever çekirdek** — Geliştirici ve hobi kullanımı kalıcı ücretsiz kalmalı (PLG hunisi).
3. **Usage‑based + seat hibrit** — Adil ölçeklenme: küçük başlayan büyüdükçe öder.
4. **Şeffaf kotalar** — Dashboard'da gerçek zamanlı kullanım, sürpriz fatura yok.
5. **Soft‑limit önce, hard‑limit sonra** — %80 uyarı, %100 throttle, %120 üst sınır (overage cap).
6. **Açık fiyatlandırma** — Enterprise hariç tüm planlar website'de görünür.

---

## 2. Faturalanabilir Birimler (Metering Units)

Her servis için **birincil metrik** seçildi; ikincil metrikler kota olarak izlenir.

| Servis | Birincil Birim | İkincil Limitler |
|---|---|---|
| Mapping Studio API | **Mapping execution (run)** | Aktif mapping sayısı, depolanan şema, kayıtlı kullanıcı |
| Transformer | **Transform request** | Payload boyutu (MB), CPU‑saniye, eşzamanlılık |
| Webhook Receiver | **Webhook event (delivered)** | Endpoint sayısı, retry hacmi, saklama süresi |
| Lead Capture Edge | **Lead submission** | Form sayısı, rate‑limit eşiği, KV okuma |
| Canonbridge Mock / Sandbox | **Sandbox saat** | Concurrent sandbox, snapshot sayısı |
| AI / JSONata öneri (gelecek) | **AI token** | Model katmanı, bağlam boyutu |
| Depolama | **GB‑ay** | Log retention günü |
| Bant genişliği | **GB‑çıkış** | Bölge başına |

**Ölçüm noktası:** Tüm metrikler `mapping-studio-api` üzerinde merkezi bir `UsageEvent` tablosuna yazılır (Kafka `usage.events` topic'i → Postgres + ClickHouse rollup). Faturalama saatlik/günlük aggregate üzerinden çalışır.

---

## 3. Paket Yapısı

### 3.1 Genel Plan Matrisi

| | **Free** | **Starter** | **Growth** | **Scale** | **Enterprise** |
|---|---|---|---|---|---|
| **Aylık fiyat** | $0 | $29 | $149 | $599 | Özel |
| **Mapping run / ay** | 1.000 | 25.000 | 250.000 | 2.000.000 | Sınırsız* |
| **Transform request / ay** | 5.000 | 100.000 | 1.000.000 | 10.000.000 | Sınırsız* |
| **Webhook event / ay** | 10.000 | 200.000 | 2.000.000 | 20.000.000 | Sınırsız* |
| **Lead capture / ay** | 500 | 10.000 | 100.000 | 1.000.000 | Sınırsız* |
| **Aktif mapping** | 3 | 25 | 200 | 2.000 | Sınırsız |
| **Webhook endpoint** | 2 | 10 | 50 | 500 | Sınırsız |
| **Saklama (log/event)** | 7 gün | 30 gün | 90 gün | 180 gün | 365+ gün |
| **Kullanıcı (seat)** | 1 | 3 | 10 | 25 | Sınırsız |
| **Ortam (env)** | dev | dev + staging | + prod | + 3 ek prod | Sınırsız |
| **Sandbox / Mock** | ✅ paylaşımlı | ✅ paylaşımlı | ✅ izole | ✅ izole | ✅ dedicated |
| **SLA** | best‑effort | %99.0 | %99.5 | %99.9 | %99.95 + krediler |
| **Destek** | community | email (48s) | email (24s) | chat + email (8s) | dedicated CSM |
| **SSO / SAML** | – | – | Google | + SAML/OIDC | + SCIM |
| **Audit log** | – | 7g | 30g | 180g | 365g + export |
| **RBAC** | basic | basic | roles | + custom | + ABAC |
| **Private networking** | – | – | – | VPC peering | + PrivateLink |
| **DPA / SOC2 raporu** | – | – | DPA | + SOC2 Type II | + özel ek |

\* "Sınırsız" pratikte **fair‑use** ile sınırlıdır; aşımda usage‑based ek ücret veya custom kontrat.

### 3.2 Overage (Aşım) Fiyatlandırması

Plan kotası aşıldığında throttle yerine **opt‑in overage** (kullanıcı dashboard'dan açar):

| Birim | Free | Starter | Growth | Scale |
|---|---|---|---|---|
| 1.000 mapping run | — (hard cap) | $1.20 | $0.90 | $0.60 |
| 10.000 transform | — | $2.50 | $1.80 | $1.20 |
| 10.000 webhook event | — | $1.00 | $0.70 | $0.45 |
| 1.000 lead | — | $4.00 | $3.00 | $2.00 |
| 1 GB depolama / ay | — | $0.15 | $0.12 | $0.08 |
| 1 GB çıkış BW | — | $0.12 | $0.09 | $0.06 |

Free planda hard‑limit (429) uygulanır; upsell CTA gösterilir.

### 3.3 Add‑on'lar (her planda satın alınabilir)

- **Extra seat:** $12 / kullanıcı / ay
- **Extra environment:** $39 / ortam / ay
- **Extended retention:** +90 gün = $25 / ay
- **AI Mapping Assistant:** $0.002 / 1K input token, $0.006 / 1K output token (Lovable AI Gateway üzerinden)
- **Private connector geliştirme:** tek seferlik $1.500 + $99/ay bakım
- **Premium support (24/7):** Scale için $499/ay, Enterprise dahil

---

## 4. Servis Bazında Free → Paid Geçiş Planı

Her servis için **launch fazı** ve **monetizasyon fazı** ayrı tanımlandı. Hedef: ürün‑pazar uyumunu kanıtlamadan paywall koymamak.

### Faz 0 — "Public Beta" (0‑3 ay): TAMAMI ÜCRETSİZ
- Tüm servisler limitsiz‑ish (yalnızca abuse koruması).
- Hedef: 500+ kayıtlı geliştirici, 50+ aktif mapping, geri bildirim.
- Sadece **email zorunluluğu** + Discord/Slack community.
- Telemetri: kullanım, hata, drop‑off — fiyatlandırma kalibrasyonu için.

### Faz 1 — "Freemium Launch" (3‑6 ay): Free + Starter + Growth
- Free planın kotaları aktif edilir; mevcut beta kullanıcıları **6 ay Growth ücretsiz** (loyalty).
- Webhook Receiver ve Lead Capture Edge tamamen ücretsiz kalır (hunisi besleyici).
- Mapping Studio + Transformer **birincil monetize** edilen servisler.

### Faz 2 — "Scale & Enterprise" (6‑12 ay)
- Scale planı + SSO/SAML açılır.
- Lead Capture'a "branded form + custom domain" Pro özelliği eklenir ($19/ay add‑on).
- Webhook Receiver'a "guaranteed delivery + replay" Pro tier'ı.
- Enterprise için sales‑led motion (Calendly + demo).

### Faz 3 — "Marketplace & Platform" (12+ ay)
- 3rd‑party connector marketplace (%20 revenue share modeli).
- Sertifikalı partner programı.
- White‑label / embed pricing.

### Servis bazlı detay

| Servis | Beta | Free Tier (kalıcı) | İlk ücretli özellik | Notlar |
|---|---|---|---|---|
| **Mapping Studio API** | ücretsiz | 1K run/ay, 3 mapping | Starter $29 (25K run) | Birincil PLG ürünü |
| **Transformer** | ücretsiz | 5K req/ay | Starter dahil | JSONata worker isolation Pro'da |
| **Webhook Receiver** | ücretsiz | 10K event/ay, 2 endpoint | Growth (guaranteed delivery + replay) | Funnel besleyici, geç monetize |
| **Lead Capture Edge** | ücretsiz | 500 lead/ay | Branded form $19/ay add‑on | SMB için standalone satılabilir |
| **Canonbridge Mock / Sandbox** | ücretsiz | shared sandbox | Growth: isolated; Scale: dedicated | Onboarding'in kalbi |
| **AI Mapping Assistant** | kapalı | — | Tüm planlarda usage‑based | Lovable AI Gateway entegrasyonu |

---

## 5. Teknik Altyapı: Billing & Entitlement

### 5.1 Domain Modeli (yeni tablolar)

```text
plans (id, code, name, price_monthly, price_yearly, currency, is_public)
plan_features (plan_id, feature_key, limit_value, unit)
subscriptions (id, org_id, plan_id, status, current_period_start/end,
               trial_end, cancel_at, external_ref)
organizations (id, name, owner_user_id, billing_email, country, vat_id)
org_members (org_id, user_id, role)
usage_events (id, org_id, service, metric, qty, ts, request_id, metadata)
usage_aggregates_daily (org_id, metric, day, qty, cost_cents)
invoices (id, org_id, period, subtotal, tax, total, status, provider_ref)
entitlements_cache (org_id, feature_key, remaining, resets_at)
```

### 5.2 Entitlement Servisi
- **Karar noktası:** Mapping Studio API'de yeni bir `EntitlementInterceptor` (JAX‑RS filter) her endpoint'ten önce Redis cache'ten kotaya bakar.
- Cache miss → Postgres'ten yükle, TTL 60s.
- Aşım → HTTP 402 `Payment Required` + JSON `{ "error": "quota_exceeded", "metric": "...", "upgrade_url": "..." }`.
- Webhook event'leri için **stream‑side** sayım: Kafka consumer her event'i `usage.events`'a yazar; günlük rollup ClickHouse'a aktarılır.

### 5.3 Ödeme Sağlayıcı Seçimi
- **Birincil: Paddle (Merchant of Record).** Avantajlar: global vergi/uyum, chargeback, KDV/GST otomasyonu; geliştirici‑yoğun SaaS için ideal.
- **İkincil: Stripe Billing.** US/UK odaklı enterprise için per‑transaction tax handling.
- Webhook'lar: `subscription.created/updated/canceled`, `transaction.completed` → Mapping Studio API `/api/public/billing/webhook` (HMAC doğrulamalı).

### 5.4 Yeni Servis: `billing-service` (önerilen)
Faturalama mantığını API'den ayırmak için ayrı Quarkus modülü:
- `POST /subscriptions` (sign up / upgrade)
- `POST /usage` (internal, diğer servislerden idempotent yazım)
- `GET /entitlements/:orgId`
- `POST /webhooks/paddle` (signature verify)
- Cron: günlük usage aggregation, aylık invoice generation.

### 5.5 Mevcut Servislerde Değişiklik

| Servis | Eklenecek |
|---|---|
| **mapping-studio-api** | `EntitlementInterceptor`, `UsagePublisher`, org/plan endpoint'leri |
| **transformer** | Her isteğe `X-Org-Id` header zorunlu, `usage.events`'a publish, API key → org mapping |
| **webhook-receiver** | Org bazlı endpoint slug, event delivery sayacı, retention TTL plan'a göre |
| **lead-capture-edge** | Form key → org map (KV), `usage.events` HTTP push (batched) |
| **mapping-studio-ui** | Billing sayfası, kullanım grafiği, upgrade modal, plan kıyas tablosu |
| **website** | `/pricing` sayfası, FAQ, ROI hesaplayıcı |

### 5.6 Observability
- Prometheus: `cb_usage_total{service,metric,org_id,plan}` counter.
- Grafana: org bazlı top‑N kullanım, MRR/ARR panosu, churn funnel.
- Alert: bir org < 24s içinde planın %200'ünü aşarsa anomali alarmı (potansiyel abuse).

---

## 6. Trial, Discount, Credit Politikası

- **14 gün Growth trial** — kart gerektirmez; bitince otomatik Free'ye düşer.
- **Yıllık ödeme indirimi:** %20 (2 ay bedava).
- **Startup programı:** seed‑aşaması şirketlere 1 yıl Growth ücretsiz (başvuru bazlı).
- **Open‑source / nonprofit:** %50 indirim.
- **Education:** öğrenci/öğretmen Growth $9/ay.
- **Referral:** her başarılı dönüşüme $25 kredi (iki tarafa).
- **Düşmeyi önleme:** downgrade öncesi kullanım özet emaili + "pause plan" seçeneği (3 ay $5/ay'a kotalar dondurulur).

---

## 7. UX Akışları

### 7.1 Onboarding
1. Sign‑up (email + Google) → otomatik **Personal org** + Free plan.
2. Wizard: ilk mapping oluştur (3 dk). 
3. "Run your first mapping" — başarıda toast: "Free planında 999 run kaldı."
4. 7. günde retention emaili + use‑case önerileri.

### 7.2 Upgrade Tetikleri
- Kota %80: in‑app banner + email.
- Kota %100: 402 yanıt + modal "Upgrade or wait until reset".
- Feature‑gated tıklama (örn. SAML): inline "Available on Scale" tag.

### 7.3 Self‑service Billing Sayfası
- Mevcut plan, sonraki fatura tahmini, kullanım grafikleri (servis bazlı).
- Plan değiştir / iptal / fatura indir.
- Vergi numarası / billing adresi.
- Team & seat yönetimi.

---

## 8. Go‑to‑Market

### 8.1 Pozisyonlama
> "**Schema mapping ve veri entegrasyonunu 5 dakikada kuran, ölçeklendiğinde sizinle büyüyen developer‑first iPaaS.**"

Rakip referansları: Hookdeck, Pipedream, n8n Cloud, Workato (enterprise), Tray.io.

### 8.2 Kanallar
- **PLG:** GitHub README, Dev.to / Hashnode içerikleri, ProductHunt launch.
- **SEO:** "JSON to JSON mapping", "webhook receiver service", "JSONata online" gibi long‑tail.
- **Community:** Discord, aylık office hours, open‑source SDK'lar.
- **Partner:** Supabase / Vercel / Cloudflare marketplace listingleri.
- **Sales (Enterprise):** outbound + inbound demo formu.

### 8.3 Başarı Metrikleri (North‑Star)

| Metrik | 6 ay | 12 ay |
|---|---|---|
| Signup → Activated (ilk run) | %40 | %55 |
| Free → Paid conversion | %3 | %6 |
| MRR | $5K | $40K |
| Net Revenue Retention | %105 | %115 |
| Logo churn (aylık) | <%4 | <%2 |
| CAC payback | 9 ay | 6 ay |

---

## 9. Hukuki & Uyumluluk

- **Terms of Service** + **Acceptable Use Policy** (özellikle webhook/lead capture için anti‑abuse).
- **DPA** (GDPR/KVKK) tüm Growth+ planlarında.
- **Sub‑processor list** public sayfa.
- **SOC 2 Type I** — 12 ay hedefi; **Type II** — 18 ay.
- **Data residency:** EU bölgesi opsiyonu (Scale+).
- **PCI:** Doğrudan kart işlemiyoruz (Paddle MoR), PCI scope dışı.

---

## 10. Uygulama Yol Haritası (90 / 180 / 365 gün)

### 90 gün — "Billing Foundations"
- [ ] Plans/subscriptions/usage_events tabloları + Flyway migration.
- [ ] `billing-service` MVP (Paddle entegrasyonu + webhook).
- [ ] mapping-studio-api'de `EntitlementInterceptor` + Redis cache.
- [ ] mapping-studio-ui: Billing & Usage sayfası, upgrade modal.
- [ ] website: `/pricing` + FAQ + ToS/Privacy/DPA.
- [ ] Free planın kotalarını **soft‑enforce** (uyarı, henüz block yok).
- [ ] Telemetri ve Grafana MRR panosu.

### 180 gün — "Monetize"
- [ ] Hard‑enforce kotalar + 402 akışı.
- [ ] Overage opt‑in + caps.
- [ ] Yıllık ödeme + indirim.
- [ ] SSO (Google Workspace), audit log v1.
- [ ] Startup/education/nonprofit programları.
- [ ] Lead Capture branded form add‑on launch.
- [ ] ProductHunt + content marketing dalgası.

### 365 gün — "Scale & Enterprise"
- [ ] SAML/OIDC + SCIM.
- [ ] VPC peering, dedicated sandbox.
- [ ] SOC 2 Type I sertifikası.
- [ ] AI Mapping Assistant GA.
- [ ] Connector marketplace beta.
- [ ] EU region launch.

---

## 11. Riskler ve Azaltma

| Risk | Etki | Azaltma |
|---|---|---|
| Free planın suistimali (kripto/mailer abuse) | Maliyet patlaması | Phone/credit verify, IP rep, anomaly alert, hard caps |
| Paddle restricted category reddi | Lansman gecikme | Stripe Billing fallback hazır |
| Webhook event hacmi kar marjını yer | Negatif birim ekonomi | Free'de düşük cap + storage TTL kısa |
| Enterprise satış uzun çevrim | Cash flow | PLG MRR ile fonlama, Enterprise opportunistic |
| Kota enforcement bug → over‑bill | Müşteri kaybı | Idempotent usage, günlük reconcile, "good‑faith refund" SLA |

---

## 12. Hızlı Kararlar (Action Items)

1. **Paddle hesabı aç**, ürün/fiyat objelerini tanımla.
2. `billing-service` skeleton'ını oluştur (Quarkus + Postgres + Kafka consumer).
3. `usage_events` topic'i + Schema Registry kayıt.
4. mapping-studio-ui'de **read‑only "Usage" sekmesini** önce yayına al (transparency = trust).
5. website'da **`/pricing` placeholder** + "Coming soon, join waitlist" formu.
6. Beta kullanıcılarına **loyalty kodu** dağıtım planı hazırla.

---

**Sonuç:** CanonBridge'in mevcut servis ayrımı (mapping, transform, webhook, lead, sandbox) doğal olarak farklı metering birimlerine uygundur. Önerilen plan; geliştirici hunisini Free + Lead/Webhook ile doldurup, ölçeklenen iş yüklerini Mapping + Transform üzerinden monetize eden, **dengeli bir PLG + usage‑based** yaklaşımıdır.
