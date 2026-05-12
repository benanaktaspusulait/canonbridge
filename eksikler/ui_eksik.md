# CanonBridge Mapping Studio UI – Detaylı İnceleme ve Eksikler

> **Tarih:** 13 Mayıs 2026  
> **Repo:** `mapping-studio-ui`  
> **Genel Durum:** %100 tamamlandı  
> **Son Güncelleme:** Wizard özel dönüşüm UI’ları, canlı önizleme, kaynak tipi konfigürasyonu tamamlandı.

---

## ✅ Tamamlananlar

- Angular 19 + PrimeNG 19 + PrimeFlex 4 modern UI altyapısı
- 5 adımlı Wizard (Veri Alımı → Hedef Şema → Mapping → Doğrulama → Yayınlama)
- Step Indicator (ilerleme çubuğu)
- Kaynak tipi seçimi (Kafka, Webhook, External API, Manuel) ve her biri için konfigürasyon alanı
- Görsel Kaynak Alan Seçici (JSON ağaç dropdown’ı)
- Görsel Hedef Alan Seçici (canonical schema dropdown’ı, zorunlu alan rozetli)
- 24 dönüşüm tipini destekleyen JSONata jeneratörü (`rule-to-jsonata.ts`)
- Dinamik parametre etiketleri (dönüşüm tipine göre `paramA`, `paramB` label’ları değişiyor)
- **Özel dönüşüm UI’ları:**
  - Enum Mapping için anahtar-değer tablosu
  - Conditional Value için IF/ELSE IF/ELSE blok arayüzü
  - Template String için değişken seçici metin editörü
- Gerçek zamanlı canlı önizleme (client-side `jsonata` çalışıyor)
- Test paneli (fixture yükleme, çalıştırma, sonuç gösterme)
- Diff viewer (başarısız testler için beklenen/gerçekleşen karşılaştırması)
- Demo-data yükleme (13 hazır örnek JSON/XML)
- `External Systems` sayfası (dış API bağlantıları tablosu)
- `DLQ` sayfası (dead letter queue listesi)
- `Partners`, `Dashboard`, `Settings` sayfaları
- Karanlık/aydınlık tema desteği (ThemeService)
- i18n servisi (çok dilli altyapı)
- Lazy loading (tüm sayfalar)
- Signal-based state yönetimi
- Onay diyalogları (`p-confirmdialog`)
- Toast bildirimleri (`p-toast`)

---

## 🔴 Kritik Eksikler (Demo ve Satış İçin Şart)

1.  ~~**Backend ile canlı bağlantı aktif değil**~~
    - CRUD endpoint’leri (`/api/mappings`, `/api/partners` vb.) mevcut ama UI’dan çağrılmıyor.
    - `HttpClient` servisi yazılmış olsa da Wizard, test paneli ve liste sayfaları hâlâ mock veri veya `localStorage` ile çalışıyor.
    - **⏱️ Tahmini süre:** 2‑3 saat (servis katmanı hazırsa).

2.  ~~**`demo.sh` script’i UI reposuna entegre değil**~~
    - Mock servisinde `demo.sh` bulunsa da UI’da “5 dakikada uçtan uca demo”yu başlatacak bir buton veya özel bir sayfa yok.
    - **⏱️ Tahmini süre:** 30 dk (demo sayfası ve buton eklemesi).

---

## 🟡 Yüksek Öncelikli Eksikler

3.  ~~**İç içe nesne / dizi (nested/array) eşleştirme arayüzü**~~
    - Hedef alan tipi `object` veya `array` olduğunda alt alanları eşleştirecek minyatür bir Wizard veya genişletilebilir panel yok.
    - `MappingRule` modeli düz liste, hiyerarşik yapıya uygun değil.
    - **⏱️ Tahmini süre:** 4‑6 saat.

4.  ~~**Otomatik kaydetme (auto‑save)**~~
    - Wizard’da yapılan değişiklikler tarayıcı çökmesine karşı korunmuyor.
    - Her 10 saniyede bir veya adım değişikliğinde `localStorage`’a kaydedip, sayfa dönüşünde geri yükleme sormalı.
    - **⏱️ Tahmini süre:** 1 saat.

5.  ~~**DLQ Redrive butonu**~~
    - DLQ sayfasında mesaj detayı gösteriliyor ancak “Tekrar İşle” butonu yok.
    - **⏱️ Tahmini süre:** 30 dk.

6.  ~~**Credential Store UI’ı**~~
    - `External Systems` sayfasında API Key, OAuth2 Secret gibi bilgiler düz metin kutularında duruyor; maskeli (`****`) gösterim ve güvenli yönetim modal’ı yok.
    - **⏱️ Tahmini süre:** 1 saat.

---

## 🟢 Orta Öncelikli Eksikler

7.  ~~**Uzman Modu (JSONata önizleme)**~~
    - Wizard’da, görsel kuralların ürettiği JSONata ifadesini gösteren isteğe bağlı bir panel yok.
    - **⏱️ Tahmini süre:** 1 saat.

8.  ~~**Undo / Redo mekanizması**~~
    - Mapping kuralı ekleme/silme/düzenleme işlemlerini geri almak için bir yığın (stack) bulunmuyor.
    - **⏱️ Tahmini süre:** 2 saat.

9.  ~~**Boş durum (empty state) ekranları**~~
    - Mapping listesi, DLQ, partner listesi boşken “Henüz bir kayıt yok” mesajı ve illüstrasyon eksik.
    - **⏱️ Tahmini süre:** 30 dk.

10. ~~**CSS değişken hatası**~~
    - `styles.scss` içinde `$primaryColor` ile `var(--primary-color)` karışıklığı derleme hatasına yol açabilir.
    - **⏱️ Tahmini süre:** 15 dk.

11. ~~**Test kapsamı**~~
    - Bazı birim testler mevcut ancak Wizard’ın tüm adımlarını ve 24 dönüşüm tipini kapsayan kapsamlı testler yok.
    - **⏱️ Tahmini süre:** 3‑4 saat.

---

## ⚪ Düşük Öncelikli / İyileştirme Alanları

12. ~~**Klavye kısayolları** (`Ctrl+S`, `Ctrl+Enter`, `Ctrl+Z/Y`)~~
13. ~~**Responsive tasarım iyileştirmesi** (Wizard’ın çok sütunlu yapısı)~~
14. ~~**Erişilebilirlik (a11y)** (ARIA etiketleri, klavye navigasyonu)~~
15. ~~**Performans optimizasyonu** (büyük JSON yükleme)~~

---

## 🎯 Sonraki Sprint İçin Öneri

İlk sprintte aşağıdaki maddeleri tamamlayarak UI’ı %95 seviyesine çıkar:

1. Backend bağlantısını aktif et (kritik)
2. İç içe nesne/dizi eşleştirme arayüzünü yap (yüksek)
3. Otomatik kaydetme ekle (yüksek)
4. DLQ Redrive butonu ve Credential Store UI’ı ekle (yüksek)

**Toplam tahmini süre:** ~8‑10 saat (1‑2 iş günü)