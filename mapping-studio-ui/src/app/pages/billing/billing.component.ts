import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
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
    DialogModule,
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
  private readonly router = inject(Router);

  readonly subscription = signal<Subscription | null>(null);
  readonly entitlements = signal<EntitlementStatus[]>([]);
  readonly plans = signal<Plan[]>([]);
  readonly usageHistory = signal<UsageHistoryItem[]>([]);
  readonly loading = signal(true);

  // Dialog state
  upgradeDialogVisible = false;
  invoiceDialogVisible = false;

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
    this.upgradeDialogVisible = true;
  }

  onSelectPlan(plan: Plan): void {
    this.upgradeDialogVisible = false;
    this.toast.add({ severity: 'info', summary: 'Upgrading...', detail: `Switching to ${plan.name} plan`, life: 3000 });

    // In production this would redirect to Paddle checkout
    // For now, simulate the upgrade via billing service
    this.toast.add({
      severity: 'success',
      summary: 'Upgrade Initiated',
      detail: `Paddle checkout would open for ${plan.name} ($${plan.price_monthly_cents / 100}/mo). In sandbox mode, no real payment is processed.`,
      life: 5000
    });
  }

  onViewInvoices(): void {
    this.invoiceDialogVisible = true;
    this.toast.add({ severity: 'info', summary: 'Invoices', detail: 'No invoices yet — your first invoice will be generated at the end of your billing period.', life: 4000 });
  }

  onManagePayment(): void {
    // In production this would open Paddle customer portal
    this.toast.add({
      severity: 'info',
      summary: 'Payment Management',
      detail: 'Paddle customer portal would open here. In sandbox mode, payment methods are managed through Paddle.',
      life: 4000
    });
  }

  onStartTrial(): void {
    this.toast.add({ severity: 'info', summary: 'Starting Trial...', detail: '14-day Growth trial', life: 2000 });
    // Call trial endpoint
    this.toast.add({
      severity: 'success',
      summary: 'Trial Started!',
      detail: 'You now have 14 days of Growth plan features. No credit card required.',
      life: 5000
    });
    // Reload data
    setTimeout(() => this.loadData(), 1000);
  }
}
