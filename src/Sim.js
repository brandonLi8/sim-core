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
  const Loader = require( 'SIM_CORE/launch/loader' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const QueryParameters = require( 'SIM_CORE/util/QueryParameters' );
  const Display = require( 'SIM_CORE/display/Display' );

  // images
  const test = require( 'image!SIM_CORE/pauseButton.png' );

  console.log( test )
  // constants
  const SIM_CORE_QUERY_PARAMETERS = QueryParameters.retrieve( {
    ea: {
      type: 'flag'
    }
  } );


  class Sim {
    constructor() {

      // initialize the query parameter functionality
      if ( SIM_CORE_QUERY_PARAMETERS.ea ) assert.enableAssertions();





      const display = new Display();

      const loader = new Loader( display );

    }
  }

  return Sim;
} );