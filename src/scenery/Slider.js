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
  const Button = require( 'SIM_CORE/scenery/buttons/Button' );
  const DragListener = require( 'SIM_CORE/scenery/events/DragListener' );
  const Line = require( 'SIM_CORE/scenery/Line' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const PressListener = require( 'SIM_CORE/scenery/events/PressListener' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Range = require( 'SIM_CORE/util/Range' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Util = require( 'SIM_CORE/util/Util' );

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
        trackFill: '#BCBCBC',  // {string|Gradient} - the fill color the slider track
        trackStroke: 'black',  // {string|Gradient} - the stroke color of the slider track
        trackStrokeWidth: 1,   // {number} - the stroke width of the slider track
        trackHeight: 3,        // {number} - the height of the track, in scenery coordinates
        trackWidth: 180,       // {number} - the width of the track, in scenery coordinates
        trackCornerRadius: 0,  // {number} - the corner radius of the track

        // thumb
        thumbWidth: 12,                  // {number} - the width of the thumb Rectangle
        thumbHeight: 25,                 // {number} - the height of the thumb Rectangle
        thumbBaseColor: '#90F360',       // {string|Gradient} - the base-color fill of the thumb Rectangle
        thumbStroke: 'black',            // {string|Gradient} - the stroke color of the thumb Rectangle
        thumbStrokeWidth: 1,             // {number} - the stroke width of the line that runs through the thumb
        thumbCenterLineStroke: '#333',   // {string|Gradient} - the stroke color of the line that runs through the thumb
        thumbCenterLineYMargin: 3,       // {number} - the vertical margin from the top of the thumb for the center line
        thumbCornerRadius: 2.5,          // {number} - the corner radius of the thumb Rectangle

        // ticks
        majorTickHeight: 35,        // {number} - the height of the major tick lines that lie along the track
        majorTickStroke: 'black',   // {string|Gradient} - the stroke of the major tick lines that lie along the track
        majorTickStrokeWidth: 1.3,  // {number} - the stroke width the major tick lines that lie along the track
        minorTickHeight: 8,         // {number} - the height of the minor tick lines that lie along the track
        minorTickStroke: '#323232', // {string|Gradient} - the stroke of the minor tick lines that lie along the track
        minorTickStrokeWidth: 1,    // {number} - the stroke width of the minor tick lines that lie along the track
        tickLabelSpacing: 6,        // {number} - the spacing between label Nodes and tick Lines

        // other
        startDrag: null,  // {function} - if provided, this will be called when the slider drag sequence starts.
        endDrag: null,    // {function} - if provided, this will be called when the slider drag sequence ends.
        constrain: null,  // {function(number):number} - if provided, this will called before the numberProperty is set
                          //                             to constrain the value. The return value will be the new value.

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      super( options );

      // @private {*} - see options declaration for documentation. Referenced for use in our methods.
      this._constrain = options.constrain;
      this._majorTickHeight = options.majorTickHeight;
      this._majorTickStroke = options.majorTickStroke;
      this._majorTickStrokeWidth = options.majorTickStrokeWidth;
      this._minorTickHeight = options.minorTickHeight;
      this._minorTickStroke = options.minorTickStroke;
      this._minorTickStrokeWidth = options.minorTickStrokeWidth;
      this._tickLabelSpacing = options.tickLabelSpacing;
      this._range = range;
      this._numberProperty = numberProperty;

      //----------------------------------------------------------------------------------------

      // @private {Rectangle} - create the slider Track. See the comment at the top of the file for context.
      this._track = new Rectangle( options.trackWidth, options.trackHeight, {
        left: options.thumbWidth / 2,
        fill: options.trackFill,
        stroke: options.trackStroke,
        strokeWidth: options.trackStrokeWidth,
        cornerRadius: options.trackCornerRadius,
        cursor: 'pointer'
      } );

      // Create the slider thumb Rectangle.
      const thumbRectangle = new Rectangle( options.thumbWidth, options.thumbHeight, {
        stroke: options.thumbStroke,
        strokeWidth: options.thumbStrokeWidth,
        cornerRadius: options.thumbCornerRadius
      } );

      // Create the line that runs through the center of the thumb, for visual aesthetic purposes.
      const thumbCenterLine = new Line(
          thumbRectangle.centerX, thumbRectangle.top + options.thumbCenterLineYMargin,
          thumbRectangle.centerX, thumbRectangle.bottom - options.thumbCenterLineYMargin, {
            stroke: options.thumbCenterLineStroke
        } );

      // @private {Button} - create the Slider thumb. See the comment at the top of the file for context.
      this._thumb = new Button( thumbRectangle, thumbCenterLine, { centerY: this._track.centerY } );
      Button.apply3DGradients( this._thumb, options.thumbBaseColor ); // Apply the 3D gradient for aesthetic purposes.

      // Add invisible rectangles on either side of the track to account for potential added width if the thumb is
      // dragged to the extremes of the track.
      const leftBufferRectange = new Rectangle( this._thumb.width / 2, 0, { right: this._track.left } );
      const rightBufferRectange = new Rectangle( this._thumb.width / 2, 0, { left: this._track.right } );

      // Set the children, in the correct rendering order.
      this.setChildren( [ this._track, this._thumb, leftBufferRectange, rightBufferRectange ] );

      // At this point, call mutate to ensure validity of location setters in options.
      options && this.mutate( options );

      //----------------------------------------------------------------------------------------

      // @private {DragListener} - create a DragListener for when the user drags the thumb, which moves the slider
      //                           value. To be disposed in the dispose() method.
      this._thumbDragListener = new DragListener( this._thumb, {
        drag: ( displacement, location ) => {
          this._thumb.interactionStateProperty.value = Button.interactionStates.PRESSED;
          this._setThumbPosition( location );
        },
        start: options.startDrag,
        end: () => {
          this._thumb.interactionStateProperty.value = Button.interactionStates.IDLE;
          options.endDrag && options.endDrag();
        }
      } );

      // @private {PressListener} - create a PressListener for when the user clicks on the track, which moves the
      //                            slider. To be disposed in the dispose() method.
      this._trackPressListener = new PressListener( this._track, { press: this._setThumbPosition.bind( this ) } );

      // @private {function} - observer of the numberProperty. To be unlinked in the dispose method.
      this._numberPropertyObserver = this._updateSlider.bind( this );
      numberProperty.link( this._numberPropertyObserver );
    }

    /**
     * @override
     * Disposes the Slider and its listeners so that it can be garbage collected.
     * @public
     */
    dispose() {
      this._numberProperty.unlink( this._numberPropertyObserver );
      this._trackPressListener.dispose();
      this._thumbDragListener.dispose();
      super.dispose();
    }

    /**
     * Adds a major tick mark, which crosses vertically through the track.
     * @public
     *
     * @param {number} value - the numeric value the tick represents along the range of the slider.
     * @param {Node} [label] - optional label Node (usually a Text Node), placed above the Node.
     */
    addMajorTick( value, label ) { this._addTick( value, label, true ); }

    /**
     * Adds a minor tick mark, which starts from the top of the track and extrudes upwards.
     * @public
     *
     * @param {number} value - the numeric value the tick represents along the range of the slider.
     * @param {Node} [label] - optional label Node (usually a Text Node), placed above the Node.
     */
    addMinorTick( value, label ) { this._addTick( value, label, false ); }

    /*
     * Adds a tick mark above the track. To be used internally ONLY.
     * @private
     *
     * @param {number} value - the numeric value the tick represents along the range of the slider.
     * @param {Node} [label] - optional label Node (usually a Text Node), placed above the Node.
     * @param {boolean} isMajor - whether or not the tick is a major or minor tick.
     */
    _addTick( value, label, isMajor ) {
      assert( typeof value === 'number' && this._range.contains( value ), `invalid value: ${ value }` );
      assert( label instanceof Node, `invalid label: ${ label }` );

      // Calculate the x-coordinate of the label, in scenery coordinates.
      const labelX = ( value - this._range.min ) / this._range.length * this._track.width + this._track.left;

      // Create the tick and add it as a child.
      const tick = new Line(
        labelX, isMajor ? this._track.top - this._majorTickHeight / 2: this._track.top,
        labelX, isMajor ? this._track.top + this._majorTickHeight / 2 : this._track.top - this._minorTickHeight, {
          stroke: isMajor ? this._majorTickStroke : this._minorTickStroke,
          strokeWidth: isMajor ? this._majorTickStrokeWidth : this._minorTickStrokeWidth
      } );
      this.addChild( tick );

      // If the label was provided, add the label Node and position it correctly.
      if ( label ) {
        this.addChild( label );
        label.centerX = tick.centerX;
        label.bottom = tick.top - this._tickLabelSpacing;
      }
      this._thumb.moveToFront();
      this.layout( this.screenViewScale );
    }

    /**
     * Called when the Slider thumb is set to a different position due to input from the user, like by dragging the
     * thumb or pressing on the Slider track.
     *
     * Will constrain the drag-area to keep the thumb on-top of the Slider track.
     * Will also call the constrain function provided in the options object in the constructor.
     * @private
     *
     * @param {Vector} location - the attempted center location to move the thumb to
     */
    _setThumbPosition( location ) {

      // Convert the location to the thumb's local coordinates.
      const localDragLocation = location.subtract( this._track.topLeft ).subtractXY( 2 * this._track.strokeWidth, 0 );
      const percentage = Util.clamp( localDragLocation.x / this._track.width, 0, 1 );
      const newValue = percentage * this._range.length + this._range.min;

      // Update the number Property, which will change the location of the slider thumb.
      this._numberProperty.value = this._constrain ? this._constrain( newValue ) : newValue;
    }

    /**
     * Called when the slider needs to be updated, usually when the numberProperty of the Slider changes.
     * @private
     *
     * Updates the thumb center location to match the numberProperty's value.
     */
    _updateSlider() {
      assert( this._range.contains( this._numberProperty.value ), 'numberProperty outside of range of slider' );

      // Calculate the percentage that the thumb is across the slider track.
      const percentage = ( this._numberProperty.value - this._range.min ) / this._range.length;

      // Update the slider thumb center-x position based on the numberProperty's value.
      this._thumb.centerX = percentage * this._track.width + this._track.left;
    }
  }

  return Slider;
} );