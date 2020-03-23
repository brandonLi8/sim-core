// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * ScreenView is the top-level view portion for the each individual Screen of the simulation. Run the simulation with
 * the `?dev` query parameter to see the outline of each ScreenView.
 *
 * ## Coordinates
 * It is important to note that ScreenView coordinates are not in pixels. The browser width and height (which are in
 * pixels) change from device to device and the window size may shrink or grow.
 *
 * Instead, ScreenView has its own coordinate system (termed 'scenery coordinates') that doesn't depend on the window
 * size. All Node's use this coordinate system. The layout() then changes the actual CSS pixel coordinates based off a
 * scalar of the window width and height, which is defined as the max scalar such that the entire ScreenView fits
 * inside the window without ratio changes.
 *
 * ## Usage
 * To use a ScreenView for a simulation Screen, you must create a sub-class of the ScreenView. A sub-class is needed
 * since you need to pass the class (not an instance) to the Screen. The ScreenView sub-class will be instantiated
 * in Screen (during the loading process) and the top-level model for the Screen will be passed in. See Screen.js
 * for more documentation. ScreenView is a abstract class with no abstract methods (meaning it must be sub-typed).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

  /*
   * Default width and height for iPad2, iPad3, iPad4 running Safari with default tabs and decorations
   * These bounds were added in Sep 2014 and are based on a screenshot from a non-Retina iPad, in Safari, iOS7.
   * It therefore accounts for the nav bar on the bottom and the space consumed by the browser on the top.
   */
  const DEFAULT_VIEW_BOUNDS = new Bounds( 0, 0, 1024, 618 );

  /**
   * @abstract
   * ScreenView is a abstract class with no abstract methods, meaning it must be sub-typed.
   */
  class ScreenView extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( options ) {

      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        type: 'svg',
        // {Bounds} the bounds that are safe to draw in on all supported platforms
        viewBounds: DEFAULT_VIEW_BOUNDS.copy(),

        ...options
      };

      super( options );

      ScreenView.instances.push( this );
      // @public (read-only)
      this.viewBounds = options.viewBounds;
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
      // assert( child instanceof ( require( 'SIM_CORE/scenery/Node' ) ), `invalid child: ${ child }` );
      super.addChild( child );

      child.layout( this._scale );
      return this;
    }

    /**
     * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
     * @public
     *
     * @param {number} width - in pixels of the window
     * @param {number} height - in pixels of the window
     */
    layout( width, height ) {

      const scale = Math.min( width / this.viewBounds.width, height / this.viewBounds.height );
      const screenViewHeight = scale * this.viewBounds.height;
      const screenViewWidth = scale * this.viewBounds.width;
      this._scale = scale;
      this.style.height = `${ screenViewHeight }px`;
      this.style.width = `${ screenViewWidth }px`;
      const layoutChildren = ( children ) => {
        children.forEach( ( child ) => {
          child.layout( scale );
        } );
      };
      layoutChildren( this.children );
    }

    /**
     * Called if ?dev was provided as a Query Parameter. See Sim.js for more information.
     * @public
     */
    static enableDevBorder() {
      ScreenView.instances.forEach( screenView => {
        screenView.addStyles( {
          border: '2px solid red'
        } );
      } );
    }
  }

  // @public (read-only) {ScreenView[]} - array of all instances of this class
  ScreenView.instances = [];

  return ScreenView;
} );