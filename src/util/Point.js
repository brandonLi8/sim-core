// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Point utility class, represented as (x, y).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  class Point {
    /**
     * @param {number} x - x coordinate of the point
     * @param {number} y - y coordinate of the point
     */
    constructor( x, y ) {
      assert && assert( typeof x === 'number', `invalid x: ${x}` );
      assert && assert( typeof y === 'number', `invalid y: ${y}` );

      // @public {number}
      this.x = x;
      this.y = y;
    }

    /**
     * Sets the x coordinate, returning this.
     * @public
     *
     * @param {number} x
     * @returns {Point} - for chaining
     */
    setX( x ) {
      assert && assert( typeof x === 'number', `invalid x: ${x}` );
      this.x = x;
      return this;
    }

    /**
     * Sets the y coordinate, returning this.
     * @public
     *
     * @param {number} y
     * @returns {Point} - for chaining
     */
    setY( y ) {
      assert && assert( typeof y === 'number', `invalid y: ${y}` );
      this.y = y;
      return this;
    }

    /**
     * Sets the content of this point to another point.
     * @public
     *
     * @param {Point} point
     * @returns {Point} - for chaining
     */
    set( point ) {
      return this.setX( point.x ).setY( point.y );
    }

    /**
     * The distance between this point and a (x, y) coordinate pair.
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    distanceToXY( x, y ) {
      assert && assert( typeof x === 'number', `invalid x: ${x}` );
      assert && assert( typeof y === 'number', `invalid y: ${y}` );

      return Math.sqrt( Math.pow( this.x - x, 2 ) + Math.pow( this.y - y, 2 ) );
    }

    /**
     * Distance between this point to another point.
     * @public
     *
     * @param {Point} point
     * @returns {number}
     */
    distanceTo( point ) {
      assert && assert( point instanceof Point, `invalid point: ${point}` );

      return this.distanceToXY( point.x, point.y );
    }

    /**
     * Checks for exact equality between this point and another point.
     * @public
     *
     * @param {Point} point
     * @returns {boolean}
     */
    equals( point ) {
      assert && assert( point instanceof Point, `invalid point: ${point}` );
      return this.x === point.x && this.y === point.y;
    }

    /**
     * Checks for approximate equality between this point and another point.
     * @public
     *
     * @param {Point} other
     * @param {number} [epsilon]
     * @returns {boolean} - if the other point is within epsilon distance
     */
    equalsEpsilon( other, epsilon=0.00005 ) {
      assert && assert( other instanceof Point && typeof epsilon === 'number' );
      return Math.max( Math.abs( this.x - other.x ), Math.abs( this.y - other.y ) ) <= epsilon;
    }

    /**
     * Checks if the Point is finite
     * @public
     *
     * @returns {boolean}
     */
    isFinite() {
      return isFinite( this.x ) && isFinite( this.y );
    }
  }

  //========================================================================================
  // Static References

  // @public
  Point.ORIGIN = new Point( 0, 0 );

  return Point;
}