// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Unit test file for `SIM_CORE/scenery/Node`.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Display = require( 'SIM_CORE/core-internal/Display' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const truenit = require( 'truenit' );

  return () => {

    // Initialize the browser setup.
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




          // display.addChild( config.screens[ 0 ] );

  };
} );