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
  const INVERT_Y_AXIS_TRANSFORM = 'scale( 1, -1 )';

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
      const defaults =  {

        // passed to the super class
        type: 'svg',
        namespace: XML_NAMESPACE,

        // custom to this class
        invertYAxis: true
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      // Require width and height
      assert( options.width && options.height, `must provide width and height` );


      super( options );

      // @protected
      this.viewBox = `0 0 ${ this.width } ${ this.height }`;

      this.addAttributes( { viewBox: this.viewBox } );

      if ( options.invertYAxis ) {
        this.addStyle( {
          transform: INVERT_Y_AXIS_TRANSFORM
        } );
      }
    }


    /**
     * Called when the Node layout needs to be updated, typically when the browser window is resized.
     * @private (scenery-internal)
     *
     * @param {number} width - in pixels of the window
     * @param {number} height - in pixels of the window
     */
    // layout( width, height ) {

    // }
  }

  return SVGNode;
} );