import {
  ThemeService
} from "./chunk-ZD7UXYGT.js";
import {
  Message,
  MessageModule
} from "./chunk-FZFJ3GIG.js";
import {
  AuthService
} from "./chunk-XNF256NJ.js";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet
} from "./chunk-CN6J73SX.js";
import {
  Avatar,
  AvatarModule
} from "./chunk-H2OUYG5I.js";
import {
  Toast,
  ToastModule
} from "./chunk-IWXISTMZ.js";
import "./chunk-BYX7PGOZ.js";
import {
  Dialog,
  DialogModule
} from "./chunk-7IHEPO3A.js";
import {
  Tag,
  TagModule
} from "./chunk-ILW3Q6D6.js";
import {
  FormsModule,
  MotionDirective,
  MotionModule,
  NgControlStatus,
  NgModel,
  Select,
  SelectModule
} from "./chunk-Z342JBET.js";
import {
  I18nPipe
} from "./chunk-JHIHXCEC.js";
import {
  Badge,
  BadgeModule,
  BaseComponent,
  Bind,
  BindModule,
  Button,
  ButtonDirective,
  ButtonModule,
  ConnectedOverlayScrollHandler,
  PARENT_INSTANCE,
  Ripple,
  Tooltip,
  TooltipModule,
  s,
  zindexutils
} from "./chunk-LABWMPEG.js";
import {
  I18nService
} from "./chunk-5RXXWD5O.js";
import {
  DomSanitizer,
  environment
} from "./chunk-FA3B2YOI.js";
import {
  BaseStyle,
  CommonModule,
  MessageService,
  NgForOf,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
  OverlayService,
  PrimeTemplate,
  SharedModule,
  T,
  V2 as V,
  Y,
  Yt,
  Z,
  bt,
  isPlatformBrowser,
  ut
} from "./chunk-OGO5ZH5D.js";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  Output,
  PLATFORM_ID,
  Pipe,
  Subject,
  ViewChild,
  ViewEncapsulation,
  __spreadValues,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  setClassMetadata,
  signal,
  viewChild,
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
  ɵɵdefinePipe,
  ɵɵdirectiveInject,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵqueryAdvance,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵsanitizeUrl,
  ɵɵstyleMap,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty,
  ɵɵviewQuerySignal
} from "./chunk-KLG77GLC.js";

