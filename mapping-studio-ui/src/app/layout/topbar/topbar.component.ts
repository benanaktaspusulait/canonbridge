import { Component, EventEmitter, Input, Output, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/services/auth.service';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { I18nService, LangId } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    TooltipModule,
    BadgeModule,
    SelectModule,
    ToolbarModule,
    TagModule,
    I18nPipe
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);

  userMenuOpen = false;

  readonly langOptions: { label: string; value: LangId }[] = [
    { label: 'English', value: 'en' },
    { label: 'Türkçe', value: 'tr' }
  ];

  userMenuItems: MenuItem[] = [];

  constructor() {
    effect(() => {
      this.i18n.translations();
      this.userMenuItems = [
        { label: this.i18n.translate('topbar.profile'), icon: 'pi pi-user', command: () => {} },
        { label: this.i18n.translate('topbar.apiKeys'), icon: 'pi pi-key', command: () => {} },
        { separator: true },
        {
          label: this.i18n.translate('topbar.signOut'),
          icon: 'pi pi-sign-out',
          command: () => this.auth.logout()
        }
      ];
    });
  }

  async onLangChange(lang: LangId): Promise<void> {
    await this.i18n.setLang(lang);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
