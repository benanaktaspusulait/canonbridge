import { Component, input, output, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import mappingEngine from 'jsonata';

export type TransformKind =
  | 'direct'
  | 'date_format'
  | 'enum_map'
  | 'number_coerce'
  | 'default_value'
  | 'combine'
  | 'string_uppercase'
  | 'string_lowercase'
  | 'string_trim'
  | 'string_substring'
  | 'string_replace'
  | 'array_join'
  | 'array_first'
  | 'array_last'
  | 'array_element'
  | 'array_count'
  | 'array_filter_equals'
  | 'math_sum'
  | 'math_average'
  | 'math_min'
  | 'math_max'
  | 'conditional_value'
  | 'template_string'
  | 'custom_jsonata';

export type MappingMode = 'visual' | 'expression';

export interface MappingRule {
  id: string;
  targetKey: string;
  sourcePath: string;
  transform: TransformKind;
  mode?: MappingMode; // 'visual' for dropdown, 'expression' for direct JSONata
  paramA?: string;
  paramB?: string;
  paramC?: string;
  advancedExpression?: string;
}

interface SourceField {
  path: string;
  type: string;
  sample?: any;
}

interface TargetField {
  key: string;
  type: string;
  required: boolean;
  mapped: boolean;
}

interface TransformOption {
  label: string;
  value: TransformKind;
  category: string;
  description: string;
  params?: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select';
    placeholder?: string;
    options?: Array<{ label: string; value: string }>;
  }>;
}

@Component({
  selector: 'app-field-mapping-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TooltipModule,
    ToggleSwitchModule,
    InputNumberModule,
    TextareaModule
  ],
  templateUrl: './field-mapping-step.component.html',
  styleUrl: './field-mapping-step.component.scss'
})
export class FieldMappingStepComponent implements OnInit {
  sampleJson = input.required<string>();
  targetSchemaJson = input.required<string>();
  initialRules = input<any[]>([]);
  
  mappingComplete = output<{ rules: any[] }>();
  backClicked = output<void>();

  mappingRules = signal<MappingRule[]>([]);
  sourceFields = signal<SourceField[]>([]);
  targetFields = signal<TargetField[]>([]);
  previewResult = signal<any>(null);
  previewError = signal<string | null>(null);
  showJsonataReference = signal(false);
  selectedRuleForEdit = signal<MappingRule | null>(null);
  selectedSourceField = signal<SourceField | null>(null);
  
