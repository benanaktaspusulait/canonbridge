# CanonBridge — İkinci İnceleme Raporu

**Repo:** https://github.com/benanaktaspusulait/canonbridge
**HEAD:** `12fc8f4 — update lovable bugs`
**Tarih:** 2026-05-21
**Kapsam:** `website/` (Next.js 16 + Tailwind v4) + repo governance
**Önceki rapor:** `canonbridge-findings.md` (v1)

---

## 1. Önceki bulgulara karşı durum (delta)

| # | v1 Bulgusu | Durum | Not |
|---|---|---|---|
| W01 | Genel "dark SaaS" estetiği, marka kimliği yok | ✅ **Çözüldü** | Yeni ink/cloud/brand/signal/gold paleti `app/brand-tokens.css` ve `@canonbridge/tokens` paketinde. Açık (light) tema benimsendi. |
| W02 | `oklch` token yok | ⚠️ **Kısmen** | Token sistemi var ama renkler hâlâ **hex** (`#0d4f4c` vb.). Lovable design rule'u `oklch` öneriyor; geniş gamut için dönüştürülmeli. |
| W03 | Tipografi: tek "Inter", CDN | ✅ **Çözüldü** | `next/font/google` ile **Manrope** (body) + **Space Grotesk** (display) self-hosted, `--font-*` variable'larıyla bağlandı. |
| W04 | Metadata/OpenGraph/JSON-LD eksik | ✅ **Çözüldü** | `app/layout.tsx` full metadata + `metadataBase` + `alternates.languages`; `app/page.tsx` SoftwareApplication JSON-LD. |
| W05 | `sitemap.ts` / `robots.ts` yok | ✅ **Çözüldü** | İkisi de var, `force-static` ile export uyumlu. |
| W06 | Hero'da generic "orblar" | ⚠️ **Kısmen** | Orblar gitti, yerine `canonbridge-console.svg` (statik mockup) geldi. Hâlâ **gerçek ürün ekranı değil** — Mapping Studio'dan PNG export'u idealdir. |
| W07 | `/videos/*.mp4` 404 | ⚠️ **Kısmen** | `public/videos/` klasörü hâlâ yok. `VideoSection` artık güzel bir **fallback panel** render ediyor, ama `page.tsx` 5 adımdan **hiçbirine `videoSrc`/`youtubeId` geçirmiyor** → 5 bölüm de aynı placeholder. Ya gerçek MP4/YouTube ID'leri eklenmeli ya da fallback'lere içerik çeşitlemesi gelmeli. |
| W08 | Mobile menu yok | ✅ **Çözüldü** | `Navbar.tsx` Menu/X + `AnimatePresence`, scroll lock. |
| W09 | Footer formu boş onSubmit | ✅ **Çözüldü** | Webhook POST + mailto fallback + 5 durumlu `aria-live` status. |
| W10 | `focus-visible` ring yok | ✅ **Çözüldü** | `--cb-shadow-focus` token + form inputlarında uygulandı. (Globally `:focus-visible` rule eklemek hâlâ iyi olur — bkz. **N7**.) |
| W11 | LICENSE/SECURITY/CONTRIBUTING/CHANGELOG yok | ✅ **Çözüldü** | Hepsi root'ta. AGENTS.md de eklenmiş. |
| W12 | Otomatik a11y testi yok | ✅ **Çözüldü** | `e2e/home.spec.ts` Playwright + `@axe-core/playwright`; ayrıca `tests/marketing-site.test.mjs` static export smoke test. |
| W13 | Lucide standardı yok | ✅ **Çözüldü** | `lucide-react` her yerde kullanılıyor. (İstisna **N4**.) |
| W14 | i18n yok | ✅ **Çözüldü** | `LocaleContext` + `en/tr/de/es` locale dosyaları. |

**Skor:** 14 maddenin 10'u tam, 4'ü kısmen çözüldü. Sıfır regresyon.

---

## 2. Yeni / hâlâ açık bulgular (priority order)

### 🔴 Yüksek

**N1 — `tailwind.config.ts` stale & çelişkili**
Dosya hâlâ **eski palet** (`navy.900: #0A0F1C`, `accent.blue: #3B82F6`) ve `fontFamily.sans: ["Inter", ...]` içeriyor. Proje Tailwind v4'e geçtiği için renkler aslında `app/globals.css` içindeki `@theme` bloğundan geliyor. `tailwind.config.ts`:
- Yanıltıcı (yeni gelen geliştirici "Inter" sanıyor),
- Bazı toolchain'lerde (eslint-plugin-tailwindcss, IDE auto-complete) yanlış renkleri öneriyor.

