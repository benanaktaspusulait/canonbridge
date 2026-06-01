import {
  Drawer,
  DrawerModule
} from "./chunk-N2VYNPGE.js";
import {
  AuthService
} from "./chunk-XNF256NJ.js";
import {
  MappingService
} from "./chunk-BIPK67GL.js";
import {
  Router,
  RouterLink
} from "./chunk-CN6J73SX.js";
import {
  PartnerService
} from "./chunk-B4ZJ7YGE.js";
import {
  ConfirmDialog,
  ConfirmDialogModule
} from "./chunk-KWOSBMJ3.js";
import {
  ToastModule
} from "./chunk-IWXISTMZ.js";
import "./chunk-BYX7PGOZ.js";
import {
  SortIcon,
  SortableColumn,
  Table,
  TableCheckbox,
  TableHeaderCheckbox,
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
import {
  DefaultValueAccessor,
  FormsModule,
  IconField,
  IconFieldModule,
  InputIcon,
  InputIconModule,
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
  CommonModule,
  ConfirmationService,
  DecimalPipe,
  HttpClient,
  JsonPipe,
  MessageService,
  PrimeTemplate
} from "./chunk-OGO5ZH5D.js";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  __spreadProps,
  __spreadValues,
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
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
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

// src/app/core/components/empty-state.component.ts
function EmptyStateComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 2);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("src", ctx_r0.illustration, \u0275\u0275sanitizeUrl)("alt", ctx_r0.title);
  }
}
function EmptyStateComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "i");
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r0.icon || "pi pi-inbox");
    \u0275\u0275styleProp("font-size", ctx_r0.iconSize);
  }
}
function EmptyStateComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 6);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.description);
  }
}
function EmptyStateComponent_Conditional_8_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-button", 11);
    \u0275\u0275listener("onClick", function EmptyStateComponent_Conditional_8_Conditional_2_Template_p_button_onClick_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.secondaryAction.emit());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("label", ctx_r0.secondaryActionLabel)("icon", ctx_r0.secondaryActionIcon || "pi pi-question-circle")("outlined", true)("size", ctx_r0.compact ? "small" : void 0);
  }
}
function EmptyStateComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 7)(1, "p-button", 9);
    \u0275\u0275listener("onClick", function EmptyStateComponent_Conditional_8_Template_p_button_onClick_1_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.action.emit());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(2, EmptyStateComponent_Conditional_8_Conditional_2_Template, 1, 4, "p-button", 10);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("label", ctx_r0.actionLabel)("icon", ctx_r0.actionIcon || "pi pi-plus")("size", ctx_r0.compact ? "small" : void 0);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.secondaryActionLabel ? 2 : -1);
  }
}
function EmptyStateComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275element(1, "i", 12);
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.helpText);
  }
}
var EmptyStateComponent = class _EmptyStateComponent {
  title = "No items found";
  description;
  icon;
  iconSize = "6rem";
  illustration;
  actionLabel;
  actionIcon;
  secondaryActionLabel;
  secondaryActionIcon;
  helpText;
  compact = false;
  action = new EventEmitter();
  secondaryAction = new EventEmitter();
  static \u0275fac = function EmptyStateComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _EmptyStateComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _EmptyStateComponent, selectors: [["app-empty-state"]], inputs: { title: "title", description: "description", icon: "icon", iconSize: "iconSize", illustration: "illustration", actionLabel: "actionLabel", actionIcon: "actionIcon", secondaryActionLabel: "secondaryActionLabel", secondaryActionIcon: "secondaryActionIcon", helpText: "helpText", compact: "compact" }, outputs: { action: "action", secondaryAction: "secondaryAction" }, decls: 10, vars: 7, consts: [[1, "empty-state"], [1, "empty-state__illustration"], [3, "src", "alt"], [3, "class", "font-size"], [1, "empty-state__content"], [1, "empty-state__title"], [1, "empty-state__description"], [1, "empty-state__actions"], [1, "empty-state__help"], [3, "onClick", "label", "icon", "size"], ["severity", "secondary", 3, "label", "icon", "outlined", "size"], ["severity", "secondary", 3, "onClick", "label", "icon", "outlined", "size"], [1, "pi", "pi-info-circle"]], template: function EmptyStateComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1);
      \u0275\u0275conditionalCreate(2, EmptyStateComponent_Conditional_2_Template, 1, 2, "img", 2)(3, EmptyStateComponent_Conditional_3_Template, 1, 4, "i", 3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "div", 4)(5, "h3", 5);
      \u0275\u0275text(6);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(7, EmptyStateComponent_Conditional_7_Template, 2, 1, "p", 6);
      \u0275\u0275conditionalCreate(8, EmptyStateComponent_Conditional_8_Template, 3, 4, "div", 7);
      \u0275\u0275conditionalCreate(9, EmptyStateComponent_Conditional_9_Template, 4, 1, "div", 8);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275classProp("empty-state--compact", ctx.compact);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.illustration ? 2 : 3);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.title);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.description ? 7 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.actionLabel ? 8 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.helpText ? 9 : -1);
    }
  }, dependencies: [CommonModule, ButtonModule, Button], styles: ["\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 4rem 2rem;\n  text-align: center;\n  min-height: 400px;\n}\n.empty-state--compact[_ngcontent-%COMP%] {\n  padding: 2rem 1rem;\n  min-height: 250px;\n}\n.empty-state__illustration[_ngcontent-%COMP%] {\n  margin-bottom: 2rem;\n}\n.empty-state__illustration[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  max-width: 300px;\n  height: auto;\n  opacity: 0.8;\n}\n.empty-state--compact[_ngcontent-%COMP%]   .empty-state__illustration[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  max-width: 200px;\n}\n.empty-state__illustration[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 6rem;\n  color: var(--primary-color);\n  opacity: 0.3;\n}\n.empty-state--compact[_ngcontent-%COMP%]   .empty-state__illustration[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 4rem;\n}\n.empty-state__content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1rem;\n  max-width: 500px;\n}\n.empty-state__title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.5rem;\n  font-weight: 600;\n  color: var(--text-color);\n}\n.empty-state--compact[_ngcontent-%COMP%]   .empty-state__title[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n}\n.empty-state__description[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1rem;\n  line-height: 1.6;\n  color: var(--text-color-secondary);\n}\n.empty-state--compact[_ngcontent-%COMP%]   .empty-state__description[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n}\n.empty-state__actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  margin-top: 0.5rem;\n  flex-wrap: wrap;\n  justify-content: center;\n}\n.empty-state__help[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  background-color: var(--surface-50);\n  border-radius: 6px;\n  font-size: 0.875rem;\n  color: var(--text-color-secondary);\n  margin-top: 0.5rem;\n}\n.empty-state__help[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  color: var(--primary-color);\n  font-size: 1rem;\n}\n@media (max-width: 768px) {\n  .empty-state[_ngcontent-%COMP%] {\n    padding: 2rem 1rem;\n    min-height: 300px;\n  }\n  .empty-state__illustration[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n    max-width: 200px;\n  }\n  .empty-state__illustration[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n    font-size: 4rem;\n  }\n  .empty-state__title[_ngcontent-%COMP%] {\n    font-size: 1.25rem;\n  }\n  .empty-state__description[_ngcontent-%COMP%] {\n    font-size: 0.875rem;\n  }\n}\n/*# sourceMappingURL=empty-state.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(EmptyStateComponent, [{
    type: Component,
    args: [{ selector: "app-empty-state", standalone: true, imports: [CommonModule, ButtonModule], template: `
    <div class="empty-state" [class.empty-state--compact]="compact">
      <div class="empty-state__illustration">
        @if (illustration) {
          <img [src]="illustration" [alt]="title" />
        } @else {
          <i [class]="icon || 'pi pi-inbox'" [style.font-size]="iconSize"></i>
        }
      </div>

      <div class="empty-state__content">
        <h3 class="empty-state__title">{{ title }}</h3>
        
        @if (description) {
          <p class="empty-state__description">{{ description }}</p>
        }

        @if (actionLabel) {
          <div class="empty-state__actions">
            <p-button
              [label]="actionLabel"
              [icon]="actionIcon || 'pi pi-plus'"
              (onClick)="action.emit()"
              [size]="compact ? 'small' : undefined" />
            
            @if (secondaryActionLabel) {
              <p-button
                [label]="secondaryActionLabel"
                [icon]="secondaryActionIcon || 'pi pi-question-circle'"
                (onClick)="secondaryAction.emit()"
                [outlined]="true"
                severity="secondary"
                [size]="compact ? 'small' : undefined" />
            }
          </div>
        }

        @if (helpText) {
          <div class="empty-state__help">
            <i class="pi pi-info-circle"></i>
            <span>{{ helpText }}</span>
          </div>
        }
      </div>
    </div>
  `, styles: ["/* angular:styles/component:scss;63db191eb1d82b13b1ac2e8b80712db586c0649720cd9150e140fbaaaf938b1d;/home/runner/work/canonbridge/canonbridge/mapping-studio-ui/src/app/core/components/empty-state.component.ts */\n.empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 4rem 2rem;\n  text-align: center;\n  min-height: 400px;\n}\n.empty-state--compact {\n  padding: 2rem 1rem;\n  min-height: 250px;\n}\n.empty-state__illustration {\n  margin-bottom: 2rem;\n}\n.empty-state__illustration img {\n  max-width: 300px;\n  height: auto;\n  opacity: 0.8;\n}\n.empty-state--compact .empty-state__illustration img {\n  max-width: 200px;\n}\n.empty-state__illustration i {\n  font-size: 6rem;\n  color: var(--primary-color);\n  opacity: 0.3;\n}\n.empty-state--compact .empty-state__illustration i {\n  font-size: 4rem;\n}\n.empty-state__content {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1rem;\n  max-width: 500px;\n}\n.empty-state__title {\n  margin: 0;\n  font-size: 1.5rem;\n  font-weight: 600;\n  color: var(--text-color);\n}\n.empty-state--compact .empty-state__title {\n  font-size: 1.25rem;\n}\n.empty-state__description {\n  margin: 0;\n  font-size: 1rem;\n  line-height: 1.6;\n  color: var(--text-color-secondary);\n}\n.empty-state--compact .empty-state__description {\n  font-size: 0.875rem;\n}\n.empty-state__actions {\n  display: flex;\n  gap: 0.75rem;\n  margin-top: 0.5rem;\n  flex-wrap: wrap;\n  justify-content: center;\n}\n.empty-state__help {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  background-color: var(--surface-50);\n  border-radius: 6px;\n  font-size: 0.875rem;\n  color: var(--text-color-secondary);\n  margin-top: 0.5rem;\n}\n.empty-state__help i {\n  color: var(--primary-color);\n  font-size: 1rem;\n}\n@media (max-width: 768px) {\n  .empty-state {\n    padding: 2rem 1rem;\n    min-height: 300px;\n  }\n  .empty-state__illustration img {\n    max-width: 200px;\n  }\n  .empty-state__illustration i {\n    font-size: 4rem;\n  }\n  .empty-state__title {\n    font-size: 1.25rem;\n  }\n  .empty-state__description {\n    font-size: 0.875rem;\n  }\n}\n/*# sourceMappingURL=empty-state.component.css.map */\n"] }]
  }], null, { title: [{
    type: Input
  }], description: [{
    type: Input
  }], icon: [{
    type: Input
  }], iconSize: [{
    type: Input
  }], illustration: [{
    type: Input
  }], actionLabel: [{
    type: Input
  }], actionIcon: [{
    type: Input
  }], secondaryActionLabel: [{
    type: Input
  }], secondaryActionIcon: [{
    type: Input
  }], helpText: [{
    type: Input
  }], compact: [{
    type: Input
  }], action: [{
    type: Output
  }], secondaryAction: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(EmptyStateComponent, { className: "EmptyStateComponent", filePath: "src/app/core/components/empty-state.component.ts", lineNumber: 174 });
})();

