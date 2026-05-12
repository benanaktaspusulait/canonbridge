/**
 * G-01: Dynamic parameter labels for transform types
 * 
 * This utility provides context-aware labels for paramA, paramB, paramC
 * based on the selected transform type.
 */

import type { TransformKind } from './integration-studio.models';

export interface ParamLabel {
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'json';
  required: boolean;
  helpText?: string;
}

export interface TransformParamLabels {
  paramA?: ParamLabel;
  paramB?: ParamLabel;
  paramC?: ParamLabel;
}

/**
 * Get dynamic labels for transform parameters
 */
export function getTransformParamLabels(transform: TransformKind): TransformParamLabels {
  switch (transform) {
    case 'direct':
      // No parameters needed for direct mapping
      return {};

    case 'date_format':
      return {
        paramA: {
          label: 'Input Format',
          placeholder: 'yyyy-MM-dd',
          type: 'select',
          required: true,
          helpText: 'Format of the source date field'
        },
        paramB: {
          label: 'Output Format',
          placeholder: 'dd/MM/yyyy',
          type: 'select',
          required: true,
          helpText: 'Desired format for the target field'
        }
      };

    case 'enum_map':
      return {
        paramA: {
          label: 'Mapping Table (JSON)',
          placeholder: '[{"source":"A","target":"Alpha"},{"source":"B","target":"Beta"}]',
          type: 'json',
          required: true,
          helpText: 'JSON array of source-to-target mappings'
        }
      };

    case 'number_coerce':
      // No parameters needed
      return {};

    case 'default_value':
      return {
        paramA: {
          label: 'Default Value',
          placeholder: 'N/A',
          type: 'text',
          required: true,
          helpText: 'Value to use when source field is empty or null'
        }
      };

    case 'combine':
      return {
        paramA: {
          label: 'Second Field Path',
          placeholder: 'lastName',
          type: 'select',
          required: true,
          helpText: 'Additional field to combine with the source'
        },
        paramB: {
          label: 'Separator',
          placeholder: ' ',
          type: 'text',
          required: false,
          helpText: 'Character(s) to insert between combined values'
        }
      };

    case 'string_uppercase':
    case 'string_lowercase':
    case 'string_trim':
      // No parameters needed
      return {};

    case 'string_substring':
      return {
        paramA: {
          label: 'Start Position',
          placeholder: '0',
          type: 'number',
          required: true,
          helpText: 'Starting index (0-based)'
        },
        paramB: {
          label: 'Length',
          placeholder: '10',
          type: 'number',
          required: false,
          helpText: 'Number of characters to extract (leave empty for rest of string)'
        }
      };

    case 'string_replace':
      return {
        paramA: {
          label: 'Find Text',
          placeholder: 'old',
          type: 'text',
          required: true,
          helpText: 'Text to search for'
        },
        paramB: {
          label: 'Replace With',
          placeholder: 'new',
          type: 'text',
          required: true,
          helpText: 'Replacement text'
        }
      };

    case 'array_join':
      return {
        paramA: {
          label: 'Delimiter',
          placeholder: ',',
          type: 'text',
          required: false,
          helpText: 'Character(s) to join array elements'
        }
      };

    case 'array_first':
    case 'array_last':
    case 'array_count':
      // No parameters needed
      return {};

    case 'array_element':
      return {
        paramA: {
          label: 'Element Index',
          placeholder: '1',
          type: 'number',
          required: true,
          helpText: 'Position in array (1-based, e.g., 1 for first element)'
        }
      };

    case 'array_filter_equals':
      return {
        paramA: {
          label: 'Filter Field',
          placeholder: 'status',
          type: 'select',
          required: true,
          helpText: 'Field name within array items to filter by'
        },
        paramB: {
          label: 'Filter Value',
          placeholder: 'active',
          type: 'text',
          required: true,
          helpText: 'Value to match for filtering'
        }
      };

    case 'math_sum':
    case 'math_average':
    case 'math_min':
    case 'math_max':
      // No parameters needed
      return {};

    case 'conditional_value':
      return {
        paramA: {
          label: 'When Equals',
          placeholder: 'true',
          type: 'text',
          required: true,
          helpText: 'Condition value to check'
        },
        paramB: {
          label: 'Then Value',
          placeholder: 'Yes',
          type: 'text',
          required: true,
          helpText: 'Value to return when condition matches'
        },
        paramC: {
          label: 'Else Value',
          placeholder: 'No',
          type: 'text',
          required: true,
          helpText: 'Value to return when condition does not match'
        }
      };

    case 'template_string':
      return {
        paramA: {
          label: 'Template',
          placeholder: 'Hello {{firstName}} {{lastName}}!',
          type: 'textarea',
          required: true,
          helpText: 'Template string with {{fieldName}} placeholders'
        }
      };

    default:
      return {};
  }
}

/**
 * Check if a parameter should be visible for the given transform type
 */
export function isParamVisible(transform: TransformKind, param: 'paramA' | 'paramB' | 'paramC'): boolean {
  const labels = getTransformParamLabels(transform);
  return labels[param] !== undefined;
}

/**
 * Get all visible parameters for a transform type
 */
export function getVisibleParams(transform: TransformKind): Array<'paramA' | 'paramB' | 'paramC'> {
  const labels = getTransformParamLabels(transform);
  const params: Array<'paramA' | 'paramB' | 'paramC'> = [];
  
  if (labels.paramA) params.push('paramA');
  if (labels.paramB) params.push('paramB');
  if (labels.paramC) params.push('paramC');
  
  return params;
}