  transformOptions: TransformOption[] = [
    // Basic
    { label: 'Direct Copy', value: 'direct', category: 'Basic', description: 'Copy value as-is without transformation' },
    { label: 'Default Value', value: 'default_value', category: 'Basic', description: 'Use default if source is empty',
      params: [{ name: 'paramA', label: 'Default Value', type: 'text', placeholder: 'Enter default value' }]
    },
    
    // String Transformations
    { label: 'Uppercase', value: 'string_uppercase', category: 'String', description: 'Convert text to UPPERCASE' },
    { label: 'Lowercase', value: 'string_lowercase', category: 'String', description: 'Convert text to lowercase' },
    { label: 'Trim Whitespace', value: 'string_trim', category: 'String', description: 'Remove leading/trailing spaces' },
    { label: 'Substring', value: 'string_substring', category: 'String', description: 'Extract portion of text',
      params: [
        { name: 'paramA', label: 'Start Position', type: 'number', placeholder: '0' },
        { name: 'paramB', label: 'Length (optional)', type: 'number', placeholder: 'Leave empty for rest' }
      ]
    },
    { label: 'Replace Text', value: 'string_replace', category: 'String', description: 'Find and replace text',
      params: [
        { name: 'paramA', label: 'Find', type: 'text', placeholder: 'Text to find' },
        { name: 'paramB', label: 'Replace With', type: 'text', placeholder: 'Replacement text' }
      ]
    },
    { label: 'Combine Fields', value: 'combine', category: 'String', description: 'Concatenate two fields',
      params: [
        { name: 'paramA', label: 'Second Field Path', type: 'text', placeholder: 'e.g., lastName' },
        { name: 'paramB', label: 'Separator', type: 'text', placeholder: 'e.g., " "' }
      ]
    },
    { label: 'Template String', value: 'template_string', category: 'String', description: 'Build string from template',
      params: [{ name: 'paramA', label: 'Template', type: 'textarea', placeholder: 'Use {{fieldPath}} syntax' }]
    },
    
    // Array Transformations
    { label: 'Array Join', value: 'array_join', category: 'Array', description: 'Join array elements to string',
      params: [{ name: 'paramA', label: 'Separator', type: 'text', placeholder: 'e.g., ", "' }]
    },
    { label: 'Array First', value: 'array_first', category: 'Array', description: 'Get first element' },
    { label: 'Array Last', value: 'array_last', category: 'Array', description: 'Get last element' },
    { label: 'Array Element', value: 'array_element', category: 'Array', description: 'Get element at index',
      params: [{ name: 'paramA', label: 'Index (1-based)', type: 'number', placeholder: '1' }]
    },
    { label: 'Array Count', value: 'array_count', category: 'Array', description: 'Count array elements' },
    { label: 'Array Filter', value: 'array_filter_equals', category: 'Array', description: 'Filter array by field value',
      params: [
        { name: 'paramA', label: 'Field Path', type: 'text', placeholder: 'e.g., status' },
        { name: 'paramB', label: 'Value', type: 'text', placeholder: 'Value to match' }
      ]
    },
    
    // Math Transformations
    { label: 'Sum', value: 'math_sum', category: 'Math', description: 'Sum of array numbers' },
    { label: 'Average', value: 'math_average', category: 'Math', description: 'Average of array numbers' },
    { label: 'Minimum', value: 'math_min', category: 'Math', description: 'Minimum value in array' },
    { label: 'Maximum', value: 'math_max', category: 'Math', description: 'Maximum value in array' },
    
    // Type Conversions
    { label: 'Convert to Number', value: 'number_coerce', category: 'Type', description: 'Convert value to number' },
    
    // Date Transformations
    { label: 'Date Format', value: 'date_format', category: 'Date', description: 'Convert date format',
      params: [
        { name: 'paramA', label: 'Input Format', type: 'select', placeholder: 'Select format',
          options: [
            { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd' },
            { label: 'dd/MM/yyyy', value: 'dd/MM/yyyy' },
            { label: 'MM/dd/yyyy', value: 'MM/dd/yyyy' },
            { label: 'ISO 8601', value: 'iso8601' }
          ]
        },
        { name: 'paramB', label: 'Output Format', type: 'select', placeholder: 'Select format',
          options: [
            { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd' },
            { label: 'dd/MM/yyyy', value: 'dd/MM/yyyy' },
            { label: 'MM/dd/yyyy', value: 'MM/dd/yyyy' },
            { label: 'ISO 8601', value: 'iso8601' }
          ]
        }
      ]
    },
    
    // Conditional
    { label: 'Conditional Value', value: 'conditional_value', category: 'Logic', description: 'If-then-else logic',
      params: [
        { name: 'paramA', label: 'If Value Equals', type: 'text', placeholder: 'Condition value' },
        { name: 'paramB', label: 'Then Return', type: 'text', placeholder: 'Value if true' },
        { name: 'paramC', label: 'Else Return', type: 'text', placeholder: 'Value if false' }
      ]
    },
    { label: 'Enum Mapping', value: 'enum_map', category: 'Logic', description: 'Map values using lookup table',
      params: [{ name: 'paramA', label: 'Mapping JSON', type: 'textarea', 
        placeholder: '[{"source":"A","target":"Active"},{"source":"I","target":"Inactive"}]' }]
    },
    
    // Advanced
    { label: 'Custom JSONata', value: 'custom_jsonata', category: 'Advanced', description: 'Write custom JSONata expression',
      params: [{ name: 'advancedExpression', label: 'JSONata Expression', type: 'textarea', 
        placeholder: 'e.g., $uppercase(firstName) & " " & $uppercase(lastName)' }]
    }
  ];

  // Computed signals
  mappedCount = computed(() => this.mappingRules().length);
  requiredMissingCount = computed(() => 
    this.targetFields().filter(f => f.required && !f.mapped).length
  );
  completionPercentage = computed(() => {
    const total = this.targetFields().length;
    return total > 0 ? Math.round((this.mappedCount() / total) * 100) : 0;
  });

  constructor() {
    // Auto-generate preview when rules change
    // effect() must be called in constructor (injection context)
    effect(() => {
      const rules = this.mappingRules();
      if (rules.length > 0) {
        this.generatePreview();
      }
    });
  }

  ngOnInit(): void {
    this.extractSourceFields();
    this.extractTargetFields();
    this.loadInitialRules();
  }

  extractSourceFields(): void {
    try {
      const sample = JSON.parse(this.sampleJson());
      const fields = this.extractFieldPathsWithTypes(sample);
      this.sourceFields.set(fields);
    } catch (e) {
      console.error('Failed to parse sample JSON:', e);
      this.sourceFields.set([]);
    }
  }

  extractTargetFields(): void {
    try {
      const schema = JSON.parse(this.targetSchemaJson());
      const fields = this.extractSchemaFieldsWithTypes(schema);
      this.targetFields.set(fields);
    } catch (e) {
      console.error('Failed to parse target schema:', e);
      this.targetFields.set([]);
    }
  }

  private extractFieldPathsWithTypes(obj: any, prefix = ''): SourceField[] {
    const fields: SourceField[] = [];
    
    if (typeof obj !== 'object' || obj === null) {
      return fields;
    }
    
    for (const key in obj) {
      const path = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      
      fields.push({ path, type, sample: value });
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        fields.push(...this.extractFieldPathsWithTypes(value, path));
      }
    }
    
    return fields;
  }

  private extractSchemaFieldsWithTypes(schema: any, prefix = ''): TargetField[] {
    const fields: TargetField[] = [];
    
    if (schema.type === 'object' && schema.properties) {
      const required = schema.required || [];
      
      for (const key in schema.properties) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const prop = schema.properties[key];
        
        fields.push({
          key: fullKey,
          type: prop.type || 'string',
          required: required.includes(key),
          mapped: false
        });
        
        if (prop.type === 'object' && prop.properties) {
          fields.push(...this.extractSchemaFieldsWithTypes(prop, fullKey));
        }
      }
    }
    
    return fields;
  }

