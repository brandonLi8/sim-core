// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific Rectangle node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );

  // constants
  const XML_NAMESPACE = 'http://www.w3.org/2000/svg';

  class Rectangle extends SVGNode {

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

        type: 'rect',
        namespace: XML_NAMESPACE,

        x: 0,
        y: 0,
        cornerRadius: 0
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      this.x = options.x;
      this.y = options.y;
      this.cornerRadius = options.cornerRadius;
    }

    layout( scale ) {

      super.layout( scale );
      this.addAttributes( {
        x: `${ scale * this.x }px`,
        y: `${ scale * this.y }px`,
        rx: `${ scale * this.cornerRadius }px`,
        ry: `${ scale * this.cornerRadius }px`,
      } );
    }
  }

  return Rectangle;
} );