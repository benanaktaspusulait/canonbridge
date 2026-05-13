#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const markdownMode = args.includes('--markdown');
const registerPath = args.find((arg) => !arg.startsWith('--'))
  ?? path.join(root, 'docs/testing/NO_CODE_INTEGRATION_GAP_REGISTER.md');
const markdown = await readFile(registerPath, 'utf8');

const rows = markdown
  .split('\n')
  .filter((line) => line.startsWith('| GAP-'))
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
  .map(([id, gap, impact, status, nextStep]) => ({ id, gap, impact, status: status.replaceAll('`', ''), nextStep }));

if (rows.length === 0) {
  console.error(`No GAP rows found in ${registerPath}`);
  process.exit(1);
}

const proven = rows.filter((row) => row.status === 'DONE').length;
const partial = rows.filter((row) => row.status === 'PARTIAL').length;
const open = rows.filter((row) => row.status === 'OPEN').length;
const blocked = rows.filter((row) => row.status === 'BLOCKED').length;
const inProgress = rows.filter((row) => row.status === 'IN_PROGRESS').length;

const output = {
  generatedAt: new Date().toISOString(),
  source: path.relative(root, registerPath),
  summary: {
    total: rows.length,
    proven,
    partial,
    open,
    blocked,
    inProgress,
  },
  matrix: rows.map((row) => ({
    id: row.id,
    status: row.status === 'DONE' ? 'PROVEN' : row.status,
    evidence: row.nextStep,
  })),
};

if (markdownMode) {
  console.log('| ID | Coverage | Evidence |');
  console.log('|---|---|---|');
  for (const row of output.matrix) {
    console.log(`| ${row.id} | ${row.status} | ${row.evidence.replaceAll('|', '\\|')} |`);
  }
} else {
  console.log(JSON.stringify(output, null, 2));
}

if (open > 0 || blocked > 0 || inProgress > 0) {
  process.exitCode = 2;
}
