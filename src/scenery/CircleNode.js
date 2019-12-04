// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific Circle node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const XML_NAMESPACE = 'http://www.w3.org/2000/svg';

  class Circle extends SVGNode {

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

        type: 'circle',
        namespace: XML_NAMESPACE,

        radius: 0,
        center: Vector.ZERO,
        setViewBox: false
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      this.addAttributes( {
        r: options.radius, // In percentage of the container.
        cx: options.center.x, // Center the circle
        cy: options.center.y // Center the circle
      } );

    }

  }

  return Circle;
} );