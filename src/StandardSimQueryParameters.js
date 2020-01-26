// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Retrieves a standard set of Query Parameters that all simulations will use.
 * Sim-specific query parameters are still allowed via SIM_CORE/util/QueryParameters.
 *
 * Immediately enables assertions if the query parameter ?ea was included.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const QueryParameters = require( 'SIM_CORE/util/QueryParameters' );

  const StandardSimQueryParameters = QueryParameters.retrieve( {

    /**
     * Enables assertions, which are disable unless this parameter is provided.
     * See './util/assert.js' for more details.
     * For internal testing only.
     */
    ea: {
      type: 'flag'
    },

    /**
     * Disables the fps in the top left is provided.
     * See './core-internal/FPSCounter' for more details.
     * For internal testing only.
     */
    fps: {
      type: 'flag'
    },

    /**
     * Logs the current version of the simulation if provided.
     * For internal testing only.
     */
    version: {
      type: 'flag'
    },

    /**
     * Provides a border of the ScreenView instances.
     * For internal testing only.
     */
    dev: {
      type: 'flag'
    }
  } );

  // Enable assertion if the query parameter was provided.
  if ( StandardSimQueryParameters.ea ) assert.enableAssertions();

  return StandardSimQueryParameters;
} );