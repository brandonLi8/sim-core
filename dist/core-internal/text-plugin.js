// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.5 - MIT.
define(require=>{"use strict";return{load(e,t,r,s){const n=t.toUrl(e),a=new XMLHttpRequest;a.open("GET",n,!0),a.onreadystatechange=()=>{4===a.readyState&&200===a.status?r(a.responseText):a.status>=399&&a.status<600&&(a.onreadystatechange=null,r.error(`Text Plugin error for "text!${e}".${(new Error).stack.replace("Error","")}`))},a.send(null)}}});