import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MappingRule, TargetField, TransformKind } from './integration-studio.models';

@Component({
  selector: 'app-nested-mapping-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="'Map Nested Fields: ' + parentFieldName"
      [modal]="true"
      [style]="{ width: '80vw', maxWidth: '1200px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()">
      
      <div class="nested-mapping-container">
        <p class="help-text">
          Define mappings for child fields of <strong>{{ parentFieldName }}</strong>
        </p>

        <p-table
          [value]="childRules()"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-sm">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 25%">Target Field</th>
              <th style="width: 25%">Source Path</th>
              <th style="width: 20%">Transform</th>
              <th style="width: 20%">Parameters</th>
              <th style="width: 10%">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-rule>
            <tr>
              <td>
                <input
                  pInputText
                  [(ngModel)]="rule.targetKey"
                  placeholder="fieldName"
                  class="w-full" />
              </td>
              <td>
                <input
                  pInputText
                  [(ngModel)]="rule.sourcePath"
                  placeholder="$.source.path"
                  class="w-full" />
              </td>
              <td>
                <p-select
                  [(ngModel)]="rule.transform"
                  [options]="transformOptions"
                  placeholder="Select"
                  class="w-full" />
              </td>
              <td>
                <input
                  pInputText
                  [(ngModel)]="rule.paramA"
                  placeholder="param"
                  class="w-full" />
              </td>
              <td>
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  (onClick)="removeChildRule(rule.id)" />
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center p-4">
                No child mappings defined. Click "Add Field" to start.
              </td>
            </tr>
          </ng-template>
        </p-table>

        <div class="mt-3">
          <p-button
            label="Add Field"
            icon="pi pi-plus"
            (onClick)="addChildRule()"
            [outlined]="true" />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          icon="pi pi-times"
          (onClick)="onCancel()"
          [text]="true" />
        <p-button
          label="Save"
          icon="pi pi-check"
          (onClick)="onSave()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .nested-mapping-container {
      padding: 1rem 0;
    }

    .help-text {
      margin-bottom: 1rem;
      color: var(--text-color-secondary);
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.5rem;
    }

    :host ::ng-deep .p-inputtext,
    :host ::ng-deep .p-select {
      width: 100%;
    }
  `]
})
export class NestedMappingDialogComponent {
  @Input() visible = false;
  @Input() parentFieldName = '';
  @Input() parentRule: MappingRule | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<MappingRule[]>();

  readonly childRules = signal<MappingRule[]>([]);

  readonly transformOptions: Array<{ label: string; value: TransformKind }> = [
    { label: 'Direct', value: 'direct' },
    { label: 'Date Format', value: 'date_format' },
    { label: 'Enum Map', value: 'enum_map' },
    { label: 'Default Value', value: 'default_value' },
    { label: 'Combine', value: 'combine' },
    { label: 'Uppercase', value: 'string_uppercase' },
    { label: 'Lowercase', value: 'string_lowercase' },
    { label: 'Trim', value: 'string_trim' }
  ];

  ngOnChanges(): void {
    if (this.visible && this.parentRule) {
      // Load existing child rules or initialize empty
      this.childRules.set(this.parentRule.children || []);
    }
  }

  addChildRule(): void {
    const newRule: MappingRule = {
      id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourcePath: '',
      targetKey: '',
      transform: 'direct',
      paramA: '',
      paramB: '',
      paramC: '',
      advancedExpression: '',
      parentId: this.parentRule?.id
    };
    this.childRules.update(rules => [...rules, newRule]);
  }

  removeChildRule(id: string): void {
    this.childRules.update(rules => rules.filter(r => r.id !== id));
  }

  onSave(): void {
    this.save.emit(this.childRules());
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
