// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A utility for handling shapes for SVG paths. Currently supports moving (for multiple bodies), lines, and
 * circular arcs, but there are plans to expand this to the full SVG path spec in the future.
 *
 * After creating and describing the shape with its methods, the path d-attribute can be computed with the getSVGPath()
 * method. This attribute can be used with scenery/Path.js to display the scene graph. See
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d for more details.
 *
 * Shape also keeps track of the Shape's bounds, which contain the entire shape, for use in Path.js However, when
 * passing the Shape to the Path, it will be drawn in its standard localBounds, with the positive y-axis downwards.
 * Shape supports conversions to a model or a view coordinate frame with the transformToModel() and transformToView()
 * methods.
 *
 * Although Shape supports relative placements (moveToRelative, lineToRelative ...), the getSVGPath() d-attribute string
 * will only use the base upper-case commands and not the lower-case relative commands.
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
    constructor( subpaths ) {
      this._subPaths = [];
      this._lastPoint = Vector.ZERO.copy();
      this._firstPoint;
      this._bounds;
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
      this._subPaths.push( { cmd: 'M', args: [ x, y ] } );
      this._firstPoint = this._firstPoint || new Vector( x, y );
      this._bounds = this._bounds || new Bounds( x, y, x, y );
      this._lastPoint.setX( x ).setY( y );
      this._bounds.includePoint( this._lastPoint );
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
    moveToRelative( x, y ) { return this.moveTo( this._lastPoint.x + x, this._lastPoint.y + y ); }

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
      this._subPaths.push( { cmd: 'L', args: [ x, y ] } );
      this._firstPoint = this._firstPoint || Vector.ZERO.copy();
      this._bounds = this._bounds || Bounds.ZERO.copy();

      this._lastPoint.setX( x ).setY( y );
      this._lastPoint.setX( x ).setY( y );
      this._bounds.includePoint( this._lastPoint );
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
    lineToRelative( x, y ) { return this.lineTo( this._lastPoint.x + x, this._lastPoint.y + y ); }

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
    horizontalLineTo( x ) { return this.lineTo( x, this._lastPoint.y ); }

    /**
     * Adds a horizontal line with the given x-displacement
     * @public
     *
     * @param {number} x
     * @returns {Shape} - 'this' reference, for chaining
     */
    horizontalLineToRelative( x ) { return this.horizontalLineTo( this._lastPoint.x + x ); }

    /**
     * Adds a vertical line (y represents the y-coordinate of the end point)
     * @public
     *
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineTo( y ) { return this.lineTo( this._lastPoint.x, y ); }

    /**
     * Adds a vertical line with the given y-displacement
     * @public
     *
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineToRelative( y ) { return this.verticalLineTo( this._lastPoint.y + y ); }

    /**
     * Adds a straight line from the current position back to the first point of the shape.
     * @public
     *
     * @returns {Shape} - 'this' reference, for chaining
     */
    close() {
      this._subPaths.push( { cmd: 'Z' } );
      this._lastPoint.setX( this._firstPoint.x ).setY( this._firstPoint.y );
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
      const endVector = this._lastPoint.copy().add( new Vector( 0, radius ).setAngle( endAngle ) );
      const startVector = this._lastPoint.copy().add( new Vector( 0, radius ).setAngle( startAngle ) );
      const deltaAngle = endAngle - startAngle;

      const largeArcFlag = Math.abs( deltaAngle ) > Math.PI ? 1 : 0;
      const sweepFlag = clockwise ? 1 : 0;
      this.moveToPoint( startVector );
      this._subPaths.push( { cmd: 'A', args: [ radius, radius, 0, largeArcFlag, sweepFlag, endVector.x, endVector.y ] } );

      this._lastPoint = endVector;
      this._bounds.includePoint( this._lastPoint );
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
     */
    getSVGPath() {
      let result = '';
      this._subPaths.forEach( subpath => {
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