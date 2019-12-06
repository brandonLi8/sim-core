// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific Line node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Circle extends SVGNode {

    /**
     * @param {Vector} start
     * @param {Vector} end
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( start, end, options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );


      // Defaults for options.
      const defaults = {
        type: 'line',
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      this.start = start;
      this.end = end;
    }

    layout( scale ) {

      this.addAttributes( {
        x1: `${ scale * this.start.x }px`,
        y1: `${ scale * this.start.y }px`,
        x2: `${ scale * this.end.x }px`,
        y2: `${ scale * this.end.y }px`,
      } );
    }
  }

  return Circle;
} );