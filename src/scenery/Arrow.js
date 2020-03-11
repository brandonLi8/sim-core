// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Arrow Node that displays a single-headed pointy arrow shape, with different head widths, tail widths, etc.
 *
 * Arrow inherits from Path to allow for different strokes, fills, shapeRenderings, etc.
 *
 * Currently, Arrows are constructed by their tailX, tailY, tipX, tipY.
 * Possible ways of initiating Arrows include:
 *   - new Rectangle( tailX, tailY, tipX, tipY, [options] );
 *   - Rectangle.byPoints( tailX, tailY, tipX, tipY, [options] );
 * See the bottom portion of the file for documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Arrow extends Path {

    /**
     * @param {number} tailX - the x-coordinate of the tail of the arrow
     * @param {number} tailY - the y-coordinate of the tail of the arrow
     * @param {number} tipX - the x-coordinate of the tip of the arrow
     * @param {number} tipY - the y-coordinate of the tip of the arrow
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( tailX, tailY, tipX, tipY, options ) {
      assert( typeof tailX === 'number', `invalid tailX: ${ tailX }` );
      assert( typeof tailY === 'number' `invalid tailY: ${ tailY }` );
      assert( typeof tipX === 'number' `invalid tipX: ${ tipX }` );
      assert( typeof tipY === 'number' `invalid tipY: ${ tipY }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.attributes, 'Arrow sets attributes' );

      options = {

        headHeight: 12, // {number} - the head-height of the Arrow. See `set headHeight()`.
        headWidth: 12,  // {number} - the head-width of the Arrow. See `set headWidth()`.
        tailWidth: 3,   // {number} - the tail-width of the Arrow. See `set tailWidth()`.

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      super( options );

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      super( [], options );

      this.options = options;
      this.set( start, end );
    }

    set( start, end ) {
      this.points = [];
      if ( start.equalsEpsilon( end ) ) {
        this.layout( this.scale );
        return;
      }

      // create a vector representation of the arrow
      const vector = end.copy().subtract( start );
      const length = vector.magnitude;

      // start with the dimensions specified in options
      const headWidth = this.options.headWidth;
      let headHeight = this.options.headHeight;
      const tailWidth = this.options.tailWidth;

      // make sure that head height is less than arrow length
      headHeight = Math.min( headHeight, 0.99 * length );

      // Set up a coordinate frame that goes from the tail of the arrow to the tip.
      const xHatUnit = vector.copy().normalize();
      const yHatUnit = xHatUnit.copy().rotate( Math.PI / 2 );

      // Function to add a point to this.points
      const addPoint = ( xHat, yHat ) => {
        const x = xHatUnit.x * xHat + yHatUnit.x * yHat + start.x;
        const y = xHatUnit.y * xHat + yHatUnit.y * yHat + start.y;

        this.points.push( new Vector( x, y ) );
      };

      addPoint( 0, tailWidth / 2 );
      addPoint( length - headHeight, tailWidth / 2 );
      addPoint( length - headHeight, headWidth / 2 );
      addPoint( length, 0 );
      addPoint( length - headHeight, -headWidth / 2 );
      addPoint( length - headHeight, -tailWidth / 2 );
      addPoint( 0, -tailWidth / 2 );

      this.layout( this.scale );
    }
  }

  return Arrow;
} );