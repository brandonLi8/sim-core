// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.18 - MIT.
define(require=>{"use strict";const t=require("SIM_CORE/util/assert"),e=require("SIM_CORE/scenery/SVGNode");return class extends e{constructor(e,s,r){t(!r||Object.getPrototypeOf(r)===Object.prototype,`Extra prototype on Options: ${r}`),super(r={type:"line",...r}),this.start=e,this.end=s}layout(t){super.layout(t),this.addAttributes({x1:`${t*this.start.x}px`,y1:`${t*this.start.y}px`,x2:`${t*this.end.x}px`,y2:`${t*this.end.y}px`})}}});