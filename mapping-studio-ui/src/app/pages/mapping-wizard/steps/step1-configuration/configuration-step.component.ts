import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { I18nPipe } from '../../../../core/i18n/i18n.pipe';
import { ExternalSystemService, OutboundConnection } from '../../../../core/services/external-system.service';
import { SourceType } from '../../models/mapping-wizard.models';

interface ExternalSystemOption {
  id: string;
  name: string;
  type: string;
  url: string;
  endpoints?: Array<{path: string; method: string; description: string}>;
}

@Component({
  selector: 'app-configuration-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    MessageModule,
    I18nPipe
  ],
  templateUrl: './configuration-step.component.html',
  styleUrl: './configuration-step.component.scss'
})
export class ConfigurationStepComponent implements OnInit {
  sourceType = input.required<SourceType>();
  initialConfig = input<Record<string, unknown>>({});
  initialSystemId = input<string | null>(null);
  
  configurationComplete = output<{
    externalSystemId: string | null;
    config: Record<string, unknown>;
  }>();
  
  backClicked = output<void>();

  private externalSystemService = inject(ExternalSystemService);

  externalSystems = signal<ExternalSystemOption[]>([]);
  selectedSystemId = signal<string | null>(null);
  selectedSystem = signal<ExternalSystemOption | null>(null);
  availableEndpoints = signal<Array<{path: string; method: string; description: string}>>([]);
  selectedEndpointPath = signal<string | null>(null);
  loading = signal(true);
  loadError = signal<string | null>(null);

  // Kafka config
  kafkaTopic = signal('');
  kafkaConsumerGroup = signal('');

  // Webhook config
  webhookEndpoint = signal('');

  // REST API config
  restApiPath = signal('');
  restApiMethod = signal('POST');

  // External API config
  externalApiUrl = signal('');
  externalApiSchedule = signal('');

  // GraphQL config
  graphqlQuery = signal('');
  graphqlVariables = signal('{}');
  graphqlVariablesError = signal<string | null>(null);

  // gRPC config
  grpcService = signal('');
  grpcMethod = signal('');

  ngOnInit(): void {
    // Load initial values first
    this.loadInitialValues();
    // Then load external systems
    this.loadExternalSystems();
  }

  loadInitialValues(): void {
    const config = this.initialConfig();
    const systemId = this.initialSystemId();
    
    // Set the selected system ID immediately
    if (systemId) {
      this.selectedSystemId.set(systemId);
      console.log('Setting initial system ID:', systemId);
    }
    
    // Load config values based on source type
    if (config['topic']) {
      this.kafkaTopic.set(config['topic'] as string);
    }
    if (config['consumerGroup']) {
      this.kafkaConsumerGroup.set(config['consumerGroup'] as string);
    }
    if (config['endpoint']) {
      this.webhookEndpoint.set(config['endpoint'] as string);
    }
    if (config['path']) {
      this.restApiPath.set(config['path'] as string);
    }
    if (config['method']) {
      this.restApiMethod.set(config['method'] as string);
    }
    if (config['url']) {
      this.externalApiUrl.set(config['url'] as string);
    }
    if (config['schedule']) {
      this.externalApiSchedule.set(config['schedule'] as string);
    }
    if (config['query']) {
      this.graphqlQuery.set(config['query'] as string);
    }
    if (config['variables']) {
      const variables = config['variables'];
      this.graphqlVariables.set(typeof variables === 'string' ? variables : JSON.stringify(variables, null, 2));
      this.validateGraphqlVariables(this.graphqlVariables());
    }
    if (config['service']) {
      this.grpcService.set(config['service'] as string);
    }
    if (config['rpcMethod']) {
      this.grpcMethod.set(config['rpcMethod'] as string);
    }
  }

