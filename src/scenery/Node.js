// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Before reading the documentation of this file, it is recommended to read `./DOMObject.js` for context.
 *
 * ## General Description of Nodes
 * A Node is a sim-specific DOMObject for the scene graph, built on top of DOMObject for SVG groups. In general,
 * sim-specific code should use scenery Nodes for rendering simulation components and structuring the simulation
 * scene graph. Node will provide a much cleaner sim-specific API using SVG compared to DOMObject.
 *
 * Nodes have a large API of properties and options that affect its appearance as well as its subtree.
 * These include translation, scale, rotation, opacity, etc (or any combination). See the early portion of the
 * constructor for details. Nodes also support Events. See ./events/ for more documentation.
 *
 * ## Coordinates
 * It is important to Node coordinates ARE NOT in pixels. The window width and height in pixels change from device to
 * device and the window size my shrink/grow.
 *
 * Instead, Node uses ScreenView coordinates. ScreenView Coordinates are constant and don't depend on the window width.
 * It is a changing scalar off the actual window size. All Node coordinates are in terms of these coordinates.
 * The `layout()` method then changes the actual pixel coordinates based off the ScreenView scale. See ScreenView.js for
 * more documentation.
 *
 * Some helpful terminology:
 * - Global coordinate frame: View coordinate frame relative to the Display (specifically its local coordinate frame).
 * - Local coordinate frame: The local coordinate frame of the Node and its sub-tree, where (0, 0) would be at the
 *                           Node's origin.
 * - Parent coordinate frame: The coordinate frame of the parent of the Node. In other words, the local coordinate frame
 *                            of the parent Node.
 * - Self Coordinate frame: The coordinate frame of just the node, without its sub-tree, in the "local" coordinate frame
 * - Child Coordinate frame: Coordinate frame of just the sub-children of this node, in the "local" coordinate frame.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Transformation = require( 'SIM_CORE/core-internal/Transformation' );
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
        translation: Vector.ZERO, // {Vector} - (x, y) translation of the Node. See setTranslation() for more doc.
        rotation: 0,              // {number} - rotation (in radians) of the Node. See setRotation() for more doc.
        scale: 1,                 // {Vector|number} - scale of the Node. See scale() for more doc.

        // Overrides the location of the Node, if provided.
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

        width: null,        // {number} - The width of the Node's bounds. See setWidth() for more doc.
        height: null,       // {number} - The height of the Node's bounds. See setHeight() for more doc.

        // Rewrite options so that the passed-in options overrides the defaults.
        ...options
      };

      super( options );

      //----------------------------------------------------------------------------------------

      // @private {*} - see options declaration for documentation. Contains getters and setters.
      this._visible = options.visible;
      this._opacity = options.opacity;
      this._cursour = options.cursor;
      this._maxWidth = options.maxWidth;
      this._maxHeight = options.maxHeight;

      // @protected {number} - screenViewScale in terms of global units per local unit for converting Scenery
      //                       coordinates to pixels. Referenced as soon as the scale is known in `layout()`
      this._screenViewScale = null;

      // @protected {Transformation} - records and references the transformations of the Node.
      this._transformation = new Transformation( options.scale, options.rotation, options.translation );

      // @private {Bounds} - Bounds representations of the Node. See comment at the top of the file for documentation
      //                     of these Bounds.
      this._bounds = Bounds.ZERO.copy(); // Bounds for the Node and its children in the "parent" coordinate frame.
      this._localBounds = Bounds.ZERO.copy(); // Bounds for this node and its children in the "local" coordinate frame.

      // Check that there are no conflicting location setters.
      assert( Node.X_LOCATION_KEYS.filter( key => options[ key ] !== undefined ).length <= 1, 'more than 1 x-mutator' );
      assert( Node.Y_LOCATION_KEYS.filter( key => options[ key ] !== undefined ).length <= 1, 'more than 1 y-mutator' );

      // Call the mutators of this instance for the location options that were provided.
      Node.X_LOCATION_KEYS.concat( Node.Y_LOCATION_KEYS ).forEach( key => {
        if ( options[ key ] ) this[ key ] = key;
      } );
    }

    /**
     * Accessors and ES5 getters of a private property of this Node. Upper locations are in terms of the visual layout,
     * so the minY is the "upper", and maxY is the "lower".
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    getBounds() { return this._bounds; }
    getLocalBounds() { return this._localBounds; }
    getLeftTop() { return this.getBounds().leftBottom; }
    getCenterTop() { return this.getBounds().centerBottom; }
    getRightTop() { return this.getBounds().rightBottom; }
    getLeftCenter() { return this.getBounds().leftCenter; }
    getCenter() { return this.getBounds().center; }
    getRightCenter() { return this.getBounds().rightCenter; }
    getLeftBottom() { return this.getBounds().leftTop; }
    getCenterBottom() { return this.getBounds().centerTop; }
    getRightBottom() { return this.getBounds().rightTop; }
    getLeft() { return this.getBounds().minX; }
    getRight() { return this.getBounds().maxX; }
    getTop() { return this.getBounds().minY; }
    getBottom() { return this.getBounds().maxY; }
    getWidth() { return this.getBounds().width; }
    getHeight() { return this.getBounds().height; }
    getVisible() { return this._visible; }
    getOpacity() { return this._opacity; }
    getCursour() { return this._cursor; }
    getMaxWidth() { return this._maxWidth; }
    getMaxHeight() { return this._maxHeight; }

    get bounds() { return this.getBounds(); }
    get localBounds() { return getLocalBounds(); }
    get leftTop() { return this.getLeftTop(); }
    get centerTop() { return this.getCenterTop(); }
    get rightTop() { return this.getRightTop(); }
    get leftCenter() { return this.leftCenter(); }
    get center() { return this.getCenter(); }
    get rightCenter() { return this.rightCenter(); }
    get leftBottom() { return this.leftBottom(); }
    get centerBottom() { return this.centerBottom(); }
    get rightBottom() { return this.rightBottom(); }
    get left() { return this.getLeft(); }
    get right() { return this.getRight(); }
    get top() { return this.getTop(); }
    get bottom() { return this.getBottom(); }
    get width() { return this.getWidth(); }
    get height() { return this.getHeight(); }
    get visible() { return this.getVisible(); }
    get opacity() { return this.getOpacity(); }
    get cursour() { return this.getCursor(); }
    get maxWidth() { return this.getMaxWidth(); }
    get maxHeight() { return this.getMaxHeight(); }


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
        cursorViewPosition = this.getEventLocation( event ).subtract( globalTopLeft ).divide( this._screenViewScale );

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
            const currentViewPosition = this.getEventLocation( event ).subtract( globalTopLeft ).divide( this._screenViewScale );

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

      this._screenViewScale = scale;
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

  Node.X_LOCATION_KEYS = [ 'translation', 'x', 'left', 'right',
                           'centerX', 'centerTop', 'rightTop',
                           'leftCenter', 'center', 'rightCenter',
                           'leftBottom', 'centerBottom', 'rightBottom' ];

  Node.Y_LOCATION_KEYS = [ 'translation', 'y', 'top', 'bottom',
                           'centerY', 'centerTop', 'rightTop',
                           'leftCenter', 'center', 'rightCenter',
                           'leftBottom', 'centerBottom', 'rightBottom' ];


  return Node;
} );