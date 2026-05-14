export type SourceType = 
  | 'KAFKA'
  | 'WEBHOOK'
  | 'REST_API'
  | 'SCHEDULED_API'
  | 'GRAPHQL'
  | 'SOAP'
  | 'GRPC'
  | 'FILE_BATCH'
  | 'API_ENRICHMENT'
  | 'MANUAL';

export type WizardMode = 'api-gateway' | 'integration-hub';

export type TransformationMode = 'template' | 'jsonata';

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
  | 'array_first'
  | 'array_last'
  | 'array_element'
  | 'array_count'
  | 'array_filter_equals'
  | 'math_sum'
  | 'math_average'
  | 'math_min'
  | 'math_max'
  | 'conditional_value'
  | 'template_string'
  | 'custom_jsonata';

export type MappingMode = 'visual' | 'expression';

export interface SourceTypeOption {
  id: SourceType;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

export interface WizardState {
  mode: WizardMode | null;
  sourceType: SourceType | null;
  externalSystemId: string | null;
  sourceConfig: Record<string, unknown>;
  requestTransformation: RequestTransformationConfig | null;
  sampleJson: string;
  targetSchemaRef: string | null;
  targetSchemaJson: string;
  mappingRules: MappingRule[];
}

export interface MappingRule {
  id: string;
  targetKey: string;
  sourcePath: string;
  transform: TransformKind;
  mode?: MappingMode;
  paramA?: string;
  paramB?: string;
  paramC?: string;
  advancedExpression?: string;
  targetField?: string;
  expression?: string;
  description?: string;
}

export interface RequestTransformationConfig {
  mode: TransformationMode;
  template: Record<string, unknown>;
  jsonata: string;
  headers: Record<string, string>;
}
