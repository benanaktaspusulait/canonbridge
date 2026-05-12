import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { TextareaModule } from 'primeng/textarea';
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
  credentialName: string;
  pollSchedule: string;
  pollInterval: string;
  firstRunAt: string;
  checkpointMode: 'watermark' | 'page_token' | 'idempotency_only';
  wsdlUrl: string;
  wsdlFileName: string;
  wsdlPreview: string;
  sampleJson: string;
  requestPreview: string;
  responsePreview: string;
  mappings: ConnectionMapping[];
  sparkline: number[];
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
  headers: string;
  requestBody: string;
  responseBody: string;
}

interface ConnectionMapping {
  name: string;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
}

interface CredentialRecord {
  id: string;
  name: string;
  type: ExternalConnection['authType'];
  environment: ExternalConnection['environment'];
  lastUsed: string;
  owner: string;
  status: 'active' | 'disabled' | 'rotationDue';
}

type ConnectionForm = Omit<ExternalConnection, 'id' | 'status' | 'successRate' | 'avgMs' | 'p95Ms' | 'lastError' | 'lastSuccess' | 'calls24h'> & { id?: string };
type CredentialForm = Omit<CredentialRecord, 'id' | 'lastUsed' | 'status'> & { id?: string; secretValue: string };

const EMPTY_FORM: ConnectionForm = {
  name: '',
  partner: '',
  eventType: '',
  type: 'REST',
  environment: 'Sandbox',
  method: 'GET',
  url: 'https://api.example.com/orders',
  authType: 'None',
  timeoutMs: 5000,
  credentialName: '',
  pollSchedule: '*/5 * * * *',
  pollInterval: '5 minutes',
  firstRunAt: '',
  checkpointMode: 'watermark',
  wsdlUrl: '',
  wsdlFileName: '',
  wsdlPreview: '',
  sampleJson: '{\n  "orders": []\n}',
  requestPreview: '{\n  "limit": 10\n}',
  responsePreview: '{\n  "orders": []\n}',
  mappings: [],
  sparkline: [96, 97, 98, 99, 99, 98, 100]
};

const EMPTY_CREDENTIAL_FORM: CredentialForm = {
  name: '',
  type: 'API Key',
  environment: 'Sandbox',
  owner: '',
  secretValue: ''
};

const STUDIO_EXTERNAL_SAMPLE_KEY = 'canonbridge:external-systems:selected-sample';

const SAMPLE_ORDERS_JSON = `{
  "orders": [
    {
      "id": "ORD-123",
      "customer": "Ada Lovelace",
      "status": "A",
      "total": 250.5,
      "created_at": "2026-05-10T09:15:00.000Z"
    }
  ]
}`;

const SAMPLE_WEBHOOK_JSON = `{
  "webhook_id": "wh_evt_9841",
  "topic": "orders/create",
  "payload": {
    "order_id": "ORD-9841",
    "status": "paid",
    "total_price": "184.20"
  }
}`;

