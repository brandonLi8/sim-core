// Copyright © 2019-2020 Brandon Li. All rights reserved.

// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A sim-specific Circle node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants

  class Circle extends Node {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      // Defaults for options.
      const defaults = {

        type: 'circle',
        radius: 0
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      super( options );

      this._radius = options.radius;
      this.radius = this._radius;

    }

    get radius() { return this._radius; }
    set radius( radius ) {
      this._radius = radius;

      const center = this.center.copy();
      this.width = this._radius * 2;

      this.height = this._radius * 2;

      this.center = center;
      this.layout( this._screenViewScale  );
    }

    layout( scale ) {

      super.layout( scale );
      const globalBounds = this._computeGlobalBounds();

      globalBounds && this.addAttributes( {
        r: `${ scale * this._radius }px`,
        cx: `${ this._radius * scale }`,
        cy: `${ this._radius * scale }`,
      } );
    }
  }

  return Circle;
} );