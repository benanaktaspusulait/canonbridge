import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { ModeSelectorComponent } from './steps/step0-mode-selector/mode-selector.component';
import { SourceTypeSelectionComponent } from './steps/step0-source-type/source-type-selection.component';
import { ConfigurationStepComponent } from './steps/step1-configuration/configuration-step.component';
import { RequestMappingStepComponent } from './steps/step2-request-mapping/request-mapping-step.component';
import { SampleDataStepComponent } from './steps/step2-sample-data/sample-data-step.component';
import { TargetSchemaStepComponent } from './steps/step3-target-schema/target-schema-step.component';
import { FieldMappingStepComponent } from './steps/step4-field-mapping/field-mapping-step.component';
import { TestPublishStepComponent } from './steps/step5-test-publish/test-publish-step.component';
import { MappingRule, SourceType, WizardState, WizardMode, TransformKind } from './models/mapping-wizard.models';
import { buildCombinedMappingExpression } from './steps/step4-field-mapping/rule-to-jsonata';
import { MappingService } from '../../core/services/mapping.service';
import { SchemaService } from '../../core/services/schema.service';

@Component({
  selector: 'app-mapping-wizard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    StepsModule,
    I18nPipe,
    ModeSelectorComponent,
    SourceTypeSelectionComponent,
    ConfigurationStepComponent,
    RequestMappingStepComponent,
    SampleDataStepComponent,
    TargetSchemaStepComponent,
    FieldMappingStepComponent,
    TestPublishStepComponent
  ],
  templateUrl: './mapping-wizard.component.html',
  styleUrl: './mapping-wizard.component.scss'
})
export class MappingWizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mappingService = inject(MappingService);
  private schemaService = inject(SchemaService);

  currentStep = signal(0);
  mappingId = signal<string | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  targetSchemaJson = signal<string>('{}');
  existingMappingName = signal<string>('');
  existingMappingDescription = signal<string>('');
  
  wizardState = signal<WizardState>({
    mode: null,
    sourceType: null,
    externalSystemId: null,
    sourceConfig: {},
    requestTransformation: null,
    sampleJson: '',
    fieldMappingSampleJson: '',
    targetSchemaRef: null,
    targetSchemaJson: '',
    mappingRules: []
  });

  steps: MenuItem[] = [
    { label: 'Mode Selection' },
    { label: 'Source Type' },
    { label: 'Configuration' },
    { label: 'Sample Data' },
    { label: 'API Request' }, // Changed from 'Request Mapping' - this is for preparing the outgoing API request
    { label: 'Target Schema' },
    { label: 'Field Mapping' }, // This is where actual field mapping happens
    { label: 'Test & Publish' }
  ];

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.queryParams.subscribe(params => {
      const mappingId = params['mappingId'];
      if (mappingId) {
        this.mappingId.set(mappingId);
        this.isEditMode.set(true);
        this.loadMapping(mappingId);
      }
    });
  }

  loadMapping(mappingId: string): void {
    this.loading.set(true);
    this.mappingService.getById(mappingId).subscribe({
      next: (mapping) => {
        console.log('=== LOADED MAPPING ===', mapping);
        
        // Store mapping name and description
        this.existingMappingName.set(mapping.name || '');
        this.existingMappingDescription.set(mapping.description || '');
        
        // Make mapping available in console for debugging
        (window as any).debugMapping = mapping;
        console.log('Mapping saved to window.debugMapping - you can inspect it in console');
        
        const sourceConfig = this.extractSourceConfig(mapping);
        console.log('=== EXTRACTED SOURCE CONFIG ===', sourceConfig);
        
        const externalSystemId = this.extractExternalSystemId(mapping, sourceConfig);
        console.log('=== EXTRACTED EXTERNAL SYSTEM ID ===', externalSystemId);
        
        const requestTransformation = this.extractRequestTransformation(sourceConfig);
        const mappingRules = this.extractMappingRules(mapping);
        const sampleJson = this.extractRequestSampleJson(mapping, sourceConfig, requestTransformation);
        const fieldMappingSampleJson = this.extractFieldMappingSampleJson(mapping, sourceConfig, mappingRules);
        
        const targetSchemaRef = mapping.target_schema_ref || mapping.canonical_schema_ref || null;
        
        // Populate wizard state from existing mapping
        this.wizardState.update(state => ({
          ...state,
          mode: 'api-gateway', // Default to API Gateway for existing mappings
          sourceType: this.inferSourceType(mapping),
          externalSystemId: externalSystemId,
          sourceConfig: sourceConfig,
          requestTransformation: requestTransformation,
          sampleJson,
          fieldMappingSampleJson,
          inputSchema: mapping.input_schema || '',
          targetSchemaRef: targetSchemaRef,
          targetSchemaJson: '',
          mappingRules
        }));
        
        console.log('=== WIZARD STATE AFTER UPDATE ===', this.wizardState());
        
        // Load target schema JSON if we have a schema ref
        if (targetSchemaRef) {
          console.log('🔄 Loading target schema:', targetSchemaRef);
          this.loadTargetSchemaForEdit(targetSchemaRef);
        }
        
        // Start from step 2 in edit mode (skip mode and source type selection)
        this.currentStep.set(2);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load mapping:', err);
        this.loading.set(false);
      }
    });
  }

  private loadTargetSchemaForEdit(schemaRef: string): void {
    this.schemaService.getById(schemaRef).subscribe({
      next: (schema) => {
        console.log('✅ Target schema loaded:', schema.name);
        this.targetSchemaJson.set(schema.schema_json);
        this.wizardState.update(state => ({
          ...state,
          targetSchemaJson: schema.schema_json
        }));
      },
      error: (err) => {
        console.error('❌ Failed to load target schema:', err);
        console.log('🔄 Trying mock data...');
        
        // Fallback to mock data
        const mockSchemas = [
          {
            id: '7d5f75ae-4219-42c4-a85d-9d1df02ec154',
            name: 'OrderCreated',
            schema_json: JSON.stringify({
              type: 'object',
              properties: {
                orderId: { type: 'string' },
                customerName: { type: 'string' },
                totalAmount: { type: 'number' },
                status: { type: 'string' }
              },
              required: ['orderId', 'customerName', 'totalAmount']
            }, null, 2)
          },
          {
            id: '55b83ac8-e5c9-45e8-80f1-2728b51f4097',
            name: 'PaymentProcessed',
            schema_json: JSON.stringify({
              type: 'object',
              properties: {
                paymentId: { type: 'string' },
                amount: { type: 'number' },
                currency: { type: 'string' },
                status: { type: 'string' }
              },
              required: ['paymentId', 'amount', 'currency']
            }, null, 2)
          },
          {
            id: '6e32b91f-5752-4b1c-97fc-b5b5decdfbb2',
            name: 'ShipmentCreated',
            schema_json: JSON.stringify({
              type: 'object',
              properties: {
                shipmentId: { type: 'string' },
                trackingNumber: { type: 'string' },
                carrier: { type: 'string' }
              },
              required: ['shipmentId', 'trackingNumber']
            }, null, 2)
          },
          {
            id: '7f991c1a-9558-43fa-9ee1-070141c4f79b',
            name: 'ShipmentTracking',
            schema_json: JSON.stringify({
              type: 'object',
              properties: {
                trackingNumber: { type: 'string' },
                customerEmail: { type: 'string' },
                status: { type: 'string' }
              },
              required: ['trackingNumber', 'customerEmail', 'status']
            }, null, 2)
          }
        ];
        
        const mockSchema = mockSchemas.find(s => s.id === schemaRef);
        if (mockSchema) {
          console.log('✅ Found schema in mock data:', mockSchema.name);
          this.targetSchemaJson.set(mockSchema.schema_json);
          this.wizardState.update(state => ({
            ...state,
            targetSchemaJson: mockSchema.schema_json
          }));
        } else {
          console.warn('⚠️ Schema not found in mock data either');
        }
      }
    });
  }

  private inferSourceType(mapping: any): SourceType {
    // Infer source type from mapping data
    if (mapping.source_type) {
      const sourceConfig = this.extractSourceConfig(mapping);
      if (mapping.source_type === 'API_ENRICHMENT' && sourceConfig['query']) return 'GRAPHQL';
      return mapping.source_type as SourceType;
    }
    
    // Fallback logic based on other fields
    if (mapping.kafka_topic) return 'KAFKA';
    if (mapping.webhook_path) return 'WEBHOOK';
    if (mapping.source_connection_id) return 'REST_API';
    
    return 'MANUAL';
  }

  private extractSourceConfig(mapping: any): Record<string, unknown> {
    // Parse the source_config JSON if it exists
    const config = this.parseJsonObject(mapping.source_config);
    
    const path = this.firstString(
      config['path'],
      mapping.rest_api_path,
      this.pathFromUrl(config['url']),
      this.pathFromUrl(config['connectionUrl'])
    );

    if (path && !config['path']) {
      config['path'] = path;
    }

    // For gRPC, the "method" field is the RPC method name, not HTTP method.
    // Use httpMethod if available, otherwise default to POST for gRPC/SOAP.
    const sourceType = mapping.source_type;
    if (sourceType === 'GRPC' || sourceType === 'SOAP') {
      const httpMethod = this.firstString(config['httpMethod'], mapping.rest_api_method) || 'POST';
      config['httpMethod'] = httpMethod;
      if (!config['method'] || config['method'] === config['service'] || !['GET','POST','PUT','DELETE','PATCH'].includes((config['method'] as string).toUpperCase())) {
        config['method'] = httpMethod;
      }
    } else {
      const method = this.firstString(config['method'], mapping.rest_api_method);
      if (method && !config['method']) {
        config['method'] = method;
      }
    }
    
    return config;
  }

  private extractExternalSystemId(mapping: any, sourceConfig: Record<string, unknown>): string | null {
    console.log('=== CHECKING FOR EXTERNAL SYSTEM ID ===');
    console.log('sourceConfig.externalSystemId:', sourceConfig['externalSystemId']);
    console.log('sourceConfig.connectionId:', sourceConfig['connectionId']);
    console.log('mapping.source_connection_id:', mapping.source_connection_id);
    console.log('mapping.external_system_id:', mapping.external_system_id);
    
    // First check if it's in the source_config. Older drafts used several key names.
    const sourceConfigKeys = [
      'externalSystemId',
      'connectionId',
      'sourceConnectionId',
      'source_connection_id',
      'systemId',
      'external_system_id',
      'connection_id'
    ];

    for (const key of sourceConfigKeys) {
      const value = sourceConfig[key];
      if (typeof value === 'string' && value.trim()) {
        console.log(`Found in sourceConfig.${key}`);
        return value.trim();
      }
    }
    
    // Check mapping.source_connection_id
    if (mapping.source_connection_id && typeof mapping.source_connection_id === 'string') {
      console.log('Found in mapping.source_connection_id');
      return mapping.source_connection_id;
    }
    
    // Check mapping.external_system_id
    if (mapping.external_system_id && typeof mapping.external_system_id === 'string') {
      console.log('Found in mapping.external_system_id');
      return mapping.external_system_id;
    }
    
    console.log('No external system ID found');
    return null;
  }

  private extractRequestTransformation(sourceConfig: Record<string, unknown>): any {
    console.log('=== EXTRACTING REQUEST TRANSFORMATION ===');
    console.log('sourceConfig:', sourceConfig);
    const reqTransform = sourceConfig['requestTransformation'];
    console.log('requestTransformation found:', reqTransform);
    if (reqTransform && typeof reqTransform === 'object') {
      console.log('Returning requestTransformation:', reqTransform);
      return reqTransform;
    }
    console.log('No requestTransformation found, returning null');
    return null;
  }

  private extractMappingRules(mapping: any): MappingRule[] {
    // First try mapping_rules field
    if (mapping.mapping_rules) {
      const rules = this.parseJsonValue(mapping.mapping_rules);
      if (Array.isArray(rules)) {
        return rules.map((r: any, i: number) => this.normalizeMappingRule(r, i));
      }
    }
    
    // Fallback to transformation_rules
    if (mapping.transformation_rules) {
      if (Array.isArray(mapping.transformation_rules)) {
        return mapping.transformation_rules.map((r: any, i: number) => this.normalizeMappingRule(r, i));
      }
    }
    
    return [];
  }

  private normalizeMappingRule(rule: any, index: number): MappingRule {
    return {
      id: rule.id || `rule_${index}`,
      targetKey: rule.targetKey || rule.field || rule.targetField || '',
      sourcePath: rule.sourcePath || rule.source || rule.expression || '',
      transform: this.normalizeTransformKind(rule.transform),
      mode: rule.mode || 'visual',
      paramA: rule.paramA || '',
      paramB: rule.paramB || '',
      paramC: rule.paramC || '',
      advancedExpression: rule.advancedExpression || ''
    };
  }

  private normalizeTransformKind(transform: string | undefined): TransformKind {
    if (!transform) return 'direct';
    // Map DB transform types to frontend TransformKind
    const mapping: Record<string, TransformKind> = {
      'string': 'direct',
      'number': 'number_coerce',
      'object': 'direct',
      'array': 'direct',
      'boolean': 'direct',
      'date': 'date_format',
      'direct': 'direct',
      'date_format': 'date_format',
      'enum_map': 'enum_map',
      'number_coerce': 'number_coerce',
      'default_value': 'default_value',
      'combine': 'combine',
      'string_uppercase': 'string_uppercase',
      'string_lowercase': 'string_lowercase',
      'string_trim': 'string_trim',
      'string_substring': 'string_substring',
      'string_replace': 'string_replace',
      'custom_jsonata': 'custom_jsonata'
    };
    return mapping[transform] || 'direct';
  }

  private parseJsonValue(value: unknown): any {
    if (!value) return null;
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private extractRequestSampleJson(
    mapping: any,
    sourceConfig: Record<string, unknown>,
    requestTransformation: unknown
  ): string {
    console.log('=== EXTRACTING REQUEST SAMPLE JSON ===');

    const explicitRequestSample = this.firstJsonText(
      sourceConfig['requestSampleJson'],
      sourceConfig['requestJson'],
      sourceConfig['requestPayload'],
      sourceConfig['sampleRequestJson'],
      mapping.request_sample_payload
    );
    if (explicitRequestSample) {
      console.log('Found explicit request sample');
      return explicitRequestSample;
    }

    const requestSample = this.buildSampleFromRequestTransformation(
      requestTransformation || sourceConfig['requestTransformation']
    );
    if (requestSample) {
      console.log('Built request sample JSON from request transformation');
      return requestSample;
    }

    const legacySample = this.firstJsonText(
      mapping.sample_payload,
      sourceConfig['sampleJson'],
      sourceConfig['sample_payload'],
      sourceConfig['payload']
    );
    if (legacySample) {
      console.log('Found legacy request sample');
      return legacySample;
    }

    console.warn('⚠️ No request sample JSON found in mapping');
    return '';
  }

  private extractFieldMappingSampleJson(
    mapping: any,
    sourceConfig: Record<string, unknown>,
    mappingRules: MappingRule[] = []
  ): string {
    console.log('=== EXTRACTING FIELD MAPPING SAMPLE JSON ===');

    const explicitSourceSample = this.firstJsonText(
      sourceConfig['responseJson'],
      sourceConfig['responseSampleJson'],
      sourceConfig['sourceJson'],
      sourceConfig['sampleJson'],
      mapping.sample_payload,
      sourceConfig['sample_payload'],
      sourceConfig['payload']
    );
    if (explicitSourceSample) {
      console.log('Found explicit field mapping source sample');
      return explicitSourceSample;
    }

    const fallbackSample = this.buildSampleFromMappingRules(mappingRules);
    if (fallbackSample) {
      console.log('Built field mapping sample JSON from mapping rules');
      return fallbackSample;
    }

    // Fallback: generate sample from input_schema
    const inputSchemaJson = this.firstJsonText(mapping.input_schema, sourceConfig['inputSchema']);
    if (inputSchemaJson) {
      const sampleFromSchema = this.buildSampleFromInputSchema(inputSchemaJson);
      if (sampleFromSchema) {
        console.log('Built field mapping sample JSON from input_schema');
        return sampleFromSchema;
      }
    }

    console.warn('⚠️ No field mapping sample JSON found in mapping');
    return '';
  }

  private buildSampleFromRequestTransformation(requestTransformation: unknown): string {
    if (!requestTransformation || typeof requestTransformation !== 'object') {
      return '';
    }

    const template = (requestTransformation as { template?: unknown }).template;
    if (!template || typeof template !== 'object') {
      return '';
    }

    const sample: Record<string, unknown> = {};
    const placeholders = this.extractTemplatePlaceholders(template);

    placeholders.forEach(path => {
      const sourcePath = this.simpleSourcePath(path);
      if (!sourcePath) return;
      this.setByPath(sample, sourcePath, this.sampleValueForPath(sourcePath));
    });

    return placeholders.length > 0 && Object.keys(sample).length > 0
      ? JSON.stringify(sample)
      : '';
  }

  private extractTemplatePlaceholders(value: unknown): string[] {
    if (typeof value === 'string') {
      return Array.from(value.matchAll(/\{\{([^}]+)\}\}/g))
        .map(match => match[1]?.trim())
        .filter((path): path is string => !!path);
    }

    if (Array.isArray(value)) {
      return value.flatMap(item => this.extractTemplatePlaceholders(item));
    }

    if (value && typeof value === 'object') {
      return Object.values(value).flatMap(item => this.extractTemplatePlaceholders(item));
    }

    return [];
  }

  private buildSampleFromMappingRules(rules: MappingRule[]): string {
    const sample: Record<string, unknown> = {};
    let hasSampleValue = false;

    rules.forEach(rule => {
      const sourcePath = this.simpleSourcePath(rule.sourcePath || rule.expression || '');
      if (!sourcePath) return;

      this.setByPath(sample, sourcePath, this.sampleValueForRule(rule));
      hasSampleValue = true;
    });

    return hasSampleValue ? JSON.stringify(sample, null, 2) : '';
  }

  private simpleSourcePath(path: string): string | null {
    const trimmed = path.trim();
    if (!trimmed || trimmed.includes('(') || trimmed.includes(' ') || trimmed.includes('&')) return null;
    const normalized = trimmed.replace(/^\$\.?/, '');
    return /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[\d+\])*$/.test(normalized) ? normalized : null;
  }

  private setByPath(target: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cursor: Record<string, unknown> = target;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      if (isLast) {
        cursor[part] = value;
        return;
      }

      const next = cursor[part];
      if (!next || typeof next !== 'object' || Array.isArray(next)) {
        cursor[part] = {};
      }
      cursor = cursor[part] as Record<string, unknown>;
    });
  }

  private sampleValueForRule(rule: MappingRule): unknown {
    const key = `${rule.targetKey || rule.sourcePath}`.toLowerCase();
    const transform = rule.transform;

    if (transform === 'number_coerce' || key.includes('amount') || key.includes('total') || key.includes('price')) {
      return 1250.5;
    }
    if (key.includes('currency')) return 'EUR';
    if (key.includes('status')) return 'COMPLETED';
    if (key.includes('email')) return 'john.doe@example.com';
    if (key.includes('date') || key.includes('time')) return '2026-05-14T10:00:00Z';
    if (key.includes('id')) return `${this.lastPathSegment(rule.targetKey || rule.sourcePath).toUpperCase()}-001`;

    return `${this.lastPathSegment(rule.targetKey || rule.sourcePath)} sample`;
  }

  private sampleValueForPath(path: string): unknown {
    const key = path.toLowerCase();

    if (key.includes('amount') || key.includes('total') || key.includes('price')) return 1250.5;
    if (key.includes('currency')) return 'EUR';
    if (key.includes('status')) return 'COMPLETED';
    if (key.includes('email')) return 'john.doe@example.com';
    if (key.includes('date') || key.includes('time')) return '2026-05-14T10:00:00Z';
    if (key.includes('id')) return `${this.lastPathSegment(path).toUpperCase()}-001`;

    return `${this.lastPathSegment(path)} sample`;
  }

  private lastPathSegment(value: string): string {
    return value.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean).pop() || 'value';
  }

  private buildSampleFromInputSchema(schemaJson: string): string {
    try {
      const schema = typeof schemaJson === 'string' ? JSON.parse(schemaJson) : schemaJson;
      if (!schema || typeof schema !== 'object') return '';
      
      const sample = this.generateSampleFromSchema(schema);
      if (sample && typeof sample === 'object' && Object.keys(sample).length > 0) {
        return JSON.stringify(sample, null, 2);
      }
      return '';
    } catch {
      return '';
    }
  }

  private generateSampleFromSchema(schema: any, depth = 0): any {
    if (depth > 5) return null;
    
    if (schema.type === 'object' && schema.properties) {
      const result: Record<string, unknown> = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        result[key] = this.generateSampleValueFromProperty(key, prop as any, depth);
      }
      return result;
    }
    
    if (schema.type === 'array' && schema.items) {
      return [this.generateSampleFromSchema(schema.items, depth + 1)];
    }
    
    return this.generateSampleValueFromProperty('value', schema, depth);
  }

  private generateSampleValueFromProperty(key: string, prop: any, depth: number): unknown {
    if (!prop) return null;
    
    const type = prop.type || 'string';
    const keyLower = key.toLowerCase();
    
    if (type === 'object' && prop.properties) {
      return this.generateSampleFromSchema(prop, depth + 1);
    }
    if (type === 'array') {
      if (prop.items) {
        return [this.generateSampleFromSchema(prop.items, depth + 1)];
      }
      return [];
    }
    if (type === 'number' || type === 'integer') {
      if (keyLower.includes('amount') || keyLower.includes('total') || keyLower.includes('price')) return 1250.50;
      if (keyLower.includes('score')) return 0.85;
      return 42;
    }
    if (type === 'boolean') {
      return true;
    }
    if (keyLower.includes('email')) return 'john.doe@example.com';
    if (keyLower.includes('date') || keyLower.includes('time') || prop.format === 'date-time') return '2026-05-14T10:00:00Z';
    if (keyLower.includes('id')) return `${key.toUpperCase()}-001`;
    if (keyLower.includes('status')) return 'ACTIVE';
    if (keyLower.includes('currency')) return 'EUR';
    if (keyLower.includes('name')) return 'John Doe';
    if (keyLower.includes('phone')) return '+1 555 123 4567';
    if (keyLower.includes('url') || keyLower.includes('endpoint')) return 'https://api.example.com/resource';
    
    return `sample_${key}`;
  }

  private firstJsonText(...values: unknown[]): string | null {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
      if (value && typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
    }
    return null;
  }

  private firstString(...values: unknown[]): string | null {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
  }

  private pathFromUrl(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;

    try {
      return this.normalizePath(new URL(value.trim()).pathname);
    } catch {
      return value.trim().startsWith('/') ? this.normalizePath(value.trim()) : null;
    }
  }

  private normalizePath(value: string): string {
    const path = value.split('?')[0]?.split('#')[0] ?? '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized;
  }

  private parseJsonObject(value: unknown): Record<string, unknown> {
    if (!value) return {};
    if (typeof value === 'object') return value as Record<string, unknown>;
    if (typeof value !== 'string') return {};
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  onSourceTypeSelected(sourceType: SourceType): void {
    this.wizardState.update(state => ({
      ...state,
      sourceType
    }));
    this.currentStep.set(2); // Go to Configuration step
  }

  onModeSelected(mode: WizardMode): void {
    this.wizardState.update(state => ({
      ...state,
      mode
    }));
    this.currentStep.set(1); // Go to Source Type step
  }

  onConfigurationComplete(data: { externalSystemId: string | null; config: Record<string, unknown> }): void {
    this.wizardState.update(state => ({
      ...state,
      externalSystemId: data.externalSystemId,
      sourceConfig: { ...state.sourceConfig, ...data.config }
    }));
    
    this.currentStep.set(3); // Go to Sample Data step
  }

  onRequestMappingComplete(data: { config: any; validationRules?: any[] }): void {
    this.wizardState.update(state => ({
      ...state,
      requestTransformation: data.config
    }));

    if (this.mappingId() && data.validationRules && data.validationRules.length > 0) {
      this.mappingService.update(this.mappingId()!, {
        name: this.existingMappingName() || 'Untitled',
        validation_rules: JSON.stringify(data.validationRules)
      } as any).subscribe({
        next: () => console.log('Validation rules saved to backend'),
        error: (err: any) => console.warn('Failed to save validation rules:', err)
      });
    }

    this.currentStep.set(5);
  }

  onSampleDataComplete(data: { sampleJson: string }): void {
    this.wizardState.update(state => ({
      ...state,
      sampleJson: data.sampleJson
    }));
    
    // Auto-save disabled for now due to backend validation issues
    // this.autoSaveMapping();
    
    // Go to Request Mapping (step 4) for API Gateway, or Target Schema (step 5) for Integration Hub
    const nextStep = this.getNextStepAfterSampleData();
    this.currentStep.set(nextStep);
  }

  private getNextStepAfterSampleData(): number {
    const mode = this.wizardState().mode;
    // If API Gateway mode, go to Request Mapping (step 4)
    // If Integration Hub mode, skip to Target Schema (step 5)
    return mode === 'api-gateway' ? 4 : 5;
  }

  onTargetSchemaSelected(data: { schemaRef: string }): void {
    this.wizardState.update(state => ({
      ...state,
      targetSchemaRef: data.schemaRef
    }));
    
    // Auto-save disabled for now due to backend validation issues
    // this.autoSaveMapping();
    
    // Load schema JSON for field mapping
    this.schemaService.getById(data.schemaRef).subscribe({
      next: (schema) => {
        console.log('✅ Schema loaded from API:', schema.name);
        this.targetSchemaJson.set(schema.schema_json);
        this.wizardState.update(state => ({
          ...state,
          targetSchemaJson: schema.schema_json
        }));
        this.currentStep.set(6); // Go to Field Mapping step
      },
      error: (err) => {
        console.error('❌ Failed to load schema from API:', err);
        console.log('🔄 Trying to get schema from mock data...');
        
        // Fallback: Try to get schema from the target schema step component's mock data
        const mockSchemas = [
          {
            id: '7d5f75ae-4219-42c4-a85d-9d1df02ec154',
            name: 'OrderCreated',
            schema_json: JSON.stringify({
              type: 'object',
              properties: {
                orderId: { type: 'string' },
                customerName: { type: 'string' },
                totalAmount: { type: 'number' },
                status: { type: 'string' }
              },
              required: ['orderId', 'customerName', 'totalAmount']
            }, null, 2)
          },
          {
            id: '55b83ac8-e5c9-45e8-80f1-2728b51f4097',
            name: 'PaymentProcessed',
            schema_json: JSON.stringify({
              type: 'object',
              properties: {
                paymentId: { type: 'string' },
                amount: { type: 'number' },
                currency: { type: 'string' },
                status: { type: 'string' }
              },
              required: ['paymentId', 'amount', 'currency']
            }, null, 2)
          },
          {
            id: '6e32b91f-5752-4b1c-97fc-b5b5decdfbb2',
            name: 'ShipmentCreated',
            schema_json: JSON.stringify({
              type: 'object',
              properties: {
                shipmentId: { type: 'string' },
                trackingNumber: { type: 'string' },
                carrier: { type: 'string' }
              },
              required: ['shipmentId', 'trackingNumber']
            }, null, 2)
          },
          {
            id: '7f991c1a-9558-43fa-9ee1-070141c4f79b',
            name: 'ShipmentTracking',
            schema_json: JSON.stringify({
              type: 'object',
              properties: {
                trackingNumber: { type: 'string' },
                customerEmail: { type: 'string' },
                status: { type: 'string' }
              },
              required: ['trackingNumber', 'customerEmail', 'status']
            }, null, 2)
          }
        ];
        
        const mockSchema = mockSchemas.find(s => s.id === data.schemaRef);
        if (mockSchema) {
          console.log('✅ Found schema in mock data:', mockSchema.name);
          this.targetSchemaJson.set(mockSchema.schema_json);
          this.wizardState.update(state => ({
            ...state,
            targetSchemaJson: mockSchema.schema_json
          }));
        } else {
          console.warn('⚠️ Schema not found even in mock data. Using empty schema.');
          // Provide a minimal default schema so the step doesn't break
          const defaultSchema = JSON.stringify({
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              value: { type: 'string' }
            },
            required: ['id']
          }, null, 2);
          this.targetSchemaJson.set(defaultSchema);
          this.wizardState.update(state => ({
            ...state,
            targetSchemaJson: defaultSchema
          }));
        }
        
        this.currentStep.set(6); // Go to Field Mapping step
      }
    });
  }

  onFieldMappingComplete(data: { rules: any[]; excludedTargetFields: string[] }): void {
    this.wizardState.update(state => {
      const updated: any = {
        ...state,
        mappingRules: data.rules,
        excludedTargetFields: data.excludedTargetFields || []
      };
      
      // If no sample data exists, generate from inputSchema or targetSchemaJson
      if (!updated.fieldMappingSampleJson && !updated.sampleJson) {
        const schemaStr = updated.inputSchema || updated.targetSchemaJson;
        if (schemaStr) {
          const generated = this.buildSampleFromInputSchema(schemaStr);
          if (generated) {
            updated.fieldMappingSampleJson = generated;
          }
        }
      }
      
      return updated;
    });
    
    // Auto-save mapping rules and generated JSONata to DB
    this.autoSaveMappingRules(data.rules, data.excludedTargetFields);
    
    this.currentStep.set(7); // Go to Test & Publish step
  }

  private autoSaveMappingRules(rules: any[], excludedTargetFields?: string[]): void {
    const mappingId = this.mappingId();
    if (!mappingId) return;
    
    const generatedJsonata = rules.length > 0 ? buildCombinedMappingExpression(rules) : '';
    
    // Save excluded fields in source_config
    const state = this.wizardState();
    const sourceConfig = { ...state.sourceConfig };
    if (excludedTargetFields && excludedTargetFields.length > 0) {
      sourceConfig['excludedTargetFields'] = excludedTargetFields;
    } else {
      delete sourceConfig['excludedTargetFields'];
    }
    
    this.mappingService.update(mappingId, {
      mapping_rules: JSON.stringify(rules),
      generated_jsonata: generatedJsonata,
      source_config: JSON.stringify(sourceConfig)
    } as any).subscribe({
      next: () => console.log('✅ Mapping rules auto-saved'),
      error: (err: any) => console.warn('⚠️ Failed to auto-save mapping rules:', err)
    });
  }

  private autoSaveMapping(): void {
    if (!this.mappingId()) return;
    
    const state = this.wizardState();
    
    // Build the source_config with all necessary data
    const sourceConfig: Record<string, unknown> = {
      ...state.sourceConfig
    };
    
    // Add external system ID if present
    if (state.externalSystemId) {
      sourceConfig['externalSystemId'] = state.externalSystemId;
    }
    
    // Add request transformation if present
    if (state.requestTransformation) {
      sourceConfig['requestTransformation'] = state.requestTransformation;
    }
    
    // Add sample JSON if present
    if (state.sampleJson) {
      sourceConfig['sourceJson'] = state.sampleJson;
    }
    
    const updateData: any = {
      source_config: JSON.stringify(sourceConfig)
    };
    
    // Add source_type - required by backend
    if (state.sourceType) {
      updateData.source_type = state.sourceType;
    }
    
    // Add target schema if selected
    if (state.targetSchemaRef) {
      updateData.canonical_schema_ref = state.targetSchemaRef;
    }
    
    // Add mapping rules if defined
    if (state.mappingRules && state.mappingRules.length > 0) {
      updateData.mapping_rules = JSON.stringify(state.mappingRules);
    }
    
    this.mappingService.update(this.mappingId()!, updateData).subscribe({
      next: () => {
        console.log('Mapping auto-saved successfully');
      },
      error: (err) => {
        console.error('Failed to auto-save mapping:', err);
      }
    });
  }

  goBack(): void {
    const minStep = this.isEditMode() ? 0 : 0;
    if (this.currentStep() > minStep) {
      const previousStep = this.getPreviousStep(this.currentStep());
      this.currentStep.set(previousStep);
    }
  }

  goNext(): void {
    if (this.currentStep() < this.steps.length - 1) {
      const nextStep = this.getNextStep(this.currentStep());
      this.currentStep.set(nextStep);
    }
  }

  private getNextStep(currentStep: number): number {
    const mode = this.wizardState().mode;
    
    // Step 3 (Sample Data) → Step 4 or 5 depending on mode
    if (currentStep === 3) {
      return mode === 'api-gateway' ? 4 : 5; // Include or skip Request Mapping
    }
    
    // All other steps proceed sequentially
    return currentStep + 1;
  }

  private getPreviousStep(currentStep: number): number {
    const mode = this.wizardState().mode;
    
    // Step 5 (Target Schema) → Step 4 or 3 depending on mode
    if (currentStep === 5) {
      return mode === 'api-gateway' ? 4 : 3; // Go back to Request Mapping or Sample Data
    }
    
    // All other steps go back sequentially
    return currentStep - 1;
  }

  getStepLabel(stepIndex: number): string {
    const mode = this.wizardState().mode;
    
    // Change "Target Schema" to "Request Schema" for API Gateway mode
    if (stepIndex === 5 && mode === 'api-gateway') {
      return 'Request Schema';
    }
    
    if (stepIndex === 5 && mode === 'integration-hub') {
      return 'Target Schema';
    }
    
    return this.steps[stepIndex]?.label || '';
  }

  getConfigMethod(): string {
    return (this.wizardState().sourceConfig['method'] as string) || 'GET';
  }

  getExcludedTargetFields(): string[] {
    const state = this.wizardState() as any;
    if (state.excludedTargetFields && Array.isArray(state.excludedTargetFields)) {
      return state.excludedTargetFields;
    }
    const fromConfig = state.sourceConfig?.['excludedTargetFields'];
    if (Array.isArray(fromConfig)) return fromConfig;
    return [];
  }

  getSourceTypeIcon(): string {
    const sourceType = this.wizardState().sourceType;
    const iconMap: Record<SourceType, string> = {
      'KAFKA': 'pi pi-bolt',
      'WEBHOOK': 'pi pi-link',
      'REST_API': 'pi pi-globe',
      'SCHEDULED_API': 'pi pi-clock',
      'GRAPHQL': 'pi pi-share-alt',
      'SOAP': 'pi pi-server',
      'GRPC': 'pi pi-directions-alt',
      'FILE_BATCH': 'pi pi-file-import',
      'API_ENRICHMENT': 'pi pi-sitemap',
      'MANUAL': 'pi pi-upload'
    };
    return sourceType ? iconMap[sourceType] : 'pi pi-question';
  }

  getSourceTypeLabel(): string {
    const sourceType = this.wizardState().sourceType;
    const config = this.wizardState().sourceConfig;
    const method = config['method'] as string | undefined;
    
    const labelMap: Record<SourceType, string> = {
      'KAFKA': 'Kafka Topic',
      'WEBHOOK': 'Webhook',
      'REST_API': method ? `REST API (${method.toUpperCase()})` : 'REST API',
      'SCHEDULED_API': 'External API',
      'GRAPHQL': 'GraphQL',
      'SOAP': 'SOAP',
      'GRPC': 'gRPC',
      'FILE_BATCH': 'File Batch',
      'API_ENRICHMENT': 'API Enrichment',
      'MANUAL': 'Manual Upload'
    };
    return sourceType ? labelMap[sourceType] : 'Unknown';
  }

  getSourceTypeDescription(): string {
    const sourceType = this.wizardState().sourceType;
    const config = this.wizardState().sourceConfig;
    const method = config['method'] as string | undefined;
    const path = config['path'] as string | undefined;
    const url = config['url'] as string | undefined;
    
    const descMap: Record<SourceType, string> = {
      'KAFKA': 'Stream from an existing raw topic',
      'WEBHOOK': 'External systems send data to CanonBridge',
      'REST_API': this.buildRestApiDescription(method, path, url),
      'SCHEDULED_API': 'Scheduled polling from external API',
      'GRAPHQL': 'Run a GraphQL query against an external API',
      'SOAP': 'SOAP web service integration',
      'GRPC': 'gRPC service integration',
      'FILE_BATCH': 'Batch file processing',
      'API_ENRICHMENT': 'Enrich data with external API',
      'MANUAL': 'Manual data upload for testing'
    };
    return sourceType ? descMap[sourceType] : '';
  }

  private buildRestApiDescription(method?: string, path?: string, url?: string): string {
    const parts: string[] = ['CanonBridge calls external REST API'];
    
    if (method) {
      parts.push(`using ${method.toUpperCase()} method`);
    }
    
    if (path) {
      parts.push(`at ${path}`);
    } else if (url) {
      parts.push(`at ${url}`);
    }
    
    return parts.join(' ');
  }
}
