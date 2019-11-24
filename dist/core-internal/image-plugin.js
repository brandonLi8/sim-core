// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.3 - MIT.
define(require=>{"use strict";const e=require("SIM_CORE/util/assert").always,s=require("SIM_CORE/core-internal/DOMObject");return{load:(i,n,r,t)=>{const a=i.substring(i.indexOf("/")),m=n.toUrl(i.substring(0,i.indexOf("/")))+"/../images"+a,o=new s({type:"img"});o.element.onerror=s=>{e(!1,`invalid image src: ${o.element.src}`)},window.simImages||(window.simImages=[]),window.simImages.push({image:o,src:m}),r(o)}}});