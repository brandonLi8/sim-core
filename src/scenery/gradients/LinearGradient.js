// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * A linear gradient sub-type of Gradient.
 *
 * A LinearGradient refers to a to smooth transition of one color to another color along a straight line.
 * LinearGradients can be applied as 'fills' and 'strokes' in Path and Text.
 *
 * For context, see https://www.w3.org/TR/SVG/pservers.html#LinearGradients.
 *
 * Currently, LinearGradients are constructed by their x1, x2, y1, y2, but has other static LinearGradients creators.
 * Possible ways of initiating LinearGradients include:
 *   - new LinearGradients( x1, x2, y1, y2 );
 *   - LinearGradients.withPoints( p1, p2 );
 *   - LinearGradients.withPercentages( x1, x2, y1, y2 );
 *
 * See the bottom portion of the file for documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Gradient = require( 'SIM_CORE/scenery/gradients/Gradient' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class LinearGradient extends Gradient {

    /**
     * @param {number} x1 - x-coordinate of the start point (percentage 0) in the local coordinate frame
     * @param {number} y1 - y-coordinate of the start point (percentage 0) in the local coordinate frame
     * @param {number} x2 - x-coordinate of the end point (percentage 100) in the local coordinate frame
     * @param {number} y2 - y-coordinate of the end point (percentage 100) in the local coordinate frame
     * @param {boolean} [isPercentages=false] - indicates if the coordinates above are in terms of percentages
     */
    constructor( x1, y1, x2, y2, isPercentages=false ) {
      assert( typeof x1 === 'number', `invalid x1: ${ x1 }` );
      assert( typeof y1 === 'number', `invalid x1: ${ y1 }` );
      assert( typeof x2 === 'number', `invalid x2: ${ x2 }` );
      assert( typeof y2 === 'number', `invalid y2: ${ y2 }` );

      super( 'linearGradient' );

      // Set the attributes of our gradient element.
      this._definitionElement.addAttributes( {
        x1: isPercentages ? `${ x1 }%` : x1,
        y1: isPercentages ? `${ y1 }%` : y1,
        x2: isPercentages ? `${ x2 }%` : x2,
        y2: isPercentages ? `${ x2 }%` : x2
      } );
    }

    /*----------------------------------------------------------------------------*
     * Static LinearGradient Creators
     *----------------------------------------------------------------------------*/

    /**
     * Creates a LinearGradient with two points.
     * @public
     *
     * @param {Vector} start
     * @param {Vector} end
     * @returns {LinearGradient}
     */
    static withPoints( start, end ) {
      assert( start instanceof Vector, `invalid start: ${ start }` );
      assert( end instanceof Vector, `invalid end: ${ end }` );
      return new LinearGradient( start.x, start.y, end.x, end.y );
    }

    /**
     * Creates a LinearGradient with percentages along the local coordinate frame.
     * @public
     *
     * @param {number} x1 - x percentage of the start point in the local coordinate frame
     * @param {number} y1 - y percentage of the start point in the local coordinate frame
     * @param {number} x2 - x percentage of the end point in the local coordinate frame
     * @param {number} y2 - y percentage of the end point in the local coordinate frame
     * @returns {LinearGradient}
     */
    static withPercentages( x1, y1, x2, y2 ) {
      return new LinearGradient(  x1, y1, x2, y2, true );
    }
  }

  return LinearGradient;
} );