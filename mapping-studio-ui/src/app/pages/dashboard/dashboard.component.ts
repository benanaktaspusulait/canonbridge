import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';

interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconBg: string;
}

interface RecentMapping {
  partner: string;
  eventType: string;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  lastModified: string;
  modifiedBy: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CardModule, TagModule, ButtonModule, TableModule, BadgeModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly stats: StatCard[] = [
    {
      label: 'Messages Processed',
      value: '1,284,390',
      change: '+12.3% vs yesterday',
      changeType: 'positive',
      icon: 'pi-send',
      iconBg: '#dbeafe'
    },
    {
      label: 'Active Mappings',
      value: '47',
      change: '+2 this week',
      changeType: 'positive',
      icon: 'pi-directions',
      iconBg: '#dcfce7'
    },
    {
      label: 'DLQ Messages',
      value: '12',
      change: '+5 in last hour',
      changeType: 'negative',
      icon: 'pi-exclamation-triangle',
      iconBg: '#fee2e2'
    },
    {
      label: 'Consumer Lag',
      value: '234',
      change: 'Within SLO target',
      changeType: 'neutral',
      icon: 'pi-clock',
      iconBg: '#fef9c3'
    },
    {
      label: 'Transformation p99',
      value: '87ms',
      change: 'SLO: < 200ms',
      changeType: 'positive',
      icon: 'pi-bolt',
      iconBg: '#f3e8ff'
    },
    {
      label: 'Active Partners',
      value: '8',
      change: '3 tenants',
      changeType: 'neutral',
      icon: 'pi-building',
      iconBg: '#ffedd5'
    }
  ];

  readonly recentMappings: RecentMapping[] = [
    { partner: 'acme-marketplace', eventType: 'order.created',    version: 'v2.1.0', status: 'active',     lastModified: '2026-05-10 14:22', modifiedBy: 'A. User' },
    { partner: 'logistics-xpress', eventType: 'shipment.updated', version: 'v1.3.0', status: 'active',     lastModified: '2026-05-09 09:10', modifiedBy: 'I. Engineer' },
    { partner: 'payment-gateway',  eventType: 'payment.captured', version: 'v3.0.1', status: 'draft',      lastModified: '2026-05-08 16:45', modifiedBy: 'I. Engineer' },
    { partner: 'acme-marketplace', eventType: 'order.cancelled',  version: 'v1.0.2', status: 'active',     lastModified: '2026-05-07 11:30', modifiedBy: 'A. User' },
    { partner: 'crm-connect',      eventType: 'customer.updated', version: 'v2.0.0', status: 'deprecated', lastModified: '2026-05-01 08:00', modifiedBy: 'P. Operator' },
  ];

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      active: 'success',
      draft: 'warn',
      deprecated: 'secondary'
    };
    return map[status] ?? 'info';
  }
}
