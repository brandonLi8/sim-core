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


  };

  return ModelViewTransformTester;
} );