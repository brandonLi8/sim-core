// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A basic Assertion module for sim development.
 *
 * NOTE: assertions will only throw errors with the query parameter `?ea`. See `../Sim.js` for more details.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  /**
   * Common assertion function.
   * @public
   *
   * @param {boolean} predicate - only throws an error if not truthy.
   * @param {string} [message] - message to throw
   */
  const assertFunction = function( predicate, message ) {
    if ( !predicate ) {

      // Use the default message if a message isn't provided
      message = message ? 'Assertion failed: ' + message : 'Assertion failed';

      typeof process === 'undefined' && console.log( message ); // eslint-disable-line no-console
      throw new Error( message );
    }
  };

  //----------------------------------------------------------------------------------------

  /**
   * Main Assertion Function (the export). Only throws an error if assert.enabled is true.
   * See `assert.enableAssertions()`.
   * @public
   *
   * @param {boolean} predicate - only throws an error if not truthy.
   * @param {string} [message] - message to throw
   */
  function assert( predicate, message ) {
    if ( assert.enabled ) assertFunction( predicate, message );
  }

  // Flag that indicates if assertions have been enabled.
  assert.enabled = false;

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
    console.log( 'Assertions Enabled...' ); // eslint-disable-line no-console
    assert.enabled = true;
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