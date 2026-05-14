import { Component, input, output, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MappingService } from '../../../../core/services/mapping.service';
import { WizardState } from '../../models/mapping-wizard.models';
import mappingEngine from 'jsonata';
import { buildCombinedMappingExpression } from '../step4-field-mapping/rule-to-jsonata';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-test-publish-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    TooltipModule
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

  mappingName = signal('');
  mappingDescription = signal('');
  testInput = signal('');
  testOutput = signal('');
  testError = signal('');
  proxyUrl = signal('');
  proxyInfo = signal<any>(null);
  
  testing = signal(false);
  saving = signal(false);
  testSuccess = signal(false);

  constructor() {
    // Auto-populate test input when wizard state changes
    effect(() => {
      const state = this.wizardState();
      if (state.sampleJson && !this.testInput()) {
        console.log('📥 Auto-populating test input from sample JSON');
        this.testInput.set(state.sampleJson);
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
    console.log('🔧 Test & Publish step initialized');
    console.log('Wizard State:', this.wizardState());
    console.log('Mapping ID:', this.mappingId());
    console.log('Existing Name:', this.existingMappingName());
    console.log('Existing Description:', this.existingMappingDescription());
    
    // Load proxy URL if mapping exists
    const mappingId = this.mappingId();
    if (mappingId) {
      this.loadProxyInfo(mappingId);
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
    this.testSuccess.set(false);

    try {
      const state = this.wizardState();
      
      // Check if we need to call real API
      const shouldCallRealApi = this.shouldCallRealApi(state);
      
      if (shouldCallRealApi) {
        console.log('🌐 Calling real API with mapping...');
        await this.runRealApiTest(state, inputJson);
      } else {
        console.log('🔄 Running local JSONata transformation...');
        await this.runLocalTransformationTest(state, inputJson);
      }
      
    } catch (error: any) {
      console.error('❌ Test execution failed:', error);
      this.testError.set('Test execution failed: ' + error.message);
      this.testing.set(false);
    }
  }

  private shouldCallRealApi(state: WizardState): boolean {
    // Call real API if:
    // 1. Source type is REST_API, SCHEDULED_API, SOAP, GRAPHQL, GRPC
    // 2. External system is configured
    // 3. API URL/endpoint is available in sourceConfig
    
    const apiSourceTypes = ['REST_API', 'SCHEDULED_API', 'SOAP', 'GRAPHQL', 'GRPC'];
    if (!apiSourceTypes.includes(state.sourceType || '')) {
      return false;
    }
    
    const config = state.sourceConfig;
    const hasUrl = config['url'] || config['endpoint'] || config['wsdlUrl'];
    
    return !!hasUrl;
  }

  private async runRealApiTest(state: WizardState, inputJson: any): Promise<void> {
    const testSteps: any[] = [];
    
    try {
      // Step 1: Apply request transformation if in API Gateway mode
      let requestPayload = inputJson;
      if (state.mode === 'api-gateway' && state.requestTransformation) {
        testSteps.push({
          step: '1. Request Transformation',
          description: 'Applying request mapping to input data',
          input: inputJson
        });
        
        requestPayload = await this.applyRequestTransformation(state, inputJson);
        testSteps[testSteps.length - 1].output = requestPayload;
        testSteps[testSteps.length - 1].status = 'success';
      }
      
      // Step 2: Call external API
      testSteps.push({
        step: '2. External API Call',
        description: 'Calling the configured external API',
        request: requestPayload
      });
      
      const apiResponse = await this.callExternalApi(state, requestPayload);
      testSteps[testSteps.length - 1].response = apiResponse;
      testSteps[testSteps.length - 1].status = 'success';
      
      // Step 3: Apply response mapping
      testSteps.push({
        step: '3. Response Mapping',
        description: 'Applying field mappings to API response',
        input: apiResponse
      });
      
      const mappedResponse = await this.applyResponseMapping(state, apiResponse);
      testSteps[testSteps.length - 1].output = mappedResponse;
      testSteps[testSteps.length - 1].status = 'success';
      
      // Format the final result
      const result = {
        testMode: 'real-api',
        status: 'success',
        message: 'End-to-end API test completed successfully',
        steps: testSteps,
        finalOutput: mappedResponse,
        metadata: {
          sourceType: state.sourceType,
          externalSystemId: state.externalSystemId,
          mappingRulesApplied: state.mappingRules.length,
          timestamp: new Date().toISOString()
        }
      };
      
      this.testOutput.set(JSON.stringify(result, null, 2));
      this.testSuccess.set(true);
      this.testing.set(false);
      
      console.log('✅ Real API test completed:', result);
      
    } catch (error: any) {
      // Mark the failed step
      if (testSteps.length > 0) {
        testSteps[testSteps.length - 1].status = 'error';
        testSteps[testSteps.length - 1].error = error.message;
      }
      
      const result = {
        testMode: 'real-api',
        status: 'error',
        message: 'API test failed',
        error: error.message,
        steps: testSteps,
        metadata: {
          sourceType: state.sourceType,
          timestamp: new Date().toISOString()
        }
      };
      
      this.testOutput.set(JSON.stringify(result, null, 2));
      this.testing.set(false);
      throw error;
    }
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
    const templateStr = JSON.stringify(template);
    const expression = mappingEngine(templateStr);
    return expression.evaluate(data);
  }

  private async callExternalApi(state: WizardState, payload: any): Promise<any> {
    const config = state.sourceConfig;
    const url = (config['url'] || config['endpoint']) as string;
    const method = ((config['method'] as string) || 'POST').toUpperCase();
    
    if (!url) {
      throw new Error('API URL not configured');
    }
    
    console.log(`📡 Calling ${method} ${url}`);
    console.log('📤 Request payload:', payload);
    
    // Build headers
    const headersObj: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(state.requestTransformation?.headers || {})
    };
    
    try {
      let response: any;
      
      if (method === 'GET') {
        response = await firstValueFrom(this.http.get(url, { headers: headersObj }));
      } else if (method === 'POST') {
        response = await firstValueFrom(this.http.post(url, payload, { headers: headersObj }));
      } else if (method === 'PUT') {
        response = await firstValueFrom(this.http.put(url, payload, { headers: headersObj }));
      } else if (method === 'PATCH') {
        response = await firstValueFrom(this.http.patch(url, payload, { headers: headersObj }));
      } else if (method === 'DELETE') {
        // DELETE method typically doesn't send a body
        response = await firstValueFrom(this.http.delete(url, { headers: headersObj }));
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      console.log('📥 API Response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ API call failed:', error);
      throw new Error(`API call failed: ${error.message || error.statusText || 'Unknown error'}`);
    }
  }

  private async applyResponseMapping(state: WizardState, apiResponse: any): Promise<any> {
    // Apply the field mapping rules to transform API response to canonical format
    const jsonataExpression = buildCombinedMappingExpression(state.mappingRules);
    console.log('🔄 Applying response mapping with JSONata:', jsonataExpression);
    
    const expression = mappingEngine(jsonataExpression);
    const result = await expression.evaluate(apiResponse);
    
    console.log('✅ Mapped response:', result);
    return result;
  }

  private async runLocalTransformationTest(state: WizardState, inputJson: any): Promise<void> {
    // Original local-only transformation test
    const jsonataExpression = buildCombinedMappingExpression(state.mappingRules);
    console.log('🔄 Testing with JSONata expression:', jsonataExpression);
    
    const expression = mappingEngine(jsonataExpression);
    const transformedResult = await expression.evaluate(inputJson);
    
    console.log('✅ Transformation result:', transformedResult);
    
    // Format the output
    const result = {
      testMode: 'local-transformation',
      status: 'success',
      message: 'Transformation completed successfully',
      input: inputJson,
      output: transformedResult,
      mappingRulesApplied: state.mappingRules.length,
      jsonataExpression: jsonataExpression
    };
    
    this.testOutput.set(JSON.stringify(result, null, 2));
    this.testSuccess.set(true);
    this.testing.set(false);
  }

  saveMapping(): void {
    if (!this.mappingName().trim()) {
      this.testError.set('Please provide a mapping name');
      return;
    }

    this.saving.set(true);
    this.testError.set('');

    const state = this.wizardState();
    const mappingData = this.buildMappingData(state);

    const mappingId = this.mappingId();
    const operation = mappingId
      ? this.mappingService.update(mappingId, mappingData)
      : this.mappingService.create(mappingData);

    operation.subscribe({
      next: (result) => {
        this.saving.set(false);
        // Navigate to mapping list or detail page
        this.router.navigate(['/mappings']);
      },
      error: (err) => {
        this.saving.set(false);
        this.testError.set('Failed to save mapping: ' + (err.error?.message || err.message));
      }
    });
  }

  private buildMappingData(state: WizardState): any {
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
      sample_payload: state.sampleJson,
      
      // Source-specific fields
      kafka_topic: config['topic'] || null,
      kafka_consumer_group: config['consumerGroup'] || null,
      webhook_path: config['endpoint'] || null,
      rest_api_path: config['path'] || null,
      rest_api_method: config['method'] || null,
      schedule_cron: config['schedule'] || null,
      external_api_url: config['url'] || null,
      
      status: 'DRAFT'
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

    if (state.requestTransformation) {
      sourceConfig['requestTransformation'] = state.requestTransformation;
    }

    if (state.sampleJson) {
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
    return {
      'Content-Type': 'application/json',
      'X-Tenant-Id': 'tenant-acme'
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
    
    const samplePayload = this.testInput() || '{"example": "data"}';
    
    return `curl -X POST ${testUrl} \\\n  ${headerFlags} \\\n  -d '${samplePayload}'`;
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

    // Build proxy URL with tenant ID
    const baseUrl = window.location.origin;
    const tenantId = 'tenant-acme'; // TODO: Get from auth service
    
    // Check if it's a GET mapping
    const sourceConfig = state.sourceConfig || {};
    const method = sourceConfig['method'] || 'POST';
    
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
