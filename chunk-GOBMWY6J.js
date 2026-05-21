import {
  Injectable,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-56FG4FZN.js";

// src/app/core/theme/theme.service.ts
var STORAGE_KEY = "canonbridge.darkMode";
var ThemeService = class _ThemeService {
  /** `true` when `html` has `.dark-mode` (PrimeNG Aura dark tokens). */
  darkMode = signal(false, ...ngDevMode ? [{ debugName: "darkMode" }] : (
    /* istanbul ignore next */
    []
  ));
  /** Call once at startup (e.g. APP_INITIALIZER). */
  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    let dark;
    if (stored === "1") {
      dark = true;
    } else if (stored === "0") {
      dark = false;
    } else {
      dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    this.apply(dark);
  }
  toggle() {
    this.apply(!this.darkMode());
  }
  setDark(dark) {
    this.apply(dark);
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
//# sourceMappingURL=chunk-GOBMWY6J.js.map
