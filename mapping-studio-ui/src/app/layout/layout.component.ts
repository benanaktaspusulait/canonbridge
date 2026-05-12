import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SkipLinksComponent } from './skip-links/skip-links.component';
import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';
import { I18nService } from '../core/i18n/i18n.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, SkipLinksComponent, KeyboardShortcutsDialogComponent, MessageModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private readonly i18n = inject(I18nService);

  sidebarCollapsed = signal(false);

  readonly demoBannerText = computed(
    () =>
      `${this.i18n.translate('layout.demoBanner.strong')} ${this.i18n.translate('layout.demoBanner.text')}`
  );

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
