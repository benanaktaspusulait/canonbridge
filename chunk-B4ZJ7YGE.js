import {
  environment
} from "./chunk-FA3B2YOI.js";
import {
  HttpClient
} from "./chunk-OGO5ZH5D.js";
import {
  Injectable,
  inject,
  setClassMetadata,
  ɵɵdefineInjectable
} from "./chunk-KLG77GLC.js";

// src/app/core/services/partner.service.ts
var PartnerService = class _PartnerService {
  http = inject(HttpClient);
  baseUrl = `${environment.api.baseUrl}/partners`;
  // [H2] No custom tenant/user headers — interceptor sends Bearer token,
  // backend derives identity from JWT claims.
  list() {
    return this.http.get(this.baseUrl);
  }
  getById(id) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
  getByExternalId(externalId) {
    return this.http.get(`${this.baseUrl}/external/${externalId}`);
  }
  create(partner) {
    return this.http.post(this.baseUrl, partner);
  }
  update(id, partner) {
    return this.http.put(`${this.baseUrl}/${id}`, partner);
  }
  delete(id) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  static \u0275fac = function PartnerService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _PartnerService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _PartnerService, factory: _PartnerService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PartnerService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

export {
  PartnerService
};
//# sourceMappingURL=chunk-B4ZJ7YGE.js.map
