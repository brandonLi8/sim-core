// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Color Wheel is a utility class for shading, highlighting, and converting colors in a variety of formats.
 * Before using ColorWheel, it is important to be familiar with CSS color strings. See
 * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value for the official specification.
 *
 * Color Wheel is designed to work with most CSS color strings, including:
 *   - rgb        e.g. 'rgb(104, 200, 82)' or 'rgb( 104%, 50%, 80% )'
 *   - rgba       e.g. 'rgb(104, 200, 82, 0.7)'
 *   - hex        e.g. '#1BC4FD', '#DDD'
 *   - hex-alpha  e.g. '#1BC4FDF2', '#DDDA'
 *   - hsl        e.g. 'hsl(270 60% 70%)`
 *   - hsla       e.g. 'hsla(240, 100%, 50%, 0.7)'
 *   - keywords   e.g. 'aqua', 'transparent', etc.
 *
 * NOTE: Currently, Color Wheel doesn't support space-separated values in functional notation. Additionally,
 *       the first parameter of HSL and HSLA (hue) must be unit-less (in degrees).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Util = require( 'SIM_CORE/util/Util' );

  // constants
  const FORMAT_PARSERS = {
    rgb: /^rgb\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*\)$/,
    rgba: /^rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d+|\d*\.\d+%?)\s*\)$/,
    hex: /^#((?:[A-Fa-f0-9]{2}){3,4}|(?:[A-Fa-f0-9]{1}){3,4})$/,
    hsl: /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/,
    hsla: /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d+|\d*\.\d+%?)\s*\)$/,
    keyword: /^[a-z]+$/
  };

  class ColorWheel {


    /*----------------------------------------------------------------------------*
     * Detects if a Color is in a specific format
     *----------------------------------------------------------------------------*/
    /**
     * Detects of a Color string is in a specific format with regular expressions.
     * @public
     *
     * @param {string} color - a CSS color string
     * @returns {boolean}
     */
    static isRGB( color ) { return FORMAT_PARSERS.rgb.test( color ); }
    static isRGBA( color ) { return FORMAT_PARSERS.rgba.test( color ); }
    static isHex( color ) { return FORMAT_PARSERS.hex.test( color ); }
    static isHSL( color ) { return FORMAT_PARSERS.hsl.test( color ); }
    static isHSLA( color ) { return FORMAT_PARSERS.hsla.test( color ); }
    static isKeyword( color ) {
      if ( !ColorWheel._testElement ) ColorWheel._initializeColorTesting();
      ColorWheel._testElement.style.background = null;
      ColorWheel._testElement.style.background = color;

      return FORMAT_PARSERS.keyword.test( color ) && !!ColorWheel._testElement.style.background.length;
    }

    /*----------------------------------------------------------------------------*
     * Conversions from formats
     *----------------------------------------------------------------------------*/

    /**
     * Converts a hex string (like '#FA45') to rgba, returning each value in a array. Supports hex-alpha and shorthands.
     * @public
     *
     * @param {string} hex - the hex color string
     * @returns {string[]}
     */
    static hexToRGBA( hex ) {
      assert( ColorWheel.isHex( hex ), `invalid hex: ${ hex }` );
      hex = hex.replace( '#', '' ); // Remove the '#'

      // Expand shorthand form of hex
      if ( hex.length === 3 || hex.length === 4 ) hex = [ ...hex ].map( char => char + char ).join( '' );

      // Expand to full #RRGGBBAA format
      if ( hex.length === 6 ) hex += 'FF';

      // Convert to RGBA using parseInt
      const array = [ 0, 1, 2 ].map( i => parseInt( hex.substring( 2 * i, ( i + 1 ) * 2 ), 16 ) )
      array.push( parseInt( hex.substring( 6, 8 ), 16 ) / 255 ); // Alpha channel should be from 0 to 1
      return array;
    }

    static keywordToRGBA( color ) {
      assert( ColorWheel.isKeyword( color ), `invalid keyword: ${ color }` );

      // Use a canvas test element to compute the color.
      ColorWheel._canvasContext.fillStyle = color;
      ColorWheel._canvasContext.fill();
      const imageData = ColorWheel._canvasContext.getImageData( 0, 0, 1, 1 ).data;
      return [ imageData[ 0 ], imageData[ 1 ], imageData[ 2 ], imageData[ 3 ] / 255 ];
    }

    //----------------------------------------------------------------------------------------
    /**
     * Static method that initializes containers and elements for testing keyword colors.
     * @private
     */
    static _initializeColorTesting() {

      // Create a test element to test if colors are valid.
      ColorWheel._testElement = new DOMObject();

      // Create a canvas element to compute the value of colors.
      const canvasElement = new DOMObject( { type: 'canvas' } );
      ColorWheel._canvasContext = canvasElement.element.getContext( '2d' );
      ColorWheel._canvasContext.rect( 0, 0, 1, 1 );
    }
  }

  // @private {DOMObject} - Test DOMObject element, used to test if keyword colors are valid.
  ColorWheel._testElement;

  // @private {CanvasRenderingContext2D} - Test canvas context, used to compute the rgb value of keyword colors.
  ColorWheel._canvasContext;

  return ColorWheel;
} );