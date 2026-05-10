/** Recursively collect dot-paths to scalar-ish leaves from a JSON Schema (draft 2020-12 style). */
export function collectSchemaValuePaths(
  schema: Record<string, unknown>,
  basePath: string,
  out: Set<string>
): void {
  if (!schema || typeof schema !== 'object') return;

  const propsRaw = schema['properties'];
  if (schema['type'] === 'object' && propsRaw && typeof propsRaw === 'object') {
    for (const [k, subRaw] of Object.entries(propsRaw as Record<string, unknown>)) {
      const sub = subRaw as Record<string, unknown>;
      const p = basePath ? `${basePath}.${k}` : k;
      collectSchemaValuePaths(sub, p, out);
    }
    return;
  }

  const items = schema['items'];
  if (schema['type'] === 'array' && items) {
    const p = `${basePath}[0]`;
    collectSchemaValuePaths(items as Record<string, unknown>, p, out);
    return;
  }

  if (basePath) {
    out.add(basePath);
  }
}

export function isRootObjectSchema(doc: unknown): doc is Record<string, unknown> {
  return doc !== null && typeof doc === 'object' && (doc as Record<string, unknown>)['type'] === 'object';
}
