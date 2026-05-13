import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
import { DlqService } from '../../core/services/dlq.service';

interface DlqMessage {
  id: string;
  partner: string;
  eventType: string;
  errorType: string;
  errorMessage: string;
  attempts: number;
  firstFailed: string;
  lastFailed: string;
  payload: string;
  traceId: string;
  stackTrace: string;
}

@Component({
  selector: 'app-dlq',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule, CardModule, ConfirmDialogModule, DrawerModule,
    InputTextModule, SelectModule,
    TableModule, TagModule, ToastModule, TooltipModule,
    I18nPipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dlq.component.html',
  styleUrl: './dlq.component.scss'
})
export class DlqComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  private readonly dlqService = inject(DlqService);
  private readonly router = inject(Router);

  selected: DlqMessage[] = [];
  inspectorVisible = false;
  readonly inspected = signal<DlqMessage | null>(null);
  readonly loading = signal(false);
  private readonly studioImportKey = 'canonbridge:external-systems:selected-sample';

  private readonly _messages = signal<DlqMessage[]>([]);

  readonly messages = this._messages.asReadonly();
  readonly searchText = signal('');
  readonly partnerFilter = signal('All');
  readonly errorFilter = signal('All');
  readonly dateFilter = signal('All');

  readonly partnerOptions = computed(() =>
    ['All', ...Array.from(new Set(this._messages().map(msg => msg.partner))).sort()]
  );
  readonly errorOptions = computed(() =>
    ['All', ...Array.from(new Set(this._messages().map(msg => msg.errorType))).sort()]
  );
  readonly dateOptions = computed(() =>
    ['All', ...Array.from(new Set(this._messages().map(msg => msg.firstFailed.slice(0, 10)))).sort().reverse()]
  );
  readonly filteredMessages = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    return this._messages().filter(msg => {
      const matchesQuery = !query || [
        msg.id,
        msg.partner,
        msg.eventType,
        msg.errorType,
        msg.errorMessage,
        msg.traceId
      ].some(value => value.toLowerCase().includes(query));
      return (
        matchesQuery &&
        (this.partnerFilter() === 'All' || msg.partner === this.partnerFilter()) &&
        (this.errorFilter() === 'All' || msg.errorType === this.errorFilter()) &&
        (this.dateFilter() === 'All' || msg.firstFailed.startsWith(this.dateFilter()))
      );
    });
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.dlqService.listMessages(100, 0).subscribe({
      next: (apiMessages) => {
        // Handle null/undefined response defensively
        if (!apiMessages) {
          this._messages.set([]);
          this.loading.set(false);
          return;
        }
        const messages = Array.isArray(apiMessages) ? apiMessages : [];
        // Map API messages to UI format
        const uiMessages: DlqMessage[] = messages.map(msg => ({
          id: msg.id,
          partner: this.extractPartnerFromTopic(msg.originalTopic),
          eventType: this.extractEventTypeFromPayload(msg.payload),
          errorType: this.categorizeError(msg.errorMessage || ''),
          errorMessage: msg.errorMessage || 'Unknown error',
          attempts: msg.retryCount,
          firstFailed: this.formatTimestamp(msg.failedAt),
          lastFailed: this.formatTimestamp(msg.redriveAttemptedAt || msg.failedAt),
          payload: msg.payload,
          traceId: msg.key || msg.id,
          stackTrace: msg.errorStackTrace || ''
        }));
        this._messages.set(uiMessages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load DLQ messages:', err);
        this.toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load DLQ messages' 
        });
        this._messages.set([]);
        this.loading.set(false);
      }
    });
  }

  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch {
      return timestamp;
    }
  }

  private extractPartnerFromTopic(topic: string): string {
    // Extract partner from topic like "partner.shopmax.raw"
    const parts = topic.split('.');
    return parts.length > 1 ? parts[1] : 'unknown';
  }

  private extractEventTypeFromPayload(payload: string): string {
    try {
      const parsed = JSON.parse(payload);
      return parsed.eventType || parsed.type || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private categorizeError(errorMessage: string): string {
    const msg = errorMessage.toLowerCase();
    if (msg.includes('schema') || msg.includes('validation')) return 'SCHEMA_VALIDATION';
    if (msg.includes('transformation') || msg.includes('mapping')) return 'TRANSFORMATION_ERROR';
    if (msg.includes('downstream') || msg.includes('503') || msg.includes('timeout')) return 'DOWNSTREAM_ERROR';
    return 'UNKNOWN_ERROR';
  }

  // ── Inspect ───────────────────────────────────────────────────────────────

  inspect(msg: DlqMessage): void {
    this.inspected.set(msg);
    this.inspectorVisible = true;
  }

  createFixDraft(msg: DlqMessage): void {
    const parsed = this.parsePayload(msg.payload);
    if (parsed === null) {
      this.toast.add({
        severity: 'error',
        summary: this.t('dlq.toast.fixDraftFailed'),
        detail: msg.id
      });
      return;
    }

    const sampleJson = JSON.stringify(parsed, null, 2);
    localStorage.setItem(this.studioImportKey, JSON.stringify({
      sourceType: 'manual',
      sampleJson,
      connectionName: `${msg.partner} ${msg.eventType} DLQ fix`,
      partner: msg.partner,
      eventType: msg.eventType,
      dlqId: msg.id,
      traceId: msg.traceId,
      errorType: msg.errorType,
      errorMessage: msg.errorMessage
    }));
    this.toast.add({
      severity: 'success',
      summary: this.t('dlq.toast.fixDraftReady'),
      detail: msg.id,
      life: 2500
    });
    void this.router.navigate(['/studio']);
  }

  // ── Redrive ───────────────────────────────────────────────────────────────

  redriveMessage(msg: DlqMessage): void {
    if (this.parsePayload(msg.payload) === null) {
      this.toast.add({ severity: 'error', summary: this.t('dlq.toast.redriveFailed'), detail: msg.id });
      return;
    }
    
    this.loading.set(true);
    this.dlqService.redriveMessage(msg.id).subscribe({
      next: () => {
        this.removeMessages([msg.id]);
        this.toast.add({ severity: 'success', summary: this.t('dlq.toast.redriven'), detail: msg.id });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to redrive message:', err);
        this.toast.add({ 
          severity: 'error', 
          summary: 'Redrive Failed', 
          detail: `Failed to redrive message ${msg.id}` 
        });
        this.loading.set(false);
      }
    });
  }

  redriveSelected(): void {
    if (!this.selected.length) return;
    const ids = this.selected.map(m => m.id);
    this.removeMessages(ids);
    this.toast.add({ severity: 'success', summary: this.t('dlq.toast.redriven'), detail: this.t('dlq.toast.count', { count: ids.length }) });
  }

  redriveAll(): void {
    const ids = this.filteredMessages().map(m => m.id);
    if (!ids.length) return;
    this.removeMessages(ids);
    this.toast.add({ severity: 'success', summary: this.t('dlq.toast.redrivenAll'), detail: this.t('dlq.toast.count', { count: ids.length }) });
  }

  // ── Discard ───────────────────────────────────────────────────────────────

  confirmDiscard(msg: DlqMessage, event: Event): void {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      header: this.t('dlq.discardTitle'),
      message: this.t('dlq.discardMessage', { id: msg.id }),
      icon: 'pi pi-trash',
      acceptLabel: this.t('dlq.discard'),
      rejectLabel: this.t('dlq.cancel'),
      accept: () => {
        this.removeMessages([msg.id]);
        this.toast.add({ severity: 'warn', summary: this.t('dlq.toast.discarded'), detail: msg.id });
      }
    });
  }

  confirmDiscardSelected(event: Event): void {
    if (!this.selected.length) return;
    const count = this.selected.length;
    this.confirmation.confirm({
      target: event.target as EventTarget,
      header: this.t('dlq.discardSelectedTitle'),
      message: this.t('dlq.discardSelectedMessage', { count }),
      icon: 'pi pi-trash',
      acceptLabel: this.t('dlq.discard'),
      rejectLabel: this.t('dlq.cancel'),
      accept: () => {
        const ids = this.selected.map(m => m.id);
        this.removeMessages(ids);
        this.toast.add({ severity: 'warn', summary: this.t('dlq.toast.discarded'), detail: this.t('dlq.toast.count', { count }) });
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getErrorSeverity(type: string): 'danger' | 'warn' | 'info' {
    if (type === 'SCHEMA_VALIDATION')  return 'danger';
    if (type === 'TRANSFORMATION_ERROR') return 'warn';
    return 'info';
  }

  prettyPayload(payload: string): string {
    const parsed = this.parsePayload(payload);
    return parsed ? JSON.stringify(parsed, null, 2) : payload;
  }

  private removeMessages(ids: string[]): void {
    const idSet = new Set(ids);
    this._messages.update(list => list.filter(m => !idSet.has(m.id)));
    this.selected = this.selected.filter(m => !idSet.has(m.id));
    if (this.inspected() && idSet.has(this.inspected()!.id)) {
      this.inspectorVisible = false;
      this.inspected.set(null);
    }
  }

  private parsePayload(payload: string): unknown | null {
    try { return JSON.parse(payload); } catch { return null; }
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.i18n.translate(key, params);
  }
}
