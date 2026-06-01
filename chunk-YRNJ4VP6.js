import {
  Drawer,
  DrawerModule
} from "./chunk-N2VYNPGE.js";
import {
  ExternalSystemService
} from "./chunk-24OWGEMK.js";
import {
  Router
} from "./chunk-CN6J73SX.js";
import {
  ConfirmDialog,
  ConfirmDialogModule
} from "./chunk-KWOSBMJ3.js";
import {
  Toast,
  ToastModule
} from "./chunk-IWXISTMZ.js";
import "./chunk-BYX7PGOZ.js";
import {
  Table,
  TableModule
} from "./chunk-NBT7AZAN.js";
import {
  Textarea,
  TextareaModule
} from "./chunk-S4BPTLD2.js";
import {
  Dialog,
  DialogModule
} from "./chunk-7IHEPO3A.js";
import {
  InputNumber,
  InputNumberModule
} from "./chunk-IZG4GOGI.js";
import {
  Card,
  CardModule
} from "./chunk-V7VFOMLF.js";
import {
  Tag,
  TagModule
} from "./chunk-ILW3Q6D6.js";
import {
  DefaultValueAccessor,
  FormsModule,
  InputText,
  InputTextModule,
  NgControlStatus,
  NgModel,
  Select,
  SelectModule
} from "./chunk-Z342JBET.js";
import {
  I18nPipe
} from "./chunk-JHIHXCEC.js";
import {
  Button,
  ButtonModule,
  Tooltip,
  TooltipModule
} from "./chunk-LABWMPEG.js";
import {
  I18nService
} from "./chunk-5RXXWD5O.js";
import "./chunk-FA3B2YOI.js";
import {
  ConfirmationService,
  DecimalPipe,
  MessageService,
  PrimeTemplate
} from "./chunk-OGO5ZH5D.js";
import {
  Component,
  __spreadProps,
  __spreadValues,
  computed,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵreference,
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
  ɵɵtextInterpolate3,
  ɵɵtextInterpolate4,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-KLG77GLC.js";

// src/app/pages/external-systems/external-systems.component.ts
var _c0 = () => ({ width: "min(46rem, calc(100vw - 2rem))" });
var _c1 = () => ({ width: "min(54rem, calc(100vw - 2rem))" });
var _forTrack0 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.name + $item.version;
function ExternalSystemsComponent_For_51_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "article");
    \u0275\u0275element(1, "i", 38);
    \u0275\u0275elementStart(2, "div")(3, "strong");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(7, "p-tag", 39);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const credential_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(credential_r1.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate3("", credential_r1.type, " \xB7 ", credential_r1.environment, " \xB7 ", credential_r1.lastUsed);
    \u0275\u0275advance();
    \u0275\u0275property("severity", ctx_r1.credentialSeverity(credential_r1.status))("value", \u0275\u0275pipeBind1(8, 6, "externalSystems.credentialStore.status." + credential_r1.status));
  }
}
function ExternalSystemsComponent_ng_template_64_Template(rf, ctx) {
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
    \u0275\u0275elementStart(16, "th");
    \u0275\u0275text(17);
    \u0275\u0275pipe(18, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "th");
    \u0275\u0275text(20);
    \u0275\u0275pipe(21, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275element(22, "th", 40);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 7, "externalSystems.col.connection"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 9, "externalSystems.col.type"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 11, "externalSystems.col.status"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 13, "externalSystems.col.success"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 15, "externalSystems.col.latency"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 17, "externalSystems.col.lastError"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(21, 19, "externalSystems.col.lastSuccess"));
  }
}
function ExternalSystemsComponent_ng_template_65_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td")(2, "div", 41)(3, "strong");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "small");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(9, "td")(10, "span", 42);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "small");
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "td");
    \u0275\u0275element(15, "p-tag", 39);
    \u0275\u0275pipe(16, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "td")(18, "div", 43)(19, "strong");
    \u0275\u0275text(20);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "span", 44);
    \u0275\u0275element(22, "span");
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(23, "svg", 45);
    \u0275\u0275element(24, "polyline");
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(25, "td")(26, "div", 46)(27, "strong");
    \u0275\u0275text(28);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "small");
    \u0275\u0275text(30);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(31, "td", 47);
    \u0275\u0275text(32);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "td", 48);
    \u0275\u0275text(34);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "td")(36, "div", 49)(37, "p-button", 50);
    \u0275\u0275pipe(38, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_ng_template_65_Template_p_button_onClick_37_listener() {
      const row_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.test(row_r4));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "p-button", 51);
    \u0275\u0275pipe(40, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_ng_template_65_Template_p_button_onClick_39_listener() {
      const row_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openDetail(row_r4));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(41, "p-button", 52);
    \u0275\u0275pipe(42, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_ng_template_65_Template_p_button_onClick_41_listener() {
      const row_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openEdit(row_r4));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "p-button", 53);
    \u0275\u0275pipe(44, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_ng_template_65_Template_p_button_onClick_43_listener($event) {
      const row_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.confirmDelete(row_r4, $event));
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const row_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(row_r4.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", row_r4.partner, " \xB7 ", row_r4.eventType);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", row_r4.method, " ", row_r4.url);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(row_r4.type);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(row_r4.environment);
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", ctx_r1.statusSeverity(row_r4.status))("value", \u0275\u0275pipeBind1(16, 22, "externalSystems.status." + row_r4.status));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("", row_r4.successRate ?? 0, "%");
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ctx_r1.successWidth(row_r4), "%");
    \u0275\u0275advance(2);
    \u0275\u0275attribute("points", ctx_r1.sparklinePoints(row_r4));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", row_r4.avgMs ?? 0, "ms");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("p95 ", row_r4.p95Ms ?? 0, "ms");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(row_r4.lastError);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(row_r4.lastSuccess);
    \u0275\u0275advance(3);
    \u0275\u0275property("loading", ctx_r1.testingId() === row_r4.id)("pTooltip", \u0275\u0275pipeBind1(38, 24, "externalSystems.action.test"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(40, 26, "externalSystems.action.view"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(42, 28, "externalSystems.action.edit"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(44, 30, "externalSystems.delete"));
  }
}
function ExternalSystemsComponent_ng_template_66_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 54);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 1, "externalSystems.empty"));
  }
}
function ExternalSystemsComponent_Conditional_68_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 68)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "strong");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const selected_r6 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 2, "externalSystems.detail.eyebrow"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(selected_r6.name);
  }
}
function ExternalSystemsComponent_Conditional_68_For_89_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "article")(1, "div")(2, "strong");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(6, "p-tag", 39);
    \u0275\u0275pipe(7, "i18n");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mapping_r7 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(mapping_r7.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(mapping_r7.version);
    \u0275\u0275advance();
    \u0275\u0275property("severity", ctx_r1.mappingSeverity(mapping_r7.status))("value", \u0275\u0275pipeBind1(7, 4, "status." + mapping_r7.status));
  }
}
function ExternalSystemsComponent_Conditional_68_ForEmpty_90_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 64);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "i18n");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(2, 1, "externalSystems.detail.noMappings"));
  }
}
function ExternalSystemsComponent_Conditional_68_For_100_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "article", 67);
    \u0275\u0275element(1, "p-tag", 39);
    \u0275\u0275elementStart(2, "div")(3, "strong");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "details", 69)(8, "summary");
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "label");
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "pre");
    \u0275\u0275text(15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "label");
    \u0275\u0275text(17);
    \u0275\u0275pipe(18, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "pre");
    \u0275\u0275text(20);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "label");
    \u0275\u0275text(22);
    \u0275\u0275pipe(23, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "pre");
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const call_r8 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("severity", ctx_r1.callSeverity(call_r8.result))("value", call_r8.status ? "HTTP " + call_r8.status : "LOCAL");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(call_r8.message);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate3("", call_r8.at, " \xB7 ", call_r8.durationMs, "ms \xB7 ", call_r8.requestId);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 13, "externalSystems.detail.logDetail"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(13, 15, "externalSystems.detail.headers"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(call_r8.headers);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 17, "externalSystems.detail.request"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(call_r8.requestBody);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(23, 19, "externalSystems.detail.response"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(call_r8.responseBody);
  }
}
function ExternalSystemsComponent_Conditional_68_ForEmpty_101_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 64);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "i18n");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(2, 1, "externalSystems.detail.noHistory"));
  }
}
function ExternalSystemsComponent_Conditional_68_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275template(0, ExternalSystemsComponent_Conditional_68_ng_template_0_Template, 6, 4, "ng-template", 18);
    \u0275\u0275elementStart(1, "section", 55)(2, "div", 56);
    \u0275\u0275element(3, "p-tag", 39);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementStart(5, "span");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "dl", 57)(8, "div")(9, "dt");
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "dd");
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div")(15, "dt");
    \u0275\u0275text(16);
    \u0275\u0275pipe(17, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "dd");
    \u0275\u0275text(19);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(20, "div")(21, "dt");
    \u0275\u0275text(22);
    \u0275\u0275pipe(23, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "dd");
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "div")(27, "dt");
    \u0275\u0275text(28);
    \u0275\u0275pipe(29, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "dd");
    \u0275\u0275text(31);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "div")(33, "dt");
    \u0275\u0275text(34);
    \u0275\u0275pipe(35, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "dd");
    \u0275\u0275text(37);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(38, "div")(39, "dt");
    \u0275\u0275text(40);
    \u0275\u0275pipe(41, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "dd");
    \u0275\u0275text(43);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(44, "div", 58)(45, "dt");
    \u0275\u0275text(46);
    \u0275\u0275pipe(47, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(48, "dd");
    \u0275\u0275text(49);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(50, "section", 55)(51, "h3");
    \u0275\u0275text(52);
    \u0275\u0275pipe(53, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "div", 59)(55, "article")(56, "span");
    \u0275\u0275text(57);
    \u0275\u0275pipe(58, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(59, "strong");
    \u0275\u0275text(60);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(61, "article")(62, "span");
    \u0275\u0275text(63);
    \u0275\u0275pipe(64, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(65, "strong");
    \u0275\u0275text(66);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(67, "article")(68, "span");
    \u0275\u0275text(69);
    \u0275\u0275pipe(70, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(71, "strong");
    \u0275\u0275text(72);
    \u0275\u0275pipe(73, "number");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(74, "section", 55)(75, "div", 60)(76, "h3");
    \u0275\u0275text(77);
    \u0275\u0275pipe(78, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(79, "p-button", 61);
    \u0275\u0275pipe(80, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_Conditional_68_Template_p_button_onClick_79_listener() {
      const selected_r6 = \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.useSampleInStudio(selected_r6));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(81, "pre", 62);
    \u0275\u0275text(82);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(83, "section", 55)(84, "h3");
    \u0275\u0275text(85);
    \u0275\u0275pipe(86, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(87, "div", 63);
    \u0275\u0275repeaterCreate(88, ExternalSystemsComponent_Conditional_68_For_89_Template, 8, 6, "article", null, _forTrack1, false, ExternalSystemsComponent_Conditional_68_ForEmpty_90_Template, 3, 3, "p", 64);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(91, "section", 55)(92, "div", 60)(93, "h3");
    \u0275\u0275text(94);
    \u0275\u0275pipe(95, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(96, "p-button", 65);
    \u0275\u0275pipe(97, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_Conditional_68_Template_p_button_onClick_96_listener() {
      const selected_r6 = \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.test(selected_r6));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(98, "div", 66);
    \u0275\u0275repeaterCreate(99, ExternalSystemsComponent_Conditional_68_For_100_Template, 26, 21, "article", 67, _forTrack0, false, ExternalSystemsComponent_Conditional_68_ForEmpty_101_Template, 3, 3, "p", 64);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const selected_r6 = ctx;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275property("severity", ctx_r1.statusSeverity(selected_r6.status))("value", \u0275\u0275pipeBind1(4, 35, "externalSystems.status." + selected_r6.status));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.healthExplanation(selected_r6));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 37, "externalSystems.col.connection"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate2("", selected_r6.partner, " \xB7 ", selected_r6.eventType);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(17, 39, "externalSystems.col.type"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate2("", selected_r6.type, " \xB7 ", selected_r6.environment);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(23, 41, "externalSystems.form.method"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(selected_r6.method);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(29, 43, "externalSystems.form.authType"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(selected_r6.authType);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(35, 45, "externalSystems.form.credentialName"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(selected_r6.credentialName || "\u2014");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(41, 47, "externalSystems.detail.typeConfig"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.typeConfigHint(selected_r6));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(47, 49, "externalSystems.form.url"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(selected_r6.url);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(53, 51, "externalSystems.detail.metrics"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(58, 53, "externalSystems.col.success"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", selected_r6.successRate ?? 0, "%");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(64, 55, "externalSystems.col.latency"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", selected_r6.avgMs ?? 0, "ms");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(70, 57, "externalSystems.colLast24h"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(73, 59, selected_r6.calls24h));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(78, 61, "externalSystems.detail.sample"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(80, 63, "externalSystems.action.useInStudio"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(selected_r6.sampleJson);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(86, 65, "externalSystems.detail.mappings"));
    \u0275\u0275advance(3);
    \u0275\u0275repeater(selected_r6.mappings);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(95, 67, "externalSystems.detail.history"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(97, 69, "externalSystems.action.test"))("loading", ctx_r1.testingId() === selected_r6.id);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r1.selectedHistory());
  }
}
function ExternalSystemsComponent_Conditional_123_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 24)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 70);
    \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Conditional_123_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.form.pollSchedule, $event) || (ctx_r1.form.pollSchedule = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "label", 24)(6, "span");
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p-select", 28);
    \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Conditional_123_Template_p_select_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.form.pollInterval, $event) || (ctx_r1.form.pollInterval = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "label", 24)(11, "span");
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "input", 71);
    \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Conditional_123_Template_input_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.form.firstRunAt, $event) || (ctx_r1.form.firstRunAt = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "label", 24)(16, "span");
    \u0275\u0275text(17);
    \u0275\u0275pipe(18, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "p-select", 72);
    \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Conditional_123_Template_p_select_ngModelChange_19_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.form.checkpointMode, $event) || (ctx_r1.form.checkpointMode = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 11, "externalSystems.form.pollSchedule"));
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.pollSchedule);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 13, "externalSystems.form.pollInterval"));
    \u0275\u0275advance(2);
    \u0275\u0275property("options", ctx_r1.pollIntervalOptions);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.pollInterval);
    \u0275\u0275property("editable", true);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(13, 15, "externalSystems.form.firstRunAt"));
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.firstRunAt);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 17, "externalSystems.form.checkpointMode"));
    \u0275\u0275advance(2);
    \u0275\u0275property("options", ctx_r1.checkpointModeOptions);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.checkpointMode);
  }
}
function ExternalSystemsComponent_Conditional_124_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 77);
    \u0275\u0275element(1, "i", 79);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.form.wsdlFileName, " ");
  }
}
function ExternalSystemsComponent_Conditional_124_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "pre", 78);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.form.wsdlPreview);
  }
}
function ExternalSystemsComponent_Conditional_124_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 27)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 73);
    \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Conditional_124_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.form.wsdlUrl, $event) || (ctx_r1.form.wsdlUrl = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 27)(6, "span");
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 74)(10, "input", 75, 0);
    \u0275\u0275listener("change", function ExternalSystemsComponent_Conditional_124_Template_input_change_10_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onWsdlFileSelected($event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "p-button", 76);
    \u0275\u0275pipe(13, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_Conditional_124_Template_p_button_onClick_12_listener() {
      \u0275\u0275restoreView(_r10);
      const wsdlInput_r11 = \u0275\u0275reference(11);
      return \u0275\u0275resetView(wsdlInput_r11.click());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(14, ExternalSystemsComponent_Conditional_124_Conditional_14_Template, 3, 1, "span", 77);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(15, ExternalSystemsComponent_Conditional_124_Conditional_15_Template, 2, 1, "pre", 78);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 6, "externalSystems.form.wsdlUrl"));
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.form.wsdlUrl);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 8, "externalSystems.form.wsdlFile"));
    \u0275\u0275advance(5);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(13, 10, "externalSystems.form.wsdlUpload"));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.form.wsdlFileName ? 14 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.form.wsdlPreview ? 15 : -1);
  }
}
function ExternalSystemsComponent_ng_template_130_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-button", 80);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_ng_template_130_Template_p_button_onClick_0_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.dialogVisible = false);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p-button", 81);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_ng_template_130_Template_p_button_onClick_2_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.save());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("label", \u0275\u0275pipeBind1(1, 3, "externalSystems.cancel"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(3, 5, "externalSystems.save"))("disabled", !ctx_r1.formValid);
  }
}
function ExternalSystemsComponent_For_136_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "article")(1, "div")(2, "strong");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(6, "p-tag", 39);
    \u0275\u0275pipe(7, "i18n");
    \u0275\u0275elementStart(8, "div", 82)(9, "p-button", 52);
    \u0275\u0275pipe(10, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_For_136_Template_p_button_onClick_9_listener() {
      const credential_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openCredentialEdit(credential_r14));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "p-button", 83);
    \u0275\u0275pipe(12, "i18n");
    \u0275\u0275listener("onClick", function ExternalSystemsComponent_For_136_Template_p_button_onClick_11_listener() {
      const credential_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.disableCredential(credential_r14));
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const credential_r14 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(credential_r14.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate4("", credential_r14.type, " \xB7 ", credential_r14.environment, " \xB7 ", credential_r14.owner, " \xB7 ", credential_r14.lastUsed);
    \u0275\u0275advance();
    \u0275\u0275property("severity", ctx_r1.credentialSeverity(credential_r14.status))("value", \u0275\u0275pipeBind1(7, 10, "externalSystems.credentialStore.status." + credential_r14.status));
    \u0275\u0275advance(3);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(10, 12, "externalSystems.action.edit"));
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", credential_r14.status === "disabled")("pTooltip", \u0275\u0275pipeBind1(12, 14, "externalSystems.credentialStore.disable"));
  }
}
var EMPTY_FORM = {
  name: "",
  partner: "",
  eventType: "",
  type: "REST",
  environment: "SANDBOX",
  method: "GET",
  url: "https://api.example.com/orders",
  authType: "None",
  timeoutMs: 5e3,
  credentialName: "",
  pollSchedule: "*/5 * * * *",
  pollInterval: "5 minutes",
  firstRunAt: "",
  checkpointMode: "watermark",
  wsdlUrl: "",
  wsdlFileName: "",
  wsdlPreview: "",
  sampleJson: '{\n  "orders": []\n}',
  requestPreview: '{\n  "limit": 10\n}',
  responsePreview: '{\n  "orders": []\n}',
  mappings: [],
  sparkline: [96, 97, 98, 99, 99, 98, 100]
};
var EMPTY_CREDENTIAL_FORM = {
  name: "",
  type: "API Key",
  environment: "SANDBOX",
  owner: "",
  secretValue: ""
};
var STUDIO_EXTERNAL_SAMPLE_KEY = "canonbridge:external-systems:selected-sample";
var ExternalSystemsComponent = class _ExternalSystemsComponent {
  confirmation = inject(ConfirmationService);
  toast = inject(MessageService);
  i18n = inject(I18nService);
  router = inject(Router);
  externalSystemService = inject(ExternalSystemService);
  _connections = signal([], ...ngDevMode ? [{ debugName: "_connections" }] : (
    /* istanbul ignore next */
    []
  ));
  connections = this._connections.asReadonly();
  loading = signal(false, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  testingId = signal(null, ...ngDevMode ? [{ debugName: "testingId" }] : (
    /* istanbul ignore next */
    []
  ));
  selectedConnection = signal(null, ...ngDevMode ? [{ debugName: "selectedConnection" }] : (
    /* istanbul ignore next */
    []
  ));
  detailVisible = false;
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadConnections();
  }
  loadConnections() {
    this.loading.set(true);
    this.externalSystemService.list().subscribe({
      next: (apiConnections) => {
        if (!apiConnections) {
          this._connections.set([]);
          this.loading.set(false);
          return;
        }
        const connections = Array.isArray(apiConnections) ? apiConnections : [];
        const uiConnections = connections.map((conn) => this.mapApiToUi(conn));
        this._connections.set(uiConnections);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to load external systems:", err);
        this.toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load external systems"
        });
        this._connections.set([]);
        this.loading.set(false);
      }
    });
  }
  mapApiToUi(conn) {
    const lastTestResult = conn.last_test_result ? JSON.parse(conn.last_test_result) : null;
    const status = this.mapStatus(conn.status || "NOT_TESTED");
    return {
      id: conn.connection_id || "",
      connectionId: conn.connection_id,
      name: conn.name,
      partner: this.extractPartnerFromName(conn.name),
      eventType: this.extractEventType(conn.name),
      type: conn.protocol || "REST",
      protocol: conn.protocol,
      environment: conn.environment,
      status,
      successRate: lastTestResult?.success ? 99.5 : status === "FAILED" ? 0 : null,
      avgMs: lastTestResult?.durationMs || null,
      p95Ms: lastTestResult?.durationMs ? Math.round(lastTestResult.durationMs * 1.7) : null,
      lastError: lastTestResult?.success === false ? lastTestResult.error || "Test failed" : "\u2014",
      lastSuccess: conn.last_test_at ? this.formatTimestamp(conn.last_test_at) : "\u2014",
      calls24h: 0,
      method: conn.method || "GET",
      url: conn.url,
      authType: conn.credential_id ? "OAuth2" : "None",
      timeoutMs: conn.timeout_ms || 5e3,
      credentialName: conn.credential_id || "",
      credentialId: conn.credential_id,
      pollSchedule: conn.schedule || "",
      schedule: conn.schedule,
      pollInterval: "",
      firstRunAt: "",
      checkpointMode: "idempotency_only",
      wsdlUrl: "",
      wsdlFileName: "",
      wsdlPreview: "",
      sampleJson: "{}",
      requestPreview: "{}",
      responsePreview: lastTestResult?.body || lastTestResult?.responseBody || "{}",
      mappings: [],
      sparkline: this.generateSparkline(status),
      purpose: conn.purpose,
      retryPolicy: conn.retry_policy,
      responseHandling: conn.response_handling,
      lastTestAt: conn.last_test_at,
      lastTestResult: conn.last_test_result
    };
  }
  mapStatus(apiStatus) {
    const statusMap = {
      "NOT_TESTED": "NOT_TESTED",
      "HEALTHY": "HEALTHY",
      "DEGRADED": "DEGRADED",
      "FAILED": "FAILED",
      "DISABLED": "DISABLED"
    };
    return statusMap[apiStatus] || "NOT_TESTED";
  }
  extractPartnerFromName(name) {
    const words = name.split(" ");
    return words.length > 1 ? words.slice(0, 2).join(" ") : name;
  }
  extractEventType(name) {
    if (name.toLowerCase().includes("order"))
      return "OrderCreated";
    if (name.toLowerCase().includes("shipment"))
      return "ShipmentUpdated";
    if (name.toLowerCase().includes("payment"))
      return "PaymentAuthorized";
    if (name.toLowerCase().includes("customer"))
      return "CustomerUpdated";
    return "Unknown";
  }
  generateSparkline(status) {
    if (status === "HEALTHY")
      return [98, 99, 99, 100, 99, 98, 99];
    if (status === "DEGRADED")
      return [94, 93, 91, 90, 92, 91, 89];
    if (status === "FAILED")
      return [91, 88, 76, 72, 70, 73, 72];
    return [0, 0, 0, 0, 0, 0, 0];
  }
  formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 6e4);
      const diffHours = Math.floor(diffMs / 36e5);
      if (diffMins < 1)
        return "just now";
      if (diffMins < 60)
        return `${diffMins} min ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      return date.toISOString().slice(0, 10);
    } catch {
      return timestamp;
    }
  }
  _callHistory = signal([], ...ngDevMode ? [{ debugName: "_callHistory" }] : (
    /* istanbul ignore next */
    []
  ));
  callHistory = this._callHistory.asReadonly();
  selectedHistory = computed(() => {
    const selected = this.selectedConnection();
    if (!selected)
      return [];
    return this._callHistory().filter((row) => row.connectionId === selected.id).slice(0, 12);
  }, ...ngDevMode ? [{ debugName: "selectedHistory" }] : (
    /* istanbul ignore next */
    []
  ));
  // ── Filters as signals (reactive) ─────────────────────────────────────────
  partnerFilter = signal("All", ...ngDevMode ? [{ debugName: "partnerFilter" }] : (
    /* istanbul ignore next */
    []
  ));
  typeFilter = signal("All", ...ngDevMode ? [{ debugName: "typeFilter" }] : (
    /* istanbul ignore next */
    []
  ));
  environmentFilter = signal("All", ...ngDevMode ? [{ debugName: "environmentFilter" }] : (
    /* istanbul ignore next */
    []
  ));
  typeOptions = ["All", "REST", "SOAP", "GRAPHQL", "GRPC"];
  environmentOptions = ["All", "PRODUCTION", "SANDBOX"];
  formTypeOptions = ["REST", "SOAP", "GRAPHQL", "GRPC"];
  methodOptions = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  authOptions = ["None", "API Key", "Basic Auth", "OAuth2"];
  credentialTypeOptions = ["API Key", "Basic Auth", "OAuth2"];
  pollIntervalOptions = ["1 minute", "5 minutes", "15 minutes", "30 minutes", "1 hour"];
  checkpointModeOptions = [
    { label: "Watermark", value: "watermark" },
    { label: "Page token", value: "page_token" },
    { label: "Idempotency only", value: "idempotency_only" }
  ];
  credentials = signal([], ...ngDevMode ? [{ debugName: "credentials" }] : (
    /* istanbul ignore next */
    []
  ));
  credentialNameOptions = computed(() => this.credentials().filter((c) => c.status !== "disabled").map((c) => c.name), ...ngDevMode ? [{ debugName: "credentialNameOptions" }] : (
    /* istanbul ignore next */
    []
  ));
  partnerOptions = computed(() => ["All", ...Array.from(new Set(this._connections().map((c) => c.partner))).sort()], ...ngDevMode ? [{ debugName: "partnerOptions" }] : (
    /* istanbul ignore next */
    []
  ));
  filteredConnections = computed(() => this._connections().filter((c) => (this.partnerFilter() === "All" || c.partner === this.partnerFilter()) && (this.typeFilter() === "All" || c.type === this.typeFilter()) && (this.environmentFilter() === "All" || c.environment === this.environmentFilter())), ...ngDevMode ? [{ debugName: "filteredConnections" }] : (
    /* istanbul ignore next */
    []
  ));
  totals = computed(() => {
    const list = this.filteredConnections();
    return {
      healthy: list.filter((c) => c.status === "HEALTHY").length,
      degraded: list.filter((c) => c.status === "DEGRADED").length,
      down: list.filter((c) => c.status === "FAILED").length,
      calls: list.reduce((sum, c) => sum + c.calls24h, 0)
    };
  }, ...ngDevMode ? [{ debugName: "totals" }] : (
    /* istanbul ignore next */
    []
  ));
  // ── Dialog state ──────────────────────────────────────────────────────────
  dialogVisible = false;
  isEdit = false;
  form = __spreadValues({}, EMPTY_FORM);
  credentialDialogVisible = false;
  credentialIsEdit = false;
  credentialForm = __spreadValues({}, EMPTY_CREDENTIAL_FORM);
  // ── CRUD ──────────────────────────────────────────────────────────────────
  openAdd() {
    this.isEdit = false;
    this.form = __spreadValues({}, EMPTY_FORM);
    this.dialogVisible = true;
  }
  openEdit(connection) {
    this.isEdit = true;
    const { id, name, partner, eventType, type, environment, method, url, authType, timeoutMs, credentialName, pollSchedule, pollInterval, firstRunAt, checkpointMode, wsdlUrl, wsdlFileName, wsdlPreview, sampleJson, requestPreview, responsePreview, mappings, sparkline } = connection;
    this.form = {
      id,
      name,
      partner,
      eventType,
      type,
      environment,
      method,
      url,
      authType,
      timeoutMs,
      credentialName,
      pollSchedule,
      pollInterval,
      firstRunAt,
      checkpointMode,
      wsdlUrl,
      wsdlFileName,
      wsdlPreview,
      sampleJson,
      requestPreview,
      responsePreview,
      mappings: [...mappings],
      sparkline: [...sparkline]
    };
    this.dialogVisible = true;
  }
  save() {
    if (!this.formValid) {
      this.toast.add({ severity: "warn", summary: this.t("externalSystems.toast.invalidTitle"), detail: this.t("externalSystems.toast.invalidDetail") });
      return;
    }
    this.loading.set(true);
    const apiConnection = {
      name: this.form.name,
      purpose: this.form.purpose || "MANUAL_TEST",
      protocol: this.form.type,
      method: this.form.method,
      url: this.form.url,
      environment: this.form.environment,
      schedule: this.form.pollSchedule || void 0,
      timeout_ms: this.form.timeoutMs,
      retry_policy: this.form.retryPolicy,
      response_handling: this.form.responseHandling
    };
    if (this.isEdit && this.form.id) {
      this.externalSystemService.update(this.form.id, apiConnection).subscribe({
        next: (updated) => {
          this._connections.update((list) => list.map((c) => c.id === this.form.id ? this.mapApiToUi(updated) : c));
          this.toast.add({ severity: "success", summary: this.t("externalSystems.toast.updated"), detail: this.form.name });
          this.dialogVisible = false;
          this.loading.set(false);
        },
        error: (err) => {
          console.error("Failed to update connection:", err);
          this.toast.add({ severity: "error", summary: "Error", detail: "Failed to update connection" });
          this.loading.set(false);
        }
      });
    } else {
      this.externalSystemService.create(apiConnection).subscribe({
        next: (created) => {
          this._connections.update((list) => [this.mapApiToUi(created), ...list]);
          this.toast.add({ severity: "success", summary: this.t("externalSystems.toast.created"), detail: created.name });
          this.dialogVisible = false;
          this.loading.set(false);
        },
        error: (err) => {
          console.error("Failed to create connection:", err);
          this.toast.add({ severity: "error", summary: "Error", detail: "Failed to create connection" });
          this.loading.set(false);
        }
      });
    }
  }
  confirmDelete(connection, event) {
    this.confirmation.confirm({
      target: event.target,
      header: this.t("externalSystems.deleteTitle"),
      message: this.t("externalSystems.deleteMessage", { name: connection.name }),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: this.t("externalSystems.delete"),
      rejectLabel: this.t("externalSystems.cancel"),
      accept: () => {
        this.loading.set(true);
        this.externalSystemService.delete(connection.id).subscribe({
          next: () => {
            this._connections.update((list) => list.filter((c) => c.id !== connection.id));
            this.toast.add({ severity: "warn", summary: this.t("externalSystems.toast.deleted"), detail: connection.name });
            this.loading.set(false);
          },
          error: (err) => {
            console.error("Failed to delete connection:", err);
            this.toast.add({ severity: "error", summary: "Error", detail: "Failed to delete connection" });
            this.loading.set(false);
          }
        });
      }
    });
  }
  openDetail(connection) {
    this.selectedConnection.set(connection);
    this.detailVisible = true;
  }
  openCredentialStore() {
    this.credentialIsEdit = false;
    this.credentialForm = __spreadValues({}, EMPTY_CREDENTIAL_FORM);
    this.credentialDialogVisible = true;
  }
  openCredentialEdit(credential) {
    this.credentialIsEdit = true;
    const { id, name, type, environment, owner } = credential;
    this.credentialForm = { id, name, type, environment, owner, secretValue: "" };
    this.credentialDialogVisible = true;
  }
  saveCredentialRecord() {
    if (!this.credentialForm.name.trim() || !this.credentialForm.owner.trim()) {
      this.toast.add({
        severity: "warn",
        summary: this.t("externalSystems.credentialStore.invalidTitle"),
        detail: this.t("externalSystems.credentialStore.invalidDetail")
      });
      return;
    }
    if (this.credentialIsEdit && this.credentialForm.id) {
      this.credentials.update((list) => list.map((credential) => credential.id === this.credentialForm.id ? __spreadProps(__spreadValues({}, credential), {
        name: this.credentialForm.name,
        type: this.credentialForm.type,
        environment: this.credentialForm.environment,
        owner: this.credentialForm.owner,
        status: "active"
      }) : credential));
    } else {
      this.credentials.update((list) => [{
        id: `cred-${Date.now()}`,
        name: this.credentialForm.name,
        type: this.credentialForm.type,
        environment: this.credentialForm.environment,
        owner: this.credentialForm.owner,
        lastUsed: this.t("externalSystems.credentialStore.neverUsed"),
        status: "active"
      }, ...list]);
    }
    this.credentialDialogVisible = false;
    this.toast.add({
      severity: "success",
      summary: this.t("externalSystems.toast.credentialSaved"),
      detail: this.credentialForm.name
    });
  }
  disableCredential(credential) {
    this.credentials.update((list) => list.map((row) => row.id === credential.id ? __spreadProps(__spreadValues({}, row), { status: "disabled" }) : row));
    this.toast.add({
      severity: "warn",
      summary: this.t("externalSystems.toast.credentialDisabled"),
      detail: credential.name
    });
  }
  test(connection) {
    if (this.testingId())
      return;
    this.testingId.set(connection.id);
    this.externalSystemService.test(connection.id, {
      headers: {},
      payload: connection.requestPreview ? JSON.parse(connection.requestPreview) : void 0
    }).subscribe({
      next: (result) => {
        const nextStatus = result.success ? "HEALTHY" : "FAILED";
        const durationMs = result.durationMs ?? 0;
        this._connections.update((list) => list.map((c) => c.id === connection.id ? __spreadProps(__spreadValues({}, c), {
          status: nextStatus,
          successRate: result.success ? 99.7 : 0,
          avgMs: durationMs,
          p95Ms: Math.round(durationMs * 1.7),
          lastError: result.success ? "\u2014" : result.errorMessage || result.body || "Test failed",
          lastSuccess: result.success ? "just now" : c.lastSuccess,
          sparkline: this.generateSparkline(nextStatus)
        }) : c));
        if (this.selectedConnection()?.id === connection.id) {
          const updated = this._connections().find((c) => c.id === connection.id) ?? null;
          this.selectedConnection.set(updated);
        }
        this.toast.add({
          severity: result.success ? "success" : "error",
          summary: result.success ? this.t("externalSystems.toast.testPassed") : this.t("externalSystems.toast.testFailed"),
          detail: result.success ? `${connection.name} \xB7 ${durationMs}ms` : result.errorMessage || result.body
        });
        this.testingId.set(null);
      },
      error: (err) => {
        console.error("Test failed:", err);
        this.toast.add({
          severity: "error",
          summary: this.t("externalSystems.toast.testFailed"),
          detail: connection.name
        });
        this.testingId.set(null);
      }
    });
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  statusSeverity(status) {
    const map = {
      HEALTHY: "success",
      DEGRADED: "warn",
      FAILED: "danger",
      NOT_TESTED: "secondary",
      DISABLED: "secondary"
    };
    return map[status];
  }
  callSeverity(result) {
    return result === "success" ? "success" : "danger";
  }
  healthExplanation(connection) {
    if (connection.status === "HEALTHY")
      return this.t("externalSystems.health.healthy");
    if (connection.status === "DEGRADED")
      return this.t("externalSystems.health.degraded");
    if (connection.status === "FAILED")
      return this.t("externalSystems.health.down");
    return this.t("externalSystems.health.notTested");
  }
  successWidth(connection) {
    return Math.max(0, Math.min(100, connection.successRate ?? 0));
  }
  mappingSeverity(status) {
    if (status === "active")
      return "success";
    if (status === "draft")
      return "warn";
    return "secondary";
  }
  credentialSeverity(status) {
    if (status === "active")
      return "success";
    if (status === "rotationDue")
      return "warn";
    return "secondary";
  }
  connectionCredential(connection) {
    return this.credentials().find((credential) => credential.name === connection.credentialName) ?? null;
  }
  sparklinePoints(connection) {
    const values = connection.sparkline.length ? connection.sparkline : [0];
    const max = Math.max(...values, 100);
    const min = Math.min(...values, 0);
    const spread = Math.max(1, max - min);
    return values.map((value, index) => {
      const x = values.length === 1 ? 50 : index / (values.length - 1) * 100;
      const y = 48 - (value - min) / spread * 40;
      return `${x},${y}`;
    }).join(" ");
  }
  useSampleInStudio(connection) {
    localStorage.setItem(STUDIO_EXTERNAL_SAMPLE_KEY, JSON.stringify({
      connectionId: connection.id,
      connectionName: connection.name,
      partner: connection.partner,
      eventType: connection.eventType,
      sourceType: this.studioSourceTypeForConnection(connection),
      sampleJson: connection.sampleJson,
      capturedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    this.toast.add({
      severity: "success",
      summary: this.t("externalSystems.toast.sampleReady"),
      detail: connection.name,
      life: 3e3
    });
    void this.router.navigate(["/studio"]);
  }
  typeConfigHint(connection) {
    if (connection.pollSchedule) {
      const detail = [connection.pollSchedule || "manual", connection.pollInterval, connection.firstRunAt].filter(Boolean).join(" \xB7 ");
      return this.t("externalSystems.detail.pollHint", { schedule: detail });
    }
    if (connection.type === "SOAP") {
      return this.t("externalSystems.detail.wsdlHint", { wsdl: connection.wsdlFileName || connection.wsdlUrl || connection.url });
    }
    if (connection.type === "GRPC") {
      return this.t("externalSystems.detail.grpcHint");
    }
    return this.t("externalSystems.detail.restHint");
  }
  studioSourceTypeForConnection(connection) {
    if (connection.type === "SOAP")
      return "soap";
    if (connection.type === "GRPC")
      return "grpc";
    if (connection.type === "GRAPHQL")
      return "apiEnrichment";
    return "externalApi";
  }
  get formValid() {
    return !!this.form.name.trim() && !!this.form.partner.trim() && !!this.form.eventType.trim() && !!this.form.url.trim() && (this.form.type !== "SOAP" || !!this.form.wsdlUrl.trim() || !!this.form.wsdlFileName.trim());
  }
  onWsdlFileSelected(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file)
      return;
    const reader = new FileReader();
    reader.onload = () => {
      this.form.wsdlFileName = file.name;
      this.form.wsdlPreview = String(reader.result ?? "").slice(0, 1800);
      this.toast.add({
        severity: "success",
        summary: this.t("externalSystems.toast.wsdlLoaded"),
        detail: file.name
      });
      input.value = "";
    };
    reader.readAsText(file);
  }
  t(key, params) {
    return this.i18n.translate(key, params);
  }
  static \u0275fac = function ExternalSystemsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ExternalSystemsComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ExternalSystemsComponent, selectors: [["app-external-systems"]], features: [\u0275\u0275ProvidersFeature([ConfirmationService, MessageService])], decls: 173, vars: 169, consts: [["wsdlInput", ""], [1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "page-actions"], ["icon", "pi pi-plus", 3, "onClick", "label"], ["aria-label", "External system health summary", 1, "external-health-strip"], [1, "kpi-healthy"], [1, "kpi-degraded"], [1, "kpi-down"], ["aria-label", "Credential store summary", 1, "credential-store-strip"], [1, "credential-store-strip__head"], ["icon", "pi pi-key", "size", "small", "variant", "outlined", "severity", "secondary", 3, "onClick", "label"], ["styleClass", "external-card"], [1, "external-filter-bar"], ["appendTo", "body", 3, "ngModelChange", "options", "ngModel", "placeholder"], [1, "filter-count"], ["styleClass", "p-datatable-sm external-table", 3, "value"], ["pTemplate", "header"], ["pTemplate", "body"], ["pTemplate", "emptymessage"], ["position", "right", "styleClass", "external-detail-drawer", 3, "visibleChange", "visible"], [3, "visibleChange", "visible", "modal", "draggable", "header"], [1, "external-form-grid"], [1, "field"], ["pInputText", "", "autocomplete", "off", 3, "ngModelChange", "ngModel"], ["appendTo", "body", 3, "ngModelChange", "options", "ngModel"], [1, "field", "field-wide"], ["appendTo", "body", 3, "ngModelChange", "options", "ngModel", "editable"], ["inputStyleClass", "w-full", 3, "ngModelChange", "ngModel", "min", "step", "showButtons"], ["pTextarea", "", "rows", "7", "autocomplete", "off", 1, "external-sample-textarea", 3, "ngModelChange", "ngModel"], ["pTemplate", "footer"], [1, "credential-manager"], [1, "credential-manager__list"], [1, "credential-manager__form"], ["pInputText", "", "type", "password", "autocomplete", "new-password", 3, "ngModelChange", "ngModel", "placeholder"], [1, "credential-writeonly-note"], ["icon", "pi pi-check", 3, "onClick", "label"], ["aria-hidden", "true", 1, "pi", "pi-key"], [3, "severity", "value"], [2, "width", "9rem"], [1, "external-name-cell"], [1, "external-type-pill"], [1, "external-success-cell"], [1, "external-meter"], ["viewBox", "0 0 100 52", "preserveAspectRatio", "none", "aria-hidden", "true", 1, "external-sparkline"], [1, "external-latency"], [1, "external-error"], [1, "text-color-secondary", "text-sm"], [1, "external-actions"], ["icon", "pi pi-play", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "loading", "pTooltip"], ["icon", "pi pi-eye", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-pencil", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-trash", "variant", "text", "severity", "danger", "size", "small", 3, "onClick", "pTooltip"], ["colspan", "8", 1, "empty-cell"], [1, "external-detail-section"], [1, "external-detail-status"], [1, "external-detail-grid"], [1, "external-detail-grid__wide"], [1, "external-detail-metrics"], [1, "external-detail-section__head"], ["icon", "pi pi-arrow-right", "size", "small", 3, "onClick", "label"], [1, "external-json-preview"], [1, "external-mapping-list"], [1, "empty-cell"], ["icon", "pi pi-play", "size", "small", 3, "onClick", "label", "loading"], [1, "external-history-list"], [1, "external-history-row"], [1, "external-drawer-title"], [1, "external-log-detail"], ["pInputText", "", "autocomplete", "off", "placeholder", "*/5 * * * *", 3, "ngModelChange", "ngModel"], ["pInputText", "", "type", "datetime-local", "autocomplete", "off", 3, "ngModelChange", "ngModel"], ["optionLabel", "label", "optionValue", "value", "appendTo", "body", 3, "ngModelChange", "options", "ngModel"], ["pInputText", "", "autocomplete", "off", "placeholder", "https://service.example.com?wsdl", 3, "ngModelChange", "ngModel"], [1, "wsdl-upload-row"], ["type", "file", "accept", ".wsdl,.xml,text/xml,application/xml", 2, "display", "none", 3, "change"], ["icon", "pi pi-upload", "variant", "outlined", "severity", "secondary", 3, "onClick", "label"], [1, "wsdl-file-pill"], [1, "external-json-preview", "wsdl-preview"], ["aria-hidden", "true", 1, "pi", "pi-file"], ["severity", "secondary", "variant", "outlined", 3, "onClick", "label"], ["icon", "pi pi-check", 3, "onClick", "label", "disabled"], [1, "credential-manager__actions"], ["icon", "pi pi-ban", "variant", "text", "severity", "danger", "size", "small", 3, "onClick", "disabled", "pTooltip"]], template: function ExternalSystemsComponent_Template(rf, ctx) {
    if (rf & 1) {
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
      \u0275\u0275listener("onClick", function ExternalSystemsComponent_Template_p_button_onClick_11_listener() {
        return ctx.openAdd();
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(13, "section", 6)(14, "article")(15, "span");
      \u0275\u0275text(16);
      \u0275\u0275pipe(17, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "strong", 7);
      \u0275\u0275text(19);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(20, "article")(21, "span");
      \u0275\u0275text(22);
      \u0275\u0275pipe(23, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "strong", 8);
      \u0275\u0275text(25);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(26, "article")(27, "span");
      \u0275\u0275text(28);
      \u0275\u0275pipe(29, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "strong", 9);
      \u0275\u0275text(31);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(32, "article")(33, "span");
      \u0275\u0275text(34);
      \u0275\u0275pipe(35, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(36, "strong");
      \u0275\u0275text(37);
      \u0275\u0275pipe(38, "number");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(39, "section", 10)(40, "div", 11)(41, "div")(42, "span");
      \u0275\u0275text(43);
      \u0275\u0275pipe(44, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(45, "strong");
      \u0275\u0275text(46);
      \u0275\u0275pipe(47, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(48, "p-button", 12);
      \u0275\u0275pipe(49, "i18n");
      \u0275\u0275listener("onClick", function ExternalSystemsComponent_Template_p_button_onClick_48_listener() {
        return ctx.openCredentialStore();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275repeaterCreate(50, ExternalSystemsComponent_For_51_Template, 9, 8, "article", null, _forTrack0);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "p-card", 13)(53, "div", 14)(54, "p-select", 15);
      \u0275\u0275pipe(55, "i18n");
      \u0275\u0275listener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_54_listener($event) {
        return ctx.partnerFilter.set($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(56, "p-select", 15);
      \u0275\u0275pipe(57, "i18n");
      \u0275\u0275listener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_56_listener($event) {
        return ctx.typeFilter.set($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "p-select", 15);
      \u0275\u0275pipe(59, "i18n");
      \u0275\u0275listener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_58_listener($event) {
        return ctx.environmentFilter.set($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(60, "span", 16);
      \u0275\u0275text(61);
      \u0275\u0275pipe(62, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(63, "p-table", 17);
      \u0275\u0275template(64, ExternalSystemsComponent_ng_template_64_Template, 23, 21, "ng-template", 18)(65, ExternalSystemsComponent_ng_template_65_Template, 45, 32, "ng-template", 19)(66, ExternalSystemsComponent_ng_template_66_Template, 4, 3, "ng-template", 20);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(67, "p-drawer", 21);
      \u0275\u0275twoWayListener("visibleChange", function ExternalSystemsComponent_Template_p_drawer_visibleChange_67_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.detailVisible, $event) || (ctx.detailVisible = $event);
        return $event;
      });
      \u0275\u0275conditionalCreate(68, ExternalSystemsComponent_Conditional_68_Template, 102, 71);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(69, "p-dialog", 22);
      \u0275\u0275pipe(70, "i18n");
      \u0275\u0275pipe(71, "i18n");
      \u0275\u0275twoWayListener("visibleChange", function ExternalSystemsComponent_Template_p_dialog_visibleChange_69_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.dialogVisible, $event) || (ctx.dialogVisible = $event);
        return $event;
      });
      \u0275\u0275elementStart(72, "div", 23)(73, "label", 24)(74, "span");
      \u0275\u0275text(75);
      \u0275\u0275pipe(76, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(77, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_input_ngModelChange_77_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.name, $event) || (ctx.form.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(78, "label", 24)(79, "span");
      \u0275\u0275text(80);
      \u0275\u0275pipe(81, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(82, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_input_ngModelChange_82_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.partner, $event) || (ctx.form.partner = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(83, "label", 24)(84, "span");
      \u0275\u0275text(85);
      \u0275\u0275pipe(86, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(87, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_input_ngModelChange_87_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.eventType, $event) || (ctx.form.eventType = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(88, "label", 24)(89, "span");
      \u0275\u0275text(90);
      \u0275\u0275pipe(91, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(92, "p-select", 26);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_92_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.type, $event) || (ctx.form.type = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(93, "label", 24)(94, "span");
      \u0275\u0275text(95);
      \u0275\u0275pipe(96, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(97, "p-select", 26);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_97_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.environment, $event) || (ctx.form.environment = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(98, "label", 24)(99, "span");
      \u0275\u0275text(100);
      \u0275\u0275pipe(101, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(102, "p-select", 26);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_102_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.method, $event) || (ctx.form.method = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(103, "label", 27)(104, "span");
      \u0275\u0275text(105);
      \u0275\u0275pipe(106, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(107, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_input_ngModelChange_107_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.url, $event) || (ctx.form.url = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(108, "label", 24)(109, "span");
      \u0275\u0275text(110);
      \u0275\u0275pipe(111, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(112, "p-select", 26);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_112_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.authType, $event) || (ctx.form.authType = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(113, "label", 24)(114, "span");
      \u0275\u0275text(115);
      \u0275\u0275pipe(116, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(117, "p-select", 28);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_117_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.credentialName, $event) || (ctx.form.credentialName = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(118, "label", 24)(119, "span");
      \u0275\u0275text(120);
      \u0275\u0275pipe(121, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(122, "p-inputNumber", 29);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_p_inputNumber_ngModelChange_122_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.timeoutMs, $event) || (ctx.form.timeoutMs = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(123, ExternalSystemsComponent_Conditional_123_Template, 20, 19);
      \u0275\u0275conditionalCreate(124, ExternalSystemsComponent_Conditional_124_Template, 16, 12);
      \u0275\u0275elementStart(125, "label", 27)(126, "span");
      \u0275\u0275text(127);
      \u0275\u0275pipe(128, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(129, "textarea", 30);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_textarea_ngModelChange_129_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.sampleJson, $event) || (ctx.form.sampleJson = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(130, ExternalSystemsComponent_ng_template_130_Template, 4, 7, "ng-template", 31);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(131, "p-dialog", 22);
      \u0275\u0275pipe(132, "i18n");
      \u0275\u0275twoWayListener("visibleChange", function ExternalSystemsComponent_Template_p_dialog_visibleChange_131_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.credentialDialogVisible, $event) || (ctx.credentialDialogVisible = $event);
        return $event;
      });
      \u0275\u0275elementStart(133, "section", 32)(134, "div", 33);
      \u0275\u0275repeaterCreate(135, ExternalSystemsComponent_For_136_Template, 13, 16, "article", null, _forTrack0);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(137, "div", 34)(138, "h3");
      \u0275\u0275text(139);
      \u0275\u0275pipe(140, "i18n");
      \u0275\u0275pipe(141, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(142, "label", 24)(143, "span");
      \u0275\u0275text(144);
      \u0275\u0275pipe(145, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(146, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_input_ngModelChange_146_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.credentialForm.name, $event) || (ctx.credentialForm.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(147, "label", 24)(148, "span");
      \u0275\u0275text(149);
      \u0275\u0275pipe(150, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(151, "p-select", 26);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_151_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.credentialForm.type, $event) || (ctx.credentialForm.type = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(152, "label", 24)(153, "span");
      \u0275\u0275text(154);
      \u0275\u0275pipe(155, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(156, "p-select", 26);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_p_select_ngModelChange_156_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.credentialForm.environment, $event) || (ctx.credentialForm.environment = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(157, "label", 24)(158, "span");
      \u0275\u0275text(159);
      \u0275\u0275pipe(160, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(161, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_input_ngModelChange_161_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.credentialForm.owner, $event) || (ctx.credentialForm.owner = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(162, "label", 24)(163, "span");
      \u0275\u0275text(164);
      \u0275\u0275pipe(165, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(166, "input", 35);
      \u0275\u0275pipe(167, "i18n");
      \u0275\u0275twoWayListener("ngModelChange", function ExternalSystemsComponent_Template_input_ngModelChange_166_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.credentialForm.secretValue, $event) || (ctx.credentialForm.secretValue = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(168, "p", 36);
      \u0275\u0275text(169);
      \u0275\u0275pipe(170, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(171, "p-button", 37);
      \u0275\u0275pipe(172, "i18n");
      \u0275\u0275listener("onClick", function ExternalSystemsComponent_Template_p_button_onClick_171_listener() {
        return ctx.saveCredentialRecord();
      });
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      let tmp_27_0;
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 89, "externalSystems.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 91, "externalSystems.subtitle"));
      \u0275\u0275advance(3);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(12, 93, "externalSystems.newConnection"));
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(17, 95, "externalSystems.kpi.healthy"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.totals().healthy);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(23, 97, "externalSystems.kpi.degraded"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.totals().degraded);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(29, 99, "externalSystems.kpi.down"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.totals().down);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(35, 101, "externalSystems.kpi.calls"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(38, 103, ctx.totals().calls));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(44, 105, "externalSystems.credentialStore.eyebrow"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(47, 107, "externalSystems.credentialStore.title"));
      \u0275\u0275advance(2);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(49, 109, "externalSystems.credentialStore.manage"));
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.credentials());
      \u0275\u0275advance(4);
      \u0275\u0275property("options", ctx.partnerOptions())("ngModel", ctx.partnerFilter())("placeholder", \u0275\u0275pipeBind1(55, 111, "externalSystems.filter.partner"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.typeOptions)("ngModel", ctx.typeFilter())("placeholder", \u0275\u0275pipeBind1(57, 113, "externalSystems.filter.type"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.environmentOptions)("ngModel", ctx.environmentFilter())("placeholder", \u0275\u0275pipeBind1(59, 115, "externalSystems.filter.environment"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate2("", ctx.filteredConnections().length, " ", \u0275\u0275pipeBind1(62, 117, "externalSystems.results"));
      \u0275\u0275advance(2);
      \u0275\u0275property("value", ctx.filteredConnections());
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("visible", ctx.detailVisible);
      \u0275\u0275advance();
      \u0275\u0275conditional((tmp_27_0 = ctx.selectedConnection()) ? 68 : -1, tmp_27_0);
      \u0275\u0275advance();
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(167, _c0));
      \u0275\u0275twoWayProperty("visible", ctx.dialogVisible);
      \u0275\u0275property("modal", true)("draggable", false)("header", ctx.isEdit ? \u0275\u0275pipeBind1(70, 119, "externalSystems.dialog.editTitle") : \u0275\u0275pipeBind1(71, 121, "externalSystems.dialog.addTitle"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(76, 123, "externalSystems.form.name"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.name);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(81, 125, "externalSystems.form.partner"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.partner);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(86, 127, "externalSystems.form.eventType"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.eventType);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(91, 129, "externalSystems.form.type"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.formTypeOptions);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.type);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(96, 131, "externalSystems.form.environment"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.environmentOptions.slice(1));
      \u0275\u0275twoWayProperty("ngModel", ctx.form.environment);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(101, 133, "externalSystems.form.method"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.methodOptions);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.method);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(106, 135, "externalSystems.form.url"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.url);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(111, 137, "externalSystems.form.authType"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.authOptions);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.authType);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(116, 139, "externalSystems.form.credentialName"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.credentialNameOptions());
      \u0275\u0275twoWayProperty("ngModel", ctx.form.credentialName);
      \u0275\u0275property("editable", true);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(121, 141, "externalSystems.form.timeoutMs"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.timeoutMs);
      \u0275\u0275property("min", 500)("step", 500)("showButtons", true);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.form.pollSchedule ? 123 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.form.type === "SOAP" ? 124 : -1);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(128, 143, "externalSystems.form.sampleJson"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.sampleJson);
      \u0275\u0275advance(2);
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(168, _c1));
      \u0275\u0275twoWayProperty("visible", ctx.credentialDialogVisible);
      \u0275\u0275property("modal", true)("draggable", false)("header", \u0275\u0275pipeBind1(132, 145, "externalSystems.credentialStore.manageTitle"));
      \u0275\u0275advance(4);
      \u0275\u0275repeater(ctx.credentials());
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", ctx.credentialIsEdit ? \u0275\u0275pipeBind1(140, 147, "externalSystems.credentialStore.editTitle") : \u0275\u0275pipeBind1(141, 149, "externalSystems.credentialStore.addTitle"), " ");
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(145, 151, "externalSystems.credentialStore.name"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.credentialForm.name);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(150, 153, "externalSystems.credentialStore.type"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.credentialTypeOptions);
      \u0275\u0275twoWayProperty("ngModel", ctx.credentialForm.type);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(155, 155, "externalSystems.form.environment"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.environmentOptions.slice(1));
      \u0275\u0275twoWayProperty("ngModel", ctx.credentialForm.environment);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(160, 157, "externalSystems.credentialStore.owner"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.credentialForm.owner);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(165, 159, "externalSystems.credentialStore.secretValue"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.credentialForm.secretValue);
      \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(167, 161, "externalSystems.credentialStore.secretPlaceholder"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(170, 163, "externalSystems.credentialStore.writeOnly"));
      \u0275\u0275advance(2);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(172, 165, "externalSystems.credentialStore.save"));
    }
  }, dependencies: [
    FormsModule,
    DefaultValueAccessor,
    NgControlStatus,
    NgModel,
    ButtonModule,
    Button,
    PrimeTemplate,
    CardModule,
    Card,
    ConfirmDialogModule,
    ConfirmDialog,
    DialogModule,
    Dialog,
    DrawerModule,
    Drawer,
    InputNumberModule,
    InputNumber,
    InputTextModule,
    InputText,
    SelectModule,
    Select,
    TableModule,
    Table,
    TagModule,
    Tag,
    TextareaModule,
    Textarea,
    ToastModule,
    Toast,
    TooltipModule,
    Tooltip,
    DecimalPipe,
    I18nPipe
  ], styles: ['\n.external-health-strip[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  gap: 0.75rem;\n  margin-bottom: 1.5rem;\n}\n.external-health-strip[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  padding: 1.25rem;\n  border-radius: 12px;\n  border: 1px solid var(--surface-border);\n  background: var(--surface-card);\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);\n}\n.external-health-strip[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: block;\n  color: var(--text-color-secondary);\n  font-size: 0.6875rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.external-health-strip[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 0.5rem;\n  color: var(--text-color);\n  font-size: 1.75rem;\n  font-weight: 800;\n  line-height: 1;\n}\n.external-filter-bar[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.5rem;\n  margin-bottom: 1.25rem;\n}\n.credential-store-strip[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(13rem, 0.9fr) repeat(4, minmax(0, 1fr));\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n  padding: 0.8rem;\n  border-radius: 8px;\n  border: 1px solid color-mix(in srgb, var(--surface-border) 74%, transparent);\n  background: color-mix(in srgb, var(--surface-card) 88%, var(--primary-color));\n}\n.credential-store-strip__head[_ngcontent-%COMP%], \n.credential-store-strip[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.7rem;\n  min-width: 0;\n}\n.credential-store-strip__head[_ngcontent-%COMP%] {\n  display: grid;\n  align-content: center;\n  gap: 0.15rem;\n  padding: 0.25rem 0.35rem;\n}\n.credential-store-strip__head[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.credential-store-strip[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.74rem;\n}\n.credential-store-strip__head[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n.credential-store-strip[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text-color);\n}\n.credential-store-strip[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  padding: 0.7rem;\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--surface-ground) 54%, var(--surface-card));\n}\n.credential-store-strip[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  display: inline-grid;\n  place-items: center;\n  flex: 0 0 2.1rem;\n  width: 2.1rem;\n  height: 2.1rem;\n  border-radius: 8px;\n  color: color-mix(in srgb, var(--primary-color) 86%, var(--text-color));\n  background: color-mix(in srgb, var(--primary-color) 12%, transparent);\n}\n.credential-store-strip[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  display: grid;\n  min-width: 0;\n  gap: 0.1rem;\n}\n.credential-store-strip[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n.credential-store-strip[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n[_nghost-%COMP%]     .external-filter-bar .p-select {\n  min-width: 11rem;\n}\n.external-name-cell[_ngcontent-%COMP%], \n.external-latency[_ngcontent-%COMP%], \n.external-success-cell[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.15rem;\n}\n.external-name-cell[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 0.8125rem;\n  color: var(--text-color);\n}\n.external-name-cell[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.external-latency[_ngcontent-%COMP%]   small[_ngcontent-%COMP%], \ntd[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n}\n.external-name-cell[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  max-width: 22rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: var(--text-color-secondary);\n  font-size: 0.6875rem;\n}\n.external-type-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  min-height: 1.5rem;\n  border-radius: 4px;\n  padding: 0.15rem 0.5rem;\n  font-size: 0.6875rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.03em;\n  color: var(--text-color-secondary);\n  background: var(--surface-100);\n}\n.external-meter[_ngcontent-%COMP%] {\n  width: 7rem;\n  height: 0.42rem;\n  overflow: hidden;\n  border-radius: 999px;\n  background: color-mix(in srgb, var(--surface-border) 72%, transparent);\n}\n.external-meter[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: block;\n  height: 100%;\n  border-radius: inherit;\n  background:\n    linear-gradient(\n      90deg,\n      #22c55e,\n      #14b8a6);\n}\n.external-sparkline[_ngcontent-%COMP%] {\n  width: 7rem;\n  height: 2.1rem;\n}\n.external-sparkline[_ngcontent-%COMP%]   polyline[_ngcontent-%COMP%] {\n  fill: none;\n  stroke: color-mix(in srgb, var(--primary-color) 84%, #14b8a6);\n  stroke-linecap: round;\n  stroke-linejoin: round;\n  stroke-width: 4;\n}\n.external-error[_ngcontent-%COMP%] {\n  max-width: 18rem;\n  color: var(--text-color);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.external-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.125rem;\n  opacity: 0.4;\n  transition: opacity 0.2s ease;\n}\ntr[_ngcontent-%COMP%]:hover   .external-actions[_ngcontent-%COMP%] {\n  opacity: 1;\n}\n.external-form-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1rem;\n}\n[_nghost-%COMP%]     .external-detail-drawer {\n  width: min(34rem, 100vw);\n}\n.external-drawer-title[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.15rem;\n}\n.external-drawer-title[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.external-detail-grid[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%], \n.external-detail-metrics[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.74rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.external-drawer-title[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text-color);\n  font-size: 1.08rem;\n}\n.external-detail-section[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.9rem;\n  padding: 1rem 0;\n  border-bottom: 1px solid color-mix(in srgb, var(--surface-border) 78%, transparent);\n}\n.external-detail-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-color);\n  font-size: 1rem;\n}\n.external-detail-section__head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n}\n.external-detail-status[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.55rem;\n  padding: 0.85rem;\n  border-radius: 8px;\n  border: 1px solid color-mix(in srgb, var(--surface-border) 76%, transparent);\n  background: color-mix(in srgb, var(--surface-ground) 48%, var(--surface-card));\n}\n.external-detail-status[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  line-height: 1.45;\n}\n.external-detail-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 0.8rem;\n  margin: 0;\n}\n.external-detail-grid[_ngcontent-%COMP%]   div[_ngcontent-%COMP%], \n.external-detail-metrics[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  min-width: 0;\n  padding: 0.8rem;\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--surface-ground) 52%, var(--surface-card));\n}\n.external-detail-grid__wide[_ngcontent-%COMP%] {\n  grid-column: 1/-1;\n}\n.external-detail-grid[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] {\n  margin: 0.25rem 0 0;\n  color: var(--text-color);\n  overflow-wrap: anywhere;\n}\n.external-detail-metrics[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 0.7rem;\n}\n.external-detail-metrics[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 0.25rem;\n  color: var(--text-color);\n  font-size: 1.25rem;\n}\n.external-json-preview[_ngcontent-%COMP%], \n.external-log-detail[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%], \n.external-sample-textarea[_ngcontent-%COMP%] {\n  width: 100%;\n  border-radius: 8px;\n  border: 1px solid color-mix(in srgb, var(--surface-border) 78%, transparent);\n  background: color-mix(in srgb, var(--surface-ground) 68%, #020617);\n  color: var(--text-color);\n  font-family:\n    "JetBrains Mono",\n    "SFMono-Regular",\n    Consolas,\n    monospace;\n  font-size: 0.8rem;\n  line-height: 1.55;\n}\n.external-json-preview[_ngcontent-%COMP%], \n.external-log-detail[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%] {\n  max-height: 18rem;\n  margin: 0;\n  overflow: auto;\n  padding: 0.85rem;\n  white-space: pre-wrap;\n}\n.external-mapping-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.55rem;\n}\n.external-mapping-list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--surface-ground) 52%, var(--surface-card));\n}\n.external-mapping-list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  display: grid;\n  min-width: 0;\n  gap: 0.1rem;\n}\n.external-mapping-list[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text-color);\n}\n.external-mapping-list[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.78rem;\n}\n.external-history-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.6rem;\n}\n.external-history-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: auto minmax(0, 1fr);\n  align-items: flex-start;\n  gap: 0.7rem;\n  padding: 0.75rem;\n  border-radius: 8px;\n  border: 1px solid color-mix(in srgb, var(--surface-border) 78%, transparent);\n  background: var(--surface-card);\n}\n.external-log-detail[_ngcontent-%COMP%] {\n  grid-column: 1/-1;\n  min-width: 0;\n}\n.external-log-detail[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] {\n  cursor: pointer;\n  color: color-mix(in srgb, var(--primary-color) 82%, var(--text-color));\n  font-weight: 800;\n}\n.external-log-detail[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin: 0.75rem 0 0.25rem;\n  color: var(--text-color-secondary);\n  font-size: 0.72rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.external-history-row[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  display: grid;\n  min-width: 0;\n  gap: 0.15rem;\n}\n.external-history-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text-color);\n  font-size: 0.88rem;\n}\n.external-history-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.78rem;\n}\n.field[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.45rem;\n}\n.field[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color);\n  font-size: 0.85rem;\n  font-weight: 700;\n}\n.field-wide[_ngcontent-%COMP%] {\n  grid-column: 1/-1;\n}\n.external-sample-textarea[_ngcontent-%COMP%] {\n  min-height: 11rem;\n  padding: 0.8rem;\n}\n.credential-manager[_ngcontent-%COMP%], \n.credential-manager__form[_ngcontent-%COMP%], \n.credential-manager__list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.85rem;\n}\n.credential-manager[_ngcontent-%COMP%] {\n  grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);\n}\n.credential-manager__list[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto auto;\n  align-items: center;\n  gap: 0.65rem;\n  padding: 0.75rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n}\n.credential-writeonly-note[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.78rem;\n}\n[_nghost-%COMP%]     .external-sample-textarea {\n  resize: vertical;\n}\n@media (max-width: 900px) {\n  .external-health-strip[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .credential-store-strip[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .credential-store-strip__head[_ngcontent-%COMP%] {\n    grid-column: 1/-1;\n  }\n}\n@media (max-width: 560px) {\n  .external-health-strip[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .credential-store-strip[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .external-form-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .credential-manager[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=external-systems.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ExternalSystemsComponent, [{
    type: Component,
    args: [{ selector: "app-external-systems", standalone: true, imports: [
      FormsModule,
      DecimalPipe,
      ButtonModule,
      CardModule,
      ConfirmDialogModule,
      DialogModule,
      DrawerModule,
      InputNumberModule,
      InputTextModule,
      SelectModule,
      TableModule,
      TagModule,
      TextareaModule,
      ToastModule,
      TooltipModule,
      I18nPipe
    ], providers: [ConfirmationService, MessageService], template: `<p-toast />
