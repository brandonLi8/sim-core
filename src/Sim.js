// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Main class encapsulation for a simulation. Provides:
 *  - Sim Query Parameters
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // Load Query Parameter first to check if assertions are enabled before loading everything else.
  const StandardSimQueryParameters = require( 'SIM_CORE/StandardSimQueryParameters' );

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const FPSCounter = require( 'SIM_CORE/core-internal/FPSCounter' );
  const Loader = require( 'SIM_CORE/core-internal/Loader' );
  const NavigationBar = require( 'SIM_CORE/core-internal/NavigationBar' );
  const Screen = require( 'SIM_CORE/Screen' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const Util = require( 'SIM_CORE/util/Util' );

  class Sim {

    /**
     * Starting point of the sim: initiates and launches the simulation. Will throw an error if called more than once.
     * @public
     *
     * @param {Object} config - required object literal that provides configuration information for the simulation.
     *                          See the early portion of this static method for details.
     */
    static start( config ) {
      assert( !this.initiated, 'Sim has already been launched.' );

      config = {

        // {Screens[]} - all screens to the sim, in order that they will appear in the home-screen and navigation-bar.
        screens: config.screens,

        // {string} - the name of the simulation, displayed in the navigation-bar, loader, and home-screen
        name: config.name,

        // {number} (optional) - maximum delta-time in the animation loop. Used to prevent sudden dt bursts when the
        //                       user comes back to the tab after a while or unminimizes the browser.
        maxDT: config.maxDT || 0.5,

        ...config
      };

      assert( Util.isArray( config.screens ), `invalid screens: ${ config.screens }` );
      assert( config.screens.every( screen => screen instanceof Screen ), `invalid screens: ${ config.screens }` );
      assert( typeof config.name === 'string', `invalid name: ${ config.name }` );
      assert( typeof config.maxDT === 'number' && config.maxDT > 0, `invalid maxDT: ${ config.maxDT }` );

      //----------------------------------------------------------------------------------------

      // @public {boolean} (read-only) - indicates if the simulation has already been initiated and launched,
      //                                 which it now true.
      this.initiated = true;

      // @public {string} (read-only) - reference to the name of the simulation.
      this.simName = config.name;

      // @public {Screens[]} (read-only) - reference to the screens of the simulation.
      this.screens = config.screens;

      // @public {Display} (read-only) - Initialize a display to attach to the browser window.
      this.display = new Display().initiate();

      // Create the Loader and start.
      const loader = new Loader( this );
      this.display.addChild( loader );
      loader.load( this ); // Start loading


      // Add the navigation bar
      this.navigationBar = new NavigationBar( config.name );
      this.display.addChild( this.navigationBar );

      // Initialize a fps-counter if the ?fps query parameter was provided.
      if ( StandardSimQueryParameters.fps ) {
        const fpsCounter = new FPSCounter();
        this.display.addChild( fpsCounter );
        this.display.on( 'frame', dt => { fpsCounter.registerNewFrame( dt ) } ); // doesn't need to be unlinked.
      }

      // Enable the red dev border around ScreenViews if the ?dev query parameter was provided.
      if ( StandardSimQueryParameters.dev ) { ScreenView.enableDevBorder(); }

      // Log the current version of the simulation if the query parameter ?version was provided.
      if ( StandardSimQueryParameters.version ) {

        // eslint-disable-next-line no-console
        console.log( `${ config.name }: v${ JSON.parse( require( 'text!REPOSITORY/package.json' ) ).version }` );
      }

      // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
      // see https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
      window.addEventListener( 'pageshow', event => { if ( event.persisted ) window.location.reload(); } );


      // prevent pinch and zoom https://stackoverflow.com/questions/37808180/disable-viewport-zooming-ios-10-safari
      // Maybe we want to detect if passive is supportive
      // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
      // if ( Sim.isMobile ) {
      //   document.addEventListener( 'touchmove', event => {
      //     if ( event.scale !== 1 ) { event.preventDefault(); }
      //   }, { passive: false } );
      // }
    }

    /**
     * Finishes loading the Screens by fixing their heights and resizing.
     * @public
     */
    static finishLoadingScreens() {
      // Enable the red dev border around ScreenViews if the ?dev query parameter was provided.
      if ( StandardSimQueryParameters.dev ) { ScreenView.enableDevBorder(); }

      this.display.on( 'resize', ( width, height ) => {
        this.navigationBar.layout( width, height );
        const screenHeight = height - parseFloat( this.navigationBar.style.height );

        this.screens.forEach( screen => {
         screen.style.height = `${ screenHeight }px`;

         screen.view.layout( width, screenHeight );
        } );
      } );
    }
  }

  // // @private {boolean} - indicates if the current window is running on a mobile device.
  // Sim._isMobile: ( () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  //                         .test( navigator.userAgent || navigator.vendor || window.opera ) )();

  return Sim;
} );