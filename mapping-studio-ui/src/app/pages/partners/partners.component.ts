import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
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
import { PartnerService } from '../../core/services/partner.service';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'degraded';
  eventTypes: number;
  activeMappings: number;
  dlqCount: number;
  throughput: string;
  lastSeen: string;
  contactEmail: string;
  description: string;
}

type PartnerForm = Omit<Partner, 'id' | 'throughput' | 'lastSeen'> & { id?: string };

const EMPTY_FORM: PartnerForm = {
  name: '',
  slug: '',
  status: 'active',
  eventTypes: 1,
  activeMappings: 0,
  dlqCount: 0,
  contactEmail: '',
  description: ''
};

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [
    FormsModule,
    AvatarModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
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
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export class PartnersComponent implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(I18nService);
  private readonly partnerService = inject(PartnerService);

  private readonly _partners = signal<Partner[]>([]);
  readonly partners = this._partners.asReadonly();
  readonly activeCount = computed(() => this._partners().filter(p => p.status === 'active').length);
  readonly totalMappings = computed(() => this._partners().reduce((sum, p) => sum + p.activeMappings, 0));

  async ngOnInit() {
    await this.loadPartners();
  }

  private async loadPartners() {
    try {
      const apiPartners = await this.partnerService.getAll();
      // Transform API partners to UI format
      const uiPartners: Partner[] = apiPartners.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.external_id,
        status: this.mapApiStatusToUi(p.status),
        eventTypes: 0, // TODO: Get from API
        activeMappings: 0, // TODO: Get from API
        dlqCount: 0, // TODO: Get from API
        throughput: p.status === 'ACTIVE' ? '~0/hr' : '—',
        lastSeen: 'just now',
        contactEmail: p.contact_email || '',
        description: p.description || ''
      }));
      this._partners.set(uiPartners);
    } catch (error) {
      console.error('Failed to load partners:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load partners'
      });
    }
  }

  private mapApiStatusToUi(apiStatus: string): 'active' | 'inactive' | 'degraded' {
    switch (apiStatus) {
      case 'ACTIVE': return 'active';
      case 'INACTIVE': return 'inactive';
      case 'SUSPENDED': return 'degraded';
      case 'ARCHIVED': return 'inactive';
      default: return 'inactive';
    }
  }

  private mapUiStatusToApi(uiStatus: 'active' | 'inactive' | 'degraded'): 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED' {
    switch (uiStatus) {
      case 'active': return 'ACTIVE';
      case 'inactive': return 'INACTIVE';
      case 'degraded': return 'SUSPENDED';
      default: return 'INACTIVE';
    }
  }

  readonly statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Degraded', value: 'degraded' }
  ];

  dialogVisible = false;
  isEdit = false;
  form: PartnerForm = { ...EMPTY_FORM };

  openAdd(): void {
    this.isEdit = false;
    this.form = { ...EMPTY_FORM };
    this.dialogVisible = true;
  }

  openEdit(partner: Partner): void {
    this.isEdit = true;
    const { id, name, slug, status, eventTypes, activeMappings, dlqCount, contactEmail, description } = partner;
    this.form = { id, name, slug, status, eventTypes, activeMappings, dlqCount, contactEmail, description };
    this.dialogVisible = true;
  }

  onNameInput(): void {
    if (!this.isEdit || !this.form.slug.trim()) {
      this.form.slug = this.slugify(this.form.name);
    }
  }

  async save(): Promise<void> {
    if (!this.formValid) {
      this.messageService.add({
        severity: 'warn',
        summary: this.t('partners.toast.invalidTitle'),
        detail: this.t('partners.toast.invalidDetail')
      });
      return;
    }

    const slug = this.slugify(this.form.slug || this.form.name);
    const duplicate = this._partners().some(p => p.slug === slug && p.id !== this.form.id);
    if (duplicate) {
      this.messageService.add({
        severity: 'warn',
        summary: this.t('partners.toast.duplicateTitle'),
        detail: slug
      });
      return;
    }

    try {
      if (this.isEdit && this.form.id) {
        await this.partnerService.update(this.form.id, {
          name: this.form.name.trim(),
          status: this.mapUiStatusToApi(this.form.status),
          description: this.form.description.trim()
        });
        this.messageService.add({ severity: 'success', summary: this.t('partners.toast.updated'), detail: this.form.name });
      } else {
        await this.partnerService.create({
          external_id: slug,
          name: this.form.name.trim(),
          status: this.mapUiStatusToApi(this.form.status),
          description: this.form.description.trim()
        });
        this.messageService.add({ severity: 'success', summary: this.t('partners.toast.onboarded'), detail: this.form.name });
      }
      
      await this.loadPartners();
      this.dialogVisible = false;
    } catch (error) {
      console.error('Failed to save partner:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save partner'
      });
    }
  }

  confirmDelete(partner: Partner, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.t('partners.deleteMessage', { name: partner.name }),
      header: this.t('partners.deleteTitle'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t('partners.delete'),
      rejectLabel: this.t('partners.cancel'),
      accept: async () => {
        try {
          await this.partnerService.delete(partner.id);
          await this.loadPartners();
          this.messageService.add({ severity: 'warn', summary: this.t('partners.toast.deleted'), detail: partner.name });
        } catch (error) {
          console.error('Failed to delete partner:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete partner'
          });
        }
      }
    });
  }

  getSeverity(status: string): 'success' | 'warn' | 'secondary' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'secondary' | 'danger'> = {
      active: 'success',
      degraded: 'warn',
      inactive: 'secondary'
    };
    return map[status] ?? 'secondary';
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  get formValid(): boolean {
    return !!this.form.name.trim() && !!this.form.slug.trim();
  }

  private slugify(value: string): string {
    return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.i18n.translate(key, params);
  }
}
