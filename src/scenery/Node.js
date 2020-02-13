// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Before reading the documentation of this file, it is recommended to read `./DOMObject.js` for context.
 *
 * ## General Description of Nodes
 * A Node is a sim-specific DOMObject for the scene graph, built specifically for SVG groups. In general,
 * sim-specific code should use scenery Nodes for rendering simulation components and structuring the simulation
 * scene graph. Node will provide a much cleaner sim-specific API compared to DOMObject.
 *
 * Nodes have a large API of properties and options that affect its appearance and location. These include translation,
 * scale, rotation, opacity, etc (or any combination of these). These modifications will propagate down its subtree.
 * See the early portion of the constructor for details. Nodes also support pointer Events. See ./events/ for details.
 *
 * ## Coordinates
 * It is important to Node coordinates ARE NOT in pixels. The browser width and height (which are in pixels) change
 * from device to device and the window size may shrink or grow.
 *
 * Instead, Node uses ScreenView coordinates. ScreenView Coordinates are constant and don't depend on the window width.
 * It is a changing scalar off the actual window size. All Node coordinates are in terms of these coordinates.
 * The layout() method then changes the actual CSS pixel coordinates based off the ScreenView scale. See ScreenView.js
 * for more documentation.
 *
 * It is also important to note that coordinates for all view-related objects have the origin at the top-left of its
 * bounds and the positive-y downwards.
 *
 * ## Terminology:
 * - Window coordinates: Coordinate frame of a node relative to the browser, in pixels.
 * - Global coordinates: Coordinate frame of a node relative to the ScreenView (specifically in its local coordinates).
 * - Parent coordinates: Coordinate frame of a node relative to the parent of each Node's local bounds.
 * - Local coordinates: Coordinate frame of a node relative to itself, where (0, 0) would be at the Node's origin.
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
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      // Some options are set by Node. Assert that they weren't provided.
      assert( !options || !options.style || !options.style.position, 'Node sets position' );
      assert( !options || !options.innerHTML && !options.text, 'Node should not have text or innerHTML' );
      assert( !options || !options.type || DOMObject.SVG_TYPES.includes( options.type ), 'Must be an SVG sub-type.' );

      // Defaults for options.
      const defaults = {

        // Super-class options
        type: 'g',
        style: {
          position: 'absolute' // Ensure that every Node is relative to the ScreenView
        },

        // Options specific to Node
        cursor: null,       // {string} - Alias of the CSS cursor of the Node. See set cursor() for doc.
        visible: true,      // {boolean} - Indicates if the Node is visible. See set visible() for more doc.
        opacity: 1,         // {number} - Alias of the CSS opacity of the Node. See set opacity() for more doc.
        maxWidth: null,     // {number} - If provided, constrains width of this Node. See set maxWidth() for more doc.
        maxHeight: null,    // {number} - If provided, constrains height of this Node. See set maxHeight() for more doc.

        // transformations
        translation: null,  // {Vector} - If provided, (x, y) translation of the Node. See set translation() for more doc.
        rotation: 0,        // {number} - rotation (in radians) of the Node. See set rotation() for more doc.
        scale: 1,           // {Vector|number} - scale of the Node. See scale() for more doc.

        // Overrides the location of the Node, if provided.
        leftTop: null,      // {Vector} - The upper-left corner of this Node's bounds. See setLocation() for more doc.
        centerTop: null,    // {Vector} - The top-center of this Node's bounds. See setLocation() for more doc.
        rightTop: null,     // {Vector} - The upper-right corner of this Node's bounds. See setLocation() for more doc.
        leftCenter: null,   // {Vector} - The left-center of this Node's bounds. See setLocation() for more doc.
        center: null,       // {Vector} - The center of this Node's bounds. See setLocation() for more doc.
        rightCenter: null,  // {Vector} - The center-right of this Node's bounds. See seLocation() for more doc.
        leftBottom: null,   // {Vector} - The bottom-left of this Node's bounds. See setLocation() for more doc.
        centerBottom: null, // {Vector} - The middle center of this Node's bounds. See setLocation() for more doc.
        rightBottom: null,  // {Vector} - The bottom right of this Node's bounds. See setLocation() for more doc.
        left: null,         // {number} - The left side of this Node's bounds. See setLocation() for more doc.
        right: null,        // {number} - The right side of this Node's bounds. See setLocation() for more doc.
        top: null,          // {number} - The top side of this Node's bounds. See setLocation() for more doc.
        bottom: null,       // {number} - The bottom side of this Node's bounds. See setLocation() for more doc.
        centerX: null,      // {number} - The x-center of this Node's bounds. See setLocation() for more doc.
        centerY: null,      // {number} - The y-center of this Node's bounds. See setLocation() for more doc.

        width: null,        // {number} - The width of the Node's bounds.
        height: null        // {number} - The height of the Node's bounds. See setHeight() for more doc.
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.style = { ...defaults.style, ...options.style };

      super( options );

      //----------------------------------------------------------------------------------------

      // @private {*} - see options declaration for documentation. Contains getters and setters.
      this._visible = options.visible;
      this._opacity = options.opacity;
      this._cursor = options.cursor;
      this._maxWidth = options.maxWidth;
      this._maxHeight = options.maxHeight;
      this._rotation = options.rotation;
      this._scalar = typeof options.scale === 'number' ? new Vector( options.scale, options.scale ) : options.scale;

      // @private {number} - Scale applied due to the maximum width and height constraints.
      this._appliedScaleFactor = 1;

      // @protected {number} - screenViewScale in terms of global units per local unit for converting Scenery
      //                       coordinates to pixels. Referenced as soon as the scale is known in `layout()`
      this._screenViewScale = null;

      // @private {Bounds} - // Bounds for the Node and its children in the "parent" coordinate frame.
      this._bounds = Bounds.ZERO.copy(); // Bounds for the Node and its children in the "parent" coordinate frame.

      // Check that there are no conflicting location setters.
      assert( Node.X_LOCATION_KEYS.filter( key => !!options[ key ] ).length <= 1, 'more than 1 x-mutator' );
      assert( Node.Y_LOCATION_KEYS.filter( key => !!options[ key ] ).length <= 1, 'more than 1 y-mutator' );

      // Call the mutators of this instance for the location options that were provided.
      Object.keys( options ).forEach( key => {
        if ( options[ key ] ) {
          const descriptor = Object.getOwnPropertyDescriptor( Node.prototype, key );

          // if the key refers to a function that is not ES5 writable, it will execute that function with the single argument
          if ( descriptor && typeof descriptor.value === 'function' ) {
            this[ key ]( options[ key ] );
          }
          if ( descriptor && typeof descriptor.set === 'function' ) {
            this[ key ] = options[ key ];
          }
        }
      } );
    }

    /**
     * ES5 getters of properties of this Node. Traditional Accessors methods aren't included to reduce the memory
     * footprint. Upper locations are in terms of the visual layout, so the minY is the 'upper', and maxY is the 'lower'
     * See setLocation() for more documentation of Node locations and their names.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get bounds() { return this._bounds; }
    get localBounds() { return this._bounds.copy().shift( -this._bounds.minX, -this._bounds.minY ); }
    get leftTop() { return this._bounds.leftBottom; }
    get centerTop() { return this._bounds.centerBottom; }
    get rightTop() { return this._bounds.rightBottom; }
    get leftCenter() { return this._bounds.leftCenter; }
    get center() { return this._bounds.center; }
    get centerX() { return this._bounds.center.x; }
    get centerY() { return this._bounds.center.y; }
    get rightCenter() { return this._bounds.rightCenter; }
    get leftBottom() { return this._bounds.leftTop; }
    get centerBottom() { return this._bounds.centerTop; }
    get rightBottom() { return this._bounds.rightTop; }
    get left() { return this._bounds.minX; }
    get right() { return this._bounds.maxX; }
    get top() { return this._bounds.minY; }
    get bottom() { return this._bounds.maxY; }
    get width() { return this._bounds.width; }
    get height() { return this._bounds.height; }
    get visible() { return this._visible; }
    get opacity() { return this._opacity; }
    get cursor() { return this._cursor; }
    get maxWidth() { return this._maxWidth; }
    get maxHeight() { return this._maxHeight; }
    get scalar() { return this._scalar; }
    get translation() { return this.leftTop; }
    get rotation() { return this._rotation; }

    //----------------------------------------------------------------------------------------
    // Mutators
    //----------------------------------------------------------------------------------------

    /**
     * Convenience method that sets the one of the following locations of the Node's bounds to the specified point.
     *                        top
     *          ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     *          ┃ leftTop     centerTop     rightTop    ┃
     *    left  ┃ leftCenter  center (x,y)  rightCenter ┃  right
     *          ┃ leftBottom  centerBottom  rightBottom ┃
     *          ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
     *                        bottom
     * @public
     * @param {string} name - the name of the location (e.g) leftTop
     * @param {Vector|number} location - the location to set the name to. Use Vector for point locations and numbers
     *                                   for shifting (i.e. left, top, etc.)
     */
    setLocation( name, location ) {
      assert( typeof name === 'string', `invalid name: ${ name }` );
      assert( this._bounds.isFinite(),
        `Cannot set ${ name } when the Node has invalid (empty/NaN/infinite) bounds.` );

      // horizontal shift
      if ( [ 'left', 'right', 'centerX' ].includes( name ) ) {
        assert( isFinite( location ), `${ name } should be a finite.` );
        return this.translate( new Vector( location - this[ name ], 0 ) );
      }

      // vertical shift
      if ( [ 'top', 'bottom', 'centerY' ].includes( name ) ) {
        assert( isFinite( location ), `${ name } should be a finite.` );
        return this.translate( new Vector( 0, location - this[ name ] ) );
      }

      // At this point, the location must be a point location
      assert( this[ name ] instanceof Vector, `invalid name: ${ name }` );
      assert( location instanceof Vector && location.isFinite(), `${ name } should be a finite Vector` );
      this.translate( location.copy().subtract( this[ name ] ) );
      this.layout( this._screenViewScale );
    }

    /**
     * ES5 Setters of locations of this Node. Traditional Mutator methods aren't included to reduce the memory
     * footprint. See setLocation() for more documentation of Node locations and their names.
     * @public
     *
     * @param {*} * - See the property declaration for documentation of the type.
     */
    set leftTop( leftTop ) { this.setLocation( 'leftTop', leftTop ); }
    set centerTop( centerTop ) { this.setLocation( 'centerTop', centerTop ); }
    set rightTop( rightTop ) { this.setLocation( 'rightTop', rightTop ); }
    set leftCenter( leftCenter ) { this.setLocation( 'leftCenter', leftCenter ); }
    set center( center ) { this.setLocation( 'center', center ); }
    set centerX( centerX ) { this.setLocation( 'centerX', centerX ); }
    set centerY( centerY ) { this.setLocation( 'centerY', centerY ); }
    set rightCenter( rightCenter ) { this.setLocation( 'rightCenter', rightCenter ); }
    set leftBottom( leftBottom ) { this.setLocation( 'leftBottom', leftBottom ); }
    set centerBottom( centerBottom ) { this.setLocation( 'centerBottom', centerBottom ); }
    set rightBottom( rightBottom ) { this.setLocation( 'rightBottom', rightBottom ); }
    set left( left ) { this.setLocation( 'left', left ); }
    set right( right ) { this.setLocation( 'right', right ); }
    set top( top ) { this.setLocation( 'top', top ); }
    set bottom( bottom ) { this.setLocation( 'bottom', bottom ); }

    /**
     * Sets whether this Node (and its sub-tree) is visible.
     * @public
     *
     * @param {boolean} visible
     */
    set visible( visible ) {
      assert( typeof visible === 'boolean', `invaid visible: ${ visible }` );
      this._visible = visible;
      this.style.opacity = this._visible ? this._opacity : 0; // Update our CSS style.
    }

    /**
     * Sets the opacity of this Node (and its sub-tree), where 0 is fully transparent, and 1 is fully opaque.
     * @public
     *
     * @param {number} opacity - must be in the range [0, 1]
     */
    set opacity( opacity ) {
      assert( typeof opacity === 'number' && opacity >= 0 && opacity <= 1, `invaid opacity: ${ opacity }` );
      this._opacity = opacity;
      this.style.opacity = this._visible ? this._opacity : 0; // Update our CSS style.
    }

    /**
     * Sets the CSS cursor string that should be used when the mouse is over this Node. Null is the default, which
     * indicates that ancestor nodes (or the browser default) should be used.
     * @public
     *
     * @param {string|null} cursor - A CSS cursor string, like 'pointer', or 'none'
     */
    set cursor( cursor ) {
      assert( typeof cursor === 'string' || cursor === null, `invalid cursor: ${ cursor }` );
      this._cursor = cursor === 'auto' ? null : cursor;
      this.style.cursor = this._cursor; // Update our CSS style.
    }

    /**
     * @public
     *
     * @param {number|null} width
     */
    set width( width ) {
      assert( !width || ( typeof width === 'number' && width > 0 ), `invalid width: ${ width }` );
      this._bounds.maxX = this._bounds.minX + width;
      this._updateMaxDimension();
    }

    /**
     * @public
     *
     * @param {number|null} width
     */
    set height( height ) {
      assert( !height || ( typeof height === 'number' && height > 0 ), `invalid height: ${ height }` );
      this._bounds.maxY = this._bounds.minY + height;
      this._updateMaxDimension();
    }


    /**
     * Sets the maximum width of the Node. Will Scale the Node down if the current width is greater than the maxWidth.
     * @public
     *
     * @param {number|null} maxWidth - if null, there is not maxWidth
     */
    set maxWidth( maxWidth ) {
      assert( !maxWidth || ( typeof maxWidth === 'number' && maxWidth > 0 ), `invalid maxWidth: ${ maxWidth }` );
      if ( this._maxWidth !== maxWidth ) {
        this._maxWidth = maxWidth;
        this._updateMaxDimension();
      }
    }

    /**
     * Sets the maximum height of the Node. Will Scale the Node down if the current height is greater than the maxHeight
     * @public
     *
     * @param {number|null} maxHeight - if null, there is not maxHeight
     */
    set maxHeight( maxHeight ) {
      assert( !maxHeight || ( typeof maxHeight === 'number' && maxHeight > 0 ), `invalid maxHeight: ${ maxHeight }` );
      if ( this._maxHeight !== maxHeight ) {
        this._maxHeight = maxHeight;
        this._updateMaxDimension();
      }
    }

    /**
     * Scales the Node's Transformation. NOTE: May scale larger than the maxWidth or maxHeight. Scale is relative to
     * the CURRENT width and height. To scale to original width and height, see set scaleMagnitude();
     * @public
     *
     * This method is overloaded and has 2 method signatures:
     * @param {number} s - Scales in both the X and Y directions. Example usage: scale( 5 );
     *
     * OR:
     * @param {number} vector - Scales in each direction, as <xScale, yScale>
     */
    scale( a ) {
      if ( a instanceof Vector ) {
        assert( a.isFinite(), `invalid scale: ${ a }` );
        this.scalar = this.scalar.copy().componentMultiply( a );
      }
      else {
        assert( isFinite( a ), `invalid scale: ${ a }` );
        this.scale( new Vector( a, a ) );
      }
    }

    /**
     * Scales the Node's Transformation. NOTE: May scale larger than the maxWidth or maxHeight. Scale is relative to
     * ORIGNAL width and height, see set scalar();
     * @public
     *
     * This method is overloaded and has 2 method signatures:
     * @param {number} s - Scales in both the X and Y directions. Example usage: scale( 5 );
     *
     * OR:
     * @param {number} vector - Scales in each direction, as <xScale, yScale>
     */
    set scalar( a ) {
      if ( a instanceof Vector ) {
        assert( a.isFinite(), `invalid scale: ${ a }` );
        this._scalar = a;
        const xExpansion = this.width * a.x - this.width;
        const yExpansion = this.height * a.y - this.height;
        this._bounds.expand( xExpansion / 2, yExpansion / 2, xExpansion / 2, yExpansion / 2 );
        this.layout( this._screenViewScale );
      }
      else {
        assert( isFinite( a ), `invalid scale: ${ a }` );
        this.scalar = new Vector( a, a );
      }
    }

    /**
     * Translates the Node, in the typical view coordinate frame (where positive y is down), relative to the CURRENT
     * position. See set translation() toe translate relative to the original position.
     * @public
     *
     * @param {Vector} translation - the translation amount, given as <xTranslation, yTranslation>.
     */
    translate( translation ) {
      assert( translation instanceof Vector && translation.isFinite(), `invalid translation: ${ translation }` );
      this._bounds.shift( translation.x, translation.y );
      this.layout( this._screenViewScale );
    }

    /**
     * Modifies the translation of this Node's Transformation by shifting the Node, relative to the ORIGINAL position.
     * @public
     *
     * @param {Vector} translation - translation, given as <xTranslation, yTranslation>.
     */
    set translation( translation ) {
      assert( translation instanceof Vector, `invalid translation: ${ translation }` );
      this.translate( this.translation.copy().negate().add( translation ) );
    }

    /**
     * Rotates this Node's relative to its CURRENT rotation, in radians.
     * IMPORTANT: rotations will mess up localBounds and might lead to inaccurate positioning of the Node's subtree.
     * @public
     *
     * @param {number} rotation - In radians
     */
    rotate( rotation ) { this.rotation = this.rotation + rotation; }

    /**
     * Rotates this Node's relative to its CURRENT rotation, in radians.
     * IMPORTANT: rotations will mess up localBounds and might lead to inaccurate positioning of the Node's subtree.
     * @public
     *
     * @param {number} rotation - In radians
     */
    set rotation( rotation ) {
      assert( typeof rotation === 'number' && isFinite( rotation ), `invalid rotation: ${ rotation }` );
      this._rotation = rotation;
      this.layout( this._screenViewScale );
    }

    /**
     * Updates the Node's scale and applied scale factor if we need to change our scale to fit within the maximum
     * dimensions (maxWidth and maxHeight).
     * @private
     */
    _updateMaxDimension() {

      // Compute the new Scale given the maxWidth and maxHeight. Use min to ensure that dimensions are smaller.
      const scale = Math.min(
        this._maxWidth ? this._maxWidth / this.width : 1,
        this._maxHeight ? this._maxHeight / this.height : 1
      );

      // Scale the Node to match the maxWidth or maxHeight and update the _appliedScaleFactor flag.
      this.scale( scale / this._appliedScaleFactor );
      this._appliedScaleFactor = scale;
    }

    /**
     * Returns a bounding box for this Node (and its sub-tree) in the global coordinate frame. Must have ScreenView
     * as one of its ancestors.
     * @protected
     * @returns {Bounds|null} - will return null if the Node isn't in the sub-tree of ScreenView.
     */
    _computeGlobalBounds() {

      const traverser = ( currentNode ) => {
        if ( currentNode instanceof require( 'SIM_CORE/scenery/ScreenView' ) ) {
          return currentNode.viewBounds;
        }
        else if ( !currentNode.parent || !( currentNode.parent instanceof DOMObject ) ) {
          return null;
        }
        else {
          const parentBounds = traverser( currentNode.parent );
          const currentBounds = currentNode.bounds;
          return Bounds.rect(
            parentBounds.minX + currentBounds.minX,
            parentBounds.minY + currentBounds.minY,
            currentBounds.width,
            currentBounds.height
          );
        }
      }
      return traverser( this );
    }

    /**
     * Called when the Node layout needs to be updated, typically when the browser window is resized.
     * @private (scenery-internal)
     *
     * @param {number} scale - scale in terms of global units per local unit
     */
    layout( scale ) {
      if ( !scale ) return

      if ( this.bounds.isFinite() ) {
        const globalBounds = this._computeGlobalBounds();


        if ( globalBounds ) {

          console.log( globalBounds.toString(), this.constructor.name )
          const r = this.rotation;
          const sx = this.scalar.x;
          const sy = this.scalar.y;
          const tx = globalBounds.leftBottom.x;
          const ty = globalBounds.leftBottom.y;
          const cx = this.center.x;
          const cy = this.center.y;

          // Compute the transformation matrix values. // NOTE: the toFixed calls are inlined for performance reasons.
          const scaleX = ( Math.cos( r ) * sx ).toFixed( 10 );
          const scaleY = ( Math.cos( r ) * sy ).toFixed( 10 );
          const skewX = ( -1 * Math.sin( r ) * sx ).toFixed( 10 );
          const skewY = ( Math.sin( r ) * sy ).toFixed( 10 );
          const translateX = ( (-cx * Math.cos(r) + cy * Math.sin(r) + cx) * sx + tx ).toFixed( 10 ) * scale;
          const translateY = ( (-cx * Math.sin(r) - cy * Math.cos(r) + cy) * sy + ty ).toFixed( 10 ) * scale;
          this.style.transform = `matrix(${ scaleX },${ skewY },${ skewX },${ scaleY },${ translateX },${ translateY })`;

        }
      }

      this._screenViewScale = scale;
    }

    /**
     * Ensures that all children are Node types, and updates the Node's bounds.
     * @override
     * @public
     *
     * @param {Node} child
     * @returns {Node} - Returns 'this' reference, for chaining
     */
    addChild( child ) {
      assert( child instanceof Node, `invalid child: ${ child }` );
      super.addChild( child );
      const childBounds = child.bounds.copy().shift( this.left, this.top );
      this._bounds = this._bounds.union( childBounds );
      return this;
    }
  }

  Node.X_LOCATION_KEYS = [ 'translation', 'left', 'right',
                           'centerX', 'centerTop', 'rightTop',
                           'leftCenter', 'center', 'rightCenter',
                           'leftBottom', 'centerBottom', 'rightBottom' ];

  Node.Y_LOCATION_KEYS = [ 'translation', 'top', 'bottom',
                           'centerY', 'centerTop', 'rightTop',
                           'leftCenter', 'center', 'rightCenter',
                           'leftBottom', 'centerBottom', 'rightBottom' ];


  return Node;
} );