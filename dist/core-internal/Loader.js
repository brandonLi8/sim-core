// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.3 - MIT.
define(require=>{"use strict";const e=require("SIM_CORE/util/assert"),t=require("SIM_CORE/core-internal/DOMObject"),n=require("SIM_CORE/util/Vector"),o="http://www.w3.org/2000/svg",i="-50 ".repeat(2)+"100 ".repeat(2),s=46,r=70+10*Math.random(),a=100-r;function d(e){const t=e/100*Math.PI*2,o=Math.PI/2-t,i=new n(0,s).setAngle(o),r=new n(0,s),a=e>50?1:0;return["M",r.x,r.y,"A",s,s,0,a,0,i.x,i.y].join(" ")}return class extends t{constructor(c){c&&(e(Object.getPrototypeOf(c)===Object.prototype,`Extra prototype on Options: ${c}`),e(!c.style,"Loader sets options.style."),e(!c.type,"Loader sets options.type."),e(!c.innerHTML&&!c.text,"Loader should be a container with no inner content."),e(!c.id&&!c.class&&!c.attributes,"Loader sets options.attributes"),e(!c.children,"Loader sets children.")),c={id:"loader",style:{background:"rgb( 15, 15, 15 )",height:"100%",display:"flex","justify-content":"center"},...c};const l=new t({type:"circle",namespace:o,attributes:{fill:"none",r:s,cx:n.ZERO.x,cy:n.ZERO.y,"stroke-width":8,"shape-rendering":"geometricPrecision",stroke:"#A5A5A5"}}),m=new t({type:"path",namespace:o,style:{fill:"none","stroke-width":8,stroke:"#2974b2"},attributes:{"shape-rendering":"geometricPrecision"}}),w=new t({type:"svg",namespace:o,attributes:{viewBox:i,"shape-rendering":"geometricPrecision"},style:{width:"15%",maxWidth:180,minWidth:105,transform:"scale( 1, -1 )"}});c.children=[w.setChildren([l,m])],super(c);let u=0,h=0;const p=new Date,g=()=>{m.setAttribute("d",d(r)),function(e){"loading"!==document.readyState?e():document.addEventListener?document.addEventListener("DOMContentLoaded",e):document.attachEvent("onreadystatechange",(function(){"complete"===document.readyState&&e()}))}(()=>{h=99.99,window.setTimeout(()=>{m.setAttribute("d",d(h)),window.setTimeout(()=>this.dispose(),400)},Math.max((new Date-p)*a/100*(9*Math.random()),600))})};if(window.simImages){let t=0;const n=()=>{const o=window.simImages[t],i=o.image,s=o.src,a=new Date;i.element.onload=()=>{u++,e(function(e){return!!e.complete&&(void 0===e.naturalWidth||0!==e.naturalWidth)}(i.element),"error while loading image"),(()=>{const e=1/window.simImages.length*r;h+=e,m.setAttribute("d",d(h))})(),t++,u!==window.simImages.length?window.setTimeout(n,Math.max(4.5*(new Date-a),80)):g()},i.src=s};n()}else window.setTimeout(g,200)}}});