// src/app/layout/sidebar/sidebar.component.ts
var _c0 = (a0) => ({ exact: a0 });
var _forTrack0 = ($index, $item) => $item.labelKey;
var _forTrack1 = ($index, $item) => $item.route;
function SidebarComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 6)(1, "span", 8);
    \u0275\u0275text(2, "CanonBridge");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 9);
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "i18n");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 1, "sidebar.logoSub"));
  }
}
function SidebarComponent_Conditional_7_For_2_Conditional_7_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275attribute("aria-label", item_r4.badge + " notifications");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r4.badge);
  }
}
function SidebarComponent_Conditional_7_For_2_Conditional_7_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 18);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275elementStart(2, "span", 19);
    \u0275\u0275element(3, "i", 16);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 20);
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(7, SidebarComponent_Conditional_7_For_2_Conditional_7_For_2_Conditional_7_Template, 2, 2, "span", 21);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275property("routerLink", item_r4.route)("routerLinkActiveOptions", \u0275\u0275pureFunction1(12, _c0, item_r4.route === "/dashboard"));
    \u0275\u0275attribute("aria-label", \u0275\u0275pipeBind1(1, 8, item_r4.labelKey))("aria-current", ctx_r2.isActive(item_r4.route) ? "page" : null);
    \u0275\u0275advance(3);
    \u0275\u0275classMap(item_r4.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 10, item_r4.labelKey));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(item_r4.badge ? 7 : -1);
  }
}
function SidebarComponent_Conditional_7_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275repeaterCreate(1, SidebarComponent_Conditional_7_For_2_Conditional_7_For_2_Template, 8, 14, "a", 18, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const group_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(group_r2.items);
  }
}
function SidebarComponent_Conditional_7_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "section", 11);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275elementStart(2, "button", 15);
    \u0275\u0275listener("click", function SidebarComponent_Conditional_7_For_2_Template_button_click_2_listener() {
      const group_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleSection(group_r2.labelKey));
    });
    \u0275\u0275element(3, "i", 16);
    \u0275\u0275elementStart(4, "span");
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "i18n");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(7, SidebarComponent_Conditional_7_For_2_Conditional_7_Template, 3, 0, "div", 17);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const group_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275attribute("aria-label", \u0275\u0275pipeBind1(1, 6, group_r2.labelKey));
    \u0275\u0275advance(2);
    \u0275\u0275attribute("aria-expanded", !ctx_r2.isSectionCollapsed(group_r2.labelKey));
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r2.isSectionCollapsed(group_r2.labelKey) ? "pi pi-chevron-right" : "pi pi-chevron-down");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 8, group_r2.labelKey));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(!ctx_r2.isSectionCollapsed(group_r2.labelKey) ? 7 : -1);
  }
}
function SidebarComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "nav", 10);
    \u0275\u0275repeaterCreate(1, SidebarComponent_Conditional_7_For_2_Template, 8, 10, "section", 11, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 12);
    \u0275\u0275element(4, "span", 13);
    \u0275\u0275elementStart(5, "span", 14)(6, "strong");
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span");
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "i18n");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.navGroups());
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(((tmp_2_0 = ctx_r2.auth.currentUser()) == null ? null : tmp_2_0.tenantName) ?? \u0275\u0275pipeBind1(8, 2, "sidebar.logoSub"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 4, "sidebar.logoSub"));
  }
}
function SidebarComponent_Conditional_8_For_2_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275attribute("aria-label", item_r5.badge + " notifications");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r5.badge);
  }
}
function SidebarComponent_Conditional_8_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 22);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275pipe(2, "i18n");
    \u0275\u0275element(3, "i", 16);
    \u0275\u0275conditionalCreate(4, SidebarComponent_Conditional_8_For_2_Conditional_4_Template, 2, 2, "span", 23);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("routerLink", item_r5.route)("routerLinkActiveOptions", \u0275\u0275pureFunction1(12, _c0, item_r5.route === "/dashboard"))("pTooltip", \u0275\u0275pipeBind1(1, 8, item_r5.labelKey));
    \u0275\u0275attribute("aria-label", \u0275\u0275pipeBind1(2, 10, item_r5.labelKey))("aria-current", ctx_r2.isActive(item_r5.route) ? "page" : null);
    \u0275\u0275advance(3);
    \u0275\u0275classMap(item_r5.icon);
    \u0275\u0275advance();
    \u0275\u0275conditional(item_r5.badge ? 4 : -1);
  }
}
function SidebarComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "nav", 7);
    \u0275\u0275repeaterCreate(1, SidebarComponent_Conditional_8_For_2_Template, 5, 14, "a", 22, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.iconNavItems());
  }
}
var PRIMARY_NAV = [
  { route: "/dashboard", icon: "pi pi-home", labelKey: "nav.dashboard" },
  { route: "/mappings", icon: "pi pi-directions", labelKey: "nav.mappings" },
  { route: "/partners", icon: "pi pi-building", labelKey: "nav.partners" },
  { route: "/external-systems", icon: "pi pi-cloud", labelKey: "nav.externalSystems" },
  { route: "/schemas", icon: "pi pi-database", labelKey: "nav.schemas" },
  {
    route: "/dlq",
    icon: "pi pi-exclamation-triangle",
    labelKey: "nav.dlq"
  },
  { route: "/monitoring", icon: "pi pi-chart-line", labelKey: "nav.monitoring" },
  { route: "/audit", icon: "pi pi-shield", labelKey: "nav.audit", roles: ["admin", "operator"] }
];
var SECONDARY_NAV = [
  { route: "/tenant", icon: "pi pi-building", labelKey: "nav.tenant", roles: ["admin"] },
  { route: "/billing", icon: "pi pi-credit-card", labelKey: "nav.billing", roles: ["admin"] },
  { route: "/settings", icon: "pi pi-cog", labelKey: "nav.settings", roles: ["admin", "operator"] }
];
var SidebarComponent = class _SidebarComponent {
  router = inject(Router);
  auth = inject(AuthService);
  theme = inject(ThemeService);
  collapsed = false;
  collapsedSections = /* @__PURE__ */ new Set();
  /** Filter nav items based on user role */
  filterByRole(items) {
    const role = this.auth.userRole();
    return items.filter((item) => !item.roles || role && item.roles.includes(role));
  }
  navGroups = computed(() => [
    {
      labelKey: "sidebar.menuGroup",
      items: this.filterByRole(PRIMARY_NAV)
    },
    {
      labelKey: "sidebar.preferencesGroup",
      items: this.filterByRole(SECONDARY_NAV)
    }
  ], ...ngDevMode ? [{ debugName: "navGroups" }] : (
    /* istanbul ignore next */
    []
  ));
  iconNavItems = computed(() => [
    ...this.filterByRole(PRIMARY_NAV),
    ...this.filterByRole(SECONDARY_NAV)
  ], ...ngDevMode ? [{ debugName: "iconNavItems" }] : (
    /* istanbul ignore next */
    []
  ));
  isActive(route) {
    return this.router.url === route;
  }
  toggleSection(labelKey) {
    if (this.collapsedSections.has(labelKey)) {
      this.collapsedSections.delete(labelKey);
    } else {
      this.collapsedSections.add(labelKey);
    }
  }
  isSectionCollapsed(labelKey) {
    return this.collapsedSections.has(labelKey);
  }
  static \u0275fac = function SidebarComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SidebarComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SidebarComponent, selectors: [["app-sidebar"]], inputs: { collapsed: "collapsed" }, decls: 9, vars: 4, consts: [["role", "complementary", "aria-label", "Sidebar navigation", 1, "layout-sidebar"], [1, "layout-sidebar-frame"], [1, "layout-sidebar-header"], ["routerLink", "/mappings", "aria-label", "CanonBridge Mapping Studio - Go to home", 1, "layout-sidebar-brand"], ["aria-hidden", "true", 1, "layout-sidebar-logo"], ["src", "img/canonbridge-logo.svg", "alt", "", 1, "layout-sidebar-logo-img"], [1, "layout-sidebar-titles"], ["id", "primary-navigation", "role", "navigation", "aria-label", "Primary navigation", 1, "layout-sidebar-rail"], [1, "layout-sidebar-title"], [1, "layout-sidebar-sub"], ["id", "primary-navigation", "role", "navigation", "aria-label", "Primary navigation", 1, "layout-sidebar-nav"], ["role", "group", 1, "layout-nav-section"], ["role", "contentinfo", 1, "layout-sidebar-footer"], ["aria-hidden", "true", 1, "layout-sidebar-status-dot"], [1, "layout-sidebar-footer-copy"], ["type", "button", 1, "layout-nav-section-title", 3, "click"], ["aria-hidden", "true"], ["role", "list", 1, "layout-nav-list"], ["role", "listitem", "routerLinkActive", "layout-nav-item--active", 1, "layout-nav-item", 3, "routerLink", "routerLinkActiveOptions"], ["aria-hidden", "true", 1, "layout-nav-item__icon"], [1, "layout-nav-item__label"], [1, "layout-nav-item__badge"], ["routerLinkActive", "layout-rail-item--active", "tooltipPosition", "right", 1, "layout-rail-item", 3, "routerLink", "routerLinkActiveOptions", "pTooltip"], [1, "layout-rail-item__badge"]], template: function SidebarComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "aside", 0)(1, "div", 1)(2, "div", 2)(3, "a", 3)(4, "span", 4);
      \u0275\u0275element(5, "img", 5);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(6, SidebarComponent_Conditional_6_Template, 6, 3, "span", 6);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(7, SidebarComponent_Conditional_7_Template, 12, 6)(8, SidebarComponent_Conditional_8_Template, 3, 0, "nav", 7);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275classProp("layout-sidebar-collapsed", ctx.collapsed);
      \u0275\u0275advance(6);
      \u0275\u0275conditional(!ctx.collapsed ? 6 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.collapsed ? 7 : 8);
    }
  }, dependencies: [RouterModule, RouterLink, RouterLinkActive, TooltipModule, Tooltip, I18nPipe], styles: ['@charset "UTF-8";\n\n\n.layout-sidebar[_ngcontent-%COMP%] {\n  --sidebar-bg: var(--surface-50, #f8fafc);\n  --sidebar-bg-2: var(--surface-100, #eef4fb);\n  --sidebar-border: rgba(148, 163, 184, 0.28);\n  --sidebar-text: var(--text-color, #0f172a);\n  --sidebar-muted: var(--text-color-secondary, #64748b);\n  --sidebar-soft: rgba(15, 23, 42, 0.055);\n  --sidebar-soft-hover: rgba(15, 23, 42, 0.08);\n  --sidebar-active-bg: var(--primary-color, #0f766e);\n  --sidebar-active-text: #ffffff;\n  --sidebar-active-icon: var(--primary-100, #ccfbf1);\n  --sidebar-focus: color-mix(in srgb, var(--primary-color, #14b8a6) 32%, transparent);\n  position: fixed;\n  inset: 0 auto 0 0;\n  width: 280px;\n  z-index: 110;\n  padding: 0.75rem;\n  background:\n    radial-gradient(\n      circle at 20% 0%,\n      color-mix(in srgb, var(--primary-300, #5eead4) 16%, transparent),\n      transparent 28rem),\n    linear-gradient(\n      180deg,\n      var(--sidebar-bg),\n      var(--sidebar-bg-2));\n  border-right: 1px solid var(--sidebar-border);\n  box-shadow: 1px 0 4px rgba(15, 23, 42, 0.06);\n  color: var(--sidebar-text);\n  transition: width 0.2s ease, padding 0.2s ease;\n}\n.dark-mode[_nghost-%COMP%]   .layout-sidebar[_ngcontent-%COMP%], .dark-mode   [_nghost-%COMP%]   .layout-sidebar[_ngcontent-%COMP%], \nhtml.dark-mode[_ngcontent-%COMP%]   .layout-sidebar[_ngcontent-%COMP%] {\n  --sidebar-bg: var(--surface-900, #070b12);\n  --sidebar-bg-2: var(--surface-800, #101722);\n  --sidebar-border: rgba(148, 163, 184, 0.16);\n  --sidebar-text: var(--text-color, #f8fafc);\n  --sidebar-muted: var(--text-color-secondary, #94a3b8);\n  --sidebar-soft: rgba(148, 163, 184, 0.08);\n  --sidebar-soft-hover: rgba(148, 163, 184, 0.13);\n  --sidebar-active-bg: var(--primary-color, #0f766e);\n  --sidebar-active-text: #ffffff;\n  --sidebar-active-icon: var(--primary-100, #ccfbf1);\n  --sidebar-focus: color-mix(in srgb, var(--primary-color, #2dd4bf) 34%, transparent);\n  background:\n    radial-gradient(\n      circle at 20% 0%,\n      color-mix(in srgb, var(--primary-400, #2dd4bf) 22%, transparent),\n      transparent 21rem),\n    linear-gradient(\n      180deg,\n      var(--sidebar-bg),\n      var(--sidebar-bg-2));\n  box-shadow: 1px 0 6px rgba(0, 0, 0, 0.3);\n}\n.layout-sidebar-collapsed[_ngcontent-%COMP%] {\n  width: 4.5rem;\n  padding: 0.65rem 0.5rem;\n}\n.layout-sidebar-frame[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-height: 100%;\n  border-radius: 12px;\n  overflow: hidden;\n  background: var(--surface-card);\n  border: 1px solid var(--sidebar-border);\n}\n.dark-mode[_nghost-%COMP%]   .layout-sidebar-frame[_ngcontent-%COMP%], .dark-mode   [_nghost-%COMP%]   .layout-sidebar-frame[_ngcontent-%COMP%], \nhtml.dark-mode[_ngcontent-%COMP%]   .layout-sidebar-frame[_ngcontent-%COMP%] {\n  background: rgba(15, 23, 42, 0.72);\n  border-color: rgba(148, 163, 184, 0.13);\n}\n.layout-sidebar-header[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  padding: 0.95rem;\n}\n.layout-sidebar-brand[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  min-width: 0;\n  gap: 0.72rem;\n  color: inherit;\n  text-decoration: none;\n  outline: none;\n}\n.layout-sidebar-brand[_ngcontent-%COMP%]:focus-visible, \n.layout-nav-item[_ngcontent-%COMP%]:focus-visible, \n.layout-rail-item[_ngcontent-%COMP%]:focus-visible {\n  box-shadow: 0 0 0 3px var(--sidebar-focus);\n}\n.layout-sidebar-logo[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  height: 2.55rem;\n  flex: 0 0 auto;\n}\n.layout-sidebar-logo-img[_ngcontent-%COMP%] {\n  height: 2.55rem;\n  width: auto;\n  max-width: 9rem;\n  object-fit: contain;\n  display: block;\n}\n.layout-sidebar-titles[_ngcontent-%COMP%] {\n  display: grid;\n  min-width: 0;\n  gap: 0.1rem;\n}\n.layout-sidebar-title[_ngcontent-%COMP%] {\n  color: var(--sidebar-text);\n  font-family: var(--cb-font-display);\n  font-size: 1rem;\n  font-weight: 600;\n  line-height: 1.1;\n  letter-spacing: -0.01em;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.layout-sidebar-sub[_ngcontent-%COMP%] {\n  color: var(--sidebar-muted);\n  font-size: 0.68rem;\n  font-weight: 800;\n  line-height: 1.15;\n  letter-spacing: 0;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n.layout-sidebar-nav[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  padding: 0.1rem 0.75rem 0.75rem;\n  scrollbar-gutter: stable;\n}\n.layout-nav-section[_ngcontent-%COMP%]    + .layout-nav-section[_ngcontent-%COMP%] {\n  margin-top: 1.3rem;\n}\n.layout-nav-section-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  width: 100%;\n  min-height: 1.7rem;\n  padding: 0.25rem 0.35rem;\n  color: var(--sidebar-muted);\n  font-size: 0.68rem;\n  font-weight: 800;\n  font-family: inherit;\n  letter-spacing: 0;\n  text-transform: uppercase;\n  text-align: left;\n  cursor: pointer;\n  border: none;\n  border-radius: 6px;\n  background: transparent;\n  transition: background 0.15s ease;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.layout-nav-section-title[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.05);\n}\n.layout-nav-section-title[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  opacity: 0.8;\n  transition: transform 0.2s ease;\n}\n.layout-nav-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.32rem;\n  margin-top: 0.45rem;\n}\n.layout-nav-item[_ngcontent-%COMP%] {\n  position: relative;\n  display: grid;\n  grid-template-columns: 2.25rem minmax(0, 1fr) auto;\n  align-items: center;\n  min-height: 2.5rem;\n  padding: 0.32rem 0.62rem;\n  border-radius: 10px;\n  color: var(--sidebar-muted);\n  text-decoration: none;\n  border: 1px solid transparent;\n  transition:\n    background-color 0.16s ease,\n    border-color 0.16s ease,\n    color 0.16s ease,\n    transform 0.16s ease;\n}\n.layout-nav-item[_ngcontent-%COMP%]:hover {\n  color: var(--sidebar-text);\n  background: var(--sidebar-soft-hover);\n}\n.layout-nav-item--active[_ngcontent-%COMP%] {\n  color: var(--sidebar-active-text);\n  background: var(--sidebar-active-bg);\n  border-color: rgba(255, 255, 255, 0.18);\n  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);\n  transform: translateX(2px);\n}\n.dark-mode[_nghost-%COMP%]   .layout-nav-item--active[_ngcontent-%COMP%], .dark-mode   [_nghost-%COMP%]   .layout-nav-item--active[_ngcontent-%COMP%], \nhtml.dark-mode[_ngcontent-%COMP%]   .layout-nav-item--active[_ngcontent-%COMP%] {\n  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);\n}\n.layout-nav-item__icon[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 2rem;\n  height: 2rem;\n  border-radius: 8px;\n  color: inherit;\n  background: var(--sidebar-soft);\n}\n.layout-nav-item--active[_ngcontent-%COMP%]   .layout-nav-item__icon[_ngcontent-%COMP%] {\n  color: var(--sidebar-active-icon);\n  background: rgba(255, 255, 255, 0.16);\n}\n.dark-mode[_nghost-%COMP%]   .layout-nav-item--active[_ngcontent-%COMP%]   .layout-nav-item__icon[_ngcontent-%COMP%], .dark-mode   [_nghost-%COMP%]   .layout-nav-item--active[_ngcontent-%COMP%]   .layout-nav-item__icon[_ngcontent-%COMP%], \nhtml.dark-mode[_ngcontent-%COMP%]   .layout-nav-item--active[_ngcontent-%COMP%]   .layout-nav-item__icon[_ngcontent-%COMP%] {\n  background: rgba(15, 23, 42, 0.08);\n}\n.layout-nav-item__icon[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n.layout-nav-item__label[_ngcontent-%COMP%] {\n  min-width: 0;\n  color: inherit;\n  font-size: 0.93rem;\n  font-weight: 750;\n  line-height: 1.15;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.layout-nav-item__badge[_ngcontent-%COMP%], \n.layout-rail-item__badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 1.3rem;\n  height: 1.3rem;\n  border-radius: 999px;\n  padding: 0 0.35rem;\n  color: #ffffff;\n  background: #ef4444;\n  font-size: 0.68rem;\n  font-weight: 800;\n  line-height: 1;\n}\n.layout-sidebar-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.65rem;\n  margin: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 10px;\n  color: var(--sidebar-text);\n  background: var(--sidebar-soft);\n  border: 1px solid var(--sidebar-border);\n}\n.layout-sidebar-status-dot[_ngcontent-%COMP%] {\n  width: 0.58rem;\n  height: 0.58rem;\n  border-radius: 999px;\n  background: #22c55e;\n  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);\n}\n.layout-sidebar-footer-copy[_ngcontent-%COMP%] {\n  display: grid;\n  min-width: 0;\n  gap: 0.05rem;\n}\n.layout-sidebar-footer-copy[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  line-height: 1.15;\n}\n.layout-sidebar-footer-copy[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--sidebar-muted);\n  font-size: 0.7rem;\n  font-weight: 650;\n  line-height: 1.2;\n}\n.layout-sidebar-rail[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.45rem;\n  justify-items: center;\n  padding: 0.2rem 0.25rem 0.75rem;\n}\n.layout-sidebar-collapsed[_ngcontent-%COMP%]   .layout-sidebar-header[_ngcontent-%COMP%] {\n  padding: 0.65rem 0.25rem 0.85rem;\n}\n.layout-sidebar-collapsed[_ngcontent-%COMP%]   .layout-sidebar-brand[_ngcontent-%COMP%] {\n  justify-content: center;\n}\n.layout-sidebar-collapsed[_ngcontent-%COMP%]   .layout-sidebar-logo[_ngcontent-%COMP%] {\n  height: 2.65rem;\n  justify-content: center;\n}\n.layout-sidebar-collapsed[_ngcontent-%COMP%]   .layout-sidebar-logo-img[_ngcontent-%COMP%] {\n  height: 2.65rem;\n  max-width: 3.5rem;\n}\n.layout-rail-item[_ngcontent-%COMP%] {\n  position: relative;\n  display: grid;\n  place-items: center;\n  width: 2.75rem;\n  height: 2.75rem;\n  border-radius: 10px;\n  color: var(--sidebar-muted);\n  text-decoration: none;\n  border: 1px solid transparent;\n  background: transparent;\n  transition:\n    background-color 0.16s ease,\n    color 0.16s ease,\n    border-color 0.16s ease;\n}\n.layout-rail-item[_ngcontent-%COMP%]:hover {\n  color: var(--sidebar-text);\n  background: var(--sidebar-soft-hover);\n}\n.layout-rail-item--active[_ngcontent-%COMP%] {\n  color: var(--sidebar-active-text);\n  background: var(--sidebar-active-bg);\n}\n.layout-rail-item[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 1.05rem;\n}\n.layout-rail-item__badge[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -0.2rem;\n  right: -0.18rem;\n  min-width: 1.05rem;\n  height: 1.05rem;\n  padding: 0 0.2rem;\n  font-size: 0.58rem;\n}\n@media (max-width: 768px) {\n  .layout-sidebar[_ngcontent-%COMP%] {\n    transform: translateX(-100%);\n    transition: transform 0.25s ease;\n  }\n  .layout-sidebar[_ngcontent-%COMP%]:not(.layout-sidebar-collapsed) {\n    transform: translateX(0);\n  }\n  .layout-sidebar-collapsed[_ngcontent-%COMP%] {\n    transform: translateX(-100%);\n  }\n}\n/*# sourceMappingURL=sidebar.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SidebarComponent, [{
    type: Component,
    args: [{ selector: "app-sidebar", standalone: true, imports: [RouterModule, TooltipModule, I18nPipe], template: `<aside class="layout-sidebar" [class.layout-sidebar-collapsed]="collapsed" role="complementary" aria-label="Sidebar navigation">
  <div class="layout-sidebar-frame">
    <div class="layout-sidebar-header">
      <a class="layout-sidebar-brand" routerLink="/mappings" aria-label="CanonBridge Mapping Studio - Go to home">
        <span class="layout-sidebar-logo" aria-hidden="true">
          <img
            src="img/canonbridge-logo.svg"
            alt=""
            class="layout-sidebar-logo-img" />
        </span>
        @if (!collapsed) {
          <span class="layout-sidebar-titles">
            <span class="layout-sidebar-title">CanonBridge</span>
            <span class="layout-sidebar-sub">{{ 'sidebar.logoSub' | i18n }}</span>
          </span>
        }
      </a>
    </div>

    @if (!collapsed) {
      <nav id="primary-navigation" class="layout-sidebar-nav" role="navigation" aria-label="Primary navigation">
        @for (group of navGroups(); track group.labelKey) {
          <section class="layout-nav-section" role="group" [attr.aria-label]="group.labelKey | i18n">
            <button type="button" class="layout-nav-section-title" (click)="toggleSection(group.labelKey)" [attr.aria-expanded]="!isSectionCollapsed(group.labelKey)">
              <i [class]="isSectionCollapsed(group.labelKey) ? 'pi pi-chevron-right' : 'pi pi-chevron-down'" aria-hidden="true"></i>
              <span>{{ group.labelKey | i18n }}</span>
            </button>

            @if (!isSectionCollapsed(group.labelKey)) {
              <div class="layout-nav-list" role="list">
                @for (item of group.items; track item.route) {
                  <a
                    class="layout-nav-item"
                    role="listitem"
                    [routerLink]="item.route"
                    routerLinkActive="layout-nav-item--active"
                    [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                    [attr.aria-label]="item.labelKey | i18n"
                    [attr.aria-current]="isActive(item.route) ? 'page' : null">
                    <span class="layout-nav-item__icon" aria-hidden="true">
                      <i [class]="item.icon" aria-hidden="true"></i>
                    </span>
                    <span class="layout-nav-item__label">{{ item.labelKey | i18n }}</span>
                    @if (item.badge) {
                      <span class="layout-nav-item__badge" [attr.aria-label]="item.badge + ' notifications'">{{ item.badge }}</span>
                    }
                  </a>
                }
              </div>
            }
          </section>
        }
      </nav>

      <div class="layout-sidebar-footer" role="contentinfo">
        <span class="layout-sidebar-status-dot" aria-hidden="true"></span>
        <span class="layout-sidebar-footer-copy">
          <strong>{{ auth.currentUser()?.tenantName ?? ('sidebar.logoSub' | i18n) }}</strong>
          <span>{{ 'sidebar.logoSub' | i18n }}</span>
        </span>
      </div>
    } @else {
      <nav id="primary-navigation" class="layout-sidebar-rail" role="navigation" aria-label="Primary navigation">
        @for (item of iconNavItems(); track item.route) {
          <a
            class="layout-rail-item"
            [routerLink]="item.route"
            routerLinkActive="layout-rail-item--active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            [pTooltip]="item.labelKey | i18n"
            tooltipPosition="right"
            [attr.aria-label]="item.labelKey | i18n"
            [attr.aria-current]="isActive(item.route) ? 'page' : null">
            <i [class]="item.icon" aria-hidden="true"></i>
            @if (item.badge) {
              <span class="layout-rail-item__badge" [attr.aria-label]="item.badge + ' notifications'">{{ item.badge }}</span>
            }
          </a>
        }
      </nav>
    }
  </div>
</aside>
`, styles: ['@charset "UTF-8";\n\n/* src/app/layout/sidebar/sidebar.component.scss */\n.layout-sidebar {\n  --sidebar-bg: var(--surface-50, #f8fafc);\n  --sidebar-bg-2: var(--surface-100, #eef4fb);\n  --sidebar-border: rgba(148, 163, 184, 0.28);\n  --sidebar-text: var(--text-color, #0f172a);\n  --sidebar-muted: var(--text-color-secondary, #64748b);\n  --sidebar-soft: rgba(15, 23, 42, 0.055);\n  --sidebar-soft-hover: rgba(15, 23, 42, 0.08);\n  --sidebar-active-bg: var(--primary-color, #0f766e);\n  --sidebar-active-text: #ffffff;\n  --sidebar-active-icon: var(--primary-100, #ccfbf1);\n  --sidebar-focus: color-mix(in srgb, var(--primary-color, #14b8a6) 32%, transparent);\n  position: fixed;\n  inset: 0 auto 0 0;\n  width: 280px;\n  z-index: 110;\n  padding: 0.75rem;\n  background:\n    radial-gradient(\n      circle at 20% 0%,\n      color-mix(in srgb, var(--primary-300, #5eead4) 16%, transparent),\n      transparent 28rem),\n    linear-gradient(\n      180deg,\n      var(--sidebar-bg),\n      var(--sidebar-bg-2));\n  border-right: 1px solid var(--sidebar-border);\n  box-shadow: 1px 0 4px rgba(15, 23, 42, 0.06);\n  color: var(--sidebar-text);\n  transition: width 0.2s ease, padding 0.2s ease;\n}\n:host-context(.dark-mode) .layout-sidebar,\nhtml.dark-mode .layout-sidebar {\n  --sidebar-bg: var(--surface-900, #070b12);\n  --sidebar-bg-2: var(--surface-800, #101722);\n  --sidebar-border: rgba(148, 163, 184, 0.16);\n  --sidebar-text: var(--text-color, #f8fafc);\n  --sidebar-muted: var(--text-color-secondary, #94a3b8);\n  --sidebar-soft: rgba(148, 163, 184, 0.08);\n  --sidebar-soft-hover: rgba(148, 163, 184, 0.13);\n  --sidebar-active-bg: var(--primary-color, #0f766e);\n  --sidebar-active-text: #ffffff;\n  --sidebar-active-icon: var(--primary-100, #ccfbf1);\n  --sidebar-focus: color-mix(in srgb, var(--primary-color, #2dd4bf) 34%, transparent);\n  background:\n    radial-gradient(\n      circle at 20% 0%,\n      color-mix(in srgb, var(--primary-400, #2dd4bf) 22%, transparent),\n      transparent 21rem),\n    linear-gradient(\n      180deg,\n      var(--sidebar-bg),\n      var(--sidebar-bg-2));\n  box-shadow: 1px 0 6px rgba(0, 0, 0, 0.3);\n}\n.layout-sidebar-collapsed {\n  width: 4.5rem;\n  padding: 0.65rem 0.5rem;\n}\n.layout-sidebar-frame {\n  display: flex;\n  flex-direction: column;\n  min-height: 100%;\n  border-radius: 12px;\n  overflow: hidden;\n  background: var(--surface-card);\n  border: 1px solid var(--sidebar-border);\n}\n:host-context(.dark-mode) .layout-sidebar-frame,\nhtml.dark-mode .layout-sidebar-frame {\n  background: rgba(15, 23, 42, 0.72);\n  border-color: rgba(148, 163, 184, 0.13);\n}\n.layout-sidebar-header {\n  flex-shrink: 0;\n  padding: 0.95rem;\n}\n.layout-sidebar-brand {\n  display: flex;\n  align-items: center;\n  min-width: 0;\n  gap: 0.72rem;\n  color: inherit;\n  text-decoration: none;\n  outline: none;\n}\n.layout-sidebar-brand:focus-visible,\n.layout-nav-item:focus-visible,\n.layout-rail-item:focus-visible {\n  box-shadow: 0 0 0 3px var(--sidebar-focus);\n}\n.layout-sidebar-logo {\n  display: flex;\n  align-items: center;\n  height: 2.55rem;\n  flex: 0 0 auto;\n}\n.layout-sidebar-logo-img {\n  height: 2.55rem;\n  width: auto;\n  max-width: 9rem;\n  object-fit: contain;\n  display: block;\n}\n.layout-sidebar-titles {\n  display: grid;\n  min-width: 0;\n  gap: 0.1rem;\n}\n.layout-sidebar-title {\n  color: var(--sidebar-text);\n  font-family: var(--cb-font-display);\n  font-size: 1rem;\n  font-weight: 600;\n  line-height: 1.1;\n  letter-spacing: -0.01em;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.layout-sidebar-sub {\n  color: var(--sidebar-muted);\n  font-size: 0.68rem;\n  font-weight: 800;\n  line-height: 1.15;\n  letter-spacing: 0;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n.layout-sidebar-nav {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  padding: 0.1rem 0.75rem 0.75rem;\n  scrollbar-gutter: stable;\n}\n.layout-nav-section + .layout-nav-section {\n  margin-top: 1.3rem;\n}\n.layout-nav-section-title {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  width: 100%;\n  min-height: 1.7rem;\n  padding: 0.25rem 0.35rem;\n  color: var(--sidebar-muted);\n  font-size: 0.68rem;\n  font-weight: 800;\n  font-family: inherit;\n  letter-spacing: 0;\n  text-transform: uppercase;\n  text-align: left;\n  cursor: pointer;\n  border: none;\n  border-radius: 6px;\n  background: transparent;\n  transition: background 0.15s ease;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.layout-nav-section-title:hover {\n  background: rgba(255, 255, 255, 0.05);\n}\n.layout-nav-section-title i {\n  font-size: 0.72rem;\n  opacity: 0.8;\n  transition: transform 0.2s ease;\n}\n.layout-nav-list {\n  display: grid;\n  gap: 0.32rem;\n  margin-top: 0.45rem;\n}\n.layout-nav-item {\n  position: relative;\n  display: grid;\n  grid-template-columns: 2.25rem minmax(0, 1fr) auto;\n  align-items: center;\n  min-height: 2.5rem;\n  padding: 0.32rem 0.62rem;\n  border-radius: 10px;\n  color: var(--sidebar-muted);\n  text-decoration: none;\n  border: 1px solid transparent;\n  transition:\n    background-color 0.16s ease,\n    border-color 0.16s ease,\n    color 0.16s ease,\n    transform 0.16s ease;\n}\n.layout-nav-item:hover {\n  color: var(--sidebar-text);\n  background: var(--sidebar-soft-hover);\n}\n.layout-nav-item--active {\n  color: var(--sidebar-active-text);\n  background: var(--sidebar-active-bg);\n  border-color: rgba(255, 255, 255, 0.18);\n  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);\n  transform: translateX(2px);\n}\n:host-context(.dark-mode) .layout-nav-item--active,\nhtml.dark-mode .layout-nav-item--active {\n  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);\n}\n.layout-nav-item__icon {\n  display: grid;\n  place-items: center;\n  width: 2rem;\n  height: 2rem;\n  border-radius: 8px;\n  color: inherit;\n  background: var(--sidebar-soft);\n}\n.layout-nav-item--active .layout-nav-item__icon {\n  color: var(--sidebar-active-icon);\n  background: rgba(255, 255, 255, 0.16);\n}\n:host-context(.dark-mode) .layout-nav-item--active .layout-nav-item__icon,\nhtml.dark-mode .layout-nav-item--active .layout-nav-item__icon {\n  background: rgba(15, 23, 42, 0.08);\n}\n.layout-nav-item__icon i {\n  font-size: 1rem;\n}\n.layout-nav-item__label {\n  min-width: 0;\n  color: inherit;\n  font-size: 0.93rem;\n  font-weight: 750;\n  line-height: 1.15;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.layout-nav-item__badge,\n.layout-rail-item__badge {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 1.3rem;\n  height: 1.3rem;\n  border-radius: 999px;\n  padding: 0 0.35rem;\n  color: #ffffff;\n  background: #ef4444;\n  font-size: 0.68rem;\n  font-weight: 800;\n  line-height: 1;\n}\n.layout-sidebar-footer {\n  display: flex;\n  align-items: center;\n  gap: 0.65rem;\n  margin: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 10px;\n  color: var(--sidebar-text);\n  background: var(--sidebar-soft);\n  border: 1px solid var(--sidebar-border);\n}\n.layout-sidebar-status-dot {\n  width: 0.58rem;\n  height: 0.58rem;\n  border-radius: 999px;\n  background: #22c55e;\n  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);\n}\n.layout-sidebar-footer-copy {\n  display: grid;\n  min-width: 0;\n  gap: 0.05rem;\n}\n.layout-sidebar-footer-copy strong {\n  font-size: 0.82rem;\n  line-height: 1.15;\n}\n.layout-sidebar-footer-copy span {\n  color: var(--sidebar-muted);\n  font-size: 0.7rem;\n  font-weight: 650;\n  line-height: 1.2;\n}\n.layout-sidebar-rail {\n  display: grid;\n  gap: 0.45rem;\n  justify-items: center;\n  padding: 0.2rem 0.25rem 0.75rem;\n}\n.layout-sidebar-collapsed .layout-sidebar-header {\n  padding: 0.65rem 0.25rem 0.85rem;\n}\n.layout-sidebar-collapsed .layout-sidebar-brand {\n  justify-content: center;\n}\n.layout-sidebar-collapsed .layout-sidebar-logo {\n  height: 2.65rem;\n  justify-content: center;\n}\n.layout-sidebar-collapsed .layout-sidebar-logo-img {\n  height: 2.65rem;\n  max-width: 3.5rem;\n}\n.layout-rail-item {\n  position: relative;\n  display: grid;\n  place-items: center;\n  width: 2.75rem;\n  height: 2.75rem;\n  border-radius: 10px;\n  color: var(--sidebar-muted);\n  text-decoration: none;\n  border: 1px solid transparent;\n  background: transparent;\n  transition:\n    background-color 0.16s ease,\n    color 0.16s ease,\n    border-color 0.16s ease;\n}\n.layout-rail-item:hover {\n  color: var(--sidebar-text);\n  background: var(--sidebar-soft-hover);\n}\n.layout-rail-item--active {\n  color: var(--sidebar-active-text);\n  background: var(--sidebar-active-bg);\n}\n.layout-rail-item i {\n  font-size: 1.05rem;\n}\n.layout-rail-item__badge {\n  position: absolute;\n  top: -0.2rem;\n  right: -0.18rem;\n  min-width: 1.05rem;\n  height: 1.05rem;\n  padding: 0 0.2rem;\n  font-size: 0.58rem;\n}\n@media (max-width: 768px) {\n  .layout-sidebar {\n    transform: translateX(-100%);\n    transition: transform 0.25s ease;\n  }\n  .layout-sidebar:not(.layout-sidebar-collapsed) {\n    transform: translateX(0);\n  }\n  .layout-sidebar-collapsed {\n    transform: translateX(-100%);\n  }\n}\n/*# sourceMappingURL=sidebar.component.css.map */\n'] }]
  }], null, { collapsed: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SidebarComponent, { className: "SidebarComponent", filePath: "src/app/layout/sidebar/sidebar.component.ts", lineNumber: 51 });
})();

