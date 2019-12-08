// Copyright © 2019 Brandon Li. All rights reserved.

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
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );


      // Defaults for options.
      const defaults = {

        type: 'text',
        fill: 'black',
        x: 0,
        y: 0,
        fontSize: 13.5,
        fontFamily: 'Arial, sans-serif',
        cornerRadius: 5,
        attributes: {
          'text-anchor': 'middle',
          'text-rendering': 'geometricPrecision'
        },
        fontWeight: 'normal'
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.attributes = { ...defaults.attributes, ...options.attributes };

      super( options );
      this.fontSize = options.fontSize;
      this.fontFamily = options.fontFamily;
      this.x = options.x;
      this.y = options.y;

      this.addAttributes( {
        'font-weight': options.fontWeight
      } );
    }

    layout( scale ) {
      super.layout( scale );
      this.addAttributes( {
        x: `${ scale * this.x }px`,
        y: `${ scale * this.y }px`,
        'font-size': `${ this.fontSize * scale }px`,
        'font-family': `${ this.fontFamily }`
      } );
    }
  }

  return Text;
} );