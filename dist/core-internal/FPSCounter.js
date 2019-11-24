// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.3 - MIT.
define(require=>{"use strict";const t=require("SIM_CORE/util/assert"),e=require("SIM_CORE/core-internal/DOMObject"),n=require("SIM_CORE/util/Util");return class extends e{constructor(e){e&&(t(!e.type,"FPSCounter sets options.type."),t(!e.innerHTML&&!e.text,"FPSCounter sets inner content."),t(!e.id&&!e.class&&!e.attributes,"FPSCounter sets options.attributes"),t(!e.children,"FPSCounter sets children."));const n={type:"div",style:{"z-index":99999999,position:"absolute",color:"red",left:"10px",top:"5px",fontSize:"17px",fontWeight:500,userSelect:"none"},id:"fps-counter"};(e={...n,...e}).style={...n.style,...e.style},super(e),this.requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.ieRequestAnimationFrame}get currentTime(){return n.convertFrom(Date.now(),n.MILLI)}update(t,e,i){const s=n.toFixed(n.convertTo(1/t,n.MILLI),2),o=n.toFixed(t,2),r=n.toFixed(e,2),u=n.toFixed(i,2);this.setText(`${o} FPS [ ↡${r} ↟${u} ] -- ~${s} ms/frame`)}start(){let t,e,n,i=this.currentTime,s=this.currentTime,o=0;const r=()=>{o++;const u=(t=this.currentTime)-i;i=t;const c=1/u;if(e=!e||c<e?c:e,n=!n||c>n?c:n,o%60==0){const i=t-s;s=t;const o=60/i;this.update(o,e,n),e=null,n=null}window.requestAnimationFrame(r)};window.requestAnimationFrame(r)}}});