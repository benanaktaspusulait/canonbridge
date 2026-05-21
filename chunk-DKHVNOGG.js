import {
  AuthService
} from "./chunk-KUAWUT46.js";
import {
  HttpClient,
  HttpHeaders,
  environment
} from "./chunk-HHZQSEIC.js";
import {
  Injectable,
  inject,
  setClassMetadata,
  ɵɵdefineInjectable
} from "./chunk-56FG4FZN.js";

// src/app/core/services/partner.service.ts
var PartnerService = class _PartnerService {
  http = inject(HttpClient);
  auth = inject(AuthService);
  baseUrl = `${environment.api.baseUrl}/partners`;
  getHeaders() {
    const user = this.auth.currentUser();
    let headers = new HttpHeaders();
    if (user?.tenantId) {
      headers = headers.set("X-Tenant-Id", user.tenantId);
    }
    if (user?.id) {
      headers = headers.set("X-User-Id", user.id);
    }
    return headers;
  }
  list() {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() });
  }
  getById(id) {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
  getByExternalId(externalId) {
    return this.http.get(`${this.baseUrl}/external/${externalId}`, { headers: this.getHeaders() });
  }
  create(partner) {
    return this.http.post(this.baseUrl, partner, { headers: this.getHeaders() });
  }
  update(id, partner) {
    return this.http.put(`${this.baseUrl}/${id}`, partner, { headers: this.getHeaders() });
  }
  delete(id) {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
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
//# sourceMappingURL=chunk-DKHVNOGG.js.map
