import { Component, input, output, signal, OnInit, computed, effect, inject } from '@angular/core';
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
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import mappingEngine from 'jsonata';
import { ruleToJsonataFragment, buildCombinedMappingExpression } from './rule-to-jsonata';
import { MappingService } from '../../../../core/services/mapping.service';

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

export type SourceValidationKind =
  | 'required'
  | 'type'
  | 'enum'
  | 'min'
  | 'max'
  | 'min_length'
  | 'max_length'
  | 'regex';

export interface SourceValidationRule {
  id: string;
  path: string;
  kind: SourceValidationKind;
  paramA: string;
  paramB: string;
  enabled: boolean;
}

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
    type: 'text' | 'number' | 'textarea' | 'select' | 'source-subfield';
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
    TextareaModule,
    DialogModule,
    CheckboxModule
  ],
  templateUrl: './field-mapping-step.component.html',
  styleUrl: './field-mapping-step.component.scss'
})
export class FieldMappingStepComponent implements OnInit {
  sampleJson = input.required<string>();
  targetSchemaJson = input.required<string>();
  inputSchema = input<string>('');
  mappingId = input<string | null>(null);
  initialRules = input<any[]>([]);
  excludedFields = input<string[]>([]);
  
  mappingComplete = output<{ rules: any[]; excludedTargetFields: string[] }>();
  backClicked = output<void>();

  private readonly mappingService = inject(MappingService);

  mappingRules = signal<MappingRule[]>([]);
  sourceFields = signal<SourceField[]>([]);
  targetFields = signal<TargetField[]>([]);
  sourceFieldFilter = signal('');
  collapsedGroups = signal<Set<string>>(new Set());
  savingRules = signal(false);
  removedTargetFields = signal<Set<string>>(new Set());
  
  filteredSourceFields = computed(() => {
    const filter = this.sourceFieldFilter().toLowerCase().trim();
    const fields = this.sourceFields();
    if (!filter) return fields;
    return fields.filter(f => f.path.toLowerCase().includes(filter) || f.type.toLowerCase().includes(filter));
  });

  groupedSourceFields = computed(() => {
    const fields = this.filteredSourceFields();
    const collapsed = this.collapsedGroups();
    
    interface SourceGroup {
      key: string;
      type: string;
      collapsed: boolean;
      children: SourceField[];
    }
    
    const groups: SourceGroup[] = [];
    const rootFields: SourceField[] = [];
    const childMap = new Map<string, SourceField[]>();
    
    // Separate root fields from nested fields
    for (const field of fields) {
      const dotIndex = field.path.indexOf('.');
      if (dotIndex === -1) {
        // Root level field
        if (field.type === 'object' || field.type === 'array') {
          // This is a parent group
          if (!childMap.has(field.path)) {
            childMap.set(field.path, []);
          }
        } else {
          rootFields.push(field);
        }
      } else {
        // Nested field - group by first segment
        const parent = field.path.substring(0, dotIndex);
        if (!childMap.has(parent)) {
          childMap.set(parent, []);
        }
        childMap.get(parent)!.push(field);
      }
    }
    
    // Build result: root fields as "main" group first, then object/array groups
    const result: Array<SourceField | SourceGroup> = [];
    
    // Root fields go into a "main" group
    if (rootFields.length > 0) {
      result.push({
        key: '_root',
        type: 'main',
        collapsed: collapsed.has('_root'),
        children: rootFields
      });
    }
    
    for (const [key, children] of childMap) {
      const parentField = fields.find(f => f.path === key);
      const type = parentField?.type || 'object';
      result.push({
        key,
        type,
        collapsed: collapsed.has(key),
        children
      });
    }
    
    return result;
  });
  previewResult = signal<any>(null);
  previewError = signal<string | null>(null);
  copiedPreviewTarget = signal<'source' | 'result' | null>(null);
  showJsonataReference = signal(false);
  selectedRuleForEdit = signal<MappingRule | null>(null);
  selectedSourceField = signal<SourceField | null>(null);
  selectedTargetForPattern = signal<string | null>(null); // Track which target field is in expression mode
  expandedFields = signal<Set<string>>(new Set()); // Track which fields are expanded
  showAddFieldDialog = signal(false);
  newFieldName = signal('');
  newFieldType = signal('string');
  newFieldRequired = signal(false);
  newFieldDescription = signal('');
  newFieldMinLength = signal<number | null>(null);
  newFieldMaxLength = signal<number | null>(null);
  newFieldMin = signal<number | null>(null);
  newFieldMax = signal<number | null>(null);
  newFieldPattern = signal('');
  newFieldEnum = signal('');
  newFieldDefault = signal('');
  
