// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.18 - MIT.
define(require=>{"use strict";const t=require("SIM_CORE/util/assert"),e=require("SIM_CORE/core-internal/DOMObject"),i=require("SIM_CORE/util/Bounds"),s=require("SIM_CORE/scenery/Node"),d=new i(0,0,1024,618);return class extends e{constructor(e){t(!e||Object.getPrototypeOf(e)===Object.prototype,`invalid options: ${e}`),super(e={viewBounds:d.copy(),...e}),this.viewBounds=e.viewBounds}addChild(e){return t(e instanceof s,`invalid child: ${e}`),super.addChild(e)}layout(t,e){const i=Math.min(t/this.viewBounds.width,e/this.viewBounds.height),s=i*this.viewBounds.height,d=i*this.viewBounds.width;this.style.height=`${s}px`,this.style.width=`${d}px`;const n=t=>{t.forEach(t=>{t.layout(i),n(t.children)})};n(this.children)}enableDevBorder(){this.addStyle({border:"2px solid red"})}}});