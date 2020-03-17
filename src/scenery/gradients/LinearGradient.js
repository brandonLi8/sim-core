// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * A linear gradient sub-type of Gradient.
 *
 * A LinearGradient refers to a to smooth transition of one color to another color along a straight line.
 * LinearGradients can be applied as 'fills' and 'strokes' in Path and Text.
 *
 * Currently LinearGradients are constructed in terms of percentages along the local coordinate frame of a Path/Text.
 * However, there are plans to extend the functionality to allow for LinearGradients in terms of scenery coordinates.
 *
 * For a general background, see https://www.w3.org/TR/SVG/pservers.html#LinearGradients.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Gradient = require( 'SIM_CORE/scenery/gradients/Gradient' );

  class LinearGradient extends Gradient {

    /**
     * @param {number} x1 - x percentage of the start point in the local coordinate frame
     * @param {number} y1 - y percentage of the start point in the local coordinate frame
     * @param {number} x2 - x percentage of the end point in the local coordinate frame
     * @param {number} y2 - y percentage of the end point in the local coordinate frame
     */
    constructor( x1, y1, x2, y2 ) {
      assert( typeof x1 === 'number' && x1 >= 0 && x1 <= 100, `invalid x1: ${ x1 }` );
      assert( typeof y1 === 'number' && y1 >= 0 && y1 <= 100, `invalid x1: ${ y1 }` );
      assert( typeof x2 === 'number' && x2 >= 0 && x2 <= 100, `invalid x2: ${ x2 }` );
      assert( typeof y2 === 'number' && y2 >= 0 && y2 <= 100, `invalid y2: ${ y2 }` );

      super( 'linearGradient' );

      // Set the attributes of our gradient element.
      this._definitionElement.addAttributes( {
        x1: `${ x1 }%`,
        y1: `${ y1 }%`,
        x2: `${ x2 }%`,
        y2: `${ y2 }%`
      } );
    }
  }

  return LinearGradient;
} );