// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific VectorNode node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );
  const Polygon = require( 'SIM_CORE/scenery/Polygon' );
  const Vector = require( 'SIM_CORE/util/Vector' );


  class VectorNode extends Polygon {

    /**
     * @param {Vector} start
     * @param {Vector} end
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( start, end, options ) {

      // Defaults for options.
      const defaults = {
        headHeight: 12,
        headWidth: 12,
        tailWidth: 3,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      super( [], options );

      this.options = options;
      this.set( start, end );
    }

    set( start, end ) {
      this.points = [];
      if ( start.equalsEpsilon( end ) ) {
        return;
      }

      // create a vector representation of the arrow
      const vector = end.copy().subtract( start );
      const length = vector.magnitude;

      // start with the dimensions specified in options
      let headWidth = this.options.headWidth;
      let headHeight = this.options.headHeight;
      let tailWidth = this.options.tailWidth;

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

  return VectorNode;
} );