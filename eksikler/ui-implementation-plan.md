# UI Eksik Implementasyon Planı

> Kaynak: `ui_eksikler.md`  
> Tarih: 12 Mayıs 2026  
> Durum analizi sonrası gerçekten eksik olan maddeler

---

## Mevcut Durum Özeti

Servisler/componentler var ama bağlantıları kurulmamış:
- `AutoSaveService` → mevcut ama `integration-studio`'ya bağlı değil
- `UndoRedoService` → mevcut ama `integration-studio`'ya bağlı değil
- `EmptyStateComponent` → mevcut ama `mappings` ve `partners` sayfalarında kullanılmıyor

---

## [ ] Madde 1 — Auto-save wiring (integration-studio)

**Dosyalar:** `integration-studio.component.ts`

- `AutoSaveService` inject et
- Kural listesi (`rules` sinyali) her değiştiğinde `registerAutoSave('studio-wizard', rules)` çağır
- `ngOnInit`'te `hasAutoSave('studio-wizard')` kontrol et → veri varsa `AutoSaveRestoreDialog` göster
- Wizard tamamlandığında / publish adımında `clearAutoSave('studio-wizard')` çağır

---

## [ ] Madde 2 — Undo/Redo wiring (integration-studio)

**Dosyalar:** `integration-studio.component.ts`

- `UndoRedoService<MappingRule[]>` inject et
- Kural ekleme (`addRule`), silme (`removeRule`), güncelleme (`updateRule`) her çağrıldığında `pushState(rules)` çağır
- `Ctrl+Z` → `undo()`, rules sinyalini dönen state ile güncelle
- `Ctrl+Y` / `Ctrl+Shift+Z` → `redo()`, aynı şekilde
- `canUndo` / `canRedo` sinyallerini toolbar butonlarına bağla

---

## [ ] Madde 3 — Empty state (Mappings ve Partners sayfaları)

**Dosyalar:**
- `mappings.component.ts` + `mappings.component.html`
- `partners.component.ts` + `partners.component.html`

- `EmptyStateComponent` her iki component'e import et
- `filtered()` sinyali boş array döndürdüğünde tablo yerine `<app-empty-state>` göster
- Mappings: "Henüz bir mapping yok" mesajı + "Yeni Mapping Oluştur" butonu
- Partners: "Henüz partner yok" mesajı + "Partner Ekle" butonu

---

## [ ] Madde 4 — MappingApiService + backend bağlantısı

**Dosyalar:**
- `src/app/core/services/mapping-api.service.ts` → yeni dosya
- `integration-studio.component.ts`

- `MappingApiService` oluştur: `HttpClient` ile `/api/mappings` CRUD endpoint'leri
  - `list(): Observable<MappingVersion[]>`
  - `get(id): Observable<MappingVersion>`
  - `create(payload): Observable<MappingVersion>`
  - `update(id, payload): Observable<MappingVersion>`
  - `publish(id): Observable<MappingVersion>`
- Integration-studio `onPublish()` (5. adım) → `create` veya `update` çağır
- Wizard açılırken draft varsa `get` ile yükle (opsiyonel, URL param ile)

---

## [ ] Madde 5 — CSS değişken hatası (`$primaryColor` / `var(--primary-color)`)

**Dosyalar:** `src/styles/_variables.scss`, `src/styles.scss`

- `_variables.scss` içindeki SCSS değişkenlerinin PrimeNG'in `var(--primary-color)` ile karışmaması için
  `$primaryColor` adlı değişken kullanılıyorsa kaldır veya `$brand-primary` olarak bırak
- `integration-studio-shell.scss` içindeki tüm `var(--primary-color)` kullanımları doğru → değişiklik gerekmez
- Gerçek çakışma yoksa bu maddeyi `N/A` işaretle

---
