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
import { ruleToJsonataFragment, buildCombinedMappingExpression } from './rule-to-jsonata';

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
  selectedTargetForPattern = signal<string | null>(null); // Track which target field is in expression mode
  expandedFields = signal<Set<string>>(new Set()); // Track which fields are expanded

  // Pattern constants for complex expressions with special characters
  readonly patterns = {
    concatenate: 'firstName & " " & lastName',
    conditional: 'status = "A" ? "ACTIVE" : "INACTIVE"',
    defaultValue: 'email ? email : "no-reply@example.com"',
    arrayTransform: 'items.($uppercase(productName))',
    filterExtract: '$filter(orders, function($v) { $v.status = "completed" }).orderId',
    nestedField: 'customer.address.city',
    arrayElement: 'items[0].name',
    stringChain: '$uppercase($trim(name))',
    sumArray: '$sum(items.price)',
    filterCondition: 'items[price > 100]',
    countFiltered: '$count(items[status="active"])',
    joinArray: '$join(tags, ", ")'
  };
  
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
    console.log('🔧 Transform Options:', this.transformOptions.length, 'items');
    console.log('First 3 options:', this.transformOptions.slice(0, 3).map(o => ({ label: o.label, value: o.value, category: o.category })));
    console.log('📥 Initial rules input:', this.initialRules());
    console.log('📥 Sample JSON input:', this.sampleJson());
    console.log('📥 Target schema JSON input:', this.targetSchemaJson());
    
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
    console.log('🔍 Loading initial rules:', initial);
    
    if (initial && initial.length > 0) {
      const rules = initial.map((r: any, index: number) => ({
        id: r.id || `rule_${index}`,
        targetKey: r.targetKey || r.targetField || '',
        sourcePath: r.sourcePath || r.expression || '',
        transform: r.transform || 'direct',
        mode: r.mode || 'visual',
        paramA: r.paramA || '',
        paramB: r.paramB || '',
        paramC: r.paramC || '',
        advancedExpression: r.advancedExpression || ''
      }));
      console.log('✅ Loaded rules:', rules);
      this.mappingRules.set(rules);
      this.updateMappedStatus();
    } else {
      console.log('ℹ️ No initial rules, auto-mapping fields...');
      this.autoMapFields();
    }
  }

  autoMapFields(): void {
    const sources = this.sourceFields();
    const targets = this.targetFields();
    const rules: MappingRule[] = [];
    
    console.log('🔄 Auto-mapping fields...');
    console.log('Source fields:', sources.map(s => s.path));
    console.log('Target fields:', targets.map(t => t.key));
    
    targets.forEach((target, index) => {
      const matchingSource = sources.find(s => 
        s.path.toLowerCase() === target.key.toLowerCase() ||
        s.path.toLowerCase().endsWith(`.${target.key.toLowerCase()}`) ||
        s.path.toLowerCase().replace(/[_-]/g, '') === target.key.toLowerCase().replace(/[_-]/g, '')
      );
      
      if (matchingSource) {
        console.log(`✅ Auto-mapped: ${matchingSource.path} → ${target.key}`);
        rules.push({
          id: `rule_${index}`,
          targetKey: target.key,
          sourcePath: matchingSource.path,
          transform: 'direct',
          mode: 'visual'
        });
      }
    });
    
    console.log('📋 Total auto-mapped rules:', rules.length);
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
          transform: 'direct',
          mode: 'visual' // Default to visual mode
        }
      ]);
      
      // Auto-expand the newly mapped field
      this.expandedFields.update(set => {
        const newSet = new Set(set);
        newSet.add(targetKey);
        return newSet;
      });
    }
    
    this.updateMappedStatus();
  }

  removeMapping(targetKey: string): void {
    this.mappingRules.update(rules => rules.filter(r => r.targetKey !== targetKey));
    this.updateMappedStatus();
  }

  updateTransform(targetKey: string, transform: TransformKind): void {
    console.log('🔧 updateTransform called:', targetKey, transform);
    this.mappingRules.update(rules => 
      rules.map(r => r.targetKey === targetKey ? { ...r, transform, paramA: '', paramB: '', paramC: '', advancedExpression: '' } : r)
    );
    // Regenerate preview after transform change
    setTimeout(() => this.generatePreview(), 0);
  }

  setMappingMode(targetKey: string, mode: MappingMode): void {
    this.mappingRules.update(rules => 
      rules.map(r => {
        if (r.targetKey === targetKey) {
          if (mode === 'expression') {
            // Switching to expression mode - set advancedExpression to sourcePath if empty
            return { 
              ...r, 
              mode, 
              advancedExpression: r.advancedExpression || r.sourcePath,
              transform: 'custom_jsonata'
            };
          } else {
            // Switching to visual mode - reset to direct if was custom_jsonata
            return { 
              ...r, 
              mode,
              transform: r.transform === 'custom_jsonata' ? 'direct' : r.transform
            };
          }
        }
        return r;
      })
    );
  }

  showTransformOptions(targetKey: string): void {
    // Change transform from 'direct' to first available transform option
    this.mappingRules.update(rules => 
      rules.map(r => 
        r.targetKey === targetKey 
          ? { ...r, transform: 'string_uppercase' } // Default to uppercase as first option
          : r
      )
    );
    // Regenerate preview
    this.generatePreview();
  }

  removeTransform(targetKey: string): void {
    // Reset back to direct copy
    this.mappingRules.update(rules => 
      rules.map(r => 
        r.targetKey === targetKey 
          ? { ...r, transform: 'direct', paramA: '', paramB: '', paramC: '' }
          : r
      )
    );
    // Regenerate preview
    this.generatePreview();
  }

  updateExpression(targetKey: string, expression: string): void {
    this.mappingRules.update(rules => 
      rules.map(r => r.targetKey === targetKey ? { ...r, advancedExpression: expression, transform: 'custom_jsonata' } : r)
    );
    // Track which field is being edited for pattern insertion
    this.selectedTargetForPattern.set(targetKey);
  }

  insertPattern(pattern: string): void {
    const targetKey = this.selectedTargetForPattern();
    if (!targetKey) {
      // If no field is selected, show a message
      console.warn('Please select a target field in expression mode first');
      return;
    }

    // Get current expression
    const currentRule = this.mappingRules().find(r => r.targetKey === targetKey);
    const currentExpression = currentRule?.advancedExpression || currentRule?.sourcePath || '';

    // If current expression is empty or just the source path, replace it
    // Otherwise, append the pattern
    const newExpression = !currentExpression || currentExpression === currentRule?.sourcePath
      ? pattern
      : currentExpression + '\n' + pattern;

    this.updateExpression(targetKey, newExpression);
    
    // Scroll to the target field
    setTimeout(() => {
      const element = document.querySelector(`[data-target-key="${targetKey}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  updateRuleParam(targetKey: string, paramName: string, value: string): void {
    const key = paramName as 'paramA' | 'paramB' | 'paramC' | 'advancedExpression';
    this.mappingRules.update(rules => 
      rules.map(r => r.targetKey === targetKey ? { ...r, [key]: value } : r)
    );
    // Regenerate preview after param change
    this.generatePreview();
  }

  async generatePreview(): Promise<void> {
    console.log('🔄 Generating preview...');
    console.log('Sample JSON:', this.sampleJson());
    console.log('Mapping Rules:', this.mappingRules());
    
    try {
      const sample = JSON.parse(this.sampleJson());
      const rules = this.mappingRules();
      
      if (rules.length === 0) {
        console.log('⚠️ No rules to apply');
        this.previewResult.set({});
        this.previewError.set(null);
        return;
      }
      
      // Use the same JSONata conversion as Integration Studio
      const jsonataExpression = buildCombinedMappingExpression(rules);
      console.log('📝 Generated JSONata:', jsonataExpression);
      
      const expression = mappingEngine(jsonataExpression);
      const result = await expression.evaluate(sample);
      
      console.log('✅ Preview result:', JSON.stringify(result, null, 2));
      this.previewResult.set(result || {});
      this.previewError.set(null);
    } catch (error: any) {
      console.error('❌ Preview generation error:', error);
      this.previewError.set(error.message);
      this.previewResult.set(null);
    }
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

  getTransformOptionsForField(targetKey: string): TransformOption[] {
    const mapping = this.mappingRules().find(r => r.targetKey === targetKey);
    if (!mapping) return this.transformOptions;

    const targetField = this.targetFields().find(f => f.key === targetKey);
    if (!targetField) return this.transformOptions;

    const fieldType = targetField.type.toLowerCase();

    // Filter transformations based on field type
    return this.transformOptions.filter(opt => {
      // Direct copy and default value work for all types
      if (opt.value === 'direct' || opt.value === 'default_value') return true;

      // String transformations
      if (fieldType === 'string') {
        return opt.category === 'String' || opt.category === 'Basic' || opt.category === 'Logic';
      }

      // Number transformations
      if (fieldType === 'number' || fieldType === 'integer') {
        return opt.category === 'Math' || opt.category === 'Type' || opt.category === 'Basic' || opt.category === 'Logic';
      }

      // Array transformations
      if (fieldType === 'array') {
        return opt.category === 'Array' || opt.category === 'Math' || opt.category === 'Basic';
      }

      // Boolean transformations
      if (fieldType === 'boolean') {
        return opt.category === 'Logic' || opt.category === 'Basic';
      }

      // Date transformations
      if (fieldType === 'date' || fieldType === 'datetime') {
        return opt.category === 'Date' || opt.category === 'String' || opt.category === 'Basic';
      }

      // Default: show all
      return true;
    });
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

  toggleFieldExpanded(fieldKey: string, event: Event): void {
    event.stopPropagation(); // Prevent field click
    this.expandedFields.update(set => {
      const newSet = new Set(set);
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey);
      } else {
        newSet.add(fieldKey);
      }
      return newSet;
    });
  }

  isFieldExpanded(fieldKey: string): boolean {
    return this.expandedFields().has(fieldKey);
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
