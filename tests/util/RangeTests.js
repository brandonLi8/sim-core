// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/util/Range`. Run `npm run coverage` to see test coverage results.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Range = require( 'SIM_CORE/util/Range' );
  const truenit = require( 'truenit' );

  return () => {

    // Define basic Ranges - should stay static.
    const A = new Range( 1, 2 );
    const B = new Range( 0, 10 );
    const C = new Range( 1.5, 2.7 );
    const D = new Range( 0, Number.POSITIVE_INFINITY );

    // properties
    truenit.ok( A.min === 1 && A.getMin() === 1, 'min' );
    truenit.ok( A.max === 2 && A.getMax() === 2, 'max' );

    // equals
    truenit.ok( !A.equals( B ) && !B.equals( A ), 'equals' );
    truenit.ok( A.equals( A ), 'equals' );
    truenit.ok( Range.ZERO.equals( Range.ZERO.copy() ), 'equals' );
    truenit.ok( Range.EVERYTHING.equals( Range.EVERYTHING ), 'equals' );
    truenit.ok( !D.equals( false ), 'equals' );

    // equalsEpsilon
    truenit.ok( !A.equalsEpsilon( C ) && !C.equalsEpsilon( A ), 'equalsEpsilon' );
    truenit.ok( A.equalsEpsilon( A ), 'equalsEpsilon' );
    truenit.ok( Range.ZERO.equalsEpsilon( Range.ZERO.copy() ), 'equalsEpsilon' );
    truenit.ok( !Range.ZERO.equalsEpsilon( Range.EVERYTHING ), 'equalsEpsilon' );
    truenit.ok( new Range( 1.500001, 2.699999 ).equalsEpsilon( C ), 'equalsEpsilon' );
    truenit.ok( !D.equalsEpsilon( false ), 'equalsEpsilon' );

    // length
    truenit.ok( A.length === 1 && A.getLength() === 1, 'length' );
    truenit.ok( B.length === 10 && B.getLength() === 10, 'length' );
    truenit.approximate( C.length, 1.2, 'length' );

    // center
    truenit.ok( A.center === 1.5 && A.getCenter() === 1.5, 'center' );
    truenit.ok( B.center === 5 && B.getCenter() === 5, 'center' );
    truenit.ok( C.center === 2.1 && C.getCenter() === 2.1, 'center' );

    // contains
    truenit.notOk( A.contains( 0 ), 'contains' );
    truenit.notOk( A.contains( -1 ), 'contains' );
    truenit.ok( A.contains( 2 ), 'contains' );
    truenit.ok( A.contains( 1.5 ), 'contains' );

    // isEmpty
    truenit.ok( Range.ZERO.isEmpty(), 'isEmpty' );
    truenit.notOk( Range.EVERYTHING.isEmpty(), 'isEmpty' );
    truenit.notOk( D.isEmpty(), 'isEmpty' );

    // closestTo
    truenit.ok( A.closestTo( 0 ) === 1, 'closestTo' );
    truenit.ok( A.closestTo( -1 ) === 1, 'closestTo' );
    truenit.ok( A.closestTo( 1.5 ) === 1.5, 'closestTo' );
    truenit.ok( A.closestTo( 10 ) === 2, 'closestTo' );

    // intersects
    truenit.ok( A.intersects( new Range( 0, 1.5 ) ), 'intersects' );
    truenit.ok( A.intersects( A ), 'intersects' );
    truenit.notOk( A.intersects( new Range( 3, 5 ) ), 'intersects' );

    // containsRange
    truenit.ok( A.containsRange( new Range( 1, 1.5 ) ), 'containsRange' );
    truenit.ok( A.containsRange( A ), 'containsRange' );
    truenit.notOk( A.containsRange( new Range( 0, 1.8 ) ), 'containsRange' );

    // union
    truenit.ok( A.union( new Range( 0, 1.5 ) ).equals( new Range( 0, 2 ) ), 'union' );
    truenit.ok( A.union( A ).equals( A ), 'union' );
    truenit.ok( A.union( new Range( 1, 1.5 ) ).equals( A ), 'union' );

    //----------------------------------------------------------------------------------------
    // Mutators
    //----------------------------------------------------------------------------------------

    // basic
    truenit.ok( A.copy().setMin( 5 ).min === 5, 'setMin' );
    truenit.ok( A.copy().setMax( 5 ).max === 5, 'setMax' );
    truenit.ok( A.copy().setMinMax( 5, 5 ).max === 5, 'setMinMax' );
    truenit.ok( A.copy().setMinMax( 5, 5 ).min === 5, 'setMinMax' );

    // dilate/erode
    truenit.ok( A.copy().dilate( 1.5 ).equals( new Range( -0.5, 3.5 ) ), 'dilate' );
    truenit.ok( A.copy().erode( 0.5 ).equals( new Range( 1.5, 1.5 ) ), 'erode' );

    // expand
    truenit.ok( A.copy().expand( 0, 0 ).equals( A.copy() ), 'expand' );
    truenit.ok( A.copy().expand( 1, -2 ).equals( Range.ZERO ), 'expand' );
    truenit.ok( A.copy().expand( -1, 2 ).equals( new Range( 2, 4 ) ), 'expand' );

    // shift
    truenit.ok( A.copy().shift( 0 ).equals( A.copy() ), 'shift' );
    truenit.ok( A.copy().shift( 5 ).equals( new Range( 6, 7 ) ), 'shift' );
  };
} );