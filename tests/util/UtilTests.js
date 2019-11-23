// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Util`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const truenit = require( 'truenit' );
  const Util = require( 'SIM_CORE/util/Util' );


  const UtilTester = () => {

    //----------------------------------------------------------------------------------------
    // Equals Epsilon (test first to use in other tests)
    //----------------------------------------------------------------------------------------
    // truenit.ok( Util.equalsEpsilon( 5.000001, 5 ) );
    // truenit.notOk( Util.equalsEpsilon( 5.12093, 1.213 ) );
    // truenit.ok( Util.equalsEpsilon( 5, 5 ) );

    //----------------------------------------------------------------------------------------
    // Conversion Tests
    //----------------------------------------------------------------------------------------

    // degrees -> radians
    truenit.approximate( Util.toRadians( 90 ), Math.PI / 2 );
    truenit.approximate( Util.toRadians( 45 ), Math.PI / 4 );
    truenit.approximate( Util.toRadians( -45 ), -Math.PI / 4 );

    // radians -> degrees
    truenit.approximate( 90, Util.toDegrees( Math.PI / 2 ) );
    truenit.approximate( 45, Util.toDegrees( Math.PI / 4 ) );
    truenit.approximate( -45, Util.toDegrees( -Math.PI / 4 ) );

    // meters -> custom
    truenit.approximate( Util.convertTo( 49, Util.MILLI ), 49000 );
    truenit.approximate( Util.convertTo( 0.803, Util.CENTI ), 80.3 );
    truenit.approximate( Util.convertTo( 90.2, Util.KILO ), 0.0902 );

    // custom -> meters
    truenit.approximate( Util.convertFrom( 49000, Util.MILLI ), 49 );
    truenit.approximate( Util.convertFrom( 80.3, Util.CENTI ), 0.803 );
    truenit.approximate( Util.convertFrom( 0.0902, Util.KILO ), 90.2 );

    //----------------------------------------------------------------------------------------
    // Math Utilities Tests
    //----------------------------------------------------------------------------------------

    // clamp
    truenit.equals( Util.clamp( 5, 1, 4 ), 4 );
    truenit.equals( Util.clamp( 3, 1, 4 ), 3 );
    truenit.equals( Util.clamp( 0, 1, 4 ), 1 );

    // gcd
    truenit.equals( Util.gcd( 3, 3 ), 3 );
    truenit.equals( Util.gcd( Math.pow( 3, 6 ), Math.pow( 2, 6 ) ), 1 );
    truenit.equals( Util.gcd( 1568160, 3143448 ), 7128 );

    // lcm
    truenit.equals( Util.lcm( 3, 3 ), 3 );
    truenit.equals( Util.lcm( 15, 20 ), 60 );
    truenit.equals( Util.lcm( 0, 1000 ), 0 );

    // solveLinearRootsReal
    truenit.equals( Util.solveLinearRootsReal( 0, 0 ), null );        // 0 = 0        => null
    truenit.arrayApproximate( Util.solveLinearRootsReal( 1, 0 ), [ 0 ] );       // x = 0        => x = 0
    truenit.arrayApproximate( Util.solveLinearRootsReal( -1, 0 ), [ 0 ] );      // -x = 0       => x = 0
    truenit.arrayApproximate( Util.solveLinearRootsReal( 0, 1 ), [] );          // 1 = 0        => null
    truenit.arrayApproximate( Util.solveLinearRootsReal( 1, 1 ), [ -1 ] );      // x + 1 = 0    => x = -1
    truenit.arrayApproximate( Util.solveLinearRootsReal( -1, 1 ), [ 1 ] );      // -x + 1 = 0   => x = 1
    truenit.arrayApproximate( Util.solveLinearRootsReal( 3, 2 ), [ -2 / 3 ] );  // 3x + 2 = 0   => x = -2/3
    truenit.arrayApproximate( Util.solveLinearRootsReal( -3, 2 ), [ 2 / 3 ] );  // -3x + 2 = 0  => x = 2/3

  };

  return UtilTester;
} );