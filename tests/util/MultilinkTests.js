// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Multilink`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Multilink = require( 'SIM_CORE/util/Multilink' );
  const Property = require( 'SIM_CORE/util/Property' );
  const truenit = require( 'truenit' );

  return () => {

    // Define basic Properties. These will change in the tests.
    const A = new Property( 1 );
    const B = new Property( 2 );
    const C = new Property( 3 );
    const D = new Property( 4 );

    // Reference to the sum of A, B, C, D
    let sum;

    // Create the Multilink based on A, B, C, D
    const SumMultilink = new Multilink(
      [ A, B, C, D ],
      ( a, b, c, d ) => {

        // Check that the passed in values correlate to A, B, C, D
        truenit.ok( a === A.value && b === B.value && c === C.value && d === D.value );

        sum = a + b + c + d;
      } );

    //----------------------------------------------------------------------------------------

    // Test the initial value of sum.
    truenit.ok( sum === 1 + 2 + 3 + 4 );

    // Mutate each Property and check that the value of sum is correct.
    A.set( 0 );
    truenit.ok( sum === 0 + 2 + 3 + 4 );

    B.set( 0 );
    truenit.ok( sum === 0 + 0 + 3 + 4 );

    C.set( 0 );
    truenit.ok( sum === 0 + 0 + 0 + 4 );

    D.set( 0 );
    truenit.ok( sum === 0 + 0 + 0 + 0 );

    // Reset each Property and check that the value of sum is correct.
    A.reset();
    B.reset();
    C.reset();
    D.reset();
    truenit.ok( sum === 1 + 2 + 3 + 4 );

    // Dispose
    SumMultilink.dispose();

    // Mutate each Property and check that the value of sum doesn't change.
    A.set( 0 );
    B.set( 0 );
    C.set( 0 );
    D.set( 0 );
    truenit.ok( sum === 1 + 2 + 3 + 4 );
  };
} );