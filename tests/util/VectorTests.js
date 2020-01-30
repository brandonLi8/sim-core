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

    //----------------------------------------------------------------------------------------
    // Computations
    //----------------------------------------------------------------------------------------

    // magnitude
    truenit.approximate( A.magnitude, 20 ** 0.5 );
    truenit.approximate( B.magnitude, 13 ** 0.5 );
    truenit.approximate( C.magnitude, ( 5.2 ** 2 + 8.6 ** 2 ) ** 0.5 );
    truenit.ok( D.magnitude, Number.POSITIVE_INFINITY );
    truenit.ok( E.magnitude, Number.POSITIVE_INFINITY );
    truenit.approximate( B.magnitude, B.getMagnitude() );
    truenit.ok( E.magnitude === E.getMagnitude() );

    // dot
    truenit.ok( A.dot( B ) === 14 && B.dot( A ) === 14 );
    truenit.approximate( B.dot( C ), 36.2 );
    truenit.ok( D.dot( C ) === Number.POSITIVE_INFINITY && C.dot( D ) === Number.POSITIVE_INFINITY );
    truenit.ok( D.dot( E ) === Number.POSITIVE_INFINITY && E.dot( D ) === Number.POSITIVE_INFINITY );

    // dotXY
    truenit.ok( A.dotXY( 0, 0 ) === 0 );
    truenit.approximate( A.dotXY( A.x, A.y ), A.magnitude ** 2 );
    truenit.ok( A.dotXY( 5, 3 ) === 26 );
    truenit.ok( A.dotXY( 5, Number.POSITIVE_INFINITY ) === Number.POSITIVE_INFINITY );

    // distanceTo
    truenit.approximate( A.distanceTo( C ), ( 1.2 ** 2 + 6.6 ** 2 ) ** 0.5 );
    truenit.approximate( C.distanceTo( A ), ( 1.2 ** 2 + 6.6 ** 2 ) ** 0.5 );
    truenit.approximate( B.distanceTo( A ), 5 ** 0.5 );
    truenit.equals( A.distanceTo( E ), Number.POSITIVE_INFINITY );
    truenit.ok( isNaN( D.distanceTo( E ) ) );

    // distanceToXY
    truenit.approximate( B.distanceToXY( 0, 0 ), B.getMagnitude() );
    truenit.equals( Vector.ZERO.distanceToXY( 0, 0 ), 0 );
    truenit.approximate( B.distanceToXY( B.x, B.y ), 0 );
    truenit.ok( isNaN( D.distanceToXY( 0, Number.POSITIVE_INFINITY ) ) );
    truenit.equals( D.distanceToXY( Number.POSITIVE_INFINITY, 0 ), Number.POSITIVE_INFINITY );

    // isFinite
    truenit.ok( A.isFinite() && B.isFinite() && C.isFinite() && Vector.ZERO.isFinite() );
    truenit.notOk( D.isFinite() );
    truenit.notOk( E.isFinite() );

    // angleBetween
    truenit.approximate( new Vector( 1, 0 ).angleBetween( new Vector( 0, 1 ) ), Math.PI / 2 );
    truenit.approximate( A.angleBetween( A ), 0 );
    truenit.approximate( new Vector( 1, 0 ).angleBetween( new Vector( -1, 0 ) ), Math.PI );
    truenit.ok( isNaN( E.angleBetween( D ) ) );

    // angle
    truenit.approximate( new Vector( 1, 0 ).angle, 0 );
    truenit.approximate( new Vector( 1, 1 ).getAngle(), Math.PI / 4 );
    truenit.approximate( new Vector( -1, -1 ).getAngle(), -3 * Math.PI / 4 );
    truenit.approximate( A.angle, A.angleBetween( new Vector( 1, 0 ) ) );


  };
} );