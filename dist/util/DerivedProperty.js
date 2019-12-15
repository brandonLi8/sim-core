// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.22 - MIT.
define(require=>{"use strict";const e=require("SIM_CORE/util/assert"),t=require("SIM_CORE/util/Property"),i=require("SIM_CORE/util/Util");return class extends t{constructor(t,s,n){e(i.isArray(t),`invalid dependencies: ${t}`),e("function"==typeof s,`invalid derivation: ${s}`),super(s(...t.map(e=>e.value)),n),this._dependencies=t,this._isSettingInternally=!1,this._listener=()=>{super.set(s(...t.map(e=>e.value)))},this._initialValue=null,t.forEach(e=>{e.lazyLink(this._listener)})}dispose(){this._dependencies.forEach(e=>{e.unlink(this._listener)}),this._dependencies=null,this._listener=null,super.dispose()}set(t){e(!1,"Cannot set values directly to a DerivedProperty, tried to set: "+t)}getInitialValue(){e(!1,"Cannot get the initial value of a DerivedProperty")}}});