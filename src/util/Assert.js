// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Assertion module for front-end development.
 *
 * IMPORTANT: Never call Assert.assert() (from this file) directly.
 *            Instead, to use this module:
 *                1. Check if the query parameter `?ea` (enable assertions) exists.
 *                2. If the query parameter exists, declare window.assert to call Assert.assert().
 *                   See '../Sim.js' for an example.
 *                3. Use assert with `assert && assert( predicate, [message] )`, which will only assert with `?ea`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  class Assert {

    /**
     * @public
     * @static
     *
     * @param {boolean} predicate
     * @param {string} [message]
     */
    static assert( predicate, message ){
      if ( !predicate ) {

        // IE specific work-around to catch the entire stack.
        if ( window.navigator && window.navigator.appName === 'Microsoft Internet Explorer' ) {
          try { throw new Error(); }
          catch( e ) { message = message + ', stack=\n' + e.stack; }
        }


        // Use the default message is a message isn't provided
        const logMessage = message ? 'Assertion failed: ' + message : 'Assertion failed';

        throw new Error( logMessage );
      }
    }
  }

  return Assert;
} );