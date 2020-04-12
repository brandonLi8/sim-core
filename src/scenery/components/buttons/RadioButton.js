// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A single Radio Button, which displays a rectangular background and a provided content Node. The content Node is
 * passed to the super class (Button) for alignment and positioning.
 *
 * A Radio Button is associated with a single Enum value, which must be provided when initiating a RadioButton.
 * Then, an array of Radio Buttons of different Enum values, along with the Property of Enum values, are passed to
 * RadioButtonGroup, which provides the functionality of only selecting one Radio Button at a time and toggles the Enum.
 *
 * An Radio Button can be selected, meaning the Enum Property of the RadioButtonGroup matches the associated Enum value
 * of the RadioButton. Generally, the methods of RadioButton (select(), unselect()) should only be used in
 * RadioButtonGroup.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const Button = require( 'SIM_CORE/scenery/buttons/Button' );
  const ColorWheel = require( 'SIM_CORE/util/ColorWheel' );
  const Enum = require( 'SIM_CORE/util/Enum' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );

  class RadioButton extends Button {

    /**
     * @param {Enum.Member} enumValue - the enumeration value that this Radio Button corresponds with
     * @param {Node} contentNode - the content of the Radio button. Alignment is set in the super class.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of the RadioButton.
     *                             Extends the API of the super-class options. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( enumValue, contentNode, options ) {
      assert( enumValue instanceof Enum.Member, `invalid enumValue: ${ enumValue }` );
      assert( contentNode instanceof Node, `invalid contentNode: ${ contentNode }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // content
        xMargin: 8, // {number} - the left and right margin between the content and the button background.
        yMargin: 8, // {number} - the top and bottom margin between the content and the button background.

        // opacities
        selectedButtonOpacity: 1,           // {number} opacity of the background when the Button is selected.
        unselectedButtonOpacity: 0.35,      // {number} opacity of the background when the Button is NOT selected.
        selectedContentOpacity: 1,          // {number} opacity of the content when the Button is selected
        unselectedContentOpacity: 0.5,      // {number} opacity of the content when the Button is NOT selected
        unselectedHoverButtonOpacity: 0.8,  // {number} opacity of the background when hovered over, if unselected.
        unselectedHoverContentOpacity: 0.8, // {number} opacity of the content when hovered over, if unselected.

        // colors
        selectedButtonStroke: '#419AC9',   // {string|Gradient} - the stroke of the background when selected.
        unselectedButtonStroke: '#323232', // {string|Gradient} - the stroke of the background when NOT selected.
        baseColor: 'white',                // {string} - the base color of the button. The fills in all 3 states
                                           //            (selected, unselected, hover) are shades of this color.
        // other
        unselectedStrokeWidth: 1,  // {number} - the stroke-width of the border of the background when selected.
        selectedStrokeWidth: 1.5,  // {number} - the stroke-width of the border of the background when NOT selected.
        cornerRadius: 4,           // {number} - the corner radius of the rectangle background of the Button.

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      //----------------------------------------------------------------------------------------

      // Compute the background rectangle's Bounds, which expands to the fit margins.
      const rectangleBounds = Bounds.scratch.set( contentNode.bounds )
                                .expand( options.xMargin, options.yMargin, options.xMargin, options.yMargin );

      // Create the RadioButton's background, which is just a Rectangle. Appearance to be set later.
      const radioButtonBackground = Rectangle.withBounds( rectangleBounds, { cornerRadius: options.cornerRadius } );

      super( radioButtonBackground, contentNode, options );

      //----------------------------------------------------------------------------------------

      // @public (read-only) {Enum.Member} - reference the passed-in Enum value.
      this.enumValue = enumValue;

      // @private {*} see the options declaration for documentation
      this._selectedButtonOpacity = options.selectedButtonOpacity;
      this._unselectedButtonOpacity = options.unselectedButtonOpacity;
      this._selectedContentOpacity = options.selectedContentOpacity;
      this._unselectedContentOpacity = options.unselectedContentOpacity;
      this._unselectedHoverButtonOpacity = options.unselectedHoverButtonOpacity;
      this._unselectedHoverContentOpacity = options.unselectedHoverContentOpacity;
      this._selectedButtonStroke = options.selectedButtonStroke;
      this._unselectedButtonStroke = options.unselectedButtonStroke;
      this._unselectedStrokeWidth = options.unselectedStrokeWidth;
      this._selectedStrokeWidth = options.selectedStrokeWidth;

      // @private {string} - the fill colors of the background for all 3 states
      this._idleFill = options.baseColor;
      this._hoverFill = ColorWheel.shade( options.baseColor, 0.4 );
      this._pressedFill = ColorWheel.shade( options.baseColor, -0.4 );

      // @private {boolean} - indicates if this Radio Button is the selected RadioButton in a RadioButtonGroup
      this._selected = false;

      // Listen to when the interaction state changes to change the appearance of the RadioButton.
      // Unlinked in dispose method of the super class.
      this.interactionStateProperty.link( this._changeRadioButtonAppearance.bind( this ) );
    }

    /**
     * Changes the appearance of the Radio Button when it needs to be changed. This is called when the
     * interactionStateProperty of the super class changes or when the RadioButton is toggled.
     * @private
     *
     * @param {Enum.Member.<Button.interactionStates>} interactionState
     */
    _changeRadioButtonAppearance( interactionState ) {
      assert( Button.interactionStates.includes( interactionState ),
        `invalid interactionState: ${ interactionState }` );

      this.background.stroke = this._selected ? this._selectedButtonStroke : this._unselectedButtonStroke;
      this.background.strokeWidth = this._selected ? this._selectedStrokeWidth : this._unselectedStrokeWidth;

      if ( interactionState === Button.interactionStates.IDLE ) {
        this.background.opacity = this._selected ? this._selectedButtonOpacity : this._unselectedButtonOpacity;
        this.content.opacity = this._selected ? this._selectedContentOpacity : this._unselectedContentOpacity;
        this.background.fill = this._idleFill;
        this.cursor = 'pointer';
      }
      if ( interactionState === Button.interactionStates.HOVER ) {
        this.background.opacity = this._selected ? this._selectedButtonOpacity : this._unselectedHoverButtonOpacity;
        this.content.opacity = this._selected ? this._selectedContentOpacity : this._unselectedHoverContentOpacity;
        this.background.fill = this._hoverFill;
        this.cursor = !this._selected ? 'pointer' : null;
      }
      if ( interactionState === Button.interactionStates.PRESSED ) {
        this.background.opacity = this._selected ? this._selectedButtonOpacity : this._unselectedButtonOpacity;
        this.content.opacity = this._selected ? this._selectedContentOpacity : this._unselectedContentOpacity;
        this.background.fill = this._selected ? this._idleFill : this._pressedFill;
        this.cursor = !this._selected ? 'pointer' : null;
      }
    }

    /**
     * Changes the appearance set of the RadioButton for hovers and presses.
     * @public
     *
     * Generally, this is called when the button is selected in a RadioButtonGroup.
     */
    select() {
      this._selected = true;
      this._changeRadioButtonAppearance( this.interactionStateProperty.value );
    }

    /**
     * Changes the appearance set of the RadioButton for hovers and presses.
     * @public
     *
     * Generally, this is called when the button is un-selected in a RadioButtonGroup.
     */
    unselect() {
      this._selected = false;
      this._changeRadioButtonAppearance( this.interactionStateProperty.value );
    }
  }

  return RadioButton;
} );