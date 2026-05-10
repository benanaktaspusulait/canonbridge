import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'canonbridge.darkMode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** `true` when `html` has `.dark-mode` (PrimeNG Aura dark tokens). */
  readonly darkMode = signal(false);

  /** Call once at startup (e.g. APP_INITIALIZER). */
  init(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    let dark: boolean;
    if (stored === '1') {
      dark = true;
    } else if (stored === '0') {
      dark = false;
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.apply(dark);
  }

  toggle(): void {
    this.apply(!this.darkMode());
  }

  setDark(dark: boolean): void {
    this.apply(dark);
  }

  private apply(dark: boolean): void {
    this.darkMode.set(dark);
    localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
    document.documentElement.classList.toggle('dark-mode', dark);
  }
}
