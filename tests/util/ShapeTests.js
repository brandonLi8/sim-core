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


    // Test 2: Absolute Lines
    const B = new Shape()
      .moveTo( 0, 0 )
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


    // Test 7: Counter-Clockwise Normal Angles Arc
    const G = new Shape()
      .moveTo( 5, 5 )
      .arc( 10, Math.PI / 4, 5 * Math.PI / 4 ) // Max boundaries
      .close();

    truenit.equals( G.getSVGPath(), 'M 5 5 M 12.0710678119 12.0710678119 A 10 10 0 0 1 -2.0710678119 -2.0710678119 Z' );
    truenit.ok( G.bounds.equalsEpsilon( new Bounds( -5, -2.0710678119, 12.0710678119, 15 ) ) );
    truenit.ok( G.currentPoint.equalsEpsilon( new Vector( 12.0710678119, 12.0710678119 ) ) );


    // Test 8: Counter-Clockwise non-normal angles Arc
    const H = new Shape()
      .moveTo( 5, 5 )
      .arc( 10, 19 * Math.PI / 4, -16 * Math.PI / 4 ); // equivalent: 3PI/4 to 0

    truenit.equals( H.getSVGPath(), 'M 5 5 M -2.0710678119 12.0710678119 A 10 10 0 1 1 15 5' );
    truenit.ok( H.bounds.equalsEpsilon( new Bounds( -5, -5, 15, 12.0710678119 ) ) );
    truenit.ok( H.currentPoint.equalsEpsilon( new Vector( 15, 5 ) ) );


    // Test 9: Clockwise normal angles Arc
    const I = new Shape()
      .moveTo( 5, 5 )
      .arc( 10, Math.PI / 4, 3 * Math.PI / 2, true ) // clockwise
      .close();
    truenit.equals( I.getSVGPath(), 'M 5 5 M 12.0710678119 12.0710678119 A 10 10 0 0 0 5 -5 Z' );
    truenit.ok( I.bounds.equalsEpsilon( new Bounds( 5, -5, 15, 12.0710678119 ) ) );
    truenit.ok( I.currentPoint.equalsEpsilon( new Vector( 12.0710678119, 12.0710678119 ) ) );


    // Test 10: Clockwise non-normal angles Arc
    const J = new Shape()
      .moveTo( 5, 5 )
      .arc( 10, 19 * Math.PI / 4, 20 * Math.PI / 4, true ); // equivalent: 3PI/4 to PI clockwise

    truenit.equals( J.getSVGPath(), 'M 5 5 M -2.0710678119 12.0710678119 A 10 10 0 1 0 -5 5' );
    truenit.ok( J.bounds.equalsEpsilon( new Bounds( -5, -5, 15, 15 ) ) );
    truenit.ok( J.currentPoint.equalsEpsilon( new Vector( -5, 5 ) ) );

    //----------------------------------------------------------------------------------------
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
    //                       ∨

    // Test 11: basic transformations
    const K = new Shape()
      .moveTo( 10, 10 )
      .moveToRelative( 20, 20 )
      .moveTo( 2, -2 );

    truenit.equals( mvt.modelToViewShape( K ).getSVGPath(), 'M 120 60 M 200 0 M 88 96' );
    truenit.equals( mvt.viewToModelShape( K ).getSVGPath(), 'M -17.5 26.6666666667 M -12.5 20 M -19.5 30.6666666667' );
    truenit.ok( !mvt.modelToViewShape( K ).bounds );
    truenit.ok( !mvt.viewToModelShape( K ).bounds );

    // Test 12: lines transformations
    const L = new Shape()
      .moveTo( 10, 10 )
      .lineToPointRelative( new Vector( 20, 20 ) )
      .lineTo( 2, -2 )
      .close();
    truenit.equals( mvt.modelToViewShape( L ).getSVGPath(), 'M 120 60 L 200 0 L 88 96 Z' );
    truenit.ok( mvt.viewToModelShape( L ).getSVGPath() === 'M -17.5 26.6666666667 L -12.5 20 L -19.5 30.6666666667 Z' );
    truenit.ok( mvt.modelToViewShape( L ).bounds.equals( new Bounds( 88, 0, 200, 96 ) ) );
    truenit.ok( mvt.viewToModelShape( L ).bounds.equalsEpsilon( new Bounds( -19.5, 20, -12.5, 30.6666666667 ) ) );
    truenit.ok( mvt.modelToViewShape( L ).currentPoint.equals( new Vector( 120, 60 ) ) );
    truenit.ok( mvt.viewToModelShape( L ).currentPoint.equalsEpsilon( new Vector( -17.5, 26.6666666667 ) ) );

    // Test 13: lines transformations
    const M = new Shape()
      .moveTo( 0, 0 )
      .arc( 1, Math.PI / 6, Math.PI / 2 )
      .close();

    truenit.equals( mvt.modelToViewShape( M ).getSVGPath(), 'M 80 90 M 83.4641016151 88.5 A 4 3 0 0 1 80 87 Z' );
    truenit.equals( mvt.viewToModelShape( M ).getSVGPath(),
      'M -20 30 M -19.7834936491 29.8333333333 A 0.25 0.3333333333 0 0 1 -20 29.6666666667 Z' );
    truenit.ok( mvt.modelToViewShape( M ).bounds.equalsEpsilon( new Bounds( 80, 87, 83.4641016151, 88.5 ) ) );
    truenit.ok( mvt.viewToModelShape( M ).bounds.equalsEpsilon( new Bounds( -20, 29.66666, -19.783493, 29.833333 ) ) );
    truenit.ok( mvt.modelToViewShape( M ).currentPoint.equalsEpsilon( new Vector( 83.4641016151, 88.5 ) ) );
    truenit.ok( mvt.viewToModelShape( M ).currentPoint.equalsEpsilon( new Vector( -19.783493, 29.833333 ) ) );
  };
} );