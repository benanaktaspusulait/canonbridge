export type SourceType = 
  | 'KAFKA'
  | 'WEBHOOK'
  | 'REST_API'
  | 'SCHEDULED_API'
  | 'SOAP'
  | 'GRPC'
  | 'FILE_BATCH'
  | 'API_ENRICHMENT'
  | 'MANUAL';

export interface SourceTypeOption {
  id: SourceType;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

export interface WizardState {
  sourceType: SourceType | null;
  externalSystemId: string | null;
  sourceConfig: Record<string, unknown>;
  sampleJson: string;
  targetSchemaRef: string | null;
  mappingRules: MappingRule[];
}

export interface MappingRule {
  id: string;
  sourcePath: string;
  targetKey: string;
  transform: string;
  required: boolean;
}
