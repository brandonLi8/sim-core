// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/DerivedProperty`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const DerivedProperty = require( 'SIM_CORE/util/DerivedProperty' );
  const Property = require( 'SIM_CORE/util/Property' );
  const truenit = require( 'truenit' );

  return () => {

    // Define basic Properties. These will change in the tests.
    const A = new Property( 1 );
    const B = new Property( 2 );
    const C = new Property( 3 );
    const D = new Property( 4 );

    // Create the DerivedProperty based on A, B, C, D
    const SumProperty = new DerivedProperty(
      [ A, B, C, D ],
      ( a, b, c, d ) => {

        // Check that the passed in values correlate to A, B, C, D
        truenit.ok( a === A.value && b === B.value && c === C.value && d === D.value );

        // Return the sum of A, B, C, D
        return a + b + c + d;
      } );

    //----------------------------------------------------------------------------------------

    // Test the initial value of SumProperty
    truenit.ok( SumProperty.value === 1 + 2 + 3 + 4 );

    // Mutators and initialValue should throw errors
    truenit.throws( () => { SumProperty.set( 5 ); } );
    truenit.throws( () => { SumProperty.value = 5; } );
    truenit.throws( () => { SumProperty.reset(); } );
    truenit.throws( () => { SumProperty.getInitialValue(); } );
    truenit.throws( () => { SumProperty.initialValue; } );

    // Mutate each Property and check that the value of SumProperty is correct.
    A.set( 0 );
    truenit.ok( SumProperty.value === 0 + 2 + 3 + 4 );

    B.set( 0 );
    truenit.ok( SumProperty.value === 0 + 0 + 3 + 4 );

    C.set( 0 );
    truenit.ok( SumProperty.value === 0 + 0 + 0 + 4 );

    D.set( 0 );
    truenit.ok( SumProperty.value === 0 + 0 + 0 + 0 );

    // Reset each Property and check that the value of SumProperty is correct.
    A.reset();
    B.reset();
    C.reset();
    D.reset();
    truenit.ok( SumProperty.value === 1 + 2 + 3 + 4 );

    // Dispose
    SumProperty.dispose();

    // Mutate each Property and check that the value of SumProperty doesn't change.
    A.set( 0 );
    B.set( 0 );
    C.set( 0 );
    D.set( 0 );
    truenit.ok( SumProperty.value === 1 + 2 + 3 + 4 );
  };
} );