<p-confirmDialog />

<div class="page-header">
  <div>
    <h1 class="page-title">{{ 'externalSystems.title' | i18n }}</h1>
    <p class="page-subtitle">{{ 'externalSystems.subtitle' | i18n }}</p>
  </div>
  <div class="page-actions">
    <p-button [label]="'externalSystems.newConnection' | i18n" icon="pi pi-plus" (onClick)="openAdd()" />
  </div>
</div>

<!-- \u2500\u2500 KPI strip \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<section class="external-health-strip" aria-label="External system health summary">
  <article>
    <span>{{ 'externalSystems.kpi.healthy' | i18n }}</span>
    <strong class="kpi-healthy">{{ totals().healthy }}</strong>
  </article>
  <article>
    <span>{{ 'externalSystems.kpi.degraded' | i18n }}</span>
    <strong class="kpi-degraded">{{ totals().degraded }}</strong>
  </article>
  <article>
    <span>{{ 'externalSystems.kpi.down' | i18n }}</span>
    <strong class="kpi-down">{{ totals().down }}</strong>
  </article>
  <article>
    <span>{{ 'externalSystems.kpi.calls' | i18n }}</span>
    <strong>{{ totals().calls | number }}</strong>
  </article>
</section>

<!-- \u2500\u2500 Credential store summary \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<section class="credential-store-strip" aria-label="Credential store summary">
  <div class="credential-store-strip__head">
    <div>
      <span>{{ 'externalSystems.credentialStore.eyebrow' | i18n }}</span>
      <strong>{{ 'externalSystems.credentialStore.title' | i18n }}</strong>
    </div>
    <p-button
      [label]="'externalSystems.credentialStore.manage' | i18n"
      icon="pi pi-key"
      size="small"
      variant="outlined"
      severity="secondary"
      (onClick)="openCredentialStore()" />
  </div>
  @for (credential of credentials(); track credential.id) {
    <article>
      <i class="pi pi-key" aria-hidden="true"></i>
      <div>
        <strong>{{ credential.name }}</strong>
        <span>{{ credential.type }} \xB7 {{ credential.environment }} \xB7 {{ credential.lastUsed }}</span>
      </div>
      <p-tag
        [severity]="credentialSeverity(credential.status)"
        [value]="('externalSystems.credentialStore.status.' + credential.status) | i18n" />
    </article>
  }
