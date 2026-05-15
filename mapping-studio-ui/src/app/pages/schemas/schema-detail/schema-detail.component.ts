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
import { SchemaService, SchemaDefinition } from '../../../core/services/schema.service';

export interface SchemaFieldValidation {
  field: string;
  type: string;
  required: boolean;
  minValue?: number | null;
  maxValue?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
  enumValues?: string[];
  format?: string | null;
  description?: string;
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
    TooltipModule
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

  validationRules = signal<SchemaFieldValidation[]>([]);
  validationErrors = signal<Array<{ field: string; type: string; message: string }>>([]);
  validationDone = signal(false);
  validationSuccess = signal(false);

  schemaFields = computed(() => {
    const s = this.schema();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s.schema_json);
      return this.extractFields(parsed);
    } catch {
      return [];
    }
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
        this.initValidationRules(schema);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load schema:', err);
        this.loading.set(false);
      }
    });
  }

  private initValidationRules(schema: SchemaDefinition): void {
    try {
      const parsed = JSON.parse(schema.schema_json);
      const fields = this.extractFields(parsed);
      const requiredFields: string[] = parsed.required || [];

      this.validationRules.set(fields.map(f => ({
        field: f.name,
        type: f.type,
        required: requiredFields.includes(f.name),
        minValue: f.type === 'number' || f.type === 'integer' ? (f.minimum ?? null) : null,
        maxValue: f.type === 'number' || f.type === 'integer' ? (f.maximum ?? null) : null,
        minLength: f.type === 'string' ? (f.minLength ?? null) : null,
        maxLength: f.type === 'string' ? (f.maxLength ?? null) : null,
        pattern: f.pattern || null,
        enumValues: f.enum || [],
        format: f.format || null,
        description: f.description || ''
      })));
    } catch (e) {
      console.error('Failed to parse schema JSON:', e);
    }
  }

  private extractFields(schema: any): any[] {
    const properties = schema.properties || {};
    const required: string[] = schema.required || [];

    return Object.entries(properties).map(([name, prop]: [string, any]) => ({
      name,
      type: prop.type || 'any',
      required: required.includes(name),
      minimum: prop.minimum,
      maximum: prop.maximum,
      minLength: prop.minLength,
      maxLength: prop.maxLength,
      pattern: prop.pattern,
      enum: prop.enum,
      format: prop.format,
      description: prop.description
    }));
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
        minValue: r.minValue,
        maxValue: r.maxValue,
        minLength: r.minLength,
        maxLength: r.maxLength,
        pattern: r.pattern,
        enumValues: r.enumValues,
        format: r.format
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

  saveValidationRules(): void {
    const schema = this.schema();
    if (!schema || !schema.id) return;

    this.saving.set(true);

    // Build updated schema_json with validation rules applied
    const updatedSchemaJson = this.buildSchemaJsonWithRules();

    this.schemaService.update(schema.id, {
      ...schema,
      schema_json: updatedSchemaJson
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.schema.update(s => s ? { ...s, schema_json: updatedSchemaJson } : s);
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

      // Update required array
      parsed.required = rules.filter(r => r.required).map(r => r.field);

      // Update properties with validation constraints
      for (const rule of rules) {
        if (!parsed.properties[rule.field]) continue;
        const prop = parsed.properties[rule.field];

        if (rule.type === 'number' || rule.type === 'integer') {
          if (rule.minValue !== null && rule.minValue !== undefined) {
            prop.minimum = rule.minValue;
          } else {
            delete prop.minimum;
          }
          if (rule.maxValue !== null && rule.maxValue !== undefined) {
            prop.maximum = rule.maxValue;
          } else {
            delete prop.maximum;
          }
        }

        if (rule.type === 'string') {
          if (rule.minLength !== null && rule.minLength !== undefined) {
            prop.minLength = rule.minLength;
          } else {
            delete prop.minLength;
          }
          if (rule.maxLength !== null && rule.maxLength !== undefined) {
            prop.maxLength = rule.maxLength;
          } else {
            delete prop.maxLength;
          }
          if (rule.pattern) {
            prop.pattern = rule.pattern;
          } else {
            delete prop.pattern;
          }
        }

        if (rule.enumValues && rule.enumValues.length > 0) {
          prop.enum = rule.enumValues;
        }

        if (rule.format) {
          prop.format = rule.format;
        }
      }

      return JSON.stringify(parsed, null, 2);
    } catch {
      return schema.schema_json;
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
