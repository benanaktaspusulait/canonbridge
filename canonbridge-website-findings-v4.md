# CanonBridge Website — Findings v4

Repo: `benanaktaspusulait/canonbridge` (master) · path: `website/`
Stack: Next.js 16.2.6 (App Router, `output: "standalone"`), React 19, Tailwind v4, framer-motion 12, `proxy.ts` (Next 16 middleware), Playwright + axe-core E2E.
Önceki rapor: `canonbridge-findings-v3.md` (34 madde). Bu rapor sadece **hâlâ açık olan** veya **yeni keşfedilen** sorunları içerir.

> v3'ten **kapanan** sorunlar (kısa doğrulama): output:standalone ✅, Turnstile siteverify ✅, brand-tokens senkron + CI `tokens:check` ✅, `<html lang>` SSR-doğru ✅, `next/font/local` (canon-sans/mono) yüklü ✅, component-gallery `proxy.ts` env gate'i ✅, `MotionConfig reducedMotion="user"` ✅, FAQPage JSON-LD ✅, og.png cache-bust `?v=2026-05-21` ✅, mobil CTA `w-full` ✅, Footer submit `disabled` görsel ✅, CSP `connect-src` mailto temizlendi ✅, e2e `/tr` SSR testi ✅.
> v3'te yanlış flagledim: `lucide-react@^1.16.0` aslında geçerli (npm'de gerçek sürüm). Kapat.

---

## A — Critical (SEO/runtime/security)

### A1. Canonical her dil için "/" — `/tr` `/de` `/es` için **yanlış canonical**
`app/layout.tsx`'te:
```ts
alternates: { canonical: "/", languages: { en:"/", tr:"/tr", de:"/de", es:"/es" } }
```
`/[locale]/page.tsx` `generateMetadata` tanımlamadığı için **/tr, /de, /es de canonical=`/`** alıyor → Google bu sayfaları İngilizce sayfanın kopyası sayar, çoğu zaman index dışına atar.
**Düzeltme:** `app/[locale]/page.tsx` içine `generateMetadata({ params })` ekleyip `alternates.canonical = "/" + locale` ver; `languages` map'ine **`x-default: "/"`** ekle.

### A2. Lead webhook rate-limit `Map` instance-local
`app/api/leads/route.ts`:
```ts
const rateLimits = new Map<string, { count, resetAt }>();
```
- `output: "standalone"` + multi-container/HPA → her replica kendi map'ini tutar, gerçek limit ×N olur.
- Cold start / dev HMR'da sıfırlanır.
**Düzeltme:** Redis (Upstash/Cloudflare KV) tabanlı sliding window; veya Cloudflare Turnstile + WAF rate-limit kuralına devret.

### A3. `proxy.ts` matcher `_next/data` ve `api`'yi içeriyor
```ts
matcher: ["/((?!_next/static|_next/image|favicon.ico|images|videos).*)"]
```
- `/api/leads` ve `/api/csp-report` istekleri proxy'den geçiyor → her POST'a `x-canonbridge-locale` ekleniyor (zararsız) ama ekstra cold-start gecikmesi.
- `_next/data` (RSC payload) hariç tutulmamış.
**Düzeltme:** Matcher'a `api` ve `_next/data` ekle: `"/((?!api|_next/static|_next/image|_next/data|favicon.ico|images|videos).*)"`.

### A4. `images.unoptimized: true` + manuel responsive
`next.config.ts`'te tüm `next/image` optimize devre dışı. Hero `<picture>` zaten elle WebP/AVIF veriyor → tutarlı. Ama `Navbar` logosu (`<Image>` 458×100) tek format PNG, mobile'de gereksiz büyüklük.
**Düzeltme:** Ya logo'yu SVG yap (`public/images/logo-canonbridge.svg` zaten var, kullan), ya da WebP varyant ekle. PNG 458×100 her sayfada ~30-50KB.

