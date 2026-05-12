import { describe, it, expect } from 'vitest';
import { getTransformParamLabels, isParamVisible, getVisibleParams } from './transform-param-labels';

describe('Transform Param Labels', () => {
  describe('getTransformParamLabels', () => {
    it('should return empty for direct transform', () => {
      const labels = getTransformParamLabels('direct');
      expect(labels).toEqual({});
    });

    it('should return correct labels for date_format', () => {
      const labels = getTransformParamLabels('date_format');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('Input Format');
      expect(labels.paramB).toBeDefined();
      expect(labels.paramB?.label).toBe('Output Format');
      expect(labels.paramC).toBeUndefined();
    });

    it('should return correct labels for enum_map', () => {
      const labels = getTransformParamLabels('enum_map');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('Mapping Table (JSON)');
      expect(labels.paramA?.type).toBe('json');
      expect(labels.paramB).toBeUndefined();
    });

    it('should return correct labels for default_value', () => {
      const labels = getTransformParamLabels('default_value');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('Default Value');
      expect(labels.paramA?.required).toBe(true);
    });

    it('should return correct labels for combine', () => {
      const labels = getTransformParamLabels('combine');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('Second Field Path');
      expect(labels.paramB).toBeDefined();
      expect(labels.paramB?.label).toBe('Separator');
      expect(labels.paramB?.required).toBe(false);
    });

    it('should return correct labels for string_substring', () => {
      const labels = getTransformParamLabels('string_substring');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('Start Position');
      expect(labels.paramA?.type).toBe('number');
      expect(labels.paramB).toBeDefined();
      expect(labels.paramB?.label).toBe('Length');
    });

    it('should return correct labels for string_replace', () => {
      const labels = getTransformParamLabels('string_replace');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('Find Text');
      expect(labels.paramB).toBeDefined();
      expect(labels.paramB?.label).toBe('Replace With');
    });

    it('should return correct labels for array_filter_equals', () => {
      const labels = getTransformParamLabels('array_filter_equals');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('Filter Field');
      expect(labels.paramB).toBeDefined();
      expect(labels.paramB?.label).toBe('Filter Value');
    });

    it('should return correct labels for conditional_value', () => {
      const labels = getTransformParamLabels('conditional_value');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('When Equals');
      expect(labels.paramB).toBeDefined();
      expect(labels.paramB?.label).toBe('Then Value');
      expect(labels.paramC).toBeDefined();
      expect(labels.paramC?.label).toBe('Else Value');
    });

    it('should return correct labels for template_string', () => {
      const labels = getTransformParamLabels('template_string');
      expect(labels.paramA).toBeDefined();
      expect(labels.paramA?.label).toBe('Template');
      expect(labels.paramA?.type).toBe('textarea');
    });

    it('should return empty for transforms without parameters', () => {
      const transforms = [
        'number_coerce',
        'string_uppercase',
        'string_lowercase',
        'string_trim',
        'array_first',
        'array_last',
        'array_count',
        'math_sum',
        'math_average',
        'math_min',
        'math_max'
      ] as const;

      transforms.forEach(transform => {
        const labels = getTransformParamLabels(transform);
        expect(labels).toEqual({});
      });
    });
  });

  describe('isParamVisible', () => {
    it('should return false for direct transform', () => {
      expect(isParamVisible('direct', 'paramA')).toBe(false);
      expect(isParamVisible('direct', 'paramB')).toBe(false);
      expect(isParamVisible('direct', 'paramC')).toBe(false);
    });

    it('should return correct visibility for date_format', () => {
      expect(isParamVisible('date_format', 'paramA')).toBe(true);
      expect(isParamVisible('date_format', 'paramB')).toBe(true);
      expect(isParamVisible('date_format', 'paramC')).toBe(false);
    });

    it('should return correct visibility for conditional_value', () => {
      expect(isParamVisible('conditional_value', 'paramA')).toBe(true);
      expect(isParamVisible('conditional_value', 'paramB')).toBe(true);
      expect(isParamVisible('conditional_value', 'paramC')).toBe(true);
    });
  });

  describe('getVisibleParams', () => {
    it('should return empty array for direct transform', () => {
      const params = getVisibleParams('direct');
      expect(params).toEqual([]);
    });

    it('should return correct params for date_format', () => {
      const params = getVisibleParams('date_format');
      expect(params).toEqual(['paramA', 'paramB']);
    });

    it('should return correct params for conditional_value', () => {
      const params = getVisibleParams('conditional_value');
      expect(params).toEqual(['paramA', 'paramB', 'paramC']);
    });

    it('should return single param for default_value', () => {
      const params = getVisibleParams('default_value');
      expect(params).toEqual(['paramA']);
    });
  });
});
