import { Injectable, signal, OnDestroy } from '@angular/core';

const STORAGE_KEY = 'canonbridge.darkMode';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  /** `true` when `html` has `.dark-mode` (PrimeNG Aura dark tokens). */
  readonly darkMode = signal(false);

  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private mediaListener = (e: MediaQueryListEvent) => {
    // Only follow system preference if user hasn't explicitly set a preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      this.apply(e.matches);
    }
  };

  /** Call once at startup (e.g. APP_INITIALIZER). */
  init(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    let dark: boolean;
    if (stored === '1') {
      dark = true;
    } else if (stored === '0') {
      dark = false;
    } else {
      dark = this.mediaQuery.matches;
    }
    this.apply(dark);

    // Listen for system theme changes at runtime (C12 fix)
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  toggle(): void {
    this.apply(!this.darkMode());
  }

  setDark(dark: boolean): void {
    this.apply(dark);
  }

  ngOnDestroy(): void {
    this.mediaQuery.removeEventListener('change', this.mediaListener);
  }

  private apply(dark: boolean): void {
    this.darkMode.set(dark);
    localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
    document.documentElement.classList.toggle('dark-mode', dark);
  }
}
