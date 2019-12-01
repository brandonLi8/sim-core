// Copyright © 2019 Brandon Li. All rights reserved.

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
  const Loader = require( 'SIM_CORE/core-internal/Loader' );
  // const Node = require( 'SIM_CORE/scenery/Node' );
  const QueryParameters = require( 'SIM_CORE/util/QueryParameters' );
  const Display = require( 'SIM_CORE/core-internal/Display' );
  // const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const FPSCounter = require( 'SIM_CORE/core-internal/FPSCounter' );

  // constants
  const SIM_CORE_QUERY_PARAMETERS = QueryParameters.retrieve( {
    ea: {
      type: 'flag'
    },
    fps: {
      type: 'flag'
    }
  } );

  // const second = require( 'image!SIM_CORE/About/Brandon.jpg')
  // const third = require( 'image!SIM_CORE/Skills/CSS.png')
  // const fourth = require( 'image!SIM_CORE/Contact/Phone.png')
  // const fifth = require( 'image!SIM_CORE/Education/Fairview.png')
  // const fifth1 = require( 'image!SIM_CORE/Projects/Calculator.jpg')
  // const fifth2 = require( 'image!SIM_CORE/Projects/CollisionTheory.jpg')
  // const fifth3 = require( 'image!SIM_CORE/Projects/LearningApp.jpg')
  // const fifth4 = require( 'image!SIM_CORE/Projects/LearningApp2.jpg')
  // const fifth5 = require( 'image!SIM_CORE/Projects/Qoz.jpg')
  // const fifth6 = require( 'image!SIM_CORE/Projects/Placeholder.jpg')
  // const fifth7 = require( 'image!SIM_CORE/Projects/Metronome1.jpg')

  class Sim {
    constructor( h ) {

      // initialize the query parameter functionality
      if ( SIM_CORE_QUERY_PARAMETERS.ea ) assert.enableAssertions();



      // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
      // see https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
      window.addEventListener( 'pageshow', function( event ) {
        if ( event.persisted ) {
          window.location.reload();
        }
      } );

      const display = new Display();
      const loader = new Loader();


      display.addChild( loader );
      display.addChild( h );

      // display.addChild( fifth )
      // display.addChild( second )
      // display.addChild( third )
      // display.addChild( fourth )
      // display.addChild( fifth1 )
      // display.addChild( fifth2 )
      // display.addChild( fifth3 )
      // display.addChild( fifth4 )
      // display.addChild( fifth5 )
      // display.addChild( fifth6 )
      // display.addChild( fifth7 )

      if ( SIM_CORE_QUERY_PARAMETERS.fps ) {
        const counter = new FPSCounter();
        counter.start();
        display.addChild( counter );
      }


    }
  }

  return Sim;
} );