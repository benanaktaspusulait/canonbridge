import { Component, computed, inject, signal } from '@angular/core';
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
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

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
export class DlqComponent {
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);

  selected: DlqMessage[] = [];
  inspectorVisible = false;
  readonly inspected = signal<DlqMessage | null>(null);

  private readonly _messages = signal<DlqMessage[]>([
    {
      id: 'dlq-001', partner: 'payment-gateway',  eventType: 'payment.captured',
      errorType: 'SCHEMA_VALIDATION',
      errorMessage: 'Required field "amount" is missing from payload',
      attempts: 3, firstFailed: '2026-05-10 13:45', lastFailed: '2026-05-10 14:15',
      payload: '{"transactionId":"txn-999","currency":"USD"}',
      traceId: 'trc-pay-13f45',
      stackTrace: 'SchemaValidationError: required property amount\n  at validateCanonicalPayment (mapping-runtime.js:88)\n  at transformPaymentCaptured (payment.captured.v2.js:42)\n  at DlqWriter.captureFailure (dlq-writer.js:19)'
    },
    {
      id: 'dlq-002', partner: 'payment-gateway',  eventType: 'payment.captured',
      errorType: 'TRANSFORMATION_ERROR',
      errorMessage: 'Mapping rule evaluation failed — missing field reference',
      attempts: 3, firstFailed: '2026-05-10 12:30', lastFailed: '2026-05-10 13:00',
      payload: '{"transactionId":"txn-888","amount":null}',
      traceId: 'trc-pay-12a30',
      stackTrace: 'TransformationError: source path $.amount.value resolved to undefined\n  at evaluateJsonataRule (rule-engine.js:131)\n  at executeMappingRules (rule-engine.js:62)\n  at DlqWriter.captureFailure (dlq-writer.js:19)'
    },
    {
      id: 'dlq-003', partner: 'acme-marketplace', eventType: 'order.created',
      errorType: 'SCHEMA_VALIDATION',
      errorMessage: 'Field "customer.email" does not match format "email"',
      attempts: 1, firstFailed: '2026-05-10 11:00', lastFailed: '2026-05-10 11:00',
      payload: '{"orderId":"ORD-777","customer":{"email":"not-an-email"}}',
      traceId: 'trc-acme-1100',
      stackTrace: 'SchemaValidationError: customer.email failed email format\n  at validateOrderCreated (schema-validator.js:74)\n  at executeMappingRules (rule-engine.js:58)\n  at DlqWriter.captureFailure (dlq-writer.js:19)'
    },
    {
      id: 'dlq-004', partner: 'acme-marketplace', eventType: 'order.created',
      errorType: 'DOWNSTREAM_ERROR',
      errorMessage: 'Business service returned 503 after 3 retries',
      attempts: 3, firstFailed: '2026-05-10 09:15', lastFailed: '2026-05-10 09:45',
      payload: '{"orderId":"ORD-666","status":"A"}',
      traceId: 'trc-acme-0945',
      stackTrace: 'DownstreamError: HTTP 503 from order-business-service\n  at postCanonicalOrder (publisher.js:52)\n  at retryWithBackoff (retry.js:37)\n  at DlqWriter.captureFailure (dlq-writer.js:19)'
    }
  ]);

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

  // ── Inspect ───────────────────────────────────────────────────────────────

  inspect(msg: DlqMessage): void {
    this.inspected.set(msg);
    this.inspectorVisible = true;
  }

  // ── Redrive ───────────────────────────────────────────────────────────────

  redriveMessage(msg: DlqMessage): void {
    if (this.parsePayload(msg.payload) === null) {
      this.toast.add({ severity: 'error', summary: this.t('dlq.toast.redriveFailed'), detail: msg.id });
      return;
    }
    this.removeMessages([msg.id]);
    this.toast.add({ severity: 'success', summary: this.t('dlq.toast.redriven'), detail: msg.id });
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
