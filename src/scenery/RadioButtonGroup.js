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

  class RadioButtonGroup extends FlexBox {

    /**
     * @param {Property.<Enum.Member>} enumProperty - the enumeration Property that is toggled when RadioButtons
     *                                                are selected.
     * @param {RadioButton[]} radioButtons - the RadioButtons of this RadioButtonGroup.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of the
     *                             RadioButtonGroup. All options are passed to the super class.
     */
    constructor( enumProperty, radioButtons, options ) {

    }
  }

  return RadioButtonGroup;
} );