import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { SchemaService, SchemaDefinition } from '../../../../core/services/schema.service';

@Component({
  selector: 'app-target-schema-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    MessageModule
  ],
  templateUrl: './target-schema-step.component.html',
  styleUrl: './target-schema-step.component.scss'
})
export class TargetSchemaStepComponent implements OnInit {
  initialSchemaRef = input<string | null>(null);
  
  schemaSelected = output<{ schemaRef: string }>();
  backClicked = output<void>();

  private schemaService = inject(SchemaService);

  canonicalSchemas = signal<SchemaDefinition[]>([]);
  selectedSchemaId = signal<string | null>(null);
  selectedSchema = signal<SchemaDefinition | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    // First set the initial schema ID
    const initialRef = this.initialSchemaRef();
    if (initialRef) {
      this.selectedSchemaId.set(initialRef);
      console.log('Setting initial schema ref:', initialRef);
    }
    
    // Then load schemas
    this.loadCanonicalSchemas();
  }

  loadCanonicalSchemas(): void {
    this.loading.set(true);
    this.schemaService.listByType('CANONICAL').subscribe({
      next: (schemas) => {
        // Only show ACTIVE schemas
        const activeSchemas = schemas.filter(s => s.status === 'ACTIVE');
        this.canonicalSchemas.set(activeSchemas);
        
        // After schemas are loaded, check if we have a pre-selected schema
        const selectedId = this.selectedSchemaId();
        if (selectedId) {
          console.log('Looking for schema with ID:', selectedId);
          const schema = activeSchemas.find(s => s.id === selectedId);
          if (schema) {
            console.log('Found schema:', schema.name);
            this.selectedSchema.set(schema);
          } else {
            console.warn('Schema not found in list:', selectedId);
          }
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load canonical schemas:', err);
        
        // Check if it's an authentication issue
        if (err.status === 400 || err.status === 401 || err.status === 403) {
          console.warn('Authentication issue detected. User may not be logged in or session expired.');
          console.warn('Error details:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message
          });
        }
        
        // Fallback to mock data if API fails
        console.log('Falling back to mock data');
        this.loadMockSchemas();
        this.loading.set(false);
      }
    });
  }

  private loadMockSchemas(): void {
    const mockSchemas: SchemaDefinition[] = [
      {
        id: '7d5f75ae-4219-42c4-a85d-9d1df02ec154',
        name: 'OrderCreated',
        schema_type: 'CANONICAL',
        subject: 'canonical.OrderCreated',
        version: 1,
        status: 'ACTIVE',
        description: 'Canonical schema for order creation events',
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
        schema_type: 'CANONICAL',
        subject: 'canonical.PaymentProcessed',
        version: 1,
        status: 'ACTIVE',
        description: 'Canonical schema for payment processing events',
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
        schema_type: 'CANONICAL',
        subject: 'canonical.ShipmentCreated',
        version: 1,
        status: 'ACTIVE',
        description: 'Canonical schema for shipment creation events',
        schema_json: JSON.stringify({
          type: 'object',
          properties: {
            shipmentId: { type: 'string' },
            trackingNumber: { type: 'string' },
            carrier: { type: 'string' }
          },
          required: ['shipmentId', 'trackingNumber']
        }, null, 2)
      }
    ];
    
    this.canonicalSchemas.set(mockSchemas);
    
    // After mock schemas are loaded, check if we have a pre-selected schema
    const selectedId = this.selectedSchemaId();
    if (selectedId) {
      console.log('Looking for schema in mock data with ID:', selectedId);
      const schema = mockSchemas.find(s => s.id === selectedId);
      if (schema) {
        console.log('Found schema in mock data:', schema.name);
        this.selectedSchema.set(schema);
      } else {
        console.warn('Schema not found in mock data:', selectedId);
      }
    }
    
    console.log('Loaded mock canonical schemas');
  }

  onSchemaSelected(schemaId: string): void {
    this.selectedSchemaId.set(schemaId);
    const schema = this.canonicalSchemas().find(s => s.id === schemaId);
    this.selectedSchema.set(schema || null);
  }

  getSchemaPreview(): string {
    const schema = this.selectedSchema();
    if (!schema) return '';
    
    try {
      const parsed = JSON.parse(schema.schema_json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return schema.schema_json;
    }
  }

  isValid(): boolean {
    return this.selectedSchemaId() !== null;
  }

  onNext(): void {
    const schemaId = this.selectedSchemaId();
    if (schemaId) {
      this.schemaSelected.emit({ schemaRef: schemaId });
    }
  }

  onBack(): void {
    this.backClicked.emit();
  }
}
