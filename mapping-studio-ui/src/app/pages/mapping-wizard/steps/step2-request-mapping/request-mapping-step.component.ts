import { Component, input, output, signal, effect, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { I18nPipe } from '../../../../core/i18n/i18n.pipe';
import { RequestTransformationConfig } from '../../models/mapping-wizard.models';
import { MappingService, FieldValidationRule, ValidationError } from '../../../../core/services/mapping.service';

interface FieldValidationRules {
  minValue?: number | null;
  maxValue?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
  enumValues?: string[];
}

interface FieldMapping {
  sourcePath: string;
  targetPath: string;
  sourceValue?: any;
  included: boolean;
  required: boolean;
  fieldType: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
  validationRules: FieldValidationRules;
  showConstraints: boolean;
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
    InputNumberModule,
    TooltipModule,
    TagModule,
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
  mappingId = input<string | null>(null);

  requestMappingComplete = output<{
    config: RequestTransformationConfig;
    validationRules: FieldValidationRule[];
  }>();

  backClicked = output<void>();

  private mappingService = inject(MappingService);

  useVisualMode = signal(true);
  fieldMappings = signal<FieldMapping[]>([]);

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

  backendValidating = signal(false);
  backendValidationErrors = signal<ValidationError[]>([]);
  backendValidationDone = signal(false);

  copySuccess = signal(false);

  private previewDebounceTimer: any;

  requiredFieldErrors = computed(() =>
    this.fieldMappings()
      .filter(m => m.required && !m.included)
      .map(m => m.sourcePath)
  );

  fieldConstraintErrors = computed(() => {
    const errors: Array<{ field: string; message: string }> = [];
    this.fieldMappings().forEach(m => {
      if (!m.included) return;
      const err = this.validateFieldConstraints(m);
      if (err) errors.push({ field: m.sourcePath, message: err });
    });
    return errors;
  });

  hasBlockingErrors = computed(() => {
    // Block if required fields are excluded
    if (this.requiredFieldErrors().length > 0) return true;
    
    // Block if there are backend validation errors
    if (this.backendValidationErrors().length > 0) return true;
    
    // Block if validation hasn't been run yet and there are included fields
    const hasIncludedFields = this.fieldMappings().some(m => m.included);
    if (hasIncludedFields && !this.backendValidationDone()) return true;
    
    return false;
  });

  allValidationErrors = computed(() => [
    ...this.requiredFieldErrors().map(f => ({
      field: f,
      type: 'REQUIRED',
      message: `Field "${f}" is required but excluded from the request`
    })),
    ...this.fieldConstraintErrors().map(e => ({
      field: e.field,
      type: 'CONSTRAINT',
      message: e.message
    })),
    ...this.backendValidationErrors()
  ]);

  ngOnInit(): void {
    // Wait for initialConfig to be set via effect (for editing existing mappings)
    // Only extract from sample if we don't have a mappingId (new mapping)
    const initial = this.initialConfig();
    const hasMappingId = !!this.mappingId();
    
    console.log('🔍 [Request Mapping] ngOnInit');
    console.log('🔍 mappingId:', this.mappingId());
    console.log('🔍 initialConfig:', initial);
    
    if (initial && initial.template && Object.keys(initial.template).length > 0) {
      console.log('✅ [Request Mapping] Loading from initial config in ngOnInit');
      this.loadFromInitialConfig(initial);
    } else if (!hasMappingId) {
      console.log('⚠️ [Request Mapping] New mapping - extracting from sample');
      this.extractFieldsFromSample();
    } else {
      console.log('⏳ [Request Mapping] Waiting for initialConfig to load via effect');
      // Will be loaded via effect when initialConfig is set
    }
    
    setTimeout(() => {
      if (this.fieldMappings().length > 0) {
        this.generatePreviewFromFields();
      }
    }, 100);
  }

  loadFromInitialConfig(config: RequestTransformationConfig): void {
    console.log('📥 [Request Mapping] loadFromInitialConfig called');
    console.log('📥 Config:', config);
    
    // Load the template and extract fields from it
    const template = config.template;
    console.log('📥 Template:', template);
    
    const fields: FieldMapping[] = [];
    
    // Get all fields from canonical sample for reference
    const sampleJson = this.canonicalSampleJson();
    let sampleFields: Map<string, any> = new Map();
    
    if (sampleJson) {
      try {
        const parsed = JSON.parse(sampleJson);
        const flatFields = this.flattenObject(parsed);
        flatFields.forEach(f => sampleFields.set(f.path, f.value));
        console.log('📥 Sample fields map:', Array.from(sampleFields.keys()));
      } catch (e) {
        console.error('Failed to parse sample JSON:', e);
      }
    }
    
    // Extract fields from template
    this.extractFieldsFromTemplate(template, '', fields, sampleFields);
    console.log('📥 Extracted fields from template:', fields);
    
    this.fieldMappings.set(fields);
    
    // Load headers if present
    if (config.headers && Object.keys(config.headers).length > 0) {
      this.headersJson.set(JSON.stringify(config.headers, null, 2));
    }
    
    console.log('✅ [Request Mapping] Loaded', fields.length, 'fields from initial config');
  }

  private extractFieldsFromTemplate(
    obj: any, 
    prefix: string, 
    fields: FieldMapping[], 
    sampleFields: Map<string, any>
  ): void {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      
      const path = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // This is a template placeholder like {{transactionId}}
        const sourcePath = value.slice(2, -2).trim();
        const sourceValue = sampleFields.get(sourcePath);
        
        fields.push({
          sourcePath: sourcePath,
          targetPath: path,
          sourceValue: sourceValue,
          included: true,
          required: false,
          fieldType: this.inferFieldType(sourceValue),
          validationRules: {},
          showConstraints: false
        });
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Nested object
        this.extractFieldsFromTemplate(value, path, fields, sampleFields);
      }
    }
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
          targetPath: f.path,
          sourceValue: f.value,
          included: true,
          required: false,
          fieldType: this.inferFieldType(f.value),
          validationRules: {},
          showConstraints: false
        }))
      );
    } catch (error) {
      console.error('Failed to parse sample JSON:', error);
    }
  }

  inferFieldType(value: any): 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' {
    if (value === null || value === undefined) return 'any';
    if (Array.isArray(value)) return 'array';
    const t = typeof value;
    if (t === 'string') return 'string';
    if (t === 'number') return 'number';
    if (t === 'boolean') return 'boolean';
    if (t === 'object') return 'object';
    return 'any';
  }

  validateFieldConstraints(mapping: FieldMapping): string | null {
    if (!mapping.included) return null;
    const v = mapping.sourceValue;
    const r = mapping.validationRules;

    // Validate required fields
    if (mapping.required && (v === null || v === undefined || v === '')) {
      return 'This field is required';
    }

    if (mapping.fieldType === 'number' && typeof v === 'number') {
      if (r.minValue !== null && r.minValue !== undefined && v < r.minValue) {
        return `Value ${v} is below minimum ${r.minValue}`;
      }
      if (r.maxValue !== null && r.maxValue !== undefined && v > r.maxValue) {
        return `Value ${v} exceeds maximum ${r.maxValue}`;
      }
    }

    if (mapping.fieldType === 'string' && typeof v === 'string') {
      if (r.minLength !== null && r.minLength !== undefined && v.length < r.minLength) {
        return `Length ${v.length} is below minimum ${r.minLength}`;
      }
      if (r.maxLength !== null && r.maxLength !== undefined && v.length > r.maxLength) {
        return `Length ${v.length} exceeds maximum ${r.maxLength}`;
      }
      if (r.pattern) {
        try {
          if (!new RegExp(r.pattern).test(v)) {
            return `Value doesn't match pattern: ${r.pattern}`;
          }
        } catch {
          return `Invalid regex pattern: ${r.pattern}`;
        }
      }
      if (r.enumValues && r.enumValues.length > 0 && !r.enumValues.includes(v)) {
        return `Value must be one of: ${r.enumValues.join(', ')}`;
      }
    }

    return null;
  }

  getFieldConstraintError(mapping: FieldMapping): string | null {
    return this.validateFieldConstraints(mapping);
  }

  isRequiredError(mapping: FieldMapping): boolean {
    return mapping.required && !mapping.included;
  }

  private flattenObject(obj: any, prefix = ''): Array<{path: string; value: any}> {
    const result: Array<{path: string; value: any}> = [];

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const path = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result.push(...this.flattenObject(value, path));
      } else {
        result.push({ path, value });
      }
    }

    return result;
  }

  toggleField(index: number): void {
    this.fieldMappings.update(mappings => {
      const updated = [...mappings];
      updated[index] = { ...updated[index], included: !updated[index].included };
      return updated;
    });
    this.generatePreviewFromFields();
    this.backendValidationDone.set(false);
  }

  toggleRequired(index: number): void {
    this.fieldMappings.update(mappings => {
      const updated = [...mappings];
      updated[index] = { ...updated[index], required: !updated[index].required };
      return updated;
    });
    this.backendValidationDone.set(false);
  }

  toggleConstraints(index: number): void {
    this.fieldMappings.update(mappings => {
      const updated = [...mappings];
      updated[index] = { ...updated[index], showConstraints: !updated[index].showConstraints };
      return updated;
    });
  }

  updateTargetPath(index: number, newPath: string): void {
    this.fieldMappings.update(mappings => {
      const updated = [...mappings];
      updated[index] = { ...updated[index], targetPath: newPath };
      return updated;
    });
    this.generatePreviewFromFields();
  }

  updateValidationRule(index: number, key: keyof FieldValidationRules, value: any): void {
    this.fieldMappings.update(mappings => {
      const updated = [...mappings];
      updated[index] = {
        ...updated[index],
        validationRules: { ...updated[index].validationRules, [key]: value }
      };
      return updated;
    });
    this.backendValidationDone.set(false);
  }

  selectAll(): void {
    this.fieldMappings.update(mappings => mappings.map(m => ({ ...m, included: true })));
    this.generatePreviewFromFields();
  }

  deselectAll(): void {
    this.fieldMappings.update(mappings => mappings.map(m => ({ ...m, included: false })));
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

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (type) {
      case 'number': return 'warn';
      case 'boolean': return 'success';
      case 'array': return 'info';
      case 'object': return 'secondary';
      case 'string': return 'info';
      default: return 'secondary';
    }
  }

  buildValidationRules(): FieldValidationRule[] {
    return this.fieldMappings()
      .filter(m => m.included || m.required)
      .map(m => {
        const rule: FieldValidationRule = {
          field: m.targetPath,
          required: m.required,
          type: m.fieldType
        };
        if (m.validationRules.minValue !== null && m.validationRules.minValue !== undefined) {
          rule.minValue = m.validationRules.minValue;
        }
        if (m.validationRules.maxValue !== null && m.validationRules.maxValue !== undefined) {
          rule.maxValue = m.validationRules.maxValue;
        }
        if (m.validationRules.minLength !== null && m.validationRules.minLength !== undefined) {
          rule.minLength = m.validationRules.minLength;
        }
        if (m.validationRules.maxLength !== null && m.validationRules.maxLength !== undefined) {
          rule.maxLength = m.validationRules.maxLength;
        }
        if (m.validationRules.pattern) {
          rule.pattern = m.validationRules.pattern;
        }
        if (m.validationRules.enumValues && m.validationRules.enumValues.length > 0) {
          rule.enumValues = m.validationRules.enumValues;
        }
        return rule;
      });
  }

  validateWithBackend(): void {
    const id = this.mappingId();
    if (!id) return;

    const previewJson = this.previewOutput();
    if (!previewJson) {
      this.generatePreviewFromFields();
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(this.previewOutput() || '{}');
    } catch {
      payload = {};
    }

    const rules = this.buildValidationRules();

    this.backendValidating.set(true);
    this.backendValidationErrors.set([]);
    this.backendValidationDone.set(false);

    this.mappingService.validateRequest(id, { payload, rules }).subscribe({
      next: (result) => {
        this.backendValidationErrors.set(result.errors || []);
        this.backendValidating.set(false);
        this.backendValidationDone.set(true);
        
        // Log validation result for debugging
        if (result.valid) {
          console.log('✓ Validation successful:', result.message);
        } else {
          console.warn('✗ Validation failed:', result.totalErrors, 'error(s)');
          result.errors?.forEach(err => {
            console.warn(`  - ${err.field}: ${err.message}`);
          });
        }
      },
      error: (err) => {
        console.error('Validation request failed:', err);
        this.backendValidating.set(false);
        this.backendValidationDone.set(true);
        
        // Add a generic error to show something went wrong
        this.backendValidationErrors.set([{
          field: '_system',
          type: 'ERROR',
          message: 'Failed to validate request. Please try again or check your connection.'
        }]);
      }
    });
  }

  templatePlaceholder = '{ "field": "{{canonical.fieldName}}" }';

  needsRequestPayload = computed(() => {
    const m = this.method().toUpperCase();
    return m === 'POST' || m === 'PUT' || m === 'PATCH';
  });

  hasConstraints(mapping: FieldMapping): boolean {
    const r = mapping.validationRules;
    return mapping.required ||
      r.minValue !== null && r.minValue !== undefined ||
      r.maxValue !== null && r.maxValue !== undefined ||
      r.minLength !== null && r.minLength !== undefined ||
      r.maxLength !== null && r.maxLength !== undefined ||
      !!r.pattern ||
      (r.enumValues?.length ?? 0) > 0;
  }

  constructor() {
    effect(() => {
      const config = this.initialConfig();
      if (config) {
        console.log('🔄 [Request Mapping] effect triggered with config:', config);
        this.mode.set(config.mode);
        this.templateJson.set(JSON.stringify(config.template, null, 2));
        this.jsonataExpression.set(config.jsonata || '');
        this.headersJson.set(JSON.stringify(config.headers || {}, null, 2));

        if (config.template && Object.keys(config.template).length > 0) {
          // Load fields from template (not from sample)
          this.loadFromInitialConfig(config);
          setTimeout(() => {
            this.generatePreviewFromFields();
          }, 100);
        }
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
      return true;
    }

    if (this.hasBlockingErrors()) {
      return false;
    }

    if (this.useVisualMode()) {
      return true;
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
    // Validate before proceeding
    if (!this.isValid()) {
      return;
    }

    // If validation hasn't been run yet, run it first
    if (this.useVisualMode() && !this.backendValidationDone() && this.fieldMappings().some(m => m.included)) {
      this.validateWithBackend();
      return;
    }

    // Check for blocking errors
    if (this.hasBlockingErrors()) {
      return;
    }

    let config: RequestTransformationConfig;

    if (this.useVisualMode()) {
      const template = this.buildTemplateFromFields();
      config = {
        mode: 'template',
        template: this.parseJsonSafe(template),
        jsonata: '',
        headers: this.parseJsonSafe(this.headersJson()) as Record<string, string>
      };
    } else {
      config = {
        mode: this.mode(),
        template: this.parseJsonSafe(this.templateJson()),
        jsonata: this.jsonataExpression(),
        headers: this.parseJsonSafe(this.headersJson()) as Record<string, string>
      };
    }

    this.requestMappingComplete.emit({ config, validationRules: this.buildValidationRules() });
  }

  onBack(): void {
    this.backClicked.emit();
  }

  onSkip(): void {
    const config: RequestTransformationConfig = {
      mode: 'template',
      template: {},
      jsonata: '',
      headers: {}
    };
    this.requestMappingComplete.emit({ config, validationRules: [] });
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

  private debouncedPreview(): void {
    clearTimeout(this.previewDebounceTimer);
    this.previewDebounceTimer = setTimeout(() => {
      if (this.canonicalSampleJson()) {
        this.previewTransformation();
      }
    }, 300);
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
      return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
        const trimmed = key.trim();
        const value = this.getByPath(context, trimmed);
        return value !== undefined ? String(value) : `{{${trimmed}}}`;
      });
    }

    if (Array.isArray(template)) {
      return template.map(item => this.renderTemplate(item, context));
    }

    if (template && typeof template === 'object') {
      const result: any = {};
      for (const key of Object.keys(template)) {
        result[key] = this.renderTemplate(template[key], context);
      }
      return result;
    }

    return template;
  }

  private getByPath(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: any, key) => {
      return acc && typeof acc === 'object' ? acc[key] : undefined;
    }, obj);
  }

  copyPayload(text: string): void {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    this.copySuccess.set(true);
    setTimeout(() => this.copySuccess.set(false), 2000);
  }

  getNextButtonTooltip(): string {
    if (!this.needsRequestPayload()) {
      return '';
    }

    if (this.requiredFieldErrors().length > 0) {
      return `Required fields are excluded: ${this.requiredFieldErrors().join(', ')}`;
    }

    if (this.backendValidationErrors().length > 0) {
      return `Validation errors found: ${this.backendValidationErrors().length} issue(s)`;
    }

    if (this.useVisualMode() && !this.backendValidationDone() && this.fieldMappings().some(m => m.included)) {
      return 'Please validate the request payload before proceeding';
    }

    if (!this.isValid()) {
      if (this.mode() === 'template' && this.templateError()) {
        return `Template JSON error: ${this.templateError()}`;
      }
      if (this.mode() === 'jsonata' && this.jsonataError()) {
        return `JSONata error: ${this.jsonataError()}`;
      }
      if (this.headersError()) {
        return `Headers JSON error: ${this.headersError()}`;
      }
      return 'Please fix validation errors before proceeding';
    }

    return '';
  }
}
