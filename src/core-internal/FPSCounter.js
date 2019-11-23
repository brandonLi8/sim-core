// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A DOMObject that displays the frames per second (fps) along with other performance data of the simulation while
 * running in real time. For context, see https://en.wikipedia.org/wiki/Frame_rate.
 *
 * The counter is designed to be minimally invasive, so it won't alter the simulation's performance significantly.
 * It is used to help quantify one aspect of the simulation's performance. However, that's NOT to say that FPS
 * should be the only way to determine if a simulation has acceptable performance.
 *
 * The output is displayed in the upper-left corner of the browser window.
 * It only is displayed with the query parameter `?fps`. See `../Sim.js`. This DOMObject should be added as a child of
 * the root element.
 *
 * It updates every COUNTER_CYCLE frames and displays:
 *   (1) the average FPS for the last cycle
 *   (2) the average milliseconds per frame for the last cycle
 *   (3) the lowest the instantaneous FPS hit in the last cycle
 *   (4) the highest the instantaneous FPS hit in the last cycle
 *
 * The format that is displayed is:
 * `FPS [{{DOWN_ARROW}}low {{UP_ARROW}}high] - ms/frame`
 *
 * For instance:
 * `64.4 FPS [{{DOWN_ARROW}}50.2 {{UP_ARROW}}69.3] - 15.5 ms/frame`
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

  // constants
  const COUNTER_CYCLE = 60; // In frames. See the comment at the top of the file for context.
  const DOWN_ARROW = '\u2193';
  const UP_ARROW = '\u2191';
  const DECIMAL_PLACES = 2;

  const Util = {
    /**
     * Rounds using "Round half away from zero" algorithm. See dot#35.
     * @public
     *
     * JavaScript's Math.round is not symmetric for positive and negative numbers, it uses IEEE 754 "Round half up".
     * See https://en.wikipedia.org/wiki/Rounding#Round_half_up.
     * For sims, we want to treat positive and negative values symmetrically, which is IEEE 754
     * "Round half away from zero",
     * See https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
     *
     * Note that -0 is rounded to 0, since we typically do not want to display -0 in sims.
     *
     * @param {number} value                               `
     * @returns {number}
     */
    roundSymmetric: ( value ) => {
      return ( ( value < 0 ) ? -1 : 1 ) * Math.round( Math.abs( value ) );
    },

    /**
     * A predictable implementation of toFixed.
     * @public
     *
     * JavaScript's toFixed is notoriously buggy, behavior differs depending on browser,
     * because the spec doesn't specify whether to round or floor.
     * Rounding is symmetric for positive and negative values, see Util.roundSymmetric.
     *
     * @param {number} value
     * @param {number} decimalPlaces
     * @returns {string}
     */
    toFixed: ( value, decimalPlaces ) => {
      const multiplier = Math.pow( 10, decimalPlaces );
      const newValue = Util.roundSymmetric( value * multiplier ) / multiplier;
      return newValue.toFixed( decimalPlaces );
    }
  };

  class FPSCounter extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior.
     *                             See the early portion of the constructor for details.
     */
    constructor( options ) {

      if ( options ) {
        // Changes to the API means excluding some of the options.
        assert( !options.type, 'FPSCounter sets options.type.' );
        assert( !options.innerHTML && !options.text, 'FPSCounter sets inner content.' );
        assert( !options.id && !options.class && !options.attributes, 'FPSCounter sets options.attributes' );
        assert( !options.children, 'FPSCounter sets children.' );
      }

      const defaults = {
        type: 'div',
        style: {
          'z-index': 99999999,
          position: 'absolute',
          color: 'red'
        },
        id: 'fps-counter'
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.style = { ...defaults.style, ...options.style };
      super( options );

      //----------------------------------------------------------------------------------------

      // @private {function} requestAnimationFrame - gets the windows request animation frame function
      //                                             but provides a fullback for other browsers.
      this.requestAnimationFrame = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.ieRequestAnimationFrame;
    }

    /**
     * Gets the current time via the Javascript Date API in seconds.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date.
     * @public
     *
     * @returns {number} - time in seconds
     */
    get currentTime() {
      return Date.now() / 1000; // dimensional analysis to seconds
    }

    /**
     * Updates the FPSCounter text to match the template described in the comment at the top of the screen
     * and rounds the results.
     * @public
     *
     * @param {number} averageFPS
     * @param {number} minInstantFPS
     * @param {number} maxInstantFPS
     */
    update( averageFPS, minInstantFPS, maxInstantFPS ) {
      const msPerFrame = Util.toFixed( 1000 / averageFPS, DECIMAL_PLACES );

      // round the values
      const fps = Util.toFixed( averageFPS, DECIMAL_PLACES );
      const min = Util.toFixed( minInstantFPS, DECIMAL_PLACES );
      const max = Util.toFixed( maxInstantFPS, DECIMAL_PLACES );

      this.setText( `${ fps } FPS [${ DOWN_ARROW } ${ min } ${ UP_ARROW } ${ max }] - ${ msPerFrame } ms/frame` );
    }

    /**
     * Starts the counter; begins updating the DOMObject to display the content described in the
     * comment at the top of the file.
     * @public
     */
    start() {

      // Create the flags to keep track of the data.
      let frameStartTime = this.currentTime;
      let frameEndTime;
      let cycleStartTime = this.currentTime;
      let minInstantFPS; // the lowest the instantaneous FPS hit in the last cycle
      let maxInstantFPS; // the highest the instantaneous FPS hit in the last cycle
      let framesDisplayed = 0;

      // Declare the function that executes the logic of the FPSCounter.
      const frameListener = () => {
        framesDisplayed++;

        frameEndTime = this.currentTime;

        // compute the time since the last frame
        const timeSinceLastFrame = frameEndTime - frameStartTime;
        frameStartTime = frameEndTime;

        // compute the instantaneous FPS
        const instantaneousFPS = 1 / timeSinceLastFrame;

        // Update the min and/or/xor max instantaneous FPS flags if applicable
        minInstantFPS = ( !minInstantFPS || instantaneousFPS < minInstantFPS ) ? instantaneousFPS : minInstantFPS;
        maxInstantFPS = ( !maxInstantFPS || instantaneousFPS > maxInstantFPS ) ? instantaneousFPS : maxInstantFPS;

        if ( framesDisplayed % COUNTER_CYCLE === 0 ) {
          // compute the time since the last cycle
          const timeSinceLastCycle = frameEndTime - cycleStartTime;
          cycleStartTime = frameEndTime;

          // compute the average FPS in the last cycle
          const averageFPS = COUNTER_CYCLE / timeSinceLastCycle;

          // Update the FPS counter display content
          this.update( averageFPS, minInstantFPS, maxInstantFPS );

          // reset the min and max instantaneous FPS flags
          minInstantFPS = null;
          maxInstantFPS = null;
        }
        window.requestAnimationFrame( frameListener );
      };
      window.requestAnimationFrame( frameListener );
    }
  }

  return FPSCounter;
} );