### A5. `proxy.ts` ile `headers().get("x-canonbridge-locale")` `RootLayout`'ta — root route için sadece "/" yolundan locale çıkmıyor
Proxy `pathname.split("/").filter(Boolean)[0]` döndürüyor; "/" için `undefined` → "en". Doğru. Ama proxy.ts'in **production build'de gerçekten çalışıp çalışmadığı** test edilmemiş. `tests/marketing-site.test.mjs` ve e2e'de header doğrulaması yok.
**Düzeltme:** E2E'ye `/de` SSR HTML'ini fetch edip `<html lang="de">` + `t.nav.requestDemo` Almanca string assertion'ı ekle (şu an sadece `/tr` test ediliyor).

---

## B — High (UX/SEO/a11y)

### B1. `SitePage` tamamen `"use client"` → RSC streaming & code-split yok
`components/SitePage.tsx` "use client" ⇒ Hero, VideoSection×5, Metrics, Scalability, Architecture, Features, UseCases, Footer hepsi tek JS bundle'da client'a gidiyor. İlk yüklemede framer-motion + lucide-react + tüm i18n (4×~12KB JSON) inip parse ediliyor.
**Düzeltme:** `SitePage`'i server component yap; sadece interaktif parçaları (Navbar, Footer form, VideoSection autoplay) `"use client"` bırak. Translation'ı RSC'de prop olarak ver.

### B2. `lib/locales/{tr,de,es}.ts` hepsi her client bundle'a giriyor
`LocaleContext.tsx` 4 dilin tamamını static import ediyor → 4×~12KB i18n payload her sayfada.
**Düzeltme:** RSC'ye taşıdıktan sonra `import("./locales/" + locale)` dinamik import; ya da `app/[locale]/` ağacını route-segment bazlı yap.

### B3. `BreadcrumbList` JSON-LD yok
SitePage'de JSON-LD `@graph` var (Organization, SoftwareApplication, FAQPage) ama BreadcrumbList eksik. v3'te quick-win olarak işaretliydi, hâlâ açık.
**Düzeltme:** SiteLink sub-page olmasa bile en azından `/`, `/tr`, `/de`, `/es` için ItemList faydalı; daha çok `WebSite` + `SearchAction` ekle.

### B4. `viewport` & `themeColor` Next 16 metadata API'sı kullanılmamış
`app/layout.tsx`'te `export const viewport` ve `themeColor` yok → Lighthouse "theme-color missing" + safari address bar default beyaz.
**Düzeltme:**
```ts
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f7faf8" },
               { media: "(prefers-color-scheme: dark)",  color: "#061016" }],
  width: "device-width", initialScale: 1,
};
```

### B5. `og:locale` / `og:locale:alternate` yok
Twitter `summary_large_image`'a `site` ve `creator` da set edilmemiş.
**Düzeltme:** `openGraph.locale`, `localeAlternate: ["tr_TR","de_DE","es_ES"]`, `twitter.site: "@canonbridge"`.

### B6. Mapping Studio hero görseli **hâlâ statik mockup** (v3-B2)
`public/images/canonbridge-mapping-studio.png` + 960/1440 avif/webp varyantları → ama gerçek ürün ekran görüntüsü değil, statik tasarım. Status hâlâ "pending".
**Düzeltme:** Gerçek Mapping Studio UI'dan Playwright ile otomatik export (1440×900) → CI'da haftalık yenile.

### B7. VideoSection: `videoRef.play()` `try/catch` yok, kullanıcı etkileşimsiz autoplay
Tarayıcı autoplay policy `muted`-only izin verir, OK; ama `play()` reject olursa sessizce yutuluyor (`.catch(() => {})` var, gizli hata). Reduced-motion + autoplay çakışıyor: `MotionConfig reducedMotion="user"` framer-motion'u durdurur, **HTML5 video'yu durdurmaz**.
**Düzeltme:** `if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;` koşulu ekle.

### B8. Footer mailto fallback CSP'yi atlatıyor ama yine de form-action var
`form-action 'self' mailto:` CSP'de ama `window.location.href = "mailto:..."` form-action'a değil navigate'a düşer. Test edildi mi belirsiz; bazı kurum tarayıcılarında `mailto:` kayıt dışı.
**Düzeltme:** `LEAD_CAPTURE_ENABLED=true` zorunlu yap, mailto branch'ini sil. v3'ten bu yana hem `/api/leads` hem mailto yolu var — ikilik karışıklık.

