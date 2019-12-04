// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/ModelViewTransform`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const ModelViewTransform = require( 'SIM_CORE/util/ModelViewTransform' );
  const truenit = require( 'truenit' );
  const Vector = require( 'SIM_CORE/util/Vector' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );

  const ModelViewTransformTester = () => {

    const mvt1 = new ModelViewTransform( new Bounds( -20, -20, 30, 30 ), new Bounds( 0, 0, 200, 150 ) );

    //----------------------------------------------------------------------------------------
    // Model => View
    //----------------------------------------------------------------------------------------
    truenit.ok( mvt1.modelToViewPoint( new Vector( -20, -20 ) ).equals( new Vector( 0, 150 ) ) );
    truenit.ok( mvt1.modelToViewPoint( Vector.ZERO ).equals( new Vector( 80, 90 ) ) );
    truenit.ok( mvt1.modelToViewBounds( new Bounds( -10, -10, 20, 20 ) ).equals( new Bounds( 40, 30, 160, 120 ) ) );

    //----------------------------------------------------------------------------------------
    // View => Model
    //----------------------------------------------------------------------------------------
    truenit.ok( mvt1.viewToModelPoint( new Vector( 0, 150 ) ).equals( new Vector( -20, -20 ) ) );
    truenit.ok( mvt1.viewToModelPoint( new Vector( 80, 90 ) ).equals( Vector.ZERO ) );
    truenit.ok( mvt1.viewToModelBounds( new Bounds( 40, 30, 160, 120 ) ).equals( new Bounds( -10, -10, 20, 20 ) ) );

  };

  return ModelViewTransformTester;
} );