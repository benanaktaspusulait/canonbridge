# CanonBridge — Kod ve Doküman İnceleme Raporu

**Repo:** https://github.com/benanaktaspusulait/canonbridge
**Tarih:** 2026-05-20
**Kapsam:** Monorepo geneli (services, mapping-studio-ui, website, docs). Bu rapor özellikle **website (Next.js 16 + Tailwind v4 + Framer Motion)** ve **mapping-studio-ui (Angular 21 + PrimeNG)** üzerinde **UI kalitesini** önceliklendirir.

---

## 1. Repo Yapısı — Hızlı Anlık Görüntü

```
canonbridge/
├── docs/                        # Mimari, ürün, proje, güvenlik, ops, test
├── services/
│   ├── canonbridge-mock/        # Spring Boot — 10 mock external system
│   ├── mapping-studio-api/      # Quarkus — mappings, partners, schemas, outbox
│   ├── transformer/             # Node.js/Fastify — JSONata + Ajv + Kafka
│   └── webhook-receiver/        # Quarkus
├── mapping-studio-ui/           # Angular 21 + PrimeNG (no-code studio)
├── website/                     # Next.js 16 — pazarlama sitesi
├── infrastructure/              # k8s + Docker
└── scripts/                     # Smoke, validators
```

Genel kalite: **arka uç olgunluğu yüksek**, dokümantasyon yoğun ve disiplinli. Asıl **kırılgan/eksik nokta pazarlama sitesi (website/) ve Mapping Studio UI'nin tasarım sistemi ile QA disiplini**.

---

## 2. Doküman İncelemesi — Bulgular

### 2.1 Güçlü yönler
- `docs/architecture/` 11 numaralı sıralı dokümanla (overview → sequence diagrams) net bir story arc oluşturuyor.
- `docs/project/PROJECT_GAPS.md` aktif tek bir gap register olarak güncel tutulmuş; her gap "Done/Status/Next Action" disipliniyle yazılmış.
- `PROJECT_SUMMARY.md` 2026-05-20 itibarıyla taze ve "demo-ready" iddiasıyla tutarlı.
- README'de mermaid + ASCII çift mimari diyagramı var → görsel anlatım güçlü.

### 2.2 Eksikler / Riskler
| # | Bulgu | Etki | Öneri |
|---|---|---|---|
| D1 | README "86% Complete" gibi **subjektif yüzde** içeriyor; production-readiness şartları net değil | Müşteri/yatırımcı için yanıltıcı | "MVP scope" + "checklist" tablosuna çevir |
| D2 | `PROJECT_GAPS.md` tablosundaki **tüm satırlar "Done"** — fakat "Remaining Follow-Ups" 3 madde var. Tutarsızlık. | Süreç güvenilirliği zayıflıyor | Gap register'da "Open / In Progress / Done" alanını ayrı kolon yap |
| D3 | `docs/security/` içeriği görünmüyor ama README "PROPRIETARY" lisans diyor, `LICENSE` dosyası yok | Lisans belirsizliği | Kök dizine `LICENSE` dosyası ekle |
| D4 | `docs/product/mapping-studio-design-system.md` var ama **website ve studio UI tek bir design system kullanmıyor** (website = Tailwind v4, studio = PrimeNG). Token paylaşımı yok. | Marka tutarsızlığı | Renk/typografi token'larını ortak `@canonbridge/tokens` paketi olarak çıkar |
| D5 | `BRAND_IDENTITY.md` var ama website bu kimliği uygulamıyor (renk paleti `#3B82F6` Tailwind defaultu, font Inter generic) | Marka karakteri yok | Brand doc → globals.css token'larına bire bir yansıt |
| D6 | API dokümantasyonu yok (OpenAPI spec, Postman var ama statik) | Entegrasyon dostu değil | Quarkus smallrye-openapi + redoc/scalar yayını |
| D7 | ADR'ler için klasör var (`docs/adr/`) ama içerik durumu raporda görünmüyor; yeni kararlar (auth, outbox) için ADR yok | Karar arkeolojisi kayboluyor | Her major kararı tek sayfalık ADR yap |
| D8 | Türkçe içerik / i18n dokümantasyonu yok (website i18n var ama hangi diller, çeviri süreci?) | Çok dilli yayın için risk | i18n kontribütör rehberi ekle |
| D9 | `docs/testing/ACCEPTANCE_SCENARIOS.md` mevcut ama UI için E2E (Playwright/Cypress) plan yok | UI regresyon riski | Website + Studio için E2E test stratejisi yaz |

