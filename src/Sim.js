// Copyright © 2019 Brandon Li. All rights reserved.
/* eslint no-console: 0 */

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
  const QueryParameters = require( 'SIM_CORE/util/QueryParameters' );
  const Util = require( 'SIM_CORE/util/Util' );
  const NavigationBar = require( 'SIM_CORE/core-internal/NavigationBar' );

  // constants
  const PACKAGE_OBJECT = JSON.parse( require( 'text!REPOSITORY/package.json' ) );
  const SIM_CORE_QUERY_PARAMETERS = QueryParameters.retrieve( {

    /**
     * Enables assertions, which are disable unless this parameter is provided.
     * See './util/assert.js' for more details.
     * For internal testing only.
     */
    ea: {
      type: 'flag'
    },

    /**
     * Disables the fps in the top left is provided.
     * See './core-internal/FPSCounter' for more details.
     * For internal testing only.
     */
    fps: {
      type: 'flag'
    },

    /**
     * Logs the current version of the simulation if provided.
     * For internal testing only.
     */
    version: {
      type: 'flag'
    }
  } );

  //----------------------------------------------------------------------------------------

  class Sim {

    /**
     * @param {Screen} screen - the screen to display
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             All options are specific to this class. See below details.
     */
    constructor( screen, options ) {

      options = {

        // {string} - the name of the simulation. Defaults to an attempted title case conversion from the package name.
        name: PACKAGE_OBJECT.name ? Util.toTitleCase( PACKAGE_OBJECT.name ) : '',

        // override
        ...options
      };

      //----------------------------------------------------------------------------------------
      // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
      // see https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
      window.addEventListener( 'pageshow', function( event ) {
        if ( event.persisted ) {
          window.location.reload();
        }
      } );

      // Log the current version of the simulation if the query parameter was provided.
      if ( SIM_CORE_QUERY_PARAMETERS.version ) {
        console.log( `${ options.name }: v${ PACKAGE_OBJECT.version }` );
      }

      // Enable assertion if the query parameter was provided.
      if ( SIM_CORE_QUERY_PARAMETERS.ea ) assert.enableAssertions();

      // Initialize a display and loader
      const display = new Display();
      const loader = new Loader();

      display.addChild( loader );

      // Add the FPSCounter if the query parameter was provided.
      if ( SIM_CORE_QUERY_PARAMETERS.fps ) {
        const counter = new FPSCounter();
        counter.start();
        display.addChild( counter );
      }

      // Add the navigation bar
      const navigationBar = new NavigationBar( options.name );

      display.addChild( navigationBar );


      window.onresize = () => {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        navigationBar.layout( windowWidth, windowHeight );

        // const screenHeight = windowHeight - parseFloat( navigationBar.style.height );
      };
      window.onresize();

    }
  }

  return Sim;
} );