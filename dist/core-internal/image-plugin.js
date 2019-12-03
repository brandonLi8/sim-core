// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.6 - MIT.
define(require=>{"use strict";const e=require("SIM_CORE/util/assert"),s=require("SIM_CORE/core-internal/DOMObject");return{load(i,n,r,t){const a=n.toUrl(i),m=new s({type:"img"});m.element.onerror=s=>{e.always(!1,`invalid image src: ${m.element.src}`)},window.simImages||(window.simImages=[]),window.simImages.push({image:m,src:a}),r(m)}}});