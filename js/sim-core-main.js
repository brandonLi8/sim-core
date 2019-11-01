// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Module that includes all SIM_CORE dependencies, so that requiring this module will return an object
 * that consists of the entire exported 'sim-core' namespace API.
 *
 * Include this as a dependency in your requirejs config file to use all of sim-core.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( [

  'SIM_CORE/util/Assert',

], simCoreDependency => {
  'use strict';

  return simCoreDependency;
} );