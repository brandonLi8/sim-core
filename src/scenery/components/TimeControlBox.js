// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * TimeControlBox is a scenery component that allows the user to modify the stepping and play-pause state
 * of the simulation.
 *
 * A TimeControlBox consists of:
 *   - a step backward button
 *   - a play-pause button
 *   - a step forward button
 *
 * All children are formatted horizontally in a horizontal FlexBox. See FlexBox.js for context.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const FlexBox = require( 'SIM_CORE/scenery/FlexBox' );
  const PlayPauseButton = require( 'SIM_CORE/scenery/components/buttons/PlayPauseButton' );
  const Property = require( 'SIM_CORE/util/Property' );
  const StepButton = require( 'SIM_CORE/scenery/components/buttons/StepButton' );

  class TimeControlBox extends FlexBox {

    /**
     * @param {Property.<boolean>} isPlayingProperty - the Property that indicates if the simulation is 'playing'
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code
     *                             where the options are set in the early portion of the constructor for details.
     */
    constructor( isPlayingProperty, options ) {
      assert( isPlayingProperty instanceof Property, `invalid isPlayingProperty: ${ isPlayingProperty }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {Object} - if provided, these options will be passed to the PlayPauseButton instance.
        playPauseOptions: null,

        // {Object} - if provided, these options will be passed to the backwards StepButton instance.
        stepBackwardOptions: null,

        // {Object} - if provided, these options will be passed to the forwards StepButton instance.
        stepForwardOptions: null,

        // {number} - spacing between each Button.
        spacing: 5,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      super( 'horizontal', options );

      //----------------------------------------------------------------------------------------

      // Create the content of the TimeControlBox, described in the comment at the top of the file.
      const stepBackwardButton = StepButton.backwards( options.stepBackwardOptions );
      const playPauseButton = new PlayPauseButton( isPlayingProperty, options.playPauseOptions );
      const stepForwardButton = StepButton.forwards( options.stepForwardOptions );

      // Set the children of the FlexBox in the correct sequential formatting.
      this.children = [ stepBackwardButton, playPauseButton, stepForwardButton ];

      // Apply any additional location setters.
      this.mutate( options );
    }
  }

  return TimeControlBox;
} );