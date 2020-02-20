// Copyright © 2019-2020 Brandon Li. All rights reserved.

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
      this._subPaths.push( { command: 'M', args: [ x, y ] } );
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
      this._subPaths.push( { command: 'm', args: [ x, y ] } );
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
      this._subPaths.push( { command: 'L', args: [ x, y ] } );
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
      this._subPaths.push( { command: 'l', args: [ x, y ] } );
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
      this._subPaths.push( { command: 'H', args: [ x ] } );
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
      this._subPaths.push( { command: 'V', args: [ y ] } );
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

    /**
     * Adds a straight line from the current position back to the first point of the shape.
     * @public
     *
     * @returns {Shape} - 'this' reference, for chaining
     */

    close() { this._subPaths.push( { command: 'Z' } ); return this; }

    /**
     * Makes an arc, revolved around the current position.
     * @public
     *
     * @param {number} radius - How far from the center the arc will be
     * @param {number} startAngle - Angle (radians) of the start of the arc, relative to the horizontal
     * @param {number} endAngle - Angle (radians) of the end of the arc, relative to the horizontal
     * @param {boolean} [clockwise=true] - Decides which direction the arc takes around the center
     * @returns {Shape} - 'this' reference, for chaining
     */
    arc( radius, startAngle, endAngle, clockwise = true ) {

      // Get the starting and end Vectors as points.
      const endVector = new Vector( 0, radius ).setAngle( endAngle );
      const startVector = new Vector( 0, radius ).setAngle( startAngle);
      const deltaAngle = endAngle - startAngle;

      const largeArcFlag = Math.abs( deltaAngle ) > Math.PI ? 1 : 0;
      const sweepFlag = clockwise ? 1 : 0;
      this.moveToPoint( startVector );
      this._subPaths.push( { command: 'a', args: [ radius, radius, largeArcFlag, sweepFlag, endVector.x, endVector.y ] } );
      return this;
    }

    /**
     * Creates a polygon by drawing lines to an array of verticies.
     * @public
     *
     * @param {Vector[]} vertices
     * @returns {Shape} - 'this' reference, for chaining
     */
    polygon( vertices ) {
      const length = vertices.length;
      if ( length > 0 ) {
        this.moveToPoint( vertices[ 0 ] );
        for ( let i = 1; i < length; i++ ) {
          this.lineToPoint( vertices[ i ] );
        }
      }
      return this.close();
    }

    /**
     * Gets the SVG D-attribute path data.
     * @public
     *
     * @returns {string}
     */
    getSVGDAttribute() {
      let result = '';
      this._subPaths.forEach( pathSchema => {

      } );
    }
  }

  return Shape;
} );