import {
  I18nService
} from "./chunk-YFC4IMTE.js";
import {
  Pipe,
  inject,
  setClassMetadata,
  ɵɵdefinePipe
} from "./chunk-56FG4FZN.js";

// src/app/core/i18n/i18n.pipe.ts
var I18nPipe = class _I18nPipe {
  i18n = inject(I18nService);
  transform(key, params) {
    this.i18n.translations();
    return this.i18n.translate(key, params);
  }
  static \u0275fac = function I18nPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _I18nPipe)();
  };
  static \u0275pipe = /* @__PURE__ */ \u0275\u0275definePipe({ name: "i18n", type: _I18nPipe, pure: false });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(I18nPipe, [{
    type: Pipe,
    args: [{
      name: "i18n",
      standalone: true,
      pure: false
    }]
  }], null, null);
})();

export {
  I18nPipe
};
//# sourceMappingURL=chunk-KSWXOF5D.js.map
