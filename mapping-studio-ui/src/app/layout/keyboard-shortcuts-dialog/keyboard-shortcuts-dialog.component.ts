import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { KeyboardShortcutsService, KeyboardShortcut } from '../../core/services/keyboard-shortcuts.service';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface ShortcutGroup {
  context: string;
  shortcuts: KeyboardShortcut[];
}

@Component({
  selector: 'app-keyboard-shortcuts-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, I18nPipe],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      [style]="{ width: '600px' }"
      role="dialog"
      [attr.aria-labelledby]="'shortcuts-dialog-title'"
      [attr.aria-describedby]="'shortcuts-dialog-description'">
      
      <ng-template pTemplate="header">
        <h2 id="shortcuts-dialog-title" class="dialog-title">
          {{ 'shortcuts.title' | i18n }}
        </h2>
      </ng-template>

      <div id="shortcuts-dialog-description" class="shortcuts-content">
        <p class="shortcuts-intro">
          {{ 'shortcuts.intro' | i18n }}
        </p>

        @for (group of shortcutGroups; track group.context) {
          <div class="shortcut-group">
            <h3 class="group-title">{{ getGroupTitle(group.context) }}</h3>
            <div class="shortcuts-list">
              @for (shortcut of group.shortcuts; track shortcut.key) {
                <div class="shortcut-item">
                  <span class="shortcut-description">{{ shortcut.description }}</span>
                  <kbd class="shortcut-keys">{{ formatShortcut(shortcut) }}</kbd>
                </div>
              }
            </div>
          </div>
        }

        <div class="shortcuts-footer">
          <p class="footer-note">
            {{ 'shortcuts.footerNote' | i18n }}
          </p>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button
          pButton
          type="button"
          [label]="'common.close' | i18n"
          (click)="close()"
          [attr.aria-label]="'Close keyboard shortcuts dialog'">
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .dialog-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .shortcuts-content {
      padding: 1rem 0;
    }

    .shortcuts-intro {
      margin-bottom: 1.5rem;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .shortcut-group {
      margin-bottom: 2rem;

      &:last-child {
        margin-bottom: 1rem;
      }
    }

    .group-title {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 0.5rem;
    }

    .shortcuts-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--surface-hover);
      }
    }

    .shortcut-description {
      color: var(--text-color);
      font-size: 0.875rem;
    }

    .shortcut-keys {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background-color: var(--surface-100);
      border: 1px solid var(--surface-border);
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-color);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .shortcuts-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }

    .footer-note {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.75rem;
      font-style: italic;
    }

    html.dark-mode {
      .shortcut-keys {
        background-color: var(--surface-800);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  `]
})
export class KeyboardShortcutsDialogComponent implements OnInit {
  private readonly shortcutsService = inject(KeyboardShortcutsService);

  visible = false;
  shortcutGroups: ShortcutGroup[] = [];

  ngOnInit(): void {
    // Subscribe to help requests
    this.shortcutsService.helpRequested$.subscribe(() => {
      this.show();
    });
  }

  show(): void {
    this.loadShortcuts();
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  formatShortcut(shortcut: KeyboardShortcut): string {
    return this.shortcutsService.formatShortcut(shortcut);
  }

  getGroupTitle(context: string): string {
    const titles: Record<string, string> = {
      'global': 'Global',
      'mapping-editor': 'Mapping Editor',
      'partner-management': 'Partner Management',
      'dlq': 'Dead Letter Queue',
      'navigation': 'Navigation'
    };
    return titles[context] || context;
  }

  private loadShortcuts(): void {
    const allShortcuts = this.shortcutsService.getShortcuts();
    
    // Group shortcuts by context
    const groups = new Map<string, KeyboardShortcut[]>();
    
    allShortcuts.forEach(shortcut => {
      const context = shortcut.context || 'global';
      if (!groups.has(context)) {
        groups.set(context, []);
      }
      groups.get(context)!.push(shortcut);
    });

    // Convert to array
    this.shortcutGroups = Array.from(groups.entries()).map(([context, shortcuts]) => ({
      context,
      shortcuts
    }));
  }
}
