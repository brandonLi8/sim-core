// Copyright © 2019-2020 Brandon Li. All rights reserved.

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

  return () => {

    //----------------------------------------------------------------------------------------
    // Static Bounds Creators
    //----------------------------------------------------------------------------------------
    const A = () => new Bounds( 1, 2, 3, 4 );
    const B = () => new Bounds( 0, 0, 2, 3 );
    const C = () => new Bounds( 1, 1, 5, 4 );
    const D = () => new Bounds( 1.5, 1.2, 5.7, 4.8 );
    const E = () => new Bounds( 0, 0, 5, Number.POSITIVE_INFINITY );
    const F = () => new Bounds( 0, 2, Number.POSITIVE_INFINITY, 8 );

    //----------------------------------------------------------------------------------------
    // Basic
    //----------------------------------------------------------------------------------------

    // rect
    truenit.ok( new Bounds( -2, -4, 2, 4 ).equals( Bounds.rect( -2, -4, 4, 8 ) ), 'rect' );

    // properties
    truenit.ok( A().minX === 1 && A().getMinX() === 1, 'minX' );
    truenit.ok( A().minY === 2 && A().getMinY() === 2, 'minY' );
    truenit.ok( A().maxX === 3 && A().getMaxX() === 3, 'maxX' );
    truenit.ok( A().maxY === 4 && A().getMaxY() === 4, 'maxY' );

    // equals
    truenit.ok( !A().equals( B() ) && !B().equals( A() ), 'equals' );
    truenit.ok( A().equals( A() ), 'equals' );
    truenit.ok( Bounds.ZERO.equals( Bounds.ZERO.copy() ), 'equals' );
    truenit.ok( Bounds.EVERYTHING.equals( Bounds.EVERYTHING ), 'equals' );
    truenit.ok( E().equals( E() ), 'equals' );
    truenit.ok( !F().equals( E() ) && !E().equals( F() ), 'equals' );

    // equalsEpsilon
    truenit.ok( !A().equalsEpsilon( C() ) && !C().equalsEpsilon( A() ), 'equalsEpsilon' );
    truenit.ok( A().equalsEpsilon( A() ), 'equalsEpsilon' );
    truenit.ok( Bounds.ZERO.equalsEpsilon( Bounds.ZERO.copy() ), 'equalsEpsilon' );
    truenit.ok( Bounds.EVERYTHING.equalsEpsilon( Bounds.EVERYTHING.copy() ), 'equalsEpsilon' );
    truenit.ok( !Bounds.ZERO.equalsEpsilon( Bounds.EVERYTHING ), 'equalsEpsilon' );
    truenit.ok( E().equalsEpsilon( E() ), 'equalsEpsilon' );
    truenit.ok( !F().equalsEpsilon( E() ) && !E().equalsEpsilon( F() ), 'equalsEpsilon' );
    truenit.ok( new Bounds( 1.500001, 1.199999, 5.7, 4.8 ).equalsEpsilon( D() ), 'equalsEpsilon' );

    //----------------------------------------------------------------------------------------
    // Location
    //----------------------------------------------------------------------------------------
    truenit.ok( A().width === 2 && A().getWidth() === 2, 'width' );
    truenit.ok( A().height === 2 && A().getHeight() === 2, 'height' );
    truenit.ok( A().left === 1 && A().getLeft() === 1, 'left' );
    truenit.ok( A().right === 3 && A().getRight() === 3, 'right' );
    truenit.ok( A().top === 4 && A().getTop() === 4, 'top' );
    truenit.ok( A().bottom === 2 && A().getBottom() === 2, 'bottom' );

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
    // Conversion
    //----------------------------------------------------------------------------------------

    // containsCoordinates
    truenit.notOk( A().containsCoordinates( 0, 0 ), 'containsCoordinates' );
    truenit.notOk( A().containsCoordinates( 2, 0 ), 'containsCoordinates' );
    truenit.notOk( A().containsPoint( new Vector( 4, 2 ) ), 'containsCoordinates' );
    truenit.ok( A().containsCoordinates( 2, 2 ), 'containsCoordinates' );
    truenit.ok( A().containsPoint( new Vector( 2, 3 ) ), 'containsCoordinates' );

    // area
    truenit.ok( A().area === 4, 'area' );
    truenit.ok( B().area === 6, 'area' );

    // intersectsBounds
    truenit.ok( A().intersectsBounds( new Bounds( 2, 3, 4, 5 ) ), 'intersectBounds' );
    truenit.ok( A().intersectsBounds( new Bounds( 3, 4, 5, 6 ) ), 'intersectBounds' );
    truenit.notOk( A().intersectsBounds( new Bounds( 4, 5, 6, 7 ) ), 'intersectBounds' );

    // containsBounds
    truenit.notOk( Bounds.ZERO.containsBounds( A() ), 'containsBounds' );
    truenit.ok( Bounds.EVERYTHING.containsBounds( A() ), 'containsBounds' );

    // isEmpty
    truenit.ok( Bounds.ZERO.isEmpty(), 'isEmpty' );
    truenit.notOk( Bounds.EVERYTHING.isEmpty(), 'isEmpty' );
    truenit.notOk( F().isEmpty(), 'isEmpty' );

    // union/intersection
    truenit.ok( A().union( B() ).equals( new Bounds( 0, 0, 3, 4 ) ), 'union' );
    truenit.ok( A().intersection( B() ).equals( new Bounds( 1, 2, 2, 3 ) ), 'intersection' );

    //----------------------------------------------------------------------------------------
    // Mutators
    //----------------------------------------------------------------------------------------

    // basic
    truenit.ok( A().setMinX( 5 ).minX === 5, 'setMinX' );
    truenit.ok( A().setMinY( 5 ).minY === 5, 'setMinY' );
    truenit.ok( A().setMaxX( 5 ).maxX === 5, 'setMaxX' );
    truenit.ok( A().setMaxY( 5 ).maxY === 5, 'setMaxY' );

    // dilate/erode
    truenit.ok( A().dilate( 1.5 ).equals( new Bounds( -0.5, 0.5, 4.5, 5,5 ) ), 'dilate' );
    truenit.ok( A().erode( 0.5 ).equals( new Bounds( 1.5, 2.5, 2.5, 3.5 ) ), 'erode' );

    // expand
    truenit.ok( A().expand( 0, 0, 0, 0 ).equals( A() ), 'expand' );
    truenit.ok( A().expand( 1, 2, -3, -4 ).equals( Bounds.ZERO ) , 'expand' );
    truenit.ok( A().expand( 1, 2, 3, 4 ).equals( new Bounds( 0, 0, 6, 8 ) ) , 'expand' );

    // shift
    truenit.ok( A().shift( 0, 0 ).equals( A() ), 'shift' );
    truenit.ok( A().shift( 5, 9 ).equals( new Bounds( 6, 11, 8, 13 ) ), 'shift' );
    truenit.ok( A().shift( -1, -2 ).equals( new Bounds( 0, 0, 2, 3 ) ), 'shift' );
  };
} );