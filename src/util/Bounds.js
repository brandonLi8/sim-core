// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Bounding box utility class, represented as <minX, minY, maxX, maxY>.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Vector = require( 'SIM_CORE/util/Vector' );
  const Util = require( 'SIM_CORE/util/Util' );

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
    equals( b ) { return this.minX === b.minX && this.minY === b.minY && this.maxX === b.maxX && this.maxY === b.maxY; }

    /**
     * Approximate equality comparison between this bounds and another bounds.
     * @public
     *
     * @param {Bounds} other
     * @param {number} epsilon
     * @returns {boolean} - whether the two bounds are within epsilon of each other
     */
    equalsEpsilon( other, epsilon = Util.EPSILON ) {
      return Math.abs( this.minX - b.minX ) <= epsilon
        && Math.abs( this.minY - b.minY ) <= epsilon
        && Math.abs( this.maxX - b.maxX ) <= epsilon
        && Math.abs( this.maxY - b.maxY ) <= epsilon;
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

