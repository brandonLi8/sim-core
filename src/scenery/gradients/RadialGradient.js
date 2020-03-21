// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * A radial gradient sub-type of Gradient.
 *
 * A RadialGradient refers to a to smooth transition of one color to another color along a radial circles.
 * RadialGradients can be applied as 'fills' and 'strokes' in Path and Text.
 *
 * Currently RadialGradients are constructed in terms of percentages along the local coordinate frame of a Path/Text.
 * However, there are plans to extend the functionality to allow for RadialGradients in terms of scenery coordinates.
 *
 * For a general background, see https://www.w3.org/TR/SVG/pservers.html#RadialGradients.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Gradient = require( 'SIM_CORE/scenery/gradients/Gradient' );

  class RadialGradient extends Gradient {

    /**
     * @param {number} centerX - x percentage of the center point of the largest circle, as a percentage
     * @param {number} centerY - y percentage of the center point of the largest circle, as a percentage
     * @param {number} [focalX=centerX] - x percentage of the focal point (where the gradient starts), as a percentage
     * @param {number} [focalY=centerY] - y percentage of the focal point (where the gradient starts), as a percentage
     * @param {number} [radius=50] - radius of the largest circle of the gradient, as a percentage.
     */
    constructor( centerX, centerY, focalX, focalY, radius = 50 ) {
      if ( !focalX ) focalX = centerX; // Default to the center
      if ( !focalY ) focalY = centerY; // Default to the center

      assert( typeof centerX === 'number' && centerX >= 0 && centerX <= 100, `invalid centerX: ${ centerX }` );
      assert( typeof centerY === 'number' && centerY >= 0 && centerY <= 100, `invalid centerY: ${ centerY }` );
      assert( typeof focalX === 'number' && focalX >= 0 && focalX <= 100, `invalid focalX: ${ focalX }` );
      assert( typeof focalY === 'number' && focalY >= 0 && focalY <= 100, `invalid focalY: ${ focalY }` );
      assert( typeof radius === 'number' && radius >= 0, `invalid radius: ${ radius }` );

      super( 'radialGradient' );

      // Set the attributes of our gradient element.
      this._definitionElement.addAttributes( {
        cx: `${ centerX }%`,
        cy: `${ centerY }%`,
        fx: `${ focalX }%`,
        fy: `${ focalY }%`,
        r: `${ radius }%`
      } );
    }
  }

  return RadialGradient;
} );