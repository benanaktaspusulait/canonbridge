# CanonBridge Mapping Studio UI – Eksikler ve Geliştirme Durumu

> **Tarih:** 13 Mayıs 2026  
> **Repo:** `mapping-studio-ui`  
> **Genel Durum:** %95 tamamlandı

---

## ✅ Tamamlananlar (Son güncelleme ile gelenler)

- Angular 19 + PrimeNG 19 + PrimeFlex 4 modern UI altyapısı
- 5 adımlı Wizard (veri alımı, hedef şema, mapping, doğrulama, yayınlama)
- Step indicator (ilerleme çubuğu)
- Kaynak tipi seçimi (Kafka, Webhook, External API, Manuel) ve yapılandırma alanları
- Görsel kaynak alan seçici (JSON ağaç dropdown'ı)
- Görsel hedef alan seçici (canonical schema dropdown'ı, zorunlu alan rozetli)
- 24 dönüşüm tipini destekleyen JSONata jeneratörü (`rule-to-jsonata.ts`)
- Dinamik parametre etiketleri (dönüşüm tipine göre label değişimi)
- **Özel dönüşüm UI'ları:**
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

## ✅ Kritik Eksikler — TAMAMLANDI

1. ✅ **`demo.sh` demo script'i UI'a bağlandı**
   - `pages/demo/demo.component.ts` oluşturuldu — 5 adımlı animasyonlu demo akışı
   - `/demo` rotası ve sidebar linki (`pi pi-play-circle`) eklendi
   - `en.json` / `tr.json`'a `nav.demo` çevirisi eklendi

2. ✅ **Backend ile canlı bağlantı kuruldu**
   - `core/services/mapping.service.ts` oluşturuldu (`list`, `create`, `update`, `delete`)
   - `mappings.component.ts` → `ngOnInit`'te `GET /api/mapping-drafts` çağrıyor, delete API'ye bağlı
   - `integration-studio` → `autosaveDraft()` artık backend'e `create`/`update` yapıyor, `backendDraftId` sinyali ile takip ediyor

---

## ✅ Yüksek Öncelikli Eksikler — TAMAMLANDI

3. ✅ **İç içe nesne/dizi eşleştirme arayüzü** — `nested-mapping-dialog.component.ts` mevcut ve studio'ya entegre

4. ✅ **Otomatik kaydetme (auto-save)** — `auto-save.service.ts` mevcut; artık localStorage + backend'e periyodik kayıt yapıyor

5. ✅ **DLQ Redrive butonu** — `dlq.component.html` satır bazında ve drawer'da Redrive butonu mevcut; `dlq.service.ts` ile `POST /api/dlq/:id/redrive` çağırıyor

6. ✅ **Credential Store UI'ı** — `external-systems.component.ts` credential dialog'u mevcut, `secretValue` alanı `type="password"` ile maskeleniyor

---

## ✅ Orta Öncelikli Eksikler — TAMAMLANDI

7. ✅ **Uzman Modu (JSONata önizleme)** — `jsonata-preview-panel.component.ts` mevcut ve Wizard Step 2'ye entegre

8. ✅ **Undo/Redo mekanizması** — `undo-redo.service.ts` mevcut

9. ✅ **Boş durum (empty state) ekranları** — `empty-state.component.ts` mevcut

10. ✅ **CSS değişken hatası** — `styles.scss` yalnızca `var(--...)` kullanıyor, `$primaryColor` karışıklığı yok

11. ❌ **Test kapsamı** — Bazı birim testler mevcut ancak Wizard'ın tüm adımlarını ve 24 dönüşüm tipini kapsayan kapsamlı entegrasyon testleri eksik

---

## ⚪ Düşük Öncelikli / İyileştirme Alanları

12. ✅ **Klavye kısayolları** — `keyboard-shortcuts.service.ts` ve `keyboard-shortcuts-config.ts` mevcut

13. ❌ **Responsive tasarım** — Wizard'ın 3 sütunlu yapısı mobil ve tablette bozulabilir; özel responsive davranış eklenmemiş

14. ✅ **Erişilebilirlik (a11y)** — `accessibility.service.ts`, ARIA etiketleri ve skip-links mevcut (`ACCESSIBILITY.md`)

15. ❌ **Performans optimizasyonu** — Büyük JSON (10.000+ satır) yüklendiğinde ağaç görünümü ve önizleme performansı ölçülmemiş

---

## 🎯 Kalan Görevler

- **Test kapsamını genişlet** — Wizard adımları + 24 dönüşüm tipi için entegrasyon testleri
- **Responsive düzeltme** — Wizard 3 sütunlu yapısı için mobil breakpoint
- **Performans ölçümü** — Büyük JSON yüklemeleri için virtual scrolling veya lazy tree
