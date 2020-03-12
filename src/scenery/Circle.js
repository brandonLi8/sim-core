// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Circle Node that displays a complete circular shape, with different radii.
 *
 * Circle inherits from Path to allow for different strokes, fills, shapeRenderings, etc.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Circle extends Path {

    /**
     * @param {number} radius - the radius (non-negative) of the circle
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. All options are
     *                             passed to the super class.
     */
    constructor( radius, options ) {
      assert( typeof radius === 'number' && radius >= 0, `invalid radius: ${ radius }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.attributes, 'Circle sets attributes' );

      // There are no options specific to Circle. Pass options to super class.
      super( null, options );

      // @private {number} - reference to the radius of the Circle.
      this._radius = radius;
      this.updateCircleShape();
    }

    /**
     * ES5 getters of the radius of the Circle. Traditional Accessors methods isn't included to reduce the memory
     * footprint.
     * @public
     *
     * @returns {number}
     */
    get radius() { return this._radius; }

    //----------------------------------------------------------------------------------------

    /**
     * Ensures that `set shape` is not called on a Circle.
     * @public
     *
     * @param {Shape} shape
     */
    set shape( shape ) { assert( false, 'Circle sets shape' ); }

    /**
     * Sets the radius of the Circle.
     * @public
     *
     * @param {number} radius
     */
    set radius( radius ) {
      if ( radius === this._radius ) return; // Exit if setting to the same 'radius'
      assert( typeof radius === 'number', `invalid radius: ${ radius }` );
      this._radius = radius;
      this.updateCircleShape();
    }

    /**
     * Generates a Circle shape and updates the shape of this Circle. Called when a property or the Circle that is
     * displayed is changed, resulting in a different Circle Shape.
     * @private
     */
    updateCircleShape() {
      // Must be a valid Circle Node.
      if ( this._radius ) {
        if ( this._radius === 0 ) super.shape = null; // Set to null shape if the radius is 0.

        // Generate the Circle Shape.
        super.shape = new Shape().arc( this.center, this._radius, 0, 2 * Math.PI - Util.EPSILON ).close();
      }
    }
  }

  // @protected @override {string[]} - setter names specific to Circle. See Path.MUTATOR_KEYS for documentation.
  Circle.MUTATOR_KEYS = Path.MUTATOR_KEYS;

  return Circle;
} );