# CanonBridge — Bulgular v3

Yalnızca **hatalar ve eksikler** listelenmiştir. v2'de açılan ve hâlâ açık olanlar + son commit (`1bfec8e update lovable bugs`) sonrası ortaya çıkan yeni problemler. Çözülmüş maddeler bu raporda yer almıyor.

Kapsam: `website/` (Next.js 16, Tailwind v4), `packages/tokens`, kök repo dosyaları, `.github/workflows`, `scripts/`. Mapping Studio (Angular) ayrı bir audit konusu, bu rapora dahil edilmedi.

---

## A. Kritik (build / runtime / güvenlik)

### A1. `output: "export"` ile Server Action / API route imkânsız
`website/next.config.ts` hâlâ `output: "export"`. Bu yüzden lead formu `Footer.tsx` içinde client-side `fetch` ile `NEXT_PUBLIC_LEAD_ENDPOINT`'e gidiyor. Sonuç:
- Webhook URL bundle'a gömülüyor → bot/scraper kaynağı doğrudan vurabilir.
- Turnstile token'ı yalnızca DOM'da, sunucuda doğrulanmıyor; honeypot + 1.5s timing dışında bir koruma yok.
- Rate-limit, IP loglama, anti-replay yapılamıyor.

**Aksiyon:** Lead endpoint'i `app/api/lead/route.ts` (veya bir Server Action) ile sunucuya taşı; gerçek sırrı `LEAD_WEBHOOK_URL` (NEXT_PUBLIC olmayan) yap; Turnstile doğrulamasını burada gerçekleştir. Bu, `output: "export"`'tan vazgeçmeyi gerektirir (Cloudflare/Vercel Node adapter veya `output: "standalone"`).

### A2. Lead form: bot/replay/rate-limit koruması zayıf
Sunucu tarafı doğrulama yok. Bir Zod şeması ve Turnstile sunucu doğrulaması (`siteverify`) eklenmeli; ayrıca IP başına dakika başına ≤ N istek limiti (Redis/Cloudflare KV) konmalı.

### A3. Brand token snapshot drift — sessizce bozulmuş
`scripts/sync-website-tokens.mjs --check` çalıştırıldığında **sync dışında**:

```
md5  app/brand-tokens.css                       30772cd9...
md5  packages/tokens/src/index.css              f6e762ad...
size 1308 vs 1201
```

Header satırı kontrol ediliyor ama `app/brand-tokens.css` source'tan farklı içerikte. CI bunu yakalamıyor çünkü hiçbir workflow `tokens:check` çağırmıyor:

```
$ grep -l "tokens:check\|sync-website-tokens" .github/workflows/*.yml
(boş)
```

**Aksiyon:** `npm run tokens:sync` çalıştır + `ci.yml`'a `tokens:check` adımı ekle.

### A4. SSR `<html lang>` her zaman `"en"`
`app/layout.tsx` → `<html lang="en">`. `/tr`, `/de`, `/es` rotaları için bile ilk HTML `en` olarak servis ediliyor; lang ancak client mount'tan sonra `LocaleContext` tarafından güncelleniyor. Sonuçlar:
- Googlebot SSR HTML'i `en` görüyor → çoklu dil SEO bozuk.
- Screen reader, ilk render'da yanlış dil anonsu.
- `hreflang` `alternates` doğru ama `<html>` lang yanlış → Search Console "language mismatch" uyarısı.

**Aksiyon:** `app/[locale]/layout.tsx` oluştur veya kök `layout.tsx`'i `params.locale` ile parametreleştir; `lang={locale}` SSR'da yaz.

### A5. `/tr`, `/de`, `/es` rotaları yalnızca İngilizce içerik render ediyor
`app/[locale]/page.tsx` doğrudan `Home`'u (client `LocaleProvider` ile) çağırıyor. `LocaleProvider` `useState` initializer'ında `resolveInitialLocale()` çağırıyor — ama bu `typeof window === "undefined"` durumunda her zaman `"en"` döndürüyor. Yani:
- SSR HTML `/tr` için bile İngilizce içerik içeriyor.
- Hidrasyon sonrası içerik Türkçeye geçiyor → hydration mismatch riski + flash of wrong language (FOWL).
- Google, `/tr` URL'ini İngilizce olarak indeksliyor.

**Aksiyon:** Locale'i route param'ından sunucuda oku, çevirileri server component'e taşı; `LocaleProvider`'a `initialLocale` prop'u geç.

### A6. CHANGELOG.md hâlâ manuel — release-please devrede değil
`release-please-config.json` var ama `.github/workflows/release-please.yml`'nin gerçek release-please action'ını koştuğu doğrulanmalı; `CHANGELOG.md`'nin son commit'lerle paralel akmadığı görülüyor.