// src/app/pages/mappings/mappings.component.ts
var _c0 = () => ({ width: "640px", maxWidth: "95vw" });
var _forTrack0 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.bucket;
function MappingsComponent_Conditional_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-empty-state", 19);
    \u0275\u0275pipe(1, "i18n");
    \u0275\u0275pipe(2, "i18n");
    \u0275\u0275pipe(3, "i18n");
  }
  if (rf & 2) {
    \u0275\u0275property("title", \u0275\u0275pipeBind1(1, 3, "mappings.emptyTitle"))("description", \u0275\u0275pipeBind1(2, 5, "mappings.emptyDescription"))("actionLabel", \u0275\u0275pipeBind1(3, 7, "mappings.newDemo"));
  }
}
function MappingsComponent_Conditional_34_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "th", 29);
    \u0275\u0275element(2, "p-tableHeaderCheckbox");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "th", 30);
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "i18n");
    \u0275\u0275element(6, "p-sortIcon", 31);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "th", 32);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "i18n");
    \u0275\u0275element(10, "p-sortIcon", 33);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "th", 34);
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "i18n");
    \u0275\u0275element(14, "p-sortIcon", 35);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "th", 36);
    \u0275\u0275text(16);
    \u0275\u0275pipe(17, "i18n");
    \u0275\u0275element(18, "p-sortIcon", 37);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "th", 38);
    \u0275\u0275text(20);
    \u0275\u0275pipe(21, "i18n");
    \u0275\u0275element(22, "p-sortIcon", 39);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "th", 40);
    \u0275\u0275text(24);
    \u0275\u0275pipe(25, "i18n");
    \u0275\u0275element(26, "p-sortIcon", 41);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "th");
    \u0275\u0275text(28);
    \u0275\u0275pipe(29, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "th", 42);
    \u0275\u0275text(31);
    \u0275\u0275pipe(32, "i18n");
    \u0275\u0275element(33, "p-sortIcon", 43);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "th", 44);
    \u0275\u0275text(35);
    \u0275\u0275pipe(36, "i18n");
    \u0275\u0275element(37, "p-sortIcon", 45);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "th", 46);
    \u0275\u0275text(39);
    \u0275\u0275pipe(40, "i18n");
    \u0275\u0275element(41, "p-sortIcon", 47);
    \u0275\u0275elementEnd();
    \u0275\u0275element(42, "th", 48);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(5, 10, "table.partner"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(9, 12, "table.eventType"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(13, 14, "table.sourceType"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(17, 16, "table.method"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(21, 18, "table.version"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(25, 20, "table.status"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(29, 22, "table.health"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(32, 24, "table.transformations"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(36, 26, "table.published"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(40, 28, "table.by"), " ");
  }
}
function MappingsComponent_Conditional_34_ng_template_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const m_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275classMap(\u0275\u0275interpolate1("method-badge method-", m_r6.method.toLowerCase()));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(m_r6.method);
  }
}
function MappingsComponent_Conditional_34_ng_template_2_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 67);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const m_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275classProp("healthy", m_r6.successRate >= 95)("degraded", m_r6.successRate >= 50 && m_r6.successRate < 95)("unhealthy", m_r6.successRate < 50);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", m_r6.successRate, "% ");
  }
}
function MappingsComponent_Conditional_34_ng_template_2_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 56);
    \u0275\u0275text(1, "\u2014");
    \u0275\u0275elementEnd();
  }
}
function MappingsComponent_Conditional_34_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td");
    \u0275\u0275element(2, "p-tableCheckbox", 49);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td")(4, "strong");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "td")(7, "code", 50);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "td");
    \u0275\u0275element(10, "p-tag", 51);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "td");
    \u0275\u0275conditionalCreate(12, MappingsComponent_Conditional_34_ng_template_2_Conditional_12_Template, 2, 4, "span", 52);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "td")(14, "span", 53);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "td");
    \u0275\u0275element(17, "p-tag", 54);
    \u0275\u0275pipe(18, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "td");
    \u0275\u0275conditionalCreate(20, MappingsComponent_Conditional_34_ng_template_2_Conditional_20_Template, 2, 7, "span", 55)(21, MappingsComponent_Conditional_34_ng_template_2_Conditional_21_Template, 2, 0, "span", 56);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "td", 57);
    \u0275\u0275text(23);
    \u0275\u0275pipe(24, "number");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "td", 58);
    \u0275\u0275text(26);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "td", 58);
    \u0275\u0275text(28);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "td")(30, "div", 59)(31, "p-button", 60);
    \u0275\u0275pipe(32, "i18n");
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_34_ng_template_2_Template_p_button_onClick_31_listener() {
      const m_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.openDetails(m_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "p-button", 61);
    \u0275\u0275pipe(34, "i18n");
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_34_ng_template_2_Template_p_button_onClick_33_listener() {
      const m_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.openInStudio(m_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "p-button", 62);
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_34_ng_template_2_Template_p_button_onClick_35_listener() {
      const m_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.exportMapping(m_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "p-button", 63);
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_34_ng_template_2_Template_p_button_onClick_36_listener() {
      const m_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.cloneMapping(m_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "p-button", 64);
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_34_ng_template_2_Template_p_button_onClick_37_listener() {
      const m_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.cloneMapping(m_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "p-button", 65);
    \u0275\u0275pipe(39, "i18n");
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_34_ng_template_2_Template_p_button_onClick_38_listener($event) {
      const m_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.deprecate(m_r6, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "p-button", 66);
    \u0275\u0275pipe(41, "i18n");
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_34_ng_template_2_Template_p_button_onClick_40_listener($event) {
      const m_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.delete(m_r6, $event));
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const m_r6 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", m_r6);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r6.partner);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r6.eventType);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", m_r6.sourceType);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(m_r6.method ? 12 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r6.version);
    \u0275\u0275advance(2);
    \u0275\u0275property("severity", ctx_r3.getSeverity(m_r6.status))("value", \u0275\u0275pipeBind1(18, 17, "status." + m_r6.status));
    \u0275\u0275advance(3);
    \u0275\u0275conditional(m_r6.successRate !== void 0 ? 20 : 21);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(24, 19, m_r6.transformations));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r6.createdAt);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r6.publishedBy);
    \u0275\u0275advance(3);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(32, 21, "mappings.preview"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(34, 23, "mappings.openStudio"));
    \u0275\u0275advance(5);
    \u0275\u0275property("disabled", m_r6.status === "deprecated")("pTooltip", \u0275\u0275pipeBind1(39, 25, "mappings.deprecate"));
    \u0275\u0275advance(2);
    \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(41, 27, "mappings.delete"));
  }
}
function MappingsComponent_Conditional_34_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 68);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "i18n");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 1, "mappings.empty"));
  }
}
function MappingsComponent_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-table", 25);
    \u0275\u0275listener("selectionChange", function MappingsComponent_Conditional_34_Template_p_table_selectionChange_0_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.selectedMappings.set($event));
    });
    \u0275\u0275template(1, MappingsComponent_Conditional_34_ng_template_1_Template, 43, 30, "ng-template", 26)(2, MappingsComponent_Conditional_34_ng_template_2_Template, 42, 29, "ng-template", 27)(3, MappingsComponent_Conditional_34_ng_template_3_Template, 4, 3, "ng-template", 28);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275property("value", ctx_r3.filtered())("paginator", true)("rows", 10)("selection", ctx_r3.selectedMappings());
  }
}
function MappingsComponent_Conditional_36_For_67_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li");
    \u0275\u0275element(1, "i", 82);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rule_r8 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(rule_r8);
  }
}
function MappingsComponent_Conditional_36_Conditional_71_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1, "No published versions yet");
    \u0275\u0275elementEnd();
  }
}
function MappingsComponent_Conditional_36_Conditional_72_For_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 88)(1, "div", 89)(2, "strong");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 90);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(6, "p-tag", 91);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const v_r10 = ctx.$implicit;
    \u0275\u0275classProp("deprecated", v_r10.status === "DEPRECATED");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("v", v_r10.version);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(v_r10.published_at == null ? null : v_r10.published_at.slice(0, 10));
    \u0275\u0275advance();
    \u0275\u0275property("value", v_r10.status)("severity", v_r10.status === "PUBLISHED" ? "success" : "secondary");
  }
}
function MappingsComponent_Conditional_36_Conditional_72_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "pre", 87);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "json");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(2, 1, ctx));
  }
}
function MappingsComponent_Conditional_36_Conditional_72_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 83)(1, "p-button", 84);
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_36_Conditional_72_Template_p_button_onClick_1_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.compareLatestVersions());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(2, "div", 85);
    \u0275\u0275repeaterCreate(3, MappingsComponent_Conditional_36_Conditional_72_For_4_Template, 7, 6, "div", 86, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, MappingsComponent_Conditional_36_Conditional_72_Conditional_5_Template, 3, 3, "pre", 87);
  }
  if (rf & 2) {
    let tmp_6_0;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r3.mappingVersions().length < 2);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r3.mappingVersions());
    \u0275\u0275advance(2);
    \u0275\u0275conditional((tmp_6_0 = ctx_r3.versionDiff()) ? 5 : -1, tmp_6_0);
  }
}
function MappingsComponent_Conditional_36_Conditional_76_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p");
    \u0275\u0275text(1, "No execution trend yet");
    \u0275\u0275elementEnd();
  }
}
function MappingsComponent_Conditional_36_Conditional_77_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 92)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "strong");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "small");
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "number");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const bucket_r11 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(bucket_r11.bucket);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", bucket_r11.success, " ok / ", bucket_r11.errors, " err");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(7, 4, bucket_r11.avgLatencyMs, "1.0-0"), "ms avg");
  }
}
function MappingsComponent_Conditional_36_Conditional_77_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 76);
    \u0275\u0275repeaterCreate(1, MappingsComponent_Conditional_36_Conditional_77_For_2_Template, 8, 7, "div", 92, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.executionSeries());
  }
}
function MappingsComponent_Conditional_36_ng_template_82_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "th");
    \u0275\u0275text(2, "Requested");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "th");
    \u0275\u0275text(4, "Status");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "th", 93);
    \u0275\u0275text(6, "Latency");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "th");
    \u0275\u0275text(8, "Correlation");
    \u0275\u0275elementEnd()();
  }
}
function MappingsComponent_Conditional_36_ng_template_83_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 94);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td");
    \u0275\u0275element(4, "p-tag", 91);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "td", 93);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "td")(8, "code");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const log_r12 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(log_r12.request_at || log_r12.created_at);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", log_r12.status)("severity", log_r12.status === "SUCCESS" ? "success" : "danger");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", log_r12.latency_ms || log_r12.duration_ms || 0, "ms");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(log_r12.correlation_id || "n/a");
  }
}
function MappingsComponent_Conditional_36_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 69)(1, "div")(2, "span", 70);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "h2");
    \u0275\u0275text(6);
    \u0275\u0275elementStart(7, "span", 71);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()()();
    \u0275\u0275element(9, "p-tag", 54);
    \u0275\u0275pipe(10, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 72)(12, "article")(13, "span");
    \u0275\u0275text(14);
    \u0275\u0275pipe(15, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "strong");
    \u0275\u0275text(17);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "article")(19, "span");
    \u0275\u0275text(20);
    \u0275\u0275pipe(21, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "strong");
    \u0275\u0275text(23);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(24, "article")(25, "span");
    \u0275\u0275text(26);
    \u0275\u0275pipe(27, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "strong");
    \u0275\u0275text(29);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "article")(31, "span");
    \u0275\u0275text(32);
    \u0275\u0275pipe(33, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "strong");
    \u0275\u0275text(35);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(36, "article")(37, "span");
    \u0275\u0275text(38);
    \u0275\u0275pipe(39, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "strong");
    \u0275\u0275text(41);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(42, "article")(43, "span");
    \u0275\u0275text(44);
    \u0275\u0275pipe(45, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(46, "strong");
    \u0275\u0275text(47);
    \u0275\u0275pipe(48, "number");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(49, "section", 73)(50, "h3");
    \u0275\u0275text(51);
    \u0275\u0275pipe(52, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(53, "code", 74);
    \u0275\u0275text(54);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(55, "section", 73)(56, "h3");
    \u0275\u0275text(57);
    \u0275\u0275pipe(58, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(59, "p");
    \u0275\u0275text(60);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(61, "section", 73)(62, "h3");
    \u0275\u0275text(63);
    \u0275\u0275pipe(64, "i18n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(65, "ul", 75);
    \u0275\u0275repeaterCreate(66, MappingsComponent_Conditional_36_For_67_Template, 3, 1, "li", null, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(68, "section", 73)(69, "h3");
    \u0275\u0275text(70, "Published Versions");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(71, MappingsComponent_Conditional_36_Conditional_71_Template, 2, 0, "p")(72, MappingsComponent_Conditional_36_Conditional_72_Template, 6, 2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(73, "section", 73)(74, "h3");
    \u0275\u0275text(75, "Execution history");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(76, MappingsComponent_Conditional_36_Conditional_76_Template, 2, 0, "p")(77, MappingsComponent_Conditional_36_Conditional_77_Template, 3, 0, "div", 76);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(78, "section", 73)(79, "h3");
    \u0275\u0275text(80, "Last 50 executions");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(81, "p-table", 77);
    \u0275\u0275template(82, MappingsComponent_Conditional_36_ng_template_82_Template, 9, 0, "ng-template", 26)(83, MappingsComponent_Conditional_36_ng_template_83_Template, 10, 5, "ng-template", 27);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(84, "div", 78)(85, "p-button", 79);
    \u0275\u0275pipe(86, "i18n");
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_36_Template_p_button_onClick_85_listener() {
      const m_r13 = \u0275\u0275restoreView(_r7);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openInStudio(m_r13));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(87, "p-button", 80);
    \u0275\u0275pipe(88, "i18n");
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_36_Template_p_button_onClick_87_listener($event) {
      const m_r13 = \u0275\u0275restoreView(_r7);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.deprecate(m_r13, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(89, "p-button", 81);
    \u0275\u0275pipe(90, "i18n");
    \u0275\u0275listener("onClick", function MappingsComponent_Conditional_36_Template_p_button_onClick_89_listener($event) {
      const m_r13 = \u0275\u0275restoreView(_r7);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.delete(m_r13, $event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const m_r13 = ctx;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 29, "mappings.detailTitle"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", m_r13.eventType, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r13.version);
    \u0275\u0275advance();
    \u0275\u0275property("severity", ctx_r3.getSeverity(m_r13.status))("value", \u0275\u0275pipeBind1(10, 31, "status." + m_r13.status));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 33, "table.partner"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r13.partner);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(21, 35, "table.sourceType"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r13.sourceType);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(27, 37, "table.method"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r13.method || "N/A");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(33, 39, "table.by"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r13.publishedBy);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(39, 41, "table.published"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r13.createdAt);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(45, 43, "table.transformations"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(48, 45, m_r13.transformations));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(52, 47, "mappings.checksum"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r13.checksum);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(58, 49, "mappings.notes"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(m_r13.notes);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(64, 51, "mappings.rules"));
    \u0275\u0275advance(3);
    \u0275\u0275repeater(m_r13.rules);
    \u0275\u0275advance(5);
    \u0275\u0275conditional(ctx_r3.mappingVersions().length === 0 ? 71 : 72);
    \u0275\u0275advance(5);
    \u0275\u0275conditional(ctx_r3.executionSeries().length === 0 ? 76 : 77);
    \u0275\u0275advance(5);
    \u0275\u0275property("value", ctx_r3.executionLogs());
    \u0275\u0275advance(4);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(86, 53, "mappings.openStudio"));
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(88, 55, "mappings.deprecate"))("disabled", m_r13.status === "deprecated");
    \u0275\u0275advance(2);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(90, 57, "mappings.delete"));
  }
}
function MappingsComponent_For_40_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "article", 24)(1, "div")(2, "strong");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "p-button", 95);
    \u0275\u0275listener("onClick", function MappingsComponent_For_40_Template_p_button_onClick_6_listener() {
      const template_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.createFromTemplate(template_r15));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const template_r15 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(template_r15.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(template_r15.description);
  }
}
var MappingsComponent = class _MappingsComponent {
  confirmation = inject(ConfirmationService);
  toast = inject(MessageService);
  i18n = inject(I18nService);
  mappingService = inject(MappingService);
  partnerService = inject(PartnerService);
  router = inject(Router);
  http = inject(HttpClient);
  auth = inject(AuthService);
  loading = signal(false, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  partners = signal(/* @__PURE__ */ new Map(), ...ngDevMode ? [{ debugName: "partners" }] : (
    /* istanbul ignore next */
    []
  ));
  // ── Signals (reactive) ────────────────────────────────────────────────────
  search = signal("", ...ngDevMode ? [{ debugName: "search" }] : (
    /* istanbul ignore next */
    []
  ));
  statusFilter = signal("all", ...ngDevMode ? [{ debugName: "statusFilter" }] : (
    /* istanbul ignore next */
    []
  ));
  sourceTypeFilter = signal("all", ...ngDevMode ? [{ debugName: "sourceTypeFilter" }] : (
    /* istanbul ignore next */
    []
  ));
  detailVisible = false;
  templateDialogVisible = false;
  selectedMapping = signal(null, ...ngDevMode ? [{ debugName: "selectedMapping" }] : (
    /* istanbul ignore next */
    []
  ));
  mappingVersions = signal([], ...ngDevMode ? [{ debugName: "mappingVersions" }] : (
    /* istanbul ignore next */
    []
  ));
  selectedMappings = signal([], ...ngDevMode ? [{ debugName: "selectedMappings" }] : (
    /* istanbul ignore next */
    []
  ));
  templates = signal([], ...ngDevMode ? [{ debugName: "templates" }] : (
    /* istanbul ignore next */
    []
  ));
  versionDiff = signal(null, ...ngDevMode ? [{ debugName: "versionDiff" }] : (
    /* istanbul ignore next */
    []
  ));
  executionSeries = signal([], ...ngDevMode ? [{ debugName: "executionSeries" }] : (
    /* istanbul ignore next */
    []
  ));
  executionLogs = signal([], ...ngDevMode ? [{ debugName: "executionLogs" }] : (
    /* istanbul ignore next */
    []
  ));
  statusFilterOptions = [
    { label: "All statuses", value: "all" },
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    { label: "Deprecated", value: "deprecated" }
  ];
  sourceTypeFilterOptions = signal([
    { label: "All types", value: "all" }
  ], ...ngDevMode ? [{ debugName: "sourceTypeFilterOptions" }] : (
    /* istanbul ignore next */
    []
  ));
  _mappings = signal([], ...ngDevMode ? [{ debugName: "_mappings" }] : (
    /* istanbul ignore next */
    []
  ));
  mappings = this._mappings.asReadonly();
  // ── Computed (reads signals — reactive) ───────────────────────────────────
  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const sf = this.statusFilter();
    const stf = this.sourceTypeFilter();
    return this._mappings().filter((m) => {
      const matchesSearch = !q || m.partner.includes(q) || m.eventType.includes(q) || m.version.toLowerCase().includes(q) || m.sourceType.toLowerCase().includes(q);
      const matchesStatus = sf === "all" || m.status === sf;
      const matchesSourceType = stf === "all" || m.sourceType === stf;
      return matchesSearch && matchesStatus && matchesSourceType;
    });
  }, ...ngDevMode ? [{ debugName: "filtered" }] : (
    /* istanbul ignore next */
    []
  ));
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadPartners();
  }
  loadPartners() {
    this.partnerService.list().subscribe({
      next: (partners) => {
        const map = /* @__PURE__ */ new Map();
        partners.forEach((p) => {
          if (p.id) {
            map.set(p.id, p.name || p.id);
          }
        });
        this.partners.set(map);
        this.loadMappings();
      },
      error: () => {
        this.partners.set(/* @__PURE__ */ new Map());
        this.loadMappings();
      }
    });
  }
  loadMappings() {
    this.loading.set(true);
    this.mappingService.list().subscribe({
      next: (drafts) => {
        if (!drafts) {
          this._mappings.set([]);
          this.loading.set(false);
          return;
        }
        const mappings = Array.isArray(drafts) ? drafts : [];
        const mapped = mappings.map((d) => this.draftToViewModel(d));
        this._mappings.set(mapped);
        this.selectedMappings.set([]);
        const uniqueSourceTypes = new Set(mapped.map((m) => m.sourceType).filter(Boolean));
        const sourceTypeOptions = [
          { label: "All types", value: "all" },
          ...Array.from(uniqueSourceTypes).sort().map((type) => ({ label: type, value: type }))
        ];
        this.sourceTypeFilterOptions.set(sourceTypeOptions);
        this.loading.set(false);
        this.loadExecutionStats(mapped);
      },
      error: () => {
        this._mappings.set([]);
        this.loading.set(false);
      }
    });
  }
  loadExecutionStats(mappings) {
    for (const mapping of mappings) {
      if (!mapping.id)
        continue;
      this.http.get(`/api/proxy/${mapping.id}/stats`, {
        headers: this.tenantHeaders()
      }).subscribe({
        next: (stats) => {
          if (stats && stats.total > 0) {
            this._mappings.update((list) => list.map((m) => {
              if (m.id === mapping.id) {
                return __spreadProps(__spreadValues({}, m), {
                  lastTestStatus: stats.errors > 0 ? "ERROR" : "SUCCESS",
                  successRate: stats.successRate
                });
              }
              return m;
            }));
          }
        },
        error: () => {
        }
        // Silently ignore stats errors
      });
    }
  }
  draftToViewModel(d) {
    const partnerName = d.partner_id ? this.partners().get(d.partner_id) : void 0;
    let method = d.rest_api_method;
    if (!method && d.source_config) {
      try {
        const sourceConfig = JSON.parse(d.source_config);
        method = sourceConfig.method;
      } catch {
      }
    }
    return {
      id: d.id ?? "",
      partner: partnerName ?? d.partner_id ?? "Unknown Partner",
      eventType: d.event_type ?? "",
      sourceType: this.formatSourceType(d.source_type),
      method,
      version: d.status === "DRAFT" ? "draft" : d.status === "READY_TO_PUBLISH" ? "published" : "draft",
      status: this.mapDraftStatus(d.status),
      createdAt: d.created_at ? d.created_at.slice(0, 10) : "",
      publishedBy: this.formatUserName(d.created_by),
      transformations: 0,
      checksum: d.id ? `draft:${d.id.slice(0, 7)}` : "",
      notes: d.description ?? "",
      rules: d.mapping_rules ? this.parseRuleNames(d.mapping_rules) : []
    };
  }
  formatSourceType(sourceType) {
    if (!sourceType)
      return "Unknown";
    return sourceType.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  }
  formatUserName(userId) {
    if (!userId)
      return "Unknown";
    if (userId.includes("-") && userId.length === 36) {
      return "System";
    }
    if (userId.includes("@")) {
      const namePart = userId.split("@")[0];
      return namePart.split(/[._-]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    }
    return userId;
  }
  mapDraftStatus(status) {
    if (status === "READY_TO_PUBLISH" || status === "VALID")
      return "active";
    if (status === "INVALID")
      return "deprecated";
    return "draft";
  }
  parseRuleNames(rulesJson) {
    try {
      const parsed = JSON.parse(rulesJson);
      if (Array.isArray(parsed))
        return parsed.map((r) => r.name ?? "").filter(Boolean);
    } catch {
    }
    return [];
  }
  // ── Actions ───────────────────────────────────────────────────────────────
  openDetails(mapping) {
    this.selectedMapping.set(mapping);
    this.detailVisible = true;
    this.versionDiff.set(null);
    this.loadMappingVersions(mapping.id);
    this.loadMappingHealthDetail(mapping.id);
  }
  loadMappingVersions(mappingId) {
    this.http.get(`/api/mapping-versions`, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: (versions) => {
        const filtered = versions.filter((v) => v.draft_id === mappingId);
        this.mappingVersions.set(filtered);
      },
      error: () => this.mappingVersions.set([])
    });
  }
  loadMappingHealthDetail(mappingId) {
    this.http.get(`/api/proxy/${mappingId}/series`, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: (series) => this.executionSeries.set(series ?? []),
      error: () => this.executionSeries.set([])
    });
    this.http.get(`/api/proxy/${mappingId}/logs`, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: (logs) => this.executionLogs.set((logs ?? []).slice(0, 50)),
      error: () => this.executionLogs.set([])
    });
  }
  openInStudio(mapping) {
    void this.router.navigate(["/wizard"], { queryParams: { mappingId: mapping.id } });
  }
  deprecate(mapping, event) {
    this.confirmation.confirm({
      target: event.target,
      header: this.t("mappings.deprecateTitle"),
      message: this.t("mappings.deprecateMessage", { version: `${mapping.partner}/${mapping.eventType}@${mapping.version}` }),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: this.t("mappings.deprecate"),
      rejectLabel: this.t("mappings.cancel"),
      accept: () => {
        this.http.post(`/api/mapping-drafts/bulk/deprecate`, { ids: [mapping.id] }, {
          headers: this.tenantHeaders()
        }).subscribe({
          next: () => {
            this._mappings.update((list) => list.map((m) => m.id === mapping.id ? __spreadProps(__spreadValues({}, m), { status: "deprecated" }) : m));
            this.toast.add({ severity: "warn", summary: this.t("mappings.toast.deprecated"), detail: mapping.version });
            const sel = this.selectedMapping();
            if (sel?.id === mapping.id)
              this.selectedMapping.set(__spreadProps(__spreadValues({}, sel), { status: "deprecated" }));
          },
          error: () => this.toast.add({ severity: "error", summary: "Error", detail: "Failed to deprecate mapping" })
        });
      }
    });
  }
  importMapping(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file)
      return;
    file.text().then((content) => {
      const payload = JSON.parse(content);
      this.http.post(`/api/mapping-drafts/import`, payload, {
        headers: this.tenantHeaders()
      }).subscribe({
        next: () => {
          this.toast.add({ severity: "success", summary: "Imported", detail: file.name });
          this.loadMappings();
        },
        error: () => this.toast.add({ severity: "error", summary: "Import failed", detail: file.name })
      });
    }).catch(() => this.toast.add({ severity: "error", summary: "Import failed", detail: "Invalid JSON file" })).finally(() => input.value = "");
  }
  exportMapping(mapping) {
    this.http.get(`/api/mapping-drafts/${mapping.id}/export`, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: (draft) => this.downloadJson(draft, `mapping-${mapping.eventType || mapping.id}.json`),
      error: () => this.toast.add({ severity: "error", summary: "Export failed", detail: mapping.eventType })
    });
  }
  cloneMapping(mapping) {
    this.http.post(`/api/mapping-drafts/${mapping.id}/clone`, {}, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: () => {
        this.toast.add({ severity: "success", summary: "Cloned", detail: mapping.eventType });
        this.loadMappings();
      },
      error: () => this.toast.add({ severity: "error", summary: "Clone failed", detail: mapping.eventType })
    });
  }
  bulkPublish() {
    const ids = this.selectedMappings().map((m) => m.id);
    if (ids.length === 0)
      return;
    this.http.post(`/api/mapping-drafts/bulk/publish`, { ids }, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: () => {
        this.toast.add({ severity: "success", summary: "Published", detail: `${ids.length} mappings` });
        this.loadMappings();
      },
      error: () => this.toast.add({ severity: "error", summary: "Bulk publish failed" })
    });
  }
  bulkDeprecate() {
    const ids = this.selectedMappings().map((m) => m.id);
    if (ids.length === 0)
      return;
    this.http.post(`/api/mapping-drafts/bulk/deprecate`, { ids }, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: () => {
        this.toast.add({ severity: "warn", summary: "Deprecated", detail: `${ids.length} mappings` });
        this.loadMappings();
      },
      error: () => this.toast.add({ severity: "error", summary: "Bulk deprecate failed" })
    });
  }
  loadTemplates() {
    this.http.get(`/api/mapping-templates`).subscribe({
      next: (templates) => {
        this.templates.set(templates ?? []);
        this.templateDialogVisible = true;
      },
      error: () => this.toast.add({ severity: "error", summary: "Templates unavailable" })
    });
  }
  createFromTemplate(template) {
    this.http.post(`/api/mapping-drafts/import`, template.draft, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: () => {
        this.templateDialogVisible = false;
        this.toast.add({ severity: "success", summary: "Template created", detail: template.name });
        this.loadMappings();
      },
      error: () => this.toast.add({ severity: "error", summary: "Template failed", detail: template.name })
    });
  }
  compareLatestVersions() {
    const versions = [...this.mappingVersions()].sort((a, b) => Number(b.version ?? 0) - Number(a.version ?? 0));
    if (versions.length < 2)
      return;
    this.http.get(`/api/mapping-versions/${versions[0].id}/diff/${versions[1].id}`, {
      headers: this.tenantHeaders()
    }).subscribe({
      next: (diff) => this.versionDiff.set(diff),
      error: () => this.toast.add({ severity: "error", summary: "Diff failed" })
    });
  }
  delete(mapping, event) {
    this.confirmation.confirm({
      target: event.target,
      header: this.t("mappings.deleteTitle"),
      message: this.t("mappings.deleteMessage", { version: `${mapping.partner}/${mapping.eventType}@${mapping.version}` }),
      icon: "pi pi-trash",
      acceptLabel: this.t("mappings.delete"),
      rejectLabel: this.t("mappings.cancel"),
      accept: () => {
        this.mappingService.delete(mapping.id).subscribe({
          next: () => {
            this._mappings.update((list) => list.filter((m) => m.id !== mapping.id));
            this.toast.add({ severity: "success", summary: this.t("mappings.toast.deleted"), detail: mapping.version });
            if (this.selectedMapping()?.id === mapping.id)
              this.detailVisible = false;
          },
          error: () => {
            this.toast.add({ severity: "error", summary: "Error", detail: "Failed to delete mapping" });
          }
        });
      }
    });
  }
  exportCsv() {
    const header = "partner,eventType,sourceType,method,version,status,transformations,createdAt,publishedBy";
    const rows = this.filtered().map((m) => `"${m.partner}","${m.eventType}","${m.sourceType}","${m.method ?? ""}","${m.version}","${m.status}",${m.transformations},"${m.createdAt}","${m.publishedBy}"`).join("\n");
    const blob = new Blob([`${header}
${rows}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mappings-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.add({ severity: "info", summary: this.t("mappings.toast.exported"), detail: `${this.filtered().length} rows` });
  }
  downloadJson(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.add({ severity: "info", summary: this.t("mappings.toast.exported"), detail: filename });
  }
  getSeverity(status) {
    const map = {
      active: "success",
      draft: "warn",
      deprecated: "secondary"
    };
    return map[status] ?? "secondary";
  }
  t(key, params) {
    return this.i18n.translate(key, params);
  }
  tenantHeaders() {
    return {};
  }
  static \u0275fac = function MappingsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MappingsComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MappingsComponent, selectors: [["app-mappings"]], features: [\u0275\u0275ProvidersFeature([ConfirmationService, MessageService])], decls: 41, vars: 35, consts: [["importFile", ""], [1, "page-header"], [1, "page-title"], [1, "page-subtitle"], [1, "page-actions"], ["type", "file", "accept", "application/json", "hidden", "", 3, "change"], ["label", "Import", "icon", "pi pi-upload", "variant", "outlined", "severity", "secondary", 3, "onClick"], ["label", "Templates", "icon", "pi pi-copy", "variant", "outlined", "severity", "secondary", 3, "onClick"], ["icon", "pi pi-plus", "routerLink", "/wizard", 3, "label"], [1, "table-toolbar"], [1, "toolbar-left"], ["styleClass", "pi pi-search"], ["pInputText", "", 3, "ngModelChange", "ngModel", "placeholder"], ["optionLabel", "label", "optionValue", "value", "styleClass", "status-filter-select", 3, "ngModelChange", "options", "ngModel"], [1, "toolbar-right"], [1, "result-count"], ["icon", "pi pi-send", "variant", "outlined", "severity", "secondary", "size", "small", "pTooltip", "Publish selected", 3, "onClick", "disabled"], ["icon", "pi pi-ban", "variant", "outlined", "severity", "warn", "size", "small", "pTooltip", "Deprecate selected", 3, "onClick", "disabled"], ["icon", "pi pi-download", "variant", "outlined", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-map", "actionIcon", "pi pi-plus", "routerLink", "/studio", 3, "title", "description", "actionLabel"], ["styleClass", "p-datatable-sm p-datatable-striped", "dataKey", "id", 3, "value", "paginator", "rows", "selection"], ["position", "right", "styleClass", "mapping-detail-drawer", 3, "visibleChange", "visible"], ["header", "Mapping templates", 3, "visibleChange", "visible", "modal"], [1, "template-list"], [1, "template-item"], ["styleClass", "p-datatable-sm p-datatable-striped", "dataKey", "id", 3, "selectionChange", "value", "paginator", "rows", "selection"], ["pTemplate", "header"], ["pTemplate", "body"], ["pTemplate", "emptymessage"], [2, "width", "44px"], ["pSortableColumn", "partner"], ["field", "partner"], ["pSortableColumn", "eventType"], ["field", "eventType"], ["pSortableColumn", "sourceType"], ["field", "sourceType"], ["pSortableColumn", "method"], ["field", "method"], ["pSortableColumn", "version"], ["field", "version"], ["pSortableColumn", "status"], ["field", "status"], ["pSortableColumn", "transformations", 2, "text-align", "right"], ["field", "transformations"], ["pSortableColumn", "createdAt"], ["field", "createdAt"], ["pSortableColumn", "publishedBy"], ["field", "publishedBy"], [2, "width", "160px"], [3, "value"], [1, "event-code"], ["severity", "secondary", 3, "value"], [3, "class"], [1, "version-badge"], [3, "severity", "value"], [1, "health-badge", 3, "healthy", "degraded", "unhealthy"], [1, "health-badge", "untested"], [1, "text-sm", 2, "text-align", "right"], [1, "text-sm", "text-color-secondary"], [1, "row-actions"], ["icon", "pi pi-eye", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-objects-column", "variant", "text", "severity", "secondary", "size", "small", 3, "onClick", "pTooltip"], ["icon", "pi pi-download", "variant", "text", "severity", "secondary", "size", "small", "pTooltip", "Export JSON", 3, "onClick"], ["icon", "pi pi-clone", "variant", "text", "severity", "secondary", "size", "small", "pTooltip", "Clone", 3, "onClick"], ["icon", "pi pi-copy", "variant", "text", "severity", "secondary", "size", "small", "pTooltip", "Clone", 3, "onClick"], ["icon", "pi pi-ban", "variant", "text", "severity", "warn", "size", "small", 3, "onClick", "disabled", "pTooltip"], ["icon", "pi pi-trash", "variant", "text", "severity", "danger", "size", "small", 3, "onClick", "pTooltip"], [1, "health-badge"], ["colspan", "12", 1, "empty-cell"], [1, "drawer-header"], [1, "drawer-eyebrow"], [1, "version-chip"], [1, "detail-grid"], [1, "detail-section"], [1, "checksum-code"], [1, "rules-list"], [1, "trend-list"], ["styleClass", "p-datatable-sm", 3, "value"], [1, "drawer-actions"], ["icon", "pi pi-objects-column", "styleClass", "w-full", 3, "onClick", "label"], ["icon", "pi pi-ban", "severity", "warn", "variant", "outlined", "styleClass", "w-full", 3, "onClick", "label", "disabled"], ["icon", "pi pi-trash", "severity", "danger", "variant", "outlined", "styleClass", "w-full", 3, "onClick", "label"], [1, "pi", "pi-check-circle"], [1, "section-actions"], ["label", "Compare latest", "icon", "pi pi-code", "variant", "outlined", "severity", "secondary", "size", "small", 3, "onClick", "disabled"], [1, "versions-list"], [1, "version-item", 3, "deprecated"], [1, "diff-view"], [1, "version-item"], [1, "version-info"], [1, "version-date"], [3, "value", "severity"], [1, "trend-item"], [2, "text-align", "right"], [1, "text-sm"], ["label", "Use", "icon", "pi pi-plus", "size", "small", 3, "onClick"]], template: function MappingsComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275element(0, "p-confirmDialog");
      \u0275\u0275elementStart(1, "div", 1)(2, "div")(3, "h1", 2);
      \u0275\u0275text(4);
      \u0275\u0275pipe(5, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "p", 3);
      \u0275\u0275text(7);
      \u0275\u0275pipe(8, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 4)(10, "input", 5, 0);
      \u0275\u0275listener("change", function MappingsComponent_Template_input_change_10_listener($event) {
        return ctx.importMapping($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "p-button", 6);
      \u0275\u0275listener("onClick", function MappingsComponent_Template_p_button_onClick_12_listener() {
        \u0275\u0275restoreView(_r1);
        const importFile_r2 = \u0275\u0275reference(11);
        return \u0275\u0275resetView(importFile_r2.click());
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(13, "p-button", 7);
      \u0275\u0275listener("onClick", function MappingsComponent_Template_p_button_onClick_13_listener() {
        return ctx.loadTemplates();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275element(14, "p-button", 8);
      \u0275\u0275pipe(15, "i18n");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "p-card")(17, "div", 9)(18, "div", 10)(19, "p-iconfield");
      \u0275\u0275element(20, "p-inputicon", 11);
      \u0275\u0275elementStart(21, "input", 12);
      \u0275\u0275pipe(22, "i18n");
      \u0275\u0275listener("ngModelChange", function MappingsComponent_Template_input_ngModelChange_21_listener($event) {
        return ctx.search.set($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(23, "p-select", 13);
      \u0275\u0275listener("ngModelChange", function MappingsComponent_Template_p_select_ngModelChange_23_listener($event) {
        return ctx.statusFilter.set($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "p-select", 13);
      \u0275\u0275listener("ngModelChange", function MappingsComponent_Template_p_select_ngModelChange_24_listener($event) {
        return ctx.sourceTypeFilter.set($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "div", 14)(26, "span", 15);
      \u0275\u0275text(27);
      \u0275\u0275pipe(28, "i18n");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "p-button", 16);
      \u0275\u0275listener("onClick", function MappingsComponent_Template_p_button_onClick_29_listener() {
        return ctx.bulkPublish();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "p-button", 17);
      \u0275\u0275listener("onClick", function MappingsComponent_Template_p_button_onClick_30_listener() {
        return ctx.bulkDeprecate();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(31, "p-button", 18);
      \u0275\u0275pipe(32, "i18n");
      \u0275\u0275listener("onClick", function MappingsComponent_Template_p_button_onClick_31_listener() {
        return ctx.exportCsv();
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(33, MappingsComponent_Conditional_33_Template, 4, 9, "app-empty-state", 19);
      \u0275\u0275conditionalCreate(34, MappingsComponent_Conditional_34_Template, 4, 4, "p-table", 20);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "p-drawer", 21);
      \u0275\u0275twoWayListener("visibleChange", function MappingsComponent_Template_p_drawer_visibleChange_35_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.detailVisible, $event) || (ctx.detailVisible = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275conditionalCreate(36, MappingsComponent_Conditional_36_Template, 91, 59);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(37, "p-dialog", 22);
      \u0275\u0275twoWayListener("visibleChange", function MappingsComponent_Template_p_dialog_visibleChange_37_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.templateDialogVisible, $event) || (ctx.templateDialogVisible = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementStart(38, "div", 23);
      \u0275\u0275repeaterCreate(39, MappingsComponent_For_40_Template, 7, 2, "article", 24, _forTrack0);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      let tmp_17_0;
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 22, "mappings.title"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 24, "mappings.subtitle"));
      \u0275\u0275advance(7);
      \u0275\u0275property("label", \u0275\u0275pipeBind1(15, 26, "mappings.newDemo"));
      \u0275\u0275advance(7);
      \u0275\u0275property("ngModel", ctx.search())("placeholder", \u0275\u0275pipeBind1(22, 28, "mappings.searchPlaceholder"));
      \u0275\u0275advance(2);
      \u0275\u0275property("options", ctx.statusFilterOptions)("ngModel", ctx.statusFilter());
      \u0275\u0275advance();
      \u0275\u0275property("options", ctx.sourceTypeFilterOptions())("ngModel", ctx.sourceTypeFilter());
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate2("", ctx.filtered().length, " ", \u0275\u0275pipeBind1(28, 30, "mappings.results"));
      \u0275\u0275advance(2);
      \u0275\u0275property("disabled", ctx.selectedMappings().length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", ctx.selectedMappings().length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("pTooltip", \u0275\u0275pipeBind1(32, 32, "mappings.export"));
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.mappings().length === 0 ? 33 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.mappings().length > 0 ? 34 : -1);
      \u0275\u0275advance();
      \u0275\u0275twoWayProperty("visible", ctx.detailVisible);
      \u0275\u0275advance();
      \u0275\u0275conditional((tmp_17_0 = ctx.selectedMapping()) ? 36 : -1, tmp_17_0);
      \u0275\u0275advance();
      \u0275\u0275styleMap(\u0275\u0275pureFunction0(34, _c0));
      \u0275\u0275twoWayProperty("visible", ctx.templateDialogVisible);
      \u0275\u0275property("modal", true);
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.templates());
    }
  }, dependencies: [
    RouterLink,
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
    EmptyStateComponent,
    IconFieldModule,
    IconField,
    InputIconModule,
    InputIcon,
    InputTextModule,
    InputText,
    SelectModule,
    Select,
    TableModule,
    Table,
    SortableColumn,
    SortIcon,
    TableCheckbox,
    TableHeaderCheckbox,
    TagModule,
    Tag,
    ToastModule,
    TooltipModule,
    Tooltip,
    DecimalPipe,
    JsonPipe,
    I18nPipe
  ], styles: ["\n.table-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-bottom: 1.25rem;\n  flex-wrap: wrap;\n}\n.toolbar-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  flex: 1;\n  min-width: 0;\n}\n.toolbar-left[_ngcontent-%COMP%]   p-iconfield[_ngcontent-%COMP%] {\n  flex: 0 0 260px;\n}\n.toolbar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.result-count[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 500;\n  color: var(--text-color-secondary);\n  white-space: nowrap;\n}\n[_nghost-%COMP%]     .status-filter-select {\n  min-width: 130px;\n}\n.row-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.125rem;\n  justify-content: flex-end;\n  opacity: 0.4;\n  transition: opacity 0.2s ease;\n}\ntr[_ngcontent-%COMP%]:hover   .row-actions[_ngcontent-%COMP%] {\n  opacity: 1;\n}\n.event-code[_ngcontent-%COMP%] {\n  font-family: var(--cb-font-mono);\n  font-size: 0.75rem;\n  background: var(--surface-100);\n  padding: 0.2rem 0.5rem;\n  border-radius: 4px;\n  color: var(--text-color-secondary);\n}\n.method-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  font-size: 0.625rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 0.2rem 0.5rem;\n  border-radius: 4px;\n  letter-spacing: 0.03em;\n}\n.method-badge.method-get[_ngcontent-%COMP%], \n.method-badge.method-getcustomer[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--green-500, #10b981) 10%, var(--surface-card));\n  color: var(--green-600, #059669);\n}\n.method-badge.method-post[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--blue-500, #3b82f6) 10%, var(--surface-card));\n  color: var(--blue-600, #2563eb);\n}\n.method-badge.method-put[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--yellow-500, #eab308) 10%, var(--surface-card));\n  color: var(--yellow-700, #d97706);\n}\n.method-badge.method-patch[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--purple-500, #a855f7) 10%, var(--surface-card));\n  color: var(--purple-600, #7c3aed);\n}\n.method-badge.method-delete[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--red-500, #ef4444) 10%, var(--surface-card));\n  color: var(--red-600, #dc2626);\n}\n.empty-cell[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 3rem !important;\n  color: var(--text-color-secondary);\n  font-size: 0.875rem;\n}\n.drawer-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-bottom: 1.5rem;\n}\n.drawer-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-size: 1.125rem;\n  font-weight: 700;\n  margin: 0.25rem 0 0;\n  color: var(--text-color);\n}\n.drawer-eyebrow[_ngcontent-%COMP%] {\n  font-size: 0.6875rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--text-color-secondary);\n}\n.version-chip[_ngcontent-%COMP%] {\n  display: inline-block;\n  font-size: 0.75rem;\n  font-weight: 600;\n  background: color-mix(in srgb, var(--purple-500, #a855f7) 12%, var(--surface-card));\n  color: var(--purple-600, #7c3aed);\n  padding: 2px 10px;\n  border-radius: 999px;\n  margin-left: 0.375rem;\n}\n.detail-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.625rem;\n  margin-bottom: 1.5rem;\n}\n.detail-grid[_ngcontent-%COMP%]   article[_ngcontent-%COMP%] {\n  background: var(--surface-ground);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  padding: 0.75rem;\n}\n.detail-grid[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.6875rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: var(--text-color-secondary);\n  margin-bottom: 0.25rem;\n}\n.detail-grid[_ngcontent-%COMP%]   article[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--text-color);\n  word-break: break-all;\n}\n.detail-section[_ngcontent-%COMP%] {\n  margin-bottom: 1.25rem;\n}\n.detail-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  font-size: 0.6875rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--text-color-secondary);\n  margin: 0 0 0.5rem;\n}\n.detail-section[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--text-color);\n  margin: 0;\n  line-height: 1.6;\n}\n.checksum-code[_ngcontent-%COMP%] {\n  font-family: var(--cb-font-mono);\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  word-break: break-all;\n}\n.rules-list[_ngcontent-%COMP%] {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 0.375rem;\n}\n.rules-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.8125rem;\n  color: var(--text-color);\n}\n.rules-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  color: var(--green-500, #10b981);\n  font-size: 0.8125rem;\n  flex-shrink: 0;\n}\n.drawer-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  margin-top: 2rem;\n  padding-top: 1.25rem;\n  border-top: 1px solid var(--surface-border);\n}\n.section-actions[_ngcontent-%COMP%] {\n  margin-bottom: 0.75rem;\n}\n.diff-view[_ngcontent-%COMP%] {\n  max-height: 220px;\n  overflow: auto;\n  margin-top: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 6px;\n  border: 1px solid var(--surface-border);\n  background: var(--cb-color-ink-950);\n  color: #e2e8f0;\n  font-size: 0.75rem;\n}\n.trend-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.5rem;\n}\n.trend-item[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto auto;\n  gap: 0.75rem;\n  align-items: center;\n  padding: 0.625rem 0.75rem;\n  background: var(--surface-ground);\n  border: 1px solid var(--surface-border);\n  border-radius: 6px;\n  font-size: 0.8125rem;\n}\n.trend-item[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.trend-item[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n}\n.template-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0.75rem;\n}\n.template-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 1rem;\n  align-items: center;\n  padding: 0.875rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-ground);\n}\n.template-item[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0.25rem 0 0;\n  color: var(--text-color-secondary);\n  font-size: 0.8125rem;\n}\n@media (max-width: 640px) {\n  .toolbar-left[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .toolbar-left[_ngcontent-%COMP%]   p-iconfield[_ngcontent-%COMP%] {\n    flex: none;\n  }\n}\n.health-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  font-size: 0.6875rem;\n  font-weight: 700;\n  padding: 0.2rem 0.5rem;\n  border-radius: 4px;\n}\n.health-badge.healthy[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--green-500, #10b981) 10%, var(--surface-card));\n  color: var(--green-600, #059669);\n}\n.health-badge.degraded[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--yellow-500, #eab308) 10%, var(--surface-card));\n  color: var(--yellow-700, #d97706);\n}\n.health-badge.unhealthy[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--red-500, #ef4444) 10%, var(--surface-card));\n  color: var(--red-600, #dc2626);\n}\n.health-badge.untested[_ngcontent-%COMP%] {\n  color: var(--text-color-secondary);\n}\n.versions-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.versions-list[_ngcontent-%COMP%]   .version-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.625rem 0.75rem;\n  background: var(--surface-ground);\n  border: 1px solid var(--surface-border);\n  border-radius: 6px;\n}\n.versions-list[_ngcontent-%COMP%]   .version-item.deprecated[_ngcontent-%COMP%] {\n  opacity: 0.6;\n}\n.versions-list[_ngcontent-%COMP%]   .version-item[_ngcontent-%COMP%]   .version-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.versions-list[_ngcontent-%COMP%]   .version-item[_ngcontent-%COMP%]   .version-info[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--text-color);\n}\n.versions-list[_ngcontent-%COMP%]   .version-item[_ngcontent-%COMP%]   .version-info[_ngcontent-%COMP%]   .version-date[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n}\n/*# sourceMappingURL=mappings.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MappingsComponent, [{
    type: Component,
    args: [{ selector: "app-mappings", standalone: true, imports: [
      RouterLink,
      FormsModule,
      DecimalPipe,
      JsonPipe,
      ButtonModule,
      CardModule,
      ConfirmDialogModule,
      DialogModule,
      DrawerModule,
      EmptyStateComponent,
      IconFieldModule,
      InputIconModule,
      InputTextModule,
      SelectModule,
      TableModule,
      TagModule,
      ToastModule,
      TooltipModule,
      I18nPipe
    ], providers: [ConfirmationService, MessageService], template: `<p-confirmDialog />

<div class="page-header">
  <div>
    <h1 class="page-title">{{ 'mappings.title' | i18n }}</h1>
    <p class="page-subtitle">{{ 'mappings.subtitle' | i18n }}</p>
  </div>
  <div class="page-actions">
    <input #importFile type="file" accept="application/json" hidden (change)="importMapping($event)" />
    <p-button label="Import" icon="pi pi-upload" variant="outlined" severity="secondary" (onClick)="importFile.click()" />
    <p-button label="Templates" icon="pi pi-copy" variant="outlined" severity="secondary" (onClick)="loadTemplates()" />
    <p-button [label]="'mappings.newDemo' | i18n" icon="pi pi-plus" routerLink="/wizard" />
  </div>
</div>

<p-card>
  <div class="table-toolbar">
    <div class="toolbar-left">
      <p-iconfield>
        <p-inputicon styleClass="pi pi-search" />
        <input pInputText [ngModel]="search()" (ngModelChange)="search.set($event)" [placeholder]="'mappings.searchPlaceholder' | i18n" />
      </p-iconfield>
      <p-select
        [options]="statusFilterOptions"
        optionLabel="label"
        optionValue="value"
        [ngModel]="statusFilter()"
        (ngModelChange)="statusFilter.set($event)"
        styleClass="status-filter-select" />
      <p-select
        [options]="sourceTypeFilterOptions()"
        optionLabel="label"
        optionValue="value"
        [ngModel]="sourceTypeFilter()"
        (ngModelChange)="sourceTypeFilter.set($event)"
        styleClass="status-filter-select" />
    </div>
    <div class="toolbar-right">
      <span class="result-count">{{ filtered().length }} {{ 'mappings.results' | i18n }}</span>
      <p-button
        icon="pi pi-send"
        variant="outlined"
        severity="secondary"
        size="small"
        [disabled]="selectedMappings().length === 0"
        (onClick)="bulkPublish()"
        pTooltip="Publish selected" />
      <p-button
        icon="pi pi-ban"
        variant="outlined"
        severity="warn"
        size="small"
        [disabled]="selectedMappings().length === 0"
        (onClick)="bulkDeprecate()"
        pTooltip="Deprecate selected" />
      <p-button
        icon="pi pi-download"
        variant="outlined"
        severity="secondary"
        size="small"
        (onClick)="exportCsv()"
        [pTooltip]="'mappings.export' | i18n" />
    </div>
  </div>

  @if (mappings().length === 0) {
    <app-empty-state
      icon="pi pi-map"
      [title]="'mappings.emptyTitle' | i18n"
      [description]="'mappings.emptyDescription' | i18n"
      [actionLabel]="'mappings.newDemo' | i18n"
      actionIcon="pi pi-plus"
      routerLink="/studio" />
  }

  @if (mappings().length > 0) {
  <p-table
    [value]="filtered()"
    styleClass="p-datatable-sm p-datatable-striped"
    [paginator]="true"
    [rows]="10"
    dataKey="id"
    [selection]="selectedMappings()"
    (selectionChange)="selectedMappings.set($event)">
    <ng-template pTemplate="header">
      <tr>
        <th style="width:44px"><p-tableHeaderCheckbox /></th>
        <th pSortableColumn="partner">{{ 'table.partner' | i18n }} <p-sortIcon field="partner" /></th>
        <th pSortableColumn="eventType">{{ 'table.eventType' | i18n }} <p-sortIcon field="eventType" /></th>
        <th pSortableColumn="sourceType">{{ 'table.sourceType' | i18n }} <p-sortIcon field="sourceType" /></th>
        <th pSortableColumn="method">{{ 'table.method' | i18n }} <p-sortIcon field="method" /></th>
        <th pSortableColumn="version">{{ 'table.version' | i18n }} <p-sortIcon field="version" /></th>
        <th pSortableColumn="status">{{ 'table.status' | i18n }} <p-sortIcon field="status" /></th>
        <th>{{ 'table.health' | i18n }}</th>
        <th pSortableColumn="transformations" style="text-align:right">
          {{ 'table.transformations' | i18n }} <p-sortIcon field="transformations" />
        </th>
        <th pSortableColumn="createdAt">{{ 'table.published' | i18n }} <p-sortIcon field="createdAt" /></th>
        <th pSortableColumn="publishedBy">{{ 'table.by' | i18n }} <p-sortIcon field="publishedBy" /></th>
        <th style="width:160px"></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-m>
      <tr>
        <td><p-tableCheckbox [value]="m" /></td>
        <td><strong>{{ m.partner }}</strong></td>
        <td><code class="event-code">{{ m.eventType }}</code></td>
        <td><p-tag severity="secondary" [value]="m.sourceType" /></td>
        <td>
          @if (m.method) {
            <span class="method-badge method-{{ m.method.toLowerCase() }}">{{ m.method }}</span>
          }
        </td>
        <td><span class="version-badge">{{ m.version }}</span></td>
        <td><p-tag [severity]="getSeverity(m.status)" [value]="('status.' + m.status) | i18n" /></td>
        <td>
          @if (m.successRate !== undefined) {
            <span class="health-badge" [class.healthy]="m.successRate >= 95" [class.degraded]="m.successRate >= 50 && m.successRate < 95" [class.unhealthy]="m.successRate < 50">
              {{ m.successRate }}%
            </span>
          } @else {
            <span class="health-badge untested">\u2014</span>
          }
        </td>
        <td style="text-align:right" class="text-sm">{{ m.transformations | number }}</td>
        <td class="text-sm text-color-secondary">{{ m.createdAt }}</td>
        <td class="text-sm text-color-secondary">{{ m.publishedBy }}</td>
        <td>
          <div class="row-actions">
            <p-button
              icon="pi pi-eye"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="openDetails(m)"
              [pTooltip]="'mappings.preview' | i18n" />
            <p-button
              icon="pi pi-objects-column"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="openInStudio(m)"
              [pTooltip]="'mappings.openStudio' | i18n" />
            <p-button
              icon="pi pi-download"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="exportMapping(m)"
              pTooltip="Export JSON" />
            <p-button
              icon="pi pi-clone"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="cloneMapping(m)"
              pTooltip="Clone" />
            <p-button
              icon="pi pi-copy"
              variant="text"
              severity="secondary"
              size="small"
              (onClick)="cloneMapping(m)"
              pTooltip="Clone" />
            <p-button
              icon="pi pi-ban"
              variant="text"
              severity="warn"
              size="small"
              [disabled]="m.status === 'deprecated'"
              (onClick)="deprecate(m, $event)"
              [pTooltip]="'mappings.deprecate' | i18n" />
            <p-button
              icon="pi pi-trash"
              variant="text"
              severity="danger"
              size="small"
              (onClick)="delete(m, $event)"
              [pTooltip]="'mappings.delete' | i18n" />
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="12" class="empty-cell">{{ 'mappings.empty' | i18n }}</td>
      </tr>
    </ng-template>
  </p-table>
  }
</p-card>

<!-- \u2500\u2500 Version detail drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
<p-drawer [(visible)]="detailVisible" position="right" styleClass="mapping-detail-drawer">
  @if (selectedMapping(); as m) {
    <div class="drawer-header">
      <div>
        <span class="drawer-eyebrow">{{ 'mappings.detailTitle' | i18n }}</span>
        <h2>{{ m.eventType }} <span class="version-chip">{{ m.version }}</span></h2>
      </div>
      <p-tag [severity]="getSeverity(m.status)" [value]="('status.' + m.status) | i18n" />
    </div>

    <div class="detail-grid">
      <article>
        <span>{{ 'table.partner' | i18n }}</span>
        <strong>{{ m.partner }}</strong>
      </article>
      <article>
        <span>{{ 'table.sourceType' | i18n }}</span>
        <strong>{{ m.sourceType }}</strong>
      </article>
      <article>
        <span>{{ 'table.method' | i18n }}</span>
        <strong>{{ m.method || 'N/A' }}</strong>
      </article>
      <article>
        <span>{{ 'table.by' | i18n }}</span>
        <strong>{{ m.publishedBy }}</strong>
      </article>
      <article>
        <span>{{ 'table.published' | i18n }}</span>
        <strong>{{ m.createdAt }}</strong>
      </article>
      <article>
        <span>{{ 'table.transformations' | i18n }}</span>
        <strong>{{ m.transformations | number }}</strong>
      </article>
    </div>

    <section class="detail-section">
      <h3>{{ 'mappings.checksum' | i18n }}</h3>
      <code class="checksum-code">{{ m.checksum }}</code>
    </section>

    <section class="detail-section">
      <h3>{{ 'mappings.notes' | i18n }}</h3>
      <p>{{ m.notes }}</p>
    </section>

    <section class="detail-section">
      <h3>{{ 'mappings.rules' | i18n }}</h3>
      <ul class="rules-list">
        @for (rule of m.rules; track rule) {
          <li><i class="pi pi-check-circle"></i>{{ rule }}</li>
        }
      </ul>
    </section>

    <section class="detail-section">
      <h3>Published Versions</h3>
      @if (mappingVersions().length === 0) {
        <p>No published versions yet</p>
      } @else {
        <div class="section-actions">
          <p-button
            label="Compare latest"
            icon="pi pi-code"
            variant="outlined"
            severity="secondary"
            size="small"
            [disabled]="mappingVersions().length < 2"
            (onClick)="compareLatestVersions()" />
        </div>
        <div class="versions-list">
          @for (v of mappingVersions(); track v.id) {
            <div class="version-item" [class.deprecated]="v.status === 'DEPRECATED'">
              <div class="version-info">
                <strong>v{{ v.version }}</strong>
                <span class="version-date">{{ v.published_at?.slice(0, 10) }}</span>
              </div>
              <p-tag [value]="v.status" [severity]="v.status === 'PUBLISHED' ? 'success' : 'secondary'" />
            </div>
          }
        </div>
        @if (versionDiff(); as diff) {
          <pre class="diff-view">{{ diff | json }}</pre>
        }
      }
    </section>

    <section class="detail-section">
      <h3>Execution history</h3>
      @if (executionSeries().length === 0) {
        <p>No execution trend yet</p>
      } @else {
        <div class="trend-list">
          @for (bucket of executionSeries(); track bucket.bucket) {
            <div class="trend-item">
              <span>{{ bucket.bucket }}</span>
              <strong>{{ bucket.success }} ok / {{ bucket.errors }} err</strong>
              <small>{{ bucket.avgLatencyMs | number:'1.0-0' }}ms avg</small>
            </div>
          }
        </div>
      }
    </section>

    <section class="detail-section">
      <h3>Last 50 executions</h3>
      <p-table [value]="executionLogs()" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>Requested</th>
            <th>Status</th>
            <th style="text-align:right">Latency</th>
            <th>Correlation</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-log>
          <tr>
            <td class="text-sm">{{ log.request_at || log.created_at }}</td>
            <td><p-tag [value]="log.status" [severity]="log.status === 'SUCCESS' ? 'success' : 'danger'" /></td>
            <td style="text-align:right">{{ log.latency_ms || log.duration_ms || 0 }}ms</td>
            <td><code>{{ log.correlation_id || 'n/a' }}</code></td>
          </tr>
        </ng-template>
      </p-table>
    </section>

    <div class="drawer-actions">
      <p-button
        [label]="'mappings.openStudio' | i18n"
        icon="pi pi-objects-column"
        (onClick)="openInStudio(m)"
        styleClass="w-full" />
      <p-button
        [label]="'mappings.deprecate' | i18n"
        icon="pi pi-ban"
        severity="warn"
        variant="outlined"
        styleClass="w-full"
        [disabled]="m.status === 'deprecated'"
        (onClick)="deprecate(m, $event)" />
      <p-button
        [label]="'mappings.delete' | i18n"
        icon="pi pi-trash"
        severity="danger"
        variant="outlined"
        styleClass="w-full"
        (onClick)="delete(m, $event)" />
    </div>
  }
</p-drawer>

<p-dialog header="Mapping templates" [(visible)]="templateDialogVisible" [modal]="true" [style]="{ width: '640px', maxWidth: '95vw' }">
  <div class="template-list">
    @for (template of templates(); track template.id) {
      <article class="template-item">
        <div>
          <strong>{{ template.name }}</strong>
          <p>{{ template.description }}</p>
        </div>
        <p-button label="Use" icon="pi pi-plus" size="small" (onClick)="createFromTemplate(template)" />
      </article>
    }
  </div>
</p-dialog>
`, styles: ["/* src/app/pages/mappings/mappings.component.scss */\n.table-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-bottom: 1.25rem;\n  flex-wrap: wrap;\n}\n.toolbar-left {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  flex: 1;\n  min-width: 0;\n}\n.toolbar-left p-iconfield {\n  flex: 0 0 260px;\n}\n.toolbar-right {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n.result-count {\n  font-size: 0.75rem;\n  font-weight: 500;\n  color: var(--text-color-secondary);\n  white-space: nowrap;\n}\n:host ::ng-deep .status-filter-select {\n  min-width: 130px;\n}\n.row-actions {\n  display: flex;\n  gap: 0.125rem;\n  justify-content: flex-end;\n  opacity: 0.4;\n  transition: opacity 0.2s ease;\n}\ntr:hover .row-actions {\n  opacity: 1;\n}\n.event-code {\n  font-family: var(--cb-font-mono);\n  font-size: 0.75rem;\n  background: var(--surface-100);\n  padding: 0.2rem 0.5rem;\n  border-radius: 4px;\n  color: var(--text-color-secondary);\n}\n.method-badge {\n  display: inline-block;\n  font-size: 0.625rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  padding: 0.2rem 0.5rem;\n  border-radius: 4px;\n  letter-spacing: 0.03em;\n}\n.method-badge.method-get,\n.method-badge.method-getcustomer {\n  background: color-mix(in srgb, var(--green-500, #10b981) 10%, var(--surface-card));\n  color: var(--green-600, #059669);\n}\n.method-badge.method-post {\n  background: color-mix(in srgb, var(--blue-500, #3b82f6) 10%, var(--surface-card));\n  color: var(--blue-600, #2563eb);\n}\n.method-badge.method-put {\n  background: color-mix(in srgb, var(--yellow-500, #eab308) 10%, var(--surface-card));\n  color: var(--yellow-700, #d97706);\n}\n.method-badge.method-patch {\n  background: color-mix(in srgb, var(--purple-500, #a855f7) 10%, var(--surface-card));\n  color: var(--purple-600, #7c3aed);\n}\n.method-badge.method-delete {\n  background: color-mix(in srgb, var(--red-500, #ef4444) 10%, var(--surface-card));\n  color: var(--red-600, #dc2626);\n}\n.empty-cell {\n  text-align: center;\n  padding: 3rem !important;\n  color: var(--text-color-secondary);\n  font-size: 0.875rem;\n}\n.drawer-header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 1rem;\n  margin-bottom: 1.5rem;\n}\n.drawer-header h2 {\n  font-size: 1.125rem;\n  font-weight: 700;\n  margin: 0.25rem 0 0;\n  color: var(--text-color);\n}\n.drawer-eyebrow {\n  font-size: 0.6875rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--text-color-secondary);\n}\n.version-chip {\n  display: inline-block;\n  font-size: 0.75rem;\n  font-weight: 600;\n  background: color-mix(in srgb, var(--purple-500, #a855f7) 12%, var(--surface-card));\n  color: var(--purple-600, #7c3aed);\n  padding: 2px 10px;\n  border-radius: 999px;\n  margin-left: 0.375rem;\n}\n.detail-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.625rem;\n  margin-bottom: 1.5rem;\n}\n.detail-grid article {\n  background: var(--surface-ground);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  padding: 0.75rem;\n}\n.detail-grid article span {\n  display: block;\n  font-size: 0.6875rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: var(--text-color-secondary);\n  margin-bottom: 0.25rem;\n}\n.detail-grid article strong {\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--text-color);\n  word-break: break-all;\n}\n.detail-section {\n  margin-bottom: 1.25rem;\n}\n.detail-section h3 {\n  font-size: 0.6875rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--text-color-secondary);\n  margin: 0 0 0.5rem;\n}\n.detail-section p {\n  font-size: 0.8125rem;\n  color: var(--text-color);\n  margin: 0;\n  line-height: 1.6;\n}\n.checksum-code {\n  font-family: var(--cb-font-mono);\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  word-break: break-all;\n}\n.rules-list {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 0.375rem;\n}\n.rules-list li {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.8125rem;\n  color: var(--text-color);\n}\n.rules-list li i {\n  color: var(--green-500, #10b981);\n  font-size: 0.8125rem;\n  flex-shrink: 0;\n}\n.drawer-actions {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  margin-top: 2rem;\n  padding-top: 1.25rem;\n  border-top: 1px solid var(--surface-border);\n}\n.section-actions {\n  margin-bottom: 0.75rem;\n}\n.diff-view {\n  max-height: 220px;\n  overflow: auto;\n  margin-top: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 6px;\n  border: 1px solid var(--surface-border);\n  background: var(--cb-color-ink-950);\n  color: #e2e8f0;\n  font-size: 0.75rem;\n}\n.trend-list {\n  display: grid;\n  gap: 0.5rem;\n}\n.trend-item {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto auto;\n  gap: 0.75rem;\n  align-items: center;\n  padding: 0.625rem 0.75rem;\n  background: var(--surface-ground);\n  border: 1px solid var(--surface-border);\n  border-radius: 6px;\n  font-size: 0.8125rem;\n}\n.trend-item span {\n  color: var(--text-color-secondary);\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.trend-item small {\n  color: var(--text-color-secondary);\n}\n.template-list {\n  display: grid;\n  gap: 0.75rem;\n}\n.template-item {\n  display: flex;\n  justify-content: space-between;\n  gap: 1rem;\n  align-items: center;\n  padding: 0.875rem;\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  background: var(--surface-ground);\n}\n.template-item p {\n  margin: 0.25rem 0 0;\n  color: var(--text-color-secondary);\n  font-size: 0.8125rem;\n}\n@media (max-width: 640px) {\n  .toolbar-left {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .toolbar-left p-iconfield {\n    flex: none;\n  }\n}\n.health-badge {\n  display: inline-block;\n  font-size: 0.6875rem;\n  font-weight: 700;\n  padding: 0.2rem 0.5rem;\n  border-radius: 4px;\n}\n.health-badge.healthy {\n  background: color-mix(in srgb, var(--green-500, #10b981) 10%, var(--surface-card));\n  color: var(--green-600, #059669);\n}\n.health-badge.degraded {\n  background: color-mix(in srgb, var(--yellow-500, #eab308) 10%, var(--surface-card));\n  color: var(--yellow-700, #d97706);\n}\n.health-badge.unhealthy {\n  background: color-mix(in srgb, var(--red-500, #ef4444) 10%, var(--surface-card));\n  color: var(--red-600, #dc2626);\n}\n.health-badge.untested {\n  color: var(--text-color-secondary);\n}\n.versions-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.versions-list .version-item {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.625rem 0.75rem;\n  background: var(--surface-ground);\n  border: 1px solid var(--surface-border);\n  border-radius: 6px;\n}\n.versions-list .version-item.deprecated {\n  opacity: 0.6;\n}\n.versions-list .version-item .version-info {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.versions-list .version-item .version-info strong {\n  font-size: 0.875rem;\n  color: var(--text-color);\n}\n.versions-list .version-item .version-info .version-date {\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n}\n/*# sourceMappingURL=mappings.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MappingsComponent, { className: "MappingsComponent", filePath: "src/app/pages/mappings/mappings.component.ts", lineNumber: 74 });
})();
export {
  MappingsComponent
};
//# sourceMappingURL=chunk-VABBNXU3.js.map
