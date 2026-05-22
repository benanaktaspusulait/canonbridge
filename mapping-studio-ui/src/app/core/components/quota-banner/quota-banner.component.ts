import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quota-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show && message) {
      <div class="quota-banner" [class.warning]="severity === 'warning'" [class.error]="severity === 'error'">
        <i class="pi" [class.pi-exclamation-triangle]="severity === 'warning'" [class.pi-times-circle]="severity === 'error'"></i>
        <span>{{ message }}</span>
        <a [href]="upgradeUrl" class="upgrade-link">Upgrade</a>
        <button class="dismiss-btn" (click)="show = false" aria-label="Dismiss">
          <i class="pi pi-times"></i>
        </button>
      </div>
    }
  `,
  styles: [`
    .quota-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      border-bottom: 1px solid;
    }
    .quota-banner.warning {
      background: var(--yellow-50);
      border-color: var(--yellow-200);
      color: var(--yellow-800);
    }
    .quota-banner.error {
      background: var(--red-50);
      border-color: var(--red-200);
      color: var(--red-800);
    }
    .upgrade-link {
      margin-left: auto;
      font-weight: 600;
      color: inherit;
      text-decoration: underline;
    }
    .dismiss-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      padding: 0.25rem;
    }
  `]
})
export class QuotaBannerComponent {
  @Input() message = '';
  @Input() severity: 'warning' | 'error' = 'warning';
  @Input() upgradeUrl = '/billing';
  show = true;
}
