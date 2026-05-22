import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BillingService, Plan } from '../../services/billing.service';

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule],
  template: `
    <p-dialog
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '600px' }"
      header="Upgrade Your Plan"
    >
      <div class="upgrade-content">
        @if (reason) {
          <div class="quota-warning">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ reason }}</span>
          </div>
        }

        <p class="upgrade-subtitle">Choose a plan that fits your needs:</p>

        <div class="plan-options">
          @for (plan of plans(); track plan.code) {
            @if (plan.code !== 'free' && plan.code !== 'enterprise') {
              <div class="plan-option" [class.recommended]="plan.code === 'growth'">
                @if (plan.code === 'growth') {
                  <span class="recommended-badge">Recommended</span>
                }
                <h3>{{ plan.name }}</h3>
                <p class="price">\${{ plan.price_monthly_cents / 100 }}<span>/mo</span></p>
                <p class="desc">{{ plan.description }}</p>
                <p-button
                  [label]="'Upgrade to ' + plan.name"
                  [severity]="plan.code === 'growth' ? 'primary' : 'secondary'"
                  [outlined]="plan.code !== 'growth'"
                  styleClass="w-full"
                  (onClick)="onUpgrade(plan)"
                />
              </div>
            }
          }
        </div>

        <div class="enterprise-cta">
          <p>Need more? <a href="/pricing" target="_blank">Compare all plans</a> or <a href="#demo">contact sales</a> for Enterprise.</p>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .quota-warning {
      background: var(--yellow-50);
      border: 1px solid var(--yellow-200);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      color: var(--yellow-800);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .upgrade-subtitle { color: var(--text-color-secondary); margin-bottom: 1rem; }
    .plan-options { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .plan-option {
      position: relative;
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      padding: 1.25rem;
      text-align: center;
      &.recommended { border-color: var(--primary-color); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    }
    .recommended-badge {
      position: absolute; top: -0.5rem; left: 50%; transform: translateX(-50%);
      background: var(--primary-color); color: white; font-size: 0.7rem;
      font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 1rem;
    }
    .plan-option h3 { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .price { font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0; }
    .price span { font-size: 0.875rem; font-weight: 400; color: var(--text-color-secondary); }
    .desc { font-size: 0.8rem; color: var(--text-color-secondary); margin-bottom: 1rem; }
    .enterprise-cta { text-align: center; font-size: 0.875rem; color: var(--text-color-secondary); }
    .enterprise-cta a { color: var(--primary-color); text-decoration: none; }
  `]
})
export class UpgradeModalComponent {
  @Input() visible = false;
  @Input() reason = '';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() upgraded = new EventEmitter<Plan>();

  private readonly billing = inject(BillingService);
  readonly plans = signal<Plan[]>([]);

  ngOnInit(): void {
    this.billing.getPlans().subscribe({
      next: (plans) => this.plans.set(plans),
      error: () => {}
    });
  }

  onUpgrade(plan: Plan): void {
    this.upgraded.emit(plan);
    this.visibleChange.emit(false);
  }
}
