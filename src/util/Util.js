// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Utility static methods for sim-development.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  const Util = {
    /**
     * Returns the original value if it is inclusively within the [max,min] range. If it's below the range, min is
     * returned, and if it's above the range, max is returned.
     * @public
     *
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    clamp: ( value, min, max ) => {
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
     * Converts degrees to radians.
     * @public
     *
     * @param {number} degrees
     * @returns {number}
     */
    toRadians: function( degrees ) {
      return Math.PI * degrees / 180;
    },

    /**
     * Converts radians to degrees.
     * @public
     *
     * @param {number} radians
     * @returns {number}
     */
    toDegrees: function( radians ) {
      return 180 * radians / Math.PI;
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
    gcd: function( a, b ) {
      return Math.abs( b === 0 ? a : this.gcd( b, Util.mod( a, b ) ) );
    },

    /**
     * Least Common Multiple, https://en.wikipedia.org/wiki/Least_common_multiple
     * @public
     *
     * @param {number} a
     * @param {number} b
     * @returns {number} lcm, an integer
     */
    lcm: function( a, b ) {
      return Util.roundSymmetric( Math.abs( a * b ) / Util.gcd( a, b ) );
    },

    /**
     * Returns an array of the real roots of the quadratic equation $ax + b=0$, or null if every value is a solution.
     * @public
     *
     * @param {number} a
     * @param {number} b
     * @returns {Array.<number>|null} - The real roots of the equation, or null if all values are roots. If the root has
     *                                  a multiplicity larger than 1, it will be repeated that many times.
     */
    solveLinearRootsReal: function( a, b ) {
      if ( a === 0 ) {
        if ( b === 0 ) {
          return null;
        }
        else {
          return [];
        }
      }
      else {
        return [ -b / a ];
      }
    },

    /**
     * Returns an array of the real roots of the quadratic equation $ax^2 + bx + c=0$, or null if every value is a
     * solution. If a is nonzero, there should be between 0 and 2 (inclusive) values returned.
     * @public
     *
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @returns {Array.<number>|null} - The real roots of the equation, or null if all values are roots. If the root has
     *                                  a multiplicity larger than 1, it will be repeated that many times.
     */
    solveQuadraticRootsReal: function( a, b, c ) {
      // Check for a degenerate case where we don't have a quadratic, or if the order of magnitude is such where the
      // linear solution would be expected
      const epsilon = 1E7;
      if ( a === 0 || Math.abs( b / a ) > epsilon || Math.abs( c / a ) > epsilon ) {
        return Util.solveLinearRootsReal( b, c );
      }

      const discriminant = b * b - 4 * a * c;
      if ( discriminant < 0 ) {
        return [];
      }
      const sqrt = Math.sqrt( discriminant );
      // TODO: how to handle if discriminant is 0? give unique root or double it?
      // TODO: probably just use Complex for the future
      return [
        ( -b - sqrt ) / ( 2 * a ),
        ( -b + sqrt ) / ( 2 * a )
      ];
    },


    /**
     * Returns the unique real cube root of x, such that $y^3=x$.
     * @public
     *
     * @param {number} x
     * @returns {number}
     */
    cubeRoot: function( x ) {
      return x >= 0 ? Math.pow( x, 1 / 3 ) : -Math.pow( -x, 1 / 3 );
    },

    /**
     * Rounds using "Round half away from zero" algorithm. See dot#35.
     * @public
     *
     * JavaScript's Math.round is not symmetric for positive and negative numbers, it uses IEEE 754 "Round half up".
     * See https://en.wikipedia.org/wiki/Rounding#Round_half_up.
     * For sims, we want to treat positive and negative values symmetrically, which is IEEE 754 "Round half away from zero",
     * See https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
     *
     * Note that -0 is rounded to 0, since we typically do not want to display -0 in sims.
     *
     * @param {number} value                               `
     * @returns {number}
     */
    roundSymmetric: function( value ) {
      return ( ( value < 0 ) ? -1 : 1 ) * Math.round( Math.abs( value ) );
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
     * @returns {string}
     */
    toFixed: function( value, decimalPlaces ) {
      const multiplier = Math.pow( 10, decimalPlaces );
      const newValue = Util.roundSymmetric( value * multiplier ) / multiplier;
      return newValue.toFixed( decimalPlaces );
    },

    /**
     * A predictable implementation of toFixed, where the result is returned as a number instead of a string.
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
    toFixedNumber: function( value, decimalPlaces ) {
      return parseFloat( Util.toFixed( value, decimalPlaces ) );
    },

    /**
     * Returns whether the input is a number that is an integer (no fractional part).
     * @public
     *
     * @param {number} n
     * @returns {boolean}
     */
    isInteger: function( n ) {
      assert && assert( typeof n === 'number', 'isInteger requires its argument to be a number: ' + n );
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
    equalsEpsilon: function( a, b, epsilon ) {
      return Math.abs( a - b ) <= epsilon;
    },

    /**
     * Polyfill for Math.sign from MDN, see
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
     * @public
     *
     * We cannot use Math.sign because it is not supported on IE
     *
     * @param {number} x
     * @returns {number}
     */
    sign: function( x ) {
      return ( ( x > 0 ) - ( x < 0 ) ) || +x;
    },

    /**
     * Function that returns the hyperbolic cosine of a number
     * @public
     *
     * @param {number} value
     * @returns {number}
     */
    cosh: function( value ) {
      return ( Math.exp( value ) + Math.exp( -value ) ) / 2;
    },

    /**
     * Function that returns the hyperbolic sine of a number
     * @public
     *
     * @param {number} value
     * @returns {number}
     */
    sinh: function( value ) {
      return ( Math.exp( value ) - Math.exp( -value ) ) / 2;
    },

    /**
     * Log base-10, since it wasn't included in every supported browser.
     * @public
     *
     * @param {number} val
     * @returns {number}
     */
    log10: function( val ) {
      return Math.log( val ) / Math.LN10;
    },



    /**
     * Determines the number of decimal places in a value.
     * @param {number} value
     * @returns {number}
     */
    numberOfDecimalPlaces: function( value ) {
      let count = 0;
      let multiplier = 1;
      while ( ( value * multiplier ) % 1 !== 0 ) {
        count++;
        multiplier *= 10;
      }
      return count;
    },

    /**
     * Rounds a value to a multiple of a specified interval.
     * Examples:
     * roundToInterval( 0.567, 0.01 ) -> 0.57
     * roundToInterval( 0.567, 0.02 ) -> 0.56
     * roundToInterval( 5.67, 0.5 ) -> 5.5
     *
     * @param {number} value
     * @param {number} interval
     * @returns {number}
     */
    roundToInterval: function( value, interval ) {
      return Util.toFixedNumber( Util.roundSymmetric( value / interval ) * interval,
        Util.numberOfDecimalPlaces( interval ) );
    }
  };

  return Util;
} );