import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { SchemaService, SchemaDefinition } from '../../../core/services/schema.service';

export interface FieldValidationRule {
  field: string;
  type: string;
  required: boolean;
  nullable: boolean;
  // String constraints
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
  patternDescription?: string | null;
  format?: string | null;
  // Number constraints
  minimum?: number | null;
  maximum?: number | null;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number | null;
  // Array constraints
  minItems?: number | null;
  maxItems?: number | null;
  uniqueItems?: boolean;
  // Enum
  enumValues?: string[];
  // Meta
  defaultValue?: string | null;
  customErrorMessage?: string | null;
  description?: string;
  examples?: string[];
  deprecated?: boolean;
  // UI state
  expanded: boolean;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: Array<{ field: string; type: string; message: string }>;
  totalErrors: number;
}

@Component({
  selector: 'app-schema-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    SelectModule,
    TagModule,
    MessageModule,
    TableModule,
    TooltipModule,
    TabsModule,
    TextareaModule,
    ChipModule
  ],
  templateUrl: './schema-detail.component.html',
  styleUrl: './schema-detail.component.scss'
})
export class SchemaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private schemaService = inject(SchemaService);

  schema = signal<SchemaDefinition | null>(null);
  loading = signal(true);
  saving = signal(false);
  validating = signal(false);
  activeTab = 0;

  // Schema edit fields
  editName = '';
  editSubject = '';
  editDescription = '';
  editSchemaType: string = 'CANONICAL';
  editStatus: string = 'ACTIVE';
  editSchemaJson = '';
  jsonError = signal<string | null>(null);

  // Validation
  validationRules = signal<FieldValidationRule[]>([]);
  validationErrors = signal<Array<{ field: string; type: string; message: string }>>([]);
  validationDone = signal(false);
  validationSuccess = signal(false);

  // Enum editing
  newEnumValue = '';

  schemaTypes = [
    { label: 'Canonical', value: 'CANONICAL' },
    { label: 'Partner Inbound', value: 'PARTNER_INBOUND' },
    { label: 'Partner Outbound', value: 'PARTNER_OUTBOUND' },
    { label: 'Internal', value: 'INTERNAL' }
  ];

  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Deprecated', value: 'DEPRECATED' },
    { label: 'Draft', value: 'DRAFT' }
  ];

  formatOptions = [
    { label: 'None', value: '' },
    { label: 'email', value: 'email' },
    { label: 'uri', value: 'uri' },
    { label: 'date-time', value: 'date-time' },
    { label: 'date', value: 'date' },
    { label: 'time', value: 'time' },
    { label: 'uuid', value: 'uuid' },
    { label: 'hostname', value: 'hostname' },
    { label: 'ipv4', value: 'ipv4' },
    { label: 'ipv6', value: 'ipv6' }
  ];

  rulesSummary = computed(() => {
    const rules = this.validationRules();
    const required = rules.filter(r => r.required).length;
    const withConstraints = rules.filter(r => this.hasConstraints(r)).length;
    return { total: rules.length, required, withConstraints };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSchema(id);
    }
  }

  loadSchema(id: string): void {
    this.loading.set(true);
    this.schemaService.getById(id).subscribe({
      next: (schema) => {
        this.schema.set(schema);
        this.populateEditFields(schema);
        this.initValidationRules(schema);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load schema:', err);
        this.loading.set(false);
      }
    });
  }

  private populateEditFields(schema: SchemaDefinition): void {
    this.editName = schema.name;
    this.editSubject = schema.subject;
    this.editDescription = schema.description || '';
    this.editSchemaType = schema.schema_type;
    this.editStatus = schema.status || 'ACTIVE';
    try {
      const parsed = JSON.parse(schema.schema_json);
      this.editSchemaJson = JSON.stringify(parsed, null, 2);
    } catch {
      this.editSchemaJson = schema.schema_json;
    }
  }

  private initValidationRules(schema: SchemaDefinition): void {
    try {
      const parsed = JSON.parse(schema.schema_json);
      const properties = parsed.properties || {};
      const requiredFields: string[] = parsed.required || [];

      const rules: FieldValidationRule[] = Object.entries(properties).map(([name, prop]: [string, any]) => ({
        field: name,
        type: prop.type || 'any',
        required: requiredFields.includes(name),
        nullable: prop.nullable === true,
        // String
        minLength: prop.minLength ?? null,
        maxLength: prop.maxLength ?? null,
        pattern: prop.pattern ?? null,
        patternDescription: prop.patternDescription ?? null,
        format: prop.format ?? null,
        // Number
        minimum: prop.minimum ?? null,
        maximum: prop.maximum ?? null,
        exclusiveMinimum: prop.exclusiveMinimum === true,
        exclusiveMaximum: prop.exclusiveMaximum === true,
        multipleOf: prop.multipleOf ?? null,
        // Array
        minItems: prop.minItems ?? null,
        maxItems: prop.maxItems ?? null,
        uniqueItems: prop.uniqueItems === true,
        // Enum
        enumValues: prop.enum || [],
        // Meta
        defaultValue: prop.default != null ? String(prop.default) : null,
        customErrorMessage: prop.errorMessage ?? null,
        description: prop.description ?? '',
        examples: prop.examples || [],
        deprecated: prop.deprecated === true,
        // UI
        expanded: false
      }));

      this.validationRules.set(rules);
    } catch (e) {
      console.error('Failed to parse schema JSON:', e);
    }
  }

  toggleExpand(index: number): void {
    this.validationRules.update(rules => {
      const updated = [...rules];
      updated[index] = { ...updated[index], expanded: !updated[index].expanded };
      return updated;
    });
  }

  expandAll(): void {
    this.validationRules.update(rules => rules.map(r => ({ ...r, expanded: true })));
  }

  collapseAll(): void {
    this.validationRules.update(rules => rules.map(r => ({ ...r, expanded: false })));
  }

  updateRule(index: number, key: string, value: any): void {
    this.validationRules.update(rules => {
      const updated = [...rules];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
    this.validationDone.set(false);
  }

  toggleRequired(index: number): void {
    this.validationRules.update(rules => {
      const updated = [...rules];
      updated[index] = { ...updated[index], required: !updated[index].required };
      return updated;
    });
    this.validationDone.set(false);
  }

  toggleNullable(index: number): void {
    this.validationRules.update(rules => {
      const updated = [...rules];
      updated[index] = { ...updated[index], nullable: !updated[index].nullable };
      return updated;
    });
    this.validationDone.set(false);
  }

  addEnumValue(index: number, value: string): void {
    if (!value.trim()) return;
    this.validationRules.update(rules => {
      const updated = [...rules];
      const current = updated[index].enumValues || [];
      if (!current.includes(value.trim())) {
        updated[index] = { ...updated[index], enumValues: [...current, value.trim()] };
      }
      return updated;
    });
    this.newEnumValue = '';
    this.validationDone.set(false);
  }

  removeEnumValue(index: number, enumIndex: number): void {
    this.validationRules.update(rules => {
      const updated = [...rules];
      const current = [...(updated[index].enumValues || [])];
      current.splice(enumIndex, 1);
      updated[index] = { ...updated[index], enumValues: current };
      return updated;
    });
    this.validationDone.set(false);
  }

  addExample(index: number, value: string): void {
    if (!value.trim()) return;
    this.validationRules.update(rules => {
      const updated = [...rules];
      const current = updated[index].examples || [];
      updated[index] = { ...updated[index], examples: [...current, value.trim()] };
      return updated;
    });
    this.validationDone.set(false);
  }

  removeExample(index: number, exIndex: number): void {
    this.validationRules.update(rules => {
      const updated = [...rules];
      const current = [...(updated[index].examples || [])];
      current.splice(exIndex, 1);
      updated[index] = { ...updated[index], examples: current };
      return updated;
    });
  }

  hasConstraints(rule: FieldValidationRule): boolean {
    return rule.required ||
      rule.nullable ||
      rule.minLength != null ||
      rule.maxLength != null ||
      !!rule.pattern ||
      !!rule.format ||
      rule.minimum != null ||
      rule.maximum != null ||
      rule.multipleOf != null ||
      rule.minItems != null ||
      rule.maxItems != null ||
      rule.uniqueItems === true ||
      (rule.enumValues?.length ?? 0) > 0 ||
      !!rule.defaultValue ||
      !!rule.customErrorMessage ||
      rule.deprecated === true;
  }

  getConstraintCount(rule: FieldValidationRule): number {
    let count = 0;
    if (rule.required) count++;
    if (rule.nullable) count++;
    if (rule.minLength != null) count++;
    if (rule.maxLength != null) count++;
    if (rule.pattern) count++;
    if (rule.format) count++;
    if (rule.minimum != null) count++;
    if (rule.maximum != null) count++;
    if (rule.multipleOf != null) count++;
    if (rule.minItems != null) count++;
    if (rule.maxItems != null) count++;
    if (rule.uniqueItems) count++;
    if ((rule.enumValues?.length ?? 0) > 0) count++;
    if (rule.defaultValue) count++;
    if (rule.customErrorMessage) count++;
    return count;
  }

  validate(): void {
    this.validating.set(true);
    this.validationErrors.set([]);
    this.validationDone.set(false);
    this.validationSuccess.set(false);

    const schema = this.schema();
    if (!schema || !schema.id) {
      this.validating.set(false);
      return;
    }

    const rules = this.validationRules();
    const request = {
      schema_id: schema.id,
      rules: rules.map(r => ({
        field: r.field,
        type: r.type,
        required: r.required,
        nullable: r.nullable,
        minValue: r.minimum,
        maxValue: r.maximum,
        exclusiveMinimum: r.exclusiveMinimum,
        exclusiveMaximum: r.exclusiveMaximum,
        multipleOf: r.multipleOf,
        minLength: r.minLength,
        maxLength: r.maxLength,
        pattern: r.pattern,
        format: r.format,
        enumValues: r.enumValues,
        minItems: r.minItems,
        maxItems: r.maxItems,
        uniqueItems: r.uniqueItems,
        defaultValue: r.defaultValue,
        customErrorMessage: r.customErrorMessage
      }))
    };

    this.schemaService.validateSchema(schema.id, request).subscribe({
      next: (result: SchemaValidationResult) => {
        this.validationErrors.set(result.errors || []);
        this.validationDone.set(true);
        this.validationSuccess.set(result.valid);
        this.validating.set(false);
      },
      error: (err) => {
        console.error('Validation failed:', err);
        this.validationErrors.set([{
          field: '_system',
          type: 'ERROR',
          message: 'Validation request failed. Please try again.'
        }]);
        this.validationDone.set(true);
        this.validationSuccess.set(false);
        this.validating.set(false);
      }
    });
  }

  save(): void {
    const schema = this.schema();
    if (!schema || !schema.id) return;

    this.saving.set(true);

    const updatedSchemaJson = this.activeTab === 0
      ? this.editSchemaJson
      : this.buildSchemaJsonWithRules();

    this.schemaService.update(schema.id, {
      ...schema,
      name: this.editName,
      subject: this.editSubject,
      description: this.editDescription,
      schema_type: this.editSchemaType as any,
      status: this.editStatus as any,
      schema_json: updatedSchemaJson
    }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.schema.set(updated || { ...schema, schema_json: updatedSchemaJson });
        if (this.activeTab === 0) {
          this.initValidationRules({ ...schema, schema_json: updatedSchemaJson });
        }
      },
      error: (err) => {
        console.error('Failed to save:', err);
        this.saving.set(false);
      }
    });
  }

  buildSchemaJsonWithRules(): string {
    const schema = this.schema();
    if (!schema) return '{}';

    try {
      const parsed = JSON.parse(schema.schema_json);
      const rules = this.validationRules();

      parsed.required = rules.filter(r => r.required).map(r => r.field);

      for (const rule of rules) {
        if (!parsed.properties[rule.field]) continue;
        const prop = parsed.properties[rule.field];

        // Nullable
        if (rule.nullable) {
          prop.nullable = true;
        } else {
          delete prop.nullable;
        }

        // Number constraints
        if (rule.type === 'number' || rule.type === 'integer') {
          this.setOrDelete(prop, 'minimum', rule.minimum);
          this.setOrDelete(prop, 'maximum', rule.maximum);
          this.setOrDelete(prop, 'multipleOf', rule.multipleOf);
          if (rule.exclusiveMinimum) prop.exclusiveMinimum = true; else delete prop.exclusiveMinimum;
          if (rule.exclusiveMaximum) prop.exclusiveMaximum = true; else delete prop.exclusiveMaximum;
        }

        // String constraints
        if (rule.type === 'string') {
          this.setOrDelete(prop, 'minLength', rule.minLength);
          this.setOrDelete(prop, 'maxLength', rule.maxLength);
          if (rule.pattern) prop.pattern = rule.pattern; else delete prop.pattern;
          if (rule.format) prop.format = rule.format; else delete prop.format;
        }

        // Array constraints
        if (rule.type === 'array') {
          this.setOrDelete(prop, 'minItems', rule.minItems);
          this.setOrDelete(prop, 'maxItems', rule.maxItems);
          if (rule.uniqueItems) prop.uniqueItems = true; else delete prop.uniqueItems;
        }

        // Enum
        if (rule.enumValues && rule.enumValues.length > 0) {
          prop.enum = rule.enumValues;
        } else {
          delete prop.enum;
        }

        // Meta
        if (rule.defaultValue != null && rule.defaultValue !== '') {
          prop.default = this.parseDefault(rule.defaultValue, rule.type);
        } else {
          delete prop.default;
        }
        if (rule.customErrorMessage) prop.errorMessage = rule.customErrorMessage; else delete prop.errorMessage;
        if (rule.description) prop.description = rule.description; else delete prop.description;
        if (rule.examples && rule.examples.length > 0) prop.examples = rule.examples; else delete prop.examples;
        if (rule.deprecated) prop.deprecated = true; else delete prop.deprecated;
      }

      return JSON.stringify(parsed, null, 2);
    } catch {
      return schema.schema_json;
    }
  }

  private setOrDelete(obj: any, key: string, value: any): void {
    if (value !== null && value !== undefined) {
      obj[key] = value;
    } else {
      delete obj[key];
    }
  }

  private parseDefault(value: string, type: string): any {
    if (type === 'number' || type === 'integer') return Number(value) || 0;
    if (type === 'boolean') return value === 'true';
    return value;
  }

  formatJson(): void {
    try {
      const parsed = JSON.parse(this.editSchemaJson);
      this.editSchemaJson = JSON.stringify(parsed, null, 2);
      this.jsonError.set(null);
    } catch (e: any) {
      this.jsonError.set(e.message);
    }
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (type) {
      case 'string': return 'info';
      case 'number': case 'integer': return 'warn';
      case 'boolean': return 'success';
      case 'object': return 'secondary';
      case 'array': return 'danger';
      default: return 'secondary';
    }
  }

  goBack(): void {
    this.router.navigate(['/schemas']);
  }
}
