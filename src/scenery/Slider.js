// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Slider Node that displays a numeric slider, with slider thumb, track, and tick customizability.
 *
 * A slider is a simulation component which, most notably, contains a so-called "slider thumb." The slider thumb is a
 * rounded Rectangle that can be dragged laterally to change the numeric value of a Property, within a provided Range.
 * The slider moves left-to-right, where dragging the thumb all the way to the left sets the Property to the minimum
 * value in the range and, likewise, dragging the thumb to the far right sets the number Property to the max value in.
 *
 * The slider thumb always lies vertically on a horizontal line, called the "slider track," which allows the user to
 * visualize the range of the numeric Property. Additionally, the slider track may have vertical lines that space
 * laterally across the slider track to indicate increments across the numeric Range, if specified in options.
 * See the `addMajorTick()` and `addMinorTick()` methods.
 *
 * Slider has a vast options API so that you can specify exactly how the slider should look.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DragListener = require( 'SIM_CORE/scenery/events/DragListener' );
  const Line = require( 'SIM_CORE/scenery/Line' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Range = require( 'SIM_CORE/util/Range' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Slider extends Node {

    /**
     * @param {Range} range - the numeric range to constrain the setting of numberProperty
     * @param {Property.<number>} numberProperty - the number property to change when the slider thumb is dragged.
     *                                             The current value must be already inside the passed-in range.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code
     *                             where the options are set in the early portion of the constructor for details.
     */
    constructor( range, numberProperty, options ) {
      assert( range instanceof Range, `invalid range: ${ range }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.style, 'Slider sets attributes' );
      assert( numberProperty instanceof Property && typeof numberProperty.value === 'number',
        `invalid numberProperty: ${ numberProperty }` );

      options = {

        // track
        trackFill: '#646464',   // {string} - the fill color the the slider track
        trackStroke: 'black',   // {string} - the stroke color of the slider track
        trackStrokeWidth: 1.5,  // {number} - the stroke width of the slider track
        trackHeight: 2,         // {number} - the height of the track, in scenery coordinates
        trackWidth: 180,        // {number} - the width of the track, in scenery coordinates
        trackCornerRadius: 0,   // {number} - the corner radius of the track

        // thumb
        thumbWidth: 12,                  // {number} - the width of the thumb Rectangle
        thumbHeight: 25,                 // {number} - the height of the thumb Rectangle
        thumbFill: '#3291B8',            // {string} - the fill color of the thumb Rectangle
        thumbFillHighlighted: '#47CFFF', // {string} - the fill color of the thumb when it is highlighted or hovered
        thumbStroke: 'black',            // {string} - the stroke color of the thumb Rectangle
        thumbStrokeWidth: 1,             // {number} - the stroke width of the line that runs through the thumb
        thumbCenterLineStroke: 'white',  // {string} - the stroke color of the line that runs through the thumb
        thumbCornerRadius: 3,            // {number} - the corner radius of the thumb Rectangle

        // ticks
        majorTickHeight: 35,        // {number} - the height of the major tick lines that lie along the track
        majorTickStroke: 'black',   // {string} - the stroke color of the major tick lines that lie along the track
        majorTickStrokeWidth: 1.3,  // {number} - the stroke width the major tick lines that lie along the track
        minorTickHeight: 8,         // {number} - the height of the minor tick lines that lie along the track
        minorTickStroke: '#323232', // {string} - the stroke color of the minor tick lines that lie along the track
        minorTickStrokeWidth: 1,    // {number} - the stroke width of the minor tick lines that lie along the track

        // other
        startDrag: null,  // {function} - if provided, this will be called when the slider drag sequence starts.
        endDrag: null,    // {function} - if provided, this will be called when the slider drag sequence ends.
        constrain: null,  // {function(number):number} - if provided, this will called before the numberProperty is set
                          //                             to constrain the value. The return value will be the new value.

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      super( options );

      this.height = Math.max( options.majorTickHeight, 2 * options.minorTickHeight, options.thumbSize.y );
      this.width = options.trackSize.x + options.thumbSize.x + 2 * options.thumbStrokeWidth;
      const centerY = this.height / 2;
      const centerX = this.width / 2;

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
          isMajor ? centerY - options.majorTickHeight / 2 : centerY - options.minorTickHeight
        );
        const end = new Vector(
          i * tickSpacing + sliderTrack.x,
          isMajor ? centerY + options.majorTickHeight / 2 : centerY
        );

        const tick = new Line( start, end, {
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
      const thumbLine = new Line(
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
        thumb.x = percentage * ( options.trackSize.x ) - options.thumbSize.x / 2 + sliderTrack.x;

        thumbLine.start = thumbLine.start.setX( thumb.x + options.thumbSize.x / 2 );
        thumbLine.end = thumbLine.end.setX( thumbLine.start.x );
      } );

      const startDrag = () => { options.startDrag && options.startDrag(); };
      const dragListener = ( displacement ) => {
        percentage += displacement.x / ( options.trackSize.x + options.majorTickStrokeWidth );
        percentage = Util.clamp( percentage, 0, 1 );
        numberProperty.value = percentage * ( range.y - range.x ) + range.x;
      };
      const endDrag = () => { options.endDrag && options.endDrag(); };

      thumb.drag( { start: startDrag, end: endDrag, listener: dragListener } );
      thumbLine.drag( { start: startDrag, end: endDrag, listener: dragListener } );

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
        text: options.leftLabel ? options.leftLabel : `${ range.x }`,
        x: sliderTrack.x,
        y: -10
      } );

      const rightLabel = new Text( {
        text: options.rightLabel ? options.rightLabel : `${ range.y }`,
        x: sliderTrack.x + sliderTrack.width,
        y: -10
      } );

      //----------------------------------------------------------------------------------------
      const sliderContent = new SVGNode( {

        children: [ ...tickNodes, sliderTrack, thumb, thumbLine, leftLabel, rightLabel ],
        width: this.width,
        height: this.height
      } );

      this.addChild( sliderContent );
    }
  }

  return Slider;
} );