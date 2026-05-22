# CanonBridge Mapping Studio UI — Findings v2

Repo: `benanaktaspusulait/canonbridge` (master) · path: `mapping-studio-ui/`
Stack: Angular 21.2, PrimeNG 21.1 (Aura preset + `definePreset` teal ramp), PrimeFlex 4, signals, standalone components, lazy routes, Vitest 4 + jsdom 28, runtime `env.js` via Nginx, dark-mode via `.dark-mode` class on `<html>`.
Önceki rapor: `canonbridge-mapping-studio-ui-findings.md` (38 madde).

> **v1 → v2 — kapanan sorunlar (doğrulandı):**
> ✅ A1 (Google Fonts: Manrope + Space Grotesk + JetBrains Mono `index.html`'de preconnect + stylesheet ile yüklü)
> ✅ A3 (PrimeNG `Aura` `definePreset` ile **teal** ramp → brand-tuned, `darkModeSelector: '.dark-mode'`)
> ✅ A6 (`styles/_accessibility.scss` mevcut ve `@use` ediliyor)
> ✅ A7 (dark-mode tema servisi `signal`, system listener `addEventListener` — v1-C12 fix; `100dvh` wizard'da kullanılmış)
> ✅ B8 (logo `canonbridge-logo.svg` — sidebar SVG kullanıyor)
> ✅ B11/B12 (dashboard i18n: `public/i18n/{en,tr}.json` ile pipe tabanlı çeviri)
> ✅ D1 (favicon SVG + 32×32 PNG + apple-touch + manifest.webmanifest)
> ✅ D2 (`<meta name="theme-color" content="#0f766e">`)
> ✅ D3 (`<meta name="description">`)
> ✅ D4 (`<noscript>` fallback)
> ✅ Inline dark-mode flash-prevention script
> ✅ i18n `?lang=tr` query + `localStorage` + `navigator.language` desteği

---

## A — Critical (brand/dark-mode/security/perf)

### A1. Topbar avatar gradient hardcoded **mor** (`#5b21b6`) — teal brand ile çakışıyor
`src/app/layout/topbar/topbar.component.scss:34`:
```scss
:host ::ng-deep .layout-avatar {
  background: linear-gradient(145deg, var(--primary-color), #5b21b6) !important;
}
```
Brand teal → mor geçişi tutarsız. PrimeNG `--primary-700` veya `--cb-color-violet-600` (token sistemde var) kullanılmalı.

### A2. Mapping Wizard header gradient **mavi** (`#2563eb`) fallback — yine brand dışı
`mapping-wizard.component.scss:6`:
```scss
background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-800, #2563eb) 100%);
```
`--primary-800` Aura tarafından zaten set (teal-800). Hardcoded fallback hiç tetiklenmemeli ama set edilmemiş; fallback olarak `var(--cb-color-brand-800)` yaz.

### A3. Sidebar `--sidebar-bg: #f8fafc`, `--sidebar-bg-2: #eef4fb`, `--sidebar-text: #0f172a` hardcoded
`sidebar.component.scss:1-13`. PrimeNG Aura semantic token'ları (`--surface-50`, `--surface-100`, `--text-color`) yerine slate hex. Dark mode bloğu da hardcoded (`#070b12`, `#101722`, `#f8fafc`). Brand teal değişirse sidebar takip etmez.

### A4. Dark mode sidebar **aktif item beyaz** + ikon teal — kontrast/anlam tersi
```scss
html.dark-mode .layout-sidebar {
  --sidebar-active-bg: #f8fafc;   /* beyaz */
  --sidebar-active-text: #0f172a; /* siyah */
  --sidebar-active-icon: var(--primary-color, #0f766e);
}
```
Light mode'da aktif = teal arka plan + beyaz yazı; dark mode'da aktif = beyaz arka plan + siyah yazı. Marka renginin "aktif" anlamı kaybolur, kullanıcı pattern öğrenmez.
**Düzeltme:** Dark mode'da da `--sidebar-active-bg` brand teal kalsın, text beyaz.

### A5. Nginx CSP **çok gevşek** — XSS koruması yok
`nginx.conf:38`:
```
Content-Security-Policy: "default-src 'self' http: https: data: blob: 'unsafe-inline'"
```
- `'unsafe-inline'` script ve style için → XSS koruması sıfır.
- `default-src http:` → herhangi bir HTTP origin yüklenebiliyor (mixed-content).
- `script-src` ayrımı yok → `env.js` zaten 'self', diğerlerine kapatılabilir.
**Düzeltme:** Sıkı CSP — `script-src 'self'`, `style-src 'self' 'unsafe-inline'` (PrimeNG inline style için), `connect-src 'self' https://api...`, `font-src 'self' https://fonts.gstatic.com`, nonce'lu inline script.

### A6. **40** `::ng-deep` kullanımı (v1-A7 hâlâ büyük ölçüde açık)
Sayım:
```
$ grep -rn "::ng-deep" src/app | wc -l
40
```
Konumlar: `topbar`, `login`, `dlq`, `external-systems`, `integration-studio/{jsonata-preview,nested-mapping}`, `mapping-wizard`, `auto-save-restore-dialog`. `::ng-deep` deprecated; Angular bir gün kaldırırsa tüm bu stiller patlar. Çoğu **PrimeNG dahili sınıf** (`.p-toolbar`, `.p-select`, `.p-card-body`, `.p-datatable .p-datatable-tbody`) — `definePreset` ile component-level token override'a taşınmalı.

### A7. Initial bundle budget **1.45MB warning / 1.75MB error** — çok yüksek
`angular.json` budgets. Gerçek bundle muhtemelen 1.2-1.5MB (Angular 21 + PrimeNG 21 + PrimeFlex + highlight.js + jsonata + ajv). Lighthouse mobil score için ölümcül.
**Düzeltme:** `highlight.js` lazy import (`await import('highlight.js')`), `jsonata` worker'a taşı, PrimeFlex'i tamamen kullanmıyorsan sil (Tailwind v4'e benzer). Hedef: <600KB initial.

### A8. Google Fonts render-blocking
`index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```
5 ağırlık × 3 aile = 11 font request. Render-blocking stylesheet → FCP gecikir.
**Düzeltme:** `media="print" onload="this.media='all'"` swap; veya fontları `public/fonts/` altına self-host edip `@font-face` ile sun (CSP'yi de basitleştirir).

---

## B — High (UX / a11y / tutarsızlık)

### B1. Sidebar **fixed 280px**, mobil/tablet breakpoint yok
`sidebar.component.scss`'te `position: fixed; width: 280px`. `@media (max-width: 768px)` için "drawer mode" veya `.layout-sidebar-collapsed` toggle yok — küçük ekranda içerik altında kalıyor. Topbar `toggleSidebar` butonu var ama gerçek responsive geçiş yok.

### B2. Login `::ng-deep .login-card.p-card` → tema değişimi PrimeNG güncellemesinde kırılır
`login.component.scss:123,130`. `p-card`'ın iç DOM'una bağımlı.

### B3. `auto-save-restore-dialog.component.ts:80` inline `::ng-deep .p-dialog-footer`
Component template `styles:` array'inde `::ng-deep` — Angular 21 standalone'da `ViewEncapsulation.None` daha temiz alternatif.

### B4. `jsonata-preview-panel`: `::ng-deep .p-card-body` + `.p-card-footer`
Aynı pattern. PrimeNG `panel` veya `definePreset` ile `card.colorScheme.light.body` override.

### B5. `nested-mapping-dialog`: `::ng-deep .p-datatable .p-datatable-tbody > tr > td`
Tablo cell padding'i override. PrimeNG `table.colorScheme.*.bodyCell.padding` semantic token kullanılmalı.

### B6. Mapping Wizard `1217` satır TypeScript + `225` satır SCSS + `140` satır HTML — tek dosya
`src/app/pages/mapping-wizard/mapping-wizard.component.ts` 1217 satır → test edilebilir değil, code review yapılamaz. Step bazlı child component'lere (zaten `steps/` klasörü var) parçalanmalı; orchestrator slim olmalı.

### B7. Wizard hero `<h1>` üstünde `!important × 6` (`color: #ffffff !important;`)
Specificity savaşı belirtisi. `:host` + token kullanırsan `!important` gerekmez.

### B8. Sidebar `(click)="toggleSection(...)"` `<div>` üzerinde — `role="button"` yok, keyboard erişimi yok
```html
<div class="layout-nav-section-title" (click)="toggleSection(group.labelKey)">
```
v1-B4 hâlâ açık. `<button>` veya `role="button" tabindex="0" (keydown.enter) (keydown.space)` gerek.

### B9. Sidebar nav item `aria-current="page"` ama `routerLinkActiveOptions: { exact: true }` → child route'lar (`/schemas/:id`) parent'i aktif göstermiyor
Schema detail açıkken sidebar "Schemas" inactive görünür. `exact: false` veya manuel kontrol.

### B10. `<img alt="">` sidebar logo — boş alt OK (decorative) ama `<span aria-hidden>` zaten sarmaladığı için doğru. Sadece `aria-label="CanonBridge Mapping Studio"` brand'a bağlanmalı.

### B11. highlight.js dark-mode override `#0d1117/#c9d1d9` hardcoded (`styles.scss:9-13`)
GitHub dark token'ları; brand'la ilgisi yok. `--cb-color-ink-950` ve `--cb-color-cloud-100` ile değiştir.

### B12. `prefers-reduced-motion` global handling yok
PrimeNG `Aura` ripple açık (`ripple: true`), reduced-motion'da kapanmıyor. `app.config.ts`'te:
```ts
ripple: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

### B13. Topbar `Toolbar` `border-radius: 0 !important;`
Tasarım kararı OK ama `!important` sinyali — PrimeNG token ile override edilebilir (`toolbar.borderRadius: 0`).

### B14. `app.ts` template `<router-outlet />` — hata sınırı (error boundary) yok
Component crash'inde tüm uygulama beyaz ekran. `RouterModule.provideErrorHandler` veya custom `ErrorHandler` provider.

### B15. `noscript` mesajı sadece İngilizce
i18n çekirdek değer önerisi olduğu için `<noscript>` çok dilli olmasa da olur ama brand link/email eklenmeli.

---

## C — Medium (kod kalitesi / build / DX)

### C1. `"lint": "echo \"No Angular lint target configured\""` — **lint yok**
package.json:21. ESLint yapılandırılmamış. Standalone component import order'ı, unused signals, `any` kullanımı denetlenmiyor.
**Düzeltme:** `ng add @angular-eslint/schematics` + `@typescript-eslint/strict`.

### C2. `vitest` ile Angular — `@analogjs/vitest-angular` veya custom setup gerekli; mevcut config görünmüyor
`devDependencies: vitest@^4, jsdom@^28` ama `vitest.config.ts` yok (görmedim). Test çalışıyor mu CI'da?

### C3. `provideAppInitializer` 2 ayrı çağrı (Theme + i18n) — paralel başlatma yok
Sırayla çalışır. `forkJoin`/`Promise.all` ile paralel edilebilir; i18n HTTP fetch'i theme'i bloklamamalı.

### C4. `I18nService.init` `navigator.language` SSR güvenli değil (Angular Universal eklenirse patlar)
Şu an SPA olduğu için sorun yok; ama `DOCUMENT` inject ediyor — tutarlı olmak için `window` ve `localStorage` da `inject(DOCUMENT).defaultView` üzerinden.

### C5. i18n flatten her init'te yeniden çalışıyor; cache yok
Dil değişiminde HTTP + flatten her seferinde. `Map<LangId, FlatRecord>` cache.

### C6. `proxy.conf.json` — sadece dev. Production CORS davranışı belirsiz.
**Düzeltme:** README'de production API base URL ve CORS politikası dokümante.

### C7. Runtime `env.js` global `window.__env` (varsayım) — TypeScript tip yok
`<script src="env.js"></script>` index.html'de ama TS tarafında `declare global { interface Window { __env: ... } }` yok (v1-D5).

### C8. `manifest.webmanifest` — `display: standalone`, `start_url`, ikon set kontrolü yapılmadı
PWA install butonu Chrome'da görünmüyorsa eksik field vardır.

### C9. `tsconfig.app.json` `strict` modu açık mı? Kontrol edilmedi.
Standalone bir Angular 21 projesi için `strict: true`, `strictTemplates: true`, `noImplicitAny: true` zorunlu.

### C10. `KeyboardShortcutsDialog` global olarak `app-root`'ta — modal açıkken background scroll engellenmiş mi?
PrimeNG `p-dialog`'un `modal=true` davranışı doğru ama özel implementation'sa kontrol et.

### C11. SCSS `_variables.scss` kullanılıyor mu? `@theme`'e geçiş yapılmadı (Angular = Tailwind değil, normal)
`_variables.scss`'in CSS variable'lar yerine SCSS `$var` ise dark-mode runtime switch'i bozar. `:root` ve `html.dark-mode` CSS variable'ları doğru pattern.

### C12. `outputHashing: "all"` prod'da OK; ama service worker / cache invalidation stratejisi yok
SPA → tarayıcı eski `index.html`'i cache'lerse yeni bundle'a hiç gitmez. Nginx `index.html` için `Cache-Control: no-cache`.

### C13. Sidebar `radial-gradient(... rgba(45, 212, 191, 0.16) ...)` hardcoded teal-300 rgba
Token kullanılabilir: `color-mix(in srgb, var(--primary-300) 16%, transparent)`.

### C14. Topbar `user-menu-trigger` `<button>` (iyi), ama dropdown menü erişilebilirliği (aria-haspopup, focus-trap) doğrulanmadı
Listede yok ama mention.

---

## D — Low (polish)

### D1. `lint` script `echo` placeholder — CI'da yanlış "pass" verir
`exit 1` koymak veya gerçek lint kur.

### D2. `start` script `--open` flag dev'de tarayıcıyı açıyor — CI'da çalışırsa hata
`start` kullanıcı için, sorun değil; ama CI'da `start:prod` kullanılıyorsa kontrol.

### D3. `i18n` sadece **en + tr** — website 4 dil (en/tr/de/es). Ürün ve marketing site arasında dil-uyumsuzluğu.

### D4. `index.html` `<title>CanonBridge — Mapping Studio</title>` route-değişimine bağlı değil
`Title` service `i18n.service.ts`'te inject edilmiş ama set kodu görmedim — her sayfada aynı title.

### D5. `<base href="/">` OK ama deploy subpath'e (örn. `/studio/`) yapılırsa build-time değişken gerekli — README'de yok.

### D6. `apple-touch-icon` sadece 180×180 — iPad Pro 192×192, 167×167 boyutları eksik (minor).

### D7. Avatar `width: 2.25rem !important` (3 adet `!important`) — CSS smell, PrimeNG token ile çözülebilir.

### D8. Sidebar `box-shadow: 18px 0 48px rgba(0,0,0,0.42)` dark mode — çok dramatik; UX'te yerinde olabilir ama subjektif.

### D9. `tsconfig.spec.json` jasmine değil, vitest tipleri ekli mi? (kontrol edilmedi)

### D10. `webpack-bundle-analyzer` devDep'te değil ama script'te referans var → `npm run analyze` başarısız olur
`"analyze": "ng build ... && webpack-bundle-analyzer ..."` ama package.json'da yok.

---

## E — Quick Wins (≤30 dk)

1. **A1+A2**: Avatar gradient `#5b21b6` → `var(--cb-color-violet-600)`; wizard `#2563eb` → `var(--cb-color-brand-800)`.
2. **A4**: Dark-mode sidebar active item teal'i koru.
3. **A8**: Google Fonts `media="print" onload"` veya self-host.
4. **B8**: `.layout-nav-section-title` `<div>` → `<button>`.
5. **B9**: `routerLinkActiveOptions.exact: false` parent route'lar için.
6. **B12**: Ripple reduced-motion guard.
7. **C1**: `ng add @angular-eslint/schematics`.
8. **C7**: `declare global { interface Window { __env: {...} } }`.
9. **D10**: `webpack-bundle-analyzer` devDep'e ekle veya script'i sil.
10. **B11**: `highlight.js` hex'lerini token'la.

---

## F — Priority Roadmap

| Sıra | Madde | Etki |
|---|---|---|
| 1 | A5 (Nginx CSP sertleştirme) | Security — XSS surface |
| 2 | A6 (`::ng-deep` → `definePreset` migration) | Maintainability, Angular future-proof |
| 3 | A7 (bundle <600KB) | Performance — mobile LCP |
| 4 | A1+A2+A4 (brand consistency) | Tasarım birliği |
| 5 | A8 (font loading) | FCP iyileştirmesi |
| 6 | B6 (wizard component split) | DX, test edilebilirlik |
| 7 | B1 (sidebar responsive) | Mobil/tablet UX |
| 8 | A3 (sidebar token'lara geçiş) | Design system |
| 9 | C1+C2 (lint + vitest config doğrula) | CI kalite kapısı |
| 10 | C12 + D4 (index.html no-cache + title service) | Cache + SEO |

---

## v1 → v2 delta
- **Kapanan:** 13 (A1 fonts, A3 Aura preset, A6 accessibility scss, A7 100dvh, B8 logo svg, B11/B12 i18n, C12 theme listener, C11 ?lang, D1-D5 meta/manifest/noscript)
- **Hâlâ açık:** ~22 (özellikle A4–A7 brand+CSP+bundle; B1 responsive; A6 40× ::ng-deep)
- **Yeni keşif:** A1 avatar mor, A2 wizard mavi, A4 dark active inversion, A5 CSP `unsafe-inline`, A7 bundle 1.45MB budget, A8 fonts blocking, B6 wizard 1217 satır, C1 lint yok, C12 index.html cache, D10 analyze script broken