// node_modules/@primeuix/styles/dist/menu/index.mjs
var style = "\n    .p-menu {\n        background: dt('menu.background');\n        color: dt('menu.color');\n        border: 1px solid dt('menu.border.color');\n        border-radius: dt('menu.border.radius');\n        min-width: 12.5rem;\n    }\n\n    .p-menu-list {\n        margin: 0;\n        padding: dt('menu.list.padding');\n        outline: 0 none;\n        list-style: none;\n        display: flex;\n        flex-direction: column;\n        gap: dt('menu.list.gap');\n    }\n\n    .p-menu-item-content {\n        transition:\n            background dt('menu.transition.duration'),\n            color dt('menu.transition.duration');\n        border-radius: dt('menu.item.border.radius');\n        color: dt('menu.item.color');\n        overflow: hidden;\n    }\n\n    .p-menu-item-link {\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        text-decoration: none;\n        overflow: hidden;\n        position: relative;\n        color: inherit;\n        padding: dt('menu.item.padding');\n        gap: dt('menu.item.gap');\n        user-select: none;\n        outline: 0 none;\n    }\n\n    .p-menu-item-label {\n        line-height: 1;\n    }\n\n    .p-menu-item-icon {\n        color: dt('menu.item.icon.color');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-content {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item.p-focus .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {\n        color: dt('menu.item.focus.color');\n        background: dt('menu.item.focus.background');\n    }\n\n    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {\n        color: dt('menu.item.icon.focus.color');\n    }\n\n    .p-menu-overlay {\n        box-shadow: dt('menu.shadow');\n    }\n\n    .p-menu-submenu-label {\n        background: dt('menu.submenu.label.background');\n        padding: dt('menu.submenu.label.padding');\n        color: dt('menu.submenu.label.color');\n        font-weight: dt('menu.submenu.label.font.weight');\n    }\n\n    .p-menu-separator {\n        border-block-start: 1px solid dt('menu.separator.border.color');\n    }\n";

