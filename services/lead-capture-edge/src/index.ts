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
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
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

    // Turnstile verification (FAIL-CLOSED: no secret key = reject)
    const turnstileResult = await verifyTurnstile(env, body.turnstileToken, clientIp);
    if (!turnstileResult.success) {
      return jsonError(403, turnstileResult.error ?? 'Turnstile verification failed');
    }

    // Forward to webhook
    const webhookUrl = env.LEAD_WEBHOOK_URL;
    if (!webhookUrl) {
      return jsonError(503, 'Lead webhook URL not configured');
    }

    // Strip turnstile token before forwarding
    const { turnstileToken: _, ...leadData } = body;
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
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    // No KV configured — allow but log warning
    return { allowed: true, retryAfter: 0 };
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

// --- Helpers ---

function handleCors(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin') ?? '';
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim());
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '';

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
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