---

## 3. Website (Next.js Pazarlama Sitesi) — UI Bulguları

**Stack:** Next.js 16, React 19, Tailwind v4, Framer Motion 12, Inter font (Google Fonts CDN).

### 3.1 Kritik UI / Marka Sorunları

| # | Bulgu | Lokasyon | Öneri |
|---|---|---|---|
| W1 | **Generic "AI-slop dark SaaS" estetiği**: navy bg + cyan/purple gradient + animate-pulse orb'lar — Linear/Vercel/Resend taklidi, marka karakteri yok | `Hero.tsx`, `globals.css` `gradient-bg` | Brand identity'ye uygun **bir** ayırıcı görsel motif seç: ya endüstriyel/maker (CanonBridge = "bridge"), ya editorial blueprint estetiği, ya brutalist kontrast. Üçünü karıştırma. |
| W2 | **Renk paleti hex değerleri sert** (`#3B82F6`, `#06B6D4`, `#8B5CF6`) — Tailwind defaultları, **oklch yok** | `globals.css` `@theme` | Tailwind v4 zaten `oklch` öneriyor; renk paletini oklch'e çevir, kontrast tutarlılığı artar |
| W3 | **Font sadece "Inter"** — Lovable yönergesi bile "avoid Inter as generic" diyor; display + body ayrımı yok | `layout.tsx` Google Fonts link | Display için karakter taşıyan font (Space Grotesk / Sora / Manrope) + body için okunaklı bir varyant. Variable font + `next/font/google` (CDN link değil) |
| W4 | **Google Fonts CDN `<link>` ile yükleniyor** → CLS + privacy + render-blocking | `app/layout.tsx` | `next/font/google` kullan, self-host olur, CLS düşer |
| W5 | **Hero CTA'ları render-anchorless**: "How it works" ve "Demo" hash linkleri var ama `/demo` route'u yok, conversion path belirsiz | `Hero.tsx` | Primary CTA → form / Calendly; secondary → "See architecture" |
| W6 | **Tüm bölüm geçişleri aynı**: `h-px bg-gradient-to-r from-transparent via-white/10 to-transparent` — 8 kez tekrar → ritim yok | `page.tsx` | Bölümler arası farklı break stratejileri (full-width image, asymmetric divider, sayı kartı) |
| W7 | **Step 2 YouTube embed, diğerleri local mp4**. `/videos/*.mp4` dosyaları `public/` altında **yok**, sadece `images/` var → **404 video** | `page.tsx` videoSrc, `public/` | Videoları ekle veya GIF/Lottie fallback; yoksa kaldır |
| W8 | **9 adet inline SVG icon `Features.tsx` içine hardcoded** (`featureIcons` array) — i18n ile sayı uyumsuzluğu riski, ikon-içerik kopukluğu | `Features.tsx` | `lucide-react` paketine geç + her feature item'ına icon string field'i ekle |
| W9 | **`whileHover/scale` her şeye uygulanmış** — buton, kart, link — micro-interaction enflasyonu | `Hero.tsx`, `Features.tsx` | Motion'ı sadece bir-iki anchor element'e ayır; geri kalanı CSS transition |
| W10 | **`animate-pulse-slow` orb'lar 3 yerde** — performans + dikkat dağıtıcı | `Hero.tsx` | Tek bir dramatik motion, geri kalanı statik gradient |
| W11 | **Form çalışmıyor**: `onSubmit={(e) => { e.preventDefault(); /* logic */ }}` — submit hiçbir yere gitmiyor | `Footer.tsx` | Server action veya 3rd-party (Formspree, Resend, Lovable Cloud function) bağla; başarı/hata UI'sı ekle |
| W12 | **Accessibility eksikleri**: `<form>` no `aria-label`, ikon-only butonlarda `aria-label` yok, `<a href="#">` (logo) klavye navigasyonunu bozar | Tümü | Tüm interaktif elementler için `aria-label` audit; logo `<Link href="/">` |
| W13 | **Semantik HTML zayıf**: `<main>` doğru kullanılmış ama `<h2>` öncesi `<h1>` her bölümde yok; section/article ayrımı eksik | `page.tsx` | Tek `<h1>` Hero'da; diğerleri `<h2>`. Her section'a `aria-labelledby` |
| W14 | **SEO**: `layout.tsx` metadata var ama `openGraph`, `twitter`, `canonical`, `alternates.languages`, JSON-LD yok | `app/layout.tsx` | Next.js `metadata` API'nin tam setini kullan; `sitemap.ts` + `robots.ts` ekle |
| W15 | **Mobil responsive testi yapılmamış**: hero `text-8xl` lg breakpoint'te taşma riski; navbar mobile menü yok (sadece `hidden md:flex`) | `Navbar.tsx`, `Hero.tsx` | Hamburger menü ekle; clamp() ile fluid type |
| W16 | **Dark-only tema**, light fallback yok — `prefers-color-scheme` ignored | `globals.css` | İsteğe bağlı: brand bilinçli kararsa dokümante et, değilse light variant ekle |
| W17 | **`globals.css` + `tailwind.config.ts` çift kaynak** (Tailwind v4 zaten `@theme` ile çalışıyor, config legacy) | Kök | `tailwind.config.ts` sil veya yalnızca v4 plugin'leri için tut |
| W18 | **i18n LocaleContext client-side**, ama SSR ile sözlük server'da inject edilmiyor → ilk paint İngilizce flash riski | `lib/LocaleContext.tsx` | `next-intl` veya cookie-based locale + Next.js i18n routing |
| W19 | **Test yok**: `package.json` script'lerinde `test` yok | `website/package.json` | Playwright smoke (homepage render + form submit) |
| W20 | **Logo `.jpeg` formatında**, dark tema üzerinde JPEG artifact + scaling kötü | `public/images/logo-white.jpeg` | SVG'ye çevir veya en kötü PNG with alpha |

