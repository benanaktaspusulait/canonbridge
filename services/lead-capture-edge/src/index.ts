/**
 * CanonBridge Lead Capture Edge Worker
 *
 * Cloudflare Worker that handles lead capture form submissions with:
 * - Origin validation
 * - Body size cap
 * - Cloudflare Turnstile verification (fail-closed)
 * - IP-based rate limiting via KV
 * - Forwarding to configured webhook URL
 */

export interface Env {
  TURNSTILE_SECRET_KEY: string;
  LEAD_WEBHOOK_URL: string;
  ALLOWED_ORIGINS: string;
  MAX_BODY_BYTES: string;
  RATE_LIMIT_MAX_REQUESTS: string;
  RATE_LIMIT_WINDOW_SECONDS: string;
  RATE_LIMIT_KV?: KVNamespace;
  LEAD_DEDUPE_KV?: KVNamespace;
  USAGE_WEBHOOK_URL?: string;
  ORG_ID?: string;
  DEDUPE_WINDOW_SECONDS?: string;
}

interface LeadPayload {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  turnstileToken?: string;
  [key: string]: unknown;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors(request, env);
    }

    if (request.method !== 'POST') {
      return jsonError(405, 'Method not allowed');
    }

    // Origin check
    const origin = request.headers.get('Origin') ?? '';
    const allowedOrigins = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim());
    if (!allowedOrigins.includes(origin)) {
      return jsonError(403, 'Origin not allowed');
    }

    // Body size check
    const maxBytes = parseInt(env.MAX_BODY_BYTES ?? '16384', 10);
    const contentLength = parseInt(request.headers.get('Content-Length') ?? '0', 10);
    if (contentLength > maxBytes) {
      return jsonError(413, `Request body exceeds ${maxBytes} bytes`);
    }

    // Rate limiting (IP-based via KV)
    // V5-M3 / NEW-V6-M2 FIX: Reject when IP cannot be determined (prevents bucket collapse)
    const clientIp = request.headers.get('CF-Connecting-IP') ?? '';
    if (!clientIp || clientIp === 'unknown') {
      // No valid IP — either not behind Cloudflare or header stripped
      // Reject to prevent rate-limit bypass via shared 'unknown' bucket
      return jsonError(403, 'Request origin could not be determined');
    }
    const rateLimitResult = await checkRateLimit(env, clientIp);
    if (!rateLimitResult.allowed) {
      return jsonError(429, 'Rate limit exceeded', {
        'Retry-After': String(rateLimitResult.retryAfter),
      });
    }

    // Parse body
    let body: LeadPayload;
    try {
      const rawBody = await request.text();
      if (rawBody.length > maxBytes) {
        return jsonError(413, `Request body exceeds ${maxBytes} bytes`);
      }
      body = JSON.parse(rawBody);
    } catch {
      return jsonError(400, 'Invalid JSON body');
    }

    // [LC-M5] Basic email format validation
    if (body.email && !isValidEmail(body.email)) {
      return jsonError(400, 'Invalid email format');
    }

    // Turnstile verification (FAIL-CLOSED: no secret key = reject)
    const turnstileResult = await verifyTurnstile(env, body.turnstileToken, clientIp);
    if (!turnstileResult.success) {
      return jsonError(403, turnstileResult.error ?? 'Turnstile verification failed');
    }

    // L-Y2 FIX: Email-based deduplication to prevent spam from multiple IPs
    if (body.email) {
      const dedupeResult = await checkEmailDedupe(env, body.email);
      if (!dedupeResult.allowed) {
        return jsonError(429, 'Duplicate submission detected. Please wait before submitting again.');
      }
    }

    // Forward to webhook
    const webhookUrl = env.LEAD_WEBHOOK_URL;
    if (!webhookUrl) {
      return jsonError(503, 'Lead webhook URL not configured');
    }

    // [LC-H3] Validate and extract only expected fields — reject unknown/dangerous fields
    const leadData = sanitizeLeadPayload(body);

    const forwardPayload = {
      ...leadData,
      metadata: {
        ip: clientIp,
        origin,
        userAgent: request.headers.get('User-Agent') ?? '',
        submittedAt: new Date().toISOString(),
      },
    };

    try {
      // X-Y3: Propagate trace context if present
      const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      const traceparent = request.headers.get('traceparent');
      if (traceparent) forwardHeaders['traceparent'] = traceparent;
      const tracestate = request.headers.get('tracestate');
      if (tracestate) forwardHeaders['tracestate'] = tracestate;

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: forwardHeaders,
        body: JSON.stringify(forwardPayload),
      });

      if (!webhookResponse.ok) {
        console.error(`Webhook returned ${webhookResponse.status}`);
        return jsonError(502, 'Failed to process lead submission');
      }
    } catch (err) {
      console.error('Webhook request failed:', err);
      return jsonError(502, 'Failed to process lead submission');
    }

    // TASK-016: Publish usage event for billing metering (fire-and-forget)
    publishUsageEvent(env, clientIp).catch(() => {});

    return new Response(JSON.stringify({ success: true, message: 'Lead submitted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      },
    });
  },
};

