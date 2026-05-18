import { Component, Input, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthService } from '../../core/services/auth.service';

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
  { route: '/mappings', icon: 'pi pi-directions', labelKey: 'nav.mappings' },
  { route: '/partners', icon: 'pi pi-building', labelKey: 'nav.partners' },
  { route: '/external-systems', icon: 'pi pi-cloud', labelKey: 'nav.externalSystems' },
  { route: '/schemas', icon: 'pi pi-database', labelKey: 'nav.schemas' },
  {
    route: '/dlq',
    icon: 'pi pi-exclamation-triangle',
    labelKey: 'nav.dlq'
  },
  { route: '/monitoring', icon: 'pi pi-chart-line', labelKey: 'nav.monitoring' },
  { route: '/audit', icon: 'pi pi-shield', labelKey: 'nav.audit' }
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
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  @Input() collapsed = false;

  collapsedSections = new Set<string>();

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
  
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggleSection(labelKey: string): void {
    if (this.collapsedSections.has(labelKey)) {
      this.collapsedSections.delete(labelKey);
    } else {
      this.collapsedSections.add(labelKey);
    }
  }

  isSectionCollapsed(labelKey: string): boolean {
    return this.collapsedSections.has(labelKey);
  }
}
