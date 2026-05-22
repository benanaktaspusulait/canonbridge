# Lead Capture Edge — Security Trust Model

## Overview

The lead-capture-edge service runs as a **Cloudflare Worker** deployed at the edge. Its security model relies on Cloudflare's infrastructure guarantees.

## Trust Assumptions

### CF-Connecting-IP Header
- **Trusted because:** Cloudflare Workers only receive requests that have passed through Cloudflare's edge network. The `CF-Connecting-IP` header is set by Cloudflare itself, not by the client.
- **Cannot be spoofed:** Direct access to the Worker (bypassing Cloudflare) is not possible when the Worker is deployed via Cloudflare's routing system.
- **Mitigation:** Ensure the Worker route is configured with zone-only access (no direct Worker URL exposure).

### Rate Limiting (KV-based)
- Uses `CF-Connecting-IP` as the rate limit key.
- **Fail-closed:** If KV is unavailable, requests are rejected (429).
- **Limitation:** Shared IPs (corporate NAT, VPN) may hit limits for multiple users.

### Turnstile Verification
- **Fail-closed:** If `TURNSTILE_SECRET_KEY` is not configured, all requests are rejected.
- Prevents automated form submissions (bots, scrapers).

## Deployment Requirements

1. Worker MUST be deployed via Cloudflare Dashboard or Wrangler (not as a standalone HTTP server).
2. Worker route MUST be attached to a zone (domain) with Cloudflare proxy enabled.
3. Direct Worker URL (`*.workers.dev`) SHOULD be disabled in production.
4. `RATE_LIMIT_KV` namespace MUST be provisioned before deployment.

## Accepted Risks

- **Shared IP rate limiting:** Users behind the same NAT may collectively hit rate limits. Acceptable for lead capture (low-frequency action).
- **Cloudflare outage:** If Cloudflare is down, lead capture is unavailable. Acceptable — no data loss, users retry later.
