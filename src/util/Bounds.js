// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Bounding box utility class, represented as <minX, minY, maxX, maxY>.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Bounds {

    /**
     * @param {number} minX - The initial minimum X coordinate of the bounds.
     * @param {number} minY - The initial minimum Y coordinate of the bounds.
     * @param {number} maxX - The initial maximum X coordinate of the bounds.
     * @param {number} maxY - The initial maximum Y coordinate of the bounds.
     */
    constructor( minX, minY, maxX, maxY ) {
      assert( typeof minX === 'number', `invalid minX: ${ minX }` );
      assert( typeof minY === 'number', `invalid minY: ${ minY }` );
      assert( typeof maxX === 'number', `invalid maxX: ${ maxX }` );
      assert( typeof maxY === 'number', `invalid maxY: ${ maxY }` );

      // @public {number} - See the parameter descriptions
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
    }

  }

  return Bounds;
}

