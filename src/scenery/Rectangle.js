// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Rectangle Node that displays a rectangular-box, with different widths, heights and cornerRadii.
 *
 * Rectangle inherits from Path to allow for different strokes, fills, shapeRenderings, etc.
 *
 * Currently, Rectangles are constructed by their width and height, but has several static Rectangle creators.
 * Possible ways of initiating Rectangles include:
 *   - new Rectangle( width, height, [options] );
 *   - Rectangle.byRect( x, y, width, height, [options] );
 *   - Rectangle.byBounds( bounds, [options] );
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
    }

    /**
     * ES5 getter of the corner radius of each corner of the Rectangle.
     * @public
     *
     * @returns {number}
     */
    get cornerRadius() { return this._cornerRadius; }

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
    set shape( shape ) { assert( false, `cannot call set shape of a Rectangle` ); }

    // layout( scale ) {

    //   super.layout( scale );
    //   this.addAttributes( {
    //     x: `${ scale * this.x }px`,
    //     y: `${ scale * this.y }px`,
    //     rx: `${ scale * this.cornerRadius }px`,
    //     ry: `${ scale * this.cornerRadius }px`
    //   } );
    // }
    //
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
      cornerRadius = Math.min( cornerRadius );

      if ( cornerRadius ) {
        // Draw the Rectangle Shape with cornerRadii arcs.
        return new Shape().moveTo( bounds.minX + cornerRadius, bounds.minY + cornerRadius )
                          .lineToRelative( 0, 0 )
                          .arc( cornerRadius, Math.PI, -Math.PI / 2 )
                          .horizontalLineTo( bounds.maxX - cornerRadius )
                          .moveToRelative( 0, cornerRadius )
                          .arc( cornerRadius, -Math.PI / 2, 0 )
                          .verticalLineTo( bounds.maxY - cornerRadius )
                          .moveToRelative( -cornerRadius, 0 )
                          .arc( cornerRadius, 0, Math.PI / 2 )
                          .horizontalLineTo( bounds.minX + cornerRadius )
                          .moveToRelative( 0, -cornerRadius )
                          .arc( cornerRadius, Math.PI / 2, Math.PI )
                          .verticalLineTo( bounds.minY + cornerRadius )
                          .close()
      }
      else {
        return new Shape().moveTo( bounds.minX, bounds.minY )
                          .horizontalLineTo( bounds.maxX )
                          .verticalLineTo( bounds.maxY )
                          .horizontalLineTo( bounds.minX )
                          .close();
      }
    }
  }

  // @protected @override {string[]} - setter names specific to Rectangle. See Path.MUTATOR_KEYS for documentation.
  Rectangle.MUTATOR_KEYS = [ 'cornerRadius', ...Path.MUTATOR_KEYS ];

  return Rectangle;
} );