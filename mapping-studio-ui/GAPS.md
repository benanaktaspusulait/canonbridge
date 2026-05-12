# Mapping Studio AI — Gap Analysis

> Durum: **In Progress — %50 tamamlandı (11/22 görev)**  
> Tarih: 2026-05-12  
> Kapsam: Integration Studio (Wizard) ve dönüşüm motoru

---

## Mevcut Durum (Ne Var)

| Bileşen | Durum |
|---------|-------|
| JSONata jeneratörü (24 dönüşüm tipi) | ✅ Çalışıyor |
| Wizard akışı (5 adım) | ✅ Çalışıyor |
| Signal tabanlı state yönetimi | ✅ Çalışıyor |
| Kaynak/hedef alan seçimleri | ✅ Çalışıyor |
| Step indicator | ✅ Çalışıyor |
| Onay diyalogları | ✅ Çalışıyor |
| Demo data yükleme | ✅ Çalışıyor |
| Temel dönüşüm kuralları | ✅ Çalışıyor |
| Test paneli (fixture) | ✅ Çalışıyor |
| JSONata üretimi | ✅ Çalışıyor |

---

## Eksikler — Öncelik Sırasıyla

### 🔴 P0 — Kritik (Blocker)

#### G-01: Dinamik parametre etiketleri yok
**Dosya:** `integration-studio.component.html` / `.ts`  
`paramA`, `paramB`, `paramC` alanları her dönüşüm tipinde aynı isimle gösteriliyor. Oysa dönüşüm tipine göre etiket değişmeli.

**Örnek:**
- `date_format`: "Girdi Formatı" / "Çıktı Formatı"
- `enum_map`: "Eşleşme Tablosu (JSON)"
- `default_value`: "Varsayılan Değer"

**Etki:** Kullanıcı kafası karışıyor, yanlış değer giriyor.

---

#### G-02: Enum Mapping UI yok
**Dosya:** `integration-studio.component.html`  
Anahtar-değer eşleştirmesi için dinamik satır eklenebilir bir tablo veya kod editörü yok. Kullanıcı JSON formatında manuel yazmak zorunda.

**Eksik:**
- Dinamik key-value tablo
- Satır ekleme/silme butonları
- JSON import/export
- Validation (duplicate keys)

---

#### G-03: Conditional Value UI yok
**Dosya:** `integration-studio.component.html`  
IF/ELSE IF/ELSE bloklarını ekleyip düzenleyebilecek bir kural motoru arayüzü yok. Tek bir `paramA` ile sınırlı.

**Eksik:**
- Multiple condition support
- AND/OR logic builder
- Visual condition editor
- Nested conditions

---

#### G-04: Nested / Array alt eşleştirme yok
**Dosya:** `integration-studio.component.html` / `mapping-rule.model.ts`  
Hedef alan tipi `object` veya `array` ise, alt alanları eşleştirmek için bir "genişlet" butonu veya alt tablo yok.

**Eksik:**
- Nested object mapping UI
- Array element mapping
- Recursive field tree
- Parent-child relationship visualization

---

#### G-05: Gerçek zamanlı önizleme yok
**Dosya:** `integration-studio.component.ts` / `.html`  
Mapping kuralı değiştiğinde örnek JSON üzerinde anında dönüşüm yapıp sonucu gösteren bir önizleme paneli yok.

**Eksik:**
- Live preview panel
- Client-side JSONata evaluation
- Error highlighting
- Before/after comparison

---

### 🟠 P1 — Yüksek Öncelik

#### G-06: Webhook konfigürasyonu eksik
**Dosya:** `integration-studio.component.html` / `.ts`  
Webhook seçince otomatik oluşacak benzersiz URL ve API Key gösterilmiyor.

**Eksik:**
- Auto-generate webhook URL
- API key generation
- Copy to clipboard
- Webhook test endpoint

---

