// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Bounds`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const truenit = require( 'truenit' );
  const Vector = require( 'SIM_CORE/util/Vector' );


  const BoundsTester = () => {

    //----------------------------------------------------------------------------------------
    // Static Bounds Creators
    //----------------------------------------------------------------------------------------
    const A = () => { return new Bounds( 1, 2, 3, 4 ); };
    const B = () => { return new Bounds( 0, 0, 2, 3 ); };
    const C = () => { return new Bounds( 1, 1, 5, 4 ); };
    const D = () => { return new Bounds( 1.5, 1.2, 5.7, 4.8 ); };

    //----------------------------------------------------------------------------------------
    // Basic Property Tests
    //----------------------------------------------------------------------------------------
    truenit.ok( new Bounds( -2, -4, 2, 4 ).equals( Bounds.rect( -2, -4, 4, 8 ) ), 'rect' );
    truenit.ok( A().minX === 1, 'minX' );
    truenit.ok( A().minY === 2, 'minY' );
    truenit.ok( A().maxX === 3, 'maxX' );
    truenit.ok( A().maxY === 4, 'maxY' );

    //----------------------------------------------------------------------------------------
    // Location Tests
    //----------------------------------------------------------------------------------------
    truenit.ok( A().width === 2, 'width' );
    truenit.ok( A().height === 2, 'height' );
    truenit.ok( A().left === 1, 'left' );
    truenit.ok( A().right === 3, 'right' );
    truenit.ok( A().top === 4, 'top' );
    truenit.ok( A().bottom === 2, 'botton' );

    // Top Row
    truenit.ok( A().leftTop.equals( new Vector( 1, 4 ) ), 'leftTop' );
    truenit.ok( A().centerTop.equals( new Vector( 2, 4 ) ), 'centerTop' );
    truenit.ok( A().rightTop.equals( new Vector( 3, 4 ) ), 'rightTop' );

    // Center Row Tests
    truenit.ok( A().centerX === 2, 'centerX' );
    truenit.ok( A().centerY === 3, 'centerY' );
    truenit.ok( A().center.equals( new Vector( 2, 3 ) ), 'center' );
    truenit.ok( A().leftCenter.equals( new Vector( 1, 3 ) ), 'leftCenter' );
    truenit.ok( A().rightCenter.equals( new Vector( 3, 3 ) ), 'rightCenter' );

    // Bottom Row
    truenit.ok( A().leftBottom.equals( new Vector( 1, 2 ) ), 'leftBottom' );
    truenit.ok( A().centerBottom.equals( new Vector( 2, 2 ) ), 'centerBottom' );
    truenit.ok( A().rightBottom.equals( new Vector( 3, 2 ) ), 'rightBottom' );


    //----------------------------------------------------------------------------------------
    // Conversion Tests
    //----------------------------------------------------------------------------------------

    // containsCoordinates
    truenit.notOk( A().containsCoordinates( 0, 0 ), 'containsCoordinates' );
    truenit.notOk( A().containsCoordinates( 2, 0 ), 'containsCoordinates' );
    truenit.notOk( A().containsCoordinates( 4, 2 ), 'containsCoordinates' );
    truenit.ok( A().containsCoordinates( 2, 2 ), 'containsCoordinates' );

    // equals
    truenit.ok( A().equals( A() ), 'equals' );
    truenit.notOk( A().equals( Bounds.ZERO ), 'equals' );
    truenit.notOk( A().equals( B() ), 'equals' );
    truenit.ok( new Bounds( 0, 1, 2, 3 ).equals( new Bounds( 0, 1, 2, 3 ) ), 'equals' );
    truenit.ok( new Bounds( 0, 1, 2, 3 ).equalsEpsilon( new Bounds( 0, 1, 2, 3 ) ), 'equalsEpsilon' );
    truenit.notOk( new Bounds( 0, 1, 2, 3 ).equalsEpsilon( new Bounds( 0, 1, 2, 5 ) ), 'equalsEpsilon' );
    truenit.ok( new Bounds( 1.5, 1.2, 5.7, 4.8 ).equalsEpsilon( D() ), 'equalsEpsilon' );

    // intersectsBounds
    truenit.ok( A().intersectsBounds( new Bounds( 2, 3, 4, 5 ) ), 'intersectBounds' );
    truenit.ok( A().intersectsBounds( new Bounds( 3, 4, 5, 6 ) ), 'intersectBounds' );
    truenit.notOk( A().intersectsBounds( new Bounds( 4, 5, 6, 7 ) ), 'intersectBounds' );
  };

  return BoundsTester;
} );