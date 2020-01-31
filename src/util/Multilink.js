// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Multilink is a utility class for linking to multiple Properties with the same callback functionality. It is
 * recommended to read the documentation of `SIM_CORE/util/Property` before working with this class.
 *
 * A Multilink is constructed with an array of Properties called the dependencies, and a callback function.
 * When any of the Properties in the dependencies change, the callback function is called, with the values of the
 * dependencies passed in (in the same order).
 *
 * A Multilink is not a sub-type of Property and does not contain a value. However, it does contain internal links
 * to the dependencies. If the Multilink is no longer in use, make sure to call the dispose() method to unlink
 * the internal listener to avoid a memory leak.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Multilink {

    /**
     * @param {Property[]} dependencies - array of Properties to link to.
     * @param {function} callback - function called when any of the Properties in dependencies change. The values of the
     *                              dependencies are passed (in the same order) to this function.
     * @param {boolean} [lazy=false] - Optional parameter that can be set to true if this should be a lazy Multilink.
     */
    constructor( dependencies, callback, lazy = false ) {
      assert( Util.isArray( dependencies ) && dependencies.every( dependency => dependency instanceof Property ),
        `invalid dependencies: ${ dependencies }` );
      assert( typeof callback === 'function', `invalid callback: ${ callback }` );
      assert( typeof lazy === 'boolean', `invalid lazy: ${ lazy }` );

      //----------------------------------------------------------------------------------------

      // @private {Property[]} - reference to the dependencies array.
      this._dependencies = dependencies;

      // @private {boolean} - indicates whether the Multilink has been disposed. See dispose() for more documentation.
      this._isDisposed = false;

      // @private {function} - listener linked to all the dependencies that calls the callback function. The values of
      //                       the dependencies are passed to the callback function in the same order.
      this._listener = () => {
        callback( ...this._dependencies.map( property => property.value ) );
      };

      // Lazily link the listener to each dependency for now. When any of the dependencies change, the
      // callback should be called.
      dependencies.forEach( dependency => {
        dependency.lazyLink( this._listener );
      } );

      // If the Multilink isn't lazy, call back the callback function for the initial call back.
      if ( !lazy ) this._listener();
    }

    /**
     * Disposes the Multilink and ensures that it can be garbage collected.
     * @public
     *
     * @returns {Multilink} - for chaining.
     */
    dispose() {
      assert( this._isDisposed === false, 'A Multilink cannot be disposed twice.' );

      // Unlink the internal listener from each Property in the dependencies array.
      this._dependencies.forEach( dependency => {
        dependency.unlink( this._listener );
      } );

      // Reset references
      this._dependencies = null;
      this._listener = null;

      // Indicate that this Multilink has been disposed.
      this._isDisposed = true;
    }
  }

  /**
   * Returns a new Multilink object that is lazily constructed.
   * @public
   *
   * @param {Property[]} dependencies - array of Properties to link to.
   * @param {function} callback - function called when any of the Properties in dependencies change. The values of the
   *                              dependencies are passed (in the same order) to this function.
   * @returns {Multilink}
   */
  Multilink.lazy = ( dependencies, callback ) => new Multilink( dependencies, callback, true );

  return Multilink;
} );