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
  const Node = require( 'SIM_CORE/scenery/Node' );
  const QueryParameters = require( 'SIM_CORE/util/QueryParameters' );
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

  // constants
  const SIM_CORE_QUERY_PARAMETERS = QueryParameters.retrieve( {
    ea: {
      type: 'flag'
    }
  } );


  class Sim {
    constructor( test ) {

      // initialize the query parameter functionality
      if ( SIM_CORE_QUERY_PARAMETERS.ea ) assert.enableAssertions();





      const display = new Display();
      const loader = new Loader();

      display.addChild( loader );
      // loader.addChild( test )



    }
  }

  return Sim;
} );