  private loadInitialRules(): void {
    const initial = this.initialRules();
    if (initial && initial.length > 0) {
      const rules = initial.map((r: any, index: number) => ({
        id: r.id || `rule_${index}`,
        targetKey: r.targetKey || r.targetField || '',
        sourcePath: r.sourcePath || r.expression || '',
        transform: r.transform || 'direct',
        paramA: r.paramA || '',
        paramB: r.paramB || '',
        paramC: r.paramC || '',
        advancedExpression: r.advancedExpression || ''
      }));
      this.mappingRules.set(rules);
      this.updateMappedStatus();
    } else {
      this.autoMapFields();
    }
  }

  autoMapFields(): void {
    const sources = this.sourceFields();
    const targets = this.targetFields();
    const rules: MappingRule[] = [];
    
    targets.forEach((target, index) => {
      const matchingSource = sources.find(s => 
        s.path.toLowerCase() === target.key.toLowerCase() ||
        s.path.toLowerCase().endsWith(`.${target.key.toLowerCase()}`) ||
        s.path.toLowerCase().replace(/[_-]/g, '') === target.key.toLowerCase().replace(/[_-]/g, '')
      );
      
      if (matchingSource) {
        rules.push({
          id: `rule_${index}`,
          targetKey: target.key,
          sourcePath: matchingSource.path,
          transform: 'direct'
        });
      }
    });
    
    this.mappingRules.set(rules);
    this.updateMappedStatus();
  }

  private updateMappedStatus(): void {
    const rules = this.mappingRules();
    this.targetFields.update(fields => 
      fields.map(f => ({
        ...f,
        mapped: rules.some(r => r.targetKey === f.key)
      }))
    );
  }

  onSourceFieldDrop(event: CdkDragDrop<any>, targetField: TargetField): void {
    if (event.previousContainer !== event.container) {
      const sourceField = event.previousContainer.data[event.previousIndex] as SourceField;
      this.createMapping(sourceField.path, targetField.key);
    }
  }

  selectSourceField(field: SourceField): void {
    // Toggle selection
    if (this.selectedSourceField()?.path === field.path) {
      this.selectedSourceField.set(null);
    } else {
      this.selectedSourceField.set(field);
    }
  }

  onTargetFieldClick(targetField: TargetField): void {
    const selected = this.selectedSourceField();
    if (selected) {
      // Create mapping from selected source to clicked target
      this.createMapping(selected.path, targetField.key);
      // Clear selection after mapping
      this.selectedSourceField.set(null);
    }
  }

