// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Multilink is a utility class for linking to multiple Properties with the same callback functionality.
 *
 * A Multilink is constructed with an array of Properties called the dependencies, and a callback function.
 * When any of the Properties in the dependencies change, the callback function is called, with the values of the
 * dependencies passed in (in the same order).
 *
 * A Multilink is not a sub-type of Property and does not contain a value. However, it does contain internal links
 * to the dependencies. If the Multilink is no longer in use, make sure to call the dispose() method to unlink
 * the internal listener to avoid a memory leak.

 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Multilink {

    /**
     * @param {Property[]} dependencies - array of Properties to listen to
     * @param {function} callback - function that expects args in the same order as dependencies
     * @param {boolean} [lazy] Optional parameter that can be set to true if this should be a lazy multilink.
     */
    constructor( dependencies, callback, lazy ) {

      assert( Util.isArray( dependencies ), `invalid dependencies: ${ dependencies }` );
      assert( typeof callback === 'function', `invalid callback: ${ callback }` );

      //----------------------------------------------------------------------------------------

      // @private {Property[]}
      this._dependencies = dependencies;

      // @private - whether the Multilink has been disposed
      this.isDisposed = false;

      // @private listener linked to all properties
      this._listener = () => {
        if ( !this.isDisposed ) {
          callback( ...this._dependencies.map( property => property.value ) );
        }
      };

      // When a dependency value changes, update the list of dependencies and call back to the callback
      dependencies.forEach( dependency => {
        dependency.lazyLink( this._listener );
      } );

      // Initial call back, only once
      if ( !lazy ) this._listener();
    }

    // @public
    dispose() {
      assert( this.isDisposed === false, 'A Multilink cannot be disposed twice.' );

      this._dependencies.forEach( dependency => {
        dependency.unlink( this._listener );
      } );
      this._dependencies = null;
      this._listener = null;
      this.isDisposed = true;
    }
  }


  Multilink.lazy = ( dependencies, callback ) => new Multilink( dependencies, callback, true );

  return Multilink;
} );