import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabsModule
} from "./chunk-4SNQBPI3.js";
import {
  SchemaService
} from "./chunk-RUGRQRW7.js";
import {
  Message,
  MessageModule
} from "./chunk-FZFJ3GIG.js";
import {
  ActivatedRoute,
  Router
} from "./chunk-CN6J73SX.js";
import {
  TimesCircleIcon
} from "./chunk-BYX7PGOZ.js";
import {
  TableModule
} from "./chunk-NBT7AZAN.js";
import {
  Textarea,
  TextareaModule
} from "./chunk-S4BPTLD2.js";
import {
  Checkbox,
  CheckboxModule,
  InputNumber,
  InputNumberModule
} from "./chunk-IZG4GOGI.js";
import {
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
  BaseComponent,
  Bind,
  Button,
  ButtonModule,
  PARENT_INSTANCE,
  TooltipModule
} from "./chunk-LABWMPEG.js";
import "./chunk-FA3B2YOI.js";
import {
  BaseStyle,
  CommonModule,
  NgClass,
  NgIf,
  NgTemplateOutlet,
  PrimeTemplate,
  SharedModule,
  TranslationKeys
} from "./chunk-OGO5ZH5D.js";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  Output,
  ViewEncapsulation,
  __spreadProps,
  __spreadValues,
  booleanAttribute,
  computed,
  inject,
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
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleMap,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-KLG77GLC.js";

// node_modules/@primeuix/styles/dist/chip/index.mjs
var style = "\n    .p-chip {\n        display: inline-flex;\n        align-items: center;\n        background: dt('chip.background');\n        color: dt('chip.color');\n        border-radius: dt('chip.border.radius');\n        padding-block: dt('chip.padding.y');\n        padding-inline: dt('chip.padding.x');\n        gap: dt('chip.gap');\n    }\n\n    .p-chip-icon {\n        color: dt('chip.icon.color');\n        font-size: dt('chip.icon.size');\n        width: dt('chip.icon.size');\n        height: dt('chip.icon.size');\n    }\n\n    .p-chip-image {\n        border-radius: 50%;\n        width: dt('chip.image.width');\n        height: dt('chip.image.height');\n        margin-inline-start: calc(-1 * dt('chip.padding.y'));\n    }\n\n    .p-chip:has(.p-chip-remove-icon) {\n        padding-inline-end: dt('chip.padding.y');\n    }\n\n    .p-chip:has(.p-chip-image) {\n        padding-block-start: calc(dt('chip.padding.y') / 2);\n        padding-block-end: calc(dt('chip.padding.y') / 2);\n    }\n\n    .p-chip-remove-icon {\n        cursor: pointer;\n        font-size: dt('chip.remove.icon.size');\n        width: dt('chip.remove.icon.size');\n        height: dt('chip.remove.icon.size');\n        color: dt('chip.remove.icon.color');\n        border-radius: 50%;\n        transition:\n            outline-color dt('chip.transition.duration'),\n            box-shadow dt('chip.transition.duration');\n        outline-color: transparent;\n    }\n\n    .p-chip-remove-icon:focus-visible {\n        box-shadow: dt('chip.remove.icon.focus.ring.shadow');\n        outline: dt('chip.remove.icon.focus.ring.width') dt('chip.remove.icon.focus.ring.style') dt('chip.remove.icon.focus.ring.color');\n        outline-offset: dt('chip.remove.icon.focus.ring.offset');\n    }\n";