const SAMPLE_SOAP_JSON = `{
  "Envelope": {
    "Body": {
      "TrackingResponse": {
        "trackingNumber": "TRK-44192",
        "state": "IN_TRANSIT",
        "eta": "2026-05-14"
      }
    }
  }
}`;

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
    TextareaModule,
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
  private readonly router = inject(Router);

  private readonly _connections = signal<ExternalConnection[]>([
    {
      id: 'conn-carrier-orders',
      name: 'Carrier A Orders',
      partner: 'ACME Marketplace',
      eventType: 'OrderCreated',
      type: 'REST',
      environment: 'Production',
      status: 'healthy',
      successRate: 99.2,
      avgMs: 184,
      p95Ms: 312,
      lastError: '—',
      lastSuccess: '2 min ago',
      calls24h: 1842,
      method: 'GET',
      url: 'https://carrier-a.example.com/orders',
      authType: 'OAuth2',
      timeoutMs: 5000,
      credentialName: 'Carrier A Production OAuth2',
      pollSchedule: '*/5 * * * *',
      pollInterval: '5 minutes',
      firstRunAt: '2026-05-12T08:00',
      checkpointMode: 'watermark',
      wsdlUrl: '',
      wsdlFileName: '',
      wsdlPreview: '',
      sampleJson: SAMPLE_ORDERS_JSON,
      requestPreview: '{\n  "method": "GET",\n  "path": "/orders?limit=10"\n}',
      responsePreview: SAMPLE_ORDERS_JSON,
      mappings: [
        { name: 'order.created', version: 'v2.1.0', status: 'active' },
        { name: 'order.cancelled', version: 'v1.0.2', status: 'active' }
      ],
      sparkline: [98, 99, 99, 100, 99, 98, 99]
    },
    {
      id: 'conn-shopify-webhook',
      name: 'Shopify Order Webhook',
      partner: 'Shopify',
      eventType: 'OrderCreated',
      type: 'Webhook',
      environment: 'Production',
      status: 'healthy',
      successRate: 100,
      avgMs: 22,
      p95Ms: 48,
      lastError: '—',
      lastSuccess: '1 min ago',
      calls24h: 923,
      method: 'POST',
      url: 'https://hooks.shopify.example.com/orders',
      authType: 'API Key',
      timeoutMs: 3000,
      credentialName: 'Shopify inbound webhook key',
      pollSchedule: '',
      pollInterval: '',
      firstRunAt: '',
      checkpointMode: 'idempotency_only',
      wsdlUrl: '',
      wsdlFileName: '',
      wsdlPreview: '',
      sampleJson: SAMPLE_WEBHOOK_JSON,
      requestPreview: SAMPLE_WEBHOOK_JSON,
      responsePreview: '{\n  "accepted": true,\n  "messageId": "msg-9841"\n}',
      mappings: [{ name: 'order.created', version: 'v1.4.0', status: 'active' }],
      sparkline: [100, 100, 100, 99, 100, 100, 100]
    },
    {
      id: 'conn-soap-tracking',
      name: 'SOAP Tracking Lookup',
      partner: 'Logistics Xpress',
      eventType: 'ShipmentUpdated',
      type: 'SOAP',
      environment: 'Sandbox',
      status: 'degraded',
      successRate: 91.1,
      avgMs: 640,
      p95Ms: 1220,
      lastError: 'SOAP fault: invalid tracking number',
      lastSuccess: '16 min ago',
      calls24h: 418,
      method: 'POST',
      url: 'https://soap.logistics.example.com/tracking',
      authType: 'Basic Auth',
      timeoutMs: 8000,
      credentialName: 'Logistics Xpress SOAP Basic',
      pollSchedule: '',
      pollInterval: '',
      firstRunAt: '',
      checkpointMode: 'idempotency_only',
      wsdlUrl: 'https://soap.logistics.example.com/tracking?wsdl',
      wsdlFileName: 'tracking.wsdl',
      wsdlPreview: '<definitions name="TrackingService"><service name="TrackingPort"/></definitions>',
      sampleJson: SAMPLE_SOAP_JSON,
      requestPreview: '<soap:Envelope><soap:Body><GetTracking>TRK-44192</GetTracking></soap:Body></soap:Envelope>',
      responsePreview: SAMPLE_SOAP_JSON,
      mappings: [{ name: 'shipment.updated', version: 'v1.3.0', status: 'active' }],
      sparkline: [94, 93, 91, 90, 92, 91, 89]
    },
    {
      id: 'conn-payment-risk',
      name: 'Payment Risk Score',
      partner: 'Payment Gateway',
      eventType: 'PaymentAuthorized',
      type: 'REST',
      environment: 'Production',
      status: 'down',
      successRate: 72.4,
      avgMs: 1800,
      p95Ms: 3200,
      lastError: 'HTTP 503 after 3 attempts',
      lastSuccess: '48 min ago',
      calls24h: 212,
      method: 'POST',
      url: 'https://risk.payment.example.com/score',
      authType: 'OAuth2',
      timeoutMs: 10000,
      credentialName: 'Payment Risk OAuth2',
      pollSchedule: '',
      pollInterval: '',
      firstRunAt: '',
      checkpointMode: 'idempotency_only',
      wsdlUrl: '',
      wsdlFileName: '',
      wsdlPreview: '',
      sampleJson: '{\n  "paymentId": "PAY-7781",\n  "riskScore": 87,\n  "decision": "REVIEW"\n}',
      requestPreview: '{\n  "paymentId": "PAY-7781",\n  "amount": 184.2\n}',
      responsePreview: '{\n  "error": "HTTP 503 after 3 attempts"\n}',
      mappings: [{ name: 'payment.authorized', version: 'v3.0.1', status: 'draft' }],
      sparkline: [91, 88, 76, 72, 70, 73, 72]
    }
  ]);

  readonly connections = this._connections.asReadonly();
  readonly testingId = signal<string | null>(null);
  readonly selectedConnection = signal<ExternalConnection | null>(null);
  detailVisible = false;

  private readonly _callHistory = signal<ExternalCallRecord[]>([
    {
      id: 'call-1',
      connectionId: 'conn-carrier-orders',
      at: '2 min ago',
      status: 200,
      durationMs: 184,
      result: 'success',
      message: 'Orders page fetched',
      requestId: 'req-car-1842',
      headers: 'Authorization: Bearer ****\nAccept: application/json',
      requestBody: '{\n  "limit": 10,\n  "cursor": "latest"\n}',
      responseBody: SAMPLE_ORDERS_JSON
    },
    {
      id: 'call-2',
      connectionId: 'conn-carrier-orders',
      at: '9 min ago',
      status: 200,
      durationMs: 221,
      result: 'success',
      message: 'Orders page fetched',
      requestId: 'req-car-1841',
      headers: 'Authorization: Bearer ****\nAccept: application/json',
      requestBody: '{\n  "limit": 10,\n  "cursor": "prev"\n}',
      responseBody: SAMPLE_ORDERS_JSON
    },
    {
      id: 'call-3',
      connectionId: 'conn-soap-tracking',
      at: '16 min ago',
      status: 500,
      durationMs: 1220,
      result: 'failed',
      message: 'SOAP fault: invalid tracking number',
      requestId: 'req-soap-418',
      headers: 'Authorization: Basic ****\nContent-Type: text/xml',
      requestBody: '<soap:Envelope><soap:Body><GetTracking>TRK-00000</GetTracking></soap:Body></soap:Envelope>',
      responseBody: '<soap:Fault><faultstring>invalid tracking number</faultstring></soap:Fault>'
    },
    {
      id: 'call-4',
      connectionId: 'conn-payment-risk',
      at: '48 min ago',
      status: 503,
      durationMs: 3200,
      result: 'failed',
      message: 'HTTP 503 after 3 attempts',
      requestId: 'req-risk-212',
      headers: 'Authorization: Bearer ****\nContent-Type: application/json',
      requestBody: '{\n  "paymentId": "PAY-7781",\n  "amount": 184.2\n}',
      responseBody: '{\n  "error": "Service unavailable"\n}'
    }
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
  readonly credentialTypeOptions = ['API Key', 'Basic Auth', 'OAuth2'];
  readonly pollIntervalOptions = ['1 minute', '5 minutes', '15 minutes', '30 minutes', '1 hour'];
  readonly checkpointModeOptions = [
    { label: 'Watermark', value: 'watermark' },
    { label: 'Page token', value: 'page_token' },
    { label: 'Idempotency only', value: 'idempotency_only' }
  ];

  readonly credentials = signal<CredentialRecord[]>([
    { id: 'cred-carrier-oauth', name: 'Carrier A Production OAuth2', type: 'OAuth2', environment: 'Production', lastUsed: '2 min ago', owner: 'Integration Team', status: 'active' },
    { id: 'cred-shopify-webhook', name: 'Shopify inbound webhook key', type: 'API Key', environment: 'Production', lastUsed: '1 min ago', owner: 'Platform Team', status: 'active' },
    { id: 'cred-logistics-basic', name: 'Logistics Xpress SOAP Basic', type: 'Basic Auth', environment: 'Sandbox', lastUsed: '16 min ago', owner: 'Support Team', status: 'rotationDue' },
    { id: 'cred-payment-oauth', name: 'Payment Risk OAuth2', type: 'OAuth2', environment: 'Production', lastUsed: '48 min ago', owner: 'Risk Team', status: 'active' }
  ]);
  readonly credentialNameOptions = computed(() => this.credentials().filter(c => c.status !== 'disabled').map(c => c.name));

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
  credentialDialogVisible = false;
  credentialIsEdit = false;
  credentialForm: CredentialForm = { ...EMPTY_CREDENTIAL_FORM };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  openAdd(): void {
    this.isEdit = false;
    this.form = { ...EMPTY_FORM };
    this.dialogVisible = true;
  }

  openEdit(connection: ExternalConnection): void {
    this.isEdit = true;
    const {
      id,
      name,
      partner,
      eventType,
      type,
      environment,
      method,
      url,
      authType,
      timeoutMs,
      credentialName,
      pollSchedule,
      pollInterval,
      firstRunAt,
      checkpointMode,
      wsdlUrl,
      wsdlFileName,
      wsdlPreview,
      sampleJson,
      requestPreview,
      responsePreview,
      mappings,
      sparkline
    } = connection;
    this.form = {
      id,
      name,
      partner,
      eventType,
      type,
      environment,
      method,
      url,
      authType,
      timeoutMs,
      credentialName,
      pollSchedule,
      pollInterval,
      firstRunAt,
      checkpointMode,
      wsdlUrl,
      wsdlFileName,
      wsdlPreview,
      sampleJson,
      requestPreview,
      responsePreview,
      mappings: [...mappings],
      sparkline: [...sparkline]
    };
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

  openCredentialStore(): void {
    this.credentialIsEdit = false;
    this.credentialForm = { ...EMPTY_CREDENTIAL_FORM };
    this.credentialDialogVisible = true;
  }

  openCredentialEdit(credential: CredentialRecord): void {
    this.credentialIsEdit = true;
    const { id, name, type, environment, owner } = credential;
    this.credentialForm = { id, name, type, environment, owner, secretValue: '' };
    this.credentialDialogVisible = true;
  }

  saveCredentialRecord(): void {
    if (!this.credentialForm.name.trim() || !this.credentialForm.owner.trim()) {
      this.toast.add({
        severity: 'warn',
        summary: this.t('externalSystems.credentialStore.invalidTitle'),
        detail: this.t('externalSystems.credentialStore.invalidDetail')
      });
      return;
    }

    if (this.credentialIsEdit && this.credentialForm.id) {
      this.credentials.update(list => list.map(credential => credential.id === this.credentialForm.id ? {
        ...credential,
        name: this.credentialForm.name,
        type: this.credentialForm.type,
        environment: this.credentialForm.environment,
        owner: this.credentialForm.owner,
        status: 'active'
      } : credential));
    } else {
      this.credentials.update(list => [{
        id: `cred-${Date.now()}`,
        name: this.credentialForm.name,
        type: this.credentialForm.type,
        environment: this.credentialForm.environment,
        owner: this.credentialForm.owner,
        lastUsed: this.t('externalSystems.credentialStore.neverUsed'),
        status: 'active'
      }, ...list]);
    }

    this.credentialDialogVisible = false;
    this.toast.add({
      severity: 'success',
      summary: this.t('externalSystems.toast.credentialSaved'),
      detail: this.credentialForm.name
    });
  }

  disableCredential(credential: CredentialRecord): void {
    this.credentials.update(list => list.map(row => row.id === credential.id ? { ...row, status: 'disabled' } : row));
    this.toast.add({
      severity: 'warn',
      summary: this.t('externalSystems.toast.credentialDisabled'),
      detail: credential.name
    });
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
        requestId: `req-${Math.random().toString(36).slice(2, 8)}`,
        headers: `${connection.authType === 'None' ? 'No authentication header' : `${connection.authType}: ****`}\nAccept: application/json`,
        requestBody: connection.requestPreview,
        responseBody: validUrl ? connection.sampleJson : '{\n  "error": "Invalid endpoint URL"\n}'
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

  mappingSeverity(status: ConnectionMapping['status']): 'success' | 'warn' | 'secondary' {
    if (status === 'active') return 'success';
    if (status === 'draft') return 'warn';
    return 'secondary';
  }

  credentialSeverity(status: CredentialRecord['status']): 'success' | 'warn' | 'secondary' {
    if (status === 'active') return 'success';
    if (status === 'rotationDue') return 'warn';
    return 'secondary';
  }

  connectionCredential(connection: ExternalConnection): CredentialRecord | null {
    return this.credentials().find(credential => credential.name === connection.credentialName) ?? null;
  }

  sparklinePoints(connection: ExternalConnection): string {
    const values = connection.sparkline.length ? connection.sparkline : [0];
    const max = Math.max(...values, 100);
    const min = Math.min(...values, 0);
    const spread = Math.max(1, max - min);
    return values
      .map((value, index) => {
        const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
        const y = 48 - ((value - min) / spread) * 40;
        return `${x},${y}`;
      })
      .join(' ');
  }

  useSampleInStudio(connection: ExternalConnection): void {
    localStorage.setItem(
      STUDIO_EXTERNAL_SAMPLE_KEY,
      JSON.stringify({
        connectionId: connection.id,
        connectionName: connection.name,
        partner: connection.partner,
        eventType: connection.eventType,
        sampleJson: connection.sampleJson,
        capturedAt: new Date().toISOString()
      })
    );
    this.toast.add({
      severity: 'success',
      summary: this.t('externalSystems.toast.sampleReady'),
      detail: connection.name,
      life: 3000
    });
    void this.router.navigate(['/studio']);
  }

  typeConfigHint(connection: ExternalConnection): string {
    if (connection.type === 'Scheduled Poll') {
      const detail = [connection.pollSchedule || 'manual', connection.pollInterval, connection.firstRunAt]
        .filter(Boolean)
        .join(' · ');
      return this.t('externalSystems.detail.pollHint', { schedule: detail });
    }
    if (connection.type === 'SOAP') {
      return this.t('externalSystems.detail.wsdlHint', { wsdl: connection.wsdlFileName || connection.wsdlUrl || connection.url });
    }
    if (connection.type === 'Webhook') {
      return this.t('externalSystems.detail.webhookHint');
    }
    return this.t('externalSystems.detail.restHint');
  }

  get formValid(): boolean {
    return (
      !!this.form.name.trim() &&
      !!this.form.partner.trim() &&
      !!this.form.eventType.trim() &&
      !!this.form.url.trim() &&
      (this.form.type !== 'SOAP' || !!this.form.wsdlUrl.trim() || !!this.form.wsdlFileName.trim()) &&
      (this.form.type !== 'Scheduled Poll' || (!!this.form.pollSchedule.trim() && !!this.form.pollInterval.trim()))
    );
  }

  onWsdlFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.form.wsdlFileName = file.name;
      this.form.wsdlPreview = String(reader.result ?? '').slice(0, 1800);
      this.toast.add({
        severity: 'success',
        summary: this.t('externalSystems.toast.wsdlLoaded'),
        detail: file.name
      });
      input.value = '';
    };
    reader.readAsText(file);
  }

  private latencyFor(connection: ExternalConnection): number {
    const base = connection.type === 'SOAP' ? 720 : connection.type === 'Webhook' ? 44 : 210;
    return base + Math.floor(Math.random() * 180);
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.i18n.translate(key, params);
  }
}
