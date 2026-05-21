#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "packages/tokens/src/index.css");
const targets = [
  {
    path: resolve(root, "website/app/brand-tokens.css"),
    header: "/* Generated from packages/tokens/src/index.css. Run scripts/sync-website-tokens.mjs after token edits. */",
  },
  {
    path: resolve(root, "mapping-studio-ui/src/styles/brand-tokens.css"),
    header: "/* Generated from packages/tokens/src/index.css. Run scripts/sync-website-tokens.mjs after token edits. */",
  },
];
const checkOnly = process.argv.includes("--check");

const source = readFileSync(sourcePath, "utf8").trimEnd();
const staleTargets = targets.filter((target) => {
  const expected = `${target.header}\n${source}\n`;
  return readFileSync(target.path, "utf8") !== expected;
});

if (staleTargets.length === 0) {
  console.log("Brand token snapshots are in sync.");
  process.exit(0);
}

if (checkOnly) {
  console.error("Brand token snapshots are out of sync. Run: node scripts/sync-website-tokens.mjs");
  process.exit(1);
}

for (const target of staleTargets) {
  writeFileSync(target.path, `${target.header}\n${source}\n`);
}

console.log("Synced brand token snapshots from packages/tokens/src/index.css.");
