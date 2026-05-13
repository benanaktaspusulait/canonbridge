import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
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
import { ExternalSystemService, OutboundConnection } from '../../core/services/external-system.service';

interface ExternalConnection {
  id: string;
  name: string;
  partner: string;
  eventType: string;
  type: 'REST' | 'SOAP' | 'GRAPHQL' | 'GRPC';
  environment: 'PRODUCTION' | 'SANDBOX';
  status: 'NOT_TESTED' | 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'DISABLED';
  successRate: number | null;
  avgMs: number | null;
  p95Ms: number | null;
  lastError: string;
  lastSuccess: string;
  calls24h: number;
  method: string;
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
  // Backend fields
  connectionId?: string;
  purpose?: string;
  protocol?: string;
  credentialId?: string;
  schedule?: string;
  retryPolicy?: any;
  responseHandling?: any;
  lastTestAt?: string;
  lastTestResult?: string;
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
  environment: 'SANDBOX',
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
  environment: 'SANDBOX',
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
export class ExternalSystemsComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly externalSystemService = inject(ExternalSystemService);

  private readonly _connections = signal<ExternalConnection[]>([]);
  readonly connections = this._connections.asReadonly();
  readonly loading = signal(false);
  readonly testingId = signal<string | null>(null);
  readonly selectedConnection = signal<ExternalConnection | null>(null);
  detailVisible = false;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadConnections();
  }

  loadConnections(): void {
    this.loading.set(true);
    this.externalSystemService.list().subscribe({
      next: (apiConnections) => {
        // Map API connections to UI format
        // Handle null/undefined response defensively
        if (!apiConnections) {
          this._connections.set([]);
          this.loading.set(false);
          return;
        }
        const connections = Array.isArray(apiConnections) ? apiConnections : [];
        const uiConnections: ExternalConnection[] = connections.map(conn => this.mapApiToUi(conn));
        this._connections.set(uiConnections);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load external systems:', err);
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load external systems'
        });
        this._connections.set([]);
        this.loading.set(false);
      }
    });
  }

  private mapApiToUi(conn: OutboundConnection): ExternalConnection {
    const lastTestResult = conn.last_test_result ? JSON.parse(conn.last_test_result) : null;
    const status = this.mapStatus(conn.status || 'NOT_TESTED');
    
    return {
      id: conn.connection_id || '',
      connectionId: conn.connection_id,
      name: conn.name,
      partner: this.extractPartnerFromName(conn.name),
      eventType: this.extractEventType(conn.name),
      type: conn.protocol as any || 'REST',
      protocol: conn.protocol,
      environment: conn.environment as any,
      status: status,
      successRate: lastTestResult?.success ? 99.5 : (status === 'FAILED' ? 0 : null),
      avgMs: lastTestResult?.durationMs || null,
      p95Ms: lastTestResult?.durationMs ? Math.round(lastTestResult.durationMs * 1.7) : null,
      lastError: lastTestResult?.success === false ? (lastTestResult.error || 'Test failed') : '—',
      lastSuccess: conn.last_test_at ? this.formatTimestamp(conn.last_test_at) : '—',
      calls24h: 0,
      method: conn.method || 'GET',
      url: conn.url,
      authType: conn.credential_id ? 'OAuth2' : 'None',
      timeoutMs: conn.timeout_ms || 5000,
      credentialName: conn.credential_id || '',
      credentialId: conn.credential_id,
      pollSchedule: conn.schedule || '',
      schedule: conn.schedule,
      pollInterval: '',
      firstRunAt: '',
      checkpointMode: 'idempotency_only',
      wsdlUrl: '',
      wsdlFileName: '',
      wsdlPreview: '',
      sampleJson: '{}',
      requestPreview: '{}',
      responsePreview: lastTestResult?.body || lastTestResult?.responseBody || '{}',
      mappings: [],
      sparkline: this.generateSparkline(status),
      purpose: conn.purpose,
      retryPolicy: conn.retry_policy,
      responseHandling: conn.response_handling,
      lastTestAt: conn.last_test_at,
      lastTestResult: conn.last_test_result
    };
  }

  private mapStatus(apiStatus: string): ExternalConnection['status'] {
    const statusMap: Record<string, ExternalConnection['status']> = {
      'NOT_TESTED': 'NOT_TESTED',
      'HEALTHY': 'HEALTHY',
      'DEGRADED': 'DEGRADED',
      'FAILED': 'FAILED',
      'DISABLED': 'DISABLED'
    };
    return statusMap[apiStatus] || 'NOT_TESTED';
  }

  private extractPartnerFromName(name: string): string {
    // Extract partner from name like "Carrier A Orders API"
    const words = name.split(' ');
    return words.length > 1 ? words.slice(0, 2).join(' ') : name;
  }

  private extractEventType(name: string): string {
    if (name.toLowerCase().includes('order')) return 'OrderCreated';
    if (name.toLowerCase().includes('shipment')) return 'ShipmentUpdated';
    if (name.toLowerCase().includes('payment')) return 'PaymentAuthorized';
    if (name.toLowerCase().includes('customer')) return 'CustomerUpdated';
    return 'Unknown';
  }

  private generateSparkline(status: ExternalConnection['status']): number[] {
    if (status === 'HEALTHY') return [98, 99, 99, 100, 99, 98, 99];
    if (status === 'DEGRADED') return [94, 93, 91, 90, 92, 91, 89];
    if (status === 'FAILED') return [91, 88, 76, 72, 70, 73, 72];
    return [0, 0, 0, 0, 0, 0, 0];
  }

  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      return date.toISOString().slice(0, 10);
    } catch {
      return timestamp;
    }
  }
  private readonly _callHistory = signal<ExternalCallRecord[]>([]);
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

  readonly typeOptions        = ['All', 'REST', 'SOAP', 'GRAPHQL', 'GRPC'];
  readonly environmentOptions = ['All', 'PRODUCTION', 'SANDBOX'];
  readonly formTypeOptions    = ['REST', 'SOAP', 'GRAPHQL', 'GRPC'];
  readonly methodOptions      = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  readonly authOptions        = ['None', 'API Key', 'Basic Auth', 'OAuth2'];
  readonly credentialTypeOptions = ['API Key', 'Basic Auth', 'OAuth2'];
  readonly pollIntervalOptions = ['1 minute', '5 minutes', '15 minutes', '30 minutes', '1 hour'];
  readonly checkpointModeOptions = [
    { label: 'Watermark', value: 'watermark' },
    { label: 'Page token', value: 'page_token' },
    { label: 'Idempotency only', value: 'idempotency_only' }
  ];

  readonly credentials = signal<CredentialRecord[]>([]);
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
      healthy:  list.filter(c => c.status === 'HEALTHY').length,
      degraded: list.filter(c => c.status === 'DEGRADED').length,
      down:     list.filter(c => c.status === 'FAILED').length,
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

    this.loading.set(true);
    
    // Map UI form to API format
    const apiConnection: OutboundConnection = {
      name: this.form.name,
      purpose: this.form.purpose as any || 'MANUAL_TEST',
      protocol: this.form.type as any,
      method: this.form.method,
      url: this.form.url,
      environment: this.form.environment as any,
      schedule: this.form.pollSchedule || undefined,
      timeout_ms: this.form.timeoutMs,
      retry_policy: this.form.retryPolicy,
      response_handling: this.form.responseHandling
    };

    if (this.isEdit && this.form.id) {
      this.externalSystemService.update(this.form.id, apiConnection).subscribe({
        next: (updated) => {
          this._connections.update(list =>
            list.map(c => c.id === this.form.id ? this.mapApiToUi(updated) : c)
          );
          this.toast.add({ severity: 'success', summary: this.t('externalSystems.toast.updated'), detail: this.form.name });
          this.dialogVisible = false;
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to update connection:', err);
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update connection' });
          this.loading.set(false);
        }
      });
    } else {
      this.externalSystemService.create(apiConnection).subscribe({
        next: (created) => {
          this._connections.update(list => [this.mapApiToUi(created), ...list]);
          this.toast.add({ severity: 'success', summary: this.t('externalSystems.toast.created'), detail: created.name });
          this.dialogVisible = false;
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to create connection:', err);
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create connection' });
          this.loading.set(false);
        }
      });
    }
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
        this.loading.set(true);
        this.externalSystemService.delete(connection.id).subscribe({
          next: () => {
            this._connections.update(list => list.filter(c => c.id !== connection.id));
            this.toast.add({ severity: 'warn', summary: this.t('externalSystems.toast.deleted'), detail: connection.name });
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Failed to delete connection:', err);
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete connection' });
            this.loading.set(false);
          }
        });
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

    this.externalSystemService.test(connection.id, {
      headers: {},
      payload: connection.requestPreview ? JSON.parse(connection.requestPreview) : undefined
    }).subscribe({
      next: (result) => {
        const nextStatus: ExternalConnection['status'] = result.success ? 'HEALTHY' : 'FAILED';
        const durationMs = result.durationMs ?? 0;
        
        this._connections.update(list => list.map(c => c.id === connection.id ? {
          ...c,
          status: nextStatus,
          successRate: result.success ? 99.7 : 0,
          avgMs: durationMs,
          p95Ms: Math.round(durationMs * 1.7),
          lastError: result.success ? '—' : (result.errorMessage || result.body || 'Test failed'),
          lastSuccess: result.success ? 'just now' : c.lastSuccess,
          sparkline: this.generateSparkline(nextStatus)
        } : c));

        if (this.selectedConnection()?.id === connection.id) {
          const updated = this._connections().find(c => c.id === connection.id) ?? null;
          this.selectedConnection.set(updated);
        }

        this.toast.add({
          severity: result.success ? 'success' : 'error',
          summary: result.success ? this.t('externalSystems.toast.testPassed') : this.t('externalSystems.toast.testFailed'),
          detail: result.success ? `${connection.name} · ${durationMs}ms` : (result.errorMessage || result.body)
        });
        this.testingId.set(null);
      },
      error: (err) => {
        console.error('Test failed:', err);
        this.toast.add({
          severity: 'error',
          summary: this.t('externalSystems.toast.testFailed'),
          detail: connection.name
        });
        this.testingId.set(null);
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  statusSeverity(status: ExternalConnection['status']): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<ExternalConnection['status'], 'success' | 'warn' | 'danger' | 'secondary'> = {
      HEALTHY: 'success', DEGRADED: 'warn', FAILED: 'danger', NOT_TESTED: 'secondary', DISABLED: 'secondary'
    };
    return map[status];
  }

  callSeverity(result: ExternalCallRecord['result']): 'success' | 'danger' {
    return result === 'success' ? 'success' : 'danger';
  }

  healthExplanation(connection: ExternalConnection): string {
    if (connection.status === 'HEALTHY') return this.t('externalSystems.health.healthy');
    if (connection.status === 'DEGRADED') return this.t('externalSystems.health.degraded');
    if (connection.status === 'FAILED') return this.t('externalSystems.health.down');
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
        sourceType: this.studioSourceTypeForConnection(connection),
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
    if (connection.pollSchedule) {
      const detail = [connection.pollSchedule || 'manual', connection.pollInterval, connection.firstRunAt]
        .filter(Boolean)
        .join(' · ');
      return this.t('externalSystems.detail.pollHint', { schedule: detail });
    }
    if (connection.type === 'SOAP') {
      return this.t('externalSystems.detail.wsdlHint', { wsdl: connection.wsdlFileName || connection.wsdlUrl || connection.url });
    }
    if (connection.type === 'GRPC') {
      return this.t('externalSystems.detail.grpcHint');
    }
    return this.t('externalSystems.detail.restHint');
  }

  private studioSourceTypeForConnection(connection: ExternalConnection): string {
    if (connection.type === 'SOAP') return 'soap';
    if (connection.type === 'GRPC') return 'grpc';
    if (connection.type === 'GRAPHQL') return 'apiEnrichment';
    return 'externalApi';
  }

  get formValid(): boolean {
    return (
      !!this.form.name.trim() &&
      !!this.form.partner.trim() &&
      !!this.form.eventType.trim() &&
      !!this.form.url.trim() &&
      (this.form.type !== 'SOAP' || !!this.form.wsdlUrl.trim() || !!this.form.wsdlFileName.trim())
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

  private t(key: string, params?: Record<string, unknown>): string {
    return this.i18n.translate(key, params);
  }
}
