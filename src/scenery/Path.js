// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * A Node that draws a Shape.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Shape = require( 'SIM_CORE/util/Shape' );

  class Path extends Node {

    /**
     * @param {Shape|null} shape - The initial Shape to display. See setShape() for more details and documentation.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( shape, options ) {
      assert( !shape || shape instanceof Shape, `invalid shape: ${ shape }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      // Some options are set by Path. Assert that they weren't provided.
      assert( !options || !options.type, 'Path sets type' );

      options = {

        type: 'path',
        fill: null,
        stroke: null,
        strokeWidth: null,

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      super( options );

      // @private
      this._shape = shape;
    }


    setShape( shape ) {
      this._shape = shape;

      // Make the shape immutable
      Util.deepFreeze( this._shape );
      this._draw();
    }

    layout( scale ) {

      super.layout( scale );
      this.addAttributes( {
        x: `${ scale * this.x }px`,
        y: `${ scale * this.y }px`,
        rx: `${ scale * this.cornerRadius }px`,
        ry: `${ scale * this.cornerRadius }px`
      } );
    }
  }

  return Rectangle;
} );