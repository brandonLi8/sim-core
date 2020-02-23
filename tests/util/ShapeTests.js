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

    //----------------------------------------------------------------------------------------
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

    //----------------------------------------------------------------------------------------
    // Test 2: Absolute Lines
    const B = new Shape()
      .lineToPoint( new Vector( 3, 4 ) )
      .lineTo( 2, 2 )
      .moveTo( 5, 6 )     // Shouldn't affect bounds
      .moveTo( -10, -9 )  // Shouldn't affect bounds
      .moveTo( -5, -4 )
      .lineToPoint( new Vector( 2, 2 ) )
      .close();
    truenit.equals( B.getSVGPath(), 'M 0 0 L 3 4 L 2 2 M 5 6 M -10 -9 M -5 -4 L 2 2 Z' );
    truenit.ok( B.bounds.equals( new Bounds( -5, -4, 3, 4 ) ) );
    truenit.ok( B.currentPoint.equals( Vector.ZERO ) );

    //----------------------------------------------------------------------------------------
    // Test 3: Relative Lines
    const C = new Shape()
      .moveTo( 2, 3 )
      .lineToPointRelative( new Vector( 3, 4 ) )
      .lineToRelative( -2, -6 )
      .moveTo( 6, 9 )     // Shouldn't affect bounds
      .moveTo( -10, -9 )  // Shouldn't affect bounds
      .moveTo( -5, -4 )
      .lineToPointRelative( new Vector( 2, 2 ) )
      .close();
    truenit.equals( C.getSVGPath(), 'M 2 3 L 5 7 L 3 1 M 6 9 M -10 -9 M -5 -4 L -3 -2 Z' );
    truenit.ok( C.bounds.equals( new Bounds( -5, -4, 5, 7 ) ) );
    truenit.ok( C.currentPoint.equals( new Vector( 2, 3 ) ) );

    //----------------------------------------------------------------------------------------
    // Test 4: Horizontal / Vertical Lines
    const D = new Shape()
      .moveTo( 5, 5 )
      .horizontalLineTo( 10 )
      .verticalLineTo( 10 )
      .moveTo( 5, 5 )
      .horizontalLineToRelative( -20 )
      .verticalLineToRelative( -15 )
      .close();
    truenit.equals( D.getSVGPath(), 'M 5 5 L 10 5 L 10 10 M 5 5 L -15 5 L -15 -10 Z' );
    truenit.ok( D.bounds.equals( new Bounds( -15, -10, 10, 10 ) ) );
    truenit.ok( D.currentPoint.equals( new Vector( 5, 5 ) ) );

    //----------------------------------------------------------------------------------------
    // Test 5: Polygon
    const E = new Shape()
      .moveTo( 2, 2 )
      .polygon( [
        new Vector( 5, 5 ),
        new Vector( 2, 9 ),
        new Vector( 9, 12 ),
        new Vector( 1, 1 )
      ] );
    truenit.equals( E.getSVGPath(), 'M 2 2 M 5 5 L 2 9 L 9 12 L 1 1 Z' );
    truenit.ok( E.bounds.equals( new Bounds( 1, 1, 9, 12 ) ) );
    truenit.ok( E.currentPoint.equals( new Vector( 5, 5 ) ) );

    //----------------------------------------------------------------------------------------
    // Test 6: Copy
    const F = new Shape()
      .moveTo( 3, 3 )
      .lineTo( 2, 2 );
    const copy = F.copy();
    copy.moveTo( 5, 5 ).lineTo( 8, 9 );

    truenit.equals( F.getSVGPath(), 'M 3 3 L 2 2' );
    truenit.ok( F.bounds.equals( new Bounds( 2, 2, 3, 3 ) ) );
    truenit.ok( F.currentPoint.equals( new Vector( 2, 2 ) ) );
    truenit.equals( copy.getSVGPath(), 'M 3 3 L 2 2 M 5 5 L 8 9' );
    truenit.ok( copy.bounds.equals( new Bounds( 2, 2, 8, 9 ) ) );
    truenit.ok( copy.currentPoint.equals( new Vector( 8, 9 ) ) );


    //----------------------------------------------------------------------------------------
    // Test 7: Counter-Clockwise Normal Angles Arc
    const G = new Shape()
      .moveTo( 5, 5 )
      .arc( 10, Math.PI / 4, 5 * Math.PI / 4 ) // Max boundaries
      .close();

    truenit.equals( G.getSVGPath(), 'M 5 5 M 12.0710678119 12.0710678119 A 10 10 0 0 1 -2.0710678119 -2.0710678119 Z' );
    truenit.ok( G.bounds.equalsEpsilon( new Bounds( -5, -2.0710678119, 12.0710678119, 15 ) ) );
    truenit.ok( G.currentPoint.equalsEpsilon( new Vector( 12.0710678119, 12.0710678119 ) ) );



    // const F = new Shape()
    //   .arc( 10, 0, 5 * Math.PI / 4, true )
    // truenit.equals( F.getSVGPath(), 'M 0 0 M 10 0 A 10 10 0 0 0 -7.0710678119 -7.0710678119' );
    // truenit.ok( F.bounds.equalsEpsilon( new Bounds( -7.0710678119, -7.0710678119, 10, 0 ) ) );


    //     // Create a MVT for testing.
    // const mvt = new ModelViewTransform( new Bounds( -20, -20, 30, 30 ), new Bounds( 0, 0, 200, 150 ) );

    // A visual representation of the model-view frame, in a conventional mathematical coordinate system for the model
    // and a flipped coordinate system for the view. Copied from ModelViewTransformTests.js
    //                       ∧
    //       view:(0, 0) •┄┄┄│┄┄┄┄┄┄┄┄• model:(30, 30)
    //                   ┊   │        ┊
    //                   ┊   │ model:(0,0)
    //                  <────┼─────────>
    //                   ┊   │        ┊
    //  model:(-20, -20) •┄┄┄│┄┄┄┄┄┄┄┄• view:(200, 150)
    //                       ∨


  };
} );