// node_modules/primeng/fesm2022/primeng-chip.mjs
var _c0 = ["removeicon"];
var _c1 = ["*"];
function Chip_img_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "img", 4);
    \u0275\u0275listener("error", function Chip_img_1_Template_img_error_0_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.imageError($event));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r1.cx("image"));
    \u0275\u0275property("pBind", ctx_r1.ptm("image"))("src", ctx_r1.image, \u0275\u0275sanitizeUrl)("alt", ctx_r1.alt);
  }
}
function Chip_ng_template_2_span_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 6);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(ctx_r1.icon);
    \u0275\u0275property("pBind", ctx_r1.ptm("icon"))("ngClass", ctx_r1.cx("icon"));
  }
}
function Chip_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, Chip_ng_template_2_span_0_Template, 1, 4, "span", 5);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("ngIf", ctx_r1.icon);
  }
}
function Chip_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r1.cx("label"));
    \u0275\u0275property("pBind", ctx_r1.ptm("label"));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.label);
  }
}
function Chip_ng_container_5_ng_container_1_span_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 11);
    \u0275\u0275listener("click", function Chip_ng_container_5_ng_container_1_span_1_Template_span_click_0_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.close($event));
    })("keydown", function Chip_ng_container_5_ng_container_1_span_1_Template_span_keydown_0_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onKeydown($event));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classMap(ctx_r1.removeIcon);
    \u0275\u0275property("pBind", ctx_r1.ptm("removeIcon"))("ngClass", ctx_r1.cx("removeIcon"));
    \u0275\u0275attribute("tabindex", ctx_r1.disabled ? -1 : 0)("aria-label", ctx_r1.removeAriaLabel);
  }
}
function Chip_ng_container_5_ng_container_1__svg_svg_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 12);
    \u0275\u0275listener("click", function Chip_ng_container_5_ng_container_1__svg_svg_2_Template_svg_click_0_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.close($event));
    })("keydown", function Chip_ng_container_5_ng_container_1__svg_svg_2_Template_svg_keydown_0_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onKeydown($event));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classMap(ctx_r1.cx("removeIcon"));
    \u0275\u0275property("pBind", ctx_r1.ptm("removeIcon"));
    \u0275\u0275attribute("tabindex", ctx_r1.disabled ? -1 : 0)("aria-label", ctx_r1.removeAriaLabel);
  }
}
function Chip_ng_container_5_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, Chip_ng_container_5_ng_container_1_span_1_Template, 1, 6, "span", 9)(2, Chip_ng_container_5_ng_container_1__svg_svg_2_Template, 1, 5, "svg", 10);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.removeIcon);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.removeIcon);
  }
}
function Chip_ng_container_5_span_2_1_ng_template_0_Template(rf, ctx) {
}
function Chip_ng_container_5_span_2_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, Chip_ng_container_5_span_2_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function Chip_ng_container_5_span_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 13);
    \u0275\u0275listener("click", function Chip_ng_container_5_span_2_Template_span_click_0_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.close($event));
    })("keydown", function Chip_ng_container_5_span_2_Template_span_keydown_0_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onKeydown($event));
    });
    \u0275\u0275template(1, Chip_ng_container_5_span_2_1_Template, 1, 0, null, 14);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(ctx_r1.cx("removeIcon"));
    \u0275\u0275property("pBind", ctx_r1.ptm("removeIcon"));
    \u0275\u0275attribute("tabindex", ctx_r1.disabled ? -1 : 0)("aria-label", ctx_r1.removeAriaLabel);
    \u0275\u0275advance();
    \u0275\u0275property("ngTemplateOutlet", ctx_r1.removeIconTemplate || ctx_r1._removeIconTemplate);
  }
}
function Chip_ng_container_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275template(1, Chip_ng_container_5_ng_container_1_Template, 3, 2, "ng-container", 3)(2, Chip_ng_container_5_span_2_Template, 2, 6, "span", 8);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.removeIconTemplate && !ctx_r1._removeIconTemplate);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.removeIconTemplate || ctx_r1._removeIconTemplate);
  }
}
var inlineStyles = {
  root: ({
    instance
  }) => ({
    display: !instance.visible && "none"
  })
};
var classes = {
  root: ({
    instance
  }) => ["p-chip p-component", {
    "p-disabled": instance.disabled
  }],
  image: "p-chip-image",
  icon: "p-chip-icon",
  label: "p-chip-label",
  removeIcon: "p-chip-remove-icon"
};
var ChipStyle = class _ChipStyle extends BaseStyle {
  name = "chip";
  style = style;
  classes = classes;
  inlineStyles = inlineStyles;
  static \u0275fac = /* @__PURE__ */ (() => {
    let \u0275ChipStyle_BaseFactory;
    return function ChipStyle_Factory(__ngFactoryType__) {
      return (\u0275ChipStyle_BaseFactory || (\u0275ChipStyle_BaseFactory = \u0275\u0275getInheritedFactory(_ChipStyle)))(__ngFactoryType__ || _ChipStyle);
    };
  })();
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _ChipStyle,
    factory: _ChipStyle.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChipStyle, [{
    type: Injectable
  }], null, null);
})();
var ChipClasses;
(function(ChipClasses2) {
  ChipClasses2["root"] = "p-chip";
  ChipClasses2["image"] = "p-chip-image";
  ChipClasses2["icon"] = "p-chip-icon";
  ChipClasses2["label"] = "p-chip-label";
  ChipClasses2["removeIcon"] = "p-chip-remove-icon";
})(ChipClasses || (ChipClasses = {}));
var CHIP_INSTANCE = new InjectionToken("CHIP_INSTANCE");
var Chip = class _Chip extends BaseComponent {
  componentName = "Chip";
  $pcChip = inject(CHIP_INSTANCE, {
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
   * Defines the text to display.
   * @group Props
   */
  label;
  /**
   * Defines the icon to display.
   * @group Props
   */
  icon;
  /**
   * Defines the image to display.
   * @group Props
   */
  image;
  /**
   * Alt attribute of the image.
   * @group Props
   */
  alt;
  /**
   * Class of the element.
   * @deprecated since v20.0.0, use `class` instead.
   * @group Props
   */
  styleClass;
  /**
   * When present, it specifies that the element should be disabled.
   * @group Props
   */
  disabled = false;
  /**
   * Whether to display a remove icon.
   * @group Props
   */
  removable = false;
  /**
   * Icon of the remove element.
   * @group Props
   */
  removeIcon;
  /**
   * Callback to invoke when a chip is removed.
   * @param {MouseEvent} event - Mouse event.
   * @group Emits
   */
  onRemove = new EventEmitter();
  /**
   * This event is triggered if an error occurs while loading an image file.
   * @param {Event} event - Browser event.
   * @group Emits
   */
  onImageError = new EventEmitter();
  visible = true;
  get removeAriaLabel() {
    return this.config.getTranslation(TranslationKeys.ARIA)["removeLabel"];
  }
  /**
   * Used to pass all properties of the chipProps to the Chip component.
   * @group Props
   */
  get chipProps() {
    return this._chipProps;
  }
  set chipProps(val) {
    this._chipProps = val;
    if (val && typeof val === "object") {
      Object.entries(val).forEach(([k, v]) => this[`_${k}`] !== v && (this[`_${k}`] = v));
    }
  }
  _chipProps;
  _componentStyle = inject(ChipStyle);
  /**
   * Custom remove icon template.
   * @group Templates
   */
  removeIconTemplate;
  templates;
  _removeIconTemplate;
  onAfterContentInit() {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case "removeicon":
          this._removeIconTemplate = item.template;
          break;
        default:
          this._removeIconTemplate = item.template;
          break;
      }
    });
  }
  onChanges(simpleChanges) {
    if (simpleChanges.chipProps && simpleChanges.chipProps.currentValue) {
      const {
        currentValue
      } = simpleChanges.chipProps;
      if (currentValue.label !== void 0) {
        this.label = currentValue.label;
      }
      if (currentValue.icon !== void 0) {
        this.icon = currentValue.icon;
      }
      if (currentValue.image !== void 0) {
        this.image = currentValue.image;
      }
      if (currentValue.alt !== void 0) {
        this.alt = currentValue.alt;
      }
      if (currentValue.styleClass !== void 0) {
        this.styleClass = currentValue.styleClass;
      }
      if (currentValue.removable !== void 0) {
        this.removable = currentValue.removable;
      }
      if (currentValue.removeIcon !== void 0) {
        this.removeIcon = currentValue.removeIcon;
      }
    }
  }
  close(event) {
    this.visible = false;
    this.onRemove.emit(event);
  }
  onKeydown(event) {
    if (event.key === "Enter" || event.key === "Backspace") {
      this.close(event);
    }
  }
  imageError(event) {
    this.onImageError.emit(event);
  }
  get dataP() {
    return this.cn({
      removable: this.removable
    });
  }
  static \u0275fac = /* @__PURE__ */ (() => {
    let \u0275Chip_BaseFactory;
    return function Chip_Factory(__ngFactoryType__) {
      return (\u0275Chip_BaseFactory || (\u0275Chip_BaseFactory = \u0275\u0275getInheritedFactory(_Chip)))(__ngFactoryType__ || _Chip);
    };
  })();
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _Chip,
    selectors: [["p-chip"]],
    contentQueries: function Chip_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        \u0275\u0275contentQuery(dirIndex, _c0, 4)(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.removeIconTemplate = _t.first);
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.templates = _t);
      }
    },
    hostVars: 6,
    hostBindings: function Chip_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275attribute("aria-label", ctx.label)("data-p", ctx.dataP);
        \u0275\u0275styleMap(ctx.sx("root"));
        \u0275\u0275classMap(ctx.cn(ctx.cx("root"), ctx.styleClass));
      }
    },
    inputs: {
      label: "label",
      icon: "icon",
      image: "image",
      alt: "alt",
      styleClass: "styleClass",
      disabled: [2, "disabled", "disabled", booleanAttribute],
      removable: [2, "removable", "removable", booleanAttribute],
      removeIcon: "removeIcon",
      chipProps: "chipProps"
    },
    outputs: {
      onRemove: "onRemove",
      onImageError: "onImageError"
    },
    features: [\u0275\u0275ProvidersFeature([ChipStyle, {
      provide: CHIP_INSTANCE,
      useExisting: _Chip
    }, {
      provide: PARENT_INSTANCE,
      useExisting: _Chip
    }]), \u0275\u0275HostDirectivesFeature([Bind]), \u0275\u0275InheritDefinitionFeature],
    ngContentSelectors: _c1,
    decls: 6,
    vars: 4,
    consts: [["iconTemplate", ""], [3, "pBind", "class", "src", "alt", "error", 4, "ngIf", "ngIfElse"], [3, "pBind", "class", 4, "ngIf"], [4, "ngIf"], [3, "error", "pBind", "src", "alt"], [3, "pBind", "class", "ngClass", 4, "ngIf"], [3, "pBind", "ngClass"], [3, "pBind"], ["role", "button", 3, "pBind", "class", "click", "keydown", 4, "ngIf"], ["role", "button", 3, "pBind", "class", "ngClass", "click", "keydown", 4, "ngIf"], ["data-p-icon", "times-circle", "role", "button", 3, "pBind", "class", "click", "keydown", 4, "ngIf"], ["role", "button", 3, "click", "keydown", "pBind", "ngClass"], ["data-p-icon", "times-circle", "role", "button", 3, "click", "keydown", "pBind"], ["role", "button", 3, "click", "keydown", "pBind"], [4, "ngTemplateOutlet"]],
    template: function Chip_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275projectionDef();
        \u0275\u0275projection(0);
        \u0275\u0275template(1, Chip_img_1_Template, 1, 5, "img", 1)(2, Chip_ng_template_2_Template, 1, 1, "ng-template", null, 0, \u0275\u0275templateRefExtractor)(4, Chip_div_4_Template, 2, 4, "div", 2)(5, Chip_ng_container_5_Template, 3, 2, "ng-container", 3);
      }
      if (rf & 2) {
        const iconTemplate_r6 = \u0275\u0275reference(3);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.image)("ngIfElse", iconTemplate_r6);
        \u0275\u0275advance(3);
        \u0275\u0275property("ngIf", ctx.label);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.removable);
      }
    },
    dependencies: [CommonModule, NgClass, NgIf, NgTemplateOutlet, TimesCircleIcon, SharedModule, Bind],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Chip, [{
    type: Component,
    args: [{
      selector: "p-chip",
      standalone: true,
      imports: [CommonModule, TimesCircleIcon, SharedModule, Bind],
      template: `
        <ng-content></ng-content>
        <img [pBind]="ptm('image')" [class]="cx('image')" [src]="image" *ngIf="image; else iconTemplate" (error)="imageError($event)" [alt]="alt" />
        <ng-template #iconTemplate><span [pBind]="ptm('icon')" *ngIf="icon" [class]="icon" [ngClass]="cx('icon')"></span></ng-template>
        <div [pBind]="ptm('label')" [class]="cx('label')" *ngIf="label">{{ label }}</div>
        <ng-container *ngIf="removable">
            <ng-container *ngIf="!removeIconTemplate && !_removeIconTemplate">
                <span
                    [pBind]="ptm('removeIcon')"
                    *ngIf="removeIcon"
                    [class]="removeIcon"
                    [ngClass]="cx('removeIcon')"
                    (click)="close($event)"
                    (keydown)="onKeydown($event)"
                    [attr.tabindex]="disabled ? -1 : 0"
                    [attr.aria-label]="removeAriaLabel"
                    role="button"
                ></span>
                <svg
                    [pBind]="ptm('removeIcon')"
                    data-p-icon="times-circle"
                    *ngIf="!removeIcon"
                    [class]="cx('removeIcon')"
                    (click)="close($event)"
                    (keydown)="onKeydown($event)"
                    [attr.tabindex]="disabled ? -1 : 0"
                    [attr.aria-label]="removeAriaLabel"
                    role="button"
                />
            </ng-container>
            <span
                [pBind]="ptm('removeIcon')"
                *ngIf="removeIconTemplate || _removeIconTemplate"
                [attr.tabindex]="disabled ? -1 : 0"
                [class]="cx('removeIcon')"
                (click)="close($event)"
                (keydown)="onKeydown($event)"
                [attr.aria-label]="removeAriaLabel"
                role="button"
            >
                <ng-template *ngTemplateOutlet="removeIconTemplate || _removeIconTemplate"></ng-template>
            </span>
        </ng-container>
    `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      providers: [ChipStyle, {
        provide: CHIP_INSTANCE,
        useExisting: Chip
      }, {
        provide: PARENT_INSTANCE,
        useExisting: Chip
      }],
      host: {
        "[class]": "cn(cx('root'), styleClass)",
        "[style]": "sx('root')",
        "[attr.aria-label]": "label",
        "[attr.data-p]": "dataP"
      },
      hostDirectives: [Bind]
    }]
  }], null, {
    label: [{
      type: Input
    }],
    icon: [{
      type: Input
    }],
    image: [{
      type: Input
    }],
    alt: [{
      type: Input
    }],
    styleClass: [{
      type: Input
    }],
    disabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    removable: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    removeIcon: [{
      type: Input
    }],
    onRemove: [{
      type: Output
    }],
    onImageError: [{
      type: Output
    }],
    chipProps: [{
      type: Input
    }],
    removeIconTemplate: [{
      type: ContentChild,
      args: ["removeicon", {
        descendants: false
      }]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var ChipModule = class _ChipModule {
  static \u0275fac = function ChipModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ChipModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ChipModule,
    imports: [Chip, SharedModule],
    exports: [Chip, SharedModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    imports: [Chip, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChipModule, [{
    type: NgModule,
    args: [{
      imports: [Chip, SharedModule],
      exports: [Chip, SharedModule]
    }]
  }], null, null);
})();

// src/app/pages/schemas/schema-detail/schema-detail.component.ts
var _c02 = () => [];
var _forTrack0 = ($index, $item) => $item.field;
var _forTrack1 = ($index, $item) => $item.field + $item.type;
function SchemaDetailComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2);
    \u0275\u0275element(1, "i", 3);
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3, "Loading schema...");
    \u0275\u0275elementEnd()();
  }
}
function SchemaDetailComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275element(0, "p-message", 4);
    \u0275\u0275elementStart(1, "p-button", 5);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_2_Template_p_button_onClick_1_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.goBack());
    });
    \u0275\u0275elementEnd();
  }
}
function SchemaDetailComponent_Conditional_3_Conditional_54_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "p-message", 31);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("text", ctx_r1.jsonError());
  }
}
function SchemaDetailComponent_Conditional_3_Conditional_74_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 40);
    \u0275\u0275element(1, "i", 42);
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3, "All validation rules are consistent");
    \u0275\u0275elementEnd()();
  }
}
function SchemaDetailComponent_Conditional_3_Conditional_74_Conditional_1_For_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li")(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const err_r4 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(err_r4.field);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(": ", err_r4.message);
  }
}
function SchemaDetailComponent_Conditional_3_Conditional_74_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 41)(1, "div", 43);
    \u0275\u0275element(2, "i", 44);
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "ul", 45);
    \u0275\u0275repeaterCreate(6, SchemaDetailComponent_Conditional_3_Conditional_74_Conditional_1_For_7_Template, 4, 2, "li", null, _forTrack1);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", ctx_r1.validationErrors().length, " issue(s) found");
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.validationErrors());
  }
}
function SchemaDetailComponent_Conditional_3_Conditional_74_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, SchemaDetailComponent_Conditional_3_Conditional_74_Conditional_0_Template, 4, 0, "div", 40)(1, SchemaDetailComponent_Conditional_3_Conditional_74_Conditional_1_Template, 8, 1, "div", 41);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275conditional(ctx_r1.validationSuccess() ? 0 : 1);
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 52);
    \u0275\u0275text(1, "required");
    \u0275\u0275elementEnd();
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 53);
    \u0275\u0275text(1, "nullable");
    \u0275\u0275elementEnd();
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 54);
    \u0275\u0275text(1, "deprecated");
    \u0275\u0275elementEnd();
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 55);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rule_r7 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(rule_r7.format);
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 57);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rule_r7 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", ctx_r1.getConstraintCount(rule_r7), " constraint", ctx_r1.getConstraintCount(rule_r7) > 1 ? "s" : "");
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59)(1, "h5");
    \u0275\u0275text(2, "String Constraints");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 70)(4, "div", 71)(5, "label");
    \u0275\u0275text(6, "Min Length");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p-inputnumber", 77);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_17_Template_p_inputnumber_ngModelChange_7_listener($event) {
      \u0275\u0275restoreView(_r10);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "minLength", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 71)(9, "label");
    \u0275\u0275text(10, "Max Length");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "p-inputnumber", 77);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_17_Template_p_inputnumber_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r10);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "maxLength", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "div", 71)(13, "label");
    \u0275\u0275text(14, "Format");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "p-select", 78);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_17_Template_p_select_ngModelChange_15_listener($event) {
      \u0275\u0275restoreView(_r10);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "format", $event || null));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "div", 73)(17, "label");
    \u0275\u0275text(18, "Pattern (Regex)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "input", 79);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_17_Template_input_ngModelChange_19_listener($event) {
      \u0275\u0275restoreView(_r10);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "pattern", $event || null));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(20, "div", 73)(21, "label");
    \u0275\u0275text(22, "Pattern Description");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "input", 80);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_17_Template_input_ngModelChange_23_listener($event) {
      \u0275\u0275restoreView(_r10);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "patternDescription", $event || null));
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const rule_r7 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(7);
    \u0275\u0275property("ngModel", rule_r7.minLength ?? null)("showButtons", true)("min", 0);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.maxLength ?? null)("showButtons", true)("min", 0);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.format ?? "")("options", ctx_r1.formatOptions);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.pattern ?? "");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.patternDescription ?? "");
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59)(1, "h5");
    \u0275\u0275text(2, "Number Constraints");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 70)(4, "div", 71)(5, "label");
    \u0275\u0275text(6, "Minimum");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p-inputnumber", 81);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template_p_inputnumber_ngModelChange_7_listener($event) {
      \u0275\u0275restoreView(_r11);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "minimum", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 71)(9, "label");
    \u0275\u0275text(10, " Exclusive ");
    \u0275\u0275elementStart(11, "p-checkbox", 62);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template_p_checkbox_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r11);
      const rule_r7 = \u0275\u0275nextContext(2).$implicit;
      \u0275\u0275twoWayBindingSet(rule_r7.exclusiveMinimum, $event) || (rule_r7.exclusiveMinimum = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("onChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template_p_checkbox_onChange_11_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r8 = \u0275\u0275nextContext(2);
      const rule_r7 = ctx_r8.$implicit;
      const \u0275$index_184_r6 = ctx_r8.$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "exclusiveMinimum", rule_r7.exclusiveMinimum));
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "div", 71)(13, "label");
    \u0275\u0275text(14, "Maximum");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "p-inputnumber", 81);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template_p_inputnumber_ngModelChange_15_listener($event) {
      \u0275\u0275restoreView(_r11);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "maximum", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "div", 71)(17, "label");
    \u0275\u0275text(18, " Exclusive ");
    \u0275\u0275elementStart(19, "p-checkbox", 62);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template_p_checkbox_ngModelChange_19_listener($event) {
      \u0275\u0275restoreView(_r11);
      const rule_r7 = \u0275\u0275nextContext(2).$implicit;
      \u0275\u0275twoWayBindingSet(rule_r7.exclusiveMaximum, $event) || (rule_r7.exclusiveMaximum = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("onChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template_p_checkbox_onChange_19_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r8 = \u0275\u0275nextContext(2);
      const rule_r7 = ctx_r8.$implicit;
      const \u0275$index_184_r6 = ctx_r8.$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "exclusiveMaximum", rule_r7.exclusiveMaximum));
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(20, "div", 71)(21, "label");
    \u0275\u0275text(22, "Multiple Of");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "p-inputnumber", 81);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template_p_inputnumber_ngModelChange_23_listener($event) {
      \u0275\u0275restoreView(_r11);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "multipleOf", $event));
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const rule_r7 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance(7);
    \u0275\u0275property("ngModel", rule_r7.minimum ?? null)("showButtons", true);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", rule_r7.exclusiveMinimum);
    \u0275\u0275property("binary", true);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.maximum ?? null)("showButtons", true);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", rule_r7.exclusiveMaximum);
    \u0275\u0275property("binary", true);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.multipleOf ?? null)("showButtons", false);
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59)(1, "h5");
    \u0275\u0275text(2, "Array Constraints");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 70)(4, "div", 71)(5, "label");
    \u0275\u0275text(6, "Min Items");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p-inputnumber", 77);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_19_Template_p_inputnumber_ngModelChange_7_listener($event) {
      \u0275\u0275restoreView(_r12);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "minItems", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 71)(9, "label");
    \u0275\u0275text(10, "Max Items");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "p-inputnumber", 77);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_19_Template_p_inputnumber_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r12);
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "maxItems", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "div", 71)(13, "label", 61)(14, "p-checkbox", 62);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_19_Template_p_checkbox_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r12);
      const rule_r7 = \u0275\u0275nextContext(2).$implicit;
      \u0275\u0275twoWayBindingSet(rule_r7.uniqueItems, $event) || (rule_r7.uniqueItems = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("onChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_19_Template_p_checkbox_onChange_14_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r8 = \u0275\u0275nextContext(2);
      const rule_r7 = ctx_r8.$implicit;
      const \u0275$index_184_r6 = ctx_r8.$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "uniqueItems", rule_r7.uniqueItems));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span");
    \u0275\u0275text(16, "Unique Items");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const rule_r7 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance(7);
    \u0275\u0275property("ngModel", rule_r7.minItems ?? null)("showButtons", true)("min", 0);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.maxItems ?? null)("showButtons", true)("min", 0);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", rule_r7.uniqueItems);
    \u0275\u0275property("binary", true);
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_For_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-chip", 82);
    \u0275\u0275listener("onRemove", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_For_26_Template_p_chip_onRemove_0_listener() {
      const \u0275$index_377_r14 = \u0275\u0275restoreView(_r13).$index;
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeEnumValue(\u0275$index_184_r6, \u0275$index_377_r14));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const val_r15 = ctx.$implicit;
    \u0275\u0275property("label", val_r15)("removable", true);
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 66);
    \u0275\u0275text(1, "No enum values \u2014 field accepts any value of its type");
    \u0275\u0275elementEnd();
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_For_53_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p-chip", 82);
    \u0275\u0275listener("onRemove", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_For_53_Template_p_chip_onRemove_0_listener() {
      const \u0275$index_427_r17 = \u0275\u0275restoreView(_r16).$index;
      const \u0275$index_184_r6 = \u0275\u0275nextContext(2).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeExample(\u0275$index_184_r6, \u0275$index_427_r17));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ex_r18 = ctx.$implicit;
    \u0275\u0275property("label", ex_r18)("removable", true);
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 58)(1, "div", 59)(2, "h5");
    \u0275\u0275text(3, "Basic");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 60)(5, "label", 61)(6, "p-checkbox", 62);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_p_checkbox_ngModelChange_6_listener($event) {
      \u0275\u0275restoreView(_r8);
      const rule_r7 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(rule_r7.required, $event) || (rule_r7.required = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("onChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_p_checkbox_onChange_6_listener() {
      \u0275\u0275restoreView(_r8);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleRequired(\u0275$index_184_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span");
    \u0275\u0275text(8, "Required");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "label", 61)(10, "p-checkbox", 62);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_p_checkbox_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r8);
      const rule_r7 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(rule_r7.nullable, $event) || (rule_r7.nullable = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("onChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_p_checkbox_onChange_10_listener() {
      \u0275\u0275restoreView(_r8);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleNullable(\u0275$index_184_r6));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span");
    \u0275\u0275text(12, "Nullable");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "label", 61)(14, "p-checkbox", 62);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_p_checkbox_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r8);
      const rule_r7 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(rule_r7.deprecated, $event) || (rule_r7.deprecated = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("onChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_p_checkbox_onChange_14_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r8 = \u0275\u0275nextContext();
      const rule_r7 = ctx_r8.$implicit;
      const \u0275$index_184_r6 = ctx_r8.$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "deprecated", rule_r7.deprecated));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span");
    \u0275\u0275text(16, "Deprecated");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275conditionalCreate(17, SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_17_Template, 24, 10, "div", 59);
    \u0275\u0275conditionalCreate(18, SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_18_Template, 24, 10, "div", 59);
    \u0275\u0275conditionalCreate(19, SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_19_Template, 17, 8, "div", 59);
    \u0275\u0275elementStart(20, "div", 59)(21, "h5");
    \u0275\u0275text(22, "Allowed Values (Enum)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "div", 63)(24, "div", 64);
    \u0275\u0275repeaterCreate(25, SchemaDetailComponent_Conditional_3_For_80_Conditional_13_For_26_Template, 1, 2, "p-chip", 65, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275conditionalCreate(27, SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Conditional_27_Template, 2, 0, "span", 66);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "div", 67)(29, "input", 68);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_input_ngModelChange_29_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r1.newEnumValue, $event) || (ctx_r1.newEnumValue = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keyup.enter", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_input_keyup_enter_29_listener() {
      \u0275\u0275restoreView(_r8);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addEnumValue(\u0275$index_184_r6, ctx_r1.newEnumValue));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "p-button", 69);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_p_button_onClick_30_listener() {
      \u0275\u0275restoreView(_r8);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addEnumValue(\u0275$index_184_r6, ctx_r1.newEnumValue));
    });
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(31, "div", 59)(32, "h5");
    \u0275\u0275text(33, "Metadata");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "div", 70)(35, "div", 71)(36, "label");
    \u0275\u0275text(37, "Default Value");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "input", 72);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_input_ngModelChange_38_listener($event) {
      \u0275\u0275restoreView(_r8);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "defaultValue", $event || null));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(39, "div", 73)(40, "label");
    \u0275\u0275text(41, "Custom Error Message");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "input", 74);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_input_ngModelChange_42_listener($event) {
      \u0275\u0275restoreView(_r8);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "customErrorMessage", $event || null));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(43, "div", 73)(44, "label");
    \u0275\u0275text(45, "Description");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(46, "input", 75);
    \u0275\u0275listener("ngModelChange", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_input_ngModelChange_46_listener($event) {
      \u0275\u0275restoreView(_r8);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateRule(\u0275$index_184_r6, "description", $event));
    });
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(47, "div", 59)(48, "h5");
    \u0275\u0275text(49, "Examples");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(50, "div", 63)(51, "div", 64);
    \u0275\u0275repeaterCreate(52, SchemaDetailComponent_Conditional_3_For_80_Conditional_13_For_53_Template, 1, 2, "p-chip", 65, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "div", 67)(55, "input", 76, 0);
    \u0275\u0275listener("keyup.enter", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_input_keyup_enter_55_listener() {
      \u0275\u0275restoreView(_r8);
      const exInput_r19 = \u0275\u0275reference(56);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.addExample(\u0275$index_184_r6, exInput_r19.value);
      return \u0275\u0275resetView(exInput_r19.value = "");
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(57, "p-button", 69);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template_p_button_onClick_57_listener() {
      \u0275\u0275restoreView(_r8);
      const exInput_r19 = \u0275\u0275reference(56);
      const \u0275$index_184_r6 = \u0275\u0275nextContext().$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.addExample(\u0275$index_184_r6, exInput_r19.value);
      return \u0275\u0275resetView(exInput_r19.value = "");
    });
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const rule_r7 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", rule_r7.required);
    \u0275\u0275property("binary", true);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", rule_r7.nullable);
    \u0275\u0275property("binary", true);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", rule_r7.deprecated);
    \u0275\u0275property("binary", true);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(rule_r7.type === "string" ? 17 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(rule_r7.type === "number" || rule_r7.type === "integer" ? 18 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(rule_r7.type === "array" ? 19 : -1);
    \u0275\u0275advance(6);
    \u0275\u0275repeater(rule_r7.enumValues || \u0275\u0275pureFunction0(16, _c02));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(!rule_r7.enumValues || rule_r7.enumValues.length === 0 ? 27 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newEnumValue);
    \u0275\u0275advance();
    \u0275\u0275property("outlined", true);
    \u0275\u0275advance(8);
    \u0275\u0275property("ngModel", rule_r7.defaultValue ?? "");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.customErrorMessage ?? "");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", rule_r7.description ?? "");
    \u0275\u0275advance(6);
    \u0275\u0275repeater(rule_r7.examples || \u0275\u0275pureFunction0(17, _c02));
    \u0275\u0275advance(5);
    \u0275\u0275property("outlined", true);
  }
}
function SchemaDetailComponent_Conditional_3_For_80_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 46)(1, "div", 47);
    \u0275\u0275listener("click", function SchemaDetailComponent_Conditional_3_For_80_Template_div_click_1_listener() {
      const \u0275$index_184_r6 = \u0275\u0275restoreView(_r5).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleExpand(\u0275$index_184_r6));
    });
    \u0275\u0275elementStart(2, "div", 48);
    \u0275\u0275element(3, "i", 49);
    \u0275\u0275elementStart(4, "span", 50);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275element(6, "p-tag", 51);
    \u0275\u0275conditionalCreate(7, SchemaDetailComponent_Conditional_3_For_80_Conditional_7_Template, 2, 0, "span", 52);
    \u0275\u0275conditionalCreate(8, SchemaDetailComponent_Conditional_3_For_80_Conditional_8_Template, 2, 0, "span", 53);
    \u0275\u0275conditionalCreate(9, SchemaDetailComponent_Conditional_3_For_80_Conditional_9_Template, 2, 0, "span", 54);
    \u0275\u0275conditionalCreate(10, SchemaDetailComponent_Conditional_3_For_80_Conditional_10_Template, 2, 1, "span", 55);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 56);
    \u0275\u0275conditionalCreate(12, SchemaDetailComponent_Conditional_3_For_80_Conditional_12_Template, 2, 2, "span", 57);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(13, SchemaDetailComponent_Conditional_3_For_80_Conditional_13_Template, 58, 18, "div", 58);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rule_r7 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("expanded", rule_r7.expanded)("deprecated", rule_r7.deprecated);
    \u0275\u0275advance(3);
    \u0275\u0275classProp("pi-chevron-right", !rule_r7.expanded)("pi-chevron-down", rule_r7.expanded);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(rule_r7.field);
    \u0275\u0275advance();
    \u0275\u0275property("value", rule_r7.type)("severity", ctx_r1.getTypeSeverity(rule_r7.type));
    \u0275\u0275advance();
    \u0275\u0275conditional(rule_r7.required ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(rule_r7.nullable ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(rule_r7.deprecated ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(rule_r7.format ? 10 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.getConstraintCount(rule_r7) > 0 ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(rule_r7.expanded ? 13 : -1);
  }
}
function SchemaDetailComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 7)(2, "p-button", 8);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_3_Template_p_button_onClick_2_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.goBack());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 9)(4, "h2");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 10);
    \u0275\u0275element(7, "p-tag", 11);
    \u0275\u0275elementStart(8, "code");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275element(10, "p-tag", 12)(11, "p-tag", 13);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "div", 14)(13, "p-button", 15);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_3_Template_p_button_onClick_13_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.save());
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(14, "p-tabs", 16);
    \u0275\u0275listener("valueChange", function SchemaDetailComponent_Conditional_3_Template_p_tabs_valueChange_14_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.activeTab = +($event ?? 0));
    });
    \u0275\u0275elementStart(15, "p-tablist")(16, "p-tab", 17);
    \u0275\u0275element(17, "i", 18);
    \u0275\u0275text(18, " Schema JSON");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "p-tab", 17);
    \u0275\u0275element(20, "i", 19);
    \u0275\u0275text(21, " Validation Rules");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "p-tabpanels")(23, "p-tabpanel", 17)(24, "div", 20)(25, "div", 21)(26, "div", 22)(27, "div", 23)(28, "label");
    \u0275\u0275text(29, "Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "input", 24);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_Template_input_ngModelChange_30_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editName, $event) || (ctx_r1.editName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "div", 23)(32, "label");
    \u0275\u0275text(33, "Subject");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "input", 24);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_Template_input_ngModelChange_34_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editSubject, $event) || (ctx_r1.editSubject = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(35, "div", 22)(36, "div", 23)(37, "label");
    \u0275\u0275text(38, "Type");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "p-select", 25);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_Template_p_select_ngModelChange_39_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editSchemaType, $event) || (ctx_r1.editSchemaType = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(40, "div", 23)(41, "label");
    \u0275\u0275text(42, "Status");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "p-select", 25);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_Template_p_select_ngModelChange_43_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editStatus, $event) || (ctx_r1.editStatus = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(44, "div", 23)(45, "label");
    \u0275\u0275text(46, "Description");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(47, "input", 26);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_Template_input_ngModelChange_47_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editDescription, $event) || (ctx_r1.editDescription = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(48, "div", 27)(49, "div", 28)(50, "label");
    \u0275\u0275text(51, "Schema JSON");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(52, "p-button", 29);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_3_Template_p_button_onClick_52_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.formatJson());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(53, "textarea", 30);
    \u0275\u0275twoWayListener("ngModelChange", function SchemaDetailComponent_Conditional_3_Template_textarea_ngModelChange_53_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editSchemaJson, $event) || (ctx_r1.editSchemaJson = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(54, SchemaDetailComponent_Conditional_3_Conditional_54_Template, 1, 1, "p-message", 31);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(55, "p-tabpanel", 17)(56, "div", 32)(57, "div", 33)(58, "span")(59, "strong");
    \u0275\u0275text(60);
    \u0275\u0275elementEnd();
    \u0275\u0275text(61, " fields");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(62, "span", 34);
    \u0275\u0275text(63, "\u2022");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(64, "span")(65, "strong");
    \u0275\u0275text(66);
    \u0275\u0275elementEnd();
    \u0275\u0275text(67, " required");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(68, "span", 34);
    \u0275\u0275text(69, "\u2022");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(70, "span")(71, "strong");
    \u0275\u0275text(72);
    \u0275\u0275elementEnd();
    \u0275\u0275text(73, " with constraints");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(74, SchemaDetailComponent_Conditional_3_Conditional_74_Template, 2, 1);
    \u0275\u0275elementStart(75, "div", 35)(76, "p-button", 36);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_3_Template_p_button_onClick_76_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.validate());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(77, "p-button", 37);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_3_Template_p_button_onClick_77_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.expandAll());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(78, "p-button", 38);
    \u0275\u0275listener("onClick", function SchemaDetailComponent_Conditional_3_Template_p_button_onClick_78_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.collapseAll());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275repeaterCreate(79, SchemaDetailComponent_Conditional_3_For_80_Template, 14, 17, "div", 39, _forTrack0);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275property("text", true);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.schema().name);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", ctx_r1.schema().schema_type);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.schema().subject);
    \u0275\u0275advance();
    \u0275\u0275property("value", "v" + ctx_r1.schema().version);
    \u0275\u0275advance();
    \u0275\u0275property("value", ctx_r1.schema().status)("severity", ctx_r1.schema().status === "ACTIVE" ? "success" : "warn");
    \u0275\u0275advance(2);
    \u0275\u0275property("loading", ctx_r1.saving());
    \u0275\u0275advance();
    \u0275\u0275property("value", ctx_r1.activeTab);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", 0);
    \u0275\u0275advance(3);
    \u0275\u0275property("value", 1);
    \u0275\u0275advance(4);
    \u0275\u0275property("value", 0);
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editName);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editSubject);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editSchemaType);
    \u0275\u0275property("options", ctx_r1.schemaTypes);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editStatus);
    \u0275\u0275property("options", ctx_r1.statusOptions);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editDescription);
    \u0275\u0275advance(5);
    \u0275\u0275property("text", true);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editSchemaJson);
    \u0275\u0275property("rows", 20);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.jsonError() ? 54 : -1);
    \u0275\u0275advance();
    \u0275\u0275property("value", 1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.rulesSummary().total);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r1.rulesSummary().required);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r1.rulesSummary().withConstraints);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.validationDone() ? 74 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275property("outlined", true)("loading", ctx_r1.validating());
    \u0275\u0275advance();
    \u0275\u0275property("text", true);
    \u0275\u0275advance();
    \u0275\u0275property("text", true);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.validationRules());
  }
}
var SchemaDetailComponent = class _SchemaDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  schemaService = inject(SchemaService);
  schema = signal(null, ...ngDevMode ? [{ debugName: "schema" }] : (
    /* istanbul ignore next */
    []
  ));
  loading = signal(true, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  saving = signal(false, ...ngDevMode ? [{ debugName: "saving" }] : (
    /* istanbul ignore next */
    []
  ));
  validating = signal(false, ...ngDevMode ? [{ debugName: "validating" }] : (
    /* istanbul ignore next */
    []
  ));
  activeTab = 0;
  // Schema edit fields
  editName = "";
  editSubject = "";
  editDescription = "";
  editSchemaType = "CANONICAL";
  editStatus = "ACTIVE";
  editSchemaJson = "";
  jsonError = signal(null, ...ngDevMode ? [{ debugName: "jsonError" }] : (
    /* istanbul ignore next */
    []
  ));
  // Validation
  validationRules = signal([], ...ngDevMode ? [{ debugName: "validationRules" }] : (
    /* istanbul ignore next */
    []
  ));
  validationErrors = signal([], ...ngDevMode ? [{ debugName: "validationErrors" }] : (
    /* istanbul ignore next */
    []
  ));
  validationDone = signal(false, ...ngDevMode ? [{ debugName: "validationDone" }] : (
    /* istanbul ignore next */
    []
  ));
  validationSuccess = signal(false, ...ngDevMode ? [{ debugName: "validationSuccess" }] : (
    /* istanbul ignore next */
    []
  ));
  // Enum editing
  newEnumValue = "";
  schemaTypes = [
    { label: "Canonical", value: "CANONICAL" },
    { label: "Partner Inbound", value: "PARTNER_INBOUND" },
    { label: "Partner Outbound", value: "PARTNER_OUTBOUND" },
    { label: "Internal", value: "INTERNAL" }
  ];
  statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Deprecated", value: "DEPRECATED" },
    { label: "Draft", value: "DRAFT" }
  ];
  formatOptions = [
    { label: "None", value: "" },
    { label: "email", value: "email" },
    { label: "uri", value: "uri" },
    { label: "date-time", value: "date-time" },
    { label: "date", value: "date" },
    { label: "time", value: "time" },
    { label: "uuid", value: "uuid" },
    { label: "hostname", value: "hostname" },
    { label: "ipv4", value: "ipv4" },
    { label: "ipv6", value: "ipv6" }
  ];
  rulesSummary = computed(() => {
    const rules = this.validationRules();
    const required = rules.filter((r) => r.required).length;
    const withConstraints = rules.filter((r) => this.hasConstraints(r)).length;
    return { total: rules.length, required, withConstraints };
  }, ...ngDevMode ? [{ debugName: "rulesSummary" }] : (
    /* istanbul ignore next */
    []
  ));
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadSchema(id);
    }
  }
  loadSchema(id) {
    this.loading.set(true);
    this.schemaService.getById(id).subscribe({
      next: (schema) => {
        this.schema.set(schema);
        this.populateEditFields(schema);
        this.initValidationRules(schema);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Failed to load schema:", err);
        this.loading.set(false);
      }
    });
  }
  populateEditFields(schema) {
    this.editName = schema.name;
    this.editSubject = schema.subject;
    this.editDescription = schema.description || "";
    this.editSchemaType = schema.schema_type;
    this.editStatus = schema.status || "ACTIVE";
    try {
      const parsed = JSON.parse(schema.schema_json);
      this.editSchemaJson = JSON.stringify(parsed, null, 2);
    } catch {
      this.editSchemaJson = schema.schema_json;
    }
  }
  initValidationRules(schema) {
    try {
      const parsed = JSON.parse(schema.schema_json);
      const properties = parsed.properties || {};
      const requiredFields = parsed.required || [];
      const rules = Object.entries(properties).map(([name, prop]) => ({
        field: name,
        type: prop.type || "any",
        required: requiredFields.includes(name),
        nullable: prop.nullable === true,
        // String
        minLength: prop.minLength ?? null,
        maxLength: prop.maxLength ?? null,
        pattern: prop.pattern ?? null,
        patternDescription: prop.patternDescription ?? null,
        format: prop.format ?? null,
        // Number
        minimum: prop.minimum ?? null,
        maximum: prop.maximum ?? null,
        exclusiveMinimum: prop.exclusiveMinimum === true,
        exclusiveMaximum: prop.exclusiveMaximum === true,
        multipleOf: prop.multipleOf ?? null,
        // Array
        minItems: prop.minItems ?? null,
        maxItems: prop.maxItems ?? null,
        uniqueItems: prop.uniqueItems === true,
        // Enum
        enumValues: prop.enum || [],
        // Meta
        defaultValue: prop.default != null ? String(prop.default) : null,
        customErrorMessage: prop.errorMessage ?? null,
        description: prop.description ?? "",
        examples: prop.examples || [],
        deprecated: prop.deprecated === true,
        // UI
        expanded: false
      }));
      this.validationRules.set(rules);
    } catch (e) {
      console.error("Failed to parse schema JSON:", e);
    }
  }
  toggleExpand(index) {
    this.validationRules.update((rules) => {
      const updated = [...rules];
      updated[index] = __spreadProps(__spreadValues({}, updated[index]), { expanded: !updated[index].expanded });
      return updated;
    });
  }
  expandAll() {
    this.validationRules.update((rules) => rules.map((r) => __spreadProps(__spreadValues({}, r), { expanded: true })));
  }
  collapseAll() {
    this.validationRules.update((rules) => rules.map((r) => __spreadProps(__spreadValues({}, r), { expanded: false })));
  }
  updateRule(index, key, value) {
    this.validationRules.update((rules) => {
      const updated = [...rules];
      updated[index] = __spreadProps(__spreadValues({}, updated[index]), { [key]: value });
      return updated;
    });
    this.validationDone.set(false);
  }
  toggleRequired(index) {
    this.validationRules.update((rules) => {
      const updated = [...rules];
      updated[index] = __spreadProps(__spreadValues({}, updated[index]), { required: !updated[index].required });
      return updated;
    });
    this.validationDone.set(false);
  }
  toggleNullable(index) {
    this.validationRules.update((rules) => {
      const updated = [...rules];
      updated[index] = __spreadProps(__spreadValues({}, updated[index]), { nullable: !updated[index].nullable });
      return updated;
    });
    this.validationDone.set(false);
  }
  addEnumValue(index, value) {
    if (!value.trim())
      return;
    this.validationRules.update((rules) => {
      const updated = [...rules];
      const current = updated[index].enumValues || [];
      if (!current.includes(value.trim())) {
        updated[index] = __spreadProps(__spreadValues({}, updated[index]), { enumValues: [...current, value.trim()] });
      }
      return updated;
    });
    this.newEnumValue = "";
    this.validationDone.set(false);
  }
  removeEnumValue(index, enumIndex) {
    this.validationRules.update((rules) => {
      const updated = [...rules];
      const current = [...updated[index].enumValues || []];
      current.splice(enumIndex, 1);
      updated[index] = __spreadProps(__spreadValues({}, updated[index]), { enumValues: current });
      return updated;
    });
    this.validationDone.set(false);
  }
  addExample(index, value) {
    if (!value.trim())
      return;
    this.validationRules.update((rules) => {
      const updated = [...rules];
      const current = updated[index].examples || [];
      updated[index] = __spreadProps(__spreadValues({}, updated[index]), { examples: [...current, value.trim()] });
      return updated;
    });
    this.validationDone.set(false);
  }
  removeExample(index, exIndex) {
    this.validationRules.update((rules) => {
      const updated = [...rules];
      const current = [...updated[index].examples || []];
      current.splice(exIndex, 1);
      updated[index] = __spreadProps(__spreadValues({}, updated[index]), { examples: current });
      return updated;
    });
  }
  hasConstraints(rule) {
    return rule.required || rule.nullable || rule.minLength != null || rule.maxLength != null || !!rule.pattern || !!rule.format || rule.minimum != null || rule.maximum != null || rule.multipleOf != null || rule.minItems != null || rule.maxItems != null || rule.uniqueItems === true || (rule.enumValues?.length ?? 0) > 0 || !!rule.defaultValue || !!rule.customErrorMessage || rule.deprecated === true;
  }
  getConstraintCount(rule) {
    let count = 0;
    if (rule.required)
      count++;
    if (rule.nullable)
      count++;
    if (rule.minLength != null)
      count++;
    if (rule.maxLength != null)
      count++;
    if (rule.pattern)
      count++;
    if (rule.format)
      count++;
    if (rule.minimum != null)
      count++;
    if (rule.maximum != null)
      count++;
    if (rule.multipleOf != null)
      count++;
    if (rule.minItems != null)
      count++;
    if (rule.maxItems != null)
      count++;
    if (rule.uniqueItems)
      count++;
    if ((rule.enumValues?.length ?? 0) > 0)
      count++;
    if (rule.defaultValue)
      count++;
    if (rule.customErrorMessage)
      count++;
    return count;
  }
  validate() {
    this.validating.set(true);
    this.validationErrors.set([]);
    this.validationDone.set(false);
    this.validationSuccess.set(false);
    const schema = this.schema();
    if (!schema || !schema.id) {
      this.validating.set(false);
      return;
    }
    const rules = this.validationRules();
    const request = {
      schema_id: schema.id,
      rules: rules.map((r) => ({
        field: r.field,
        type: r.type,
        required: r.required,
        nullable: r.nullable,
        minValue: r.minimum,
        maxValue: r.maximum,
        exclusiveMinimum: r.exclusiveMinimum,
        exclusiveMaximum: r.exclusiveMaximum,
        multipleOf: r.multipleOf,
        minLength: r.minLength,
        maxLength: r.maxLength,
        pattern: r.pattern,
        format: r.format,
        enumValues: r.enumValues,
        minItems: r.minItems,
        maxItems: r.maxItems,
        uniqueItems: r.uniqueItems,
        defaultValue: r.defaultValue,
        customErrorMessage: r.customErrorMessage
      }))
    };
    this.schemaService.validateSchema(schema.id, request).subscribe({
      next: (result) => {
        this.validationErrors.set(result.errors || []);
        this.validationDone.set(true);
        this.validationSuccess.set(result.valid);
        this.validating.set(false);
      },
      error: (err) => {
        console.error("Validation failed:", err);
        this.validationErrors.set([{
          field: "_system",
          type: "ERROR",
          message: "Validation request failed. Please try again."
        }]);
        this.validationDone.set(true);
        this.validationSuccess.set(false);
        this.validating.set(false);
      }
    });
  }
  save() {
    const schema = this.schema();
    if (!schema || !schema.id)
      return;
    this.saving.set(true);
    const updatedSchemaJson = this.activeTab === 0 ? this.editSchemaJson : this.buildSchemaJsonWithRules();
    this.schemaService.update(schema.id, __spreadProps(__spreadValues({}, schema), {
      name: this.editName,
      subject: this.editSubject,
      description: this.editDescription,
      schema_type: this.editSchemaType,
      status: this.editStatus,
      schema_json: updatedSchemaJson
    })).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.schema.set(updated || __spreadProps(__spreadValues({}, schema), { schema_json: updatedSchemaJson }));
        if (this.activeTab === 0) {
          this.initValidationRules(__spreadProps(__spreadValues({}, schema), { schema_json: updatedSchemaJson }));
        }
      },
      error: (err) => {
        console.error("Failed to save:", err);
        this.saving.set(false);
      }
    });
  }
  buildSchemaJsonWithRules() {
    const schema = this.schema();
    if (!schema)
      return "{}";
    try {
      const parsed = JSON.parse(schema.schema_json);
      const rules = this.validationRules();
      parsed.required = rules.filter((r) => r.required).map((r) => r.field);
      for (const rule of rules) {
        if (!parsed.properties[rule.field])
          continue;
        const prop = parsed.properties[rule.field];
        if (rule.nullable) {
          prop.nullable = true;
        } else {
          delete prop.nullable;
        }
        if (rule.type === "number" || rule.type === "integer") {
          this.setOrDelete(prop, "minimum", rule.minimum);
          this.setOrDelete(prop, "maximum", rule.maximum);
          this.setOrDelete(prop, "multipleOf", rule.multipleOf);
          if (rule.exclusiveMinimum)
            prop.exclusiveMinimum = true;
          else
            delete prop.exclusiveMinimum;
          if (rule.exclusiveMaximum)
            prop.exclusiveMaximum = true;
          else
            delete prop.exclusiveMaximum;
        }
        if (rule.type === "string") {
          this.setOrDelete(prop, "minLength", rule.minLength);
          this.setOrDelete(prop, "maxLength", rule.maxLength);
          if (rule.pattern)
            prop.pattern = rule.pattern;
          else
            delete prop.pattern;
          if (rule.format)
            prop.format = rule.format;
          else
            delete prop.format;
        }
        if (rule.type === "array") {
          this.setOrDelete(prop, "minItems", rule.minItems);
          this.setOrDelete(prop, "maxItems", rule.maxItems);
          if (rule.uniqueItems)
            prop.uniqueItems = true;
          else
            delete prop.uniqueItems;
        }
        if (rule.enumValues && rule.enumValues.length > 0) {
          prop.enum = rule.enumValues;
        } else {
          delete prop.enum;
        }
        if (rule.defaultValue != null && rule.defaultValue !== "") {
          prop.default = this.parseDefault(rule.defaultValue, rule.type);
        } else {
          delete prop.default;
        }
        if (rule.customErrorMessage)
          prop.errorMessage = rule.customErrorMessage;
        else
          delete prop.errorMessage;
        if (rule.description)
          prop.description = rule.description;
        else
          delete prop.description;
        if (rule.examples && rule.examples.length > 0)
          prop.examples = rule.examples;
        else
          delete prop.examples;
        if (rule.deprecated)
          prop.deprecated = true;
        else
          delete prop.deprecated;
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return schema.schema_json;
    }
  }
  setOrDelete(obj, key, value) {
    if (value !== null && value !== void 0) {
      obj[key] = value;
    } else {
      delete obj[key];
    }
  }
  parseDefault(value, type) {
    if (type === "number" || type === "integer")
      return Number(value) || 0;
    if (type === "boolean")
      return value === "true";
    return value;
  }
  formatJson() {
    try {
      const parsed = JSON.parse(this.editSchemaJson);
      this.editSchemaJson = JSON.stringify(parsed, null, 2);
      this.jsonError.set(null);
    } catch (e) {
      this.jsonError.set(e.message);
    }
  }
  getTypeSeverity(type) {
    switch (type) {
      case "string":
        return "info";
      case "number":
      case "integer":
        return "warn";
      case "boolean":
        return "success";
      case "object":
        return "secondary";
      case "array":
        return "danger";
      default:
        return "secondary";
    }
  }
  goBack() {
    this.router.navigate(["/schemas"]);
  }
  static \u0275fac = function SchemaDetailComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SchemaDetailComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SchemaDetailComponent, selectors: [["app-schema-detail"]], decls: 4, vars: 1, consts: [["exInput", ""], [1, "schema-detail-page"], [1, "loading"], [1, "pi", "pi-spin", "pi-spinner"], ["severity", "error", "text", "Schema not found"], ["label", "Back to Schemas", "icon", "pi pi-arrow-left", 3, "onClick"], [1, "page-header"], [1, "header-left"], ["icon", "pi pi-arrow-left", "severity", "secondary", 3, "onClick", "text"], [1, "header-info"], [1, "header-meta"], ["severity", "info", 3, "value"], ["severity", "secondary", 3, "value"], [3, "value", "severity"], [1, "header-actions"], ["label", "Save", "icon", "pi pi-save", 3, "onClick", "loading"], [3, "valueChange", "value"], [3, "value"], [1, "pi", "pi-code"], [1, "pi", "pi-shield"], [1, "schema-editor-tab"], [1, "form-fields"], [1, "form-row"], [1, "form-field"], ["pInputText", "", 3, "ngModelChange", "ngModel"], ["optionLabel", "label", "optionValue", "value", 3, "ngModelChange", "ngModel", "options"], ["pInputText", "", "placeholder", "Brief description", 3, "ngModelChange", "ngModel"], [1, "json-editor-section"], [1, "editor-header"], ["label", "Format", "icon", "pi pi-code", "size", "small", 3, "onClick", "text"], ["pTextarea", "", 1, "json-textarea", 3, "ngModelChange", "ngModel", "rows"], ["severity", "error", 3, "text"], [1, "validation-rules-tab"], [1, "rules-summary"], [1, "sep"], [1, "rules-actions"], ["label", "Validate", "icon", "pi pi-check-circle", "severity", "info", 3, "onClick", "outlined", "loading"], ["label", "Expand All", "icon", "pi pi-angle-double-down", "size", "small", 3, "onClick", "text"], ["label", "Collapse All", "icon", "pi pi-angle-double-up", "size", "small", 3, "onClick", "text"], [1, "rule-card", 3, "expanded", "deprecated"], [1, "validation-result", "success"], [1, "validation-result", "error"], [1, "pi", "pi-check-circle"], [1, "result-header"], [1, "pi", "pi-exclamation-triangle"], [1, "error-list"], [1, "rule-card"], [1, "rule-header", 3, "click"], [1, "rule-header-left"], [1, "pi"], [1, "field-name"], ["styleClass", "type-tag", 3, "value", "severity"], [1, "badge", "required"], [1, "badge", "nullable"], [1, "badge", "deprecated"], [1, "badge", "format"], [1, "rule-header-right"], [1, "constraint-count"], [1, "rule-body"], [1, "rule-section"], [1, "flags-row"], [1, "flag"], [3, "ngModelChange", "onChange", "ngModel", "binary"], [1, "enum-section"], [1, "enum-chips"], [3, "label", "removable"], [1, "no-enum"], [1, "enum-add"], ["pInputText", "", "placeholder", "Add value...", 3, "ngModelChange", "keyup.enter", "ngModel"], ["icon", "pi pi-plus", "size", "small", 3, "onClick", "outlined"], [1, "constraints-grid"], [1, "constraint-field"], ["pInputText", "", "placeholder", "Default if not provided", 3, "ngModelChange", "ngModel"], [1, "constraint-field", "wide"], ["pInputText", "", "placeholder", "Override default validation error", 3, "ngModelChange", "ngModel"], ["pInputText", "", "placeholder", "Field description", 3, "ngModelChange", "ngModel"], ["pInputText", "", "placeholder", "Add example...", 3, "keyup.enter"], ["placeholder", "\u2014", 3, "ngModelChange", "ngModel", "showButtons", "min"], ["optionLabel", "label", "optionValue", "value", "placeholder", "None", 3, "ngModelChange", "ngModel", "options"], ["pInputText", "", "placeholder", "e.g. ^[A-Z]{2,3}$", 3, "ngModelChange", "ngModel"], ["pInputText", "", "placeholder", "Human-readable description of the pattern", 3, "ngModelChange", "ngModel"], ["placeholder", "\u2014", 3, "ngModelChange", "ngModel", "showButtons"], [3, "onRemove", "label", "removable"]], template: function SchemaDetailComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 1);
      \u0275\u0275conditionalCreate(1, SchemaDetailComponent_Conditional_1_Template, 4, 0, "div", 2)(2, SchemaDetailComponent_Conditional_2_Template, 2, 0)(3, SchemaDetailComponent_Conditional_3_Template, 81, 32);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.loading() ? 1 : !ctx.schema() ? 2 : 3);
    }
  }, dependencies: [
    CommonModule,
    FormsModule,
    DefaultValueAccessor,
    NgControlStatus,
    NgModel,
    CardModule,
    ButtonModule,
    Button,
    InputTextModule,
    InputText,
    InputNumberModule,
    InputNumber,
    CheckboxModule,
    Checkbox,
    SelectModule,
    Select,
    TagModule,
    Tag,
    MessageModule,
    Message,
    TableModule,
    TooltipModule,
    TabsModule,
    Tabs,
    TabPanels,
    TabPanel,
    TabList,
    Tab,
    TextareaModule,
    Textarea,
    ChipModule,
    Chip
  ], styles: ['\n.schema-detail-page[_ngcontent-%COMP%] {\n  padding: 1.5rem;\n  max-width: 1200px;\n  margin: 0 auto;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .loading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 2rem;\n  justify-content: center;\n  color: var(--text-color-secondary);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .page-header[_ngcontent-%COMP%]   .header-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .page-header[_ngcontent-%COMP%]   .header-info[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.5rem;\n  font-weight: 600;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .page-header[_ngcontent-%COMP%]   .header-info[_ngcontent-%COMP%]   .header-meta[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin-top: 0.25rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .page-header[_ngcontent-%COMP%]   .header-info[_ngcontent-%COMP%]   .header-meta[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .page-header[_ngcontent-%COMP%]   .header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .schema-editor-tab[_ngcontent-%COMP%]   .form-fields[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .schema-editor-tab[_ngcontent-%COMP%]   .form-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  margin-bottom: 1rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .schema-editor-tab[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .schema-editor-tab[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--text-color-secondary);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .schema-editor-tab[_ngcontent-%COMP%]   .json-editor-section[_ngcontent-%COMP%]   .editor-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .schema-editor-tab[_ngcontent-%COMP%]   .json-editor-section[_ngcontent-%COMP%]   .editor-header[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 600;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .schema-editor-tab[_ngcontent-%COMP%]   .json-editor-section[_ngcontent-%COMP%]   .json-textarea[_ngcontent-%COMP%] {\n  width: 100%;\n  font-family:\n    "JetBrains Mono",\n    "Fira Code",\n    monospace;\n  font-size: 0.8125rem;\n  line-height: 1.5;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rules-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  background: var(--surface-50);\n  border-radius: 8px;\n  margin-bottom: 1rem;\n  font-size: 0.875rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rules-summary[_ngcontent-%COMP%]   .sep[_ngcontent-%COMP%] {\n  color: var(--surface-400);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .validation-result[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border-radius: 8px;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .validation-result.success[_ngcontent-%COMP%] {\n  background: var(--green-50);\n  border: 1px solid var(--green-300);\n  color: var(--green-700);\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 500;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .validation-result.error[_ngcontent-%COMP%] {\n  background: var(--red-50);\n  border: 1px solid var(--red-300);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .validation-result.error[_ngcontent-%COMP%]   .result-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  color: var(--red-700);\n  font-weight: 600;\n  margin-bottom: 0.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .validation-result.error[_ngcontent-%COMP%]   .error-list[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-left: 1.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .validation-result.error[_ngcontent-%COMP%]   .error-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  padding: 0.25rem 0;\n  color: var(--red-600);\n  font-size: 0.875rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rules-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%] {\n  border: 1px solid var(--surface-200);\n  border-radius: 8px;\n  margin-bottom: 0.5rem;\n  overflow: hidden;\n  transition: border-color 0.2s;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card.expanded[_ngcontent-%COMP%] {\n  border-color: var(--primary-300);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card.deprecated[_ngcontent-%COMP%] {\n  opacity: 0.7;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.75rem 1rem;\n  cursor: pointer;\n  background: var(--surface-50);\n  transition: background 0.15s;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]:hover {\n  background: var(--surface-100);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  width: 16px;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%]   .field-name[_ngcontent-%COMP%] {\n  font-family: monospace;\n  font-weight: 600;\n  font-size: 0.9rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%]   [_ngcontent-%COMP%]:deep(.type-tag) {\n  font-size: 0.7rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%]   .badge[_ngcontent-%COMP%] {\n  font-size: 0.6875rem;\n  padding: 0.125rem 0.5rem;\n  border-radius: 10px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.02em;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%]   .badge.required[_ngcontent-%COMP%] {\n  background: var(--red-100);\n  color: var(--red-700);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%]   .badge.nullable[_ngcontent-%COMP%] {\n  background: var(--blue-100);\n  color: var(--blue-700);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%]   .badge.deprecated[_ngcontent-%COMP%] {\n  background: var(--orange-100);\n  color: var(--orange-700);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-left[_ngcontent-%COMP%]   .badge.format[_ngcontent-%COMP%] {\n  background: var(--purple-100);\n  color: var(--purple-700);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-header[_ngcontent-%COMP%]   .rule-header-right[_ngcontent-%COMP%]   .constraint-count[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border-top: 1px solid var(--surface-200);\n  background: white;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .rule-section[_ngcontent-%COMP%] {\n  margin-bottom: 1.25rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .rule-section[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 0;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .rule-section[_ngcontent-%COMP%]   h5[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--text-color-secondary);\n  text-transform: uppercase;\n  letter-spacing: 0.03em;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .flags-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .flags-row[_ngcontent-%COMP%]   .flag[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  font-size: 0.875rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .constraints-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  gap: 1rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .constraints-grid[_ngcontent-%COMP%]   .constraint-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .constraints-grid[_ngcontent-%COMP%]   .constraint-field.wide[_ngcontent-%COMP%] {\n  grid-column: span 2;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .constraints-grid[_ngcontent-%COMP%]   .constraint-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 500;\n  color: var(--text-color-secondary);\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .enum-section[_ngcontent-%COMP%]   .enum-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n  min-height: 32px;\n  align-items: center;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .enum-section[_ngcontent-%COMP%]   .enum-chips[_ngcontent-%COMP%]   .no-enum[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  font-style: italic;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .enum-section[_ngcontent-%COMP%]   .enum-add[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  max-width: 300px;\n}\n.schema-detail-page[_ngcontent-%COMP%]   .validation-rules-tab[_ngcontent-%COMP%]   .rule-card[_ngcontent-%COMP%]   .rule-body[_ngcontent-%COMP%]   .enum-section[_ngcontent-%COMP%]   .enum-add[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n}\n/*# sourceMappingURL=schema-detail.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SchemaDetailComponent, [{
    type: Component,
    args: [{ selector: "app-schema-detail", standalone: true, imports: [
      CommonModule,
      FormsModule,
      CardModule,
      ButtonModule,
      InputTextModule,
      InputNumberModule,
      CheckboxModule,
      SelectModule,
      TagModule,
      MessageModule,
      TableModule,
      TooltipModule,
      TabsModule,
      TextareaModule,
      ChipModule
    ], template: `<div class="schema-detail-page">
  @if (loading()) {
    <div class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      <span>Loading schema...</span>
    </div>
  } @else if (!schema()) {
    <p-message severity="error" text="Schema not found"></p-message>
    <p-button label="Back to Schemas" icon="pi pi-arrow-left" (onClick)="goBack()" />
  } @else {
    <div class="page-header">
      <div class="header-left">
        <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
        <div class="header-info">
          <h2>{{ schema()!.name }}</h2>
          <div class="header-meta">
            <p-tag [value]="schema()!.schema_type" severity="info" />
            <code>{{ schema()!.subject }}</code>
            <p-tag [value]="'v' + schema()!.version" severity="secondary" />
            <p-tag [value]="schema()!.status!" [severity]="schema()!.status === 'ACTIVE' ? 'success' : 'warn'" />
          </div>
        </div>
      </div>
      <div class="header-actions">
        <p-button label="Save" icon="pi pi-save" [loading]="saving()" (onClick)="save()" />
      </div>
    </div>

    <p-tabs [value]="activeTab" (valueChange)="activeTab = +($event ?? 0)">
      <p-tablist>
        <p-tab [value]="0"><i class="pi pi-code"></i> Schema JSON</p-tab>
        <p-tab [value]="1"><i class="pi pi-shield"></i> Validation Rules</p-tab>
      </p-tablist>
      <p-tabpanels>
        <p-tabpanel [value]="0">
        <div class="schema-editor-tab">
          <div class="form-fields">
            <div class="form-row">
              <div class="form-field">
                <label>Name</label>
                <input pInputText [(ngModel)]="editName" />
              </div>
              <div class="form-field">
                <label>Subject</label>
                <input pInputText [(ngModel)]="editSubject" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Type</label>
                <p-select [(ngModel)]="editSchemaType" [options]="schemaTypes" optionLabel="label" optionValue="value" />
              </div>
              <div class="form-field">
                <label>Status</label>
                <p-select [(ngModel)]="editStatus" [options]="statusOptions" optionLabel="label" optionValue="value" />
              </div>
            </div>
            <div class="form-field">
              <label>Description</label>
              <input pInputText [(ngModel)]="editDescription" placeholder="Brief description" />
            </div>
          </div>

          <div class="json-editor-section">
            <div class="editor-header">
              <label>Schema JSON</label>
              <p-button label="Format" icon="pi pi-code" [text]="true" size="small" (onClick)="formatJson()" />
            </div>
            <textarea pTextarea [(ngModel)]="editSchemaJson" [rows]="20" class="json-textarea"></textarea>
            @if (jsonError()) {
              <p-message severity="error" [text]="jsonError()!" />
            }
          </div>
        </div>
        </p-tabpanel>

        <p-tabpanel [value]="1">
        <div class="validation-rules-tab">

          <!-- Summary -->
          <div class="rules-summary">
            <span><strong>{{ rulesSummary().total }}</strong> fields</span>
            <span class="sep">\u2022</span>
            <span><strong>{{ rulesSummary().required }}</strong> required</span>
            <span class="sep">\u2022</span>
            <span><strong>{{ rulesSummary().withConstraints }}</strong> with constraints</span>
          </div>

          <!-- Validation Result -->
          @if (validationDone()) {
            @if (validationSuccess()) {
              <div class="validation-result success">
                <i class="pi pi-check-circle"></i>
                <span>All validation rules are consistent</span>
              </div>
            } @else {
              <div class="validation-result error">
                <div class="result-header">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>{{ validationErrors().length }} issue(s) found</span>
                </div>
                <ul class="error-list">
                  @for (err of validationErrors(); track err.field + err.type) {
                    <li><strong>{{ err.field }}</strong>: {{ err.message }}</li>
                  }
                </ul>
              </div>
            }
          }

          <!-- Actions -->
          <div class="rules-actions">
            <p-button label="Validate" icon="pi pi-check-circle" severity="info" [outlined]="true" [loading]="validating()" (onClick)="validate()" />
            <p-button label="Expand All" icon="pi pi-angle-double-down" [text]="true" size="small" (onClick)="expandAll()" />
            <p-button label="Collapse All" icon="pi pi-angle-double-up" [text]="true" size="small" (onClick)="collapseAll()" />
          </div>

          <!-- Rules -->
          @for (rule of validationRules(); track rule.field; let i = $index) {
            <div class="rule-card" [class.expanded]="rule.expanded" [class.deprecated]="rule.deprecated">
              <div class="rule-header" (click)="toggleExpand(i)">
                <div class="rule-header-left">
                  <i class="pi" [class.pi-chevron-right]="!rule.expanded" [class.pi-chevron-down]="rule.expanded"></i>
                  <span class="field-name">{{ rule.field }}</span>
                  <p-tag [value]="rule.type" [severity]="getTypeSeverity(rule.type)" styleClass="type-tag" />
                  @if (rule.required) {
                    <span class="badge required">required</span>
                  }
                  @if (rule.nullable) {
                    <span class="badge nullable">nullable</span>
                  }
                  @if (rule.deprecated) {
                    <span class="badge deprecated">deprecated</span>
                  }
                  @if (rule.format) {
                    <span class="badge format">{{ rule.format }}</span>
                  }
                </div>
                <div class="rule-header-right">
                  @if (getConstraintCount(rule) > 0) {
                    <span class="constraint-count">{{ getConstraintCount(rule) }} constraint{{ getConstraintCount(rule) > 1 ? 's' : '' }}</span>
                  }
                </div>
              </div>

              @if (rule.expanded) {
                <div class="rule-body">
                  <!-- Row 1: Basic flags -->
                  <div class="rule-section">
                    <h5>Basic</h5>
                    <div class="flags-row">
                      <label class="flag">
                        <p-checkbox [(ngModel)]="rule.required" [binary]="true" (onChange)="toggleRequired(i)" />
                        <span>Required</span>
                      </label>
                      <label class="flag">
                        <p-checkbox [(ngModel)]="rule.nullable" [binary]="true" (onChange)="toggleNullable(i)" />
                        <span>Nullable</span>
                      </label>
                      <label class="flag">
                        <p-checkbox [(ngModel)]="rule.deprecated" [binary]="true" (onChange)="updateRule(i, 'deprecated', rule.deprecated)" />
                        <span>Deprecated</span>
                      </label>
                    </div>
                  </div>

                  <!-- String constraints -->
                  @if (rule.type === 'string') {
                    <div class="rule-section">
                      <h5>String Constraints</h5>
                      <div class="constraints-grid">
                        <div class="constraint-field">
                          <label>Min Length</label>
                          <p-inputnumber [ngModel]="rule.minLength ?? null" (ngModelChange)="updateRule(i, 'minLength', $event)" [showButtons]="true" [min]="0" placeholder="\u2014" />
                        </div>
                        <div class="constraint-field">
                          <label>Max Length</label>
                          <p-inputnumber [ngModel]="rule.maxLength ?? null" (ngModelChange)="updateRule(i, 'maxLength', $event)" [showButtons]="true" [min]="0" placeholder="\u2014" />
                        </div>
                        <div class="constraint-field">
                          <label>Format</label>
                          <p-select [ngModel]="rule.format ?? ''" (ngModelChange)="updateRule(i, 'format', $event || null)" [options]="formatOptions" optionLabel="label" optionValue="value" placeholder="None" />
                        </div>
                        <div class="constraint-field wide">
                          <label>Pattern (Regex)</label>
                          <input pInputText [ngModel]="rule.pattern ?? ''" (ngModelChange)="updateRule(i, 'pattern', $event || null)" placeholder="e.g. ^[A-Z]{2,3}$" />
                        </div>
                        <div class="constraint-field wide">
                          <label>Pattern Description</label>
                          <input pInputText [ngModel]="rule.patternDescription ?? ''" (ngModelChange)="updateRule(i, 'patternDescription', $event || null)" placeholder="Human-readable description of the pattern" />
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Number constraints -->
                  @if (rule.type === 'number' || rule.type === 'integer') {
                    <div class="rule-section">
                      <h5>Number Constraints</h5>
                      <div class="constraints-grid">
                        <div class="constraint-field">
                          <label>Minimum</label>
                          <p-inputnumber [ngModel]="rule.minimum ?? null" (ngModelChange)="updateRule(i, 'minimum', $event)" [showButtons]="true" placeholder="\u2014" />
                        </div>
                        <div class="constraint-field">
                          <label>
                            Exclusive
                            <p-checkbox [(ngModel)]="rule.exclusiveMinimum" [binary]="true" (onChange)="updateRule(i, 'exclusiveMinimum', rule.exclusiveMinimum)" />
                          </label>
                        </div>
                        <div class="constraint-field">
                          <label>Maximum</label>
                          <p-inputnumber [ngModel]="rule.maximum ?? null" (ngModelChange)="updateRule(i, 'maximum', $event)" [showButtons]="true" placeholder="\u2014" />
                        </div>
                        <div class="constraint-field">
                          <label>
                            Exclusive
                            <p-checkbox [(ngModel)]="rule.exclusiveMaximum" [binary]="true" (onChange)="updateRule(i, 'exclusiveMaximum', rule.exclusiveMaximum)" />
                          </label>
                        </div>
                        <div class="constraint-field">
                          <label>Multiple Of</label>
                          <p-inputnumber [ngModel]="rule.multipleOf ?? null" (ngModelChange)="updateRule(i, 'multipleOf', $event)" [showButtons]="false" placeholder="\u2014" />
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Array constraints -->
                  @if (rule.type === 'array') {
                    <div class="rule-section">
                      <h5>Array Constraints</h5>
                      <div class="constraints-grid">
                        <div class="constraint-field">
                          <label>Min Items</label>
                          <p-inputnumber [ngModel]="rule.minItems ?? null" (ngModelChange)="updateRule(i, 'minItems', $event)" [showButtons]="true" [min]="0" placeholder="\u2014" />
                        </div>
                        <div class="constraint-field">
                          <label>Max Items</label>
                          <p-inputnumber [ngModel]="rule.maxItems ?? null" (ngModelChange)="updateRule(i, 'maxItems', $event)" [showButtons]="true" [min]="0" placeholder="\u2014" />
                        </div>
                        <div class="constraint-field">
                          <label class="flag">
                            <p-checkbox [(ngModel)]="rule.uniqueItems" [binary]="true" (onChange)="updateRule(i, 'uniqueItems', rule.uniqueItems)" />
                            <span>Unique Items</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Enum values -->
                  <div class="rule-section">
                    <h5>Allowed Values (Enum)</h5>
                    <div class="enum-section">
                      <div class="enum-chips">
                        @for (val of rule.enumValues || []; track val; let ei = $index) {
                          <p-chip [label]="val" [removable]="true" (onRemove)="removeEnumValue(i, ei)" />
                        }
                        @if (!rule.enumValues || rule.enumValues.length === 0) {
                          <span class="no-enum">No enum values \u2014 field accepts any value of its type</span>
                        }
                      </div>
                      <div class="enum-add">
                        <input pInputText [(ngModel)]="newEnumValue" placeholder="Add value..." (keyup.enter)="addEnumValue(i, newEnumValue)" />
                        <p-button icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addEnumValue(i, newEnumValue)" />
                      </div>
                    </div>
                  </div>

                  <!-- Meta -->
                  <div class="rule-section">
                    <h5>Metadata</h5>
                    <div class="constraints-grid">
                      <div class="constraint-field">
                        <label>Default Value</label>
                        <input pInputText [ngModel]="rule.defaultValue ?? ''" (ngModelChange)="updateRule(i, 'defaultValue', $event || null)" placeholder="Default if not provided" />
                      </div>
                      <div class="constraint-field wide">
                        <label>Custom Error Message</label>
                        <input pInputText [ngModel]="rule.customErrorMessage ?? ''" (ngModelChange)="updateRule(i, 'customErrorMessage', $event || null)" placeholder="Override default validation error" />
                      </div>
                      <div class="constraint-field wide">
                        <label>Description</label>
                        <input pInputText [ngModel]="rule.description ?? ''" (ngModelChange)="updateRule(i, 'description', $event)" placeholder="Field description" />
                      </div>
                    </div>
                  </div>

                  <!-- Examples -->
                  <div class="rule-section">
                    <h5>Examples</h5>
                    <div class="enum-section">
                      <div class="enum-chips">
                        @for (ex of rule.examples || []; track ex; let ei = $index) {
                          <p-chip [label]="ex" [removable]="true" (onRemove)="removeExample(i, ei)" />
                        }
                      </div>
                      <div class="enum-add">
                        <input pInputText #exInput placeholder="Add example..." (keyup.enter)="addExample(i, exInput.value); exInput.value = ''" />
                        <p-button icon="pi pi-plus" size="small" [outlined]="true" (onClick)="addExample(i, exInput.value); exInput.value = ''" />
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
        </p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  }
</div>
`, styles: ['/* src/app/pages/schemas/schema-detail/schema-detail.component.scss */\n.schema-detail-page {\n  padding: 1.5rem;\n  max-width: 1200px;\n  margin: 0 auto;\n}\n.schema-detail-page .loading {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 2rem;\n  justify-content: center;\n  color: var(--text-color-secondary);\n}\n.schema-detail-page .page-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1.5rem;\n}\n.schema-detail-page .page-header .header-left {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.schema-detail-page .page-header .header-info h2 {\n  margin: 0;\n  font-size: 1.5rem;\n  font-weight: 600;\n}\n.schema-detail-page .page-header .header-info .header-meta {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin-top: 0.25rem;\n}\n.schema-detail-page .page-header .header-info .header-meta code {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n}\n.schema-detail-page .page-header .header-actions {\n  display: flex;\n  gap: 0.5rem;\n}\n.schema-detail-page .schema-editor-tab .form-fields {\n  margin-bottom: 1.5rem;\n}\n.schema-detail-page .schema-editor-tab .form-row {\n  display: flex;\n  gap: 1rem;\n  margin-bottom: 1rem;\n}\n.schema-detail-page .schema-editor-tab .form-field {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.schema-detail-page .schema-editor-tab .form-field label {\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--text-color-secondary);\n}\n.schema-detail-page .schema-editor-tab .json-editor-section .editor-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.schema-detail-page .schema-editor-tab .json-editor-section .editor-header label {\n  font-size: 0.875rem;\n  font-weight: 600;\n}\n.schema-detail-page .schema-editor-tab .json-editor-section .json-textarea {\n  width: 100%;\n  font-family:\n    "JetBrains Mono",\n    "Fira Code",\n    monospace;\n  font-size: 0.8125rem;\n  line-height: 1.5;\n}\n.schema-detail-page .validation-rules-tab .rules-summary {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  background: var(--surface-50);\n  border-radius: 8px;\n  margin-bottom: 1rem;\n  font-size: 0.875rem;\n}\n.schema-detail-page .validation-rules-tab .rules-summary .sep {\n  color: var(--surface-400);\n}\n.schema-detail-page .validation-rules-tab .validation-result {\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border-radius: 8px;\n}\n.schema-detail-page .validation-rules-tab .validation-result.success {\n  background: var(--green-50);\n  border: 1px solid var(--green-300);\n  color: var(--green-700);\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 500;\n}\n.schema-detail-page .validation-rules-tab .validation-result.error {\n  background: var(--red-50);\n  border: 1px solid var(--red-300);\n}\n.schema-detail-page .validation-rules-tab .validation-result.error .result-header {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  color: var(--red-700);\n  font-weight: 600;\n  margin-bottom: 0.5rem;\n}\n.schema-detail-page .validation-rules-tab .validation-result.error .error-list {\n  margin: 0;\n  padding-left: 1.5rem;\n}\n.schema-detail-page .validation-rules-tab .validation-result.error .error-list li {\n  padding: 0.25rem 0;\n  color: var(--red-600);\n  font-size: 0.875rem;\n}\n.schema-detail-page .validation-rules-tab .rules-actions {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card {\n  border: 1px solid var(--surface-200);\n  border-radius: 8px;\n  margin-bottom: 0.5rem;\n  overflow: hidden;\n  transition: border-color 0.2s;\n}\n.schema-detail-page .validation-rules-tab .rule-card.expanded {\n  border-color: var(--primary-300);\n}\n.schema-detail-page .validation-rules-tab .rule-card.deprecated {\n  opacity: 0.7;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.75rem 1rem;\n  cursor: pointer;\n  background: var(--surface-50);\n  transition: background 0.15s;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header:hover {\n  background: var(--surface-100);\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left i {\n  font-size: 0.75rem;\n  color: var(--text-color-secondary);\n  width: 16px;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left .field-name {\n  font-family: monospace;\n  font-weight: 600;\n  font-size: 0.9rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left :deep(.type-tag) {\n  font-size: 0.7rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left .badge {\n  font-size: 0.6875rem;\n  padding: 0.125rem 0.5rem;\n  border-radius: 10px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.02em;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left .badge.required {\n  background: var(--red-100);\n  color: var(--red-700);\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left .badge.nullable {\n  background: var(--blue-100);\n  color: var(--blue-700);\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left .badge.deprecated {\n  background: var(--orange-100);\n  color: var(--orange-700);\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-left .badge.format {\n  background: var(--purple-100);\n  color: var(--purple-700);\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-header .rule-header-right .constraint-count {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body {\n  padding: 1rem;\n  border-top: 1px solid var(--surface-200);\n  background: white;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .rule-section {\n  margin-bottom: 1.25rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .rule-section:last-child {\n  margin-bottom: 0;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .rule-section h5 {\n  margin: 0 0 0.5rem 0;\n  font-size: 0.8125rem;\n  font-weight: 600;\n  color: var(--text-color-secondary);\n  text-transform: uppercase;\n  letter-spacing: 0.03em;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .flags-row {\n  display: flex;\n  gap: 1.5rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .flags-row .flag {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  font-size: 0.875rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .constraints-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  gap: 1rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .constraints-grid .constraint-field {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .constraints-grid .constraint-field.wide {\n  grid-column: span 2;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .constraints-grid .constraint-field label {\n  font-size: 0.75rem;\n  font-weight: 500;\n  color: var(--text-color-secondary);\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .enum-section .enum-chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n  min-height: 32px;\n  align-items: center;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .enum-section .enum-chips .no-enum {\n  font-size: 0.8125rem;\n  color: var(--text-color-secondary);\n  font-style: italic;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .enum-section .enum-add {\n  display: flex;\n  gap: 0.5rem;\n  max-width: 300px;\n}\n.schema-detail-page .validation-rules-tab .rule-card .rule-body .enum-section .enum-add input {\n  flex: 1;\n}\n/*# sourceMappingURL=schema-detail.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SchemaDetailComponent, { className: "SchemaDetailComponent", filePath: "src/app/pages/schemas/schema-detail/schema-detail.component.ts", lineNumber: 82 });
})();
export {
  SchemaDetailComponent
};
//# sourceMappingURL=chunk-A7TGWQXW.js.map
