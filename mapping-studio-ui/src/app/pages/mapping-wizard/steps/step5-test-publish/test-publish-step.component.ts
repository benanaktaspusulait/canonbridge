import { Component, input, output, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { MappingService } from '../../../../core/services/mapping.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WizardState } from '../../models/mapping-wizard.models';
import { buildCombinedMappingExpression } from '../step4-field-mapping/rule-to-jsonata';
import mappingEngine from 'jsonata';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-test-publish-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    MessageModule,
    TagModule,
    TooltipModule,
    KeyValuePipe
  ],
  templateUrl: './test-publish-step.component.html',
  styleUrl: './test-publish-step.component.scss'
})
export class TestPublishStepComponent implements OnInit {
  wizardState = input.required<WizardState>();
  mappingId = input<string | null>(null);
  existingMappingName = input<string>('');
  existingMappingDescription = input<string>('');
  
  backClicked = output<void>();

  private mappingService = inject(MappingService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  mappingName = signal('');
  mappingDescription = signal('');
  testInput = signal('');
  testOutput = signal('');
  mappedRequestOutput = signal('');
  testError = signal('');
  testEndpoint = signal('');
  proxyUrl = signal('');
  proxyInfo = signal<any>(null);
  
  testing = signal(false);
  saving = signal(false);
  testSuccess = signal(false);
  hasUnsavedChanges = signal(false);
  executionLogs = signal<any[]>([]);
  executionStats = signal<any>(null);
  loadingLogs = signal(false);
  selectedLog = signal<any>(null);
  retryingLogId = signal<string | null>(null);

  constructor() {
    // Auto-populate test input when wizard state changes
    effect(() => {
      const state = this.wizardState();
      if (this.testInput()) return; // Already has input
      
      // For GET requests, provide path parameters as JSON
      const method = (state.sourceConfig['method'] as string || '').toUpperCase();
      if (method === 'GET') {
        // Extract path params from URL template (e.g., {orderId})
        const url = (state.sourceConfig['url'] as string) || (state.sourceConfig['path'] as string) || '';
        const params: Record<string, string> = {};
        const matches = url.matchAll(/\{([^}]+)\}/g);
        for (const match of matches) {
          params[match[1]] = `SAMPLE-${match[1].toUpperCase()}`;
        }
        this.testInput.set(JSON.stringify(Object.keys(params).length > 0 ? params : {}, null, 2));
        return;
      }
      
      // For POST/PUT, use sample request payload
      const sample = state.sampleJson;
      if (sample) {
        this.testInput.set(sample);
      } else {
        this.testInput.set('{}');
      }
    });

    // Auto-populate mapping name in edit mode
    effect(() => {
      const existingName = this.existingMappingName();
      if (existingName && !this.mappingName()) {
        console.log('📥 Auto-populating mapping name from existing mapping:', existingName);
        this.mappingName.set(existingName);
      }
    });

    // Auto-populate mapping description in edit mode
    effect(() => {
      const existingDesc = this.existingMappingDescription();
      if (existingDesc && !this.mappingDescription()) {
        console.log('📥 Auto-populating mapping description from existing mapping');
        this.mappingDescription.set(existingDesc);
      }
    });
  }

  ngOnInit(): void {
    // Load proxy URL and execution logs if mapping exists
    const mappingId = this.mappingId();
    if (mappingId) {
      this.loadProxyInfo(mappingId);
      this.loadExecutionLogs();
    }
  }

  async loadProxyInfo(mappingId: string): Promise<void> {
    try {
      const baseUrl = window.location.origin;
      const proxyEndpoint = `${baseUrl}/api/proxy/${mappingId}`;
      this.proxyUrl.set(proxyEndpoint);
      
      // Try to load proxy info
      const info = await firstValueFrom(
        this.http.get<any>(`/api/proxy/${mappingId}/info`)
      );
      this.proxyInfo.set(info);
      console.log('✅ Proxy info loaded:', info);
    } catch (error) {
      console.warn('⚠️ Could not load proxy info:', error);
    }
  }

