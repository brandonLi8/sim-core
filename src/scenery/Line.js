// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Line Node that displays a straight line segment shape, with different starting and ending positions.
 *
 * Line inherits from Path to allow for different strokes, fills, shapeRenderings, etc.
 *
 * Currently, Lines are constructed by their x1, x2, y1, y2, but has other static Line creators.
 * Possible ways of initiating Lines include:
 *   - new Line( x1, x2, y1, y2, [options] );
 *   - Line.withPoints( p1, p2, [options] );
 * See the bottom portion of the file for documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Line extends Path {

    /**
     * Lines are constructed with their starting and ending coordinates. However, there is another way of creating Lines
     * with its static methods. See the bottom portion of the file for documentation.
     *
     * @param {number} x1 - the starting x-coordinate of the Line segment
     * @param {number} y1 - the starting y-coordinate of the Line segment
     * @param {number} x2 - the ending x-coordinate of the Line segment
     * @param {number} y2 - the ending y-coordinate of the Line segment
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. All options are
     *                             passed to the super class.
     */
    constructor( x1, y1, x2, y2, options ) {
      assert( typeof x1 === 'number', `invalid x1: ${ x1 }` );
      assert( typeof y1 === 'number', `invalid x1: ${ y1 }` );
      assert( typeof x2 === 'number', `invalid x2: ${ x2 }` );
      assert( typeof y2 === 'number', `invalid y2: ${ y2 }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.attributes, 'Line sets attributes' );

      // There are no options specific to Line. Pass options to super class.
      super( null, options );

      // @public {Vector} - create references to the coordinates of the start and end of the Line segment.
      this._start = new Vector( x1, y1 );
      this._end = new Vector( x2, y2 );
      this._updateLineShape();
    }

    /**
     * ES5 getters of properties specific to Line. Traditional Accessors methods aren't included to reduce the memory
     * footprint.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get start() { return this._start; }
    get end() { return this._end; }

    //----------------------------------------------------------------------------------------

    /**
     * Sets the start coordinate of the Line.
     * @public
     *
     * @param {Vector} start
     */
    set start( start ) {
      if ( start.equals( this._start ) ) return; // Exit if setting to the same 'start'
      assert( start instanceof Vector, `invalid start: ${ start }` );
      this._start.set( start );
      this._updateLineShape();
    }

    /**
     * Sets the end coordinate of the Line.
     * @public
     *
     * @param {Vector} end
     */
    set end( end ) {
      if ( end.equals( this._end ) ) return; // Exit if setting to the same 'end'
      assert( end instanceof Vector, `invalid end: ${ end }` );
      this._end.set( end );
      this._updateLineShape();
    }

    /**
     * Sets the start x-coordinate of the Line.
     * @public
     *
     * @param {number} startX
     */
    set startX( startX ) {
      if ( startX === this.start.x ) return; // Exit if setting to the same 'startX'
      assert( typeof startX === 'number', `invalid startX: ${ startX }` );
      this._start.setX( startX );
      this._updateLineShape();
    }

    /**
     * Sets the start y-coordinate of the Line.
     * @public
     *
     * @param {number} startY
     */
    set startY( startY ) {
      if ( startY === this.start.x ) return; // Exit if setting to the same 'startY'
      assert( typeof startY === 'number', `invalid startY: ${ startY }` );
      this._start.setY( startY );
      this._updateLineShape();
    }

    /**
     * Sets the end x-coordinate of the Line.
     * @public
     *
     * @param {number} endX
     */
    set endX( endX ) {
      if ( endX === this.end.x ) return; // Exit if setting to the same 'endX'
      assert( typeof endX === 'number', `invalid endX: ${ endX }` );
      this._end.setX( endX );
      this._updateLineShape();
    }

    /**
     * Sets the end x-coordinate of the Line.
     * @public
     *
     * @param {number} endY
     */
    set endY( endY ) {
      if ( endY === this.end.x ) return; // Exit if setting to the same 'endY'
      assert( typeof endY === 'number', `invalid endY: ${ endY }` );
      this._end.setY( endY );
      this._updateLineShape();
    }

    /**
     * Ensures that `set shape` is not called on a rectangle.
     * @public
     *
     * @param {Shape} shape
     */
    set shape( shape ) { assert( false, 'Line sets shape' ); }

    /**
     * Generates a Line shape and updates the shape of this Line. Called when a property or the Line that is
     * displayed is changed, resulting in a different Line Shape.
     * @private
     */
    _updateLineShape() {
      // Must be a valid Line Node.
      if ( this._start && this._end ) {
        if ( this._start.equalsEpsilon( this._end ) ) super.shape = null; // Set to null shape if the same start and end

        // Generate the Line Shape.
        super.shape = new Shape().moveToPoint( this._start ).lineToPoint( this._end );
      }
    }

    /**
     * Creates a line with two points.
     * @public
     *
     * See Line's constructor for detailed parameter information.
     *
     * @param {Vector} start
     * @param {Vector} end
     * @param {Object} [options]
     * @returns {Line}
     */
    static withPoints( start, end, options ) {
      assert( start instanceof Vector, `invalid start: ${ start }` );
      assert( end instanceof Vector, `invalid end: ${ end }` );
      return new Line( start.x, start.y, end.x, end.y, options );
    }
  }

  // @protected @override {string[]} - setter names specific to Line. See Path.MUTATOR_KEYS for documentation.
  Line.MUTATOR_KEYS = Path.MUTATOR_KEYS;

  return Line;
} );