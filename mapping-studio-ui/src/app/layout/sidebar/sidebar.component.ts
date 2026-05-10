import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeSeverity?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TooltipModule, DividerModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'pi-home',        route: '/dashboard' },
    { label: 'Studio',      icon: 'pi-objects-column', route: '/studio' },
    { label: 'Mappings',    icon: 'pi-directions',  route: '/mappings' },
    { label: 'Partners',    icon: 'pi-building',    route: '/partners' },
    { label: 'DLQ',         icon: 'pi-exclamation-triangle', route: '/dlq', badge: '12', badgeSeverity: 'danger' },
    { label: 'Monitoring',  icon: 'pi-chart-line',  route: '/monitoring' },
  ];

  readonly bottomItems: NavItem[] = [
    { label: 'Settings',    icon: 'pi-cog',         route: '/settings' },
  ];
}