  createMapping(sourcePath: string, targetKey: string): void {
    const existing = this.mappingRules().findIndex(r => r.targetKey === targetKey);
    
    if (existing >= 0) {
      this.mappingRules.update(rules => {
        const updated = [...rules];
        updated[existing] = { ...updated[existing], sourcePath };
        return updated;
      });
    } else {
      this.mappingRules.update(rules => [
        ...rules,
        {
          id: `rule_${Date.now()}`,
          targetKey,
          sourcePath,
          transform: 'direct'
        }
      ]);
    }
    
    this.updateMappedStatus();
  }

  removeMapping(targetKey: string): void {
    this.mappingRules.update(rules => rules.filter(r => r.targetKey !== targetKey));
    this.updateMappedStatus();
  }

  updateTransform(targetKey: string, transform: TransformKind): void {
    this.mappingRules.update(rules => 
      rules.map(r => r.targetKey === targetKey ? { ...r, transform, paramA: '', paramB: '', paramC: '', advancedExpression: '' } : r)
    );
  }

  updateRuleParam(targetKey: string, paramName: string, value: string): void {
    const key = paramName as 'paramA' | 'paramB' | 'paramC' | 'advancedExpression';
    this.mappingRules.update(rules => 
      rules.map(r => r.targetKey === targetKey ? { ...r, [key]: value } : r)
    );
  }

  generatePreview(): void {
    try {
      const sample = JSON.parse(this.sampleJson());
      const rules = this.mappingRules();
      const result: any = {};

      rules.forEach(rule => {
        try {
          const value = this.evaluateRule(rule, sample);
          this.setNestedValue(result, rule.targetKey, value);
        } catch (error: any) {
          console.error(`Error evaluating rule for ${rule.targetKey}:`, error);
        }
      });

      this.previewResult.set(result);
      this.previewError.set(null);
    } catch (error: any) {
      this.previewError.set(error.message);
      this.previewResult.set(null);
    }
  }

  private evaluateRule(rule: MappingRule, sample: any): any {
    const sourceValue = this.getNestedValue(sample, rule.sourcePath);

    // If custom JSONata, evaluate it
    if (rule.transform === 'custom_jsonata' && rule.advancedExpression) {
      try {
        const expression = mappingEngine(rule.advancedExpression);
        return expression.evaluate(sample);
      } catch (error) {
        console.error('JSONata evaluation error:', error);
        return sourceValue;
      }
    }

    // Apply visual transformations
    switch (rule.transform) {
      case 'direct':
        return sourceValue;
      
      // String transformations
      case 'string_uppercase':
        return typeof sourceValue === 'string' ? sourceValue.toUpperCase() : sourceValue;
      case 'string_lowercase':
        return typeof sourceValue === 'string' ? sourceValue.toLowerCase() : sourceValue;
      case 'string_trim':
        return typeof sourceValue === 'string' ? sourceValue.trim() : sourceValue;
      case 'string_substring': {
        const str = String(sourceValue || '');
        const start = parseInt(rule.paramA || '0', 10);
        const length = rule.paramB ? parseInt(rule.paramB, 10) : undefined;
        return length !== undefined ? str.substring(start, start + length) : str.substring(start);
      }
      case 'string_replace': {
        const str = String(sourceValue || '');
        const find = rule.paramA || '';
        const replace = rule.paramB || '';
        return str.split(find).join(replace);
      }
      case 'combine': {
        const secondValue = this.getNestedValue(sample, rule.paramA || '');
        const separator = rule.paramB || '';
        return `${sourceValue || ''}${separator}${secondValue || ''}`;
      }
      case 'template_string': {
        const template = rule.paramA || '';
        return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
          const value = this.getNestedValue(sample, path.trim());
          return value !== null && value !== undefined ? String(value) : '';
        });
      }
      
      // Array transformations
      case 'array_join':
        return Array.isArray(sourceValue) ? sourceValue.join(rule.paramA || ',') : sourceValue;
      case 'array_first':
        return Array.isArray(sourceValue) ? sourceValue[0] : undefined;
      case 'array_last':
        return Array.isArray(sourceValue) ? sourceValue[sourceValue.length - 1] : undefined;
      case 'array_element': {
        const index = parseInt(rule.paramA || '1', 10) - 1;
        return Array.isArray(sourceValue) ? sourceValue[index] : undefined;
      }
      case 'array_count':
        return Array.isArray(sourceValue) ? sourceValue.length : 0;
      case 'array_filter_equals': {
        if (!Array.isArray(sourceValue)) return [];
        const fieldPath = rule.paramA || '';
        const matchValue = rule.paramB || '';
        return sourceValue.filter(item => 
          String(this.getNestedValue(item, fieldPath) || '') === matchValue
        );
      }
      
