// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Assertion module for sim development.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  /**
   * The actual assert method.
   * @public
   *
   * @param {boolean} predicate
   * @param {string} [message]
   */
  const assert = ( predicate, message ) => {
    if ( !predicate ) {

      // Use the default message if a message isn't provided
      const logMessage = message ? 'Assertion failed: ' + message : 'Assertion failed';

      throw new Error( logMessage );
    }
  }

  return assert;
} );