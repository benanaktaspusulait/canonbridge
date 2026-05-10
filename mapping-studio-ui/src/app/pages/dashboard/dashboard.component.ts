import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface StatCard {
  labelKey: string;
  changeKey: string;
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
  imports: [RouterLink, CardModule, TagModule, ButtonModule, TableModule, BadgeModule, I18nPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly stats: StatCard[] = [
    {
      labelKey: 'dashboard.stat.msgProcessed.label',
      changeKey: 'dashboard.stat.msgProcessed.change',
      value: '1,284,390',
      change: '',
      changeType: 'positive',
      icon: 'pi-send',
      iconBg: '#dbeafe'
    },
    {
      labelKey: 'dashboard.stat.activeMappings.label',
      changeKey: 'dashboard.stat.activeMappings.change',
      value: '47',
      change: '',
      changeType: 'positive',
      icon: 'pi-directions',
      iconBg: '#dcfce7'
    },
    {
      labelKey: 'dashboard.stat.dlq.label',
      changeKey: 'dashboard.stat.dlq.change',
      value: '12',
      change: '',
      changeType: 'negative',
      icon: 'pi-exclamation-triangle',
      iconBg: '#fee2e2'
    },
    {
      labelKey: 'dashboard.stat.lag.label',
      changeKey: 'dashboard.stat.lag.change',
      value: '234',
      change: '',
      changeType: 'neutral',
      icon: 'pi-clock',
      iconBg: '#fef9c3'
    },
    {
      labelKey: 'dashboard.stat.p99.label',
      changeKey: 'dashboard.stat.p99.change',
      value: '87ms',
      change: '',
      changeType: 'positive',
      icon: 'pi-bolt',
      iconBg: '#f3e8ff'
    },
    {
      labelKey: 'dashboard.stat.partners.label',
      changeKey: 'dashboard.stat.partners.change',
      value: '8',
      change: '',
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