### B9. `sitemap.ts` `lastModified` hardcoded `2026-05-21`
Her build'de aynı tarih. Crawl bütçesi açısından `new Date()` veya git commit timestamp'ı daha doğru.

### B10. `robots.ts` AI/scraper bot'larını disallow etmiyor (kararsız)
GPTBot / ClaudeBot / CCBot / PerplexityBot için tutum belirsiz. İçeriği LLM'lere açmak istemiyorsanız ekleyin; istiyorsanız "izinli" olarak işaretleyin.

### B11. Honeypot `<div className="hidden">` — bazı bot'lar Tailwind'i çözüyor
`display:none` modern spam bot'ların büyük kısmı tarafından atlanıyor. **Time-trap** (`elapsedMs < 1500`) zaten var, iyi; ama honeypot'u `position:absolute; left:-9999px; aria-hidden` yap, `tabindex=-1` zaten var.

---

## C — Medium (kod kalitesi / tasarım)

### C1. Tailwind sınıflarında 60+ `text-navy-700/50`, `bg-white/[0.72]`, `border-navy-900/10` (v3-C1 hâlâ açık)
`@theme`'de `navy-*` ve `accent-*` semantic değil renk-eşleme. Yarın brand değişirse her component dolaşılmalı.
**Düzeltme:** `--cb-text-muted`, `--cb-surface-overlay`, `--cb-border-subtle` gibi semantic token'lar tanımla, sınıfları `text-text-muted` vb. yap.

### C2. Hero `gradient-bg` `globals.css`'te hardcoded `rgba(43,154,144,0.16)` ve `#f7faf8/#edf4f1/#dbe8e2`
`--cb-color-brand-*` ve `--cb-color-cloud-*` token'lar varken kullanılmıyor.

### C3. `Footer.tsx` 305 satır — form, JSON-LD, footer bottom, mailto fallback tek dosyada
**Düzeltme:** `components/footer/LeadForm.tsx`, `FooterBottom.tsx` olarak ayır.

### C4. `LocaleContext.setLocale` `window.history.pushState` — Next route cache invalidate edilmiyor
URL değişiyor ama `router.refresh()` çağrılmıyor → SSR HTML hâlâ eski locale'de, yalnız client re-render. Geri-ileri butonunda kafa karışıklığı.
**Düzeltme:** `next/navigation`'ın `useRouter().push("/" + locale)` kullan.

### C5. Locale switch `?lang=` query param ve `localStorage` desteklemiyor
v3-C8 hâlâ; ama kompleksite azalmış, kabul edilebilir. Sadece doc'a yaz.

### C6. `e2e/home.spec.ts` axe sadece `<main>` içeriyor → Navbar (lang menüsü, mobile toggle) test dışı
Navbar'da `aria-expanded`, `aria-controls`, `role="menu"` kontrol edilmiyor.

### C7. `e2e` mobil viewport sadece Pixel 7 → tablet (iPad) test yok
LCP/CLS metric assertion'ı yok (`page.evaluate(() => performance.getEntriesByType('largest-contentful-paint'))`).

### C8. `tests/marketing-site.test.mjs` `node --test` static server'da çalışıyor — SSR olmayan HTML üzerinde test → `<html lang="tr">` kontrolü yapılamaz
Sadece Playwright SSR'ı doğruluyor; node test sadece static HTML diff'ini görür.

### C9. `next.config.ts` `Content-Security-Policy` her route'a uygulanıyor ama `/api/csp-report`'a da → kendi report'unu CSP'leme
Etkisi yok ama `source: "/((?!api/csp-report).*)"` daha temiz.

### C10. `report-to` header'ı eski API; `Reporting-Endpoints` (Chrome 96+) tercih edilmeli
```
Reporting-Endpoints: canonbridge-csp="/api/csp-report"
```
CSP'de de `report-to canonbridge-csp` ile eşleşir. Eski `Report-To` JSON'u Safari/Firefox tarafından zaten desteklenmiyor.

### C11. CSP `script-src 'unsafe-inline'` — Next inline script (RSC payload) için zorunlu ama nonce kullanılmamış
**Düzeltme:** Next 15+ `next.config.experimental.nonce` veya middleware'de per-request nonce; uzun vadeli iş.

