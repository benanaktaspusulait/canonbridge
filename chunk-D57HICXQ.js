import {
  HttpClient,
  environment
} from "./chunk-HHZQSEIC.js";
import {
  Injectable,
  inject,
  setClassMetadata,
  ɵɵdefineInjectable
} from "./chunk-56FG4FZN.js";

// src/app/core/services/external-system.service.ts
var ExternalSystemService = class _ExternalSystemService {
  http = inject(HttpClient);
  baseUrl = `${environment.api.baseUrl}/external-systems`;
  list() {
    return this.http.get(this.baseUrl);
  }
  getById(id) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
  listByDraft(draftId) {
    return this.http.get(`${this.baseUrl}/draft/${draftId}`);
  }
  create(connection) {
    return this.http.post(this.baseUrl, connection);
  }
  update(id, connection) {
    return this.http.put(`${this.baseUrl}/${id}`, connection);
  }
  delete(id) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  test(id, request) {
    return this.http.post(`${this.baseUrl}/${id}/test`, request);
  }
  testAdhoc(request) {
    return this.http.post(`${this.baseUrl}/test-adhoc`, request);
  }
  static \u0275fac = function ExternalSystemService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ExternalSystemService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ExternalSystemService, factory: _ExternalSystemService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ExternalSystemService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

export {
  ExternalSystemService
};
//# sourceMappingURL=chunk-D57HICXQ.js.map
