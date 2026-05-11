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

// Simulated snapshots per time window
const SNAPSHOTS: Record<string, { metrics: Partial<MetricCard>[]; health: PartnerHealth[] }> = {
  '1h': {
    metrics: [
      { labelKey: 'monitoring.metric.throughput.label', sloKey: 'monitoring.metric.throughput.slo', value: '1,284', unit: 'msg/sec', ok: true,  icon: 'pi-send',              color: '#dbeafe' },
      { labelKey: 'monitoring.metric.p99.label',        sloKey: 'monitoring.metric.p99.slo',        value: '87',    unit: 'ms',      ok: true,  icon: 'pi-bolt',              color: '#dcfce7' },
      { labelKey: 'monitoring.metric.dlq.label',        sloKey: 'monitoring.metric.dlq.slo',        value: '0.09',  unit: '%',       ok: true,  icon: 'pi-exclamation-circle', color: '#fef9c3' },
      { labelKey: 'monitoring.metric.lag.label',        sloKey: 'monitoring.metric.lag.slo',        value: '234',   unit: 'msgs',    ok: true,  icon: 'pi-clock',             color: '#f3e8ff' },
      { labelKey: 'monitoring.metric.error.label',      sloKey: 'monitoring.metric.error.slo',      value: '0.12',  unit: '%',       ok: true,  icon: 'pi-times-circle',      color: '#ffedd5' },
      { labelKey: 'monitoring.metric.uptime.label',     sloKey: 'monitoring.metric.uptime.slo',     value: '99.97', unit: '%',       ok: true,  icon: 'pi-check-circle',      color: '#dcfce7' },
    ],
    health: [
      { partner: 'acme-marketplace', status: 'healthy',  throughput: '3,200/hr', p99: '72ms',  dlqRate: '0.04%', lag: 12,  uptime: '99.99%' },
      { partner: 'logistics-xpress', status: 'healthy',  throughput: '1,800/hr', p99: '91ms',  dlqRate: '0.00%', lag: 5,   uptime: '100%'   },
      { partner: 'payment-gateway',  status: 'degraded', throughput: '900/hr',   p99: '312ms', dlqRate: '1.10%', lag: 217, uptime: '98.2%'  },
      { partner: 'inventory-hub',    status: 'healthy',  throughput: '600/hr',   p99: '55ms',  dlqRate: '0.00%', lag: 3,   uptime: '100%'   },
      { partner: 'crm-connect',      status: 'down',     throughput: '0/hr',     p99: '—',     dlqRate: '—',     lag: 0,   uptime: '0%'     },
    ]
  },
  '6h': {
    metrics: [
      { labelKey: 'monitoring.metric.throughput.label', sloKey: 'monitoring.metric.throughput.slo', value: '1,102', unit: 'msg/sec', ok: true,  icon: 'pi-send',              color: '#dbeafe' },
      { labelKey: 'monitoring.metric.p99.label',        sloKey: 'monitoring.metric.p99.slo',        value: '104',   unit: 'ms',      ok: true,  icon: 'pi-bolt',              color: '#dcfce7' },
      { labelKey: 'monitoring.metric.dlq.label',        sloKey: 'monitoring.metric.dlq.slo',        value: '0.14',  unit: '%',       ok: false, icon: 'pi-exclamation-circle', color: '#fef9c3' },
      { labelKey: 'monitoring.metric.lag.label',        sloKey: 'monitoring.metric.lag.slo',        value: '512',   unit: 'msgs',    ok: true,  icon: 'pi-clock',             color: '#f3e8ff' },
      { labelKey: 'monitoring.metric.error.label',      sloKey: 'monitoring.metric.error.slo',      value: '0.21',  unit: '%',       ok: true,  icon: 'pi-times-circle',      color: '#ffedd5' },
      { labelKey: 'monitoring.metric.uptime.label',     sloKey: 'monitoring.metric.uptime.slo',     value: '99.91', unit: '%',       ok: true,  icon: 'pi-check-circle',      color: '#dcfce7' },
    ],
    health: [
      { partner: 'acme-marketplace', status: 'healthy',  throughput: '2,900/hr', p99: '88ms',  dlqRate: '0.06%', lag: 34,  uptime: '99.97%' },
      { partner: 'logistics-xpress', status: 'healthy',  throughput: '1,600/hr', p99: '99ms',  dlqRate: '0.00%', lag: 11,  uptime: '100%'   },
      { partner: 'payment-gateway',  status: 'degraded', throughput: '820/hr',   p99: '388ms', dlqRate: '1.40%', lag: 340, uptime: '97.8%'  },
      { partner: 'inventory-hub',    status: 'healthy',  throughput: '580/hr',   p99: '61ms',  dlqRate: '0.00%', lag: 7,   uptime: '100%'   },
      { partner: 'crm-connect',      status: 'down',     throughput: '0/hr',     p99: '—',     dlqRate: '—',     lag: 0,   uptime: '0%'     },
    ]
  },
  '24h': {
    metrics: [
      { labelKey: 'monitoring.metric.throughput.label', sloKey: 'monitoring.metric.throughput.slo', value: '987',   unit: 'msg/sec', ok: true,  icon: 'pi-send',              color: '#dbeafe' },
      { labelKey: 'monitoring.metric.p99.label',        sloKey: 'monitoring.metric.p99.slo',        value: '143',   unit: 'ms',      ok: true,  icon: 'pi-bolt',              color: '#dcfce7' },
      { labelKey: 'monitoring.metric.dlq.label',        sloKey: 'monitoring.metric.dlq.slo',        value: '0.22',  unit: '%',       ok: false, icon: 'pi-exclamation-circle', color: '#fef9c3' },
      { labelKey: 'monitoring.metric.lag.label',        sloKey: 'monitoring.metric.lag.slo',        value: '891',   unit: 'msgs',    ok: true,  icon: 'pi-clock',             color: '#f3e8ff' },
      { labelKey: 'monitoring.metric.error.label',      sloKey: 'monitoring.metric.error.slo',      value: '0.48',  unit: '%',       ok: true,  icon: 'pi-times-circle',      color: '#ffedd5' },
      { labelKey: 'monitoring.metric.uptime.label',     sloKey: 'monitoring.metric.uptime.slo',     value: '99.72', unit: '%',       ok: true,  icon: 'pi-check-circle',      color: '#dcfce7' },
    ],
    health: [
      { partner: 'acme-marketplace', status: 'healthy',  throughput: '2,600/hr', p99: '95ms',  dlqRate: '0.09%', lag: 55,  uptime: '99.94%' },
      { partner: 'logistics-xpress', status: 'healthy',  throughput: '1,400/hr', p99: '112ms', dlqRate: '0.02%', lag: 18,  uptime: '99.98%' },
      { partner: 'payment-gateway',  status: 'degraded', throughput: '710/hr',   p99: '445ms', dlqRate: '1.80%', lag: 480, uptime: '96.5%'  },
      { partner: 'inventory-hub',    status: 'healthy',  throughput: '540/hr',   p99: '70ms',  dlqRate: '0.00%', lag: 9,   uptime: '100%'   },
      { partner: 'crm-connect',      status: 'down',     throughput: '0/hr',     p99: '—',     dlqRate: '—',     lag: 0,   uptime: '0%'     },
    ]
  },
  '7d': {
    metrics: [
      { labelKey: 'monitoring.metric.throughput.label', sloKey: 'monitoring.metric.throughput.slo', value: '1,041', unit: 'msg/sec', ok: true,  icon: 'pi-send',              color: '#dbeafe' },
      { labelKey: 'monitoring.metric.p99.label',        sloKey: 'monitoring.metric.p99.slo',        value: '161',   unit: 'ms',      ok: true,  icon: 'pi-bolt',              color: '#dcfce7' },
      { labelKey: 'monitoring.metric.dlq.label',        sloKey: 'monitoring.metric.dlq.slo',        value: '0.31',  unit: '%',       ok: false, icon: 'pi-exclamation-circle', color: '#fef9c3' },
      { labelKey: 'monitoring.metric.lag.label',        sloKey: 'monitoring.metric.lag.slo',        value: '1,204', unit: 'msgs',    ok: false, icon: 'pi-clock',             color: '#f3e8ff' },
      { labelKey: 'monitoring.metric.error.label',      sloKey: 'monitoring.metric.error.slo',      value: '0.67',  unit: '%',       ok: true,  icon: 'pi-times-circle',      color: '#ffedd5' },
      { labelKey: 'monitoring.metric.uptime.label',     sloKey: 'monitoring.metric.uptime.slo',     value: '99.61', unit: '%',       ok: true,  icon: 'pi-check-circle',      color: '#dcfce7' },
    ],
    health: [
      { partner: 'acme-marketplace', status: 'healthy',  throughput: '2,400/hr', p99: '101ms', dlqRate: '0.12%', lag: 88,  uptime: '99.89%' },
      { partner: 'logistics-xpress', status: 'healthy',  throughput: '1,300/hr', p99: '118ms', dlqRate: '0.03%', lag: 22,  uptime: '99.95%' },
      { partner: 'payment-gateway',  status: 'degraded', throughput: '650/hr',   p99: '502ms', dlqRate: '2.10%', lag: 620, uptime: '95.1%'  },
      { partner: 'inventory-hub',    status: 'healthy',  throughput: '510/hr',   p99: '78ms',  dlqRate: '0.01%', lag: 14,  uptime: '99.99%' },
      { partner: 'crm-connect',      status: 'down',     throughput: '0/hr',     p99: '—',     dlqRate: '—',     lag: 0,   uptime: '0%'     },
    ]
  }
};

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
export class MonitoringComponent implements OnDestroy {
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
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

