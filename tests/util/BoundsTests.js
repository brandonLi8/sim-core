// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Bounds`. Run `npm run coverage` to see test coverage results.
 *
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

    // Define basic Bounds - should stay static.
    const A = new Bounds( 1, 2, 3, 4 );
    const B = new Bounds( 0, 0, 2, 3 );
    const C = new Bounds( 1, 1, 5, 4 );
    const D = new Bounds( 1.5, 1.2, 5.7, 4.8 );
    const E = new Bounds( 0, 0, 5, Number.POSITIVE_INFINITY );
    const F = new Bounds( 0, 2, Number.POSITIVE_INFINITY, 8 );

    //----------------------------------------------------------------------------------------
    // Basic
    //----------------------------------------------------------------------------------------

    // rect
    truenit.ok( new Bounds( -2, -4, 2, 4 ).equals( Bounds.rect( -2, -4, 4, 8 ) ), 'rect' );

    // properties
    truenit.ok( A.minX === 1 && A.getMinX() === 1, 'minX' );
    truenit.ok( A.minY === 2 && A.getMinY() === 2, 'minY' );
    truenit.ok( A.maxX === 3 && A.getMaxX() === 3, 'maxX' );
    truenit.ok( A.maxY === 4 && A.getMaxY() === 4, 'maxY' );

    // equals
    truenit.ok( !A.equals( B ) && !B.equals( A ), 'equals' );
    truenit.ok( A.equals( A ), 'equals' );
    truenit.ok( Bounds.ZERO.equals( Bounds.ZERO.copy() ), 'equals' );
    truenit.ok( Bounds.EVERYTHING.equals( Bounds.EVERYTHING ), 'equals' );
    truenit.ok( E.equals( E ), 'equals' );
    truenit.ok( !F.equals( E ) && !E.equals( F ), 'equals' );
    truenit.ok( !F.equals( false ), 'equals' );

    // equalsEpsilon
    truenit.ok( !A.equalsEpsilon( C ) && !C.equalsEpsilon( A ), 'equalsEpsilon' );
    truenit.ok( A.equalsEpsilon( A ), 'equalsEpsilon' );
    truenit.ok( Bounds.ZERO.equalsEpsilon( Bounds.ZERO.copy() ), 'equalsEpsilon' );
    truenit.ok( Bounds.EVERYTHING.equalsEpsilon( Bounds.EVERYTHING.copy() ), 'equalsEpsilon' );
    truenit.ok( !Bounds.ZERO.equalsEpsilon( Bounds.EVERYTHING ), 'equalsEpsilon' );
    truenit.ok( E.equalsEpsilon( E ), 'equalsEpsilon' );
    truenit.ok( !F.equalsEpsilon( E ) && !E.equalsEpsilon( F ), 'equalsEpsilon' );
    truenit.ok( new Bounds( 1.500001, 1.199999, 5.7, 4.8 ).equalsEpsilon( D ), 'equalsEpsilon' );
    truenit.ok( !F.equalsEpsilon( new Vector( 5, 5 ) ), 'equalsEpsilon' );

    //----------------------------------------------------------------------------------------
    // Location
    //----------------------------------------------------------------------------------------
    truenit.ok( A.width === 2 && A.getWidth() === 2, 'width' );
    truenit.ok( A.height === 2 && A.getHeight() === 2, 'height' );
    truenit.ok( A.left === 1 && A.getLeft() === 1, 'left' );
    truenit.ok( A.right === 3 && A.getRight() === 3, 'right' );
    truenit.ok( A.top === 4 && A.getTop() === 4, 'top' );
    truenit.ok( A.bottom === 2 && A.getBottom() === 2, 'bottom' );

    // Top Row
    truenit.ok( A.topLeft.equals( new Vector( 1, 4 ) ), 'topLeft' );
    truenit.ok( A.topCenter.equals( new Vector( 2, 4 ) ), 'topCenter' );
    truenit.ok( A.topRight.equals( new Vector( 3, 4 ) ), 'topRight' );

    // Center Row Tests
    truenit.ok( A.centerX === 2, 'centerX' );
    truenit.ok( A.centerY === 3, 'centerY' );
    truenit.ok( A.center.equals( new Vector( 2, 3 ) ), 'center' );
    truenit.ok( A.centerLeft.equals( new Vector( 1, 3 ) ), 'centerLeft' );
    truenit.ok( A.centerRight.equals( new Vector( 3, 3 ) ), 'centerRight' );

    // Bottom Row
    truenit.ok( A.bottomLeft.equals( new Vector( 1, 2 ) ), 'bottomLeft' );
    truenit.ok( A.bottomCenter.equals( new Vector( 2, 2 ) ), 'bottomCenter' );
    truenit.ok( A.bottomRight.equals( new Vector( 3, 2 ) ), 'bottomRight' );

    //----------------------------------------------------------------------------------------
    // Conversion
    //----------------------------------------------------------------------------------------

    // closestPointTo
    truenit.notOk( A.containsCoordinates( 0, 0 ), 'containsCoordinates' );
    truenit.notOk( A.containsCoordinates( 2, 0 ), 'containsCoordinates' );
    truenit.ok( A.containsCoordinates( 2, 2 ), 'containsCoordinates' );

    // containsCoordinates
    truenit.ok( A.containsPoint( new Vector( 2, 3 ) ), 'containsCoordinates' );
    truenit.notOk( A.containsPoint( new Vector( 4, 2 ) ), 'containsCoordinates' );

    // closestsPointTo
    truenit.ok( A.closestPointTo( new Vector( 0, 1 ) ).equals( new Vector( 1, 2 ) ), 'closestPointTo' );
    truenit.ok( A.closestPointTo( new Vector( 5, 4 ) ).equals( new Vector( 3, 4 ) ), 'closestPointTo' );
    truenit.ok( A.closestPointTo( new Vector( 2, 2 ) ).equals( new Vector( 2, 2 ) ), 'closestPointTo' );
    truenit.ok( A.closestPointTo( new Vector( 2, 3 ) ).equals( new Vector( 2, 3 ) ), 'closestPointTo' );

    // area
    truenit.ok( A.area === 4, 'area' );
    truenit.ok( B.area === 6, 'area' );

    // intersectsBounds
    truenit.ok( A.intersectsBounds( new Bounds( 2, 3, 4, 5 ) ), 'intersectBounds' );
    truenit.ok( A.intersectsBounds( new Bounds( 3, 4, 5, 6 ) ), 'intersectBounds' );
    truenit.notOk( A.intersectsBounds( new Bounds( 4, 5, 6, 7 ) ), 'intersectBounds' );

    // containsBounds
    truenit.notOk( Bounds.ZERO.containsBounds( A ), 'containsBounds' );
    truenit.ok( Bounds.EVERYTHING.containsBounds( A ), 'containsBounds' );

    // isFinite
    truenit.ok( Bounds.ZERO.isFinite(), 'isFinite' );
    truenit.notOk( Bounds.EVERYTHING.isFinite(), 'isFinite' );
    truenit.notOk( F.isFinite(), 'isFinite' );
    truenit.ok( C.isFinite(), 'isFinite' );

    // isEmpty
    truenit.ok( Bounds.ZERO.isEmpty(), 'isEmpty' );
    truenit.notOk( Bounds.EVERYTHING.isEmpty(), 'isEmpty' );
    truenit.notOk( F.isEmpty(), 'isEmpty' );

    // union/intersection
    truenit.ok( A.union( B ).equals( new Bounds( 0, 0, 3, 4 ) ), 'union' );
    truenit.ok( A.intersection( B ).equals( new Bounds( 1, 2, 2, 3 ) ), 'intersection' );

    //----------------------------------------------------------------------------------------
    // Mutators
    //----------------------------------------------------------------------------------------

    // basic
    truenit.ok( A.copy().setMinX( 5 ).minX === 5, 'setMinX' );
    truenit.ok( A.copy().setMinY( 5 ).minY === 5, 'setMinY' );
    truenit.ok( A.copy().setMaxX( 5 ).maxX === 5, 'setMaxX' );
    truenit.ok( A.copy().setMaxY( 5 ).maxY === 5, 'setMaxY' );
    truenit.ok( A.copy().setAll( 0, 0, 0, 0 ).maxY === 0, 'setAll' );
    truenit.ok( A.copy().setAll( 0, 0, 0, 0 ).minX === 0, 'setAll' );

    // roundSymmetric
    truenit.ok( D.copy().roundSymmetric().equals( new Bounds( 2, 1, 6, 5 ) ), 'roundSymmetric' );
    truenit.ok( E.copy().roundSymmetric().equals( E ), 'roundSymmetric' );

    // dilate/erode
    truenit.ok( A.copy().dilate( 1.5 ).equals( new Bounds( -0.5, 0.5, 4.5, 5.5 ) ), 'dilate' );
    truenit.ok( A.copy().erode( 0.5 ).equals( new Bounds( 1.5, 2.5, 2.5, 3.5 ) ), 'erode' );

    // expand
    truenit.ok( A.copy().expand( 0, 0, 0, 0 ).equals( A.copy() ), 'expand' );
    truenit.ok( A.copy().expand( 1, 2, -3, -4 ).equals( Bounds.ZERO ), 'expand' );
    truenit.ok( A.copy().expand( 1, 2, 3, 4 ).equals( new Bounds( 0, 0, 6, 8 ) ), 'expand' );

    // shift
    truenit.ok( A.copy().shift( 0, 0 ).equals( A.copy() ), 'shift' );
    truenit.ok( A.copy().shift( 5, 9 ).equals( new Bounds( 6, 11, 8, 13 ) ), 'shift' );
    truenit.ok( A.copy().shift( -1, -2 ).equals( new Bounds( 0, 0, 2, 2 ) ), 'shift' );

    // includePoint
    truenit.ok( A.copy().includePoint( new Vector( 1, 2 ) ).equals( A ), 'includePoint' );
    truenit.ok( A.copy().includePoint( new Vector( 2, 3 ) ).equals( A ), 'includePoint' );
    truenit.ok( Bounds.ZERO.copy().includePoint( new Vector( 2, 3 ) ).equals( B ), 'includePoint' );

    // includeCoordinate
    truenit.ok( A.copy().includeCoordinate( 6, 6 ).equals( new Bounds( 1, 2, 6, 6 ) ), 'includeCoordinate' );
    truenit.ok( A.copy().includeCoordinate( 0, 0 ).equals( new Bounds( 0, 0, 3, 4 ) ), 'includeCoordinate' );
    truenit.ok( Bounds.ZERO.copy().includeCoordinate( 2, 3 ).equals( B ), 'includeCoordinate' );

  };
} );