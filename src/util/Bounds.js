// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Bounding box utility class, represented as <minX, minY, maxX, maxY>.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Bounds {

    /**
     * @param {number} minX - The initial minimum X coordinate of the bounds.
     * @param {number} minY - The initial minimum Y coordinate of the bounds.
     * @param {number} maxX - The initial maximum X coordinate of the bounds.
     * @param {number} maxY - The initial maximum Y coordinate of the bounds.
     */
    constructor( minX, minY, maxX, maxY ) {
      assert( typeof minX === 'number', `invalid minX: ${ minX }` );
      assert( typeof minY === 'number', `invalid minY: ${ minY }` );
      assert( typeof maxX === 'number', `invalid maxX: ${ maxX }` );
      assert( typeof maxY === 'number', `invalid maxY: ${ maxY }` );

      // @public {number} - See the parameter descriptions
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
    }

    /**
     * Debugging string for the bounds.
     * @public
     *
     * @returns {string}
     */
    toString() { return `Bounds[ min:( ${ this.minX }, ${ this.minY } ), max:( ${ this.minY }, ${ this.maxY }) ]`; }

    /**
     * Exact equality comparison between this bounds and another bounds.
     * @public
     *
     * @param {Bounds} b
     * @returns {boolean} - whether the two bounds are equal
     */
    equals( other ) {
      if ( !( other instanceof Bounds ) ) return false; // Must be type Bounds to be equal

      // Check that all properties exactly match for both this instance and the other instance.
      return [ 'minX', 'minY', 'maxX', 'minY' ].every( property => other[ property ] === this[ property ] );
    }

    /**
     * Approximate equality comparison between this bounds and another bounds.
     * @public
     *
     * @param {Bounds} other
     * @param {number} epsilon
     * @returns {boolean} - whether the two bounds are within epsilon of each other
     */
    equalsEpsilon( other, epsilon = Util.EPSILON ) {
      if ( !( other instanceof Bounds ) ) return false; // Must be type Bounds to be equal

      // Check that all properties approximately match for both this instance and the other instance.
      return [ 'minX', 'minY', 'maxX', 'minY' ].every( property => {

        // Approximate equality only applies on finite dimensions. Otherwise, they must be strictly equal.
        if ( isFinite( this[ property ] ) && isFinite( other[ property ] ) ) {
          return Math.abs( this[ property ] - other[ property ] ) <= epsilon;
        }
        else {
          return other[ property ] === this[ property ];
        }
      } );
    }

    //========================================================================================
    // Accessors
    //========================================================================================

    /**
     * Accessors to properties.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    getMinX() { return this.minX; }
    getMinY() { return this.minY; }
    getMaxX() { return this.maxX; }
    getMaxY() { return this.maxY; }

    /**
     * Gets the width/height of the bounds.
     * @public
     *
     * @returns {number}
     */
    getWidth() { return this.maxX - this.minX; }
    getHeight() { return this.maxY - this.minY; }
    get width() { return this.getWidth(); }
    get height() { return this.getHeight(); }

    /**
     * Location getters, in terms of the conventional mathematical coordinate system.
     *                        centerX                maxX
     *          ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ maxY
     *          ┃ leftTop     centerTop     rightTop    ┃
     * centerY  ┃ leftCenter  center        rightCenter ┃
     *          ┃ leftBottom  centerBottom  rightBottom ┃
     *    minY  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
     *          minX
     */

    /**
     * Gets the side locations of the Bounding Box
     * @public
     *
     * @returns {number}
     */
    getLeft() { return this.minX; }
    getTop() { return this.maxY; }
    getRight() { return this.maxX; }
    getBottom() { return this.minY; }

    get left() { return this.getLeft(); }
    get top() { return this.getTop(); }
    get right() { return this.getRight(); }
    get bottom() { return this.getBottom(); }

    /**
     * Gets the box points of the Bounding Box
     * @public
     *
     * @returns {Vector}
     */
    getLeftTop() { return new Vector( this.minX, this.maxY ); }
    getCenterTop() { return new Vector( this.getCenterX(), this.maxY ); }
    getRightTop() { return new Vector( this.maxX, this.maxY ); }
    getLeftCenter() { return new Vector( this.minX, this.getCenterY() ); }
    getRightCenter() { return new Vector( this.maxX, this.getCenterY() ); }
    getLeftBottom() { return new Vector( this.minX, this.minY ); }
    getCenterBottom() { return new Vector( this.getCenterX(), this.minY ); }
    getRightBottom() { return new Vector( this.maxX, this.minY ); }
    getCenter() { return new Vector( this.getCenterX(), this.getCenterY() ); }

    get leftTop() { return this.getLeftTop(); }
    get centerTop() { return this.getCenterTop(); }
    get rightTop() { return this.getRightTop(); }
    get leftCenter() { return this.getLeftCenter(); }
    get rightCenter() { return this.getRightCenter(); }
    get leftBottom() { return this.getLeftBottom(); }
    get centerBottom() { return this.getCenterBottom(); }
    get rightBottom() { return this.getRightBottom(); }
    get center() { return this.getCenter(); }

    /**
     * Gets the center x and y location of the Bounding Box
     * @public
     *
     * @returns {number}
     */
    getCenterX() { return ( this.minX + this.maxX ) / 2; }
    getCenterY() { return ( this.minY + this.maxY ) / 2; }

    get centerX() { return this.getCenterX(); }
    get centerY() { return this.getCenterY(); }

    /**
     * Gets the Area of the Bounds.
     * @public
     *
     * @returns {number}
     */
    getArea() { return this.getWidth() * this.getHeight(); }
    get area() { return this.getArea(); }

    /**
     * Whether our properties are all finite numbers.
     * @public
     *
     * @returns {boolean}
     */
    isFinite() { return [ this.minX, this.minY, this.maxX, this.maxY ].every( property => isFinite( property ) ); }

    /**
     * Whether the bounds contains an area that isn't 0.
     * @public
     *
     * @returns {boolean}
     */
    isEmpty() { return this.getArea() === 0; }

    /**
     * Whether the coordinates (x, y) are contained inside this bounding box.
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    containsCoordinates( x, y ) {
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );
      return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
    }

    /**
     * Whether the point (x, y) are contained inside this bounding box.
     * @public
     *
     * @param {Vector} point
     * @returns {boolean}
     */
    containsPoint( point ) {
      assert( point instanceof Vector, `invalid point: ${ point }` );
      return this.containsCoordinates( point.x, point.y );
    }

    /**
     * Gets the closest point inside the bounds. If the location is inside the bounds, the location will be returned.
     * Otherwise, this will return a new location on the edge of the bounds that is closest to the provided location.
     * @public
     *
     * @param {Vector} location
     * @returns {Vector}
     */
    closestPointTo( location ) {
      assert( location instanceof Vector, `invalid location: ${ location }` );
      if ( this.containsPoint( location ) ) {
        return location.copy();
      }
      else {
        const closestX = Math.max( Math.min( location.x, this.maxX ), this.minX );
        const closestY = Math.max( Math.min( location.y, this.maxY ), this.minY );
        return new Vector( closestX, closestY );
      }
    }

    /**
     * Whether this bounding box completely contains the bounding box passed as a parameter.
     * @public
     *
     * @param {Bounds} bounds
     * @returns {boolean}
     */
    containsBounds( bounds ) {
      assert( bounds instanceof Bounds, `invalid bounds: ${ bounds }` );
      return this.minX <= bounds.minX
        && this.maxX >= bounds.maxX
        && this.minY <= bounds.minY
        && this.maxY >= bounds.maxY;
    }

    /**
     * Whether this and another bounding box have any points of intersection (including touching boundaries).
     * @public
     *
     * @param {Bounds} bounds
     * @returns {boolean}
     */
    intersectsBounds( bounds ) {
      assert( bounds instanceof Bounds, `invalid bounds: ${ bounds }` );
      const minX = Math.max( this.minX, bounds.minX );
      const minY = Math.max( this.minY, bounds.minY );
      const maxX = Math.min( this.maxX, bounds.maxX );
      const maxY = Math.min( this.maxY, bounds.maxY );
      return ( maxX - minX ) >= 0 && ( maxY - minY >= 0 );
    }

    /**
     * Creates a copy of this bounds.
     * @public
     *
     * @returns {Bounds} - for chaining
     */
    copy() { return new Bounds( this.minX, this.minY, this.maxX, this.maxY ); }

    /**
     * Gets the smallest bounds that contains both this bounds and the input bounds.
     * @public
     *
     * @param {Bounds} bounds
     * @returns {Bounds}
     */
    union( bounds ) {
      assert( bounds instanceof Bounds, `invalid bounds: ${ bounds }` );
      return new Bounds(
        Math.min( this.minX, bounds.minX ),
        Math.min( this.minY, bounds.minY ),
        Math.max( this.maxX, bounds.maxX ),
        Math.max( this.maxY, bounds.maxY )
      );
    }

    /**
     * The smallest bounds that is contained by both this bounds and the input bounds.
     * @public
     *
     * @param {Bounds} bounds
     * @returns {Bounds}
     */
    intersection( bounds ) {
      assert( bounds instanceof Bounds, `invalid bounds: ${ bounds }` );
      return new Bounds(
        Math.max( this.minX, bounds.minX ),
        Math.max( this.minY, bounds.minY ),
        Math.min( this.maxX, bounds.maxX ),
        Math.min( this.maxY, bounds.maxY )
      );
    }

    //========================================================================================
    // Mutators
    //========================================================================================

    /**
     * Sets the value of minX.
     * @public
     *
     * @param {number} minX
     * @returns {Bounds} - for chaining
     */
    setMinX( minX ) {
      assert( typeof minX === 'number', `invalid minX: ${ minX }` );
      this.minX = minX;
      return this;
    }

    /**
     * Sets the value of minY.
     * @public
     *
     * @param {number} minY
     * @returns {Bounds} - for chaining
     */
    setMinY( minY ) {
      assert( typeof minY === 'number', `invalid minY: ${ minY }` );
      this.minY = minY;
      return this;
    }

    /**
     * Sets the value of maxX.
     * @public
     *
     * @param {number} maxX
     * @returns {Bounds} - for chaining
     */
    setMaxX( maxX ) {
      assert( typeof maxX === 'number', `invalid maxX: ${ maxX }` );
      this.maxX = maxX;
      return this;
    }

    /**
     * Sets the value of maxY.
     * @public
     *
     * @param {number} maxY
     * @returns {Bounds} - for chaining
     */
    setMaxY( maxY ) {
      assert( typeof maxY === 'number', `invalid maxY: ${ maxY }` );
      this.maxY = maxY;
      return this;
    }

    /**
     * Sets each value for this bounds.
     * @public
     *
     * @param {number} minX
     * @param {number} minY
     * @param {number} maxX
     * @param {number} maxY
     * @returns {Bounds} - for chaining
     */
    setAll( minX, minY, maxX, maxY ) {
      this.setMinX( minX );
      this.setMinY( minY );
      this.setMaxX( maxX );
      this.setMaxY( maxY );
      return this;
    }

    /**
     * Rounds each the edges of this bounds with Util.roundSymmetric.
     * @public
     *
     * @returns {Bounds} - for chaining
     */
    roundSymmetric() {
      return this.setAll(
        Util.roundSymmetric( this.minX ),
        Util.roundSymmetric( this.minY ),
        Util.roundSymmetric( this.maxX ),
        Util.roundSymmetric( this.maxY )
      );
    }

    /**
     * Expands this bounds on all sides by the specified amount.
     * @public
     *
     * @param {number} d
     * @returns {Bounds} - for chaining
     */
    dilate( d ) {
      assert( typeof d === 'number', `invalid d: ${ d }` );
      return this.setMinMax( this.minX - d, this.minY - d, this.maxX + d, this.maxY + d );
    }

    /**
     * Contracts this bounds on all sides by the specified amount.
     * @public
     *
     * @param {number} d
     * @returns {Bounds} - for chaining
     */
    erode( d ) { return this.dilate( -d ); }

    /**
     * Expands this bounds independently for each side (or if some offsets are negative, will contract those sides).
     * @public
     *
     * @param {number} left - Amount to expand to the left (subtracts from minX)
     * @param {number} top - Amount to expand to the top (subtracts from minY)
     * @param {number} right - Amount to expand to the right (adds to maxX)
     * @param {number} bottom - Amount to expand to the bottom (adds to maxY)
     * @returns {Bounds} - for chaining
     */
    expand( left, top, right, bottom ) {
      assert( typeof left === 'number', `invalid left: ${ left }` );
      assert( typeof top === 'number', `invalid top: ${ top }` );
      assert( typeof right === 'number', `invalid right: ${ right }` );
      assert( typeof bottom === 'number', `invalid bottom: ${ bottom }` );
      return new Bounds( this.minX - left, this.minY - top, this.maxX + right, this.maxY + bottom );
    }

    /**
     * Translates our bounds by (x, y).
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Bounds} - for chaining
     */
    shift( x, y ) {
      assert( typeof x === 'number', `invalid x: ${ x }` );
      assert( typeof y === 'number', `invalid y: ${ y }` );
      return this.setMinMax( this.minX + x, this.minY + y, this.maxX + x, this.maxY + y );
    }
  }

  //========================================================================================
  // Static References
  //========================================================================================

  /**
   * Returns a new Bounds object, constructed with by <minX, minY, width, height>.
   * @public
   *
   * @param {number} x - the minimum value of X for the bounds.
   * @param {number} y - the minimum value of Y for the bounds.
   * @param {number} width - the width (maxX - minX) of the bounds.
   * @param {number} height - the height (maxY - minY) of the bounds.
   * @returns {Bounds}
   */
  Bounds.rect = ( x, y, width, height ) => {
    return new Bounds( x, y, x + width, y + height );
  };

  // @public {Bounds} ZERO - a static Bounds that represents an empty Bounds with 0 width and height
  Bounds.ZERO = new Bounds( 0, 0, 0, 0 );

  // @public {Bounds} EVERYTHING - a static Bounds that contains infinite width and height and contains all real numbers
  Bounds.EVERYTHING = new Bounds(
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY
  );

  return Bounds;
} );