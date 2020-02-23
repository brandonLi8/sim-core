// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Shape`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const ModelViewTransform = require( 'SIM_CORE/util/ModelViewTransform' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const truenit = require( 'truenit' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  return () => {

    // Create a MVT for testing.
    const mvt = new ModelViewTransform( new Bounds( -20, -20, 30, 30 ), new Bounds( 0, 0, 200, 150 ) );

    // A visual representation of the model-view frame, in a conventional mathematical coordinate system for the model
    // and a flipped coordinate system for the view. Copied from ModelViewTransformTests.js
    //                       ∧
    //       view:(0, 0) •┄┄┄│┄┄┄┄┄┄┄┄• model:(30, 30)
    //                   ┊   │        ┊
    //                   ┊   │ model:(0,0)
    //                  <────┼─────────>
    //                   ┊   │        ┊
    //  model:(-20, -20) •┄┄┄│┄┄┄┄┄┄┄┄• view:(200, 150)

    // Test 1: Basic movements.
    const A = new Shape()
      .moveTo( 15, 10 )
      .moveToPoint( Vector.ZERO )
      .moveToRelative( 5, 5 )
      .moveToPoint( new Vector( 3, 4 ) )
      .moveToPointRelative( new Vector( 2, 2 ) )
      .moveToRelative( 4, -3 )
      .moveTo( 2, -2 );
    truenit.equals( A.getSVGPath(), 'M 15 10 M 0 0 M 5 5 M 3 4 M 5 6 M 9 3 M 2 -2' );

    truenit.ok( !A.bounds );


    const B = new Shape()
      .moveToPoint( Vector.ZERO )
      .lineToPoint( new Vector( 3, 4 ) )
      .lineTo( 2, 2 )
      .close();
    truenit.equals( B.getSVGPath(), 'M 0 0 L 3 4 L 2 2 Z' );
    truenit.ok( B.bounds.equals( new Bounds( 0, 0, 3, 4 ) ) );


    const C = new Shape()
      .moveToPoint( Vector.ZERO )
      .lineToPoint( new Vector( 3, 4 ) )
      .moveToRelative( 5, 5 )
      .moveToPointRelative( Vector.ZERO )
      .lineToRelative( 3, 3 )
      .lineToPointRelative( new Vector( -2, -10 ) )
      .close();
    truenit.equals( C.getSVGPath(), 'M 0 0 L 3 4 M 8 9 M 8 9 L 11 12 L 9 2 Z' );
    truenit.ok( C.bounds.equals( new Bounds( 0, 0, 11, 12 ) ) );

    const D = new Shape()
      .lineTo( 5, 5 )
      .horizontalLineTo( 10 )
      .verticalLineTo( 10 )
      .horizontalLineToRelative( -20 )
      .verticalLineToRelative( -15 )
      .close();
    truenit.equals( D.getSVGPath(), 'M 0 0 L 5 5 L 10 5 L 10 10 L -10 10 L -10 -5 Z' );
    truenit.ok( D.bounds.equals( new Bounds( -10, -5, 10, 10 ) ) );

    const E = new Shape()
      .moveTo( 5, 5 )
      .arc( 10, 0, Math.PI / 2 )
      .close();
    truenit.equals( E.getSVGPath(), 'M 5 5 M 15 5 A 10 10 0 0 1 5 15 Z' );
    truenit.ok( E.bounds.equals( new Bounds( 5, 5, 15, 15 ) ) );

    const F = new Shape()
      .arc( 10, 0, 5 * Math.PI / 4, true )
    truenit.equals( F.getSVGPath(), 'M 0 0 M 10 0 A 10 10 0 0 0 -7.0710678119 -7.0710678119' );
    truenit.ok( F.bounds.equalsEpsilon( new Bounds( -7.0710678119, -7.0710678119, 10, 0 ) ) );

    const H = new Shape()
      .polygon( [
        new Vector( 5, 5 ),
        new Vector( 2, 9 ),
        new Vector( 9, 12 ),
        new Vector( 1, 1 )
      ] );
    truenit.equals( H.getSVGPath(), 'M 5 5 L 2 9 L 9 12 L 1 1 Z' );
    truenit.ok( H.bounds.equals( new Bounds( 1, 1, 9, 12 ) ) );

  };
} );