// Copyright © 2019-2020 Brandon Li. All rights reserved.
// NOTE: THIS DOESNT WORK ATM!!!

/**
 * A sim-specific Line node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const SVGNode = require( 'SIM_CORE/scenery/SVGNode' );

  class LineNode extends SVGNode {

    /**
     * @param {Vector} start
     * @param {Vector} end
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( start, end, options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );


      // Defaults for options.
      const defaults = {
        type: 'line'
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      this._start = start;
      this._end = end;
    }

    get start() { return this._start; }

    set start( start ) {
      this._start = start;
      this.layout( this.scale );
    }

    get end() { return this._end; }

    set end( end ) {
      this._end = end;
      this.layout( this.scale );
    }

    layout( scale ) {
      super.layout( scale );
      this.addAttributes( {
        x1: `${ scale * this.start.x }px`,
        y1: `${ scale * this.start.y }px`,
        x2: `${ scale * this.end.x }px`,
        y2: `${ scale * this.end.y }px`
      } );
    }
  }

  return LineNode;
} );