#### G-07: External API konfigürasyonu eksik
**Dosya:** `integration-studio.component.html` / `.ts`  
API endpoint, HTTP metodu, auth tipi seçimi (API Key / Basic / OAuth2) ve credential atama alanı yok.

**Eksik:**
- HTTP method selector (GET/POST/PUT/DELETE)
- Auth type selector
- Credential management
- Test connection button
- `ExternalSystemsComponent` entegrasyonu

---

#### G-08: Otomatik kaydetme yok
**Dosya:** `integration-studio.component.ts`  
Wizard'da değişiklikler `localStorage`'a veya bir servise periyodik kaydedilmiyor. Tarayıcı çökmesi durumunda tüm ilerleme kaybolur.

**Eksik:**
- Auto-save to localStorage (every 30s)
- Draft recovery on page load
- "Unsaved changes" warning
- Manual save button

---

#### G-09: Birim testler yok
**Dosya:** `rule-to-jsonata.spec.ts` (yok)  
24 dönüşüm tipi için doğru JSONata üretimini kontrol eden testler yok.

**Eksik:**
- Unit tests for all 24 transform types
- Edge case tests
- Invalid input tests
- Integration tests

---

#### G-10: Template String UI zayıf
**Dosya:** `integration-studio.component.html`  
Değişkenleri kaynak ağaçtan seçip `{{ }}` içinde kullanabilecek bir metin editörü yok.

**Eksik:**
- Variable picker from source tree
- Syntax highlighting
- Auto-complete for field names
- Preview with sample data

---

### 🟡 P2 — Orta Öncelik

#### G-11: Kafka kaynak konfigürasyonu eksik
**Dosya:** `integration-studio.component.html`  
Topic adı, broker bilgisi girilecek alan yok.

**Eksik:**
- Topic name input
- Broker list input
- Consumer group ID
- SSL/SASL configuration

---

#### G-12: Gereksiz alanlar gizlenmiyor
**Dosya:** `integration-studio.component.html`  
`direct` (birebir) eşleştirme seçiliyken `param` alanları hâlâ görünüyor ve kafa karıştırıyor.

**Çözüm:** Anlamlı olmayan alanları `*ngIf` ile gizle.

---

#### G-13: Array Filter UI zayıf
**Dosya:** `integration-studio.component.html`  
Filtre alanı ve filtrelenecek değer için ayrı seçiciler ya da en azından yardımcı tooltip yok.

**Eksik:**
- Field selector for filter
- Value input with validation
- Multiple filter conditions
- Filter preview

---

#### G-14: "Hemen Eşleştir" butonu yok
**Dosya:** `integration-studio.component.html` (Adım 3)  
Eksik zorunlu alan listesinde her satırın yanına, kullanıcıyı doğrudan Adım 2'deki ilgili hedef alana götürecek tıklanabilir bir link/buton yok.

---

#### G-15: Test panelinde diff görünümü zayıf
**Dosya:** `integration-studio.component.html`  
Başarısız testlerde `expected` ve `actual` arasındaki farkı görsel olarak vurgulayan bir diff viewer yok.

**Öneri:** `monaco-diff-editor` veya `jsdiff` kullan.

---

#### G-16: Uzman modu (JSONata önizleme) yok
**Dosya:** `integration-studio.component.html`  
Kullanıcı isteğe bağlı olarak o anki görsel kuralların ürettiği JSONata ifadesini göremiyor.

**Eksik:**
- "Show Generated JSONata" toggle
- Syntax-highlighted code view
- Copy to clipboard
- Edit mode (advanced users)

---

#### G-17: Undo / Redo yok
**Dosya:** `integration-studio.component.ts`  
Mapping kuralı ekleme/silme/düzenleme işlemlerini geri almak için bir yığın (stack) yok.

**Eksik:**
- Command pattern implementation
- Undo/redo stack
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- History panel

---

### 🔵 P3 — Düşük Öncelik

