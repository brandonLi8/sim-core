// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A combination of utility static methods and references for sim-development.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );

  const Util = {

    //========================================================================================
    // Static References
    //========================================================================================

    // constants
    EPSILON: 1e-5,
    PHI: ( 1 + Math.sqrt( 5 ) ) / 2, // see https://en.wikipedia.org/wiki/Golden_ratio

    // conversion prefixes, in base units per unit bellow
    MICRO: 1e-6,
    MILLI: 0.001,
    BASE: 1,
    CENTI: 0.01,
    KILO: 1000,
    GIGA: 1e9,

    //----------------------------------------------------------------------------------------
    // Conversions
    //----------------------------------------------------------------------------------------

    /**
     * Converts degrees to radians.
     * @public
     *
     * @param {number} degrees
     * @return {number}
     */
    toRadians( degrees ) {
      return degrees * ( Math.PI / 180 ); // dimensional analysis: deg * (PI Rad / 180 Deg)
    },

    /**
     * Converts radians to degrees.
     * @public
     *
     * @param {number} radians
     * @returns {number}
     */
    toDegrees( radians ) {
      return radians * ( 180 / Math.PI ); // dimensional analysis: rad * (180 Deg / PI Rad)
    },

    /**
     * Converts from the base unit to a custom unit (see Static References).
     * For instance, to convert 3 meters to centimeters, call `Util.convertTo( 3, Util.CENTI );`
     * @public
     *
     * @param {number} value
     * @param {number} conversionFactor - in base units per custom unit
     * @returns {number}
     */
    convertTo( value, conversionFactor ) {
      return value / conversionFactor; // dimensional analysis: base units * ( custom units / base unit )
    },

    /**
     * Converts to the base unit from a a custom unit (see Static References).
     * For instance, to convert 300 centimeters to meters, call `Util.convertFrom( 300, Util.CENTI )`
     *
     * @param {number} value
     * @param {number} conversionFactor - in base units per custom unit
     * @returns {number}
     */
    convertFrom( value, conversionFactor ) {
      return value * conversionFactor; // dimensional analysis: custom units * ( base units / custom unit )
    },

    //----------------------------------------------------------------------------------------
    // Math Utilities
    //----------------------------------------------------------------------------------------

    /**
     * Returns the original value if it is inclusively within the [ max, min ] range. If it's below the range, min is
     * returned, and if it's above the range, max is returned.
     * @public
     *
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    clamp( value, min, max ) {
      if ( value < min ) {
        return min;
      }
      else if ( value > max ) {
        return max;
      }
      else {
        return value;
      }
    },

    /**
     * Greatest Common Divisor, using https://en.wikipedia.org/wiki/Euclidean_algorithm. See
     * https://en.wikipedia.org/wiki/Greatest_common_divisor
     * @public
     *
     * @param {number} a
     * @param {number} b
     * @returns {number}
     */
    gcd( a, b ) {
      return Math.abs( b === 0 ? a : this.gcd( b, a % b ) );
    },

    /**
     * Least Common Multiple, https://en.wikipedia.org/wiki/Least_common_multiple
     * @public
     *
     * @param {number} a
     * @param {number} b
     * @returns {number} lcm, an integer
     */
    lcm( a, b ) {
      return Util.roundSymmetric( Math.abs( a * b ) / Util.gcd( a, b ) );
    },

    /**
     * Returns an array of the real roots of the quadratic equation ax + b = 0, or null if every value is a solution.
     * @public
     *
     * @param {number} a
     * @param {number} b
     * @returns {number[]|null} - The real roots of the equation, or null if all values are roots. If the root has
     *                            a multiplicity larger than 1, it will be repeated that many times.
     */
    solveLinearRoots( a, b ) {
      if ( a === 0 ) {
        return ( b === 0 ) ? null : [];
      }
      else {
        return [ -b / a ];
      }
    },

    /**
     * Returns an array of the real roots of the quadratic equation ax^2 + bx + c = 0, or null if every value is a
     * solution. If a is nonzero, there should be between 0 and 2 (inclusive) values returned.
     * @public
     *
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @returns {number[]|null} - The real roots of the equation, or null if all values are roots. If the root has
     *                            a multiplicity larger than 1, it will be repeated that many times.
     */
    solveQuadraticRoots( a, b, c ) {
      // Check for a degenerate case where we don't have a quadratic
      if ( a === 0 ) { return Util.solveLinearRoots( b, c ); }

      const discriminant = b * b - 4 * a * c;
      if ( discriminant < 0 ) {
        return [];
      }
      else if ( discriminant === 0 ) {
        return [ -b / ( 2 * a ) ]
      }
      else {
        return [
          ( -b - Math.sqrt( discriminant ) ) / ( 2 * a ),
          ( -b + Math.sqrt( discriminant ) ) / ( 2 * a )
        ];
      }
    },

    /**
     * Returns the unique real cube root of x.
     * @public
     *
     * @param {number} x
     * @returns {number}
     */
    cubeRoot( x ) {
      return x >= 0 ? Math.pow( x, 1 / 3 ) : -Math.pow( -x, 1 / 3 );
    },

    /**
     * Rounds using "Round half away from zero" algorithm.
     * @public
     *
     * JavaScript's Math.round is not symmetric for positive and negative numbers, it uses IEEE 754 "Round half up".
     * See https://en.wikipedia.org/wiki/Rounding#Round_half_up.
     * To treat positive and negative values symmetrically, this method uses the IEEE 754 "Round half away from zero",
     * See https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
     *
     * Note that -0 is rounded to 0.
     *
     * @param {number} value                               `
     * @returns {number}
     */
    roundSymmetric( value ) {
      return Util.sign( value ) * Math.round( Math.abs( value ) );
    },

    /**
     * A predictable implementation of toFixed.
     * @public
     *
     * JavaScript's toFixed is notoriously buggy, behavior differs depending on browser,
     * because the spec doesn't specify whether to round or floor.
     * Rounding is symmetric for positive and negative values, see Util.roundSymmetric.
     *
     * @param {number} value
     * @param {number} decimalPlaces
     * @returns {number}
     */
    toFixed( value, decimalPlaces ) {
      const multiplier = Math.pow( 10, decimalPlaces );
      const newValue = Util.roundSymmetric( value * multiplier ) / multiplier;
      return parseFloat( newValue.toFixed( decimalPlaces ) );
    },

    /**
     * Returns whether the input is a number that is an integer (no fractional part), for IE support.
     * @public
     *
     * @param {number} n
     * @returns {boolean}
     */
    isInteger( n ) {
      assert( typeof n === 'number', 'isInteger requires its argument to be a number: ' + n );
      return n % 1 === 0;
    },

    /**
     * Returns true if two numbers are within epsilon of each other.
     *
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    equalsEpsilon( a, b, epsilon = Util.EPSILON ) {
      return Math.abs( a - b ) <= epsilon;
    },

    /**
     * Polyfill for Math.sign from MDN, see
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
     * @public
     *
     * @param {number} x
     * @returns {number}
     */
    sign( x ) {
      return ( ( x > 0 ) - ( x < 0 ) ) || +x;
    },

    //----------------------------------------------------------------------------------------
    // Elementary Functions
    //----------------------------------------------------------------------------------------

    /**
     * Function that returns the hyperbolic cosine of a number
     * @public
     *
     * @param {number} value
     * @returns {number}
     */
    cosh( value ) {
      return ( Math.exp( value ) + Math.exp( -value ) ) / 2;
    },

    /**
     * Function that returns the hyperbolic sine of a number
     * @public
     *
     * @param {number} value
     * @returns {number}
     */
    sinh( value ) {
      return ( Math.exp( value ) - Math.exp( -value ) ) / 2;
    },


    /**
     * Log base-10, since it wasn't included in every supported browser.
     * @public
     *
     * @param {number} val
     * @returns {number}
     */
    log10( val ) {
      return Math.log( val ) / Math.LN10;
    },

    //----------------------------------------------------------------------------------------
    // Miscellaneous Utilities
    //----------------------------------------------------------------------------------------

    /**
     * Determines the number of decimal places in a value.
     * @public
     *
     * @param {number} value
     * @returns {number}
     */
    numberOfDecimalPlaces( value ) {
      let count = 0;
      let multiplier = 1;
      while ( ( value * multiplier ) % 1 !== 0 ) {
        count++;
        multiplier *= 10;
      }
      return count;
    },

    /**
     * Determines if the passed value is a array type.
     * See http://stackoverflow.com/questions/4775722/javascript-check-if-object-is-array
     * @public
     *
     * @param {*} value
     * @returns {boolean}
     */
    isArray( value ) {
      return Object.prototype.toString.call( value ) === '[object Array]';
    },

    /**
     * Removes the first matching object from an Array. Errors if the item is not found in the array.
     * @public
     *
     * @param {*[]} array
     * @param {*} item - the item to remove from the array
     */
    arrayRemove( array, item ) {
      assert( Util.isArray( array ), `invalid array: ${ array }` );

      const index = array.indexOf( item );
      assert( index >= 0, `item, ${ item } not found in Array` );

      array.splice( index, 1 );
    },

    //----------------------------------------------------------------------------------------
    // String Utilities
    //----------------------------------------------------------------------------------------

    /**
     * Converts a string separated with dashes to camel case. For instance: Util.toCamelCase( 'foo-bar' ) -> 'fooBar'
     * See http://stackoverflow.com/questions/10425287/convert-string-to-camelcase-with-regular-expression
     *
     * @param {string} str - the input string
     * @returns {string}
     */
    toCamelCase( str ) {
      return str.toLowerCase().replace( /-(.)/g, ( match, group ) => {
        return group.toUpperCase();
      } );
    }
  };

  return Util;
} );