// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A DOMObject that displays the frames per second (fps) along with other performance data of the simulation while
 * running in real time. For context, see https://en.wikipedia.org/wiki/Frame_rate.
 *
 * ## Output
 *  - The output is displayed in the upper-left corner of the browser window and only is displayed with the
 *    query parameter `?fps`. See `../StandardSimQueryParameters.js` for more documentation.
 *
 *  - The FPSCounter will update its text every 'cycle', which is just FRAMES_PER_CYCYLE frames. It will display:
 *      (1) the average FPS for the last cycle
 *      (2) the lowest instantaneous FPS in the last cycle
 *      (3) the highest instantaneous FPS in the last cycle
 *      (4) the average milliseconds per frame for the last cycle
 *
 *    The format that is displayed is:
 *      `FPS [ {{DOWN_ARROW}}low - {{UP_ARROW}}high ] ~ ms/frame`
 *
 *    For instance:
 *      `64.4 FPS [ {{DOWN_ARROW}}50.2 - {{UP_ARROW}}69.3 ] ~ 15.5 ms/frame`
 *
 * ## Usage
 *  - The FPSCounter should be instantiated in Sim.js and added as a direct child of the Display. Then, in the
 *    simulation animation loop, Sim.js should call the `recordNewFrame()` method, passing in the time since the
 *    last call.
 *
 * The counter is designed to be minimally invasive, so it won't significantly alter the simulation's performance.
 * It is used to help quantify one aspect of the simulation's performance. However, that's NOT to say that FPS
 * should be the only way to determine if a simulation has acceptable performance.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Util = require( 'SIM_CORE/util/Util' );

  // constants
  const FRAMES_PER_CYCYLE = 60; // Number of frames in a 'cycle'. See the comment at the top of the file for context.
  const DECIMAL_PLACES = 2; // Number of decimals for each number in the result text.
  const DOWN_ARROW = '\u2193';
  const UP_ARROW = '\u2191';

  class FPSCounter extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior.
     *                             See the early portion of the constructor for details.
     */
    constructor( options ) {

      // Some options are set by FPSCounter. Assert that they weren't provided.
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.type, 'FPSCounter sets type.' );
      assert( !options || !options.text, 'FPSCounter should not have text' );
      assert( !options || !options.id || !options.class || !options.attributes, 'FPSCounter sets attributes' );
      assert( !options || !options.children, 'FPSCounter shouldn\'t have children.' );

      const defaults = {
        type: 'div',
        style: {
          zIndex: 99999999,
          position: 'absolute',
          color: 'red',
          left: '10px',
          top: '5px',
          fontSize: '17px',
          fontWeight: 500,
          fontFamily: 'Times, Arial, sans-serif',
          userSelect: 'none',
          cursor: 'default'
        },
        id: 'fps-counter'
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.style = { ...defaults.style, ...options.style };
      super( options );
    }

    /**
     * Gets the current time via the Javascript Date API in seconds.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date.
     * @public
     *
     * @returns {number} - time in seconds
     */
    get currentTime() {
      return Util.convertFrom( Date.now(), Util.MILLI ); // convert from milliseconds to seconds
    }

    /**
     * Updates the FPSCounter text to match the template described in the comment at the top of the file.
     * @public
     *
     * @param {number} averageFPS
     * @param {number} minInstantFPS
     * @param {number} maxInstantFPS
     */
    updateFPSCounterText( averageFPS, minInstantFPS, maxInstantFPS ) {

      /*----------------------------------------------------------------------------*
       * NOTE: the `toFixed` calls are inlined meaning the built-in `toFixed` is used
       *       instead of `Util.toFixed`. This is done for performance reasons to
       *       keep the FPSCounter minimally invasive, and results won't be affected
       *       as all rounded values are positive.
       *----------------------------------------------------------------------------*/
      const msPerFrame = Util.convertTo( 1 / averageFPS, Util.MILLI ).toFixed( DECIMAL_PLACES ); // SPF = 1 / FPS
      const fps = averageFPS.toFixed( DECIMAL_PLACES );
      const min = minInstantFPS.toFixed( DECIMAL_PLACES );
      const max = maxInstantFPS.toFixed( DECIMAL_PLACES );

      this.setText( `${ fps } FPS [ ${ DOWN_ARROW }${ min } - ${ UP_ARROW }${ max } ] ~ ${ msPerFrame } ms/frame` );
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

        if ( framesDisplayed % FRAMES_PER_CYCYLE === 0 ) {
          // compute the time since the last cycle
          const timeSinceLastCycle = frameEndTime - cycleStartTime;
          cycleStartTime = frameEndTime;

          // compute the average FPS in the last cycle
          const averageFPS = FRAMES_PER_CYCYLE / timeSinceLastCycle;

          // Update the FPS counter display content
          this.updateFPSCounterText( averageFPS, minInstantFPS, maxInstantFPS );

          // reset the min and max instantaneous FPS flags
          minInstantFPS = null;
          maxInstantFPS = null;
        }
        window.requestAnimationFrame( frameListener );
      };
      window.requestAnimationFrame( frameListener );
 //      _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
 // 6101:                                       || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
 // 6102
    }
  }

  return FPSCounter;
} );