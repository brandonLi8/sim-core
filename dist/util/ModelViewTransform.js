// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.18 - MIT.
define(require=>{"use strict";const e=require("SIM_CORE/util/assert"),i=require("SIM_CORE/util/Bounds"),o=require("SIM_CORE/util/Vector"),t=(e,i)=>new o(e,i);return class{constructor(o,t){e(o instanceof i&&o.area>0,`invalid modelBounds: ${o}`),e(t instanceof i&&t.area>0,`invalid viewBounds: ${t}`),this.modelBounds=o,this.viewBounds=t,this.xViewToModelScale=t.width/o.width,this.yViewToModelScale=-t.height/o.height,this.xViewOffset=t.minX-this.xViewToModelScale*o.minX,this.xModelOffset=o.minX-t.minX/this.xViewToModelScale,this.yViewOffset=t.minY-this.yViewToModelScale*o.maxY,this.yModelOffset=o.minY-t.maxY/this.yViewToModelScale}modelToViewX(e){return this.xViewToModelScale*e+this.xViewOffset}modelToViewY(e){return this.yViewToModelScale*e+this.yViewOffset}modelToViewXY(e,i){return t(this.modelToViewX(e),this.modelToViewY(i))}modelToViewDeltaX(e){return this.xViewToModelScale*e}modelToViewDeltaY(e){return this.yViewToModelScale*e}modelToViewDelta(e){return t(this.modelToViewDeltaX(e.x),this.modelToViewDeltaY(e.y))}modelToViewPoint(e){return t(this.modelToViewX(e.x),this.modelToViewY(e.y))}modelToViewBounds(e){return new i(this.modelToViewX(e.minX),this.modelToViewY(e.maxY),this.modelToViewX(e.maxX),this.modelToViewY(e.minY))}viewToModelX(e){return e/this.xViewToModelScale+this.xModelOffset}viewToModelY(e){return e/this.yViewToModelScale+this.yModelOffset}viewToModelXY(e,i){return t(this.viewToModelX(e),this.viewToModelY(i))}viewToModelDeltaX(e){return e/this.xViewToModelScale}viewToModelDeltaY(e){return e/this.yViewToModelScale}viewToModelDelta(e){return t(this.viewToModelDeltaX(e.x),this.viewToModelDeltaY(e.y))}viewToModelPoint(e){return t(this.viewToModelX(e.x),this.viewToModelY(e.y))}viewToModelBounds(e){return new i(this.viewToModelX(e.minX),this.viewToModelY(e.maxY),this.viewToModelX(e.maxX),this.viewToModelY(e.minY))}}});