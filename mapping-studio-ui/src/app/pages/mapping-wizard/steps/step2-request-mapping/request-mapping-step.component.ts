import { Component, input, output, signal, effect, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { I18nPipe } from '../../../../core/i18n/i18n.pipe';
import { RequestTransformationConfig } from '../../models/mapping-wizard.models';

interface FieldMapping {
  sourcePath: string;
  targetPath: string;
  sourceValue?: any;
  included: boolean;
}

@Component({
  selector: 'app-request-mapping-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    MessageModule,
    CheckboxModule,
    InputTextModule,
    I18nPipe
  ],
  templateUrl: './request-mapping-step.component.html',
  styleUrl: './request-mapping-step.component.scss'
})
export class RequestMappingStepComponent implements OnInit {
  sourceType = input.required<string>();
  method = input.required<string>();
  initialConfig = input<RequestTransformationConfig | null>(null);
  canonicalSampleJson = input<string>('');
  
  requestMappingComplete = output<{
    config: RequestTransformationConfig;
  }>();
  
  backClicked = output<void>();

  // Visual mode
  useVisualMode = signal(true);
  fieldMappings = signal<FieldMapping[]>([]);
  
  // Advanced mode (existing)
  mode = signal<'template' | 'jsonata'>('template');
  templateJson = signal('{}');
  jsonataExpression = signal('');
  headersJson = signal('{}');
  
  templateError = signal<string | null>(null);
  jsonataError = signal<string | null>(null);
  headersError = signal<string | null>(null);

  previewOutput = signal<string | null>(null);
  previewError = signal<string | null>(null);
  previewLoading = signal<boolean>(false);

  private previewDebounceTimer: any;

  ngOnInit(): void {
    this.extractFieldsFromSample();
  }

  extractFieldsFromSample(): void {
    const sampleJson = this.canonicalSampleJson();
    if (!sampleJson) return;

    try {
      const parsed = JSON.parse(sampleJson);
      const fields = this.flattenObject(parsed);
      
      this.fieldMappings.set(
        fields.map(f => ({
          sourcePath: f.path,
          targetPath: f.path, // Default: same name
          sourceValue: f.value,
          included: true // Default: include all fields
        }))
      );
    } catch (error) {
      console.error('Failed to parse sample JSON:', error);
    }
  }

