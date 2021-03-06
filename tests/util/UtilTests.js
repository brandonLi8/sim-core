// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Util`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const truenit = require( 'truenit' );
  const Util = require( 'SIM_CORE/util/Util' );


  return () => {

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

    // solveLinearRoots
    truenit.equals( Util.solveLinearRoots( 0, 0 ), null );                  // 0 = 0        => null
    truenit.arrayApproximate( Util.solveLinearRoots( 1, 0 ), [ 0 ] );       // x = 0        => x = 0
    truenit.arrayApproximate( Util.solveLinearRoots( -1, 0 ), [ 0 ] );      // -x = 0       => x = 0
    truenit.arrayApproximate( Util.solveLinearRoots( 0, 1 ), [] );          // 1 = 0        => _
    truenit.arrayApproximate( Util.solveLinearRoots( 1, 1 ), [ -1 ] );      // x + 1 = 0    => x = -1
    truenit.arrayApproximate( Util.solveLinearRoots( -1, 1 ), [ 1 ] );      // -x + 1 = 0   => x = 1
    truenit.arrayApproximate( Util.solveLinearRoots( 3, 2 ), [ -2 / 3 ] );  // 3x + 2 = 0   => x = -2/3
    truenit.arrayApproximate( Util.solveLinearRoots( -3, 2 ), [ 2 / 3 ] );  // -3x + 2 = 0  => x = 2/3

    // solveQuadraticRoots
    truenit.equals( Util.solveQuadraticRoots( 0, 0, 0 ), null );                       // 0 = 0         => null
    truenit.arrayApproximate( Util.solveQuadraticRoots( 0, 1, 0 ), [ 0 ] );            // x = 0         => x = 0
    truenit.arrayApproximate( Util.solveQuadraticRoots( 0, 0, 1 ), [] );               // 1 = 0         => _
    truenit.arrayApproximate( Util.solveQuadraticRoots( 1, -6, 9 ), [ 3 ] );           // x^2 - 6x + 0  => x = 3
    truenit.arrayApproximate( Util.solveQuadraticRoots( 0, -3, 2 ), [ 2 / 3 ] );       // -3x + 2       => x = 2 /3
    truenit.arrayApproximate( Util.solveQuadraticRoots( 1, 0, 1 ), [] );               // x^2 + 1 = 0   => null
    truenit.arrayApproximate( Util.solveQuadraticRoots( 2, -1, -3 ), [ -1, 3 / 2 ] );  // 2x^2 -x - 3   => x = -1 || 3/2

    // cubeRoot
    truenit.equals( Util.cubeRoot( 8 ), 2 );
    truenit.equals( Util.cubeRoot( -8 ), -2 );
    truenit.equals( Util.cubeRoot( 27 ), 3 );

    // roundSymmetric
    truenit.equals( Util.roundSymmetric( 0.5 ), 1 );
    truenit.equals( Util.roundSymmetric( 0.3 ), 0 );
    truenit.equals( Util.roundSymmetric( 0.8 ), 1 );
    truenit.equals( Util.roundSymmetric( -0.5 ), -1 );
    for ( let i = 0; i < 20; i++ ) {
      truenit.equals( Util.roundSymmetric( i ), i );
      truenit.equals( Util.roundSymmetric( -i ), -i );
      truenit.equals( Util.roundSymmetric( i + 0.5 ), i + 1 );
      truenit.equals( Util.roundSymmetric( -i - 0.5 ), -i - 1 );
    }

    // toFixed
    truenit.equals( Util.toFixed( 54.23, 2 ), 54.23 );
    truenit.equals( Util.toFixed( 60, 100 ), 60 );
    truenit.equals( Util.toFixed( 60.32, 0 ), 60 );
    truenit.equals( Util.toFixed( 60.3235, 3 ), 60.324 );
    truenit.equals( Util.toFixed( 60.3236, 3 ), 60.324 );
    truenit.equals( Util.toFixed( 60.3234, 3 ), 60.323 );

    // isInteger
    truenit.ok( Util.isInteger( 60.00 ) );
    truenit.ok( Util.isInteger( 34 ) );
    truenit.ok( Util.isInteger( 0 ) );
    truenit.notOk( Util.isInteger( 60.02 ) );
    truenit.notOk( Util.isInteger( 62.2 ) );

    // equalsEpsilon
    truenit.ok( Util.equalsEpsilon( 5.000001, 5 ) );
    truenit.notOk( Util.equalsEpsilon( 5.12093, 1.213 ) );
    truenit.ok( Util.equalsEpsilon( 5, 5 ) );

    // sign
    truenit.equals( Util.sign( 3 ), 1 );
    truenit.equals( Util.sign( '-3' ), -1 );
    truenit.equals( Util.sign( -0 ), -0 );

    //----------------------------------------------------------------------------------------
    // Elementary Functions
    //----------------------------------------------------------------------------------------

    // cosh
    truenit.equals( Util.cosh( 0 ), 1 );
    truenit.approximate( Util.cosh( 3 ), 10.067662 );
    truenit.approximate( Util.cosh( -10 ), 11013.23292 );

    // sinh
    truenit.equals( Util.sinh( 0 ), 0 );
    truenit.approximate( Util.sinh( 3 ), 10.017874974099 );
    truenit.approximate( Util.sinh( -10 ), -11013.232874703 );

    // log10
    truenit.equals( Util.log10( 1 ), 0 );
    truenit.approximate( Util.log10( 3 ), 0.4771212547 );
    truenit.approximate( Util.log10( 0.000001 ), -6 );


    //----------------------------------------------------------------------------------------
    // Miscellaneous Utilities
    //----------------------------------------------------------------------------------------

    // numberOfDecimalPlaces
    truenit.equals( Util.numberOfDecimalPlaces( 10 ), 0 );
    truenit.equals( Util.numberOfDecimalPlaces( -10 ), 0 );
    truenit.equals( Util.numberOfDecimalPlaces( 10.1 ), 1 );
    truenit.equals( Util.numberOfDecimalPlaces( -10.1 ), 1 );
    truenit.equals( Util.numberOfDecimalPlaces( 10.10 ), 1 );
    truenit.equals( Util.numberOfDecimalPlaces( -10.10 ), 1 );
    truenit.equals( Util.numberOfDecimalPlaces( 0.567 ), 3 );
    truenit.equals( Util.numberOfDecimalPlaces( -0.567 ), 3 );
    truenit.equals( Util.numberOfDecimalPlaces( 0.001 ), 3 );
    truenit.equals( Util.numberOfDecimalPlaces( -0.001 ), 3 );

    // isArray
    truenit.ok( Util.isArray( [ 1, 2, 3 ] ) );
    truenit.ok( Util.isArray( [] ) );
    truenit.ok( !Util.isArray( 0 ) );
    truenit.ok( !Util.isArray( {} ) );
    truenit.ok( !Util.isArray( function() {} ) );

    //----------------------------------------------------------------------------------------
    // arrayRemove
    let arr = [ 4, 3, 2, 1, 3 ];
    Util.arrayRemove( arr, 3 );

    truenit.equals( arr[ 0 ], 4 );
    truenit.equals( arr[ 1 ], 2 );
    truenit.equals( arr[ 2 ], 1 );
    truenit.equals( arr[ 3 ], 3 );
    truenit.equals( arr.length, 4 );

    // check reference removal
    const a = {};
    const b = {};
    const c = {};

    arr = [ a, b, c ];
    Util.arrayRemove( arr, b );

    truenit.equals( arr[ 0 ], a );
    truenit.equals( arr[ 1 ], c );
    truenit.equals( arr.length, 2 );

    //----------------------------------------------------------------------------------------
    // toCamelCase
    truenit.equals( Util.toCamelCase( 'foo-bar' ), 'fooBar' );
    truenit.equals( Util.toCamelCase( 'foobar' ), 'foobar' );
    truenit.equals( Util.toCamelCase( 'foo-bar-tap-map' ), 'fooBarTapMap' );
    truenit.equals( Util.toCamelCase( '' ), '' );

    // toTitleCase
    truenit.equals( Util.toTitleCase( 'foo-bar' ), 'Foo Bar' );
    truenit.equals( Util.toTitleCase( 'foobar' ), 'Foobar' );
    truenit.equals( Util.toTitleCase( 'foo-bar-tap-map' ), 'Foo Bar Tap Map' );
    truenit.equals( Util.toTitleCase( '' ), '' );
    truenit.equals( Util.toTitleCase( 'f' ), 'F' );
  };
} );