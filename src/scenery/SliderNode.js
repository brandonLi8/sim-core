// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific node for Sliders.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class SliderNode extends Node {

    /**
     * @param {Vector} range
     * @param {Property.<number>} numberProperty - must be already inside the range
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( range, numberProperty, options ) {

      assert( range instanceof Vector, `invalid range: ${ range }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // track
        trackFill: 'black',
        trackStroke: 'black',
        trackStrokeWidth: 1,
        trackCornerRadius: 0,

        // thumb
        thumbSize: new Vector( 12, 25 ),
        thumbFill: 'rgb( 50, 145, 184) ',
        thumbFillHover: 'rgb( 71, 207, 255 )',
        thumbStroke: 'black',
        thumbStrokeWidth: 1,
        thumbCenterLineStroke: 'white',

        // ticks
        tickLabelIncrement: null, // must be smaller and the range's width must be exactly divisible by this
        includeMajorTicks: true,
        majorTickLength: 20,
        majorTickStroke: 'black',
        majorTickStrokeWidth: 1,
        minorTickLength: 10,
        minorTickStroke: 'black',
        minorTickStrokeWidth: 1,

        // other
        startDrag: null, // called when a drag sequence starts
        endDrag: null, // called when a drag sequence ends

        ...options
      };


    }
  }

  return SliderNode;
} );