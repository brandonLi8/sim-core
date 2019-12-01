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

  // constants
  const PACKAGE_OBJECT = JSON.parse( require( 'text!REPOSITORY/package.json' ) );
  const SIM_CORE_QUERY_PARAMETERS = QueryParameters.retrieve( {
    ea: {
      type: 'flag'
    },
    fps: {
      type: 'flag'
    },
    version: {
      type: 'flag'
    }
  } );

  class Sim {
    constructor() {

      // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
      // see https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
      window.addEventListener( 'pageshow', function( event ) {
        if ( event.persisted ) {
          window.location.reload();
        }
      } );

      if ( SIM_CORE_QUERY_PARAMETERS.version ) {
        console.log( `${ Util.toTitleCase( PACKAGE_OBJECT.name ) }: v${ PACKAGE_OBJECT.version }` );
      }

      // initialize the query parameter functionality
      if ( SIM_CORE_QUERY_PARAMETERS.ea ) assert.enableAssertions();

      const display = new Display();
      const loader = new Loader();

      display.addChild( loader );


      if ( SIM_CORE_QUERY_PARAMETERS.fps ) {
        const counter = new FPSCounter();
        counter.start();
        display.addChild( counter );
      }
    }
  }

  return Sim;
} );