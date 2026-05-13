import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MappingService } from '../../../../core/services/mapping.service';
import { WizardState } from '../../models/mapping-wizard.models';

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
    ProgressSpinnerModule
  ],
  templateUrl: './test-publish-step.component.html',
  styleUrl: './test-publish-step.component.scss'
})
export class TestPublishStepComponent {
  wizardState = input.required<WizardState>();
  mappingId = input<string | null>(null);
  
  backClicked = output<void>();

  private mappingService = inject(MappingService);
  private router = inject(Router);

  mappingName = signal('');
  mappingDescription = signal('');
  testInput = signal('');
  testOutput = signal('');
  testError = signal('');
  
  testing = signal(false);
  saving = signal(false);
  testSuccess = signal(false);

  runTest(): void {
    const input = this.testInput();
    if (!input.trim()) {
      this.testError.set('Please provide test input JSON');
      return;
    }

    // Validate JSON
    try {
      JSON.parse(input);
    } catch (e) {
      this.testError.set('Invalid JSON format');
      return;
    }

    this.testing.set(true);
    this.testError.set('');
    this.testOutput.set('');
    this.testSuccess.set(false);

    // Simulate test execution (in real implementation, call backend API)
    setTimeout(() => {
      try {
        // Mock transformation result
        const result = {
          status: 'success',
          transformed: {
            message: 'Transformation successful',
            data: JSON.parse(input)
          }
        };
        
        this.testOutput.set(JSON.stringify(result, null, 2));
        this.testSuccess.set(true);
        this.testing.set(false);
      } catch (e) {
        this.testError.set('Test execution failed');
        this.testing.set(false);
      }
    }, 1500);
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
    
    return {
      name: this.mappingName(),
      description: this.mappingDescription() || null,
      source_type: state.sourceType,
      source_connection_id: state.externalSystemId,
      target_schema_ref: state.targetSchemaRef,
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

  onBack(): void {
    this.backClicked.emit();
  }
}
