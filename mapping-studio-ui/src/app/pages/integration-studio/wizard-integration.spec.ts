import { describe, it, expect } from 'vitest';
import { targetFieldsFromCanonicalPayloadProperties } from './canonical-fields-from-schema';
import { collectSchemaValuePaths, isRootObjectSchema } from './json-schema-walk';
import { createStudioAjv, validateWithAjv, formatAjvIssueForList, instancePathToTargetKey } from './studio-ajv';
import { ruleToJsonataFragment, buildCombinedMappingExpression } from './rule-to-jsonata';
import type { MappingRule, TargetField } from './integration-studio.models';

const SAMPLE_CANONICAL_SCHEMA = {
  type: 'object',
  properties: {
    payload: {
      type: 'object',
      required: ['musteriAdi', 'durum', 'tarih'],
      properties: {
        musteriAdi: { type: 'string', description: 'Customer name' },
        durum: { type: 'string', description: 'Status' },
        tarih: { type: 'string', format: 'date', description: 'Order date' },
        adet: { type: 'number', description: 'Quantity' },
        etiketler: { type: 'array', items: { type: 'string' } },
        adres: { type: 'object', properties: { sehir: { type: 'string' } } }
      }
    }
  }
};

const SAMPLE_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    customer: {
      type: 'object',
      properties: {
        full_name: { type: 'string' },
        status: { type: 'string' }
      }
    },
    order: {
      type: 'object',
      properties: {
        placed_at: { type: 'string', format: 'date' },
        qty: { type: 'string' }
      }
    }
  }
};

function makeRule(overrides: Partial<MappingRule> = {}): MappingRule {
  return {
    id: 'r1',
    sourcePath: '',
    targetKey: 'field',
    transform: 'direct',
    paramA: '',
    paramB: '',
    paramC: '',
    advancedExpression: '',
    ...overrides
  };
}

describe('Wizard Step 2 – Target Schema', () => {
  describe('targetFieldsFromCanonicalPayloadProperties', () => {
    it('maps scalar string field', () => {
      const fields = targetFieldsFromCanonicalPayloadProperties(SAMPLE_CANONICAL_SCHEMA);
      const musteriAdi = fields.find(f => f.key === 'musteriAdi');
      expect(musteriAdi).toBeDefined();
      expect(musteriAdi?.type).toBe('string');
      expect(musteriAdi?.required).toBe(true);
      expect(musteriAdi?.source).toBe('schema');
    });

    it('maps date field via format hint', () => {
      const fields = targetFieldsFromCanonicalPayloadProperties(SAMPLE_CANONICAL_SCHEMA);
      const tarih = fields.find(f => f.key === 'tarih');
      expect(tarih?.type).toBe('date');
      expect(tarih?.required).toBe(true);
    });

    it('maps number field', () => {
      const fields = targetFieldsFromCanonicalPayloadProperties(SAMPLE_CANONICAL_SCHEMA);
      const adet = fields.find(f => f.key === 'adet');
      expect(adet?.type).toBe('number');
      expect(adet?.required).toBe(false);
    });

    it('marks array field as string type with [array] description', () => {
      const fields = targetFieldsFromCanonicalPayloadProperties(SAMPLE_CANONICAL_SCHEMA);
      const etiketler = fields.find(f => f.key === 'etiketler');
      expect(etiketler?.type).toBe('string');
      expect(etiketler?.description).toBe('[array]');
    });

    it('marks object field as string type with [object] description', () => {
      const fields = targetFieldsFromCanonicalPayloadProperties(SAMPLE_CANONICAL_SCHEMA);
      const adres = fields.find(f => f.key === 'adres');
      expect(adres?.type).toBe('string');
      expect(adres?.description).toBe('[object]');
    });

    it('returns empty array for schema without payload', () => {
      const fields = targetFieldsFromCanonicalPayloadProperties({ type: 'object', properties: {} });
      expect(fields).toEqual([]);
    });

    it('returns empty array for completely empty schema', () => {
      const fields = targetFieldsFromCanonicalPayloadProperties({});
      expect(fields).toEqual([]);
    });
  });

  describe('isRootObjectSchema', () => {
    it('returns true for object schema', () => {
      expect(isRootObjectSchema({ type: 'object' })).toBe(true);
    });

    it('returns false for non-object schema', () => {
      expect(isRootObjectSchema({ type: 'string' })).toBe(false);
    });

    it('returns false for null', () => {
      expect(isRootObjectSchema(null)).toBe(false);
    });

    it('returns false for primitives', () => {
      expect(isRootObjectSchema('string')).toBe(false);
      expect(isRootObjectSchema(42)).toBe(false);
    });
  });
});

