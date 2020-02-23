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

    /**
     * NOTE: Arguments are used for the copy() method and are optional.
     *       If used, ensure that all arguments are consistent with subpaths.
     *       Otherwise, create a Shape by constructing with no arguments and use the methods to describe the shape.
     *
     * @param {Array.<Object>} [subpaths] - for use in the copy() method only.
     * @param {Vector} [currentPoint] - for use in the copy() method only.
     * @param {Vector} [firstPoint] - for use in the copy() method only.
     * @param {Bounds} [bounds] - for use in the copy() method only.
     * @param {boolean} [isDegenerate] - for use in the copy() method only.
     * @param {boolean} [isClosed] - for use in the copy() method only.
     */
    constructor( subpaths, currentPoint, firstPoint, bounds, isDegenerate, isClosed ) {

      // @private {Array.<Object>} - array of the paths that make up the shape. The path Object literal has 2 mappings:
      //                               (1) cmd: {string} the d-attribute command letter.
      //                               (2) args: {number[]} the arguments to the cmd, in the correct ordering.
      this._subpaths = subpaths || [];

      // @private {Vector} - the first known position of the path. Null means unknown, and will be set in moveTo().
      this._firstPoint = firstPoint || null;

      // @public (read-only) {Vector} - the current position of the path. Null means unknown, and must be set in moveTo().
      this.currentPoint = currentPoint || null;

      // @public (read-only) {Bounds} - the smallest Bounds that contains the entire drawn Shape. Null means unknown.
      this.bounds = bounds || null;

      // @public (read-only) - indicates if the Shape is empty or not, meaning if has at least one sub-path and a known
      //                       bounds. Must not be degenerate for use in Path and ModelViewTransform.
      this.isDegenerate = isDegenerate || true;

      // @public (read-only) - indicates if the Shape close() method has been called, meaning the Shape is no longer
      //                       mutable.
      this.isClosed = isClosed || false;
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
        // Update the currentPoint which is now known, centered around the passed-in coordinate.
        this.currentPoint = new Vector( x, y );

        // This Shape is no longer degenerate as it has at least one sub-path and a finite Bounds.
        this.isDegenerate = false;
      }
      else {
        // The Shape wasn't degenerate before, and already contains a _firstPoint reference. Update the currentPoint.
        // Moving to a position doesn't update the bounds unless something is drawn, so the bounds isn't touched.
        this.currentPoint.setX( x ).setY( y );
      }
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
     * Moves the current position a relative displacement (dx, dy) relative to the last known position.
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveToRelative( dx, dy ) { return this.moveTo( this.currentPoint.x + dx, this.currentPoint.y + dy ); }

    /**
     * Moves the current position a relative displacement (dx, dy) relative to the last known position.
     * @public
     *
     * @param {Vector} displacement
     * @returns {Shape} - 'this' reference, for chaining
     */
    moveToPointRelative( displacement ) { return this.moveToRelative( displacement.x, displacement.y ); }

    /**
     * Draws a straight line from the current position to the given coordinate (x, y).
     * If the Shape doesn't have a current position defined, it will draw a line from (0, 0) to the specified coordinate.
     * @public
     *
     * @param {number} x
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineTo( x, y ) {
      assert( typeof x === 'number' && isFinite( x ), `invalid x: ${ x }` );
      assert( typeof y === 'number' && isFinite( y ), `invalid y: ${ y }` );
      assert( !this.isClosed, 'Shape has already been closed' );

      // If the shape is degenerate (implies no first point defined yet), move to the origin first.
      this.isDegenerate && this.moveTo( 0, 0 );

      if ( !this._firstPoint ) this._firstPoint = this.currentPoint.copy();
      if ( !this.bounds ) this.bounds = Bounds.withPoints( this.currentPoint, this.currentPoint );

      // Update bounds to include the currentPoint, which is the starting point of the line here.
      this.bounds.includePoint( this.currentPoint );

      // Create a sub-path that creates a line to the end point based off the path spec.
      this._subpaths.push( { cmd: 'L', args: [ x, y ] } );

      // Update the currentPoint and bounds to match the passed-in end coordinate of the line.
      this.currentPoint.setX( x ).setY( y );
      this.bounds.includePoint( this.currentPoint );
      return this;
    }

    /**
     * Draws a straight line from the current position to the given point (x, y).
     * If the Shape doesn't have a current position defined, it will draw a line from (0, 0) to the specified point.
     * @public
     *
     * @param {Vector} point
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToPoint( point ) { return this.lineTo( point.x, point.y ); }

    /**
     * Draws a straight line from the current position to another position determined by displacement (dx, dy).
     * If the Shape doesn't have a current position defined, it will draw a line from (0, 0) to the displacement.
     * @public
     *
     * @param {number} dx - horizontal displacement
     * @param {number} dy - vertical displacement
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToRelative( dx, dy ) { return this.lineTo( this.currentPoint.x + dx, this.currentPoint.y + dy ); }

    /**
     * Draws a straight line from the current position to another position determined by displacement (dx, dy).
     * If the Shape doesn't have a current position defined, it will draw a line from (0, 0) to the displacement.
     * @public
     *
     * @param {Vector} displacement
     * @returns {Shape} - 'this' reference, for chaining
     */
    lineToPointRelative( displacement ) { return this.lineToRelative( displacement.x, displacement.y ); }

    /**
     * Draws a horizontal line from the current position to the passed-in x of the end point.
     * @public
     *
     * @param {number} x
     * @returns {Shape} - 'this' reference, for chaining
     */
    horizontalLineTo( x ) { return this.lineTo( x, this.currentPoint.y ); }

    /**
     * Draws a horizontal line from the current position to the passed-in dx displacement of the end point.
     * @public
     *
     * @param {number} dx
     * @returns {Shape} - 'this' reference, for chaining
     */
    horizontalLineToRelative( dx ) { return this.horizontalLineTo( this.currentPoint.x + dx ); }

    /**
     * Draws a vertical line from the current position to the passed-in y of the end point.
     * @public
     *
     * @param {number} y
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineTo( y ) { return this.lineTo( this.currentPoint.x, y ); }

    /**
     * Draws a vertical line from the current position to the passed-in dy displacement of the end point.
     * @public
     *
     * @param {number} dy
     * @returns {Shape} - 'this' reference, for chaining
     */
    verticalLineToRelative( dy ) { return this.verticalLineTo( this.currentPoint.y + dy ); }

    /**
     * Closes the shape by drawing a straight line from the current position back to the first point of the shape.
     * @public
     *
     * @returns {Shape} - 'this' reference, for chaining
     */
    close() {
      assert( !this.isDegenerate, 'cannot close degenerate shape' );
      assert( this._firstPoint, 'cannot close a shape that has no drawing points' );

      // Create the sub-path argument.
      this._subpaths.push( { cmd: 'Z' } );

      // Update the currentPoint and bounds to match the end point.
      this.currentPoint.setX( this._firstPoint.x ).setY( this._firstPoint.y );
      this.bounds.includePoint( this.currentPoint );

      this.isClosed = true;
      return this;
    }

    /**
     * Draws an arc, revolved around the current position. If the current position isn't defined, will draw the arc
     * around (0, 0). Angles will be normalized.
     * @public
     *
     * @param {number} radius - how far from the center the arc will be
     * @param {number} startAngle - angle (in radians) of the start of the arc, relative to the horizontal
     * @param {number} endAngle - angle (in radians) of the end of the arc, relative to the horizontal
     * @param {boolean} [clockwise=true] - indicates if the arc should be drawn from the startAngle clockwise to the
     *                                     endAngle or counter-clockwise
     * @returns {Shape} - 'this' reference, for chaining
     */
    arc( radius, startAngle, endAngle, clockwise = false ) {
      assert( typeof radius === 'number' && isFinite( radius ), `invalid radius: ${ radius }` );
      assert( typeof startAngle === 'number' && isFinite( startAngle ), `invalid startAngle: ${ startAngle }` );
      assert( typeof endAngle === 'number' && isFinite( endAngle ), `invalid endAngle: ${ endAngle }` );
      assert( typeof clockwise === 'boolean', `invalid clockwise: ${ clockwise }` );
      assert( !this.isClosed, 'Shape has already been closed' );

      startAngle = normalizeAngle( startAngle );
      endAngle = computeActualEndAngle( startAngle, normalizeAngle( endAngle ) );

      // If the shape is degenerate (implies no first point defined yet), move to the origin first.
      this.isDegenerate && this.moveTo( 0, 0 );

      if ( !this.bounds ) this.bounds = Bounds.withPoints( this.currentPoint, this.currentPoint );

      const center = this.currentPoint.copy(); // Reference the currentPoint as the center before moving.

      // Create a Vector that will be rotated to compute coordinates at specific angles, relative to the origin.
      const angleVector = new Vector( 0, radius );

      // Compute the starting and end points.
      const endPoint = center.copy().add( angleVector.setAngle( endAngle ) );
      const startPoint = center.copy().add( angleVector.setAngle( startAngle ) );

      if ( !this._firstPoint ) this._firstPoint = startPoint.copy();

      // Move the shape to the starting point, from where the arc will start.
      this.moveToPoint( startPoint );

      // Compute the largeArcFlag and sweepFlag. See https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands.
      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
      const sweepFlag = clockwise ? 0 : 1;

      // Create and add the arc sub-path.
      this._subpaths.push( { cmd: 'A', args: [ radius, radius, 0, largeArcFlag, sweepFlag, endPoint.x, endPoint.y ] } );

      // Update the currentPoint to the endPoint now that the arc has been added.
      this.currentPoint = endPoint;

      // Update the bounds so that it includes both the startPoint and endPoint.
      this.bounds.includePoint( startPoint );
      this.bounds.includePoint( endPoint );

      // Function that updates bounds to include a point at a specific angle on the arc, if the arc contains that angle
      const includeBoundsAtAngle = angle => {
        if ( clockwise ? angle >= endAngle && angle <= startAngle : angle <= endAngle && angle >= startAngle ) {
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
        for ( let i = 1; i < length; i++ ) {
          this.lineToPoint( vertices[ i ] );
        }
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
     * @returns {string}
     */
    getSVGPath() {
      let result = '';
      this._subpaths.forEach( subpath => {
        if ( [ 'M', 'L', 'A' ].includes( subpath.cmd ) ) {
          // Round each number in the subpaths to a maximum of 10 numbers to prevent exponentials.
          const argsString = subpath.args.map( num => parseFloat( num.toFixed( 10 ) ) ).join( ' ' );
          result += `${ subpath.cmd } ${ argsString } `;
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
        this._subpaths.map( subpath => { return { cmd: subpath.cmd, args: subpath.args.slice() }; } ),
        this.currentPoint ? this.currentPoint.copy() : null,
        this._firstPoint ? this._firstPoint.copy() : null,
        this.bounds ? this.bounds.copy() : null,
        this.isDegenerate,
        this.isClosed );
    }

    /**
     * Transforms this Shape from view coordinates to model coordinates, effectively scaling and flipping the Shape.
     * See ModelViewTransform and the comment at the top of the file for context. This is for use in sim-core only.
     * @public (sim-core internal)
     *
     * @param {ModelViewTransform} modelViewTransform
     * @returns {Shape} 'this' reference, for chaining.
     */
    transformToModel( modelViewTransform ) {

      // Transform subpaths first.
      this._subpaths.forEach( subpath => {
        if ( subpath.cmd === 'M' || subpath.cmd === 'L' ) {
          subpath.args[ 0 ] = modelViewTransform.viewToModelX( subpath.args[ 0 ] );
          subpath.args[ 1 ] = modelViewTransform.viewToModelY( subpath.args[ 1 ] );
        }
        else if ( subpath.cmd === 'A' ) {
          subpath.args[ 0 ] = modelViewTransform.viewToModelDeltaX( subpath.args[ 0 ] );
          subpath.args[ 1 ] = modelViewTransform.viewToModelDeltaY( subpath.args[ 1 ] );
          subpath.args[ 5 ] = modelViewTransform.viewToModelX( subpath.args[ 5 ] );
          subpath.args[ 6 ] = modelViewTransform.viewToModelY( subpath.args[ 6 ] );
        }
      } );

      // Transform points and bounds.
      if ( this.currentPoint ) this.currentPoint = modelViewTransform.viewToModelPoint( this.currentPoint );
      if ( this._firstPoint ) this._firstPoint = modelViewTransform.viewToModelPoint( this._firstPoint );
      if ( this.bounds ) this.bounds = modelViewTransform.viewToModelBounds( this.bounds );
      return this;
    }

    /**
     * Transforms this Shape from model coordinates to view coordinates, effectively scaling and flipping the Shape.
     * See ModelViewTransform and the comment at the top of the file for context. This is for use in sim-core only.
     * @public (sim-core internal)
     *
     * @param {ModelViewTransform} modelViewTransform
     * @returns {Shape} 'this' reference, for chaining.
     */
    transformToView( modelViewTransform ) {

      // Transform subpaths first.
      this._subpaths.forEach( subpath => {
        if ( subpath.cmd === 'M' || subpath.cmd === 'L' ) {
          subpath.args[ 0 ] = modelViewTransform.modelToViewX( subpath.args[ 0 ] );
          subpath.args[ 1 ] = modelViewTransform.modelToViewY( subpath.args[ 1 ] );
        }
        else if ( subpath.cmd === 'A' ) {
          subpath.args[ 0 ] = modelViewTransform.modelToViewDeltaX( subpath.args[ 0 ] );
          subpath.args[ 1 ] = modelViewTransform.modelToViewDeltaY( subpath.args[ 1 ] );
          subpath.args[ 5 ] = modelViewTransform.modelToViewX( subpath.args[ 5 ] );
          subpath.args[ 6 ] = modelViewTransform.modelToViewY( subpath.args[ 6 ] );
        }
      } );

      // Transform points and bounds.
      if ( this.currentPoint ) this.currentPoint = modelViewTransform.modelToViewPoint( this.currentPoint );
      if ( this._firstPoint ) this._firstPoint = modelViewTransform.modelToViewPoint( this._firstPoint );
      if ( this.bounds ) this.bounds = modelViewTransform.modelToViewBounds( this.bounds );
      return this;
    }
  }

  /*----------------------------------------------------------------------------*
   * Helper Functions
   *----------------------------------------------------------------------------*/
  /**
   * Helper function that 'normalizes' an angle (in radians) to be in the range [0, 2PI). For instance,
   * normalizeAngle( -10 * PI / 2 ) would return PI.
   *
   * @param {number} angle - in radians
   * @returns {number} - the 'normalized' angle
   */
  function normalizeAngle( angle ) {
    while ( angle < 0 ) angle += 2 * Math.PI;
    while ( angle > 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  }

  /**
   * Helper function that determines the actual end angle relative to the start angle such that endAngle
   * is always greater than startAngle.
   * @public
   *
   * @param {number} startAngle - must be a normalized angle
   * @param {number} endAngle - must be a normalized angle
   * @returns {number}
   */
  function computeActualEndAngle( startAngle, endAngle ) {
    return endAngle >= startAngle ? endAngle : endAngle + 2 * Math.PI;
  };

  return Shape;
} );