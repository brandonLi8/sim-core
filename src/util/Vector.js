// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Vector utility class, represented as a <x, y>. Vector can also represent a coordinate point (x, y).
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
     * Gets the magnitude of this Vector.
     * @public
     *
     * @returns {number}
     */
    getMagnitude() {
      return Math.sqrt( this.x * this.x + this.y * this.y );
    }
    get magnitude() {
      return this.getMagnitude();
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
      assert( vector instanceof Vector, `invalid vector: ${ vector }` );
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

    /**
     * Debugging string for the Vector.
     * @public
     *
     * @returns {string}
     */
    toString() {
      return `<${ this.x }, ${ this.y }>`;
    }

    //========================================================================================
    // Mutators
    //========================================================================================

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
      assert( typeof y === 'number', `invalid y: ${ y }` );
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
      assert( vector instanceof Vector, `invalid vector: ${ vector }` );
      return this.setX( vector.x ).setY( vector.y );
    }

    /**
     * Multiplies this Vector by a scalar. To NOT mutate this Vector, call copy() and multiply that Vector.
     * @public
     *
     * @param {number} scalar
     * @returns {Vector} - for chaining
     */
    multiply( scalar ) {
      assert( this.isImmutable === false, 'cannot mutate a mutable' );
      assert( typeof scalar === 'number', `invalid scalar: ${ scalar }` );
      return this.setX( this.x * scalar ).setY( this.y * scalar );
    }

    /**
     * Divides this Vector by a scalar. To NOT mutate this Vector, call copy() and divide that Vector.
     * @public
     *
     * @param {number} scalar
     * @returns {Vector} - for chaining
     */
    divide( scalar ) {
      return this.multiply( 1 / scalar );
    }

    /**
     * Adds (x, y) to this vector. To NOT mutate this Vector, call copy() and add to that Vector.
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Vector} - for chaining
     */
    addXY( x, y ) {
      assert( this.isImmutable === false, 'cannot mutate a mutable' );
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );

      return this.setX( this.x + x ).setY( this.y + y );
    }

    /**
     * Adds another Vector to this vector. To NOT mutate this Vector, call copy() and add to that Vector.
     * @public
     *
     * @param {Vector} vector
     * @returns {Vector} - for chaining
     */
    add( vector ) {
      assert( vector instanceof Vector, `invalid vector: ${ vector }` );
      return this.addXY( vector.x, vector.y );
    }

    /**
     * Subtracts (x, y) to this vector. To NOT mutate this Vector, call copy() and subtract to that Vector.
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Vector} - for chaining
     */
    subtractXY( x, y ) {
      assert( this.isImmutable === false, 'cannot mutate a mutable' );
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );

      return this.setX( this.x - x ).setY( this.y - y );
    }

    /**
     * Subtracts another Vector to this vector. To NOT mutate this Vector, call copy() and subtract to that Vector.
     * @public
     *
     * @param {Vector} vector
     * @returns {Vector} - for chaining
     */
    subtract( vector ) {
      assert( vector instanceof Vector, `invalid vector: ${ vector }` );
      return this.subtractXY( vector.x, vector.y );
    }

    /**
     * Mutates this Vector by setting the magnitude to 1 (but in the same direction). To NOT mutate this Vector, call
     * copy() and normalize that Vector.
     * @public
     *
     * @returns {Vector2}
     */
    normalize() {
      const magnitude = this.magnitude;
      if ( magnitude === 0 ) {
        assert( false, 'Cannot normalize a zero-magnitude vector' );
      }
      else {
        return this.divide( magnitude );
      }
    }
  }

  //========================================================================================
  // Static References

  // @public
  Vector.ZERO = new Vector( 0, 0, true );

  return Vector;
} );