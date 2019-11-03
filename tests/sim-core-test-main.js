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

  //----------------------------------------------------------------------------------------
  // truenit.start( () => {

  //   truenit.testModule( 'Point', require( 'TESTS/util/PointTests' ) );






  // } );

    truenit.registerModule( 'Point', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'Node', require( 'TESTS/util/PointTests' ) );

    truenit.registerModule( 'ScreenView', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'Vector', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'VectorProperty', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'Merge', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'Enum', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'Property', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'PointProperty', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'Sim', require( 'TESTS/util/PointTests' ) );
    truenit.registerModule( 'ErrorModule', () => { throw new Error( 'Error Message')} );

    truenit.start();

  //========================================================================================
  // Start testing
  //========================================================================================
  // console.log( 'testing all...\n' );




  // console.log( '\nall tests passed!' );
} );