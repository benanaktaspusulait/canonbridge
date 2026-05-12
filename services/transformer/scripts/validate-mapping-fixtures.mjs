import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function importDependencies() {
  try {
    const jsonataModule = await import('jsonata');
    const ajvModule = await import('ajv/dist/2020.js');
    const formatsModule = await import('ajv-formats');
    return {
      jsonata: jsonataModule.default ?? jsonataModule,
      Ajv: ajvModule.default,
      addFormats: formatsModule.default ?? formatsModule
    };
  } catch (error) {
    console.error('Missing test dependencies. Run `npm install` before `npm run test:mapping-fixtures`.');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function readJson(relativePath, base = rootDir) {
  const contents = await readFile(path.join(base, relativePath), 'utf8');
  return JSON.parse(contents);
}

async function fileExists(relativePath, base = rootDir) {
  try {
    await readFile(path.join(base, relativePath), 'utf8');
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const absoluteDir = path.join(rootDir, dir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(relative));
    } else {
      files.push(relative);
    }
  }

  return files;
}

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)])
    );
  }

  return value;
}

function stableStringify(value) {
  return JSON.stringify(sortValue(value), null, 2);
}

function assertEqual(actual, expected, label) {
  const actualText = stableStringify(actual);
  const expectedText = stableStringify(expected);

  if (actualText !== expectedText) {
    throw new Error(`${label} output mismatch\nExpected:\n${expectedText}\nActual:\n${actualText}`);
  }
}

const { jsonata, Ajv, addFormats } = await importDependencies();
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const configFiles = (await walk('partners')).filter((file) => file.endsWith('/config.json'));

if (configFiles.length === 0) {
  throw new Error('No partner mapping config files found under partners/**/config.json');
}

let fixtureCount = 0;

for (const configFile of configFiles) {
  const config = await readJson(configFile);
  const mappingPath = config.mapping;
  const inputSchemaPath = config.inputSchema;
  const canonicalSchemaPath = config.canonicalSchema;

  for (const requiredPath of [mappingPath, inputSchemaPath, canonicalSchemaPath]) {
    if (!requiredPath || !await fileExists(requiredPath)) {
      throw new Error(`${configFile} references missing file: ${requiredPath}`);
    }
  }

  const inputSchema = await readJson(inputSchemaPath);
  const canonicalSchema = await readJson(canonicalSchemaPath);
  const validateInput = ajv.compile(inputSchema);
  const validateOutput = ajv.compile(canonicalSchema);
  const mapping = await readFile(path.join(rootDir, mappingPath), 'utf8');
  const expression = jsonata(mapping);
  const fixtureDir = config.fixtures?.[0]
    ? path.dirname(config.fixtures[0])
    : path.join(path.dirname(configFile), 'fixtures');
  const inputFiles = (await walk(fixtureDir)).filter((file) => file.endsWith('.input.json'));

  if (inputFiles.length === 0) {
    throw new Error(`${configFile} has no *.input.json fixtures`);
  }

  for (const inputFile of inputFiles) {
    const expectedFile = inputFile.replace(/\.input\.json$/, '.expected.json');
    if (!await fileExists(expectedFile)) {
      throw new Error(`Missing expected fixture for ${inputFile}: ${expectedFile}`);
    }

    const input = await readJson(inputFile);
    const expected = await readJson(expectedFile);

    if (!validateInput(input)) {
      throw new Error(`${inputFile} failed input schema validation: ${ajv.errorsText(validateInput.errors)}`);
    }

    const actual = await expression.evaluate(input);

    if (!validateOutput(actual)) {
      throw new Error(`${inputFile} produced invalid canonical output: ${ajv.errorsText(validateOutput.errors)}`);
    }

    assertEqual(actual, expected, inputFile);
    fixtureCount += 1;
    console.log(`ok ${inputFile}`);
  }
}

console.log(`Validated ${fixtureCount} mapping fixture(s).`);