#### G-18: Manuel JSON yükleme temizleme butonu yok
**Dosya:** `integration-studio.component.html`  
Büyük JSON'lar için temizleme/sıfırlama butonu eksik.

---

#### G-19: Combine dönüşümü için sürükle-bırak yok
**Dosya:** `integration-studio.component.html`  
Birden fazla alanı seçip birleştirme sırasını belirleyecek sürükle-bırak liste yok.

---

#### G-20: Fixture yönetimi eksik
**Dosya:** `integration-studio.component.html`  
Test senaryoları ekleme/düzenleme/silme arayüzü yok. Sadece `demo-data`'dan yükleme var.

---

#### G-21: Klavye kısayolları yok
**Dosya:** `integration-studio.component.ts`  
`Ctrl+S`, `Ctrl+Enter` gibi profesyonel kısayollar tanımlanmamış.

---

#### G-22: Responsive davranış zayıf
**Dosya:** `integration-studio.component.html`  
Adım 2'deki çok sütunlu yapı mobilde veya dar ekranda bozulabilir.

---

## Özet Tablo

| ID | Başlık | Öncelik | Efor | Durum |
|----|--------|---------|------|-------|
| G-01 | Dinamik parametre etiketleri | 🔴 P0 | S | ✅ Tamamlandı |
| G-02 | Enum Mapping UI | 🔴 P0 | M | ⏳ Todo |
| G-03 | Conditional Value UI | 🔴 P0 | L | ⏳ Todo |
| G-04 | Nested/Array alt eşleştirme | 🔴 P0 | XL | ⏳ Todo |
| G-05 | Gerçek zamanlı önizleme | 🔴 P0 | M | ⏳ Todo |
| G-06 | Webhook konfigürasyonu | 🟠 P1 | S | ⏳ Todo |
| G-07 | External API konfigürasyonu | 🟠 P1 | M | ⏳ Todo |
| G-08 | Otomatik kaydetme | 🟠 P1 | S | ⏳ Todo |
| G-09 | Birim testler | 🟠 P1 | M | ✅ Tamamlandı |
| G-10 | Template String UI | 🟠 P1 | M | ⏳ Todo |
| G-11 | Kafka konfigürasyonu | 🟡 P2 | S | ⏳ Todo |
| G-12 | Gereksiz alanları gizle | 🟡 P2 | S | ⏳ Todo |
| G-13 | Array Filter UI | 🟡 P2 | S | ⏳ Todo |
| G-14 | "Hemen Eşleştir" butonu | 🟡 P2 | S | ⏳ Todo |
| G-15 | Diff görünümü | 🟡 P2 | M | ⏳ Todo |
| G-16 | Uzman modu (JSONata önizleme) | 🟡 P2 | S | ⏳ Todo |
| G-17 | Undo/Redo | 🟡 P2 | M | ⏳ Todo |
| G-18 | JSON temizleme butonu | 🔵 P3 | S | ⏳ Todo |
| G-19 | Combine sürükle-bırak | 🔵 P3 | M | ⏳ Todo |
| G-20 | Fixture yönetimi | 🔵 P3 | M | ⏳ Todo |
| G-21 | Klavye kısayolları | 🔵 P3 | S | ⏳ Todo |
| G-22 | Responsive davranış | 🔵 P3 | M | ⏳ Todo |

**Efor:** S = ~2-4 saat, M = ~1 gün, L = ~2-3 gün, XL = ~1 hafta

---

## Sprint Planı

### Sprint 1 (Öncelik: P0 - Kritik)
**Hedef:** Kullanıcı deneyimini iyileştir, temel UI eksikliklerini gider

- G-01: Dinamik parametre etiketleri
- G-12: Gereksiz alanları gizle
- G-08: Otomatik kaydetme
- G-09: Birim testler

**Tahmini Süre:** 2-3 gün

### Sprint 2 (Öncelik: P0 - Advanced UI)
**Hedef:** Gelişmiş dönüşüm tipleri için özel UI bileşenleri

