import {
  Divider,
  DividerModule
} from "./chunk-6MF5QH4I.js";
import {
  ToggleSwitch,
  ToggleSwitchModule
} from "./chunk-VGUSRGTU.js";
import {
  ConfirmDialog,
  ConfirmDialogModule
} from "./chunk-HTHPKFCK.js";
import {
  Toast,
  ToastModule
} from "./chunk-TJ74L5I3.js";
import "./chunk-TWIBRO5G.js";
import {
  Table,
  TableModule
} from "./chunk-7ZSNOQRT.js";
import {
  Dialog,
  DialogModule
} from "./chunk-G7EP3YQM.js";
import {
  AuthService
} from "./chunk-KUAWUT46.js";
import "./chunk-JH5IFQKL.js";
import {
  Card,
  CardModule
} from "./chunk-JLHUUKZR.js";
import {
  Tag,
  TagModule
} from "./chunk-CQHSBRSL.js";
import {
  DefaultValueAccessor,
  FormsModule,
  InputText,
  InputTextModule,
  NgControlStatus,
  NgModel
} from "./chunk-QM5AZJSI.js";
import {
  I18nPipe
} from "./chunk-KSWXOF5D.js";
import {
  Button,
  ButtonModule,
  Tooltip,
  TooltipModule
} from "./chunk-AJPSUZES.js";
import {
  I18nService
} from "./chunk-YFC4IMTE.js";
import "./chunk-2VDSLNOW.js";
import {
  ConfirmationService,
  MessageService,
  PrimeTemplate
} from "./chunk-HHZQSEIC.js";
import {
  Component,
  __spreadProps,
  __spreadValues,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleMap,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-56FG4FZN.js";

// src/app/pages/settings/settings.component.ts
var _c0 = () => ({ width: "min(36rem, calc(100vw - 2rem))" });
function SettingsComponent_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 24);
    \u0275\u0275element(1, "i", 25);
    \u0275\u0275elementStart(2, "div")(3, "div", 26);
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 27);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 2, "settings.tenant"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 4, "settings.tenantSub"));
  }
}
function SettingsComponent_ng_template_39_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 24);
    \u0275\u0275element(1, "i", 28);
    \u0275\u0275elementStart(2, "div")(3, "div", 26);
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 27);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 2, "settings.notificationsTitle"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 4, "settings.notificationsSub"));
  }
}
function SettingsComponent_ng_template_70_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 29)(1, "div")(2, "h2", 30);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 31);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "i18n");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "p-button", 32);
    \u0275\u0275pipe(9, "i18n");
    \u0275\u0275listener("onClick", function SettingsComponent_ng_template_70_Template_p_button_onClick_8_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openGenerateKey());
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 3, "settings.apiKeysTitle"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 5, "settings.apiKeysSub"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(9, 7, "settings.generateKey"));
  }
}
function SettingsComponent_ng_template_72_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "th");
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "th");
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "th");
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th");
    \u0275\u0275text(11);
    \u0275\u0275pipe(12, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "th");
    \u0275\u0275text(14);
    \u0275\u0275pipe(15, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275element(16, "th", 33);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 5, "settings.colName"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 7, "settings.colKeyPrefix"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 9, "table.status"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 11, "settings.colCreated"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 13, "settings.colLastUsed"));
  }
}
function SettingsComponent_ng_template_73_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td", 34);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td")(4, "code");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "td");
    \u0275\u0275element(7, "p-tag", 35);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "td", 36);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "td", 36);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td")(14, "p-button", 37);
    \u0275\u0275pipe(15, "i18n");
    \u0275\u0275listener("onClick", function SettingsComponent_ng_template_73_Template_p_button_onClick_14_listener($event) {
      const k_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.revokeKey(k_r4, $event));
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const k_r4 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(k_r4.name);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(k_r4.prefix);
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", k_r4.status === "active" ? "success" : "secondary")("value", \u0275\u0275pipeBind1(8, 8, "settings.keyStatus." + k_r4.status));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(k_r4.createdAt);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(k_r4.lastUsed);
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(15, 10, "settings.revoke"))("disabled", k_r4.status === "revoked");
  }
}
function SettingsComponent_Conditional_81_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "code");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "small");
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 3, "settings.generatedKey"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.generatedKey);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 5, "settings.generatedKeyHint"));
  }
}
function SettingsComponent_ng_template_82_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-button", 41);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275listener("onClick", function SettingsComponent_ng_template_82_Conditional_2_Template_p_button_onClick_0_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.generateKey());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(1, 2, "settings.generateKey"))("disabled", !ctx_r1.newKeyName.trim());
  }
}
function SettingsComponent_ng_template_82_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-button", 42);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275listener("onClick", function SettingsComponent_ng_template_82_Conditional_3_Template_p_button_onClick_0_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.copyGeneratedKey());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275property("label", \u0275\u0275pipeBind1(1, 1, "settings.copyKey"));
  }
}
function SettingsComponent_ng_template_82_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-button", 38);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275listener("onClick", function SettingsComponent_ng_template_82_Template_p_button_onClick_0_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.keyDialogVisible = false);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(2, SettingsComponent_ng_template_82_Conditional_2_Template, 2, 4, "p-button", 39)(3, SettingsComponent_ng_template_82_Conditional_3_Template, 2, 3, "p-button", 40);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("label", \u0275\u0275pipeBind1(1, 2, "settings.cancel"));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(!ctx_r1.generatedKey ? 2 : 3);
  }
}
var STORAGE_KEY = "canonbridge.settings";
var SettingsComponent = class _SettingsComponent {
  confirmation = inject(ConfirmationService);
  toast = inject(MessageService);
  i18n = inject(I18nService);
  auth = inject(AuthService);
  // ── Tenant form ───────────────────────────────────────────────────────────
  tenantName = "";
  tenantSlug = "";
  webhookUrl = "";
  // ── Notification toggles ──────────────────────────────────────────────────
  dlqAlerts = true;
  lagAlerts = true;
  emailDigest = false;
  // ── API key dialog ────────────────────────────────────────────────────────
  keyDialogVisible = false;
  newKeyName = "";
  generatedKey = "";
  apiKeys = signal([], ...ngDevMode ? [{ debugName: "apiKeys" }] : (
    /* istanbul ignore next */
    []
  ));
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.applyUserDefaults();
    this.loadSettings();
  }
  applyUserDefaults() {
    const user = this.auth.currentUser();
    if (!user)
      return;
    this.tenantName = user.tenantName;
    this.tenantSlug = user.tenantId;
  }
  loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw)
        return;
      const saved = JSON.parse(raw);
      if (saved.webhookUrl !== void 0)
        this.webhookUrl = saved.webhookUrl;
      if (saved.dlqAlerts !== void 0)
        this.dlqAlerts = saved.dlqAlerts;
      if (saved.lagAlerts !== void 0)
        this.lagAlerts = saved.lagAlerts;
      if (saved.emailDigest !== void 0)
        this.emailDigest = saved.emailDigest;
    } catch {
    }
  }
  // ── Tenant save ───────────────────────────────────────────────────────────
  saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      webhookUrl: this.webhookUrl,
      dlqAlerts: this.dlqAlerts,
      lagAlerts: this.lagAlerts,
      emailDigest: this.emailDigest
    }));
    this.toast.add({ severity: "success", summary: this.t("settings.toast.saved"), detail: this.tenantSlug });
  }
  // ── API key management ────────────────────────────────────────────────────
  openGenerateKey() {
    this.newKeyName = "";
    this.generatedKey = "";
    this.keyDialogVisible = true;
  }
  generateKey() {
    if (!this.newKeyName.trim()) {
      this.toast.add({ severity: "warn", summary: this.t("settings.toast.keyNameRequired") });
      return;
    }
    const raw = `cb_live_${crypto.randomUUID().replace(/-/g, "")}${Math.random().toString(36).slice(2, 12)}`;
    const key = {
      id: `k${Date.now()}`,
      name: this.newKeyName.trim(),
      prefix: `${raw.slice(0, 14)}\u2026`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      lastUsed: "never",
      status: "active"
    };
    this.apiKeys.update((list) => [key, ...list]);
    this.generatedKey = raw;
    this.toast.add({ severity: "success", summary: this.t("settings.toast.keyGenerated"), detail: key.name });
  }
  async copyGeneratedKey() {
    if (!this.generatedKey)
      return;
    try {
      await navigator.clipboard.writeText(this.generatedKey);
      this.toast.add({ severity: "success", summary: this.t("settings.toast.keyCopied") });
    } catch {
      this.toast.add({ severity: "error", summary: "Copy failed", detail: "Use Ctrl+C to copy manually." });
    }
  }
  revokeKey(key, event) {
    this.confirmation.confirm({
      target: event.target,
      header: this.t("settings.revokeTitle"),
      message: this.t("settings.revokeMessage", { name: key.name }),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: this.t("settings.revoke"),
      rejectLabel: this.t("settings.cancel"),
      accept: () => {
        this.apiKeys.update((list) => list.map((k) => k.id === key.id ? __spreadProps(__spreadValues({}, k), { status: "revoked", lastUsed: this.t("settings.revokedNow") }) : k));
        this.toast.add({ severity: "warn", summary: this.t("settings.toast.revoked"), detail: key.name });
      }
    });
  }
  t(key, params) {
    return this.i18n.translate(key, params);
  }
  static \u0275fac = function SettingsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SettingsComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SettingsComponent, selectors: [["app-settings"]], features: [\u0275\u0275ProvidersFeature([ConfirmationService, MessageService])], decls: 83, vars: 67, consts: [[1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "settings-grid"], ["pTemplate", "header"], [1, "field"], [1, "field-label"], ["pInputText", "", 1, "w-full", 3, "ngModelChange", "ngModel", "disabled", "readonly"], [1, "field-hint"], ["pInputText", "", "placeholder", "https://\u2026", 1, "w-full", 3, "ngModelChange", "ngModel"], [1, "card-footer"], ["icon", "pi pi-check", "size", "small", 3, "onClick", "label"], [1, "toggle-row"], [1, "toggle-label"], [1, "toggle-desc"], [3, "ngModelChange", "ngModel"], ["styleClass", "my-3"], ["styleClass", "mt-4"], ["styleClass", "p-datatable-sm", 3, "value"], ["pTemplate", "body"], [3, "visibleChange", "visible", "modal", "draggable", "header"], ["pInputText", "", "autocomplete", "off", 1, "w-full", 3, "ngModelChange", "ngModel"], [1, "generated-key"], ["pTemplate", "footer"], [1, "section-header"], [1, "pi", "pi-building", "section-icon"], [1, "section-title"], [1, "section-subtitle"], [1, "pi", "pi-bell", "section-icon"], [1, "card-header-row"], [1, "card-title"], [1, "card-subtitle"], ["icon", "pi pi-plus", "size", "small", 3, "onClick", "label"], [2, "width", "80px"], [1, "font-medium", "text-sm"], [3, "severity", "value"], [1, "text-sm", "text-color-secondary"], ["icon", "pi pi-trash", "variant", "text", "severity", "danger", "size", "small", 3, "onClick", "pTooltip", "disabled"], ["severity", "secondary", "variant", "outlined", 3, "onClick", "label"], ["icon", "pi pi-key", 3, "label", "disabled"], ["icon", "pi pi-copy", 3, "label"], ["icon", "pi pi-key", 3, "onClick", "label", "disabled"], ["icon", "pi pi-copy", 3, "onClick", "label"]], template: function SettingsComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "p-toast")(1, "p-confirmDialog");
      \u0275\u0275elementStart(2, "div", 0)(3, "div")(4, "h1", 1);
      \u0275\u0275text(5);
      \u0275\u0275pipe(6, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "p", 2);
      \u0275\u0275text(8);
      \u0275\u0275pipe(9, "i18n");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(10, "div", 3)(11, "p-card");
      \u0275\u0275template(12, SettingsComponent_ng_template_12_Template, 9, 6, "ng-template", 4);
      \u0275\u0275elementStart(13, "div", 5)(14, "label", 6);
      \u0275\u0275text(15);
      \u0275\u0275pipe(16, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "input", 7);
      \u0275\u0275twoWayListener("ngModelChange", function SettingsComponent_Template_input_ngModelChange_17_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.tenantName, $event) || (ctx.tenantName = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(18, "div", 5)(19, "label", 6);
      \u0275\u0275text(20);
      \u0275\u0275pipe(21, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "input", 7);
      \u0275\u0275twoWayListener("ngModelChange", function SettingsComponent_Template_input_ngModelChange_22_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.tenantSlug, $event) || (ctx.tenantSlug = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "small", 8);
      \u0275\u0275text(24);
      \u0275\u0275pipe(25, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(26, "div", 5)(27, "label", 6);
      \u0275\u0275text(28);
      \u0275\u0275pipe(29, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "input", 9);
      \u0275\u0275twoWayListener("ngModelChange", function SettingsComponent_Template_input_ngModelChange_30_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.webhookUrl, $event) || (ctx.webhookUrl = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(31, "small", 8);
      \u0275\u0275text(32);
      \u0275\u0275pipe(33, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275element(34, "p-divider");
      \u0275\u0275elementStart(35, "div", 10)(36, "p-button", 11);
      \u0275\u0275pipe(37, "i18n");
      \u0275\u0275listener("onClick", function SettingsComponent_Template_p_button_onClick_36_listener() {
        return ctx.saveSettings();
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(38, "p-card");
      \u0275\u0275template(39, SettingsComponent_ng_template_39_Template, 9, 6, "ng-template", 4);
      \u0275\u0275elementStart(40, "div", 12)(41, "div")(42, "div", 13);
      \u0275\u0275text(43);
      \u0275\u0275pipe(44, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(45, "div", 14);
      \u0275\u0275text(46);
      \u0275\u0275pipe(47, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(48, "p-toggleswitch", 15);
      \u0275\u0275twoWayListener("ngModelChange", function SettingsComponent_Template_p_toggleswitch_ngModelChange_48_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.dlqAlerts, $event) || (ctx.dlqAlerts = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275element(49, "p-divider", 16);
      \u0275\u0275elementStart(50, "div", 12)(51, "div")(52, "div", 13);
      \u0275\u0275text(53);
      \u0275\u0275pipe(54, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(55, "div", 14);
      \u0275\u0275text(56);
      \u0275\u0275pipe(57, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(58, "p-toggleswitch", 15);
      \u0275\u0275twoWayListener("ngModelChange", function SettingsComponent_Template_p_toggleswitch_ngModelChange_58_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.lagAlerts, $event) || (ctx.lagAlerts = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275element(59, "p-divider", 16);
      \u0275\u0275elementStart(60, "div", 12)(61, "div")(62, "div", 13);
      \u0275\u0275text(63);
      \u0275\u0275pipe(64, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(65, "div", 14);
      \u0275\u0275text(66);
      \u0275\u0275pipe(67, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(68, "p-toggleswitch", 15);
      \u0275\u0275twoWayListener("ngModelChange", function SettingsComponent_Template_p_toggleswitch_ngModelChange_68_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.emailDigest, $event) || (ctx.emailDigest = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(69, "p-card", 17);
      \u0275\u0275template(70, SettingsComponent_ng_template_70_Template, 10, 9, "ng-template", 4);
      \u0275\u0275elementStart(71, "p-table", 18);
      \u0275\u0275template(72, SettingsComponent_ng_template_72_Template, 17, 15, "ng-template", 4)(73, SettingsComponent_ng_template_73_Template, 16, 12, "ng-template", 19);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(74, "p-dialog", 20);
      \u0275\u0275pipe(75, "i18n");
      \u0275\u0275twoWayListener("visibleChange", function SettingsComponent_Template_p_dialog_visibleChange_74_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.keyDialogVisible, $event) || (ctx.keyDialogVisible = $event);
        return $event;
      });
      \u0275\u0275elementStart(76, "div", 5)(77, "label", 6);
      \u0275\u0275text(78);
      \u0275\u0275pipe(79, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(80, "input", 21);
      \u0275\u0275twoWayListener("ngModelChange", function SettingsComponent_Template_input_ngModelChange_80_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newKeyName, $event) || (ctx.newKeyName = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(81, SettingsComponent_Conditional_81_Template, 9, 7, "div", 22);
      \u0275\u0275template(82, SettingsComponent_ng_template_82_Template, 4, 4, "ng-template", 23);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 34, "settings.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 36, "settings.subtitle"));
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(16, 38, "settings.tenantName"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.tenantName);
      \u0275\u0275property("disabled", true)("readonly", true);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(21, 40, "settings.tenantSlug"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.tenantSlug);
      \u0275\u0275property("disabled", true)("readonly", true);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(25, 42, "settings.tenantLockedHint"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(29, 44, "settings.webhookUrl"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.webhookUrl);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(33, 46, "settings.webhookHint"));
      \u0275\u0275advance(4);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(37, 48, "settings.saveChanges"));
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(44, 50, "settings.dlqAlerts"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(47, 52, "settings.dlqAlertsDesc"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.dlqAlerts);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(54, 54, "settings.lagAlerts"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(57, 56, "settings.lagAlertsDesc"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.lagAlerts);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(64, 58, "settings.emailDigest"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(67, 60, "settings.emailDigestDesc"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.emailDigest);
      \u0275\u0275advance(3);
      \u0275\u0275property("value", ctx.apiKeys());
      \u0275\u0275advance(3);
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(66, _c0));
      \u0275\u0275twoWayProperty("visible", ctx.keyDialogVisible);
      \u0275\u0275property("modal", true)("draggable", false)("header", \u0275\u0275pipeBind1(75, 62, "settings.generateKey"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(79, 64, "settings.keyName"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.newKeyName);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.generatedKey ? 81 : -1);
    }
  }, dependencies: [FormsModule, DefaultValueAccessor, NgControlStatus, NgModel, ButtonModule, Button, PrimeTemplate, CardModule, Card, ConfirmDialogModule, ConfirmDialog, DialogModule, Dialog, DividerModule, Divider, InputTextModule, InputText, TableModule, Table, TagModule, Tag, ToastModule, Toast, ToggleSwitchModule, ToggleSwitch, TooltipModule, Tooltip, I18nPipe], styles: ["\n.settings-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1.5rem;\n}\n@media (max-width: 900px) {\n  .settings-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n.section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.875rem;\n  padding: 1rem 1.25rem 0;\n}\n.section-icon[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  color: var(--primary-color);\n  width: 40px;\n  height: 40px;\n  background: var(--primary-50, #eff6ff);\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.section-title[_ngcontent-%COMP%] {\n  font-size: 0.9375rem;\n  font-weight: 600;\n  color: var(--text-color);\n}\n.section-subtitle[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n}\n.field[_ngcontent-%COMP%] {\n  margin-bottom: 1.25rem;\n}\n.field-label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--text-color);\n  margin-bottom: 0.5rem;\n}\n.field-hint[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  margin-top: 0.375rem;\n}\n.card-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n}\n.toggle-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.toggle-label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--text-color);\n}\n.toggle-desc[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  margin-top: 2px;\n}\n.generated-key[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.55rem;\n  margin-top: 1rem;\n  border: 1px solid color-mix(in srgb, var(--primary-color) 32%, var(--surface-border));\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--primary-color) 6%, var(--surface-card));\n  padding: 1rem;\n}\n.generated-key[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color);\n  font-size: 0.85rem;\n  font-weight: 800;\n}\n.generated-key[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] {\n  display: block;\n  overflow-x: auto;\n  border-radius: 6px;\n  background: var(--surface-ground);\n  color: var(--text-color);\n  padding: 0.75rem;\n}\n.generated-key[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n}\n.text-sm[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n}\n.font-medium[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n/*# sourceMappingURL=settings.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SettingsComponent, [{
    type: Component,
    args: [{ selector: "app-settings", standalone: true, imports: [
      FormsModule,
      ButtonModule,
      CardModule,
      ConfirmDialogModule,
      DialogModule,
      DividerModule,
      InputTextModule,
      TableModule,
      TagModule,
      ToastModule,
      ToggleSwitchModule,
      TooltipModule,
      I18nPipe
    ], providers: [ConfirmationService, MessageService], template: `<p-toast />
<p-confirmDialog />

<div class="page-header">
  <div>
    <h1 class="page-title">{{ 'settings.title' | i18n }}</h1>
    <p class="page-subtitle">{{ 'settings.subtitle' | i18n }}</p>
  </div>
</div>

<div class="settings-grid">
  <p-card>
    <ng-template pTemplate="header">
      <div class="section-header">
        <i class="pi pi-building section-icon"></i>
        <div>
          <div class="section-title">{{ 'settings.tenant' | i18n }}</div>
          <div class="section-subtitle">{{ 'settings.tenantSub' | i18n }}</div>
        </div>
      </div>
    </ng-template>

    <div class="field">
      <label class="field-label">{{ 'settings.tenantName' | i18n }}</label>
      <input pInputText [(ngModel)]="tenantName" class="w-full" [disabled]="true" [readonly]="true" />
    </div>
    <div class="field">
      <label class="field-label">{{ 'settings.tenantSlug' | i18n }}</label>
      <input pInputText [(ngModel)]="tenantSlug" class="w-full" [disabled]="true" [readonly]="true" />
      <small class="field-hint">{{ 'settings.tenantLockedHint' | i18n }}</small>
    </div>
    <div class="field">
      <label class="field-label">{{ 'settings.webhookUrl' | i18n }}</label>
      <input pInputText [(ngModel)]="webhookUrl" class="w-full" placeholder="https://\u2026" />
      <small class="field-hint">{{ 'settings.webhookHint' | i18n }}</small>
    </div>

    <p-divider />
    <div class="card-footer">
      <p-button [label]="'settings.saveChanges' | i18n" icon="pi pi-check" size="small" (onClick)="saveSettings()" />
    </div>
  </p-card>

  <p-card>
    <ng-template pTemplate="header">
      <div class="section-header">
        <i class="pi pi-bell section-icon"></i>
        <div>
          <div class="section-title">{{ 'settings.notificationsTitle' | i18n }}</div>
          <div class="section-subtitle">{{ 'settings.notificationsSub' | i18n }}</div>
        </div>
      </div>
    </ng-template>

    <div class="toggle-row">
      <div>
        <div class="toggle-label">{{ 'settings.dlqAlerts' | i18n }}</div>
        <div class="toggle-desc">{{ 'settings.dlqAlertsDesc' | i18n }}</div>
      </div>
      <p-toggleswitch [(ngModel)]="dlqAlerts" />
    </div>
    <p-divider styleClass="my-3" />
    <div class="toggle-row">
      <div>
        <div class="toggle-label">{{ 'settings.lagAlerts' | i18n }}</div>
        <div class="toggle-desc">{{ 'settings.lagAlertsDesc' | i18n }}</div>
      </div>
      <p-toggleswitch [(ngModel)]="lagAlerts" />
    </div>
    <p-divider styleClass="my-3" />
    <div class="toggle-row">
      <div>
        <div class="toggle-label">{{ 'settings.emailDigest' | i18n }}</div>
        <div class="toggle-desc">{{ 'settings.emailDigestDesc' | i18n }}</div>
      </div>
      <p-toggleswitch [(ngModel)]="emailDigest" />
    </div>
  </p-card>
</div>

<p-card styleClass="mt-4">
  <ng-template pTemplate="header">
    <div class="card-header-row">
      <div>
        <h2 class="card-title">{{ 'settings.apiKeysTitle' | i18n }}</h2>
        <p class="card-subtitle">{{ 'settings.apiKeysSub' | i18n }}</p>
      </div>
      <p-button [label]="'settings.generateKey' | i18n" icon="pi pi-plus" size="small" (onClick)="openGenerateKey()" />
    </div>
  </ng-template>

  <p-table [value]="apiKeys()" styleClass="p-datatable-sm">
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'settings.colName' | i18n }}</th>
        <th>{{ 'settings.colKeyPrefix' | i18n }}</th>
        <th>{{ 'table.status' | i18n }}</th>
        <th>{{ 'settings.colCreated' | i18n }}</th>
        <th>{{ 'settings.colLastUsed' | i18n }}</th>
        <th style="width:80px"></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-k>
      <tr>
        <td class="font-medium text-sm">{{ k.name }}</td>
        <td><code>{{ k.prefix }}</code></td>
        <td>
          <p-tag
            [severity]="k.status === 'active' ? 'success' : 'secondary'"
            [value]="('settings.keyStatus.' + k.status) | i18n" />
        </td>
        <td class="text-sm text-color-secondary">{{ k.createdAt }}</td>
        <td class="text-sm text-color-secondary">{{ k.lastUsed }}</td>
        <td>
          <p-button
            icon="pi pi-trash"
            variant="text"
            severity="danger"
            size="small"
            (onClick)="revokeKey(k, $event)"
            [pTooltip]="'settings.revoke' | i18n"
            [disabled]="k.status === 'revoked'" />
        </td>
      </tr>
    </ng-template>
  </p-table>
</p-card>

<p-dialog
  [(visible)]="keyDialogVisible"
  [modal]="true"
  [draggable]="false"
  [style]="{ width: 'min(36rem, calc(100vw - 2rem))' }"
  [header]="'settings.generateKey' | i18n">
  <div class="field">
    <label class="field-label">{{ 'settings.keyName' | i18n }}</label>
    <input pInputText [(ngModel)]="newKeyName" class="w-full" autocomplete="off" />
  </div>

  @if (generatedKey) {
    <div class="generated-key">
      <span>{{ 'settings.generatedKey' | i18n }}</span>
      <code>{{ generatedKey }}</code>
      <small>{{ 'settings.generatedKeyHint' | i18n }}</small>
    </div>
  }

  <ng-template pTemplate="footer">
    <p-button [label]="'settings.cancel' | i18n" severity="secondary" variant="outlined" (onClick)="keyDialogVisible = false" />
    @if (!generatedKey) {
      <p-button [label]="'settings.generateKey' | i18n" icon="pi pi-key" [disabled]="!newKeyName.trim()" (onClick)="generateKey()" />
    } @else {
      <p-button [label]="'settings.copyKey' | i18n" icon="pi pi-copy" (onClick)="copyGeneratedKey()" />
    }
  </ng-template>
</p-dialog>
`, styles: ["/* src/app/pages/settings/settings.component.scss */\n.settings-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1.5rem;\n}\n@media (max-width: 900px) {\n  .settings-grid {\n    grid-template-columns: 1fr;\n  }\n}\n.section-header {\n  display: flex;\n  align-items: center;\n  gap: 0.875rem;\n  padding: 1rem 1.25rem 0;\n}\n.section-icon {\n  font-size: 1.25rem;\n  color: var(--primary-color);\n  width: 40px;\n  height: 40px;\n  background: var(--primary-50, #eff6ff);\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.section-title {\n  font-size: 0.9375rem;\n  font-weight: 600;\n  color: var(--text-color);\n}\n.section-subtitle {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n}\n.field {\n  margin-bottom: 1.25rem;\n}\n.field-label {\n  display: block;\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--text-color);\n  margin-bottom: 0.5rem;\n}\n.field-hint {\n  display: block;\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  margin-top: 0.375rem;\n}\n.card-footer {\n  display: flex;\n  justify-content: flex-end;\n}\n.toggle-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.toggle-label {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--text-color);\n}\n.toggle-desc {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  margin-top: 2px;\n}\n.generated-key {\n  display: grid;\n  gap: 0.55rem;\n  margin-top: 1rem;\n  border: 1px solid color-mix(in srgb, var(--primary-color) 32%, var(--surface-border));\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--primary-color) 6%, var(--surface-card));\n  padding: 1rem;\n}\n.generated-key span {\n  color: var(--text-color);\n  font-size: 0.85rem;\n  font-weight: 800;\n}\n.generated-key code {\n  display: block;\n  overflow-x: auto;\n  border-radius: 6px;\n  background: var(--surface-ground);\n  color: var(--text-color);\n  padding: 0.75rem;\n}\n.generated-key small {\n  color: var(--text-color-secondary);\n}\n.text-sm {\n  font-size: 0.875rem;\n}\n.font-medium {\n  font-weight: 500;\n}\n/*# sourceMappingURL=settings.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SettingsComponent, { className: "SettingsComponent", filePath: "src/app/pages/settings/settings.component.ts", lineNumber: 52 });
})();
export {
  SettingsComponent
};
//# sourceMappingURL=chunk-DL6LPL6W.js.map
