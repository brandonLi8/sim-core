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
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

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

        width: shape.bounds.width,
        height: shape.bounds.height,

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      super( options );

      // @private
      this._shape = shape ? Util.deepFreeze( shape ) : shape;

      this._strokeWidth = options.strokeWidth;
      this.addAttributes( {
        fill: options.fill ? options.fill : 'none',
        stroke: options.stroke,
        'stroke-width': options.strokeWidth
      } );
    }


    setShape( shape ) {
      this._shape = shape ? Util.deepFreeze( shape ) : shape;
      if ( this._shape ) this._bounds = this._shape.bounds.copy().shift( -this._shape.bounds.topLeft );
      this.layout();
    }

    layout( scale ) {
      this._shape && this.addAttributes( {
        d: this._shape.getSVGPath( this._shape.bounds.bottomLeft.negate(), scale )
      } );

      if ( this._strokeWidth ) {
        this.addAttributes( {
          'stroke-width': Math.max( this._strokeWidth * scale, 1 )
        } );
      }
      super.layout( scale );
    }
  }
   Path.BOUNDS_MUTATORS = [ 'stroke-width', ...Node.BOUNDS_MUTATORS ];


  return Path;
} );