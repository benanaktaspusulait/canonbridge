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
import { EmptyStateComponent } from '../../core/components/empty-state.component';
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
    EmptyStateComponent,
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
export class MappingsComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  private readonly mappingService = inject(MappingService);

  readonly loading = signal(false);

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

  private readonly _mappings = signal<MappingVersion[]>([]);

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

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadMappings();
  }

  loadMappings(): void {
    this.loading.set(true);
    this.mappingService.list().subscribe({
      next: (drafts) => {
        const mapped = drafts.map(d => this.draftToViewModel(d));
        this._mappings.set(mapped);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private draftToViewModel(d: MappingDraft): MappingVersion {
    return {
      id: d.id ?? '',
      partner: d.partner_id ?? '',
      eventType: d.event_type ?? '',
      version: d.status === 'DRAFT' ? 'draft' : 'v1.0.0',
      status: this.mapDraftStatus(d.status),
      createdAt: d.created_at ? d.created_at.slice(0, 10) : '',
      publishedBy: d.created_by ?? '',
      transformations: 0,
      checksum: d.id ? `draft:${d.id.slice(0, 7)}` : '',
      notes: d.description ?? '',
      rules: d.mapping_rules ? this.parseRuleNames(d.mapping_rules) : []
    };
  }

  private mapDraftStatus(status?: string): 'active' | 'draft' | 'deprecated' {
    if (status === 'READY_TO_PUBLISH' || status === 'VALID') return 'active';
    if (status === 'INVALID') return 'deprecated';
    return 'draft';
  }

  private parseRuleNames(rulesJson: string): string[] {
    try {
      const parsed = JSON.parse(rulesJson);
      if (Array.isArray(parsed)) return parsed.map((r: { name?: string }) => r.name ?? '').filter(Boolean);
    } catch { /* empty */ }
    return [];
  }

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
        this.mappingService.delete(mapping.id).subscribe({
          next: () => {
            this._mappings.update(list => list.filter(m => m.id !== mapping.id));
            this.toast.add({ severity: 'success', summary: this.t('mappings.toast.deleted'), detail: mapping.version });
            if (this.selectedMapping()?.id === mapping.id) this.detailVisible = false;
          },
          error: () => {
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete mapping' });
          }
        });
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
