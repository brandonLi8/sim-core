// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Multilink is an instance that can be used to link to multiple properties. It is given an array of Properties and a
 * callback function. When any of the Properties change, all values are passed in the same order as the array.
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
     * @param {Property[]} dependencies - array of Properties to listen to
     * @param {function} callback - function that expects args in the same order as dependencies
     */
    constructor( dependencies, callback ) {

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
      this._listener();
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

  return Multilink;
} );