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

- [ ] **Y1. Kafka Producer/Consumer Entegre Et**
  - `kafkajs` ile consumer ve producer oluştur.
  - Canonical topic'e dönüştürülmüş mesajları produce et.
  - Raw topic'ten mesaj consume et.

- [ ] **Y2. Rate Limiting Ekle**
  - `@fastify/rate-limit` plugin'ini ekle.
  - Endpoint bazında istek sınırı belirle.

- [ ] **Y3. Birim Testleri Yaz**
  - `vitest` veya `jest` ile tüm endpoint'ler için test yaz.
  - JSONata dönüşüm kurallarının testini ekle (`rule-to-jsonata.spec.ts`).
  - Ajv validasyon testlerini ekle.

- [ ] **Y4. DLQ Yönetim Endpoint'leri Oluştur**
  - `GET /api/dlq` – DLQ'daki mesajları listele.
  - `GET /api/dlq/:id` – Mesaj detayı görüntüle.
  - `POST /api/dlq/:id/redrive` – Mesajı tekrar işleme kuyruğuna al.

### UI – `canonbridge-studio`

- [ ] **Y5. Wizard'da Dinamik Parametre Etiketleri**
  - `paramA`, `paramB`, `paramC` alanlarının label'larını seçili `transform` tipine göre değiştir.
  - Örnek: `date_format` → "Girdi Formatı" / "Çıktı Formatı", `default_value` → "Varsayılan Değer".

- [ ] **Y6. Wizard'da İç İçe Nesne/Dizi Eşleştirme Arayüzü**
  - Hedef alan tipi `object` veya `array` olduğunda alt alanları eşleştirmek için minyatür bir alt tablo veya modal aç.
  - `MappingRule` modelini hiyerarşik yapıya uygun hale getir.

- [ ] **Y7. Wizard'da Otomatik Kaydetme (Auto-Save)**
  - Her 10 saniyede bir veya her adım değişikliğinde `localStorage`'a kaydet.
  - Sayfa geri yüklendiğinde "Kaydedilmemiş ilerleme bulundu, geri yüklemek ister misiniz?" diye sor.

- [ ] **Y8. DLQ Sayfasına Redrive Butonu Ekle**
  - Her DLQ mesajı için "Tekrar İşle" butonu koy.
  - Redrive edilen mesajı görsel olarak işaretle.

- [ ] **Y9. External Systems Sayfasına Credential Store UI Ekle**
  - API Key, Basic Auth, OAuth2 kimlik bilgilerini ekleyip düzenleyebilecek bir modal/form oluştur.
  - Hassas bilgiler maskelenmiş olarak gösterilsin (örn: `a1b2****3456`).

- [ ] **Y10. Wizard'da Kaynak Tipi Konfigürasyonunu Tamamla**
  - Webhook seçince otomatik URL ve API Key üretip göster.
  - External API seçince endpoint, HTTP metodu ve auth tipi seçim alanı aç.
  - Kafka seçince topic ve broker bilgisi girme alanı ekle.

### Mock – `canonbridge-mock`

- [ ] **Y11. Kafka Topic Init Script'i Yaz**
  - `partner.payflex.raw`, `partner.shopmax.raw`, `cargo.updates` topic'lerini otomatik oluşturan `init-kafka.sh` yaz.
  - Partition ve retention ayarlarını belirt.

---

## 🟢 Orta Öncelikli Görevler (Orta Vadede Tamamlanmalı)

### UI – `canonbridge-studio`

- [ ] **O1. Wizard'a Uzman Modu (JSONata Önizleme) Ekle**
  - Adım 2'de isteğe bağlı bir panel aç.
  - Görsel kuralların ürettiği JSONata ifadesini syntax-highlighted göster.

- [ ] **O2. Test Paneline Diff Viewer Ekle**
  - Başarısız testlerde `expected` ve `actual` arasındaki farkı görsel vurgulayan bir diff bileşeni kullan (örn: `monaco-diff-editor`).

- [ ] **O3. Undo/Redo Mekanizması Kur**
  - Mapping kuralı ekleme/silme/düzenleme işlemlerini bir yığında (stack) tut.
  - `Ctrl+Z` ve `Ctrl+Y` ile geri/ileri al.

- [ ] **O4. Boş Durum (Empty State) Ekranları Ekle**
  - Hiç mapping yokken, hiç partner yokken, DLQ boşken anlamlı mesaj ve illüstrasyon göster.
  - "İlk Mapping'inizi Oluşturun" gibi aksiyon butonu ekle.

- [ ] **O5. CSS Değişken Hatasını Düzelt**
  - `styles.scss`'teki `$primaryColor` ve `var(--primary-color)` karışıklığını gider.

### Backend – `mapping-studio-api`

- [ ] **O6. SOAP/XML Dönüşüm Desteği Ekle**
  - XML→JSON ve JSON→XML dönüşümü için `xml2js` veya `fast-xml-parser` entegre et.
  - SOAP zarfı oluşturma ve çözümleme yardımcı fonksiyonlarını yaz.

- [ ] **O7. API Dokümantasyonu Oluştur**
  - `@fastify/swagger` ile OpenAPI 3.0 dokümanı oluştur.
  - `/docs` endpoint'inde Swagger UI sun.

- [ ] **O8. Backend'i Dockerize Et**
  - `Dockerfile` yaz.
  - Ana `docker-compose.yml` içine backend servisini ekle.

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

- [ ] **D4. Graceful Shutdown Implemente Et**
  - `SIGTERM` sinyali alınca in-flight istekleri tamamla.
  - Kafka consumer/producer bağlantılarını güvenli kapat.
  - Health check'i 503'e çevir.

- [ ] **D5. Circuit Breaker Ekle**
  - Dış API çağrıları için `opossum` kütüphanesini entegre et.
  - Tekrarlayan hatalarda devreyi aç, belirli süre sonra yarı açık dene.

### Ana Repo – `canonbridge`

- [ ] **D6. `PHASE2_COMPLETE.md` Dosyasını Güncelle veya Kaldır**
  - İçeriği anlamsız veya güncel değilse kaldır.
  - Güncelse içeriğini netleştir.

---

## 📈 Görev Özeti

| Öncelik | Görev Sayısı | Tahmini Süre |
|---|---|---|
| 🔴 Kritik | 8 | 3-4 hafta |
| 🟡 Yüksek | 11 | 2-3 hafta |
| 🟢 Orta | 11 | 2-3 hafta |
| ⚪ Düşük | 6 | 1-2 hafta |
| **Toplam** | **36** | **8-12 hafta** |

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