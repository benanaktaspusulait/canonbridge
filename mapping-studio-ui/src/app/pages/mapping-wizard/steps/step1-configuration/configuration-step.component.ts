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

  ngOnInit(): void {
    this.loadExternalSystems();
  }

  loadExternalSystems(): void {
    this.loading.set(true);
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
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
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
      'SCHEDULED_API': ['REST', 'GRAPHQL'],
      'SOAP': ['SOAP'],
      'FILE_BATCH': [],
      'API_ENRICHMENT': ['REST', 'GRAPHQL', 'SOAP'],
      'MANUAL': []
    };

    const allowedProtocols = protocolMap[sourceType];
    
    if (allowedProtocols.length === 0) {
      return templates; // No filtering needed
    }
    
    return templates.filter(s => allowedProtocols.includes(s.protocol));
  }

  getSourceTypeLabel(): string {
    const labels: Record<SourceType, string> = {
      'KAFKA': 'Kafka',
      'WEBHOOK': 'Webhook',
      'REST_API': 'REST API',
      'SCHEDULED_API': 'External API',
      'SOAP': 'SOAP',
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
      return this.restApiPath().trim() !== '';
    }
    
    if (type === 'SCHEDULED_API') {
      return this.externalApiUrl().trim() !== '' && this.externalApiSchedule().trim() !== '';
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
    }

    this.configurationComplete.emit({
      externalSystemId: this.selectedSystemId(),
      config
    });
  }

  onBack(): void {
    this.backClicked.emit();
  }
}