---

## B. Yüksek (UX / SEO / erişilebilirlik)

### B1. Font'lar hâlâ `next/font` ile yüklenmiyor
`grep -r "next/font" website/` → 0 sonuç. `--cb-font-sans: "Manrope"` ve `--cb-font-display: "Space Grotesk"` token'da tanımlı ama font dosyası yüklenmiyor; tarayıcı kendi fallback'ine düşüyor (system-ui). FOIT/FOUT yaşanmıyor çünkü font hiç gelmiyor. v1'de eklendiği söylenen `next/font/google` setupı kaybolmuş.

**Aksiyon:** `app/layout.tsx`'e
```ts
import { Manrope, Space_Grotesk } from "next/font/google";
const sans = Manrope({ subsets:["latin"], variable:"--cb-font-sans", display:"swap" });
const display = Space_Grotesk({ subsets:["latin"], variable:"--cb-font-display", display:"swap" });
```
ekle ve `<body className={\`${sans.variable} ${display.variable}\`}>`.

### B2. Mapping Studio görseli hâlâ statik PNG
`/images/canonbridge-mapping-studio.{png,webp,avif}` (268 KB) → Mapping Studio Angular UI'sından üretilmiş bir gerçek ekran görüntüsü değil, tasarım mock'u. Üründe "drag-drop visual mapping" iddiası satılıyor ama hero'daki görsel ürünü temsil etmiyor. Awwwards-tier sitelerin tamamı gerçek ürün ekranı + dar bezel kullanır.

**Aksiyon:** Mapping Studio'dan 1440×900 gerçek export çek; veya Hero'ya kısa (10s) MP4/WebM otomatik oynayan demo koy.

### B3. `/component-gallery` sitemap dışında ama crawl edilebilir
`robots.ts` disallow ediyor, `component-gallery/layout.tsx` `metadata.robots` ile noindex/nofollow set ediyor. Yine de:
- `sitemap.ts` sadece locale URL'lerini listeliyor → ok.
- Production deploy'ta `nginx.conf` `/component-gallery` için herhangi bir özel basic-auth/IP kısıtı koymuyor; dahili gallery dış dünyaya açık.

**Aksiyon:** Nginx'te `location /component-gallery { allow <office>; deny all; }` veya middleware'de prod'da 404 döndür.

### B4. Lead webhook URL ve Turnstile site key client bundle'da
`process.env.NEXT_PUBLIC_LEAD_ENDPOINT` ve `NEXT_PUBLIC_TURNSTILE_SITE_KEY` bundle'a string olarak gömülüyor. Site key zaten public — sorun değil — ama webhook URL public olmamalı (A1 ile aynı kök).

### B5. Hero CTA mobil'de iki büyük buton + dikey yığın
`flex-col sm:flex-row items-start gap-4` → mobilde "See How It Works" ve "Request Demo" alt alta tam genişlik değil, sola yaslı sabit `px-8 py-4`. Bir telefonda CTA'lar arasında tap-area mesafesi az, ikinci buton viewport altında. Mobile bounce'a yol açar.

**Aksiyon:** Mobilde primary CTA full-width (`w-full sm:w-auto`), secondary'i ghost-link yap.

### B6. `prefers-reduced-motion` JS animasyonlarını kapsamıyor
`globals.css`'teki `@media (prefers-reduced-motion: reduce)` CSS animation/transition'ı kısıyor, ama framer-motion `motion.div initial/animate` JS-driven; bu medya sorgusu onları durdurmuyor. `MotionProvider`'da `useReducedMotion()` ile global olarak `MotionConfig reducedMotion="user"` ayarlanmalı.