</section>

<p-card styleClass="external-card">
  <!-- \u2500\u2500 Filter bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
  <div class="external-filter-bar">
    <p-select
      [options]="partnerOptions()"
      [ngModel]="partnerFilter()"
      (ngModelChange)="partnerFilter.set($event)"
      appendTo="body"
      [placeholder]="'externalSystems.filter.partner' | i18n" />
    <p-select
      [options]="typeOptions"
      [ngModel]="typeFilter()"
      (ngModelChange)="typeFilter.set($event)"
      appendTo="body"
      [placeholder]="'externalSystems.filter.type' | i18n" />
    <p-select
      [options]="environmentOptions"
      [ngModel]="environmentFilter()"
      (ngModelChange)="environmentFilter.set($event)"
      appendTo="body"
      [placeholder]="'externalSystems.filter.environment' | i18n" />
    <span class="filter-count">{{ filteredConnections().length }} {{ 'externalSystems.results' | i18n }}</span>
  </div>

  <!-- \u2500\u2500 Table \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
  <p-table [value]="filteredConnections()" styleClass="p-datatable-sm external-table">
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'externalSystems.col.connection' | i18n }}</th>
        <th>{{ 'externalSystems.col.type' | i18n }}</th>
        <th>{{ 'externalSystems.col.status' | i18n }}</th>
        <th>{{ 'externalSystems.col.success' | i18n }}</th>
        <th>{{ 'externalSystems.col.latency' | i18n }}</th>
        <th>{{ 'externalSystems.col.lastError' | i18n }}</th>
        <th>{{ 'externalSystems.col.lastSuccess' | i18n }}</th>
        <th style="width: 9rem"></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-row>
      <tr>
        <td>
          <div class="external-name-cell">
            <strong>{{ row.name }}</strong>
            <span>{{ row.partner }} \xB7 {{ row.eventType }}</span>
            <small>{{ row.method }} {{ row.url }}</small>
          </div>
        </td>
        <td>
          <span class="external-type-pill">{{ row.type }}</span>
          <small>{{ row.environment }}</small>
        </td>
        <td>
          <p-tag [severity]="statusSeverity(row.status)" [value]="('externalSystems.status.' + row.status) | i18n" />
        </td>
        <td>
          <div class="external-success-cell">
            <strong>{{ row.successRate ?? 0 }}%</strong>
            <span class="external-meter"><span [style.width.%]="successWidth(row)"></span></span>
            <svg class="external-sparkline" viewBox="0 0 100 52" preserveAspectRatio="none" aria-hidden="true">
              <polyline [attr.points]="sparklinePoints(row)" />
            </svg>
          </div>
        </td>
        <td>
          <div class="external-latency">
            <strong>{{ row.avgMs ?? 0 }}ms</strong>
            <small>p95 {{ row.p95Ms ?? 0 }}ms</small>
          </div>
        </td>
        <td class="external-error">{{ row.lastError }}</td>
        <td class="text-color-secondary text-sm">{{ row.lastSuccess }}</td>
        <td>
          <div class="external-actions">
            <p-button
              icon="pi pi-play"
              variant="text"
              severity="secondary"
              size="small"
              [loading]="testingId() === row.id"
              (onClick)="test(row)"
              [pTooltip]="'externalSystems.action.test' | i18n" />
            <p-button
              icon="pi pi-eye"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="openDetail(row)"
              [pTooltip]="'externalSystems.action.view' | i18n" />
            <p-button
              icon="pi pi-pencil"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="openEdit(row)"
              [pTooltip]="'externalSystems.action.edit' | i18n" />
            <p-button
              icon="pi pi-trash"
              variant="text"
              severity="danger"
              size="small"
              (onClick)="confirmDelete(row, $event)"
              [pTooltip]="'externalSystems.delete' | i18n" />
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="8" class="empty-cell">{{ 'externalSystems.empty' | i18n }}</td>
      </tr>
    </ng-template>
  </p-table>
