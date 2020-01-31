// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A DerivedProperty is a sub-type of Property. It's value is computed based on other Properties, called
 * the dependencies. It's value will change when any of the dependencies change based on a derivation function that
 * returns a new derived value. The values of the dependencies will be passed (in the same order) to the
 * derivation function.
 *
 * A DerivedProperty cannot be directly mutated. Setters should not be called directly, and the mutators will throw an
 * error if used directly. If the DerivedProperty is no longer in use, make sure to call the dispose() method to unlink
 * the internal Multilink listener to avoid a memory leak.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Multilink = require( 'SIM_CORE/util/Multilink' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Util = require( 'SIM_CORE/util/Util' );

  class DerivedProperty extends Property {

    /**
     * @param {Property[]} dependencies - Properties that this Property's value is derived from.
     * @param {function} derivation - function that derives this Property's value. The values of the dependencies will
     *                                be passed (in the same order) to this function. This function should return
     *                                the newly derived value of the Property.
     * @param {Object} [options] - passed to the super class.
     */
    constructor( dependencies, derivation, options ) {
      assert( Util.isArray( dependencies ) && dependencies.every( dependency => dependency instanceof Property ),
        `invalid dependencies: ${ dependencies }` );
      assert( typeof derivation === 'function', `invalid derivation: ${ derivation }` );

      // Derive the initial value of the Property based on what the derivation initially returns. The values of the
      // dependencies are passed to the derivation in the same order. The initial value must be derived here instead
      // of in the general Multilink for type validation issues.
      const initialValue = derivation( ...dependencies.map( property => property.value ) );

      super( initialValue, options );

      //----------------------------------------------------------------------------------------

      // @private {Multilink} - Create a multilink of the dependencies with a listener that sets the value of
      //                        this Derived Property based on what the derivation fucntion returns. The values of the
      //                        dependencies are passed to the derivation function in the same order.
      //
      //                        A lazy Multilink is used since the value is already set to the initial derivation.
      //                        When any of the dependencies change, the derivation should be called and the value of
      //                        the DerivedProperty should be set.
      this._dependenciesMultilink = Multilink.lazy( dependencies, ( ...args ) => {

        // Use super.set since this.set throws an error. See set() or the comment at the top of the file for more doc.
        super.set( derivation( ...args ) );
      } )

      // DerivedProperty cannot be mutated, so we don't store the initial value to help prevent memory issues.
      this._initialValue = null;
    }

    /**
     * Disposes the DerivedProperty and ensures that it can be garbage collected.
     * @override
     * @public
     *
     * @returns {Property} - for chaining.
     */
    dispose() {

      // Dispose the dependenciesMultlink for garbage collection.
      this._dependenciesMultilink.dispose();
      return super.dispose();
    }

    /**
     * DerivedProperties cannot be mutated. Overridden to throw an error if called.
     * @override
     * @public
     *
     * @param {*} value
     */
    set( value ) { assert( false, 'Cannot set values directly to a DerivedProperty, tried to set: ' + value ); }

    /**
     * Prevent the retrieval of the initial value, since it isn't stored.
     * @override
     * @public
     */
    getInitialValue() { assert( false, 'Cannot get the initial value of a DerivedProperty' ); }
  }

  return DerivedProperty;
} );