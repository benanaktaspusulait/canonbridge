import {
  MetricsService
} from "./chunk-JW6VIVM7.js";
import {
  MappingService
} from "./chunk-CMV4RM4X.js";
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
import "./chunk-QM5AZJSI.js";
import {
  I18nPipe
} from "./chunk-KSWXOF5D.js";
import {
  BadgeModule,
  Button,
  ButtonModule
} from "./chunk-AJPSUZES.js";
import "./chunk-YFC4IMTE.js";
import {
  RouterLink
} from "./chunk-2VDSLNOW.js";
import {
  DecimalPipe,
  PrimeTemplate
} from "./chunk-HHZQSEIC.js";
import {
  Component,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵinterpolate1,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-56FG4FZN.js";

// src/app/pages/dashboard/dashboard.component.ts
var _forTrack0 = ($index, $item) => $item.labelKey;
function DashboardComponent_For_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7)(1, "div", 13);
    \u0275\u0275element(2, "i");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 14)(4, "div", 15);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 16);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 17);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "i18n");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const stat_r1 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", stat_r1.iconBg);
    \u0275\u0275advance();
    \u0275\u0275classMap(\u0275\u0275interpolate1("pi ", stat_r1.icon));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(stat_r1.value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 10, stat_r1.labelKey));
    \u0275\u0275advance(2);
    \u0275\u0275classMap(stat_r1.changeType);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 12, stat_r1.changeKey));
  }
}
function DashboardComponent_ng_template_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18)(1, "div")(2, "h2", 19);
    \u0275\u0275text(3, "Top mappings");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 20);
    \u0275\u0275text(5, "Most used mappings in the current operational window");
    \u0275\u0275elementEnd()()();
  }
}
function DashboardComponent_ng_template_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "th");
    \u0275\u0275text(2, "Mapping");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "th");
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th", 21);
    \u0275\u0275text(7, "Calls");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th", 21);
    \u0275\u0275text(9, "Errors");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th", 21);
    \u0275\u0275text(11, "Avg latency");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 1, "table.eventType"));
  }
}
function DashboardComponent_ng_template_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td")(2, "strong");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td")(5, "code", 22);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "td", 21);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "td", 21);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "td", 21);
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "number");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const m_r2 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r2.name || m_r2.mappingId);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r2.eventType);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r2.callCount);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r2.errorCount);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(13, 5, m_r2.avgLatencyMs, "1.0-0"), "ms");
  }
}
function DashboardComponent_ng_template_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 23);
    \u0275\u0275text(2, "No proxy executions yet");
    \u0275\u0275elementEnd()();
  }
}
function DashboardComponent_ng_template_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18)(1, "div")(2, "h2", 19);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 20);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "i18n");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(8, "p-button", 24);
    \u0275\u0275pipe(9, "i18n");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 3, "dashboard.recentTitle"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 5, "dashboard.recentSubtitle"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(9, 7, "dashboard.viewAll"));
  }
}
function DashboardComponent_ng_template_25_Template(rf, ctx) {
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
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 6, "table.partner"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 8, "table.eventType"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 10, "table.version"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 12, "table.status"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 14, "table.lastModified"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 16, "table.by"));
  }
}
function DashboardComponent_ng_template_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td")(2, "code", 25);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td")(5, "code", 22);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "td")(8, "span", 26);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "td");
    \u0275\u0275element(11, "p-tag", 27);
    \u0275\u0275pipe(12, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td", 28);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "td", 28);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const m_r3 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r3.partner);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r3.eventType);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r3.version);
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", ctx_r3.getSeverity(m_r3.status))("value", \u0275\u0275pipeBind1(12, 7, "status." + m_r3.status));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r3.lastModified);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r3.modifiedBy);
  }
}
var DashboardComponent = class _DashboardComponent {
  metricsService = inject(MetricsService);
  mappingService = inject(MappingService);
  loading = signal(false, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  _stats = signal([], ...ngDevMode ? [{ debugName: "_stats" }] : (
    /* istanbul ignore next */
    []
  ));
  _recentMappings = signal([], ...ngDevMode ? [{ debugName: "_recentMappings" }] : (
    /* istanbul ignore next */
    []
  ));
  _topMappings = signal([], ...ngDevMode ? [{ debugName: "_topMappings" }] : (
    /* istanbul ignore next */
    []
  ));
  stats = this._stats.asReadonly();
  recentMappings = this._recentMappings.asReadonly();
  topMappings = this._topMappings.asReadonly();
  ngOnInit() {
    this.loadDashboardData();
  }
  loadDashboardData() {
    this.loading.set(true);
    this.metricsService.getDashboardStats().subscribe({
      next: (data) => {
        if (!data) {
          this.loading.set(false);
          return;
        }
        this._topMappings.set(data.topMappings ?? []);
        this._stats.set([
          {
            labelKey: "dashboard.stat.msgProcessed.label",
            changeKey: "dashboard.stat.msgProcessed.change",
            value: this.formatNumber(data.messagesProcessed),
            change: "",
            changeType: "positive",
            icon: "pi-send",
            iconBg: "#dbeafe"
          },
          {
            labelKey: "dashboard.stat.activeMappings.label",
            changeKey: "dashboard.stat.activeMappings.change",
            value: String(data.activeMappings),
            change: "",
            changeType: "positive",
            icon: "pi-directions",
            iconBg: "#dcfce7"
          },
          {
            labelKey: "dashboard.stat.dlq.label",
            changeKey: "dashboard.stat.dlq.change",
            value: String(data.dlqCount),
            change: "",
            changeType: data.dlqCount > 10 ? "negative" : "neutral",
            icon: "pi-exclamation-triangle",
            iconBg: "#fee2e2"
          },
          {
            labelKey: "dashboard.stat.lag.label",
            changeKey: "dashboard.stat.lag.change",
            value: String(data.consumerLag),
            change: "",
            changeType: "neutral",
            icon: "pi-clock",
            iconBg: "#fef9c3"
          },
          {
            labelKey: "dashboard.stat.p99.label",
            changeKey: "dashboard.stat.p99.change",
            value: `${Math.round(data.p99Latency ?? 0)}ms`,
            change: "",
            changeType: "positive",
            icon: "pi-bolt",
            iconBg: "#f3e8ff"
          },
          {
            labelKey: "dashboard.stat.partners.label",
            changeKey: "dashboard.stat.partners.change",
            value: String(data.activePartners ?? 0),
            change: "",
            changeType: "neutral",
            icon: "pi-building",
            iconBg: "#ffedd5"
          }
        ]);
      },
      error: (err) => {
        console.error("Failed to load dashboard stats:", err);
        this._stats.set([]);
        this._topMappings.set([]);
        this.loading.set(false);
      }
    });
    this.mappingService.list().subscribe({
      next: (drafts) => {
        if (!drafts) {
          this._recentMappings.set([]);
          this.loading.set(false);
          return;
        }
        const mappings = Array.isArray(drafts) ? drafts : [];
        const recent = mappings.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")).slice(0, 5).map((d) => this.draftToRecentMapping(d));
        this._recentMappings.set(recent);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to load recent mappings:", err);
        this._recentMappings.set([]);
        this.loading.set(false);
      }
    });
  }
  draftToRecentMapping(draft) {
    return {
      partner: draft.partner_id || "unknown",
      eventType: draft.event_type || "unknown",
      version: this.getVersionFromStatus(draft.status),
      status: this.mapDraftStatus(draft.status),
      lastModified: this.formatDate(draft.updated_at || draft.created_at),
      modifiedBy: draft.updated_by || draft.created_by || "System"
    };
  }
  getVersionFromStatus(status) {
    if (status === "READY_TO_PUBLISH" || status === "VALID")
      return "v1.0.0";
    return "draft";
  }
  mapDraftStatus(status) {
    if (status === "READY_TO_PUBLISH" || status === "VALID")
      return "active";
    if (status === "INVALID")
      return "deprecated";
    return "draft";
  }
  formatDate(dateStr) {
    if (!dateStr)
      return "";
    try {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16).replace("T", " ");
    } catch {
      return dateStr;
    }
  }
  formatNumber(num) {
    return Number(num ?? 0).toLocaleString();
  }
  getSeverity(status) {
    const map = {
      active: "success",
      draft: "warn",
      deprecated: "secondary"
    };
    return map[status] ?? "info";
  }
  static \u0275fac = function DashboardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DashboardComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DashboardComponent, selectors: [["app-dashboard"]], decls: 27, vars: 14, consts: [[1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "page-actions"], ["icon", "pi pi-objects-column", "routerLink", "/studio", 3, "label"], ["icon", "pi pi-chart-line", "variant", "outlined", "severity", "secondary", "routerLink", "/monitoring", 3, "label"], [1, "stats-grid"], [1, "stat-card"], ["styleClass", "mt-4"], ["pTemplate", "header"], ["styleClass", "p-datatable-sm", 3, "value"], ["pTemplate", "body"], ["pTemplate", "emptymessage"], [1, "stat-icon"], [1, "stat-body"], [1, "stat-value"], [1, "stat-label"], [1, "stat-change"], [1, "card-header-row"], [1, "card-title"], [1, "card-subtitle"], [2, "text-align", "right"], [1, "event-code"], ["colspan", "5", 1, "text-color-secondary", "text-sm"], ["icon", "pi pi-arrow-right", "iconPos", "right", "variant", "outlined", "severity", "secondary", "size", "small", "routerLink", "/mappings", 3, "label"], [1, "partner-code"], [1, "version-badge"], [3, "severity", "value"], [1, "text-color-secondary", "text-sm"]], template: function DashboardComponent_Template(rf, ctx) {
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
      \u0275\u0275element(9, "p-button", 4);
      \u0275\u0275pipe(10, "i18n");
      \u0275\u0275element(11, "p-button", 5);
      \u0275\u0275pipe(12, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(13, "div", 6);
      \u0275\u0275repeaterCreate(14, DashboardComponent_For_15_Template, 12, 14, "div", 7, _forTrack0);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "p-card", 8);
      \u0275\u0275template(17, DashboardComponent_ng_template_17_Template, 6, 0, "ng-template", 9);
      \u0275\u0275elementStart(18, "p-table", 10);
      \u0275\u0275template(19, DashboardComponent_ng_template_19_Template, 12, 3, "ng-template", 9)(20, DashboardComponent_ng_template_20_Template, 14, 8, "ng-template", 11)(21, DashboardComponent_ng_template_21_Template, 3, 0, "ng-template", 12);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(22, "p-card", 8);
      \u0275\u0275template(23, DashboardComponent_ng_template_23_Template, 10, 9, "ng-template", 9);
      \u0275\u0275elementStart(24, "p-table", 10);
      \u0275\u0275template(25, DashboardComponent_ng_template_25_Template, 19, 18, "ng-template", 9)(26, DashboardComponent_ng_template_26_Template, 17, 9, "ng-template", 11);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 6, "dashboard.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 8, "dashboard.subtitle"));
      \u0275\u0275advance(3);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(10, 10, "dashboard.studio"));
      \u0275\u0275advance(2);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(12, 12, "dashboard.monitoring"));
      \u0275\u0275advance(3);
      \u0275\u0275repeater(ctx.stats());
      \u0275\u0275advance(4);
      \u0275\u0275property("value", ctx.topMappings());
      \u0275\u0275advance(6);
      \u0275\u0275property("value", ctx.recentMappings());
    }
  }, dependencies: [RouterLink, CardModule, Card, PrimeTemplate, TagModule, Tag, ButtonModule, Button, TableModule, Table, BadgeModule, DecimalPipe, I18nPipe], styles: ['@charset "UTF-8";\n\n\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 1rem;\n  margin-bottom: 1.5rem;\n}\n.stat-card[_ngcontent-%COMP%] {\n  background: var(--surface-card);\n  border: 1px solid var(--surface-border);\n  border-radius: 12px;\n  padding: 1.25rem;\n  display: flex;\n  align-items: flex-start;\n  gap: 1rem;\n  transition: box-shadow 0.18s ease, border-color 0.18s ease;\n}\n.stat-card[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);\n  border-color: color-mix(in srgb, var(--primary-color) 18%, var(--surface-border));\n}\nhtml.dark-mode[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);\n  border-color: color-mix(in srgb, var(--primary-color) 28%, var(--surface-border));\n}\n.stat-icon[_ngcontent-%COMP%] {\n  width: 44px;\n  height: 44px;\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.stat-icon[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 1.125rem;\n  color: var(--text-color);\n  opacity: 0.75;\n}\n.stat-body[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.stat-value[_ngcontent-%COMP%] {\n  font-size: 1.375rem;\n  font-weight: 700;\n  color: var(--text-color);\n  line-height: 1.2;\n}\n.stat-label[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  margin: 2px 0 6px;\n}\n.stat-change[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 500;\n}\n.stat-change.positive[_ngcontent-%COMP%] {\n  color: #15803d;\n}\n.stat-change.negative[_ngcontent-%COMP%] {\n  color: #dc2626;\n}\n.stat-change.neutral[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n}\nhtml.dark-mode[_ngcontent-%COMP%]   .stat-change.positive[_ngcontent-%COMP%] {\n  color: #4ade80;\n}\nhtml.dark-mode[_ngcontent-%COMP%]   .stat-change.negative[_ngcontent-%COMP%] {\n  color: #f87171;\n}\n/*# sourceMappingURL=dashboard.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DashboardComponent, [{
    type: Component,
    args: [{ selector: "app-dashboard", standalone: true, imports: [RouterLink, DecimalPipe, CardModule, TagModule, ButtonModule, TableModule, BadgeModule, I18nPipe], template: `<div class="page-header">
  <div>
    <h1 class="page-title">{{ 'dashboard.title' | i18n }}</h1>
    <p class="page-subtitle">{{ 'dashboard.subtitle' | i18n }}</p>
  </div>
  <div class="page-actions">
    <p-button [label]="'dashboard.studio' | i18n" icon="pi pi-objects-column" routerLink="/studio" />
    <p-button
      [label]="'dashboard.monitoring' | i18n"
      icon="pi pi-chart-line"
      variant="outlined"
      severity="secondary"
      routerLink="/monitoring" />
  </div>
</div>

<div class="stats-grid">
  @for (stat of stats(); track stat.labelKey) {
    <div class="stat-card">
      <div class="stat-icon" [style.background]="stat.iconBg">
        <i class="pi {{ stat.icon }}"></i>
      </div>
      <div class="stat-body">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.labelKey | i18n }}</div>
        <div class="stat-change" [class]="stat.changeType">{{ stat.changeKey | i18n }}</div>
      </div>
    </div>
  }
</div>

<p-card styleClass="mt-4">
  <ng-template pTemplate="header">
    <div class="card-header-row">
      <div>
        <h2 class="card-title">Top mappings</h2>
        <p class="card-subtitle">Most used mappings in the current operational window</p>
      </div>
    </div>
  </ng-template>

  <p-table [value]="topMappings()" styleClass="p-datatable-sm">
    <ng-template pTemplate="header">
      <tr>
        <th>Mapping</th>
        <th>{{ 'table.eventType' | i18n }}</th>
        <th style="text-align:right">Calls</th>
        <th style="text-align:right">Errors</th>
        <th style="text-align:right">Avg latency</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-m>
      <tr>
        <td><strong>{{ m.name || m.mappingId }}</strong></td>
        <td><code class="event-code">{{ m.eventType }}</code></td>
        <td style="text-align:right">{{ m.callCount }}</td>
        <td style="text-align:right">{{ m.errorCount }}</td>
        <td style="text-align:right">{{ m.avgLatencyMs | number:'1.0-0' }}ms</td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="5" class="text-color-secondary text-sm">No proxy executions yet</td>
      </tr>
    </ng-template>
  </p-table>
</p-card>

<p-card styleClass="mt-4">
  <ng-template pTemplate="header">
    <div class="card-header-row">
      <div>
        <h2 class="card-title">{{ 'dashboard.recentTitle' | i18n }}</h2>
        <p class="card-subtitle">{{ 'dashboard.recentSubtitle' | i18n }}</p>
      </div>
      <p-button
        [label]="'dashboard.viewAll' | i18n"
        icon="pi pi-arrow-right"
        iconPos="right"
        variant="outlined"
        severity="secondary"
        size="small"
        routerLink="/mappings" />
    </div>
  </ng-template>

  <p-table [value]="recentMappings()" styleClass="p-datatable-sm">
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'table.partner' | i18n }}</th>
        <th>{{ 'table.eventType' | i18n }}</th>
        <th>{{ 'table.version' | i18n }}</th>
        <th>{{ 'table.status' | i18n }}</th>
        <th>{{ 'table.lastModified' | i18n }}</th>
        <th>{{ 'table.by' | i18n }}</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-m>
      <tr>
        <td><code class="partner-code">{{ m.partner }}</code></td>
        <td><code class="event-code">{{ m.eventType }}</code></td>
        <td><span class="version-badge">{{ m.version }}</span></td>
        <td>
          <p-tag [severity]="getSeverity(m.status)" [value]="('status.' + m.status) | i18n" />
        </td>
        <td class="text-color-secondary text-sm">{{ m.lastModified }}</td>
        <td class="text-color-secondary text-sm">{{ m.modifiedBy }}</td>
      </tr>
    </ng-template>
  </p-table>
</p-card>
`, styles: ['@charset "UTF-8";\n\n/* src/app/pages/dashboard/dashboard.component.scss */\n.stats-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 1rem;\n  margin-bottom: 1.5rem;\n}\n.stat-card {\n  background: var(--surface-card);\n  border: 1px solid var(--surface-border);\n  border-radius: 12px;\n  padding: 1.25rem;\n  display: flex;\n  align-items: flex-start;\n  gap: 1rem;\n  transition: box-shadow 0.18s ease, border-color 0.18s ease;\n}\n.stat-card:hover {\n  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);\n  border-color: color-mix(in srgb, var(--primary-color) 18%, var(--surface-border));\n}\nhtml.dark-mode .stat-card:hover {\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);\n  border-color: color-mix(in srgb, var(--primary-color) 28%, var(--surface-border));\n}\n.stat-icon {\n  width: 44px;\n  height: 44px;\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n.stat-icon i {\n  font-size: 1.125rem;\n  color: var(--text-color);\n  opacity: 0.75;\n}\n.stat-body {\n  flex: 1;\n  min-width: 0;\n}\n.stat-value {\n  font-size: 1.375rem;\n  font-weight: 700;\n  color: var(--text-color);\n  line-height: 1.2;\n}\n.stat-label {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  margin: 2px 0 6px;\n}\n.stat-change {\n  font-size: 0.75rem;\n  font-weight: 500;\n}\n.stat-change.positive {\n  color: #15803d;\n}\n.stat-change.negative {\n  color: #dc2626;\n}\n.stat-change.neutral {\n  color: var(--text-color-secondary);\n}\nhtml.dark-mode .stat-change.positive {\n  color: #4ade80;\n}\nhtml.dark-mode .stat-change.negative {\n  color: #f87171;\n}\n/*# sourceMappingURL=dashboard.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DashboardComponent, { className: "DashboardComponent", filePath: "src/app/pages/dashboard/dashboard.component.ts", lineNumber: 39 });
})();
export {
  DashboardComponent
};
//# sourceMappingURL=chunk-KGVVRD7H.js.map