</p-card>

<!-- \u2500\u2500 Connection detail drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<p-drawer
  [(visible)]="detailVisible"
  position="right"
  styleClass="external-detail-drawer">
  @if (selectedConnection(); as selected) {
    <ng-template pTemplate="header">
      <div class="external-drawer-title">
        <span>{{ 'externalSystems.detail.eyebrow' | i18n }}</span>
        <strong>{{ selected.name }}</strong>
      </div>
    </ng-template>

    <section class="external-detail-section">
      <div class="external-detail-status">
        <p-tag
          [severity]="statusSeverity(selected.status)"
          [value]="('externalSystems.status.' + selected.status) | i18n" />
        <span>{{ healthExplanation(selected) }}</span>
      </div>
      <dl class="external-detail-grid">
        <div>
          <dt>{{ 'externalSystems.col.connection' | i18n }}</dt>
          <dd>{{ selected.partner }} \xB7 {{ selected.eventType }}</dd>
        </div>
        <div>
          <dt>{{ 'externalSystems.col.type' | i18n }}</dt>
          <dd>{{ selected.type }} \xB7 {{ selected.environment }}</dd>
        </div>
        <div>
          <dt>{{ 'externalSystems.form.method' | i18n }}</dt>
          <dd>{{ selected.method }}</dd>
        </div>
        <div>
          <dt>{{ 'externalSystems.form.authType' | i18n }}</dt>
          <dd>{{ selected.authType }}</dd>
        </div>
        <div>
          <dt>{{ 'externalSystems.form.credentialName' | i18n }}</dt>
          <dd>{{ selected.credentialName || '\u2014' }}</dd>
        </div>
        <div>
          <dt>{{ 'externalSystems.detail.typeConfig' | i18n }}</dt>
          <dd>{{ typeConfigHint(selected) }}</dd>
        </div>
        <div class="external-detail-grid__wide">
          <dt>{{ 'externalSystems.form.url' | i18n }}</dt>
          <dd>{{ selected.url }}</dd>
        </div>
      </dl>
    </section>

    <section class="external-detail-section">
      <h3>{{ 'externalSystems.detail.metrics' | i18n }}</h3>
      <div class="external-detail-metrics">
        <article>
          <span>{{ 'externalSystems.col.success' | i18n }}</span>
          <strong>{{ selected.successRate ?? 0 }}%</strong>
        </article>
        <article>
          <span>{{ 'externalSystems.col.latency' | i18n }}</span>
          <strong>{{ selected.avgMs ?? 0 }}ms</strong>
        </article>
        <article>
          <span>{{ 'externalSystems.colLast24h' | i18n }}</span>
          <strong>{{ selected.calls24h | number }}</strong>
        </article>
      </div>
    </section>

    <section class="external-detail-section">
      <div class="external-detail-section__head">
        <h3>{{ 'externalSystems.detail.sample' | i18n }}</h3>
        <p-button
          [label]="'externalSystems.action.useInStudio' | i18n"
          icon="pi pi-arrow-right"
          size="small"
          (onClick)="useSampleInStudio(selected)" />
      </div>
      <pre class="external-json-preview">{{ selected.sampleJson }}</pre>
    </section>

    <section class="external-detail-section">
      <h3>{{ 'externalSystems.detail.mappings' | i18n }}</h3>
      <div class="external-mapping-list">
        @for (mapping of selected.mappings; track mapping.name + mapping.version) {
          <article>
            <div>
              <strong>{{ mapping.name }}</strong>
              <span>{{ mapping.version }}</span>
            </div>
            <p-tag [severity]="mappingSeverity(mapping.status)" [value]="('status.' + mapping.status) | i18n" />
          </article>
        } @empty {
          <p class="empty-cell">{{ 'externalSystems.detail.noMappings' | i18n }}</p>
        }
      </div>
    </section>

    <section class="external-detail-section">
      <div class="external-detail-section__head">
        <h3>{{ 'externalSystems.detail.history' | i18n }}</h3>
        <p-button
          [label]="'externalSystems.action.test' | i18n"
          icon="pi pi-play"
          size="small"
          [loading]="testingId() === selected.id"
          (onClick)="test(selected)" />
      </div>

      <div class="external-history-list">
        @for (call of selectedHistory(); track call.id) {
          <article class="external-history-row">
            <p-tag [severity]="callSeverity(call.result)" [value]="call.status ? 'HTTP ' + call.status : 'LOCAL'" />
            <div>
              <strong>{{ call.message }}</strong>
              <span>{{ call.at }} \xB7 {{ call.durationMs }}ms \xB7 {{ call.requestId }}</span>
            </div>
            <details class="external-log-detail">
              <summary>{{ 'externalSystems.detail.logDetail' | i18n }}</summary>
              <label>{{ 'externalSystems.detail.headers' | i18n }}</label>
              <pre>{{ call.headers }}</pre>
              <label>{{ 'externalSystems.detail.request' | i18n }}</label>
              <pre>{{ call.requestBody }}</pre>
              <label>{{ 'externalSystems.detail.response' | i18n }}</label>
              <pre>{{ call.responseBody }}</pre>
            </details>
          </article>
        } @empty {
          <p class="empty-cell">{{ 'externalSystems.detail.noHistory' | i18n }}</p>
        }
      </div>
    </section>
  }
