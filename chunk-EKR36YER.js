import {
  Drawer,
  DrawerModule
} from "./chunk-32KYPFN5.js";
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
  TableCheckbox,
  TableHeaderCheckbox,
  TableModule
} from "./chunk-7ZSNOQRT.js";
import "./chunk-G7EP3YQM.js";
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
  NgModel,
  Select,
  SelectModule
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
import {
  Router
} from "./chunk-2VDSLNOW.js";
import {
  ConfirmationService,
  HttpClient,
  HttpParams,
  MessageService,
  PrimeTemplate,
  environment
} from "./chunk-HHZQSEIC.js";
import {
  Component,
  Injectable,
  computed,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-56FG4FZN.js";

// src/app/core/services/dlq.service.ts
var DlqService = class _DlqService {
  http = inject(HttpClient);
  baseUrl = `${environment.api.baseUrl}/dlq`;
  list(limit = 50, offset = 0) {
    const params = new HttpParams().set("limit", limit.toString()).set("offset", offset.toString());
    return this.http.get(this.baseUrl, { params });
  }
  // Alias for backward compatibility
  listMessages(limit = 50, offset = 0) {
    return this.list(limit, offset);
  }
  getById(id) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
  redrive(id) {
    return this.http.post(`${this.baseUrl}/${id}/redrive`, {});
  }
  // Alias for backward compatibility
  redriveMessage(id) {
    return this.redrive(id);
  }
  discard(id) {
    return this.http.post(`${this.baseUrl}/${id}/discard`, {});
  }
  bulkRedrive(ids) {
    return this.http.post(`${this.baseUrl}/bulk-redrive`, { ids });
  }
  bulkDiscard(ids) {
    return this.http.post(`${this.baseUrl}/bulk-discard`, { ids });
  }
  getStats() {
    return this.http.get(`${this.baseUrl}/stats`);
  }
  static \u0275fac = function DlqService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DlqService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _DlqService, factory: _DlqService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DlqService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/pages/dlq/dlq.component.ts
var _c0 = (a0) => ({ count: a0 });
function DlqComponent_ng_template_34_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "th", 19);
    \u0275\u0275element(2, "p-tableHeaderCheckbox");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "th");
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th");
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "th");
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th");
    \u0275\u0275text(13);
    \u0275\u0275pipe(14, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "th", 20);
    \u0275\u0275text(16);
    \u0275\u0275pipe(17, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "th");
    \u0275\u0275text(19);
    \u0275\u0275pipe(20, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "th");
    \u0275\u0275text(22);
    \u0275\u0275pipe(23, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275element(24, "th", 21);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 7, "table.partner"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 9, "table.eventType"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 11, "dlq.colErrorType"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(14, 13, "dlq.colErrorMessage"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(17, 15, "dlq.colAttempts"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(20, 17, "dlq.colFirstFailed"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(23, 19, "dlq.colLastFailed"));
  }
}
function DlqComponent_ng_template_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td");
    \u0275\u0275element(2, "p-tableCheckbox", 22);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td")(4, "code", 23);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "td")(7, "code", 24);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "td");
    \u0275\u0275element(10, "p-tag", 25);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "td", 26);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td", 20)(14, "span", 27);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "td", 28);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "td", 28);
    \u0275\u0275text(19);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "td")(21, "div", 29)(22, "p-button", 30);
    \u0275\u0275pipe(23, "i18n");
    \u0275\u0275listener("onClick", function DlqComponent_ng_template_35_Template_p_button_onClick_22_listener() {
      const msg_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.redriveMessage(msg_r3));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "p-button", 31);
    \u0275\u0275pipe(25, "i18n");
    \u0275\u0275listener("onClick", function DlqComponent_ng_template_35_Template_p_button_onClick_24_listener() {
      const msg_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.inspect(msg_r3));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "p-button", 32);
    \u0275\u0275pipe(27, "i18n");
    \u0275\u0275listener("onClick", function DlqComponent_ng_template_35_Template_p_button_onClick_26_listener() {
      const msg_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.createFixDraft(msg_r3));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "p-button", 33);
    \u0275\u0275pipe(29, "i18n");
    \u0275\u0275listener("onClick", function DlqComponent_ng_template_35_Template_p_button_onClick_28_listener($event) {
      const msg_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.confirmDiscard(msg_r3, $event));
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const msg_r3 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275property("value", msg_r3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r3.partner);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r3.eventType);
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", ctx_r3.getErrorSeverity(msg_r3.errorType))("value", msg_r3.errorType);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(msg_r3.errorMessage);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", msg_r3.attempts, "/3");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(msg_r3.firstFailed);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(msg_r3.lastFailed);
    \u0275\u0275advance(3);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(23, 13, "dlq.tooltipRedrive"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(25, 15, "dlq.tooltipInspect"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(27, 17, "dlq.tooltipFixDraft"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(29, 19, "dlq.tooltipDiscard"));
  }
}
function DlqComponent_ng_template_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 34);
    \u0275\u0275element(2, "i", 35);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(4, 1, "dlq.empty"), " ");
  }
}
function DlqComponent_Conditional_38_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 36)(1, "span", 37);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "h2");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275element(6, "p-tag", 25);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 38)(8, "article")(9, "span");
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "strong");
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "article")(15, "span");
    \u0275\u0275text(16);
    \u0275\u0275pipe(17, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "strong");
    \u0275\u0275text(19);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(20, "article")(21, "span");
    \u0275\u0275text(22);
    \u0275\u0275pipe(23, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "strong");
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "article")(27, "span");
    \u0275\u0275text(28);
    \u0275\u0275pipe(29, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "strong");
    \u0275\u0275text(31);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "article")(33, "span");
    \u0275\u0275text(34);
    \u0275\u0275pipe(35, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "strong");
    \u0275\u0275text(37);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(38, "article")(39, "span");
    \u0275\u0275text(40);
    \u0275\u0275pipe(41, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "strong");
    \u0275\u0275text(43);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(44, "section", 39)(45, "h3");
    \u0275\u0275text(46);
    \u0275\u0275pipe(47, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(48, "p");
    \u0275\u0275text(49);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(50, "section", 39)(51, "h3");
    \u0275\u0275text(52);
    \u0275\u0275pipe(53, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "pre");
    \u0275\u0275text(55);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(56, "section", 39)(57, "h3");
    \u0275\u0275text(58);
    \u0275\u0275pipe(59, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(60, "pre");
    \u0275\u0275text(61);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(62, "div", 40)(63, "p-button", 41);
    \u0275\u0275pipe(64, "i18n");
    \u0275\u0275listener("onClick", function DlqComponent_Conditional_38_Template_p_button_onClick_63_listener() {
      const msg_r6 = \u0275\u0275restoreView(_r5);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.redriveMessage(msg_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(65, "p-button", 42);
    \u0275\u0275pipe(66, "i18n");
    \u0275\u0275listener("onClick", function DlqComponent_Conditional_38_Template_p_button_onClick_65_listener() {
      const msg_r6 = \u0275\u0275restoreView(_r5);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.createFixDraft(msg_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(67, "p-button", 43);
    \u0275\u0275pipe(68, "i18n");
    \u0275\u0275listener("onClick", function DlqComponent_Conditional_38_Template_p_button_onClick_67_listener($event) {
      const msg_r6 = \u0275\u0275restoreView(_r5);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.confirmDiscard(msg_r6, $event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const msg_r6 = ctx;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 25, "dlq.inspectorTitle"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r6.id);
    \u0275\u0275advance();
    \u0275\u0275property("severity", ctx_r3.getErrorSeverity(msg_r6.errorType))("value", msg_r6.errorType);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 27, "table.partner"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r6.partner);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(17, 29, "table.eventType"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r6.eventType);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(23, 31, "dlq.colAttempts"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", msg_r6.attempts, "/3");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(29, 33, "dlq.colFirstFailed"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r6.firstFailed);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(35, 35, "dlq.colLastFailed"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r6.lastFailed);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(41, 37, "dlq.traceId"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r6.traceId);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(47, 39, "dlq.colErrorMessage"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r6.errorMessage);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(53, 41, "dlq.payload"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r3.prettyPayload(msg_r6.payload));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(59, 43, "dlq.stackTrace"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(msg_r6.stackTrace);
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(64, 45, "dlq.tooltipRedrive"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(66, 47, "dlq.createFixDraft"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(68, 49, "dlq.discard"));
  }
}
var DlqComponent = class _DlqComponent {
  confirmation = inject(ConfirmationService);
  toast = inject(MessageService);
  i18n = inject(I18nService);
  dlqService = inject(DlqService);
  router = inject(Router);
  selected = [];
  inspectorVisible = false;
  inspected = signal(null, ...ngDevMode ? [{ debugName: "inspected" }] : (
    /* istanbul ignore next */
    []
  ));
  loading = signal(false, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  studioImportKey = "canonbridge:external-systems:selected-sample";
  _messages = signal([], ...ngDevMode ? [{ debugName: "_messages" }] : (
    /* istanbul ignore next */
    []
  ));
  messages = this._messages.asReadonly();
  searchText = signal("", ...ngDevMode ? [{ debugName: "searchText" }] : (
    /* istanbul ignore next */
    []
  ));
  partnerFilter = signal("All", ...ngDevMode ? [{ debugName: "partnerFilter" }] : (
    /* istanbul ignore next */
    []
  ));
  errorFilter = signal("All", ...ngDevMode ? [{ debugName: "errorFilter" }] : (
    /* istanbul ignore next */
    []
  ));
  dateFilter = signal("All", ...ngDevMode ? [{ debugName: "dateFilter" }] : (
    /* istanbul ignore next */
    []
  ));
  partnerOptions = computed(() => ["All", ...Array.from(new Set(this._messages().map((msg) => msg.partner))).sort()], ...ngDevMode ? [{ debugName: "partnerOptions" }] : (
    /* istanbul ignore next */
    []
  ));
  errorOptions = computed(() => ["All", ...Array.from(new Set(this._messages().map((msg) => msg.errorType))).sort()], ...ngDevMode ? [{ debugName: "errorOptions" }] : (
    /* istanbul ignore next */
    []
  ));
  dateOptions = computed(() => ["All", ...Array.from(new Set(this._messages().map((msg) => msg.firstFailed.slice(0, 10)))).sort().reverse()], ...ngDevMode ? [{ debugName: "dateOptions" }] : (
    /* istanbul ignore next */
    []
  ));
  filteredMessages = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    return this._messages().filter((msg) => {
      const matchesQuery = !query || [
        msg.id,
        msg.partner,
        msg.eventType,
        msg.errorType,
        msg.errorMessage,
        msg.traceId
      ].some((value) => value.toLowerCase().includes(query));
      return matchesQuery && (this.partnerFilter() === "All" || msg.partner === this.partnerFilter()) && (this.errorFilter() === "All" || msg.errorType === this.errorFilter()) && (this.dateFilter() === "All" || msg.firstFailed.startsWith(this.dateFilter()));
    });
  }, ...ngDevMode ? [{ debugName: "filteredMessages" }] : (
    /* istanbul ignore next */
    []
  ));
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadMessages();
  }
  loadMessages() {
    this.loading.set(true);
    this.dlqService.listMessages(100, 0).subscribe({
      next: (apiMessages) => {
        if (!apiMessages) {
          this._messages.set([]);
          this.loading.set(false);
          return;
        }
        const messages = Array.isArray(apiMessages) ? apiMessages : [];
        const uiMessages = messages.map((msg) => ({
          id: msg.id,
          partner: this.extractPartnerFromTopic(msg.originalTopic),
          eventType: this.extractEventTypeFromPayload(msg.payload),
          errorType: this.categorizeError(msg.errorMessage || ""),
          errorMessage: msg.errorMessage || "Unknown error",
          attempts: msg.retryCount,
          firstFailed: this.formatTimestamp(msg.failedAt),
          lastFailed: this.formatTimestamp(msg.redriveAttemptedAt || msg.failedAt),
          payload: msg.payload,
          traceId: msg.key || msg.id,
          stackTrace: msg.errorStackTrace || ""
        }));
        this._messages.set(uiMessages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to load DLQ messages:", err);
        this.toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load DLQ messages"
        });
        this._messages.set([]);
        this.loading.set(false);
      }
    });
  }
  formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 6e4);
      const diffHours = Math.floor(diffMs / 36e5);
      const diffDays = Math.floor(diffMs / 864e5);
      if (diffMins < 1)
        return "just now";
      if (diffMins < 60)
        return `${diffMins} min ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7)
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      return date.toISOString().slice(0, 19).replace("T", " ");
    } catch {
      return timestamp;
    }
  }
  extractPartnerFromTopic(topic) {
    const parts = topic.split(".");
    return parts.length > 1 ? parts[1] : "unknown";
  }
  extractEventTypeFromPayload(payload) {
    try {
      const parsed = JSON.parse(payload);
      return parsed.eventType || parsed.type || "unknown";
    } catch {
      return "unknown";
    }
  }
  categorizeError(errorMessage) {
    const msg = errorMessage.toLowerCase();
    if (msg.includes("schema") || msg.includes("validation"))
      return "SCHEMA_VALIDATION";
    if (msg.includes("transformation") || msg.includes("mapping"))
      return "TRANSFORMATION_ERROR";
    if (msg.includes("downstream") || msg.includes("503") || msg.includes("timeout"))
      return "DOWNSTREAM_ERROR";
    return "UNKNOWN_ERROR";
  }
  // ── Inspect ───────────────────────────────────────────────────────────────
  inspect(msg) {
    this.inspected.set(msg);
    this.inspectorVisible = true;
  }
  createFixDraft(msg) {
    const parsed = this.parsePayload(msg.payload);
    if (parsed === null) {
      this.toast.add({
        severity: "error",
        summary: this.t("dlq.toast.fixDraftFailed"),
        detail: msg.id
      });
      return;
    }
    const sampleJson = JSON.stringify(parsed, null, 2);
    localStorage.setItem(this.studioImportKey, JSON.stringify({
      sourceType: "manual",
      sampleJson,
      connectionName: `${msg.partner} ${msg.eventType} DLQ fix`,
      partner: msg.partner,
      eventType: msg.eventType,
      dlqId: msg.id,
      traceId: msg.traceId,
      errorType: msg.errorType,
      errorMessage: msg.errorMessage
    }));
    this.toast.add({
      severity: "success",
      summary: this.t("dlq.toast.fixDraftReady"),
      detail: msg.id,
      life: 2500
    });
    void this.router.navigate(["/studio"]);
  }
  // ── Redrive ───────────────────────────────────────────────────────────────
  redriveMessage(msg) {
    if (this.parsePayload(msg.payload) === null) {
      this.toast.add({ severity: "error", summary: this.t("dlq.toast.redriveFailed"), detail: msg.id });
      return;
    }
    this.loading.set(true);
    this.dlqService.redriveMessage(msg.id).subscribe({
      next: () => {
        this.removeMessages([msg.id]);
        this.toast.add({ severity: "success", summary: this.t("dlq.toast.redriven"), detail: msg.id });
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to redrive message:", err);
        this.toast.add({
          severity: "error",
          summary: "Redrive Failed",
          detail: `Failed to redrive message ${msg.id}`
        });
        this.loading.set(false);
      }
    });
  }
  redriveSelected() {
    if (!this.selected.length)
      return;
    const ids = this.selected.map((m) => m.id);
    this.removeMessages(ids);
    this.toast.add({ severity: "success", summary: this.t("dlq.toast.redriven"), detail: this.t("dlq.toast.count", { count: ids.length }) });
  }
  redriveAll() {
    const ids = this.filteredMessages().map((m) => m.id);
    if (!ids.length)
      return;
    this.removeMessages(ids);
    this.toast.add({ severity: "success", summary: this.t("dlq.toast.redrivenAll"), detail: this.t("dlq.toast.count", { count: ids.length }) });
  }
  // ── Discard ───────────────────────────────────────────────────────────────
  confirmDiscard(msg, event) {
    this.confirmation.confirm({
      target: event.target,
      header: this.t("dlq.discardTitle"),
      message: this.t("dlq.discardMessage", { id: msg.id }),
      icon: "pi pi-trash",
      acceptLabel: this.t("dlq.discard"),
      rejectLabel: this.t("dlq.cancel"),
      accept: () => {
        this.removeMessages([msg.id]);
        this.toast.add({ severity: "warn", summary: this.t("dlq.toast.discarded"), detail: msg.id });
      }
    });
  }
  confirmDiscardSelected(event) {
    if (!this.selected.length)
      return;
    const count = this.selected.length;
    this.confirmation.confirm({
      target: event.target,
      header: this.t("dlq.discardSelectedTitle"),
      message: this.t("dlq.discardSelectedMessage", { count }),
      icon: "pi pi-trash",
      acceptLabel: this.t("dlq.discard"),
      rejectLabel: this.t("dlq.cancel"),
      accept: () => {
        const ids = this.selected.map((m) => m.id);
        this.removeMessages(ids);
        this.toast.add({ severity: "warn", summary: this.t("dlq.toast.discarded"), detail: this.t("dlq.toast.count", { count }) });
      }
    });
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  getErrorSeverity(type) {
    if (type === "SCHEMA_VALIDATION")
      return "danger";
    if (type === "TRANSFORMATION_ERROR")
      return "warn";
    return "info";
  }
  prettyPayload(payload) {
    const parsed = this.parsePayload(payload);
    return parsed ? JSON.stringify(parsed, null, 2) : payload;
  }
  removeMessages(ids) {
    const idSet = new Set(ids);
    this._messages.update((list) => list.filter((m) => !idSet.has(m.id)));
    this.selected = this.selected.filter((m) => !idSet.has(m.id));
    if (this.inspected() && idSet.has(this.inspected().id)) {
      this.inspectorVisible = false;
      this.inspected.set(null);
    }
  }
  parsePayload(payload) {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
  t(key, params) {
    return this.i18n.translate(key, params);
  }
  static \u0275fac = function DlqComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DlqComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DlqComponent, selectors: [["app-dlq"]], features: [\u0275\u0275ProvidersFeature([ConfirmationService, MessageService])], decls: 39, vars: 48, consts: [["dt", ""], [1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "page-actions"], ["icon", "pi pi-refresh", "severity", "secondary", "variant", "outlined", 3, "onClick", "label", "disabled"], ["icon", "pi pi-trash", "severity", "danger", "variant", "outlined", 3, "onClick", "label", "disabled"], ["icon", "pi pi-refresh", "severity", "danger", "variant", "outlined", 3, "onClick", "label", "disabled"], [1, "dlq-filter-bar"], [1, "p-input-icon-left", "dlq-search"], [1, "pi", "pi-search"], ["pInputText", "", 3, "ngModelChange", "ngModel", "placeholder"], ["appendTo", "body", 3, "ngModelChange", "options", "ngModel", "placeholder"], [1, "filter-count"], ["dataKey", "id", "styleClass", "p-datatable-sm", 3, "selectionChange", "value", "selection"], ["pTemplate", "header"], ["pTemplate", "body"], ["pTemplate", "emptymessage"], ["position", "right", "styleClass", "payload-inspector-drawer", 3, "visibleChange", "visible"], [2, "width", "3rem"], [2, "text-align", "center"], [2, "width", "120px"], [3, "value"], [1, "partner-code"], [1, "event-code"], [3, "severity", "value"], [1, "error-msg", "text-sm"], [1, "attempt-badge"], [1, "text-sm", "text-color-secondary"], [1, "row-actions"], ["icon", "pi pi-refresh", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-eye", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-wrench", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-trash", "variant", "text", "severity", "danger", "size", "small", 3, "onClick", "pTooltip"], ["colspan", "9", 1, "empty-cell"], [1, "pi", "pi-check-circle"], [1, "drawer-header"], [1, "drawer-eyebrow"], [1, "payload-meta"], [1, "inspector-section"], [1, "drawer-actions"], ["icon", "pi pi-refresh", "styleClass", "w-full", 3, "onClick", "label"], ["icon", "pi pi-wrench", "severity", "secondary", "variant", "outlined", "styleClass", "w-full", 3, "onClick", "label"], ["icon", "pi pi-trash", "severity", "danger", "variant", "outlined", "styleClass", "w-full", 3, "onClick", "label"]], template: function DlqComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275element(0, "p-toast")(1, "p-confirmDialog");
      \u0275\u0275elementStart(2, "div", 1)(3, "div")(4, "h1", 2);
      \u0275\u0275text(5);
      \u0275\u0275pipe(6, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "p", 3);
      \u0275\u0275text(8);
      \u0275\u0275pipe(9, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(10, "div", 4)(11, "p-button", 5);
      \u0275\u0275pipe(12, "i18n");
      \u0275\u0275listener("onClick", function DlqComponent_Template_p_button_onClick_11_listener() {
        return ctx.redriveSelected();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(13, "p-button", 6);
      \u0275\u0275pipe(14, "i18n");
      \u0275\u0275listener("onClick", function DlqComponent_Template_p_button_onClick_13_listener($event) {
        return ctx.confirmDiscardSelected($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "p-button", 7);
      \u0275\u0275pipe(16, "i18n");
      \u0275\u0275listener("onClick", function DlqComponent_Template_p_button_onClick_15_listener() {
        return ctx.redriveAll();
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(17, "p-card")(18, "div", 8)(19, "span", 9);
      \u0275\u0275element(20, "i", 10);
      \u0275\u0275elementStart(21, "input", 11);
      \u0275\u0275pipe(22, "i18n");
      \u0275\u0275listener("ngModelChange", function DlqComponent_Template_input_ngModelChange_21_listener($event) {
        return ctx.searchText.set($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(23, "p-select", 12);
      \u0275\u0275pipe(24, "i18n");
      \u0275\u0275listener("ngModelChange", function DlqComponent_Template_p_select_ngModelChange_23_listener($event) {
        return ctx.partnerFilter.set($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "p-select", 12);
      \u0275\u0275pipe(26, "i18n");
      \u0275\u0275listener("ngModelChange", function DlqComponent_Template_p_select_ngModelChange_25_listener($event) {
        return ctx.errorFilter.set($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "p-select", 12);
      \u0275\u0275pipe(28, "i18n");
      \u0275\u0275listener("ngModelChange", function DlqComponent_Template_p_select_ngModelChange_27_listener($event) {
        return ctx.dateFilter.set($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "span", 13);
      \u0275\u0275text(30);
      \u0275\u0275pipe(31, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(32, "p-table", 14, 0);
      \u0275\u0275twoWayListener("selectionChange", function DlqComponent_Template_p_table_selectionChange_32_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.selected, $event) || (ctx.selected = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275template(34, DlqComponent_ng_template_34_Template, 25, 21, "ng-template", 15)(35, DlqComponent_ng_template_35_Template, 30, 21, "ng-template", 16)(36, DlqComponent_ng_template_36_Template, 5, 3, "ng-template", 17);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(37, "p-drawer", 18);
      \u0275\u0275twoWayListener("visibleChange", function DlqComponent_Template_p_drawer_visibleChange_37_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.inspectorVisible, $event) || (ctx.inspectorVisible = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275conditionalCreate(38, DlqComponent_Conditional_38_Template, 69, 51);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      let tmp_24_0;
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 25, "dlq.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(9, 27, "dlq.subtitle", \u0275\u0275pureFunction1(46, _c0, ctx.messages().length)));
      \u0275\u0275advance(3);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(12, 30, "dlq.redriveSelected"))("disabled", ctx.selected.length === 0);
      \u0275\u0275advance(2);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(14, 32, "dlq.discardSelected"))("disabled", ctx.selected.length === 0);
      \u0275\u0275advance(2);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(16, 34, "dlq.redriveAll"))("disabled", ctx.filteredMessages().length === 0);
      \u0275\u0275advance(6);
      \u0275\u0275property("ngModel", ctx.searchText())("placeholder", \u0275\u0275pipeBind1(22, 36, "dlq.searchPlaceholder"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.partnerOptions())("ngModel", ctx.partnerFilter())("placeholder", \u0275\u0275pipeBind1(24, 38, "dlq.filterPartner"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.errorOptions())("ngModel", ctx.errorFilter())("placeholder", \u0275\u0275pipeBind1(26, 40, "dlq.filterError"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.dateOptions())("ngModel", ctx.dateFilter())("placeholder", \u0275\u0275pipeBind1(28, 42, "dlq.filterDate"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate2("", ctx.filteredMessages().length, " ", \u0275\u0275pipeBind1(31, 44, "dlq.results"));
      \u0275\u0275advance(2);
      \u0275\u0275property("value", ctx.filteredMessages());
      \u0275\u0275twoWayProperty("selection", ctx.selected);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("visible", ctx.inspectorVisible);
      \u0275\u0275advance();
      \u0275\u0275conditional((tmp_24_0 = ctx.inspected()) ? 38 : -1, tmp_24_0);
    }
  }, dependencies: [FormsModule, DefaultValueAccessor, NgControlStatus, NgModel, ButtonModule, Button, PrimeTemplate, CardModule, Card, ConfirmDialogModule, ConfirmDialog, DrawerModule, Drawer, InputTextModule, InputText, SelectModule, Select, TableModule, Table, TableCheckbox, TableHeaderCheckbox, TagModule, Tag, ToastModule, Toast, TooltipModule, Tooltip, I18nPipe], styles: ["\n.dlq-filter-bar[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.6rem;\n  margin-bottom: 1rem;\n}\n.dlq-search[_ngcontent-%COMP%] {\n  flex: 1 1 18rem;\n  min-width: 14rem;\n}\n.dlq-search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 100%;\n}\n[_nghost-%COMP%]     .dlq-filter-bar .p-select {\n  min-width: 11rem;\n}\n.filter-count[_ngcontent-%COMP%] {\n  margin-left: auto;\n  color: var(--text-color-secondary);\n  font-size: 0.82rem;\n  font-weight: 700;\n}\n.error-msg[_ngcontent-%COMP%] {\n  max-width: 280px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: var(--text-color-secondary);\n}\n.attempt-badge[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  font-family: monospace;\n  background: #fee2e2;\n  color: #dc2626;\n  padding: 2px 8px;\n  border-radius: 999px;\n}\n.row-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.125rem;\n  justify-content: flex-end;\n}\n.empty-cell[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 3rem !important;\n  color: var(--text-color-secondary);\n}\n.empty-cell[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 0.5rem;\n  color: #16a34a;\n  font-size: 2rem;\n}\n.text-sm[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n}\n[_nghost-%COMP%]     .payload-inspector-drawer {\n  width: min(38rem, 100vw);\n}\n.drawer-header[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.4rem;\n  padding-bottom: 1rem;\n  border-bottom: 1px solid var(--surface-border);\n}\n.drawer-eyebrow[_ngcontent-%COMP%], \n.payload-meta[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.inspector-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.drawer-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-color);\n}\n.payload-meta[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 0.75rem;\n  margin: 1rem 0;\n}\n.payload-meta[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  padding: 0.8rem;\n  background: var(--surface-ground);\n}\n.payload-meta[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 0.25rem;\n  color: var(--text-color);\n  font-size: 0.9rem;\n}\n.inspector-section[_ngcontent-%COMP%] {\n  margin-top: 1rem;\n}\n.inspector-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem;\n}\n.inspector-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-color);\n}\n.inspector-section[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%] {\n  max-height: 22rem;\n  overflow: auto;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-ground);\n  color: var(--text-color);\n  padding: 1rem;\n  font-size: 0.82rem;\n  white-space: pre-wrap;\n}\n.drawer-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-top: 1rem;\n}\n@media (max-width: 560px) {\n  .payload-meta[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=dlq.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DlqComponent, [{
    type: Component,
    args: [{ selector: "app-dlq", standalone: true, imports: [
      FormsModule,
      ButtonModule,
      CardModule,
      ConfirmDialogModule,
      DrawerModule,
      InputTextModule,
      SelectModule,
      TableModule,
      TagModule,
      ToastModule,
      TooltipModule,
      I18nPipe
    ], providers: [ConfirmationService, MessageService], template: `<p-toast />
<p-confirmDialog />

<div class="page-header">
  <div>
    <h1 class="page-title">{{ 'dlq.title' | i18n }}</h1>
    <p class="page-subtitle">{{ 'dlq.subtitle' | i18n: { count: messages().length } }}</p>
  </div>
  <div class="page-actions">
    <p-button
      [label]="'dlq.redriveSelected' | i18n"
      icon="pi pi-refresh"
      severity="secondary"
      variant="outlined"
      [disabled]="selected.length === 0"
      (onClick)="redriveSelected()" />
    <p-button
      [label]="'dlq.discardSelected' | i18n"
      icon="pi pi-trash"
      severity="danger"
      variant="outlined"
      [disabled]="selected.length === 0"
      (onClick)="confirmDiscardSelected($event)" />
    <p-button
      [label]="'dlq.redriveAll' | i18n"
      icon="pi pi-refresh"
      severity="danger"
      variant="outlined"
      [disabled]="filteredMessages().length === 0"
      (onClick)="redriveAll()" />
  </div>
</div>

<p-card>
  <div class="dlq-filter-bar">
    <span class="p-input-icon-left dlq-search">
      <i class="pi pi-search"></i>
      <input
        pInputText
        [ngModel]="searchText()"
        (ngModelChange)="searchText.set($event)"
        [placeholder]="'dlq.searchPlaceholder' | i18n" />
    </span>
    <p-select
      [options]="partnerOptions()"
      [ngModel]="partnerFilter()"
      (ngModelChange)="partnerFilter.set($event)"
      appendTo="body"
      [placeholder]="'dlq.filterPartner' | i18n" />
    <p-select
      [options]="errorOptions()"
      [ngModel]="errorFilter()"
      (ngModelChange)="errorFilter.set($event)"
      appendTo="body"
      [placeholder]="'dlq.filterError' | i18n" />
    <p-select
      [options]="dateOptions()"
      [ngModel]="dateFilter()"
      (ngModelChange)="dateFilter.set($event)"
      appendTo="body"
      [placeholder]="'dlq.filterDate' | i18n" />
    <span class="filter-count">{{ filteredMessages().length }} {{ 'dlq.results' | i18n }}</span>
  </div>

  <p-table
    [value]="filteredMessages()"
    [(selection)]="selected"
    dataKey="id"
    styleClass="p-datatable-sm"
    #dt>
    <ng-template pTemplate="header">
      <tr>
        <th style="width:3rem"><p-tableHeaderCheckbox /></th>
        <th>{{ 'table.partner' | i18n }}</th>
        <th>{{ 'table.eventType' | i18n }}</th>
        <th>{{ 'dlq.colErrorType' | i18n }}</th>
        <th>{{ 'dlq.colErrorMessage' | i18n }}</th>
        <th style="text-align:center">{{ 'dlq.colAttempts' | i18n }}</th>
        <th>{{ 'dlq.colFirstFailed' | i18n }}</th>
        <th>{{ 'dlq.colLastFailed' | i18n }}</th>
        <th style="width:120px"></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-msg>
      <tr>
        <td><p-tableCheckbox [value]="msg" /></td>
        <td><code class="partner-code">{{ msg.partner }}</code></td>
        <td><code class="event-code">{{ msg.eventType }}</code></td>
        <td><p-tag [severity]="getErrorSeverity(msg.errorType)" [value]="msg.errorType" /></td>
        <td class="error-msg text-sm">{{ msg.errorMessage }}</td>
        <td style="text-align:center">
          <span class="attempt-badge">{{ msg.attempts }}/3</span>
        </td>
        <td class="text-sm text-color-secondary">{{ msg.firstFailed }}</td>
        <td class="text-sm text-color-secondary">{{ msg.lastFailed }}</td>
        <td>
          <div class="row-actions">
            <p-button
              icon="pi pi-refresh"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="redriveMessage(msg)"
              [pTooltip]="'dlq.tooltipRedrive' | i18n" />
            <p-button
              icon="pi pi-eye"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="inspect(msg)"
              [pTooltip]="'dlq.tooltipInspect' | i18n" />
            <p-button
              icon="pi pi-wrench"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="createFixDraft(msg)"
              [pTooltip]="'dlq.tooltipFixDraft' | i18n" />
            <p-button
              icon="pi pi-trash"
              variant="text"
              severity="danger"
              size="small"
              (onClick)="confirmDiscard(msg, $event)"
              [pTooltip]="'dlq.tooltipDiscard' | i18n" />
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="9" class="empty-cell">
          <i class="pi pi-check-circle"></i>
          {{ 'dlq.empty' | i18n }}
        </td>
      </tr>
    </ng-template>
  </p-table>
</p-card>

<!-- \u2500\u2500 Payload inspector drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<p-drawer [(visible)]="inspectorVisible" position="right" styleClass="payload-inspector-drawer">
  @if (inspected(); as msg) {
    <div class="drawer-header">
      <span class="drawer-eyebrow">{{ 'dlq.inspectorTitle' | i18n }}</span>
      <h2>{{ msg.id }}</h2>
      <p-tag [severity]="getErrorSeverity(msg.errorType)" [value]="msg.errorType" />
    </div>

    <div class="payload-meta">
      <article>
        <span>{{ 'table.partner' | i18n }}</span>
        <strong>{{ msg.partner }}</strong>
      </article>
      <article>
        <span>{{ 'table.eventType' | i18n }}</span>
        <strong>{{ msg.eventType }}</strong>
      </article>
      <article>
        <span>{{ 'dlq.colAttempts' | i18n }}</span>
        <strong>{{ msg.attempts }}/3</strong>
      </article>
      <article>
        <span>{{ 'dlq.colFirstFailed' | i18n }}</span>
        <strong>{{ msg.firstFailed }}</strong>
      </article>
      <article>
        <span>{{ 'dlq.colLastFailed' | i18n }}</span>
        <strong>{{ msg.lastFailed }}</strong>
      </article>
      <article>
        <span>{{ 'dlq.traceId' | i18n }}</span>
        <strong>{{ msg.traceId }}</strong>
      </article>
    </div>

    <section class="inspector-section">
      <h3>{{ 'dlq.colErrorMessage' | i18n }}</h3>
      <p>{{ msg.errorMessage }}</p>
    </section>

    <section class="inspector-section">
      <h3>{{ 'dlq.payload' | i18n }}</h3>
      <pre>{{ prettyPayload(msg.payload) }}</pre>
    </section>

    <section class="inspector-section">
      <h3>{{ 'dlq.stackTrace' | i18n }}</h3>
      <pre>{{ msg.stackTrace }}</pre>
    </section>

    <div class="drawer-actions">
      <p-button
        [label]="'dlq.tooltipRedrive' | i18n"
        icon="pi pi-refresh"
        styleClass="w-full"
        (onClick)="redriveMessage(msg)" />
      <p-button
        [label]="'dlq.createFixDraft' | i18n"
        icon="pi pi-wrench"
        severity="secondary"
        variant="outlined"
        styleClass="w-full"
        (onClick)="createFixDraft(msg)" />
      <p-button
        [label]="'dlq.discard' | i18n"
        icon="pi pi-trash"
        severity="danger"
        variant="outlined"
        styleClass="w-full"
        (onClick)="confirmDiscard(msg, $event)" />
    </div>
  }
</p-drawer>
`, styles: ["/* src/app/pages/dlq/dlq.component.scss */\n.dlq-filter-bar {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.6rem;\n  margin-bottom: 1rem;\n}\n.dlq-search {\n  flex: 1 1 18rem;\n  min-width: 14rem;\n}\n.dlq-search input {\n  width: 100%;\n}\n:host ::ng-deep .dlq-filter-bar .p-select {\n  min-width: 11rem;\n}\n.filter-count {\n  margin-left: auto;\n  color: var(--text-color-secondary);\n  font-size: 0.82rem;\n  font-weight: 700;\n}\n.error-msg {\n  max-width: 280px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: var(--text-color-secondary);\n}\n.attempt-badge {\n  font-size: 0.75rem;\n  font-weight: 600;\n  font-family: monospace;\n  background: #fee2e2;\n  color: #dc2626;\n  padding: 2px 8px;\n  border-radius: 999px;\n}\n.row-actions {\n  display: flex;\n  gap: 0.125rem;\n  justify-content: flex-end;\n}\n.empty-cell {\n  text-align: center;\n  padding: 3rem !important;\n  color: var(--text-color-secondary);\n}\n.empty-cell i {\n  display: block;\n  margin-bottom: 0.5rem;\n  color: #16a34a;\n  font-size: 2rem;\n}\n.text-sm {\n  font-size: 0.875rem;\n}\n:host ::ng-deep .payload-inspector-drawer {\n  width: min(38rem, 100vw);\n}\n.drawer-header {\n  display: grid;\n  gap: 0.4rem;\n  padding-bottom: 1rem;\n  border-bottom: 1px solid var(--surface-border);\n}\n.drawer-eyebrow,\n.payload-meta span,\n.inspector-section h3 {\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.drawer-header h2 {\n  margin: 0;\n  color: var(--text-color);\n}\n.payload-meta {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 0.75rem;\n  margin: 1rem 0;\n}\n.payload-meta article {\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  padding: 0.8rem;\n  background: var(--surface-ground);\n}\n.payload-meta strong {\n  display: block;\n  margin-top: 0.25rem;\n  color: var(--text-color);\n  font-size: 0.9rem;\n}\n.inspector-section {\n  margin-top: 1rem;\n}\n.inspector-section h3 {\n  margin: 0 0 0.5rem;\n}\n.inspector-section p {\n  margin: 0;\n  color: var(--text-color);\n}\n.inspector-section pre {\n  max-height: 22rem;\n  overflow: auto;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-ground);\n  color: var(--text-color);\n  padding: 1rem;\n  font-size: 0.82rem;\n  white-space: pre-wrap;\n}\n.drawer-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-top: 1rem;\n}\n@media (max-width: 560px) {\n  .payload-meta {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=dlq.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DlqComponent, { className: "DlqComponent", filePath: "src/app/pages/dlq/dlq.component.ts", lineNumber: 47 });
})();
export {
  DlqComponent
};
//# sourceMappingURL=chunk-EKR36YER.js.map
