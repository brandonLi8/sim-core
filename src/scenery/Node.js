// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Before reading the documentation of this file, it is recommended to read `./DOMObject.js` for context.
 *
 * A Node is a sim-specific DOMObject for the scene graph, built on top of DOMObject for SVG groups. In general,
 * sim-specific code should use scenery Nodes for rendering simulation components and structuring the simulation
 * scene graph. Node will provide a much cleaner sim-specific API using SVG compared to DOMObject.
 *
 * Nodes have a large API of properties and options that affect its appearance as well as its subtree.
 * These include translation, scale, rotation, opacity, etc (or any combination). See the early portion of the constructor
 * for details. Nodes also support Events. See ./events for more documentation.
 *
 * ## Bounds Terminology
 * - Global coordinate frame: View coordinate frame of the Display (specifically its local coordinate frame).
 * - Local coordinate frame: The local coordinate frame of the Node, where (0, 0) would be at the Node's origin.
 * - Parent coordinate frame: The coordinate frame of the parent of the Node. In other words, the local coordinate frame
 *                            of the parent Node.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Node extends DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior of the Node.
     *                             Contains an extended API and some super-class options are constricted. Subclasses may
     *                             have different options for their API. See the code where the options are set in the
     *                             early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );

      // Some options are set by Node. Assert that they weren't provided.
      assert( !options || !options.style, 'Node sets style.' );
      assert( !options || !options.innerHTML && !options.text, 'Node should not have text or innerHTML' );
      assert( !options || !options.type || DOMObject.SVG_TYPES.includes( options.type ), 'Must be SVG sub-type.' );

      options = {

        // Super-class options
        type: 'g',
        style: {
          position: 'absolute'
        },

        // Options specific to Node
        cursor: null,      // {string} - If provided, alias of the CSS cursor of the Node. See setCursor() for doc.
        visible: true,     // {boolean} - Indicates if the Node is visible. See setVisible() for more doc.
        opacity: 1,        // {number} - Alias of the CSS opacity of the Node. See setOpacity() for more doc.
        maxWidth: null,    // {number} - If provided, constrains width of this Node. See setMaxWidth() for more doc.
        maxHeight: null,   // {number} - If provided, constrains height of this Node. See setMaxHeight() for more doc.

        // transformations
        translation: null, // {Vector} - If provided, (x, y) translation of the Node. See setTranslation() for more doc.
        rotation: 0,       // {number} - rotation (in radians) of the Node. See setRotation() for more doc.
        scale: 1,          // {Vector|number} - scale of the Node. See scale() for more doc.

        // {Bounds} - bounds in the local coordinate frame. See setLocalBounds() for more doc.
        localBounds: Bounds2.ZERO.copy(),

        // Sets the location of the Node, if provided.
        leftTop: null,      // {Vector} - The upper-left corner of this Node's bounds. See setLeftTop() for more doc.
        centerTop: null,    // {Vector} - The top-center of this Node's bounds. See setCenterTop() for more doc.
        rightTop: null,     // {Vector} - The upper-right corner of this Node's bounds. See setRightTop() for more doc.
        leftCenter: null,   // {Vector} - The left-center of this Node's bounds. See setLeftCenter() for more doc.
        center: null,       // {Vector} - The center of this Node's bounds. See setCenter() for more doc.
        rightCenter: null,  // {Vector} - The center-right of this Node's bounds. See setRightCenter() for more doc.
        leftBottom: null,   // {Vector} - The bottom-left of this Node's bounds. See setLeftBottom() for more doc.
        centerBottom: null, // {Vector} - The middle center of this Node's bounds. See setCenterBottom() for more doc.
        rightBottom: null,  // {Vector} - The bottom right of this Node's bounds. See setRightBottom() for more doc.
        left: null,         // {number} - The left side of this Node's bounds. See setLeft() for more doc.
        right: null,        // {number} - The right side of this Node's bounds. See setRight() for more doc.
        top: null,          // {number} - The top side of this Node's bounds. See setTop() for more doc.
        bottom: null,       // {number} - The bottom side of this Node's bounds. See setBottom() for more doc.
        centerX: null,      // {number} - The x-center of this Node's bounds. See setCenterX() for more doc.
        centerY: null,      // {number} - The y-center of this Node's bounds. See setCenterY() for more doc.

        // Rewrite options so that the passed-in options overrides the defaults.
        ...options
      };

      super( options );

      // @protected {number} - the width and height in scenery units.
      this._width = options.width;
      this._height = options.height;
      this._top = options.top;
      this._left = options.left;
      this._center = options.center;

      this.scale = null;

      this._visible = options.visible;
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
    getWidth() { return this._width; }
    get width() { return this.getWidth(); }
    getHeight() { return this._height; }
    get height() { return this.getHeight(); }
    getTop() { return this._top; }
    get top() { return this.getTop(); }
    getLeft() { return this._left; }
    get left() { return this.getLeft(); }
    getCenter() { return this._center; }
    get center() { return this.getCenter(); }

    set center( center ) {
      this._center = center;
      this.layout( this.scale );
    }
    set width( width ) {
      this._width = width;
      this.layout( this.scale );
    }
    set height( height ) {
      this._height = height;
      this.layout( this.scale );
    }
    set top( top ) {
      this._top = top;
      this.layout( this.scale );
    }
    set left( left ) {
      this._left = left;
      this.layout( this.scale );
    }

    get visible() { return this._visible; }
    set visible( visible ) {
      this._visible = visible;
      this.style.opacity = visible ? 1 : 0;
    }

    set mouseover( listener ) {
      this._element.addEventListener( 'mouseover', event => {
        event.stopPropagation();
        event.preventDefault();
        // stop propagation to children
        listener();
      } );
    }
    set mouseout( listener ) {

      // change back to original src on the mouse out
      this._element.addEventListener( 'mouseout', ( event ) => {
        event.stopPropagation();
        event.preventDefault();
        listener();
      } );
    }
    set mousedown( listener ) {
      const onDown = event => {
        event.stopPropagation();
        event.preventDefault();
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
        event.preventDefault();
        listener();
      } );
    }

    getEventLocation( event ) {
      return new Vector(
        event.clientX !== undefined ? event.clientX : event.touches[ 0 ].clientX,
        event.clientY !== undefined ? event.clientY : event.touches[ 0 ].clientY
      );
    }

    /**
     * Sets up the Node to be draggable. Usually the Node has to have the position
     * "absolute" or position "fixed".
     *
     * Dragging events will propagate down its tree respectively.
     * @public
     */
    drag( options ) {

      options = {
        // {Function|null} - Called as start( event: {Event}, listener: {DragListener} ) when the drag is started.
        // This is preferred over passing press(), as the drag start hasn't been fully processed at that point.
        start: null,

        // {Function|null} - Called as end( listener: {DragListener} ) when the drag is ended. This is preferred over
        // passing release(), as the drag start hasn't been fully processed at that point.
        // NOTE: This will also be called if the drag is ended due to being interrupted or canceled.
        end: null,

        listener: null,

        ...options
      };
      let cursorViewPosition;

      // start drag event listener
      const onDown = ( event ) => {
        event = event || window.event;
        event.preventDefault();
        // mouse cursor
        const globalNodeBounds = this.element.getBoundingClientRect();
        const globalTopLeft = new Vector( globalNodeBounds.x, globalNodeBounds.y );
        cursorViewPosition = this.getEventLocation( event ).subtract( globalTopLeft ).divide( this.scale );

        options.start && options.start();

        document.addEventListener( window.isMobile ? 'touchend' : 'mouseup', closeDrag );
        document.addEventListener( window.isMobile ? 'touchmove' : 'mousemove', drag );
      };
      this._element.addEventListener( window.isMobile ? 'touchstart' : 'mousedown', onDown );

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
            options.listener && options.listener( displacement );

            scheduled = null;
          }, 10 );
        }
        scheduled = event;
      };

      function closeDrag() {
        // on the release
        document.removeEventListener( window.isMobile ? 'touchend' : 'mouseup', closeDrag );
        document.removeEventListener( window.isMobile ? 'touchmove' : 'mousemove', drag );

        options.end && options.end();
      }
    }

    /**
     * Called when the Node layout needs to be updated, typically when the browser window is resized.
     * @private (scenery-internal)
     *
     * @param {number} scale - scale in terms of global units per local unit
     */
    layout( scale ) {

      this.style.width = `${ scale * ( this._width || 0 ) }px`;
      this.style.height = `${ scale * ( this._height || 0 ) }px`;
      this.style.top = `${ scale * ( this._top || 0 ) }px`;
      this.style.left = `${ scale * ( this._left || 0 ) }px`;

      if ( this.center ) {
        this.style.top = `${ scale * ( this._center.y - ( this.height ? this.height / 2 : 0 ) ) }px`;
        this.style.left = `${ scale * ( this._center.x - ( this.width ? this.width / 2 : 0 ) ) }px`;
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