**Aksiyon:** Dosyayı sil ya da v4 minimal config'e indir (`content` artık otomatik). Marka tokenları zaten `@theme` içinde.

**N2 — Lead webhook URL'i public env'de**
`NEXT_PUBLIC_LEAD_WEBHOOK_URL` client bundle'a gömülüyor → bot/scraper webhook'u doğrudan hammerleyebilir. `output: "export"` olduğu için Server Action/route kullanılamıyor.

**Aksiyon (seç):**
- a) Static export'tan vazgeçip Next API route + edge runtime (rate-limit + honeypot + hCaptcha),
- b) Marketing site static kalsın, formu **Cloudflare Worker** veya **Lovable Cloud edge function**'a POST etsin (origin allowlist + Turnstile).
- c) En azından honeypot field + minimum delay validation ekle (kısmi koruma).

**N3 — Brand token drift riski**
`app/brand-tokens.css` başında yorum: *"Snapshot of packages/tokens/src/index.css for the static Next export."* Manuel kopya = sessiz drift.

**Aksiyon:** `postcss-import` ile `@import "@canonbridge/tokens/css"` veya build script (`scripts/sync-tokens.mjs`) + CI check (`git diff --exit-code`).

### 🟡 Orta

**N4 — Metrics'de emoji ikonlar**
`components/Metrics.tsx` ikinci grid `⚡ 🔄 🛡️` emoji kullanıyor — sayfanın geri kalanında lucide var. Cross-platform render tutarsızlığı (Windows/Linux'ta düz emoji vs. macOS'ta renkli).

**Aksiyon:** `Zap`, `RefreshCw`, `ShieldCheck` ile değiştir.

**N5 — Architecture diagramında brand dışı renk**
`components/Architecture.tsx` "Raw Events" kutusu `bg-orange-500/10 text-orange-400` — bunlar Tailwind default. Marka paletinde **signal** (`--cb-color-signal-500: #a84324`) zaten var.

**Aksiyon:** `bg-[var(--cb-color-signal-500)]/10 text-[var(--cb-color-signal-500)]` veya `@theme`'e `--color-signal-*` ekle.

**N6 — `prefers-reduced-motion` yarım uygulanmış**
`globals.css` CSS animasyonlarını durduruyor ✓ ama **framer-motion JS'i CSS media query okumaz**. `whileInView`, `animate`, `transition` hâlâ tetikleniyor.

**Aksiyon:** Reusable hook:
```ts
import { useReducedMotion } from "framer-motion";
const prefersReduced = useReducedMotion();
<motion.div initial={prefersReduced ? false : { opacity: 0, y: 20 }} ... />
```

**N7 — Global `:focus-visible` ring yok**
Form inputlarında var, ama Navbar linkleri, butonlar, dropdown, footer linkleri custom focus tarzına sahip değil → browser default outline.

**Aksiyon:** `globals.css`'e:
```css
:focus-visible {
  outline: none;
  box-shadow: var(--cb-shadow-focus);
  border-radius: var(--cb-radius-sm);
}
```

**N8 — `/component-gallery` production'da indexleniyor**
`sitemap.ts` `/component-gallery`'i (priority 0.4) listeliyor + `robots.ts` `allow: "/"` → internal QA sayfası Google'a çıkar.

**Aksiyon:** ya `robots.ts` içinde `disallow: ["/component-gallery"]`, ya da `app/component-gallery/layout.tsx`'e `metadata.robots: { index: false }`.

**N9 — Security headers eksik (nginx)**
`nginx.conf` X-Frame-Options, X-Content-Type, Referrer-Policy var ✓ ama eksikler:
- `Content-Security-Policy` (script-src/img-src whitelist — YouTube embed varsa frame-src https://www.youtube.com)
- `Strict-Transport-Security` (HSTS)
- `Permissions-Policy` (camera, microphone, geolocation = ())

**N10 — Hero CTA çoğul + scroll indicator çakışması**
`Hero.tsx`'de `min-h-screen` + iki CTA + alttaki animated arrow `absolute bottom-4` ile 1024×600 viewport'larda CTA üstüne biniyor. Mobile'da arrow `hidden md:block` ile gizli → desktop'ta da gizlemek veya hero altına flow olarak koymak.

### 🟢 Düşük / İyileştirme

**N11 — Hex → oklch geçişi.** `oklch(0.45 0.08 180)` formatında brand renkleri P3-wide gamut ekranlarda daha canlı + Lovable design system rule'una uyumlu.

**N12 — Hero görseli.** `canonbridge-console.svg` statik mockup. Gerçek Mapping Studio'dan 1440×900 PNG export veya kısa Lottie animasyonu (Studio'da kolon dragging) çok daha güçlü olur.

