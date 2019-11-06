// Copyright © 2019 Brandon Li. All rights reserved.

/* eslint no-console: 0 */

/**
 * A basic Assertion module for sim development.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
define( require => {
  'use strict';

  /**
   * Assertion function.
   * @public
   *
   * @param {boolean} predicate - only throws and error if the not truthy.
   * @param {string} [message] - message to throw
   */
  const assert = function( predicate, message ) {
    if ( !predicate ) {

      // Use the default message if a message isn't provided
      message = message ? 'Assertion failed: ' + message : 'Assertion failed';

      console.log( message );
      throw new Error( message );
    }
  };

  return assert;
} );