  loadExternalSystems(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.externalSystemService.list().subscribe({
      next: (systems) => {
        // Filter systems based on selected source type
        const filtered = this.filterSystemsBySourceType(systems);
        
        this.externalSystems.set(
          filtered.map(s => ({
            id: s.connection_id!,
            name: s.name,
            type: s.protocol,
            url: s.base_url || s.url,
            endpoints: s.known_endpoints || []
          }))
        );
        
        // After loading systems, check if we have a pre-selected system
        const systemId = this.selectedSystemId();
        if (systemId) {
          console.log('🔍 Looking for system with ID:', systemId);
          const system = this.externalSystems().find(s => s.id === systemId);
          if (system) {
            console.log('✅ Found system:', system.name);
            this.selectedSystem.set(system);
            
            if (system.endpoints && system.endpoints.length > 0) {
              this.availableEndpoints.set(system.endpoints);
              
              // If we have a path in config, try to match it with an endpoint
              const currentPath = this.restApiPath();
              if (currentPath) {
                const matchingEndpoint = system.endpoints.find(e => e.path === currentPath);
                if (matchingEndpoint) {
                  this.selectedEndpointPath.set(currentPath);
                }
              }
            }
          } else {
            console.warn('⚠️ System ID not found in available systems:', systemId);
            console.log('Available system IDs:', this.externalSystems().map(s => s.id));
            // Clear the invalid system ID so user can select a valid one
            this.selectedSystemId.set(null);
          }
        } else {
          console.log('ℹ️ No external system ID provided - user needs to select one');
        }
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load external systems:', error);
        this.loading.set(false);
        
        // Set user-friendly error message
        let errorMessage = 'wizard.configuration.loadError';
        if (error?.status === 0) {
          errorMessage = 'wizard.configuration.networkError';
        } else if (error?.status === 401 || error?.status === 403) {
          errorMessage = 'wizard.configuration.authError';
        } else if (error?.status >= 500) {
          errorMessage = 'wizard.configuration.serverError';
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.loadError.set(errorMessage);
      }
    });
  }

  onSystemSelected(systemId: string): void {
    this.selectedSystemId.set(systemId);
    const system = this.externalSystems().find(s => s.id === systemId);
    this.selectedSystem.set(system || null);
    
    if (system && system.endpoints && system.endpoints.length > 0) {
      this.availableEndpoints.set(system.endpoints);
    } else {
      this.availableEndpoints.set([]);
    }
    
    // Reset endpoint selection
    this.selectedEndpointPath.set(null);
    this.restApiPath.set('');
  }

  onEndpointSelected(path: string): void {
    this.selectedEndpointPath.set(path);
    this.restApiPath.set(path);
    
    // Set method from endpoint if available
    const endpoint = this.availableEndpoints().find(e => e.path === path);
    if (endpoint) {
      this.restApiMethod.set(endpoint.method);
      if (this.sourceType() === 'GRPC') {
        const segments = endpoint.path.split('/').filter(Boolean);
        this.grpcService.set(segments[1] ?? '');
        this.grpcMethod.set(segments[2] ?? endpoint.description);
      }
      if (this.sourceType() === 'GRAPHQL') {
        this.restApiPath.set(endpoint.path);
        this.restApiMethod.set(endpoint.method || 'POST');
      }
    }
  }

  private filterSystemsBySourceType(systems: OutboundConnection[]): OutboundConnection[] {
    const sourceType = this.sourceType();
    
    // Only show system templates (not specific endpoint configurations)
    const templates = systems.filter(s => s.is_system_template === true);
    
    // Map source types to compatible protocols
    const protocolMap: Record<SourceType, string[]> = {
      'KAFKA': [], // Kafka doesn't use external systems
      'WEBHOOK': [], // Webhook doesn't use external systems
      'REST_API': ['REST'],
      'SCHEDULED_API': ['REST', 'GRAPHQL', 'GRPC'],
      'GRAPHQL': ['GRAPHQL'],
      'SOAP': ['SOAP'],
      'GRPC': ['GRPC'],
      'FILE_BATCH': [],
      'API_ENRICHMENT': ['REST', 'GRAPHQL', 'SOAP', 'GRPC'],
      'MANUAL': []
    };

    const allowedProtocols = protocolMap[sourceType];
    
    if (allowedProtocols.length === 0) {
      return templates; // No filtering needed
    }
    
    return templates.filter(s => allowedProtocols.includes(s.protocol));
  }

  needsExternalSystem(): boolean {
    const sourceType = this.sourceType();
    // Only these source types need external system selection
    return ['REST_API', 'SCHEDULED_API', 'GRAPHQL', 'SOAP', 'GRPC', 'API_ENRICHMENT'].includes(sourceType);
  }

  getSourceTypeLabel(): string {
    const labels: Record<SourceType, string> = {
      'KAFKA': 'Kafka',
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
    return labels[this.sourceType()];
  }

  isConfigValid(): boolean {
    const type = this.sourceType();
    
    if (type === 'KAFKA') {
      return this.kafkaTopic().trim() !== '' && this.kafkaConsumerGroup().trim() !== '';
    }
    
    if (type === 'WEBHOOK') {
      return this.webhookEndpoint().trim() !== '';
    }
    
    if (type === 'REST_API') {
      // REST_API requires external system selection and path
      return this.selectedSystemId() !== null && this.restApiPath().trim() !== '';
    }
    
    if (type === 'SCHEDULED_API') {
      // SCHEDULED_API can optionally use external system, but URL and schedule are required
      return this.externalApiUrl().trim() !== '' && this.externalApiSchedule().trim() !== '';
    }

    if (type === 'GRAPHQL') {
      return this.selectedSystemId() !== null && this.graphqlQuery().trim() !== '' && this.graphqlVariablesError() === null;
    }
    
    if (type === 'SOAP') {
      // SOAP requires external system selection
      return this.selectedSystemId() !== null;
    }

    if (type === 'GRPC') {
      return this.selectedSystemId() !== null && this.grpcService().trim() !== '' && this.grpcMethod().trim() !== '';
    }
    
    if (type === 'API_ENRICHMENT') {
      // API_ENRICHMENT requires external system selection
      return this.selectedSystemId() !== null;
    }
    
    return true;
  }

  onNext(): void {
    const type = this.sourceType();
    let config: Record<string, unknown> = {};

    if (type === 'KAFKA') {
      config = {
        topic: this.kafkaTopic(),
        consumerGroup: this.kafkaConsumerGroup()
      };
    } else if (type === 'WEBHOOK') {
      config = {
        endpoint: this.webhookEndpoint()
      };
    } else if (type === 'REST_API') {
      config = {
        path: this.restApiPath(),
        method: this.restApiMethod()
      };
    } else if (type === 'SCHEDULED_API') {
      config = {
        url: this.externalApiUrl(),
        schedule: this.externalApiSchedule()
      };
    } else if (type === 'GRAPHQL') {
      config = {
        path: this.restApiPath() || '/graphql',
        method: 'POST',
        query: this.graphqlQuery(),
        variables: this.parseGraphqlVariables()
      };
    } else if (type === 'GRPC') {
      config = {
        service: this.grpcService(),
        rpcMethod: this.grpcMethod(),
        path: this.restApiPath(),
        method: 'POST'
      };
    }

    this.configurationComplete.emit({
      externalSystemId: this.selectedSystemId(),
      config
    });
  }

  onGraphqlVariablesChange(value: string): void {
    this.graphqlVariables.set(value);
    this.validateGraphqlVariables(value);
  }

  private validateGraphqlVariables(value: string): void {
    if (!value.trim()) {
      this.graphqlVariablesError.set(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      this.graphqlVariablesError.set(parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? null
        : 'Variables must be a JSON object');
    } catch (error: any) {
      this.graphqlVariablesError.set(error?.message ?? 'Invalid JSON');
    }
  }

  private parseGraphqlVariables(): Record<string, unknown> {
    try {
      const parsed = JSON.parse(this.graphqlVariables() || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  onBack(): void {
    this.backClicked.emit();
  }
}
