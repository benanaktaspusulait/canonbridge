import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface ExternalConnection {
  id: string;
  name: string;
  partner: string;
  eventType: string;
  type: 'REST' | 'SOAP' | 'Webhook' | 'Scheduled Poll';
  environment: 'Production' | 'Sandbox';
  status: 'healthy' | 'degraded' | 'down' | 'notTested';
  successRate: number | null;
  avgMs: number | null;
  p95Ms: number | null;
  lastError: string;
  lastSuccess: string;
  calls24h: number;
}

@Component({
  selector: 'app-external-systems',
  standalone: true,
  imports: [CardModule, TableModule, TagModule, ButtonModule, TooltipModule, I18nPipe],
  templateUrl: './external-systems.component.html',
  styleUrl: './external-systems.component.scss'
})
export class ExternalSystemsComponent {
  readonly connections: ExternalConnection[] = [
    {
      id: 'conn-carrier-orders',
      name: 'Carrier A Orders',
      partner: 'ACME Marketplace',
      eventType: 'OrderCreated',
      type: 'REST',
      environment: 'Production',
      status: 'healthy',
      successRate: 99.2,
      avgMs: 184,
      p95Ms: 312,
      lastError: '—',
      lastSuccess: '2 min ago',
      calls24h: 1842
    },
    {
      id: 'conn-shopify-webhook',
      name: 'Shopify Order Webhook',
      partner: 'Shopify',
      eventType: 'OrderCreated',
      type: 'Webhook',
      environment: 'Production',
      status: 'healthy',
      successRate: 100,
      avgMs: 22,
      p95Ms: 48,
      lastError: '—',
      lastSuccess: '1 min ago',
      calls24h: 923
    },
    {
      id: 'conn-soap-tracking',
      name: 'SOAP Tracking Lookup',
      partner: 'Logistics Xpress',
      eventType: 'ShipmentUpdated',
      type: 'SOAP',
      environment: 'Sandbox',
      status: 'degraded',
      successRate: 91.1,
      avgMs: 640,
      p95Ms: 1220,
      lastError: 'SOAP fault: invalid tracking number',
      lastSuccess: '16 min ago',
      calls24h: 418
    },
    {
      id: 'conn-payment-risk',
      name: 'Payment Risk Score',
      partner: 'Payment Gateway',
      eventType: 'PaymentAuthorized',
      type: 'REST',
      environment: 'Production',
      status: 'down',
      successRate: 72.4,
      avgMs: 1800,
      p95Ms: 3200,
      lastError: 'HTTP 503 after 3 attempts',
      lastSuccess: '48 min ago',
      calls24h: 212
    }
  ];

  readonly totals = {
    healthy: this.connections.filter(c => c.status === 'healthy').length,
    degraded: this.connections.filter(c => c.status === 'degraded').length,
    down: this.connections.filter(c => c.status === 'down').length,
    calls: this.connections.reduce((sum, c) => sum + c.calls24h, 0)
  };

  statusSeverity(status: ExternalConnection['status']): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<ExternalConnection['status'], 'success' | 'warn' | 'danger' | 'secondary'> = {
      healthy: 'success',
      degraded: 'warn',
      down: 'danger',
      notTested: 'secondary'
    };
    return map[status];
  }

  successWidth(connection: ExternalConnection): number {
    return Math.max(0, Math.min(100, connection.successRate ?? 0));
  }
}
