import {
  MetricsService
} from "./chunk-JW6VIVM7.js";
import {
  ToggleSwitch,
  ToggleSwitchModule
} from "./chunk-VGUSRGTU.js";
import {
  Toast,
  ToastModule
} from "./chunk-TJ74L5I3.js";
import "./chunk-TWIBRO5G.js";
import {
  Table,
  TableModule
} from "./chunk-7ZSNOQRT.js";
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
  FormsModule,
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
  ButtonModule
} from "./chunk-AJPSUZES.js";
import {
  I18nService
} from "./chunk-YFC4IMTE.js";
import {
  DomSanitizer,
  MessageService,
  PrimeTemplate
} from "./chunk-HHZQSEIC.js";
import {
  Component,
  computed,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinterpolate1,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeResourceUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-56FG4FZN.js";

// src/app/pages/monitoring/monitoring.component.ts
var _forTrack0 = ($index, $item) => $item.labelKey;
function MonitoringComponent_For_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17)(1, "div", 18);
    \u0275\u0275element(2, "i");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 19)(4, "div", 20);
    \u0275\u0275text(5);
    \u0275\u0275elementStart(6, "span", 21);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 22);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 23);
    \u0275\u0275element(12, "i", 24);
    \u0275\u0275text(13);
    \u0275\u0275pipe(14, "i18n");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const m_r1 = ctx.$implicit;
    \u0275\u0275classProp("ok", m_r1.ok)("breach", !m_r1.ok);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", m_r1.color);
    \u0275\u0275advance();
    \u0275\u0275classMap(\u0275\u0275interpolate1("pi ", m_r1.icon));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r1.value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r1.unit);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 21, m_r1.labelKey));
    \u0275\u0275advance(2);
    \u0275\u0275classProp("ok", m_r1.ok)("breach", !m_r1.ok);
    \u0275\u0275advance();
    \u0275\u0275classProp("pi-check", m_r1.ok)("pi-times", !m_r1.ok);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(14, 23, m_r1.sloKey), " ");
  }
}
function MonitoringComponent_Conditional_29_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 26)(1, "div")(2, "h2", 27);
    \u0275\u0275text(3, "Grafana");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 28);
    \u0275\u0275text(5, "Live production dashboard");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "p-button", 29);
    \u0275\u0275listener("onClick", function MonitoringComponent_Conditional_29_ng_template_1_Template_p_button_onClick_6_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.openGrafana());
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(6);
    \u0275\u0275property("link", true);
  }
}
function MonitoringComponent_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p-card", 13);
    \u0275\u0275template(1, MonitoringComponent_Conditional_29_ng_template_1_Template, 7, 1, "ng-template", 14);
    \u0275\u0275element(2, "iframe", 25);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275property("src", ctx_r2.safeGrafanaUrl(), \u0275\u0275sanitizeResourceUrl);
  }
}
function MonitoringComponent_ng_template_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 26)(1, "div")(2, "h2", 27);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 28);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "i18n");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "p-button", 30);
    \u0275\u0275pipe(9, "i18n");
    \u0275\u0275listener("onClick", function MonitoringComponent_ng_template_31_Template_p_button_onClick_8_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.exportCsv());
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 3, "monitoring.partnerHealth"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 5, "monitoring.partnerHealthSub"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(9, 7, "monitoring.export"));
  }
}
function MonitoringComponent_ng_template_33_Template(rf, ctx) {
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
    \u0275\u0275elementStart(16, "th", 31);
    \u0275\u0275text(17);
    \u0275\u0275pipe(18, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "th");
    \u0275\u0275text(20);
    \u0275\u0275pipe(21, "i18n");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 7, "table.partner"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 9, "monitoring.colStatus"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 11, "monitoring.colThroughput"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 13, "monitoring.colP99Latency"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 15, "monitoring.colDlqRate"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 17, "monitoring.metric.lag.label"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(21, 19, "monitoring.colUptime"));
  }
}
function MonitoringComponent_ng_template_34_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td")(2, "code", 32);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td");
    \u0275\u0275element(5, "p-tag", 33);
    \u0275\u0275pipe(6, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "td", 34);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "td", 34);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "td", 34);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td", 35);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "td", 34);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r5 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(p_r5.partner);
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", ctx_r2.getSeverity(p_r5.status))("value", \u0275\u0275pipeBind1(6, 14, "monitoring.healthStatus." + p_r5.status));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(p_r5.throughput);
    \u0275\u0275advance();
    \u0275\u0275classProp("latency-warn", p_r5.p99 !== "\u2014" && +p_r5.p99.replace("ms", "") > 200);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(p_r5.p99);
    \u0275\u0275advance();
    \u0275\u0275classProp("dlq-warn", p_r5.dlqRate !== "\u2014" && +p_r5.dlqRate.replace("%", "") > 0.1);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(p_r5.dlqRate);
    \u0275\u0275advance();
    \u0275\u0275classProp("lag-warn", p_r5.lag > 500);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(p_r5.lag);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r5.uptime);
  }
}
var MonitoringComponent = class _MonitoringComponent {
  toast = inject(MessageService);
  i18n = inject(I18nService);
  metricsService = inject(MetricsService);
  sanitizer = inject(DomSanitizer);
  refreshTimer = null;
  // ── State ─────────────────────────────────────────────────────────────────
  timeWindow = "1h";
  autoRefresh = false;
  lastUpdated = /* @__PURE__ */ new Date();
  windowOptions = [
    { label: "Last 1 hour", value: "1h" },
    { label: "Last 6 hours", value: "6h" },
    { label: "Last 24 hours", value: "24h" },
    { label: "Last 7 days", value: "7d" }
  ];
  metrics = signal([], ...ngDevMode ? [{ debugName: "metrics" }] : (
    /* istanbul ignore next */
    []
  ));
  partnerHealth = signal([], ...ngDevMode ? [{ debugName: "partnerHealth" }] : (
    /* istanbul ignore next */
    []
  ));
  _grafanaDashboardUrl = signal("", ...ngDevMode ? [{ debugName: "_grafanaDashboardUrl" }] : (
    /* istanbul ignore next */
    []
  ));
  grafanaDashboardUrl = computed(() => this._grafanaDashboardUrl(), ...ngDevMode ? [{ debugName: "grafanaDashboardUrl" }] : (
    /* istanbul ignore next */
    []
  ));
  safeGrafanaUrl = computed(() => {
    const url = this._grafanaDashboardUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }, ...ngDevMode ? [{ debugName: "safeGrafanaUrl" }] : (
    /* istanbul ignore next */
    []
  ));
  loading = signal(false, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadMetrics();
  }
  loadMetrics() {
    this.loading.set(true);
    this.metricsService.getMonitoringMetrics(this.timeWindow).subscribe({
      next: (data) => {
        if (!data || !data.system) {
          this.metrics.set([]);
          this.loading.set(false);
          return;
        }
        const sys = data.system;
        this._grafanaDashboardUrl.set(data.grafanaDashboardUrl ?? data.grafanaUrl ?? "");
        this.metrics.set([
          { labelKey: "monitoring.metric.throughput.label", sloKey: "monitoring.metric.throughput.slo", value: String(sys.throughput), unit: "msg/sec", ok: true, icon: "pi-send", color: "#dbeafe" },
          { labelKey: "monitoring.metric.p99.label", sloKey: "monitoring.metric.p99.slo", value: String(sys.p99Latency), unit: "ms", ok: sys.p99Latency < 200, icon: "pi-bolt", color: "#dcfce7" },
          { labelKey: "monitoring.metric.dlq.label", sloKey: "monitoring.metric.dlq.slo", value: sys.dlqRate.toFixed(2), unit: "%", ok: sys.dlqRate < 0.1, icon: "pi-exclamation-circle", color: "#fef9c3" },
          { labelKey: "monitoring.metric.lag.label", sloKey: "monitoring.metric.lag.slo", value: String(sys.consumerLag), unit: "msgs", ok: sys.consumerLag < 1e3, icon: "pi-clock", color: "#f3e8ff" },
          { labelKey: "monitoring.metric.error.label", sloKey: "monitoring.metric.error.slo", value: sys.errorRate.toFixed(2), unit: "%", ok: sys.errorRate < 1, icon: "pi-times-circle", color: "#ffedd5" },
          { labelKey: "monitoring.metric.uptime.label", sloKey: "monitoring.metric.uptime.slo", value: sys.uptime.toFixed(2), unit: "%", ok: sys.uptime > 99.9, icon: "pi-check-circle", color: "#dcfce7" }
        ]);
        this.lastUpdated = /* @__PURE__ */ new Date();
      },
      error: (err) => {
        console.error("Failed to load monitoring metrics:", err);
        this.metrics.set([]);
        this.loading.set(false);
      }
    });
    this.metricsService.getPartnerHealth(this.timeWindow).subscribe({
      next: (data) => {
        if (!data || !data.partners) {
          this.partnerHealth.set([]);
          this.loading.set(false);
          return;
        }
        this.partnerHealth.set(data.partners);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to load partner health:", err);
        this.partnerHealth.set([]);
        this.loading.set(false);
      }
    });
  }
  // ── Window change ─────────────────────────────────────────────────────────
  onWindowChange() {
    this.loadMetrics();
  }
  // ── Refresh ───────────────────────────────────────────────────────────────
  refresh(showToast = true) {
    this.loadMetrics();
    if (showToast) {
      this.toast.add({ severity: "success", summary: this.t("monitoring.toast.refreshed"), detail: this.lastUpdatedLabel, life: 2e3 });
    }
  }
  onAutoRefreshChange() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.autoRefresh) {
      this.refreshTimer = setInterval(() => this.refresh(false), 3e4);
      this.toast.add({ severity: "info", summary: this.t("monitoring.toast.autoOn"), detail: "30s", life: 2500 });
    } else {
      this.toast.add({ severity: "secondary", summary: this.t("monitoring.toast.autoOff"), life: 2e3 });
    }
  }
  ngOnDestroy() {
    if (this.refreshTimer)
      clearInterval(this.refreshTimer);
  }
  // ── Export ────────────────────────────────────────────────────────────────
  exportCsv() {
    const rows = [
      ["partner", "status", "throughput", "p99", "dlqRate", "lag", "uptime", "window", "exportedAt"],
      ...this.partnerHealth().map((p) => [
        p.partner,
        p.status,
        p.throughput,
        p.p99,
        p.dlqRate,
        String(p.lag),
        p.uptime,
        this.timeWindow,
        (/* @__PURE__ */ new Date()).toISOString()
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `canonbridge-monitoring-${this.timeWindow}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.add({ severity: "success", summary: this.t("monitoring.toast.exported"), detail: a.download, life: 2500 });
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  openGrafana() {
    const url = this.grafanaDashboardUrl();
    if (url)
      window.open(url, "_blank");
  }
  getSeverity(status) {
    const map = {
      healthy: "success",
      degraded: "warn",
      down: "danger"
    };
    return map[status] ?? "warn";
  }
  get lastUpdatedLabel() {
    return this.lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  t(key) {
    return this.i18n.translate(key);
  }
  static \u0275fac = function MonitoringComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MonitoringComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MonitoringComponent, selectors: [["app-monitoring"]], features: [\u0275\u0275ProvidersFeature([MessageService])], decls: 35, vars: 24, consts: [[1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "page-actions", "monitoring-actions"], ["optionLabel", "label", "optionValue", "value", "appendTo", "body", 3, "ngModelChange", "onChange", "options", "ngModel"], [1, "auto-refresh-label"], [3, "ngModelChange", "ngModel"], ["icon", "pi pi-download", "variant", "outlined", "severity", "secondary", 3, "onClick", "label"], ["icon", "pi pi-refresh", "variant", "outlined", "severity", "secondary", 3, "onClick", "label"], [1, "last-updated-bar"], [1, "pi", "pi-clock"], [1, "metrics-grid"], [1, "metric-card", 3, "ok", "breach"], ["styleClass", "mt-4"], ["pTemplate", "header"], ["styleClass", "p-datatable-sm", 3, "value"], ["pTemplate", "body"], [1, "metric-card"], [1, "metric-icon"], [1, "metric-body"], [1, "metric-value"], [1, "metric-unit"], [1, "metric-label"], [1, "metric-slo"], [1, "pi"], ["title", "Grafana dashboard", 1, "grafana-frame", 3, "src"], [1, "card-header-row"], [1, "card-title"], [1, "card-subtitle"], ["icon", "pi pi-external-link", "variant", "text", "severity", "secondary", "size", "small", "label", "Open", 3, "onClick", "link"], ["icon", "pi pi-download", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "label"], [2, "text-align", "right"], [1, "partner-code"], [3, "severity", "value"], [1, "text-sm"], [1, "text-sm", 2, "text-align", "right"]], template: function MonitoringComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "p-toast");
      \u0275\u0275elementStart(1, "div", 0)(2, "div")(3, "h1", 1);
      \u0275\u0275text(4);
      \u0275\u0275pipe(5, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "p", 2);
      \u0275\u0275text(7);
      \u0275\u0275pipe(8, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 3)(10, "p-select", 4);
      \u0275\u0275twoWayListener("ngModelChange", function MonitoringComponent_Template_p_select_ngModelChange_10_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.timeWindow, $event) || (ctx.timeWindow = $event);
        return $event;
      });
      \u0275\u0275listener("onChange", function MonitoringComponent_Template_p_select_onChange_10_listener() {
        return ctx.onWindowChange();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "label", 5)(12, "span");
      \u0275\u0275text(13);
      \u0275\u0275pipe(14, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "p-toggleswitch", 6);
      \u0275\u0275twoWayListener("ngModelChange", function MonitoringComponent_Template_p_toggleswitch_ngModelChange_15_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.autoRefresh, $event) || (ctx.autoRefresh = $event);
        return $event;
      });
      \u0275\u0275listener("ngModelChange", function MonitoringComponent_Template_p_toggleswitch_ngModelChange_15_listener() {
        return ctx.onAutoRefreshChange();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "p-button", 7);
      \u0275\u0275pipe(17, "i18n");
      \u0275\u0275listener("onClick", function MonitoringComponent_Template_p_button_onClick_16_listener() {
        return ctx.exportCsv();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "p-button", 8);
      \u0275\u0275pipe(19, "i18n");
      \u0275\u0275listener("onClick", function MonitoringComponent_Template_p_button_onClick_18_listener() {
        return ctx.refresh();
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(20, "div", 9);
      \u0275\u0275element(21, "i", 10);
      \u0275\u0275text(22);
      \u0275\u0275pipe(23, "i18n");
      \u0275\u0275elementStart(24, "strong");
      \u0275\u0275text(25);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(26, "div", 11);
      \u0275\u0275repeaterCreate(27, MonitoringComponent_For_28_Template, 15, 25, "div", 12, _forTrack0);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(29, MonitoringComponent_Conditional_29_Template, 3, 1, "p-card", 13);
      \u0275\u0275elementStart(30, "p-card", 13);
      \u0275\u0275template(31, MonitoringComponent_ng_template_31_Template, 10, 9, "ng-template", 14);
      \u0275\u0275elementStart(32, "p-table", 15);
      \u0275\u0275template(33, MonitoringComponent_ng_template_33_Template, 22, 21, "ng-template", 14)(34, MonitoringComponent_ng_template_34_Template, 17, 16, "ng-template", 16);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 12, "monitoring.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 14, "monitoring.subtitle"));
      \u0275\u0275advance(3);
      \u0275\u0275property("options", ctx.windowOptions);
      \u0275\u0275twoWayProperty("ngModel", ctx.timeWindow);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(14, 16, "monitoring.autoRefresh"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.autoRefresh);
      \u0275\u0275advance();
      \u0275\u0275property("label", \u0275\u0275pipeBind1(17, 18, "monitoring.export"));
      \u0275\u0275advance(2);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(19, 20, "monitoring.refresh"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(23, 22, "monitoring.lastUpdated"), ": ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.lastUpdatedLabel);
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.metrics());
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.grafanaDashboardUrl() ? 29 : -1);
      \u0275\u0275advance(3);
      \u0275\u0275property("value", ctx.partnerHealth());
    }
  }, dependencies: [FormsModule, NgControlStatus, NgModel, ButtonModule, Button, PrimeTemplate, CardModule, Card, SelectModule, Select, TableModule, Table, TagModule, Tag, ToastModule, Toast, ToggleSwitchModule, ToggleSwitch, I18nPipe], styles: ["\n.monitoring-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.auto-refresh-label[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--text-color);\n  cursor: pointer;\n  padding: 0 0.25rem;\n}\n.last-updated-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.375rem;\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  margin-bottom: 1.25rem;\n}\n.last-updated-bar[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n}\n.last-updated-bar[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text-color);\n}\n.metrics-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  gap: 1rem;\n  margin-bottom: 1.5rem;\n}\n.metric-card[_ngcontent-%COMP%] {\n  background: var(--surface-card);\n  border: 1px solid var(--surface-border);\n  border-radius: 12px;\n  padding: 1.25rem;\n  display: flex;\n  align-items: flex-start;\n  gap: 1rem;\n  transition: box-shadow 0.15s ease, transform 0.15s ease;\n}\n.metric-card[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);\n  transform: translateY(-2px);\n}\n.metric-card.breach[_ngcontent-%COMP%] {\n  border-color: #fca5a5;\n  background: color-mix(in srgb, #fef2f2 88%, var(--surface-card));\n}\nhtml.dark-mode[_ngcontent-%COMP%]   .metric-card[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3);\n}\nhtml.dark-mode[_ngcontent-%COMP%]   .metric-card.breach[_ngcontent-%COMP%] {\n  border-color: rgba(248, 113, 113, 0.5);\n  background: color-mix(in srgb, rgba(127, 29, 29, 0.35), var(--surface-card));\n}\n.metric-icon[_ngcontent-%COMP%] {\n  width: 44px;\n  height: 44px;\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.metric-icon[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 1.125rem;\n  color: var(--text-color);\n  opacity: 0.75;\n}\n.metric-body[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.metric-value[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: var(--text-color);\n  line-height: 1.2;\n}\n.metric-unit[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 400;\n  color: var(--text-color-secondary);\n  margin-left: 3px;\n}\n.metric-label[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  margin: 2px 0 6px;\n}\n.metric-slo[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.metric-slo.ok[_ngcontent-%COMP%] {\n  color: #16a34a;\n}\n.metric-slo.breach[_ngcontent-%COMP%] {\n  color: #dc2626;\n}\n.grafana-frame[_ngcontent-%COMP%] {\n  width: 100%;\n  min-height: 420px;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-ground);\n}\n.latency-warn[_ngcontent-%COMP%] {\n  color: #ca8a04;\n  font-weight: 600;\n}\n.dlq-warn[_ngcontent-%COMP%] {\n  color: #dc2626;\n  font-weight: 600;\n}\n.lag-warn[_ngcontent-%COMP%] {\n  color: #ea580c;\n  font-weight: 600;\n}\n.text-sm[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n}\n@media (max-width: 900px) {\n  .monitoring-actions[_ngcontent-%COMP%] {\n    gap: 0.375rem;\n  }\n  .metrics-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));\n  }\n}\n@media (max-width: 560px) {\n  .metrics-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr 1fr;\n  }\n}\n/*# sourceMappingURL=monitoring.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MonitoringComponent, [{
    type: Component,
    args: [{ selector: "app-monitoring", standalone: true, imports: [
      FormsModule,
      ButtonModule,
      CardModule,
      SelectModule,
      TableModule,
      TagModule,
      ToastModule,
      ToggleSwitchModule,
      I18nPipe
    ], providers: [MessageService], template: `<p-toast />

<div class="page-header">
  <div>
    <h1 class="page-title">{{ 'monitoring.title' | i18n }}</h1>
    <p class="page-subtitle">{{ 'monitoring.subtitle' | i18n }}</p>
  </div>
  <div class="page-actions monitoring-actions">
    <p-select
      [options]="windowOptions"
      [(ngModel)]="timeWindow"
      optionLabel="label"
      optionValue="value"
      appendTo="body"
      (onChange)="onWindowChange()" />
    <label class="auto-refresh-label">
      <span>{{ 'monitoring.autoRefresh' | i18n }}</span>
      <p-toggleswitch [(ngModel)]="autoRefresh" (ngModelChange)="onAutoRefreshChange()" />
    </label>
    <p-button
      icon="pi pi-download"
      variant="outlined"
      severity="secondary"
      [label]="'monitoring.export' | i18n"
      (onClick)="exportCsv()" />
    <p-button
      icon="pi pi-refresh"
      variant="outlined"
      severity="secondary"
      [label]="'monitoring.refresh' | i18n"
      (onClick)="refresh()" />
  </div>
</div>

<div class="last-updated-bar">
  <i class="pi pi-clock"></i>
  {{ 'monitoring.lastUpdated' | i18n }}: <strong>{{ lastUpdatedLabel }}</strong>
</div>

<!-- \u2500\u2500 Metric cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<div class="metrics-grid">
  @for (m of metrics(); track m.labelKey) {
    <div class="metric-card" [class.ok]="m.ok" [class.breach]="!m.ok">
      <div class="metric-icon" [style.background]="m.color">
        <i class="pi {{ m.icon }}"></i>
      </div>
      <div class="metric-body">
        <div class="metric-value">{{ m.value }}<span class="metric-unit">{{ m.unit }}</span></div>
        <div class="metric-label">{{ m.labelKey | i18n }}</div>
        <div class="metric-slo" [class.ok]="m.ok" [class.breach]="!m.ok">
          <i class="pi" [class.pi-check]="m.ok" [class.pi-times]="!m.ok"></i>
          {{ m.sloKey | i18n }}
        </div>
      </div>
    </div>
  }
</div>

@if (grafanaDashboardUrl()) {
  <p-card styleClass="mt-4">
    <ng-template pTemplate="header">
      <div class="card-header-row">
        <div>
          <h2 class="card-title">Grafana</h2>
          <p class="card-subtitle">Live production dashboard</p>
        </div>
        <p-button
          icon="pi pi-external-link"
          variant="text"
          severity="secondary"
          size="small"
          label="Open"
          [link]="true"
          (onClick)="openGrafana()" />
      </div>
    </ng-template>
    <iframe class="grafana-frame" [src]="safeGrafanaUrl()" title="Grafana dashboard"></iframe>
  </p-card>
}

<!-- \u2500\u2500 Partner health table \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<p-card styleClass="mt-4">
  <ng-template pTemplate="header">
    <div class="card-header-row">
      <div>
        <h2 class="card-title">{{ 'monitoring.partnerHealth' | i18n }}</h2>
        <p class="card-subtitle">{{ 'monitoring.partnerHealthSub' | i18n }}</p>
      </div>
      <p-button
        icon="pi pi-download"
        variant="text"
        severity="secondary"
        size="small"
        [label]="'monitoring.export' | i18n"
        (onClick)="exportCsv()" />
    </div>
  </ng-template>

  <p-table [value]="partnerHealth()" styleClass="p-datatable-sm">
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'table.partner' | i18n }}</th>
        <th>{{ 'monitoring.colStatus' | i18n }}</th>
        <th>{{ 'monitoring.colThroughput' | i18n }}</th>
        <th>{{ 'monitoring.colP99Latency' | i18n }}</th>
        <th>{{ 'monitoring.colDlqRate' | i18n }}</th>
        <th style="text-align:right">{{ 'monitoring.metric.lag.label' | i18n }}</th>
        <th>{{ 'monitoring.colUptime' | i18n }}</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-p>
      <tr>
        <td><code class="partner-code">{{ p.partner }}</code></td>
        <td>
          <p-tag [severity]="getSeverity(p.status)" [value]="('monitoring.healthStatus.' + p.status) | i18n" />
        </td>
        <td class="text-sm">{{ p.throughput }}</td>
        <td class="text-sm" [class.latency-warn]="p.p99 !== '\u2014' && +p.p99.replace('ms','') > 200">{{ p.p99 }}</td>
        <td class="text-sm" [class.dlq-warn]="p.dlqRate !== '\u2014' && +p.dlqRate.replace('%','') > 0.1">{{ p.dlqRate }}</td>
        <td class="text-sm" style="text-align:right" [class.lag-warn]="p.lag > 500">{{ p.lag }}</td>
        <td class="text-sm">{{ p.uptime }}</td>
      </tr>
    </ng-template>
  </p-table>
</p-card>
`, styles: ["/* src/app/pages/monitoring/monitoring.component.scss */\n.monitoring-actions {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.auto-refresh-label {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--text-color);\n  cursor: pointer;\n  padding: 0 0.25rem;\n}\n.last-updated-bar {\n  display: flex;\n  align-items: center;\n  gap: 0.375rem;\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  margin-bottom: 1.25rem;\n}\n.last-updated-bar i {\n  font-size: 0.75rem;\n}\n.last-updated-bar strong {\n  color: var(--text-color);\n}\n.metrics-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  gap: 1rem;\n  margin-bottom: 1.5rem;\n}\n.metric-card {\n  background: var(--surface-card);\n  border: 1px solid var(--surface-border);\n  border-radius: 12px;\n  padding: 1.25rem;\n  display: flex;\n  align-items: flex-start;\n  gap: 1rem;\n  transition: box-shadow 0.15s ease, transform 0.15s ease;\n}\n.metric-card:hover {\n  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);\n  transform: translateY(-2px);\n}\n.metric-card.breach {\n  border-color: #fca5a5;\n  background: color-mix(in srgb, #fef2f2 88%, var(--surface-card));\n}\nhtml.dark-mode .metric-card:hover {\n  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3);\n}\nhtml.dark-mode .metric-card.breach {\n  border-color: rgba(248, 113, 113, 0.5);\n  background: color-mix(in srgb, rgba(127, 29, 29, 0.35), var(--surface-card));\n}\n.metric-icon {\n  width: 44px;\n  height: 44px;\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.metric-icon i {\n  font-size: 1.125rem;\n  color: var(--text-color);\n  opacity: 0.75;\n}\n.metric-body {\n  flex: 1;\n  min-width: 0;\n}\n.metric-value {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: var(--text-color);\n  line-height: 1.2;\n}\n.metric-unit {\n  font-size: 0.75rem;\n  font-weight: 400;\n  color: var(--text-color-secondary);\n  margin-left: 3px;\n}\n.metric-label {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  margin: 2px 0 6px;\n}\n.metric-slo {\n  font-size: 0.75rem;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.metric-slo.ok {\n  color: #16a34a;\n}\n.metric-slo.breach {\n  color: #dc2626;\n}\n.grafana-frame {\n  width: 100%;\n  min-height: 420px;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-ground);\n}\n.latency-warn {\n  color: #ca8a04;\n  font-weight: 600;\n}\n.dlq-warn {\n  color: #dc2626;\n  font-weight: 600;\n}\n.lag-warn {\n  color: #ea580c;\n  font-weight: 600;\n}\n.text-sm {\n  font-size: 0.875rem;\n}\n@media (max-width: 900px) {\n  .monitoring-actions {\n    gap: 0.375rem;\n  }\n  .metrics-grid {\n    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));\n  }\n}\n@media (max-width: 560px) {\n  .metrics-grid {\n    grid-template-columns: 1fr 1fr;\n  }\n}\n/*# sourceMappingURL=monitoring.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MonitoringComponent, { className: "MonitoringComponent", filePath: "src/app/pages/monitoring/monitoring.component.ts", lineNumber: 39 });
})();
export {
  MonitoringComponent
};
//# sourceMappingURL=chunk-X5MS5Q35.js.map