### 3.2 UI Kalitesini Artırmak İçin Somut Eylem Listesi (öncelik sırasıyla)

1. **Tek bir tasarım yönü seç ve commit ol.** Mevcut "dark + gradient + orb + glassmorphism" jenerik. Üç güçlü seçenek:
   - **Editorial / Blueprint**: ince çizgi grafikleri, mono-serif başlık, kağıt dokulu off-black bg, mavi blueprint aksanı. ETL/integration hikâyesine doğal oturur.
   - **Industrial / Infrastructure**: bold sans display (Archivo / Söhne), warning-yellow + steel-grey, ızgara, ekipman estetiği. "Pipeline" metaforuyla iyi.
   - **Restrained Enterprise**: Stripe/Linear seviyesi disiplin, az renk, çok beyaz alan, özenli typography ve gerçek ürün screenshot'ları.
2. **Tasarım token'ları `oklch` ile yeniden yaz** ve `@canonbridge/tokens` olarak hem website hem studio için ortak hale getir.
3. **`next/font/google` ile self-hosted variable font**, display + body pair.
4. **Hero'yu sadeleştir**: tek motion, tek CTA, gerçek ürün ekran görüntüsü (orb değil).
5. **Eksik videoları ya ekle ya kaldır**; YouTube embed yerine self-hosted MP4 + poster, lazy.
6. **Lucide ikon kütüphanesine geç**, feature item'larını sözlükte tek source-of-truth yap.
7. **Form'u Lovable Cloud (Supabase) edge function'a bağla** — gerçek lead capture + email notification.
8. **Tam SEO**: `metadata.openGraph`, `metadata.twitter`, `sitemap.ts`, `robots.ts`, JSON-LD `Organization` + `SoftwareApplication`.
9. **Mobile-first responsive audit**: hamburger, fluid type (`clamp`), 44px tap targets, container queries.
10. **Playwright E2E**: homepage render, form submit, i18n switch, lighthouse CI > 90.
11. **Accessibility audit**: axe-core CI, kontrast AA garantili (oklch ile kolay), klavye navigation, focus-visible halkaları görünür.
12. **Performans**: 9 motion bileşeni → 2-3'e indir; orb blur → static SVG gradient; LCP altındaki herşey `loading="lazy"`.

---

## 4. Mapping Studio UI (Angular 21 + PrimeNG) — UI Bulguları

