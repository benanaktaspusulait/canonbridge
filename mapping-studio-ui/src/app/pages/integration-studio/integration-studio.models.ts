export type TransformKind =
  | 'direct'
  | 'date_format'
  | 'enum_map'
  | 'number_coerce'
  | 'default_value'
  | 'combine'
  | 'string_uppercase'
  | 'string_lowercase'
  | 'string_trim'
  | 'string_substring'
  | 'string_replace'
  | 'array_join'
  | 'array_element'
  | 'conditional_value'
  | 'template_string';

export interface TargetField {
  key: string;
  type: 'string' | 'number' | 'date';
  required: boolean;
  description: string;
  /** Requirement 3: fields derived from loaded canonical schema vs manual. */
  source?: 'manual' | 'schema';
}

export interface MappingRule {
  id: string;
  sourcePath: string;
  targetKey: string;
  transform: TransformKind;
  paramA: string;
  paramB: string;
  paramC: string;
  /** Full JSONata for this target (overrides visual transform when set). */
  advancedExpression: string;
  /**
   * Optional alias per requirements doc; when set, takes precedence over `advancedExpression` and visual.
   */
  jsonataExpression?: string;
}

export type FixtureRunStatus = 'idle' | 'passed' | 'failed' | 'error';

export interface FixtureRow {
  id: string;
  name: string;
  inputJson: string;
  expectedJson: string;
  status: FixtureRunStatus;
  actualJson?: string;
  errorMessage?: string;
  diffs?: { path: string; expected: unknown; actual: unknown }[];
}
