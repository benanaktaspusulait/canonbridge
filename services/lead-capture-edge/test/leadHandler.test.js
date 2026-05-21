import test from "node:test";
import assert from "node:assert/strict";
import { handleLeadRequest, parseAllowedOrigins } from "../src/leadHandler.js";

const baseEnv = {
  LEAD_ALLOWED_ORIGINS: "https://canonbridge.io,https://www.canonbridge.io",
  LEAD_UPSTREAM_URL: "https://crm.example.test/leads",
};

function request(body, init = {}) {
  return new Request("https://canonbridge.io/api/leads", {
    method: "POST",
    headers: {
      Origin: "https://canonbridge.io",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

test("parses allowed origins", () => {
  assert.deepEqual(parseAllowedOrigins(" https://a.test,https://b.test ,, "), [
    "https://a.test",
    "https://b.test",
  ]);
});

test("rejects disallowed origins before reading payload", async () => {
  const response = await handleLeadRequest(
    request({}, { headers: { Origin: "https://evil.example" } }),
    baseEnv,
  );

  assert.equal(response.status, 403);
});

test("silently accepts honeypot submissions", async () => {
  let upstreamCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    upstreamCalled = true;
    return new Response("{}", { status: 200 });
  };

  try {
    const response = await handleLeadRequest(
      request({ website: "bot", elapsedMs: 2000 }),
      baseEnv,
    );

    assert.equal(response.status, 202);
    assert.equal(upstreamCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("forwards valid sanitized leads to the private upstream", async () => {
  const originalFetch = globalThis.fetch;
  let forwarded;
  globalThis.fetch = async (_url, init) => {
    forwarded = JSON.parse(init.body);
    return new Response("{}", { status: 200 });
  };

  try {
    const response = await handleLeadRequest(
      request({
        name: " Ada Lovelace ",
        company: " Analytical Engines ",
        email: " ADA@EXAMPLE.COM ",
        partners: "20-50",
        message: "Need integrations.",
        elapsedMs: 2000,
      }),
      baseEnv,
    );

    assert.equal(response.status, 202);
    assert.equal(forwarded.email, "ada@example.com");
    assert.equal(forwarded.name, "Ada Lovelace");
    assert.equal(forwarded.source, "canonbridge-website");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("requires Turnstile token when a secret key is configured", async () => {
  const response = await handleLeadRequest(
    request({
      name: "Ada",
      company: "Analytical Engines",
      email: "ada@example.com",
      elapsedMs: 2000,
    }),
    { ...baseEnv, TURNSTILE_SECRET_KEY: "secret" },
  );

  assert.equal(response.status, 403);
});
