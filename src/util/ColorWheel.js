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
 *   - hsl        e.g. 'hsl(270, 60%, 70%)`
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

    /**
     * Shades a color string in any of the formats described above, by a factor percentage amount.
     *
     * Factor must be in the range [-1, 1]:
     *   If Factor > 0 : This will lighten the color so that it becomes brighter.
     *   If Factor < 0 : This will darken the color so that it becomes closer to black.
     *   If Factor is 0 the color will not change.
     *
     * @public
     * @param {string} color - the color string to shade
     * @param {number} factor - from -1 (black), to 0 (no change), to 1 (white)
     * @returns {string} - the shaded color
     */
    static shade( color, factor ) {
      assert( typeof color === 'string', `invalid color: ${ color }` );

      if ( factor === 0 ) return color; // return the color if the factor is 0

      // Convert the color to RGB
      let rgb;
      if ( color.includes( 'rgb' ) ) rgb = ColorWheel.parseRGB( color );
      if ( color.includes( 'hsl' ) ) rgb = ColorWheel.hslToRGBA( color );
      if ( color.includes( '#' ) ) rgb = ColorWheel.hexToRGBA( color );
      if ( ColorWheel.isKeyword( color ) ) rgb = ColorWheel.keywordToRGBA( color );
      assert( rgb, `invalid color: ${ color }` );

      // Apply the Shade algorithm
      if ( factor > 0 ) {
        const red = Math.min( 255, rgb[ 0 ] + Math.floor( factor * ( 255 - rgb[ 0 ] ) ) );
        const green = Math.min( 255, rgb[ 1 ] + Math.floor( factor * ( 255 - rgb[ 1 ] ) ) );
        const blue = Math.min( 255, rgb[ 2 ] + Math.floor( factor * ( 255 - rgb[ 2 ] ) ) );
        return ColorWheel.formatRGBString( red, green, blue, alpha );
      }
      else {
        const red = Math.max( 0, rgb[ 0 ] - Math.floor( -factor * rgb[ 0 ] ) );
        const green = Math.max( 0, rgb[ 1 ] - Math.floor( -factor * rgb[ 1 ] ) );
        const blue = Math.max( 0, rgb[ 2 ] - Math.floor( -factor * rgb[ 2 ] ) );
        return ColorWheel.formatRGBString( red, green, blue, alpha );
      }
    }

    /*----------------------------------------------------------------------------*
     * Color Detections
     *----------------------------------------------------------------------------*/
    /**
     * Detects if a Color string is in a specific format with regular expressions.
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
     * Color Conversions
     *----------------------------------------------------------------------------*/

    /**
     * Converts a hex string (like '#FA45') to rgba, returning each value in a array. Supports hex-alpha and shorthands.
     * @public
     *
     * @param {string} hex - the hex color string
     * @returns {string[]}
     */
    static hexToRGBA( hex ) {
      assert.enabled && assert( ColorWheel.isHex( hex ), `invalid hex: ${ hex }` );
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

    /**
     * Converts a hsl or hsla string (like 'hsl(270, 60%, 70%)') to rgba, returning each value in a array.
     * Conversion formula from http://en.wikipedia.org/wiki/HSL_color_space.
     * @public
     *
     * @param {string} hsl - the hsl color string
     * @returns {string[]}
     */
    static hslToRGBA( hsl ) {
      assert.enabled && assert( ColorWheel.isHSL( hsl ) || ColorWheel.isHSLA( hsl ), `invalid hsl: ${ hsl }` );
      const hslArray = ColorWheel._parseToArguments( hsl );
      const hue = ( parseFloat( hslArray[ 0 ] ) % 360 ) / 360;
      const saturation = Util.clamp( parseInt( hslArray[ 1 ].replace( '%', '' ) ) / 100, 0, 1 );
      const lightness = Util.clamp( parseInt( hslArray[ 2 ].replace( '%', '' ) ) / 100, 0, 1 );
      if ( hslArray.length === 3 )  hslArray.push( '1' );
      const alpha = hslArray[ 3 ].includes( '%' ) ?
                      Util.clamp( parseFloat( hslArray[ 3 ].replace( '%', '' ) ) / 100, 0, 1 ) :
                      Util.clamp( parseFloat( hslArray[ 3 ] ), 0, 1 );

      const m2 = lightness < 0.5 ? lightness * ( saturation + 1 ) : lightness + saturation - lightness * saturation;
      const m1 = lightness * 2 - m2;
      const hueToRGB = ( hue ) => {
        if ( hue < 0 ) hue += 1;
        if ( hue > 1 ) hue -= 1;
        if ( hue < 1 / 6 ) return m1 + ( m2 - m1 ) * 6 * hue;
        if ( hue < 1 / 2 ) return m2;
        if ( hue < 2 / 3 ) return m1 + ( m2 - m1 ) * ( 2 / 3 - hue ) * 6;
        return m1;
      };

      const r = Util.roundSymmetric( hueToRGB( hue + 1 / 3 ) * 255 );
      const g = Util.roundSymmetric( hueToRGB( hue ) * 255 );
      const b = Util.roundSymmetric( hueToRGB( hue - 1 / 3 ) * 255 );
      return [ r, g, b, alpha ];
    }

    /**
     * Converts a keyword color (like 'aqua') to rgba, returning each value in a array.
     * @public
     *
     * @param {string} color - the keyword color string
     * @returns {string[]}
     */
    static keywordToRGBA( color ) {
      assert.enabled && assert( ColorWheel.isKeyword( color ), `invalid keyword: ${ color }` );

      // Use a canvas test element to compute the color.
      ColorWheel._canvasContext.fillStyle = color;
      ColorWheel._canvasContext.fill();
      const imageData = ColorWheel._canvasContext.getImageData( 0, 0, 1, 1 ).data;
      return [ imageData[ 0 ], imageData[ 1 ], imageData[ 2 ], imageData[ 3 ] / 255 ];
    }

    /**
     * Converts a rgb or rgba string (like 'rgb( 203, 209, 109') to rgba, returning each value in a array.
     * @public
     *
     * @param {string} rgb - the rgb color string
     * @returns {string[]}
     */
    static parseRGB( rgb ) {
      assert.enabled && assert( ColorWheel.isRGB( rgb ) || ColorWheel.isRGBA( rgb ), `invalid rgb: ${ rgb }` );
      const rgbArray = ColorWheel._parseToArguments( rgb );
      if ( rgbArray.length === 3 ) rgbArray.push( '1' );

      return rgbArray.map( value => {
        return value.includes( '%' ) ? parseInt( value.replace( '%', '' ) / 100 ) : parseInt( value );
      } );
    }

    /**
     * Formats a RGB string, preferring rgb, but uses rgba if the alpha channel isn't 1
     * @public
     *
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @param {number} alpha
     * @returns {string}
     */
    static formatRGBString( red, green, blue, alpha ) {
      return alpha === 1 ? `rgb(${ red }, ${ green }, ${ blue })` : `rgba(${ red }, ${ green }, ${ blue }, ${ alpha })`;
    }

    //----------------------------------------------------------------------------------------

    /**
     * Parses a color string that is in functional notation (like rgb( r, g, b )) into an array of its arguments,
     * removing trailing/leading whitespace.
     * @private
     *
     * @param {string} color - the color string to parse
     * @return {string[]}
     */
    static _parseToArguments( color ) {
      return color.substring( color.indexOf( '(' ) + 1, color.indexOf( ')' ) ).split( ',' ).map( str => str.trim() );
    }

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