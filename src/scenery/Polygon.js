// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific Polygon node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );

  class Polygon extends SVGNode {

    /**
     * @param {Vector[]} points
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( points, options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );


      // Defaults for options.
      const defaults = {

        type: 'polygon'
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      this.points = points;
    }

    layout( scale ) {

      super.layout( scale );
      let pointStr = '';

      this.points.forEach( point => {
        pointStr += `${ point.x * scale },${ point.y * scale } `;
      } );
      this.addAttributes( {
        points: pointStr
      } );
    }
  }

  return Polygon;
} );