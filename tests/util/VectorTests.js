// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Vector`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const truenit = require( 'truenit' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  //----------------------------------------------------------------------------------------
  const VectorTester = () => {

    //----------------------------------------------------------------------------------------
    // Define basic Vectors
    //----------------------------------------------------------------------------------------
    const A = new Vector( 4, 2 );
    const B = new Vector( 2, 3 );
    const C = new Vector( 5.2, 8.6 );
    const D = new Vector( 2, 3 );

    //----------------------------------------------------------------------------------------
    // Basic properties tests.
    //----------------------------------------------------------------------------------------
    truenit.ok( A.x === 4 && A.y === 2, 'basic' );
    truenit.ok( B.x === 2 && B.y === 3, 'basic' );
    truenit.ok( C.x === 5.2 && C.y === 8.6, 'basic' );
    truenit.ok( D.x === 2 && D.y === 3, 'basic' );
    truenit.ok( Vector.ZERO.x === 0 && Vector.ZERO.y === 0, 'basic' );

    //----------------------------------------------------------------------------------------
    // Distance and Magnitude tests
    //----------------------------------------------------------------------------------------
    const distance1And3 = ( 1.2 ** 2 + 6.6 ** 2 ) ** 0.5;
    truenit.approximate( A.distanceTo( C ), distance1And3 );
    truenit.approximate( C.distanceTo( A ), distance1And3 );
    truenit.approximate( B.distanceTo( A ), 5 ** 0.5 );
    truenit.approximate( B.distanceTo( Vector.ZERO ), 13 ** 0.5 );
    truenit.approximate( B.magnitude, 13 ** 0.5 );
    truenit.approximate( B.getMagnitude(), 13 ** 0.5 );
    truenit.ok( Vector.ZERO.distanceTo( Vector.ZERO ) === 0 );
    truenit.approximate( B.distanceTo( B ), 0 );

    //----------------------------------------------------------------------------------------
    // Equality tests
    //----------------------------------------------------------------------------------------
    const closeVector = new Vector( A.x + 0.0000001, A.y + 0.0000001 );

    truenit.ok( B.equals( D ) );
    truenit.ok( D.equals( B.copy() ) );
    truenit.notOk( C.equals( B ) );
    truenit.notOk( A.equals( closeVector ) );
    truenit.ok( A.equalsEpsilon( closeVector ) );
    truenit.notOk( A.equals( closeVector ) );

    //----------------------------------------------------------------------------------------
    // IsFinite tests
    //----------------------------------------------------------------------------------------
    const nonFiniteVector1 = new Vector( 1.7976931348623157E+10308, 1.7976931348623157E+10308 );
    const nonFiniteVector2 = new Vector( Infinity, Infinity );

    truenit.ok( A.isFinite() && B.isFinite() && C.isFinite() && Vector.ZERO.isFinite() );
    truenit.notOk( nonFiniteVector1.isFinite() );
    truenit.notOk( nonFiniteVector1.isFinite() );
    truenit.notOk( nonFiniteVector2.isFinite() );

    //----------------------------------------------------------------------------------------
    // Test that the above tests didn't mutate anything
    //----------------------------------------------------------------------------------------
    truenit.ok( A.x === 4 && A.y === 2 );
    truenit.ok( B.x === 2 && B.y === 3 );
    truenit.ok( C.x === 5.2 && C.y === 8.6 );
    truenit.ok( D.x === 2 && D.y === 3 );
    truenit.ok( Vector.ZERO.x === 0 && Vector.ZERO.y === 0 );

    //----------------------------------------------------------------------------------------
    // To String
    //----------------------------------------------------------------------------------------
    A.toString();

    //----------------------------------------------------------------------------------------
    // Mutators
    //----------------------------------------------------------------------------------------

    // Copy the vectors
    const vector1Copy = A.copy();
    const vector3Copy = C.copy();
    const vector4Copy = D.copy();

    vector1Copy.set( B );
    truenit.ok( vector1Copy.equals( B ) );

    vector1Copy.setX( 0 );
    vector1Copy.setY( 0 );
    truenit.ok( vector1Copy.equals( Vector.ZERO ) );

    vector3Copy.set( vector1Copy );
    vector4Copy.setX( vector1Copy.x ).setY( vector1Copy.y );
    truenit.ok( vector3Copy.equals( vector4Copy ) );

    // normalize (which also tests divide and multiply)
    truenit.ok( D.copy().normalize().equalsEpsilon(
      new Vector( 2 / D.magnitude, 3 / D.magnitude )
    ) );

    // add and subtract
    truenit.ok( A.copy().add( new Vector( 4, 4 ) ).equals( new Vector( 8, 6 ) ) );
    truenit.ok( A.copy().subtract( new Vector( 4, 4 ) ).equals( new Vector( 0, -2 ) ) );

    truenit.ok( A.x === 4 && A.y === 2 );
    truenit.ok( B.x === 2 && B.y === 3 );
    truenit.ok( C.x === 5.2 && C.y === 8.6 );
    truenit.ok( D.x === 2 && D.y === 3 );
    truenit.ok( Vector.ZERO.x === 0 && Vector.ZERO.y === 0 );

  };

  return VectorTester;
} );