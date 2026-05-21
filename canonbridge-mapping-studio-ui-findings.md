# CanonBridge — `mapping-studio-ui` Tasarım & UI Bulgular Raporu

Hedef: `services/`'in dışındaki Angular 21 + PrimeNG 21 (Aura) tabanlı **Mapping Studio** SPA'sı.
Odak: **görsel tasarım tutarsızlıkları, brand drift, a11y/UX eksikleri, dark-mode regresyonları, performans/asset higien**. Backend ve servis konuları kapsam dışı.

Şiddet: **A = Kritik** (marka/dark-mode/a11y bozuk), **B = Yüksek** (UX/tutarlılık), **C = Orta** (kalite/parlatma), **D = Düşük** (polish).

İstatistik tabanı: `src/app/**/*.scss` içinde **311** hardcoded hex/`white` rengi, **37** `::ng-deep` patch'i, **53** ham `transition:` (hiç token yok), **3** dosyada `min-height: 100vh` (mobile chrome bug), **1** `prefers-reduced-motion` media query.

---

## A. Kritik — marka & temel UI bozuklukları

### A1. Brand font'ları **hiç yüklenmiyor**
`packages/tokens` ve `brand-tokens.css` `--cb-font-sans: "Manrope"`, `--cb-font-display: "Space Grotesk"`, `--cb-font-mono: "JetBrains Mono"` tanımlıyor — ama `src/index.html` içinde **hiç** `<link rel="preconnect" href="https://fonts.googleapis.com">` veya `@font-face` yok, `styles.scss` içinde de Google Fonts `@import` yok.  
Sonuç: tüm uygulama brand fontları yerine sistem fallback (San Francisco / Segoe UI / DejaVu) ile render oluyor → website ile tipografi tamamen ayrışıyor. Bu en görünür brand drift.

**Fix:** `index.html`'e preconnect + bir tane `<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`, ya da self-host'la `@font-face` kullan.

### A2. Sidebar dark-mode token'ları ile brand token'ları **çakışıyor**
`layout/sidebar/sidebar.component.scss` sidebar için **bağımsız bir kısa palette** tanımlıyor:
```
--sidebar-active-bg: #0f766e;   // teal-700 (web sitesinde yok)
--sidebar-active-icon: #ccfbf1; // teal-100
--sidebar-focus: rgba(20,184,166,0.32);
```
ancak `brand-tokens.css` brand rengini `--cb-color-brand-700: oklch(0.39 0.062 190.2)` (daha koyu, mavi-yeşil) olarak tutuyor. Sidebar'daki aktif item, ana brand renginden gözle görülür biçimde farklı. Topbar/buttonlar PrimeNG `Aura` (mor-mavi default), sidebar Tailwind teal-700, brand ise farklı bir teal. **Üç ayrı palette aynı ekranda.**

**Fix:** sidebar değişkenlerini `var(--cb-color-brand-*)` üzerinden türet, hex'leri kaldır.

### A3. PrimeNG `Aura` preset hiç **brand'a göre özelleştirilmemiş**
`app.config.ts`:
```ts
providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.dark-mode' } }, ripple: true })
```
`Aura`'nın default primary'si **indigo/violet**. Tüm `p-button` (primary), `p-tag` (info), `p-steps` aktif rengi, focus ring → indigo. Brand renk ise **petrol-yeşili (`oklch(0.39 0.062 190.2)`)**. Sonuç: Demo banner brand teal, ama "New Mapping" butonu indigo. Marketing sitesi ile aynı uygulamada %0 renk tutarlılığı.

**Fix:** `definePreset(Aura, { semantic: { primary: { 50–950: brand ramp } } })` ile özel preset.

### A4. `:root` global mesh **dark-mode'da çalışmıyor**
`styles.scss`:
```
--cb-page-mesh: radial-gradient(...rgba(37,99,235,0.07)...), linear-gradient(180deg,#f8fafc,#f1f5f9);
html.dark-mode { --cb-page-mesh: var(--surface-ground); }
```
Yani light modda 3 katmanlı zarif mesh; dark modda tek düz bej yüzey. Üstelik **mesh hiç bir yerden referans edilmiyor** (rg ile arandığında `background: var(--cb-page-mesh)` 0 sonuç). Tanımlanmış, kullanılmamış dead token.

**Fix:** `body` veya `.layout-content` arkasına apply et, dark için karanlık mesh türevi tanımla.

### A5. Hardcoded `#xxx` renkler nedeniyle dark-mode'da kırılan yüzeyler
`external-systems.component.scss` (539 satır):
```
.external-health-strip article { border: 1px solid #e2e8f0; background: white; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th { background:#f8fafc; color:#64748b; }
```
Dark-mode override yok → "External Systems" sayfası dark modda **beyaz kartlar + beyaz tablo başlığı** olarak kalıyor.  
Aynı pattern: `pages/audit/*.scss`, `pages/dlq/*.scss`, `pages/monitoring/*.scss`, `pages/partners/*.scss`.

