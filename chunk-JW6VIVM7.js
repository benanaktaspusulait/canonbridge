import {
  HttpClient,
  HttpParams,
  environment
} from "./chunk-HHZQSEIC.js";
import {
  Injectable,
  inject,
  setClassMetadata,
  ɵɵdefineInjectable
} from "./chunk-56FG4FZN.js";

// src/app/core/services/metrics.service.ts
var MetricsService = class _MetricsService {
  http = inject(HttpClient);
  baseUrl = `${environment.api.baseUrl}/metrics`;
  getDashboardStats() {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }
  getMonitoringMetrics(window = "1h") {
    const params = new HttpParams().set("window", window);
    return this.http.get(`${this.baseUrl}/monitoring`, { params });
  }
  getPartnerHealth(window = "1h") {
    const params = new HttpParams().set("window", window);
    return this.http.get(`${this.baseUrl}/partners/health`, { params });
  }
  static \u0275fac = function MetricsService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MetricsService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _MetricsService, factory: _MetricsService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MetricsService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

export {
  MetricsService
};
//# sourceMappingURL=chunk-JW6VIVM7.js.map