  // Source Validation
  showSourceValidationDialog = signal(false);
  sourceValidationRules = signal<SourceValidationRule[]>([]);
  newValidationPath = signal('');
  newValidationKind = signal<SourceValidationKind>('required');
  newValidationParamA = signal('');
  newValidationParamB = signal('');
  editingValidationId = signal<string | null>(null);

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
    { label: 'Array Count', value: 'array_count', category: 'Array', description: 'Count array elements (optionally filtered)',
      params: [
        { name: 'paramA', label: 'Filter by field (optional)', type: 'source-subfield', placeholder: 'e.g., type' },
        { name: 'paramB', label: 'Equals value (optional)', type: 'text', placeholder: 'e.g., icecek' }
      ]
    },
    { label: 'Array Filter', value: 'array_filter_equals', category: 'Array', description: 'Filter array by field value',
      params: [
        { name: 'paramA', label: 'Field Path', type: 'text', placeholder: 'e.g., status' },
        { name: 'paramB', label: 'Value', type: 'text', placeholder: 'Value to match' }
      ]
    },
    
    // Math Transformations
    { label: 'Sum', value: 'math_sum', category: 'Math', description: 'Sum of array numbers',
      params: [{ name: 'paramA', label: 'Sub-field', type: 'source-subfield', placeholder: 'e.g., quantity' }]
    },
    { label: 'Average', value: 'math_average', category: 'Math', description: 'Average of array numbers',
      params: [{ name: 'paramA', label: 'Sub-field', type: 'source-subfield', placeholder: 'e.g., price' }]
    },
    { label: 'Minimum', value: 'math_min', category: 'Math', description: 'Minimum value in array',
      params: [{ name: 'paramA', label: 'Sub-field', type: 'source-subfield', placeholder: 'e.g., amount' }]
    },
    { label: 'Maximum', value: 'math_max', category: 'Math', description: 'Maximum value in array',
      params: [{ name: 'paramA', label: 'Sub-field', type: 'source-subfield', placeholder: 'e.g., amount' }]
    },
    
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
    // Load excluded fields from input
    const excluded = this.excludedFields();
    if (excluded && excluded.length > 0) {
      this.removedTargetFields.set(new Set(excluded));
    }
    