</p-drawer>

<!-- \u2500\u2500 Add / Edit dialog \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<p-dialog
  [(visible)]="dialogVisible"
  [modal]="true"
  [draggable]="false"
  [style]="{ width: 'min(46rem, calc(100vw - 2rem))' }"
  [header]="isEdit ? ('externalSystems.dialog.editTitle' | i18n) : ('externalSystems.dialog.addTitle' | i18n)">
  <div class="external-form-grid">
    <label class="field">
      <span>{{ 'externalSystems.form.name' | i18n }}</span>
      <input pInputText [(ngModel)]="form.name" autocomplete="off" />
    </label>
    <label class="field">
      <span>{{ 'externalSystems.form.partner' | i18n }}</span>
      <input pInputText [(ngModel)]="form.partner" autocomplete="off" />
    </label>
    <label class="field">
      <span>{{ 'externalSystems.form.eventType' | i18n }}</span>
      <input pInputText [(ngModel)]="form.eventType" autocomplete="off" />
    </label>
    <label class="field">
      <span>{{ 'externalSystems.form.type' | i18n }}</span>
      <p-select [options]="formTypeOptions" [(ngModel)]="form.type" appendTo="body" />
    </label>
    <label class="field">
      <span>{{ 'externalSystems.form.environment' | i18n }}</span>
      <p-select [options]="environmentOptions.slice(1)" [(ngModel)]="form.environment" appendTo="body" />
    </label>
    <label class="field">
      <span>{{ 'externalSystems.form.method' | i18n }}</span>
      <p-select [options]="methodOptions" [(ngModel)]="form.method" appendTo="body" />
    </label>
    <label class="field field-wide">
      <span>{{ 'externalSystems.form.url' | i18n }}</span>
      <input pInputText [(ngModel)]="form.url" autocomplete="off" />
    </label>
    <label class="field">
      <span>{{ 'externalSystems.form.authType' | i18n }}</span>
      <p-select [options]="authOptions" [(ngModel)]="form.authType" appendTo="body" />
    </label>
    <label class="field">
      <span>{{ 'externalSystems.form.credentialName' | i18n }}</span>
      <p-select
        [options]="credentialNameOptions()"
        [(ngModel)]="form.credentialName"
        [editable]="true"
        appendTo="body" />
    </label>
    <label class="field">
      <span>{{ 'externalSystems.form.timeoutMs' | i18n }}</span>
      <p-inputNumber [(ngModel)]="form.timeoutMs" [min]="500" [step]="500" [showButtons]="true" inputStyleClass="w-full" />
    </label>
    @if (form.pollSchedule) {
      <label class="field">
        <span>{{ 'externalSystems.form.pollSchedule' | i18n }}</span>
        <input pInputText [(ngModel)]="form.pollSchedule" autocomplete="off" placeholder="*/5 * * * *" />
      </label>
      <label class="field">
        <span>{{ 'externalSystems.form.pollInterval' | i18n }}</span>
        <p-select [options]="pollIntervalOptions" [(ngModel)]="form.pollInterval" [editable]="true" appendTo="body" />
      </label>
      <label class="field">
        <span>{{ 'externalSystems.form.firstRunAt' | i18n }}</span>
        <input pInputText type="datetime-local" [(ngModel)]="form.firstRunAt" autocomplete="off" />
      </label>
      <label class="field">
        <span>{{ 'externalSystems.form.checkpointMode' | i18n }}</span>
        <p-select
          [options]="checkpointModeOptions"
          optionLabel="label"
          optionValue="value"
          [(ngModel)]="form.checkpointMode"
          appendTo="body" />
      </label>
    }
    @if (form.type === 'SOAP') {
      <label class="field field-wide">
        <span>{{ 'externalSystems.form.wsdlUrl' | i18n }}</span>
        <input pInputText [(ngModel)]="form.wsdlUrl" autocomplete="off" placeholder="https://service.example.com?wsdl" />
      </label>
      <div class="field field-wide">
        <span>{{ 'externalSystems.form.wsdlFile' | i18n }}</span>
        <div class="wsdl-upload-row">
          <input
            #wsdlInput
            type="file"
            accept=".wsdl,.xml,text/xml,application/xml"
            style="display: none"
            (change)="onWsdlFileSelected($event)" />
          <p-button
            [label]="'externalSystems.form.wsdlUpload' | i18n"
            icon="pi pi-upload"
            variant="outlined"
            severity="secondary"
            (onClick)="wsdlInput.click()" />
          @if (form.wsdlFileName) {
            <span class="wsdl-file-pill">
              <i class="pi pi-file" aria-hidden="true"></i>
              {{ form.wsdlFileName }}
            </span>
          }
        </div>
        @if (form.wsdlPreview) {
          <pre class="external-json-preview wsdl-preview">{{ form.wsdlPreview }}</pre>
        }
      </div>
    }
    <label class="field field-wide">
      <span>{{ 'externalSystems.form.sampleJson' | i18n }}</span>
      <textarea
        pTextarea
        [(ngModel)]="form.sampleJson"
        rows="7"
        class="external-sample-textarea"
        autocomplete="off"></textarea>
    </label>
  </div>

  <ng-template pTemplate="footer">
    <p-button [label]="'externalSystems.cancel' | i18n" severity="secondary" variant="outlined" (onClick)="dialogVisible = false" />
    <p-button [label]="'externalSystems.save' | i18n" icon="pi pi-check" [disabled]="!formValid" (onClick)="save()" />
  </ng-template>
