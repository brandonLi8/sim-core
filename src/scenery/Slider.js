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
  const HoverListener = require( 'SIM_CORE/scenery/events/HoverListener' );
  const Line = require( 'SIM_CORE/scenery/Line' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const PressListener = require( 'SIM_CORE/scenery/events/PressListener' );
  const Property = require( 'SIM_CORE/util/Property' );
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
        trackFill: '#BCBCBC',   // {string} - the fill color the the slider track
        trackStroke: 'black',   // {string} - the stroke color of the slider track
        trackStrokeWidth: 1.5,  // {number} - the stroke width of the slider track
        trackHeight: 3.5,       // {number} - the height of the track, in scenery coordinates
        trackWidth: 180,        // {number} - the width of the track, in scenery coordinates
        trackCornerRadius: 0,   // {number} - the corner radius of the track

        // thumb
        thumbWidth: 12,                  // {number} - the width of the thumb Rectangle
        thumbHeight: 25,                 // {number} - the height of the thumb Rectangle
        thumbFill: '#89FF53',            // {string} - the fill color of the thumb Rectangle
        thumbFillHighlighted: '#47CFFF', // {string} - the fill color of the thumb when it is highlighted or hovered
        thumbStroke: 'black',            // {string} - the stroke color of the thumb Rectangle
        thumbStrokeWidth: 1,             // {number} - the stroke width of the line that runs through the thumb
        thumbCenterLineStroke: '#333',   // {string} - the stroke color of the line that runs through the thumb
        thumbCenterLineYMargin: 3,       // {number} - the vertical margin from the top of the thumb for the center line
        thumbCornerRadius: 2.5,          // {number} - the corner radius of the thumb Rectangle

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

      //----------------------------------------------------------------------------------------

      // @private {Rectangle} - create the slider Track. See the comment at the top of the file for context.
      this._track = new Rectangle( options.trackWidth, options.trackHeight, {
        fill: options.trackFill,
        stroke: options.trackStroke,
        strokeWidth: options.trackStrokeWidth,
        cornerRadius: options.trackCornerRadius,
        cursor: 'pointer'
      } );

      // @private {Rectangle} - create the slider thumb Rectangle.
      this._thumbRectangle = new Rectangle( options.thumbWidth, options.thumbHeight, {
        fill: options.thumbFill,
        stroke: options.thumbStroke,
        strokeWidth: options.thumbStrokeWidth,
        cornerRadius: options.thumbCornerRadius
      } );

      // @private {Line} - the line that runs through the center of the thumb, for visual aesthetic purposes.
      this._thumbCenterLine = new Line(
          this._thumbRectangle.centerX, this._thumbRectangle.top + options.thumbCenterLineYMargin,
          this._thumbRectangle.centerX, this._thumbRectangle.bottom - options.thumbCenterLineYMargin, {
            stroke: options.thumbCenterLineStroke,
            cursor: 'pointer'
        } );

      // @private {Node} - create the Slider thumb. See the comment at the top of the file for context.
      this._thumb = new Node( {
        center: this._track.center,
        children: [ this._thumbRectangle, this._thumbCenterLine ],
        cursor: 'pointer'
      } );

      // Set the children, in the correct rendering order.
      this.setChildren( [ this._track, this._thumb ] );

      //----------------------------------------------------------------------------------------

      // // @private {DragListener} - create a DragListener for when the user drags the thumb, which moves the slider value
      // this._thumbDragListener = new DragListener( this._thumb, {
      //   // drag: this._dragThumb.bind( this )
      // } );

      // // @private {PressListener} - create a PressListener for when the user clicks on the track, which moves the slider
      // this._trackPressListener = new PressListener( this._track, {
      //   // press: this._pressTrack.bind( this )
      // } );

      // // @private {DragListener} - create a DragListener for when the user drags the line of the thumb
      // this._thumbLineDragListener = new DragListener( this._thumb, {
      //   // drag: this._dragThumb.bind( this ) // Same functionality as when the thumb is dragged
      // } );

      // @private {HoverListener} - create a HoverListener for when the user hovers of the thumb, which changes the fill
      this._thumbPressListener = new HoverListener( this._thumb, {
        enter: () => { this._thumbRectangle.fill = options.thumbFillHighlighted; }, // change the fill when hovered
        exit: () => { this._thumbRectangle.fill = options.thumbFill; }              // change back when un-hovered
      } );


    }
  }

  return Slider;
} );