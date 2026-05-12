import { Component, Input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MappingRule } from './integration-studio.models';
import { ruleToJsonata } from './rule-to-jsonata';

@Component({
  selector: 'app-jsonata-preview-panel',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  template: `
    <p-card [header]="'JSONata Expression Preview'" styleClass="jsonata-preview-card">
      <ng-template pTemplate="header">
        <div class="card-header-content">
          <h3>JSONata Expression Preview</h3>
          <p-tag severity="info" value="Expert Mode" icon="pi pi-code" />
        </div>
      </ng-template>

      <div class="jsonata-preview-content">
        @if (generatedExpression()) {
          <pre class="jsonata-code"><code>{{ generatedExpression() }}</code></pre>
          
          <div class="preview-actions">
            <p-button
              label="Copy Expression"
              icon="pi pi-copy"
              [outlined]="true"
              size="small"
              (onClick)="copyExpression()" />
            
            <p-button
              label="Use in Advanced Mode"
              icon="pi pi-arrow-right"
              size="small"
              (onClick)="useInAdvanced()" />
          </div>
        } @else {
          <div class="empty-state">
            <i class="pi pi-info-circle"></i>
            <p>No mapping rules defined yet. Add rules to see the generated JSONata expression.</p>
          </div>
        }

        @if (error()) {
          <div class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ error() }}</span>
          </div>
        }
      </div>

      <ng-template pTemplate="footer">
        <div class="card-footer-note">
          <i class="pi pi-lightbulb"></i>
          <span>This expression is automatically generated from your visual mapping rules.</span>
        </div>
      </ng-template>
    </p-card>
  `,
  styles: [`
    .card-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 1rem;
    }

    .card-header-content h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .jsonata-preview-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .jsonata-code {
      background-color: var(--surface-50);
      border: 1px solid var(--surface-200);
      border-radius: 6px;
      padding: 1rem;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      overflow-x: auto;
      color: var(--text-color);
      margin: 0;
    }

    .jsonata-code code {
      white-space: pre;
    }

    .preview-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
      color: var(--text-color-secondary);
    }

    .empty-state i {
      font-size: 3rem;
      color: var(--primary-color);
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      max-width: 400px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background-color: var(--red-50);
      border-left: 3px solid var(--red-500);
      border-radius: 4px;
      color: var(--red-900);
      font-size: 0.875rem;
    }

    .error-message i {
      color: var(--red-600);
    }

    .card-footer-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .card-footer-note i {
      color: var(--yellow-600);
    }

    :host ::ng-deep .jsonata-preview-card {
      height: 100%;
    }

    :host ::ng-deep .jsonata-preview-card .p-card-body {
      padding: 1rem;
    }

    :host ::ng-deep .jsonata-preview-card .p-card-footer {
      padding: 0.75rem 1rem;
      background-color: var(--surface-50);
    }
  `]
})
export class JsonataPreviewPanelComponent {
  @Input() rules: MappingRule[] = [];
  @Input() targetFields: Array<{ key: string; type: string }> = [];

  readonly generatedExpression = signal<string>('');
  readonly error = signal<string>('');

  constructor() {
    // Auto-update when rules change
    effect(() => {
      this.generateExpression();
    });
  }

  ngOnChanges(): void {
    this.generateExpression();
  }

  private generateExpression(): void {
    try {
      if (!this.rules || this.rules.length === 0) {
        this.generatedExpression.set('');
        this.error.set('');
        return;
      }

      // Generate JSONata for all rules
      const expressions = this.rules
        .map(rule => {
          try {
            const expr = ruleToJsonata(rule);
            return `  "${rule.targetKey}": ${expr}`;
          } catch (err) {
            console.error(`Failed to generate JSONata for rule ${rule.id}:`, err);
            return null;
          }
        })
        .filter(Boolean);

      if (expressions.length === 0) {
        this.generatedExpression.set('');
        this.error.set('No valid mapping rules to generate expression');
        return;
      }

      const fullExpression = `{\n${expressions.join(',\n')}\n}`;
      this.generatedExpression.set(fullExpression);
      this.error.set('');
    } catch (err) {
      console.error('Failed to generate JSONata expression:', err);
      this.error.set(`Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      this.generatedExpression.set('');
    }
  }

  copyExpression(): void {
    const expr = this.generatedExpression();
    if (!expr) return;

    navigator.clipboard.writeText(expr).then(
      () => {
        console.log('JSONata expression copied to clipboard');
        // Could emit an event here to show a toast
      },
      (err) => {
        console.error('Failed to copy expression:', err);
      }
    );
  }

  useInAdvanced(): void {
    // This would emit an event to parent component to switch to advanced mode
    // and populate the advanced expression field
    console.log('Use in advanced mode:', this.generatedExpression());
  }
}
