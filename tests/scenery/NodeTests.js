// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/scenery/Node`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const truenit = require( 'truenit' );

  return () => {

    // Initialize a sample simulation setup.
    const display = new Display().initiate();
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

    display.addChild( screen.addChild( screenView ) );

    //----------------------------------------------------------------------------------------

    // Test 1: Root Node
    const A = new Node( { top: 10, left: 15 } );




    // screenView.addChild( A );

    // truenit.ok( A.localBounds.equals( Bounds.ZERO ) );
    // truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 15, 10 ) ) );
    // truenit.ok( A.globalBounds.equals( new Bounds( 15, 10, 15, 10 ) ) );


    // // Test 2: Child of Root Node
    // const B = new Node( { left: 5, top: 4, width: 3, height: 4 } );
    // A.addChild( B );

    // truenit.ok( B.localBounds.equals( new Bounds( 0, 0, 3, 4 ) ) );
    // console.log( B.parentBounds)
    // truenit.ok( B.parentBounds.equals( new Bounds( 5, 4, 8, 8 ) ) );
    // truenit.ok( B.globalBounds.equals( new Bounds( 20, 14, 23, 18 ) ) );
    // truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 8, 8 ) ) );
    // truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 23, 18 ) ) );

    // // Test #: Child of Child of Root Node
    // const C = new Node( { left: 6, top: 6 } );
    // B.addChild( C );

    // truenit.ok( C.localBounds.equals( Bounds.ZERO ) );
    // truenit.ok( C.globalBounds.equals( new Bounds( 26, 20, 26, 20 ) ) );
    // truenit.ok( C.parentBounds.equals( new Bounds( 6, 6, 6, 6 ) ) );
    // truenit.ok( B.localBounds.equals( new Bounds( 0, 0, 6, 6 ) ) );
    // truenit.ok( B.parentBounds.equals( new Bounds( 5, 4, 11, 10 ) ) );
    // truenit.ok( B.globalBounds.equals( new Bounds( 20, 14, 26, 20 ) ) );
    // console.log( A.localBounds.toString() )

    // truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 3, 4 ) ) );
    // truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 23, 18 ) ) );


    // truenit.ok( C.globalBounds.equals( new Bounds( 20, 14, 23, 18 ) ) );
    // truenit.ok( A.localBounds.equals( new Bounds( 0, 0, 8, 8 ) ) );
    // truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 23, 18 ) ) );




  };
} );