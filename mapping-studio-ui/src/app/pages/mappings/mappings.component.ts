import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface MappingVersion {
  id: string;
  partner: string;
  eventType: string;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  createdAt: string;
  publishedBy: string;
  transformations: number;
}

@Component({
  selector: 'app-mappings',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, CardModule, ButtonModule, TableModule, TagModule,
            InputTextModule, TooltipModule, IconFieldModule, InputIconModule, I18nPipe],
  templateUrl: './mappings.component.html',
  styleUrl: './mappings.component.scss'
})
export class MappingsComponent {
  search = '';

  readonly mappings: MappingVersion[] = [
    { id: 'm1', partner: 'acme-marketplace',  eventType: 'order.created',     version: 'v2.1.0', status: 'active',     createdAt: '2026-05-10', publishedBy: 'Admin User',           transformations: 48320 },
    { id: 'm2', partner: 'acme-marketplace',  eventType: 'order.created',     version: 'v2.0.0', status: 'deprecated', createdAt: '2026-04-01', publishedBy: 'Admin User',           transformations: 210000 },
    { id: 'm3', partner: 'acme-marketplace',  eventType: 'order.cancelled',   version: 'v1.0.2', status: 'active',     createdAt: '2026-03-15', publishedBy: 'Integration Engineer', transformations: 5210 },
    { id: 'm4', partner: 'logistics-xpress',  eventType: 'shipment.updated',  version: 'v1.3.0', status: 'active',     createdAt: '2026-05-09', publishedBy: 'Integration Engineer', transformations: 91200 },
    { id: 'm5', partner: 'logistics-xpress',  eventType: 'shipment.created',  version: 'v1.0.0', status: 'active',     createdAt: '2026-02-20', publishedBy: 'Integration Engineer', transformations: 33400 },
    { id: 'm6', partner: 'payment-gateway',   eventType: 'payment.captured',  version: 'v3.0.1', status: 'draft',      createdAt: '2026-05-08', publishedBy: 'Integration Engineer', transformations: 0 },
    { id: 'm7', partner: 'payment-gateway',   eventType: 'payment.captured',  version: 'v3.0.0', status: 'active',     createdAt: '2026-04-22', publishedBy: 'Admin User',           transformations: 72100 },
    { id: 'm8', partner: 'crm-connect',       eventType: 'customer.updated',  version: 'v2.0.0', status: 'deprecated', createdAt: '2026-01-10', publishedBy: 'Platform Operator',    transformations: 18900 },
  ];

  getSeverity(status: string): 'success' | 'warn' | 'secondary' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'secondary' | 'danger'> = {
      active: 'success', draft: 'warn', deprecated: 'secondary'
    };
    return map[status] ?? 'secondary';
  }

  get filtered() {
    if (!this.search.trim()) return this.mappings;
    const q = this.search.toLowerCase();
    return this.mappings.filter(m =>
      m.partner.includes(q) || m.eventType.includes(q) || m.version.includes(q)
    );
  }
}
