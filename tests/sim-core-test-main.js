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

  // Start up the browser environment
  require( 'browser-env' )();
  require( 'canvas' );

  // Enable assertions
  assert.enableAssertions();

  // Register all test files.
  truenit.registerTest( 'Util', () => { require( 'TESTS/util/UtilTests' )(); } );
  truenit.registerTest( 'Vector', () => { require( 'TESTS/util/VectorTests' )(); } );
  truenit.registerTest( 'Bounds', () => { require( 'TESTS/util/BoundsTests' )(); } );
  truenit.registerTest( 'Range', () => { require( 'TESTS/util/RangeTests' )(); } );
  truenit.registerTest( 'ModelViewTransform', () => { require( 'TESTS/util/ModelViewTransformTests' )(); } );
  truenit.registerTest( 'Property', () => { require( 'TESTS/util/PropertyTests' )(); } );
  truenit.registerTest( 'Multilink', () => { require( 'TESTS/util/MultilinkTests' )(); } );
  truenit.registerTest( 'DerivedProperty', () => { require( 'TESTS/util/DerivedPropertyTests' )(); } );
  truenit.registerTest( 'Enum', () => { require( 'TESTS/util/EnumTests' )(); } );
  truenit.registerTest( 'Shape', () => { require( 'TESTS/util/ShapeTests' )(); } );
  truenit.registerTest( 'ColorWheel', () => { require( 'TESTS/util/ColorWheelTests' )(); } );
  truenit.registerTest( 'Node', () => { require( 'TESTS/scenery/NodeTests' )(); } );

  // Run tests
  truenit.start();
} );