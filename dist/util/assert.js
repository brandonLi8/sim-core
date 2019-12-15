// Copyright © 2019 Brandon Li. All rights reserved.

// Minified distribution version - sim-core 0.0.0-dev.22 - MIT.
define(require=>{"use strict";let e=!1;const s=function(e,s){if(!e)throw s=s?"Assertion failed: "+s:"Assertion failed",console.log(s),new Error(s)},n=(n,o)=>{e&&s(n,o)};return n.enableAssertions=()=>{console.log("Assertions Enabled..."),e=!0},n.always=(e,n)=>{s(e,n)},n});