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

interface EndpointOption {
  path: string;
  method: string;
  description: string;
}

interface ExternalSystemOption {
  id: string;
  name: string;
  type: string;
  url: string;
  baseUrl?: string;
  method?: string;
  endpoints: EndpointOption[];
}

interface SystemMatchContext {
  paths: string[];
  urls: string[];
  method: string | null;
  protocol: string | null;
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
  availableEndpoints = signal<EndpointOption[]>([]);
  selectedEndpointPath = signal<string | null>(null);
  initialPathConfigured = signal(false);
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
      console.log('✅ Setting initial system ID:', systemId);
    } else {
      console.log('ℹ️ No initial system ID - will load from config');
    }
    
    // Load config values based on source type
    console.log('📥 Loading config values:', config);
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
      this.initialPathConfigured.set(true);
      console.log('✅ Set REST API path:', config['path']);
    }
    if (config['method']) {
      this.restApiMethod.set(config['method'] as string);
      console.log('✅ Set REST API method:', config['method']);
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
        
        const options = filtered
          .filter((system): system is OutboundConnection & { connection_id: string } => !!system.connection_id)
          .map(system => this.toExternalSystemOption(system));

        this.externalSystems.set(options);
        
        // After loading systems, check if we have a pre-selected system
        const systemId = this.selectedSystemId();
        console.log('🔍 After loading systems, checking for pre-selected system ID:', systemId);
        console.log('📋 Available systems:', this.externalSystems().map(s => ({ id: s.id, name: s.name })));
        
        const resolvedSystem = this.resolveInitialSystem(options, systems);
        if (resolvedSystem) {
          console.log('✅ Resolved initial external system:', resolvedSystem.name);
          this.applySelectedSystem(resolvedSystem, false);
        } else if (systemId) {
          console.warn('⚠️ System ID not found in available systems:', systemId);
          console.log('Available system IDs:', this.externalSystems().map(s => s.id));
          // Don't clear - keep the ID so user can see what was expected
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
    this.applySelectedSystem(system ?? null, true);
  }

  onEndpointSelected(path: string): void {
    this.selectedEndpointPath.set(path);
    this.restApiPath.set(path);
    this.initialPathConfigured.set(false);
    
    // Set method from endpoint if available
    const endpoint = this.filteredEndpoints().find(e => e.path === path);
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

  onRestPathChanged(path: string): void {
    this.restApiPath.set(path);
    this.initialPathConfigured.set(false);

    const normalizedPath = this.normalizePath(path);
    const exactEndpoint = this.filteredEndpoints().find(endpoint =>
      this.normalizePath(endpoint.path) === normalizedPath
    );
    this.selectedEndpointPath.set(exactEndpoint?.path ?? null);
  }

  onRestMethodSelected(method: string): void {
    this.restApiMethod.set(method);

    const selectedPath = this.selectedEndpointPath();
    if (selectedPath && !this.filteredEndpoints().some(endpoint => endpoint.path === selectedPath)) {
      this.selectedEndpointPath.set(null);
    }
  }

  filteredEndpoints(): EndpointOption[] {
    const method = this.currentEndpointMethod();
    if (!method) return this.availableEndpoints();
    return this.availableEndpoints().filter(endpoint =>
      !endpoint.method || endpoint.method.toUpperCase() === method
    );
  }

  shouldShowEndpointSelector(): boolean {
    return this.selectedSystemId() !== null && this.filteredEndpoints().length > 0;
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

  private toExternalSystemOption(system: OutboundConnection & { connection_id: string }): ExternalSystemOption {
    return {
      id: system.connection_id,
      name: system.name,
      type: system.protocol,
      url: system.base_url || system.url,
      baseUrl: system.base_url,
      method: system.method,
      endpoints: this.normalizeEndpoints(system.known_endpoints)
    };
  }

  private normalizeEndpoints(value: unknown): EndpointOption[] {
    const rawEndpoints = Array.isArray(value)
      ? value
      : value && typeof value === 'object' && Array.isArray((value as { list?: unknown }).list)
        ? (value as { list: unknown[] }).list
        : [];

    return rawEndpoints
      .map(endpoint => {
        if (!endpoint || typeof endpoint !== 'object') return null;
        const record = endpoint as Record<string, unknown>;
        const path = typeof record['path'] === 'string' ? record['path'] : '';
        const method = typeof record['method'] === 'string' ? record['method'] : '';
        const description = typeof record['description'] === 'string' ? record['description'] : path;
        return path ? { path, method, description } : null;
      })
      .filter((endpoint): endpoint is EndpointOption => endpoint !== null);
  }

  private resolveInitialSystem(
    options: ExternalSystemOption[],
    allSystems: OutboundConnection[]
  ): ExternalSystemOption | null {
    const explicitId = this.selectedSystemId() ?? this.getConfiguredSystemId();

    if (explicitId) {
      const directTemplate = options.find(system => system.id === explicitId);
      if (directTemplate) return directTemplate;

      const explicitConnection = allSystems.find(system => system.connection_id === explicitId);
      if (explicitConnection) {
        const byConnection = this.findBestSystemMatch(
          options,
          this.buildMatchContextFromConnection(explicitConnection)
        );
        if (byConnection) return byConnection;
      }
    }

    return this.findBestSystemMatch(options, this.buildMatchContextFromConfig());
  }

  private getConfiguredSystemId(): string | null {
    return this.firstConfigString(
      'externalSystemId',
      'connectionId',
      'sourceConnectionId',
      'source_connection_id',
      'systemId',
      'external_system_id',
      'connection_id'
    );
  }

  private firstConfigString(...keys: string[]): string | null {
    const config = this.initialConfig();
    for (const key of keys) {
      const value = config[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
  }

  private buildMatchContextFromConfig(): SystemMatchContext {
    const config = this.initialConfig();
    const urlValues = [
      config['url'],
      config['endpoint'],
      config['connectionUrl'],
      config['wsdlUrl']
    ];
    const pathValues = [
      this.restApiPath(),
      config['path'],
      ...urlValues
    ];
    const method = this.firstConfigString('method') ?? this.restApiMethod();

    return {
      paths: this.uniqueStrings(pathValues.map(value => this.pathFromValue(value))),
      urls: this.uniqueStrings(urlValues.filter((value): value is string => typeof value === 'string')),
      method: method ? method.toUpperCase() : null,
      protocol: this.protocolForSourceType()
    };
  }

  private buildMatchContextFromConnection(connection: OutboundConnection): SystemMatchContext {
    return {
      paths: this.uniqueStrings([this.pathFromValue(connection.url)]),
      urls: this.uniqueStrings([connection.url]),
      method: connection.method ? connection.method.toUpperCase() : null,
      protocol: connection.protocol
    };
  }

  private findBestSystemMatch(
    options: ExternalSystemOption[],
    context: SystemMatchContext
  ): ExternalSystemOption | null {
    let best: { system: ExternalSystemOption; score: number } | null = null;

    for (const system of options) {
      const score = this.scoreSystemMatch(system, context);
      if (score > (best?.score ?? 0)) {
        best = { system, score };
      }
    }

    return best && best.score >= 60 ? best.system : null;
  }

  private scoreSystemMatch(system: ExternalSystemOption, context: SystemMatchContext): number {
    if (context.protocol && system.type !== context.protocol) return 0;

    let score = 0;
    const method = context.method;
    const endpointCandidates = [
      ...system.endpoints,
      { path: this.pathFromValue(system.url) ?? '', method: system.method ?? '', description: system.name }
    ].filter(endpoint => endpoint.path);

    for (const path of context.paths) {
      for (const endpoint of endpointCandidates) {
        const endpointScore = this.scorePathMatch(path, endpoint.path);
        const methodMatches = !method || !endpoint.method || endpoint.method.toUpperCase() === method;
        score = Math.max(score, endpointScore + (methodMatches ? 10 : 0));
      }
    }

    for (const url of context.urls) {
      if (this.sameOrigin(url, system.baseUrl || system.url)) {
        score = Math.max(score, 85);
      }
    }

    return score;
  }

  private scorePathMatch(path: string, endpointPath: string): number {
    const candidate = this.normalizePath(path);
    const endpoint = this.normalizePath(endpointPath);
    if (!candidate || !endpoint) return 0;
    if (candidate === endpoint) return 100;
    if (this.matchesTemplatedPath(candidate, endpoint)) return 95;

    const commonSegments = this.commonPathSegments(candidate, endpoint);
    return commonSegments >= 2 ? 50 + commonSegments * 5 : 0;
  }

  private matchesTemplatedPath(path: string, endpointPath: string): boolean {
    const pathSegments = this.pathSegments(path);
    const endpointSegments = this.pathSegments(endpointPath);
    if (pathSegments.length !== endpointSegments.length) return false;
    return endpointSegments.every((segment, index) =>
      segment.startsWith('{') && segment.endsWith('}') || segment === pathSegments[index]
    );
  }

  private commonPathSegments(a: string, b: string): number {
    const aSegments = this.pathSegments(a);
    const bSegments = this.pathSegments(b);
    let count = 0;
    for (let index = 0; index < Math.min(aSegments.length, bSegments.length); index += 1) {
      if (aSegments[index] !== bSegments[index]) break;
      count += 1;
    }
    return count;
  }

  private pathSegments(path: string): string[] {
    return this.normalizePath(path).split('/').filter(Boolean);
  }

  private protocolForSourceType(): string | null {
    const sourceType = this.sourceType();
    if (sourceType === 'REST_API') return 'REST';
    if (sourceType === 'GRAPHQL') return 'GRAPHQL';
    if (sourceType === 'SOAP') return 'SOAP';
    if (sourceType === 'GRPC') return 'GRPC';
    return null;
  }

  private currentEndpointMethod(): string | null {
    const method = this.restApiMethod().trim();
    return method ? method.toUpperCase() : null;
  }

  private applySelectedSystem(system: ExternalSystemOption | null, resetEndpoint: boolean): void {
    this.selectedSystem.set(system);
    this.availableEndpoints.set(system?.endpoints ?? []);

    if (!system) {
      if (resetEndpoint) {
        this.selectedEndpointPath.set(null);
        this.restApiPath.set('');
        this.initialPathConfigured.set(false);
      }
      return;
    }

    this.selectedSystemId.set(system.id);

    if (resetEndpoint) {
      this.selectedEndpointPath.set(null);
      this.restApiPath.set('');
      this.initialPathConfigured.set(false);
      return;
    }

    this.syncInitialEndpointSelection(system);
  }

  private syncInitialEndpointSelection(system: ExternalSystemOption): void {
    const currentPath = this.normalizePath(this.restApiPath());
    console.log('🔍 Current path from config:', currentPath);
    if (!currentPath) return;

    const matchingEndpoint = system.endpoints.find(endpoint =>
      this.normalizePath(endpoint.path) === currentPath
    );

    if (matchingEndpoint) {
      console.log('✅ Found matching endpoint:', matchingEndpoint.path);
      this.selectedEndpointPath.set(matchingEndpoint.path);
    } else {
      console.warn('⚠️ No matching endpoint found for path:', currentPath);
      this.selectedEndpointPath.set(null);
    }
  }

  private pathFromValue(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const raw = value.trim();
    if (raw.startsWith('/')) return this.normalizePath(raw);

    try {
      return this.normalizePath(new URL(raw).pathname);
    } catch {
      return null;
    }
  }

  private normalizePath(value: string | null): string {
    if (!value) return '';
    const path = value.split('?')[0]?.split('#')[0] ?? '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized;
  }

  private sameOrigin(left: string, right: string): boolean {
    try {
      return new URL(left).origin === new URL(right).origin;
    } catch {
      return false;
    }
  }

  private uniqueStrings(values: Array<string | null | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => !!value))];
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