| # | Bulgu | Öneri |
|---|---|---|
| S1 | PrimeNG default theme (`@primeuix/themes`) — kurumsal jenerik görünüm | Custom theme override; brand token'larıyla CSS variables |
| S2 | `primeflex` + Angular CDK + kendi `.scss` → 3 ayrı styling sistemi karışık | Tek sistem belirle (Tailwind veya PrimeFlex), `primeflex`'i çıkarmak en temizi |
| S3 | `canvas-confetti` dependency — UX'te abartı sinyali | "Mapping published" anında bir kere; başka yerde kullanma |
| S4 | `highlight.js` full bundle yüklenmiş olabilir → bundle size | Yalnızca JSON/JSONata language'larını import et |
| S5 | UI testleri `vitest` ile yapılandırılmış ama coverage hedefi belirsiz | %70+ component test coverage target |
| S6 | Studio website ile aynı brand token'larını paylaşmıyor | `@canonbridge/tokens` ortak paketi |
| S7 | `nginx.conf` static serve — feature flag, runtime config injection yok | `env.js` runtime config pattern |
| S8 | Wizard / Integration Studio için UX akış dokümanı `02-mapping-studio-ux-flow.md` var ama component'lerle eşleştirme tablosu yok | Doc ↔ component cross-reference |

---

## 5. Cross-Cutting Eksikler

| # | Alan | Eksik | Etki |
|---|---|---|---|
| C1 | **Tasarım sistemi** | website + studio için ortak token yok | Marka tutarsızlığı |
| C2 | **Lisans** | `LICENSE` dosyası yok, README "PROPRIETARY" diyor | Hukuki belirsizlik |
| C3 | **CONTRIBUTING.md** | Yok | Açık katkı sürecini zorlaştırır |
| C4 | **SECURITY.md** | Yok (vuln raporlama kanalı) | Sorumlu açıklama için gerekli |
| C5 | **Changelog** | `CHANGELOG.md` yok, semantic versioning belirsiz | Sürüm takibi zor |
| C6 | **E2E test pipeline (UI)** | Yok | UI regresyon koruması yok |
| C7 | **Accessibility audit** | Hiçbir UI projesinde axe / pa11y çalışmıyor | WCAG uyumu belgelenmemiş |
| C8 | **Performance budget** | `PERFORMANCE_TARGETS.md` arka uç odaklı, UI için yok (LCP, CLS, TTI hedefi yok) | Frontend regresyon görünmez |
| C9 | **Görsel asset kütüphanesi** | Logo `.jpeg`, video dosyaları eksik, hero illustration yok | Marka deneyimi zayıf |
| C10 | **Storybook / component gallery** | Yok | Component standartlaşması yok |

---

## 6. Öncelikli "İlk 10 İş" (UI odaklı)

1. **Brand yönü kararla** ve `BRAND_IDENTITY.md` → kod token'larına yansıt (oklch).
2. **Website hero'yu sadeleştir + gerçek ürün ekran görüntüsü** ekle.
3. **`next/font/google` + display/body font pair** (Inter dışı).
4. **Eksik `/videos/*.mp4`** dosyalarını ekle veya bölümleri kaldır.
5. **Footer form'unu çalışır hale getir** (Lovable Cloud edge function + e-posta).
6. **Lucide icons + i18n sözlükle eşleştir** (`Features.tsx`).
7. **SEO paketi**: metadata, sitemap, robots, JSON-LD.
8. **Mobile responsive**: hamburger menü, fluid type, tap targets.
9. **Logo'yu SVG yap** + dark/light varyant.
10. **Playwright smoke + axe-core CI** ekle.

---

## 7. Riskler

- **Marka karakteri yok** → enterprise satışta "ciddi görünmeme" riski.
- **Form çalışmıyor + videolar 404** → demo isteyen lead'ler kaybediliyor (revenue impact).
- **Gap register tüm "Done" ama follow-up 3 madde** → dış paydaşa güven kaybı.
- **Studio + website style drift** → ürün ile pazarlama arasında deneyim kopukluğu.

---

**Sonraki adım önerisi:** Yukarıdaki "İlk 10 İş" listesinden 1-4. maddeleri tek bir sprint'te al; bunlar dokunduğunda site **göz farkı yaratacak** seviyeye çıkar.
