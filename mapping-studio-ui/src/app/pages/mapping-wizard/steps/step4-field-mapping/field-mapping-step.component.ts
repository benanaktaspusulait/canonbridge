import { Component, input, output, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

export interface MappingRule {
  targetField: string;
  expression: string;
  description?: string;
}

@Component({
  selector: 'app-field-mapping-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    MessageModule
  ],
  templateUrl: './field-mapping-step.component.html',
  styleUrl: './field-mapping-step.component.scss'
})
export class FieldMappingStepComponent implements OnInit {
  sampleJson = input.required<string>();
  targetSchemaJson = input.required<string>();
  initialRules = input<MappingRule[]>([]);
  
  mappingComplete = output<{ rules: MappingRule[] }>();
  backClicked = output<void>();

  mappingRules = signal<MappingRule[]>([]);
  sourceFields = signal<string[]>([]);
  targetFields = signal<string[]>([]);

  ngOnInit(): void {
    this.extractSourceFields();
    this.extractTargetFields();
    
    const initial = this.initialRules();
    if (initial && initial.length > 0) {
      this.mappingRules.set([...initial]);
    } else {
      this.initializeDefaultMappings();
    }
  }

  extractSourceFields(): void {
    try {
      const sample = JSON.parse(this.sampleJson());
      const fields = this.extractFieldPaths(sample);
      this.sourceFields.set(fields);
    } catch (e) {
      console.error('Failed to parse sample JSON:', e);
      this.sourceFields.set([]);
    }
  }

  extractTargetFields(): void {
    try {
      const schema = JSON.parse(this.targetSchemaJson());
      const fields = this.extractSchemaFields(schema);
      this.targetFields.set(fields);
    } catch (e) {
      console.error('Failed to parse target schema:', e);
      this.targetFields.set([]);
    }
  }

  private extractFieldPaths(obj: any, prefix = ''): string[] {
    const fields: string[] = [];
    
    if (typeof obj !== 'object' || obj === null) {
      return fields;
    }
    
    for (const key in obj) {
      const path = prefix ? `${prefix}.${key}` : key;
      fields.push(path);
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        fields.push(...this.extractFieldPaths(obj[key], path));
      }
    }
    
    return fields;
  }

  private extractSchemaFields(schema: any): string[] {
    const fields: string[] = [];
    
    if (schema.type === 'object' && schema.properties) {
      for (const key in schema.properties) {
        fields.push(key);
        
        const prop = schema.properties[key];
        if (prop.type === 'object' && prop.properties) {
          const nested = this.extractSchemaFields(prop);
          fields.push(...nested.map(f => `${key}.${f}`));
        }
      }
    }
    
    return fields;
  }

  private initializeDefaultMappings(): void {
    const targets = this.targetFields();
    const sources = this.sourceFields();
    
    const rules: MappingRule[] = targets.map(target => {
      // Try to find matching source field
      const matchingSource = sources.find(s => 
        s.toLowerCase() === target.toLowerCase() ||
        s.toLowerCase().endsWith(`.${target.toLowerCase()}`)
      );
      
      return {
        targetField: target,
        expression: matchingSource || '',
        description: ''
      };
    });
    
    this.mappingRules.set(rules);
  }

  addMappingRule(): void {
    this.mappingRules.update(rules => [
      ...rules,
      { targetField: '', expression: '', description: '' }
    ]);
  }

  removeMappingRule(index: number): void {
    this.mappingRules.update(rules => rules.filter((_, i) => i !== index));
  }

  updateRule(index: number, field: keyof MappingRule, value: string): void {
    this.mappingRules.update(rules => {
      const updated = [...rules];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  insertSourceField(ruleIndex: number, field: string): void {
    this.mappingRules.update(rules => {
      const updated = [...rules];
      const currentExpr = updated[ruleIndex].expression;
      updated[ruleIndex] = {
        ...updated[ruleIndex],
        expression: currentExpr ? `${currentExpr}.${field}` : field
      };
      return updated;
    });
  }

  isValid(): boolean {
    const rules = this.mappingRules();
    if (rules.length === 0) return false;
    
    // At least one rule must have both target and expression
    return rules.some(r => r.targetField.trim() !== '' && r.expression.trim() !== '');
  }

  onNext(): void {
    const rules = this.mappingRules().filter(r => 
      r.targetField.trim() !== '' && r.expression.trim() !== ''
    );
    
    this.mappingComplete.emit({ rules });
  }

  onBack(): void {
    this.backClicked.emit();
  }
}
