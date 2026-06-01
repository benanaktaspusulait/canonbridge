import {
  TabsModule
} from "./chunk-4SNQBPI3.js";
import {
  AuthService
} from "./chunk-XNF256NJ.js";
import {
  Router
} from "./chunk-CN6J73SX.js";
import {
  Toast,
  ToastModule
} from "./chunk-IWXISTMZ.js";
import "./chunk-BYX7PGOZ.js";
import {
  TableModule
} from "./chunk-NBT7AZAN.js";
import {
  Dialog,
  DialogModule
} from "./chunk-7IHEPO3A.js";
import "./chunk-IZG4GOGI.js";
import {
  Card,
  CardModule
} from "./chunk-V7VFOMLF.js";
import {
  Tag,
  TagModule
} from "./chunk-ILW3Q6D6.js";
import "./chunk-Z342JBET.js";
import {
  BaseComponent,
  Bind,
  Button,
  ButtonModule,
  PARENT_INSTANCE
} from "./chunk-LABWMPEG.js";
import {
  environment
} from "./chunk-FA3B2YOI.js";
import {
  BaseStyle,
  CommonModule,
  DatePipe,
  HttpClient,
  MessageService,
  NgIf,
  NgTemplateOutlet,
  PrimeTemplate,
  SharedModule
} from "./chunk-OGO5ZH5D.js";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  numberAttribute,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵHostDirectivesFeature,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵqueryRefresh,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleMap,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-KLG77GLC.js";

// node_modules/@primeuix/styles/dist/progressbar/index.mjs
var style = "\n    .p-progressbar {\n        display: block;\n        position: relative;\n        overflow: hidden;\n        height: dt('progressbar.height');\n        background: dt('progressbar.background');\n        border-radius: dt('progressbar.border.radius');\n    }\n\n    .p-progressbar-value {\n        margin: 0;\n        background: dt('progressbar.value.background');\n    }\n\n    .p-progressbar-label {\n        color: dt('progressbar.label.color');\n        font-size: dt('progressbar.label.font.size');\n        font-weight: dt('progressbar.label.font.weight');\n    }\n\n    .p-progressbar-determinate .p-progressbar-value {\n        height: 100%;\n        width: 0%;\n        position: absolute;\n        display: none;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        overflow: hidden;\n        transition: width 1s ease-in-out;\n    }\n\n    .p-progressbar-determinate .p-progressbar-label {\n        display: inline-flex;\n    }\n\n    .p-progressbar-indeterminate .p-progressbar-value::before {\n        content: '';\n        position: absolute;\n        background: inherit;\n        inset-block-start: 0;\n        inset-inline-start: 0;\n        inset-block-end: 0;\n        will-change: inset-inline-start, inset-inline-end;\n        animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n    }\n\n    .p-progressbar-indeterminate .p-progressbar-value::after {\n        content: '';\n        position: absolute;\n        background: inherit;\n        inset-block-start: 0;\n        inset-inline-start: 0;\n        inset-block-end: 0;\n        will-change: inset-inline-start, inset-inline-end;\n        animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;\n        animation-delay: 1.15s;\n    }\n\n    @keyframes p-progressbar-indeterminate-anim {\n        0% {\n            inset-inline-start: -35%;\n            inset-inline-end: 100%;\n        }\n        60% {\n            inset-inline-start: 100%;\n            inset-inline-end: -90%;\n        }\n        100% {\n            inset-inline-start: 100%;\n            inset-inline-end: -90%;\n        }\n    }\n    @-webkit-keyframes p-progressbar-indeterminate-anim {\n        0% {\n            inset-inline-start: -35%;\n            inset-inline-end: 100%;\n        }\n        60% {\n            inset-inline-start: 100%;\n            inset-inline-end: -90%;\n        }\n        100% {\n            inset-inline-start: 100%;\n            inset-inline-end: -90%;\n        }\n    }\n\n    @keyframes p-progressbar-indeterminate-anim-short {\n        0% {\n            inset-inline-start: -200%;\n            inset-inline-end: 100%;\n        }\n        60% {\n            inset-inline-start: 107%;\n            inset-inline-end: -8%;\n        }\n        100% {\n            inset-inline-start: 107%;\n            inset-inline-end: -8%;\n        }\n    }\n    @-webkit-keyframes p-progressbar-indeterminate-anim-short {\n        0% {\n            inset-inline-start: -200%;\n            inset-inline-end: 100%;\n        }\n        60% {\n            inset-inline-start: 107%;\n            inset-inline-end: -8%;\n        }\n        100% {\n            inset-inline-start: 107%;\n            inset-inline-end: -8%;\n        }\n    }\n";

