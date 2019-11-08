// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific Display, for rendering the scene graph.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );

  class Display extends DOMObject {
  }

  return Display;
} );