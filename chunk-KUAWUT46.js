import {
  Router
} from "./chunk-2VDSLNOW.js";
import {
  HttpClient,
  environment
} from "./chunk-HHZQSEIC.js";
import {
  Injectable,
  computed,
  firstValueFrom,
  inject,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-56FG4FZN.js";

// src/app/core/services/auth.service.ts
var AuthService = class _AuthService {
  http = inject(HttpClient);
  router = inject(Router);
  STORAGE_KEY = "cb_user";
  TOKEN_KEY = "cb_token";
  _currentUser = signal(this.loadFromStorage(), ...ngDevMode ? [{ debugName: "_currentUser" }] : (
    /* istanbul ignore next */
    []
  ));
  _token = signal(this.loadTokenFromStorage(), ...ngDevMode ? [{ debugName: "_token" }] : (
    /* istanbul ignore next */
    []
  ));
  currentUser = this._currentUser.asReadonly();
  isAuthenticated = computed(() => this._currentUser() !== null, ...ngDevMode ? [{ debugName: "isAuthenticated" }] : (
    /* istanbul ignore next */
    []
  ));
  userRole = computed(() => this._currentUser()?.role ?? null, ...ngDevMode ? [{ debugName: "userRole" }] : (
    /* istanbul ignore next */
    []
  ));
  currentTenant = computed(() => {
    const user = this._currentUser();
    const configuredTenant = environment.tenant;
    return {
      id: user?.tenantId ?? configuredTenant.id,
      name: user?.tenantName ?? configuredTenant.name,
      mode: "single",
      enforced: true
    };
  }, ...ngDevMode ? [{ debugName: "currentTenant" }] : (
    /* istanbul ignore next */
    []
  ));
  async login(credentials) {
    try {
      const response = await firstValueFrom(this.http.post(`${environment.api.baseUrl}/auth/login`, credentials));
      this._token.set(response.token);
      sessionStorage.setItem(this.TOKEN_KEY, response.token);
      const user = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        tenantId: response.user.tenant_id,
        // Map from snake_case to camelCase
        tenantName: this.resolveTenantName(response.user.tenant_id, response.user.tenant_name),
        avatarInitials: this.getInitials(response.user.name)
      };
      this._currentUser.set(user);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error?.error?.message || "auth.invalidCredentials"
      };
    }
  }
  logout() {
    this._currentUser.set(null);
    this._token.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(["/login"]);
  }
  getToken() {
    return this._token();
  }
  loadFromStorage() {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? this.normalizeStoredUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }
  loadTokenFromStorage() {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }
  getInitials(name) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  normalizeStoredUser(user) {
    if (!user.tenantName || user.tenantName === "Acme Corp") {
      user.tenantName = this.resolveTenantName(user.tenantId, user.tenantName);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  }
  formatTenantName(tenantId) {
    return tenantId.split(/[-_\s]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  }
  resolveTenantName(tenantId, tenantName) {
    if (tenantName && tenantName !== "Acme Corp") {
      return tenantName;
    }
    return tenantId === environment.tenant.id ? environment.tenant.name : this.formatTenantName(tenantId);
  }
  static \u0275fac = function AuthService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuthService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthService, factory: _AuthService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  AuthService
};
//# sourceMappingURL=chunk-KUAWUT46.js.map
