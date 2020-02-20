// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A sim-specific Text Node for scenery.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );

  class Text extends Node {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {

      // Some options are set by Text. Assert that they weren't provided.
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.type, 'Text sets type.' );
      assert( !options || !options.id || !options.class || !options.attributes, 'Text sets attributes' );

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

      this.addAttributes( {
        'font-weight': options.fontWeight,
        'fill': options.fill
      } );
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

        'font-size': `${ this.fontSize * scale }px`,
        'font-family': `${ this.fontFamily }`
      } );
    }
  }

  return Text;
} );