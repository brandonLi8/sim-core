// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.22 - MIT.
define(require=>{"use strict";const t=require("SIM_CORE/util/assert"),e=require("SIM_CORE/scenery/SVGNode");return class extends e{constructor(e,o){t(!o||Object.getPrototypeOf(o)===Object.prototype,`Extra prototype on Options: ${o}`),super(o={type:"polygon",shapeRendering:"geometricPrecision",...o}),this.points=e}layout(t){super.layout(t);let e="";this.points.forEach(o=>{e+=`${o.x*t},${o.y*t} `}),this.addAttributes({points:e})}}});