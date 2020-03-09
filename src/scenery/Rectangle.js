// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Rectangle Node that displays a rectangular-box, with different widths and cornerRadii.
 *
 * The Rectangle Node inherits Path to allow for different strokes, fills, etc.
 *
 * Unlike other Node subtypes, Text will need to approximate its bounds based of the font and the text that is
 * displayed (see Text._approximateTextBounds()). However, this does not guarantee that all text-content is inside of
 * the returned bounds.
 *
 * While code comments attempt to describe the implementation clearly, fully understanding it may require some
 * general background. Some useful references include:
 *    - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
 *    - http://www.w3.org/TR/css3-fonts/
 *    - https://www.w3.org/TR/css-fonts-3/#propdef-font
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  // const Path = require( 'SIM_CORE/scenery/Path' );
  // const Shape = require( 'SIM_CORE/uti/Shape' );
  // constants
  const XML_NAMESPACE = 'http://www.w3.org/2000/svg';

  class Rectangle {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );


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