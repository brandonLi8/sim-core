// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * RequireJS configuration file for the project.
 * Paths are relative to the location of this file.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

require.config( {

  deps: [ 'sim-core-main' ],

  paths: {

    text: 'core-internal/text-plugin',
    SIM_CORE: '.'
  }
} );