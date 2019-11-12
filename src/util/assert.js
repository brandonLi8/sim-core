// Copyright © 2019 Brandon Li. All rights reserved.

/* eslint no-console: 0 */

/**
 * A basic Assertion module for sim development.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
define( require => {
  'use strict';

  // flags
  let assertionsEnabled = false;

  /**
   * Assertion function.
   * @public
   *
   * @param {boolean} predicate - only throws and error if the not truthy.
   * @param {string} [message] - message to throw
   */
  const assertFunction = function( predicate, message ) {
    if ( !predicate ) {

      // Use the default message if a message isn't provided
      message = message ? 'Assertion failed: ' + message : 'Assertion failed';

      console.log( message );
      throw new Error( message );
    }
  };

  const assert = ( predicate, message ) => {
    if ( assertionsEnabled ) assertFunction( predicate, message );
  };

  assert.enableAssertions = () => {
    console.log( 'Assertions Enabled...' );
    assertionsEnabled = true;
  };

  assert.always = ( ...args ) => {
    assertFunction( ...args );
  }

  return assert;
} );