  async runTest(): Promise<void> {
    const input = this.testInput();
    if (!input.trim()) {
      this.testError.set('Please provide test input JSON');
      return;
    }

    // Validate JSON
    let inputJson: any;
    try {
      inputJson = JSON.parse(input);
    } catch (e) {
      this.testError.set('Invalid JSON format');
      return;
    }

    this.testing.set(true);
    this.testError.set('');
    this.testOutput.set('');
    this.mappedRequestOutput.set('');
    this.testEndpoint.set('');
    this.testSuccess.set(false);

    try {
      const state = this.wizardState();
      console.log('🌐 Calling generated proxy endpoint...');
      await this.syncDraftBeforeProxyTest(state);
      if (state.sourceType === 'KAFKA') {
        await this.runKafkaMappingTest(state, inputJson);
      } else {
        await this.runProxyEndpointTest(state, inputJson);
      }
      
    } catch (error: any) {
      console.error('❌ Test execution failed:', error);
      this.testError.set('Test execution failed: ' + this.errorMessage(error));
      this.testing.set(false);
    }
  }

  private errorMessage(error: any): string {
    if (error?.error?.details) return error.error.details;
    if (error?.error?.error) return error.error.error;
    if (error?.message) return error.message;
    return 'Unknown error';
  }

  private async syncDraftBeforeProxyTest(state: WizardState): Promise<void> {
    const mappingId = this.mappingId();
    if (!mappingId) {
      throw new Error('Save this mapping as a draft before running the generated proxy test.');
    }

    // Generate JSONata expression from mapping rules
    const generatedJsonata = state.mappingRules && state.mappingRules.length > 0
      ? buildCombinedMappingExpression(state.mappingRules)
      : '';

    await firstValueFrom(this.mappingService.update(mappingId, {
      source_type: state.sourceType,
      source_config: JSON.stringify(this.buildSourceConfig(state)),
      canonical_schema_ref: state.targetSchemaRef,
      target_schema_ref: state.targetSchemaRef,
      mapping_rules: JSON.stringify(state.mappingRules),
      transformation_rules: state.mappingRules,
      generated_jsonata: generatedJsonata,
      sample_payload: state.fieldMappingSampleJson || state.sampleJson
    } as any));
  }

  private async runProxyEndpointTest(state: WizardState, inputJson: any): Promise<void> {
    const mappingId = this.mappingId();
    if (!mappingId) {
      throw new Error('Proxy endpoint is not available until the mapping is saved.');
    }

    const endpoint = this.getTestUrl() || `/api/proxy/${mappingId}`;
    const proxyPath = `/api/proxy/${mappingId}`;
    this.testEndpoint.set(endpoint);

    // Show what the proxy will actually call
    const targetUrl = this.resolveTargetUrl(state, inputJson);
    const method = (state.sourceConfig['method'] as string || 'GET').toUpperCase();
    const requestInfo: any = {
      method,
      url: targetUrl,
      params: inputJson
    };
    this.mappedRequestOutput.set(JSON.stringify(requestInfo, null, 2));

    const headers = this.getTestHeaders();
    const response = await firstValueFrom(this.http.post<any>(proxyPath, inputJson, { headers }));

    this.testOutput.set(JSON.stringify(response, null, 2));
    this.testSuccess.set(true);
    this.testing.set(false);
    console.log('✅ Proxy endpoint test completed:', response);
    
    // Reload execution logs after test
    setTimeout(() => this.loadExecutionLogs(), 500);
  }

  private async runKafkaMappingTest(state: WizardState, inputJson: any): Promise<void> {
    const mappingId = this.mappingId();
    if (!mappingId) {
      throw new Error('Kafka mapping test is not available until the mapping is saved.');
    }

    const response = await firstValueFrom(this.http.post<any>(`/api/mapping-drafts/${mappingId}/kafka-test`, {
      payload: inputJson
    }, {
      headers: this.tenantHeaders()
    }));

    this.testEndpoint.set(String(state.sourceConfig['topic'] ?? response.topic ?? 'Kafka topic'));
    this.mappedRequestOutput.set(JSON.stringify({
      topic: response.topic ?? state.sourceConfig['topic'],
      consumerGroup: response.consumerGroup ?? state.sourceConfig['consumerGroup'],
      payload: inputJson
    }, null, 2));
    this.testOutput.set(JSON.stringify(response.canonical, null, 2));
    this.testSuccess.set(true);
    this.testing.set(false);
  }

