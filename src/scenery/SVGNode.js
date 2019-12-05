// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific node for SVG (scalable vector graphics).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );

  //----------------------------------------------------------------------------------------
  // constants
  const XML_NAMESPACE = 'http://www.w3.org/2000/svg';

  class SVGNode extends Node {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );


      // Defaults for options.
      const defaults = {

        // passed to the super class
        type: 'svg',
        namespace: XML_NAMESPACE,

        // custom to this class
        invertYAxis: true,
        fill: null,
        stroke: null,
        strokeWidth: null,
        setViewBox: true
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      this.addAttributes( {
        fill: options.fill,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth
      } );
    }


    /**
     * Called when the Node layout needs to be updated, typically when the browser window is resized.
     * @private (scenery-internal)
     *
     * @param {number} scale
     */
    layout( scale ) {

      this.addAttributes( {
        height: `${ scale * this._height }px`,
        width: `${ scale * this._width }px`
      } );
      this.style.top = `${ scale * this._top }px`;
      this.style.left = `${ scale * this._left }px`;

      if ( this.center ) {
        this.style.top = `${ scale * ( this._center.y - this.height / 2 ) }px`;
        this.style.left = `${ scale * ( this._center.x - this.width / 2 ) }px`;
      }
    }
  }

  return SVGNode;
} );