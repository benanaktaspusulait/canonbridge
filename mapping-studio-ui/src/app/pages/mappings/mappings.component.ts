import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
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
import { PartnerService, Partner } from '../../core/services/partner.service';

interface MappingVersion {
  id: string;
  partner: string;
  eventType: string;
  sourceType: string;
  method?: string;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  createdAt: string;
  publishedBy: string;
  transformations: number;
  checksum: string;
  notes: string;
  rules: string[];
  lastTestStatus?: 'SUCCESS' | 'ERROR' | 'NEVER';
  lastTestAt?: string;
  successRate?: number;
}

@Component({
  selector: 'app-mappings',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DecimalPipe,
    JsonPipe,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
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
  private readonly partnerService = inject(PartnerService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly loading = signal(false);
  private readonly partners = signal<Map<string, string>>(new Map());

  // ── Signals (reactive) ────────────────────────────────────────────────────
  readonly search = signal('');
  readonly statusFilter = signal<string>('all');
  readonly sourceTypeFilter = signal<string>('all');
  detailVisible = false;
  templateDialogVisible = false;
  readonly selectedMapping = signal<MappingVersion | null>(null);
  readonly mappingVersions = signal<any[]>([]);
  readonly selectedMappings = signal<MappingVersion[]>([]);
  readonly templates = signal<any[]>([]);
  readonly versionDiff = signal<any | null>(null);
  readonly executionSeries = signal<any[]>([]);
  readonly executionLogs = signal<any[]>([]);

  readonly statusFilterOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active',       value: 'active' },
    { label: 'Draft',        value: 'draft' },
    { label: 'Deprecated',   value: 'deprecated' },
  ];

  readonly sourceTypeFilterOptions = signal<Array<{ label: string; value: string }>>([
    { label: 'All types', value: 'all' }
  ]);

  private readonly _mappings = signal<MappingVersion[]>([]);

  readonly mappings = this._mappings.asReadonly();

  // ── Computed (reads signals — reactive) ───────────────────────────────────
  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const sf = this.statusFilter();
    const stf = this.sourceTypeFilter();
    return this._mappings().filter(m => {
      const matchesSearch = !q || m.partner.includes(q) || m.eventType.includes(q) || m.version.toLowerCase().includes(q) || m.sourceType.toLowerCase().includes(q);
      const matchesStatus = sf === 'all' || m.status === sf;
      const matchesSourceType = stf === 'all' || m.sourceType === stf;
      return matchesSearch && matchesStatus && matchesSourceType;
    });
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadPartners();
  }

  private loadPartners(): void {
    this.partnerService.list().subscribe({
      next: (partners) => {
        const map = new Map<string, string>();
        partners.forEach(p => {
          if (p.id) {
            map.set(p.id, p.name || p.id);
          }
        });
        this.partners.set(map);
        // Load mappings after partners are loaded
        this.loadMappings();
      },
      error: () => {
        this.partners.set(new Map());
        // Load mappings even if partners fail
        this.loadMappings();
      }
    });
  }

  loadMappings(): void {
    this.loading.set(true);
    this.mappingService.list().subscribe({
      next: (drafts) => {
        if (!drafts) {
          this._mappings.set([]);
          this.loading.set(false);
          return;
        }
        const mappings = Array.isArray(drafts) ? drafts : [];
        const mapped = mappings.map(d => this.draftToViewModel(d));
        this._mappings.set(mapped);
        this.selectedMappings.set([]);
        
        // Build source type filter options from unique source types
        const uniqueSourceTypes = new Set(mapped.map(m => m.sourceType).filter(Boolean));
        const sourceTypeOptions = [
          { label: 'All types', value: 'all' },
          ...Array.from(uniqueSourceTypes).sort().map(type => ({ label: type, value: type }))
        ];
        this.sourceTypeFilterOptions.set(sourceTypeOptions);
        
        this.loading.set(false);
        
        // Load execution stats for each mapping
        this.loadExecutionStats(mapped);
      },
      error: () => {
        this._mappings.set([]);
        this.loading.set(false);
      }
    });
  }

  private loadExecutionStats(mappings: MappingVersion[]): void {
    for (const mapping of mappings) {
      if (!mapping.id) continue;
      this.http.get<any>(`/api/proxy/${mapping.id}/stats`, {
        headers: { 'X-Tenant-Id': 'tenant-acme' }
      }).subscribe({
        next: (stats) => {
          if (stats && stats.total > 0) {
            this._mappings.update(list => list.map(m => {
              if (m.id === mapping.id) {
                return {
                  ...m,
                  lastTestStatus: stats.errors > 0 ? 'ERROR' : 'SUCCESS',
                  successRate: stats.successRate
                };
              }
              return m;
            }));
          }
        },
        error: () => {} // Silently ignore stats errors
      });
    }
  }

  private draftToViewModel(d: MappingDraft): MappingVersion {
    const partnerName = d.partner_id ? this.partners().get(d.partner_id) : undefined;
    
    // Extract method from source_config if rest_api_method is not set
    let method = d.rest_api_method;
    if (!method && d.source_config) {
      try {
        const sourceConfig = JSON.parse(d.source_config);
        method = sourceConfig.method;
      } catch {
        // Ignore parse errors
      }
    }
    
    return {
      id: d.id ?? '',
      partner: partnerName ?? d.partner_id ?? 'Unknown Partner',
      eventType: d.event_type ?? '',
      sourceType: this.formatSourceType(d.source_type),
      method: method,
      version: d.status === 'DRAFT' ? 'draft' : d.status === 'READY_TO_PUBLISH' ? 'published' : 'draft',
      status: this.mapDraftStatus(d.status),
      createdAt: d.created_at ? d.created_at.slice(0, 10) : '',
      publishedBy: this.formatUserName(d.created_by),
      transformations: 0,
      checksum: d.id ? `draft:${d.id.slice(0, 7)}` : '',
      notes: d.description ?? '',
      rules: d.mapping_rules ? this.parseRuleNames(d.mapping_rules) : []
    };
  }

  private formatSourceType(sourceType?: string): string {
    if (!sourceType) return 'Unknown';
    // Convert REST_API to REST API, KAFKA to Kafka, etc.
    return sourceType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private formatUserName(userId?: string): string {
    if (!userId) return 'Unknown';
    
    // If it's a UUID (contains dashes and is 36 chars), return "System"
    if (userId.includes('-') && userId.length === 36) {
      return 'System';
    }
    
    // If it's an email, extract the name part before @
    if (userId.includes('@')) {
      const namePart = userId.split('@')[0];
      // Convert john.doe or john_doe to John Doe
      return namePart
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // If it's already a name, just return it
    return userId;
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
    this.versionDiff.set(null);
    this.loadMappingVersions(mapping.id);
    this.loadMappingHealthDetail(mapping.id);
  }

  private loadMappingVersions(mappingId: string): void {
    this.http.get<any[]>(`/api/mapping-versions`, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: (versions) => {
        // Filter versions for this draft
        const filtered = versions.filter((v: any) => v.draft_id === mappingId);
        this.mappingVersions.set(filtered);
      },
      error: () => this.mappingVersions.set([])
    });
  }

  private loadMappingHealthDetail(mappingId: string): void {
    this.http.get<any[]>(`/api/proxy/${mappingId}/series`, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: (series) => this.executionSeries.set(series ?? []),
      error: () => this.executionSeries.set([])
    });

    this.http.get<any[]>(`/api/proxy/${mappingId}/logs`, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: (logs) => this.executionLogs.set((logs ?? []).slice(0, 50)),
      error: () => this.executionLogs.set([])
    });
  }

  openInStudio(mapping: MappingVersion): void {
    void this.router.navigate(['/wizard'], { queryParams: { mappingId: mapping.id } });
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
        this.http.post(`/api/mapping-drafts/bulk/deprecate`, { ids: [mapping.id] }, {
          headers: { 'X-Tenant-Id': 'tenant-acme' }
        }).subscribe({
          next: () => {
            this._mappings.update(list => list.map(m => m.id === mapping.id ? { ...m, status: 'deprecated' } : m));
            this.toast.add({ severity: 'warn', summary: this.t('mappings.toast.deprecated'), detail: mapping.version });
            const sel = this.selectedMapping();
            if (sel?.id === mapping.id) this.selectedMapping.set({ ...sel, status: 'deprecated' });
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to deprecate mapping' })
        });
      }
    });
  }

  importMapping(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    file.text().then(content => {
      const payload = JSON.parse(content);
      this.http.post(`/api/mapping-drafts/import`, payload, {
        headers: { 'X-Tenant-Id': 'tenant-acme' }
      }).subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Imported', detail: file.name });
          this.loadMappings();
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Import failed', detail: file.name })
      });
    }).catch(() => this.toast.add({ severity: 'error', summary: 'Import failed', detail: 'Invalid JSON file' }))
      .finally(() => input.value = '');
  }

  exportMapping(mapping: MappingVersion): void {
    this.http.get<any>(`/api/mapping-drafts/${mapping.id}/export`, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: (draft) => this.downloadJson(draft, `mapping-${mapping.eventType || mapping.id}.json`),
      error: () => this.toast.add({ severity: 'error', summary: 'Export failed', detail: mapping.eventType })
    });
  }

  cloneMapping(mapping: MappingVersion): void {
    this.http.post(`/api/mapping-drafts/${mapping.id}/clone`, {}, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Cloned', detail: mapping.eventType });
        this.loadMappings();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Clone failed', detail: mapping.eventType })
    });
  }

  bulkPublish(): void {
    const ids = this.selectedMappings().map(m => m.id);
    if (ids.length === 0) return;
    this.http.post(`/api/mapping-drafts/bulk/publish`, { ids }, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Published', detail: `${ids.length} mappings` });
        this.loadMappings();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Bulk publish failed' })
    });
  }

  bulkDeprecate(): void {
    const ids = this.selectedMappings().map(m => m.id);
    if (ids.length === 0) return;
    this.http.post(`/api/mapping-drafts/bulk/deprecate`, { ids }, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: () => {
        this.toast.add({ severity: 'warn', summary: 'Deprecated', detail: `${ids.length} mappings` });
        this.loadMappings();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Bulk deprecate failed' })
    });
  }

  loadTemplates(): void {
    this.http.get<any[]>(`/api/mapping-templates`).subscribe({
      next: (templates) => {
        this.templates.set(templates ?? []);
        this.templateDialogVisible = true;
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Templates unavailable' })
    });
  }

  createFromTemplate(template: any): void {
    this.http.post(`/api/mapping-drafts/import`, template.draft, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: () => {
        this.templateDialogVisible = false;
        this.toast.add({ severity: 'success', summary: 'Template created', detail: template.name });
        this.loadMappings();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Template failed', detail: template.name })
    });
  }

  compareLatestVersions(): void {
    const versions = [...this.mappingVersions()].sort((a, b) => Number(b.version ?? 0) - Number(a.version ?? 0));
    if (versions.length < 2) return;
    this.http.get<any>(`/api/mapping-versions/${versions[0].id}/diff/${versions[1].id}`, {
      headers: { 'X-Tenant-Id': 'tenant-acme' }
    }).subscribe({
      next: (diff) => this.versionDiff.set(diff),
      error: () => this.toast.add({ severity: 'error', summary: 'Diff failed' })
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
    const header = 'partner,eventType,sourceType,method,version,status,transformations,createdAt,publishedBy';
    const rows = this.filtered()
      .map(m => `"${m.partner}","${m.eventType}","${m.sourceType}","${m.method ?? ''}","${m.version}","${m.status}",${m.transformations},"${m.createdAt}","${m.publishedBy}"`)
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

  private downloadJson(payload: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.add({ severity: 'info', summary: this.t('mappings.toast.exported'), detail: filename });
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
