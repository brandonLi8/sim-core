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

  }



  return ColorWheel;
} );