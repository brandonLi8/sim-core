// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A numerical Bounding box utility class, represented as <minX, minY, maxX, maxY>.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Range = require( 'SIM_CORE/util/Range' );
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

      // @public (read-only) {Range} xRange - the range in the x direction.
      this.xRange = new Range( minX, maxX );

      // @public (read-only) {Range} yRange - the range in the y direction.
      this.yRange = new Range( minY, maxY );
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
     * @param {Bounds} other
     * @returns {boolean} - whether the two bounds are equal
     */
    equals( other ) {
      return other instanceof Bounds && this.xRange.equals( other.xRange ) && this.yRange.equals( other.yRange );
    }

    /**
     * Approximate equality comparison between this bounds and another bounds.
     * @public
     *
     * @param {Bounds} other
     * @param [number] epsilon
     * @returns {boolean} - whether the two bounds are within epsilon of each other
     */
    equalsEpsilon( other, epsilon = Util.EPSILON ) {
      if ( !( other instanceof Bounds ) ) return false; // Must be type Bounds to be equal
      return this.xRange.equalsEpsilon( other.xRange, epsilon ) && this.yRange.equalsEpsilon( other.yRange, epsilon );
    }

    //========================================================================================
    // Accessors
    //========================================================================================

    /**
     * Accessors to main location properties.
     * @public
     *
     * @returns {number}
     */
    getMinX() { return this.xRange.min; }
    getMinY() { return this.yRange.min; }
    getMaxX() { return this.xRange.max; }
    getMaxY() { return this.yRange.max; }
    get minX() { return this.getMinX(); }
    get minY() { return this.getMinY(); }
    get maxX() { return this.getMaxX(); }
    get maxY() { return this.getMaxY(); }

    /**
     * Gets the width/height of the bounds.
     * @public
     *
     * @returns {number}
     */
    getWidth() { return this.xRange.length; }
    getHeight() { return this.yRange.length; }
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
    getCenterX() { return this.xRange.center; }
    getCenterY() { return this.yRange.center; }

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
    isFinite() { return this.xRange.isFinite() && this.yRange.isFinite(); }

    /**
     * Whether the bounds contains an area that is 0.
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
      return this.xRange.contains( x ) && this.yRange.contains( y );
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
      return new Vector( this.xRange.closestTo( location.x ), this.yRange.closestTo( location.y ) );
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
      return this.xRange.containsRange( bounds.xRange ) && this.yRange.containsRange( bounds.yRange );
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
      return this.xRange.intersects( bounds.xRange ) && this.yRange.intersects( bounds.yRange );
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
      return Bounds.withRanges( this.xRange.union( bounds.xRange ), this.yRange.union( bounds.yRange ) );
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
      return Bounds.withRanges( this.xRange.intersection( bounds.xRange ), this.yRange.intersection( bounds.yRange ) );
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
      this.xRange.min = minX;
      return this;
    }
    set minX( minX ) { this.setMinX( minX ); }

    /**
     * Sets the value of minY.
     * @public
     *
     * @param {number} minY
     * @returns {Bounds} - for chaining
     */
    setMinY( minY ) {
      assert( typeof minY === 'number', `invalid minY: ${ minY }` );
      this.yRange.min = minY;
      return this;
    }
    set minY( minY ) { this.setMinY( minY ); }

    /**
     * Sets the value of maxX.
     * @public
     *
     * @param {number} maxX
     * @returns {Bounds} - for chaining
     */
    setMaxX( maxX ) {
      assert( typeof maxX === 'number', `invalid maxX: ${ maxX }` );
      this.xRange.max = maxX;
      return this;
    }
    set maxX( maxX ) { this.setMaxX( maxX ); }

    /**
     * Sets the value of maxY.
     * @public
     *
     * @param {number} maxY
     * @returns {Bounds} - for chaining
     */
    setMaxY( maxY ) {
      assert( typeof maxY === 'number', `invalid maxY: ${ maxY }` );
      this.yRange.max = maxY;
      return this;
    }
    set maxY( maxY ) { this.setMaxY( maxY ); }

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
      this.xRange.setMinMax( minX, maxX );
      this.yRange.setMinMax( minY, maxY );
      return this;
    }

    /**
     * Rounds each the edges of this bounds with Util.roundSymmetric.
     * @public
     *
     * @returns {Bounds} - for chaining
     */
    roundSymmetric() {
      this.xRange.roundSymmetric();
      this.yRange.roundSymmetric();
      return this;
    }

    /**
     * Expands this bounds on all sides by the specified amount.
     * @public
     *
     * @param {number} amount
     * @returns {Bounds} - for chaining
     */
    dilate( amount ) {
      assert( typeof amount === 'number', `invalid amount: ${ amount }` );
      return this.expand( amount, amount, amount, amount );
    }

    /**
     * Contracts this bounds on all sides by the specified amount.
     * @public
     *
     * @param {number} amount
     * @returns {Bounds} - for chaining
     */
    erode( amount ) { return this.dilate( -amount ); }

    /**
     * Expands this bounds independently for each side (or if some offsets are negative, will contract those sides).
     * @public
     *
     * @param {number} left - Amount to expand to the left (subtracts from minX)
     * @param {number} bottom - Amount to expand to the bottom (subtracts from minY)
     * @param {number} right - Amount to expand to the right (adds to maxX)
     * @param {number} top - Amount to expand to the top (adds to maxY)
     * @returns {Bounds} - for chaining
     */
    expand( left, bottom, right, top ) {
      assert( typeof left === 'number', `invalid left: ${ left }` );
      assert( typeof bottom === 'number', `invalid bottom: ${ bottom }` );
      assert( typeof right === 'number', `invalid right: ${ right }` );
      assert( typeof top === 'number', `invalid top: ${ top }` );
      this.xRange.expand( left, right );
      this.yRange.expand( bottom, top );
      return this;
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
      this.xRange.shift( x );
      this.yRange.shift( y );
      return this;
    }
  }

  //========================================================================================
  // Static References
  //========================================================================================

  /**
   * Returns a new Bounds object, constructed with <minX, minY, width, height>.
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

  /**
   * Returns a new Bounds object, constructed with points <minPoint, maxPoint>.
   * @public
   *
   * @param {Vector} minPoint - the minimum point for the bounds.
   * @param {Vector} maxPoint - the minimum point for the bounds.
   * @returns {Bounds}
   */
  Bounds.withPoints = ( minPoint, maxPoint ) => {
    return new Bounds( minPoint.x, minPoint.y, maxPoint.x, maxPoint.y );
  };

  /**
   * Returns a new Bounds object, constructed with ranges in the form <xRange, yRange>.
   * @public
   *
   * @param {Range} xRange
   * @param {Range} yRange
   * @returns {Bounds}
   */
  Bounds.withRanges = ( xRange, yRange ) => {
    assert( xRange instanceof Range, `invalid xRange: ${ xRange }` );
    assert( yRange instanceof Range, `invalid yRange: ${ yRange }` );
    return new Bounds( xRange.min, yRange.min, xRange.max, yRange.max );
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

  // Conditionally freeze Bounds.ZERO and Bounds.EVERYTHING to ensure that they are constant.
  Util.deepFreeze( Bounds.ZERO );
  Util.deepFreeze( Bounds.EVERYTHING );

  return Bounds;
} );