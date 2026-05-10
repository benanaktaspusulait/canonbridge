import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface Partner {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'degraded';
  eventTypes: number;
  activeMappings: number;
  dlqCount: number;
  throughput: string;
  lastSeen: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CardModule, ButtonModule, TableModule, TagModule, TooltipModule, AvatarModule, I18nPipe],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export class PartnersComponent {
  readonly partners: Partner[] = [
    { id: 'p1', name: 'ACME Marketplace',  slug: 'acme-marketplace',  status: 'active',   eventTypes: 4,  activeMappings: 4,  dlqCount: 2,  throughput: '~3,200/hr',  lastSeen: '1 min ago' },
    { id: 'p2', name: 'Logistics Xpress',  slug: 'logistics-xpress',  status: 'active',   eventTypes: 3,  activeMappings: 2,  dlqCount: 0,  throughput: '~1,800/hr',  lastSeen: '3 min ago' },
    { id: 'p3', name: 'Payment Gateway',   slug: 'payment-gateway',   status: 'degraded', eventTypes: 2,  activeMappings: 1,  dlqCount: 10, throughput: '~900/hr',    lastSeen: '12 min ago' },
    { id: 'p4', name: 'CRM Connect',       slug: 'crm-connect',       status: 'inactive', eventTypes: 1,  activeMappings: 0,  dlqCount: 0,  throughput: '—',          lastSeen: '2 days ago' },
    { id: 'p5', name: 'Inventory Hub',     slug: 'inventory-hub',     status: 'active',   eventTypes: 5,  activeMappings: 5,  dlqCount: 0,  throughput: '~600/hr',    lastSeen: '5 min ago' },
  ];

  getSeverity(status: string): 'success' | 'warn' | 'secondary' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'secondary' | 'danger'> = {
      active: 'success', degraded: 'warn', inactive: 'secondary'
    };
    return map[status] ?? 'secondary';
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
