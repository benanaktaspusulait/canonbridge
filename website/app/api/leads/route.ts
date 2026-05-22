import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIN_ELAPSED_MS = 800; // W-V8-M7 FIX: lowered from 1500 for keyboard users
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = Number(process.env.LEAD_RATE_LIMIT_PER_MINUTE ?? 8);
const rateLimits = new Map<string, { count: number; resetAt: number }>();

// W-V8-H2 FIX: Allowed origins for lead form submissions
const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// Always allow localhost in development
if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:3000", "http://localhost:4200");
}

// W-V8-M6 FIX: Dangerous header names that should never be forwarded
const FORBIDDEN_HEADERS = new Set([
  "host", "authorization", "cookie", "x-forwarded-for", "x-forwarded-host",
  "x-real-ip", "transfer-encoding", "content-length",
]);

function clientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function rateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimits.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  // W-V8-H2 FIX: Fail-closed in production when secret is not configured
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[leads] TURNSTILE_SECRET_KEY not configured in production — rejecting");
      return false;
    }
    return true; // Allow in development without Turnstile
  }
  if (!token) return false;

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (ip !== "unknown") form.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  if (!response.ok) return false;

  const result = await response.json();
  return result.success === true;
}

export async function POST(request: NextRequest) {
  // W-V8-H2 FIX: Origin validation to prevent cross-origin form submissions
  const origin = request.headers.get("origin") ?? "";
  if (origin && !ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
    return NextResponse.json({ ok: false, error: "Origin not allowed." }, { status: 403 });
  }

  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (text(payload.website) || Number(payload.elapsedMs ?? 0) < MIN_ELAPSED_MS) {
    return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
  }

  const lead = {
    name: text(payload.name),
    company: text(payload.company),
    email: text(payload.email).toLowerCase(),
    partners: text(payload.partners),
    message: text(payload.message),
    source: "canonbridge-website",
    submittedAt: new Date().toISOString(),
    elapsedMs: Number(payload.elapsedMs ?? 0),
  };

  if (!lead.name || !lead.company || !validEmail(lead.email)) {
    return NextResponse.json({ ok: false, error: "Missing or invalid lead fields." }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstile(text(payload.turnstileToken), ip);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Challenge verification failed." }, { status: 403 });
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, error: "Lead webhook is not configured." }, { status: 500 });
  }

  if (webhookUrl === "memory://accept") {
    return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const authHeader = process.env.LEAD_WEBHOOK_AUTH_HEADER?.trim();
  const authValue = process.env.LEAD_WEBHOOK_AUTH_VALUE?.trim();
  // W-V8-M6 FIX: Validate header name to prevent injection of dangerous headers
  if (authHeader && authValue) {
    if (/^[A-Za-z0-9-]{1,64}$/.test(authHeader) && !FORBIDDEN_HEADERS.has(authHeader.toLowerCase())) {
      headers[authHeader] = authValue;
    } else {
      console.error(`[leads] Rejected dangerous LEAD_WEBHOOK_AUTH_HEADER: ${authHeader}`);
    }
  }

  const upstream = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(lead),
  });

  if (!upstream.ok) {
    return NextResponse.json({ ok: false, error: "Lead webhook rejected the request." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
}
