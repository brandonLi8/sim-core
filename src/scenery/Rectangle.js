// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Rectangle Node that displays a rectangular-box, with different widths, heights and cornerRadii.
 *
 * Rectangle inherits from Path to allow for different strokes, fills, shapeRenderings, etc.
 *
 * Currently, Rectangles are constructed by their width and height, but has several static Rectangle creators.
 * Possible ways of initiating Rectangles include:
 *   - new Rectangle( width, height, [options] );
 *   - Rectangle.withRect( x, y, width, height, [options] );
 *   - Rectangle.withBounds( bounds, [options] );
 * See the bottom portion of the file for documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const V = ( x, y ) => Vector.scratch.setXY( x, y ); // convenience function to return the scratch Vector with <x, y>

  class Rectangle extends Path {

    /**
     * Rectangles are constructed with their width and height. However, there are more ways of creating Rectangles
     * with its static methods. See the bottom portion of the file for documentation.
     *
     * @param {number} width - width of the rectangle.
     * @param {number} height - height of the rectangle.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( width, height, options ) {
      assert( typeof width === 'number' && width >= 0, `invalid width: ${ width }` );
      assert( typeof height === 'number' && height >= 0, `invalid height: ${ height }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.attributes, 'Rectangle sets attributes' );
      assert( !options || !options.width, 'width should be provided in the first argument' );
      assert( !options || !options.height, 'height should be provided in the first argument' );

      options = {

        // {number} - the corner radii of each corner of the Rectangle. See `set cornerRadius()` for more documentation.
        cornerRadius: 0,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      // At this point, set the width/height option to ensure correct ordering of mutator keys.
      options.width = width;
      options.height = height;

      super( null, options );

      // @private {number} - the corner radii of each corner of the Rectangle.
      this._cornerRadius = options.cornerRadius;
      super.shape = Rectangle._computeRectangleShape( this.bounds, this._cornerRadius );
    }

    /**
     * ES5 getters of the properties of this Rectangle.
     * @public
     *
     * @returns {number}
     */
    get cornerRadius() { return this._cornerRadius; }
    get width() { return super.width; }
    get height() { return super.height; }

    /**
     * Sets the corner radius of each corner of the Rectangle.
     * @public
     *
     * @param {number} cornerRadius.
     */
    set cornerRadius( cornerRadius ) {
      this._cornerRadius = cornerRadius;
      super.shape = Rectangle._computeRectangleShape( this.bounds, this._cornerRadius );
    }

    /**
     * Ensures that `set shape` is not called on a rectangle.
     * @public
     *
     * @param {Shape} shape
     */
    set shape( shape ) { assert( false, 'Rectangle sets shape' ); }

    /**
     * @override
     * Sets the width of the Rectangle, keeping the minX the same but expanding/contracting the right border.
     * Overridden to update the Rectangle's shape when the width changes.
     * @public
     *
     * @param {number} width
     */
    set width( width ) {
      if ( width === this._bounds.width ) return; // Exit if setting to the same width
      super.width = width;
      super.shape = Rectangle._computeRectangleShape( this.bounds, this._cornerRadius );
    }

    /**
     * @override
     * Sets the height of the Rectangle, keeping the minY the same but expanding/contracting the bottom maxY.
     * Overridden to update the Rectangle's shape when the height changes.
     * @public
     *
     * @param {number} height
     */
    set height( height ) {
      if ( height === this._bounds.height ) return; // Exit if setting to the same height
      super.height = height;
      super.shape = Rectangle._computeRectangleShape( this.bounds, this._cornerRadius );
    }

    /**
     * Returns a Shape of a rectangle with a specified cornerRadius.
     * @private
     *
     * @param {Bounds} bounds - the parent bounds of the Rectangle
     * @param {number} cornerRadius - the corner radius of the Rectangle
     * @returns {Shape}
     */
    static _computeRectangleShape( bounds, cornerRadius ) {

      // The maximum corner radius of the rectangle
      const maxCornerRadius = Math.min( bounds.width / 2, bounds.height / 2 );
      cornerRadius = Math.min( maxCornerRadius, cornerRadius );

      if ( cornerRadius ) {
        // Draw the Rectangle Shape with cornerRadii arcs. Use scratchVector to eliminate new Vector instances on
        // each arc call.
        return new Shape()
          .arc( V( bounds.minX + cornerRadius, bounds.minY + cornerRadius ), cornerRadius, Math.PI, -Math.PI / 2 )
          .horizontalLineTo( bounds.maxX - cornerRadius )
          .arc( V( bounds.maxX - cornerRadius, bounds.minY + cornerRadius ), cornerRadius, -Math.PI / 2, 0 )
          .verticalLineTo( bounds.maxY - cornerRadius )
          .arc( V( bounds.maxX - cornerRadius, bounds.maxY - cornerRadius ), cornerRadius, 0, Math.PI / 2 )
          .horizontalLineTo( bounds.minX + cornerRadius )
          .arc( V( bounds.minX + cornerRadius, bounds.maxY - cornerRadius ), cornerRadius, Math.PI / 2, Math.PI )
          .close();
      }
      else {
        return new Shape().moveTo( bounds.minX, bounds.minY )
                          .horizontalLineTo( bounds.maxX )
                          .verticalLineTo( bounds.maxY )
                          .horizontalLineTo( bounds.minX )
                          .close();
      }
    }

    /*----------------------------------------------------------------------------*
     * Static Rectangle Creators (see comment at the top of the file)
     *----------------------------------------------------------------------------*/

    /**
     * Creates a rectangle with the specified x, y, width, and height.
     * @public
     *
     * See Rectangle's constructor for detailed parameter information.
     *
     * @param {number} x - the left location of the Rectangle
     * @param {number} y - the top location of the Rectangle
     * @param {number} width
     * @param {number} height
     * @param {Object} [options]
     * @returns {Rectangle}
     */
    static withRect( x, y, width, height, options ) {
      return new Rectangle( width, height, { ...options, left: x, top: y } );
    }

    /**
     * Creates a rectangle with the specified bounds such that the x, y, width, and height matches the bounds.
     * In other words, the bounds will be considered the parent bounds of the Rectangle.
     * @public
     *
     * See Rectangle's constructor for detailed parameter information.
     *
     * @param {Bounds} bounds
     * @param {Object} [options]
     * @returns {Rectangle}
     */
    static withBounds( bounds, options ) {
      assert( bounds instanceof Bounds, `invalid bounds: ${ bounds }` );
      return Rectangle.withRect( bounds.minX, bounds.minY, bounds.width, bounds.height, options );
    }
  }

  // @protected @override {string[]} - setter names specific to Rectangle. See Path.MUTATOR_KEYS for documentation.
  Rectangle.MUTATOR_KEYS = [ 'cornerRadius', ...Path.MUTATOR_KEYS ];

  return Rectangle;
} );