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
 * Generally, to use a ScreenView for a simulation Screen, you should create a sub-class of the ScreenView. A sub-class
 * is needed since you need to pass the class (not an instance) to the Screen. The ScreenView sub-class will be
 * instantiated in Screen (during the loading process) and the top-level model for the Screen will be passed in. See
 * Screen.js for more documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

  class ScreenView extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of this class.
     *                             Some options are specific to this class while others are passed to the super class.
     *                             See the early portion of the constructor for details.
     */
    constructor( options ) {

      // Some options are set by ScreenView. Assert that they weren't provided.
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.style, 'ScreenView sets style.' );
      assert( !options || !options.type, 'ScreenView sets type.' );
      assert( !options || !options.text, 'ScreenView should not have text' );
      assert( !options || !options.id || !options.class || !options.attributes, 'ScreenView sets attributes' );

      options = {

        // {Bounds} - the Bounds of the scenery coordinate system, which are safe to draw in for all window sizes.
        //            The default layoutBounds is based off the size of iPad4 running Safari. It is implemented
        //            to have a reasonable amount of horizontal space but still look reasonably large on mobile.
        layoutBounds: new Bounds( 0, 0, 1024, 618 ),


        ...options
      };

      // Set the HTML element type. The root-renderer for all sims is SVG. See
      // https://developer.mozilla.org/en-US/docs/Web/SVG for the official specification.
      options.type = 'svg';

      super( options );

      // Push this instance of ScreenView to the instances field.
      ScreenView._instances.push( this );

      // @public (read-only) {Bounds} - reference to the layout Bounds of the ScreenView
      this.layoutBounds = Object.freeze( options.layoutBounds );

      // @public (read-only) {number} - layoutScale in terms of global units per local unit for converting Scenery
      //                                coordinates to pixels. Referenced as soon as the scale is known in `layout()`
      this.layoutScale;
    }

    /**
     * @override
     * Calls the layout method on children when they are added.
     * @public
     *
     * @param {Node} child
     * @returns {ScreenView} - Returns 'this' reference, for chaining
     */
    addChild( child ) {
      super.addChild( child );
      child.layout( this.layoutScale );
      return this;
    }

    /**
     * Layouts each child Node of the ScreenView, passing in the layout scale, in terms of window pixels per ScreenView
     * coordinate, for determining exact pixel coordinates.
     * @public
     *
     * Called at the start of the simulation and when the browser window is resized.
     *
     * @param {number} width - Screen width, in pixels.
     * @param {number} height - Screen height, in pixels.
     */
    layout( width, height ) {

      // Compute the layout scale, defined as the max scalar such that the entire ScreenView fits inside the window
      // without ratio changes. Use Math.min to adhere to the most limiting factor (between width and height).
      this.layoutScale = Math.min( width / this.layoutBounds.width, height / this.layoutBounds.height );

      // Change the size of the ScreenView to snuggly fit inside the Screen. Pixel coordinates are determined using
      // the layout scale.
      this.style.height = `${ this.layoutScale * this.layoutBounds.width }px`;
      this.style.width = `${ this.layoutScale * this.layoutBounds.height }px`;

      // Call the layout method on each child Node of the ScreenView to position the entire scene-graph.
      this.children.forEach( child => { child.layout( this.layoutScale ); } );
    }

    /**
     * Adds a red-border around the ScreenView. Called if ?dev was provided as a Query Parameter. Used for internal
     * testing to ensure that all simulation content resides inside of the red bounds. See Sim.js for more information.
     * @public
     */
    static enableDevBorder() {
      ScreenView._instances.forEach( screenView => { screenView.border = '2px solid red'; } );
    }
  }

  // @public (read-only) {ScreenView[]} - array of all instances of this class
  ScreenView._instances = [];

  return ScreenView;
} );