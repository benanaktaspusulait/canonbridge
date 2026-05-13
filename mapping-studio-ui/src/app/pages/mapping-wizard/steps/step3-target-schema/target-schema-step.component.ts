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
    this.loadCanonicalSchemas();
    
    const initialRef = this.initialSchemaRef();
    if (initialRef) {
      this.selectedSchemaId.set(initialRef);
    }
  }

  loadCanonicalSchemas(): void {
    this.loading.set(true);
    this.schemaService.listByType('CANONICAL').subscribe({
      next: (schemas) => {
        // Only show ACTIVE schemas
        const activeSchemas = schemas.filter(s => s.status === 'ACTIVE');
        this.canonicalSchemas.set(activeSchemas);
        
        // If we have a pre-selected schema, find and set it
        const initialRef = this.initialSchemaRef();
        if (initialRef) {
          const schema = activeSchemas.find(s => s.id === initialRef);
          if (schema) {
            this.selectedSchema.set(schema);
          }
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load canonical schemas:', err);
        // Fallback to mock data if API fails
        this.loadMockSchemas();
        this.loading.set(false);
      }
    });
  }

  private loadMockSchemas(): void {
    const mockSchemas: SchemaDefinition[] = [
      {
        id: '7d5f75ae-4219-42c4-a85d-9d1df02ec154',
        name: 'Order Created',
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
        name: 'Payment Processed',
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
        name: 'Shipment Created',
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
