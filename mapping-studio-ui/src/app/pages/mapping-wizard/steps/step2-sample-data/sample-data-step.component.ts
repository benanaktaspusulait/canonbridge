import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { I18nPipe } from '../../../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-sample-data-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    MessageModule,
    I18nPipe
  ],
  templateUrl: './sample-data-step.component.html',
  styleUrl: './sample-data-step.component.scss'
})
export class SampleDataStepComponent {
  method = input.required<string>();
  initialSampleJson = input<string>('');
  
  sampleDataComplete = output<{
    sampleJson: string;
  }>();
  
  backClicked = output<void>();

  sampleJson = signal('');
  jsonError = signal<string | null>(null);

  constructor() {
    // Load initial value when component initializes
    const initial = this.initialSampleJson();
    if (initial) {
      this.sampleJson.set(initial);
    }
  }

  needsPayload(): boolean {
    const m = this.method().toUpperCase();
    return m === 'POST' || m === 'PUT' || m === 'PATCH';
  }

  onJsonChange(value: string): void {
    this.sampleJson.set(value);
    this.validateJson(value);
  }

  validateJson(value: string): void {
    if (!value.trim()) {
      this.jsonError.set(null);
      return;
    }

    try {
      JSON.parse(value);
      this.jsonError.set(null);
    } catch (e: any) {
      this.jsonError.set(e.message);
    }
  }

  isValid(): boolean {
    if (!this.needsPayload()) {
      return true; // GET/DELETE don't need payload
    }
    
    return this.sampleJson().trim() !== '' && this.jsonError() === null;
  }

  onNext(): void {
    this.sampleDataComplete.emit({
      sampleJson: this.sampleJson()
    });
  }

  onBack(): void {
    this.backClicked.emit();
  }

  loadSampleFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.onJsonChange(content);
    };
    
    reader.readAsText(file);
  }
}
