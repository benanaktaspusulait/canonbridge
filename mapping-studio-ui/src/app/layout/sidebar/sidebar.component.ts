import { Component, Input, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

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
    labelKey: 'nav.dlq'
  },
  { route: '/monitoring', icon: 'pi pi-chart-line', labelKey: 'nav.monitoring' }
];

const SECONDARY_NAV: NavEntry[] = [
  { route: '/demo', icon: 'pi pi-play-circle', labelKey: 'nav.demo' },
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

  private readonly secondaryNavItems = environment.features.enableDemoMode
    ? SECONDARY_NAV
    : SECONDARY_NAV.filter(item => item.route !== '/demo');

  readonly navGroups: NavGroup[] = [
    {
      labelKey: 'sidebar.menuGroup',
      items: PRIMARY_NAV
    },
    {
      labelKey: 'sidebar.preferencesGroup',
      items: this.secondaryNavItems
    }
  ];
  readonly iconNavItems: NavEntry[] = [...PRIMARY_NAV, ...this.secondaryNavItems];
  
  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