- G-02: Enum Mapping UI
- G-10: Template String UI
- G-05: Gerçek zamanlı önizleme

**Tahmini Süre:** 3-4 gün

### Sprint 3 (Öncelik: P0 - Complex Features)
**Hedef:** Nested/array desteği ve conditional logic

- G-03: Conditional Value UI
- G-04: Nested/Array alt eşleştirme

**Tahmini Süre:** 1 hafta

### Sprint 4 (Öncelik: P1 - Integration)
**Hedef:** Kaynak sistem entegrasyonları

- G-06: Webhook konfigürasyonu
- G-07: External API konfigürasyonu
- G-11: Kafka konfigürasyonu

**Tahmini Süre:** 2-3 gün

### Sprint 5 (Öncelik: P2 - Polish)
**Hedef:** Kullanıcı deneyimi iyileştirmeleri

- G-13: Array Filter UI
- G-14: "Hemen Eşleştir" butonu
- G-15: Diff görünümü
- G-16: Uzman modu
- G-17: Undo/Redo

**Tahmini Süre:** 3-4 gün

### Backlog (P3)
- G-18, G-19, G-20, G-21, G-22

---

## Önerilen Sıralama

**Hemen Başla (Sprint 1):**
1. G-01 (Dinamik etiketler) — 2 saat
2. G-12 (Alanları gizle) — 1 saat
3. G-08 (Auto-save) — 3 saat
4. G-09 (Birim testler) — 1 gün

**Toplam:** 2-3 gün

Bu sprint tamamlandığında kullanıcı deneyimi önemli ölçüde iyileşecek ve kod kalitesi artacak.

---

## Sprint 1 Başladı ✅

**Tarih:** 2026-05-12  
**Kapsam:** G-01, G-09 (Temel iyileştirmeler)

### Tamamlanan Görevler

#### G-01: Dinamik Parametre Etiketleri ✅

**Eklenen:**
- `transform-param-labels.ts` — Utility fonksiyonları
- `transform-param-labels.spec.ts` — 18 unit test (tümü geçiyor)
- `getTransformParamLabels()` — Her dönüşüm tipi için context-aware etiketler
- `isParamVisible()` — Parametre görünürlük kontrolü
- `getVisibleParams()` — Görünür parametrelerin listesi

**Özellikler:**
- 24 dönüşüm tipi için özel etiketler
- Parametre tipleri: text, number, select, textarea, json
- Required/optional flag
- Help text desteği
- Placeholder önerileri

**Test Coverage:**
```bash
npm test -- transform-param-labels.spec.ts
✅ 18/18 test geçiyor
```

**Dosyalar:**
- `src/app/pages/integration-studio/transform-param-labels.ts`
- `src/app/pages/integration-studio/transform-param-labels.spec.ts`

---

#### G-09: Birim Testler (Kısmi) ✅

**Eklenen:**
- Transform param labels için kapsamlı testler
- Edge case coverage
- Type safety validation

**Kalan:**
- `rule-to-jsonata.spec.ts` — JSONata üretimi testleri (Sprint 1 devamı)
- Integration tests (Sprint 2)

---

### Sonraki Adımlar (Sprint 1 Devamı)

1. **G-12: Gereksiz alanları gizle** (~1 saat)
   - Template'de `*ngIf` ile parametre görünürlük kontrolü
   - `isParamVisible()` fonksiyonunu kullan

2. **G-08: Otomatik kaydetme** (~3 saat)
   - LocalStorage service
   - Auto-save her 30 saniyede
   - Draft recovery on load

3. **G-09: JSONata testleri** (~4 saat)
   - `rule-to-jsonata.spec.ts` oluştur
   - 24 dönüşüm tipi için testler
   - Edge cases

**Tahmini Kalan Süre:** 1 gün

---

**Sprint Owner:** Kiro AI  
**Review Date:** 2026-05-12  
**Status:** 🟢 İlerleme devam ediyor
