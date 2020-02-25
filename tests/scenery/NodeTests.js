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
    display.addChild( screen.addChild( screenView ) );

    //----------------------------------------------------------------------------------------

    // Test 1: Root Node
    const A = new Node( { top: 10, left: 15 } );
    screenView.addChild( A );

    truenit.ok( A.localBounds.equals( Bounds.ZERO ) );
    truenit.ok( A.parentBounds.equals( new Bounds( 15, 10, 15, 10 ) ) );
    truenit.ok( A.globalBounds.equals( new Bounds( 15, 10, 15, 10 ) ) );


  };
} );