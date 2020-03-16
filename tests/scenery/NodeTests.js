// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/scenery/Node`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const truenit = require( 'truenit' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  return () => {

    // Initialize a sample simulation setup.
    const screen = new DOMObject( {
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      zIndex: 999999
    } );
    const screenView = new ScreenView();
    screenView.layout( window.innerWidth, window.innerHeight );
    screen.addChild( screenView );

    //----------------------------------------------------------------------------------------
    // Bounds Tests
    //----------------------------------------------------------------------------------------

    // Test 1: Root Node
    const A = new Node( { left: 15, top: 10 } );
    screenView.addChild( A );

    // truenit.ok( A.localBounds.equals( Bounds.ZERO ) );
    // truenit.ok( A.bounds.equals( new Bounds( 15, 10, 15, 10 ) ) );
    // truenit.ok( A.globalBounds.equals( new Bounds( 15, 10, 15, 10 ) ) );

    // Test 2: Child of Root Node
    const B = new Node( { left: 5, top: 4, width: 3, height: 4 } );
    A.addChild( B );

    truenit.ok( B.localBounds.equals( new Bounds( 0, 0, 3, 4 ) ) );
    truenit.ok( B.parentBounds.equals( new Bounds( 5, 4, 8, 8 ) ) );
    truenit.ok( B.globalBounds.equals( new Bounds( 20, 14, 23, 18 ) ) );
    truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 8, 8 ) ) );
    truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 23, 18 ) ) );

    // Test 3: Child of Child of Root Node
    const C = new Node( { left: 6, top: 6, width: 3, height: 3 } );
    B.addChild( C );

    truenit.ok( C.localBounds.equals( new Bounds( 0, 0, 3, 3 ) ) );
    truenit.ok( C.globalBounds.equals( new Bounds( 26, 20, 29, 23 ) ) );
    truenit.ok( C.parentBounds.equals( new Bounds( 6, 6, 9, 9 ) ) );
    truenit.ok( B.localBounds.equals( new Bounds( 0, 0, 9, 9 ) ) );
    truenit.ok( B.parentBounds.equals( new Bounds( 5, 4, 14, 13 ) ) );
    truenit.ok( B.globalBounds.equals( new Bounds( 20, 14, 29, 23 ) ) );
    truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 14, 13 ) ) );
    truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 29, 23 ) ) );

    // Test 4: Remove Child
    const D = new Node( { left: 5, top: 5 } );
    A.addChild( D );
    A.removeChild( B );

    truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 5, 5 ) ) );
    truenit.ok( A.bounds.equals( new Bounds( 15, 10, 20, 15 ) ) );
    truenit.ok( A.globalBounds.equals( new Bounds( 15, 10, 20, 15 ) ) );
    A.addChild( B ).removeChild( D ); // Reset and check that states are correct.
    truenit.ok( C.localBounds.equals( new Bounds( 0, 0, 3, 3 ) ) );
    truenit.ok( C.globalBounds.equals( new Bounds( 26, 20, 29, 23 ) ) );
    truenit.ok( C.parentBounds.equals( new Bounds( 6, 6, 9, 9 ) ) );
    truenit.ok( B.localBounds.equals( new Bounds( 0, 0, 9, 9 ) ) );
    truenit.ok( B.parentBounds.equals( new Bounds( 5, 4, 14, 13 ) ) );
    truenit.ok( B.globalBounds.equals( new Bounds( 20, 14, 29, 23 ) ) );
    truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 14, 13 ) ) );
    truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 29, 23 ) ) );

    // Test 4: Remove Child (3 layers from screenView)
    B.removeChild( C );

    truenit.ok( B.localBounds.equals( Bounds.ZERO ) ); // shouldn't save width/height
    truenit.ok( B.parentBounds.equals( new Bounds( 5, 4, 5, 4 ) ) );
    truenit.ok( B.globalBounds.equals( new Bounds( 20, 14, 20, 14 ) ) );
    truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 5, 4 ) ) );
    truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 20, 14 ) ) );
    truenit.ok( C.localBounds.equals( new Bounds( 0, 0, 3, 3 ) ) );
    truenit.ok( C.parentBounds.equals( new Bounds( 6, 6, 9, 9 ) ) );

    // Test 5: Negative Bounds
    A.removeAllChildren(); // reset scene graph
    B.removeAllChildren();
    truenit.ok( A.bounds.equals( new Bounds( 15, 10, 15, 10 ) ) );
    B.topLeft = new Vector( -10, -5 );
    B.width = 5;
    B.height = 4;
    A.addChild( B );

    truenit.ok( B.bounds.equals( new Bounds( 0, 0, 5, 4 ) ) );
    truenit.ok( B.localBounds.equals( new Bounds( 0, 0, 5, 4 ) ) );
    truenit.ok( B.globalBounds.equals( new Bounds( 5, 5, 10, 9 ) ) );
    truenit.ok( A.bounds.equals( new Bounds( 5, 5, 15, 10 ) ) );
    truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 10, 5 ) ) );
    truenit.ok( A.globalBounds.equals( new Bounds( 5, 5, 15, 10 ) ) );

    C.topLeft = new Vector( -1, -5 );
    C.width = 10;
    C.height = 1;
    B.addChild( C );

    truenit.ok( B.bounds.equals( new Bounds( 0, 0, 10, 9 ) ) );
    truenit.ok( B.localBounds.equals( new Bounds( 0, 0, 10, 9 ) ) );
    truenit.ok( B.globalBounds.equals( new Bounds( 4, 0, 14, 9 ) ) );
    truenit.ok( C.bounds.equals( new Bounds( 0, 0, 10, 1 ) ) );
    truenit.ok( C.localBounds.equals( new Bounds( 0, 0, 10, 1 ) ) );
    truenit.ok( C.globalBounds.equals( new Bounds( 4, 0, 14, 1 ) ) );
    truenit.ok( A.bounds.equals( new Bounds( 4, 0, 15, 10 ) ) );
    truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 11, 10 ) ) );
    truenit.ok( A.globalBounds.equals( new Bounds( 4, 0, 15, 10 ) ) );

    //----------------------------------------------------------------------------------------
    // Location Tests
    //----------------------------------------------------------------------------------------
    const E = new Node( { left: 5, top: 4, width: 3, height: 4 } );

    // Test 6: Location getters
    truenit.ok( E.translation.equals( new Vector( 5, 4 ) ) );
    truenit.ok( E.topLeft.equals( new Vector( 5, 4 ) ) );
    truenit.ok( E.topCenter.equals( new Vector( 6.5, 4 ) ) );
    truenit.ok( E.topRight.equals( new Vector( 8, 4 ) ) );
    truenit.ok( E.centerLeft.equals( new Vector( 5, 6 ) ) );
    truenit.ok( E.center.equals( new Vector( 6.5, 6 ) ) );
    truenit.ok( E.centerRight.equals( new Vector( 8, 6 ) ) );
    truenit.equals( E.centerX, 6.5 );
    truenit.equals( E.centerY, 6 );
    truenit.ok( E.bottomLeft.equals( new Vector( 5, 8 ) ) );
    truenit.ok( E.bottomCenter.equals( new Vector( 6.5, 8 ) ) );
    truenit.ok( E.bottomRight.equals( new Vector( 8, 8 ) ) );
    truenit.equals( E.left, 5 );
    truenit.equals( E.right, 8 );
    truenit.equals( E.top, 4 );
    truenit.equals( E.bottom, 8 );

    // Test 7: Location setters
    [ 'topLeft', 'topCenter', 'topRight',
      'centerLeft', 'center', 'centerRight',
      'bottomLeft', 'bottomCenter', 'bottomRight' ].forEach( location => {

        E[ location ] = new Vector( 5, 5 );
        truenit.ok( E.width === 3 && E.height === 4 );
        truenit.ok( E[ location ].equals( new Vector( 5, 5 ) ) );
      } );
    [ 'left', 'right', 'top', 'bottom', 'centerX', 'centerY' ].forEach( location => {
      E[ location ] = 5;
      truenit.ok( E.width === 3 && E.height === 4 );
      truenit.ok( E[ location ] === 5 );
    } );

    E.translation = new Vector( 5, 5 );
    truenit.ok( E.bounds.equals( new Bounds( 5, 5, 8, 9 ) ) );
    E.width = 5;
    truenit.ok( E.bounds.equals( new Bounds( 5, 5, 10, 9 ) ) );
    E.height = 5;
    truenit.ok( E.bounds.equals( new Bounds( 5, 5, 10, 10 ) ) );

    //----------------------------------------------------------------------------------------
    // Node Features
    //----------------------------------------------------------------------------------------

    // Test 8: Scale
    const F = new Node( { left: 5, top: 4, width: 4, height: 8, scale: 2 } ); // should scale last

    truenit.ok( F.parentBounds.equals( new Bounds( 5, 4, 13, 20 ) ) );
    F.scale( 2 );
    truenit.ok( F.parentBounds.equals( new Bounds( 1, -4, 17, 28 ) ) );
    F.scalar = 2;
    truenit.ok( F.parentBounds.equals( new Bounds( 5, 4, 13, 20 ) ) );
  };
} );