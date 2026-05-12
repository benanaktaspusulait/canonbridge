import { describe, it, expect } from 'vitest';
import { ruleToJsonataFragment, buildCombinedMappingExpression } from './rule-to-jsonata';
import type { MappingRule } from './integration-studio.models';

function createRule(overrides: Partial<MappingRule> = {}): MappingRule {
  return {
    id: 'test-rule',
    sourcePath: 'testField',
    targetKey: 'output',
    transform: 'direct',
    paramA: '',
    paramB: '',
    paramC: '',
    advancedExpression: '',
    ...overrides
  };
}

describe('rule-to-jsonata', () => {
  describe('ruleToJsonataFragment', () => {
    describe('direct mapping', () => {
      it('should return source path for direct transform', () => {
        const rule = createRule({ sourcePath: 'user.name', transform: 'direct' });
        expect(ruleToJsonataFragment(rule)).toBe('user.name');
      });

      it('should return $ for empty source path', () => {
        const rule = createRule({ sourcePath: '', transform: 'direct' });
        expect(ruleToJsonataFragment(rule)).toBe('$');
      });
    });

    describe('explicit JSONata', () => {
      it('should use jsonataExpression when provided', () => {
        const rule = createRule({
          jsonataExpression: '$uppercase(name)',
          transform: 'direct'
        });
        expect(ruleToJsonataFragment(rule)).toBe('$uppercase(name)');
      });

      it('should use advancedExpression when jsonataExpression is empty', () => {
        const rule = createRule({
          advancedExpression: '$lowercase(name)',
          transform: 'direct'
        });
        expect(ruleToJsonataFragment(rule)).toBe('$lowercase(name)');
      });

      it('should prefer jsonataExpression over advancedExpression', () => {
        const rule = createRule({
          jsonataExpression: '$uppercase(name)',
          advancedExpression: '$lowercase(name)',
          transform: 'direct'
        });
        expect(ruleToJsonataFragment(rule)).toBe('$uppercase(name)');
      });
    });

    describe('number_coerce', () => {
      it('should wrap in $number()', () => {
        const rule = createRule({ sourcePath: 'price', transform: 'number_coerce' });
        expect(ruleToJsonataFragment(rule)).toBe('$number(price)');
      });
    });

    describe('string transforms', () => {
      it('should uppercase string', () => {
        const rule = createRule({ sourcePath: 'name', transform: 'string_uppercase' });
        expect(ruleToJsonataFragment(rule)).toBe('$uppercase($string(name))');
      });

      it('should lowercase string', () => {
        const rule = createRule({ sourcePath: 'name', transform: 'string_lowercase' });
        expect(ruleToJsonataFragment(rule)).toBe('$lowercase($string(name))');
      });

      it('should trim string', () => {
        const rule = createRule({ sourcePath: 'name', transform: 'string_trim' });
        expect(ruleToJsonataFragment(rule)).toBe('$trim($string(name))');
      });

      it('should substring with start only', () => {
        const rule = createRule({
          sourcePath: 'text',
          transform: 'string_substring',
          paramA: '5'
        });
        expect(ruleToJsonataFragment(rule)).toBe('$substring($string(text), 5)');
      });

      it('should substring with start and length', () => {
        const rule = createRule({
          sourcePath: 'text',
          transform: 'string_substring',
          paramA: '5',
          paramB: '10'
        });
        expect(ruleToJsonataFragment(rule)).toBe('$substring($string(text), 5, 10)');
      });

      it('should replace string', () => {
        const rule = createRule({
          sourcePath: 'text',
          transform: 'string_replace',
          paramA: 'old',
          paramB: 'new'
        });
        expect(ruleToJsonataFragment(rule)).toBe("$replace($string(text), 'old', 'new')");
      });

      it('should escape special characters in replace', () => {
        const rule = createRule({
          sourcePath: 'text',
          transform: 'string_replace',
          paramA: "it's",
          paramB: 'it is'
        });
        expect(ruleToJsonataFragment(rule)).toBe("$replace($string(text), 'it\\'s', 'it is')");
      });
    });

    describe('array transforms', () => {
      it('should join array with default delimiter', () => {
        const rule = createRule({
          sourcePath: 'tags',
          transform: 'array_join',
          paramA: ''
        });
        expect(ruleToJsonataFragment(rule)).toBe("$join(tags, ',')");
      });

      it('should join array with custom delimiter', () => {
        const rule = createRule({
          sourcePath: 'tags',
          transform: 'array_join',
          paramA: ' | '
        });
        expect(ruleToJsonataFragment(rule)).toBe("$join(tags, ' | ')");
      });

      it('should get first element', () => {
        const rule = createRule({ sourcePath: 'items', transform: 'array_first' });
        expect(ruleToJsonataFragment(rule)).toBe('items[0]');
      });

      it('should get last element', () => {
        const rule = createRule({ sourcePath: 'items', transform: 'array_last' });
        expect(ruleToJsonataFragment(rule)).toBe('items[$count(items) - 1]');
      });

      it('should get element by index (1-based)', () => {
        const rule = createRule({
          sourcePath: 'items',
          transform: 'array_element',
          paramA: '3'
        });
        expect(ruleToJsonataFragment(rule)).toBe('items[2]'); // 3rd element = index 2
      });

      it('should count array elements', () => {
        const rule = createRule({ sourcePath: 'items', transform: 'array_count' });
        expect(ruleToJsonataFragment(rule)).toBe('$count(items)');
      });

      it('should filter array by field equals value', () => {
        const rule = createRule({
          sourcePath: 'users',
          transform: 'array_filter_equals',
          paramA: 'status',
          paramB: 'active'
        });
        expect(ruleToJsonataFragment(rule)).toBe("users[status = 'active']");
      });

      it('should filter array by value equals (no field)', () => {
        const rule = createRule({
          sourcePath: 'statuses',
          transform: 'array_filter_equals',
          paramA: '',
          paramB: 'active'
        });
        expect(ruleToJsonataFragment(rule)).toBe("statuses[$string($) = 'active']");
      });
    });

    describe('math transforms', () => {
      it('should sum array', () => {
        const rule = createRule({ sourcePath: 'prices', transform: 'math_sum' });
        expect(ruleToJsonataFragment(rule)).toBe('$sum(prices)');
      });

      it('should average array', () => {
        const rule = createRule({ sourcePath: 'scores', transform: 'math_average' });
        expect(ruleToJsonataFragment(rule)).toBe('$average(scores)');
      });

      it('should find min', () => {
        const rule = createRule({ sourcePath: 'values', transform: 'math_min' });
        expect(ruleToJsonataFragment(rule)).toBe('$min(values)');
      });

      it('should find max', () => {
        const rule = createRule({ sourcePath: 'values', transform: 'math_max' });
        expect(ruleToJsonataFragment(rule)).toBe('$max(values)');
      });
    });

    describe('default_value', () => {
      it('should provide default value', () => {
        const rule = createRule({
          sourcePath: 'optional',
          transform: 'default_value',
          paramA: 'N/A'
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain('optional');
        expect(result).toContain("'N/A'");
        expect(result).toContain('$exists');
      });
    });

    describe('combine', () => {
      it('should combine two fields with default separator', () => {
        const rule = createRule({
          sourcePath: 'firstName',
          transform: 'combine',
          paramA: 'lastName',
          paramB: ''
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain('firstName');
        expect(result).toContain('lastName');
        expect(result).toContain("' '");
      });

      it('should combine two fields with custom separator', () => {
        const rule = createRule({
          sourcePath: 'firstName',
          transform: 'combine',
          paramA: 'lastName',
          paramB: ', '
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain("', '");
      });
    });

    describe('enum_map', () => {
      it('should map enum values from JSON array', () => {
        const rule = createRule({
          sourcePath: 'status',
          transform: 'enum_map',
          paramA: '[{"source":"A","target":"Active"},{"source":"I","target":"Inactive"}]'
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain('$lookup');
        expect(result).toContain("'A'");
        expect(result).toContain("'Active'");
        expect(result).toContain("'I'");
        expect(result).toContain("'Inactive'");
      });

      it('should map enum values from legacy comma syntax', () => {
        const rule = createRule({
          sourcePath: 'status',
          transform: 'enum_map',
          paramA: 'A=Active,I=Inactive'
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain('$lookup');
        expect(result).toContain("'A'");
        expect(result).toContain("'Active'");
      });

      it('should handle empty enum map', () => {
        const rule = createRule({
          sourcePath: 'status',
          transform: 'enum_map',
          paramA: ''
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain('$lookup');
        expect(result).toContain('{}');
      });
    });

    describe('conditional_value', () => {
      it('should create if-then-else expression', () => {
        const rule = createRule({
          sourcePath: 'isActive',
          transform: 'conditional_value',
          paramA: 'true',
          paramB: 'Yes',
          paramC: 'No'
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain('isActive');
        expect(result).toContain("'true'");
        expect(result).toContain("'Yes'");
        expect(result).toContain("'No'");
        expect(result).toContain('?');
        expect(result).toContain(':');
      });
    });

    describe('date_format', () => {
      it('should format date from yyyy-MM-dd to dd/MM/yyyy', () => {
        const rule = createRule({
          sourcePath: 'birthDate',
          transform: 'date_format',
          paramA: 'yyyy-MM-dd',
          paramB: 'dd/MM/yyyy'
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain('$split');
        expect(result).toContain("'-'");
        expect(result).toContain('[2]');
        expect(result).toContain('[1]');
        expect(result).toContain('[0]');
      });

      it('should fallback to string for unsupported formats', () => {
        const rule = createRule({
          sourcePath: 'date',
          transform: 'date_format',
          paramA: 'MM/dd/yyyy',
          paramB: 'yyyy-MM-dd'
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toBe('$string(date)');
      });
    });

    describe('template_string', () => {
      it('should create template with placeholders', () => {
        const rule = createRule({
          sourcePath: '',
          transform: 'template_string',
          paramA: 'Hello {{firstName}} {{lastName}}!'
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain('firstName');
        expect(result).toContain('lastName');
        expect(result).toContain("'Hello '");
        expect(result).toContain("'!'");
        expect(result).toContain('&');
      });

      it('should handle template without placeholders', () => {
        const rule = createRule({
          sourcePath: '',
          transform: 'template_string',
          paramA: 'Static text'
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toBe("'Static text'");
      });

      it('should handle empty template', () => {
        const rule = createRule({
          sourcePath: '',
          transform: 'template_string',
          paramA: ''
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toBe("''");
      });

      it('should escape special characters in template', () => {
        const rule = createRule({
          sourcePath: '',
          transform: 'template_string',
          paramA: "It's {{name}}'s turn"
        });
        const result = ruleToJsonataFragment(rule);
        expect(result).toContain("\\'");
      });
    });
  });

  describe('buildCombinedMappingExpression', () => {
    it('should build empty object for no rules', () => {
      const result = buildCombinedMappingExpression([]);
      expect(result).toBe('{\n\n}');
    });

    it('should build single rule mapping', () => {
      const rules = [
        createRule({ targetKey: 'name', sourcePath: 'fullName', transform: 'direct' })
      ];
      const result = buildCombinedMappingExpression(rules);
      expect(result).toContain('"name"');
      expect(result).toContain('fullName');
    });

    it('should build multiple rules mapping', () => {
      const rules = [
        createRule({ targetKey: 'name', sourcePath: 'fullName', transform: 'direct' }),
        createRule({ targetKey: 'age', sourcePath: 'years', transform: 'number_coerce' }),
        createRule({ targetKey: 'email', sourcePath: 'contact.email', transform: 'string_lowercase' })
      ];
      const result = buildCombinedMappingExpression(rules);
      expect(result).toContain('"name"');
      expect(result).toContain('"age"');
      expect(result).toContain('"email"');
      expect(result).toContain('fullName');
      expect(result).toContain('$number(years)');
      expect(result).toContain('$lowercase($string(contact.email))');
    });

    it('should format as valid JSON object', () => {
      const rules = [
        createRule({ targetKey: 'field1', sourcePath: 'source1', transform: 'direct' }),
        createRule({ targetKey: 'field2', sourcePath: 'source2', transform: 'direct' })
      ];
      const result = buildCombinedMappingExpression(rules);
      expect(result).toMatch(/^\{/);
      expect(result).toMatch(/\}$/);
      expect(result).toContain(',\n');
    });
  });
});
