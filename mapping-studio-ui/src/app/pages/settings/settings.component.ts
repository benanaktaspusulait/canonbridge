import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/services/auth.service';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

const STORAGE_KEY = 'canonbridge.settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    DividerModule,
    InputTextModule,
    TableModule,
    TagModule,
    ToastModule,
    ToggleSwitchModule,
    TooltipModule,
    I18nPipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);

  // ── Tenant form ───────────────────────────────────────────────────────────
  tenantName = '';
  tenantSlug = '';
  webhookUrl = '';

  // ── Notification toggles ──────────────────────────────────────────────────
  dlqAlerts   = true;
  lagAlerts   = true;
  emailDigest = false;

  // ── API key dialog ────────────────────────────────────────────────────────
  keyDialogVisible = false;
  newKeyName = '';
  generatedKey = '';

  readonly apiKeys = signal<ApiKey[]>([]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.applyUserDefaults();
    this.loadSettings();
  }

  private applyUserDefaults(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.tenantName = user.tenantName;
    this.tenantSlug = user.tenantId;
  }

  private loadSettings(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.webhookUrl  !== undefined) this.webhookUrl  = saved.webhookUrl;
      if (saved.dlqAlerts   !== undefined) this.dlqAlerts   = saved.dlqAlerts;
      if (saved.lagAlerts   !== undefined) this.lagAlerts   = saved.lagAlerts;
      if (saved.emailDigest !== undefined) this.emailDigest = saved.emailDigest;
    } catch {
      // ignore corrupt storage
    }
  }

  // ── Tenant save ───────────────────────────────────────────────────────────

  saveSettings(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      webhookUrl:  this.webhookUrl,
      dlqAlerts:   this.dlqAlerts,
      lagAlerts:   this.lagAlerts,
      emailDigest: this.emailDigest
    }));
    this.toast.add({ severity: 'success', summary: this.t('settings.toast.saved'), detail: this.tenantSlug });
  }

  // ── API key management ────────────────────────────────────────────────────

  openGenerateKey(): void {
    this.newKeyName = '';
    this.generatedKey = '';
    this.keyDialogVisible = true;
  }

  generateKey(): void {
    if (!this.newKeyName.trim()) {
      this.toast.add({ severity: 'warn', summary: this.t('settings.toast.keyNameRequired') });
      return;
    }

    const raw = `cb_live_${crypto.randomUUID().replace(/-/g, '')}${Math.random().toString(36).slice(2, 12)}`;
    const key: ApiKey = {
      id: `k${Date.now()}`,
      name: this.newKeyName.trim(),
      prefix: `${raw.slice(0, 14)}…`,
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: 'never',
      status: 'active'
    };
    this.apiKeys.update(list => [key, ...list]);
    this.generatedKey = raw;
    this.toast.add({ severity: 'success', summary: this.t('settings.toast.keyGenerated'), detail: key.name });
  }

  async copyGeneratedKey(): Promise<void> {
    if (!this.generatedKey) return;
    try {
      await navigator.clipboard.writeText(this.generatedKey);
      this.toast.add({ severity: 'success', summary: this.t('settings.toast.keyCopied') });
    } catch {
      this.toast.add({ severity: 'error', summary: 'Copy failed', detail: 'Use Ctrl+C to copy manually.' });
    }
  }

  revokeKey(key: ApiKey, event: Event): void {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      header: this.t('settings.revokeTitle'),
      message: this.t('settings.revokeMessage', { name: key.name }),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t('settings.revoke'),
      rejectLabel: this.t('settings.cancel'),
      accept: () => {
        this.apiKeys.update(list =>
          list.map(k => k.id === key.id ? { ...k, status: 'revoked' as const, lastUsed: this.t('settings.revokedNow') } : k)
        );
        this.toast.add({ severity: 'warn', summary: this.t('settings.toast.revoked'), detail: key.name });
      }
    });
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.i18n.translate(key, params);
  }
}
