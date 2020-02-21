// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Shape`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Vector = require( 'SIM_CORE/util/Vector' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const truenit = require( 'truenit' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );

  return () => {

    // test A
    const A = new Shape()
      .moveToPoint( Vector.ZERO )
      .moveToPoint( new Vector( 3, 4 ) )
      .moveTo( 2, 2 )
      .close();
    truenit.equals( A.getSVGPath(), 'M 0 0 M 3 4 M 2 2 Z' );
    truenit.ok( A._bounds.equals( new Bounds( 0, 0, 3, 4 ) ) );


    const B = new Shape()
      .moveToPoint( Vector.ZERO )
      .lineToPoint( new Vector( 3, 4 ) )
      .lineTo( 2, 2 )
      .close();
    truenit.equals( B.getSVGPath(), 'M 0 0 L 3 4 L 2 2 Z' );
    truenit.ok( B._bounds.equals( new Bounds( 0, 0, 3, 4 ) ) );


    const C = new Shape()
      .moveToPoint( Vector.ZERO )
      .lineToPoint( new Vector( 3, 4 ) )
      .moveToRelative( 5, 5 )
      .moveToPointRelative( Vector.ZERO )
      .lineToRelative( 3, 3 )
      .lineToPointRelative( new Vector( -2, -10 ) )
      .close();
    truenit.equals( C.getSVGPath(), 'M 0 0 L 3 4 M 8 9 M 8 9 L 11 12 L 9 2 Z' );
    truenit.ok( C._bounds.equals( new Bounds( 0, 0, 11, 12 ) ) );

  };
} );