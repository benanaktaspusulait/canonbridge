import { Component, computed, inject, signal } from '@angular/core';
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
export class PartnersComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(I18nService);

  private readonly _partners = signal<Partner[]>([
    { id: 'p1', name: 'ACME Marketplace', slug: 'acme-marketplace', status: 'active', eventTypes: 4, activeMappings: 4, dlqCount: 2, throughput: '~3,200/hr', lastSeen: '1 min ago', contactEmail: 'integration@acme.com', description: 'Primary marketplace partner' },
    { id: 'p2', name: 'Logistics Xpress', slug: 'logistics-xpress', status: 'active', eventTypes: 3, activeMappings: 2, dlqCount: 0, throughput: '~1,800/hr', lastSeen: '3 min ago', contactEmail: 'api@logisticsxpress.io', description: 'Shipping and tracking events' },
    { id: 'p3', name: 'Payment Gateway', slug: 'payment-gateway', status: 'degraded', eventTypes: 2, activeMappings: 1, dlqCount: 10, throughput: '~900/hr', lastSeen: '12 min ago', contactEmail: 'ops@paymentgw.com', description: 'Payment authorization events' },
    { id: 'p4', name: 'CRM Connect', slug: 'crm-connect', status: 'inactive', eventTypes: 1, activeMappings: 0, dlqCount: 0, throughput: '—', lastSeen: '2 days ago', contactEmail: '', description: 'Customer data sync' },
    { id: 'p5', name: 'Inventory Hub', slug: 'inventory-hub', status: 'active', eventTypes: 5, activeMappings: 5, dlqCount: 0, throughput: '~600/hr', lastSeen: '5 min ago', contactEmail: 'tech@inventoryhub.net', description: 'Stock level and warehouse events' }
  ]);

  readonly partners = this._partners.asReadonly();
  readonly activeCount = computed(() => this._partners().filter(p => p.status === 'active').length);
  readonly totalMappings = computed(() => this._partners().reduce((sum, p) => sum + p.activeMappings, 0));

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

  save(): void {
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

    if (this.isEdit && this.form.id) {
      this._partners.update(list =>
        list.map(p => p.id === this.form.id ? {
          ...p,
          name: this.form.name.trim(),
          slug,
          status: this.form.status,
          eventTypes: this.form.eventTypes,
          activeMappings: this.form.activeMappings,
          dlqCount: this.form.dlqCount,
          contactEmail: this.form.contactEmail.trim(),
          description: this.form.description.trim()
        } : p)
      );
      this.messageService.add({ severity: 'success', summary: this.t('partners.toast.updated'), detail: this.form.name });
    } else {
      const newPartner: Partner = {
        id: `p${Date.now()}`,
        name: this.form.name.trim(),
        slug,
        status: this.form.status,
        eventTypes: this.form.eventTypes,
        activeMappings: this.form.activeMappings,
        dlqCount: this.form.dlqCount,
        throughput: this.form.status === 'inactive' ? '—' : '~0/hr',
        lastSeen: 'just now',
        contactEmail: this.form.contactEmail.trim(),
        description: this.form.description.trim()
      };
      this._partners.update(list => [newPartner, ...list]);
      this.messageService.add({ severity: 'success', summary: this.t('partners.toast.onboarded'), detail: newPartner.name });
    }

    this.dialogVisible = false;
  }

  confirmDelete(partner: Partner, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.t('partners.deleteMessage', { name: partner.name }),
      header: this.t('partners.deleteTitle'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t('partners.delete'),
      rejectLabel: this.t('partners.cancel'),
      accept: () => {
        this._partners.update(list => list.filter(p => p.id !== partner.id));
        this.messageService.add({ severity: 'warn', summary: this.t('partners.toast.deleted'), detail: partner.name });
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
