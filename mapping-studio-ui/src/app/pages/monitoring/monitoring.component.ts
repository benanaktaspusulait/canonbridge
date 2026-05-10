import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

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
  imports: [CardModule, TableModule, TagModule, ButtonModule, I18nPipe],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss'
})
export class MonitoringComponent {
  readonly metrics: MetricCard[] = [
    {
      labelKey: 'monitoring.metric.throughput.label',
      sloKey: 'monitoring.metric.throughput.slo',
      value: '1,284',
      unit: 'msg/sec',
      ok: true,
      icon: 'pi-send',
      color: '#dbeafe'
    },
    {
      labelKey: 'monitoring.metric.p99.label',
      sloKey: 'monitoring.metric.p99.slo',
      value: '87',
      unit: 'ms',
      ok: true,
      icon: 'pi-bolt',
      color: '#dcfce7'
    },
    {
      labelKey: 'monitoring.metric.dlq.label',
      sloKey: 'monitoring.metric.dlq.slo',
      value: '0.09',
      unit: '%',
      ok: true,
      icon: 'pi-exclamation-circle',
      color: '#fef9c3'
    },
    {
      labelKey: 'monitoring.metric.lag.label',
      sloKey: 'monitoring.metric.lag.slo',
      value: '234',
      unit: 'msgs',
      ok: true,
      icon: 'pi-clock',
      color: '#f3e8ff'
    },
    {
      labelKey: 'monitoring.metric.error.label',
      sloKey: 'monitoring.metric.error.slo',
      value: '0.12',
      unit: '%',
      ok: true,
      icon: 'pi-times-circle',
      color: '#ffedd5'
    },
    {
      labelKey: 'monitoring.metric.uptime.label',
      sloKey: 'monitoring.metric.uptime.slo',
      value: '99.97',
      unit: '%',
      ok: true,
      icon: 'pi-check-circle',
      color: '#dcfce7'
    }
  ];

  readonly partnerHealth: PartnerHealth[] = [
    { partner: 'acme-marketplace', status: 'healthy',  throughput: '3,200/hr', p99: '72ms',  dlqRate: '0.04%', lag: 12,  uptime: '99.99%' },
    { partner: 'logistics-xpress', status: 'healthy',  throughput: '1,800/hr', p99: '91ms',  dlqRate: '0.00%', lag: 5,   uptime: '100%'   },
    { partner: 'payment-gateway',  status: 'degraded', throughput: '900/hr',   p99: '312ms', dlqRate: '1.10%', lag: 217, uptime: '98.2%'  },
    { partner: 'inventory-hub',    status: 'healthy',  throughput: '600/hr',   p99: '55ms',  dlqRate: '0.00%', lag: 3,   uptime: '100%'   },
    { partner: 'crm-connect',      status: 'down',     throughput: '0/hr',     p99: '—',     dlqRate: '—',     lag: 0,   uptime: '0%'     },
  ];

  getSeverity(status: string): 'success' | 'warn' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'danger'> = {
      healthy: 'success', degraded: 'warn', down: 'danger'
    };
    return map[status] ?? 'warn';
  }
}