// --- Turnstile verification (fail-closed) ---

interface TurnstileResult {
  success: boolean;
  error?: string;
}

async function verifyTurnstile(env: Env, token: string | undefined, ip: string): Promise<TurnstileResult> {
  // FAIL-CLOSED: if secret key is not configured, reject all requests
  if (!env.TURNSTILE_SECRET_KEY) {
    return { success: false, error: 'Turnstile is not configured (fail-closed)' };
  }

  if (!token || token.trim() === '') {
    return { success: false, error: 'Missing turnstile token' };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    });

    const result = (await response.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!result.success) {
      return { success: false, error: `Turnstile failed: ${(result['error-codes'] ?? []).join(', ')}` };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Turnstile verification request failed' };
  }
}

// --- Rate limiting via KV ---

interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

async function checkRateLimit(env: Env, clientIp: string): Promise<RateLimitResult> {
  const kv = env.RATE_LIMIT_KV;
  if (!kv) {
    // Y13: Fail-closed — no KV means no rate limiting protection
    console.error('RATE_LIMIT_KV not configured — rejecting request (fail-closed)');
    return { allowed: false, retryAfter: 60 };
  }

  const maxRequests = parseInt(env.RATE_LIMIT_MAX_REQUESTS ?? '5', 10);
  const windowSeconds = parseInt(env.RATE_LIMIT_WINDOW_SECONDS ?? '60', 10);
  const key = `rl:${clientIp}`;

  try {
    const stored = await kv.get(key);
    const count = stored ? parseInt(stored, 10) : 0;

    if (count >= maxRequests) {
      return { allowed: false, retryAfter: windowSeconds };
    }

    await kv.put(key, String(count + 1), { expirationTtl: windowSeconds });
    return { allowed: true, retryAfter: 0 };
  } catch {
    // On KV errors, fail open to avoid blocking legitimate traffic
    return { allowed: true, retryAfter: 0 };
  }
}

// --- Usage metering (TASK-016) ---

// --- L-Y2: Email-based deduplication ---

interface DedupeResult {
  allowed: boolean;
}

async function checkEmailDedupe(env: Env, email: string): Promise<DedupeResult> {
  const kv = env.LEAD_DEDUPE_KV ?? env.RATE_LIMIT_KV;
  if (!kv) {
    // [LC-H1] Fail-closed: consistent with rate limiting posture
    console.error('LEAD_DEDUPE_KV not configured — rejecting duplicate check (fail-closed)');
    return { allowed: false };
  }

  const windowSeconds = parseInt(env.DEDUPE_WINDOW_SECONDS ?? '86400', 10); // 24h default

  // Hash the email for privacy (don't store raw emails in KV)
  const emailHash = await hashEmail(email.toLowerCase().trim());
  const key = `dedupe:${emailHash}`;

  try {
    const existing = await kv.get(key);
    if (existing) {
      return { allowed: false };
    }

    await kv.put(key, '1', { expirationTtl: windowSeconds });
    return { allowed: true };
  } catch {
    // On KV errors, allow the request
    return { allowed: true };
  }
}

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// --- Usage metering (TASK-016, original) ---

async function publishUsageEvent(env: Env, clientIp: string): Promise<void> {
  const usageUrl = env.USAGE_WEBHOOK_URL;
  if (!usageUrl) return;

  const orgId = env.ORG_ID ?? 'a0000000-0000-0000-0000-000000000001';
  const event = {
    id: crypto.randomUUID(),
    org_id: orgId,
    service: 'lead-capture-edge',
    metric: 'lead_captures',
    qty: 1,
    ts: new Date().toISOString(),
    request_id: `lead-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
    metadata: {},
  };

  try {
    await fetch(usageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch {
    // Graceful degradation: never let billing break lead capture
  }
}

function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Input sanitization (LC-H3) ---

const ALLOWED_LEAD_FIELDS = new Set(['name', 'email', 'company', 'message', 'phone', 'role', 'source']);
const MAX_FIELD_LENGTH = 1000;

function sanitizeLeadPayload(body: LeadPayload): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === 'turnstileToken') continue;
    if (key.startsWith('__')) continue; // Block __proto__ etc.
    if (!ALLOWED_LEAD_FIELDS.has(key)) continue;
    if (typeof value === 'string') {
      sanitized[key] = value.slice(0, MAX_FIELD_LENGTH);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    }
    // Skip objects, arrays, null — only primitives allowed
  }
  return sanitized;
}

// --- Helpers ---

function handleCors(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin') ?? '';
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim());

  if (!allowedOrigins.includes(origin)) {
    return jsonError(403, 'Origin not allowed');
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function jsonError(status: number, message: string, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}
