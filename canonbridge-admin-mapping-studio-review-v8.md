# CanonBridge — Mapping Studio (Admin UI) Detailed Review (v8)

**Scope:** `mapping-studio-ui/` — Angular 21 SPA, served by nginx
**Repo:** `benanaktaspusulait/canonbridge` @ `master`
**Inspected:** `app.routes.ts`, `app.config.ts`, `core/services/auth.service.ts`,
`core/services/auth.interceptor.ts`, `core/guards/auth.guard.ts`,
`features/auth/login/login.component.ts`, `core/services/billing.service.ts`,
`core/services/credential.service.ts`,
`core/services/realtime-notification.service.ts`, `index.html`,
`nginx.conf`, `Dockerfile`, `docker-entrypoint.d/10-canonbridge-env.sh`,
`environments/environment{,.prod}.ts`, `environments/runtime-config.ts`,
`angular.json` (file replacements).

This is the **highest-privilege surface** in the product (publishes mappings,
manages tenants, reads billing, rotates credentials). The findings below
weight blast-radius accordingly.

---

## 🔴 High — fix before next admin release

### A-V8-H1 — Auth token in `sessionStorage` + `'unsafe-inline'` script-src = full account takeover on any XSS
`core/services/auth.service.ts`
```ts
private readonly STORAGE_KEY = 'cb_user';
private readonly TOKEN_KEY = 'cb_token';
sessionStorage.setItem(this.TOKEN_KEY, response.token);
```
`nginx.conf`
```
Content-Security-Policy "... script-src 'self' 'unsafe-inline' ...";
```
Any reflected/stored XSS in a partner name, mapping rule, JSONata error
message, or third-party widget can read `sessionStorage.cb_token` and POST it
out (CSP `connect-src 'self' http://localhost:* https://fonts.googleapis.com`
blocks generic exfil, but the same attacker can issue authenticated requests
to `/api/*` directly from the victim's browser — game over).

**Fix:**
1. Move the token to an **httpOnly + Secure + SameSite=Strict cookie** issued by `/api/auth/login`. Drop `Authorization: Bearer` from the interceptor; cookie auto-attaches.
2. Add CSRF protection (double-submit cookie or `X-CSRF-Token` header).
3. Remove `'unsafe-inline'` from `script-src` (use the nonce pattern the marketing site already uses).

### A-V8-H2 — `X-Tenant-Id` / `X-User-Id` are *client-supplied* headers
`core/services/auth.interceptor.ts`
```ts
setHeaders: {
  'Authorization': `Bearer ${token}`,
  'X-Tenant-Id': user.tenantId,
  'X-User-Id': user.id
}
```
If the backend reads these headers (it does — confirmed in earlier audits of
`mapping-studio-api`), any authenticated user can rewrite the values from
DevTools and address resources of another tenant. The JWT is the only
trustworthy source for tenantId/userId.

**Fix (backend):** stop reading `X-Tenant-Id`/`X-User-Id` from the request;
derive them from `requireSupabaseAuth`-equivalent JWT claims. Then drop the
headers from this interceptor.

### A-V8-H3 — Zero client-side RBAC
`app.routes.ts` protects every page with `authGuard` only. There is **no
role guard** anywhere. `auth.service.userRole` is computed but never
consumed by a guard, layout, or sidebar. Result: any logged-in user
(integration engineer, even a demo viewer if one exists) can navigate to
`/billing`, `/audit`, `/tenant` and submit the same `/api/*` calls as an
admin. Backend should enforce, but missing the client-side check:
(a) leaks UI structure to unauthorized roles and (b) gives no defense in
depth.

**Fix:** create `roleGuard(allowed: Role[])` and attach to billing/audit/
tenant/settings routes. Hide sidebar items via `auth.userRole()` check.

### A-V8-H4 — Auth interceptor `throw new Error(...)` from a functional interceptor
```ts
if (!user || !token) {
  router.navigate(['/login']);
  throw new Error('Authentication required');
}
```
Functional `HttpInterceptorFn` must return an `Observable<HttpEvent>`. A
synchronous `throw` propagates as an uncaught exception (visible as a red
"Uncaught Error" in console for every page load if storage is cleared mid-
session). Components downstream see no clean 401 → no toast, no graceful
redirect feedback.

**Fix:** `return throwError(() => new HttpErrorResponse({ status: 401 }));`
(or `return EMPTY;`).

---

## 🟠 Medium

### A-V8-M1 — `console.log` of every API request, including tenant/user IDs
`auth.interceptor.ts`
```ts
console.log('[AuthInterceptor] Request headers:', {
  url, tenantId: user.tenantId, userId: user.id, hasToken: !!token
});
```
Ships in production (`environment.prod.ts` has `logging.enableConsole: false`
but this `console.log` ignores the config flag). Leaks tenant/user IDs to:
- Any browser-extension that scrapes console
- Session-replay tools (FullStory, LogRocket) that capture console
- Future error-monitoring SDKs

**Fix:** gate behind `if (environment.features.enableDebugMode)` or remove.

### A-V8-M2 — `BillingService.getOrgId()` hardcoded UUID
```ts
private getOrgId(): string {
  // TODO: Get from org context when multi-org is implemented
  return 'a0000000-0000-0000-0000-000000000001';
}
```
Every tenant's billing page hits org `a000...0001`. In single-tenant demo
this is OK; in *any* paying environment this leaks one customer's billing
view to all others (combined with H2, this is a confirmed cross-tenant
read).

### A-V8-M3 — WebSocket has no auth + no reconnect
`realtime-notification.service.ts`
```ts
this.socket = new WebSocket(`${protocol}//${window.location.host}/api/notifications/ws`);
```
- No bearer token, no cookie (until A-V8-H1 cookie auth lands the WS can't
  even authenticate).
- No `onerror` handler.
- `onclose` nulls the socket but never reconnects — `environment.websocket.
  reconnectInterval = 5000` is dead config.
- No heartbeat / ping → idle connections silently dropped by intermediaries.

### A-V8-M4 — nginx production CSP references `localhost`
`nginx.conf`
```
connect-src 'self' http://localhost:* ...
frame-src 'self' http://localhost:3000
```
Production CSP advertising localhost endpoints is both a leak (signals dev
infra exists) and a misconfiguration (no real localhost to connect to,
wasted CSP slots). Split CSP per environment or template it.

### A-V8-M5 — `env.js` is cached `immutable 1y`
`nginx.conf`
```
location ~* \.(js|css|...)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```
`docker-entrypoint.d/10-canonbridge-env.sh` rewrites `env.js` on every
container start, but the catch-all `*.js` cache rule sends `immutable`. After
any config change (new tenant, new API base URL), users on long-lived tabs
keep the old config forever.

**Fix:** add a specific `location = /env.js { add_header Cache-Control
"no-store"; }` block before the wildcard.

### A-V8-M6 — `tokenRefreshThreshold` config is dead
`auth.service.ts` has no refresh-token logic. `environment.auth.
tokenRefreshThreshold = 300` is unused. Token expires hard; users hit a
401 wall mid-edit and lose in-progress mapping work (combined with the
auto-save service, partial state can be saved with stale auth → silent
write failures).

### A-V8-M7 — `'unsafe-inline'` also on `style-src`
nginx CSP `style-src 'self' 'unsafe-inline'`. Less critical than script-src
but still allows CSS-injection attacks (data exfil via background-image
URLs to attacker domains — blocked by `img-src 'self' data: blob:` here,
so the practical risk is low — but tighten to nonces).

### A-V8-M8 — `X-XSS-Protection: 1; mode=block` is deprecated and harmful
Modern browsers ignore it; old Chrome/Edge versions have known
universal-XSS exploits triggered by it. OWASP recommends sending
`X-XSS-Protection: 0` or omitting it entirely when a strong CSP is in place.

### A-V8-M9 — Google Fonts loaded without SRI or self-host
`index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Manrope..." rel="stylesheet" ...>
```
Compromise of `fonts.googleapis.com` (or DNS hijack) → arbitrary CSS in
admin UI → `attr(...)` exfil, layout-jacking, phishing overlays. Self-host
the WOFF2 files (the marketing site already self-hosts via `next/font/
local`) and drop the `preconnect` to googleapis.

---

## 🟡 Low / polish

| ID | Where | Issue |
|---|---|---|
| A-V8-L1 | `auth.service.normalizeStoredUser` | Magic string `'Acme Corp'` — demo leftover masquerading as logic |
| A-V8-L2 | `auth.service.loadFromStorage` | `JSON.parse(raw)` with no shape/size validation; corrupt cookie crashes app on init |
| A-V8-L3 | `login.component` | No client-side throttling; relies entirely on backend rate limit |
| A-V8-L4 | `app.routes.ts` `**` | Wildcard redirects to `''` not `/dashboard` → unauthenticated visitor → /login (OK), but authenticated visitor lands twice through redirect chain |
| A-V8-L5 | `auth.interceptor` | Skips auth for `/auth/login` by substring match — `/api/foo/auth/login/bar` would also skip |
| A-V8-L6 | `app.config.ts` | `provideAppInitializer` returns `i18n.init()` but doesn't await `theme.init()` — fine today since theme is sync, fragile to refactor |
| A-V8-L7 | `realtime-notification` | Catches malformed messages silently with empty block — at minimum `console.warn` in dev |
| A-V8-L8 | `index.html` inline `<script>` | Reads `localStorage.canonbridge.darkMode` — fine, but requires CSP to permit inline; once nonces land, add the nonce |

---

## ✅ Verified good
- Lazy-loaded routes (`loadComponent`) keep initial bundle small.
- `provideAppInitializer` correctly defers app render until i18n is ready.
- `runtime-config.ts` separation of build-time vs runtime env is clean.
- `docker-entrypoint` JSON-escapes user input properly.
- `authGuard` / `publicGuard` use `createUrlTree` (idiomatic Angular).
- Healthcheck endpoint is wired in nginx + Dockerfile.
- PrimeNG dark mode via `localStorage` pre-paint script avoids FOUC.
- File replacements correctly swap `environment.ts` → `environment.prod.ts` in production builds (demo accounts stripped).
- `ripple` animations honour `prefers-reduced-motion`.
- Login skips auth interceptor for `/auth/login` (avoids chicken-and-egg).

---

## Suggested admin-hardening sprint (~3 days)

| Day | Work |
|---|---|
| **D1** | A-V8-H1: switch token to httpOnly cookie + CSRF (backend + interceptor); add nonce-based CSP, drop `unsafe-inline`. |
| **D2** | A-V8-H2: stop trusting `X-Tenant-Id`/`X-User-Id` on backend; remove from interceptor. A-V8-H3: role guard + sidebar filtering for billing/audit/tenant/settings. |
| **D3 AM** | A-V8-H4 + A-V8-M1 (interceptor cleanup + log gating). A-V8-M2 org-id from claims. |
| **D3 PM** | A-V8-M3 WS auth + reconnect/backoff. A-V8-M5 `env.js` no-store header. A-V8-M9 self-host fonts. |

After this sprint the admin surface meets the same bar as the rest of
the GA hardening checklist.
