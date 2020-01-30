// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Vector utility class, represented as a <x, y>. Vector can also represent a coordinate point (x, y).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Vector {
    /**
     * @param {number} x - x value
     * @param {number} y - y value
     */
    constructor( x, y ) {
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );

      // @private {number} - see the argument documentation.
      this._x = x;
      this._y = y;
    }

    /**
     * Getters for the x and y values.
     * @public
     *
     * @returns {number}
     */
    getX() { return this._x; }
    getY() { return this._y; }
    get x() { return this.getX(); }
    get y() { return this.getY(); }

    /**
     * Checks for exact equality between this Vector to another Vector.
     * @public
     *
     * @param {Vector} vector
     * @returns {boolean}
     */
    equals( vector ) { return vector instanceof Vector && this._x === vector.x && this._y === vector.y; }

    /**
     * Computes the magnitude of this Vector.
     * @public
     *
     * @returns {number}
     */
    getMagnitude() { return Math.sqrt( this._x * this._x + this._y * this._y ); }
    get magnitude() { return this.getMagnitude(); }

    /**
     * Computes the dot product of this vector and another vector v.
     * @public
     *
     * @param {Vector}
     * @returns {number}
     */
    dot( v ) { return this.x * v.x + this.y * v.y; }

    /**
     * Computes the dot product between this vector and another vector (x, y).
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    dotXY( x, y ) { return this.x * x + this.y * y; }

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
      return Math.sqrt( Math.pow( this._x - x, 2 ) + Math.pow( this._y - y, 2 ) );
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
     * Checks for approximate equality between this Vector and another Vector.
     * @public
     *
     * @param {Vector} other
     * @param {number} [epsilon]
     * @returns {boolean} - if the other vector is within epsilon distance
     */
    equalsEpsilon( other, epsilon = Util.EPSILON ) {
      assert( other instanceof Vector && typeof epsilon === 'number' );

      // Check that all properties approximately match for both this instance and the other instance.
      return [ 'x', 'y' ].every( property => {

        // Approximate equality only applies on finite values. Otherwise, they must be strictly equal.
        if ( isFinite( this[ property ] ) && isFinite( other[ property ] ) ) {
          return Math.abs( this[ property ] - other[ property ] ) <= epsilon;
        }
        else {
          return other[ property ] === this[ property ];
        }
      } );
    }

    /**
     * Checks if the Vector is finite
     * @public
     *
     * @returns {boolean}
     */
    isFinite() {
      return isFinite( this._x ) && isFinite( this._y );
    }

    /**
     * Creates a copy of this Vector.
     * @public
     *
     * @param {boolean} [isCopyImmutable] determines if the copy is immutable or not
     * @returns {Vector}
     */
    copy( isCopyImmutable = false ) {
      return new Vector( this._x, this._y, isCopyImmutable );
    }

    /**
     * Gets the angle of this vector as a position vector relative to the origin, from [-PI, PI] in radians.
     * @public
     *
     * @returns {number}
     */
    getAngle() {
      return Math.atan2( this._y, this._x );
    }
    get angle() { return this.getAngle(); }

    /**
     * Debugging string for the Vector.
     * @public
     *
     * @returns {string}
     */
    toString() {
      return `Vector <${ this._x }, ${ this._y }>`;
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
      assert( typeof x === 'number', `invalid x: ${ x }` );
      this._x = x;
      return this;
    }
    set x( x ) { this.setX( x ); }

    /**
     * Sets the y value, returning this.
     * @public
     *
     * @param {number} y
     * @returns {Vector} - for chaining
     */
    setY( y ) {
      assert( typeof y === 'number', `invalid y: ${ y }` );
      this._y = y;
      return this;
    }
    set y( y ) { this.setY( y ); }

    /**
     * Sets the values of this Vector to another Vector. Does not change immutability.
     * @public
     *
     * @param {Vector} vector
     * @returns {Vector} - for chaining
     */
    set( vector ) {
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
      assert( typeof scalar === 'number', `invalid scalar: ${ scalar }` );
      return this.setX( this._x * scalar ).setY( this._y * scalar );
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
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );

      return this.setX( this._x + x ).setY( this._y + y );
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
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );

      return this.setX( this._x - x ).setY( this._y - y );
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
     * @returns {Vector}
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

    /**
     * Sets the angle of this vector relative to the y-axis with positive angles in the counter-clockwise direction.
     * @public
     *
     * @param {number} angle - In radians
     * @returns {Vector} - for chaining
     */
    setAngle( angle ) {
      assert( typeof angle === 'number', `invalid angle: ${ angle }` );
      const mag = this.getMagnitude();
      this.x = mag * Math.cos( angle );
      this.y = mag * Math.sin( angle );
      return this;
    }
    set angle( angle ) { this.setAngle( angle ); }


    /**
     * Rotates by an arbitrary angle, in radians. To NOT mutate this Vector, call copy() and rotate that Vector.
     * @public
     *
     * @param {number} angle - In radians
     * @returns {Vector} - for chaining
     */
    rotate( angle ) {
      return this.setAngle( angle + this.angle );
    }

    /**
     * Rotates about a point (x, y), in radians. To NOT mutate this Vector, call copy() and rotate that Vector.
     * @public
     *
     * @param {number} x - origin of rotation in x
     * @param {number} y - origin of rotation in y
     * @param {number} angle - radians to rotate
     * @returns {Vector} - for chaining
     */
    rotateAboutXY( x, y, angle ) {
      const dx = this.x - x;
      const dy = this.y - y;
      const cos = Math.cos( angle );
      const sin = Math.sin( angle );
      this.x = x + dx * cos - dy * sin;
      this.y = y + dx * sin + dy * cos;
      return this;
    }

    /**
     * Rotates about a point, in radians. To NOT mutate this Vector, call copy() and rotate that Vector.
     * @public
     *
     * @param {Vector} point
     * @param {number} angle
     * @returns {Vector} this for chaining
     */
    rotateAboutPoint( point, angle ) {
      return this.rotateAboutXY( point.x, point.y, angle );
    }
  }

  //----------------------------------------------------------------------------------------
  // Constants

  // @public {Vector} ZERO - represents the zero vector.
  Vector.ZERO = new Vector( 0, 0 );

  // Conditionally freeze Vector.ZERO to ensure that it is constant and not modified.
  Util.deepFreeze( Vector.ZERO );

  return Vector;
} );