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

  return {

    /**
     * Function that is called to load the raw text when the text plugin is used.
     * For more documentation: see https://requirejs.org/docs/plugins.html#api.
     * @public
     *
     * @param {string} name - the name of the image resource to load. For example, 'text!bar' would have the name 'bar'
     * @param {function} parentRequire - local require function to load other modules. Contains many utilities.
     * @param {function} onload - function to call with the return value of the load.
     * @param {object} config - the requirejs configuration object
     */
    load( name, parentRequire, onload, config ) {

      // Reference the name as the true path to the raw text file.
      const textPath = parentRequire.toUrl( name )

      // Create an HTTP Request via XMLHttpRequest for the given textPath.
      const HTTPRequest = new XMLHttpRequest();

      // Create a GET request to the textPath to access the raw text.
      // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET for background.
      // See https://stackoverflow.com/questions/247483/http-get-request-in-javascript for implementation background.
      HTTPRequest.open( 'GET', textPath, true ); // true for asynchronous request.

      // Listen to when the asynchronous HTTP request status changes.
      // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/onreadystatechange for context.
      HTTPRequest.onreadystatechange = () => {

        // Use status codes to check if the request was successful or not.
        // For full documentation on all status codes, see https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html

        // If the request was successful, load the raw text.
        if ( HTTPRequest.readyState === 4 && HTTPRequest.status === 200 ) {
          onload( HTTPRequest.responseText );
        }
        else if ( HTTPRequest.status >= 399 && HTTPRequest.status < 600 ) {

          // An unsuccessful request. Dereference this function to a null pointer so that the asynchronous HTTPRequest
          // doesn't call this function any more.
          HTTPRequest.onreadystatechange = null;

          // Tell requirejs that a error has occurred and provide a stack trace.
          onload.error( `Text Plugin error for "text!${ name }".${ new Error().stack.replace( 'Error', '' ) }` );
        }
      };
      HTTPRequest.send( null );
    }
  };
} );