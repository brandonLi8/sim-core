// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Testing RequireJS configuration file for the sim.
 * Paths are relative to the location of this file.
 *
 * IMPORTANT: This config is for testing only! For sim use, see `./sim-core-main.js`
 *
 * To test: run `npm test`
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
module.exports = ( () => {
  'use strict';

  // modules
  const requirejs = require( 'requirejs' );

  requirejs.config( {

    deps: [ 'SIM_CORE/sim-core-main', 'SIM_CORE/sim-core-test.js' ],

    paths: {
      SIM_CORE: '.',
    }
  } );
} );
