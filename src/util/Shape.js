// Copyright © 2020 Brandon Li. All rights reserved.

/**
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );

  class Shape {
    constructor() {
      this._subPaths = [];
    }

    /**
     * Moves to a the coordinate (x, y)
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveTo( x, y ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );
      this._subPaths.push( `M ${ x } ${ y }` );
      return this;
    }

    /**
     * Moves to the given point.
     * @public
     *
     * @param {Vector} point
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveToPoint( point ) { return this.moveTo( point.x, point.y ); }

    /**
     * Moves a relative displacement (x, y)
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveToRelative( x, y ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );
      this._subPaths.push( `m ${ x } ${ y }` );
      return this;
    }

    /**
     * Moves a relative passed-in point displacement.
     * @public
     *
     * @param {Vector} point - a displacement
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveToPointRelative( point ) { return this.moveToRelative( point.x, point.y ); }

    /**
     * Makes a straight line to the given coordinate (x, y)
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineTo( x, y ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );
      this._subPaths.push( `L ${ x } ${ y }` );
      return this;
    }

    /**
     * Makes a straight line to the given point.
     * @public
     *
     * @param {Vector} point
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToPoint( point ) { return this.lineTo( point.x, point.y ); }

    /**
     * Makes a straight line a relative displacement (x, y)
     * @public
     *
     * @param {number} x - horizontal displacement
     * @param {number} y - vertical displacement
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToRelative( x, y ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );
      this._subPaths.push( `l ${ x } ${ y }` );
      return this;
    }

    /**
     * Makes a straight line a relative displacement by the passed-in point.
     * @public
     *
     * @param {Vector} point - displacement
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToPointRelative( point ) { return this.lineToRelative( point.x, point.y ); }

    /**
     * Makes a horizontal line to the given x coordinate
     * @public
     *
     * @param {number} x
     * @returns {Shape} - 'this' reference, for chaining
     */
    horizontalLineTo( x ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      this._subPaths.push( `H ${ x }` );
      return this;
    }

    /**
     * Adds a horizontal line with the given x-displacement
     * @public
     *
     * @param {number} x
     * @returns {Shape} - 'this' reference, for chaining
     */
    horizontalLineToRelative( x ) { return this.lineToRelative( x, 0 ); }

    /**
     * Adds a vertical line (y represents the y-coordinate of the end point)
     * @public
     *
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineTo( y ) {
     assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );
      this._subPaths.push( `V ${ y }` );
      return this;
    }

    /**
     * Adds a vertical line with the given y-displacement
     * @public
     *
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineToRelative( y ) { return this.lineToRelative( 0, y ); }


  }

  return Shape;
} );