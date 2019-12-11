// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Contains a time control box.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const StepButton = require( 'SIM_CORE/scenery/buttons/StepButton' );
  const PlayPauseButton = require( 'SIM_CORE/scenery/buttons/PlayPauseButton' );


  class TimeControlBox extends Node {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );


      // Defaults for options.
      const defaults = {

        backwardsListener: null,
        forwardsListener: null,
        margin: 5,
        playProperty: null // required
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      const backButton = new StepButton( options.backwardsListener, {
        direction: 'backward'
      } );

      const playPauseButton = new PlayPauseButton( options.playProperty, {
        left: backButton.width + options.margin
      } );

      const forwardsbutton = new StepButton( options.forwardsListener, {
        direction: 'forward',
        left: backButton.width + 2 * options.margin + playPauseButton.width
      } );

      backButton.top = ( playPauseButton.radius - backButton.radius );
      forwardsbutton.top = ( playPauseButton.radius - forwardsbutton.radius );

      this.width = backButton.width + 2 * options.margin + playPauseButton.width + forwardsbutton.width;
      this.height = playPauseButton.height;
      this.setChildren( [ backButton, playPauseButton, forwardsbutton ] );
    }
  }

  return TimeControlBox;
} );