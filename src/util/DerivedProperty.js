// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A DerivedProperty is computed Property based on other Properties.
 *
 * Note that the setters should not be called directly, so the
 * setters (set, reset and es5 setter) throw an error if used directly.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Util = require( 'SIM_CORE/util/Util' );

  class DerivedProperty extends Property {

    /**
     * @param {Property[]} dependencies - Properties that this Property's value is derived from
     * @param {function} derivation - function that derives this Property's value,
     *                                expects args in the same order as dependencies
     * @param {Object} [options] - see Property
     */
    constructor( dependencies, derivation, options ) {

      assert( Util.isArray( dependencies ), `invalid dependencies: ${ dependencies }` );
      assert( typeof derivation === 'function', `invalid derivation: ${ derivation }` );

      const initialValue = derivation( ...dependencies.map( property => property.value ) );
      super( initialValue, options );

      //----------------------------------------------------------------------------------------

      // @private {Property[]}
      this._dependencies = dependencies;

      // @private listener linked to all properties
      this._listener = () => {
        this.set( derivation( ...dependencies.map( property => property.value ) ) );
      };

      // DerivedProperty cannot be set, so we don't store the initial value to help prevent memory issues.
      this._initialValue = null;

      // When a dependency value changes, update the list of dependencies and call back to the callback
      dependencies.forEach( dependency => {
        dependency.lazyLink( this._listener );
      } );
    }

    // @public
    dispose() {

      // Unlink from dependent Properties
      this._dependencies.forEach( dependency => {
        dependency.unlink( this._listener );
      } );
      this._dependencies = null;
      this._listener = null;

      super.dispose();
    }

    /**
     * Override the mutators to provide an error message.  These should not be called directly,
     * the value should only be modified when the dependencies change.
     * @param value
     * @override
     * @public
     */
    set( value ) { assert( false, 'Cannot set values directly to a DerivedProperty, tried to set: ' + value ); }

    /**
     * Prevent the retrieval of the initial value, since we don't store it.
     * @public
     * @override
     * @returns {*}
     */
    getInitialValue() { assert( false, 'Cannot get the initial value of a DerivedProperty' ); }
  }

  return DerivedProperty;
} );