### C12. `app/component-gallery/page.tsx` `metadata.robots` yok (layout'ta var)
Robots layout'tan inherit eder, OK; ama `noindex,nofollow` çift güvence için `page.tsx` `metadata` da set edilebilir. `robots.ts` zaten disallow ediyor — overlap.

### C13. `public/images/canonbridge-og.svg` var ama nereden referans alınıyor belli değil
Twitter/Facebook SVG'yi zaten kabul etmez. Ya sil, ya canonical og için PNG'nin source'u olarak `README`'de açıkla.

### C14. `Hero.tsx` `<img>` direkt — `loading="lazy"` ve `decoding="async"` yok
Hero LCP element'i lazy yapılmamalı (eager doğru) ama `decoding="async"` ve `fetchpriority="high"` eklenmeli.

---

## D — Low (polish)

### D1. `lucide-react@^1.16.0` doğru (npm latest=1.16.0). v3'teki uyarı yanlıştı, **kapat**.

### D2. `public/images/logo-canonbridge.svg` var, kullanılmıyor — Navbar PNG kullanıyor (A4 ile aynı).

### D3. `app/fonts/canon-sans.woff2` + `canon-mono.woff2` `preload` `display: swap` set; **subset/unicode-range yok** → tam glyph set indiriyor. Türkçe + İspanyolca diakritik için latin-ext yeter.

### D4. `app/layout.tsx`'te `applicationName` set, ama `manifest.json` (PWA) yok → "Add to home screen" bozuk.

### D5. `security.txt` eksik (`/.well-known/security.txt`). `SECURITY.md` repo root'ta var ama site servis etmiyor.

### D6. `app/page.tsx` ve `app/[locale]/page.tsx` ikisi de `<SitePage />` çağırıyor (v3-C7) — kabul edilebilir ama `SitePage`'i tek route'a bağlayıp diğerinde sadece `<SitePage locale={...} />` prop'lamak daha temiz.

### D7. `Permissions-Policy` `interest-cohort=()` eksik (FLoC opt-out).

### D8. `X-DNS-Prefetch-Control: on` yok.

---

## E — Quick Wins (≤30 dk · 1 commit)

1. **A1**: `app/[locale]/page.tsx`'e `generateMetadata` ile per-locale canonical.
2. **B4**: `viewport` + `themeColor` export.
3. **B5**: `og:locale` + `og:locale:alternate` + `twitter.site`.
4. **B9**: `sitemap.ts` `lastModified: new Date()`.
5. **A3**: `proxy.ts` matcher'a `api` ve `_next/data` ekle.
6. **C10**: `Report-To` → `Reporting-Endpoints`.
7. **D3**: Font subset (`subset: "latin-ext"` `localFont`'ta yok ama variants'la elle yapılabilir).
8. **C14**: Hero `<img fetchpriority="high" decoding="async">`.

---

## F — Priority Roadmap

| Sıra | Madde | Etki |
|---|---|---|
| 1 | A1 (canonical per locale) | SEO duplicate-content bug |
| 2 | B1+B2 (RSC ayrımı + lazy i18n) | LCP/TBT iyileşmesi |
| 3 | A2 (Redis rate-limit) | Multi-replica güvenlik |
| 4 | B3+B5+B9 (JSON-LD + og:locale + sitemap date) | SEO completeness |
| 5 | B6 (gerçek Mapping Studio screenshot) | Hero güvenilirlik |
| 6 | B7 (video reduced-motion) | A11y |
| 7 | C1+C2 (semantic tokens) | Maintainability |
| 8 | C6+C7 (axe Navbar + LCP test) | QA coverage |
| 9 | C11 (CSP nonce) | Security hardening |

---

## v3 → v4 delta
- **Kapanan:** 13 (A1, A2, A3, A4, A5, A6, B1, B3, B6, B8, B10, D1, D2-kısmi)
- **Hâlâ açık:** 21 (yukarıda A1–D8 listelendi, bazıları yeni keşif)
- **Yeni keşif:** A1 canonical, A3 matcher, B1/B2 RSC, B4 viewport, B5 og:locale, B7 video+RM, C10 Reporting-Endpoints