describe('Wizard Step 2 – Source Field Discovery', () => {
  describe('collectSchemaValuePaths', () => {
    it('collects nested scalar paths', () => {
      const out = new Set<string>();
      collectSchemaValuePaths(SAMPLE_INPUT_SCHEMA, '', out);
      expect(out).toContain('customer.full_name');
      expect(out).toContain('customer.status');
      expect(out).toContain('order.placed_at');
      expect(out).toContain('order.qty');
    });

    it('handles array items via [0] notation', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      };
      const out = new Set<string>();
      collectSchemaValuePaths(schema, 'items', out);
      expect(out).toContain('items[0].id');
    });

    it('collects scalar leaf directly', () => {
      const schema = { type: 'string' };
      const out = new Set<string>();
      collectSchemaValuePaths(schema, 'name', out);
      expect(out).toContain('name');
    });

    it('does not add empty basePath as leaf', () => {
      const schema = { type: 'string' };
      const out = new Set<string>();
      collectSchemaValuePaths(schema, '', out);
      expect(out.size).toBe(0);
    });

    it('handles null/undefined gracefully', () => {
      const out = new Set<string>();
      expect(() => collectSchemaValuePaths(null as unknown as Record<string, unknown>, '', out)).not.toThrow();
    });
  });
});

describe('Wizard Step 3 – Mapping Rules (all 24 transforms)', () => {
  const TRANSFORMS: Array<{ transform: MappingRule['transform']; params: Partial<MappingRule>; check: (s: string) => boolean }> = [
    { transform: 'direct', params: { sourcePath: 'a.b' }, check: s => s === 'a.b' },
    { transform: 'number_coerce', params: { sourcePath: 'qty' }, check: s => s.includes('$number') },
    { transform: 'string_uppercase', params: { sourcePath: 'name' }, check: s => s.includes('$uppercase') },
    { transform: 'string_lowercase', params: { sourcePath: 'email' }, check: s => s.includes('$lowercase') },
    { transform: 'string_trim', params: { sourcePath: 'desc' }, check: s => s.includes('$trim') },
    { transform: 'string_substring', params: { sourcePath: 'text', paramA: '2', paramB: '5' }, check: s => s.includes('$substring') && s.includes('2') && s.includes('5') },
    { transform: 'string_replace', params: { sourcePath: 'body', paramA: 'foo', paramB: 'bar' }, check: s => s.includes('$replace') && s.includes("'foo'") && s.includes("'bar'") },
    { transform: 'array_join', params: { sourcePath: 'tags', paramA: '|' }, check: s => s.includes('$join') && s.includes("'|'") },
    { transform: 'array_first', params: { sourcePath: 'items' }, check: s => s.includes('[0]') },
    { transform: 'array_last', params: { sourcePath: 'items' }, check: s => s.includes('$count') },
    { transform: 'array_element', params: { sourcePath: 'rows', paramA: '2' }, check: s => s.includes('[1]') },
    { transform: 'array_count', params: { sourcePath: 'list' }, check: s => s.includes('$count') },
    { transform: 'array_filter_equals', params: { sourcePath: 'users', paramA: 'role', paramB: 'admin' }, check: s => s.includes("role = 'admin'") },
    { transform: 'math_sum', params: { sourcePath: 'prices' }, check: s => s.includes('$sum') },
    { transform: 'math_average', params: { sourcePath: 'scores' }, check: s => s.includes('$average') },
    { transform: 'math_min', params: { sourcePath: 'vals' }, check: s => s.includes('$min') },
    { transform: 'math_max', params: { sourcePath: 'vals' }, check: s => s.includes('$max') },
    { transform: 'default_value', params: { sourcePath: 'opt', paramA: 'N/A' }, check: s => s.includes("'N/A'") && s.includes('$exists') },
    { transform: 'combine', params: { sourcePath: 'first', paramA: 'last', paramB: ' ' }, check: s => s.includes('$join') },
    { transform: 'enum_map', params: { sourcePath: 'st', paramA: 'A=Active,B=Passive' }, check: s => s.includes('$lookup') && s.includes("'Active'") },
    { transform: 'conditional_value', params: { sourcePath: 'flag', paramA: 'true', paramB: 'Yes', paramC: 'No' }, check: s => s.includes("'Yes'") && s.includes("'No'") && s.includes('?') },
    { transform: 'date_format', params: { sourcePath: 'dt', paramA: 'yyyy-MM-dd', paramB: 'dd/MM/yyyy' }, check: s => s.includes('$split') },
    { transform: 'template_string', params: { sourcePath: '', paramA: 'Hello {{name}}!' }, check: s => s.includes('name') && s.includes("'Hello '") },
  ];

  for (const { transform, params, check } of TRANSFORMS) {
    it(`generates valid JSONata for: ${transform}`, () => {
      const rule = makeRule({ transform, ...params });
      const expr = ruleToJsonataFragment(rule);
      expect(typeof expr).toBe('string');
      expect(expr.length).toBeGreaterThan(0);
      expect(check(expr)).toBe(true);
    });
  }

  it('explicit jsonataExpression overrides visual transform', () => {
    const rule = makeRule({ sourcePath: 'x', transform: 'string_uppercase', jsonataExpression: '$custom(x)' });
    expect(ruleToJsonataFragment(rule)).toBe('$custom(x)');
  });

  it('advancedExpression used when jsonataExpression is absent', () => {
    const rule = makeRule({ sourcePath: 'x', transform: 'direct', advancedExpression: '$advanced(x)' });
    expect(ruleToJsonataFragment(rule)).toBe('$advanced(x)');
  });
});

