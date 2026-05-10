# CanonBridge — Ürün Stratejisi ve Mimari Tartışma Notları

> Bu doküman, CanonBridge entegrasyon platformunun mimari tasarımı,
> ürün stratejisi, iş modeli ve go-to-market yaklaşımı üzerine yapılan
> kapsamlı tartışmanın özetidir.
>
> Tarih: 10 Mayıs 2026

---

## İçindekiler

1. [Proje Künyesi](#1-proje-künyesi)
2. [Mimari Özet](#2-mimari-özet)
3. [Problemin Tanımı](#3-problemin-tanımı)
4. [Rekabet Analizi](#4-rekabet-analizi)
5. [İş Modeli](#5-iş-modeli)
6. [Rekabet Avantajı: Built-in Reliability](#6-rekabet-avantajı-built-in-reliability)
7. [Minimum Bakım İçin Gerekli Eklemeler](#7-minimum-bakım-için-gerekli-eklemeler)
8. [Go-to-Market Stratejisi](#8-go-to-market-stratejisi)
9. [Riskler ve Mitigasyon](#9-riskler-ve-mitigasyon)

---

## 1. Proje Künyesi

| Başlık | Detay |
|---|---|
| **Ürün Adı** | CanonBridge |
| **GitHub** | https://github.com/benanaktaspusulait/canonbridge |
| **Konumlandırma** | Multi-partner entegrasyon platformu (ETL) |
| **Hedef Kitle** | Entegrasyon firmaları, kurumsal şirketler |
| **Lisans** | Proprietary |
| **Durum** | Planning & Design Phase |
| **Rol** | Contractor — Ürün Sahibi ve Mimar |

---

## 2. Mimari Özet

### 2.1 Teknoloji Stack'i

| Katman | Teknoloji |
|---|---|
| Transformation | Node.js + TypeScript + JSONata + Ajv |
| Business Services | Java + Quarkus |
| Message Queue | Apache Kafka |
| Database | PostgreSQL |
| Orchestration | Kubernetes |
| Monitoring | Prometheus + Grafana |
| Frontend (sonra) | React (Mapping Studio UI) |

### 2.2 Temel Mimari Akış

```
Partner / Dış Sistem
        ↓
Kafka raw topic (partner.raw.events)
        ↓
Node.js JSONata Transformer Service
    - Kafka consumer
    - Mapping cache (JSONata)
    - Schema cache (Ajv)
    - Worker pool
    - Retry / DLQ handling
        ↓
Kafka canonical topic (canonical.events)
        ↓
Business Consumer Service (Java/Quarkus)
    - Idempotency (processed_events)
    - Parent-child dependency (pending table)
    - DB transaction
    - Outbox insert
        ↓
Business DB
    - Domain tables
    - processed_events
    - pending_order_lines
    - outbox_events
        ↓
Outbox Publisher / CDC
        ↓
Kafka business events (business.events)
        ↓
Downstream services
```

### 2.3 Temel Prensipler

- **Partner-specific complexity dışarıda kalır** — Transformation Layer'da izole edilir
- **Core business logic clean canonical event alır** — Business Layer'da standart format
- **JSONata dönüşüm motorudur, iş kuralı motoru değildir** — Sadece payload shaping
- **Mapping'ler immutable ve versioned'dır** — `partnerId/eventType/inbound/v1.jsonata`
- **Her canonical event schema validation'dan geçer** — Ajv ile zorunlu doğrulama
- **At-least-once delivery + idempotent consumers** — Exactly-once iddiası yok

### 2.4 Neden Node.js + JSONata?

| Geleneksel Yaklaşım | CanonBridge Yaklaşımı |
|---|---|
| CompanyAClient, CompanyARequestMapper, CompanyAResponseMapper, CompanyAValidator, CompanyAErrorMapper | Generic transformation engine + partner-specific JSONata mappings |
| Her yeni partner için yeni sınıflar | Her yeni partner için yeni JSONata dosyası |
| Kod değişikliği = redeploy | Mapping değişikliği = dosya güncelleme |
| 200 alan = 400 satır kod | 200 alan = 200 satır JSONata |

---

## 3. Problemin Tanımı

### 3.1 Çözülen Problem

Entegrasyon firmaları ve kurumsal şirketler, her yeni dış sistem entegrasyonunda
sıfırdan adapter, mapper, validator kodu yazmak zorunda kalır. Bu:

- **Tekrarlayan iş** — Aynı pattern, farklı format
- **Hataya açık** — Her seferinde manuel mapping
- **Pahalı** — Proje başına 6 ay, 5–10 geliştirici
- **Ölçeklenemez** — 15 sisteme entegre olunca 15 ayrı kod tabanı
- **Bakımı zor** — Her değişiklikte tüm adapter'ları güncelle

### 3.2 Mevcut Durum (CanonBridge Olmadan)

```
Proje A (Otomotiv):
    → Sıfırdan adapter kodu
    → 6 ay development
    → 5 geliştirici
    → Teslim

Proje B (Perakende):
    → Sıfırdan adapter kodu
    → 6 ay development
    → 5 geliştirici
    → Teslim

Proje C (Banka):
    → Sıfırdan adapter kodu...
```

**Sonuç:** Her projede aynı iş yeniden yapılır. Ölçeklenemez. Kazanç: işçilik saat ücreti.

### 3.3 Hedef Durum (CanonBridge ile)

```
Platform kurulumu (bir kez)
        ↓
Proje A (Otomotiv):
    → Partner config + JSONata mapping
    → 2–4 hafta
    → 1–2 geliştirici

Proje B (Perakende):
    → Partner config + JSONata mapping
    → 2–4 hafta
    → 1–2 geliştirici

Proje C (Banka):
    → Partner config + JSONata mapping...
```

**Sonuç:** Platform bir kez yazılır, her projede sadece mapping eklenir. Kazanç: Ölçeklenebilir ürün geliri.

### 3.4 Gerçek Senaryo

```
Tek bir firma için çalışan entegrasyon platformu:

Dış sistemler:
    API-1:  Ticaret Bakanlığı     → farklı format
    API-2:  Banka X               → farklı format
    API-3:  Banka Y               → farklı format
    API-4:  Lojistik A            → farklı format
    API-5:  Lojistik B            → farklı format
    API-6:  E-fatura sağlayıcısı  → farklı format
    API-7:  E-arşiv sağlayıcısı   → farklı format
    API-8:  CRM                   → farklı format
    API-9:  ERP                   → farklı format
    API-10: Ödeme geçidi          → farklı format
    ...15 farklı nokta

Hepsi → CanonBridge → Tek canonical format → Core business logic
```

---

## 4. Rekabet Analizi

### 4.1 Büyük iPaaS Platformlarına Karşı Fark

| Boyut | MuleSoft/Boomi/Workato | CanonBridge |
|---|---|---|
| **Odak** | Her şeyi bağlamak (hub-and-spoke) | Dönüşüm pipeline'ı |
| **Kullanıcı** | Düşük kod, görsel arayüz | Geliştirici dostu, mapping as code |
| **Dönüşüm** | Sınırlı görsel mapping | JSONata — güçlü, versiyonlanabilir, test edilebilir |
| **Reliability** | Temel hata yönetimi | DLQ + Retry + Circuit Breaker + Idempotency + Outbox + Pending |
| **Deployment** | Sadece kendi cloud'ları | İstenen her yere (on-premise, AWS, Azure, GCP, OpenShift) |
| **Fiyat** | Çok pahalı ($100K+/yıl) | Uygun (€12K–50K/yıl) |
| **Ağırlık** | Ağır, bürokratik | Hafif, container-native |
| **Mapping yönetimi** | UI'da manuel | Git'te versiyonlu, CI'da testli |
| **Kontrat koruma** | Temel | Ajv JSON Schema ile zorunlu validasyon |
| **Vendor lock-in** | Yüksek (kapalı sistem) | Düşük (açık standartlar: JSONata, JSON Schema, Kafka) |

### 4.2 CanonBridge'in Farklılaştığı Noktalar

1. **"Kod olarak mapping" (Mapping as Code)**
   - JSONata mapping'ler Git'te versiyonlanır
   - CI'da otomatik test edilir
   - Code review sürecine dahil edilir
   - Rollback tek komutla

2. **Built-in Reliability** — DLQ, retry, circuit breaker, idempotency, outbox, pending table, poison pill koruması, graceful shutdown

3. **Kontrat Koruma** — Ajv JSON Schema ile her canonical event validate edilir

4. **Hibrit Deployment** — On-premise, AWS EKS, Azure AKS, Google GKE, OpenShift, Docker Compose

5. **Hafif ve Geliştirici Dostu** — Container-native, CI/CD entegre, kara kutu değil

### 4.3 Pazar Konumlandırması

```
Yüksek fiyat
    │
    │  MuleSoft ●
    │  Boomi ●
    │  Workato ●
    │
    │       CanonBridge ●  ← Hedef konum
    │
    │  Apache Camel ● (ücretsiz, açık kaynak)
    │
    └──────────────────────────────
    Düşük reliability    Yüksek reliability
```

---

## 5. İş Modeli

### 5.1 Model: Ürün + Danışmanlık (SaaS Değil)

**Neden SaaS değil?**
- Tek kişilik ekip, 7/24 altyapı nöbeti imkansız
- Kurumsal firmalar verilerini dışarı vermek istemez
- On-premise satışı çok daha hızlı: "Kendi sunucunuza kuralım"

**Neden Ürün + Danışmanlık?**
- Platform lisansı recurring revenue sağlar
- Danışmanlık yüksek tek seferlik gelir getirir
- 5–10 müşteri yeterli, scale etme baskısı yok

### 5.2 Deployment Modeli: Customer-Managed

**"Nereye isterseniz oraya kurarım"**

```
Senin sağladığın:
  ✅ Helm chart (veya kustomize)
  ✅ Docker Compose (küçük kurulumlar)
  ✅ Konfigürasyon şablonları
  ✅ Migration script'leri
  ✅ Kafka topic oluşturma script'leri
  ✅ Prometheus + Grafana dashboard'ları
  ✅ CI/CD pipeline örnekleri
  ✅ Kurulum dokümantasyonu
  ✅ 1–2 hafta onsite/remote kurulum desteği

Müşterinin sağlaması:
  ✅ Kubernetes cluster (veya container runtime)
  ✅ PostgreSQL (veya managed DB)
  ✅ Kafka (veya managed Kafka)
  ✅ Storage (PVC), Network / ingress, SSL sertifikaları
```

### 5.3 Gelir Kaynakları

| Kalem | Türü | Açıklama |
|---|---|---|
| **Platform Lisansı** | Yıllık recurring | Platformu kullanma hakkı, güncellemeler |
| **Kurulum** | Tek seferlik | Helm chart deploy, konfigürasyon, entegrasyon |
| **Mapping Yazımı** | Proje bazlı | Partner başına JSONata mapping geliştirme |
| **Eğitim** | Tek seferlik | Geliştirici ve operasyon eğitimi |
| **Premium Destek** | Yıllık recurring | SLA'lı öncelikli destek |

### 5.4 Fiyatlandırma Tablosu

| Kalem | Starter | Professional | Enterprise |
|---|---|---|---|
| **Partner sayısı** | 5 | 20 | Limitsiz |
| **Event tipi** | 10 | 50 | Limitsiz |
| **Ortam** | 1 (prod) | 3 (dev/staging/prod) | Limitsiz |
| **HA** | Yok | Var | HA + DR |
| **Temel destek** | 48h email | 8h Slack | 7/24 2h SLA |
| **Lisans/yıl** | €12,000 | €25,000 | €50,000 |
| **Premium destek/yıl** | €0 | €8,000 | €15,000 |

**Opsiyonel Hizmetler:**

| Hizmet | Fiyat Aralığı |
|---|---|
| Kurulum (temel) | €5,000 |
| Kurulum (kurumsal HA) | €15,000 |
| Kurulum (kompleks, özel adapter) | €25,000+ |
| Mapping yazımı (basit, 10–20 alan) | €1,500 / partner |
| Mapping yazımı (orta, 50+ alan) | €4,000 / partner |
| Mapping yazımı (kompleks, çok seviyeli) | €8,000+ / partner |
| Geliştirici eğitimi (3 gün) | €3,000 |
| Operasyon eğitimi (2 gün) | €2,500 |
| İleri seviye eğitim (1 gün) | €2,000 |
| Günlük danışmanlık | €800 / gün |

### 5.5 Örnek Müşteri Faturası

**ABC Otomotiv Distribütörü — 10 bayi entegrasyonu, HA kurulum**

```
Platform Lisansı (Professional):       €25,000 / yıl
Premium Destek:                        €8,000 / yıl
Kurumsal Kurulum (HA):                 €15,000 (tek sefer)
10 bayi mapping'i (orta kompleks):     €40,000 (tek sefer)
Eğitim (geliştirici + operasyon):      €5,500 (tek sefer)
─────────────────────────────────────────────────
İlk yıl toplam:                        €93,500
Sonraki yıllar recurring:              €33,000 / yıl
```

### 5.6 5 Müşterili Portföy Simülasyonu

| Müşteri | Lisans/Yıl | Destek/Yıl | Kurulum* | Mapping* | İlk Yıl |
|---|---|---|---|---|---|
| Otomotiv A (Professional) | €25K | €8K | €15K | €40K | €88K |
| Banka B (Enterprise) | €50K | €15K | €25K | €60K | €150K |
| Lojistik C (Starter) | €12K | €0 | €5K | €15K | €32K |
| Ent. Firması D (Professional) | €25K | €8K | €15K | €50K | €98K |
| Perakende E (Professional) | €25K | €8K | €10K | €30K | €73K |
| **Toplam** | **€137K** | **€39K** | **€70K** | **€195K** | **€441K** |

`*` Tek seferlik · **Sonraki yıllar recurring: €176K/yıl**

### 5.7 Lisans Yönetimi

```
Lisans Mekanizması:
  - License key (JWT veya signed token)
  - Tier bilgisi key içinde (starter/professional/enterprise)
  - Limitler key içinde (maxPartner, maxEventType, expiryDate)
  - Platform başlangıçta key'i doğrular
  - Süre dolunca: grace period 30 gün + uyarı log'ları
  - Hard stop yok, ama log'da her mesajda uyarı
  - Yenileme: yeni key gönder, yeniden başlatmaya gerek yok (reload endpoint)
```

---

## 6. Rekabet Avantajı: Built-in Reliability

### 6.1 Hata Yönetimi Karşılaştırması

| Senaryo | Büyük iPaaS | CanonBridge |
|---|---|---|
| **Geçici hata** | Basit retry | 3 seviyeli retry topic (1m, 5m, 30m) + backpressure |
| **Kalıcı hata** | DLQ (temel) | DLQ + PII mask + encrypted payload + redrive CLI |
| **Sistem çökmesi** | Manuel müdahale | Circuit breaker otomatik → pause consumer → /health/ready 503 → recover |
| **Duplicate event** | Best effort | `processed_events` tablosu zorunlu, DB transaction içinde |
| **DB write + event atomik** | Yok (ek ücret) | Outbox pattern built-in, aynı transaction'da |
| **Parent eksik** | Manuel çözüm | Pending table otomatik, parent gelince işler |
| **Bozuk mesaj (poison pill)** | Consumer çökebilir | Try/catch wrapper, tek mesaj sistemi durduramaz |
| **Pod kill** | Veri kaybı riski | Graceful shutdown + manual offset commit + worker drain |
| **Partition sıralama** | Yok | Ordered mode offset tracking |
| **Bir partner flood** | Sistem yavaşlar | Partner rate limiting + per-partner in-flight limit |
| **DLQ şişmesi** | Operasyon körlüğü | DLQ alert + retention policy + redrive |

### 6.2 Müşteriye Anlatım (Value Proposition)

```
"Sisteminiz gece 3'te hata verdiğinde,
MuleSoft size email atar. Sabah gelir bakar, çözersiniz.

CanonBridge o sırada:

✅ Geçici hataysa kendi kendine tekrar dener
✅ Kalıcı hataysa DLQ'ya atar, PII maskeler, size metadata verir
✅ Bir partner tüm sistemi yavaşlatırsa circuit breaker devreye girer
✅ Sipariş kalemi siparişten önce gelirse pending tabloda bekler
✅ Aynı mesaj iki kez gelirse sessizce atlar (idempotent)
✅ Pod restart'ında mesaj kaybolmaz (graceful shutdown)
✅ Worker timeout olursa task iptal edilir, DLQ'ya düşer

Sabah geldiğinizde her şey ya işlenmiş,
ya da DLQ'da sizi bekliyor olur.

Size sadece DLQ'dakileri incelemek kalır."
```

### 6.3 Reliability Mimarisi — Tam Akış

```
Mesaj geldi
    ↓
Poison pill koruması (try/catch wrapper)
    ↓
JSON parse + envelope validasyonu
    ↓
Partner ve mapping çözümleme
    ↓
Input schema validasyonu (opsiyonel)
    ↓
JSONata dönüşümü (worker pool, timeout korumalı)
    ↓
Canonical schema validasyonu (zorunlu, Ajv)
    ↓
EntityId / partition key validasyonu
    ↓
Kafka produce (canonical topic)
    ↓
Başarılı → offset commit
Başarısız → hata sınıflandır:
    ├── Geçici → retry topic (1m → 5m → 30m → DLQ)
    ├── Kalıcı → DLQ (metadata + masked payload)
    ├── Circuit breaker → pause consumer
    └── Worker timeout → retry → DLQ

Business Service:
    ↓
Canonical event consume
    ↓
Idempotency kontrolü (processed_events)
    ├── Zaten işlenmiş → skip, success
    └── Yeni → devam
        ↓
    Parent-child kontrolü
    ├── Parent var → işle
    └── Parent yok → pending table
        ↓
    DB transaction:
        - Domain update
        - processed_events insert
        - outbox_events insert
        ↓
    COMMIT → Kafka offset commit
```

---

## 7. Minimum Bakım İçin Gerekli Eklemeler

### 7.1 Self-Healing Mechanisms

| Bileşen | Hata | Otomatik Davranış |
|---|---|---|
| Worker | Crash | Main thread detect eder, yeni worker başlatır, in-flight task retry |
| Worker | Timeout | Task iptal, retry, max retry sonrası DLQ |
| Consumer | Stall (no heartbeat) | Health check fail, K8s liveness probe restart |
| DB pool | Tükenme | Circuit breaker, bağlantı yeniden deneme, /health/ready 503 |
| Outbox publisher | Takılma | Auto-restart, deduplicate (event_id unique) |
| Pending table | Şişme | Scheduled cleanup job, expired → DLQ |
| Kafka producer | Timeout | Circuit breaker, retry topic, cooldown |

### 7.2 Platform Upgrade Strategy

```
Upgrade Yöntemi: Rolling update (Kubernetes)
  - Helm chart upgrade
  - RollingUpdate stratejisi (maxUnavailable: 0, maxSurge: 1)
  - Pod'lar sırayla değişir
  - Graceful shutdown ile eski pod drain olur

DB Migration:
  - Flyway veya Liquibase
  - Her sürüm için migration script'i
  - Rollback script'i de bulunur
  - Migration başarısız olursa deployment durur

Mapping Uyumluluğu:
  - Yeni platform sürümü eski mapping'leri destekler
  - CI'da tüm mapping fixture'ları test edilir

Canary (Opsiyonel, ileri aşama):
  - Yeni sürümü canary pod olarak devreye al
  - Trafiğin %10'unu yönlendir
  - Metrikleri izle, sorun yoksa %100'e çıkar

Downtime: Sıfır (rolling update ile)
```

### 7.3 Remote Support & Diagnostics

```
support-bundle.sh Script'i:
  Tek komutla şunları toplar:
    - Son 1 saatlik log'lar (masked)
    - Prometheus metrics snapshot
    - Kafka consumer group status
    - DB connection pool status
    - Worker pool status
    - Konfigürasyon (secrets maskelenmiş)
    - Son 100 DLQ mesajı (metadata only)
  → Tar.gz olarak paketler
  → Müşteri sana gönderir

Health Check Detayı:
  GET /health/ready?detail=true →
    {
      "status": "ready",
      "components": {
        "kafkaConsumer": "connected",
        "kafkaProducer": "connected",
        "mappingCache": "loaded (15 mappings)",
        "schemaCache": "loaded (8 schemas)",
        "workerPool": "healthy (4/4 workers, queue 20/100)",
        "circuitBreaker": "closed",
        "db": "not applicable (transformer has no DB)"
      }
    }
```

### 7.4 Audit Logging

```
Audit Event'leri:
  - mapping.deployed (hangi mapping, hangi versiyon, kim)
  - mapping.rollback (hangi mapping, eski versiyon, kim)
  - schema.updated (hangi schema, hangi değişiklik, kim)
  - dlq.redrive (hangi mesaj, hangi mapping versiyonu, kim onayladı)
  - license.renewed (hangi tier, ne zaman)
  - license.expiring (grace period başladı)
  - config.updated (hangi ayar, eski/yeni değer, kim)
```

### 7.5 Backup & Disaster Recovery

```
Yedeklenmesi Gerekenler:
  1. PostgreSQL veritabanı → pg_dump, günlük, 30 gün retention
  2. Mapping dosyaları → Git'te zaten var
  3. Schema dosyaları → Git'te zaten var
  4. Platform konfigürasyonu → GitOps (Helm values)

RPO: DB 24 saat, Mapping/Schema anlık, Kafka 7 gün replay
RTO: DB restore 1–2 saat, Platform restart 5 dakika
```

### 7.6 Platform Configuration Reference

```
Runtime değişiklik (restart gerektirmez):
  - WORKER_COUNT, WORKER_TASK_TIMEOUT_MS
  - CB_FAILURE_THRESHOLD, CB_COOLDOWN_MS
  - PARTNER_MAX_IN_FLIGHT, PARTNER_MAX_PAYLOAD_BYTES

Restart gerektiren:
  - WORKER_MAX_OLD_SPACE_MB
  - KAFKA_BROKERS, DB_HOST

Runtime değişiklik için: POST /admin/config/reload
```

---

## 8. Go-to-Market Stratejisi

### 8.1 Faz 1: Temel Atma

```
✅ Mimari doküman tamam
✅ GitHub reposu oluşturuldu
🔄 Otomotiv projesinde Java developer olarak çalış
   → Piyasayı öğren, Fabric'in limitlerini not al
🔄 CanonBridge MVP'sini boş zamanlarda kodla
```

### 8.2 Faz 2: MVP ve İlk Referans

```
□ CanonBridge MVP'sini tamamla (transformer + Kafka + DLQ + health + Helm)
□ İlk referansı bul (otomotiv projesindeki bağlantılar)
□ İlk kurulum + danışmanlık paketini sat
```

### 8.3 Faz 3: Büyüme

```
□ 3–5 kurumsal müşteri
□ Yıllık €100K+ recurring revenue
□ Mapping Studio UI (React) MVP
□ Referans vakalar, vaka çalışmaları
```

### 8.4 Faz 4: Olgunlaşma

```
□ 5–10 müşteri
□ Yıllık €150K+ recurring revenue
□ Tam özellikli Mapping Studio UI
□ Opsiyonel managed hosting
□ Partner ağı (diğer contractor'lar mapping yazabilir)
```

---

## 9. Riskler ve Mitigasyon

| Risk | Olasılık | Etki | Mitigasyon |
|---|---|---|---|
| **Tek kişilik ekip** | Gerçek | Orta | Danışmanlık modeli (SaaS yok), müşteri sayısı sınırlı |
| **Satış döngüsü uzun** | Yüksek | Yüksek | Contractor geliriyle bridge; küçük firmalardan başla |
| **Rakip açık kaynak** | Orta | Orta | Reliability + support + deployment kolaylığı fark yaratır |
| **Partner format değişimi** | Yüksek | Düşük | Mapping Studio rollback + DLQ replay bunu çözer |
| **İlk müşteri bulamama** | Orta | Yüksek | Mevcut bağlantılarla referans kur, ilk kurulum indirimli |
| **Platform bakım yükü** | Orta | Orta | Self-healing + iyi monitoring → az müdahale gerekir |

---

## Bağlantılı Dokümanlar

- [İş Modeli ve Fiyatlandırma](./business-model.md)
- [Rekabet Analizi](./competitive-analysis.md)
- [Platform Upgrade Stratejisi](../deployment/08-platform-upgrade.md)
- [Support ve Diagnostics](../operations/13-support-diagnostics.md)
- [Mimari Genel Bakış](../architecture/01-overview.md)
- [ADR Klasörü](../adr/)
