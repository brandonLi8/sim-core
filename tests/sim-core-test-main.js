// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Main entry point for sim-core tests. Tests all files in the tests directory.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const truenit = require( 'truenit' );

  //========================================================================================
  // Start testing
  //========================================================================================

  truenit.registerTest( 'Vector', require( 'TESTS/util/VectorTests' ) );

  truenit.start();
} );