// node_modules/primeng/fesm2022/primeng-menu.mjs
var _c02 = ["pMenuItemContent", ""];
var _c1 = (a0) => ({
  $implicit: a0
});
var _c2 = () => ({
  exact: false
});
var _c3 = (a0) => ({
  item: a0
});
function MenuItemContent_ng_container_1_a_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function MenuItemContent_ng_container_1_a_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 6);
    \u0275\u0275template(1, MenuItemContent_ng_container_1_a_1_ng_container_1_Template, 1, 0, "ng-container", 7);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    const itemContent_r2 = \u0275\u0275reference(4);
    \u0275\u0275classMap(ctx_r0.cn(ctx_r0.cx("itemLink"), ctx_r0.item == null ? null : ctx_r0.item.linkClass));
    \u0275\u0275property("ngStyle", ctx_r0.item == null ? null : ctx_r0.item.linkStyle)("target", ctx_r0.item.target)("pBind", ctx_r0.getPTOptions("itemLink"));
    \u0275\u0275attribute("title", ctx_r0.item.title)("href", ctx_r0.item.url || null, \u0275\u0275sanitizeUrl)("data-automationid", ctx_r0.item.automationId)("tabindex", -1);
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", itemContent_r2)("ngTemplateOutletContext", \u0275\u0275pureFunction1(11, _c1, ctx_r0.item));
  }
}
function MenuItemContent_ng_container_1_a_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function MenuItemContent_ng_container_1_a_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 8);
    \u0275\u0275template(1, MenuItemContent_ng_container_1_a_2_ng_container_1_Template, 1, 0, "ng-container", 7);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    const itemContent_r2 = \u0275\u0275reference(4);
    \u0275\u0275classMap(ctx_r0.cn(ctx_r0.cx("itemLink"), ctx_r0.item == null ? null : ctx_r0.item.linkClass));
    \u0275\u0275property("routerLink", ctx_r0.item.routerLink)("queryParams", ctx_r0.item.queryParams)("routerLinkActiveOptions", ctx_r0.item.routerLinkActiveOptions || \u0275\u0275pureFunction0(19, _c2))("ngStyle", ctx_r0.item == null ? null : ctx_r0.item.linkStyle)("target", ctx_r0.item.target)("fragment", ctx_r0.item.fragment)("queryParamsHandling", ctx_r0.item.queryParamsHandling)("preserveFragment", ctx_r0.item.preserveFragment)("skipLocationChange", ctx_r0.item.skipLocationChange)("replaceUrl", ctx_r0.item.replaceUrl)("state", ctx_r0.item.state)("pBind", ctx_r0.getPTOptions("itemLink"));
    \u0275\u0275attribute("data-automationid", ctx_r0.item.automationId)("tabindex", -1)("title", ctx_r0.item.title);
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", itemContent_r2)("ngTemplateOutletContext", \u0275\u0275pureFunction1(20, _c1, ctx_r0.item));
  }
}
function MenuItemContent_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, MenuItemContent_ng_container_1_a_1_Template, 2, 13, "a", 4)(2, MenuItemContent_ng_container_1_a_2_Template, 2, 22, "a", 5);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !(ctx_r0.item == null ? null : ctx_r0.item.routerLink));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.item == null ? null : ctx_r0.item.routerLink);
  }
}
function MenuItemContent_ng_container_2_1_ng_template_0_Template(rf, ctx) {
}
function MenuItemContent_ng_container_2_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, MenuItemContent_ng_container_2_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function MenuItemContent_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, MenuItemContent_ng_container_2_1_Template, 1, 0, null, 7);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r0.itemTemplate)("ngTemplateOutletContext", \u0275\u0275pureFunction1(2, _c1, ctx_r0.item));
  }
}
function MenuItemContent_ng_template_3_span_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 12);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(ctx_r0.cn(ctx_r0.cx("itemIcon", \u0275\u0275pureFunction1(5, _c3, ctx_r0.item)), ctx_r0.item.iconClass));
    \u0275\u0275property("pBind", ctx_r0.getPTOptions("itemIcon"))("ngStyle", ctx_r0.item.iconStyle);
    \u0275\u0275attribute("data-pc-section", "itemicon");
  }
}
function MenuItemContent_ng_template_3_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 13);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(ctx_r0.cn(ctx_r0.cx("itemLabel"), ctx_r0.item.labelClass));
    \u0275\u0275property("ngStyle", ctx_r0.item.labelStyle)("pBind", ctx_r0.getPTOptions("itemLabel"));
    \u0275\u0275attribute("data-pc-section", "itemlabel");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.item.label);
  }
}
function MenuItemContent_ng_template_3_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 14);
    \u0275\u0275pipe(1, "safeHtml");
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(ctx_r0.cn(ctx_r0.cx("itemLabel"), ctx_r0.item.labelClass));
    \u0275\u0275property("ngStyle", ctx_r0.item.labelStyle)("innerHTML", \u0275\u0275pipeBind1(1, 6, ctx_r0.item.label), \u0275\u0275sanitizeHtml)("pBind", ctx_r0.getPTOptions("itemLabel"));
    \u0275\u0275attribute("data-pc-section", "itemlabel");
  }
}
function MenuItemContent_ng_template_3_p_badge_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "p-badge", 15);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("styleClass", ctx_r0.item.badgeStyleClass)("value", ctx_r0.item.badge)("pt", ctx_r0.getPTOptions("pcBadge"))("unstyled", ctx_r0.unstyled());
  }
}
function MenuItemContent_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, MenuItemContent_ng_template_3_span_0_Template, 1, 7, "span", 9)(1, MenuItemContent_ng_template_3_span_1_Template, 2, 6, "span", 10)(2, MenuItemContent_ng_template_3_ng_template_2_Template, 2, 8, "ng-template", null, 1, \u0275\u0275templateRefExtractor)(4, MenuItemContent_ng_template_3_p_badge_4_Template, 1, 4, "p-badge", 11);
  }
  if (rf & 2) {
    const htmlLabel_r3 = \u0275\u0275reference(3);
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("ngIf", ctx_r0.item.icon);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.item.escape !== false)("ngIfElse", htmlLabel_r3);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx_r0.item.badge);
  }
}
var _c4 = ["start"];
var _c5 = ["end"];
var _c6 = ["header"];
var _c7 = ["item"];
var _c8 = ["submenuheader"];
var _c9 = ["list"];
var _c10 = ["container"];
var _c11 = (a0, a1) => ({
  item: a0,
  id: a1
});
function Menu_Conditional_0_div_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function Menu_Conditional_0_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275template(1, Menu_Conditional_0_div_2_ng_container_1_Template, 1, 0, "ng-container", 9);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(ctx_r1.cx("start"));
    \u0275\u0275property("pBind", ctx_r1.ptm("start"));
    \u0275\u0275attribute("data-pc-section", "start");
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r1.startTemplate ?? ctx_r1._startTemplate);
  }
}
function Menu_Conditional_0_5_ng_template_0_li_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "li", 13);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275classMap(ctx_r1.cx("separator"));
    \u0275\u0275property("pBind", ctx_r1.ptm("separator"));
    \u0275\u0275attribute("data-pc-section", "separator");
  }
}
function Menu_Conditional_0_5_ng_template_0_li_1_ng_container_1_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const submenu_r3 = \u0275\u0275nextContext(3).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(submenu_r3.label);
  }
}
function Menu_Conditional_0_5_ng_template_0_li_1_ng_container_1_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 17);
    \u0275\u0275pipe(1, "safeHtml");
  }
  if (rf & 2) {
    const submenu_r3 = \u0275\u0275nextContext(3).$implicit;
    \u0275\u0275property("innerHTML", \u0275\u0275pipeBind1(1, 1, submenu_r3.label), \u0275\u0275sanitizeHtml);
  }
}
function Menu_Conditional_0_5_ng_template_0_li_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, Menu_Conditional_0_5_ng_template_0_li_1_ng_container_1_span_1_Template, 2, 1, "span", 16)(2, Menu_Conditional_0_5_ng_template_0_li_1_ng_container_1_ng_template_2_Template, 2, 3, "ng-template", null, 2, \u0275\u0275templateRefExtractor);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const htmlSubmenuLabel_r4 = \u0275\u0275reference(3);
    const submenu_r3 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", submenu_r3.escape !== false)("ngIfElse", htmlSubmenuLabel_r4);
  }
}
function Menu_Conditional_0_5_ng_template_0_li_1_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function Menu_Conditional_0_5_ng_template_0_li_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li", 14);
    \u0275\u0275template(1, Menu_Conditional_0_5_ng_template_0_li_1_ng_container_1_Template, 4, 2, "ng-container", 7)(2, Menu_Conditional_0_5_ng_template_0_li_1_ng_container_2_Template, 1, 0, "ng-container", 15);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r4 = \u0275\u0275nextContext();
    const submenu_r3 = ctx_r4.$implicit;
    const i_r6 = ctx_r4.index;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classMap(ctx_r1.cx("submenuLabel"));
    \u0275\u0275property("pBind", ctx_r1.ptm("submenuLabel"))("tooltipOptions", submenu_r3.tooltipOptions)("pTooltipUnstyled", ctx_r1.unstyled());
    \u0275\u0275attribute("data-automationid", submenu_r3.automationId)("id", ctx_r1.menuitemId(submenu_r3, ctx_r1.id, i_r6))("data-pc-section", "submenulabel");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.submenuHeaderTemplate && !ctx_r1._submenuHeaderTemplate);
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r1.submenuHeaderTemplate ?? ctx_r1._submenuHeaderTemplate)("ngTemplateOutletContext", \u0275\u0275pureFunction1(11, _c1, submenu_r3));
  }
}
function Menu_Conditional_0_5_ng_template_0_ng_template_2_li_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "li", 13);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275classMap(ctx_r1.cx("separator"));
    \u0275\u0275property("pBind", ctx_r1.ptm("separator"));
    \u0275\u0275attribute("data-pc-section", "separator");
  }
}
function Menu_Conditional_0_5_ng_template_0_ng_template_2_li_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "li", 19);
    \u0275\u0275listener("onMenuItemClick", function Menu_Conditional_0_5_ng_template_0_ng_template_2_li_1_Template_li_onMenuItemClick_0_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r7 = \u0275\u0275nextContext();
      const item_r9 = ctx_r7.$implicit;
      const j_r10 = ctx_r7.index;
      const i_r6 = \u0275\u0275nextContext().index;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.itemClick($event, ctx_r1.menuitemId(item_r9, ctx_r1.id, i_r6, j_r10)));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r7 = \u0275\u0275nextContext();
    const item_r9 = ctx_r7.$implicit;
    const j_r10 = ctx_r7.index;
    const i_r6 = \u0275\u0275nextContext().index;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275styleMap(item_r9.style);
    \u0275\u0275classMap(ctx_r1.cn(ctx_r1.cx("item", \u0275\u0275pureFunction2(17, _c11, item_r9, ctx_r1.menuitemId(item_r9, ctx_r1.id, i_r6, j_r10))), item_r9 == null ? null : item_r9.styleClass));
    \u0275\u0275property("pBind", ctx_r1.ptm("item"))("pMenuItemContent", item_r9)("itemTemplate", ctx_r1.itemTemplate ?? ctx_r1._itemTemplate)("idx", j_r10)("menuitemId", ctx_r1.menuitemId(item_r9, ctx_r1.id, i_r6, j_r10))("tooltipOptions", item_r9.tooltipOptions)("pTooltipUnstyled", ctx_r1.unstyled())("unstyled", ctx_r1.unstyled());
    \u0275\u0275attribute("aria-label", ctx_r1.label(item_r9.label))("data-p-focused", ctx_r1.isItemFocused(ctx_r1.menuitemId(item_r9, ctx_r1.id, i_r6, j_r10)))("data-p-disabled", ctx_r1.disabled(item_r9.disabled))("aria-disabled", ctx_r1.disabled(item_r9.disabled))("id", ctx_r1.menuitemId(item_r9, ctx_r1.id, i_r6, j_r10));
  }
}
function Menu_Conditional_0_5_ng_template_0_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, Menu_Conditional_0_5_ng_template_0_ng_template_2_li_0_Template, 1, 4, "li", 11)(1, Menu_Conditional_0_5_ng_template_0_ng_template_2_li_1_Template, 1, 20, "li", 18);
  }
  if (rf & 2) {
    const item_r9 = ctx.$implicit;
    const submenu_r3 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("ngIf", item_r9.separator && (item_r9.visible !== false || submenu_r3.visible !== false));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !item_r9.separator && item_r9.visible !== false && (item_r9.visible !== void 0 || submenu_r3.visible !== false));
  }
}
function Menu_Conditional_0_5_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, Menu_Conditional_0_5_ng_template_0_li_0_Template, 1, 4, "li", 11)(1, Menu_Conditional_0_5_ng_template_0_li_1_Template, 3, 13, "li", 12)(2, Menu_Conditional_0_5_ng_template_0_ng_template_2_Template, 2, 2, "ng-template", 10);
  }
  if (rf & 2) {
    const submenu_r3 = ctx.$implicit;
    \u0275\u0275property("ngIf", submenu_r3.separator && submenu_r3.visible !== false);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !submenu_r3.separator);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", submenu_r3.items);
  }
}
function Menu_Conditional_0_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, Menu_Conditional_0_5_ng_template_0_Template, 3, 3, "ng-template", 10);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("ngForOf", ctx_r1.model);
  }
}
function Menu_Conditional_0_6_ng_template_0_li_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "li", 13);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275classMap(ctx_r1.cx("separator"));
    \u0275\u0275property("pBind", ctx_r1.ptm("separator"));
    \u0275\u0275attribute("data-pc-section", "separator");
  }
}
function Menu_Conditional_0_6_ng_template_0_li_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "li", 21);
    \u0275\u0275listener("onMenuItemClick", function Menu_Conditional_0_6_ng_template_0_li_1_Template_li_onMenuItemClick_0_listener($event) {
      \u0275\u0275restoreView(_r11);
      const ctx_r11 = \u0275\u0275nextContext();
      const item_r13 = ctx_r11.$implicit;
      const i_r14 = ctx_r11.index;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.itemClick($event, ctx_r1.menuitemId(item_r13, ctx_r1.id, i_r14)));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r11 = \u0275\u0275nextContext();
    const item_r13 = ctx_r11.$implicit;
    const i_r14 = ctx_r11.index;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classMap(ctx_r1.cn(ctx_r1.cx("item", \u0275\u0275pureFunction2(16, _c11, item_r13, ctx_r1.menuitemId(item_r13, ctx_r1.id, i_r14))), item_r13 == null ? null : item_r13.styleClass));
    \u0275\u0275property("pBind", ctx_r1.ptm("item"))("pMenuItemContent", item_r13)("itemTemplate", ctx_r1.itemTemplate ?? ctx_r1._itemTemplate)("idx", i_r14)("menuitemId", ctx_r1.menuitemId(item_r13, ctx_r1.id, i_r14))("ngStyle", item_r13.style)("tooltipOptions", item_r13.tooltipOptions)("unstyled", ctx_r1.unstyled())("pTooltipUnstyled", ctx_r1.unstyled());
    \u0275\u0275attribute("aria-label", ctx_r1.label(item_r13.label))("data-p-focused", ctx_r1.isItemFocused(ctx_r1.menuitemId(item_r13, ctx_r1.id, i_r14)))("data-p-disabled", ctx_r1.disabled(item_r13.disabled))("aria-disabled", ctx_r1.disabled(item_r13.disabled))("id", ctx_r1.menuitemId(item_r13, ctx_r1.id, i_r14));
  }
}
function Menu_Conditional_0_6_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, Menu_Conditional_0_6_ng_template_0_li_0_Template, 1, 4, "li", 11)(1, Menu_Conditional_0_6_ng_template_0_li_1_Template, 1, 19, "li", 20);
  }
  if (rf & 2) {
    const item_r13 = ctx.$implicit;
    \u0275\u0275property("ngIf", item_r13.separator && item_r13.visible !== false);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !item_r13.separator && item_r13.visible !== false);
  }
}
function Menu_Conditional_0_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, Menu_Conditional_0_6_ng_template_0_Template, 2, 2, "ng-template", 10);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("ngForOf", ctx_r1.model);
  }
}
function Menu_Conditional_0_div_7_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function Menu_Conditional_0_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275template(1, Menu_Conditional_0_div_7_ng_container_1_Template, 1, 0, "ng-container", 9);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(ctx_r1.cx("end"));
    \u0275\u0275property("pBind", ctx_r1.ptm("end"));
    \u0275\u0275attribute("data-pc-section", "end");
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r1.endTemplate ?? ctx_r1._endTemplate);
  }
}
function Menu_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 4, 0);
    \u0275\u0275listener("click", function Menu_Conditional_0_Template_div_click_0_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onOverlayClick($event));
    })("pMotionOnBeforeEnter", function Menu_Conditional_0_Template_div_pMotionOnBeforeEnter_0_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onOverlayBeforeEnter($event));
    })("pMotionOnAfterLeave", function Menu_Conditional_0_Template_div_pMotionOnAfterLeave_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onOverlayAfterLeave());
    });
    \u0275\u0275template(2, Menu_Conditional_0_div_2_Template, 2, 5, "div", 5);
    \u0275\u0275elementStart(3, "ul", 6, 1);
    \u0275\u0275listener("focus", function Menu_Conditional_0_Template_ul_focus_3_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onListFocus($event));
    })("blur", function Menu_Conditional_0_Template_ul_blur_3_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onListBlur($event));
    })("keydown", function Menu_Conditional_0_Template_ul_keydown_3_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onListKeyDown($event));
    });
    \u0275\u0275template(5, Menu_Conditional_0_5_Template, 1, 1, null, 7)(6, Menu_Conditional_0_6_Template, 1, 1, null, 7);
    \u0275\u0275elementEnd();
    \u0275\u0275template(7, Menu_Conditional_0_div_7_Template, 2, 5, "div", 5);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275styleMap(ctx_r1.sx("root"));
    \u0275\u0275classMap(ctx_r1.cn(ctx_r1.cx("root"), ctx_r1.styleClass));
    \u0275\u0275property("ngStyle", ctx_r1.style)("pBind", ctx_r1.ptm("root"))("pMotion", ctx_r1.visible || !ctx_r1.popup)("pMotionName", "p-anchored-overlay")("pMotionAppear", !!ctx_r1.popup)("pMotionDisabled", !ctx_r1.popup)("pMotionOptions", ctx_r1.computedMotionOptions());
    \u0275\u0275attribute("id", ctx_r1.id)("data-p", ctx_r1.dataP);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r1.startTemplate ?? ctx_r1._startTemplate);
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r1.cx("list"));
    \u0275\u0275property("pBind", ctx_r1.ptm("list"));
    \u0275\u0275attribute("id", ctx_r1.id + "_list")("tabindex", ctx_r1.getTabIndexValue())("data-pc-section", "menu")("aria-activedescendant", ctx_r1.activedescendant())("aria-label", ctx_r1.ariaLabel)("aria-labelledBy", ctx_r1.ariaLabelledBy);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r1.hasSubMenu());
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.hasSubMenu());
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.endTemplate ?? ctx_r1._endTemplate);
  }
}
var inlineStyles = {
  root: ({
    instance
  }) => ({
    position: instance.popup ? "absolute" : "relative"
  })
};
var classes = {
  root: ({
    instance
  }) => ["p-menu p-component", {
    "p-menu-overlay": instance.popup
  }],
  start: "p-menu-start",
  list: "p-menu-list",
  submenuLabel: "p-menu-submenu-label",
  separator: "p-menu-separator",
  end: "p-menu-end",
  item: ({
    instance,
    item,
    id
  }) => ["p-menu-item", {
    "p-focus": instance.focusedOptionId() && id === instance.focusedOptionId(),
    "p-disabled": instance.disabled(item.disabled)
  }, item.styleClass],
  itemContent: "p-menu-item-content",
  itemLink: "p-menu-item-link",
  itemIcon: ({
    item
  }) => ["p-menu-item-icon", item.icon, item.iconClass],
  itemLabel: "p-menu-item-label"
};
var MenuStyle = class _MenuStyle extends BaseStyle {
  name = "menu";
  style = style;
  classes = classes;
  inlineStyles = inlineStyles;
  static \u0275fac = /* @__PURE__ */ (() => {
    let \u0275MenuStyle_BaseFactory;
    return function MenuStyle_Factory(__ngFactoryType__) {
      return (\u0275MenuStyle_BaseFactory || (\u0275MenuStyle_BaseFactory = \u0275\u0275getInheritedFactory(_MenuStyle)))(__ngFactoryType__ || _MenuStyle);
    };
  })();
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _MenuStyle,
    factory: _MenuStyle.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MenuStyle, [{
    type: Injectable
  }], null, null);
})();
var MenuClasses;
(function(MenuClasses2) {
  MenuClasses2["root"] = "p-menu";
  MenuClasses2["start"] = "p-menu-start";
  MenuClasses2["list"] = "p-menu-list";
  MenuClasses2["submenuItem"] = "p-menu-submenu-item";
  MenuClasses2["separator"] = "p-menu-separator";
  MenuClasses2["end"] = "p-menu-end";
  MenuClasses2["item"] = "p-menu-item";
  MenuClasses2["itemContent"] = "p-menu-item-content";
  MenuClasses2["itemLink"] = "p-menu-item-link";
  MenuClasses2["itemIcon"] = "p-menu-item-icon";
  MenuClasses2["itemLabel"] = "p-menu-item-label";
})(MenuClasses || (MenuClasses = {}));
var MENU_INSTANCE = new InjectionToken("MENU_INSTANCE");
var SafeHtmlPipe = class _SafeHtmlPipe {
  platformId;
  sanitizer;
  constructor(platformId, sanitizer) {
    this.platformId = platformId;
    this.sanitizer = sanitizer;
  }
  transform(value) {
    if (!value || !isPlatformBrowser(this.platformId)) {
      return value;
    }
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
  static \u0275fac = function SafeHtmlPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SafeHtmlPipe)(\u0275\u0275directiveInject(PLATFORM_ID, 16), \u0275\u0275directiveInject(DomSanitizer, 16));
  };
  static \u0275pipe = /* @__PURE__ */ \u0275\u0275definePipe({
    name: "safeHtml",
    type: _SafeHtmlPipe,
    pure: true
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SafeHtmlPipe, [{
    type: Pipe,
    args: [{
      name: "safeHtml",
      standalone: true
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: DomSanitizer
  }], null);
})();
var MenuItemContent = class _MenuItemContent extends BaseComponent {
  item;
  itemTemplate;
  menuitemId = input("", ...ngDevMode ? [{
    debugName: "menuitemId"
  }] : (
    /* istanbul ignore next */
    []
  ));
  idx = input(0, ...ngDevMode ? [{
    debugName: "idx"
  }] : (
    /* istanbul ignore next */
    []
  ));
  onMenuItemClick = new EventEmitter();
  menu;
  _componentStyle = inject(MenuStyle);
  hostName = "Menu";
  constructor(menu) {
    super();
    this.menu = menu;
  }
  onItemClick(event, item) {
    this.onMenuItemClick.emit({
      originalEvent: event,
      item
    });
  }
  getPTOptions(key) {
    return this.menu.getPTOptions(key, this.item, this.idx(), this.menuitemId());
  }
  static \u0275fac = function MenuItemContent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MenuItemContent)(\u0275\u0275directiveInject(forwardRef(() => Menu)));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _MenuItemContent,
    selectors: [["", "pMenuItemContent", ""]],
    inputs: {
      item: [0, "pMenuItemContent", "item"],
      itemTemplate: "itemTemplate",
      menuitemId: [1, "menuitemId"],
      idx: [1, "idx"]
    },
    outputs: {
      onMenuItemClick: "onMenuItemClick"
    },
    features: [\u0275\u0275ProvidersFeature([MenuStyle]), \u0275\u0275InheritDefinitionFeature],
    attrs: _c02,
    decls: 5,
    vars: 6,
    consts: [["itemContent", ""], ["htmlLabel", ""], [3, "click", "pBind"], [4, "ngIf"], ["pRipple", "", 3, "class", "ngStyle", "target", "pBind", 4, "ngIf"], ["routerLinkActive", "p-menu-item-link-active", "pRipple", "", 3, "routerLink", "queryParams", "routerLinkActiveOptions", "class", "ngStyle", "target", "fragment", "queryParamsHandling", "preserveFragment", "skipLocationChange", "replaceUrl", "state", "pBind", 4, "ngIf"], ["pRipple", "", 3, "ngStyle", "target", "pBind"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], ["routerLinkActive", "p-menu-item-link-active", "pRipple", "", 3, "routerLink", "queryParams", "routerLinkActiveOptions", "ngStyle", "target", "fragment", "queryParamsHandling", "preserveFragment", "skipLocationChange", "replaceUrl", "state", "pBind"], [3, "class", "pBind", "ngStyle", 4, "ngIf"], [3, "class", "ngStyle", "pBind", 4, "ngIf", "ngIfElse"], [3, "styleClass", "value", "pt", "unstyled", 4, "ngIf"], [3, "pBind", "ngStyle"], [3, "ngStyle", "pBind"], [3, "ngStyle", "innerHTML", "pBind"], [3, "styleClass", "value", "pt", "unstyled"]],
    template: function MenuItemContent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 2);
        \u0275\u0275listener("click", function MenuItemContent_Template_div_click_0_listener($event) {
          return ctx.onItemClick($event, ctx.item);
        });
        \u0275\u0275template(1, MenuItemContent_ng_container_1_Template, 3, 2, "ng-container", 3)(2, MenuItemContent_ng_container_2_Template, 2, 4, "ng-container", 3)(3, MenuItemContent_ng_template_3_Template, 5, 4, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        \u0275\u0275classMap(ctx.cx("itemContent"));
        \u0275\u0275property("pBind", ctx.getPTOptions("itemContent"));
        \u0275\u0275attribute("data-pc-section", "content");
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", !ctx.itemTemplate);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.itemTemplate);
      }
    },
    dependencies: [CommonModule, NgIf, NgTemplateOutlet, NgStyle, RouterModule, RouterLink, RouterLinkActive, Ripple, TooltipModule, Bind, BadgeModule, Badge, SharedModule, BindModule, SafeHtmlPipe],
    encapsulation: 2
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MenuItemContent, [{
    type: Component,
    args: [{
      selector: "[pMenuItemContent]",
      standalone: true,
      imports: [CommonModule, RouterModule, Ripple, TooltipModule, BadgeModule, SharedModule, SafeHtmlPipe, BindModule],
      template: ` <div [class]="cx('itemContent')" (click)="onItemClick($event, item)" [attr.data-pc-section]="'content'" [pBind]="getPTOptions('itemContent')">
        <ng-container *ngIf="!itemTemplate">
            <a
                *ngIf="!item?.routerLink"
                [attr.title]="item.title"
                [attr.href]="item.url || null"
                [attr.data-automationid]="item.automationId"
                [attr.tabindex]="-1"
                [class]="cn(cx('itemLink'), item?.linkClass)"
                [ngStyle]="item?.linkStyle"
                [target]="item.target"
                [pBind]="getPTOptions('itemLink')"
                pRipple
            >
                <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: item }"></ng-container>
            </a>
            <a
                *ngIf="item?.routerLink"
                [routerLink]="item.routerLink"
                [attr.data-automationid]="item.automationId"
                [attr.tabindex]="-1"
                [attr.title]="item.title"
                [queryParams]="item.queryParams"
                routerLinkActive="p-menu-item-link-active"
                [routerLinkActiveOptions]="item.routerLinkActiveOptions || { exact: false }"
                [class]="cn(cx('itemLink'), item?.linkClass)"
                [ngStyle]="item?.linkStyle"
                [target]="item.target"
                [fragment]="item.fragment"
                [queryParamsHandling]="item.queryParamsHandling"
                [preserveFragment]="item.preserveFragment"
                [skipLocationChange]="item.skipLocationChange"
                [replaceUrl]="item.replaceUrl"
                [state]="item.state"
                [pBind]="getPTOptions('itemLink')"
                pRipple
            >
                <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: item }"></ng-container>
            </a>
        </ng-container>

        <ng-container *ngIf="itemTemplate">
            <ng-template *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"></ng-template>
        </ng-container>

        <ng-template #itemContent>
            <span [class]="cn(cx('itemIcon', { item }), item.iconClass)" [pBind]="getPTOptions('itemIcon')" *ngIf="item.icon" [ngStyle]="item.iconStyle" [attr.data-pc-section]="'itemicon'"></span>
            <span [class]="cn(cx('itemLabel'), item.labelClass)" [ngStyle]="item.labelStyle" [pBind]="getPTOptions('itemLabel')" [attr.data-pc-section]="'itemlabel'" *ngIf="item.escape !== false; else htmlLabel">{{ item.label }}</span>
            <ng-template #htmlLabel><span [class]="cn(cx('itemLabel'), item.labelClass)" [ngStyle]="item.labelStyle" [attr.data-pc-section]="'itemlabel'" [innerHTML]="item.label | safeHtml" [pBind]="getPTOptions('itemLabel')"></span></ng-template>
            <p-badge *ngIf="item.badge" [styleClass]="item.badgeStyleClass" [value]="item.badge" [pt]="getPTOptions('pcBadge')" [unstyled]="unstyled()" />
        </ng-template>
    </div>`,
      encapsulation: ViewEncapsulation.None,
      providers: [MenuStyle]
    }]
  }], () => [{
    type: Menu,
    decorators: [{
      type: Inject,
      args: [forwardRef(() => Menu)]
    }]
  }], {
    item: [{
      type: Input,
      args: ["pMenuItemContent"]
    }],
    itemTemplate: [{
      type: Input
    }],
    menuitemId: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "menuitemId",
        required: false
      }]
    }],
    idx: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "idx",
        required: false
      }]
    }],
    onMenuItemClick: [{
      type: Output
    }]
  });
})();
var Menu = class _Menu extends BaseComponent {
  overlayService;
  componentName = "Menu";
  /**
   * An array of menuitems.
   * @group Props
   */
  model;
  /**
   * Defines if menu would displayed as a popup.
   * @group Props
   */
  popup;
  /**
   * Inline style of the component.
   * @group Props
   */
  style;
  /**
   * Style class of the component.
   * @group Props
   */
  styleClass;
  /**
   * Whether to automatically manage layering.
   * @group Props
   */
  autoZIndex = true;
  /**
   * Base zIndex value to use in layering.
   * @group Props
   */
  baseZIndex = 0;
  /**
   * Transition options of the show animation.
   * @deprecated since v21.0.0, use `motionOptions` instead.
   * @group Props
   */
  showTransitionOptions = ".12s cubic-bezier(0, 0, 0.2, 1)";
  /**
   * Transition options of the hide animation.
   * @deprecated since v21.0.0, use `motionOptions` instead.
   * @group Props
   */
  hideTransitionOptions = ".1s linear";
  /**
   * Defines a string value that labels an interactive element.
   * @group Props
   */
  ariaLabel;
  /**
   * Identifier of the underlying input element.
   * @group Props
   */
  ariaLabelledBy;
  /**
   * Current id state as a string.
   * @group Props
   */
  id;
  /**
   * Index of the element in tabbing order.
   * @group Props
   */
  tabindex = 0;
  /**
   * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
   * @defaultValue 'self'
   * @group Props
   */
  appendTo = input(void 0, ...ngDevMode ? [{
    debugName: "appendTo"
  }] : (
    /* istanbul ignore next */
    []
  ));
  /**
   * The motion options.
   * @group Props
   */
  motionOptions = input(void 0, ...ngDevMode ? [{
    debugName: "motionOptions"
  }] : (
    /* istanbul ignore next */
    []
  ));
  computedMotionOptions = computed(() => {
    return __spreadValues(__spreadValues({}, this.ptm("motion")), this.motionOptions());
  }, ...ngDevMode ? [{
    debugName: "computedMotionOptions"
  }] : (
    /* istanbul ignore next */
    []
  ));
  /**
   * Callback to invoke when overlay menu is shown.
   * @group Emits
   */
  onShow = new EventEmitter();
  /**
   * Callback to invoke when overlay menu is hidden.
   * @group Emits
   */
  onHide = new EventEmitter();
  /**
   * Callback to invoke when the list loses focus.
   * @param {Event} event - blur event.
   * @group Emits
   */
  onBlur = new EventEmitter();
  /**
   * Callback to invoke when the list receives focus.
   * @param {Event} event - focus event.
   * @group Emits
   */
  onFocus = new EventEmitter();
  listViewChild = viewChild("list", ...ngDevMode ? [{
    debugName: "listViewChild"
  }] : (
    /* istanbul ignore next */
    []
  ));
  containerViewChild = viewChild("container", ...ngDevMode ? [{
    debugName: "containerViewChild"
  }] : (
    /* istanbul ignore next */
    []
  ));
  $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo(), ...ngDevMode ? [{
    debugName: "$appendTo"
  }] : (
    /* istanbul ignore next */
    []
  ));
  container;
  scrollHandler;
  documentClickListener;
  documentResizeListener;
  preventDocumentDefault;
  target;
  visible;
  focusedOptionId = computed(() => {
    return this.focusedOptionIndex() !== -1 ? this.focusedOptionIndex() : null;
  }, ...ngDevMode ? [{
    debugName: "focusedOptionId"
  }] : (
    /* istanbul ignore next */
    []
  ));
  focusedOptionIndex = signal(-1, ...ngDevMode ? [{
    debugName: "focusedOptionIndex"
  }] : (
    /* istanbul ignore next */
    []
  ));
  selectedOptionIndex = signal(-1, ...ngDevMode ? [{
    debugName: "selectedOptionIndex"
  }] : (
    /* istanbul ignore next */
    []
  ));
  focused = false;
  overlayVisible = false;
  $pcMenu = inject(MENU_INSTANCE, {
    optional: true,
    skipSelf: true
  }) ?? void 0;
  _componentStyle = inject(MenuStyle);
  bindDirectiveInstance = inject(Bind, {
    self: true
  });
  onAfterViewChecked() {
    this.bindDirectiveInstance.setAttrs(this.ptm("host"));
  }
  constructor(overlayService) {
    super();
    this.overlayService = overlayService;
    this.id = this.id || s("pn_id_");
  }
  getPTOptions(key, item, index, id) {
    return this.ptm(key, {
      context: {
        item,
        index,
        focused: this.isItemFocused(id),
        disabled: this.disabled(item.disabled)
      }
    });
  }
  /**
   * Toggles the visibility of the popup menu.
   * @param {Event} event - Browser event.
   * @group Method
   */
  toggle(event) {
    if (this.visible) this.hide();
    else this.show(event);
    this.preventDocumentDefault = true;
  }
  /**
   * Displays the popup menu.
   * @param {Event} event - Browser event.
   * @group Method
   */
  show(event) {
    if (this.container && !this.overlayVisible) {
      this.container = void 0;
    }
    this.target = event.currentTarget;
    this.visible = true;
    this.preventDocumentDefault = true;
    this.overlayVisible = true;
    this.cd.markForCheck();
  }
  onInit() {
    if (!this.popup) {
      this.bindDocumentClickListener();
    }
  }
  /**
   * Defines template option for start.
   * @group Templates
   */
  startTemplate;
  _startTemplate;
  /**
   * Defines template option for end.
   * @group Templates
   */
  endTemplate;
  _endTemplate;
  /**
   * Defines template option for header.
   * @group Templates
   */
  headerTemplate;
  _headerTemplate;
  /**
   * Custom item template.
   * @param {MenuItemTemplateContext} context - item context.
   * @see {@link MenuItemTemplateContext}
   * @group Templates
   */
  itemTemplate;
  _itemTemplate;
  /**
   * Custom submenu header template.
   * @param {MenuSubmenuHeaderTemplateContext} context - submenu header context.
   * @see {@link MenuSubmenuHeaderTemplateContext}
   * @group Templates
   */
  submenuHeaderTemplate;
  _submenuHeaderTemplate;
  templates;
  onAfterContentInit() {
    this.templates?.forEach((item) => {
      switch (item.getType()) {
        case "start":
          this._startTemplate = item.template;
          break;
        case "end":
          this._endTemplate = item.template;
          break;
        case "item":
          this._itemTemplate = item.template;
          break;
        case "submenuheader":
          this._submenuHeaderTemplate = item.template;
          break;
        default:
          this._itemTemplate = item.template;
          break;
      }
    });
  }
  getTabIndexValue() {
    return this.tabindex !== void 0 ? this.tabindex.toString() : null;
  }
  onOverlayBeforeEnter(event) {
    this.container = event.element;
    if (this.container) {
      T(this.container, {
        position: "absolute",
        top: "0"
      });
      this.appendOverlay();
      this.moveOnTop();
      this.$attrSelector && this.container?.setAttribute(this.$attrSelector, "");
      this.bindDocumentClickListener();
      this.bindDocumentResizeListener();
      this.bindScrollListener();
      V(this.container, this.target);
      bt(this.listViewChild()?.nativeElement);
      this.onShow.emit({});
    }
  }
  onOverlayAfterLeave() {
    this.restoreOverlayAppend();
    this.onOverlayHide();
    this.overlayVisible = false;
    this.onHide.emit({});
  }
  appendOverlay() {
    if (this.$appendTo() && this.$appendTo() !== "self") {
      if (this.$appendTo() === "body") {
        ut(this.document.body, this.container);
      } else {
        ut(this.$appendTo(), this.container);
      }
    }
  }
  restoreOverlayAppend() {
    if (this.container && this.$appendTo() !== "self") {
      ut(this.el.nativeElement, this.container);
    }
  }
  moveOnTop() {
    if (this.autoZIndex) {
      zindexutils.set("menu", this.container, this.baseZIndex + this.config.zIndex.menu);
    }
  }
  /**
   * Hides the popup menu.
   * @group Method
   */
  hide() {
    this.visible = false;
    this.cd.markForCheck();
  }
  onWindowResize() {
    if (this.visible && !Yt()) {
      this.hide();
    }
  }
  menuitemId(item, id, index, childIndex) {
    return item?.id ?? `${id}_${index}${childIndex !== void 0 ? "_" + childIndex : ""}`;
  }
  isItemFocused(id) {
    return this.focusedOptionId() === id;
  }
  label(label) {
    return typeof label === "function" ? label() : label;
  }
  disabled(disabled) {
    return typeof disabled === "function" ? disabled() : typeof disabled === "undefined" ? false : disabled;
  }
  activedescendant() {
    return this.focused ? this.focusedOptionId() : void 0;
  }
  onListFocus(event) {
    if (!this.focused) {
      this.focused = true;
      !this.popup && this.changeFocusedOptionIndex(0);
      this.onFocus.emit(event);
    }
  }
  onListBlur(event) {
    if (this.focused) {
      this.focused = false;
      this.changeFocusedOptionIndex(-1);
      this.selectedOptionIndex.set(-1);
      this.focusedOptionIndex.set(-1);
      this.onBlur.emit(event);
    }
  }
  onListKeyDown(event) {
    switch (event.code) {
      case "ArrowDown":
        this.onArrowDownKey(event);
        break;
      case "ArrowUp":
        this.onArrowUpKey(event);
        break;
      case "Home":
        this.onHomeKey(event);
        break;
      case "End":
        this.onEndKey(event);
        break;
      case "Enter":
        this.onEnterKey(event);
        break;
      case "NumpadEnter":
        this.onEnterKey(event);
        break;
      case "Space":
        this.onSpaceKey(event);
        break;
      case "Escape":
      case "Tab":
        if (this.popup) {
          bt(this.target);
          this.hide();
        }
        this.overlayVisible && this.hide();
        break;
      default:
        break;
    }
  }
  onArrowDownKey(event) {
    const optionIndex = this.findNextOptionIndex(this.focusedOptionIndex());
    this.changeFocusedOptionIndex(optionIndex);
    event.preventDefault();
  }
  onArrowUpKey(event) {
    if (event.altKey && this.popup) {
      bt(this.target);
      this.hide();
      event.preventDefault();
    } else {
      const optionIndex = this.findPrevOptionIndex(this.focusedOptionIndex());
      this.changeFocusedOptionIndex(optionIndex);
      event.preventDefault();
    }
  }
  onHomeKey(event) {
    this.changeFocusedOptionIndex(0);
    event.preventDefault();
  }
  onEndKey(event) {
    this.changeFocusedOptionIndex(Y(this.containerViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]').length - 1);
    event.preventDefault();
  }
  onEnterKey(event) {
    const element = Z(this.containerViewChild()?.nativeElement, `li[id="${`${this.focusedOptionIndex()}`}"]`);
    const anchorElement = element && (Z(element, '[data-pc-section="itemlink"]') || Z(element, "a,button"));
    this.popup && bt(this.target);
    anchorElement ? anchorElement.click() : element && element.click();
    event.preventDefault();
  }
  onSpaceKey(event) {
    this.onEnterKey(event);
  }
  findNextOptionIndex(index) {
    const links = Y(this.containerViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');
    const matchedOptionIndex = [...links].findIndex((link) => link.id === index);
    return matchedOptionIndex > -1 ? matchedOptionIndex + 1 : 0;
  }
  findPrevOptionIndex(index) {
    const links = Y(this.containerViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');
    const matchedOptionIndex = [...links].findIndex((link) => link.id === index);
    return matchedOptionIndex > -1 ? matchedOptionIndex - 1 : 0;
  }
  changeFocusedOptionIndex(index) {
    const links = Y(this.containerViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');
    if (links.length > 0) {
      let order = index >= links.length ? links.length - 1 : index < 0 ? 0 : index;
      order > -1 && this.focusedOptionIndex.set(links[order].getAttribute("id"));
    }
  }
  itemClick(event, id) {
    const {
      originalEvent,
      item
    } = event;
    if (!this.focused) {
      this.focused = true;
      this.onFocus.emit();
    }
    if (item.disabled) {
      originalEvent.preventDefault();
      return;
    }
    if (!item.url && !item.routerLink) {
      originalEvent.preventDefault();
    }
    if (item.command) {
      item.command({
        originalEvent,
        item
      });
    }
    if (this.popup) {
      this.hide();
    }
    if (!this.popup && this.focusedOptionIndex() !== id) {
      this.focusedOptionIndex.set(id);
    }
  }
  onOverlayClick(event) {
    if (this.popup) {
      this.overlayService.add({
        originalEvent: event,
        target: this.el.nativeElement
      });
    }
    this.preventDocumentDefault = true;
  }
  bindDocumentClickListener() {
    if (!this.documentClickListener && isPlatformBrowser(this.platformId)) {
      const documentTarget = this.el ? this.el.nativeElement.ownerDocument : "document";
      this.documentClickListener = this.renderer.listen(documentTarget, "click", (event) => {
        const isOutsideContainer = this.containerViewChild()?.nativeElement && !this.containerViewChild()?.nativeElement.contains(event.target);
        const isOutsideTarget = !(this.target && (this.target === event.target || this.target.contains(event.target)));
        if (!this.popup && isOutsideContainer && isOutsideTarget) {
          this.onListBlur(event);
        }
        if (this.preventDocumentDefault && this.overlayVisible && isOutsideContainer && isOutsideTarget) {
          this.hide();
          this.preventDocumentDefault = false;
        }
      });
    }
  }
  unbindDocumentClickListener() {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }
  bindDocumentResizeListener() {
    if (!this.documentResizeListener && isPlatformBrowser(this.platformId)) {
      const window2 = this.document.defaultView;
      this.documentResizeListener = this.renderer.listen(window2, "resize", this.onWindowResize.bind(this));
    }
  }
  unbindDocumentResizeListener() {
    if (this.documentResizeListener) {
      this.documentResizeListener();
      this.documentResizeListener = null;
    }
  }
  bindScrollListener() {
    if (!this.scrollHandler && isPlatformBrowser(this.platformId)) {
      this.scrollHandler = new ConnectedOverlayScrollHandler(this.target, () => {
        if (this.visible) {
          this.hide();
        }
      });
    }
    this.scrollHandler?.bindScrollListener();
  }
  unbindScrollListener() {
    if (this.scrollHandler) {
      this.scrollHandler.unbindScrollListener();
      this.scrollHandler = null;
    }
  }
  onOverlayHide() {
    this.unbindDocumentClickListener();
    this.unbindDocumentResizeListener();
    this.unbindScrollListener();
    this.preventDocumentDefault = false;
    if (!this.cd.destroyed) {
      this.target = null;
    }
    if (this.container) {
      if (this.autoZIndex) {
        zindexutils.clear(this.container);
      }
      this.container = void 0;
    }
  }
  onDestroy() {
    if (this.popup) {
      if (this.scrollHandler) {
        this.scrollHandler.destroy();
        this.scrollHandler = null;
      }
      if (this.container) {
        if (this.autoZIndex) {
          zindexutils.clear(this.container);
        }
        this.container = void 0;
      }
      this.restoreOverlayAppend();
      this.onOverlayHide();
    }
    if (!this.popup) {
      this.unbindDocumentClickListener();
    }
  }
  hasSubMenu() {
    return this.model?.some((item) => item.items) ?? false;
  }
  isItemHidden(item) {
    if (item.separator) {
      return item.visible === false || item.items && item.items.some((subitem) => subitem.visible !== false);
    }
    return item.visible === false;
  }
  get dataP() {
    return this.cn({
      popup: this.popup
    });
  }
  static \u0275fac = function Menu_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Menu)(\u0275\u0275directiveInject(OverlayService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _Menu,
    selectors: [["p-menu"]],
    contentQueries: function Menu_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        \u0275\u0275contentQuery(dirIndex, _c4, 4)(dirIndex, _c5, 4)(dirIndex, _c6, 4)(dirIndex, _c7, 4)(dirIndex, _c8, 4)(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.startTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.endTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.headerTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.itemTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.submenuHeaderTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.templates = _t);
      }
    },
    viewQuery: function Menu_Query(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275viewQuerySignal(ctx.listViewChild, _c9, 5)(ctx.containerViewChild, _c10, 5);
      }
      if (rf & 2) {
        \u0275\u0275queryAdvance(2);
      }
    },
    inputs: {
      model: "model",
      popup: [2, "popup", "popup", booleanAttribute],
      style: "style",
      styleClass: "styleClass",
      autoZIndex: [2, "autoZIndex", "autoZIndex", booleanAttribute],
      baseZIndex: [2, "baseZIndex", "baseZIndex", numberAttribute],
      showTransitionOptions: "showTransitionOptions",
      hideTransitionOptions: "hideTransitionOptions",
      ariaLabel: "ariaLabel",
      ariaLabelledBy: "ariaLabelledBy",
      id: "id",
      tabindex: [2, "tabindex", "tabindex", numberAttribute],
      appendTo: [1, "appendTo"],
      motionOptions: [1, "motionOptions"]
    },
    outputs: {
      onShow: "onShow",
      onHide: "onHide",
      onBlur: "onBlur",
      onFocus: "onFocus"
    },
    features: [\u0275\u0275ProvidersFeature([MenuStyle, {
      provide: MENU_INSTANCE,
      useExisting: _Menu
    }, {
      provide: PARENT_INSTANCE,
      useExisting: _Menu
    }]), \u0275\u0275HostDirectivesFeature([Bind]), \u0275\u0275InheritDefinitionFeature],
    decls: 1,
    vars: 1,
    consts: [["container", ""], ["list", ""], ["htmlSubmenuLabel", ""], [3, "class", "style", "ngStyle", "pBind", "pMotion", "pMotionName", "pMotionAppear", "pMotionDisabled", "pMotionOptions"], [3, "click", "pMotionOnBeforeEnter", "pMotionOnAfterLeave", "ngStyle", "pBind", "pMotion", "pMotionName", "pMotionAppear", "pMotionDisabled", "pMotionOptions"], [3, "class", "pBind", 4, "ngIf"], ["role", "menu", 3, "focus", "blur", "keydown", "pBind"], [4, "ngIf"], [3, "pBind"], [4, "ngTemplateOutlet"], ["ngFor", "", 3, "ngForOf"], ["role", "separator", 3, "class", "pBind", 4, "ngIf"], ["pTooltip", "", "role", "none", 3, "class", "pBind", "tooltipOptions", "pTooltipUnstyled", 4, "ngIf"], ["role", "separator", 3, "pBind"], ["pTooltip", "", "role", "none", 3, "pBind", "tooltipOptions", "pTooltipUnstyled"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [4, "ngIf", "ngIfElse"], [3, "innerHTML"], ["pTooltip", "", "role", "menuitem", 3, "class", "pBind", "pMenuItemContent", "itemTemplate", "idx", "menuitemId", "style", "tooltipOptions", "pTooltipUnstyled", "unstyled", "onMenuItemClick", 4, "ngIf"], ["pTooltip", "", "role", "menuitem", 3, "onMenuItemClick", "pBind", "pMenuItemContent", "itemTemplate", "idx", "menuitemId", "tooltipOptions", "pTooltipUnstyled", "unstyled"], ["pTooltip", "", "role", "menuitem", 3, "class", "pBind", "pMenuItemContent", "itemTemplate", "idx", "menuitemId", "ngStyle", "tooltipOptions", "unstyled", "pTooltipUnstyled", "onMenuItemClick", 4, "ngIf"], ["pTooltip", "", "role", "menuitem", 3, "onMenuItemClick", "pBind", "pMenuItemContent", "itemTemplate", "idx", "menuitemId", "ngStyle", "tooltipOptions", "unstyled", "pTooltipUnstyled"]],
    template: function Menu_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275conditionalCreate(0, Menu_Conditional_0_Template, 8, 26, "div", 3);
      }
      if (rf & 2) {
        \u0275\u0275conditional(!ctx.popup || ctx.overlayVisible ? 0 : -1);
      }
    },
    dependencies: [CommonModule, NgForOf, NgIf, NgTemplateOutlet, NgStyle, RouterModule, MenuItemContent, TooltipModule, Tooltip, Bind, BadgeModule, SharedModule, BindModule, MotionModule, MotionDirective, SafeHtmlPipe],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Menu, [{
    type: Component,
    args: [{
      selector: "p-menu",
      standalone: true,
      imports: [CommonModule, RouterModule, MenuItemContent, TooltipModule, BadgeModule, SharedModule, SafeHtmlPipe, BindModule, MotionModule],
      template: `
        @if (!popup || overlayVisible) {
            <div
                #container
                [class]="cn(cx('root'), styleClass)"
                [style]="sx('root')"
                [ngStyle]="style"
                (click)="onOverlayClick($event)"
                [attr.id]="id"
                [pBind]="ptm('root')"
                [attr.data-p]="dataP"
                [pMotion]="visible || !popup"
                [pMotionName]="'p-anchored-overlay'"
                [pMotionAppear]="!!popup"
                [pMotionDisabled]="!popup"
                [pMotionOptions]="computedMotionOptions()"
                (pMotionOnBeforeEnter)="onOverlayBeforeEnter($event)"
                (pMotionOnAfterLeave)="onOverlayAfterLeave()"
            >
                <div *ngIf="startTemplate ?? _startTemplate" [class]="cx('start')" [pBind]="ptm('start')" [attr.data-pc-section]="'start'">
                    <ng-container *ngTemplateOutlet="startTemplate ?? _startTemplate"></ng-container>
                </div>
                <ul
                    #list
                    [class]="cx('list')"
                    [pBind]="ptm('list')"
                    role="menu"
                    [attr.id]="id + '_list'"
                    [attr.tabindex]="getTabIndexValue()"
                    [attr.data-pc-section]="'menu'"
                    [attr.aria-activedescendant]="activedescendant()"
                    [attr.aria-label]="ariaLabel"
                    [attr.aria-labelledBy]="ariaLabelledBy"
                    (focus)="onListFocus($event)"
                    (blur)="onListBlur($event)"
                    (keydown)="onListKeyDown($event)"
                >
                    <ng-template ngFor let-submenu let-i="index" [ngForOf]="model" *ngIf="hasSubMenu()">
                        <li [class]="cx('separator')" [pBind]="ptm('separator')" *ngIf="submenu.separator && submenu.visible !== false" role="separator" [attr.data-pc-section]="'separator'"></li>
                        <li
                            [class]="cx('submenuLabel')"
                            [pBind]="ptm('submenuLabel')"
                            [attr.data-automationid]="submenu.automationId"
                            *ngIf="!submenu.separator"
                            pTooltip
                            [tooltipOptions]="submenu.tooltipOptions"
                            [pTooltipUnstyled]="unstyled()"
                            role="none"
                            [attr.id]="menuitemId(submenu, id, i)"
                            [attr.data-pc-section]="'submenulabel'"
                        >
                            <ng-container *ngIf="!submenuHeaderTemplate && !_submenuHeaderTemplate">
                                <span *ngIf="submenu.escape !== false; else htmlSubmenuLabel">{{ submenu.label }}</span>
                                <ng-template #htmlSubmenuLabel><span [innerHTML]="submenu.label | safeHtml"></span></ng-template>
                            </ng-container>
                            <ng-container *ngTemplateOutlet="submenuHeaderTemplate ?? _submenuHeaderTemplate; context: { $implicit: submenu }"></ng-container>
                        </li>
                        <ng-template ngFor let-item let-j="index" [ngForOf]="submenu.items">
                            <li [class]="cx('separator')" [pBind]="ptm('separator')" *ngIf="item.separator && (item.visible !== false || submenu.visible !== false)" role="separator" [attr.data-pc-section]="'separator'"></li>
                            <li
                                [class]="cn(cx('item', { item, id: menuitemId(item, id, i, j) }), item?.styleClass)"
                                [pBind]="ptm('item')"
                                *ngIf="!item.separator && item.visible !== false && (item.visible !== undefined || submenu.visible !== false)"
                                [pMenuItemContent]="item"
                                [itemTemplate]="itemTemplate ?? _itemTemplate"
                                [idx]="j"
                                [menuitemId]="menuitemId(item, id, i, j)"
                                [style]="item.style"
                                (onMenuItemClick)="itemClick($event, menuitemId(item, id, i, j))"
                                pTooltip
                                [tooltipOptions]="item.tooltipOptions"
                                [pTooltipUnstyled]="unstyled()"
                                [unstyled]="unstyled()"
                                role="menuitem"
                                [attr.aria-label]="label(item.label)"
                                [attr.data-p-focused]="isItemFocused(menuitemId(item, id, i, j))"
                                [attr.data-p-disabled]="disabled(item.disabled)"
                                [attr.aria-disabled]="disabled(item.disabled)"
                                [attr.id]="menuitemId(item, id, i, j)"
                            ></li>
                        </ng-template>
                    </ng-template>
                    <ng-template ngFor let-item let-i="index" [ngForOf]="model" *ngIf="!hasSubMenu()">
                        <li [class]="cx('separator')" [pBind]="ptm('separator')" *ngIf="item.separator && item.visible !== false" role="separator" [attr.data-pc-section]="'separator'"></li>
                        <li
                            [class]="cn(cx('item', { item, id: menuitemId(item, id, i) }), item?.styleClass)"
                            [pBind]="ptm('item')"
                            *ngIf="!item.separator && item.visible !== false"
                            [pMenuItemContent]="item"
                            [itemTemplate]="itemTemplate ?? _itemTemplate"
                            [idx]="i"
                            [menuitemId]="menuitemId(item, id, i)"
                            [ngStyle]="item.style"
                            (onMenuItemClick)="itemClick($event, menuitemId(item, id, i))"
                            pTooltip
                            [tooltipOptions]="item.tooltipOptions"
                            [unstyled]="unstyled()"
                            [pTooltipUnstyled]="unstyled()"
                            role="menuitem"
                            [attr.aria-label]="label(item.label)"
                            [attr.data-p-focused]="isItemFocused(menuitemId(item, id, i))"
                            [attr.data-p-disabled]="disabled(item.disabled)"
                            [attr.aria-disabled]="disabled(item.disabled)"
                            [attr.id]="menuitemId(item, id, i)"
                        ></li>
                    </ng-template>
                </ul>
                <div *ngIf="endTemplate ?? _endTemplate" [class]="cx('end')" [pBind]="ptm('end')" [attr.data-pc-section]="'end'">
                    <ng-container *ngTemplateOutlet="endTemplate ?? _endTemplate"></ng-container>
                </div>
            </div>
        }
    `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [MenuStyle, {
        provide: MENU_INSTANCE,
        useExisting: Menu
      }, {
        provide: PARENT_INSTANCE,
        useExisting: Menu
      }],
      hostDirectives: [Bind]
    }]
  }], () => [{
    type: OverlayService
  }], {
    model: [{
      type: Input
    }],
    popup: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    style: [{
      type: Input
    }],
    styleClass: [{
      type: Input
    }],
    autoZIndex: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    baseZIndex: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    showTransitionOptions: [{
      type: Input
    }],
    hideTransitionOptions: [{
      type: Input
    }],
    ariaLabel: [{
      type: Input
    }],
    ariaLabelledBy: [{
      type: Input
    }],
    id: [{
      type: Input
    }],
    tabindex: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    appendTo: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "appendTo",
        required: false
      }]
    }],
    motionOptions: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "motionOptions",
        required: false
      }]
    }],
    onShow: [{
      type: Output
    }],
    onHide: [{
      type: Output
    }],
    onBlur: [{
      type: Output
    }],
    onFocus: [{
      type: Output
    }],
    listViewChild: [{
      type: ViewChild,
      args: ["list", {
        isSignal: true
      }]
    }],
    containerViewChild: [{
      type: ViewChild,
      args: ["container", {
        isSignal: true
      }]
    }],
    startTemplate: [{
      type: ContentChild,
      args: ["start", {
        descendants: false
      }]
    }],
    endTemplate: [{
      type: ContentChild,
      args: ["end", {
        descendants: false
      }]
    }],
    headerTemplate: [{
      type: ContentChild,
      args: ["header", {
        descendants: false
      }]
    }],
    itemTemplate: [{
      type: ContentChild,
      args: ["item", {
        descendants: false
      }]
    }],
    submenuHeaderTemplate: [{
      type: ContentChild,
      args: ["submenuheader", {
        descendants: false
      }]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var MenuModule = class _MenuModule {
  static \u0275fac = function MenuModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MenuModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _MenuModule,
    imports: [Menu, SharedModule, SafeHtmlPipe],
    exports: [Menu, SharedModule, SafeHtmlPipe]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    imports: [Menu, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MenuModule, [{
    type: NgModule,
    args: [{
      imports: [Menu, SharedModule, SafeHtmlPipe],
      exports: [Menu, SharedModule, SafeHtmlPipe]
    }]
  }], null, null);
})();

// node_modules/@primeuix/styles/dist/toolbar/index.mjs
var style2 = "\n    .p-toolbar {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        flex-wrap: wrap;\n        padding: dt('toolbar.padding');\n        background: dt('toolbar.background');\n        border: 1px solid dt('toolbar.border.color');\n        color: dt('toolbar.color');\n        border-radius: dt('toolbar.border.radius');\n        gap: dt('toolbar.gap');\n    }\n\n    .p-toolbar-start,\n    .p-toolbar-center,\n    .p-toolbar-end {\n        display: flex;\n        align-items: center;\n    }\n";

// node_modules/primeng/fesm2022/primeng-toolbar.mjs
var _c03 = ["start"];
var _c12 = ["end"];
var _c22 = ["center"];
var _c32 = ["*"];
function Toolbar_div_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function Toolbar_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275template(1, Toolbar_div_1_ng_container_1_Template, 1, 0, "ng-container", 2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r0.cx("start"));
    \u0275\u0275property("pBind", ctx_r0.ptm("start"));
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r0.startTemplate || ctx_r0._startTemplate);
  }
}
function Toolbar_div_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function Toolbar_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275template(1, Toolbar_div_2_ng_container_1_Template, 1, 0, "ng-container", 2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r0.cx("center"));
    \u0275\u0275property("pBind", ctx_r0.ptm("center"));
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r0.centerTemplate || ctx_r0._centerTemplate);
  }
}
function Toolbar_div_3_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function Toolbar_div_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275template(1, Toolbar_div_3_ng_container_1_Template, 1, 0, "ng-container", 2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r0.cx("end"));
    \u0275\u0275property("pBind", ctx_r0.ptm("end"));
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r0.endTemplate || ctx_r0._endTemplate);
  }
}
var classes2 = {
  root: () => ["p-toolbar p-component"],
  start: "p-toolbar-start",
  center: "p-toolbar-center",
  end: "p-toolbar-end"
};
var ToolbarStyle = class _ToolbarStyle extends BaseStyle {
  name = "toolbar";
  style = style2;
  classes = classes2;
  static \u0275fac = /* @__PURE__ */ (() => {
    let \u0275ToolbarStyle_BaseFactory;
    return function ToolbarStyle_Factory(__ngFactoryType__) {
      return (\u0275ToolbarStyle_BaseFactory || (\u0275ToolbarStyle_BaseFactory = \u0275\u0275getInheritedFactory(_ToolbarStyle)))(__ngFactoryType__ || _ToolbarStyle);
    };
  })();
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _ToolbarStyle,
    factory: _ToolbarStyle.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToolbarStyle, [{
    type: Injectable
  }], null, null);
})();
var ToolbarClasses;
(function(ToolbarClasses2) {
  ToolbarClasses2["root"] = "p-toolbar";
  ToolbarClasses2["start"] = "p-toolbar-start";
  ToolbarClasses2["center"] = "p-toolbar-center";
  ToolbarClasses2["end"] = "p-toolbar-end";
})(ToolbarClasses || (ToolbarClasses = {}));
var TOOLBAR_INSTANCE = new InjectionToken("TOOLBAR_INSTANCE");
var Toolbar = class _Toolbar extends BaseComponent {
  componentName = "Toolbar";
  $pcToolbar = inject(TOOLBAR_INSTANCE, {
    optional: true,
    skipSelf: true
  }) ?? void 0;
  bindDirectiveInstance = inject(Bind, {
    self: true
  });
  onAfterViewChecked() {
    this.bindDirectiveInstance.setAttrs(this.ptms(["host", "root"]));
  }
  /**
   * Style class of the component.
   * @deprecated since v20.0.0, use `class` instead.
   * @group Props
   */
  styleClass;
  /**
   * Defines a string value that labels an interactive element.
   * @group Props
   */
  ariaLabelledBy;
  _componentStyle = inject(ToolbarStyle);
  getBlockableElement() {
    return this.el.nativeElement.children[0];
  }
  /**
   * Custom start template.
   * @group Templates
   */
  startTemplate;
  /**
   * Custom end template.
   * @group Templates
   */
  endTemplate;
  /**
   * Custom center template.
   * @group Templates
   */
  centerTemplate;
  templates;
  _startTemplate;
  _endTemplate;
  _centerTemplate;
  onAfterContentInit() {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case "start":
        case "left":
          this._startTemplate = item.template;
          break;
        case "end":
        case "right":
          this._endTemplate = item.template;
          break;
        case "center":
          this._centerTemplate = item.template;
          break;
      }
    });
  }
  static \u0275fac = /* @__PURE__ */ (() => {
    let \u0275Toolbar_BaseFactory;
    return function Toolbar_Factory(__ngFactoryType__) {
      return (\u0275Toolbar_BaseFactory || (\u0275Toolbar_BaseFactory = \u0275\u0275getInheritedFactory(_Toolbar)))(__ngFactoryType__ || _Toolbar);
    };
  })();
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _Toolbar,
    selectors: [["p-toolbar"]],
    contentQueries: function Toolbar_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        \u0275\u0275contentQuery(dirIndex, _c03, 4)(dirIndex, _c12, 4)(dirIndex, _c22, 4)(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.startTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.endTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.centerTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.templates = _t);
      }
    },
    hostAttrs: ["role", "toolbar"],
    hostVars: 3,
    hostBindings: function Toolbar_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275attribute("aria-labelledby", ctx.ariaLabelledBy);
        \u0275\u0275classMap(ctx.cn(ctx.cx("root"), ctx.styleClass));
      }
    },
    inputs: {
      styleClass: "styleClass",
      ariaLabelledBy: "ariaLabelledBy"
    },
    features: [\u0275\u0275ProvidersFeature([ToolbarStyle, {
      provide: TOOLBAR_INSTANCE,
      useExisting: _Toolbar
    }, {
      provide: PARENT_INSTANCE,
      useExisting: _Toolbar
    }]), \u0275\u0275HostDirectivesFeature([Bind]), \u0275\u0275InheritDefinitionFeature],
    ngContentSelectors: _c32,
    decls: 4,
    vars: 3,
    consts: [[3, "class", "pBind", 4, "ngIf"], [3, "pBind"], [4, "ngTemplateOutlet"]],
    template: function Toolbar_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275projectionDef();
        \u0275\u0275projection(0);
        \u0275\u0275template(1, Toolbar_div_1_Template, 2, 4, "div", 0)(2, Toolbar_div_2_Template, 2, 4, "div", 0)(3, Toolbar_div_3_Template, 2, 4, "div", 0);
      }
      if (rf & 2) {
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.startTemplate || ctx._startTemplate);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.centerTemplate || ctx._centerTemplate);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.endTemplate || ctx._endTemplate);
      }
    },
    dependencies: [CommonModule, NgIf, NgTemplateOutlet, SharedModule, BindModule, Bind],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Toolbar, [{
    type: Component,
    args: [{
      selector: "p-toolbar",
      standalone: true,
      imports: [CommonModule, SharedModule, BindModule],
      template: `
        <ng-content></ng-content>
        <div [class]="cx('start')" *ngIf="startTemplate || _startTemplate" [pBind]="ptm('start')">
            <ng-container *ngTemplateOutlet="startTemplate || _startTemplate"></ng-container>
        </div>
        <div [class]="cx('center')" *ngIf="centerTemplate || _centerTemplate" [pBind]="ptm('center')">
            <ng-container *ngTemplateOutlet="centerTemplate || _centerTemplate"></ng-container>
        </div>
        <div [class]="cx('end')" *ngIf="endTemplate || _endTemplate" [pBind]="ptm('end')">
            <ng-container *ngTemplateOutlet="endTemplate || _endTemplate"></ng-container>
        </div>
    `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [ToolbarStyle, {
        provide: TOOLBAR_INSTANCE,
        useExisting: Toolbar
      }, {
        provide: PARENT_INSTANCE,
        useExisting: Toolbar
      }],
      host: {
        "[class]": 'cn(cx("root"), styleClass)',
        role: "toolbar",
        "[attr.aria-labelledby]": "ariaLabelledBy"
      },
      hostDirectives: [Bind]
    }]
  }], null, {
    styleClass: [{
      type: Input
    }],
    ariaLabelledBy: [{
      type: Input
    }],
    startTemplate: [{
      type: ContentChild,
      args: ["start", {
        descendants: false
      }]
    }],
    endTemplate: [{
      type: ContentChild,
      args: ["end", {
        descendants: false
      }]
    }],
    centerTemplate: [{
      type: ContentChild,
      args: ["center", {
        descendants: false
      }]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var ToolbarModule = class _ToolbarModule {
  static \u0275fac = function ToolbarModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ToolbarModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ToolbarModule,
    imports: [Toolbar, SharedModule, BindModule],
    exports: [Toolbar, SharedModule, BindModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    imports: [Toolbar, SharedModule, BindModule, SharedModule, BindModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToolbarModule, [{
    type: NgModule,
    args: [{
      imports: [Toolbar, SharedModule, BindModule],
      exports: [Toolbar, SharedModule, BindModule]
    }]
  }], null, null);
})();

// src/app/core/services/realtime-notification.service.ts
var RealtimeNotificationService = class _RealtimeNotificationService {
  toast = inject(MessageService);
  auth = inject(AuthService);
  socket = null;
  reconnectTimer = null;
  heartbeatTimer = null;
  reconnectAttempts = 0;
  intentionallyClosed = false;
  reconnectInterval = environment.websocket.reconnectInterval || 5e3;
  maxReconnectAttempts = environment.websocket.maxReconnectAttempts || 10;
  heartbeatInterval = 3e4;
  // 30s ping to keep connection alive
  connect() {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN)
      return;
    const token = this.auth.getToken();
    if (!token) {
      return;
    }
    this.intentionallyClosed = false;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.socket = new WebSocket(`${protocol}//${window.location.host}/api/notifications/ws?token=${encodeURIComponent(token)}`);
    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    this.socket.onmessage = (event) => this.handleMessage(event.data);
    this.socket.onerror = (event) => {
      if (!environment.production) {
        console.warn("[RealtimeNotification] WebSocket error", event);
      }
    };
    this.socket.onclose = () => {
      this.socket = null;
      this.stopHeartbeat();
      if (!this.intentionallyClosed) {
        this.scheduleReconnect();
      }
    };
  }
  disconnect() {
    this.intentionallyClosed = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  ngOnDestroy() {
    this.disconnect();
  }
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (!environment.production) {
        console.warn("[RealtimeNotification] Max reconnect attempts reached");
      }
      return;
    }
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts), 6e4);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, this.heartbeatInterval);
  }
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  handleMessage(raw) {
    try {
      const message = JSON.parse(raw);
      if (message.type === "pong")
        return;
      if (message.type === "mapping.published") {
        this.toast.add({
          severity: "success",
          summary: "Mapping published",
          detail: `${message.name} v${message.version}`
        });
      } else if (message.type === "alert.fired") {
        this.toast.add({
          severity: message.severity ?? "warn",
          summary: message.title ?? "Alert fired",
          detail: message.detail
        });
      }
    } catch (e) {
      if (!environment.production) {
        console.warn("[RealtimeNotification] Malformed message:", raw);
      }
    }
  }
  static \u0275fac = function RealtimeNotificationService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _RealtimeNotificationService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _RealtimeNotificationService, factory: _RealtimeNotificationService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RealtimeNotificationService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/layout/topbar/topbar.component.ts
function TopbarComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 4)(1, "p-button", 5);
    \u0275\u0275pipe(2, "i18n");
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275listener("onClick", function TopbarComponent_ng_template_2_Template_p_button_onClick_1_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleSidebar.emit());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 6);
    \u0275\u0275element(5, "img", 7);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("rounded", true)("text", true)("pTooltip", \u0275\u0275pipeBind1(2, 5, "topbar.toggleSidebar"));
    \u0275\u0275attribute("aria-label", \u0275\u0275pipeBind1(3, 7, "topbar.toggleSidebar"))("aria-expanded", !ctx_r1.collapsed);
  }
}
function TopbarComponent_ng_template_3_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "p-tag", 9);
    \u0275\u0275pipe(1, "i18n");
  }
  if (rf & 2) {
    \u0275\u0275property("value", \u0275\u0275pipeBind1(1, 2, "topbar.demo"))("rounded", true);
  }
}
function TopbarComponent_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275conditionalCreate(1, TopbarComponent_ng_template_3_Conditional_1_Template, 2, 4, "p-tag", 9);
    \u0275\u0275elementStart(2, "p-button", 10);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275pipe(5, "i18n");
    \u0275\u0275pipe(6, "i18n");
    \u0275\u0275listener("onClick", function TopbarComponent_ng_template_3_Template_p_button_onClick_2_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleTheme());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 11)(8, "label", 12);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "p-select", 13);
    \u0275\u0275pipe(12, "i18n");
    \u0275\u0275listener("ngModelChange", function TopbarComponent_ng_template_3_Template_p_select_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onLangChange($event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "button", 14);
    \u0275\u0275listener("click", function TopbarComponent_ng_template_3_Template_button_click_13_listener($event) {
      \u0275\u0275restoreView(_r3);
      const userMenu_r4 = \u0275\u0275reference(17);
      return \u0275\u0275resetView(userMenu_r4.toggle($event));
    });
    \u0275\u0275element(14, "p-avatar", 15)(15, "i", 16);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "p-menu", 17, 0);
    \u0275\u0275listener("onShow", function TopbarComponent_ng_template_3_Template_p_menu_onShow_16_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.userMenuOpen = true);
    })("onHide", function TopbarComponent_ng_template_3_Template_p_menu_onHide_16_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.userMenuOpen = false);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_13_0;
    let tmp_16_0;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.demoModeEnabled ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275property("icon", ctx_r1.theme.darkMode() ? "pi pi-sun" : "pi pi-moon")("rounded", true)("text", true)("pTooltip", ctx_r1.theme.darkMode() ? \u0275\u0275pipeBind1(3, 18, "topbar.lightMode") : \u0275\u0275pipeBind1(4, 20, "topbar.darkMode"));
    \u0275\u0275attribute("aria-label", ctx_r1.theme.darkMode() ? \u0275\u0275pipeBind1(5, 22, "topbar.lightMode") : \u0275\u0275pipeBind1(6, 24, "topbar.darkMode"))("aria-pressed", ctx_r1.theme.darkMode());
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 26, "topbar.language"));
    \u0275\u0275advance(2);
    \u0275\u0275property("options", ctx_r1.langOptions)("ngModel", ctx_r1.i18n.lang());
    \u0275\u0275attribute("aria-label", \u0275\u0275pipeBind1(12, 28, "topbar.language"));
    \u0275\u0275advance(2);
    \u0275\u0275attribute("aria-label", "User menu for " + (((tmp_13_0 = ctx_r1.auth.currentUser()) == null ? null : tmp_13_0.name) ?? "User"))("aria-expanded", ctx_r1.userMenuOpen)("aria-haspopup", true);
    \u0275\u0275advance();
    \u0275\u0275property("label", ((tmp_16_0 = ctx_r1.auth.currentUser()) == null ? null : tmp_16_0.avatarInitials) ?? "U");
    \u0275\u0275attribute("aria-hidden", true);
    \u0275\u0275advance(2);
    \u0275\u0275property("model", ctx_r1.userMenuItems)("popup", true);
  }
}
var TopbarComponent = class _TopbarComponent {
  collapsed = false;
  toggleSidebar = new EventEmitter();
  auth = inject(AuthService);
  i18n = inject(I18nService);
  theme = inject(ThemeService);
  realtimeNotifications = inject(RealtimeNotificationService);
  demoModeEnabled = environment.features.enableDemoMode;
  userMenuOpen = false;
  langOptions = [
    { label: "\u{1F1EC}\u{1F1E7} EN", value: "en" },
    { label: "\u{1F1F9}\u{1F1F7} TR", value: "tr" }
  ];
  userMenuItems = [];
  constructor() {
    this.realtimeNotifications.connect();
    effect(() => {
      this.i18n.translations();
      this.userMenuItems = [
        { label: this.i18n.translate("topbar.profile"), icon: "pi pi-user", command: () => {
        } },
        { separator: true },
        {
          label: this.i18n.translate("topbar.signOut"),
          icon: "pi pi-sign-out",
          command: () => this.auth.logout()
        }
      ];
    });
  }
  async onLangChange(lang) {
    await this.i18n.setLang(lang);
  }
  toggleTheme() {
    this.theme.toggle();
  }
  static \u0275fac = function TopbarComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TopbarComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _TopbarComponent, selectors: [["app-topbar"]], inputs: { collapsed: "collapsed" }, outputs: { toggleSidebar: "toggleSidebar" }, features: [\u0275\u0275ProvidersFeature([])], decls: 4, vars: 0, consts: [["userMenu", ""], ["styleClass", "layout-toolbar border-none border-bottom-1 surface-border border-round-none", "role", "banner"], ["pTemplate", "start"], ["pTemplate", "end"], [1, "flex", "align-items-center", "gap-2"], ["icon", "pi pi-bars", "severity", "secondary", "tooltipPosition", "bottom", 3, "onClick", "rounded", "text", "pTooltip"], [1, "layout-topbar-heading", "hidden", "md:flex", "align-items-center"], ["src", "img/canonbridge-logo.svg", "alt", "CanonBridge", 1, "layout-topbar-logo"], ["id", "page-actions", "role", "toolbar", "aria-label", "Page actions", 1, "flex", "align-items-center", "flex-wrap", "gap-1", "md:gap-2"], ["severity", "warn", "role", "status", "aria-label", "Demo mode active", 3, "value", "rounded"], ["severity", "secondary", "tooltipPosition", "bottom", 3, "onClick", "icon", "rounded", "text", "pTooltip"], [1, "lang-wrap"], ["for", "lang-select", 1, "sr-only"], ["inputId", "lang-select", "optionLabel", "label", "optionValue", "value", "styleClass", "lang-select", 3, "ngModelChange", "options", "ngModel"], ["type", "button", 1, "user-menu-trigger", "flex", "align-items-center", "gap-2", 3, "click"], ["shape", "circle", "styleClass", "layout-avatar", 3, "label"], ["aria-hidden", "true", 1, "pi", "pi-chevron-down", "text-xs", "text-color-secondary", "hidden", "lg:inline"], [3, "onShow", "onHide", "model", "popup"]], template: function TopbarComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "p-toast");
      \u0275\u0275elementStart(1, "p-toolbar", 1);
      \u0275\u0275template(2, TopbarComponent_ng_template_2_Template, 6, 9, "ng-template", 2)(3, TopbarComponent_ng_template_3_Template, 18, 30, "ng-template", 3);
      \u0275\u0275elementEnd();
    }
  }, dependencies: [FormsModule, NgControlStatus, NgModel, ButtonModule, Button, PrimeTemplate, AvatarModule, Avatar, MenuModule, Menu, TooltipModule, Tooltip, SelectModule, Select, ToolbarModule, Toolbar, TagModule, Tag, ToastModule, Toast, I18nPipe], styles: ["\n[_nghost-%COMP%] {\n  display: block;\n  flex-shrink: 0;\n  z-index: 105;\n}\n[_nghost-%COMP%]     .layout-toolbar.p-toolbar {\n  padding: 0.65rem 1.25rem;\n  background: color-mix(in srgb, var(--surface-card) 88%, var(--surface-ground));\n  -webkit-backdrop-filter: blur(12px);\n  backdrop-filter: blur(12px);\n  border-radius: 0;\n}\nhtml.dark-mode   [_nghost-%COMP%]     .layout-toolbar.p-toolbar {\n  background: color-mix(in srgb, var(--surface-card) 92%, transparent);\n}\n.layout-topbar-logo[_ngcontent-%COMP%] {\n  height: 2rem;\n  width: auto;\n  object-fit: contain;\n  display: block;\n  color: var(--text-color);\n}\n.lang-wrap[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n[_nghost-%COMP%]     .lang-select {\n  min-width: 7.25rem;\n}\n[_nghost-%COMP%]     .layout-avatar {\n  width: 2.25rem !important;\n  height: 2.25rem !important;\n  font-size: 0.75rem !important;\n  background:\n    linear-gradient(\n      145deg,\n      var(--primary-color),\n      var(--cb-color-violet-600)) !important;\n  color: #fff !important;\n  font-weight: 600 !important;\n  box-shadow: 0 1px 4px color-mix(in srgb, var(--primary-color) 40%, transparent);\n}\n.user-menu-trigger[_ngcontent-%COMP%] {\n  padding: 0.25rem 0.35rem;\n  border-radius: var(--border-radius-lg, 10px);\n  cursor: pointer;\n  transition: background 0.15s;\n  border: none;\n  background: transparent;\n  font: inherit;\n  color: inherit;\n}\n.user-menu-trigger[_ngcontent-%COMP%]:hover {\n  background: var(--surface-hover);\n}\n.sr-only[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n/*# sourceMappingURL=topbar.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TopbarComponent, [{
    type: Component,
    args: [{ selector: "app-topbar", standalone: true, imports: [
      FormsModule,
      ButtonModule,
      AvatarModule,
      MenuModule,
      TooltipModule,
      SelectModule,
      ToolbarModule,
      TagModule,
      ToastModule,
      I18nPipe
    ], providers: [], template: `<p-toast />

<p-toolbar styleClass="layout-toolbar border-none border-bottom-1 surface-border border-round-none" role="banner">
  <ng-template pTemplate="start">
    <div class="flex align-items-center gap-2">
      <p-button
        icon="pi pi-bars"
        [rounded]="true"
        [text]="true"
        severity="secondary"
        (onClick)="toggleSidebar.emit()"
        [pTooltip]="'topbar.toggleSidebar' | i18n"
        tooltipPosition="bottom"
        [attr.aria-label]="'topbar.toggleSidebar' | i18n"
        [attr.aria-expanded]="!collapsed" />
      <div class="layout-topbar-heading hidden md:flex align-items-center">
        <img
          src="img/canonbridge-logo.svg"
          alt="CanonBridge"
          class="layout-topbar-logo" />
      </div>
    </div>
  </ng-template>

  <ng-template pTemplate="end">
    <div id="page-actions" class="flex align-items-center flex-wrap gap-1 md:gap-2" role="toolbar" aria-label="Page actions">
      @if (demoModeEnabled) {
        <p-tag [value]="'topbar.demo' | i18n" severity="warn" [rounded]="true" role="status" aria-label="Demo mode active" />
      }
      <p-button
        [icon]="theme.darkMode() ? 'pi pi-sun' : 'pi pi-moon'"
        [rounded]="true"
        [text]="true"
        severity="secondary"
        (onClick)="toggleTheme()"
        [pTooltip]="theme.darkMode() ? ('topbar.lightMode' | i18n) : ('topbar.darkMode' | i18n)"
        tooltipPosition="bottom"
        [attr.aria-label]="theme.darkMode() ? ('topbar.lightMode' | i18n) : ('topbar.darkMode' | i18n)"
        [attr.aria-pressed]="theme.darkMode()" />

      <div class="lang-wrap">
        <label class="sr-only" for="lang-select">{{ 'topbar.language' | i18n }}</label>
        <p-select
          inputId="lang-select"
          [options]="langOptions"
          optionLabel="label"
          optionValue="value"
          [ngModel]="i18n.lang()"
          (ngModelChange)="onLangChange($event)"
          styleClass="lang-select"
          [attr.aria-label]="'topbar.language' | i18n" />
      </div>

      <button class="user-menu-trigger flex align-items-center gap-2" 
           (click)="userMenu.toggle($event)"
           type="button"
           [attr.aria-label]="'User menu for ' + (auth.currentUser()?.name ?? 'User')"
           [attr.aria-expanded]="userMenuOpen"
           [attr.aria-haspopup]="true">
        <p-avatar
          [label]="auth.currentUser()?.avatarInitials ?? 'U'"
          shape="circle"
          styleClass="layout-avatar"
          [attr.aria-hidden]="true" />
        <i class="pi pi-chevron-down text-xs text-color-secondary hidden lg:inline" aria-hidden="true"></i>
      </button>

      <p-menu #userMenu [model]="userMenuItems" [popup]="true" (onShow)="userMenuOpen = true" (onHide)="userMenuOpen = false" />
    </div>
  </ng-template>
</p-toolbar>
`, styles: ["/* src/app/layout/topbar/topbar.component.scss */\n:host {\n  display: block;\n  flex-shrink: 0;\n  z-index: 105;\n}\n:host ::ng-deep .layout-toolbar.p-toolbar {\n  padding: 0.65rem 1.25rem;\n  background: color-mix(in srgb, var(--surface-card) 88%, var(--surface-ground));\n  -webkit-backdrop-filter: blur(12px);\n  backdrop-filter: blur(12px);\n  border-radius: 0;\n}\nhtml.dark-mode :host ::ng-deep .layout-toolbar.p-toolbar {\n  background: color-mix(in srgb, var(--surface-card) 92%, transparent);\n}\n.layout-topbar-logo {\n  height: 2rem;\n  width: auto;\n  object-fit: contain;\n  display: block;\n  color: var(--text-color);\n}\n.lang-wrap {\n  min-width: 0;\n}\n:host ::ng-deep .lang-select {\n  min-width: 7.25rem;\n}\n:host ::ng-deep .layout-avatar {\n  width: 2.25rem !important;\n  height: 2.25rem !important;\n  font-size: 0.75rem !important;\n  background:\n    linear-gradient(\n      145deg,\n      var(--primary-color),\n      var(--cb-color-violet-600)) !important;\n  color: #fff !important;\n  font-weight: 600 !important;\n  box-shadow: 0 1px 4px color-mix(in srgb, var(--primary-color) 40%, transparent);\n}\n.user-menu-trigger {\n  padding: 0.25rem 0.35rem;\n  border-radius: var(--border-radius-lg, 10px);\n  cursor: pointer;\n  transition: background 0.15s;\n  border: none;\n  background: transparent;\n  font: inherit;\n  color: inherit;\n}\n.user-menu-trigger:hover {\n  background: var(--surface-hover);\n}\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n/*# sourceMappingURL=topbar.component.css.map */\n"] }]
  }], () => [], { collapsed: [{
    type: Input
  }], toggleSidebar: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(TopbarComponent, { className: "TopbarComponent", filePath: "src/app/layout/topbar/topbar.component.ts", lineNumber: 39 });
})();

