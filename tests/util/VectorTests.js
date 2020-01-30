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

  return () => {

    // Define basic Vectors - should stay static.
    const A = new Vector( 4, 2 );
    const B = new Vector( 2, 3 );
    const C = new Vector( 5.2, 8.6 );
    const D = new Vector( 2, Number.POSITIVE_INFINITY );
    const E = new Vector( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );

    //----------------------------------------------------------------------------------------
    // Basic
    //----------------------------------------------------------------------------------------

    // properties
    truenit.ok( A.x === 4 && A.y === 2 && A.getX() === 4 && A.getY() === 2 );
    truenit.ok( B.x === 2 && B.y === 3 && B.getX() === 2 && B.getY() === 3 );
    truenit.ok( Vector.ZERO.x === 0 && Vector.ZERO.y === 0 && Vector.ZERO.getX() === 0 && Vector.ZERO.getY() === 0 );
    truenit.ok( [ E.x, E.y, E.getX(), E.getY() ].every( number => number === Number.POSITIVE_INFINITY ) );

    // equals
    truenit.ok( !A.equals( B ) && !B.equals( A ) );
    truenit.ok( A.equals( A ) );
    truenit.ok( Vector.ZERO.equals( Vector.ZERO.copy() ) );
    truenit.ok( E.equals( E ) );
    truenit.ok( !D.equals( E ) && !E.equals( D ) );
    truenit.ok( !C.equals( false ) );

    // equalsEpsilon
    truenit.ok( !A.equalsEpsilon( C ) && !C.equalsEpsilon( A ) );
    truenit.ok( A.equalsEpsilon( A ) );
    truenit.ok( Vector.ZERO.equalsEpsilon( Vector.ZERO.copy() ) );
    truenit.ok( E.equalsEpsilon( E.copy() ) );
    truenit.ok( !Vector.ZERO.equalsEpsilon( E ) );
    truenit.ok( E.equalsEpsilon( E ) );
    truenit.ok( !E.equalsEpsilon( D ) && !D.equalsEpsilon( E ) );
    truenit.ok( new Vector( 5.2000001, 8.5999999 ).equalsEpsilon( C ) );
    truenit.ok( !C.equalsEpsilon( new Vector( 5, 5 ) ) );


  };
} );