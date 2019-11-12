// Copyright © 2019 Brandon Li. All rights reserved.
/* eslint no-console: 0 */

/**
 * A basic Assertion module for sim development.
 *
 * NOTE: assertions will only error with `?ea`. See `../Sim.js` for details.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // flags
  let assertionsEnabled = false;

  /**
   * Common assertion function.
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

  //----------------------------------------------------------------------------------------

  /**
   * Main Assertion Function (the export). Only throws an error if assertionsEnabled is true.
   * See `assert.enableAssertions()`.
   * @public
   *
   * @param {boolean} predicate - only throws and error if the not truthy.
   * @param {string} [message] - message to throw
   */
  const assert = ( predicate, message ) => {
    if ( assertionsEnabled ) assertFunction( predicate, message );
  };

  /**
   * Function that enables future assertions in assert. Without calling this, no errors from assertions
   * will be thrown.
   *
   * There is also no need to call this in sim-specific code. This will be enabled in `Sim.js` with the query parameter
   * `?ea` (enable assertions).
   * @public
   *
   * @param {boolean} predicate - only throws and error if the not truthy.
   * @param {string} [message] - message to throw
   */
  assert.enableAssertions = () => {
    console.log( 'Assertions Enabled...' );
    assertionsEnabled = true;
  };

  /**
   * Function that calls the assertions function. This will error even without `?ea`. This is not recommended for use.
   * @public
   *
   * @param {boolean} predicate - only throws and error if the not truthy.
   * @param {string} [message] - message to throw
   */
  assert.always = ( predicate, message ) => {
    assertFunction( predicate, message );
  };

  return assert;
} );