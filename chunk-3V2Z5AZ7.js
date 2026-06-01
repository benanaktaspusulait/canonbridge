import {
  Avatar,
  AvatarModule
} from "./chunk-H2OUYG5I.js";
import {
  PartnerService
} from "./chunk-B4ZJ7YGE.js";
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
  MessageService,
  PrimeTemplate
} from "./chunk-OGO5ZH5D.js";
import {
  Component,
  __spreadValues,
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
} from "./chunk-KLG77GLC.js";

// src/app/pages/partners/partners.component.ts
var _c0 = () => ({ width: "min(42rem, calc(100vw - 2rem))" });
function PartnersComponent_ng_template_34_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "th");
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "th");
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "th", 18);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th", 18);
    \u0275\u0275text(11);
    \u0275\u0275pipe(12, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "th", 18);
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
    \u0275\u0275element(22, "th", 19);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 7, "partners.colPartner"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 9, "partners.colStatus"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 11, "partners.colEvents"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 13, "partners.colMappings"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 15, "partners.colDlq"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 17, "partners.colThroughput"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(21, 19, "partners.colLastSeen"));
  }
}
function PartnersComponent_ng_template_35_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "small");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const p_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(p_r2.contactEmail);
  }
}
function PartnersComponent_ng_template_35_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 25);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const p_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(p_r2.dlqCount);
  }
}
function PartnersComponent_ng_template_35_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 26);
    \u0275\u0275text(1, "\u2014");
    \u0275\u0275elementEnd();
  }
}
function PartnersComponent_ng_template_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td")(2, "div", 20);
    \u0275\u0275element(3, "p-avatar", 21);
    \u0275\u0275elementStart(4, "div")(5, "div", 22);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "code", 23);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(9, PartnersComponent_ng_template_35_Conditional_9_Template, 2, 1, "small");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(10, "td");
    \u0275\u0275element(11, "p-tag", 24);
    \u0275\u0275pipe(12, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td", 18);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "td", 18);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "td", 18);
    \u0275\u0275conditionalCreate(18, PartnersComponent_ng_template_35_Conditional_18_Template, 2, 1, "span", 25)(19, PartnersComponent_ng_template_35_Conditional_19_Template, 2, 0, "span", 26);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "td", 27);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "td", 28);
    \u0275\u0275text(23);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "td")(25, "div", 29)(26, "p-button", 30);
    \u0275\u0275pipe(27, "i18n");
    \u0275\u0275listener("onClick", function PartnersComponent_ng_template_35_Template_p_button_onClick_26_listener() {
      const p_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.openEdit(p_r2));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "p-button", 31);
    \u0275\u0275pipe(29, "i18n");
    \u0275\u0275listener("onClick", function PartnersComponent_ng_template_35_Template_p_button_onClick_28_listener($event) {
      const p_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.confirmDelete(p_r2, $event));
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const p_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275property("label", ctx_r2.getInitials(p_r2.name));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(p_r2.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r2.slug);
    \u0275\u0275advance();
    \u0275\u0275conditional(p_r2.contactEmail ? 9 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", ctx_r2.getSeverity(p_r2.status))("value", \u0275\u0275pipeBind1(12, 13, "partners.status." + p_r2.status));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(p_r2.eventTypes);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r2.activeMappings);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(p_r2.dlqCount > 0 ? 18 : 19);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(p_r2.throughput);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(p_r2.lastSeen);
    \u0275\u0275advance(3);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(27, 15, "partners.edit"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(29, 17, "partners.delete"));
  }
}
function PartnersComponent_ng_template_75_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-button", 32);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275listener("onClick", function PartnersComponent_ng_template_75_Template_p_button_onClick_0_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.dialogVisible = false);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "p-button", 33);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275listener("onClick", function PartnersComponent_ng_template_75_Template_p_button_onClick_2_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.save());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("label", \u0275\u0275pipeBind1(1, 3, "partners.cancel"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", ctx_r2.isEdit ? \u0275\u0275pipeBind1(3, 5, "partners.save") : \u0275\u0275pipeBind1(4, 7, "partners.onboard"))("disabled", !ctx_r2.formValid);
  }
}
var EMPTY_FORM = {
  name: "",
  slug: "",
  status: "active",
  eventTypes: 1,
  activeMappings: 0,
  dlqCount: 0,
  contactEmail: "",
  description: ""
};
var PartnersComponent = class _PartnersComponent {
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  i18n = inject(I18nService);
  partnerService = inject(PartnerService);
  _partners = signal([], ...ngDevMode ? [{ debugName: "_partners" }] : (
    /* istanbul ignore next */
    []
  ));
  partners = this._partners.asReadonly();
  activeCount = computed(() => this._partners().filter((p) => p.status === "active").length, ...ngDevMode ? [{ debugName: "activeCount" }] : (
    /* istanbul ignore next */
    []
  ));
  totalMappings = computed(() => this._partners().reduce((sum, p) => sum + p.activeMappings, 0), ...ngDevMode ? [{ debugName: "totalMappings" }] : (
    /* istanbul ignore next */
    []
  ));
  ngOnInit() {
    this.loadPartners();
  }
  loadPartners() {
    this.partnerService.list().subscribe({
      next: (apiPartners) => {
        if (!apiPartners) {
          this._partners.set([]);
          return;
        }
        const partners = Array.isArray(apiPartners) ? apiPartners : [];
        const uiPartners = partners.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.external_id,
          status: this.mapApiStatusToUi(p.status),
          eventTypes: 0,
          // TODO: Get from API
          activeMappings: 0,
          // TODO: Get from API
          dlqCount: 0,
          // TODO: Get from API
          throughput: p.status === "ACTIVE" ? "~0/hr" : "\u2014",
          lastSeen: "just now",
          contactEmail: p.contact_email || "",
          description: p.description || ""
        }));
        this._partners.set(uiPartners);
      },
      error: (error) => {
        console.error("Failed to load partners:", error);
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load partners"
        });
        this._partners.set([]);
      }
    });
  }
  mapApiStatusToUi(apiStatus) {
    switch (apiStatus) {
      case "ACTIVE":
        return "active";
      case "INACTIVE":
        return "inactive";
      case "SUSPENDED":
        return "degraded";
      case "ARCHIVED":
        return "inactive";
      default:
        return "inactive";
    }
  }
  mapUiStatusToApi(uiStatus) {
    switch (uiStatus) {
      case "active":
        return "ACTIVE";
      case "inactive":
        return "INACTIVE";
      case "degraded":
        return "SUSPENDED";
      default:
        return "INACTIVE";
    }
  }
  statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Degraded", value: "degraded" }
  ];
  dialogVisible = false;
  isEdit = false;
  form = __spreadValues({}, EMPTY_FORM);
  openAdd() {
    this.isEdit = false;
    this.form = __spreadValues({}, EMPTY_FORM);
    this.dialogVisible = true;
  }
  openEdit(partner) {
    this.isEdit = true;
    const { id, name, slug, status, eventTypes, activeMappings, dlqCount, contactEmail, description } = partner;
    this.form = { id, name, slug, status, eventTypes, activeMappings, dlqCount, contactEmail, description };
    this.dialogVisible = true;
  }
  onNameInput() {
    if (!this.isEdit || !this.form.slug.trim()) {
      this.form.slug = this.slugify(this.form.name);
    }
  }
  save() {
    if (!this.formValid) {
      this.messageService.add({
        severity: "warn",
        summary: this.t("partners.toast.invalidTitle"),
        detail: this.t("partners.toast.invalidDetail")
      });
      return;
    }
    const slug = this.slugify(this.form.slug || this.form.name);
    const duplicate = this._partners().some((p) => p.slug === slug && p.id !== this.form.id);
    if (duplicate) {
      this.messageService.add({
        severity: "warn",
        summary: this.t("partners.toast.duplicateTitle"),
        detail: slug
      });
      return;
    }
    if (this.isEdit && this.form.id) {
      this.partnerService.update(this.form.id, {
        name: this.form.name.trim(),
        status: this.mapUiStatusToApi(this.form.status),
        description: this.form.description.trim()
      }).subscribe({
        next: () => {
          this.messageService.add({ severity: "success", summary: this.t("partners.toast.updated"), detail: this.form.name });
          this.loadPartners();
          this.dialogVisible = false;
        },
        error: (error) => {
          console.error("Failed to update partner:", error);
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update partner"
          });
        }
      });
    } else {
      this.partnerService.create({
        external_id: slug,
        name: this.form.name.trim(),
        status: this.mapUiStatusToApi(this.form.status),
        description: this.form.description.trim()
      }).subscribe({
        next: () => {
          this.messageService.add({ severity: "success", summary: this.t("partners.toast.onboarded"), detail: this.form.name });
          this.loadPartners();
          this.dialogVisible = false;
        },
        error: (error) => {
          console.error("Failed to create partner:", error);
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to create partner"
          });
        }
      });
    }
  }
  confirmDelete(partner, event) {
    this.confirmationService.confirm({
      target: event.target,
      message: this.t("partners.deleteMessage", { name: partner.name }),
      header: this.t("partners.deleteTitle"),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: this.t("partners.delete"),
      rejectLabel: this.t("partners.cancel"),
      accept: () => {
        this.partnerService.delete(partner.id).subscribe({
          next: () => {
            this.loadPartners();
            this.messageService.add({ severity: "warn", summary: this.t("partners.toast.deleted"), detail: partner.name });
          },
          error: (error) => {
            console.error("Failed to delete partner:", error);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete partner"
            });
          }
        });
      }
    });
  }
  getSeverity(status) {
    const map = {
      active: "success",
      degraded: "warn",
      inactive: "secondary"
    };
    return map[status] ?? "secondary";
  }
  getInitials(name) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  get formValid() {
    return !!this.form.name.trim() && !!this.form.slug.trim();
  }
  slugify(value) {
    return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
  }
  t(key, params) {
    return this.i18n.translate(key, params);
  }
  static \u0275fac = function PartnersComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _PartnersComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _PartnersComponent, selectors: [["app-partners"]], features: [\u0275\u0275ProvidersFeature([ConfirmationService, MessageService])], decls: 76, vars: 66, consts: [[1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "page-actions"], ["icon", "pi pi-plus", 3, "onClick", "label"], [1, "partner-summary"], ["styleClass", "p-datatable-sm", 3, "value"], ["pTemplate", "header"], ["pTemplate", "body"], [3, "visibleChange", "visible", "modal", "draggable", "header"], [1, "partner-form-grid"], [1, "field"], ["pInputText", "", "autocomplete", "off", 3, "ngModelChange", "ngModel"], ["optionLabel", "label", "optionValue", "value", "appendTo", "body", 3, "ngModelChange", "options", "ngModel"], ["inputStyleClass", "w-full", 3, "ngModelChange", "ngModel", "min", "showButtons"], [1, "field", "field-wide"], ["pTextarea", "", "rows", "4", 3, "ngModelChange", "ngModel"], ["pTemplate", "footer"], [2, "text-align", "center"], [2, "width", "120px"], [1, "partner-cell"], ["shape", "circle", "styleClass", "partner-avatar", 3, "label"], [1, "partner-name"], [1, "partner-slug"], [3, "severity", "value"], [1, "dlq-badge"], [1, "text-color-secondary"], [1, "text-sm"], [1, "text-sm", "text-color-secondary"], [1, "row-actions"], ["icon", "pi pi-pencil", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-trash", "variant", "text", "severity", "danger", "size", "small", 3, "onClick", "pTooltip"], ["severity", "secondary", "variant", "outlined", 3, "onClick", "label"], ["icon", "pi pi-check", 3, "onClick", "label", "disabled"]], template: function PartnersComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "p-toast")(1, "p-confirmDialog");
      \u0275\u0275elementStart(2, "div", 0)(3, "div")(4, "h1", 1);
      \u0275\u0275text(5);
      \u0275\u0275pipe(6, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "p", 2);
      \u0275\u0275text(8);
      \u0275\u0275pipe(9, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(10, "div", 3)(11, "p-button", 4);
      \u0275\u0275pipe(12, "i18n");
      \u0275\u0275listener("onClick", function PartnersComponent_Template_p_button_onClick_11_listener() {
        return ctx.openAdd();
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(13, "div", 5)(14, "article")(15, "span");
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
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(32, "p-card")(33, "p-table", 6);
      \u0275\u0275template(34, PartnersComponent_ng_template_34_Template, 23, 21, "ng-template", 7)(35, PartnersComponent_ng_template_35_Template, 30, 19, "ng-template", 8);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(36, "p-dialog", 9);
      \u0275\u0275pipe(37, "i18n");
      \u0275\u0275pipe(38, "i18n");
      \u0275\u0275twoWayListener("visibleChange", function PartnersComponent_Template_p_dialog_visibleChange_36_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.dialogVisible, $event) || (ctx.dialogVisible = $event);
        return $event;
      });
      \u0275\u0275elementStart(39, "div", 10)(40, "label", 11)(41, "span");
      \u0275\u0275text(42);
      \u0275\u0275pipe(43, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(44, "input", 12);
      \u0275\u0275twoWayListener("ngModelChange", function PartnersComponent_Template_input_ngModelChange_44_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.name, $event) || (ctx.form.name = $event);
        return $event;
      });
      \u0275\u0275listener("ngModelChange", function PartnersComponent_Template_input_ngModelChange_44_listener() {
        return ctx.onNameInput();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(45, "label", 11)(46, "span");
      \u0275\u0275text(47);
      \u0275\u0275pipe(48, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(49, "input", 12);
      \u0275\u0275twoWayListener("ngModelChange", function PartnersComponent_Template_input_ngModelChange_49_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.slug, $event) || (ctx.form.slug = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(50, "label", 11)(51, "span");
      \u0275\u0275text(52);
      \u0275\u0275pipe(53, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "p-select", 13);
      \u0275\u0275twoWayListener("ngModelChange", function PartnersComponent_Template_p_select_ngModelChange_54_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.status, $event) || (ctx.form.status = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(55, "label", 11)(56, "span");
      \u0275\u0275text(57);
      \u0275\u0275pipe(58, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(59, "input", 12);
      \u0275\u0275twoWayListener("ngModelChange", function PartnersComponent_Template_input_ngModelChange_59_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.contactEmail, $event) || (ctx.form.contactEmail = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(60, "label", 11)(61, "span");
      \u0275\u0275text(62);
      \u0275\u0275pipe(63, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(64, "p-inputNumber", 14);
      \u0275\u0275twoWayListener("ngModelChange", function PartnersComponent_Template_p_inputNumber_ngModelChange_64_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.eventTypes, $event) || (ctx.form.eventTypes = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(65, "label", 11)(66, "span");
      \u0275\u0275text(67);
      \u0275\u0275pipe(68, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(69, "p-inputNumber", 14);
      \u0275\u0275twoWayListener("ngModelChange", function PartnersComponent_Template_p_inputNumber_ngModelChange_69_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.activeMappings, $event) || (ctx.form.activeMappings = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(70, "label", 15)(71, "span");
      \u0275\u0275text(72);
      \u0275\u0275pipe(73, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(74, "textarea", 16);
      \u0275\u0275twoWayListener("ngModelChange", function PartnersComponent_Template_textarea_ngModelChange_74_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.form.description, $event) || (ctx.form.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(75, PartnersComponent_ng_template_75_Template, 5, 9, "ng-template", 17);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 35, "partners.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 37, "partners.subtitle"));
      \u0275\u0275advance(3);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(12, 39, "partners.onboard"));
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(17, 41, "partners.summary.total"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.partners().length);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(23, 43, "partners.summary.active"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.activeCount());
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(29, 45, "partners.summary.mappings"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.totalMappings());
      \u0275\u0275advance(2);
      \u0275\u0275property("value", ctx.partners());
      \u0275\u0275advance(3);
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(65, _c0));
      \u0275\u0275twoWayProperty("visible", ctx.dialogVisible);
      \u0275\u0275property("modal", true)("draggable", false)("header", ctx.isEdit ? \u0275\u0275pipeBind1(37, 47, "partners.dialog.editTitle") : \u0275\u0275pipeBind1(38, 49, "partners.dialog.addTitle"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(43, 51, "partners.form.name"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.name);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(48, 53, "partners.form.slug"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.slug);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(53, 55, "partners.form.status"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.statusOptions);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.status);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(58, 57, "partners.form.contactEmail"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.contactEmail);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(63, 59, "partners.form.eventTypes"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.eventTypes);
      \u0275\u0275property("min", 0)("showButtons", true);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(68, 61, "partners.form.activeMappings"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.activeMappings);
      \u0275\u0275property("min", 0)("showButtons", true);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(73, 63, "partners.form.description"));
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.form.description);
    }
  }, dependencies: [FormsModule, DefaultValueAccessor, NgControlStatus, NgModel, AvatarModule, Avatar, PrimeTemplate, ButtonModule, Button, CardModule, Card, ConfirmDialogModule, ConfirmDialog, DialogModule, Dialog, InputNumberModule, InputNumber, InputTextModule, InputText, SelectModule, Select, TableModule, Table, TagModule, Tag, TextareaModule, Textarea, ToastModule, Toast, TooltipModule, Tooltip, I18nPipe], styles: ["\n.partner-summary[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 1rem;\n  margin-bottom: 1rem;\n}\n.partner-summary[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-card);\n  padding: 1rem;\n}\n.partner-summary[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: block;\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.partner-summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 0.35rem;\n  color: var(--text-color);\n  font-size: 1.65rem;\n  line-height: 1;\n}\n.partner-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n[_nghost-%COMP%]     .partner-avatar {\n  width: 36px !important;\n  height: 36px !important;\n  font-size: 0.75rem !important;\n  background:\n    linear-gradient(\n      135deg,\n      var(--primary-color),\n      var(--primary-800, #7c3aed)) !important;\n  color: #fff !important;\n  font-weight: 600 !important;\n  flex-shrink: 0;\n}\n.partner-name[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 600;\n  color: var(--text-color);\n}\n.partner-cell[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 0.15rem;\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n}\n.partner-slug[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  background: none;\n  padding: 0;\n}\n.dlq-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  background: color-mix(in srgb, var(--red-500, #ef4444) 12%, var(--surface-card));\n  color: var(--red-600, #dc2626);\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 1px 8px;\n  border-radius: 999px;\n}\n.row-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.125rem;\n  justify-content: flex-end;\n}\n.partner-form-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1rem;\n}\n.field[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.45rem;\n}\n.field[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color);\n  font-size: 0.85rem;\n  font-weight: 700;\n}\n.field-wide[_ngcontent-%COMP%] {\n  grid-column: 1/-1;\n}\n.field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  min-height: 7rem;\n  resize: vertical;\n}\n@media (max-width: 720px) {\n  .partner-summary[_ngcontent-%COMP%], \n   .partner-form-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=partners.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PartnersComponent, [{
    type: Component,
    args: [{ selector: "app-partners", standalone: true, imports: [
      FormsModule,
      AvatarModule,
      ButtonModule,
      CardModule,
      ConfirmDialogModule,
      DialogModule,
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
    <h1 class="page-title">{{ 'partners.title' | i18n }}</h1>
    <p class="page-subtitle">{{ 'partners.subtitle' | i18n }}</p>
  </div>
  <div class="page-actions">
    <p-button [label]="'partners.onboard' | i18n" icon="pi pi-plus" (onClick)="openAdd()" />
  </div>
</div>

<div class="partner-summary">
  <article>
    <span>{{ 'partners.summary.total' | i18n }}</span>
    <strong>{{ partners().length }}</strong>
  </article>
  <article>
    <span>{{ 'partners.summary.active' | i18n }}</span>
    <strong>{{ activeCount() }}</strong>
  </article>
  <article>
    <span>{{ 'partners.summary.mappings' | i18n }}</span>
    <strong>{{ totalMappings() }}</strong>
  </article>
</div>

<p-card>
  <p-table [value]="partners()" styleClass="p-datatable-sm">
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'partners.colPartner' | i18n }}</th>
        <th>{{ 'partners.colStatus' | i18n }}</th>
        <th style="text-align:center">{{ 'partners.colEvents' | i18n }}</th>
        <th style="text-align:center">{{ 'partners.colMappings' | i18n }}</th>
        <th style="text-align:center">{{ 'partners.colDlq' | i18n }}</th>
        <th>{{ 'partners.colThroughput' | i18n }}</th>
        <th>{{ 'partners.colLastSeen' | i18n }}</th>
        <th style="width:120px"></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-p>
      <tr>
        <td>
          <div class="partner-cell">
            <p-avatar [label]="getInitials(p.name)" shape="circle" styleClass="partner-avatar" />
            <div>
              <div class="partner-name">{{ p.name }}</div>
              <code class="partner-slug">{{ p.slug }}</code>
              @if (p.contactEmail) {
                <small>{{ p.contactEmail }}</small>
              }
            </div>
          </div>
        </td>
        <td>
          <p-tag [severity]="getSeverity(p.status)" [value]="('partners.status.' + p.status) | i18n" />
        </td>
        <td style="text-align:center">{{ p.eventTypes }}</td>
        <td style="text-align:center">{{ p.activeMappings }}</td>
        <td style="text-align:center">
          @if (p.dlqCount > 0) {
            <span class="dlq-badge">{{ p.dlqCount }}</span>
          } @else {
            <span class="text-color-secondary">\u2014</span>
          }
        </td>
        <td class="text-sm">{{ p.throughput }}</td>
        <td class="text-sm text-color-secondary">{{ p.lastSeen }}</td>
        <td>
          <div class="row-actions">
            <p-button
              icon="pi pi-pencil"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="openEdit(p)"
              [pTooltip]="'partners.edit' | i18n" />
            <p-button
              icon="pi pi-trash"
              variant="text"
              severity="danger"
              size="small"
              (onClick)="confirmDelete(p, $event)"
              [pTooltip]="'partners.delete' | i18n" />
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</p-card>

<p-dialog
  [(visible)]="dialogVisible"
  [modal]="true"
  [draggable]="false"
  [style]="{ width: 'min(42rem, calc(100vw - 2rem))' }"
  [header]="isEdit ? ('partners.dialog.editTitle' | i18n) : ('partners.dialog.addTitle' | i18n)">
  <div class="partner-form-grid">
    <label class="field">
      <span>{{ 'partners.form.name' | i18n }}</span>
      <input pInputText [(ngModel)]="form.name" (ngModelChange)="onNameInput()" autocomplete="off" />
    </label>
    <label class="field">
      <span>{{ 'partners.form.slug' | i18n }}</span>
      <input pInputText [(ngModel)]="form.slug" autocomplete="off" />
    </label>
    <label class="field">
      <span>{{ 'partners.form.status' | i18n }}</span>
      <p-select [options]="statusOptions" optionLabel="label" optionValue="value" [(ngModel)]="form.status" appendTo="body" />
    </label>
    <label class="field">
      <span>{{ 'partners.form.contactEmail' | i18n }}</span>
      <input pInputText [(ngModel)]="form.contactEmail" autocomplete="off" />
    </label>
    <label class="field">
      <span>{{ 'partners.form.eventTypes' | i18n }}</span>
      <p-inputNumber [(ngModel)]="form.eventTypes" [min]="0" [showButtons]="true" inputStyleClass="w-full" />
    </label>
    <label class="field">
      <span>{{ 'partners.form.activeMappings' | i18n }}</span>
      <p-inputNumber [(ngModel)]="form.activeMappings" [min]="0" [showButtons]="true" inputStyleClass="w-full" />
    </label>
    <label class="field field-wide">
      <span>{{ 'partners.form.description' | i18n }}</span>
      <textarea pTextarea [(ngModel)]="form.description" rows="4"></textarea>
    </label>
  </div>

  <ng-template pTemplate="footer">
    <p-button [label]="'partners.cancel' | i18n" severity="secondary" variant="outlined" (onClick)="dialogVisible = false" />
    <p-button [label]="isEdit ? ('partners.save' | i18n) : ('partners.onboard' | i18n)" icon="pi pi-check" [disabled]="!formValid" (onClick)="save()" />
  </ng-template>
</p-dialog>
`, styles: ["/* src/app/pages/partners/partners.component.scss */\n.partner-summary {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 1rem;\n  margin-bottom: 1rem;\n}\n.partner-summary article {\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-card);\n  padding: 1rem;\n}\n.partner-summary span {\n  display: block;\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.partner-summary strong {\n  display: block;\n  margin-top: 0.35rem;\n  color: var(--text-color);\n  font-size: 1.65rem;\n  line-height: 1;\n}\n.partner-cell {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n:host ::ng-deep .partner-avatar {\n  width: 36px !important;\n  height: 36px !important;\n  font-size: 0.75rem !important;\n  background:\n    linear-gradient(\n      135deg,\n      var(--primary-color),\n      var(--primary-800, #7c3aed)) !important;\n  color: #fff !important;\n  font-weight: 600 !important;\n  flex-shrink: 0;\n}\n.partner-name {\n  font-size: 0.875rem;\n  font-weight: 600;\n  color: var(--text-color);\n}\n.partner-cell small {\n  display: block;\n  margin-top: 0.15rem;\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n}\n.partner-slug {\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  background: none;\n  padding: 0;\n}\n.dlq-badge {\n  display: inline-block;\n  background: color-mix(in srgb, var(--red-500, #ef4444) 12%, var(--surface-card));\n  color: var(--red-600, #dc2626);\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 1px 8px;\n  border-radius: 999px;\n}\n.row-actions {\n  display: flex;\n  gap: 0.125rem;\n  justify-content: flex-end;\n}\n.partner-form-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1rem;\n}\n.field {\n  display: grid;\n  gap: 0.45rem;\n}\n.field span {\n  color: var(--text-color);\n  font-size: 0.85rem;\n  font-weight: 700;\n}\n.field-wide {\n  grid-column: 1/-1;\n}\n.field textarea {\n  min-height: 7rem;\n  resize: vertical;\n}\n@media (max-width: 720px) {\n  .partner-summary,\n  .partner-form-grid {\n    grid-template-columns: 1fr;\n  }\n}\n/*# sourceMappingURL=partners.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(PartnersComponent, { className: "PartnersComponent", filePath: "src/app/pages/partners/partners.component.ts", lineNumber: 72 });
})();
export {
  PartnersComponent
};
//# sourceMappingURL=chunk-3V2Z5AZ7.js.map
