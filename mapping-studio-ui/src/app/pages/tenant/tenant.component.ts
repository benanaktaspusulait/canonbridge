import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface TenantControl {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
  severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
}

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [ButtonModule, CardModule, DividerModule, TagModule, TooltipModule, I18nPipe],
  templateUrl: './tenant.component.html',
  styleUrl: './tenant.component.scss'
})
export class TenantComponent {
  private readonly auth = inject(AuthService);

  readonly tenant = this.auth.currentTenant;
  readonly user = this.auth.currentUser;

  readonly requestHeaders = computed(() => [
    { name: 'Authorization', value: this.auth.getToken() ? 'Bearer <jwt>' : 'n/a' },
    { name: 'Tenant (from JWT)', value: this.tenant().id },
    { name: 'User (from JWT)', value: this.user()?.id ?? 'n/a' }
  ]);

  readonly controls: TenantControl[] = [
    {
      icon: 'pi pi-database',
      titleKey: 'tenant.controls.database.title',
      descriptionKey: 'tenant.controls.database.description',
      statusKey: 'tenant.controls.database.status',
      severity: 'success'
    },
    {
      icon: 'pi pi-lock',
      titleKey: 'tenant.controls.api.title',
      descriptionKey: 'tenant.controls.api.description',
      statusKey: 'tenant.controls.api.status',
      severity: 'success'
    },
    {
      icon: 'pi pi-shield',
      titleKey: 'tenant.controls.rbac.title',
      descriptionKey: 'tenant.controls.rbac.description',
      statusKey: 'tenant.controls.rbac.status',
      severity: 'info'
    },
    {
      icon: 'pi pi-history',
      titleKey: 'tenant.controls.audit.title',
      descriptionKey: 'tenant.controls.audit.description',
      statusKey: 'tenant.controls.audit.status',
      severity: 'success'
    }
  ];

  async copyTenantId(): Promise<void> {
    await navigator.clipboard.writeText(this.tenant().id);
  }
}
