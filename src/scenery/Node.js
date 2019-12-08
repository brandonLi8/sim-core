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
        center: null,
        style: {
          position: 'absolute'
        },


        mouseover: null,
        mouseout: null,
        mousedown: null,
        mouseup: null

      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.style = { ...defaults.style, ...options.style };

      super( options );

      // @protected {number} - the width and height in scenery units.
      this._width = options.width;
      this._height = options.height;
      this._top = options.top;
      this._left = options.left;
      this._center = options.center;

      this.scale = null;


      if ( options.mouseover ) this.mouseover = options.mouseover;
      if ( options.mouseout ) this.mouseout = options.mouseout;
      if ( options.mousedown ) this.mousedown = options.mousedown;
      if ( options.mouseup ) this.mouseup = options.mouseup;

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

    set mouseover( listener ) {
      this._element.addEventListener( 'mouseover', event => {
        event.stopPropagation();
        // stop propagation to children
        listener();
      } );
    }
    set mouseout( listener ) {

      // change back to original src on the mouse out
      this._element.addEventListener( 'mouseout', ( event ) => {
        event.stopPropagation();
        listener();
      } );
    }
    set mousedown( listener ) {
      const onDown = event => {
        event.stopPropagation();

        const globalNodeBounds = this.element.getBoundingClientRect();
        const globalPosition = this.getEventLocation( event );
        const globalTopLeft = new Vector( globalNodeBounds.x, globalNodeBounds.y );

        const convertedPosition = globalPosition.copy().subtract( globalTopLeft );

        const localPosition = convertedPosition.copy().divide( this.scale );
        const globalLocalPosition = globalPosition.copy().divide( this.scale );

        listener( localPosition, globalLocalPosition );
      };
      this._element.addEventListener( window.isMobile ? 'touchstart' : 'mousedown', onDown );
    }
    set mouseup( listener ) {
      this._element.addEventListener( window.isMobile ? 'touchend' : 'mouseup', event => {
        event.stopPropagation();
        listener();
      } );
    }

    getEventLocation( event ) {
      return new Vector(
        event.clientX !== undefined ? event.clientX : event.touches[ 0 ].clientX,
        event.clientY !== undefined ? event.clientY : event.touches[ 0 ].clientY,
      );
    }

    /**
     * Sets up the node to be draggable. Usually the node has to have the position
     * "absolute" or position "fixed".
     *
     * Dragging events will propagate down its tree respectively.
     * @public
     */
    drag( startdrag, listener, closedrag ) {

      let cursorViewPosition;

      // start drag event listener
      const onDown = ( event ) => {
        event = event || window.event;
        event.preventDefault();
        // mouse cursor
        const globalNodeBounds = this.element.getBoundingClientRect();
        const globalTopLeft = new Vector( globalNodeBounds.x, globalNodeBounds.y );
        cursorViewPosition = this.getEventLocation( event ).subtract( globalTopLeft ).divide( this.scale );

        startdrag();

        document.addEventListener( window.isMobile ? 'touchend' : 'mouseup', closeDrag );
        document.addEventListener( window.isMobile ? 'touchmove' : 'mousemove', drag );
      };
      this._element.addEventListener( window.isMobile ? 'touchstart' : 'mousedown', onDown  );

      let scheduled = null;
      const drag = event => {

        event = event || window.event;
        event.preventDefault();
        if ( !scheduled ) {
          setTimeout( () => {
            const globalNodeBounds = this.element.getBoundingClientRect();
            const globalTopLeft = new Vector( globalNodeBounds.x, globalNodeBounds.y );
            const currentViewPosition = this.getEventLocation( event ).subtract( globalTopLeft ).divide( this.scale );

            const displacement = currentViewPosition.subtract( cursorViewPosition );
            listener( displacement );

            scheduled = null;
          }, 5 );
        }
        scheduled = event;
      }

      function closeDrag() {
        // on the release
        document.removeEventListener( window.isMobile ? 'touchend' : 'mouseup', closeDrag );
        document.removeEventListener( window.isMobile ? 'touchmove' : 'mousemove', drag );

        closedrag();
      }
    }

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