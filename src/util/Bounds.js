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


  return Bounds;
} );