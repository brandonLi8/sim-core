// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A utility for creating/manipulating shapes, for rendering in scenery/Path. As of now, Shape supports any combination
 * of lines, translations (for multiple bodies), and/or circular arcs. There are plans to expand this to support the
 * full SVG path spec in the future.
 *
 * After creating and manipulating a Shape with its methods, the shape is passed to a Path instance. Path will then
 * call the getSVGPath() method, which will compute the path d-attribute. See
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d for context.
 *
 * NOTE: when passing the Shape to the Path, it will be drawn in its standard localBounds, with the positive
 * y-axis downwards. However, Shape supports conversions from model to view coordinates or vise versa with
 * util/ModelViewTransform, which will internally call Shape's transformToModel() and transformToView() methods.
 *
 * While code comments attempt to describe the implementation clearly, fully understanding it may require some
 * general background. Some useful references include:
 *   - https://www.w3.org/TR/SVG11/paths.html
 *   - https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
 *   - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
 *   - https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const ModelViewTransform = require( 'SIM_CORE/util/ModelViewTransform' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Shape {

    constructor() {

      // @private {Array.<Object>} - array of the paths that make up the shape. The path Object literal has 2 mappings:
      //                               (1) cmd: {string} the d-attribute command letter.
      //                               (2) args: {number[]} the arguments to the cmd, in the correct ordering.
      this._subpaths = [];

      // @private {Vector|null} - the current position of the path. Null means unknown, and must be set in moveTo().
      this._currentPoint;

      // @private {Vector|null} - the first known position of the path. Null means unknown, and will be set in moveTo().
      this._firstPoint;

      // @private {Bounds|null} - defined as the smallest Bounds that contains the entire Shape. Null means unknown.
      this._bounds;

      // @public (read-only) - indicates if the Shape is empty or not, meaning if has at least one sub-path and a known
      //                       bounds. Must not be degenerate for use in Path and ModelViewTransform.
      this.isDegenerate = true;
    }

    /**
     * Moves the current position to a the coordinate (x, y).
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveTo( x, y ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );

      // Create a sub-path that moves the current position based off the path spec.
      this._subpaths.push( { cmd: 'M', args: [ x, y ] } );

      if ( this.isDegenerate ) {
        // Update the unknown references that are now known, centered around the passed-in coordinate.
        this._firstPoint = new Vector( x, y );
        this._currentPoint = new Vector( x, y );
        this._firstPoint = new Bounds( x, y, x, y );

        // This Shape is no longer degenerate as it has at least one sub-path and a finite Bounds.
        this.isDegenerate = false;
      }
      else {
        // The Shape wasn't degenerate before, and already contains a _firstPoint reference.
        // Update the _currentPoint and _bounds to match the passed-in coordinate.
        this._currentPoint.setX( x ).setY( y );
        this._bounds.includePoint( this._currentPoint );
      }
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
    moveToRelative( x, y ) { return this.moveTo( this._currentPoint.x + x, this._currentPoint.y + y ); }

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
      this._subpaths.push( { cmd: 'L', args: [ x, y ] } );
      this._firstPoint = this._firstPoint || Vector.ZERO.copy();
      this._bounds = this._bounds || Bounds.ZERO.copy();

      this._currentPoint.setX( x ).setY( y );
      this._currentPoint.setX( x ).setY( y );
      this._bounds.includePoint( this._currentPoint );
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
    lineToRelative( x, y ) { return this.lineTo( this._currentPoint.x + x, this._currentPoint.y + y ); }

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
    horizontalLineTo( x ) { return this.lineTo( x, this._currentPoint.y ); }

    /**
     * Adds a horizontal line with the given x-displacement
     * @public
     *
     * @param {number} x
     * @returns {Shape} - 'this' reference, for chaining
     */
    horizontalLineToRelative( x ) { return this.horizontalLineTo( this._currentPoint.x + x ); }

    /**
     * Adds a vertical line (y represents the y-coordinate of the end point)
     * @public
     *
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineTo( y ) { return this.lineTo( this._currentPoint.x, y ); }

    /**
     * Adds a vertical line with the given y-displacement
     * @public
     *
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineToRelative( y ) { return this.verticalLineTo( this._currentPoint.y + y ); }

    /**
     * Adds a straight line from the current position back to the first point of the shape.
     * @public
     *
     * @returns {Shape} - 'this' reference, for chaining
     */
    close() {
      this._subpaths.push( { cmd: 'Z' } );
      this._currentPoint.setX( this._firstPoint.x ).setY( this._firstPoint.y );
      return this;
    }

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
      const endVector = this._currentPoint.copy().add( new Vector( 0, radius ).setAngle( endAngle ) );
      const startVector = this._currentPoint.copy().add( new Vector( 0, radius ).setAngle( startAngle ) );
      const deltaAngle = endAngle - startAngle;

      const largeArcFlag = Math.abs( deltaAngle ) > Math.PI ? 1 : 0;
      const sweepFlag = clockwise ? 1 : 0;
      this.moveToPoint( startVector );
      this._subpaths.push( { cmd: 'A', args: [ radius, radius, 0, largeArcFlag, sweepFlag, endVector.x, endVector.y ] } );

      this._currentPoint = endVector;
      this._bounds.includePoint( this._currentPoint );
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
     * Gets the SVG d attribute
     *  * Although Shape supports relative placements (moveToRelative, lineToRelative ...), the getSVGPath() d-attribute string
 * will only use the base upper-case commands and not the lower-case relative commands.
     */
    getSVGPath() {
      let result = '';
      this._subpaths.forEach( subpath => {
        if ( [ 'M', 'L', 'A' ].includes( subpath.cmd ) ) {
          result += `${ subpath.cmd } ${ subpath.args.map( num => Util.toFixed( num, 10 ) ).join( ' ' ) } `;
        }
        else if ( subpath.cmd === 'Z' ) {
          result += 'Z ';
        }
        else {
          assert( false );
        }
      } );
      return result.trim();
    }
  }

  // we need to prevent the numbers from being in an exponential toString form, since the CSS transform does not support that
  function svgNumber( number ) {
    // Largest guaranteed number of digits according to https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed
    // See https://github.com/phetsims/dot/issues/36
    return number.toFixed( 20 );
  }

  return Shape;
} );