      // Math transformations
      case 'math_sum': {
        const numbers = this.asNumberArray(sourceValue);
        return numbers.reduce((sum, n) => sum + n, 0);
      }
      case 'math_average': {
        const numbers = this.asNumberArray(sourceValue);
        return numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : null;
      }
      case 'math_min': {
        const numbers = this.asNumberArray(sourceValue);
        return numbers.length > 0 ? Math.min(...numbers) : null;
      }
      case 'math_max': {
        const numbers = this.asNumberArray(sourceValue);
        return numbers.length > 0 ? Math.max(...numbers) : null;
      }
      
      // Type conversions
      case 'number_coerce':
        return sourceValue === null || sourceValue === undefined || sourceValue === '' ? null : Number(sourceValue);
      
      // Date transformations
      case 'date_format': {
        const inputFormat = rule.paramA || 'yyyy-MM-dd';
        const outputFormat = rule.paramB || 'dd/MM/yyyy';
        if (typeof sourceValue !== 'string') return sourceValue;
        
        // Simple date format conversion (extend as needed)
        if (inputFormat === 'yyyy-MM-dd' && outputFormat === 'dd/MM/yyyy') {
          const [y, m, d] = sourceValue.split('-');
          return `${d}/${m}/${y}`;
        }
        return sourceValue;
      }
      
      // Conditional
      case 'conditional_value': {
        const condition = rule.paramA || '';
        const thenValue = rule.paramB || '';
        const elseValue = rule.paramC || '';
        return String(sourceValue || '') === condition ? thenValue : elseValue;
      }
      case 'enum_map': {
        try {
          const mapping = JSON.parse(rule.paramA || '[]');
          const key = String(sourceValue || '');
          const found = mapping.find((m: any) => m.source === key);
          return found ? found.target : sourceValue;
        } catch {
          return sourceValue;
        }
      }
      
      // Default value
      case 'default_value':
        return sourceValue === null || sourceValue === undefined || sourceValue === '' ? rule.paramA : sourceValue;
      
      default:
        return sourceValue;
    }
  }

  private asNumberArray(value: unknown): number[] {
    if (!Array.isArray(value)) {
      const n = Number(value);
      return Number.isFinite(n) ? [n] : [];
    }
    return value.map(item => Number(item)).filter(n => Number.isFinite(n));
  }

  private getNestedValue(obj: any, path: string): any {
    if (!path) return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  getMappingForTarget(targetKey: string): MappingRule | undefined {
    return this.mappingRules().find(r => r.targetKey === targetKey);
  }

  getParamValue(mapping: MappingRule, paramName: string): string {
    if (paramName === 'advancedExpression') {
      return mapping.advancedExpression || '';
    }
    return (mapping as any)[paramName] || '';
  }

  getTransformOption(transform: TransformKind): TransformOption | undefined {
    return this.transformOptions.find(opt => opt.value === transform);
  }

  getFieldIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'string': 'pi pi-align-left',
      'number': 'pi pi-hashtag',
      'boolean': 'pi pi-check-square',
      'object': 'pi pi-box',
      'array': 'pi pi-list',
      'date': 'pi pi-calendar',
      'null': 'pi pi-minus-circle'
    };
    return iconMap[type] || 'pi pi-question-circle';
  }

  clearAllMappings(): void {
    this.mappingRules.set([]);
    this.updateMappedStatus();
  }

  toggleJsonataReference(): void {
    this.showJsonataReference.update(v => !v);
  }

  // Expose for template
  Math = Math;
  JSON = JSON;

  isValid(): boolean {
    const rules = this.mappingRules();
    const targets = this.targetFields();
    const requiredTargets = targets.filter(t => t.required);
    
    return requiredTargets.every(t => rules.some(r => r.targetKey === t.key));
  }

  onNext(): void {
    this.mappingComplete.emit({ rules: this.mappingRules() });
  }

  onBack(): void {
    this.backClicked.emit();
  }
}
