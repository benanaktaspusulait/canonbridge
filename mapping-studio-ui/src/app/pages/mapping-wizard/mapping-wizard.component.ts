import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { SourceTypeSelectionComponent } from './steps/step0-source-type/source-type-selection.component';
import { ConfigurationStepComponent } from './steps/step1-configuration/configuration-step.component';
import { SampleDataStepComponent } from './steps/step2-sample-data/sample-data-step.component';
import { TargetSchemaStepComponent } from './steps/step3-target-schema/target-schema-step.component';
import { FieldMappingStepComponent } from './steps/step4-field-mapping/field-mapping-step.component';
import { TestPublishStepComponent } from './steps/step5-test-publish/test-publish-step.component';
import { SourceType, WizardState } from './models/mapping-wizard.models';
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
    SourceTypeSelectionComponent,
    ConfigurationStepComponent,
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
    sourceType: null,
    externalSystemId: null,
    sourceConfig: {},
    sampleJson: '',
    targetSchemaRef: null,
    targetSchemaJson: '',
    mappingRules: []
  });

  steps: MenuItem[] = [
    { label: 'Source Type' },
    { label: 'Configuration' },
    { label: 'Sample Data' },
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
        // Populate wizard state from existing mapping
        this.wizardState.update(state => ({
          ...state,
          sourceType: this.inferSourceType(mapping),
          externalSystemId: mapping.source_connection_id || null,
          sourceConfig: this.extractSourceConfig(mapping),
          sampleJson: mapping.sample_payload || this.extractSampleJson(mapping),
          targetSchemaRef: mapping.target_schema_ref || null,
          targetSchemaJson: '',
          mappingRules: mapping.transformation_rules || []
        }));
        
        // Start from step 1 in edit mode (skip source type selection)
        this.currentStep.set(1);
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
    const config: Record<string, unknown> = {};
    
    if (mapping.kafka_topic) {
      config['topic'] = mapping.kafka_topic;
      config['consumerGroup'] = mapping.kafka_consumer_group || '';
    }
    
    if (mapping.webhook_path) {
      config['endpoint'] = mapping.webhook_path;
    }
    
    if (mapping.rest_api_path) {
      config['path'] = mapping.rest_api_path;
      config['method'] = mapping.rest_api_method || 'GET';
    }
    
    if (mapping.schedule_cron) {
      config['url'] = mapping.external_api_url || '';
      config['schedule'] = mapping.schedule_cron;
    }

    Object.assign(config, this.parseJsonObject(mapping.source_config));
    
    return config;
  }

  private extractSampleJson(mapping: any): string {
    const config = this.parseJsonObject(mapping.source_config);
    return typeof config['sourceJson'] === 'string'
      ? config['sourceJson']
      : typeof config['sampleJson'] === 'string'
        ? config['sampleJson']
        : '';
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
    this.currentStep.set(1);
  }

  onConfigurationComplete(data: { externalSystemId: string | null; config: Record<string, unknown> }): void {
    this.wizardState.update(state => ({
      ...state,
      externalSystemId: data.externalSystemId,
      sourceConfig: data.config
    }));
    this.currentStep.set(2);
  }

  onSampleDataComplete(data: { sampleJson: string }): void {
    this.wizardState.update(state => ({
      ...state,
      sampleJson: data.sampleJson
    }));
    this.currentStep.set(3);
  }

  onTargetSchemaSelected(data: { schemaRef: string }): void {
    this.wizardState.update(state => ({
      ...state,
      targetSchemaRef: data.schemaRef
    }));
    
    // Load schema JSON for field mapping
    this.schemaService.getById(data.schemaRef).subscribe({
      next: (schema) => {
        this.targetSchemaJson.set(schema.schema_json);
        this.wizardState.update(state => ({
          ...state,
          targetSchemaJson: schema.schema_json
        }));
        this.currentStep.set(4);
      },
      error: () => {
        this.currentStep.set(4);
      }
    });
  }

  onFieldMappingComplete(data: { rules: any[] }): void {
    this.wizardState.update(state => ({
      ...state,
      mappingRules: data.rules
    }));
    this.currentStep.set(5);
  }

  goBack(): void {
    const minStep = this.isEditMode() ? 0 : 0;
    if (this.currentStep() > minStep) {
      this.currentStep.update(step => step - 1);
    }
  }

  goNext(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(step => step + 1);
    }
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
    const labelMap: Record<SourceType, string> = {
      'KAFKA': 'Kafka Topic',
      'WEBHOOK': 'Webhook',
      'REST_API': 'REST API',
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
    const descMap: Record<SourceType, string> = {
      'KAFKA': 'Stream from an existing raw topic',
      'WEBHOOK': 'External systems send data to CanonBridge',
      'REST_API': 'CanonBridge calls external REST API',
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
}
