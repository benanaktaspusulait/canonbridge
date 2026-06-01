import {
  environment
} from "./chunk-FA3B2YOI.js";
import {
  HttpClient
} from "./chunk-OGO5ZH5D.js";
import {
  Injectable,
  inject,
  map,
  setClassMetadata,
  ɵɵdefineInjectable
} from "./chunk-KLG77GLC.js";

// src/app/core/services/mapping.service.ts
var MappingService = class _MappingService {
  http = inject(HttpClient);
  baseUrl = `${environment.api.baseUrl}/mapping-drafts`;
  list() {
    return this.http.get(this.baseUrl);
  }
  getById(id) {
    return this.http.get(`${this.baseUrl}/${id}`).pipe(map((draft) => {
      if (draft.source_config && typeof draft.source_config === "string") {
        try {
          const parsed = JSON.parse(draft.source_config);
          draft.source_config = JSON.stringify(parsed);
        } catch (e) {
          console.warn("Failed to parse source_config:", e);
        }
      }
      return draft;
    }));
  }
  listByPartner(partnerId) {
    return this.http.get(`${this.baseUrl}/partner/${partnerId}`);
  }
  create(draft) {
    return this.http.post(this.baseUrl, draft);
  }
  update(id, draft) {
    return this.http.put(`${this.baseUrl}/${id}`, draft);
  }
  previewRequest(id, request) {
    return this.http.post(`${this.baseUrl}/${id}/request-preview`, request);
  }
  validateRequest(id, request) {
    return this.http.post(`${this.baseUrl}/${id}/validate-request`, request);
  }
  delete(id) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  clone(id) {
    return this.http.post(`${this.baseUrl}/${id}/clone`, {});
  }
  exportMapping(id) {
    return this.http.get(`${this.baseUrl}/${id}/export`);
  }
  static \u0275fac = function MappingService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MappingService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _MappingService, factory: _MappingService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MappingService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

export {
  MappingService
};
//# sourceMappingURL=chunk-BIPK67GL.js.map
