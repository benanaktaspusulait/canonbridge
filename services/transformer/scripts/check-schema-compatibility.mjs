import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function importDependencies() {
  try {
    const ajvModule = await import('ajv/dist/2020.js');
    const formatsModule = await import('ajv-formats');
    return {
      Ajv: ajvModule.default,
      addFormats: formatsModule.default ?? formatsModule
    };
  } catch (error) {
    console.error('Missing test dependencies. Run `npm install` before `npm run test:schema-compatibility`.');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function walkIfExists(dir) {
  try {
    const absoluteDir = path.join(rootDir, dir);
    const entries = await readdir(absoluteDir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const relative = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await walkIfExists(relative));
      } else {
        files.push(relative);
      }
    }

    return files;
  } catch {
    return [];
  }
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(rootDir, relativePath), 'utf8'));
}

const { Ajv, addFormats } = await importDependencies();
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaFiles = [
  ...await walkIfExists('schemas'),
  ...await walkIfExists('partners')
].filter((file) => file.endsWith('.schema.json'));

if (schemaFiles.length === 0) {
  throw new Error('No JSON Schema files found under schemas/ or partners/');
}

for (const schemaFile of schemaFiles) {
  const schema = await readJson(schemaFile);
  const valid = ajv.validateSchema(schema);
  if (!valid) {
    throw new Error(`${schemaFile} is not a valid JSON Schema: ${ajv.errorsText(ajv.errors)}`);
  }

  if (schemaFile.startsWith('schemas/canonical/') && !schema.required?.includes('eventId')) {
    throw new Error(`${schemaFile} must preserve the canonical envelope field: eventId`);
  }

  console.log(`ok ${schemaFile}`);
}

console.log(`Validated ${schemaFiles.length} schema file(s).`);
