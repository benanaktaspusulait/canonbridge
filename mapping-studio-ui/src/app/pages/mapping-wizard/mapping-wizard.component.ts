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
import { SourceType, WizardState, WizardMode } from './models/mapping-wizard.models';
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
  
  wizardState = signal<WizardState>({
    mode: null,
    sourceType: null,
    externalSystemId: null,
    sourceConfig: {},
    requestTransformation: null,
    sampleJson: '',
    targetSchemaRef: null,
    targetSchemaJson: '',
    mappingRules: []
  });

  steps: MenuItem[] = [
    { label: 'Mode Selection' },
    { label: 'Source Type' },
    { label: 'Configuration' },
    { label: 'Sample Data' },
    { label: 'Request Mapping' },
    { label: 'Target Schema' },
    { label: 'Field Mapping' },
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
        const sourceConfig = this.extractSourceConfig(mapping);
        const externalSystemId = this.extractExternalSystemId(mapping, sourceConfig);
        const requestTransformation = this.extractRequestTransformation(sourceConfig);
        
        // Populate wizard state from existing mapping
        this.wizardState.update(state => ({
          ...state,
          mode: 'api-gateway', // Default to API Gateway for existing mappings
          sourceType: this.inferSourceType(mapping),
          externalSystemId: externalSystemId,
          sourceConfig: sourceConfig,
          requestTransformation: requestTransformation,
          sampleJson: mapping.sample_payload || this.extractSampleJson(mapping),
          targetSchemaRef: mapping.target_schema_ref || mapping.canonical_schema_ref || null,
          targetSchemaJson: '',
          mappingRules: this.extractMappingRules(mapping)
        }));
        
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
    
    // The source_config should contain all the configuration we need
    // No need to override with direct fields since they're deprecated
    
    return config;
  }

  private extractExternalSystemId(mapping: any, sourceConfig: Record<string, unknown>): string | null {
    // First check if it's in the source_config
    if (sourceConfig['externalSystemId'] && typeof sourceConfig['externalSystemId'] === 'string') {
      return sourceConfig['externalSystemId'];
    }
    
    // Fallback to deprecated field
    if (mapping.source_connection_id) {
      return mapping.source_connection_id;
    }
    
    return null;
  }

  private extractRequestTransformation(sourceConfig: Record<string, unknown>): any {
    const reqTransform = sourceConfig['requestTransformation'];
    if (reqTransform && typeof reqTransform === 'object') {
      return reqTransform;
    }
    return null;
  }

  private extractMappingRules(mapping: any): any[] {
    // First try mapping_rules field
    if (mapping.mapping_rules) {
      const rules = this.parseJsonValue(mapping.mapping_rules);
      if (Array.isArray(rules)) {
        return rules;
      }
    }
    
    // Fallback to transformation_rules
    if (mapping.transformation_rules) {
      if (Array.isArray(mapping.transformation_rules)) {
        return mapping.transformation_rules;
      }
    }
    
    return [];
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

  private extractSampleJson(mapping: any): string {
    // First check if there's a sample_payload field directly on the mapping
    if (mapping.sample_payload && typeof mapping.sample_payload === 'string') {
      return mapping.sample_payload;
    }
    
    // Then check source_config
    const config = this.parseJsonObject(mapping.source_config);
    
    // Check various possible field names in priority order
    if (typeof config['sourceJson'] === 'string' && config['sourceJson']) {
      return config['sourceJson'];
    }
    if (typeof config['sampleJson'] === 'string' && config['sampleJson']) {
      return config['sampleJson'];
    }
    if (typeof config['sample_payload'] === 'string' && config['sample_payload']) {
      return config['sample_payload'];
    }
    if (typeof config['payload'] === 'string' && config['payload']) {
      return config['payload'];
    }
    
    // Check if there's a requestTransformation template
    const reqTransform = config['requestTransformation'];
    if (reqTransform && typeof reqTransform === 'object') {
      const template = (reqTransform as any)['template'];
      if (template) {
        // If template is already a string, return it
        if (typeof template === 'string') {
          return template;
        }
        // If template is an object, stringify it
        if (typeof template === 'object') {
          return JSON.stringify(template, null, 2);
        }
      }
    }
    
    return '';
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
      sourceConfig: data.config
    }));
    
    // Auto-save disabled for now due to backend validation issues
    // this.autoSaveMapping();
    
    this.currentStep.set(3); // Go to Sample Data step
  }

  onRequestMappingComplete(data: { config: any }): void {
    this.wizardState.update(state => ({
      ...state,
      requestTransformation: data.config
    }));
    
    // Auto-save disabled for now due to backend validation issues
    // this.autoSaveMapping();
    
    this.currentStep.set(5); // Go to Target Schema step
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
        this.targetSchemaJson.set(schema.schema_json);
        this.wizardState.update(state => ({
          ...state,
          targetSchemaJson: schema.schema_json
        }));
        this.currentStep.set(6); // Go to Field Mapping step
      },
      error: () => {
        this.currentStep.set(6); // Go to Field Mapping step even on error
      }
    });
  }

  onFieldMappingComplete(data: { rules: any[] }): void {
    this.wizardState.update(state => ({
      ...state,
      mappingRules: data.rules
    }));
    
    // Auto-save disabled for now due to backend validation issues
    // this.autoSaveMapping();
    
    this.currentStep.set(7); // Go to Test & Publish step
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
    
    return this.steps[stepIndex].label;
  }

  getConfigMethod(): string {
    return (this.wizardState().sourceConfig['method'] as string) || 'GET';
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
