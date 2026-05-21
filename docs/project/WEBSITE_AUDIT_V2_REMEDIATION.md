# Website Audit v2 Remediation

Date: 2026-05-21

Source report: `canonbridge-findings-v2.md`

## Completed

| Finding | Status | Notes |
| --- | --- | --- |
| N1 | Done | Removed stale `website/tailwind.config.ts`; Tailwind v4 theme now comes from `app/globals.css`. |
| N2 | Partial, static-safe | Added honeypot and minimum-delay guard to the lead form. A private edge endpoint with origin allowlist/Turnstile is still required for full webhook protection. |
| N3 | Done | Added `scripts/sync-website-tokens.mjs` and `npm run tokens:check`; website and Mapping Studio token snapshots are generated from `packages/tokens`. |
| N4 | Done | Replaced metrics emoji with lucide icons. |
| N5 | Done | Replaced default orange architecture styling with CanonBridge signal token. |
| N6 | Done | Added `MotionProvider` with `MotionConfig reducedMotion="user"`. |
| N7 | Done | Added global `:focus-visible` focus ring. |
| N8 | Done | Removed `/component-gallery` from sitemap, disallowed it in robots, and added noindex metadata. |
| N9 | Done | Added CSP, HSTS, Permissions-Policy, and existing security headers to website nginx. |
| N10 | Done | Removed the absolute animated scroll arrow and made hero CTAs icon+text controls. |
| N11 | Done | Converted shared color tokens to OKLCH and synced snapshots. |
| N12 | Done | Captured a real 1440x900 Mapping Studio Docker screenshot and replaced the static console SVG in the hero. |
| N13 | Done | Replaced metric interval animation with `requestAnimationFrame`. |
| N14 | Done | Expanded JSON-LD with `Organization`, `SoftwareApplication`, and `BreadcrumbList`. |
| N15 | Done | Generated `canonbridge-og.png` and switched Open Graph/Twitter metadata from SVG to PNG. |
| N17 | Partial | Removed query-string `hreflang` alternates until real `/tr`, `/de`, `/es` routes exist. |
| N19 | Done | Expanded static tests and confirmed Playwright coverage still passes on desktop and mobile. |

## Still Product / Asset Decisions

| Finding | Remaining work |
| --- | --- |
| N16 | Revisit `output: "export"` if image optimization and responsive AVIF/WebP are required. |
| N18 | Add `changesets` or `release-please` when release automation starts. |
| N20 | Run a separate Mapping Studio Angular audit. |

## Verification

- `npm run tokens:check`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- `docker compose -f website/docker-compose.yml up -d --build website`
- `curl -I http://localhost:8090/`