  private resolveTargetUrl(state: WizardState, params: any): string {
    let url = (state.sourceConfig['url'] as string) || '';
    if (!url) return 'Unknown';
    
    // Replace {param} placeholders with actual values
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        url = url.replace(`{${key}}`, value);
      }
    }
    return url;
  }

  private async applyRequestTransformation(state: WizardState, input: any): Promise<any> {
    const requestTransform = state.requestTransformation;
    if (!requestTransform) return input;
    
    if (requestTransform.mode === 'jsonata' && requestTransform.jsonata) {
      const expression = mappingEngine(requestTransform.jsonata);
      return await expression.evaluate(input);
    } else if (requestTransform.mode === 'template') {
      // Template mode: replace placeholders with values from input
      return this.applyTemplate(requestTransform.template, input);
    }
    
    return input;
  }

  private applyTemplate(template: any, data: any): any {
    return this.renderTemplate(template, data);
  }

  private renderTemplate(value: any, context: any): any {
    if (typeof value === 'string') {
      const exact = value.match(/^\s*\{\{\s*([^}]+)\s*}}\s*$/);
      if (exact) {
        return this.getByPath(context, exact[1].trim());
      }

      return value.replace(/\{\{\s*([^}]+)\s*}}/g, (_, path) => {
        const resolved = this.getByPath(context, path.trim());
        return resolved === undefined || resolved === null ? '' : String(resolved);
      });
    }

    if (Array.isArray(value)) {
      return value.map(item => this.renderTemplate(item, context));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, this.renderTemplate(child, context)])
      );
    }

    return value;
  }

  private getByPath(obj: any, path: string): any {
    const normalized = path.replace(/^\$\.?/, '');
    return normalized.split('.').filter(Boolean).reduce((current, part) => {
      if (current === undefined || current === null) return undefined;
      return current[part];
    }, obj);
  }

  onFieldChange(): void {
    this.hasUnsavedChanges.set(true);
  }

  formatTestInput(): void {
    const input = this.testInput();
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      this.testInput.set(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, leave as-is
    }
  }

  loadExecutionLogs(): void {
    const mappingId = this.mappingId();
    if (!mappingId) return;

    this.loadingLogs.set(true);
    
    // Load logs
    this.http.get<any[]>(`/api/proxy/${mappingId}/logs?limit=10`, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: (logs) => {
        this.executionLogs.set(logs || []);
        this.loadingLogs.set(false);
      },
      error: () => {
        this.executionLogs.set([]);
        this.loadingLogs.set(false);
      }
    });

    // Load stats
    this.http.get<any>(`/api/proxy/${mappingId}/stats`, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: (stats) => this.executionStats.set(stats),
      error: () => this.executionStats.set(null)
    });
  }

  formatLogTime(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  }

  formatJson(value: string): string {
    if (!value) return '';
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  retryExecution(log: any): void {
    const mappingId = this.mappingId();
    if (!mappingId || !log.id) return;

    this.retryingLogId.set(log.id);
    this.http.post<any>(`/api/proxy/${mappingId}/retry/${log.id}`, {}, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: (result) => {
        this.retryingLogId.set(null);
        console.log('✅ Retry result:', result);
        // Reload logs to show the new execution
        setTimeout(() => this.loadExecutionLogs(), 500);
      },
      error: (err) => {
        this.retryingLogId.set(null);
        console.error('❌ Retry failed:', err);
        // Still reload to show the failed retry attempt
        setTimeout(() => this.loadExecutionLogs(), 500);
      }
    });
  }

  saveMapping(status: 'DRAFT' | 'READY_TO_PUBLISH' = 'DRAFT'): void {
    if (!this.mappingName().trim()) {
      this.testError.set('Please provide a mapping name');
      return;
    }

    this.saving.set(true);
    this.testError.set('');

    const state = this.wizardState();
    const mappingData = this.buildMappingData(state, status);

    const mappingId = this.mappingId();
    
    if (status === 'READY_TO_PUBLISH' && mappingId) {
      // First save the draft, then publish as immutable version
      this.mappingService.update(mappingId, mappingData).subscribe({
        next: () => {
          // Now call the publish endpoint
          this.http.post<any>(`/api/mapping-drafts/${mappingId}/publish`, { notes: '' }, {
            headers: this.tenantHeaders()
          }).subscribe({
            next: (version) => {
              this.saving.set(false);
              this.hasUnsavedChanges.set(false);
              console.log('✅ Published as version:', version.version);
              this.router.navigate(['/mappings']);
            },
            error: (err) => {
              this.saving.set(false);
              this.testError.set('Publish failed: ' + (err.error?.error || err.message));
            }
          });
        },
        error: (err) => {
          this.saving.set(false);
          this.testError.set('Failed to save before publish: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Just save as draft
      const operation = mappingId
        ? this.mappingService.update(mappingId, mappingData)
        : this.mappingService.create(mappingData);

      operation.subscribe({
        next: () => {
          this.saving.set(false);
          this.hasUnsavedChanges.set(false);
          this.router.navigate(['/mappings']);
        },
        error: (err) => {
          this.saving.set(false);
          this.testError.set('Failed to save mapping: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  private buildMappingData(state: WizardState, status: 'DRAFT' | 'READY_TO_PUBLISH' = 'DRAFT'): any {
    const config = state.sourceConfig;
    const sourceConfig = this.buildSourceConfig(state);
    
    return {
      name: this.mappingName(),
      description: this.mappingDescription() || null,
      source_type: state.sourceType,
      source_config: JSON.stringify(sourceConfig),
      source_connection_id: state.externalSystemId,
      canonical_schema_ref: state.targetSchemaRef,
      target_schema_ref: state.targetSchemaRef,
      mapping_rules: JSON.stringify(state.mappingRules),
      transformation_rules: state.mappingRules,
      sample_payload: state.fieldMappingSampleJson || state.sampleJson,
      
      // Source-specific fields
      kafka_topic: config['topic'] || null,
      kafka_consumer_group: config['consumerGroup'] || null,
      webhook_path: config['endpoint'] || null,
      rest_api_path: config['path'] || null,
      rest_api_method: config['method'] || null,
      schedule_cron: config['schedule'] || null,
      external_api_url: config['url'] || null,
      
      // Generated JSONata expression from mapping rules
      generated_jsonata: state.mappingRules && state.mappingRules.length > 0
        ? buildCombinedMappingExpression(state.mappingRules)
        : null,

      status: status
    };
  }

  private buildSourceConfig(state: WizardState): Record<string, unknown> {
    const sourceConfig: Record<string, unknown> = {
      ...state.sourceConfig
    };

    const sourceType = this.sourceConfigSourceType(state.sourceType);
    if (sourceType) {
      sourceConfig['sourceType'] = sourceType;
    }

    if (state.externalSystemId) {
      sourceConfig['externalSystemId'] = state.externalSystemId;
      sourceConfig['connectionId'] = state.externalSystemId;
    }

    // Merge requestTransformation: keep existing headers if state has none
    const existingTransform = sourceConfig['requestTransformation'] as any;
    if (state.requestTransformation) {
      const incoming = state.requestTransformation as any;
      const existingHeaders = (existingTransform && existingTransform.headers) || {};
      const incomingHeaders = incoming.headers || {};
      const mergedHeaders = Object.keys(incomingHeaders).length > 0 ? incomingHeaders : existingHeaders;
      sourceConfig['requestTransformation'] = {
        ...incoming,
        headers: mergedHeaders
      };
    }

    if (state.sampleJson) {
      sourceConfig['requestSampleJson'] = state.sampleJson;
    }

    if (state.fieldMappingSampleJson) {
      sourceConfig['sourceJson'] = state.fieldMappingSampleJson;
    } else if (state.sampleJson) {
      sourceConfig['sourceJson'] = state.sampleJson;
    }

    return sourceConfig;
  }

  private sourceConfigSourceType(sourceType: WizardState['sourceType']): string | null {
    if (sourceType === 'KAFKA') return 'kafka';
    if (sourceType === 'WEBHOOK') return 'webhook';
    if (sourceType === 'REST_API') return 'restApi';
    if (sourceType === 'SCHEDULED_API') return 'externalApi';
    if (sourceType === 'GRAPHQL') return 'graphql';
    if (sourceType === 'SOAP') return 'soap';
    if (sourceType === 'GRPC') return 'grpc';
    if (sourceType === 'FILE_BATCH') return 'fileBatch';
    if (sourceType === 'API_ENRICHMENT') return 'apiEnrichment';
    if (sourceType === 'MANUAL') return 'manual';
    return null;
  }

  getSummary(): string[] {
    const state = this.wizardState();
    const summary: string[] = [];
    
    summary.push(`Source Type: ${state.sourceType}`);
    
    if (state.externalSystemId) {
      summary.push(`External System: ${state.externalSystemId}`);
    }
    
    const config = state.sourceConfig;
    if (config['topic']) {
      summary.push(`Kafka Topic: ${config['topic']}`);
      summary.push(`Consumer Group: ${config['consumerGroup']}`);
    }
    if (config['endpoint']) {
      summary.push(`Webhook Endpoint: ${config['endpoint']}`);
    }
    if (config['path']) {
      summary.push(`API Path: ${config['path']}`);
      summary.push(`Method: ${config['method']}`);
    }
    
    summary.push(`Target Schema: ${state.targetSchemaRef || 'Not selected'}`);
    summary.push(`Mapping Rules: ${state.mappingRules.length} rules defined`);
    
    return summary;
  }

  getTestUrl(): string | null {
    const mappingId = this.mappingId();
    
    if (!mappingId) {
      return null;
    }
    
    // Dynamic proxy endpoint - works for ALL source types
    return `http://localhost:8082/api/proxy/${mappingId}`;
  }

  getTestHeaders(): Record<string, string> {
    return this.tenantHeaders({ 'Content-Type': 'application/json' });
  }

  private tenantHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      ...extra,
      'X-Tenant-Id': this.auth.currentTenant().id
    };
  }

  getProxyDescription(): string {
    const state = this.wizardState();
    const config = state.sourceConfig;
    const targetUrl = config['url'] || config['endpoint'] || 'target API';
    
    return `This proxy endpoint accepts requests in your original format, transforms them, ` +
           `calls ${targetUrl}, and returns the response in your original format. ` +
           `Your application only needs to change the URL - no code changes required!`;
  }

  getCurlCommand(): string | null {
    const testUrl = this.getTestUrl();
    if (!testUrl) return null;
    
    const headers = this.getTestHeaders();
    const headerFlags = Object.entries(headers)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' \\\n  ');
    
    const method = (this.wizardState().sourceConfig['method'] as string || 'POST').toUpperCase();
    
    if (method === 'GET') {
      return `curl -X GET ${testUrl} \\\n  ${headerFlags}`;
    }
    
    return `curl -X ${method} ${testUrl} \\\n  ${headerFlags} \\\n  -d '{}'`;
  }

  onBack(): void {
    this.backClicked.emit();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ Copied to clipboard:', text);
    }).catch(err => {
      console.error('❌ Failed to copy:', err);
    });
  }

  copyProxyUrl(): void {
    const url = this.proxyUrl();
    if (url) {
      this.copyToClipboard(url);
    }
  }

  openProxyInBrowser(): void {
    const state = this.wizardState();
    const mappingId = this.mappingId();
    
    if (!mappingId) {
      console.warn('⚠️ No mapping ID available');
      return;
    }

    // Build proxy URL with the active tenant ID
    const baseUrl = window.location.origin;
    const tenantId = this.auth.currentTenant().id;
    
    // Check if it's a GET mapping
    const sourceConfig = state.sourceConfig || {};
    const method = typeof sourceConfig['method'] === 'string' ? sourceConfig['method'] : 'POST';
    
    if (method.toUpperCase() === 'GET') {
      // For GET, add sample query params
      const sampleParams = this.buildSampleQueryParams(state);
      const url = `${baseUrl}/api/proxy/${mappingId}?${sampleParams}&tenantId=${tenantId}`;
      window.open(url, '_blank');
    } else {
      // For POST, show message that browser can't be used
      alert('POST mapping cannot be tested in browser. Please use Postman or the test form below.');
    }
  }

  private buildSampleQueryParams(state: WizardState): string {
    // Try to extract sample params from input schema or sample JSON
    const inputSchema = state.inputSchema;
    if (inputSchema) {
      try {
        const schema = JSON.parse(inputSchema);
        const properties = schema.properties || {};
        const params: string[] = [];
        
        // Add sample values for each property
        for (const [key, prop] of Object.entries(properties)) {
          const propDef = prop as any;
          if (propDef.enum && propDef.enum.length > 0) {
            params.push(`${key}=${propDef.enum[0]}`);
          } else if (propDef.type === 'string') {
            params.push(`${key}=sample`);
          } else if (propDef.type === 'number') {
            params.push(`${key}=123`);
          }
        }
        
        return params.join('&');
      } catch (e) {
        console.warn('Could not parse input schema:', e);
      }
    }
    
    // Default sample params
    return 'format=detailed';
  }
}
