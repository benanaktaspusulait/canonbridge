import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BillingService, EntitlementStatus, Plan, Subscription, UsageHistoryItem } from '../../core/services/billing.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    TableModule,
    TagModule,
    TabsModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {
  private readonly billing = inject(BillingService);
  private readonly toast = inject(MessageService);

  readonly subscription = signal<Subscription | null>(null);
  readonly entitlements = signal<EntitlementStatus[]>([]);
  readonly plans = signal<Plan[]>([]);
  readonly usageHistory = signal<UsageHistoryItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);

    this.billing.getSubscription().subscribe({
      next: (sub) => this.subscription.set(sub),
      error: () => this.subscription.set(null)
    });

    this.billing.getUsageSummary().subscribe({
      next: (data) => {
        this.entitlements.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.billing.getPlans().subscribe({
      next: (plans) => this.plans.set(plans),
      error: () => {}
    });

    this.billing.getUsageHistory(30).subscribe({
      next: (history) => this.usageHistory.set(history),
      error: () => {}
    });
  }

  getUsagePercent(item: EntitlementStatus): number {
    if (item.limit <= 0) return 0;
    return Math.min(Math.round((item.used / item.limit) * 100), 100);
  }

  getUsageSeverity(item: EntitlementStatus): 'success' | 'warn' | 'danger' | 'info' {
    const pct = this.getUsagePercent(item);
    if (pct >= 90) return 'danger';
    if (pct >= 70) return 'warn';
    return 'success';
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'active': return 'success';
      case 'trialing': return 'info';
      case 'past_due': return 'warn';
      case 'canceled': return 'danger';
      case 'paused': return 'warn';
      default: return 'info';
    }
  }

  formatLimit(item: EntitlementStatus): string {
    if (item.limit === -1) return 'Unlimited';
    return item.limit.toLocaleString();
  }

  formatUsed(item: EntitlementStatus): string {
    return item.used.toLocaleString();
  }

  formatFeatureKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getDaysUntilReset(resetsAt: string): number {
    const reset = new Date(resetsAt);
    const now = new Date();
    return Math.max(0, Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(0)}`;
  }

  onUpgrade(): void {
    this.toast.add({ severity: 'info', summary: 'Upgrade', detail: 'Redirecting to checkout...' });
    // TODO: Call billing service to get Paddle checkout URL and redirect
  }
}
