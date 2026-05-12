import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  context?: string;
}

/**
 * Keyboard Shortcuts Service
 * 
 * Manages global keyboard shortcuts for the application
 */
@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private shortcuts = new Map<string, KeyboardShortcut>();
  private enabled = true;
  
  // Observable for shortcut help dialog
  private helpRequestedSubject = new Subject<void>();
  helpRequested$ = this.helpRequestedSubject.asObservable();

  constructor() {
    this.initializeGlobalListener();
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
  unregister(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts for a specific context
   */
  getShortcutsForContext(context: string): KeyboardShortcut[] {
    return this.getShortcuts().filter(s => s.context === context);
  }

  /**
   * Enable keyboard shortcuts
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable keyboard shortcuts
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if shortcuts are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Show help dialog
   */
  showHelp(): void {
    this.helpRequestedSubject.next();
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    if (shortcut.ctrl || shortcut.meta) {
      parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.shift) {
      parts.push(isMac ? '⇧' : 'Shift');
    }
    if (shortcut.alt) {
      parts.push(isMac ? '⌥' : 'Alt');
    }
    parts.push(shortcut.key.toUpperCase());

    return parts.join(isMac ? '' : '+');
  }

  /**
   * Initialize global keyboard listener
   */
  private initializeGlobalListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });
  }

  /**
   * Handle keydown event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Don't trigger shortcuts when typing in input fields
    if (this.isTypingInInput(event.target as HTMLElement)) {
      return;
    }

    // Check for help shortcut (? or F1)
    if (event.key === '?' || event.key === 'F1') {
      event.preventDefault();
      this.showHelp();
      return;
    }

    // Find matching shortcut
    const key = this.getEventKey(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  /**
   * Check if user is typing in an input field
   */
  private isTypingInInput(target: HTMLElement): boolean {
    if (!target) return false;

    const tagName = target.tagName.toLowerCase();
    const isContentEditable = target.isContentEditable;
    const isInput = tagName === 'input' || tagName === 'textarea';
    const isSelect = tagName === 'select';

    return isInput || isSelect || isContentEditable;
  }

  /**
   * Get shortcut key from event
   */
  private getEventKey(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push('ctrl');
    if (event.metaKey) parts.push('meta');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key.toLowerCase());

    return parts.join('+');
  }

  /**
   * Get shortcut key from shortcut definition
   */
  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.meta) parts.push('meta');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.alt) parts.push('alt');
    parts.push(shortcut.key.toLowerCase());

    return parts.join('+');
  }
}
