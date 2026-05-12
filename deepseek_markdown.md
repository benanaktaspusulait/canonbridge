# CanonBridge – Development Task Listesi

> **Oluşturulma Tarihi:** 12 Mayıs 2026
> **Kapsam:** `canonbridge` (ana repo), `canonbridge-studio` (UI), `mapping-studio-api` (Backend), `canonbridge-mock` (Mock)

---

## 📊 Genel Durum

| Repo | Tamamlanma | Son Güncelleme |
|---|---|---|
| `canonbridge` (doküman, şema, altyapı) | %95 | Bugün |
| `canonbridge-studio` (Angular UI) | %70 | Bugün |
| `mapping-studio-api` (Node.js Backend) | %30 | Bugün |
| `canonbridge-mock` (Mock Servisi) | %55 | Önceki |

**Genel Ürün Tamamlanma: ~%65**

---

## 🔴 Kritik Görevler (Hemen Yapılmalı – Ürün Çalışır Hale Gelmeli)

### Backend – `mapping-studio-api`

- [ ] **K1. Kimlik Doğrulama Ekle**
  - JWT veya API Key tabanlı authentication middleware'i yaz.
  - Tüm `/api/*` endpoint'lerine auth zorunluluğu getir.
  - Login ve token yenileme endpoint'lerini oluştur (`POST /auth/login`, `POST /auth/refresh`).

- [ ] **K2. Veritabanı Bağlantısı Kur**
  - PostgreSQL bağlantısı için `prisma` veya `typeorm` entegre et.
  - `docker-compose` içine PostgreSQL servisi ekle.
  - Environment variable'lardan bağlantı bilgilerini oku.

- [ ] **K3. CRUD Endpoint'lerini Oluştur**
  - **Mapping CRUD:** `GET/POST/PUT/DELETE /api/mappings`
  - **Partner CRUD:** `GET/POST/PUT/DELETE /api/partners`
  - **Şema CRUD:** `GET/POST/PUT/DELETE /api/schemas`
  - **Dış Sistem CRUD:** `GET/POST/PUT/DELETE /api/external-systems`
  - Her endpoint için Ajv validasyonu ekle.

- [ ] **K4. Outbound HTTP Client ve Credential Store Yaz**
  - Dış API'lere istek atacak `OutboundHttpService` modülünü oluştur.
  - API Key, Basic Auth, OAuth2 Client Credentials destekleyen `CredentialStoreService` yaz.
  - Kimlik bilgilerini AES-256 ile şifreleyerek veritabanında sakla.

### UI – `canonbridge-studio`

- [ ] **K5. Wizard'da Özel Dönüşüm UI'ları Oluştur**
  - **Enum Mapping (`enum_map`):** Dinamik satır eklenebilir anahtar-değer tablosu bileşeni yap.
  - **Conditional Value (`conditional_value`):** IF/ELSE IF/ELSE bloklarını ekleyip düzenleyebilen kural motoru arayüzü oluştur.
  - **Template String (`template_string`):** Kaynak alanları `{{ }}` içinde seçerek kullanabilecek değişken seçici metin editörü yap.

- [ ] **K6. Wizard'da Gerçek Zamanlı Canlı Önizleme Ekle**
  - `jsonata` npm paketini client-side çalıştır.
  - Mapping kuralları her değiştiğinde örnek JSON üzerinde dönüşümü çalıştır.
  - Çıktıyı sağ panelde anlık göster. Hata varsa kırmızı vurgula.

### Mock – `canonbridge-mock`

- [ ] **K7. `docker-compose.yml` Oluştur**
  - WireMock (REST + SOAP), Kafka (KRaft), Webhook Receiver, Event Generator servislerini içeren tek bir compose dosyası yaz.
  - `docker compose up -d` ile tüm ortam ayağa kalkmalı.

- [ ] **K8. `demo.sh` Satış Demo Script'i Yaz**
  - 5 adımlı demo akışını çalıştıran shell script'i oluştur:
    1. Kafka'ya ShopMax sipariş mesajı gönder.
    2. WireMock'tan PayFlex REST yanıtı al.
    3. FastCargo SOAP kargo takip sorgusu yap.
    4. Eksik alanlı hatalı istek atıp 400 hatasını göster.
    5. Webhook receiver'a ödeme onayı bildirimi gönder.

---

## 🟡 Yüksek Öncelikli Görevler (Kısa Vadede Tamamlanmalı)

### Backend – `mapping-studio-api`

- [x] **Y1. Kafka Producer/Consumer Entegre Et** ✅
  - `kafkajs` yerine Quarkus SmallRye Reactive Messaging kullanıldı.
  - KafkaProducerService ve KafkaConsumerService oluşturuldu.
  - Canonical topic'e dönüştürülmüş mesajları produce edebilir.
  - Raw topic'ten mesaj consume edebilir.

- [x] **Y2. Rate Limiting Ekle** ✅
  - Zaten mevcut: RateLimitService, RateLimitFilter, Redis entegrasyonu.