</p-dialog>

<!-- \u2500\u2500 Credential Store manager \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<p-dialog
  [(visible)]="credentialDialogVisible"
  [modal]="true"
  [draggable]="false"
  [style]="{ width: 'min(54rem, calc(100vw - 2rem))' }"
  [header]="'externalSystems.credentialStore.manageTitle' | i18n">
  <section class="credential-manager">
    <div class="credential-manager__list">
      @for (credential of credentials(); track credential.id) {
        <article>
          <div>
            <strong>{{ credential.name }}</strong>
            <span>{{ credential.type }} \xB7 {{ credential.environment }} \xB7 {{ credential.owner }} \xB7 {{ credential.lastUsed }}</span>
          </div>
          <p-tag
            [severity]="credentialSeverity(credential.status)"
            [value]="('externalSystems.credentialStore.status.' + credential.status) | i18n" />
          <div class="credential-manager__actions">
            <p-button
              icon="pi pi-pencil"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="openCredentialEdit(credential)"
              [pTooltip]="'externalSystems.action.edit' | i18n" />
            <p-button
              icon="pi pi-ban"
              variant="text"
              severity="danger"
              size="small"
              [disabled]="credential.status === 'disabled'"
              (onClick)="disableCredential(credential)"
              [pTooltip]="'externalSystems.credentialStore.disable' | i18n" />
          </div>
        </article>
      }
    </div>

    <div class="credential-manager__form">
      <h3>
        {{ credentialIsEdit ? ('externalSystems.credentialStore.editTitle' | i18n) : ('externalSystems.credentialStore.addTitle' | i18n) }}
      </h3>
      <label class="field">
        <span>{{ 'externalSystems.credentialStore.name' | i18n }}</span>
        <input pInputText [(ngModel)]="credentialForm.name" autocomplete="off" />
      </label>
      <label class="field">
        <span>{{ 'externalSystems.credentialStore.type' | i18n }}</span>
        <p-select [options]="credentialTypeOptions" [(ngModel)]="credentialForm.type" appendTo="body" />
      </label>
      <label class="field">
        <span>{{ 'externalSystems.form.environment' | i18n }}</span>
        <p-select [options]="environmentOptions.slice(1)" [(ngModel)]="credentialForm.environment" appendTo="body" />
      </label>
      <label class="field">
        <span>{{ 'externalSystems.credentialStore.owner' | i18n }}</span>
        <input pInputText [(ngModel)]="credentialForm.owner" autocomplete="off" />
      </label>
      <label class="field">
        <span>{{ 'externalSystems.credentialStore.secretValue' | i18n }}</span>
        <input
          pInputText
          type="password"
          [(ngModel)]="credentialForm.secretValue"
          autocomplete="new-password"
          [placeholder]="'externalSystems.credentialStore.secretPlaceholder' | i18n" />
      </label>
      <p class="credential-writeonly-note">{{ 'externalSystems.credentialStore.writeOnly' | i18n }}</p>
      <p-button
        [label]="'externalSystems.credentialStore.save' | i18n"
        icon="pi pi-check"
        (onClick)="saveCredentialRecord()" />
    </div>
  </section>
