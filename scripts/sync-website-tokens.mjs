#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "packages/tokens/src/index.css");
const targetPath = resolve(root, "website/app/brand-tokens.css");
const checkOnly = process.argv.includes("--check");

const source = readFileSync(sourcePath, "utf8").trimEnd();
const target = `/* Generated from packages/tokens/src/index.css. Run scripts/sync-website-tokens.mjs after token edits. */\n${source}\n`;
const current = readFileSync(targetPath, "utf8");

if (current === target) {
  console.log("Website brand tokens are in sync.");
  process.exit(0);
}

if (checkOnly) {
  console.error("Website brand tokens are out of sync. Run: node scripts/sync-website-tokens.mjs");
  process.exit(1);
}

writeFileSync(targetPath, target);
console.log("Synced website/app/brand-tokens.css from packages/tokens/src/index.css.");
