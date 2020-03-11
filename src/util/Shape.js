// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A utility for creating/manipulating shapes, for rendering in scenery/Path. As of now, Shape supports any combination
 * of lines, translations, and/or circular arcs. There are plans to expand this to support the full SVG path spec in
 * the future.
 *
 * After creating and manipulating a Shape with its methods, the Shape is passed to a Path instance. Path will then
 * call the getSVGPath() method, which will compute the path d-attribute. See
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d for context.
 *
 * NOTE: when passing the Shape to the Path, it will be drawn in its standard localBounds, with the positive
 *       y-axis downwards. However, Shape supports conversions from model to view coordinates or vise versa with
 *       util/ModelViewTransform, which will internally call Shape's transform() methods.
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
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Shape {

    /**
     * NOTE: Arguments are used for the copy() method and are all optional.
     *       If used, ensure that all arguments are consistent with subpaths.
     *       Otherwise, create a Shape by constructing with no arguments and use its methods to describe the Shape.
     *
     * @param {Object[]} [subpaths] - for use in the copy() method.
     * @param {Vector} [currentPoint] - for use in the copy() method.
     * @param {Vector} [firstPoint] - for use in the copy() method.
     * @param {Bounds} [bounds] - for use in the copy() method.
     * @param {boolean} [isClosed] - for use in the copy() method.
     */
    constructor( subpaths, currentPoint, firstPoint, bounds, isClosed ) {

      // @private {Object[]} - array of the paths that make up the Shape. The path Object literal has 2 mappings:
      //                         (1) cmd: {string} the d-attribute command letter.
      //                         (2) args: {number[]} the arguments to the cmd, in the correct ordering.
      this._subpaths = subpaths || [];

      // @private {Vector} - the first known position of the Shape that is drawn. Null means unknown.
      this._firstPoint = firstPoint || null;

      // @public (read-only) {Vector} - the current position of the Shape's path. Null means unknown.
      this.currentPoint = currentPoint || null;

      // @public (read-only) {Bounds} - the smallest Bounds that contains the entire drawn Shape. Null means unknown.
      this.bounds = bounds || null;

      // @public (read-only) - indicates if the Shape close() method has been called, meaning the Shape is no longer
      //                       mutable.
      this.isClosed = isClosed || false;
    }

    /**
     * Moves the current position to the coordinate (x, y).
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveTo( x, y ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );

      // Create the 'move' sub-path from the path d-attribute spec.
      this._subpaths.push( { cmd: 'M', args: [ x, y ] } );

      // Update the currentPoint which is now known, to the passed-in coordinate. NOTE: Moving to a position doesn't
      // update the bounds unless something is drawn, so the bounds isn't touched here.
      this.currentPoint = this.currentPoint ? this.currentPoint.setX( x ).setY( y ) : new Vector( x, y );
      return this;
    }

    /**
     * Moves the current position to a the passed-in point (x, y).
     * @public
     *
     * @param {Vector} point
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveToPoint( point ) { return this.moveTo( point.x, point.y ); }

    /**
     * Moves the current position by a displacement (dx, dy) relative to the last known position.
     * @public
     *
     * @param {number} dx
     * @param {number} dy
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveToRelative( dx, dy ) {
      assert( this.currentPoint, 'Unknown current position. Make sure to call Shape.moveTo() to set the first point' );
      return this.moveTo( this.currentPoint.x + dx, this.currentPoint.y + dy );
    }

    /**
     * Moves the current position by a displacement <dx, dy> relative to the last known position.
     * @public
     *
     * @param {Vector} displacement
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveToPointRelative( displacement ) { return this.moveToRelative( displacement.x, displacement.y ); }

    /**
     * Draws a straight line from the current position to the given coordinate (x, y).
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineTo( x, y ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );
      assert( !this.isClosed, 'cannot add lines to a closed shape' );
      assert( this.currentPoint, 'Unknown current position. Make sure to call Shape.moveTo() to set the first point' );

      // Update the _firstPoint and bounds references on the first time something is drawn.
      if ( !this._firstPoint ) this._firstPoint = this.currentPoint.copy();
      if ( !this.bounds ) this.bounds = Bounds.withPoints( this.currentPoint, this.currentPoint );

      // Update bounds to include the currentPoint, which is the starting point of the line.
      this.bounds.includePoint( this.currentPoint );

      // Create the 'line' sub-path from the path d-attribute spec.
      this._subpaths.push( { cmd: 'L', args: [ x, y ] } );

      // Update the currentPoint and bounds to match the end point of the line.
      this.currentPoint.setX( x ).setY( y );
      this.bounds.includePoint( this.currentPoint );
      return this;
    }

    /**
     * Draws a straight line from the current position to the given point (x, y).
     * @public
     *
     * @param {Vector} point
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToPoint( point ) { return this.lineTo( point.x, point.y ); }

    /**
     * Draws a straight line from the current position to another position determined by displacement (dx, dy).
     * @public
     *
     * @param {number} dx
     * @param {number} dy
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToRelative( dx, dy ) {
      assert( this.currentPoint, 'Unknown current position. Make sure to call Shape.moveTo() to set the first point' );
      return this.lineTo( this.currentPoint.x + dx, this.currentPoint.y + dy );
    }

    /**
     * Draws a straight line from the current position to another position determined by displacement <dx, dy>.
     * @public
     *
     * @param {Vector} displacement
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToPointRelative( displacement ) { return this.lineToRelative( displacement.x, displacement.y ); }

    /**
     * Draws a horizontal line from the current position to the passed-in x-coordinate of the end point.
     * @public
     *
     * @param {number} x
     * @returns {Shape} - 'this' reference, for chaining
     */
    horizontalLineTo( x ) {
      assert( this.currentPoint, 'Unknown current position. Make sure to call Shape.moveTo() to set the first point' );
      return this.lineTo( x, this.currentPoint.y );
    }

    /**
     * Draws a horizontal line from the current position to the passed-in dx displacement of the end point.
     * @public
     *
     * @param {number} dx
     * @returns {Shape} - 'this' reference, for chaining
     */
    horizontalLineToRelative( dx ) {
      assert( this.currentPoint, 'Unknown current position. Make sure to call Shape.moveTo() to set the first point' );
      return this.horizontalLineTo( this.currentPoint.x + dx );
    }

    /**
     * Draws a vertical line from the current position to the passed-in y-coordinate of the end point.
     * @public
     *
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineTo( y ) {
      assert( this.currentPoint, 'Unknown current position. Make sure to call Shape.moveTo() to set the first point' );
      return this.lineTo( this.currentPoint.x, y );
    }

    /**
     * Draws a vertical line from the current position to the passed-in dy displacement of the end point.
     * @public
     *
     * @param {number} dy
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineToRelative( dy ) {
      assert( this.currentPoint, 'Unknown current position. Make sure to call Shape.moveTo() to set the first point' );
      return this.verticalLineTo( this.currentPoint.y + dy );
    }

    /**
     * Closes the Shape by drawing a straight line from the current position back to the first drawn point of the Shape.
     * @public
     *
     * @returns {Shape} - 'this' reference, for chaining
     */
    close() {
      assert( this._firstPoint, 'cannot close a Shape that has no drawing points.' );
      assert( !this.isClosed, 'cannot close a Shape twice.' );

      // Add the sub-path 'close' command to subpaths.
      this._subpaths.push( { cmd: 'Z' } );

      // Update the currentPoint and bounds to match the first drawn point.
      this.currentPoint.setX( this._firstPoint.x ).setY( this._firstPoint.y );
      this.bounds.includePoint( this._firstPoint );

      // Indicate that the Shape is now closed.
      this.isClosed = true;
      return this;
    }

    /**
     * Draws an arc revolved around the specified center position. Angles will be normalized (see normalizeAngle()).
     * @public
     *
     * @param {Vector} center - Center of rotation of the arc
     * @param {number} radius - how far from the center the arc will be
     * @param {number} startAngle - angle (in radians) of the start of the arc, relative to the horizontal
     * @param {number} endAngle - angle (in radians) of the end of the arc, relative to the horizontal
     * @param {boolean} [clockwise=true] - indicates if the arc should be drawn from the startAngle clockwise to the
     *                                     endAngle or counter-clockwise
     * @returns {Shape} - 'this' reference, for chaining
     */
    arc( center, radius, startAngle, endAngle, clockwise = false ) {
      assert( typeof radius === 'number' && isFinite( radius ) && radius >= 0, `invalid radius: ${ radius }` );
      assert( typeof startAngle === 'number' && isFinite( startAngle ), `invalid startAngle: ${ startAngle }` );
      assert( typeof endAngle === 'number' && isFinite( endAngle ), `invalid endAngle: ${ endAngle }` );
      assert( typeof clockwise === 'boolean', `invalid clockwise: ${ clockwise }` );
      assert( !this.isClosed, 'Cannot draw arc on a closed shape' );

      // Normalize angles (see normalizeAngle()) and adjust the endAngle (see adjustArcEndAngle())
      startAngle = normalizeAngle( startAngle );
      endAngle = adjustArcEndAngle( startAngle, normalizeAngle( endAngle ), clockwise );

      // Create a Vector that will be rotated to compute arc coordinates at specific angles, relative to the origin.
      const angleVector = new Vector( 0, radius );

      // Compute the starting and end points.
      const endPoint = center.copy().add( angleVector.setAngle( endAngle ) );
      const startPoint = center.copy().add( angleVector.setAngle( startAngle ) );
      const deltaAngle = clockwise ? startAngle - endAngle : endAngle - startAngle; // Always > 0

      // Update the bounds and _firstPoint reference on the first time something is drawn to the startPoint.
      if ( !this.bounds ) this.bounds = Bounds.withPoints( startPoint, startPoint );
      if ( !this._firstPoint ) { this.moveToPoint( startPoint ); this._firstPoint = startPoint.copy(); }
      if ( !this.currentPoint.equals( startPoint ) ) this.lineToPoint( startPoint );

      // Compute the largeArcFlag and sweepFlag. See https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands.
      const largeArcFlag = deltaAngle > Math.PI ? 1 : 0;
      const sweepFlag = clockwise ? 0 : 1;

      this._subpaths.push( { cmd: 'A', args: [ radius, radius, 0, largeArcFlag, sweepFlag, endPoint.x, endPoint.y ] } );
      this.currentPoint.set( endPoint ); // Update the currentPoint to the endPoint now that the arc has been added.

      // Update the bounds so that it includes both the startPoint and endPoint.
      this.bounds.includePoint( startPoint );
      this.bounds.includePoint( endPoint );

      // Function that updates bounds to include a point at a angle on the arc, ONLY if the arc contains that angle
      const includeBoundsAtAngle = angle => {
        // Only include the point if the arc contains the angle.
        if ( normalizeAngle( clockwise ? startAngle - angle : endAngle - angle ) <= deltaAngle ) {
          this.bounds.includePoint( center.copy().add( angleVector.setAngle( angle ) ) );
        }
      };

      // Update bounds to include all extreme points to ensure that the bounds contains the max/min points on the arc.
      includeBoundsAtAngle( 0 );
      includeBoundsAtAngle( Math.PI / 2 );
      includeBoundsAtAngle( Math.PI );
      includeBoundsAtAngle( 3 * Math.PI / 2 );
      return this;
    }

    /**
     * Creates a polygon by drawing lines to an array of vertices.
     * @public
     *
     * @param {Vector[]} vertices
     * @returns {Shape} - 'this' reference, for chaining
     */
    polygon( vertices ) {
      assert( !this.isClosed, 'Shape has already been closed' );

      const length = vertices.length;
      if ( length > 0 ) {
        this.moveToPoint( vertices[ 0 ] );
        for ( let i = 1; i < length; i++ ) { this.lineToPoint( vertices[ i ] ); }
      }
      return this.close();
    }

    /**
     * Gets the SVG d-attribute string for the Shape. See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d.
     * @public
     *
     * Although Shape supports relative placements (moveToRelative, lineToRelative ...), the getSVGPath() d-attribute
     * string will only use the base absolute upper-case commands and not the lower-case relative commands.
     *
     * @param {Vector} [origin=Vector.ZERO] - option to set the origin and translate the Shape path, for use in Path.
     * @param {number} [scale=1] - option to scale the Shape (usually to scale scenery coordinates to pixels).
     * @returns {string}
     */
    getSVGPath( origin = Vector.ZERO, scale = 1 ) {
      let result = '';
      this._subpaths.forEach( subpath => {
        if ( subpath.cmd === 'M' || subpath.cmd === 'L' ) {
          const args = subpath.args.slice();
          args[ 0 ] = ( args[ 0 ] + origin.x ) * scale;
          args[ 1 ] = ( args[ 1 ] + origin.y ) * scale;
          // Round each number in the subpaths to a maximum of 10 numbers to prevent exponentials.
          result += `${ subpath.cmd } ${ args.map( num => parseFloat( num.toFixed( 10 ) ) ).join( ' ' ) } `;
        }
        else if ( subpath.cmd === 'A' ) {
          const args = subpath.args.slice();
          args[ 0 ] = ( args[ 0 ] * scale );
          args[ 1 ] = ( args[ 1 ] * scale );
          args[ 5 ] = ( args[ 5 ] + origin.x ) * scale;
          args[ 6 ] = ( args[ 6 ] + origin.y ) * scale;
          // Round each number in the subpaths to a maximum of 10 numbers to prevent exponentials.
          result += `${ subpath.cmd } ${ args.map( num => parseFloat( num.toFixed( 10 ) ) ).join( ' ' ) } `;
        }
        else if ( subpath.cmd === 'Z' ) { result += 'Z '; }
        else { assert( false, `unrecognized command: ${ subpath.cmd }` ); }
      } );
      return result.trim();
    }

    /**
     * Returns an exact defensible copy of this Shape.
     * @public
     *
     * @returns {Shape}
     */
    copy() {
      return new Shape(
        this._subpaths.map( subpath => ( { cmd: subpath.cmd, args: subpath.args ? subpath.args.slice() : null } ) ),
        this.currentPoint ? this.currentPoint.copy() : null,
        this._firstPoint ? this._firstPoint.copy() : null,
        this.bounds ? this.bounds.copy() : null,
        this.isClosed
      );
    }

    /**
     * Transforms this Shape from model coordinates to view coordinates or vise versa, effectively scaling and flipping
     * the Shape. See ModelViewTransform and the comment at the top of the file for context.
     * This is for use in sim-core only.
     * @public (sim-core internal)
     *
     * @param {ModelViewTransform} modelViewTransform
     * @param {string} transformPrefix - indicates which conversion. Must be 'modelToView' || 'viewToModel'
     * @returns {Shape} 'this' reference, for chaining.
     */
    transform( modelViewTransform, prefix ) {
      assert( modelViewTransform instanceof ModelViewTransform, `invalid modelViewTransform: ${ modelViewTransform }` );
      assert( [ 'modelToView', 'viewToModel' ].includes( prefix ), `invalid prefix: ${ prefix }` );

      // Transform subpaths first.
      this._subpaths.forEach( subpath => {
        if ( subpath.cmd === 'M' || subpath.cmd === 'L' ) {
          subpath.args[ 0 ] = modelViewTransform[ prefix + 'X' ]( subpath.args[ 0 ] );
          subpath.args[ 1 ] = modelViewTransform[ prefix + 'Y' ]( subpath.args[ 1 ] );
        }
        else if ( subpath.cmd === 'A' ) {
          subpath.args[ 0 ] = Math.abs( modelViewTransform[ prefix + 'DeltaX' ]( subpath.args[ 0 ] ) );
          subpath.args[ 1 ] = Math.abs( modelViewTransform[ prefix + 'DeltaY' ]( subpath.args[ 1 ] ) );
          subpath.args[ 5 ] = modelViewTransform[ prefix + 'X' ]( subpath.args[ 5 ] );
          subpath.args[ 6 ] = modelViewTransform[ prefix + 'Y' ]( subpath.args[ 6 ] );
        }
      } );

      // Transform points and bounds.
      if ( this.currentPoint ) this.currentPoint = modelViewTransform[ prefix + 'Point' ]( this.currentPoint );
      if ( this._firstPoint ) this._firstPoint = modelViewTransform[ prefix + 'Point' ]( this._firstPoint );
      if ( this.bounds ) this.bounds = modelViewTransform[ prefix + 'Bounds' ]( this.bounds );
      return this;
    }
  }

  /*----------------------------------------------------------------------------*
   * Helper Functions
   *----------------------------------------------------------------------------*/
  /**
   * Helper function that 'normalizes' an angle (in radians) such that it is in the range [0, 2PI). For instance,
   * normalizeAngle( -10 * PI / 2 ) would return PI.
   *
   * @param {number} angle - in radians
   * @returns {number} - the 'normalized' angle
   */
  function normalizeAngle( angle ) {
    while ( angle < 0 ) angle += 2 * Math.PI;
    while ( angle > 2 * Math.PI ) angle -= 2 * Math.PI;
    return angle;
  }

  /**
   * Helper function that determines the actual end angle relative to the start angle such that
   *    (1) if counter-clockwise, endAngle is always greater than startAngle.
   *    (2) if clockwise, startAngle is always greater than endAngle.
   * @public
   *
   * @param {number} startAngle - must be a normalized angle
   * @param {number} endAngle - must be a normalized angle
   * @param {boolean} clockwise
   * @returns {number}
   */
  function adjustArcEndAngle( startAngle, endAngle, clockwise ) {
    if ( !clockwise ) return endAngle >= startAngle ? endAngle : endAngle + 2 * Math.PI;
    else return startAngle >= endAngle ? endAngle : endAngle - 2 * Math.PI;
  }

  return Shape;
} );