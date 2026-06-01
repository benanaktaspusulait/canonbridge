import {
  Injectable,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-KLG77GLC.js";

// src/app/core/theme/theme.service.ts
var STORAGE_KEY = "canonbridge.darkMode";
var ThemeService = class _ThemeService {
  /** `true` when `html` has `.dark-mode` (PrimeNG Aura dark tokens). */
  darkMode = signal(false, ...ngDevMode ? [{ debugName: "darkMode" }] : (
    /* istanbul ignore next */
    []
  ));
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaListener = (e) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      this.apply(e.matches);
    }
  };
  /** Call once at startup (e.g. APP_INITIALIZER). */
  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    let dark;
    if (stored === "1") {
      dark = true;
    } else if (stored === "0") {
      dark = false;
    } else {
      dark = this.mediaQuery.matches;
    }
    this.apply(dark);
    this.mediaQuery.addEventListener("change", this.mediaListener);
  }
  toggle() {
    this.apply(!this.darkMode());
  }
  setDark(dark) {
    this.apply(dark);
  }
  ngOnDestroy() {
    this.mediaQuery.removeEventListener("change", this.mediaListener);
  }
  apply(dark) {
    this.darkMode.set(dark);
    localStorage.setItem(STORAGE_KEY, dark ? "1" : "0");
    document.documentElement.classList.toggle("dark-mode", dark);
  }
  static \u0275fac = function ThemeService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ThemeService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ThemeService, factory: _ThemeService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ThemeService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  ThemeService
};
//# sourceMappingURL=chunk-ZD7UXYGT.js.map
