// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific Display, for rendering the scene graph. Generate a 'root' Node that connects to the HTML
 * Body element and scales with the window size to maintain a sim-screen ratio.
 *
 * A standard way of making a Simulation is:
 *  1. Create a new Sim. See `../Sim.js`
 *  2. Create a new Screen. See `../Screen.js`
 *  3. Create a new ScreenView and reference it. See `./ScreenView.js`
 *  4. Make changes to the scene graph by adding new Nodes to the ScreenView.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const DOMObject = require( 'SIM_CORE/scenery/DOMObject' );

  class Display extends DOMObject {







  }

  return Display;
} );