// node_modules/primeng/fesm2022/primeng-progressbar.mjs
var _c0 = ["content"];
var _c1 = (a0) => ({
  $implicit: a0
});
function ProgressBar_div_0_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275styleProp("display", ctx_r0.value != null && ctx_r0.value !== 0 ? "flex" : "none");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", ctx_r0.value, "", ctx_r0.unit);
  }
}
function ProgressBar_div_0_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function ProgressBar_div_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2)(1, "div", 2);
    \u0275\u0275template(2, ProgressBar_div_0_div_2_Template, 2, 4, "div", 3)(3, ProgressBar_div_0_ng_container_3_Template, 1, 0, "ng-container", 4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r0.cn(ctx_r0.cx("value"), ctx_r0.valueStyleClass));
    \u0275\u0275styleProp("width", ctx_r0.value + "%")("display", "flex")("background", ctx_r0.color);
    \u0275\u0275property("pBind", ctx_r0.ptm("value"));
    \u0275\u0275attribute("data-p", ctx_r0.dataP);
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r0.cx("label"));
    \u0275\u0275property("pBind", ctx_r0.ptm("label"));
    \u0275\u0275attribute("data-p", ctx_r0.dataP);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.showValue && !ctx_r0.contentTemplate && !ctx_r0._contentTemplate);
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r0.contentTemplate || ctx_r0._contentTemplate)("ngTemplateOutletContext", \u0275\u0275pureFunction1(17, _c1, ctx_r0.value));
  }
}
function ProgressBar_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 2);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r0.cn(ctx_r0.cx("value"), ctx_r0.valueStyleClass));
    \u0275\u0275styleProp("background", ctx_r0.color);
    \u0275\u0275property("pBind", ctx_r0.ptm("value"));
    \u0275\u0275attribute("data-p", ctx_r0.dataP);
  }
}
var classes = {
  root: ({
    instance
  }) => ["p-progressbar p-component", {
    "p-progressbar-determinate": instance.mode == "determinate",
    "p-progressbar-indeterminate": instance.mode == "indeterminate"
  }],
  value: "p-progressbar-value",
  label: "p-progressbar-label"
};
var ProgressBarStyle = class _ProgressBarStyle extends BaseStyle {
  name = "progressbar";
  style = style;
  classes = classes;
  static \u0275fac = /* @__PURE__ */ (() => {
    let \u0275ProgressBarStyle_BaseFactory;
    return function ProgressBarStyle_Factory(__ngFactoryType__) {
      return (\u0275ProgressBarStyle_BaseFactory || (\u0275ProgressBarStyle_BaseFactory = \u0275\u0275getInheritedFactory(_ProgressBarStyle)))(__ngFactoryType__ || _ProgressBarStyle);
    };
  })();
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _ProgressBarStyle,
    factory: _ProgressBarStyle.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ProgressBarStyle, [{
    type: Injectable
  }], null, null);
})();
var ProgressBarClasses;
(function(ProgressBarClasses2) {
  ProgressBarClasses2["root"] = "p-progressbar";
  ProgressBarClasses2["value"] = "p-progressbar-value";
  ProgressBarClasses2["label"] = "p-progressbar-label";
})(ProgressBarClasses || (ProgressBarClasses = {}));
var PROGRESSBAR_INSTANCE = new InjectionToken("PROGRESSBAR_INSTANCE");
var ProgressBar = class _ProgressBar extends BaseComponent {
  componentName = "ProgressBar";
  $pcProgressBar = inject(PROGRESSBAR_INSTANCE, {
    optional: true,
    skipSelf: true
  }) ?? void 0;
  bindDirectiveInstance = inject(Bind, {
    self: true
  });
  /**
   * Current value of the progress.
   * @group Props
   */
  value;
  /**
   * Whether to display the progress bar value.
   * @group Props
   */
  showValue = true;
  /**
   * Style class of the element.
   * @deprecated since v20.0.0, use `class` instead.
   * @group Props
   */
  styleClass;
  /**
   * Style class of the value element.
   * @group Props
   */
  valueStyleClass;
  /**
   * Unit sign appended to the value.
   * @group Props
   */
  unit = "%";
  /**
   * Defines the mode of the progress
   * @defaultValue 'determinate'
   * @group Props
   */
  mode = "determinate";
  /**
   * Color for the background of the progress.
   * @group Props
   */
  color;
  /**
   * Template of the content.
   * @param {ProgressBarContentTemplateContext} context - content context.
   * @see {@link ProgressBarContentTemplateContext}
   * @group Templates
   */
  contentTemplate;
  onAfterViewChecked() {
    this.bindDirectiveInstance.setAttrs(this.ptms(["host", "root"]));
  }
  _componentStyle = inject(ProgressBarStyle);
  templates;
  _contentTemplate;
  onAfterContentInit() {
    this.templates?.forEach((item) => {
      switch (item.getType()) {
        case "content":
          this._contentTemplate = item.template;
          break;
        default:
          this._contentTemplate = item.template;
      }
    });
  }
  get dataP() {
    return this.cn({
      determinate: this.mode === "determinate",
      indeterminate: this.mode === "indeterminate"
    });
  }
  static \u0275fac = /* @__PURE__ */ (() => {
    let \u0275ProgressBar_BaseFactory;
    return function ProgressBar_Factory(__ngFactoryType__) {
      return (\u0275ProgressBar_BaseFactory || (\u0275ProgressBar_BaseFactory = \u0275\u0275getInheritedFactory(_ProgressBar)))(__ngFactoryType__ || _ProgressBar);
    };
  })();
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _ProgressBar,
    selectors: [["p-progressBar"], ["p-progressbar"], ["p-progress-bar"]],
    contentQueries: function ProgressBar_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        \u0275\u0275contentQuery(dirIndex, _c0, 4)(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.contentTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.templates = _t);
      }
    },
    hostAttrs: ["role", "progressbar"],
    hostVars: 7,
    hostBindings: function ProgressBar_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275attribute("aria-valuemin", 0)("aria-valuenow", ctx.value)("aria-valuemax", 100)("aria-level", ctx.value + ctx.unit)("data-p", ctx.dataP);
        \u0275\u0275classMap(ctx.cn(ctx.cx("root"), ctx.styleClass));
      }
    },
    inputs: {
      value: [2, "value", "value", numberAttribute],
      showValue: [2, "showValue", "showValue", booleanAttribute],
      styleClass: "styleClass",
      valueStyleClass: "valueStyleClass",
      unit: "unit",
      mode: "mode",
      color: "color"
    },
    features: [\u0275\u0275ProvidersFeature([ProgressBarStyle, {
      provide: PROGRESSBAR_INSTANCE,
      useExisting: _ProgressBar
    }, {
      provide: PARENT_INSTANCE,
      useExisting: _ProgressBar
    }]), \u0275\u0275HostDirectivesFeature([Bind]), \u0275\u0275InheritDefinitionFeature],
    decls: 2,
    vars: 2,
    consts: [[3, "class", "pBind", "width", "display", "background", 4, "ngIf"], [3, "class", "pBind", "background", 4, "ngIf"], [3, "pBind"], [3, "display", 4, "ngIf"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"]],
    template: function ProgressBar_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275template(0, ProgressBar_div_0_Template, 4, 19, "div", 0)(1, ProgressBar_div_1_Template, 1, 6, "div", 1);
      }
      if (rf & 2) {
        \u0275\u0275property("ngIf", ctx.mode === "determinate");
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.mode === "indeterminate");
      }
    },
    dependencies: [CommonModule, NgIf, NgTemplateOutlet, SharedModule, Bind],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ProgressBar, [{
    type: Component,
    args: [{
      selector: "p-progressBar, p-progressbar, p-progress-bar",
      standalone: true,
      imports: [CommonModule, SharedModule, Bind],
      template: `
        <div *ngIf="mode === 'determinate'" [class]="cn(cx('value'), valueStyleClass)" [pBind]="ptm('value')" [style.width]="value + '%'" [style.display]="'flex'" [style.background]="color" [attr.data-p]="dataP">
            <div [class]="cx('label')" [pBind]="ptm('label')" [attr.data-p]="dataP">
                <div *ngIf="showValue && !contentTemplate && !_contentTemplate" [style.display]="value != null && value !== 0 ? 'flex' : 'none'">{{ value }}{{ unit }}</div>
                <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate; context: { $implicit: value }"></ng-container>
            </div>
        </div>
        <div *ngIf="mode === 'indeterminate'" [class]="cn(cx('value'), valueStyleClass)" [pBind]="ptm('value')" [style.background]="color" [attr.data-p]="dataP"></div>
    `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [ProgressBarStyle, {
        provide: PROGRESSBAR_INSTANCE,
        useExisting: ProgressBar
      }, {
        provide: PARENT_INSTANCE,
        useExisting: ProgressBar
      }],
      host: {
        role: "progressbar",
        "[attr.aria-valuemin]": "0",
        "[attr.aria-valuenow]": "value",
        "[attr.aria-valuemax]": "100",
        "[attr.aria-level]": "value + unit",
        "[class]": "cn(cx('root'), styleClass)",
        "[attr.data-p]": "dataP"
      },
      hostDirectives: [Bind]
    }]
  }], null, {
    value: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    showValue: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    styleClass: [{
      type: Input
    }],
    valueStyleClass: [{
      type: Input
    }],
    unit: [{
      type: Input
    }],
    mode: [{
      type: Input
    }],
    color: [{
      type: Input
    }],
    contentTemplate: [{
      type: ContentChild,
      args: ["content", {
        descendants: false
      }]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var ProgressBarModule = class _ProgressBarModule {
  static \u0275fac = function ProgressBarModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ProgressBarModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ProgressBarModule,
    imports: [ProgressBar, SharedModule],
    exports: [ProgressBar, SharedModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    imports: [ProgressBar, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ProgressBarModule, [{
    type: NgModule,
    args: [{
      imports: [ProgressBar, SharedModule],
      exports: [ProgressBar, SharedModule]
    }]
  }], null, null);
})();

// src/app/core/services/billing.service.ts
var BillingService = class _BillingService {
  http = inject(HttpClient);
  auth = inject(AuthService);
  baseUrl = `${environment.api.baseUrl}/organizations`;
  plansUrl = `${environment.api.baseUrl}/plans`;
  getOrgId() {
    const user = this.auth.currentUser();
    if (!user?.tenantId) {
      throw new Error("BillingService: No tenant context available");
    }
    return user.tenantId;
  }
  // Plans
  getPlans() {
    return this.http.get(this.plansUrl);
  }
  getPlan(code) {
    return this.http.get(`${this.plansUrl}/${code}`);
  }
  // Subscription
  getSubscription() {
    const orgId = this.getOrgId();
    return this.http.get(`${this.baseUrl}/${orgId}/subscription`);
  }
  // Usage & Entitlements
  getUsageSummary() {
    const orgId = this.getOrgId();
    return this.http.get(`${this.baseUrl}/${orgId}/usage`);
  }
  getUsageHistory(days = 30, metric) {
    const orgId = this.getOrgId();
    let url = `${this.baseUrl}/${orgId}/usage/history?days=${days}`;
    if (metric)
      url += `&metric=${metric}`;
    return this.http.get(url);
  }
  getEntitlements() {
    const orgId = this.getOrgId();
    return this.http.get(`${this.baseUrl}/${orgId}/usage/entitlements`);
  }
  static \u0275fac = function BillingService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BillingService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _BillingService, factory: _BillingService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BillingService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/pages/billing/billing.component.ts
var _c02 = () => ({ width: "650px" });
var _c12 = () => ({ height: "8px" });
var _forTrack0 = ($index, $item) => $item.code;
var _forTrack1 = ($index, $item) => $item.feature_key;
function BillingComponent_Conditional_10_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 29);
    \u0275\u0275element(1, "i", 30);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "date");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sub_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Cancels on ", \u0275\u0275pipeBind2(3, 1, sub_r1.cancel_at, "mediumDate"), " ");
  }
}
function BillingComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5)(1, "div", 23)(2, "h2", 24);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "p-tag", 25);
    \u0275\u0275elementStart(5, "span", 26);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 27)(8, "span", 28);
    \u0275\u0275text(9, "Current period:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span");
    \u0275\u0275text(11);
    \u0275\u0275pipe(12, "date");
    \u0275\u0275pipe(13, "date");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(14, BillingComponent_Conditional_10_Conditional_14_Template, 4, 4, "div", 29);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sub_r1 = ctx;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(sub_r1.plan_name);
    \u0275\u0275advance();
    \u0275\u0275property("value", sub_r1.status)("severity", ctx_r1.getStatusSeverity(sub_r1.status));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(sub_r1.billing_cycle);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate2("", \u0275\u0275pipeBind2(12, 7, sub_r1.current_period_start, "mediumDate"), " \u2014 ", \u0275\u0275pipeBind2(13, 10, sub_r1.current_period_end, "mediumDate"));
    \u0275\u0275advance(3);
    \u0275\u0275conditional(sub_r1.cancel_at ? 14 : -1);
  }
}
function BillingComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 6)(1, "p");
    \u0275\u0275text(2, "No active subscription found.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p-button", 31);
    \u0275\u0275listener("onClick", function BillingComponent_Conditional_11_Template_p_button_onClick_3_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onUpgrade());
    });
    \u0275\u0275elementEnd()();
  }
}
function BillingComponent_Conditional_20_For_2_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "p-progressBar", 37);
    \u0275\u0275elementStart(1, "div", 38)(2, "span", 39);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 40);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r4 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275styleMap(\u0275\u0275pureFunction0(6, _c12));
    \u0275\u0275property("value", ctx_r1.getUsagePercent(item_r4))("showValue", false);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r1.getUsagePercent(item_r4), "% used");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Resets in ", ctx_r1.getDaysUntilReset(item_r4.resets_at), " days");
  }
}
function BillingComponent_Conditional_20_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 36);
    \u0275\u0275element(1, "i", 41);
    \u0275\u0275text(2, " Unlimited ");
    \u0275\u0275elementEnd();
  }
}
function BillingComponent_Conditional_20_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32)(1, "div", 33)(2, "span", 34);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 35);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(6, BillingComponent_Conditional_20_For_2_Conditional_6_Template, 6, 7)(7, BillingComponent_Conditional_20_For_2_Conditional_7_Template, 3, 0, "div", 36);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.formatFeatureKey(item_r4.feature_key));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r1.formatUsed(item_r4), " / ", ctx_r1.formatLimit(item_r4));
    \u0275\u0275advance();
    \u0275\u0275conditional(item_r4.limit > 0 ? 6 : 7);
  }
}
function BillingComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 14);
    \u0275\u0275repeaterCreate(1, BillingComponent_Conditional_20_For_2_Template, 8, 4, "div", 32, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.entitlements());
  }
}
function BillingComponent_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 15);
    \u0275\u0275element(1, "i", 42);
    \u0275\u0275text(2, " Loading usage data... ");
    \u0275\u0275elementEnd();
  }
}
function BillingComponent_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16)(1, "p");
    \u0275\u0275text(2, "No usage data available yet. Start using CanonBridge to see your metrics here.");
    \u0275\u0275elementEnd()();
  }
}
function BillingComponent_For_26_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 44);
    \u0275\u0275text(1, "Current");
    \u0275\u0275elementEnd();
  }
}
function BillingComponent_For_26_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 47);
    \u0275\u0275text(1, "$0");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 49);
    \u0275\u0275text(3, "/month");
    \u0275\u0275elementEnd();
  }
}
function BillingComponent_For_26_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 47);
    \u0275\u0275text(1, "Custom");
    \u0275\u0275elementEnd();
  }
}
function BillingComponent_For_26_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 47);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 49);
    \u0275\u0275text(3, "/month");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const plan_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.formatPrice(plan_r5.price_monthly_cents));
  }
}
function BillingComponent_For_26_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-button", 50);
    \u0275\u0275listener("onClick", function BillingComponent_For_26_Conditional_10_Template_p_button_onClick_0_listener() {
      \u0275\u0275restoreView(_r6);
      const plan_r5 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSelectPlan(plan_r5));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const plan_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("label", plan_r5.code === "free" ? "Downgrade" : plan_r5.code === "enterprise" ? "Contact Sales" : "Upgrade")("severity", plan_r5.code === "growth" ? "primary" : "secondary")("outlined", plan_r5.code !== "growth");
  }
}
function BillingComponent_For_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 43);
    \u0275\u0275conditionalCreate(1, BillingComponent_For_26_Conditional_1_Template, 2, 0, "div", 44);
    \u0275\u0275elementStart(2, "h3");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 45);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 46);
    \u0275\u0275conditionalCreate(7, BillingComponent_For_26_Conditional_7_Template, 4, 0)(8, BillingComponent_For_26_Conditional_8_Template, 2, 0, "span", 47)(9, BillingComponent_For_26_Conditional_9_Template, 4, 1);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(10, BillingComponent_For_26_Conditional_10_Template, 1, 3, "p-button", 48);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_10_0;
    let tmp_12_0;
    let tmp_16_0;
    const plan_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classProp("current", plan_r5.code === ((tmp_10_0 = ctx_r1.subscription()) == null ? null : tmp_10_0.plan_code))("highlighted", plan_r5.code === "growth");
    \u0275\u0275advance();
    \u0275\u0275conditional(plan_r5.code === ((tmp_12_0 = ctx_r1.subscription()) == null ? null : tmp_12_0.plan_code) ? 1 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(plan_r5.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(plan_r5.description);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(plan_r5.price_monthly_cents === 0 && plan_r5.code !== "enterprise" ? 7 : plan_r5.code === "enterprise" ? 8 : 9);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(plan_r5.code !== ((tmp_16_0 = ctx_r1.subscription()) == null ? null : tmp_16_0.plan_code) ? 10 : -1);
  }
}
function BillingComponent_For_33_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 43)(1, "h3");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 46)(4, "span", 47);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 49);
    \u0275\u0275text(7, "/month");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "p", 45);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "p-button", 52);
    \u0275\u0275listener("onClick", function BillingComponent_For_33_Conditional_0_Template_p_button_onClick_10_listener() {
      \u0275\u0275restoreView(_r7);
      const plan_r8 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSelectPlan(plan_r8));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const plan_r8 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classProp("highlighted", plan_r8.code === "growth");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(plan_r8.name);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.formatPrice(plan_r8.price_monthly_cents));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(plan_r8.description);
    \u0275\u0275advance();
    \u0275\u0275property("label", "Upgrade to " + plan_r8.name)("severity", plan_r8.code === "growth" ? "primary" : "secondary")("outlined", plan_r8.code !== "growth");
  }
}
function BillingComponent_For_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, BillingComponent_For_33_Conditional_0_Template, 11, 8, "div", 51);
  }
  if (rf & 2) {
    let tmp_10_0;
    const plan_r8 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275conditional(plan_r8.code !== "free" && plan_r8.code !== ((tmp_10_0 = ctx_r1.subscription()) == null ? null : tmp_10_0.plan_code) ? 0 : -1);
  }
}
var BillingComponent = class _BillingComponent {
  billing = inject(BillingService);
  toast = inject(MessageService);
  router = inject(Router);
  subscription = signal(null, ...ngDevMode ? [{ debugName: "subscription" }] : (
    /* istanbul ignore next */
    []
  ));
  entitlements = signal([], ...ngDevMode ? [{ debugName: "entitlements" }] : (
    /* istanbul ignore next */
    []
  ));
  plans = signal([], ...ngDevMode ? [{ debugName: "plans" }] : (
    /* istanbul ignore next */
    []
  ));
  usageHistory = signal([], ...ngDevMode ? [{ debugName: "usageHistory" }] : (
    /* istanbul ignore next */
    []
  ));
  loading = signal(true, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  // Dialog state
  upgradeDialogVisible = false;
  invoiceDialogVisible = false;
  ngOnInit() {
    this.loadData();
  }
  loadData() {
    this.loading.set(true);
    this.billing.getSubscription().subscribe({
      next: (sub) => this.subscription.set(sub),
      error: () => this.subscription.set(null)
    });
    this.billing.getUsageSummary().subscribe({
      next: (data) => {
        this.entitlements.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.billing.getPlans().subscribe({
      next: (plans) => this.plans.set(plans),
      error: () => {
      }
    });
    this.billing.getUsageHistory(30).subscribe({
      next: (history) => this.usageHistory.set(history),
      error: () => {
      }
    });
  }
  getUsagePercent(item) {
    if (item.limit <= 0)
      return 0;
    return Math.min(Math.round(item.used / item.limit * 100), 100);
  }
  getUsageSeverity(item) {
    const pct = this.getUsagePercent(item);
    if (pct >= 90)
      return "danger";
    if (pct >= 70)
      return "warn";
    return "success";
  }
  getStatusSeverity(status) {
    switch (status) {
      case "active":
        return "success";
      case "trialing":
        return "info";
      case "past_due":
        return "warn";
      case "canceled":
        return "danger";
      case "paused":
        return "warn";
      default:
        return "info";
    }
  }
  formatLimit(item) {
    if (item.limit === -1)
      return "Unlimited";
    return item.limit.toLocaleString();
  }
  formatUsed(item) {
    return item.used.toLocaleString();
  }
  formatFeatureKey(key) {
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  getDaysUntilReset(resetsAt) {
    const reset = new Date(resetsAt);
    const now = /* @__PURE__ */ new Date();
    return Math.max(0, Math.ceil((reset.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)));
  }
  formatPrice(cents) {
    return `$${(cents / 100).toFixed(0)}`;
  }
  onUpgrade() {
    this.upgradeDialogVisible = true;
  }
  onSelectPlan(plan) {
    this.upgradeDialogVisible = false;
    this.toast.add({ severity: "info", summary: "Upgrading...", detail: `Switching to ${plan.name} plan`, life: 3e3 });
    this.toast.add({
      severity: "success",
      summary: "Upgrade Initiated",
      detail: `Paddle checkout would open for ${plan.name} ($${plan.price_monthly_cents / 100}/mo). In sandbox mode, no real payment is processed.`,
      life: 5e3
    });
  }
  onViewInvoices() {
    this.invoiceDialogVisible = true;
    this.toast.add({ severity: "info", summary: "Invoices", detail: "No invoices yet \u2014 your first invoice will be generated at the end of your billing period.", life: 4e3 });
  }
  onManagePayment() {
    this.toast.add({
      severity: "info",
      summary: "Payment Management",
      detail: "Paddle customer portal would open here. In sandbox mode, payment methods are managed through Paddle.",
      life: 4e3
    });
  }
  onStartTrial() {
    this.toast.add({ severity: "info", summary: "Starting Trial...", detail: "14-day Growth trial", life: 2e3 });
    this.toast.add({
      severity: "success",
      summary: "Trial Started!",
      detail: "You now have 14 days of Growth plan features. No credit card required.",
      life: 5e3
    });
    setTimeout(() => this.loadData(), 1e3);
  }
  static \u0275fac = function BillingComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BillingComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BillingComponent, selectors: [["app-billing"]], features: [\u0275\u0275ProvidersFeature([MessageService])], decls: 34, vars: 11, consts: [[1, "billing-page"], [1, "page-header"], [1, "subtitle"], [1, "grid"], ["header", "Current Plan"], [1, "plan-overview"], [1, "no-subscription"], ["header", "Quick Actions"], [1, "quick-actions"], ["label", "Upgrade Plan", "icon", "pi pi-arrow-up", "severity", "primary", "styleClass", "w-full", 3, "onClick"], ["label", "Start 14-Day Trial", "icon", "pi pi-play", "severity", "success", "styleClass", "w-full", 3, "onClick", "outlined"], ["label", "View Invoices", "icon", "pi pi-file", "severity", "secondary", "styleClass", "w-full", 3, "onClick", "outlined"], ["label", "Manage Payment", "icon", "pi pi-credit-card", "severity", "secondary", "styleClass", "w-full", 3, "onClick", "outlined"], ["header", "Usage This Period", 1, "mt-4"], [1, "usage-grid"], [1, "loading-state"], [1, "empty-state"], ["header", "Available Plans", 1, "mt-4"], [1, "plans-grid"], [1, "plan-card", 3, "current", "highlighted"], ["header", "Upgrade Your Plan", 3, "visibleChange", "visible", "modal", "closable"], [1, "upgrade-dialog-content"], [2, "margin-bottom", "1rem", "color", "var(--text-color-secondary)"], [1, "plan-info"], [1, "plan-name"], [3, "value", "severity"], [1, "billing-cycle"], [1, "plan-period"], [1, "period-label"], [1, "cancel-notice"], [1, "pi", "pi-exclamation-triangle"], ["label", "Choose a Plan", "icon", "pi pi-arrow-right", 3, "onClick"], [1, "usage-item"], [1, "usage-header"], [1, "usage-label"], [1, "usage-values"], [1, "usage-unlimited"], [3, "value", "showValue"], [1, "usage-footer"], [1, "usage-percent"], [1, "usage-reset"], [1, "pi", "pi-infinity"], [1, "pi", "pi-spin", "pi-spinner"], [1, "plan-card"], [1, "current-badge"], [1, "plan-desc"], [1, "plan-price"], [1, "price"], ["styleClass", "w-full mt-3", 3, "label", "severity", "outlined"], [1, "period"], ["styleClass", "w-full mt-3", 3, "onClick", "label", "severity", "outlined"], [1, "plan-card", 3, "highlighted"], ["styleClass", "w-full", 3, "onClick", "label", "severity", "outlined"]], template: function BillingComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "p-toast");
      \u0275\u0275elementStart(1, "div", 0)(2, "div", 1)(3, "h1");
      \u0275\u0275text(4, "Billing & Usage");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "p", 2);
      \u0275\u0275text(6, "Manage your subscription, monitor usage, and view invoices.");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "div", 3)(8, "div")(9, "p-card", 4);
      \u0275\u0275conditionalCreate(10, BillingComponent_Conditional_10_Template, 15, 13, "div", 5)(11, BillingComponent_Conditional_11_Template, 4, 0, "div", 6);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(12, "div")(13, "p-card", 7)(14, "div", 8)(15, "p-button", 9);
      \u0275\u0275listener("onClick", function BillingComponent_Template_p_button_onClick_15_listener() {
        return ctx.onUpgrade();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "p-button", 10);
      \u0275\u0275listener("onClick", function BillingComponent_Template_p_button_onClick_16_listener() {
        return ctx.onStartTrial();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "p-button", 11);
      \u0275\u0275listener("onClick", function BillingComponent_Template_p_button_onClick_17_listener() {
        return ctx.onViewInvoices();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "p-button", 12);
      \u0275\u0275listener("onClick", function BillingComponent_Template_p_button_onClick_18_listener() {
        return ctx.onManagePayment();
      });
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(19, "p-card", 13);
      \u0275\u0275conditionalCreate(20, BillingComponent_Conditional_20_Template, 3, 0, "div", 14)(21, BillingComponent_Conditional_21_Template, 3, 0, "div", 15)(22, BillingComponent_Conditional_22_Template, 3, 0, "div", 16);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "p-card", 17)(24, "div", 18);
      \u0275\u0275repeaterCreate(25, BillingComponent_For_26_Template, 11, 9, "div", 19, _forTrack0);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(27, "p-dialog", 20);
      \u0275\u0275twoWayListener("visibleChange", function BillingComponent_Template_p_dialog_visibleChange_27_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.upgradeDialogVisible, $event) || (ctx.upgradeDialogVisible = $event);
        return $event;
      });
      \u0275\u0275elementStart(28, "div", 21)(29, "p", 22);
      \u0275\u0275text(30, "Choose a plan that fits your needs. You can upgrade or downgrade at any time.");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(31, "div", 18);
      \u0275\u0275repeaterCreate(32, BillingComponent_For_33_Template, 1, 1, null, null, _forTrack0);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      let tmp_0_0;
      \u0275\u0275advance(10);
      \u0275\u0275conditional((tmp_0_0 = ctx.subscription()) ? 10 : 11, tmp_0_0);
      \u0275\u0275advance(6);
      \u0275\u0275property("outlined", true);
      \u0275\u0275advance();
      \u0275\u0275property("outlined", true);
      \u0275\u0275advance();
      \u0275\u0275property("outlined", true);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.entitlements().length > 0 ? 20 : ctx.loading() ? 21 : 22);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.plans());
      \u0275\u0275advance(2);
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(10, _c02));
      \u0275\u0275twoWayProperty("visible", ctx.upgradeDialogVisible);
      \u0275\u0275property("modal", true)("closable", true);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.plans());
    }
  }, dependencies: [
    CommonModule,
    CardModule,
    Card,
    ButtonModule,
    Button,
    DialogModule,
    Dialog,
    ProgressBarModule,
    ProgressBar,
    TableModule,
    TagModule,
    Tag,
    TabsModule,
    ToastModule,
    Toast,
    DatePipe
  ], styles: ["\n.billing-page[_ngcontent-%COMP%] {\n  padding: 1.5rem;\n  max-width: 1200px;\n}\n.page-header[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  font-size: 1.75rem;\n  font-weight: 700;\n  color: var(--text-color);\n  margin: 0 0 0.25rem;\n}\n.page-header[_ngcontent-%COMP%]   .subtitle[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  margin: 0;\n}\n.plan-overview[_ngcontent-%COMP%]   .plan-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin-bottom: 0.75rem;\n}\n.plan-overview[_ngcontent-%COMP%]   .plan-info[_ngcontent-%COMP%]   .plan-name[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  font-weight: 700;\n  margin: 0;\n}\n.plan-overview[_ngcontent-%COMP%]   .plan-info[_ngcontent-%COMP%]   .billing-cycle[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  text-transform: capitalize;\n}\n.plan-overview[_ngcontent-%COMP%]   .plan-period[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.875rem;\n}\n.plan-overview[_ngcontent-%COMP%]   .plan-period[_ngcontent-%COMP%]   .period-label[_ngcontent-%COMP%] {\n  font-weight: 500;\n  margin-right: 0.25rem;\n}\n.plan-overview[_ngcontent-%COMP%]   .cancel-notice[_ngcontent-%COMP%] {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  background: var(--yellow-50);\n  border: 1px solid var(--yellow-200);\n  border-radius: 0.5rem;\n  color: var(--yellow-800);\n  font-size: 0.875rem;\n}\n.plan-overview[_ngcontent-%COMP%]   .cancel-notice[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  margin-right: 0.5rem;\n}\n.no-subscription[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 1rem 0;\n}\n.quick-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.quick-actions[_ngcontent-%COMP%]     .p-button {\n  white-space: nowrap;\n}\n.usage-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 1.25rem;\n}\n.usage-item[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 0.75rem;\n  background: var(--surface-ground);\n}\n.usage-item[_ngcontent-%COMP%]   .usage-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.usage-item[_ngcontent-%COMP%]   .usage-header[_ngcontent-%COMP%]   .usage-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 0.875rem;\n}\n.usage-item[_ngcontent-%COMP%]   .usage-header[_ngcontent-%COMP%]   .usage-values[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--text-color-secondary);\n}\n.usage-item[_ngcontent-%COMP%]   .usage-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  margin-top: 0.375rem;\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n}\n.usage-item[_ngcontent-%COMP%]   .usage-unlimited[_ngcontent-%COMP%] {\n  color: var(--green-600);\n  font-size: 0.875rem;\n  margin-top: 0.25rem;\n}\n.usage-item[_ngcontent-%COMP%]   .usage-unlimited[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  margin-right: 0.25rem;\n}\n.plans-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 1rem;\n}\n.plan-card[_ngcontent-%COMP%] {\n  position: relative;\n  padding: 1.25rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 0.75rem;\n  text-align: center;\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n.plan-card[_ngcontent-%COMP%]:hover {\n  border-color: var(--primary-color);\n}\n.plan-card.current[_ngcontent-%COMP%] {\n  border-color: var(--primary-color);\n  background: var(--primary-50);\n}\n.plan-card.highlighted[_ngcontent-%COMP%] {\n  border-color: var(--primary-color);\n  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15);\n}\n.plan-card[_ngcontent-%COMP%]   .current-badge[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -0.625rem;\n  left: 50%;\n  transform: translateX(-50%);\n  background: var(--primary-color);\n  color: white;\n  font-size: 0.7rem;\n  font-weight: 600;\n  padding: 0.125rem 0.5rem;\n  border-radius: 1rem;\n}\n.plan-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n.plan-card[_ngcontent-%COMP%]   .plan-desc[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--text-color-secondary);\n  margin: 0 0 0.75rem;\n}\n.plan-card[_ngcontent-%COMP%]   .plan-price[_ngcontent-%COMP%] {\n  margin-bottom: 0.5rem;\n}\n.plan-card[_ngcontent-%COMP%]   .plan-price[_ngcontent-%COMP%]   .price[_ngcontent-%COMP%] {\n  font-size: 1.75rem;\n  font-weight: 800;\n}\n.plan-card[_ngcontent-%COMP%]   .plan-price[_ngcontent-%COMP%]   .period[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--text-color-secondary);\n}\n.loading-state[_ngcontent-%COMP%], \n.empty-state[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 2rem;\n  color: var(--text-color-secondary);\n}\n.loading-state[_ngcontent-%COMP%]   i[_ngcontent-%COMP%], \n.empty-state[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  margin-right: 0.5rem;\n}\n.grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n}\n@media (min-width: 992px) {\n  .grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr minmax(280px, 320px);\n  }\n}\n.mt-4[_ngcontent-%COMP%] {\n  margin-top: 1.5rem;\n}\n/*# sourceMappingURL=billing.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BillingComponent, [{
    type: Component,
    args: [{ selector: "app-billing", standalone: true, imports: [
      CommonModule,
      CardModule,
      ButtonModule,
      DialogModule,
      ProgressBarModule,
      TableModule,
      TagModule,
      TabsModule,
      ToastModule
    ], providers: [MessageService], template: `<p-toast />

<div class="billing-page">
  <!-- Page Header -->
  <div class="page-header">
    <h1>Billing & Usage</h1>
    <p class="subtitle">Manage your subscription, monitor usage, and view invoices.</p>
  </div>

  <!-- Subscription Overview -->
  <div class="grid">
    <div>
      <p-card header="Current Plan">
        @if (subscription(); as sub) {
          <div class="plan-overview">
            <div class="plan-info">
              <h2 class="plan-name">{{ sub.plan_name }}</h2>
              <p-tag [value]="sub.status" [severity]="getStatusSeverity(sub.status)" />
              <span class="billing-cycle">{{ sub.billing_cycle }}</span>
            </div>
            <div class="plan-period">
              <span class="period-label">Current period:</span>
              <span>{{ sub.current_period_start | date:'mediumDate' }} \u2014 {{ sub.current_period_end | date:'mediumDate' }}</span>
            </div>
            @if (sub.cancel_at) {
              <div class="cancel-notice">
                <i class="pi pi-exclamation-triangle"></i>
                Cancels on {{ sub.cancel_at | date:'mediumDate' }}
              </div>
            }
          </div>
        } @else {
          <div class="no-subscription">
            <p>No active subscription found.</p>
            <p-button label="Choose a Plan" icon="pi pi-arrow-right" (onClick)="onUpgrade()" />
          </div>
        }
      </p-card>
    </div>

    <div>
      <p-card header="Quick Actions">
        <div class="quick-actions">
          <p-button label="Upgrade Plan" icon="pi pi-arrow-up" severity="primary" (onClick)="onUpgrade()" styleClass="w-full" />
          <p-button label="Start 14-Day Trial" icon="pi pi-play" severity="success" (onClick)="onStartTrial()" styleClass="w-full" [outlined]="true" />
          <p-button label="View Invoices" icon="pi pi-file" severity="secondary" (onClick)="onViewInvoices()" styleClass="w-full" [outlined]="true" />
          <p-button label="Manage Payment" icon="pi pi-credit-card" severity="secondary" (onClick)="onManagePayment()" styleClass="w-full" [outlined]="true" />
        </div>
      </p-card>
    </div>
  </div>

  <!-- Usage Quotas -->
  <p-card header="Usage This Period" class="mt-4">
    @if (entitlements().length > 0) {
      <div class="usage-grid">
        @for (item of entitlements(); track item.feature_key) {
          <div class="usage-item">
            <div class="usage-header">
              <span class="usage-label">{{ formatFeatureKey(item.feature_key) }}</span>
              <span class="usage-values">{{ formatUsed(item) }} / {{ formatLimit(item) }}</span>
            </div>
            @if (item.limit > 0) {
              <p-progressBar
                [value]="getUsagePercent(item)"
                [showValue]="false"
                [style]="{ height: '8px' }"
              />
              <div class="usage-footer">
                <span class="usage-percent">{{ getUsagePercent(item) }}% used</span>
                <span class="usage-reset">Resets in {{ getDaysUntilReset(item.resets_at) }} days</span>
              </div>
            } @else {
              <div class="usage-unlimited">
                <i class="pi pi-infinity"></i> Unlimited
              </div>
            }
          </div>
        }
      </div>
    } @else if (loading()) {
      <div class="loading-state">
        <i class="pi pi-spin pi-spinner"></i> Loading usage data...
      </div>
    } @else {
      <div class="empty-state">
        <p>No usage data available yet. Start using CanonBridge to see your metrics here.</p>
      </div>
    }
  </p-card>

  <!-- Plan Comparison -->
  <p-card header="Available Plans" class="mt-4">
    <div class="plans-grid">
      @for (plan of plans(); track plan.code) {
        <div class="plan-card" [class.current]="plan.code === subscription()?.plan_code" [class.highlighted]="plan.code === 'growth'">
          @if (plan.code === subscription()?.plan_code) {
            <div class="current-badge">Current</div>
          }
          <h3>{{ plan.name }}</h3>
          <p class="plan-desc">{{ plan.description }}</p>
          <div class="plan-price">
            @if (plan.price_monthly_cents === 0 && plan.code !== 'enterprise') {
              <span class="price">$0</span>
              <span class="period">/month</span>
            } @else if (plan.code === 'enterprise') {
              <span class="price">Custom</span>
            } @else {
              <span class="price">{{ formatPrice(plan.price_monthly_cents) }}</span>
              <span class="period">/month</span>
            }
          </div>
          @if (plan.code !== subscription()?.plan_code) {
            <p-button
              [label]="plan.code === 'free' ? 'Downgrade' : plan.code === 'enterprise' ? 'Contact Sales' : 'Upgrade'"
              [severity]="plan.code === 'growth' ? 'primary' : 'secondary'"
              [outlined]="plan.code !== 'growth'"
              styleClass="w-full mt-3"
              (onClick)="onSelectPlan(plan)"
            />
          }
        </div>
      }
    </div>
  </p-card>
</div>

<!-- Upgrade Dialog -->
<p-dialog
  [(visible)]="upgradeDialogVisible"
  [modal]="true"
  [closable]="true"
  [style]="{ width: '650px' }"
  header="Upgrade Your Plan">
  <div class="upgrade-dialog-content">
    <p style="margin-bottom: 1rem; color: var(--text-color-secondary)">Choose a plan that fits your needs. You can upgrade or downgrade at any time.</p>
    <div class="plans-grid">
      @for (plan of plans(); track plan.code) {
        @if (plan.code !== 'free' && plan.code !== subscription()?.plan_code) {
          <div class="plan-card" [class.highlighted]="plan.code === 'growth'">
            <h3>{{ plan.name }}</h3>
            <div class="plan-price">
              <span class="price">{{ formatPrice(plan.price_monthly_cents) }}</span>
              <span class="period">/month</span>
            </div>
            <p class="plan-desc">{{ plan.description }}</p>
            <p-button
              [label]="'Upgrade to ' + plan.name"
              [severity]="plan.code === 'growth' ? 'primary' : 'secondary'"
              [outlined]="plan.code !== 'growth'"
              styleClass="w-full"
              (onClick)="onSelectPlan(plan)" />
          </div>
        }
      }
    </div>
  </div>
</p-dialog>
`, styles: ["/* src/app/pages/billing/billing.component.scss */\n.billing-page {\n  padding: 1.5rem;\n  max-width: 1200px;\n}\n.page-header {\n  margin-bottom: 1.5rem;\n}\n.page-header h1 {\n  font-size: 1.75rem;\n  font-weight: 700;\n  color: var(--text-color);\n  margin: 0 0 0.25rem;\n}\n.page-header .subtitle {\n  color: var(--text-color-secondary);\n  margin: 0;\n}\n.plan-overview .plan-info {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin-bottom: 0.75rem;\n}\n.plan-overview .plan-info .plan-name {\n  font-size: 1.5rem;\n  font-weight: 700;\n  margin: 0;\n}\n.plan-overview .plan-info .billing-cycle {\n  color: var(--text-color-secondary);\n  text-transform: capitalize;\n}\n.plan-overview .plan-period {\n  color: var(--text-color-secondary);\n  font-size: 0.875rem;\n}\n.plan-overview .plan-period .period-label {\n  font-weight: 500;\n  margin-right: 0.25rem;\n}\n.plan-overview .cancel-notice {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  background: var(--yellow-50);\n  border: 1px solid var(--yellow-200);\n  border-radius: 0.5rem;\n  color: var(--yellow-800);\n  font-size: 0.875rem;\n}\n.plan-overview .cancel-notice i {\n  margin-right: 0.5rem;\n}\n.no-subscription {\n  text-align: center;\n  padding: 1rem 0;\n}\n.quick-actions {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.quick-actions ::ng-deep .p-button {\n  white-space: nowrap;\n}\n.usage-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 1.25rem;\n}\n.usage-item {\n  padding: 1rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 0.75rem;\n  background: var(--surface-ground);\n}\n.usage-item .usage-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.usage-item .usage-header .usage-label {\n  font-weight: 600;\n  font-size: 0.875rem;\n}\n.usage-item .usage-header .usage-values {\n  font-size: 0.8rem;\n  color: var(--text-color-secondary);\n}\n.usage-item .usage-footer {\n  display: flex;\n  justify-content: space-between;\n  margin-top: 0.375rem;\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n}\n.usage-item .usage-unlimited {\n  color: var(--green-600);\n  font-size: 0.875rem;\n  margin-top: 0.25rem;\n}\n.usage-item .usage-unlimited i {\n  margin-right: 0.25rem;\n}\n.plans-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 1rem;\n}\n.plan-card {\n  position: relative;\n  padding: 1.25rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 0.75rem;\n  text-align: center;\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n.plan-card:hover {\n  border-color: var(--primary-color);\n}\n.plan-card.current {\n  border-color: var(--primary-color);\n  background: var(--primary-50);\n}\n.plan-card.highlighted {\n  border-color: var(--primary-color);\n  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15);\n}\n.plan-card .current-badge {\n  position: absolute;\n  top: -0.625rem;\n  left: 50%;\n  transform: translateX(-50%);\n  background: var(--primary-color);\n  color: white;\n  font-size: 0.7rem;\n  font-weight: 600;\n  padding: 0.125rem 0.5rem;\n  border-radius: 1rem;\n}\n.plan-card h3 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n.plan-card .plan-desc {\n  font-size: 0.8rem;\n  color: var(--text-color-secondary);\n  margin: 0 0 0.75rem;\n}\n.plan-card .plan-price {\n  margin-bottom: 0.5rem;\n}\n.plan-card .plan-price .price {\n  font-size: 1.75rem;\n  font-weight: 800;\n}\n.plan-card .plan-price .period {\n  font-size: 0.875rem;\n  color: var(--text-color-secondary);\n}\n.loading-state,\n.empty-state {\n  text-align: center;\n  padding: 2rem;\n  color: var(--text-color-secondary);\n}\n.loading-state i,\n.empty-state i {\n  font-size: 1.5rem;\n  margin-right: 0.5rem;\n}\n.grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n}\n@media (min-width: 992px) {\n  .grid {\n    grid-template-columns: 1fr minmax(280px, 320px);\n  }\n}\n.mt-4 {\n  margin-top: 1.5rem;\n}\n/*# sourceMappingURL=billing.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BillingComponent, { className: "BillingComponent", filePath: "src/app/pages/billing/billing.component.ts", lineNumber: 33 });
})();
export {
  BillingComponent
};
//# sourceMappingURL=chunk-M2CNCDDL.js.map
