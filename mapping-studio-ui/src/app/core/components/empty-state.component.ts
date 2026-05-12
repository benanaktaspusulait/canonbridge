import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="empty-state" [class.empty-state--compact]="compact">
      <div class="empty-state__illustration">
        @if (illustration) {
          <img [src]="illustration" [alt]="title" />
        } @else {
          <i [class]="icon || 'pi pi-inbox'" [style.font-size]="iconSize"></i>
        }
      </div>

      <div class="empty-state__content">
        <h3 class="empty-state__title">{{ title }}</h3>
        
        @if (description) {
          <p class="empty-state__description">{{ description }}</p>
        }

        @if (actionLabel) {
          <div class="empty-state__actions">
            <p-button
              [label]="actionLabel"
              [icon]="actionIcon || 'pi pi-plus'"
              (onClick)="action.emit()"
              [size]="compact ? 'small' : undefined" />
            
            @if (secondaryActionLabel) {
              <p-button
                [label]="secondaryActionLabel"
                [icon]="secondaryActionIcon || 'pi pi-question-circle'"
                (onClick)="secondaryAction.emit()"
                [outlined]="true"
                severity="secondary"
                [size]="compact ? 'small' : undefined" />
            }
          </div>
        }

        @if (helpText) {
          <div class="empty-state__help">
            <i class="pi pi-info-circle"></i>
            <span>{{ helpText }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      min-height: 400px;
    }

    .empty-state--compact {
      padding: 2rem 1rem;
      min-height: 250px;
    }

    .empty-state__illustration {
      margin-bottom: 2rem;
    }

    .empty-state__illustration img {
      max-width: 300px;
      height: auto;
      opacity: 0.8;
    }

    .empty-state--compact .empty-state__illustration img {
      max-width: 200px;
    }

    .empty-state__illustration i {
      font-size: 6rem;
      color: var(--primary-color);
      opacity: 0.3;
    }

    .empty-state--compact .empty-state__illustration i {
      font-size: 4rem;
    }

    .empty-state__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      max-width: 500px;
    }

    .empty-state__title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .empty-state--compact .empty-state__title {
      font-size: 1.25rem;
    }

    .empty-state__description {
      margin: 0;
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-color-secondary);
    }

    .empty-state--compact .empty-state__description {
      font-size: 0.875rem;
    }

    .empty-state__actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .empty-state__help {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background-color: var(--surface-50);
      border-radius: 6px;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin-top: 0.5rem;
    }

    .empty-state__help i {
      color: var(--primary-color);
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .empty-state {
        padding: 2rem 1rem;
        min-height: 300px;
      }

      .empty-state__illustration img {
        max-width: 200px;
      }

      .empty-state__illustration i {
        font-size: 4rem;
      }

      .empty-state__title {
        font-size: 1.25rem;
      }

      .empty-state__description {
        font-size: 0.875rem;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No items found';
  @Input() description?: string;
  @Input() icon?: string;
  @Input() iconSize = '6rem';
  @Input() illustration?: string;
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Input() secondaryActionLabel?: string;
  @Input() secondaryActionIcon?: string;
  @Input() helpText?: string;
  @Input() compact = false;

  @Output() action = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();
}