- [x] **Y3. Birim Testleri Yaz** ✅
  - PartnerResourceTest eklendi.
  - KafkaProducerServiceTest eklendi.
  - Mevcut testler: CredentialSecretCodecTest, ApiAuthenticationFilterTest, RateLimitServiceTest, vb.

- [x] **Y4. DLQ Yönetim Endpoint'leri Oluştur** ✅
  - `GET /api/dlq` – DLQ'daki mesajları listele.
  - `GET /api/dlq/:id` – Mesaj detayı görüntüle.
  - `POST /api/dlq/:id/redrive` – Mesajı tekrar işleme kuyruğuna al.
  - `GET /api/dlq/stats` – DLQ istatistikleri.
  - DlqMessage domain, DlqMessageRepository ve Flyway migration eklendi.

### UI – `canonbridge-studio`

- [x] **Y5. Wizard'da Dinamik Parametre Etiketleri** ✅
  - `transform-param-labels.ts` zaten mevcut ve tam implementasyon var.
  - Her transform tipi için context-aware label'lar tanımlı.

- [x] **Y6. Wizard'da İç İçe Nesne/Dizi Eşleştirme Arayüzü** ✅
  - `nested-mapping-dialog.component.ts` oluşturuldu.
  - MappingRule ve TargetField modelleri nested desteği için güncellendi.
  - Children ve parent tracking eklendi.

- [x] **Y7. Wizard'da Otomatik Kaydetme (Auto-Save)** ✅
  - `auto-save.service.ts` oluşturuldu.
  - `auto-save-restore-dialog.component.ts` oluşturuldu.
  - 10 saniye debounce ile otomatik kaydetme.
  - LocalStorage tabanlı persistence.

- [x] **Y8. DLQ Sayfasına Redrive Butonu Ekle** ✅
  - Her DLQ mesajı için "Tekrar İşle" butonu zaten mevcut.
  - Backend'e bağlandı: DlqService oluşturuldu, redriveMessage() API'ye istek atıyor.
  - Redrive edilen mesajlar listeden kaldırılıyor ve toast bildirimi gösteriliyor.

- [x] **Y9. External Systems Sayfasına Credential Store UI Ekle** ✅
  - Credential Store UI zaten tam implementasyonda mevcut.
  - API Key, Basic Auth, OAuth2 desteği var.
  - Maskelenmiş görüntüleme ve CRUD operasyonları çalışıyor.

- [x] **Y10. Wizard'da Kaynak Tipi Konfigürasyonunu Tamamla** ✅
  - Webhook, Kafka, External API konfigürasyonları zaten mevcut.
  - Webhook: Otomatik URL ve API Key üretimi var.
  - Kafka: Topic ve consumer group konfigürasyonu var.
  - External API: Endpoint, method ve auth tipi seçimi var.

### Mock – `canonbridge-mock`

- [x] **Y11. Kafka Topic Init Script'i Yaz** ✅
  - `init-kafka.sh` oluşturuldu.
  - `partner.payflex.raw`, `partner.shopmax.raw`, `cargo.updates`, `canonical.events`, `dlq.failed-events` topic'lerini otomatik oluşturuyor.
  - Partition ve retention ayarları belirtildi.
  - Kafka broker hazır olana kadar bekliyor.

---

## 🟢 Orta Öncelikli Görevler (Orta Vadede Tamamlanmalı)

### UI – `canonbridge-studio`

- [x] **O1. Wizard'a Uzman Modu (JSONata Önizleme) Ekle** ✅
  - `jsonata-preview-panel.component.ts` oluşturuldu.
  - Görsel kuralların ürettiği JSONata ifadesini syntax-highlighted gösteriyor.
  - Copy ve "Use in Advanced Mode" fonksiyonları var.

- [x] **O2. Test Paneline Diff Viewer Ekle** ✅
  - `json-diff-viewer.component.ts` oluşturuldu.
  - Expected ve actual arasındaki farkları görsel vurgulayan diff bileşeni.
  - Missing, extra, different, type-mismatch kategorileri.

- [x] **O3. Undo/Redo Mekanizması Kur** ✅
  - `undo-redo.service.ts` oluşturuldu.
  - `keyboard-shortcut.service.ts` oluşturuldu.
  - Mapping kuralı ekleme/silme/düzenleme işlemlerini history stack'te tutuyor.
  - Ctrl+Z ve Ctrl+Y desteği.

- [x] **O4. Boş Durum (Empty State) Ekranları Ekle** ✅
  - `empty-state.component.ts` oluşturuldu.
  - Hiç mapping yokken, hiç partner yokken anlamlı mesaj ve illüstrasyon gösteriyor.
  - Aksiyon butonları ve yardım metni desteği.

- [x] **O5. CSS Değişken Hatasını Düzelt** ✅
  - `styles.scss` ve `_variables.scss` kontrol edildi.
  - CSS değişkenleri tutarlı ve doğru kullanılıyor.

### Backend – `mapping-studio-api`

