// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.18 - MIT.
define(require=>{"use strict";const e=require("SIM_CORE/util/assert"),s=require("SIM_CORE/scenery/Node");return{load(i,n,r,m){const t=n.toUrl(i),a=new s({type:"img"});a.element.onerror=s=>{e.always(!1,`invalid image src: ${a.element.src}`)},window.simImages||(window.simImages=[]),window.simImages.push({image:a,src:t}),r(a)}}});