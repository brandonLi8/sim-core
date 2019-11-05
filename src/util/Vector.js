// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Vector utility class, represented as a <x, y>. Vector can also represent a coordinate point (x, y).
 *
 * For an example of the usage, see `../../tests/util/VectorTests.js`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );

  class Vector {
    /**
     * @param {number} x - x value
     * @param {number} y - y value
     * @param {boolean=false} [isImmutable] - determines if the Vector is immutable or not.
     */
    constructor( x, y, isImmutable = false ) {
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );
      assert( typeof isImmutable === 'boolean', `invalid isImmutable: ${ isImmutable }` );

      // @public (read-only) {number}
      this.x = x;
      this.y = y;

      // @protected {boolean}
      this.isImmutable = isImmutable;
    }
 
    /**
     * The distance between this Vector (treated as a point) and a (x, y) coordinate pair.
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    distanceToXY( x, y ) {
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );
      return Math.sqrt( Math.pow( this.x - x, 2 ) + Math.pow( this.y - y, 2 ) );
    }

    /**
     * Distance between this Vector (treated as a point) to another Vector (treated as a point).
     * @public
     *
     * @param {Vector} point
     * @returns {number}
     */
    distanceTo( point ) {
      assert( point instanceof Vector, `invalid point: ${ point }` );
      return this.distanceToXY( point.x, point.y );
    }

    /**
     * Checks for exact equality between this Vector to another Vector.
     * @public
     *
     * @param {Vector} vector
     * @returns {boolean}
     */
    equals( vector ) {
      assert( vector instanceof Vector, `invalid vector: ${vector}` );
      return this.x === vector.x && this.y === vector.y;
    }

    /**
     * Checks for approximate equality between this Vector and another Vector.
     * @public
     *
     * @param {Vector} other
     * @param {number} [epsilon]
     * @returns {boolean} - if the other vector is within epsilon distance
     */
    equalsEpsilon( other, epsilon=0.00005 ) {
      assert( other instanceof Vector && typeof epsilon === 'number' );
      return Math.max( Math.abs( this.x - other.x ), Math.abs( this.y - other.y ) ) <= epsilon;
    }

    /**
     * Checks if the Vector is finite
     * @public
     *
     * @returns {boolean}
     */
    isFinite() {
      return isFinite( this.x ) && isFinite( this.y );
    }

    /**
     * Creates a copy of this Vector.
     * @public
     *
     * @param {boolean = false} [isCopyImmutable] determines if the copy is immutable or not
     * @returns {Vector2}
     */
    copy( isCopyImmutable = false ) {
      return new Vector( this.x, this.y, isCopyImmutable );
    }

    /*---------------------------------------------------------------------------*
     * Mutators
     *---------------------------------------------------------------------------*/

    /**
     * Sets the x value, returning this.
     * @public
     *
     * @param {number} x
     * @returns {Vector} - for chaining
     */
    setX( x ) {
      assert( this.isImmutable === false, 'cannot mutate a mutable' );
      assert( typeof x === 'number', `invalid x: ${ x }` );
      this.x = x;
      return this;
    }

    /**
     * Sets the y value, returning this.
     * @public
     *
     * @param {number} y
     * @returns {Vector} - for chaining
     */
    setY( y ) {
      assert( this.isImmutable === false, 'cannot mutate a mutable' );
      assert( typeof y === 'number', `invalid y: ${y}` );
      this.y = y;
      return this;
    }

    /**
     * Sets the values of this Vector to another Vector. Does not change immutability.
     * @public
     *
     * @param {Vector} vector
     * @returns {Vector} - for chaining
     */
    set( vector ) {
      assert( this.isImmutable === false, 'cannot mutate a mutable' );
      return this.setX( vector.x ).setY( vector.y );
    }
  }

  //========================================================================================
  // Static References

  // @public
  Vector.ZERO = new Vector( 0, 0, true );

  return Vector;
} );