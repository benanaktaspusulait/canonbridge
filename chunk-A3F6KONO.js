import {
  SchemaService
} from "./chunk-CKE3DDLF.js";
import {
  Table,
  TableModule
} from "./chunk-7ZSNOQRT.js";
import {
  Textarea,
  TextareaModule
} from "./chunk-ZXT5H4RA.js";
import {
  Dialog,
  DialogModule
} from "./chunk-G7EP3YQM.js";
import "./chunk-JH5IFQKL.js";
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
import "./chunk-YFC4IMTE.js";
import {
  Router
} from "./chunk-2VDSLNOW.js";
import {
  CommonModule,
  DatePipe
} from "./chunk-HHZQSEIC.js";
import {
  Component,
  __spreadProps,
  __spreadValues,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
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
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleMap,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-56FG4FZN.js";

// src/app/pages/schemas/schemas.component.ts
var _c0 = () => [10, 25, 50];
var _c1 = () => ({ width: "800px" });
var _c2 = () => ({ "font-family": "monospace", "font-size": "13px" });
function SchemasComponent_ng_template_13_Template(rf, ctx) {
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
    \u0275\u0275elementStart(19, "th", 27);
    \u0275\u0275text(20);
    \u0275\u0275pipe(21, "i18n");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 7, "schemas.name"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 9, "schemas.type"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 11, "schemas.subject"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 13, "schemas.version"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 15, "schemas.status"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 17, "schemas.createdAt"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(21, 19, "schemas.actions"));
  }
}
function SchemasComponent_ng_template_15_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "small");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const schema_r3 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(schema_r3.description);
  }
}
function SchemasComponent_ng_template_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td")(2, "div", 28)(3, "strong");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, SchemasComponent_ng_template_15_Conditional_5_Template, 2, 1, "small");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "td");
    \u0275\u0275element(7, "p-tag", 29);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "td")(9, "code");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "td");
    \u0275\u0275element(12, "p-tag", 30);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td");
    \u0275\u0275element(14, "p-tag", 29);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "td");
    \u0275\u0275text(16);
    \u0275\u0275pipe(17, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "td")(19, "div", 31)(20, "p-button", 32);
    \u0275\u0275listener("onClick", function SchemasComponent_ng_template_15_Template_p_button_onClick_20_listener() {
      const schema_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openValidationRules(schema_r3));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "p-button", 33);
    \u0275\u0275listener("onClick", function SchemasComponent_ng_template_15_Template_p_button_onClick_21_listener() {
      const schema_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.deleteSchema(schema_r3.id));
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const schema_r3 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(schema_r3.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(schema_r3.description ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", schema_r3.schema_type)("severity", ctx_r3.getTypeSeverity(schema_r3.schema_type));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(schema_r3.subject);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", "v" + schema_r3.version);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", schema_r3.status)("severity", ctx_r3.getStatusSeverity(schema_r3.status));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind2(17, 13, schema_r3.created_at, "short"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275property("text", true)("rounded", true);
    \u0275\u0275advance();
    \u0275\u0275property("text", true)("rounded", true);
  }
}
function SchemasComponent_ng_template_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td", 34)(2, "div", 35);
    \u0275\u0275element(3, "i", 36);
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p-button", 6);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275listener("onClick", function SchemasComponent_ng_template_17_Template_p_button_onClick_7_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openCreateDialog());
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 2, "schemas.noSchemas"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(8, 4, "schemas.createFirst"));
  }
}
function SchemasComponent_ng_template_57_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-button", 37);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275listener("onClick", function SchemasComponent_ng_template_57_Template_p_button_onClick_0_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeDialog());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p-button", 38);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275listener("onClick", function SchemasComponent_ng_template_57_Template_p_button_onClick_2_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.saveSchema());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275property("label", \u0275\u0275pipeBind1(1, 3, "common.cancel"))("text", true);
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(3, 5, "common.save"));
  }
}
var SchemasComponent = class _SchemasComponent {
  schemaService = inject(SchemaService);
  router = inject(Router);
  schemas = signal([], ...ngDevMode ? [{ debugName: "schemas" }] : (
    /* istanbul ignore next */
    []
  ));
  loading = signal(true, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  showDialog = signal(false, ...ngDevMode ? [{ debugName: "showDialog" }] : (
    /* istanbul ignore next */
    []
  ));
  editMode = signal(false, ...ngDevMode ? [{ debugName: "editMode" }] : (
    /* istanbul ignore next */
    []
  ));
  currentSchema = signal({
    name: "",
    description: "",
    schema_type: "CANONICAL",
    schema_json: '{\n  "type": "object",\n  "properties": {\n    \n  },\n  "required": []\n}',
    status: "ACTIVE"
  }, ...ngDevMode ? [{ debugName: "currentSchema" }] : (
    /* istanbul ignore next */
    []
  ));
  schemaTypes = [
    { label: "Canonical", value: "CANONICAL" },
    { label: "Partner", value: "PARTNER" },
    { label: "Internal", value: "INTERNAL" }
  ];
  statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Deprecated", value: "DEPRECATED" },
    { label: "Draft", value: "DRAFT" }
  ];
  ngOnInit() {
    this.loadSchemas();
  }
  loadSchemas() {
    this.loading.set(true);
    this.schemaService.list().subscribe({
      next: (schemas) => {
        this.schemas.set(schemas);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to load schemas:", err);
        this.loading.set(false);
      }
    });
  }
  openCreateDialog() {
    this.editMode.set(false);
    this.currentSchema.set({
      name: "",
      description: "",
      schema_type: "CANONICAL",
      schema_json: '{\n  "type": "object",\n  "properties": {\n    \n  },\n  "required": []\n}',
      status: "ACTIVE"
    });
    this.showDialog.set(true);
  }
  openEditDialog(schema) {
    this.editMode.set(true);
    this.currentSchema.set(__spreadValues({}, schema));
    this.showDialog.set(true);
  }
  openValidationRules(schema) {
    this.router.navigate(["/schemas", schema.id]);
  }
  closeDialog() {
    this.showDialog.set(false);
  }
  saveSchema() {
    const schema = this.currentSchema();
    if (this.editMode() && schema.id) {
      this.schemaService.update(schema.id, schema).subscribe({
        next: () => {
          this.loadSchemas();
          this.closeDialog();
        },
        error: (err) => console.error("Failed to update schema:", err)
      });
    } else {
      this.schemaService.create(schema).subscribe({
        next: () => {
          this.loadSchemas();
          this.closeDialog();
        },
        error: (err) => console.error("Failed to create schema:", err)
      });
    }
  }
  deleteSchema(id) {
    if (confirm("Are you sure you want to delete this schema?")) {
      this.schemaService.delete(id).subscribe({
        next: () => this.loadSchemas(),
        error: (err) => console.error("Failed to delete schema:", err)
      });
    }
  }
  formatJson() {
    try {
      const parsed = JSON.parse(this.currentSchema().schema_json || "{}");
      this.currentSchema.update((s) => __spreadProps(__spreadValues({}, s), {
        schema_json: JSON.stringify(parsed, null, 2)
      }));
    } catch (e) {
      console.error("Invalid JSON");
    }
  }
  getStatusSeverity(status) {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "DEPRECATED":
        return "warn";
      default:
        return "secondary";
    }
  }
  getTypeSeverity(type) {
    switch (type) {
      case "CANONICAL":
        return "info";
      case "PARTNER":
        return "warn";
      default:
        return "secondary";
    }
  }
  static \u0275fac = function SchemasComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SchemasComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SchemasComponent, selectors: [["app-schemas"]], decls: 59, vars: 63, consts: [["header", ""], ["body", ""], ["emptymessage", ""], ["footer", ""], [1, "schemas-page"], [1, "page-header"], ["icon", "pi pi-plus", 3, "onClick", "label"], [1, "page-content"], ["currentPageReportTemplate", "Showing {first} to {last} of {totalRecords} schemas", "styleClass", "p-datatable-sm", 3, "value", "loading", "paginator", "rows", "rowsPerPageOptions", "showCurrentPageReport"], [3, "visibleChange", "header", "visible", "modal", "draggable", "resizable"], [1, "schema-form"], [1, "form-field"], ["for", "name"], ["pInputText", "", "id", "name", "placeholder", "e.g., OrderCreated", 3, "ngModelChange", "ngModel"], ["for", "description"], ["pTextarea", "", "id", "description", "placeholder", "Brief description of this schema", 3, "ngModelChange", "ngModel", "rows"], [1, "form-row"], ["for", "type"], ["id", "type", "optionLabel", "label", "optionValue", "value", "placeholder", "Select type", 3, "ngModelChange", "ngModel", "options"], ["for", "status"], ["id", "status", "optionLabel", "label", "optionValue", "value", "placeholder", "Select status", 3, "ngModelChange", "ngModel", "options"], ["for", "subject"], ["pInputText", "", "id", "subject", "placeholder", "e.g., canonical.OrderCreated", 3, "ngModelChange", "ngModel"], ["for", "schema"], [1, "json-editor"], ["pTextarea", "", "id", "schema", 3, "ngModelChange", "ngModel", "rows"], ["icon", "pi pi-code", "size", "small", 3, "onClick", "label", "text"], [2, "width", "150px"], [1, "schema-name"], [3, "value", "severity"], ["severity", "secondary", 3, "value"], [1, "action-buttons"], ["icon", "pi pi-pencil", "severity", "secondary", "size", "small", "pTooltip", "Edit & Validation Rules", "tooltipPosition", "top", 3, "onClick", "text", "rounded"], ["icon", "pi pi-trash", "severity", "danger", "size", "small", 3, "onClick", "text", "rounded"], ["colspan", "7", 1, "empty-message"], [1, "empty-state"], [1, "pi", "pi-inbox"], ["severity", "secondary", 3, "onClick", "label", "text"], [3, "onClick", "label"]], template: function SchemasComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 4)(1, "div", 5)(2, "div")(3, "h1");
      \u0275\u0275text(4);
      \u0275\u0275pipe(5, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "p");
      \u0275\u0275text(7);
      \u0275\u0275pipe(8, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "p-button", 6);
      \u0275\u0275pipe(10, "i18n");
      \u0275\u0275listener("onClick", function SchemasComponent_Template_p_button_onClick_9_listener() {
        return ctx.openCreateDialog();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "div", 7)(12, "p-table", 8);
      \u0275\u0275template(13, SchemasComponent_ng_template_13_Template, 22, 21, "ng-template", null, 0, \u0275\u0275templateRefExtractor)(15, SchemasComponent_ng_template_15_Template, 22, 16, "ng-template", null, 1, \u0275\u0275templateRefExtractor)(17, SchemasComponent_ng_template_17_Template, 9, 6, "ng-template", null, 2, \u0275\u0275templateRefExtractor);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(19, "p-dialog", 9);
      \u0275\u0275pipe(20, "i18n");
      \u0275\u0275pipe(21, "i18n");
      \u0275\u0275twoWayListener("visibleChange", function SchemasComponent_Template_p_dialog_visibleChange_19_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.showDialog, $event) || (ctx.showDialog = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementStart(22, "div", 10)(23, "div", 11)(24, "label", 12);
      \u0275\u0275text(25);
      \u0275\u0275pipe(26, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function SchemasComponent_Template_input_ngModelChange_27_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.currentSchema().name, $event) || (ctx.currentSchema().name = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(28, "div", 11)(29, "label", 14);
      \u0275\u0275text(30);
      \u0275\u0275pipe(31, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "textarea", 15);
      \u0275\u0275twoWayListener("ngModelChange", function SchemasComponent_Template_textarea_ngModelChange_32_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.currentSchema().description, $event) || (ctx.currentSchema().description = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(33, "div", 16)(34, "div", 11)(35, "label", 17);
      \u0275\u0275text(36);
      \u0275\u0275pipe(37, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "p-select", 18);
      \u0275\u0275twoWayListener("ngModelChange", function SchemasComponent_Template_p_select_ngModelChange_38_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.currentSchema().schema_type, $event) || (ctx.currentSchema().schema_type = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(39, "div", 11)(40, "label", 19);
      \u0275\u0275text(41);
      \u0275\u0275pipe(42, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "p-select", 20);
      \u0275\u0275twoWayListener("ngModelChange", function SchemasComponent_Template_p_select_ngModelChange_43_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.currentSchema().status, $event) || (ctx.currentSchema().status = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(44, "div", 11)(45, "label", 21);
      \u0275\u0275text(46);
      \u0275\u0275pipe(47, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(48, "input", 22);
      \u0275\u0275twoWayListener("ngModelChange", function SchemasComponent_Template_input_ngModelChange_48_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.currentSchema().subject, $event) || (ctx.currentSchema().subject = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(49, "div", 11)(50, "label", 23);
      \u0275\u0275text(51);
      \u0275\u0275pipe(52, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(53, "div", 24)(54, "textarea", 25);
      \u0275\u0275twoWayListener("ngModelChange", function SchemasComponent_Template_textarea_ngModelChange_54_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.currentSchema().schema_json, $event) || (ctx.currentSchema().schema_json = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(55, "p-button", 26);
      \u0275\u0275pipe(56, "i18n");
      \u0275\u0275listener("onClick", function SchemasComponent_Template_p_button_onClick_55_listener() {
        return ctx.formatJson();
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275template(57, SchemasComponent_ng_template_57_Template, 4, 7, "ng-template", null, 3, \u0275\u0275templateRefExtractor);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 36, "schemas.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 38, "schemas.subtitle"));
      \u0275\u0275advance(2);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(10, 40, "schemas.createNew"));
      \u0275\u0275advance(3);
      \u0275\u0275property("value", ctx.schemas())("loading", ctx.loading())("paginator", true)("rows", 25)("rowsPerPageOptions", \u0275\u0275pureFunction0(60, _c0))("showCurrentPageReport", true);
      \u0275\u0275advance(7);
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(61, _c1));
      \u0275\u0275property("header", ctx.editMode() ? \u0275\u0275pipeBind1(20, 42, "schemas.editSchema") : \u0275\u0275pipeBind1(21, 44, "schemas.createSchema"));
      \u0275\u0275twoWayProperty("visible", ctx.showDialog);
      \u0275\u0275property("modal", true)("draggable", false)("resizable", false);
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(26, 46, "schemas.name"), " *");
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.currentSchema().name);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(31, 48, "schemas.description"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.currentSchema().description);
      \u0275\u0275property("rows", 2);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(37, 50, "schemas.type"), " *");
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.currentSchema().schema_type);
      \u0275\u0275property("options", ctx.schemaTypes);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(42, 52, "schemas.status"), " *");
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.currentSchema().status);
      \u0275\u0275property("options", ctx.statusOptions);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(47, 54, "schemas.subject"), " *");
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.currentSchema().subject);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(52, 56, "schemas.schemaJson"), " *");
      \u0275\u0275advance(3);
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(62, _c2));
      \u0275\u0275twoWayProperty("ngModel", ctx.currentSchema().schema_json);
      \u0275\u0275property("rows", 15);
      \u0275\u0275advance();
      \u0275\u0275property("label", \u0275\u0275pipeBind1(56, 58, "schemas.formatJson"))("text", true);
    }
  }, dependencies: [
    CommonModule,
    FormsModule,
    DefaultValueAccessor,
    NgControlStatus,
    NgModel,
    ButtonModule,
    Button,
    TableModule,
    Table,
    TagModule,
    Tag,
    DialogModule,
    Dialog,
    InputTextModule,
    InputText,
    TextareaModule,
    Textarea,
    SelectModule,
    Select,
    TooltipModule,
    Tooltip,
    DatePipe,
    I18nPipe
  ], styles: ["\n.schemas-page[_ngcontent-%COMP%] {\n  padding: 2rem;\n  max-width: 1400px;\n  margin: 0 auto;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 2rem;\n}\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 2rem;\n  font-weight: 600;\n}\n.page-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-color-secondary);\n}\n.page-content[_ngcontent-%COMP%] {\n  background: var(--surface-card);\n  border-radius: 8px;\n  padding: 1.5rem;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n}\n.schema-name[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.schema-name[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n.schema-name[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  font-size: 0.875rem;\n}\n.action-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n}\n.empty-state[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 3rem 1rem;\n}\n.empty-state[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 4rem;\n  color: var(--text-color-secondary);\n  margin-bottom: 1rem;\n}\n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  margin-bottom: 1rem;\n}\n.schema-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n  padding: 1rem 0;\n}\n.form-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.form-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 0.875rem;\n}\n.form-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n}\n.json-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.json-editor[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  resize: vertical;\n}\ncode[_ngcontent-%COMP%] {\n  background: var(--surface-100);\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  font-size: 0.875rem;\n}\n/*# sourceMappingURL=schemas.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SchemasComponent, [{
    type: Component,
    args: [{ selector: "app-schemas", standalone: true, imports: [
      CommonModule,
      FormsModule,
      ButtonModule,
      TableModule,
      TagModule,
      DialogModule,
      InputTextModule,
      TextareaModule,
      SelectModule,
      I18nPipe,
      TooltipModule
    ], template: `<div class="schemas-page">
  <div class="page-header">
    <div>
      <h1>{{ 'schemas.title' | i18n }}</h1>
      <p>{{ 'schemas.subtitle' | i18n }}</p>
    </div>
    <p-button 
      [label]="'schemas.createNew' | i18n"
      icon="pi pi-plus"
      (onClick)="openCreateDialog()" />
  </div>

  <div class="page-content">
    <p-table 
      [value]="schemas()" 
      [loading]="loading()"
      [paginator]="true"
      [rows]="25"
      [rowsPerPageOptions]="[10, 25, 50]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} schemas"
      styleClass="p-datatable-sm">
      
      <ng-template #header>
        <tr>
          <th>{{ 'schemas.name' | i18n }}</th>
          <th>{{ 'schemas.type' | i18n }}</th>
          <th>{{ 'schemas.subject' | i18n }}</th>
          <th>{{ 'schemas.version' | i18n }}</th>
          <th>{{ 'schemas.status' | i18n }}</th>
          <th>{{ 'schemas.createdAt' | i18n }}</th>
          <th style="width: 150px">{{ 'schemas.actions' | i18n }}</th>
        </tr>
      </ng-template>
      
      <ng-template #body let-schema>
        <tr>
          <td>
            <div class="schema-name">
              <strong>{{ schema.name }}</strong>
              @if (schema.description) {
                <small>{{ schema.description }}</small>
              }
            </div>
          </td>
          <td>
            <p-tag 
              [value]="schema.schema_type" 
              [severity]="getTypeSeverity(schema.schema_type)" />
          </td>
          <td>
            <code>{{ schema.subject }}</code>
          </td>
          <td>
            <p-tag [value]="'v' + schema.version" severity="secondary" />
          </td>
          <td>
            <p-tag 
              [value]="schema.status" 
              [severity]="getStatusSeverity(schema.status)" />
          </td>
          <td>
            {{ schema.created_at | date:'short' }}
          </td>
          <td>
            <div class="action-buttons">
              <p-button 
                icon="pi pi-pencil"
                [text]="true"
                [rounded]="true"
                severity="secondary"
                size="small"
                pTooltip="Edit & Validation Rules"
                tooltipPosition="top"
                (onClick)="openValidationRules(schema)" />
              <p-button 
                icon="pi pi-trash"
                [text]="true"
                [rounded]="true"
                severity="danger"
                size="small"
                (onClick)="deleteSchema(schema.id!)" />
            </div>
          </td>
        </tr>
      </ng-template>
      
      <ng-template #emptymessage>
        <tr>
          <td colspan="7" class="empty-message">
            <div class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>{{ 'schemas.noSchemas' | i18n }}</p>
              <p-button 
                [label]="'schemas.createFirst' | i18n"
                icon="pi pi-plus"
                (onClick)="openCreateDialog()" />
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</div>

<p-dialog 
  [header]="editMode() ? ('schemas.editSchema' | i18n) : ('schemas.createSchema' | i18n)"
  [(visible)]="showDialog"
  [modal]="true"
  [style]="{width: '800px'}"
  [draggable]="false"
  [resizable]="false">
  
  <div class="schema-form">
    <div class="form-field">
      <label for="name">{{ 'schemas.name' | i18n }} *</label>
      <input 
        pInputText 
        id="name"
        [(ngModel)]="currentSchema().name"
        placeholder="e.g., OrderCreated" />
    </div>

    <div class="form-field">
      <label for="description">{{ 'schemas.description' | i18n }}</label>
      <textarea 
        pTextarea 
        id="description"
        [(ngModel)]="currentSchema().description"
        [rows]="2"
        placeholder="Brief description of this schema"></textarea>
    </div>

    <div class="form-row">
      <div class="form-field">
        <label for="type">{{ 'schemas.type' | i18n }} *</label>
        <p-select 
          id="type"
          [(ngModel)]="currentSchema().schema_type"
          [options]="schemaTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Select type" />
      </div>

      <div class="form-field">
        <label for="status">{{ 'schemas.status' | i18n }} *</label>
        <p-select 
          id="status"
          [(ngModel)]="currentSchema().status"
          [options]="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select status" />
      </div>
    </div>

    <div class="form-field">
      <label for="subject">{{ 'schemas.subject' | i18n }} *</label>
      <input 
        pInputText 
        id="subject"
        [(ngModel)]="currentSchema().subject"
        placeholder="e.g., canonical.OrderCreated" />
    </div>

    <div class="form-field">
      <label for="schema">{{ 'schemas.schemaJson' | i18n }} *</label>
      <div class="json-editor">
        <textarea 
          pTextarea 
          id="schema"
          [(ngModel)]="currentSchema().schema_json"
          [rows]="15"
          [style]="{'font-family': 'monospace', 'font-size': '13px'}"></textarea>
        <p-button 
          [label]="'schemas.formatJson' | i18n"
          icon="pi pi-code"
          [text]="true"
          size="small"
          (onClick)="formatJson()" />
      </div>
    </div>
  </div>

  <ng-template #footer>
    <p-button 
      [label]="'common.cancel' | i18n"
      severity="secondary"
      [text]="true"
      (onClick)="closeDialog()" />
    <p-button 
      [label]="'common.save' | i18n"
      (onClick)="saveSchema()" />
  </ng-template>
</p-dialog>
`, styles: ["/* src/app/pages/schemas/schemas.component.scss */\n.schemas-page {\n  padding: 2rem;\n  max-width: 1400px;\n  margin: 0 auto;\n}\n.page-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 2rem;\n}\n.page-header h1 {\n  margin: 0 0 0.5rem 0;\n  font-size: 2rem;\n  font-weight: 600;\n}\n.page-header p {\n  margin: 0;\n  color: var(--text-color-secondary);\n}\n.page-content {\n  background: var(--surface-card);\n  border-radius: 8px;\n  padding: 1.5rem;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n}\n.schema-name {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.schema-name strong {\n  font-weight: 600;\n}\n.schema-name small {\n  color: var(--text-color-secondary);\n  font-size: 0.875rem;\n}\n.action-buttons {\n  display: flex;\n  gap: 0.5rem;\n}\n.empty-state {\n  text-align: center;\n  padding: 3rem 1rem;\n}\n.empty-state i {\n  font-size: 4rem;\n  color: var(--text-color-secondary);\n  margin-bottom: 1rem;\n}\n.empty-state p {\n  color: var(--text-color-secondary);\n  margin-bottom: 1rem;\n}\n.schema-form {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n  padding: 1rem 0;\n}\n.form-field {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.form-field label {\n  font-weight: 600;\n  font-size: 0.875rem;\n}\n.form-row {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n}\n.json-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.json-editor textarea {\n  resize: vertical;\n}\ncode {\n  background: var(--surface-100);\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  font-size: 0.875rem;\n}\n/*# sourceMappingURL=schemas.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SchemasComponent, { className: "SchemasComponent", filePath: "src/app/pages/schemas/schemas.component.ts", lineNumber: 35 });
})();
export {
  SchemasComponent
};
//# sourceMappingURL=chunk-A3F6KONO.js.map
