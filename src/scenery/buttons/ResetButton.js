// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Reset Button, which displays a circular button with a clockwise curved-arc Arrow inside. ResetButton is generally
 * used to reset the state of the simulation to what was loaded in.
 *
 * The reset button is drawn programmatically (as opposed to using an image file) to allow for slight modifications
 * and customizations to the appearance of ResetButton.
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
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Util = require( 'SIM_CORE/util/Util' );

  class ResetButton extends Button {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code
     *                             where the options are set in the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // button
        baseColor: 'blue',           // {string|Gradient} - the base color of the button.
        listener: null,              // {function} - the listener called when the button is pressed.

        // curvedArrow
        curvedArrowFill: 'white',    // {string|Gradient} - the fill color the button curvedArrow.
        curvedArrowStroke: 'black',  // {string|Gradient} - the stroke color of the button curvedArrow.
        curvedArrowStrokeWidth: 1,   // {number} - the stroke width of the button curved Arrow.
        curvedArrowHeadHeight: 12,   // {number} - the head-height of the curved arrow. See `set headHeight()`.
        curvedArrowHeadWidth: 12,    // {number} - the head-width of the curved arrow. See `set headWidth()`.
        curvedArrowTailWidth: 3,     // {number} - the tail-width of the curved arrow. See `set tailWidth()`.

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      super( options );
    }
  }

  return ResetButton;
} );