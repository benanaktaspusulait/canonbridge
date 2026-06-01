import {
  Title
} from "./chunk-FA3B2YOI.js";
import {
  HttpClient
} from "./chunk-OGO5ZH5D.js";
import {
  ApplicationRef,
  DOCUMENT,
  Injectable,
  firstValueFrom,
  inject,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-KLG77GLC.js";

// src/app/core/i18n/i18n.service.ts
function flattenTranslations(obj, prefix = "") {
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flattenTranslations(v, key));
    } else if (v !== void 0) {
      out[key] = String(v);
    }
  }
  return out;
}
var I18nService = class _I18nService {
  http = inject(HttpClient);
  title = inject(Title);
  appRef = inject(ApplicationRef);
  document = inject(DOCUMENT);
  cache = /* @__PURE__ */ new Map();
  lang = signal("en", ...ngDevMode ? [{ debugName: "lang" }] : (
    /* istanbul ignore next */
    []
  ));
  translations = signal({}, ...ngDevMode ? [{ debugName: "translations" }] : (
    /* istanbul ignore next */
    []
  ));
  loaded = signal(false, ...ngDevMode ? [{ debugName: "loaded" }] : (
    /* istanbul ignore next */
    []
  ));
  async init() {
    try {
      const urlLang = new URLSearchParams(window.location.search).get("lang");
      const saved = localStorage.getItem("canonbridge.lang");
      const browser = navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en";
      const initial = urlLang === "en" || urlLang === "tr" ? urlLang : saved === "en" || saved === "tr" ? saved : browser;
      await this.loadLang(initial);
    } catch (e) {
      console.error("i18n init failed", e);
      this.loaded.set(true);
    }
  }
  async setLang(id) {
    await this.loadLang(id);
  }
  translate(key, params) {
    let s = this.translations()[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.split(`{{${k}}}`).join(String(v));
      }
    }
    return s;
  }
  async loadLang(id) {
    this.lang.set(id);
    localStorage.setItem("canonbridge.lang", id);
    this.document.documentElement.lang = id;
    let flat = this.cache.get(id);
    if (!flat) {
      const data = await firstValueFrom(this.http.get(this.translationUrl(id)));
      flat = flattenTranslations(data);
      this.cache.set(id, flat);
    }
    this.translations.set(flat);
    this.title.setTitle(this.translate("app.title"));
    this.loaded.set(true);
    this.appRef.tick();
  }
  translationUrl(id) {
    const baseHref = this.document.querySelector("base")?.getAttribute("href") || "/";
    const baseUrl = new URL(baseHref, this.document.location.origin);
    return new URL(`i18n/${id}.json`, baseUrl).pathname;
  }
  static \u0275fac = function I18nService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _I18nService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _I18nService, factory: _I18nService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(I18nService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  I18nService
};
//# sourceMappingURL=chunk-5RXXWD5O.js.map
