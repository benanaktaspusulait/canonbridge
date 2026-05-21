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
| N16 | Done | Kept static export and added manual AVIF/WebP responsive source sets for the large hero product screenshot. |
| N17 | Partial | Removed query-string `hreflang` alternates until real `/tr`, `/de`, `/es` routes exist. |
| N18 | Done | Added Release Please manifest config and a main-branch workflow to automate `CHANGELOG.md` release PRs. |
| N19 | Done | Expanded static tests and confirmed Playwright coverage still passes on desktop and mobile. |
| N20 | Done | Ran Mapping Studio Angular/Vitest audit checks: 119 tests passed and production build succeeds. |

## Still Product / Route Decisions

| Finding | Remaining work |
| --- | --- |
| N2 | Replace the public lead webhook URL with a private edge endpoint plus origin allowlist and Turnstile/hCaptcha for full spam protection. |
| N17 | Add real `/tr`, `/de`, and `/es` App Router routes before restoring `hreflang` alternates. |

## Verification

- `npm run tokens:check`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- `npm test -- --run` in `mapping-studio-ui`
- `npm run build` in `mapping-studio-ui`
- `docker compose -f website/docker-compose.yml up -d --build website`
- `curl -I http://localhost:8090/`
