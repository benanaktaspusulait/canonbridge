# CanonBridge Mapping Studio UI – Eksikler ve Geliştirme Durumu

> **Tarih:** 13 Mayıs 2026  
> **Repo:** `mapping-studio-ui`  
> **Genel Durum:** %90 tamamlandı (Wizard, özel dönüşüm UI’ları, canlı önizleme, kaynak tipleri eklendi)

---

## ✅ Tamamlananlar (Son güncelleme ile gelenler)

- Angular 19 + PrimeNG 19 + PrimeFlex 4 modern UI altyapısı
- 5 adımlı Wizard (veri alımı, hedef şema, mapping, doğrulama, yayınlama)
- Step indicator (ilerleme çubuğu)
- Kaynak tipi seçimi (Kafka, Webhook, External API, Manuel) ve yapılandırma alanları
- Görsel kaynak alan seçici (JSON ağaç dropdown’ı)
- Görsel hedef alan seçici (canonical schema dropdown’ı, zorunlu alan rozetli)
- 24 dönüşüm tipini destekleyen JSONata jeneratörü (`rule-to-jsonata.ts`)
- Dinamik parametre etiketleri (dönüşüm tipine göre label değişimi)
- **Özel dönüşüm UI’ları:**
  - Enum Mapping için anahtar-değer tablosu
  - Conditional Value için IF/ELSE IF/ELSE blok arayüzü
  - Template String için değişken seçici metin editörü
- Gerçek zamanlı canlı önizleme (`jsonata` npm paketi client-side çalışıyor)
- Test paneli (fixture yükleme, çalıştırma, sonuç gösterme)
- Diff viewer (başarısız testler için)
- Demo-data yükleme (13 örnek JSON/XML)
- `External Systems` sayfası (dış API bağlantı yönetimi)
- `DLQ` sayfası (mesaj listesi)
- `Partners`, `Dashboard`, `Settings` sayfaları
- Karanlık/aydınlık tema desteği (ThemeService)
- i18n servisi (çok dilli altyapı)
- Lazy loading (tüm sayfalar)
- Signal-based state yönetimi
- Onay diyalogları (`p-confirmdialog`)
- `p-toast` bildirimleri

---

## 🔴 Kritik Eksikler (Hemen yapılması gerekenler)

1. **`demo.sh` demo script'i henüz UI reposuna bağlanmadı**
   - Mock servisindeki `demo.sh`, UI üzerinde butonla tetiklenebilir olmalı
   - “5 dakikada satış demosu” için UI’da bir “Demo Modu” sayfası ya da butonu yok

2. **Backend ile canlı bağlantı eksik**
   - Şu an `jsonata` client-side çalışıyor, ancak CRUD endpoint’leri (`/api/mappings`, vs.) UI’dan çağrılmıyor
   - `HttpClient` servisi oluşturulmuş olabilir ama tüm sayfalarda aktif değil

---

## 🟡 Yüksek Öncelikli Eksikler

3. **İç içe nesne/dizi (nested/array) eşleştirme arayüzü**
   - Hedef alan `object` veya `array` tipinde ise alt alanları eşleştirecek minyatür bir Wizard/modal yok
   - `MappingRule` modeli hâlâ düz liste; hiyerarşik yapıya uygun değil

4. **Otomatik kaydetme (auto-save)**
   - Wizard’da değişiklikler `localStorage`’a veya backend’e periyodik kaydedilmiyor
   - Tarayıcı çökmesi durumunda tüm ilerleme kaybolur

5. **DLQ Redrive butonu**
   - DLQ sayfasında mesaj detayı görüntülenebiliyor ancak "Tekrar İşle" (Redrive) butonu yok

6. **Credential Store UI’ı**
   - `External Systems` sayfasında kimlik bilgileri (API Key, OAuth2) düz metin olarak giriliyor
   - Hassas bilgiler maskelenmiş (`****`) olarak gösterilmiyor, ayrı bir güvenli yönetim modal’ı yok

---

## 🟢 Orta Öncelikli Eksikler

7. **Uzman Modu (JSONata önizleme)**
   - Wizard’da isteğe bağlı olarak üretilen JSONata ifadesini gösteren bir panel yok (ileri seviye kullanıcılar için debug aracı)

8. **Undo/Redo mekanizması**
   - Mapping kuralı ekleme/silme/düzenleme işlemlerini geri almak için yığın (stack) yok

9. **Boş durum (empty state) ekranları**
   - Mapping listesi boşken, DLQ boşken ya da hiç partner yokken "Henüz bir kayıt yok" mesajı ve illüstrasyon eksik

10. **CSS değişken hatası**
    - `styles.scss` içinde `$primaryColor` ile `var(--primary-color)` karışıklığı derleme hatasına yol açabilir

11. **Test kapsamı**
    - Bazı birim testler mevcut ancak Wizard’ın tüm adımlarını ve dönüşüm tiplerini kapsayan kapsamlı entegrasyon testleri yok

---

## ⚪ Düşük Öncelikli / İyileştirme Alanları

12. **Klavye kısayolları**
    - `Ctrl+S` (kaydet), `Ctrl+Enter` (test et), `Ctrl+Z/Y` (undo/redo) gibi kısayollar tanımlanmamış

13. **Responsive tasarım**
    - Wizard’ın 3 sütunlu yapısı mobil ve tablette bozulabilir; özel responsive davranış eklenmemiş

14. **Erişilebilirlik (a11y)**
    - ARIA etiketleri, klavye navigasyonu ve ekran okuyucu testleri eksik

15. **Performans optimizasyonu**
    - Büyük JSON (10.000+ satır) yüklendiğinde ağaç görünümü ve önizleme performansı ölçülmemiş

---

## 🎯 Sonraki Sprint İçin Önerilen Görevler (2 hafta)

1. **Backend bağlantısını aktif et** – CRUD endpoint’lerini UI’a bağla (Kritik)
2. **İç içe nesne/dizi eşleştirme arayüzünü yap** (Yüksek)
3. **Otomatik kaydetme ekle** (Yüksek)
4. **DLQ Redrive ve Credential Store UI’ı ekle** (Yüksek)

Bu görevler tamamlandığında UI %95 seviyesine ulaşır ve backend + mock ile birlikte ilk demo ve pilot müşteri için eksiksiz hale gelir.