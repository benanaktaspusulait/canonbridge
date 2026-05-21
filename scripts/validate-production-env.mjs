#!/usr/bin/env node
import { readFileSync } from "node:fs";

const env = { ...process.env };
const envFileIndex = process.argv.indexOf("--env-file");

if (envFileIndex !== -1) {
  const path = process.argv[envFileIndex + 1];
  if (!path) {
    console.error("--env-file requires a path");
    process.exit(2);
  }
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
  }
}

const failures = [];

function value(name) {
  return String(env[name] ?? "").trim();
}

function requirePresent(name) {
  const v = value(name);
  if (!v || /CHANGE_ME|REPLACE_WITH|example\.com/i.test(v)) {
    failures.push(`${name} must be set to a real production value`);
  }
}

function requireEquals(name, expected) {
  if (value(name).toLowerCase() !== expected) {
    failures.push(`${name} must be ${expected}`);
  }
}

function requireDisabled(name) {
  requireEquals(name, "false");
}

requireEquals("ENVIRONMENT", "production");
requireEquals("OIDC_ENABLED", "true");
requireEquals("SECURITY_FAIL_ON_INSECURE_DEFAULTS", "true");
requireEquals("SECURITY_PRODUCTION_REQUIRES_OIDC", "true");
requireEquals("SECURITY_REQUIRE_OIDC_CLIENT_SECRET", "true");
requireDisabled("CANONBRIDGE_LOCAL_LOGIN_ENABLED");
requireDisabled("CANONBRIDGE_LOCAL_JWT_ENABLED");
requireDisabled("CANONBRIDGE_BEARER_API_KEY_ENABLED");
requireDisabled("CANONBRIDGE_PUBLIC_DOCS_ENABLED");

[
  "CANONBRIDGE_DOMAIN",
  "ACME_EMAIL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_LEAD_ENDPOINT",
  "LEAD_ALLOWED_ORIGINS",
  "LEAD_UPSTREAM_URL",
  "LEAD_UPSTREAM_AUTH_VALUE",
  "TURNSTILE_SECRET_KEY",
  "OIDC_SERVER_URL",
  "OIDC_CLIENT_ID",
  "OIDC_CLIENT_SECRET",
  "CORS_ALLOWED_ORIGINS",
  "CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY",
  "POSTGRES_PASSWORD",
  "GF_SECURITY_ADMIN_PASSWORD",
].forEach(requirePresent);

for (const urlName of ["NEXT_PUBLIC_SITE_URL", "OIDC_SERVER_URL"]) {
  const url = value(urlName);
  if (url && !url.startsWith("https://")) {
    failures.push(`${urlName} must use https:// in production`);
  }
}

if (value("NEXT_PUBLIC_LEAD_ENDPOINT") !== "/api/leads") {
  failures.push("NEXT_PUBLIC_LEAD_ENDPOINT must be /api/leads in production");
}

const leadOrigins = value("LEAD_ALLOWED_ORIGINS");
if (leadOrigins && leadOrigins.split(",").some((origin) => !origin.trim().startsWith("https://"))) {
  failures.push("LEAD_ALLOWED_ORIGINS must contain only https:// origins in production");
}

const leadUpstream = value("LEAD_UPSTREAM_URL");
if (leadUpstream && !leadUpstream.startsWith("https://")) {
  failures.push("LEAD_UPSTREAM_URL must use https:// in production");
}

const corsOrigins = value("CORS_ALLOWED_ORIGINS");
if (corsOrigins && corsOrigins.split(",").some((origin) => !origin.trim().startsWith("https://"))) {
  failures.push("CORS_ALLOWED_ORIGINS must contain only https:// origins in production");
}

const key = value("CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY");
if (key) {
  try {
    const decoded = Buffer.from(key, "base64");
    if (decoded.length !== 32) {
      failures.push("CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY must decode to exactly 32 bytes");
    }
  } catch {
    failures.push("CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY must be valid base64");
  }
}

if (value("CANONBRIDGE_API_KEY_AUTH_ENABLED").toLowerCase() === "true") {
  requirePresent("CANONBRIDGE_API_KEYS");
}

if (failures.length > 0) {
  console.error("Production environment validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Production environment validation passed.");
