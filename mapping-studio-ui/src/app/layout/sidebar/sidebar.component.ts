import { Component, Input, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

interface NavEntry {
  route: string;
  icon: string;
  labelKey: string;
  badge?: string;
  badgeStyleClass?: string;
}

const PRIMARY_NAV: NavEntry[] = [
  { route: '/dashboard', icon: 'pi pi-home', labelKey: 'nav.dashboard' },
  { route: '/studio', icon: 'pi pi-objects-column', labelKey: 'nav.studio' },
  { route: '/mappings', icon: 'pi pi-directions', labelKey: 'nav.mappings' },
  { route: '/partners', icon: 'pi pi-building', labelKey: 'nav.partners' },
  {
    route: '/dlq',
    icon: 'pi pi-exclamation-triangle',
    labelKey: 'nav.dlq',
    badge: '12',
    badgeStyleClass: 'p-badge-danger'
  },
  { route: '/monitoring', icon: 'pi pi-chart-line', labelKey: 'nav.monitoring' }
];

const SECONDARY_NAV: NavEntry[] = [
  { route: '/settings', icon: 'pi pi-cog', labelKey: 'nav.settings' }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterModule,
    PanelMenuModule,
    ScrollPanelModule,
    DividerModule,
    ButtonModule,
    TooltipModule,
    I18nPipe
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;

  private readonly i18n = inject(I18nService);

  readonly panelModel = signal<MenuItem[]>([]);
  readonly iconNavItems: NavEntry[] = [...PRIMARY_NAV, ...SECONDARY_NAV];

  constructor() {
    effect(() => {
      this.i18n.translations();
      this.panelModel.set(this.buildPanelModel());
    });
  }

  private buildPanelModel(): MenuItem[] {
    const toItems = (entries: NavEntry[]): MenuItem[] =>
      entries.map(e => ({
        label: this.i18n.translate(e.labelKey),
        icon: e.icon,
        routerLink: [e.route],
        badge: e.badge,
        badgeStyleClass: e.badgeStyleClass
      }));

    return [
      {
        label: this.i18n.translate('sidebar.menuGroup'),
        expanded: true,
        items: toItems(PRIMARY_NAV)
      },
      {
        label: this.i18n.translate('sidebar.preferencesGroup'),
        expanded: true,
        items: toItems(SECONDARY_NAV)
      }
    ];
  }
}
