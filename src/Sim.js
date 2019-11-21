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

  const second = require( 'image!SIM_CORE/About/Brandon.jpg')
  const third = require( 'image!SIM_CORE/Skills/CSS.png')
  const fourth = require( 'image!SIM_CORE/Contact/Phone.png')
  const fifth = require( 'image!SIM_CORE/Education/Fairview.png')

  class Sim {
    constructor( test ) {

      // initialize the query parameter functionality
      if ( SIM_CORE_QUERY_PARAMETERS.ea ) assert.enableAssertions();





      const display = new Display();
      const loader = new Loader();

      display.addChild( loader );
      display.addChild( test )
      display.addChild( fifth )
      display.addChild( second )
      display.addChild( third )
      display.addChild( fourth )



    }
  }

  return Sim;
} );