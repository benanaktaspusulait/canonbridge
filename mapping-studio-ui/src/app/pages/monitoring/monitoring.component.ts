import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
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
import { MetricsService, PartnerHealth } from '../../core/services/metrics.service';

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
  imports: [
    FormsModule,
    ButtonModule, CardModule, SelectModule, TableModule, TagModule,
    ToastModule, ToggleSwitchModule,
    I18nPipe
  ],
  providers: [MessageService],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss'
})
export class MonitoringComponent implements OnInit, OnDestroy {
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  private readonly metricsService = inject(MetricsService);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  // ── State ─────────────────────────────────────────────────────────────────
  timeWindow = '1h';
  autoRefresh = false;
  lastUpdated = new Date();

  readonly windowOptions = [
    { label: 'Last 1 hour',  value: '1h'  },
    { label: 'Last 6 hours', value: '6h'  },
    { label: 'Last 24 hours',value: '24h' },
    { label: 'Last 7 days',  value: '7d'  },
  ];

  readonly metrics      = signal<MetricCard[]>([]);
  readonly partnerHealth = signal<PartnerHealth[]>([]);
  readonly loading = signal(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadMetrics();
  }

  private loadMetrics(): void {
    this.loading.set(true);
    
    // Load system metrics
    this.metricsService.getMonitoringMetrics(this.timeWindow).subscribe({
      next: (data) => {
        if (!data || !data.system) {
          this.metrics.set([]);
          this.loading.set(false);
          return;
        }
        const sys = data.system;
        this.metrics.set([
          { labelKey: 'monitoring.metric.throughput.label', sloKey: 'monitoring.metric.throughput.slo', value: String(sys.throughput), unit: 'msg/sec', ok: true,  icon: 'pi-send',              color: '#dbeafe' },
          { labelKey: 'monitoring.metric.p99.label',        sloKey: 'monitoring.metric.p99.slo',        value: String(sys.p99Latency),   unit: 'ms',      ok: sys.p99Latency < 200,  icon: 'pi-bolt',              color: '#dcfce7' },
          { labelKey: 'monitoring.metric.dlq.label',        sloKey: 'monitoring.metric.dlq.slo',        value: sys.dlqRate.toFixed(2),  unit: '%',       ok: sys.dlqRate < 0.1, icon: 'pi-exclamation-circle', color: '#fef9c3' },
          { labelKey: 'monitoring.metric.lag.label',        sloKey: 'monitoring.metric.lag.slo',        value: String(sys.consumerLag),   unit: 'msgs',    ok: sys.consumerLag < 1000,  icon: 'pi-clock',             color: '#f3e8ff' },
          { labelKey: 'monitoring.metric.error.label',      sloKey: 'monitoring.metric.error.slo',      value: sys.errorRate.toFixed(2),  unit: '%',       ok: sys.errorRate < 1,  icon: 'pi-times-circle',      color: '#ffedd5' },
          { labelKey: 'monitoring.metric.uptime.label',     sloKey: 'monitoring.metric.uptime.slo',     value: sys.uptime.toFixed(2), unit: '%',       ok: sys.uptime > 99.9,  icon: 'pi-check-circle',      color: '#dcfce7' },
        ]);
        this.lastUpdated = new Date();
      },
      error: (err) => {
        console.error('Failed to load monitoring metrics:', err);
        this.metrics.set([]);
        this.loading.set(false);
      }
    });

    // Load partner health
    this.metricsService.getPartnerHealth(this.timeWindow).subscribe({
      next: (data) => {
        if (!data || !data.partners) {
          this.partnerHealth.set([]);
          this.loading.set(false);
          return;
        }
        this.partnerHealth.set(data.partners);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load partner health:', err);
        this.partnerHealth.set([]);
        this.loading.set(false);
      }
    });
  }

  // ── Window change ─────────────────────────────────────────────────────────

  onWindowChange(): void {
    this.loadMetrics();
  }

  // ── Refresh ───────────────────────────────────────────────────────────────

  refresh(showToast = true): void {
    this.loadMetrics();
    if (showToast) {
      this.toast.add({ severity: 'success', summary: this.t('monitoring.toast.refreshed'), detail: this.lastUpdatedLabel, life: 2000 });
    }
  }

  onAutoRefreshChange(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.autoRefresh) {
      this.refreshTimer = setInterval(() => this.refresh(false), 30_000);
      this.toast.add({ severity: 'info', summary: this.t('monitoring.toast.autoOn'), detail: '30s', life: 2500 });
    } else {
      this.toast.add({ severity: 'secondary', summary: this.t('monitoring.toast.autoOff'), life: 2000 });
    }
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  // ── Export ────────────────────────────────────────────────────────────────

  exportCsv(): void {
    const rows = [
      ['partner', 'status', 'throughput', 'p99', 'dlqRate', 'lag', 'uptime', 'window', 'exportedAt'],
      ...this.partnerHealth().map(p => [
        p.partner, p.status, p.throughput, p.p99, p.dlqRate,
        String(p.lag), p.uptime, this.timeWindow, new Date().toISOString()
      ])
    ];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canonbridge-monitoring-${this.timeWindow}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.add({ severity: 'success', summary: this.t('monitoring.toast.exported'), detail: a.download, life: 2500 });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getSeverity(status: string): 'success' | 'warn' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'danger'> = {
      healthy: 'success', degraded: 'warn', down: 'danger'
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
