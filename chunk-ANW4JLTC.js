import {
  Divider,
  DividerModule
} from "./chunk-7JUA7Q67.js";
import {
  AuthService
} from "./chunk-XNF256NJ.js";
import "./chunk-CN6J73SX.js";
import {
  Card,
  CardModule
} from "./chunk-V7VFOMLF.js";
import {
  Tag,
  TagModule
} from "./chunk-ILW3Q6D6.js";
import {
  I18nPipe
} from "./chunk-JHIHXCEC.js";
import {
  Button,
  ButtonModule,
  Tooltip,
  TooltipModule
} from "./chunk-LABWMPEG.js";
import "./chunk-5RXXWD5O.js";
import "./chunk-FA3B2YOI.js";
import {
  PrimeTemplate
} from "./chunk-OGO5ZH5D.js";
import {
  Component,
  computed,
  inject,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-KLG77GLC.js";

// src/app/pages/tenant/tenant.component.ts
var _forTrack0 = ($index, $item) => $item.name;
var _forTrack1 = ($index, $item) => $item.titleKey;
function TenantComponent_ng_template_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 25)(1, "div")(2, "h2", 26);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 27);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "i18n");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 2, "tenant.identity.title"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 4, "tenant.identity.subtitle"));
  }
}
function TenantComponent_ng_template_57_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 25)(1, "div")(2, "h2", 26);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 27);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "i18n");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 2, "tenant.requestContext.title"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 4, "tenant.requestContext.subtitle"));
  }
}
function TenantComponent_For_60_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "code");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const header_r1 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(header_r1.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(header_r1.value);
  }
}
function TenantComponent_ng_template_62_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 25)(1, "div")(2, "h2", 26);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 27);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "i18n");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 2, "tenant.controls.title"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 4, "tenant.controls.subtitle"));
  }
}
function TenantComponent_For_65_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "section", 22)(1, "div", 28);
    \u0275\u0275element(2, "i");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 29)(4, "h3");
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p");
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "i18n");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(10, "p-tag", 30);
    \u0275\u0275pipe(11, "i18n");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const control_r2 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275classMap(control_r2.icon);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 6, control_r2.titleKey));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 8, control_r2.descriptionKey));
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", control_r2.severity)("value", \u0275\u0275pipeBind1(11, 10, control_r2.statusKey));
  }
}
var TenantComponent = class _TenantComponent {
  auth = inject(AuthService);
  tenant = this.auth.currentTenant;
  user = this.auth.currentUser;
  requestHeaders = computed(() => [
    { name: "Authorization", value: this.auth.getToken() ? "Bearer <jwt>" : "n/a" },
    { name: "Tenant (from JWT)", value: this.tenant().id },
    { name: "User (from JWT)", value: this.user()?.id ?? "n/a" }
  ], ...ngDevMode ? [{ debugName: "requestHeaders" }] : (
    /* istanbul ignore next */
    []
  ));
  controls = [
    {
      icon: "pi pi-database",
      titleKey: "tenant.controls.database.title",
      descriptionKey: "tenant.controls.database.description",
      statusKey: "tenant.controls.database.status",
      severity: "success"
    },
    {
      icon: "pi pi-lock",
      titleKey: "tenant.controls.api.title",
      descriptionKey: "tenant.controls.api.description",
      statusKey: "tenant.controls.api.status",
      severity: "success"
    },
    {
      icon: "pi pi-shield",
      titleKey: "tenant.controls.rbac.title",
      descriptionKey: "tenant.controls.rbac.description",
      statusKey: "tenant.controls.rbac.status",
      severity: "info"
    },
    {
      icon: "pi pi-history",
      titleKey: "tenant.controls.audit.title",
      descriptionKey: "tenant.controls.audit.description",
      statusKey: "tenant.controls.audit.status",
      severity: "success"
    }
  ];
  async copyTenantId() {
    await navigator.clipboard.writeText(this.tenant().id);
  }
  static \u0275fac = function TenantComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TenantComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _TenantComponent, selectors: [["app-tenant"]], decls: 72, vars: 40, consts: [[1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "page-actions"], ["severity", "success", 3, "value"], ["aria-labelledby", "tenant-name", 1, "tenant-hero"], [1, "tenant-hero-main"], ["aria-hidden", "true", 1, "tenant-avatar"], [1, "pi", "pi-building"], [1, "tenant-eyebrow"], ["id", "tenant-name"], [1, "tenant-id-row"], ["icon", "pi pi-copy", "severity", "secondary", "variant", "text", "size", "small", 3, "onClick", "pTooltip"], [1, "tenant-hero-state"], [1, "tenant-grid"], ["pTemplate", "header"], [1, "tenant-facts"], [1, "tenant-fact"], [1, "header-list"], [1, "header-row"], ["styleClass", "tenant-controls-card"], [1, "control-grid"], [1, "control-item"], [1, "tenant-note"], ["aria-hidden", "true", 1, "pi", "pi-info-circle"], [1, "card-header-row"], [1, "card-title"], [1, "card-subtitle"], ["aria-hidden", "true", 1, "control-icon"], [1, "control-copy"], [3, "severity", "value"]], template: function TenantComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div")(2, "h1", 1);
      \u0275\u0275text(3);
      \u0275\u0275pipe(4, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "p", 2);
      \u0275\u0275text(6);
      \u0275\u0275pipe(7, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(8, "div", 3);
      \u0275\u0275element(9, "p-tag", 4);
      \u0275\u0275pipe(10, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "section", 5)(12, "div", 6)(13, "div", 7);
      \u0275\u0275element(14, "i", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "div")(16, "div", 9);
      \u0275\u0275text(17);
      \u0275\u0275pipe(18, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "h2", 10);
      \u0275\u0275text(20);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "div", 11)(22, "code");
      \u0275\u0275text(23);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "p-button", 12);
      \u0275\u0275pipe(25, "i18n");
      \u0275\u0275listener("onClick", function TenantComponent_Template_p_button_onClick_24_listener() {
        return ctx.copyTenantId();
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(26, "div", 13)(27, "span");
      \u0275\u0275text(28);
      \u0275\u0275pipe(29, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "strong");
      \u0275\u0275text(31);
      \u0275\u0275pipe(32, "i18n");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(33, "div", 14)(34, "p-card");
      \u0275\u0275template(35, TenantComponent_ng_template_35_Template, 8, 6, "ng-template", 15);
      \u0275\u0275elementStart(36, "div", 16)(37, "div", 17)(38, "span");
      \u0275\u0275text(39);
      \u0275\u0275pipe(40, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(41, "strong");
      \u0275\u0275text(42);
      \u0275\u0275pipe(43, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(44, "div", 17)(45, "span");
      \u0275\u0275text(46);
      \u0275\u0275pipe(47, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(48, "strong");
      \u0275\u0275text(49);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(50, "div", 17)(51, "span");
      \u0275\u0275text(52);
      \u0275\u0275pipe(53, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "strong");
      \u0275\u0275text(55);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(56, "p-card");
      \u0275\u0275template(57, TenantComponent_ng_template_57_Template, 8, 6, "ng-template", 15);
      \u0275\u0275elementStart(58, "div", 18);
      \u0275\u0275repeaterCreate(59, TenantComponent_For_60_Template, 5, 2, "div", 19, _forTrack0);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(61, "p-card", 20);
      \u0275\u0275template(62, TenantComponent_ng_template_62_Template, 8, 6, "ng-template", 15);
      \u0275\u0275elementStart(63, "div", 21);
      \u0275\u0275repeaterCreate(64, TenantComponent_For_65_Template, 12, 12, "section", 22, _forTrack1);
      \u0275\u0275elementEnd();
      \u0275\u0275element(66, "p-divider");
      \u0275\u0275elementStart(67, "div", 23);
      \u0275\u0275element(68, "i", 24);
      \u0275\u0275elementStart(69, "span");
      \u0275\u0275text(70);
      \u0275\u0275pipe(71, "i18n");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      let tmp_12_0;
      let tmp_14_0;
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 16, "tenant.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 18, "tenant.subtitle"));
      \u0275\u0275advance(3);
      \u0275\u0275property("value", \u0275\u0275pipeBind1(10, 20, "tenant.mode.single"));
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 22, "tenant.currentTenant"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.tenant().name);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.tenant().id);
      \u0275\u0275advance();
      \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(25, 24, "tenant.copyId"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(29, 26, "tenant.enforcement"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(32, 28, "tenant.enforced"));
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(40, 30, "tenant.identity.mode"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(43, 32, "tenant.mode.single"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(47, 34, "tenant.identity.user"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(((tmp_12_0 = ctx.user()) == null ? null : tmp_12_0.name) ?? "n/a");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(53, 36, "tenant.identity.role"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(((tmp_14_0 = ctx.user()) == null ? null : tmp_14_0.role) ?? "n/a");
      \u0275\u0275advance(4);
      \u0275\u0275repeater(ctx.requestHeaders());
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.controls);
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(71, 38, "tenant.note"));
    }
  }, dependencies: [ButtonModule, Button, PrimeTemplate, CardModule, Card, DividerModule, Divider, TagModule, Tag, TooltipModule, Tooltip, I18nPipe], styles: ["\n.tenant-hero[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1.25rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background:\n    linear-gradient(\n      135deg,\n      color-mix(in srgb, var(--surface-card) 90%, var(--teal-50, #f0fdfa)),\n      var(--surface-card));\n  padding: 1.25rem;\n  margin-bottom: 1.5rem;\n}\n.tenant-hero-main[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  min-width: 0;\n  gap: 1rem;\n}\n.tenant-avatar[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 4rem;\n  height: 4rem;\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--teal-500, #14b8a6) 16%, var(--surface-card));\n  color: var(--teal-700, #0f766e);\n  flex: 0 0 auto;\n}\n.tenant-avatar[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 1.55rem;\n}\n.tenant-eyebrow[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.72rem;\n  font-weight: 800;\n  letter-spacing: 0;\n  text-transform: uppercase;\n}\n.tenant-hero[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0.15rem 0 0.55rem;\n  color: var(--text-color);\n  font-size: 1.65rem;\n  font-weight: 800;\n  letter-spacing: 0;\n}\n.tenant-id-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  min-width: 0;\n}\n.tenant-id-row[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.tenant-hero-state[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.2rem;\n  min-width: 11rem;\n  border-left: 1px solid var(--surface-border);\n  padding-left: 1.25rem;\n}\n.tenant-hero-state[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n  font-weight: 700;\n}\n.tenant-hero-state[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text-color);\n  font-size: 1rem;\n}\n.tenant-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);\n  gap: 1.25rem;\n  margin-bottom: 1.25rem;\n}\n.tenant-facts[_ngcontent-%COMP%], \n.header-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.75rem;\n}\n.tenant-fact[_ngcontent-%COMP%], \n.header-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  border-bottom: 1px solid var(--surface-border);\n  padding: 0.25rem 0 0.75rem;\n}\n.tenant-fact[_ngcontent-%COMP%]:last-child, \n.header-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: 0;\n  padding-bottom: 0.25rem;\n}\n.tenant-fact[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.header-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.85rem;\n}\n.tenant-fact[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text-color);\n  font-size: 0.92rem;\n  text-align: right;\n}\n.header-row[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] {\n  max-width: 18rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.tenant-controls-card[_ngcontent-%COMP%] {\n  margin-top: 0;\n}\n.control-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 0.9rem;\n}\n.control-item[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 2.75rem minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 0.85rem;\n  min-height: 5.2rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-card);\n  padding: 0.9rem;\n}\n.control-icon[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 2.75rem;\n  height: 2.75rem;\n  border-radius: 8px;\n  background: var(--surface-100);\n  color: var(--primary-color);\n}\n.control-copy[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 0.25rem;\n  color: var(--text-color);\n  font-size: 0.92rem;\n}\n.control-copy[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-color-secondary);\n  font-size: 0.8rem;\n  line-height: 1.45;\n}\n.tenant-note[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.6rem;\n  color: var(--text-color-secondary);\n  font-size: 0.86rem;\n  line-height: 1.5;\n}\n.tenant-note[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  color: var(--primary-color);\n  margin-top: 0.1rem;\n}\n@media (max-width: 960px) {\n  .tenant-hero[_ngcontent-%COMP%], \n   .tenant-hero-main[_ngcontent-%COMP%], \n   .tenant-fact[_ngcontent-%COMP%], \n   .header-row[_ngcontent-%COMP%] {\n    align-items: flex-start;\n  }\n  .tenant-hero[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .tenant-hero-state[_ngcontent-%COMP%] {\n    width: 100%;\n    border-left: 0;\n    border-top: 1px solid var(--surface-border);\n    padding: 1rem 0 0;\n  }\n  .tenant-grid[_ngcontent-%COMP%], \n   .control-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .control-item[_ngcontent-%COMP%] {\n    grid-template-columns: 2.75rem minmax(0, 1fr);\n  }\n  .control-item[_ngcontent-%COMP%]   p-tag[_ngcontent-%COMP%] {\n    grid-column: 2;\n    justify-self: start;\n  }\n}\n/*# sourceMappingURL=tenant.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TenantComponent, [{
    type: Component,
    args: [{ selector: "app-tenant", standalone: true, imports: [ButtonModule, CardModule, DividerModule, TagModule, TooltipModule, I18nPipe], template: `<div class="page-header">
  <div>
    <h1 class="page-title">{{ 'tenant.title' | i18n }}</h1>
    <p class="page-subtitle">{{ 'tenant.subtitle' | i18n }}</p>
  </div>
  <div class="page-actions">
    <p-tag severity="success" [value]="'tenant.mode.single' | i18n" />
  </div>
</div>

<section class="tenant-hero" aria-labelledby="tenant-name">
  <div class="tenant-hero-main">
    <div class="tenant-avatar" aria-hidden="true">
      <i class="pi pi-building"></i>
    </div>
    <div>
      <div class="tenant-eyebrow">{{ 'tenant.currentTenant' | i18n }}</div>
      <h2 id="tenant-name">{{ tenant().name }}</h2>
      <div class="tenant-id-row">
        <code>{{ tenant().id }}</code>
        <p-button
          icon="pi pi-copy"
          severity="secondary"
          variant="text"
          size="small"
          [pTooltip]="'tenant.copyId' | i18n"
          (onClick)="copyTenantId()" />
      </div>
    </div>
  </div>

  <div class="tenant-hero-state">
    <span>{{ 'tenant.enforcement' | i18n }}</span>
    <strong>{{ 'tenant.enforced' | i18n }}</strong>
  </div>
</section>

<div class="tenant-grid">
  <p-card>
    <ng-template pTemplate="header">
      <div class="card-header-row">
        <div>
          <h2 class="card-title">{{ 'tenant.identity.title' | i18n }}</h2>
          <p class="card-subtitle">{{ 'tenant.identity.subtitle' | i18n }}</p>
        </div>
      </div>
    </ng-template>

    <div class="tenant-facts">
      <div class="tenant-fact">
        <span>{{ 'tenant.identity.mode' | i18n }}</span>
        <strong>{{ 'tenant.mode.single' | i18n }}</strong>
      </div>
      <div class="tenant-fact">
        <span>{{ 'tenant.identity.user' | i18n }}</span>
        <strong>{{ user()?.name ?? 'n/a' }}</strong>
      </div>
      <div class="tenant-fact">
        <span>{{ 'tenant.identity.role' | i18n }}</span>
        <strong>{{ user()?.role ?? 'n/a' }}</strong>
      </div>
    </div>
  </p-card>

  <p-card>
    <ng-template pTemplate="header">
      <div class="card-header-row">
        <div>
          <h2 class="card-title">{{ 'tenant.requestContext.title' | i18n }}</h2>
          <p class="card-subtitle">{{ 'tenant.requestContext.subtitle' | i18n }}</p>
        </div>
      </div>
    </ng-template>

    <div class="header-list">
      @for (header of requestHeaders(); track header.name) {
        <div class="header-row">
          <span>{{ header.name }}</span>
          <code>{{ header.value }}</code>
        </div>
      }
    </div>
  </p-card>
</div>

<p-card styleClass="tenant-controls-card">
  <ng-template pTemplate="header">
    <div class="card-header-row">
      <div>
        <h2 class="card-title">{{ 'tenant.controls.title' | i18n }}</h2>
        <p class="card-subtitle">{{ 'tenant.controls.subtitle' | i18n }}</p>
      </div>
    </div>
  </ng-template>

  <div class="control-grid">
    @for (control of controls; track control.titleKey) {
      <section class="control-item">
        <div class="control-icon" aria-hidden="true">
          <i [class]="control.icon"></i>
        </div>
        <div class="control-copy">
          <h3>{{ control.titleKey | i18n }}</h3>
          <p>{{ control.descriptionKey | i18n }}</p>
        </div>
        <p-tag [severity]="control.severity" [value]="control.statusKey | i18n" />
      </section>
    }
  </div>

  <p-divider />

  <div class="tenant-note">
    <i class="pi pi-info-circle" aria-hidden="true"></i>
    <span>{{ 'tenant.note' | i18n }}</span>
  </div>
</p-card>
`, styles: ["/* src/app/pages/tenant/tenant.component.scss */\n.tenant-hero {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1.25rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background:\n    linear-gradient(\n      135deg,\n      color-mix(in srgb, var(--surface-card) 90%, var(--teal-50, #f0fdfa)),\n      var(--surface-card));\n  padding: 1.25rem;\n  margin-bottom: 1.5rem;\n}\n.tenant-hero-main {\n  display: flex;\n  align-items: center;\n  min-width: 0;\n  gap: 1rem;\n}\n.tenant-avatar {\n  display: grid;\n  place-items: center;\n  width: 4rem;\n  height: 4rem;\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--teal-500, #14b8a6) 16%, var(--surface-card));\n  color: var(--teal-700, #0f766e);\n  flex: 0 0 auto;\n}\n.tenant-avatar i {\n  font-size: 1.55rem;\n}\n.tenant-eyebrow {\n  color: var(--text-color-secondary);\n  font-size: 0.72rem;\n  font-weight: 800;\n  letter-spacing: 0;\n  text-transform: uppercase;\n}\n.tenant-hero h2 {\n  margin: 0.15rem 0 0.55rem;\n  color: var(--text-color);\n  font-size: 1.65rem;\n  font-weight: 800;\n  letter-spacing: 0;\n}\n.tenant-id-row {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  min-width: 0;\n}\n.tenant-id-row code {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.tenant-hero-state {\n  display: grid;\n  gap: 0.2rem;\n  min-width: 11rem;\n  border-left: 1px solid var(--surface-border);\n  padding-left: 1.25rem;\n}\n.tenant-hero-state span {\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n  font-weight: 700;\n}\n.tenant-hero-state strong {\n  color: var(--text-color);\n  font-size: 1rem;\n}\n.tenant-grid {\n  display: grid;\n  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);\n  gap: 1.25rem;\n  margin-bottom: 1.25rem;\n}\n.tenant-facts,\n.header-list {\n  display: grid;\n  gap: 0.75rem;\n}\n.tenant-fact,\n.header-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  border-bottom: 1px solid var(--surface-border);\n  padding: 0.25rem 0 0.75rem;\n}\n.tenant-fact:last-child,\n.header-row:last-child {\n  border-bottom: 0;\n  padding-bottom: 0.25rem;\n}\n.tenant-fact span,\n.header-row span {\n  color: var(--text-color-secondary);\n  font-size: 0.85rem;\n}\n.tenant-fact strong {\n  color: var(--text-color);\n  font-size: 0.92rem;\n  text-align: right;\n}\n.header-row code {\n  max-width: 18rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.tenant-controls-card {\n  margin-top: 0;\n}\n.control-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 0.9rem;\n}\n.control-item {\n  display: grid;\n  grid-template-columns: 2.75rem minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 0.85rem;\n  min-height: 5.2rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-card);\n  padding: 0.9rem;\n}\n.control-icon {\n  display: grid;\n  place-items: center;\n  width: 2.75rem;\n  height: 2.75rem;\n  border-radius: 8px;\n  background: var(--surface-100);\n  color: var(--primary-color);\n}\n.control-copy h3 {\n  margin: 0 0 0.25rem;\n  color: var(--text-color);\n  font-size: 0.92rem;\n}\n.control-copy p {\n  margin: 0;\n  color: var(--text-color-secondary);\n  font-size: 0.8rem;\n  line-height: 1.45;\n}\n.tenant-note {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.6rem;\n  color: var(--text-color-secondary);\n  font-size: 0.86rem;\n  line-height: 1.5;\n}\n.tenant-note i {\n  color: var(--primary-color);\n  margin-top: 0.1rem;\n}\n@media (max-width: 960px) {\n  .tenant-hero,\n  .tenant-hero-main,\n  .tenant-fact,\n  .header-row {\n    align-items: flex-start;\n  }\n  .tenant-hero {\n    flex-direction: column;\n  }\n  .tenant-hero-state {\n    width: 100%;\n    border-left: 0;\n    border-top: 1px solid var(--surface-border);\n    padding: 1rem 0 0;\n  }\n  .tenant-grid,\n  .control-grid {\n    grid-template-columns: 1fr;\n  }\n  .control-item {\n    grid-template-columns: 2.75rem minmax(0, 1fr);\n  }\n  .control-item p-tag {\n    grid-column: 2;\n    justify-self: start;\n  }\n}\n/*# sourceMappingURL=tenant.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(TenantComponent, { className: "TenantComponent", filePath: "src/app/pages/tenant/tenant.component.ts", lineNumber: 25 });
})();
export {
  TenantComponent
};
//# sourceMappingURL=chunk-ANW4JLTC.js.map