describe('Wizard Step 3 – Combined Expression Builder', () => {
  it('builds empty object for zero rules', () => {
    expect(buildCombinedMappingExpression([])).toBe('{\n\n}');
  });

  it('builds single-field mapping', () => {
    const rules: MappingRule[] = [makeRule({ targetKey: 'name', sourcePath: 'fullName', transform: 'direct' })];
    const expr = buildCombinedMappingExpression(rules);
    expect(expr).toContain('"name"');
    expect(expr).toContain('fullName');
    expect(expr).toMatch(/^\{/);
    expect(expr).toMatch(/\}$/);
  });

  it('builds full demo mapping from DEFAULT_RULES pattern', () => {
    const rules: MappingRule[] = [
      makeRule({ id: 'r1', targetKey: 'musteriAdi', sourcePath: 'customer.full_name', transform: 'direct' }),
      makeRule({ id: 'r2', targetKey: 'durum', sourcePath: 'customer.status', transform: 'enum_map', paramA: '[{"source":"A","target":"AKTIF"}]' }),
      makeRule({ id: 'r3', targetKey: 'tarih', sourcePath: 'order.placed_at', transform: 'date_format', paramA: 'yyyy-MM-dd', paramB: 'dd/MM/yyyy' }),
      makeRule({ id: 'r4', targetKey: 'adet', sourcePath: 'order.qty', transform: 'number_coerce' })
    ];
    const expr = buildCombinedMappingExpression(rules);
    expect(expr).toContain('"musteriAdi"');
    expect(expr).toContain('"durum"');
    expect(expr).toContain('"tarih"');
    expect(expr).toContain('"adet"');
    expect(expr).toContain('$lookup');
    expect(expr).toContain('$split');
    expect(expr).toContain('$number');
  });

  it('keys are JSON-encoded in combined expression', () => {
    const rules: MappingRule[] = [makeRule({ targetKey: 'my field', sourcePath: 'x', transform: 'direct' })];
    const expr = buildCombinedMappingExpression(rules);
    expect(expr).toContain('"my field"');
  });
});

