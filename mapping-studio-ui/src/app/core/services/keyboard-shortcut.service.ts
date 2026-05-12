import { Injectable, signal } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  handler: () => void;
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutService {
  private readonly shortcuts = new Map<string, KeyboardShortcut>();
  private readonly enabled = signal(true);

  constructor() {
    this.initializeListener();
  }

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean, meta?: boolean): void {
    const shortcutKey = this.getShortcutKey({ key, ctrl, shift, alt, meta } as KeyboardShortcut);
    this.shortcuts.delete(shortcutKey);
  }

  /**
   * Enable or disable all shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled.set(enabled);
  }

  /**
   * Get all registered shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Clear all shortcuts
   */
  clearAll(): void {
    this.shortcuts.clear();
  }

  /**
   * Initialize keyboard event listener
   */
  private initializeListener(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(() => this.enabled()),
        filter(event => !this.isInputElement(event.target as HTMLElement))
      )
      .subscribe(event => {
        this.handleKeyboardEvent(event);
      });
  }

  /**
   * Handle keyboard event
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
    const shift = event.shiftKey;
    const alt = event.altKey;
    const meta = event.metaKey;

    const shortcutKey = this.getShortcutKey({ key, ctrl, shift, alt, meta } as KeyboardShortcut);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut && (shortcut.enabled === undefined || shortcut.enabled)) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.handler();
    }
  }

  /**
   * Generate unique key for shortcut
   */
  private getShortcutKey(shortcut: Partial<KeyboardShortcut>): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.alt) parts.push('alt');
    if (shortcut.meta) parts.push('meta');
    parts.push(shortcut.key?.toLowerCase() || '');
    return parts.join('+');
  }

  /**
   * Check if target is an input element
   */
  private isInputElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      element.isContentEditable
    );
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    // Use Cmd symbol on Mac, Ctrl on others
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
    if (shortcut.shift) parts.push('⇧');
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
    if (shortcut.meta && !isMac) parts.push('Meta');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(isMac ? '' : '+');
  }
}
