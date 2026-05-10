import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CardModule, ButtonModule, InputTextModule, ToggleSwitchModule,
            DividerModule, TableModule, TagModule, FormsModule, TooltipModule, I18nPipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  tenantName = 'Acme Corp';
  tenantSlug = 'acme-corp';
  webhookUrl  = 'https://hooks.acme.com/canonbridge';

  dlqAlerts   = true;
  lagAlerts   = true;
  emailDigest = false;

  readonly apiKeys: ApiKey[] = [
    { id: 'k1', name: 'Production Transformer', prefix: 'cb_live_xK9m…', createdAt: '2026-03-01', lastUsed: '2 min ago',  status: 'active'  },
    { id: 'k2', name: 'CI/CD Pipeline',         prefix: 'cb_live_pQ3r…', createdAt: '2026-04-15', lastUsed: '1 day ago',  status: 'active'  },
    { id: 'k3', name: 'Old Dev Key',             prefix: 'cb_live_aB7z…', createdAt: '2026-01-10', lastUsed: '45 days ago', status: 'revoked' },
  ];
}
