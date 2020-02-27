// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * A numerical bounding Range utility class, represented as <min, max>.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Range {

    /**
     * @param {number} min - the minimum value of the range
     * @param {number} max - the maximum value of the range
     */
    constructor( min, max ) {
      assert( typeof min === 'number', `invalid min: ${ min }` );
      assert( typeof max === 'number', `invalid max: ${ max }` );

      // @private {number} - See the parameter descriptions
      this._min = min;
      this._max = max;
    }

    /**
     * Debugging string for the Range.
     * @public
     *
     * @returns {string}
     */
    toString() { return `Range[ min: ${ this._min }, max: ${ this._max } ]`; }

    /**
     * Exact equality comparison between this range and another range.
     * @public
     *
     * @param {Range} other
     * @returns {boolean} - whether the two ranges are equal
     */
    equals( other ) {
      return other instanceof Range && this.min === other.min && this.max === other.max;
    }

    /**
     * Approximate equality comparison between this range and another range.
     * @public
     *
     * @param {Range} other
     * @param [number] epsilon
     * @returns {boolean} - whether the two ranges are within epsilon of each other
     */
    equalsEpsilon( other, epsilon = Util.EPSILON ) {
      if ( !( other instanceof Range ) ) return false; // Must be type Range to be equal

      // Check that all properties approximately match for both this instance and the other instance.
      return [ 'min', 'max' ].every( property => {

        // Approximate equality only applies on finite values. Otherwise, they must be strictly equal.
        if ( isFinite( this[ property ] ) && isFinite( other[ property ] ) ) {
          return Math.abs( this[ property ] - other[ property ] ) <= epsilon;
        }
        else {
          return other[ property ] === this[ property ];
        }
      } );
    }

    /**
     * Accessors to properties.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    getMin() { return this._min; }
    getMax() { return this._max; }
    get min() { return this.getMin(); }
    get max() { return this.getMax(); }

    /**
     * Gets the length of the range.
     * @public
     *
     * @returns {number}
     */
    getLength() { return this.max - this.min; }
    get length() { return this.getLength(); }

    /**
     * Gets the center value of this range, ie. the average value of the maximum and minimum value of this range.
     * @public
     *
     * @returns {number}
     */
    getCenter() { return ( this._max + this._min ) / 2; }
    get center() { return this.getCenter(); }

    /**
     * Whether our properties are all finite numbers.
     * @public
     *
     * @returns {boolean}
     */
    isFinite() { return isFinite( this.min ) && isFinite( this.max ); }

    /**
     * Whether the range contains a length that is 0.
     * @public
     *
     * @returns {boolean}
     */
    isEmpty() { return this.getLength() === 0; }

    /**
     * Determines if this range contains a specified value.
     * @public
     *
     * @param {number} value
     * @returns {boolean}
     */
    contains( value ) { return ( value >= this._min ) && ( value <= this._max ); }

    /**
     * Gets the closest value inside the range. If the value is inside the range, the value will be returned.
     * Otherwise, this will return a value on the edge of the range that is closest to the provided value.
     * @public
     *
     * @param {number} value
     * @returns {number}
     */
    closestTo( value ) {
      assert( typeof value === 'number', `invalid value: ${ value }` );
      if ( this.contains( value ) ) return value;

      return Math.max( Math.min( value, this.max ), this.min );
    }

    /**
     * Whether this range completely contains the range passed as a parameter.
     * @public
     *
     * @param {Range} range
     * @returns {boolean}
     */
    containsRange( range ) {
      assert( range instanceof Range, `invalid range: ${ range }` );
      return this._min <= range.min && this._max >= range.max;
    }

    /**
     * Whether this and another range have any values of intersection (including touching boundaries).
     * @public
     *
     * @param {Range} range
     * @returns {boolean}
     */
    intersects( range ) {
      assert( range instanceof Range, `invalid range: ${ range }` );
      return ( this._max >= range.min ) && ( range.max >= this._min );
    }

    /**
     * Creates a copy of this range.
     * @public
     *
     * @returns {Range}
     */
    copy() { return new Range( this.min, this.max ); }

    /**
     * Gets the smallest range that contains both this range and the input range.
     * @public
     *
     * @param {Range} range
     * @returns {Range}
     */
    union( range ) {
      assert( range instanceof Range, `invalid range: ${ range }` );
      return new Range( Math.min( this.min, range.min ), Math.max( this.max, range.max ) );
    }

    /**
     * The smallest range that is contained by both this range and the input range.
     * @public
     *
     * @param {Range} range
     * @returns {Range}
     */
    intersection( range ) {
      assert( range instanceof Range, `invalid range: ${ range }` );
      return new Range( Math.max( this.min, range.min ), Math.min( this.max, range.max ) );
    }

    //========================================================================================
    // Mutators
    //========================================================================================

    /**
     * Sets the value of min.
     * @public
     *
     * @param {number} min
     * @returns {Range} - for chaining
     */
    setMin( min ) {
      assert( typeof min === 'number', `invalid min: ${ min }` );
      this._min = min;
      return this;
    }
    set min( min ) { this.setMin( min ); }

    /**
     * Sets the value of max.
     * @public
     *
     * @param {number} max
     * @returns {Range} - for chaining
     */
    setMax( max ) {
      assert( typeof max === 'number', `invalid max: ${ max }` );
      this._max = max;
      return this;
    }
    set max( max ) { this.setMax( max ); }

    /**
     * Sets each value for this range.
     * @public
     *
     * @param {number} min
     * @param {number} max
     * @returns {Range} - for chaining
     */
    setMinMax( min, max ) {
      this.setMin( min );
      this.setMax( max );
      return this;
    }

    /**
     * Rounds each the edges of this range with Util.roundSymmetric.
     * @public
     *
     * @returns {Range} - for chaining
     */
    roundSymmetric() { return this.setMinMax( Util.roundSymmetric( this.min ), Util.roundSymmetric( this.max ) ); }

    /**
     * Expands this range on both sides by the specified amount.
     * @public
     *
     * @param {number} amount
     * @returns {Range} - for chaining
     */
    dilate( amount ) {
      assert( typeof amount === 'number', `invalid amount: ${ amount }` );
      return this.expand( amount, amount );
    }

    /**
     * Contracts this range on both sides by the specified amount.
     * @public
     *
     * @param {number} amount
     * @returns {Range} - for chaining
     */
    erode( amount ) { return this.dilate( -amount ); }

    /**
     * Expands this range independently for each side (or if some offsets are negative, will contract those sides).
     * @public
     *
     * @param {number} min - Amount to expand to the min (subtracts from min)
     * @param {number} max - Amount to expand to the max (adds to max)
     * @returns {Range} - for chaining
     */
    expand( min, max ) {
      assert( typeof min === 'number', `invalid min: ${ min }` );
      assert( typeof max === 'number', `invalid max: ${ max }` );
      return this.setMinMax( this.min - min, this.max + max );
    }

    /**
     * Translates our range by a specified value.
     * @public
     *
     * @param {number} amount
     * @returns {Range} - for chaining
     */
    shift( amount ) {
      assert( typeof amount === 'number', `invalid amount: ${ amount }` );
      return this.expand( -amount, amount );
    }

    /**
     * Modifies this range so that it contains both its original range and the input range.
     * This is the mutable form of the `union()` method.
     * @public
     *
     * @param {Range} range
     * @returns {Range}
     */
    includeRange( range ) {
      assert( range instanceof Range, `invalid range: ${ range }` );
      return this.setMinMax( Math.min( this.min, range.min ), Math.max( this.max, range.max ) );
    }

    /**
     * Modifies this range so that it is smallest range that is contained by both the original range and the input range
     * This is the mutable form of the `intersection()` method.
     * @public
     *
     * @param {Range} range
     * @returns {Range}
     */
    intersectRange( range ) {
      assert( range instanceof Range, `invalid range: ${ range }` );
      return this.setMinMax( Math.max( this.min, range.min ), Math.min( this.max, range.max ) );
    }
  }

  //========================================================================================
  // Static Constants
  //========================================================================================

  // @public {Range} ZERO - a static Range that represents an empty Range with 0 length.
  Range.ZERO = new Range( 0, 0 );

  // @public {Range} EVERYTHING - a static Range that contains all real numbers.
  Range.EVERYTHING = new Range( Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY );

  // Conditionally freeze Range.ZERO and Range.EVERYTHING to ensure that they are constant.
  Util.deepFreeze( Range.ZERO );
  Util.deepFreeze( Range.EVERYTHING );

  return Range;
} );