import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface NavItem {
  labelKey: string;
  icon: string;
  route: string;
  badge?: string;
  badgeSeverity?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TooltipModule, DividerModule, I18nPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;

  readonly navItems: NavItem[] = [
    { labelKey: 'nav.dashboard', icon: 'pi-home', route: '/dashboard' },
    { labelKey: 'nav.studio', icon: 'pi-objects-column', route: '/studio' },
    { labelKey: 'nav.mappings', icon: 'pi-directions', route: '/mappings' },
    { labelKey: 'nav.partners', icon: 'pi-building', route: '/partners' },
    {
      labelKey: 'nav.dlq',
      icon: 'pi-exclamation-triangle',
      route: '/dlq',
      badge: '12',
      badgeSeverity: 'danger'
    },
    { labelKey: 'nav.monitoring', icon: 'pi-chart-line', route: '/monitoring' }
  ];

  readonly bottomItems: NavItem[] = [{ labelKey: 'nav.settings', icon: 'pi-cog', route: '/settings' }];
}