### B7. Footer formu için aria-live yeterli ama hata mesajları tek noktada
`statusMessage` tek bir `<p>` içinde. Tek tek alan validation hatası gösterilmiyor (zorunlu alan boşsa tarayıcının default tooltip'i devreye giriyor — i18n yok). Submit sonrası başarısızlık `aria-live="polite"` ile duyuruluyor, ama görsel olarak hata rengi yok.

### B8. `og.png` 1200×630 görseli var; ancak content hash'i yok
Cache busting yok. OG güncellendiğinde Facebook/LinkedIn cache'i invalidate edilmiyor. `?v=2026-05-21` query veya hashed file adı ekle.

### B9. JSON-LD `BreadcrumbList` tek item içeriyor
Yalnızca "Home" item'ı var — anlamlı değil. Tek sayfa için breadcrumb tamamen çıkarılmalı, ya da gerçek alt sayfalar (Features/Architecture) ayrı route olduğunda doldurulmalı.

### B10. `FAQPage` JSON-LD eksik
Site `Features`/`UseCases` bölümleri zaten Q&A formatına yakın içerikler taşıyor; `FAQPage` schema rich result kazandırır — şu an yok.

---

## C. Orta (kod kalitesi / tasarım sistemi)

### C1. `text-navy-700` vb. utility'ler iç token'ları by-pass ediyor
`@theme` `--color-navy-900: var(--cb-color-ink-950)` map'i var ama hâlâ component'lerde `text-navy-700/50`, `border-navy-900/15` gibi opacity kombinasyonları doğrudan kullanılıyor. Token semantiği yerine renk semantiği. Uzun vadede `text-foreground-muted`, `border-subtle` gibi semantik isimler önerilir.

### C2. Inline `background-image` ve raw `rgba(6,16,22,0.3)` Hero'da
`Hero.tsx`:
```tsx
backgroundImage: `linear-gradient(rgba(6,16,22,0.3) 1px, transparent 1px), ...`
```
Token'lardan kopuk. `--cb-color-ink-950` yerine sabit hex. Tema değişirse grid arka planı bozulur.

### C3. `tailwind.config.ts` durumu
v2'de stale palet'in temizlenmesi istenmişti. Mevcutta dosya yok (ls boş). Eğer Tailwind v4 `@theme` blokları kullanılıyorsa bu doğru; bunu README/AGENTS'a açık not olarak yaz, ileride kimse yeniden eklemesin.

### C4. `lucide-react@^1.16.0` — yanlış sürüm
`package.json`'da `"lucide-react": "^1.16.0"`. Lucide React'in güncel sürümü 0.4xx (semver başlangıçta 0.x ile gidiyor). `^1.16.0` muhtemelen tipo veya çok eski/yanlış paket. Bundle çalıştığı için npm resolution geçmiş olabilir ama icon set güncel değil → upgrade et: `bun add lucide-react@latest`.

### C5. Playwright kapsamı dar
`e2e/home.spec.ts` yalnızca home + lang switch. Eksikler:
- `/tr`, `/de`, `/es` SSR snapshot testi (B4'le bağlantılı).
- Lead form hata yolu (endpoint 500 dönerse status="error" UI'ı).
- Mobile viewport navigation test.
- Lighthouse / web-vitals CI step (LCP < 2.5s).

### C6. `tests/marketing-site.test.mjs` `node --test` ile çalışıyor
İyi bir başlangıç ama production build çıktısı üzerinde değil; statik server üzerinden HTML scrape ediyor. Bu, hydration sonrası DOM'u görmüyor. e2e ile birlikte tutmak için zaten Playwright var — bu dosya kaldırılabilir veya kapsamı net tanımlanmalı.

### C7. `app/[locale]/page.tsx` `import Home from "../page"`
Client component'i alt route'tan re-import etmek hidrasyon ve future-flag (Next 16 Partial Prerendering) açısından kırılgan. Doğru pattern: ortak `<Site />` server component, hem `app/page.tsx` hem `app/[locale]/page.tsx` onu locale param'ı ile render eder.

### C8. `LocaleContext` hem URL hem `?lang` hem `localStorage` okuyor
Üç farklı kaynak → kullanıcı /tr'de iken Türkçe `localStorage`'a yazılıyor, sonra `/de`'ye gidince route TR'yi override ediyor — beklenen ama karmaşık. Tek doğruluk kaynağı: URL. `localStorage` ve `?lang` kaldırılabilir; geçici link'lerde `?lang=tr` kullanılıyorsa middleware ile 301 → `/tr`.

### C9. Video desteği yarı kalmış
`VideoSection.tsx` `videoSrc?` / `youtubeId?` prop alıyor ama `app/page.tsx`'te kullanılan `<VideoSection />` çağrısı parametresiz. `public/videos/` klasörü dahi yok. Bölüm görsel placeholder olarak çalışıyor.

**Aksiyon:** Ya `videos/canonbridge-demo.mp4` (poster + WebM fallback) ekle, ya YouTube ID set et, ya da bölümü tamamen kaldır.

### C10. Metrics ikonları lucide ama "Built for Enterprise Scale" sayılarının altındaki üç stat kartı dışında ürün metrik kanıtı yok
"10,000+ events/sec", "99.9% uptime" gibi rakamlar **kaynaksız**. Awwwards/B2B sitelerinde böyle metriklerin yanına müşteri vakası, white-paper link'i veya "based on synthetic benchmark" disclaimer'ı gelir. Şu an misleading sayılabilir.

### C11. CSP `'unsafe-inline'` ve `'unsafe-eval'` script-src'de
`nginx.conf`:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval';
```
Next 16 inline script'ler için nonce destekliyor — `'unsafe-inline'`'ı kaldırıp nonce kullan. `'unsafe-eval'` yalnızca dev'de gerekli; prod build için kaldırılabilir.

### C12. `frame-src` YouTube'a açık ama embed kullanılmıyor
VideoSection YouTube'u opsiyonel destekliyor; gerçekten kullanılmıyorsa `frame-src 'none'` daha güvenli.

---

## D. Düşük (cilalama)

### D1. `connect-src` `mailto:` içeriyor — geçersiz değer
`connect-src 'self' https: mailto:` — `mailto:` `connect-src`'ye değil `form-action`'a girer. `form-action 'self' mailto:` zaten var → `connect-src`'den çıkar.

### D2. `Footer.tsx` `<motion.button>` `disabled` ama opacity değişmiyor
`disabled` durumunda görsel feedback yok (sadece text "Sending..."). `disabled:opacity-60 disabled:cursor-not-allowed` ekle.

### D3. Logo dosyaları: hem `logo-black.jpeg` hem `canonbridge-logo-wide-light.png` var
JPEG logo dosyaları kullanılmıyor (greplendi). `public/images/logo-black.jpeg`, `logo-white.jpeg` sil.

### D4. `app/[locale]` `dynamicParams = false` + `generateStaticParams` → 4 sayfa statik üretiliyor
Doğru, ama `output: "export"` ile build çıktısında `/`, `/tr`, `/de`, `/es` hepsi aynı bundle'ı yüklediği için JS payload duplike. Locale-split chunking yok.

### D5. SecurityHeaders.com derecelendirme
CSP'de `report-uri` veya `report-to` yok — ihlal görünmüyor. `report-to` directive ekle (Cloudflare Logpush'a yönlendir).

### D6. README content/AGENTS.md güncellik
Repo kökünde 2 ayrı bulgu MD (`canonbridge-findings.md`, `canonbridge-findings-v2.md`) commit'li. Bunlar `docs/audits/` altına taşınmalı; ana README'de "see audits" referansı kalmalı.

---

## E. Hızlı kazançlar (1 commit / ≤30 dk)

1. `next/font/google` ekle (B1) — bundle'a otomatik subset, FOIT kaybolur.
2. `npm run tokens:sync` çalıştır + `ci.yml`'a `tokens:check` step'i ekle (A3).
3. `lucide-react` versiyonunu düzelt (C4).
4. `nginx.conf`'tan `connect-src mailto:` çıkar (D1); `'unsafe-eval'` prod'da kaldır.
5. `logo-*.jpeg` sil (D3).
6. Hero CTA buton'ları mobile için `w-full sm:w-auto` (B5).
7. `BreadcrumbList` JSON-LD'sini kaldır (B9).
8. `Footer.tsx` submit butonuna `disabled:opacity-60` (D2).

---

## F. Yapısal yol haritası

| Öncelik | Konu | Etki |
|---|---|---|
| P0 | A1 → Server Action + Turnstile siteverify | Güvenlik / spam |
| P0 | A4+A5 → Locale param'lı SSR layout | SEO / a11y / hidrasyon |
| P0 | A3 + CI tokens:check | Tasarım sistemi tutarlılığı |
| P1 | B1 next/font | Marka tipografisi |
| P1 | B2 gerçek ürün screenshot/video | Dönüşüm |
| P1 | C11 CSP sıkılaştırma | XSS yüzeyi |
| P2 | C5 e2e kapsam genişletme | Regression |
| P2 | B10 FAQ schema | SEO rich result |

---

## G. v2 → v3 delta özet

- ✅ Hero ikinci CTA, focus-visible, `og.png`, `BreadcrumbList`/`Organization` JSON-LD, AnimatedMetric rAF loop, `requestAnimationFrame` doğruluğu, signal token (Architecture), mobile menu — eklendi/düzeltildi.
- ❌ Hâlâ açık: `next/font` (B1), Mapping Studio gerçek görseli (B2), Server Action (A1), SSR locale (A4/A5), token sync drift (A3), CSP gevşek (C11).
- 🆕 v3'te ortaya çıktı: `lucide-react@^1.16.0` yanlış sürüm (C4), tokens:check CI'da yok (A3), `connect-src mailto:` (D1), atıl JPEG logo dosyaları (D3), `import Home from "../page"` antipattern (C7).

Toplam açık: **34 madde** (5 Kritik / 10 Yüksek / 12 Orta / 6 Düşük + 1 yol haritası).
