const DEFAULT_MIN_ELAPSED_MS = 1500;
const MAX_BODY_BYTES = 16 * 1024;

export function parseAllowedOrigins(value = "") {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function json(body, status = 200, origin = "") {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }

  return new Response(JSON.stringify(body), { status, headers });
}

function cors(origin) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

function isAllowedOrigin(origin, allowedOrigins) {
  return Boolean(origin) && allowedOrigins.includes(origin);
}

function normalizePayload(payload) {
  return {
    name: String(payload.name ?? "").trim(),
    company: String(payload.company ?? "").trim(),
    email: String(payload.email ?? "").trim().toLowerCase(),
    partners: String(payload.partners ?? "").trim(),
    message: String(payload.message ?? "").trim(),
    source: "canonbridge-website",
    submittedAt: new Date().toISOString(),
    elapsedMs: Number(payload.elapsedMs ?? 0),
  };
}

function validatePayload(payload, minElapsedMs) {
  if (String(payload.website ?? "").trim()) {
    return { ok: true, silent: true };
  }

  if (Number(payload.elapsedMs ?? 0) < minElapsedMs) {
    return { ok: true, silent: true };
  }

  const normalized = normalizePayload(payload);

  if (!normalized.name || !normalized.company || !normalized.email) {
    return { ok: false, status: 400, message: "Missing required lead fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    return { ok: false, status: 400, message: "Invalid email address." };
  }

  return { ok: true, lead: normalized };
}

async function verifyTurnstile(token, env, remoteIp) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return true;
  }

  if (!token) {
    return false;
  }

  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  if (remoteIp) {
    form.set("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.success === true;
}

async function readJson(request) {
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return { tooLarge: true };
  }

  try {
    return { payload: JSON.parse(body || "{}") };
  } catch {
    return { invalid: true };
  }
}

export async function handleLeadRequest(request, env) {
  const allowedOrigins = parseAllowedOrigins(env.LEAD_ALLOWED_ORIGINS);
  const origin = request.headers.get("Origin") ?? "";

  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return json({ ok: false, error: "Origin not allowed." }, 403);
  }

  if (request.method === "OPTIONS") {
    return cors(origin);
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405, origin);
  }

  const { payload, invalid, tooLarge } = await readJson(request);
  if (tooLarge) {
    return json({ ok: false, error: "Payload too large." }, 413, origin);
  }
  if (invalid) {
    return json({ ok: false, error: "Invalid JSON." }, 400, origin);
  }

  const minElapsedMs = Number(env.LEAD_MIN_ELAPSED_MS ?? DEFAULT_MIN_ELAPSED_MS);
  const validation = validatePayload(payload, minElapsedMs);
  if (!validation.ok) {
    return json({ ok: false, error: validation.message }, validation.status, origin);
  }
  if (validation.silent) {
    return json({ ok: true, accepted: true }, 202, origin);
  }

  const remoteIp = request.headers.get("CF-Connecting-IP") ?? "";
  const turnstileOk = await verifyTurnstile(payload.turnstileToken, env, remoteIp);
  if (!turnstileOk) {
    return json({ ok: false, error: "Challenge verification failed." }, 403, origin);
  }

  if (!env.LEAD_UPSTREAM_URL) {
    return json({ ok: false, error: "Lead upstream is not configured." }, 500, origin);
  }

  const headers = { "Content-Type": "application/json" };
  if (env.LEAD_UPSTREAM_AUTH_HEADER && env.LEAD_UPSTREAM_AUTH_VALUE) {
    headers[env.LEAD_UPSTREAM_AUTH_HEADER] = env.LEAD_UPSTREAM_AUTH_VALUE;
  }

  const upstream = await fetch(env.LEAD_UPSTREAM_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(validation.lead),
  });

  if (!upstream.ok) {
    return json({ ok: false, error: "Lead upstream rejected the request." }, 502, origin);
  }

  return json({ ok: true, accepted: true }, 202, origin);
}