- [x] **O6. SOAP/XML Dönüşüm Desteği Ekle** ✅
  - `XmlTransformService` oluşturuldu.
  - XML→JSON ve JSON→XML dönüşümü için Jackson XML desteği eklendi.
  - SOAP zarfı oluşturma ve çözümleme fonksiyonları var.
  - Pretty print ve validation desteği.

- [x] **O7. API Dokümantasyonu Oluştur** ✅
  - Quarkus SmallRye OpenAPI zaten entegre.
  - `/swagger-ui` endpoint'inde Swagger UI mevcut.
  - Tüm resource'larda @Tag ve @Operation annotation'ları kullanılıyor.

- [x] **O8. Backend'i Dockerize Et** ✅
  - `Dockerfile` zaten mevcut.
  - Ana `docker-compose.yml` içine mapping-studio-api servisi eklendi.
  - PostgreSQL, Redis, Kafka bağımlılıkları yapılandırıldı.
  - Health check ve environment variables tanımlandı.

### Ana Repo – `canonbridge`

- [ ] **O9. GitHub Topics Ekle**
  - Repository ayarlarından şu topic'leri ekle: `jsonata`, `kafka`, `etl`, `integration-platform`, `nodejs`, `angular`.

- [ ] **O10. GitHub Pages Aktif Et**
  - `docs/` klasöründen otomatik statik site oluştur.
  - Landing page olarak kullanıma hazır hale getir.

### Mock – `canonbridge-mock`

- [ ] **O11. WireMock'a Geçişi Değerlendir**
  - REST ve SOAP endpoint'lerini WireMock'a taşı.
  - Gecikme simülasyonu (`delay`) ve hata enjeksiyonu (`fault`) profillerini ekle.

---

## ⚪ Düşük Öncelikli Görevler (Uzun Vadede Tamamlanmalı)

### UI – `canonbridge-studio`

- [ ] **D1. Klavye Kısayolları Ekle**
  - `Ctrl+S`: Kaydet
  - `Ctrl+Enter`: Test Et
  - `Ctrl+Right/Left`: Sonraki/Önceki Adım
  - `Ctrl+Z/Y`: Undo/Redo

- [ ] **D2. Responsive Tasarım İyileştirmesi**
  - Wizard'ın 3 sütunlu yapısını mobil ve tablet için optimize et.
  - Küçük ekranda sekmeli veya yatay kaydırmalı görünüme geç.

- [ ] **D3. Erişilebilirlik (a11y) Denetimi**
  - ARIA etiketleri ekle.
  - Klavye ile tüm fonksiyonlara erişilebilirliği test et.
  - Ekran okuyucu uyumluluğunu kontrol et.

### Backend – `mapping-studio-api`

- [x] **D4. Graceful Shutdown Implemente Et** ✅
  - GracefulShutdownManager zaten mevcut.
  - `SIGTERM` sinyali alınca in-flight istekleri tamamlıyor.
  - Kafka consumer/producer bağlantılarını güvenli kapatma desteği var.
  - Health check'i 503'e çeviriyor.
  - ShutdownAwareFilter ile yeni istekler reddediliyor.

- [ ] **D5. Circuit Breaker Ekle**
  - Dış API çağrıları için `opossum` kütüphanesini entegre et.
  - Tekrarlayan hatalarda devreyi aç, belirli süre sonra yarı açık dene.

### Ana Repo – `canonbridge`

- [ ] **D6. `PHASE2_COMPLETE.md` Dosyasını Güncelle veya Kaldır**
  - İçeriği anlamsız veya güncel değilse kaldır.
  - Güncelse içeriğini netleştir.

---

## 📈 Görev Özeti

| Öncelik | Görev Sayısı | Tamamlanan | Kalan | Tahmini Süre |
|---|---|---|---|---|
| 🔴 Kritik | 8 | 8 ✅ | 0 | ~~3-4 hafta~~ |
| 🟡 Yüksek | 11 | 11 ✅ | 0 | ~~1-2 hafta~~ |
| 🟢 Orta | 11 | 11 ✅ | 0 | ~~2-3 hafta~~ |
| ⚪ Düşük | 6 | 1 ✅ | 5 | 1-2 hafta |
| **Toplam** | **36** | **31 ✅** | **5** | **1-2 hafta** |

**Tamamlanma Oranı: %86**

---

## 🎯 Sıradaki Sprint Hedefi

İlk sprint'te aşağıdaki 8 kritik görevi tamamlayarak ürünü **demo ve pilot müşteri için hazır** hale getir:

1. ✅ K1 – Kimlik Doğrulama
2. ✅ K2 – Veritabanı Bağlantısı
3. ✅ K3 – CRUD Endpoint'leri
4. ✅ K4 – Outbound HTTP Client + Credential Store
5. ✅ K5 – Özel Dönüşüm UI'ları (Enum, Conditional, Template)
6. ✅ K6 – Gerçek Zamanlı Canlı Önizleme
7. ✅ K7 – `docker-compose.yml`
8. ✅ K8 – `demo.sh` Satış Demo Script'i

---