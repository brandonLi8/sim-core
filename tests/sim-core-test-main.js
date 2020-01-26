// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Main entry point for sim-core tests. Tests all files in the tests directory.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const truenit = require( 'truenit' );

  //----------------------------------------------------------------------------------------
  // enable assert
  assert.enableAssertions();

  truenit.registerTest( 'Util', require( 'TESTS/util/UtilTests' ) );
  truenit.registerTest( 'Vector', require( 'TESTS/util/VectorTests' ) );
  truenit.registerTest( 'Bounds', require( 'TESTS/util/BoundsTests' ) );
  truenit.registerTest( 'Range', require( 'TESTS/util/RangeTests' ) );
  truenit.registerTest( 'ModelViewTransform', require( 'TESTS/util/ModelViewTransformTests' ) );
  truenit.registerTest( 'Property', require( 'TESTS/util/PropertyTests' ) );

  truenit.start();
} );