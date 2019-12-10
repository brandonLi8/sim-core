// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.18 - MIT.
define(require=>{"use strict";const t=require("SIM_CORE/util/assert"),e=require("SIM_CORE/scenery/SVGNode"),r=require("SIM_CORE/util/Vector");return class extends e{constructor(e){t(!e||Object.getPrototypeOf(e)===Object.prototype,`Extra prototype on Options: ${e}`),super(e={type:"circle",namespace:"http://www.w3.org/2000/svg",radius:0,center:r.ZERO,...e}),this.radius=e.radius,this.addAttributes({r:e.radius,cx:e.center.x,cy:e.center.y})}layout(t){super.layout(t),this.addAttributes({cx:`${t*this._center.x}px`,cy:`${t*this._center.y}px`,r:`${t*this.radius}px`})}}});