    this.extractSourceFields();
    this.extractTargetFields();
    this.loadInitialRules();
  }

  extractSourceFields(): void {
    const sampleJsonStr = this.sampleJson();
    console.log('=== EXTRACTING SOURCE FIELDS ===');
    console.log('sampleJson string:', sampleJsonStr);
    console.log('sampleJson length:', sampleJsonStr?.length);
    
    if (sampleJsonStr && sampleJsonStr.trim() !== '') {
      try {
        const sample = JSON.parse(sampleJsonStr);
        console.log('✅ Parsed sample JSON:', sample);
        const fields = this.extractFieldPathsWithTypes(sample);
        console.log('✅ Extracted source fields:', fields);
        this.sourceFields.set(fields);
        return;
      } catch (e) {
        console.error('❌ Failed to parse sample JSON:', e);
      }
    }

    // Fallback: generate source fields from inputSchema
    const inputSchemaStr = this.inputSchema();
    if (inputSchemaStr && inputSchemaStr.trim() !== '') {
      try {
        const schema = JSON.parse(inputSchemaStr);
        console.log('📋 Generating source fields from input schema');
        const fields = this.extractFieldsFromSchema(schema);
        if (fields.length > 0) {
          console.log('✅ Generated source fields from schema:', fields);
          this.sourceFields.set(fields);
          return;
        }
      } catch (e) {
        console.error('❌ Failed to parse input schema:', e);
      }
    }

    // Last fallback: generate source fields from targetSchemaJson (same structure)
    const targetSchemaStr = this.targetSchemaJson();
    if (targetSchemaStr && targetSchemaStr.trim() !== '') {
      try {
        const schema = JSON.parse(targetSchemaStr);
        console.log('📋 Generating source fields from target schema as fallback');
        const fields = this.extractFieldsFromSchema(schema);
        if (fields.length > 0) {
          console.log('✅ Generated source fields from target schema:', fields);
          this.sourceFields.set(fields);
          return;
        }
      } catch (e) {
        console.error('❌ Failed to parse target schema for source fields:', e);
      }
    }

    console.warn('⚠️ No source for generating source fields');
    this.sourceFields.set([]);
  }

  extractTargetFields(): void {
    const targetSchemaStr = this.targetSchemaJson();
    
    if (!targetSchemaStr || targetSchemaStr.trim() === '') {
      this.targetFields.set([]);
      return;
    }
    
    try {
      const schema = JSON.parse(targetSchemaStr);
      const fields = this.extractSchemaFieldsWithTypes(schema);
      // Filter out excluded fields
      const excluded = this.removedTargetFields();
      const filtered = fields.filter(f => !excluded.has(f.key));
      this.targetFields.set(filtered);
    } catch (e) {
      console.error('❌ Failed to parse target schema:', e);
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

  private extractFieldsFromSchema(schema: any, prefix = ''): SourceField[] {
    const fields: SourceField[] = [];
    
    if (schema.type === 'object' && schema.properties) {
      for (const key in schema.properties) {
        const path = prefix ? `${prefix}.${key}` : key;
        const prop = schema.properties[key];
        const type = prop.type || 'string';
        
        fields.push({ path, type, sample: this.generateSampleValue(key, prop) });
        
        if (type === 'object' && prop.properties) {
          fields.push(...this.extractFieldsFromSchema(prop, path));
        }
      }
    }
    
    return fields;
  }

  private generateSampleValue(key: string, prop: any): any {
    const type = prop.type || 'string';
    const keyLower = key.toLowerCase();
    
    if (type === 'number' || type === 'integer') {
      if (keyLower.includes('amount') || keyLower.includes('total') || keyLower.includes('price')) return 1250.50;
      if (keyLower.includes('score')) return 0.85;
      if (prop.minimum !== undefined) return prop.minimum;
      return 42;
    }
    if (type === 'boolean') return true;
    if (type === 'array') return [];
    if (type === 'object') return {};
    
    // String type
    if (prop.enum && prop.enum.length > 0) return prop.enum[0];
    if (keyLower.includes('email')) return 'john.doe@example.com';
    if (keyLower.includes('date') || keyLower.includes('time') || prop.format === 'date-time') return '2026-05-14T10:00:00Z';
    if (keyLower.includes('id')) return `${key.toUpperCase()}-001`;
    if (keyLower.includes('status')) return 'ACTIVE';
    if (keyLower.includes('currency')) return 'USD';
    if (keyLower.includes('name')) return 'Sample Name';
    if (prop.default !== undefined) return prop.default;
    
    return `sample_${key}`;
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
    const targets = this.targetFields();
    
    // Remove orphan rules (rules for target fields that no longer exist)
    const validTargetKeys = new Set(targets.map(f => f.key));
    const cleanedRules = rules.filter(r => validTargetKeys.has(r.targetKey));
    if (cleanedRules.length !== rules.length) {
      this.mappingRules.set(cleanedRules);
    }
    
    this.targetFields.update(fields => 
      fields.map(f => ({
        ...f,
        mapped: cleanedRules.some(r => r.targetKey === f.key)
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

  toggleSourceGroup(groupKey: string): void {
    this.collapsedGroups.update(set => {
      const newSet = new Set(set);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }

  expandAllGroups(): void {
    this.collapsedGroups.set(new Set());
  }

  collapseAllGroups(): void {
    const allKeys = this.groupedSourceFields().map((g: any) => g.key);
    this.collapsedGroups.set(new Set(allKeys));
  }

  isSourceGroup(item: any): boolean {
    return item && 'children' in item && 'key' in item;
  }

  isSourceFieldUsed(path: string): boolean {
    return this.mappingRules().some(r => r.sourcePath === path);
  }

  sortedTargetFields = computed(() => {
    const fields = this.targetFields();
    const rules = this.mappingRules();
    
    const unmapped = fields.filter(f => !rules.some(r => r.targetKey === f.key));
    const mapped = fields.filter(f => rules.some(r => r.targetKey === f.key));
    
    // Unmapped first (required first within unmapped), then mapped alphabetically
    unmapped.sort((a, b) => {
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      return a.key.localeCompare(b.key);
    });
    mapped.sort((a, b) => a.key.localeCompare(b.key));
    
    return [...unmapped, ...mapped];
  });

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

  removeTargetField(targetKey: string): void {
    this.removedTargetFields.update(set => {
      const newSet = new Set(set);
      newSet.add(targetKey);
      return newSet;
    });
    this.targetFields.update(fields => fields.filter(f => f.key !== targetKey));
    this.mappingRules.update(rules => rules.filter(r => r.targetKey !== targetKey));
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
    const sampleJsonStr = this.sampleJson();
    console.log('Sample JSON string:', sampleJsonStr);
    console.log('Sample JSON length:', sampleJsonStr?.length);
    console.log('Mapping Rules:', this.mappingRules());
    
    if (!sampleJsonStr || sampleJsonStr.trim() === '') {
      console.warn('⚠️ Sample JSON is empty, cannot generate preview');
      this.previewResult.set({});
      this.previewError.set('No sample data available');
      return;
    }
    
    try {
      const sample = JSON.parse(sampleJsonStr);
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
      console.error('Sample JSON value:', sampleJsonStr);
      this.previewError.set(error.message);
      this.previewResult.set(null);
    }
  }

  getSourcePayloadText(): string {
    return this.formatJsonText(this.sampleJson());
  }

  getResultPayloadText(): string {
    const result = this.previewResult();
    if (result === null || result === undefined) {
      return '';
    }

    return JSON.stringify(result, null, 2);
  }

  copyPreviewPayload(target: 'source' | 'result'): void {
    const text = target === 'source' ? this.getSourcePayloadText() : this.getResultPayloadText();
    if (!text) {
      return;
    }

    this.writeTextToClipboard(text).then(() => {
      this.copiedPreviewTarget.set(target);
      setTimeout(() => {
        if (this.copiedPreviewTarget() === target) {
          this.copiedPreviewTarget.set(null);
        }
      }, 2000);
    });
  }

  private formatJsonText(value: string): string {
    if (!value) {
      return '';
    }

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  private async writeTextToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  }

  getMappingForTarget(targetKey: string): MappingRule | undefined {
    return this.mappingRules().find(r => r.targetKey === targetKey);
  }

  getSubFieldOptions(targetKey: string): Array<{ label: string; value: string }> {
    const mapping = this.getMappingForTarget(targetKey);
    if (!mapping) return [];
    
    const sourcePath = mapping.sourcePath;
    const prefix = sourcePath + '.';
    
    // Find child fields of the mapped source field
    const childFields = this.sourceFields()
      .filter(f => f.path.startsWith(prefix))
      .map(f => ({
        label: f.path.slice(prefix.length),
        value: f.path.slice(prefix.length)
      }));
    
    if (childFields.length > 0) return childFields;
    
    // If source is an array with sample data, extract keys from first item
    const sourceField = this.sourceFields().find(f => f.path === sourcePath);
    if (sourceField && sourceField.type === 'array' && Array.isArray(sourceField.sample) && sourceField.sample.length > 0) {
      const firstItem = sourceField.sample[0];
      if (firstItem && typeof firstItem === 'object') {
        return Object.keys(firstItem).map(key => ({ label: key, value: key }));
      }
    }
    
    // Fallback: look in sampleJson for nested array items
    const sampleJsonStr = this.sampleJson();
    if (sampleJsonStr) {
      try {
        const sample = JSON.parse(sampleJsonStr);
        const value = this.getNestedValue(sample, sourcePath);
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          return Object.keys(value[0]).map(key => ({ label: key, value: key }));
        }
      } catch { /* ignore */ }
    }

    // Fallback: look in targetSchemaJson or inputSchema for array items properties
    const schemaStr = this.inputSchema() || this.targetSchemaJson();
    if (schemaStr) {
      try {
        const schema = JSON.parse(schemaStr);
        const fieldSchema = this.getSchemaForPath(schema, sourcePath);
        if (fieldSchema) {
          const itemsSchema = fieldSchema.type === 'array' ? fieldSchema.items : fieldSchema;
          if (itemsSchema && itemsSchema.properties) {
            return Object.keys(itemsSchema.properties).map(key => ({ label: key, value: key }));
          }
        }
      } catch { /* ignore */ }
    }
    
    return [];
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current === undefined || current === null) return undefined;
      return current[key];
    }, obj);
  }

  private getSchemaForPath(schema: any, path: string): any {
    const parts = path.split('.');
    let current = schema;
    
    for (const part of parts) {
      if (!current) return null;
      if (current.type === 'object' && current.properties) {
        current = current.properties[part];
      } else if (current.properties) {
        current = current.properties[part];
      } else {
        return null;
      }
    }
    
    return current;
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
    
    // Check source field type - if source is array, always show array transforms
    const sourceField = this.sourceFields().find(f => f.path === mapping.sourcePath);
    const sourceIsArray = sourceField?.type === 'array';

    // Filter transformations based on field type
    return this.transformOptions.filter(opt => {
      // Direct copy and default value work for all types
      if (opt.value === 'direct' || opt.value === 'default_value') return true;

      // If source is array, always show Array and Math transforms (they produce numbers/strings from arrays)
      if (sourceIsArray) {
        if (opt.category === 'Array' || opt.category === 'Math') return true;
      }

      // String transformations
      if (fieldType === 'string') {
        return opt.category === 'String' || opt.category === 'Basic' || opt.category === 'Logic' || opt.category === 'Array';
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

  openAddFieldDialog(): void {
    this.newFieldName.set('');
    this.newFieldType.set('string');
    this.newFieldRequired.set(false);
    this.newFieldDescription.set('');
    this.newFieldMinLength.set(null);
    this.newFieldMaxLength.set(null);
    this.newFieldMin.set(null);
    this.newFieldMax.set(null);
    this.newFieldPattern.set('');
    this.newFieldEnum.set('');
    this.newFieldDefault.set('');
    this.showAddFieldDialog.set(true);
  }

  closeAddFieldDialog(): void {
    this.showAddFieldDialog.set(false);
  }

  addCustomField(): void {
    const name = this.newFieldName().trim();
    if (!name) {
      return;
    }

    // Check if field already exists
    const exists = this.targetFields().some(f => f.key === name);
    if (exists) {
      alert('A field with this name already exists');
      return;
    }

    // Build validation rules for the new field
    const validationRules: any = {
      type: this.newFieldType(),
      required: this.newFieldRequired()
    };

    if (this.newFieldDescription()) {
      validationRules.description = this.newFieldDescription();
    }

    if (this.newFieldDefault()) {
      validationRules.default = this.newFieldDefault();
    }

    // String validations
    if (this.newFieldType() === 'string') {
      if (this.newFieldMinLength() !== null) {
        validationRules.minLength = this.newFieldMinLength();
      }
      if (this.newFieldMaxLength() !== null) {
        validationRules.maxLength = this.newFieldMaxLength();
      }
      if (this.newFieldPattern()) {
        validationRules.pattern = this.newFieldPattern();
      }
      if (this.newFieldEnum()) {
        validationRules.enum = this.newFieldEnum().split(',').map(v => v.trim()).filter(v => v);
      }
    }

    // Number validations
    if (this.newFieldType() === 'number' || this.newFieldType() === 'integer') {
      if (this.newFieldMin() !== null) {
        validationRules.minimum = this.newFieldMin();
      }
      if (this.newFieldMax() !== null) {
        validationRules.maximum = this.newFieldMax();
      }
    }

    // Add new field to target fields with validation metadata
    this.targetFields.update(fields => [
      ...fields,
      {
        key: name,
        type: this.newFieldType(),
        required: this.newFieldRequired(),
        mapped: false,
        validationRules // Store validation rules for later use
      } as any
    ]);

    console.log('✅ Added custom field:', name, 'with validation rules:', validationRules);
    this.closeAddFieldDialog();
  }

  fieldTypeOptions = [
    { label: 'String', value: 'string' },
    { label: 'Number', value: 'number' },
    { label: 'Integer', value: 'integer' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Object', value: 'object' },
    { label: 'Array', value: 'array' },
    { label: 'Date', value: 'date' }
  ];

  patternExamples = [
    { label: 'Email', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
    { label: 'Phone (US)', value: '^\\+?1?\\d{10}$' },
    { label: 'URL', value: '^https?:\\/\\/.+' },
    { label: 'UUID', value: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' },
    { label: 'Alphanumeric', value: '^[a-zA-Z0-9]+$' },
    { label: 'Letters Only', value: '^[a-zA-Z]+$' },
    { label: 'Numbers Only', value: '^[0-9]+$' }
  ];

  validationKindOptions = [
    { label: 'Required Field', value: 'required' as SourceValidationKind },
    { label: 'Type Check', value: 'type' as SourceValidationKind },
    { label: 'Allowed Values (Enum)', value: 'enum' as SourceValidationKind },
    { label: 'Minimum Number', value: 'min' as SourceValidationKind },
    { label: 'Maximum Number', value: 'max' as SourceValidationKind },
    { label: 'Minimum Length', value: 'min_length' as SourceValidationKind },
    { label: 'Maximum Length', value: 'max_length' as SourceValidationKind },
    { label: 'Text Pattern (Regex)', value: 'regex' as SourceValidationKind }
  ];

  validationTypeOptions = [
    { label: 'String', value: 'string' },
    { label: 'Number', value: 'number' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Object', value: 'object' },
    { label: 'Array', value: 'array' }
  ];

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
    const validTargetKeys = new Set(this.targetFields().map(f => f.key));
    const cleanedRules = this.mappingRules().filter(r => validTargetKeys.has(r.targetKey));
    this.mappingRules.set(cleanedRules);
    
    this.mappingComplete.emit({ 
      rules: cleanedRules,
      excludedTargetFields: Array.from(this.removedTargetFields())
    });
  }

  saveRules(): void {
    const id = this.mappingId();
    if (!id) return;

    const validTargetKeys = new Set(this.targetFields().map(f => f.key));
    const cleanedRules = this.mappingRules().filter(r => validTargetKeys.has(r.targetKey));
    const generatedJsonata = cleanedRules.length > 0 ? buildCombinedMappingExpression(cleanedRules) : '';

    this.savingRules.set(true);
    this.mappingService.update(id, {
      mapping_rules: JSON.stringify(cleanedRules),
      generated_jsonata: generatedJsonata
    } as any).subscribe({
      next: () => {
        this.savingRules.set(false);
        console.log('✅ Mapping rules saved');
      },
      error: (err) => {
        this.savingRules.set(false);
        console.error('❌ Failed to save rules:', err);
      }
    });
  }

  onBack(): void {
    this.backClicked.emit();
  }

  // Source Validation Methods
  openSourceValidationDialog(): void {
    this.showSourceValidationDialog.set(true);
  }

  closeSourceValidationDialog(): void {
    this.showSourceValidationDialog.set(false);
    this.editingValidationId.set(null);
    this.resetValidationForm();
  }

  resetValidationForm(): void {
    this.newValidationPath.set('');
    this.newValidationKind.set('required');
    this.newValidationParamA.set('');
    this.newValidationParamB.set('');
  }

  addSourceValidationRule(): void {
    const path = this.newValidationPath().trim();
    if (!path) {
      alert('Please select a source field path');
      return;
    }

    const newRule: SourceValidationRule = {
      id: `validation_${Date.now()}`,
      path,
      kind: this.newValidationKind(),
      paramA: this.newValidationParamA(),
      paramB: this.newValidationParamB(),
      enabled: true
    };

    this.sourceValidationRules.update(rules => [...rules, newRule]);
    this.resetValidationForm();
    console.log('✅ Added source validation rule:', newRule);
  }

  editSourceValidationRule(rule: SourceValidationRule): void {
    this.editingValidationId.set(rule.id);
    this.newValidationPath.set(rule.path);
    this.newValidationKind.set(rule.kind);
    this.newValidationParamA.set(rule.paramA);
    this.newValidationParamB.set(rule.paramB);
  }

  updateSourceValidationRule(): void {
    const id = this.editingValidationId();
    if (!id) return;

    this.sourceValidationRules.update(rules =>
      rules.map(rule =>
        rule.id === id
          ? {
              ...rule,
              path: this.newValidationPath(),
              kind: this.newValidationKind(),
              paramA: this.newValidationParamA(),
              paramB: this.newValidationParamB()
            }
          : rule
      )
    );

    this.editingValidationId.set(null);
    this.resetValidationForm();
  }

  removeSourceValidationRule(id: string): void {
    this.sourceValidationRules.update(rules => rules.filter(r => r.id !== id));
  }

  toggleValidationRule(id: string): void {
    this.sourceValidationRules.update(rules =>
      rules.map(rule => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    );
  }

  getValidationKindLabel(kind: SourceValidationKind): string {
    const option = this.validationKindOptions.find(o => o.value === kind);
    return option?.label || kind;
  }

  getValidationRuleDescription(rule: SourceValidationRule): string {
    switch (rule.kind) {
      case 'required':
        return 'Field must not be empty or null';
      case 'type':
        return `Must be type: ${rule.paramA}`;
      case 'enum':
        return `Must be one of: ${rule.paramA}`;
      case 'min':
        return `Minimum value: ${rule.paramA}`;
      case 'max':
        return `Maximum value: ${rule.paramA}`;
      case 'min_length':
        return `Minimum length: ${rule.paramA} characters`;
      case 'max_length':
        return `Maximum length: ${rule.paramA} characters`;
      case 'regex':
        return `Must match pattern: ${rule.paramA}`;
      default:
        return '';
    }
  }

  needsParamA(kind: SourceValidationKind): boolean {
    return kind !== 'required';
  }

  needsParamB(kind: SourceValidationKind): boolean {
    return false; // Currently no validation rules need paramB
  }

  getParamALabel(kind: SourceValidationKind): string {
    switch (kind) {
      case 'type':
        return 'Expected Type';
      case 'enum':
        return 'Allowed Values (comma-separated)';
      case 'min':
        return 'Minimum Value';
      case 'max':
        return 'Maximum Value';
      case 'min_length':
        return 'Minimum Length';
      case 'max_length':
        return 'Maximum Length';
      case 'regex':
        return 'Pattern (Regex)';
      default:
        return 'Parameter';
    }
  }

  getParamAPlaceholder(kind: SourceValidationKind): string {
    switch (kind) {
      case 'type':
        return 'e.g., string, number, boolean';
      case 'enum':
        return 'e.g., ACTIVE, INACTIVE, PENDING';
      case 'min':
      case 'max':
        return 'e.g., 0, 100, 999';
      case 'min_length':
      case 'max_length':
        return 'e.g., 2, 50, 255';
      case 'regex':
        return 'e.g., ^[A-Z0-9-]+$';
      default:
        return '';
    }
  }
}
