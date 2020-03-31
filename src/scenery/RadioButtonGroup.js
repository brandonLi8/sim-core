// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A grouping of RadioButtons, which displays RadioButtons as a FlexBox. See sim-core/src/scenery/buttons/RadioButton
 * for more documentation.
 *
 * A RadioButtonGroup toggles the value of a Enum Property (ie. a Property with a Enum value of a general Enum).
 * Each RadioButton that is passed in must correspond to a different Enum value of the general Enum.
 *
 * RadioButtonGroup will only select one RadioButton at a time. Selecting a RadioButton is triggered when the user
 * presses on a unselected RadioButton, which sets the value of the Enum Property to the Enum value of the selected
 * RadioButton.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const ColorWheel = require( 'SIM_CORE/util/ColorWheel' );
  const Enum = require( 'SIM_CORE/util/Enum' );
  const FlexBox = require( 'SIM_CORE/scenery/FlexBox' );
  const Property = require( 'SIM_CORE/util/Property' );
  const RadioButton = require( 'SIM_CORE/scenery/buttons/RadioButton' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Button = require( 'SIM_CORE/scenery/buttons/Button' );

  class RadioButtonGroup extends FlexBox {

    /**
     * @param {string} orientation - orientation: either 'horizontal' (a row) or 'vertical' (a column)
     * @param {Property.<Enum.Member>} enumProperty - the enumeration Property that is toggled when RadioButtons
     *                                                are selected.
     * @param {RadioButton[]} radioButtons - the RadioButtons of this RadioButtonGroup.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of the
     *                             RadioButtonGroup. All options are passed to the super class.
     */
    constructor( orientation, enumProperty, radioButtons, options ) {
      assert( orientation === 'horizontal' || orientation === 'vertical', `invalid orientation: ${ orientation }` );
      assert( enumProperty instanceof Property && enumProperty.value instanceof Enum.Member,
        `invalid enumProperty: ${ enumProperty }` );
      assert( Util.isArray( radioButtons ) && radioButtons.every( radioButton => radioButton instanceof RadioButton ),
        `invalid radioButtons: ${ radioButtons }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.children, 'RadioButtonGroup sets children' );

      super( orientation, { ...options, children: radioButtons } );

      //----------------------------------------------------------------------------------------

      // @private {Object} - object literal that maps Radio Buttons to listeners of its interactionStateProperty.
      //                     Used in the dispose method to remove listeners.
      this._radioButtonListenerMap = {};

      // Loop through each RadioButton in the passed-in radio Buttons array.
      radioButtons.forEach( radioButton => {

        // Check that we haven't already linked to this RadioButton.
        assert( !this._radioButtonListenerMap[ radioButton ], `duplicate radio button found: ${ radioButton }` );

        // Map a listener to the interactionStateProperty of the RadioButton.
        this._radioButtonListenerMap[ radioButton ] = interactionState => {

          // If the current radioButton is pressed, unselect all other RadioButtons and select the current radioButton.
          if ( interactionState === Button.interactionStates.PRESSED ) {
            radioButtons.forEach( radioButton => { radioButton.unselect(); } );
            radioButton.select();
          }
        };

        // Link the listener, which will be unlinked in the dispose method.
        radioButton.interactionStateProperty.link( this._radioButtonListenerMap[ radioButton ] );
      } );
    }

    /**
     * @override
     * Disposes the RadioButtonGroup and its internal listeners.
     * @public
     */
    dispose() {
      Object.keys( this._radioButtonListenerMap ).forEach( radioButton => {
        radioButton.interactionStateProperty.unlink( this._radioButtonListenerMap[ radioButton ] );
      } );
      super.dispose();
    }
  }

  return RadioButtonGroup;
} );