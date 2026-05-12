import { Component } from '@angular/core';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-skip-links',
  standalone: true,
  imports: [I18nPipe],
  template: `
    <div class="skip-links" role="navigation" aria-label="Skip navigation">
      <a href="#main-content" class="skip-link">
        {{ 'accessibility.skipToMain' | i18n }}
      </a>
      <a href="#primary-navigation" class="skip-link">
        {{ 'accessibility.skipToNav' | i18n }}
      </a>
      <a href="#page-actions" class="skip-link">
        {{ 'accessibility.skipToActions' | i18n }}
      </a>
    </div>
  `,
  styles: []
})
export class SkipLinksComponent {}
