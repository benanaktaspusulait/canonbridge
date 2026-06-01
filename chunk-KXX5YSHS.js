import {
  Table,
  TableModule
} from "./chunk-NBT7AZAN.js";
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
  Button,
  ButtonModule
} from "./chunk-LABWMPEG.js";
import {
  DatePipe,
  HttpClient,
  HttpParams,
  JsonPipe,
  PrimeTemplate
} from "./chunk-OGO5ZH5D.js";
import {
  Component,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-KLG77GLC.js";

// src/app/pages/audit/audit.component.ts
function AuditComponent_ng_template_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "th");
    \u0275\u0275text(2, "Time");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "th");
    \u0275\u0275text(4, "User");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "th");
    \u0275\u0275text(6, "Action");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "th");
    \u0275\u0275text(8, "Resource");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "th");
    \u0275\u0275text(10, "Outcome");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "th");
    \u0275\u0275text(12, "Correlation");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "th");
    \u0275\u0275text(14, "Details");
    \u0275\u0275elementEnd()();
  }
}
function AuditComponent_ng_template_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 9);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "td")(5, "code");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "td")(8, "strong");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "td")(11, "div", 10)(12, "span");
    \u0275\u0275text(13);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "code");
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "td");
    \u0275\u0275element(17, "p-tag", 11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "td")(19, "code");
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "td")(22, "pre");
    \u0275\u0275text(23);
    \u0275\u0275pipe(24, "json");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const log_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(3, 9, log_r1.created_at, "yyyy-MM-dd HH:mm:ss"));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(log_r1.user_id || "system");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(log_r1.action);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(log_r1.resource_type);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(log_r1.resource_id);
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", ctx_r1.severity(log_r1.outcome))("value", log_r1.outcome || "UNKNOWN");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(log_r1.correlation_id || "n/a");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(24, 12, log_r1.details));
  }
}
function AuditComponent_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 12);
    \u0275\u0275text(2, "No audit events found");
    \u0275\u0275elementEnd()();
  }
}
var AuditComponent = class _AuditComponent {
  http = inject(HttpClient);
  loading = signal(false, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  logs = signal([], ...ngDevMode ? [{ debugName: "logs" }] : (
    /* istanbul ignore next */
    []
  ));
  ngOnInit() {
    this.load();
  }
  load() {
    this.loading.set(true);
    const params = new HttpParams().set("limit", "100").set("offset", "0");
    this.http.get(`/api/audit-logs`, { params }).subscribe({
      next: (logs) => {
        this.logs.set(logs ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.logs.set([]);
        this.loading.set(false);
      }
    });
  }
  severity(outcome) {
    if (outcome === "SUCCESS")
      return "success";
    if (outcome === "DENIED")
      return "warn";
    if (outcome === "FAILURE")
      return "danger";
    return "secondary";
  }
  static \u0275fac = function AuditComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuditComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AuditComponent, selectors: [["app-audit"]], decls: 13, vars: 4, consts: [[1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "page-actions"], ["icon", "pi pi-refresh", "label", "Refresh", "variant", "outlined", "severity", "secondary", 3, "onClick"], ["styleClass", "p-datatable-sm p-datatable-striped", 3, "value", "loading", "paginator", "rows"], ["pTemplate", "header"], ["pTemplate", "body"], ["pTemplate", "emptymessage"], [1, "text-sm"], [1, "resource-cell"], [3, "severity", "value"], ["colspan", "7", 1, "empty-cell"]], template: function AuditComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div")(2, "h1", 1);
      \u0275\u0275text(3, "Audit Log");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "p", 2);
      \u0275\u0275text(5, "Tenant-scoped security and configuration activity");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 3)(7, "p-button", 4);
      \u0275\u0275listener("onClick", function AuditComponent_Template_p_button_onClick_7_listener() {
        return ctx.load();
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(8, "p-card")(9, "p-table", 5);
      \u0275\u0275template(10, AuditComponent_ng_template_10_Template, 15, 0, "ng-template", 6)(11, AuditComponent_ng_template_11_Template, 25, 14, "ng-template", 7)(12, AuditComponent_ng_template_12_Template, 3, 0, "ng-template", 8);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(9);
      \u0275\u0275property("value", ctx.logs())("loading", ctx.loading())("paginator", true)("rows", 20);
    }
  }, dependencies: [ButtonModule, Button, PrimeTemplate, CardModule, Card, TableModule, Table, TagModule, Tag, DatePipe, JsonPipe], styles: ["\ncode[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  background: var(--surface-100);\n  padding: 0.15rem 0.35rem;\n  border-radius: 4px;\n}\npre[_ngcontent-%COMP%] {\n  max-width: 360px;\n  max-height: 120px;\n  overflow: auto;\n  margin: 0;\n  font-size: 0.75rem;\n  color: var(--text-color);\n  white-space: pre-wrap;\n}\n.resource-cell[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.25rem;\n}\n.empty-cell[_ngcontent-%COMP%] {\n  text-align: center;\n  color: var(--text-color-secondary);\n  padding: 2rem;\n}\n/*# sourceMappingURL=audit.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuditComponent, [{
    type: Component,
    args: [{ selector: "app-audit", standalone: true, imports: [DatePipe, JsonPipe, ButtonModule, CardModule, TableModule, TagModule], template: `<div class="page-header">
  <div>
    <h1 class="page-title">Audit Log</h1>
    <p class="page-subtitle">Tenant-scoped security and configuration activity</p>
  </div>
  <div class="page-actions">
    <p-button icon="pi pi-refresh" label="Refresh" variant="outlined" severity="secondary" (onClick)="load()" />
  </div>
</div>

<p-card>
  <p-table [value]="logs()" [loading]="loading()" styleClass="p-datatable-sm p-datatable-striped" [paginator]="true" [rows]="20">
    <ng-template pTemplate="header">
      <tr>
        <th>Time</th>
        <th>User</th>
        <th>Action</th>
        <th>Resource</th>
        <th>Outcome</th>
        <th>Correlation</th>
        <th>Details</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-log>
      <tr>
        <td class="text-sm">{{ log.created_at | date:'yyyy-MM-dd HH:mm:ss' }}</td>
        <td><code>{{ log.user_id || 'system' }}</code></td>
        <td><strong>{{ log.action }}</strong></td>
        <td>
          <div class="resource-cell">
            <span>{{ log.resource_type }}</span>
            <code>{{ log.resource_id }}</code>
          </div>
        </td>
        <td><p-tag [severity]="severity(log.outcome)" [value]="log.outcome || 'UNKNOWN'" /></td>
        <td><code>{{ log.correlation_id || 'n/a' }}</code></td>
        <td><pre>{{ log.details | json }}</pre></td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="7" class="empty-cell">No audit events found</td>
      </tr>
    </ng-template>
  </p-table>
</p-card>
`, styles: ["/* src/app/pages/audit/audit.component.scss */\ncode {\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  background: var(--surface-100);\n  padding: 0.15rem 0.35rem;\n  border-radius: 4px;\n}\npre {\n  max-width: 360px;\n  max-height: 120px;\n  overflow: auto;\n  margin: 0;\n  font-size: 0.75rem;\n  color: var(--text-color);\n  white-space: pre-wrap;\n}\n.resource-cell {\n  display: grid;\n  gap: 0.25rem;\n}\n.empty-cell {\n  text-align: center;\n  color: var(--text-color-secondary);\n  padding: 2rem;\n}\n/*# sourceMappingURL=audit.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AuditComponent, { className: "AuditComponent", filePath: "src/app/pages/audit/audit.component.ts", lineNumber: 28 });
})();
export {
  AuditComponent
};
//# sourceMappingURL=chunk-KXX5YSHS.js.map