  private flattenObject(obj: any, prefix = ''): Array<{path: string; value: any}> {
    const result: Array<{path: string; value: any}> = [];
    
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      
      const path = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Nested object - flatten recursively
        result.push(...this.flattenObject(value, path));
      } else {
        // Primitive or array - add as is
        result.push({ path, value });
      }
    }
    
    return result;
  }

  toggleField(index: number): void {
    this.fieldMappings.update(mappings => {
      const updated = [...mappings];
      updated[index].included = !updated[index].included;
      return updated;
    });
    this.generatePreviewFromFields();
  }

  updateTargetPath(index: number, newPath: string): void {
    this.fieldMappings.update(mappings => {
      const updated = [...mappings];
      updated[index].targetPath = newPath;
      return updated;
    });
    this.generatePreviewFromFields();
  }

  selectAll(): void {
    this.fieldMappings.update(mappings =>
      mappings.map(m => ({ ...m, included: true }))
    );
    this.generatePreviewFromFields();
  }

  deselectAll(): void {
    this.fieldMappings.update(mappings =>
      mappings.map(m => ({ ...m, included: false }))
    );
    this.generatePreviewFromFields();
  }

  generatePreviewFromFields(): void {
    const included = this.fieldMappings().filter(f => f.included);
    const result: any = {};
    
    for (const field of included) {
      this.setNestedValue(result, field.targetPath, field.sourceValue);
    }
    
    this.previewOutput.set(JSON.stringify(result, null, 2));
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  buildTemplateFromFields(): string {
    const included = this.fieldMappings().filter(f => f.included);
    const template: any = {};
    
    for (const field of included) {
      this.setNestedValue(template, field.targetPath, `{{${field.sourcePath}}}`);
    }
    
    return JSON.stringify(template, null, 2);
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  templatePlaceholder = '{ "field": "{{canonical.fieldName}}" }';

  needsRequestPayload = computed(() => {
    const m = this.method().toUpperCase();
    return m === 'POST' || m === 'PUT' || m === 'PATCH';
  });

  constructor() {
    // Load initial configuration
    effect(() => {
      const config = this.initialConfig();
      if (config) {
        this.mode.set(config.mode);
        this.templateJson.set(JSON.stringify(config.template, null, 2));
        this.jsonataExpression.set(config.jsonata);
        this.headersJson.set(JSON.stringify(config.headers, null, 2));
      }
    });
  }

  onModeChange(newMode: 'template' | 'jsonata'): void {
    this.mode.set(newMode);
  }

  onTemplateChange(value: string): void {
    this.templateJson.set(value);
    this.validateJson(value, 'template');
    this.debouncedPreview();
  }

  onJsonataChange(value: string): void {
    this.jsonataExpression.set(value);
    // Basic validation - just check it's not empty when in jsonata mode
    if (this.mode() === 'jsonata' && !value.trim()) {
      this.jsonataError.set('JSONata expression is required');
    } else {
      this.jsonataError.set(null);
    }
  }

  onHeadersChange(value: string): void {
    this.headersJson.set(value);
    this.validateJson(value, 'headers');
  }

  validateJson(value: string, field: 'template' | 'headers'): void {
    if (!value.trim()) {
      if (field === 'template') this.templateError.set(null);
      if (field === 'headers') this.headersError.set(null);
      return;
    }

    try {
      JSON.parse(value);
      if (field === 'template') this.templateError.set(null);
      if (field === 'headers') this.headersError.set(null);
    } catch (e: any) {
      if (field === 'template') this.templateError.set(e.message);
      if (field === 'headers') this.headersError.set(e.message);
    }
  }

  formatJson(field: 'template' | 'headers'): void {
    const json = field === 'template' ? this.templateJson() : this.headersJson();
    if (!json.trim()) return;

    try {
      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, 2);
      if (field === 'template') {
        this.templateJson.set(formatted);
        this.templateError.set(null);
      } else {
        this.headersJson.set(formatted);
        this.headersError.set(null);
      }
    } catch (e: any) {
      // Error already shown by validation
    }
  }

  loadTemplateFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.onTemplateChange(content);
    };
    
    reader.readAsText(file);
  }

  isValid(): boolean {
    if (!this.needsRequestPayload()) {
      return true; // GET/DELETE don't need request payload
    }

    if (this.mode() === 'template') {
      return this.templateError() === null && this.headersError() === null;
    } else {
      return this.jsonataExpression().trim() !== '' && 
             this.jsonataError() === null && 
             this.headersError() === null;
    }
  }

  onNext(): void {
    // Build template from visual field mappings
    const template = this.buildTemplateFromFields();
    
    const config: RequestTransformationConfig = {
      mode: 'template',
      template: this.parseJsonSafe(template),
      jsonata: '',
      headers: this.parseJsonSafe(this.headersJson()) as Record<string, string>
    };

    this.requestMappingComplete.emit({ config });
  }

  onBack(): void {
    this.backClicked.emit();
  }

  onSkip(): void {
    // Skip with empty config
    const config: RequestTransformationConfig = {
      mode: 'template',
      template: {},
      jsonata: '',
      headers: {}
    };
    this.requestMappingComplete.emit({ config });
  }

  private parseJsonSafe(json: string): Record<string, unknown> {
    if (!json.trim()) return {};
    try {
      const parsed = JSON.parse(json);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  // Preview functionality with debouncing
  private debouncedPreview(): void {
    clearTimeout(this.previewDebounceTimer);
    this.previewDebounceTimer = setTimeout(() => {
      if (this.canonicalSampleJson()) {
        this.previewTransformation();
      }
    }, 300); // 300ms debounce
  }

  previewTransformation(): void {
    this.previewError.set(null);
    this.previewOutput.set(null);
    this.previewLoading.set(true);

    try {
      if (this.mode() === 'template') {
        const template = this.parseJsonSafe(this.templateJson());
        const canonical = this.parseJsonSafe(this.canonicalSampleJson());
        const result = this.renderTemplate(template, canonical);
        this.previewOutput.set(JSON.stringify(result, null, 2));
      } else {
        // For JSONata, we'd need to call backend or use a library
        this.previewOutput.set('JSONata preview requires backend evaluation');
      }
    } catch (e: any) {
      this.previewError.set(e.message);
    } finally {
      this.previewLoading.set(false);
    }
  }

  private renderTemplate(template: any, context: Record<string, unknown>): any {
    if (typeof template === 'string') {
      // Simple {{path}} replacement
      return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = this.getNestedValue(context, path.trim());
        return value !== undefined ? String(value) : match;
      });
    } else if (Array.isArray(template)) {
      return template.map(item => this.renderTemplate(item, context));
    } else if (template && typeof template === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(template)) {
        result[key] = this.renderTemplate(value, context);
      }
      return result;
    }
    return template;
  }

  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }
}
