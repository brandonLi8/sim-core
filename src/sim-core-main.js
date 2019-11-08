// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Entry point for the project.
 *
 * To use this project, first configure your requirejs file:
 *  1. Create a path reference. Ex: `SIM_CORE: '../node_modules/sim-core/js'`
 *  2. Include this file as a dependency. Ex: `deps: [ 'SIM_CORE/sim-core-main' ]``
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( [

  'SIM_CORE/util/assert',
  'SIM_CORE/util/Vector',
  'SIM_CORE/scenery/DOMObject',
  'SIM_CORE/Node',

  'SIM_CORE/Loader'



], simCoreDependency => {
  'use strict';

  return simCoreDependency;
} );