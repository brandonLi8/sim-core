// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific text plugin for requirejs that allows for the dynamic loading of raw text, parsed into a string.
 *
 * ## Usage
 *   (1) In your requirejs config, add this file as a path.
 *       ```
 *       requirejs.config( {
 *         paths: {
 *
 *           // plugins
 *           text: '../node_modules/sim-core/src/core-internal/text-plugin',
 *           ...
 *         }
 *       } );
 *       ```
 *   (2) Use the plugin syntax. For example: `const text = require( 'text!example/exam' )`. The result is parsed
 *       into a string.
 *
 * While code comments attempt to describe the implementation clearly, fully understanding it may require some
 * general background. Some useful references include:
 *   - see https://requirejs.org/docs/plugins.html#api.
 *   - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
 *   - https://stackoverflow.com/questions/247483/http-get-request-in-javascript
 *   - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/onreadystatechange
 *   - https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
define( require => {
  'use strict';

} );