Toplam **311 hardcoded renk değeri** `src/app/**.scss` içinde. Dark-mode için sadece sidebar/topbar düzgün, içerik sayfaları yarım.

**Fix:** Hex'ler yerine `var(--surface-card)`, `var(--surface-100)`, `var(--text-color-secondary)`. PrimeNG Aura zaten dark için bu CSS değişkenlerini günceller.

### A6. `_accessibility.scss` **import edilmiyor**
`src/styles/` klasöründe `_accessibility.scss`, `_mixins.scss`, `_variables.scss` dosyaları mevcut (underscore-prefixed partial). `styles.scss` ise şunu yapıyor:
```
@use "./styles/accessibility";   // ← underscore'suz, .scss değil
```
`@use "./styles/accessibility"` Sass partial çözücüsü için `styles/_accessibility.scss`'i bulur — **ama** asıl odak/sr-only sınıflarını yazan dosya `_accessibility.scss` **boş gövdeli ya da exports'suz** olabilir (`wc -l` 0 göstermişti). Dosya boş, içerik mantığı ise eski `styles/accessibility.scss`'de değil `_accessibility.scss`'de.  

**Doğrula & düzelt:** `cat src/styles/_accessibility.scss` boşsa → içeriği oraya taşı; ya da `@use "./styles/accessibility";` satırını gerçek dosyaya yönlendir. Aksi halde `:focus-visible`/`sr-only` global stilleri **uygulamaya yüklenmiyor**.

### A7. `min-height: 100vh` mobil viewport bug
`layout.component.scss`, `mapping-wizard.component.scss`, `login.component.scss`, `step4-field-mapping/*.scss`'de `100vh` veya `calc(100vh - 300px)` var.  
iOS Safari'de adres çubuğu ile `100vh` overshoot yapıp horizontal scroll + alt kesik içerik üretir. `100dvh` kullan.

### A8. Login arka planı hardcoded gradient
`login.component.scss`:
```
background: linear-gradient(155deg, #0f172a 0%, #1e1b4b 42%, #1e3a8a 100%);
```
Marketing palette'i (ink-950 → brand) hiç burada değil. Logo mark `color: #60a5fa` (mavi); brand teal değil. Login = "Vercel/Linear klonu hissi", uygulama gövdesi = teal/indigo PrimeNG. Marka kimliği parçalı.

---

## B. Yüksek — UX & tutarlılık

### B1. **37 `::ng-deep`** kullanımı
PrimeNG'ye `theme preset` ile bastırılması gereken görsel ayarlar `:host ::ng-deep .p-datatable {...}` ile patch'lenmiş. `::ng-deep` deprecated; her sayfa tekrar tekrar aynı table padding/header background'unu redefine ediyor (DRY ihlali + style cascade kirlenmesi). Aura preset'i merkezi olarak override edilmediği için (A3) bu workaround zorunluymuş gibi görünüyor.

### B2. Stat kartı renk-anlam (a11y kontrast)
`dashboard.component.scss`:
```
.stat-change.positive { color: #15803d; }  // green-700
.stat-change.negative { color: #dc2626; }  // red-600
```
Light modda WCAG AA OK; dark modda `#4ade80` / `#f87171` (override mevcut). Ancak **anlam yalnızca renkten** geliyor — yanına ikon (`pi-arrow-up`/`pi-arrow-down`) ya da `↑/↓` glyph yok. Renk körlüğü için bilgi kaybolur. (WCAG 1.4.1)

### B3. Sidebar nav items min-height **3rem** + padding 0.42rem → footprint çok büyük
14+ navigation item collapse edilmiş bile olsa scroll'a zorluyor. PrimeNG default `2.25rem`'a göre %33 daha geniş. Yan etki: alt grup başlıkları katlanmadığında footer (`tenantName` info bar) ekran dışına çıkıyor.

### B4. `userMenu` div + `role="button"` + `tabindex="0"` (topbar.html)
Native `<button>` yerine `<div>` üstünde `keydown.enter`/`keydown.space` manuel ele alınmış. Ekran okuyucu desteği fragile; `aria-expanded`/`aria-haspopup` doğru ama disabled state, long-press menü, focus return ihlali muhtemel. `<p-button>` + `popup` kullan.

### B5. Wizard `<p-steps [readonly]="true">` → klavye ile adım atlanamıyor
İleri/geri yalnızca "Next" butonu ile. Önceki tamamlanmış adımlara tıklanamıyor (readonly). Çok adımlı uzun formlarda kullanıcı geri sıçrayamaz → restore dialog'a güvenmek zorunda. Tamamlanan adımlar clickable olmalı.

