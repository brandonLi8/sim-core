// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A sim-specific Text node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );

  class Text extends SVGNode {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );


      // Defaults for options.
      const defaults = {

        type: 'text',
        fill: '#000000',
        stroke: 'rgba( 0, 0, 0, 0)',

        x: 0,
        y: 0,
        fontSize: 13.5,
        fontFamily: 'Arial, sans-serif',
        cornerRadius: 5,
        attributes: {
          'text-anchor': 'middle',
          'text-rendering': 'geometricPrecision',
          'shape-rendering': 'geometricPrecision',
          'text-antialiasing': true
        },
        fontWeight: 'normal'
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.attributes = { ...defaults.attributes, ...options.attributes };

      super( options );
      this._fontSize = options.fontSize;
      this._fontFamily = options.fontFamily;
      this._x = options.x;
      this._y = options.y;

      this.addAttributes( {
        'font-weight': options.fontWeight
      } );
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

    get fontSize() { return this._fontSize; }
    get fontFamily() { return this._fontFamily; }
    set fontSize( fontSize ) {
      this._fontSize = fontSize;
      this.layout( this.scale );
    }
    set fontFamily( fontFamily ) {
      this._fontFamily = fontFamily;
      this.layout( this.scale );
    }

    layout( scale ) {
      super.layout( scale );
      this.addAttributes( {
        x: `${ scale * this._x }px`,
        y: `${ scale * this._y }px`,
        'font-size': `${ this.fontSize * scale }px`,
        'font-family': `${ this.fontFamily }`
      } );
    }
  }

  return Text;
} );