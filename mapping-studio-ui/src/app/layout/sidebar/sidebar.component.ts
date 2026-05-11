import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface NavEntry {
  route: string;
  icon: string;
  labelKey: string;
  badge?: string;
  badgeStyleClass?: string;
}

interface NavGroup {
  labelKey: string;
  items: NavEntry[];
}

const PRIMARY_NAV: NavEntry[] = [
  { route: '/dashboard', icon: 'pi pi-home', labelKey: 'nav.dashboard' },
  { route: '/studio', icon: 'pi pi-objects-column', labelKey: 'nav.studio' },
  { route: '/mappings', icon: 'pi pi-directions', labelKey: 'nav.mappings' },
  { route: '/partners', icon: 'pi pi-building', labelKey: 'nav.partners' },
  { route: '/external-systems', icon: 'pi pi-cloud', labelKey: 'nav.externalSystems' },
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
  imports: [RouterModule, TooltipModule, I18nPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;

  readonly navGroups: NavGroup[] = [
    {
      labelKey: 'sidebar.menuGroup',
      items: PRIMARY_NAV
    },
    {
      labelKey: 'sidebar.preferencesGroup',
      items: SECONDARY_NAV
    }
  ];
  readonly iconNavItems: NavEntry[] = [...PRIMARY_NAV, ...SECONDARY_NAV];
}