  readonly metrics      = signal<MetricCard[]>(SNAPSHOTS['1h'].metrics as MetricCard[]);
  readonly partnerHealth = signal<PartnerHealth[]>(SNAPSHOTS['1h'].health);

  // ── Window change ─────────────────────────────────────────────────────────

  onWindowChange(): void {
    const snap = SNAPSHOTS[this.timeWindow];
    if (!snap) return;
    this.metrics.set(snap.metrics as MetricCard[]);
    this.partnerHealth.set(snap.health);
    this.lastUpdated = new Date();
  }

  // ── Refresh ───────────────────────────────────────────────────────────────

  refresh(showToast = true): void {
    // Apply snapshot for current window with slight random jitter
    const snap = SNAPSHOTS[this.timeWindow];
    if (!snap) return;

    this.metrics.set(snap.metrics.map(m => {
      const numVal = parseFloat(m.value?.replace(/,/g, '') ?? '0');
      const jitter = (Math.random() - 0.5) * 0.04 * numVal;
      const newVal = Math.max(0, numVal + jitter);
      const formatted = Number.isInteger(numVal)
        ? Math.round(newVal).toLocaleString()
        : newVal.toFixed(2);
      return { ...m, value: formatted } as MetricCard;
    }));

    this.partnerHealth.update(list => list.map(p => {
      const lagJitter = Math.round((Math.random() - 0.5) * 40);
      return { ...p, lag: Math.max(0, p.lag + lagJitter) };
    }));

    this.lastUpdated = new Date();
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