**N13 — `AnimatedMetric` doğruluk.** `Math.floor(end / 60)` increment, `value=99` için 1 → OK; ama `value=10000` için 166 → `setInterval` stepTime ile çarpılıp toplamda ~2 saniyeyi az aşar. Tek bir `requestAnimationFrame` döngüsüyle değiştir (daha pürüzsüz + doğru süre).

**N14 — JSON-LD eksik tipler.** `SoftwareApplication` var; `Organization` (logo, sameAs), `BreadcrumbList`, `FAQPage` (Features bölümünde Q/A formatı varsa) ek SEO kazandırır.

**N15 — Open Graph görseli `.svg`.** `canonbridge-og.svg` — **Twitter/X, LinkedIn, WhatsApp SVG OG'yi render etmez**. 1200×630 PNG/JPG zorunlu.

**N16 — `next.config.ts` images.** `output: "export"` + `unoptimized: true` zorunlu OK ama `next/image` priority/lazy `<picture>` srcset üretmiyor → AVIF/WebP responsive kayıp. Static export'tan vazgeçmek mümkünse `next/image` optimization'ı geri kazanılır.

**N17 — i18n URL stratejisi.** `?lang=tr` query string ile çalışıyor → Google bunu duplicate content sayar. `/tr/`, `/de/` segment routing (Next.js App Router i18n) + `hreflang` linkleri (`alternates.languages` zaten doğru tag'lere işaret ediyor ama gerçek route yok). Şu an `alternates.languages` bozuk pointer.

**N18 — CHANGELOG otomasyonu yok.** `CHANGELOG.md` manuel — `changesets` veya `release-please` CI bağlanabilir.

**N19 — Playwright tek spec.** `home.spec.ts` sadece anasayfa + axe. Component gallery, locale switch, mobile menu, form submit (mocked webhook) coverage eklenmeli.

**N20 — Mapping Studio UI (Angular)** bu turda yine kapsam dışı tutuldu — `mapping-studio-ui/` için ayrı bir audit önerilir (PrimeNG token bridging, route-level lazy loading, Angular Signals migration, OnPush stratejisi).

---

## 3. Hızlı kazanım listesi (1 PR'lık iş)

1. `tailwind.config.ts` sil (N1) → tek satır, kafa karışıklığı biter.
2. Emoji → lucide ikon (N4) → 6 satır diff.
3. `bg-orange-*` → signal token (N5) → 4 satır.
4. `:focus-visible` global rule (N7) → 5 satır CSS.
5. `og:svg` → `og.png` (N15) → asset değişimi.
6. `robots.ts` disallow `/component-gallery` (N8) → 2 satır.
7. `VideoSection` page'e `youtubeId` veya `videoSrc` parametreleri (N7-W07) → 5×1 satır.

Bu 7 madde ~30 dakika işle siteyi belirgin biçimde toparlar.

---

## 4. Orta vadeli yol haritası

- **Sprint 1:** N1, N2 (webhook security), N3 (token sync), N7, N8, N15.
- **Sprint 2:** N6 (motion), N11 (oklch), N17 (i18n routing), N16 (image optimization değerlendir).
- **Sprint 3:** N9 (CSP/HSTS), N14 (JSON-LD genişletme), N19 (test coverage).
- **Backlog:** N12 (gerçek hero), N18 (changelog otomasyonu), N20 (Studio audit).

---

## 5. Özet

Önceki rapora göre **büyük ilerleme**: tipografi, metadata, mobile UX, lead form, governance, a11y testi hepsi tamam. Geriye kalan açıklar artık **incelik** seviyesinde — en kritikleri (a) `tailwind.config.ts` çelişkisi, (b) public webhook URL, (c) hâlâ eksik video assetleri, (d) `oklch` migration. Bunlar düzeltildiğinde marketing site enterprise satışına gerçekten hazır görünür.