describe('Wizard Step 4 – Source Validation (AJV)', () => {
  const ajv = createStudioAjv();

  it('validates data matching schema', () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name']
    };
    const result = validateWithAjv(ajv, schema, { name: 'Ayşe' });
    expect(result.ok).toBe(true);
  });

  it('returns issues for missing required field', () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name']
    };
    const result = validateWithAjv(ajv, schema, {});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  it('returns issues for wrong type', () => {
    const schema = { type: 'object', properties: { count: { type: 'number' } } };
    const result = validateWithAjv(ajv, schema, { count: 'not-a-number' });
    expect(result.ok).toBe(false);
  });

  it('returns error issue for invalid schema', () => {
    const result = validateWithAjv(ajv, null as unknown as object, {});
    expect(result.ok).toBe(false);
  });

  it('validates complex nested object schema', () => {
    const schema = {
      type: 'object',
      properties: {
        customer: {
          type: 'object',
          properties: { name: { type: 'string' } },
          required: ['name']
        }
      },
      required: ['customer']
    };
    const valid = validateWithAjv(ajv, schema, { customer: { name: 'Ali' } });
    expect(valid.ok).toBe(true);

    const invalid = validateWithAjv(ajv, schema, { customer: {} });
    expect(invalid.ok).toBe(false);
  });

  describe('formatAjvIssueForList', () => {
    it('formats issue message with alan/hata prefix', () => {
      const msg = formatAjvIssueForList('musteriAdi', 'must be a string');
      expect(msg).toContain('musteriAdi');
      expect(msg).toContain('must be a string');
    });
  });

  describe('instancePathToTargetKey', () => {
    it('returns last segment for simple path', () => {
      expect(instancePathToTargetKey('/name')).toBe('name');
    });

    it('returns payload child for payload-prefixed path', () => {
      expect(instancePathToTargetKey('/payload/musteriAdi')).toBe('musteriAdi');
    });

    it('returns null for empty path', () => {
      expect(instancePathToTargetKey('')).toBeNull();
    });

    it('returns last segment for deeply nested path', () => {
      expect(instancePathToTargetKey('/a/b/c/fieldName')).toBe('fieldName');
    });
  });
});

describe('Wizard End-to-End Flow Simulation', () => {
  it('full wizard flow: schema → fields → rules → expression → validation', () => {
    const fields: TargetField[] = targetFieldsFromCanonicalPayloadProperties(SAMPLE_CANONICAL_SCHEMA);
    expect(fields.length).toBeGreaterThan(0);

    const sourcePaths = new Set<string>();
    collectSchemaValuePaths(SAMPLE_INPUT_SCHEMA, '', sourcePaths);
    expect(sourcePaths.size).toBeGreaterThan(0);

    const rules: MappingRule[] = [
      makeRule({ id: 'r1', targetKey: 'musteriAdi', sourcePath: 'customer.full_name', transform: 'direct' }),
      makeRule({ id: 'r2', targetKey: 'durum', sourcePath: 'customer.status', transform: 'string_uppercase' }),
      makeRule({ id: 'r3', targetKey: 'tarih', sourcePath: 'order.placed_at', transform: 'date_format', paramA: 'yyyy-MM-dd', paramB: 'dd/MM/yyyy' }),
      makeRule({ id: 'r4', targetKey: 'adet', sourcePath: 'order.qty', transform: 'number_coerce' })
    ];

    const expression = buildCombinedMappingExpression(rules);
    expect(expression).toContain('"musteriAdi"');
    expect(expression).toContain('"durum"');
    expect(expression).toContain('"tarih"');
    expect(expression).toContain('"adet"');

    const ajv = createStudioAjv();
    const outputSchema = {
      type: 'object',
      properties: {
        musteriAdi: { type: 'string' },
        durum: { type: 'string' },
        tarih: { type: 'string' },
        adet: { type: 'number' }
      },
      required: ['musteriAdi', 'durum', 'tarih']
    };

    const mockOutput = { musteriAdi: 'Ayşe', durum: 'ACTIVE', tarih: '10/05/2026', adet: 4 };
    const result = validateWithAjv(ajv, outputSchema, mockOutput);
    expect(result.ok).toBe(true);

    const missingRequired = validateWithAjv(ajv, outputSchema, { adet: 4 });
    expect(missingRequired.ok).toBe(false);
  });
});
