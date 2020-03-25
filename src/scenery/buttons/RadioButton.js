// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A single Radio Button, which displays a rectangular background and a provided content Node. The content Node is
 * passed to the super class (Button) for alignment and positioning.
 *
 * A Radio Button is associated with a single Enum value, which must be provided when initiating a RadioButton.
 * Then, an array of Radio Buttons of different Enum values, along with the Property of Enum values, are passed to
 * RadioButtonGroup, which provides the functionality of only selecting one Radio Button at a time and toggles the Enum.
 *
 * An Radio Button can be selected, meaning the Enum Property's value matches the associated Enum value of the
 * RadioButton. Generally, the methods of RadioButton (select(), unselect()) should be used in RadioButtonGroup only.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Button = require( 'SIM_CORE/scenery/buttons/Button' );
  const Circle = require( 'SIM_CORE/scenery/Circle' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Enum = require( 'SIM_CORE/util/Enum' );

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
    }
  }

  return RadioButton;
} );