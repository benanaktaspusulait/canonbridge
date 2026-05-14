import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SchemaService, SchemaDefinition } from '../../core/services/schema.service';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-schemas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    I18nPipe
  ],
  templateUrl: './schemas.component.html',
  styleUrl: './schemas.component.scss'
})
export class SchemasComponent implements OnInit {
  private schemaService = inject(SchemaService);

  schemas = signal<SchemaDefinition[]>([]);
  loading = signal(true);
  showDialog = signal(false);
  editMode = signal(false);
  
  currentSchema = signal<Partial<SchemaDefinition>>({
    name: '',
    description: '',
    schema_type: 'CANONICAL',
    schema_json: '{\n  "type": "object",\n  "properties": {\n    \n  },\n  "required": []\n}',
    status: 'ACTIVE'
  });

  schemaTypes = [
    { label: 'Canonical', value: 'CANONICAL' },
    { label: 'Partner', value: 'PARTNER' },
    { label: 'Internal', value: 'INTERNAL' }
  ];

  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Deprecated', value: 'DEPRECATED' },
    { label: 'Draft', value: 'DRAFT' }
  ];

  ngOnInit(): void {
    this.loadSchemas();
  }

  loadSchemas(): void {
    this.loading.set(true);
    this.schemaService.list().subscribe({
      next: (schemas) => {
        this.schemas.set(schemas);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load schemas:', err);
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    this.editMode.set(false);
    this.currentSchema.set({
      name: '',
      description: '',
      schema_type: 'CANONICAL',
      schema_json: '{\n  "type": "object",\n  "properties": {\n    \n  },\n  "required": []\n}',
      status: 'ACTIVE'
    });
    this.showDialog.set(true);
  }

  openEditDialog(schema: SchemaDefinition): void {
    this.editMode.set(true);
    this.currentSchema.set({ ...schema });
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
  }

  saveSchema(): void {
    const schema = this.currentSchema();
    
    if (this.editMode() && schema.id) {
      this.schemaService.update(schema.id, schema as SchemaDefinition).subscribe({
        next: () => {
          this.loadSchemas();
          this.closeDialog();
        },
        error: (err) => console.error('Failed to update schema:', err)
      });
    } else {
      this.schemaService.create(schema as SchemaDefinition).subscribe({
        next: () => {
          this.loadSchemas();
          this.closeDialog();
        },
        error: (err) => console.error('Failed to create schema:', err)
      });
    }
  }

  deleteSchema(id: string): void {
    if (confirm('Are you sure you want to delete this schema?')) {
      this.schemaService.delete(id).subscribe({
        next: () => this.loadSchemas(),
        error: (err) => console.error('Failed to delete schema:', err)
      });
    }
  }

  formatJson(): void {
    try {
      const parsed = JSON.parse(this.currentSchema().schema_json || '{}');
      this.currentSchema.update(s => ({
        ...s,
        schema_json: JSON.stringify(parsed, null, 2)
      }));
    } catch (e) {
      console.error('Invalid JSON');
    }
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'secondary' {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DEPRECATED': return 'warn';
      default: return 'secondary';
    }
  }

  getTypeSeverity(type: string): 'info' | 'warn' | 'secondary' {
    switch (type) {
      case 'CANONICAL': return 'info';
      case 'PARTNER': return 'warn';
      default: return 'secondary';
    }
  }
}
