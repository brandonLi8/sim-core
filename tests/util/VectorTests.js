// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Vector`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Vector = require( 'SIM_CORE/util/Vector' );
  const truenit = require( 'truenit' );

  //----------------------------------------------------------------------------------------
  const VectorTester = () => {

    //----------------------------------------------------------------------------------------
    // Define basic Vectors
    //----------------------------------------------------------------------------------------
    const vector1 = new Vector( 4, 2, true );
    const vector2 = new Vector( 2, 3, true );
    const vector3 = new Vector( 5.2, 8.6, true );
    const vector4 = new Vector( 2, 3, true );

    //----------------------------------------------------------------------------------------
    // Basic
    //----------------------------------------------------------------------------------------
    truenit.ok( vector1.x === 4 && vector1.y === 2, 'basic' );
    truenit.ok( vector2.x === 2 && vector2.y === 3, 'basic' );
    truenit.ok( vector3.x === 5.2 && vector3.y === 8.6, 'basic' );
    truenit.ok( vector4.x === 2 && vector4.y === 3, 'basic' );
    truenit.ok( Vector.ZERO.x === 0 && Vector.ZERO.y === 0, 'basic' );

    //----------------------------------------------------------------------------------------
    // Distance (as points)
    //----------------------------------------------------------------------------------------
    const distance1And3 = ( 1.2 ** 2 + 6.6 ** 2 ) ** 0.5;
    truenit.approximate( vector1.distanceTo( vector3 ), distance1And3 );
    truenit.approximate( vector3.distanceTo( vector1 ), distance1And3 );
    truenit.approximate( vector2.distanceTo( vector1 ), 5 ** 0.5 );
    truenit.approximate( vector2.distanceTo( Vector.ZERO ), 13 ** 0.5 );
    truenit.ok( Vector.ZERO.distanceTo( Vector.ZERO ) === 0 );
    truenit.approximate( vector2.distanceTo( vector2 ), 0 );

    //----------------------------------------------------------------------------------------
    // Equality tests
    //----------------------------------------------------------------------------------------
    const closeVector = new Vector( vector1.x + 0.0000001, vector1.y + 0.0000001 );

    truenit.ok( vector2.equals( vector4 ) );
    truenit.ok( vector4.equals( vector2.copy() ) );
    truenit.notOk( vector3.equals( vector2 ) );
    truenit.notOk( vector1.equals( closeVector) );
    truenit.ok( vector1.equalsEpsilon( closeVector) );
    truenit.notOk( vector1.equals( closeVector) );

    //----------------------------------------------------------------------------------------
    // IsFinite
    //----------------------------------------------------------------------------------------
    const nonFiniteVector1 = new Vector( 1.7976931348623157E+10308, 1.7976931348623157E+10308 );
    const nonFiniteVector2 = new Vector( Infinity, Infinity );

    truenit.ok( vector1.isFinite() && vector2.isFinite() && vector3.isFinite() && Vector.ZERO.isFinite() );
    truenit.notOk( nonFiniteVector1.isFinite() );
    truenit.notOk( nonFiniteVector1.isFinite() );

    //----------------------------------------------------------------------------------------
    // Test that the above tests didn't mutate anything
    //----------------------------------------------------------------------------------------
    truenit.ok( vector1.x === 4 && vector1.y === 2 );
    truenit.ok( vector2.x === 2 && vector2.y === 3 );
    truenit.ok( vector3.x === 5.2 && vector3.y === 8.6 );
    truenit.ok( vector4.x === 2 && vector4.y === 3 );
    truenit.ok( Vector.ZERO.x === 0 && Vector.ZERO.y === 0 );

    //----------------------------------------------------------------------------------------
    // Mutators
    //----------------------------------------------------------------------------------------
    
    // Copy the vectors
    const vector1Copy = vector1.copy( false );
    const vector2Copy = vector2.copy( false );
    const vector3Copy = vector3.copy( false );
    const vector4Copy = vector4.copy( false );

    vector1Copy.set( vector2 );
    truenit.ok( vector1Copy.equals( vector2 ) );

    vector1Copy.setX( 0 );
    vector1Copy.setY( 0 );
    truenit.ok( vector1Copy.equals( Vector.ZERO ) );

    vector3Copy.set( vector1Copy );
    vector4Copy.setX( vector1Copy.x ).setY( vector1Copy.y );
    truenit.ok( vector3Copy.equals( vector4Copy ) );

    truenit.ok( vector1.x === 4 && vector1.y === 2 );
    truenit.ok( vector2.x === 2 && vector2.y === 3 );
    truenit.ok( vector3.x === 5.2 && vector3.y === 8.6 );
    truenit.ok( vector4.x === 2 && vector4.y === 3 );
    truenit.ok( Vector.ZERO.x === 0 && Vector.ZERO.y === 0 );

  };

  return VectorTester;
} );