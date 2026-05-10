import Ajv2020Import from 'ajv/dist/2020.js';
import addFormatsImport from 'ajv-formats';

const Ajv2020 = Ajv2020Import as unknown as new (opts?: import('ajv').Options) => import('ajv').Ajv;
const addFormats = addFormatsImport as unknown as (instance: import('ajv').Ajv) => void;

export type AjvIssue = { instancePath: string; message: string };

export function createStudioAjv(): import('ajv').Ajv {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
}

export function validateWithAjv(
  ajv: import('ajv').Ajv,
  schema: unknown,
  data: unknown
): { ok: true } | { ok: false; issues: AjvIssue[] } {
  try {
    const validate = ajv.compile(schema as object);
    if (validate(data)) {
      return { ok: true };
    }
    const errs = validate.errors ?? [];
    return {
      ok: false,
      issues: errs.map(e => ({
        instancePath: e.instancePath ?? '',
        message: e.message ?? 'validation error'
      }))
    };
  } catch (e) {
    return {
      ok: false,
      issues: [
        {
          instancePath: '',
          message: e instanceof Error ? e.message : String(e)
        }
      ]
    };
  }
}

export function formatAjvIssueForList(targetKey: string, message: string): string {
  return `alan: ${targetKey}, hata: ${message}`;
}

/** Map JSON Schema instancePath to a flat mapping target key when possible. */
export function instancePathToTargetKey(instancePath: string): string | null {
  const parts = instancePath.replace(/^\//, '').split('/').filter(Boolean);
  if (!parts.length) return null;
  if (parts[0] === 'payload' && parts.length >= 2) {
    return parts[1] ?? null;
  }
  return parts[parts.length - 1] ?? null;
}
