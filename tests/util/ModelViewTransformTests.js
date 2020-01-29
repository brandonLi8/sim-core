// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/ModelViewTransform`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const ModelViewTransform = require( 'SIM_CORE/util/ModelViewTransform' );
  const truenit = require( 'truenit' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  const ModelViewTransformTester = () => {

    // Define a basic ModelViewTransform - should stay static.
    const A = new ModelViewTransform( new Bounds( -20, -20, 30, 30 ), new Bounds( 0, 0, 200, 150 ) );

    /**
     * A visual representation of the model-view frame, in a conventional mathematical coordinate system for the model
     * and a flipped coordinate system for the view.
     *                       ∧
     *       view:(0, 0) •┄┄┄│┄┄┄┄┄┄┄┄• model:(30, 30)
     *                   ┊   │        ┊
     *                   ┊   │ model:(0,0)
     *                  <────┼─────────>
     *                   ┊   │        ┊
     *  model:(-20, -20) •┄┄┄│┄┄┄┄┄┄┄┄• view:(200, 150)
     *                       ∨
     *
     *  |------------|----------|-----------|
     *  |            | Model    | View      |
     *  |------------|----------|-----------|
     *  | Width      |  50      | 200       |
     *  |------------|----------|-----------|
     *  | Height     |  50      | 150       |
     *  |------------|----------|-----------|
     *  | Coordinate | (0, 0)   | (80, 90)  |
     *  |------------|----------|-----------|
     *  | Coordinate | (10, 10) | (120, 60) |
     *  |------------|----------|-----------|
     */
    //----------------------------------------------------------------------------------------
    // Model to View
    //----------------------------------------------------------------------------------------

    // modelToViewX
    truenit.equals( A.modelToViewX( 0 ), 80 );
    truenit.equals( A.modelToViewX( 10 ), 120 );
    truenit.equals( A.modelToViewX( -20 ), 0 );

    // modelToViewY
    truenit.equals( A.modelToViewY( 0 ), 90 );
    truenit.equals( A.modelToViewY( 10 ), 60 );
    truenit.equals( A.modelToViewY( -20 ), 150 );

    // modelToViewXY
    truenit.ok( A.modelToViewXY( 0, 0 ).equals( new Vector( 80, 90 ) ) );
    truenit.ok( A.modelToViewXY( 10, 10 ).equals( new Vector( 120, 60 ) ) );
    truenit.ok( A.modelToViewXY( -20, -20 ).equals( new Vector( 0, 150 ) ) );

    // modelToViewDeltaX
    truenit.equals( A.modelToViewDeltaX( 0 ), 0 );
    truenit.equals( A.modelToViewDeltaX( 50 ), 200 ); // width
    truenit.equals( A.modelToViewDeltaX( 10 ), 40 );

    // modelToViewDeltaY
    truenit.equals( A.modelToViewDeltaY( 0 ), 0 );
    truenit.equals( A.modelToViewDeltaY( 50 ), -150 ); // negative since y-axis is flipped for the view
    truenit.equals( A.modelToViewDeltaY( 10 ), -30 ); // negative since y-axis is flipped for the view

    // modelToViewDelta
    truenit.ok( A.modelToViewDelta( Vector.ZERO ).equals( Vector.ZERO ) );
    truenit.ok( A.modelToViewDelta( new Vector( 50, 50 ) ).equals( new Vector( 200, -150 ) ) ); // width-height
    truenit.ok( A.modelToViewDelta( new Vector( 10, 10 ) ).equals( new Vector( 40, -30 ) ) );

    // modelToViewPoint
    truenit.ok( A.modelToViewPoint( new Vector( -20, -20 ) ).equals( new Vector( 0, 150 ) ) );
    truenit.ok( A.modelToViewPoint( Vector.ZERO ).equals( new Vector( 80, 90 ) ) );
    truenit.ok( A.modelToViewPoint( new Vector( 10, 10 ) ).equals( new Vector( 120, 60 ) ) );

    // modelToViewBounds
    truenit.ok( A.modelToViewBounds( new Bounds( -10, -10, 20, 20 ) ).equals( new Bounds( 40, 30, 160, 120 ) ) );
    truenit.ok( A.modelToViewBounds( new Bounds( -20, -20, 30, 30 ) ).equals( new Bounds( 0, 0, 200, 150 ) ) );
    truenit.ok( A.modelToViewBounds( new Bounds( 0, 0, 10, 10 ) ).equals( new Bounds( 80, 60, 120, 90 ) ) );

  };

  return ModelViewTransformTester;
} );