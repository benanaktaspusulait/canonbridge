import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

interface DiffItem {
  path: string;
  expected: unknown;
  actual: unknown;
  type: 'missing' | 'extra' | 'different' | 'type-mismatch';
}

@Component({
  selector: 'app-json-diff-viewer',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  template: `
    <div class="diff-viewer">
      <div class="diff-header">
        <h4>Differences Found: {{ diffs().length }}</h4>
        @if (diffs().length > 0) {
          <p-tag [value]="'Failed'" severity="danger" />
        } @else {
          <p-tag [value]="'Passed'" severity="success" />
        }
      </div>

      @if (diffs().length > 0) {
        <div class="diff-list">
          @for (diff of diffs(); track diff.path) {
            <div class="diff-item" [class]="'diff-item--' + diff.type">
              <div class="diff-item__header">
                <span class="diff-item__path">{{ diff.path }}</span>
                <p-tag
                  [value]="getDiffTypeLabel(diff.type)"
                  [severity]="getDiffTypeSeverity(diff.type)" />
              </div>

              <div class="diff-item__content">
                <div class="diff-item__column">
                  <div class="diff-item__label">Expected</div>
                  <pre class="diff-item__value diff-item__value--expected">{{ formatValue(diff.expected) }}</pre>
                </div>

                <div class="diff-item__arrow">
                  <i class="pi pi-arrow-right"></i>
                </div>

                <div class="diff-item__column">
                  <div class="diff-item__label">Actual</div>
                  <pre class="diff-item__value diff-item__value--actual">{{ formatValue(diff.actual) }}</pre>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="diff-empty">
          <i class="pi pi-check-circle"></i>
          <p>All fields match! The transformation produced the expected output.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .diff-viewer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .diff-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background-color: var(--surface-50);
      border-radius: 6px;
      border: 1px solid var(--surface-200);
    }

    .diff-header h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .diff-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .diff-item {
      border: 1px solid var(--surface-200);
      border-radius: 6px;
      overflow: hidden;
    }

    .diff-item--missing {
      border-left: 3px solid var(--red-500);
    }

    .diff-item--extra {
      border-left: 3px solid var(--orange-500);
    }

    .diff-item--different {
      border-left: 3px solid var(--yellow-500);
    }

    .diff-item--type-mismatch {
      border-left: 3px solid var(--purple-500);
    }

    .diff-item__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background-color: var(--surface-50);
      border-bottom: 1px solid var(--surface-200);
    }

    .diff-item__path {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .diff-item__content {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 1rem;
      padding: 1rem;
      align-items: start;
    }

    .diff-item__column {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
    }

    .diff-item__label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-color-secondary);
    }

    .diff-item__value {
      margin: 0;
      padding: 0.75rem;
      background-color: var(--surface-0);
      border: 1px solid var(--surface-200);
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .diff-item__value--expected {
      background-color: var(--red-50);
      border-color: var(--red-200);
      color: var(--red-900);
    }

    .diff-item__value--actual {
      background-color: var(--green-50);
      border-color: var(--green-200);
      color: var(--green-900);
    }

    .diff-item__arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color-secondary);
      font-size: 1.25rem;
      padding-top: 1.5rem;
    }

    .diff-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem 2rem;
      text-align: center;
      color: var(--text-color-secondary);
    }

    .diff-empty i {
      font-size: 4rem;
      color: var(--green-500);
    }

    .diff-empty p {
      margin: 0;
      font-size: 1rem;
      max-width: 400px;
    }

    @media (max-width: 768px) {
      .diff-item__content {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .diff-item__arrow {
        transform: rotate(90deg);
        padding: 0;
      }
    }
  `]
})
export class JsonDiffViewerComponent {
  @Input() set differences(value: Array<{ path: string; expected: unknown; actual: unknown }>) {
    this.computeDiffs(value);
  }

  readonly diffs = signal<DiffItem[]>([]);

  private computeDiffs(differences: Array<{ path: string; expected: unknown; actual: unknown }>): void {
    if (!differences || differences.length === 0) {
      this.diffs.set([]);
      return;
    }

    const diffItems: DiffItem[] = differences.map(diff => {
      const type = this.determineDiffType(diff.expected, diff.actual);
      return {
        path: diff.path,
        expected: diff.expected,
        actual: diff.actual,
        type
      };
    });

    this.diffs.set(diffItems);
  }

  private determineDiffType(expected: unknown, actual: unknown): DiffItem['type'] {
    if (expected === undefined && actual !== undefined) return 'extra';
    if (expected !== undefined && actual === undefined) return 'missing';
    if (typeof expected !== typeof actual) return 'type-mismatch';
    return 'different';
  }

  getDiffTypeLabel(type: DiffItem['type']): string {
    const labels: Record<DiffItem['type'], string> = {
      missing: 'Missing',
      extra: 'Extra',
      different: 'Different',
      'type-mismatch': 'Type Mismatch'
    };
    return labels[type];
  }

  getDiffTypeSeverity(type: DiffItem['type']): 'danger' | 'warn' | 'info' {
    const severities: Record<DiffItem['type'], 'danger' | 'warn' | 'info'> = {
      missing: 'danger',
      extra: 'warn',
      different: 'warn',
      'type-mismatch': 'info'
    };
    return severities[type];
  }

  formatValue(value: unknown): string {
    if (value === undefined) return '(undefined)';
    if (value === null) return '(null)';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }
}
