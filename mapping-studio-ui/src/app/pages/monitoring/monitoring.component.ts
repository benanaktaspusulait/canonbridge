import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

interface PartnerHealth {
  partner: string;
  status: 'healthy' | 'degraded' | 'down';
  throughput: string;
  p99: string;
  dlqRate: string;
  lag: number;
  uptime: string;
}

interface MetricCard {
  labelKey: string;
  sloKey: string;
  value: string;
  unit: string;
  ok: boolean;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [FormsModule, ButtonModule, CardModule, SelectModule, TableModule, TagModule, ToastModule, ToggleSwitchModule, I18nPipe],
  providers: [MessageService],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss'
})
export class MonitoringComponent implements OnDestroy {
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  private refreshTimer: number | null = null;

  timeWindow = '24h';
  autoRefresh = false;
  lastUpdated = new Date();

  readonly windowOptions = [
    { label: 'Last 1 hour', value: '1h' },
    { label: 'Last 6 hours', value: '6h' },
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Last 7 days', value: '7d' }
  ];

  readonly metrics = signal<MetricCard[]>([
    { labelKey: 'monitoring.metric.throughput.label', sloKey: 'monitoring.metric.throughput.slo', value: '1,284', unit: 'msg/sec', ok: true, icon: 'pi-send', color: '#dbeafe' },
    { labelKey: 'monitoring.metric.p99.label', sloKey: 'monitoring.metric.p99.slo', value: '87', unit: 'ms', ok: true, icon: 'pi-bolt', color: '#dcfce7' },
    { labelKey: 'monitoring.metric.dlq.label', sloKey: 'monitoring.metric.dlq.slo', value: '0.09', unit: '%', ok: true, icon: 'pi-exclamation-circle', color: '#fef9c3' },
    { labelKey: 'monitoring.metric.lag.label', sloKey: 'monitoring.metric.lag.slo', value: '234', unit: 'msgs', ok: true, icon: 'pi-clock', color: '#f3e8ff' },
    { labelKey: 'monitoring.metric.error.label', sloKey: 'monitoring.metric.error.slo', value: '0.12', unit: '%', ok: true, icon: 'pi-times-circle', color: '#ffedd5' },
    { labelKey: 'monitoring.metric.uptime.label', sloKey: 'monitoring.metric.uptime.slo', value: '99.97', unit: '%', ok: true, icon: 'pi-check-circle', color: '#dcfce7' }
  ]);

  readonly partnerHealth = signal<PartnerHealth[]>([
    { partner: 'acme-marketplace', status: 'healthy', throughput: '3,200/hr', p99: '72ms', dlqRate: '0.04%', lag: 12, uptime: '99.99%' },
    { partner: 'logistics-xpress', status: 'healthy', throughput: '1,800/hr', p99: '91ms', dlqRate: '0.00%', lag: 5, uptime: '100%' },
    { partner: 'payment-gateway', status: 'degraded', throughput: '900/hr', p99: '312ms', dlqRate: '1.10%', lag: 217, uptime: '98.2%' },
    { partner: 'inventory-hub', status: 'healthy', throughput: '600/hr', p99: '55ms', dlqRate: '0.00%', lag: 3, uptime: '100%' },
    { partner: 'crm-connect', status: 'down', throughput: '0/hr', p99: '—', dlqRate: '—', lag: 0, uptime: '0%' }
  ]);

  ngOnDestroy(): void {
    if (this.refreshTimer) window.clearInterval(this.refreshTimer);
  }

  refresh(showToast = true): void {
    const throughput = 950 + Math.round(Math.random() * 850);
    const p99 = 60 + Math.round(Math.random() * 210);
    const dlq = +(Math.random() * 0.22).toFixed(2);
    const lag = Math.round(Math.random() * 900);
    const error = +(Math.random() * 0.8).toFixed(2);
    const uptime = +(99.8 + Math.random() * 0.19).toFixed(2);

    this.metrics.set([
      { labelKey: 'monitoring.metric.throughput.label', sloKey: 'monitoring.metric.throughput.slo', value: throughput.toLocaleString(), unit: 'msg/sec', ok: throughput > 100, icon: 'pi-send', color: '#dbeafe' },
      { labelKey: 'monitoring.metric.p99.label', sloKey: 'monitoring.metric.p99.slo', value: String(p99), unit: 'ms', ok: p99 < 200, icon: 'pi-bolt', color: '#dcfce7' },
      { labelKey: 'monitoring.metric.dlq.label', sloKey: 'monitoring.metric.dlq.slo', value: dlq.toFixed(2), unit: '%', ok: dlq < 0.1, icon: 'pi-exclamation-circle', color: '#fef9c3' },
      { labelKey: 'monitoring.metric.lag.label', sloKey: 'monitoring.metric.lag.slo', value: String(lag), unit: 'msgs', ok: lag < 1000, icon: 'pi-clock', color: '#f3e8ff' },
      { labelKey: 'monitoring.metric.error.label', sloKey: 'monitoring.metric.error.slo', value: error.toFixed(2), unit: '%', ok: error < 1, icon: 'pi-times-circle', color: '#ffedd5' },
      { labelKey: 'monitoring.metric.uptime.label', sloKey: 'monitoring.metric.uptime.slo', value: uptime.toFixed(2), unit: '%', ok: uptime > 99.9, icon: 'pi-check-circle', color: '#dcfce7' }
    ]);

    this.partnerHealth.update(list => list.map(p => {
      const lagValue = Math.max(0, p.lag + Math.round(Math.random() * 80 - 30));
      const p99Value = p.status === 'down' ? '—' : `${50 + Math.round(Math.random() * 300)}ms`;
      const status: PartnerHealth['status'] = p.status === 'down' ? 'down' : lagValue > 250 ? 'degraded' : 'healthy';
      return { ...p, status, lag: lagValue, p99: p99Value };
    }));

    this.lastUpdated = new Date();
    if (showToast) this.toast.add({ severity: 'success', summary: this.t('monitoring.toast.refreshed'), detail: this.lastUpdatedLabel });
  }

  onAutoRefreshChange(): void {
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.autoRefresh) {
      this.refreshTimer = window.setInterval(() => this.refresh(false), 30000);
      this.toast.add({ severity: 'info', summary: this.t('monitoring.toast.autoOn'), detail: '30s' });
    } else {
      this.toast.add({ severity: 'secondary', summary: this.t('monitoring.toast.autoOff') });
    }
  }

  exportCsv(): void {
    const rows = [
      ['partner', 'status', 'throughput', 'p99', 'dlqRate', 'lag', 'uptime', 'window', 'exportedAt'],
      ...this.partnerHealth().map(p => [p.partner, p.status, p.throughput, p.p99, p.dlqRate, String(p.lag), p.uptime, this.timeWindow, new Date().toISOString()])
    ];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canonbridge-monitoring-${this.timeWindow}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.toast.add({ severity: 'success', summary: this.t('monitoring.toast.exported'), detail: link.download });
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'danger'> = {
      healthy: 'success',
      degraded: 'warn',
      down: 'danger'
    };
    return map[status] ?? 'warn';
  }

  get lastUpdatedLabel(): string {
    return this.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  private t(key: string): string {
    return this.i18n.translate(key);
  }
}
