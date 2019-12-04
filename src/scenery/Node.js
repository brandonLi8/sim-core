// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A sim-specific node for the scene graph, built on top of DOMObject.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );

  class Node extends DOMObject {

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

        // Custom to this class

        // {number|null} - null means self computed height in the constructor, otherwise specifies a height.
        width: null,
        height: null,
        top: null,
        left: null
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      // @protected {number} - the width and height in scenery units.
      this._width = options.width;
      this._height = options.width;
      this._top = options.top;
      this._left = options.left;
    }


    /**
     * Accessors and ES5 getters of a private property of this DOM object.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    getWidth() { return this._width || this.style.width; }
    get width() { return this.getWidth(); }
    getHeight() { return this._height|| this.style.height; }
    get height() { return this.getHeight(); }
    getTop() { return this._top|| this.style.top; }
    get top() { return this.getTop(); }
    getLeft() { return this._left|| this.style.left; }
    get left() { return this.getLeft(); }


    /**
     * Called when the Node layout needs to be updated, typically when the browser window is resized.
     * @private (scenery-internal)
     *
     * @param {number} width - in pixels of the window
     * @param {number} height - in pixels of the window
     */
    layout( width, height ) {

      this.style.width = `${ window.globalToLocalScale * this._width }px`;
      this.style.height = `${ window.globalToLocalScale * this._height }px`;
      this.style.top = `${ window.globalToLocalScale * this._top }px`;
      this.style.left = `${ window.globalToLocalScale * this._left }px`;

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
  }

  return Node;
} );