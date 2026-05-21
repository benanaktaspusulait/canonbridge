import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIN_ELAPSED_MS = 1500;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = Number(process.env.LEAD_RATE_LIMIT_PER_MINUTE ?? 8);
const rateLimits = new Map<string, { count: number; resetAt: number }>();

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
  if (!secret) return true;
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

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const authHeader = process.env.LEAD_WEBHOOK_AUTH_HEADER?.trim();
  const authValue = process.env.LEAD_WEBHOOK_AUTH_VALUE?.trim();
  if (authHeader && authValue) headers[authHeader] = authValue;

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
