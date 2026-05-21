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

// src/app/core/services/schema.service.ts
var SchemaService = class _SchemaService {
  http = inject(HttpClient);
  baseUrl = `${environment.api.baseUrl}/schemas`;
  list() {
    return this.http.get(this.baseUrl);
  }
  getById(id) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
  listByType(schemaType) {
    return this.http.get(`${this.baseUrl}/type/${schemaType}`);
  }
  listBySubject(subject) {
    return this.http.get(`${this.baseUrl}/subject/${subject}`);
  }
  getLatestActive(subject) {
    return this.http.get(`${this.baseUrl}/subject/${subject}/latest`);
  }
  create(schema) {
    return this.http.post(this.baseUrl, schema);
  }
  update(id, schema) {
    return this.http.put(`${this.baseUrl}/${id}`, schema);
  }
  delete(id) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  validateSchema(id, request) {
    return this.http.post(`${this.baseUrl}/${id}/validate`, request);
  }
  static \u0275fac = function SchemaService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SchemaService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SchemaService, factory: _SchemaService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SchemaService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

export {
  SchemaService
};
//# sourceMappingURL=chunk-CKE3DDLF.js.map
