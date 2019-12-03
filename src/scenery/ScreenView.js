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

      this.viewSize = options.viewSize;

      this.addStyle( {
        border: '2px solid red',
        position: 'absolute'
      } );
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
     * @param
     *
     * @param {number} width - in pixels of the window
     * @param {number} height - in pixels of the window
     */
    layout( width, height ) {

      const scale = Math.min( width / SCREEN_SIZE.x, height / SCREEN_SIZE.y );
      const screenViewHeight = scale * this.viewSize.x;
      const screenViewWidth = scale * this.viewSize.y;

      this.style.height = `${ screenViewHeight }px`;
      this.style.width = `${ screenViewWidth }px`;
    }
  }

  return Screen;
} );