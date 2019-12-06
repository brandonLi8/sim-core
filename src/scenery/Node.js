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
  const Vector = require( 'SIM_CORE/util/Vector' );

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
        left: null,
        onClick: null,
        center: null
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };

      super( options );

      // @protected {number} - the width and height in scenery units.
      this._width = options.width;
      this._height = options.height;
      this._top = options.top;
      this._left = options.left;
      this._center = options.center;

      this.scale = null;

      if ( options.onClick ) {
        this.element.addEventListener( 'mousedown', event => {
          event.stopPropagation();

          const globalNodeBounds = this.element.getBoundingClientRect();
          const globalPosition = new Vector( event.clientX, event.clientY );
          const globalTopLeft = new Vector( globalNodeBounds.x, globalNodeBounds.y );

          const convertedPosition = globalPosition.copy().subtract( globalTopLeft );

          const localPosition = convertedPosition.copy().divide( this.scale );
          const globalLocalPosition = globalPosition.copy().divide( this.scale );

          options.onClick( localPosition, globalPosition );
        } );
      }
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
    getCenter() { return this._center || this.style.center; }
    get center() { return this.getCenter(); }


    /**
     * Called when the Node layout needs to be updated, typically when the browser window is resized.
     * @private (scenery-internal)
     *
     * @param {number} scale - scale in terms of global units per local unit
     */
    layout( scale ) {

      this.style.width = `${ scale * this._width }px`;
      this.style.height = `${ scale * this._height }px`;
      this.style.top = `${ scale * this._top }px`;
      this.style.left = `${ scale * this._left }px`;

      if ( this.center ) {
        this.style.top = `${ scale * ( this._center.y - this.height / 2 ) }px`;
        this.style.left = `${ scale * ( this._center.x - this.width / 2 ) }px`;
      }

      this.scale = scale;
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