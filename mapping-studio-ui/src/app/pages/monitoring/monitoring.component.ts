import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

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
  label: string;
  value: string;
  unit: string;
  slo: string;
  ok: boolean;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CardModule, TableModule, TagModule, ButtonModule],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss'
})
export class MonitoringComponent {
  readonly metrics: MetricCard[] = [
    { label: 'Throughput',       value: '1,284',  unit: 'msg/sec', slo: 'SLO: > 100/sec',  ok: true,  icon: 'pi-send',               color: '#dbeafe' },
    { label: 'p99 Latency',      value: '87',     unit: 'ms',      slo: 'SLO: < 200ms',    ok: true,  icon: 'pi-bolt',               color: '#dcfce7' },
    { label: 'DLQ Rate',         value: '0.09',   unit: '%',       slo: 'SLO: < 0.1%',     ok: true,  icon: 'pi-exclamation-circle', color: '#fef9c3' },
    { label: 'Consumer Lag',     value: '234',    unit: 'msgs',    slo: 'SLO: < 1,000',    ok: true,  icon: 'pi-clock',              color: '#f3e8ff' },
    { label: 'Error Rate',       value: '0.12',   unit: '%',       slo: 'SLO: < 1%',       ok: true,  icon: 'pi-times-circle',       color: '#ffedd5' },
    { label: 'Uptime',           value: '99.97',  unit: '%',       slo: 'SLO: > 99.9%',    ok: true,  icon: 'pi-check-circle',       color: '#dcfce7' },
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
