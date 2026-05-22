#!/usr/bin/env node
/**
 * Token Contract Check
 * Verifies that mapping-studio-ui/src/styles/brand-tokens.css
 * stays in sync with packages/tokens/src/index.css
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');

const sourceTokens = resolve(root, 'packages/tokens/src/index.css');
const studioTokens = resolve(root, 'mapping-studio-ui/src/styles/brand-tokens.css');

try {
  const source = readFileSync(sourceTokens, 'utf-8').trim();
  const studio = readFileSync(studioTokens, 'utf-8')
    .replace(/^\/\*.*?\*\/\n?/s, '') // strip leading comment
    .trim();

  // Extract CSS custom properties from both files
  const extractVars = (css) => {
    const vars = new Map();
    const regex = /--([\w-]+)\s*:\s*([^;]+)/g;
    let match;
    while ((match = regex.exec(css)) !== null) {
      vars.set(match[1], match[2].trim());
    }
    return vars;
  };

  const sourceVars = extractVars(source);
  const studioVars = extractVars(studio);

  let mismatches = 0;

  for (const [key, value] of sourceVars) {
    if (!studioVars.has(key)) {
      console.error(`❌ Missing in studio: --${key}`);
      mismatches++;
    } else if (studioVars.get(key) !== value) {
      console.error(`❌ Value mismatch for --${key}:`);
      console.error(`   source: ${value}`);
      console.error(`   studio: ${studioVars.get(key)}`);
      mismatches++;
    }
  }

  if (mismatches === 0) {
    console.log('✅ Token contract check passed — studio tokens match source.');
    process.exit(0);
  } else {
    console.error(`\n${mismatches} token mismatch(es) found.`);
    console.error('Run: node scripts/sync-website-tokens.mjs to fix.');
    process.exit(1);
  }
} catch (err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  Token files not found, skipping check.');
    process.exit(0);
  }
  throw err;
}
