// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Main class encapsulation for a simulation. Provides:
 *  - Sim Query Parameters
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const FPSCounter = require( 'SIM_CORE/core-internal/FPSCounter' );
  const Loader = require( 'SIM_CORE/core-internal/Loader' );
  const NavigationBar = require( 'SIM_CORE/core-internal/NavigationBar' );
  const Screen = require( 'SIM_CORE/Screen' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const StandardSimQueryParameters = require( 'SIM_CORE/StandardSimQueryParameters' );
  const Util = require( 'SIM_CORE/util/Util' );

  const Sim = {

    // @public {boolean} (read-only) - indicates if the simulation has already been initiated and launched.
    initiated: false,

    // @private {boolean} - indicates if the current window is running on a mobile device.
    _isMobile: ( () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
                .test( navigator.userAgent || navigator.vendor || window.opera ) )(),

    // @private {function} - scans through potential default `requestAnimationFrame` functions
    _requestAnimationFrame: ( window.requestAnimationFrame
                                || window.webkitRequestAnimationFrame
                                || window.mozRequestAnimationFrame
                                || window.msRequestAnimationFrame
                                || ( ( callback ) => { window.setTimeout( callback, 1000 / 60 ); } )
                            ).bind( window ),

    // @private {function[]} - listeners to be notified when the browser window is resized, see addResizeListener()
    _resizeListeners: [],

    // @private {function[]} - listeners to be notified when the sim is 'stepped', see addStepSimulationListener()
    _stepSimulationListeners: [],


    /**
     * Starting point of the sim: initiates and launches the simulation. Will throw an error if called more than once.
     * @public
     *
     * @param {Object} config - required object literal that provides configuration information for the simulation.
     *                          See the early portion of this static method for details.
     */
    start( config ) {
      assert.always( !Sim.initiated, 'Sim has already been launched.' ); // Ensure that the sim hasn't been launched
      assert( Object.getPrototypeOf( config ) === Object.prototype, `invalid config: ${ config }` );

      config = {

        // {Screens[]} - all screens to the sim, in order that they will appear in the home-screen and navigation-bar.
        screens: config.screens,

        // {string} - the name to the simulation, displayed in the navigation-bar, loader, and home-screen
        name: config.name
      };

      assert( Util.isArray( config.screens ), `invalid screens: ${ config.screens }` );
      assert( config.screens.every( screen => screen instanceof Screen ), `invalid screens: ${ config.screens }` );
      assert( typeof config.name === 'string', `invalid name: ${ config.name }` );
      Sim.initiated = true; // Indicate that the simulation has been initiated and launched.

      //----------------------------------------------------------------------------------------

      // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
      // see https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
      window.addEventListener( 'pageshow', event => { if ( event.persisted ) window.location.reload(); } );

      // Log the current version of the simulation if the query parameter ?version was provided.
      if ( StandardSimQueryParameters.version ) {

        // eslint-disable-next-line no-console
        console.log( `${ config.name }: v${ JSON.parse( require( 'text!REPOSITORY/package.json' ) ).version }` );
      }

      // Initialize a display to attach to the browser window.
      const display = new Display().initiate();
      const loader = new Loader( config.screens, config.name );
      display.addChild( loader );

      // Initialize a fps-counter if the ?fps query parameter was provided
      if ( StandardSimQueryParameters.fps ) {
        const fpsCounter = new FPSCounter();
        display.addChild( fpsCounter );
        Sim.addStepSimulationListener( fpsCounter.registerNewFrame.bind( fpsCounter ) );
      }


      // // Add the navigation bar
      // const navigationBar = new NavigationBar( config.name );

      // display.addChild( navigationBar );

      // display.addChild( config.screens[ 0 ] );


      if ( StandardSimQueryParameters.dev ) { ScreenView.enableDevBorder(); }

      window.onresize = () => {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        Sim._resizeListeners.forEach( listener => { listener( windowWidth, windowHeight ); } );
        // navigationBar.layout( windowWidth, windowHeight );
        // const screenHeight = windowHeight - parseFloat( navigationBar.style.height );
      };
      // window.onresize();



      let lastStepTime = Date.now();
      const stepper = () => {

        const currentTime = Date.now();
        const ellapsedTime = Util.convertFrom( currentTime - lastStepTime, Util.MILLI );
        lastStepTime = currentTime;

        // config.screens[ 0 ]._model.step && screen._model.step( ellapsedTime );
        Sim._stepSimulationListeners.forEach( listener => { listener( ellapsedTime ); } );

        Sim._requestAnimationFrame( stepper );
      };
      Sim._requestAnimationFrame( stepper );

      // // prevent pinch and zoom https://stackoverflow.com/questions/37808180/disable-viewport-zooming-ios-10-safari
      // // Maybe we want to detect if passive is supportive
      // // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
      // if ( window.isMobile ) {
      //   document.addEventListener( 'touchmove', event => {
      //     if ( event.scale !== 1 ) { event.preventDefault(); }
      //   }, { passive: false } );
      // }
    },

    /**
     * Registers a listener such that when the browser, the listener is called, passing both the width and the height
     * of the window. If the listener is no longer needed, make sure to remove the listener (removeResizeListener).
     * @public
     *
     * @param {function} - listener that is called when the browser window is resized, passing both the width and height
     */
    addResizeListener( listener ) {
      assert( Sim.initiated, 'Sim must be initiated to add listener' );
      assert( typeof listener === 'function', `invalid listener: ${ listener }` );
      Sim._resizeListeners.push( listener );
      listener( window.innerWidth, window.innerHeight ); // Immediately call the listener
    },

    /**
     * Registers a listener that is called when the simulation is 'stepped' or progressed through each new frame,
     * passing the elapsed time since the last step call. If the listener is no longer needed, make sure to remove the
     * listener (with removeStepSimulationListener()).
     * @public
     *
     * @param {function} - listener that is called when the simulation is 'stepped', passing in the ellapsedTime
     */
    addStepSimulationListener( listener ) {
      assert( Sim.initiated, 'Sim must be initiated to add listener' );
      assert( typeof listener === 'function', `invalid listener: ${ listener }` );
      Sim._stepSimulationListeners.push( listener );
    },

    /**
     * Registers a listener such that when the browser, the listener is called, passing both the width and the height
     * of the window. If the listener is no longer needed, make sure to remove the listener (removeResizeListener).
     * @public
     *
     * @param {function} - listener that is called when the browser window is resized, passing both the width and height
     */
    removeResizeListener( listener ) {
      assert( Sim._resizeListeners.includes( listener ), `listener was never added: ${ listener }` );
      Util.arrayRemove( Sim._resizeListeners, listener );
    },

    /**
     * Registers a listener that is called when the simulation is 'stepped' or progressed through each new frame,
     * passing the elapsed time since the last step call. If the listener is no longer needed, make sure to remove the
     * listener (with removeStepSimulationListener()).
     * @public
     *
     * @param {function} - listener that is called when the simulation is 'stepped', passing in the ellapsedTime
     */
    removeStepSimulationListener( listener ) {
      assert( Sim._stepSimulationListeners.includes( listener ), `listener was never added: ${ listener }` );
      Util.arrayRemove( Sim._stepSimulationListeners, listener );
    }
  }

  return Sim;
} );