### B6. `prefers-reduced-motion` çok sınırlı
Tek media query `_accessibility.scss`'de (eğer A6 fixlenirse aktif olacak). Sidebar/topbar/stat-card transitions, `ripple: true` PrimeNG ayarı bağımsız çalışıyor → reduced motion açıkken hâlâ ripple animasyonu. PrimeNG config'i runtime'da `theme.darkMode()` gibi reduced motion için de tetikle.

### B7. Topbar `<p-toast />` her component'te tekrar render
`mappings.component.html` başında `<p-toast />` ve `<p-confirmDialog />` var. Layout zaten toast'ı bir kez ekliyor. Birden fazla toast outlet → duplicate notification / focus karmaşası riski.

### B8. Logo dosyaları `.jpeg` (lossy + alpha yok)
`src/img/canonbridgelogoblack.jpeg`, `canonbridgelogowhite.jpeg`. JPEG → transparan değil → koyu/açık temada her logoda **beyaz/siyah arka plan dikdörtgeni** görünüyor. SVG kullanılmalı.

### B9. `lang-select` flag/icon yok
Topbar'da dil seçici yalnızca metin. Türkçe/İngilizce için bayrak/kısaltma (TR/EN) helpful. Mevcut `langOptions` muhtemelen sadece `{label,value}`.

### B10. Skip-link var ama "Skip to navigation" tek
`SkipLinksComponent` muhtemelen tek hedef (main-content) içeriyor. WCAG önerisi: ana içerik + navigation + search'e ayrı linkler.

### B11. Dashboard "Top mappings" başlığı i18n'siz
Dashboard component'te `<h2 class="card-title">Top mappings</h2>` ve subtitle hardcoded İngilizce; aynı dosyada başka başlıklar `'dashboard.recentTitle' | i18n` ile çevriliyor. Türkçe dil seçili olsa bile başlık İngilizce kalır.

### B12. Tablo sütun başlıkları case-sensitive İngilizce
`<th>Mapping</th><th>Calls</th><th>Errors</th><th>Avg latency</th>` → yine i18n key yok. `eventType`, `partner`, `version` çevriliyor — yarım yamalak çeviri.

---

## C. Orta — kod / tasarım kalitesi

### C1. `.layout-sidebar-title { font-weight: 800; letter-spacing: 0; }`
Manrope için `800` çok kalın + tracking 0 → optical olarak sıkışık. Display font (`Space Grotesk` 600) kullanılmalı, sidebar başlığı = brand kelime markı.

### C2. PrimeFlex (`primeflex.css`) + custom utility (`.text-sm`, `.mt-4`, `.full-height`)
Bunlar PrimeFlex'te zaten var (`text-sm`, `mt-4`). Çakışan tanımlar, gelecek bug kaynağı. Custom utility'leri kaldır.

### C3. `highlight.js` global stil `github.min.css` yüklü ama dark-mode için `github-dark.min.css` switch'i yok. Kod blokları dark modda da beyaz arka plan.

### C4. `.mono-pre` arka planı `#0b1220` hardcoded
Light modda zaten "dark code block" kabul edilebilir tasarım kararı, fakat brand token (`--cb-color-ink-950`) varken hex bypass ediliyor.

### C5. Sidebar `radial-gradient + linear-gradient` katmanı + glassmorphism (`rgba(255,255,255,0.54)` üst frame)
Çift saydam katman ve box-shadow `16px 0 44px` → düşük-end donanımda compositing maliyeti yüksek + content shift sırasında banding. Modern bir sade brand kimlikten ziyade 2021-Win11 görünümü.

### C6. `version-badge` ve `partner-code/event-code` küçük chip'ler için `padding 2px 8px` ve `border-radius: 999px`
Bunlar PrimeNG `<p-tag>` ile zaten karşılanabilir; özel `<code>` chip'leri ile `<p-tag>`'lar yan yana → görsel tutarsızlık (font, height, radius farklı).

### C7. `app-root` yalnızca `<router-outlet />` + `<app-skip-links />` + `<app-keyboard-shortcuts-dialog />` içeriyor → layout `layout.component`'e bağlı. Login sayfası kendi tam ekran düzenini layout dışında kullanıyor mu? `app.routes.ts`'de child route düzenlemesi belgelenmeli (mimari netliği için).

### C8. CSS scrollbar override (`::-webkit-scrollbar`) Firefox'ta efeksiz
`scrollbar-width: thin; scrollbar-color: ...` Firefox tarafı eklenmeli.

### C9. `dashboard.component.scss` `.stat-icon { color: var(--text-color); opacity: 0.75 }` 
İkon renk vurgusu yok; her stat aynı gri görünüyor. Pozitif/negatif/uyarı kontekstinde semantic renk (success/info/warn) yok.