</p-dialog>
`, styles: ['/* src/app/pages/external-systems/external-systems.component.scss */\n.external-health-strip {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  gap: 0.75rem;\n  margin-bottom: 1.5rem;\n}\n.external-health-strip article {\n  padding: 1.25rem;\n  border-radius: 12px;\n  border: 1px solid var(--surface-border);\n  background: var(--surface-card);\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);\n}\n.external-health-strip span {\n  display: block;\n  color: var(--text-color-secondary);\n  font-size: 0.6875rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.external-health-strip strong {\n  display: block;\n  margin-top: 0.5rem;\n  color: var(--text-color);\n  font-size: 1.75rem;\n  font-weight: 800;\n  line-height: 1;\n}\n.external-filter-bar {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.5rem;\n  margin-bottom: 1.25rem;\n}\n.credential-store-strip {\n  display: grid;\n  grid-template-columns: minmax(13rem, 0.9fr) repeat(4, minmax(0, 1fr));\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n  padding: 0.8rem;\n  border-radius: 8px;\n  border: 1px solid color-mix(in srgb, var(--surface-border) 74%, transparent);\n  background: color-mix(in srgb, var(--surface-card) 88%, var(--primary-color));\n}\n.credential-store-strip__head,\n.credential-store-strip article {\n  display: flex;\n  align-items: center;\n  gap: 0.7rem;\n  min-width: 0;\n}\n.credential-store-strip__head {\n  display: grid;\n  align-content: center;\n  gap: 0.15rem;\n  padding: 0.25rem 0.35rem;\n}\n.credential-store-strip__head span,\n.credential-store-strip article span {\n  color: var(--text-color-secondary);\n  font-size: 0.74rem;\n}\n.credential-store-strip__head strong,\n.credential-store-strip article strong {\n  color: var(--text-color);\n}\n.credential-store-strip article {\n  padding: 0.7rem;\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--surface-ground) 54%, var(--surface-card));\n}\n.credential-store-strip i {\n  display: inline-grid;\n  place-items: center;\n  flex: 0 0 2.1rem;\n  width: 2.1rem;\n  height: 2.1rem;\n  border-radius: 8px;\n  color: color-mix(in srgb, var(--primary-color) 86%, var(--text-color));\n  background: color-mix(in srgb, var(--primary-color) 12%, transparent);\n}\n.credential-store-strip article div {\n  display: grid;\n  min-width: 0;\n  gap: 0.1rem;\n}\n.credential-store-strip article strong,\n.credential-store-strip article span {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n:host ::ng-deep .external-filter-bar .p-select {\n  min-width: 11rem;\n}\n.external-name-cell,\n.external-latency,\n.external-success-cell {\n  display: grid;\n  gap: 0.15rem;\n}\n.external-name-cell strong {\n  font-weight: 700;\n  font-size: 0.8125rem;\n  color: var(--text-color);\n}\n.external-name-cell span,\n.external-latency small,\ntd small {\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n}\n.external-name-cell small {\n  max-width: 22rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: var(--text-color-secondary);\n  font-size: 0.6875rem;\n}\n.external-type-pill {\n  display: inline-flex;\n  align-items: center;\n  min-height: 1.5rem;\n  border-radius: 4px;\n  padding: 0.15rem 0.5rem;\n  font-size: 0.6875rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.03em;\n  color: var(--text-color-secondary);\n  background: var(--surface-100);\n}\n.external-meter {\n  width: 7rem;\n  height: 0.42rem;\n  overflow: hidden;\n  border-radius: 999px;\n  background: color-mix(in srgb, var(--surface-border) 72%, transparent);\n}\n.external-meter span {\n  display: block;\n  height: 100%;\n  border-radius: inherit;\n  background:\n    linear-gradient(\n      90deg,\n      #22c55e,\n      #14b8a6);\n}\n.external-sparkline {\n  width: 7rem;\n  height: 2.1rem;\n}\n.external-sparkline polyline {\n  fill: none;\n  stroke: color-mix(in srgb, var(--primary-color) 84%, #14b8a6);\n  stroke-linecap: round;\n  stroke-linejoin: round;\n  stroke-width: 4;\n}\n.external-error {\n  max-width: 18rem;\n  color: var(--text-color);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.external-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.125rem;\n  opacity: 0.4;\n  transition: opacity 0.2s ease;\n}\ntr:hover .external-actions {\n  opacity: 1;\n}\n.external-form-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1rem;\n}\n:host ::ng-deep .external-detail-drawer {\n  width: min(34rem, 100vw);\n}\n.external-drawer-title {\n  display: grid;\n  gap: 0.15rem;\n}\n.external-drawer-title span,\n.external-detail-grid dt,\n.external-detail-metrics span {\n  color: var(--text-color-secondary);\n  font-size: 0.74rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.external-drawer-title strong {\n  color: var(--text-color);\n  font-size: 1.08rem;\n}\n.external-detail-section {\n  display: grid;\n  gap: 0.9rem;\n  padding: 1rem 0;\n  border-bottom: 1px solid color-mix(in srgb, var(--surface-border) 78%, transparent);\n}\n.external-detail-section h3 {\n  margin: 0;\n  color: var(--text-color);\n  font-size: 1rem;\n}\n.external-detail-section__head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n}\n.external-detail-status {\n  display: grid;\n  gap: 0.55rem;\n  padding: 0.85rem;\n  border-radius: 8px;\n  border: 1px solid color-mix(in srgb, var(--surface-border) 76%, transparent);\n  background: color-mix(in srgb, var(--surface-ground) 48%, var(--surface-card));\n}\n.external-detail-status span {\n  color: var(--text-color-secondary);\n  line-height: 1.45;\n}\n.external-detail-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 0.8rem;\n  margin: 0;\n}\n.external-detail-grid div,\n.external-detail-metrics article {\n  min-width: 0;\n  padding: 0.8rem;\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--surface-ground) 52%, var(--surface-card));\n}\n.external-detail-grid__wide {\n  grid-column: 1/-1;\n}\n.external-detail-grid dd {\n  margin: 0.25rem 0 0;\n  color: var(--text-color);\n  overflow-wrap: anywhere;\n}\n.external-detail-metrics {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 0.7rem;\n}\n.external-detail-metrics strong {\n  display: block;\n  margin-top: 0.25rem;\n  color: var(--text-color);\n  font-size: 1.25rem;\n}\n.external-json-preview,\n.external-log-detail pre,\n.external-sample-textarea {\n  width: 100%;\n  border-radius: 8px;\n  border: 1px solid color-mix(in srgb, var(--surface-border) 78%, transparent);\n  background: color-mix(in srgb, var(--surface-ground) 68%, #020617);\n  color: var(--text-color);\n  font-family:\n    "JetBrains Mono",\n    "SFMono-Regular",\n    Consolas,\n    monospace;\n  font-size: 0.8rem;\n  line-height: 1.55;\n}\n.external-json-preview,\n.external-log-detail pre {\n  max-height: 18rem;\n  margin: 0;\n  overflow: auto;\n  padding: 0.85rem;\n  white-space: pre-wrap;\n}\n.external-mapping-list {\n  display: grid;\n  gap: 0.55rem;\n}\n.external-mapping-list article {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--surface-ground) 52%, var(--surface-card));\n}\n.external-mapping-list article div {\n  display: grid;\n  min-width: 0;\n  gap: 0.1rem;\n}\n.external-mapping-list strong {\n  color: var(--text-color);\n}\n.external-mapping-list span {\n  color: var(--text-color-secondary);\n  font-size: 0.78rem;\n}\n.external-history-list {\n  display: grid;\n  gap: 0.6rem;\n}\n.external-history-row {\n  display: grid;\n  grid-template-columns: auto minmax(0, 1fr);\n  align-items: flex-start;\n  gap: 0.7rem;\n  padding: 0.75rem;\n  border-radius: 8px;\n  border: 1px solid color-mix(in srgb, var(--surface-border) 78%, transparent);\n  background: var(--surface-card);\n}\n.external-log-detail {\n  grid-column: 1/-1;\n  min-width: 0;\n}\n.external-log-detail summary {\n  cursor: pointer;\n  color: color-mix(in srgb, var(--primary-color) 82%, var(--text-color));\n  font-weight: 800;\n}\n.external-log-detail label {\n  display: block;\n  margin: 0.75rem 0 0.25rem;\n  color: var(--text-color-secondary);\n  font-size: 0.72rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.external-history-row div {\n  display: grid;\n  min-width: 0;\n  gap: 0.15rem;\n}\n.external-history-row strong {\n  color: var(--text-color);\n  font-size: 0.88rem;\n}\n.external-history-row span {\n  color: var(--text-color-secondary);\n  font-size: 0.78rem;\n}\n.field {\n  display: grid;\n  gap: 0.45rem;\n}\n.field span {\n  color: var(--text-color);\n  font-size: 0.85rem;\n  font-weight: 700;\n}\n.field-wide {\n  grid-column: 1/-1;\n}\n.external-sample-textarea {\n  min-height: 11rem;\n  padding: 0.8rem;\n}\n.credential-manager,\n.credential-manager__form,\n.credential-manager__list {\n  display: grid;\n  gap: 0.85rem;\n}\n.credential-manager {\n  grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);\n}\n.credential-manager__list article {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto auto;\n  align-items: center;\n  gap: 0.65rem;\n  padding: 0.75rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n}\n.credential-writeonly-note {\n  color: var(--text-color-secondary);\n  font-size: 0.78rem;\n}\n:host ::ng-deep .external-sample-textarea {\n  resize: vertical;\n}\n@media (max-width: 900px) {\n  .external-health-strip {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .credential-store-strip {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n  .credential-store-strip__head {\n    grid-column: 1/-1;\n  }\n}\n@media (max-width: 560px) {\n  .external-health-strip {\n    grid-template-columns: 1fr;\n  }\n  .credential-store-strip {\n    grid-template-columns: 1fr;\n  }\n  .external-form-grid {\n    grid-template-columns: 1fr;\n  }\n  .credential-manager {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=external-systems.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ExternalSystemsComponent, { className: "ExternalSystemsComponent", filePath: "src/app/pages/external-systems/external-systems.component.ts", lineNumber: 193 });
})();
export {
  ExternalSystemsComponent
};
//# sourceMappingURL=chunk-YRNJ4VP6.js.map
