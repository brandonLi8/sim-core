// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Assertion module (as a preload) for sim development.
 *
 * To use this module:
 *   1. Load this script in `index.html` FIRST as a preload.
 *   2. Call `window.enableAssert()`. For sim development, it's recommended to only call this with `?ea`.
 *   3. Use assert with `assert && assert( predicate, [message] )`
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

( () => {
  'use strict';

  if ( !window ) { throw new Error( 'window not defined' ); }

  /**
   * The actual assert method.
   * @public
   *
   * @param {boolean} predicate
   * @param {string} [message]
   */
  const assert = ( predicate, message ) => {
    if ( !predicate ) {

      // IE specific work-around to catch the entire stack.
      if ( window.navigator && window.navigator.appName === 'Microsoft Internet Explorer' ) {
        try { throw new Error(); }
        catch( error ) { message = `${ message }, stack=${ error.stack }` }
      }

      // Use the default message if a message isn't provided
      const logMessage = message ? 'Assertion failed: ' + message : 'Assertion failed';

      throw new Error( logMessage );
    }
  }

  //----------------------------------------------------------------------------------------
  // Disable assertions unless window.enableAssert() is called.

  window.assert = null;

  window.enableAssert = () => {

    // enable assertions on the global scope
    window.assert = assert;
    console.log( 'Assertions Enabled...' );
  }
} )();