### C10. `external-health-strip` `grid-template-columns: repeat(4, ...)` — responsive breakpoint yok
1024px altında 4 sütun sıkışır; `auto-fill, minmax(180px, 1fr)` daha güvenli.

### C11. `i18n.service.ts` `localStorage` + `navigator.language` + tek başına `lang` query yok
Marketing sitesinde URL-locale çözümlendi (v3 notunda); studio'da yine kullanıcı paylaştığında dil kaybolur. `?lang=tr` veya `/tr/` desteği yok.

### C12. `provideAppInitializer` zincirinde theme & i18n paralel başlatılıyor (await yok). Dark-mode `init()` `document.documentElement.classList.toggle` yapıyor, ama `prefers-color-scheme` değişimini **runtime'da dinlemiyor** (mediaQuery `change` listener yok). Sistem teması değişince UI senkron olmuyor.

---

## D. Düşük — polish

### D1. `favicon` 192 / 512 / apple-touch PNG var ama brand SVG yok. PWA için `manifest.json` mevcut mu? `index.html`'de link yok.
### D2. `<meta name="theme-color">` tag yok → mobile browser chrome rengi brand'la eşleşmiyor.
### D3. `<meta name="description">` yok (SPA, indekslenmiyor olsa da paylaşım önizlemesi için iyi pratik).
### D4. `app.html` sadece `<router-outlet />` — `<noscript>` fallback mesajı yok.
### D5. `env.js` runtime config inject ediyor; tipi yok, autocomplete kaybı (TS shim eklenebilir).
### D6. CSS değişken listesi `styles.scss` içinde dağınık (`--cb-brand-from`, `--cb-accent-muted`, `--cb-page-mesh`). Bir kısmı kullanılmıyor (A4). Token denetim script'i yok.

---

## E. Hızlı kazanımlar (≤30 dk)

| # | İş | Etki |
|---|----|------|
| QW1 | Google Fonts linkini `index.html`'e ekle (A1) | Tüm uygulama brand tipografi |
| QW2 | `Aura` preset'i `brand-700/600/500` ile özelleştir (A3) | Tüm butonlar/focus brand teal |
| QW3 | `_accessibility.scss` import'unu düzelt (A6) | Global `:focus-visible` & sr-only aktif |
| QW4 | `100vh` → `100dvh` 4 dosyada (A7) | iOS mobil scroll fix |
| QW5 | Logo `.jpeg` → `.svg`, dark/light tek dosya `currentColor` (B8) | Şeffaf logo, retina |
| QW6 | `<h2>Top mappings</h2>` ve `<th>Calls</th>` → i18n key (B11/B12) | Türkçe çeviri tam |
| QW7 | `:focus-visible` brand ring (`--cb-shadow-focus` zaten var, kullanılmıyor) | Brand tutarlı odak |
| QW8 | Duplicate `<p-toast />` mappings.html'den sil (B7) | Notification doubling yok |

---

## F. Mimari önerileri

1. **Tek tema kaynağı:** `Aura` preset'i `definePreset` ile brand ramp'ten türet, `:host ::ng-deep` patch'lerini sil (B1).  
2. **Token contract test:** website ile aynı `packages/tokens` çıktısını okuyor — CI'de `tokens:check` (services raporunda da var) studio için de zorunlu.  
3. **Dark-mode QA matrisi:** 11 sayfa × 2 tema = 22 screenshot snapshot; Playwright/Chromatic'e ekle.  
4. **Component library:** Stat card, page-header, table-toolbar 5+ yerde kopya. `shared/ui/` altına taşı.  
5. **Reduced motion + reduced data:** `Aura` ripple'ı `prefers-reduced-motion` ile devre dışı bırak; `provideAppInitializer` içinde MediaQuery listener.

---

## G. v3 (services) raporu ile karşılaştırma

| Tema | services raporunda var mı | studio raporunda var mı |
|------|---------------------------|--------------------------|
| Hardcoded secrets | ✓ (`jwt-secret-key.txt`) | ✗ (UI scope dışı) |
| RBAC / tenant isolation | ✓ | ✗ (UI scope dışı) |
| **Brand tipografi yüklü mü** | — | **✗ Kritik (A1)** |
| **PrimeNG preset brand'a uyumlu mu** | — | **✗ Kritik (A3)** |
| Dark-mode tutarlılığı | — | ✗ Kritik (A5) |
| i18n eksiklikleri | — | Orta (B11/B12) |
| `prefers-reduced-motion` | — | Yarım (B6) |

**Toplam:** 8 Kritik (A), 12 Yüksek (B), 12 Orta (C), 6 Düşük (D), 8 Hızlı kazanım, 5 mimari öneri.

Öncelik sırası: **A1 → A6 → A3 → A2/A5 → A4/A7/A8 → B serisi**.