// src/app/layout/skip-links/skip-links.component.ts
var SkipLinksComponent = class _SkipLinksComponent {
  static \u0275fac = function SkipLinksComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SkipLinksComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SkipLinksComponent, selectors: [["app-skip-links"]], decls: 10, vars: 9, consts: [["role", "navigation", "aria-label", "Skip navigation", 1, "skip-links"], ["href", "#main-content", 1, "skip-link"], ["href", "#primary-navigation", 1, "skip-link"], ["href", "#page-actions", 1, "skip-link"]], template: function SkipLinksComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0)(1, "a", 1);
      \u0275\u0275text(2);
      \u0275\u0275pipe(3, "i18n");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(4, "a", 2);
      \u0275\u0275text(5);
      \u0275\u0275pipe(6, "i18n");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(7, "a", 3);
      \u0275\u0275text(8);
      \u0275\u0275pipe(9, "i18n");
      \u0275\u0275domElementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(3, 3, "accessibility.skipToMain"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(6, 5, "accessibility.skipToNav"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(9, 7, "accessibility.skipToActions"), " ");
    }
  }, dependencies: [I18nPipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SkipLinksComponent, [{
    type: Component,
    args: [{ selector: "app-skip-links", standalone: true, imports: [I18nPipe], template: `
    <div class="skip-links" role="navigation" aria-label="Skip navigation">
      <a href="#main-content" class="skip-link">
        {{ 'accessibility.skipToMain' | i18n }}
      </a>
      <a href="#primary-navigation" class="skip-link">
        {{ 'accessibility.skipToNav' | i18n }}
      </a>
      <a href="#page-actions" class="skip-link">
        {{ 'accessibility.skipToActions' | i18n }}
      </a>
    </div>
  ` }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SkipLinksComponent, { className: "SkipLinksComponent", filePath: "src/app/layout/skip-links/skip-links.component.ts", lineNumber: 23 });
})();

// src/app/core/services/keyboard-shortcuts.service.ts
var KeyboardShortcutsService = class _KeyboardShortcutsService {
  shortcuts = /* @__PURE__ */ new Map();
  enabled = true;
  // Observable for shortcut help dialog
  helpRequestedSubject = new Subject();
  helpRequested$ = this.helpRequestedSubject.asObservable();
  constructor() {
    this.initializeGlobalListener();
  }
  /**
   * Register a keyboard shortcut
   */
  register(shortcut) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }
  /**
   * Unregister a keyboard shortcut
   */
  unregister(shortcut) {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }
  /**
   * Get all registered shortcuts
   */
  getShortcuts() {
    return Array.from(this.shortcuts.values());
  }
  /**
   * Get shortcuts for a specific context
   */
  getShortcutsForContext(context) {
    return this.getShortcuts().filter((s2) => s2.context === context);
  }
  /**
   * Enable keyboard shortcuts
   */
  enable() {
    this.enabled = true;
  }
  /**
   * Disable keyboard shortcuts
   */
  disable() {
    this.enabled = false;
  }
  /**
   * Check if shortcuts are enabled
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * Show help dialog
   */
  showHelp() {
    this.helpRequestedSubject.next();
  }
  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut) {
    const parts = [];
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    if (shortcut.ctrl || shortcut.meta) {
      parts.push(isMac ? "\u2318" : "Ctrl");
    }
    if (shortcut.shift) {
      parts.push(isMac ? "\u21E7" : "Shift");
    }
    if (shortcut.alt) {
      parts.push(isMac ? "\u2325" : "Alt");
    }
    parts.push(shortcut.key.toUpperCase());
    return parts.join(isMac ? "" : "+");
  }
  /**
   * Initialize global keyboard listener
   */
  initializeGlobalListener() {
    if (typeof window === "undefined")
      return;
    window.addEventListener("keydown", (event) => {
      this.handleKeyDown(event);
    });
  }
  /**
   * Handle keydown event
   */
  handleKeyDown(event) {
    if (!this.enabled)
      return;
    if (this.isTypingInInput(event.target)) {
      return;
    }
    if (event.key === "?" || event.key === "F1") {
      event.preventDefault();
      this.showHelp();
      return;
    }
    const key = this.getEventKey(event);
    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }
  /**
   * Check if user is typing in an input field
   */
  isTypingInInput(target) {
    if (!target)
      return false;
    const tagName = target.tagName.toLowerCase();
    const isContentEditable = target.isContentEditable;
    const isInput = tagName === "input" || tagName === "textarea";
    const isSelect = tagName === "select";
    return isInput || isSelect || isContentEditable;
  }
  /**
   * Get shortcut key from event
   */
  getEventKey(event) {
    const parts = [];
    if (event.ctrlKey)
      parts.push("ctrl");
    if (event.metaKey)
      parts.push("meta");
    if (event.shiftKey)
      parts.push("shift");
    if (event.altKey)
      parts.push("alt");
    parts.push(event.key.toLowerCase());
    return parts.join("+");
  }
  /**
   * Get shortcut key from shortcut definition
   */
  getShortcutKey(shortcut) {
    const parts = [];
    if (shortcut.ctrl)
      parts.push("ctrl");
    if (shortcut.meta)
      parts.push("meta");
    if (shortcut.shift)
      parts.push("shift");
    if (shortcut.alt)
      parts.push("alt");
    parts.push(shortcut.key.toLowerCase());
    return parts.join("+");
  }
  static \u0275fac = function KeyboardShortcutsService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _KeyboardShortcutsService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _KeyboardShortcutsService, factory: _KeyboardShortcutsService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(KeyboardShortcutsService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();

// src/app/layout/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component.ts
var _c04 = () => ({ width: "600px" });
var _forTrack02 = ($index, $item) => $item.context;
var _forTrack12 = ($index, $item) => $item.key;
function KeyboardShortcutsDialogComponent_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "h2", 8);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "i18n");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(2, 1, "shortcuts.title"), " ");
  }
}
function KeyboardShortcutsDialogComponent_For_7_For_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11)(1, "span", 12);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "kbd", 13);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const shortcut_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(shortcut_r1.description);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.formatShortcut(shortcut_r1));
  }
}
function KeyboardShortcutsDialogComponent_For_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 4)(1, "h3", 9);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 10);
    \u0275\u0275repeaterCreate(4, KeyboardShortcutsDialogComponent_For_7_For_5_Template, 5, 2, "div", 11, _forTrack12);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const group_r3 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getGroupTitle(group_r3.context));
    \u0275\u0275advance(2);
    \u0275\u0275repeater(group_r3.shortcuts);
  }
}
function KeyboardShortcutsDialogComponent_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 14);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275listener("click", function KeyboardShortcutsDialogComponent_ng_template_12_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.close());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275property("label", \u0275\u0275pipeBind1(1, 2, "common.close"));
    \u0275\u0275attribute("aria-label", "Close keyboard shortcuts dialog");
  }
}
var KeyboardShortcutsDialogComponent = class _KeyboardShortcutsDialogComponent {
  shortcutsService = inject(KeyboardShortcutsService);
  visible = false;
  shortcutGroups = [];
  ngOnInit() {
    this.shortcutsService.helpRequested$.subscribe(() => {
      this.show();
    });
  }
  show() {
    this.loadShortcuts();
    this.visible = true;
  }
  close() {
    this.visible = false;
  }
  formatShortcut(shortcut) {
    return this.shortcutsService.formatShortcut(shortcut);
  }
  getGroupTitle(context) {
    const titles = {
      "global": "Global",
      "mapping-editor": "Mapping Editor",
      "partner-management": "Partner Management",
      "dlq": "Dead Letter Queue",
      "navigation": "Navigation"
    };
    return titles[context] || context;
  }
  loadShortcuts() {
    const allShortcuts = this.shortcutsService.getShortcuts();
    const groups = /* @__PURE__ */ new Map();
    allShortcuts.forEach((shortcut) => {
      const context = shortcut.context || "global";
      if (!groups.has(context)) {
        groups.set(context, []);
      }
      groups.get(context).push(shortcut);
    });
    this.shortcutGroups = Array.from(groups.entries()).map(([context, shortcuts]) => ({
      context,
      shortcuts
    }));
  }
  static \u0275fac = function KeyboardShortcutsDialogComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _KeyboardShortcutsDialogComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _KeyboardShortcutsDialogComponent, selectors: [["app-keyboard-shortcuts-dialog"]], decls: 13, vars: 15, consts: [["role", "dialog", 3, "visibleChange", "visible", "modal", "closable", "dismissableMask"], ["pTemplate", "header"], ["id", "shortcuts-dialog-description", 1, "shortcuts-content"], [1, "shortcuts-intro"], [1, "shortcut-group"], [1, "shortcuts-footer"], [1, "footer-note"], ["pTemplate", "footer"], ["id", "shortcuts-dialog-title", 1, "dialog-title"], [1, "group-title"], [1, "shortcuts-list"], [1, "shortcut-item"], [1, "shortcut-description"], [1, "shortcut-keys"], ["pButton", "", "type", "button", 3, "click", "label"]], template: function KeyboardShortcutsDialogComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "p-dialog", 0);
      \u0275\u0275twoWayListener("visibleChange", function KeyboardShortcutsDialogComponent_Template_p_dialog_visibleChange_0_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.visible, $event) || (ctx.visible = $event);
        return $event;
      });
      \u0275\u0275template(1, KeyboardShortcutsDialogComponent_ng_template_1_Template, 3, 3, "ng-template", 1);
      \u0275\u0275elementStart(2, "div", 2)(3, "p", 3);
      \u0275\u0275text(4);
      \u0275\u0275pipe(5, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275repeaterCreate(6, KeyboardShortcutsDialogComponent_For_7_Template, 6, 1, "div", 4, _forTrack02);
      \u0275\u0275elementStart(8, "div", 5)(9, "p", 6);
      \u0275\u0275text(10);
      \u0275\u0275pipe(11, "i18n");
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(12, KeyboardShortcutsDialogComponent_ng_template_12_Template, 2, 4, "ng-template", 7);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(14, _c04));
      \u0275\u0275twoWayProperty("visible", ctx.visible);
      \u0275\u0275property("modal", true)("closable", true)("dismissableMask", true);
      \u0275\u0275attribute("aria-labelledby", "shortcuts-dialog-title")("aria-describedby", "shortcuts-dialog-description");
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(5, 10, "shortcuts.intro"), " ");
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.shortcutGroups);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(11, 12, "shortcuts.footerNote"), " ");
    }
  }, dependencies: [CommonModule, DialogModule, Dialog, PrimeTemplate, ButtonModule, ButtonDirective, I18nPipe], styles: ['\n.dialog-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.5rem;\n  font-weight: 600;\n  color: var(--text-color);\n}\n.shortcuts-content[_ngcontent-%COMP%] {\n  padding: 1rem 0;\n}\n.shortcuts-intro[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n  color: var(--text-color-secondary);\n  font-size: 0.875rem;\n}\n.shortcut-group[_ngcontent-%COMP%] {\n  margin-bottom: 2rem;\n}\n.shortcut-group[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 1rem;\n}\n.group-title[_ngcontent-%COMP%] {\n  margin: 0 0 0.75rem 0;\n  font-size: 1rem;\n  font-weight: 600;\n  color: var(--text-color);\n  border-bottom: 1px solid var(--surface-border);\n  padding-bottom: 0.5rem;\n}\n.shortcuts-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.shortcut-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.5rem;\n  border-radius: 4px;\n  transition: background-color 0.2s;\n}\n.shortcut-item[_ngcontent-%COMP%]:hover {\n  background-color: var(--surface-hover);\n}\n.shortcut-description[_ngcontent-%COMP%] {\n  color: var(--text-color);\n  font-size: 0.875rem;\n}\n.shortcut-keys[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  padding: 0.25rem 0.5rem;\n  background-color: var(--surface-100);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-family: "Courier New", monospace;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--text-color);\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);\n}\n.shortcuts-footer[_ngcontent-%COMP%] {\n  margin-top: 1rem;\n  padding-top: 1rem;\n  border-top: 1px solid var(--surface-border);\n}\n.footer-note[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n  font-style: italic;\n}\nhtml.dark-mode[_ngcontent-%COMP%]   .shortcut-keys[_ngcontent-%COMP%] {\n  background-color: var(--surface-800);\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n}\n/*# sourceMappingURL=keyboard-shortcuts-dialog.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(KeyboardShortcutsDialogComponent, [{
    type: Component,
    args: [{ selector: "app-keyboard-shortcuts-dialog", standalone: true, imports: [CommonModule, DialogModule, ButtonModule, I18nPipe], template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      [style]="{ width: '600px' }"
      role="dialog"
      [attr.aria-labelledby]="'shortcuts-dialog-title'"
      [attr.aria-describedby]="'shortcuts-dialog-description'">
      
      <ng-template pTemplate="header">
        <h2 id="shortcuts-dialog-title" class="dialog-title">
          {{ 'shortcuts.title' | i18n }}
        </h2>
      </ng-template>

      <div id="shortcuts-dialog-description" class="shortcuts-content">
        <p class="shortcuts-intro">
          {{ 'shortcuts.intro' | i18n }}
        </p>

        @for (group of shortcutGroups; track group.context) {
          <div class="shortcut-group">
            <h3 class="group-title">{{ getGroupTitle(group.context) }}</h3>
            <div class="shortcuts-list">
              @for (shortcut of group.shortcuts; track shortcut.key) {
                <div class="shortcut-item">
                  <span class="shortcut-description">{{ shortcut.description }}</span>
                  <kbd class="shortcut-keys">{{ formatShortcut(shortcut) }}</kbd>
                </div>
              }
            </div>
          </div>
        }

        <div class="shortcuts-footer">
          <p class="footer-note">
            {{ 'shortcuts.footerNote' | i18n }}
          </p>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button
          pButton
          type="button"
          [label]="'common.close' | i18n"
          (click)="close()"
          [attr.aria-label]="'Close keyboard shortcuts dialog'">
        </button>
      </ng-template>
    </p-dialog>
  `, styles: ['/* angular:styles/component:scss;3bbe2f049cf2022e182c49231502e15f5a96fce6c901489175bc6d7908f53530;/home/runner/work/canonbridge/canonbridge/mapping-studio-ui/src/app/layout/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component.ts */\n.dialog-title {\n  margin: 0;\n  font-size: 1.5rem;\n  font-weight: 600;\n  color: var(--text-color);\n}\n.shortcuts-content {\n  padding: 1rem 0;\n}\n.shortcuts-intro {\n  margin-bottom: 1.5rem;\n  color: var(--text-color-secondary);\n  font-size: 0.875rem;\n}\n.shortcut-group {\n  margin-bottom: 2rem;\n}\n.shortcut-group:last-child {\n  margin-bottom: 1rem;\n}\n.group-title {\n  margin: 0 0 0.75rem 0;\n  font-size: 1rem;\n  font-weight: 600;\n  color: var(--text-color);\n  border-bottom: 1px solid var(--surface-border);\n  padding-bottom: 0.5rem;\n}\n.shortcuts-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.shortcut-item {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.5rem;\n  border-radius: 4px;\n  transition: background-color 0.2s;\n}\n.shortcut-item:hover {\n  background-color: var(--surface-hover);\n}\n.shortcut-description {\n  color: var(--text-color);\n  font-size: 0.875rem;\n}\n.shortcut-keys {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  padding: 0.25rem 0.5rem;\n  background-color: var(--surface-100);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-family: "Courier New", monospace;\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--text-color);\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);\n}\n.shortcuts-footer {\n  margin-top: 1rem;\n  padding-top: 1rem;\n  border-top: 1px solid var(--surface-border);\n}\n.footer-note {\n  margin: 0;\n  color: var(--text-color-secondary);\n  font-size: 0.75rem;\n  font-style: italic;\n}\nhtml.dark-mode .shortcut-keys {\n  background-color: var(--surface-800);\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n}\n/*# sourceMappingURL=keyboard-shortcuts-dialog.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(KeyboardShortcutsDialogComponent, { className: "KeyboardShortcutsDialogComponent", filePath: "src/app/layout/keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component.ts", lineNumber: 166 });
})();

// src/app/layout/layout.component.ts
function LayoutComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "p-message", 4);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("text", ctx_r0.demoBannerText())("closable", false);
  }
}
var LayoutComponent = class _LayoutComponent {
  i18n = inject(I18nService);
  sidebarCollapsed = signal(false, ...ngDevMode ? [{ debugName: "sidebarCollapsed" }] : (
    /* istanbul ignore next */
    []
  ));
  demoModeEnabled = environment.features.enableDemoMode;
  demoBannerText = computed(() => `${this.i18n.translate("layout.demoBanner.strong")} ${this.i18n.translate("layout.demoBanner.text")}`, ...ngDevMode ? [{ debugName: "demoBannerText" }] : (
    /* istanbul ignore next */
    []
  ));
  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }
  static \u0275fac = function LayoutComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LayoutComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LayoutComponent, selectors: [["app-layout"]], decls: 9, vars: 4, consts: [[1, "layout-wrapper"], [3, "collapsed"], [1, "layout-main"], [3, "toggleSidebar"], ["severity", "warn", "styleClass", "layout-demo-alert", "role", "alert", "aria-live", "polite", 3, "text", "closable"], ["id", "main-content", "role", "main", "tabindex", "-1", 1, "layout-content"]], template: function LayoutComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "app-skip-links")(1, "app-keyboard-shortcuts-dialog");
      \u0275\u0275elementStart(2, "div", 0);
      \u0275\u0275element(3, "app-sidebar", 1);
      \u0275\u0275elementStart(4, "div", 2)(5, "app-topbar", 3);
      \u0275\u0275listener("toggleSidebar", function LayoutComponent_Template_app_topbar_toggleSidebar_5_listener() {
        return ctx.toggleSidebar();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(6, LayoutComponent_Conditional_6_Template, 1, 2, "p-message", 4);
      \u0275\u0275elementStart(7, "main", 5);
      \u0275\u0275element(8, "router-outlet");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(2);
      \u0275\u0275classProp("layout-sidebar-collapsed", ctx.sidebarCollapsed());
      \u0275\u0275advance();
      \u0275\u0275property("collapsed", ctx.sidebarCollapsed());
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.demoModeEnabled ? 6 : -1);
    }
  }, dependencies: [RouterOutlet, SidebarComponent, TopbarComponent, SkipLinksComponent, KeyboardShortcutsDialogComponent, MessageModule, Message], styles: ['@charset "UTF-8";\n\n\n.layout-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  min-height: 100dvh;\n  background: var(--cb-page-mesh);\n}\nhtml.dark-mode[_ngcontent-%COMP%]   .layout-wrapper[_ngcontent-%COMP%] {\n  background: var(--surface-ground);\n}\n.layout-main[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  margin-left: 280px;\n  transition: margin-left 0.2s ease;\n}\n.layout-sidebar-collapsed[_ngcontent-%COMP%]   .layout-main[_ngcontent-%COMP%] {\n  margin-left: 4.5rem;\n}\n.layout-content[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow: auto;\n  padding: 1.5rem 2rem 2rem;\n  max-width: 1680px;\n  width: 100%;\n  margin: 0 auto;\n}\n[_nghost-%COMP%]     .layout-demo-alert {\n  width: 100%;\n  border-radius: 0;\n  border-left: none;\n  border-right: none;\n  margin: 0;\n}\n[_nghost-%COMP%]     .layout-demo-alert .p-message-text {\n  font-size: 0.8125rem;\n  line-height: 1.45;\n}\n@media (max-width: 768px) {\n  .layout-main[_ngcontent-%COMP%] {\n    margin-left: 0;\n  }\n  .layout-sidebar-collapsed[_ngcontent-%COMP%]   .layout-main[_ngcontent-%COMP%] {\n    margin-left: 0;\n  }\n  .layout-content[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n}\n/*# sourceMappingURL=layout.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LayoutComponent, [{
    type: Component,
    args: [{ selector: "app-layout", standalone: true, imports: [RouterOutlet, SidebarComponent, TopbarComponent, SkipLinksComponent, KeyboardShortcutsDialogComponent, MessageModule], template: '<app-skip-links />\n<app-keyboard-shortcuts-dialog />\n<div class="layout-wrapper" [class.layout-sidebar-collapsed]="sidebarCollapsed()">\n  <app-sidebar [collapsed]="sidebarCollapsed()" />\n  <div class="layout-main">\n    <app-topbar (toggleSidebar)="toggleSidebar()" />\n    @if (demoModeEnabled) {\n      <p-message\n        severity="warn"\n        [text]="demoBannerText()"\n        [closable]="false"\n        styleClass="layout-demo-alert"\n        role="alert"\n        aria-live="polite" />\n    }\n    <main id="main-content" class="layout-content" role="main" tabindex="-1">\n      <router-outlet />\n    </main>\n  </div>\n</div>\n', styles: ['@charset "UTF-8";\n\n/* src/app/layout/layout.component.scss */\n.layout-wrapper {\n  display: flex;\n  min-height: 100dvh;\n  background: var(--cb-page-mesh);\n}\nhtml.dark-mode .layout-wrapper {\n  background: var(--surface-ground);\n}\n.layout-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  margin-left: 280px;\n  transition: margin-left 0.2s ease;\n}\n.layout-sidebar-collapsed .layout-main {\n  margin-left: 4.5rem;\n}\n.layout-content {\n  flex: 1;\n  overflow: auto;\n  padding: 1.5rem 2rem 2rem;\n  max-width: 1680px;\n  width: 100%;\n  margin: 0 auto;\n}\n:host ::ng-deep .layout-demo-alert {\n  width: 100%;\n  border-radius: 0;\n  border-left: none;\n  border-right: none;\n  margin: 0;\n}\n:host ::ng-deep .layout-demo-alert .p-message-text {\n  font-size: 0.8125rem;\n  line-height: 1.45;\n}\n@media (max-width: 768px) {\n  .layout-main {\n    margin-left: 0;\n  }\n  .layout-sidebar-collapsed .layout-main {\n    margin-left: 0;\n  }\n  .layout-content {\n    padding: 1rem;\n  }\n}\n/*# sourceMappingURL=layout.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LayoutComponent, { className: "LayoutComponent", filePath: "src/app/layout/layout.component.ts", lineNumber: 18 });
})();
export {
  LayoutComponent
};
//# sourceMappingURL=chunk-BR4TAVJQ.js.map
