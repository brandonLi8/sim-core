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
  const Loader = require( 'SIM_CORE/loader' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const QueryParameters = require( 'SIM_CORE/util/QueryParameters' );

  class Sim {
    constructor( f ) {
      console.log( QueryParameters.retrieve( {

        dev: {
          type: 'flag'
        },

        ea: {
          type: 'string',
          defaultValue: 'hello',
          isValidValue: value => ( true )
        }



      } ) )


    }
  }

  return Sim;
} );