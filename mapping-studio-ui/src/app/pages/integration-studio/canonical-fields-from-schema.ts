import type { TargetField } from './integration-studio.models';

/** Requirement 3: walk `payload.properties` of canonical JSON Schema. */
export function targetFieldsFromCanonicalPayloadProperties(
  schema: Record<string, unknown>
): TargetField[] {
  const rootProps = schema['properties'] as Record<string, unknown> | undefined;
  const payload = rootProps?.['payload'] as Record<string, unknown> | undefined;
  const payProps = payload?.['properties'];
  if (!payProps || typeof payProps !== 'object') {
    return [];
  }
  const props = payProps as Record<string, unknown>;
  const reqRaw = payload['required'];
  const required = Array.isArray(reqRaw) ? (reqRaw as string[]) : [];
  const out: TargetField[] = [];

  for (const [key, subRaw] of Object.entries(props)) {
    const sub = subRaw as Record<string, unknown>;
    const st = sub['type'];
    let type: TargetField['type'] = 'string';
    let description = '';

    if (st === 'number' || st === 'integer') {
      type = 'number';
    } else if (st === 'string') {
      const fmt = sub['format'];
      type = fmt === 'date-time' || fmt === 'date' ? 'date' : 'string';
    } else if (st === 'array') {
      type = 'string';
      description = '[array]';
    } else if (st === 'object') {
      type = 'string';
      description = '[object]';
    }

    out.push({
      key,
      type,
      required: required.includes(key),
      description,
      source: 'schema'
    });
  }
  return out;
}
