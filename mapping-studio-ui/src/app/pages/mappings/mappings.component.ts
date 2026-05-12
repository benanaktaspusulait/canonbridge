import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
import { MappingService, MappingDraft } from '../../core/services/mapping.service';

interface MappingVersion {
  id: string;
  partner: string;
  eventType: string;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  createdAt: string;
  publishedBy: string;
  transformations: number;
  checksum: string;
  notes: string;
  rules: string[];
}

@Component({
  selector: 'app-mappings',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DecimalPipe,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DrawerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    I18nPipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './mappings.component.html',
  styleUrl: './mappings.component.scss'
})
export class MappingsComponent {
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);

  // ── Signals (reactive) ────────────────────────────────────────────────────
  readonly search = signal('');
  readonly statusFilter = signal<string>('all');
  detailVisible = false;
  readonly selectedMapping = signal<MappingVersion | null>(null);

  readonly statusFilterOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active',       value: 'active' },
    { label: 'Draft',        value: 'draft' },
    { label: 'Deprecated',   value: 'deprecated' },
  ];

  private readonly _mappings = signal<MappingVersion[]>([
    { id: 'm1', partner: 'acme-marketplace',  eventType: 'order.created',    version: 'v2.1.0', status: 'active',     createdAt: '2026-05-10', publishedBy: 'Admin User',           transformations: 48320,  checksum: 'sha256:8c40f0a', notes: 'Adds outbound carrier enrichment and canonical validation.',  rules: ['Direct map orderId', 'Enum normalize status', 'Array map line items', 'Default currency TRY'] },
    { id: 'm2', partner: 'acme-marketplace',  eventType: 'order.created',    version: 'v2.0.0', status: 'deprecated', createdAt: '2026-04-01', publishedBy: 'Admin User',           transformations: 210000, checksum: 'sha256:5d19c2f', notes: 'Superseded by v2.1.0.',                                        rules: ['Direct map orderId', 'Format orderDate', 'Array map line items'] },
    { id: 'm3', partner: 'acme-marketplace',  eventType: 'order.cancelled',  version: 'v1.0.2', status: 'active',     createdAt: '2026-03-15', publishedBy: 'Integration Engineer', transformations: 5210,   checksum: 'sha256:fb71220', notes: 'Cancellation event mapping.',                                  rules: ['Direct map cancellationId', 'Condition reason code'] },
    { id: 'm4', partner: 'logistics-xpress',  eventType: 'shipment.updated', version: 'v1.3.0', status: 'active',     createdAt: '2026-05-09', publishedBy: 'Integration Engineer', transformations: 91200,  checksum: 'sha256:ab993ee', notes: 'Shipment state and ETA mapping.',                              rules: ['Enum map shipment state', 'Format ETA date', 'Template tracking URL'] },
    { id: 'm5', partner: 'logistics-xpress',  eventType: 'shipment.created', version: 'v1.0.0', status: 'active',     createdAt: '2026-02-20', publishedBy: 'Integration Engineer', transformations: 33400,  checksum: 'sha256:10a2dd1', notes: 'Initial shipment created release.',                           rules: ['Direct map trackingNo', 'Uppercase carrier code'] },
    { id: 'm6', partner: 'payment-gateway',   eventType: 'payment.captured', version: 'v3.0.1', status: 'draft',      createdAt: '2026-05-08', publishedBy: 'Integration Engineer', transformations: 0,      checksum: 'draft:local',   notes: 'Draft with risk score enrichment.',                              rules: ['Number coercion amount', 'Outbound risk score lookup'] },
    { id: 'm7', partner: 'payment-gateway',   eventType: 'payment.captured', version: 'v3.0.0', status: 'active',     createdAt: '2026-04-22', publishedBy: 'Admin User',           transformations: 72100,  checksum: 'sha256:e91cc1d', notes: 'Production payment capture mapping.',                         rules: ['Number coercion amount', 'Enum map capture status'] },
    { id: 'm8', partner: 'crm-connect',       eventType: 'customer.updated', version: 'v2.0.0', status: 'deprecated', createdAt: '2026-01-10', publishedBy: 'Platform Operator',    transformations: 18900,  checksum: 'sha256:cba991f', notes: 'Deprecated CRM sync mapping.',                               rules: ['Combine first and last name', 'Lowercase email'] }
  ]);

  readonly mappings = this._mappings.asReadonly();

  // ── Computed (reads signals — reactive) ───────────────────────────────────
  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const sf = this.statusFilter();
    return this._mappings().filter(m => {
      const matchesSearch = !q || m.partner.includes(q) || m.eventType.includes(q) || m.version.toLowerCase().includes(q);
      const matchesStatus = sf === 'all' || m.status === sf;
      return matchesSearch && matchesStatus;
    });
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  openDetails(mapping: MappingVersion): void {
    this.selectedMapping.set(mapping);
    this.detailVisible = true;
  }

  deprecate(mapping: MappingVersion, event: Event): void {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      header: this.t('mappings.deprecateTitle'),
      message: this.t('mappings.deprecateMessage', { version: `${mapping.partner}/${mapping.eventType}@${mapping.version}` }),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t('mappings.deprecate'),
      rejectLabel: this.t('mappings.cancel'),
      accept: () => {
        this._mappings.update(list => list.map(m => m.id === mapping.id ? { ...m, status: 'deprecated' } : m));
        this.toast.add({ severity: 'warn', summary: this.t('mappings.toast.deprecated'), detail: mapping.version });
        const sel = this.selectedMapping();
        if (sel?.id === mapping.id) this.selectedMapping.set({ ...sel, status: 'deprecated' });
      }
    });
  }

  delete(mapping: MappingVersion, event: Event): void {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      header: this.t('mappings.deleteTitle'),
      message: this.t('mappings.deleteMessage', { version: `${mapping.partner}/${mapping.eventType}@${mapping.version}` }),
      icon: 'pi pi-trash',
      acceptLabel: this.t('mappings.delete'),
      rejectLabel: this.t('mappings.cancel'),
      accept: () => {
        this._mappings.update(list => list.filter(m => m.id !== mapping.id));
        this.toast.add({ severity: 'success', summary: this.t('mappings.toast.deleted'), detail: mapping.version });
        if (this.selectedMapping()?.id === mapping.id) this.detailVisible = false;
      }
    });
  }

  exportCsv(): void {
    const header = 'partner,eventType,version,status,transformations,createdAt,publishedBy';
    const rows = this.filtered()
      .map(m => `"${m.partner}","${m.eventType}","${m.version}","${m.status}",${m.transformations},"${m.createdAt}","${m.publishedBy}"`)
      .join('\n');
    const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mappings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.add({ severity: 'info', summary: this.t('mappings.toast.exported'), detail: `${this.filtered().length} rows` });
  }

  getSeverity(status: string): 'success' | 'warn' | 'secondary' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'secondary' | 'danger'> = {
      active: 'success', draft: 'warn', deprecated: 'secondary'
    };
    return map[status] ?? 'secondary';
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.i18n.translate(key, params);
  }
}
