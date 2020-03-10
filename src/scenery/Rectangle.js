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
  const Shape = require( 'SIM_CORE/uti/Shape' );

  class Rectangle {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( typeof width === 'number' && width >= 0, `invalid width: ${ width }` );
      assert( typeof height === 'number' && height >= 0, `invalid height: ${ height }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.attributes, 'Rectangle sets attributes' );
      assert( !options || !options.width, 'width should be provided in the first argument' );
      assert( !options || !options.height, 'height should be provided in the first argument' );



      // Defaults for options.
      const defaults = {

        type: 'rect',
        namespace: XML_NAMESPACE,

        x: 0,
        y: 0,
        cornerRadius: 0
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      // super( options );

      this._x = options.x;
      this._y = options.y;
      this._cornerRadius = options.cornerRadius;
    }

    get y() { return this._y; }
    get x() { return this._x; }

    set y( y ) {
      this._y = y;
      this.layout( this.scale );
    }
    set x( x ) {
      this._x = x;
      this.layout( this.scale );
    }

    get cornerRadius() { return this._cornerRadius; }

    set cornerRadius( cornerRadius ) {
      this._cornerRadius = cornerRadius;
      this.layout( this.scale );
    }
    layout( scale ) {

      super.layout( scale );
      this.addAttributes( {
        x: `${ scale * this.x }px`,
        y: `${ scale * this.y }px`,
        rx: `${ scale * this.cornerRadius }px`,
        ry: `${ scale * this.cornerRadius }px`
      } );
    }
  }

  return Rectangle;
} );