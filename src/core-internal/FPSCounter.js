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
 *    simulation animation loop, Sim.js should call the `registerNewFrame()` method, passing in the time since the
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
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Util = require( 'SIM_CORE/util/Util' );

  // constants
  const FRAMES_PER_CYCYLE = 60; // Number of frames in a 'cycle'. See the comment at the top of the file for context.
  const DECIMAL_PLACES = 2; // Number of decimals for each number in the result text.
  const DOWN_ARROW = '\u2193';
  const UP_ARROW = '\u2191';

  class FPSCounter extends DOMObject {

    /**
     * As of now, there are no parameters to the FPSCounter as all options are written and finalized in the constructor.
     * In addition, the FPSCounter isn't public facing to sim-specific code, so all changes to the super-class options
     * can be made here.
     */
    constructor() {
      super( {
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
      } );

      // @private {number} - flags to keep track of, which are updated on every frame.
      this._totalFrames = 0;
      this._timeSinceLastCycle = 0;
      this._minInstantFPS = null; // the lowest instantaneous FPS in the last cycle
      this._maxInstantFPS = null; // the highest instantaneous FPS in the last cycle
    }

    /**
     * Updates the FPSCounter text to match the template described in the comment at the top of the file.
     * @private
     *
     * @param {number} averageFPS
     * @param {number} minInstantFPS
     * @param {number} maxInstantFPS
     */
    _updateFPSCounterText( averageFPS, minInstantFPS, maxInstantFPS ) {

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
     * Called on each frame in the animation loop in Sim.js. Every cycle, it will record
     *   (1) the average FPS
     *   (2) the lowest instantaneous FPS
     *   (3) the highest instantaneous FPS
     * If called, this will assume that the ?fps query parameter was supplied.
     * @public
     *
     * @param {number} dt - the time since the last frame, in seconds.
     */
    registerNewFrame( dt ) {

      // Update flags
      this._totalFrames++;
      this._timeSinceLastCycle += dt;

      // Compute the instantaneous FPS
      const instantaneousFPS = 1 / dt;

      // Update the min/max instantaneous FPS flags if applicable
      this._minInstantFPS = Math.min( this._minInstantFPS || instantaneousFPS, instantaneousFPS );
      this._maxInstantFPS = Math.max( this._maxInstantFPS || instantaneousFPS, instantaneousFPS );

      // If this frame is the end of a cycle.
      if ( this._totalFrames % FRAMES_PER_CYCYLE === 0 ) {

        // Compute the average FPS in the last cycle
        const averageFPS = FRAMES_PER_CYCYLE / this._timeSinceLastCycle;

        // Update the FPS counter display content
        this._updateFPSCounterText( averageFPS, this._minInstantFPS, this._maxInstantFPS );

        // Reset flags
        this._timeSinceLastCycle = 0;
        this._minInstantFPS = null;
        this._maxInstantFPS = null;
      }
    }
  }

  return FPSCounter;
} );