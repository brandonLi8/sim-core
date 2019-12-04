// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * The view portion of a Screen, specifies the layout strategy for the visual view.
 *
 * Uses Nodes on a custom scaling width and height system.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Vector = require( 'SIM_CORE/util/Vector' );
  const Node = require( 'SIM_CORE/scenery/Node' );

  /*
   * Default width and height for iPad2, iPad3, iPad4 running Safari with default tabs and decorations
   * These bounds were added in Sep 2014 and are based on a screenshot from a non-Retina iPad, in Safari, iOS7.
   * It therefore accounts for the nav bar on the bottom and the space consumed by the browser on the top.
   */
  const DEFAULT_VIEW_SIZE = new Vector( 1024, 618 );

  class ScreenView extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( options ) {

      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {Vector} the bounds that are safe to draw in on all supported platforms
        viewSize: DEFAULT_VIEW_SIZE.copy(),

        ...options
      };

      super( options );

      // @public (read-only)
      this.viewSize = options.viewSize;

      // @public (read-only)
      this.scale = null;
    }

    /**
     * Ensures that all children are Node types.
     * @override
     * @public
     *
     * @param {Node} child
     * @returns {ScreenView} - Returns 'this' reference, for chaining
     */
    addChild( child ) {
      assert( child instanceof Node, `invalid child: ${ child }` );
      return super.addChild( child );
    }

    /**
     * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
     * @public
     *
     * @param {number} width - in pixels of the window
     * @param {number} height - in pixels of the window
     */
    layout( width, height ) {

      const scale = Math.min( width / this.viewSize.x, height / this.viewSize.y );
      const screenViewHeight = scale * this.viewSize.y;
      const screenViewWidth = scale * this.viewSize.x;

      this.scale = scale;
      window.globalToLocalScale = scale; // in local units per global
      this.style.height = `${ screenViewHeight }px`;
      this.style.width = `${ screenViewWidth }px`;

      const layoutChildren = ( children ) => {
        children.forEach( ( child ) => {
          child.layout( width, height );

          layoutChildren( child.children );
        } );
      }
      layoutChildren( this.children );
    }

    /**
     * Called if ?dev was provided as a Query Parameter. See Sim.js for more information.
     * @public
     */
    enableDevBorder() {
      this.addStyle( {
        border: '2px solid red'
      } );
    }
  }

  return ScreenView;
} );