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
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const LineNode = require( 'SIM_CORE/scenery/LineNode' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Text = require( 'SIM_CORE/scenery/Text' );

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
        trackFill: 'rgb( 100, 100, 100 )',
        trackStroke: 'black',
        trackStrokeWidth: 1.5,
        trackSize: new Vector( 150, 2 ),
        trackCornerRadius: 0,

        // thumb
        thumbSize: new Vector( 12, 25 ),
        thumbFill: 'rgb( 50, 145, 184) ',
        thumbFillHover: 'rgb( 71, 207, 255 )',
        thumbStroke: 'black',
        thumbStrokeWidth: 1,
        thumbCenterLineStroke: 'white',
        thumbCornerRadius: 3,

        // ticks
        includeMajorTicks: true,
        minorTickIncrement: null, // must be smaller and the range's width must be exactly divisible by this
        majorTickLength: 35,
        majorTickStroke: 'black',
        majorTickStrokeWidth: 1.3,
        minorTickLength: 8,
        minorTickStroke: 'rgb( 50, 50, 50 )',
        minorTickStrokeWidth: 1,

        // other
        startDrag: null, // called when a drag sequence starts
        endDrag: null, // called when a drag sequence ends

        ...options
      };

      super( options );

      this._height = Math.max( options.majorTickLength, 2 * options.minorTickLength, options.thumbSize.y );
      this._width = options.trackSize.x + options.thumbSize.x + 2 * options.thumbStrokeWidth + options.majorTickStrokeWidth;
      const centerY = this._height / 2;
      const centerX = this._width / 2;

      //----------------------------------------------------------------------------------------
      // Create the Track
      const sliderTrack = new Rectangle( {
        width: options.trackSize.x,
        height: options.trackSize.y,
        fill: options.trackFill,
        y: centerY - options.trackSize.y / 2,
        x: centerX - options.trackSize.x / 2,
        stroke: options.trackStroke,
        strokeWidth: options.trackStrokeWidth,
        cornerRadius: options.trackCornerRadius,
        style: {
          cursor: 'pointer'
        }
      } );

      //----------------------------------------------------------------------------------------
      // Create the Major and Minor Ticks
      const tickNodes = [];
      const numberOfTicks = ( range.y - range.x ) / options.minorTickIncrement + 1;
      const tickSpacing = options.trackSize.x / ( numberOfTicks - 1 );

      for ( let i = 0; i < numberOfTicks; i++ ) {
        const isMajor = ( i === 0 || i === numberOfTicks - 1 );

        const start = new Vector(
          i * tickSpacing + sliderTrack.x,
          isMajor ? centerY - options.majorTickLength / 2 : centerY - options.minorTickLength
        );
        const end = new Vector(
          i * tickSpacing + sliderTrack.x,
          isMajor ? centerY + options.majorTickLength / 2 : centerY
        );

        const tick = new LineNode( start, end, {
          stroke: !isMajor ? options.minorTickStroke : options.majorTickStroke,
          strokeWidth: !isMajor ? options.minorTickStrokeWidth : options.majorTickStrokeWidth
        } );

        tickNodes.push( tick );
      }

      //----------------------------------------------------------------------------------------
      // Create the Slider Thumb
      const thumb = new Rectangle( {
        width: options.thumbSize.x,
        height: options.thumbSize.y,
        fill: options.thumbFill,
        y: centerY - options.thumbSize.y / 2,
        stroke: options.thumbStroke,
        strokeWidth: options.thumbStrokeWidth,
        cornerRadius: options.thumbCornerRadius,
        style: {
          cursor: 'pointer'
        }
      } );

      //----------------------------------------------------------------------------------------
      // Create a line in the center
      const thumbLineHeight = options.thumbSize.y * 0.75;
      const thumbLine = new LineNode(
        new Vector( 0, centerY - thumbLineHeight / 2 ),
        new Vector( 0, centerY + thumbLineHeight / 2 ), {
          stroke: options.thumbCenterLineStroke,
          strokeWidth: options.thumbSize.x * 0.08,
          style: {
            cursor: 'pointer'
          }
        } );

      //----------------------------------------------------------------------------------------
      // Create the Drag Logic
      let percentage;
      numberProperty.link( number => {
        percentage = ( number - range.x ) / ( range.y - range.x );
        thumb.x = percentage * ( options.trackSize.x  ) - options.thumbSize.x / 2 + sliderTrack.x;

        thumbLine.start.x = thumb.x + options.thumbSize.x / 2;
        thumbLine.end.x = thumb.x + options.thumbSize.x / 2;
      } );

      const startDrag = () => { options.startDrag && options.startDrag(); }
      const dragListener = ( displacement ) => {
        percentage += displacement.x / ( options.trackSize.x + options.majorTickStrokeWidth );
        percentage = Util.clamp( percentage, 0, 1 );
        numberProperty.value = percentage * ( range.y - range.x ) + range.x;
      };
      const endDrag = () => { options.endDrag && options.endDrag(); }

      thumb.drag( startDrag, dragListener, endDrag );
      thumbLine.drag( startDrag, dragListener, endDrag );

      //----------------------------------------------------------------------------------------
      // Create the logic when the track is clicked
      sliderTrack.mousedown = localPosition => {
        percentage = localPosition.x / ( options.trackSize.x + options.majorTickStrokeWidth );
        percentage = Util.clamp( percentage, 0, 1 );
        numberProperty.value = percentage * ( range.y - range.x ) + range.x;
      };

      //----------------------------------------------------------------------------------------
      // Create the Labels
      const leftLabel = new Text( {
        text: `${ range.x }`,
        x: sliderTrack.x,
        y: -10
      } );

      const rightLabel = new Text( {
        text: `${ range.y }`,
        x: sliderTrack.x + sliderTrack.width,
        y: -10
      } );

      //----------------------------------------------------------------------------------------
      const sliderContent = new SVGNode( {

        children: [ ...tickNodes, sliderTrack, thumb, thumbLine, leftLabel, rightLabel ],
        width: this._width,
        height: this._height
      } );

      this.addChild( sliderContent );
    }
  }

  return SliderNode;
} );