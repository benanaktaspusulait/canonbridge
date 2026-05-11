import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

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
  method: 'GET' | 'POST' | 'PUT';
  url: string;
  authType: 'None' | 'API Key' | 'Basic Auth' | 'OAuth2';
  timeoutMs: number;
}

interface ExternalCallRecord {
  id: string;
  connectionId: string;
  at: string;
  status: number;
  durationMs: number;
  result: 'success' | 'failed';
  message: string;
  requestId: string;
}

type ConnectionForm = Omit<ExternalConnection, 'id' | 'status' | 'successRate' | 'avgMs' | 'p95Ms' | 'lastError' | 'lastSuccess' | 'calls24h'> & { id?: string };

const EMPTY_FORM: ConnectionForm = {
  name: '',
  partner: '',
  eventType: '',
  type: 'REST',
  environment: 'Sandbox',
  method: 'GET',
  url: 'https://api.example.com/orders',
  authType: 'None',
  timeoutMs: 5000
};

@Component({
  selector: 'app-external-systems',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    DrawerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    I18nPipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './external-systems.component.html',
  styleUrl: './external-systems.component.scss'
})
export class ExternalSystemsComponent {
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);

  private readonly _connections = signal<ExternalConnection[]>([
    { id: 'conn-carrier-orders',  name: 'Carrier A Orders',      partner: 'ACME Marketplace',  eventType: 'OrderCreated',      type: 'REST',           environment: 'Production', status: 'healthy',  successRate: 99.2, avgMs: 184,  p95Ms: 312,  lastError: '—',                              lastSuccess: '2 min ago',  calls24h: 1842, method: 'GET',  url: 'https://carrier-a.example.com/orders',       authType: 'OAuth2',    timeoutMs: 5000  },
    { id: 'conn-shopify-webhook', name: 'Shopify Order Webhook',  partner: 'Shopify',           eventType: 'OrderCreated',      type: 'Webhook',        environment: 'Production', status: 'healthy',  successRate: 100,  avgMs: 22,   p95Ms: 48,   lastError: '—',                              lastSuccess: '1 min ago',  calls24h: 923,  method: 'POST', url: 'https://hooks.shopify.example.com/orders',   authType: 'API Key',   timeoutMs: 3000  },
    { id: 'conn-soap-tracking',   name: 'SOAP Tracking Lookup',   partner: 'Logistics Xpress',  eventType: 'ShipmentUpdated',   type: 'SOAP',           environment: 'Sandbox',    status: 'degraded', successRate: 91.1, avgMs: 640,  p95Ms: 1220, lastError: 'SOAP fault: invalid tracking number', lastSuccess: '16 min ago', calls24h: 418,  method: 'POST', url: 'https://soap.logistics.example.com/tracking', authType: 'Basic Auth', timeoutMs: 8000 },
    { id: 'conn-payment-risk',    name: 'Payment Risk Score',     partner: 'Payment Gateway',   eventType: 'PaymentAuthorized', type: 'REST',           environment: 'Production', status: 'down',     successRate: 72.4, avgMs: 1800, p95Ms: 3200, lastError: 'HTTP 503 after 3 attempts',           lastSuccess: '48 min ago', calls24h: 212,  method: 'POST', url: 'https://risk.payment.example.com/score',     authType: 'OAuth2',    timeoutMs: 10000 }
  ]);

  readonly connections = this._connections.asReadonly();
  readonly testingId = signal<string | null>(null);
  readonly selectedConnection = signal<ExternalConnection | null>(null);
  detailVisible = false;

  private readonly _callHistory = signal<ExternalCallRecord[]>([
    { id: 'call-1', connectionId: 'conn-carrier-orders', at: '2 min ago', status: 200, durationMs: 184, result: 'success', message: 'Orders page fetched', requestId: 'req-car-1842' },
    { id: 'call-2', connectionId: 'conn-carrier-orders', at: '9 min ago', status: 200, durationMs: 221, result: 'success', message: 'Orders page fetched', requestId: 'req-car-1841' },
    { id: 'call-3', connectionId: 'conn-soap-tracking', at: '16 min ago', status: 500, durationMs: 1220, result: 'failed', message: 'SOAP fault: invalid tracking number', requestId: 'req-soap-418' },
    { id: 'call-4', connectionId: 'conn-payment-risk', at: '48 min ago', status: 503, durationMs: 3200, result: 'failed', message: 'HTTP 503 after 3 attempts', requestId: 'req-risk-212' }
  ]);
  readonly callHistory = this._callHistory.asReadonly();
  readonly selectedHistory = computed(() => {
    const selected = this.selectedConnection();
    if (!selected) return [];
    return this._callHistory().filter(row => row.connectionId === selected.id).slice(0, 12);
  });

  // ── Filters as signals (reactive) ─────────────────────────────────────────
  readonly partnerFilter    = signal('All');
  readonly typeFilter       = signal('All');
  readonly environmentFilter = signal('All');

  readonly typeOptions        = ['All', 'REST', 'SOAP', 'Webhook', 'Scheduled Poll'];
  readonly environmentOptions = ['All', 'Production', 'Sandbox'];
  readonly formTypeOptions    = ['REST', 'SOAP', 'Webhook', 'Scheduled Poll'];
  readonly methodOptions      = ['GET', 'POST', 'PUT'];
  readonly authOptions        = ['None', 'API Key', 'Basic Auth', 'OAuth2'];

  readonly partnerOptions = computed(() =>
    ['All', ...Array.from(new Set(this._connections().map(c => c.partner))).sort()]
  );

  readonly filteredConnections = computed(() =>
    this._connections().filter(c =>
      (this.partnerFilter()    === 'All' || c.partner     === this.partnerFilter()) &&
      (this.typeFilter()       === 'All' || c.type        === this.typeFilter()) &&
      (this.environmentFilter() === 'All' || c.environment === this.environmentFilter())
    )
  );

  readonly totals = computed(() => {
    const list = this.filteredConnections();
    return {
      healthy:  list.filter(c => c.status === 'healthy').length,
      degraded: list.filter(c => c.status === 'degraded').length,
      down:     list.filter(c => c.status === 'down').length,
      calls:    list.reduce((sum, c) => sum + c.calls24h, 0)
    };
  });

  // ── Dialog state ──────────────────────────────────────────────────────────
  dialogVisible = false;
  isEdit = false;
  form: ConnectionForm = { ...EMPTY_FORM };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  openAdd(): void {
    this.isEdit = false;
    this.form = { ...EMPTY_FORM };
    this.dialogVisible = true;
  }

  openEdit(connection: ExternalConnection): void {
    this.isEdit = true;
    const { id, name, partner, eventType, type, environment, method, url, authType, timeoutMs } = connection;
    this.form = { id, name, partner, eventType, type, environment, method, url, authType, timeoutMs };
    this.dialogVisible = true;
  }

  save(): void {
    if (!this.formValid) {
      this.toast.add({ severity: 'warn', summary: this.t('externalSystems.toast.invalidTitle'), detail: this.t('externalSystems.toast.invalidDetail') });
      return;
    }

    if (this.isEdit && this.form.id) {
      this._connections.update(list =>
        list.map(c => c.id === this.form.id ? { ...c, ...this.form } as ExternalConnection : c)
      );
      this.toast.add({ severity: 'success', summary: this.t('externalSystems.toast.updated'), detail: this.form.name });
    } else {
      const connection: ExternalConnection = {
        id: `conn-${Date.now()}`,
        ...this.form,
        status: 'notTested',
        successRate: null,
        avgMs: null,
        p95Ms: null,
        lastError: '—',
        lastSuccess: '—',
        calls24h: 0
      };
      this._connections.update(list => [connection, ...list]);
      this.toast.add({ severity: 'success', summary: this.t('externalSystems.toast.created'), detail: connection.name });
    }

    this.dialogVisible = false;
  }

  confirmDelete(connection: ExternalConnection, event: Event): void {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      header: this.t('externalSystems.deleteTitle'),
      message: this.t('externalSystems.deleteMessage', { name: connection.name }),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t('externalSystems.delete'),
      rejectLabel: this.t('externalSystems.cancel'),
      accept: () => {
        this._connections.update(list => list.filter(c => c.id !== connection.id));
        this.toast.add({ severity: 'warn', summary: this.t('externalSystems.toast.deleted'), detail: connection.name });
      }
    });
  }

  openDetail(connection: ExternalConnection): void {
    this.selectedConnection.set(connection);
    this.detailVisible = true;
  }

  test(connection: ExternalConnection): void {
    if (this.testingId()) return;
    this.testingId.set(connection.id);

    setTimeout(() => {
      const validUrl = /^https?:\/\//.test(connection.url);
      const latency = validUrl ? this.latencyFor(connection) : null;
      const nextStatus: ExternalConnection['status'] = !validUrl ? 'down' : latency! > 900 ? 'degraded' : 'healthy';

      this._connections.update(list => list.map(c => c.id === connection.id ? {
        ...c,
        status: nextStatus,
        successRate: validUrl ? (nextStatus === 'healthy' ? 99.7 : 92.4) : 0,
        avgMs: latency,
        p95Ms: latency ? Math.round(latency * 1.7) : null,
        lastError: validUrl ? '—' : this.t('externalSystems.toast.invalidUrl'),
        lastSuccess: validUrl ? this.t('externalSystems.justNow') : c.lastSuccess,
        calls24h: c.calls24h + 1
      } : c));

      this._callHistory.update(rows => [{
        id: `call-${Date.now()}`,
        connectionId: connection.id,
        at: this.t('externalSystems.justNow'),
        status: validUrl ? 200 : 0,
        durationMs: latency ?? 0,
        result: validUrl ? 'success' : 'failed',
        message: validUrl ? this.t('externalSystems.history.demoSuccess') : this.t('externalSystems.toast.invalidUrl'),
        requestId: `req-${Math.random().toString(36).slice(2, 8)}`
      }, ...rows]);

      if (this.selectedConnection()?.id === connection.id) {
        const updated = this._connections().find(c => c.id === connection.id) ?? null;
        this.selectedConnection.set(updated);
      }

      this.toast.add({
        severity: validUrl ? 'success' : 'error',
        summary: validUrl ? this.t('externalSystems.toast.testPassed') : this.t('externalSystems.toast.testFailed'),
        detail: validUrl ? `${connection.name} · ${latency}ms` : connection.url
      });
      this.testingId.set(null);
    }, 650);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  statusSeverity(status: ExternalConnection['status']): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<ExternalConnection['status'], 'success' | 'warn' | 'danger' | 'secondary'> = {
      healthy: 'success', degraded: 'warn', down: 'danger', notTested: 'secondary'
    };
    return map[status];
  }

  callSeverity(result: ExternalCallRecord['result']): 'success' | 'danger' {
    return result === 'success' ? 'success' : 'danger';
  }

  healthExplanation(connection: ExternalConnection): string {
    if (connection.status === 'healthy') return this.t('externalSystems.health.healthy');
    if (connection.status === 'degraded') return this.t('externalSystems.health.degraded');
    if (connection.status === 'down') return this.t('externalSystems.health.down');
    return this.t('externalSystems.health.notTested');
  }

  successWidth(connection: ExternalConnection): number {
    return Math.max(0, Math.min(100, connection.successRate ?? 0));
  }

  get formValid(): boolean {
    return !!this.form.name.trim() && !!this.form.partner.trim() && !!this.form.eventType.trim() && !!this.form.url.trim();
  }

  private latencyFor(connection: ExternalConnection): number {
    const base = connection.type === 'SOAP' ? 720 : connection.type === 'Webhook' ? 44 : 210;
    return base + Math.floor(Math.random() * 180);
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.i18n.translate(key, params);
  }
}
