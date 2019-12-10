// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.18 - MIT.
define(require=>{"use strict";const t=require("SIM_CORE/util/assert"),i=require("SIM_CORE/util/Vector"),e=require("SIM_CORE/util/Util");class n{constructor(i,e,n,r){t("number"==typeof i,`invalid minX: ${i}`),t("number"==typeof e,`invalid minY: ${e}`),t("number"==typeof n,`invalid maxX: ${n}`),t("number"==typeof r,`invalid maxY: ${r}`),this.minX=i,this.minY=e,this.maxX=n,this.maxY=r}toString(){return`Bounds[ min:( ${this.minX}, ${this.minY} ), max:( ${this.minY}, ${this.maxY}) ]`}equals(t){return this.minX===t.minX&&this.minY===t.minY&&this.maxX===t.maxX&&this.maxY===t.maxY}equalsEpsilon(t,i=e.EPSILON){return Math.abs(this.minX-t.minX)<=i&&Math.abs(this.minY-t.minY)<=i&&Math.abs(this.maxX-t.maxX)<=i&&Math.abs(this.maxY-t.maxY)<=i}getMinX(){return this.minX}getMinY(){return this.minY}getMaxX(){return this.maxX}getMaxY(){return this.maxY}getWidth(){return this.maxX-this.minX}getHeight(){return this.maxY-this.minY}get width(){return this.getWidth()}get height(){return this.getHeight()}getLeft(){return this.minX}getTop(){return this.maxY}getRight(){return this.maxX}getBottom(){return this.minY}get left(){return this.getLeft()}get top(){return this.getTop()}get right(){return this.getRight()}get bottom(){return this.getBottom()}getLeftTop(){return new i(this.minX,this.maxY)}getCenterTop(){return new i(this.getCenterX(),this.maxY)}getRightTop(){return new i(this.maxX,this.maxY)}getLeftCenter(){return new i(this.minX,this.getCenterY())}getRightCenter(){return new i(this.maxX,this.getCenterY())}getLeftBottom(){return new i(this.minX,this.minY)}getCenterBottom(){return new i(this.getCenterX(),this.minY)}getRightBottom(){return new i(this.maxX,this.minY)}getCenter(){return new i(this.getCenterX(),this.getCenterY())}get leftTop(){return this.getLeftTop()}get centerTop(){return this.getCenterTop()}get rightTop(){return this.getRightTop()}get leftCenter(){return this.getLeftCenter()}get rightCenter(){return this.getRightCenter()}get leftBottom(){return this.getLeftBottom()}get centerBottom(){return this.getCenterBottom()}get rightBottom(){return this.getRightBottom()}get center(){return this.getCenter()}getCenterX(){return(this.minX+this.maxX)/2}getCenterY(){return(this.minY+this.maxY)/2}get centerX(){return this.getCenterX()}get centerY(){return this.getCenterY()}getArea(){return this.getWidth()*this.getHeight()}get area(){return this.getArea()}isFinite(){return[this.minX,this.minY,this.maxX,this.maxY].every(t=>isFinite(t))}containsCoordinates(i,e){return t("number"==typeof i,`invalid x: ${i}`),t("number"==typeof e,`invalid y: ${e}`),this.minX<=i&&i<=this.maxX&&this.minY<=e&&e<=this.maxY}containsPoint(e){return t(e instanceof i,`invalid point: ${e}`),this.containsCoordinates(e.x,e.y)}closestPointTo(e){if(t(e instanceof i,`invalid location: ${e}`),this.containsPoint(e))return e.copy();{const t=Math.max(Math.min(e.x,this.maxX),this.minX),n=Math.max(Math.min(e.y,this.maxY),this.minY);return new i(t,n)}}containsBounds(i){return t(i instanceof n,`invalid bounds: ${i}`),this.minX<=i.minX&&this.maxX>=i.maxX&&this.minY<=i.minY&&this.maxY>=i.maxY}intersectsBounds(i){t(i instanceof n,`invalid bounds: ${i}`);const e=Math.max(this.minX,i.minX),r=Math.max(this.minY,i.minY),m=Math.min(this.maxX,i.maxX),s=Math.min(this.maxY,i.maxY);return m-e>=0&&s-r>=0}copy(){return new n(this.minX,this.minY,this.maxX,this.maxY)}union(i){return t(i instanceof n,`invalid bounds: ${i}`),new n(Math.min(this.minX,i.minX),Math.min(this.minY,i.minY),Math.max(this.maxX,i.maxX),Math.max(this.maxY,i.maxY))}intersection(i){return t(i instanceof n,`invalid bounds: ${i}`),new n(Math.max(this.minX,i.minX),Math.max(this.minY,i.minY),Math.min(this.maxX,i.maxX),Math.min(this.maxY,i.maxY))}setAll(i,e,n,r){return t("number"==typeof i,`invalid minX: ${i}`),t("number"==typeof e,`invalid minY: ${e}`),t("number"==typeof n,`invalid maxX: ${n}`),t("number"==typeof r,`invalid maxY: ${r}`),this.minX=i,this.minY=e,this.maxX=n,this.maxY=r,this}set(i){return t(i instanceof n,`invalid bounds: ${i}`),this.setAll(i.minX,i.minY,i.maxX,i.maxY)}roundSymmetric(){return this.setAll(e.roundSymmetric(this.minX),e.roundSymmetric(this.minY),e.roundSymmetric(this.maxX),e.roundSymmetric(this.maxY))}dilate(i){return t("number"==typeof i,`invalid d: ${i}`),this.setMinMax(this.minX-i,this.minY-i,this.maxX+i,this.maxY+i)}erode(t){return this.dilate(-t)}expand(i,e,r,m){return t("number"==typeof i,`invalid left: ${i}`),t("number"==typeof e,`invalid top: ${e}`),t("number"==typeof r,`invalid right: ${r}`),t("number"==typeof m,`invalid bottom: ${m}`),new n(this.minX-i,this.minY-e,this.maxX+r,this.maxY+m)}shift(i,e){return t("number"==typeof i,`invalid x: ${i}`),t("number"==typeof e,`invalid y: ${e}`),this.setMinMax(this.minX+i,this.minY+e,this.maxX+i,this.maxY+e)}}return n.rect=(t,i,e,r)=>new n(t,i,t+e,i+r),n.ZERO=new n(0,0,0,0),n});