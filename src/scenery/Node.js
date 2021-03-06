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
 * It is important to note that Node coordinates ARE NOT in pixels. The browser width and height (which are in pixels)
 * change from device to device and the window size may shrink or grow.
 *
 * Instead, Node uses ScreenView coordinates. ScreenView Coordinates are constant and don't depend on the window width.
 * It is a changing scalar off the actual window size. All Node coordinates are in terms of these coordinates.
 * The layout() method then changes the actual CSS pixel coordinates based off the ScreenView scale. See ScreenView.js
 * for more documentation.
 *
 * It is also important to note that coordinates for all view-related objects have the origin at the top-left of its
 * local bounds and the positive-y downwards.
 *
 * ## Terminology:
 * - Window coordinates: Coordinate frame of a node relative to the browser, in pixels.
 * - Global coordinates: Coordinate frame of a node relative to the ScreenView (specifically in its local coordinates).
 * - Parent coordinates: Coordinate frame of a node relative to the parent of each Node's local bounds.
 * - Local coordinates: Coordinate frame of a node relative to itself, where (0, 0) is always the top left of the Node.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Bounds = require( 'SIM_CORE/util/Bounds' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const ScreenView = require( 'SIM_CORE/scenery/ScreenView' );
  const Util = require( 'SIM_CORE/util/Util' );
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
      assert( !options || !options.style || !options.style.transformOrigin, 'Node sets transformOrigin' );
      assert( !options || !options.type || DOMObject.SVG_TYPES.includes( options.type ), 'Must be an SVG sub-type.' );

      // Defaults for options.
      const defaults = {

        // Super-class options
        type: 'g',

        // Options specific to Node
        children: [],       // {Node[]} - ordered array of the children. See `set children()` (in super-class) for doc.
        cursor: null,       // {string} - Alias of the CSS cursor of the Node. See set cursor() for doc.
        visible: true,      // {boolean} - Indicates if the Node is visible. See set visible() for more doc.
        opacity: 1,         // {number} - Alias of the CSS opacity of the Node. See set opacity() for more doc.
        maxWidth: null,     // {number} - If provided, constrains width of this Node. See set maxWidth() for more doc.
        maxHeight: null,    // {number} - If provided, constrains height of this Node. See set maxHeight() for more doc.

        // transformations
        translation: null,  // {Vector} - If provided, (x, y) translation of the Node. See set translation().
        rotation: 0,        // {number} - rotation (in radians) of the Node. See set rotation() for more doc.
        scalar: 1,          // {Vector|number} - scalar of the Node. See set scalar() for more doc.

        // Overrides the location of the Node, if provided. See setLocation() for more doc.
        topLeft: null,      // {Vector} - The upper-left corner of this Node's bounds.
        topCenter: null,    // {Vector} - The top-center of this Node's bounds.
        topRight: null,     // {Vector} - The upper-right corner of this Node's bounds.
        centerLeft: null,   // {Vector} - The left-center of this Node's bounds.
        center: null,       // {Vector} - The center of this Node's bounds.
        centerRight: null,  // {Vector} - The center-right of this Node's bounds. See setLocation() for more doc.
        bottomLeft: null,   // {Vector} - The bottom-left of this Node's bounds.
        bottomCenter: null, // {Vector} - The middle center of this Node's bounds.
        bottomRight: null,  // {Vector} - The bottom right of this Node's bounds.
        left: null,         // {number} - The left side of this Node's bounds.
        right: null,        // {number} - The right side of this Node's bounds.
        top: null,          // {number} - The top side of this Node's bounds.
        bottom: null,       // {number} - The bottom side of this Node's bounds.
        centerX: null,      // {number} - The x-center of this Node's bounds.
        centerY: null,      // {number} - The y-center of this Node's bounds.

        width: null,        // {number} - The width of the Node's bounds. See set width() for more doc.
        height: null        // {number} - The height of the Node's bounds. See set height() for more doc.
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.style = { ...defaults.style, ...options.style }; // Preserve default styles.

      super( options );

      //----------------------------------------------------------------------------------------

      // @private {*} - see options declaration for documentation. Contains getters and setters. Set to null for now and
      //                to be set in the mutate() call in the constructor.
      this._visible;
      this._opacity;
      this._cursor;
      this._maxWidth;
      this._maxHeight;
      this._rotation;
      this._scalar;

      // @protected {Bounds} - Bounds for the Node and its children in the "parent" coordinate frame.
      this._bounds = Bounds.ZERO.copy();

      // @public (read-only) {number} - screenViewScale in terms of global units per local unit for converting Scenery
      //                                coordinates to pixels. Referenced as soon as the scale is known in `layout()`
      this.screenViewScale;

      options && this.mutate( options );
    }

    /**
     * ES5 getters of properties of this Node. Traditional Accessors methods aren't included to reduce the memory
     * footprint. Upper locations are in terms of the visual layout, so the minY is the 'upper', and maxY is the 'lower'
     * See setLocation() for more documentation of Node locations and their names. Locations are in the parent
     * coordinate frame.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type. All number, string, and Vector return
     *              types can be mutated once accessed. Bounds return types mutability vary, but are documented below.
     */
    get bounds() { return this._bounds; }                                             // Do NOT mutate returned value!
    get parentBounds() { return this._bounds; }  // Alias to 'get bounds'.            // Do NOT mutate returned value!
    get globalBounds() { return this._computeGlobalBounds( Bounds.ZERO.copy() ); }    // Can mutate returned value.
    get localBounds() { return this._bounds.copy().shift( -this.left, -this.top ); }  // Can mutate returned value.
    get topLeft() { return this._bounds.bottomLeft; }
    get topCenter() { return this._bounds.bottomCenter; }
    get topRight() { return this._bounds.bottomRight; }
    get centerLeft() { return this._bounds.centerLeft; }
    get center() { return this._bounds.center; }
    get centerX() { return this._bounds.center.x; }
    get centerY() { return this._bounds.center.y; }
    get centerRight() { return this._bounds.centerRight; }
    get bottomLeft() { return this._bounds.topLeft; }
    get bottomCenter() { return this._bounds.topCenter; }
    get bottomRight() { return this._bounds.topRight; }
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
    get translation() { return this.topLeft; }
    get rotation() { return this._rotation; }

    //----------------------------------------------------------------------------------------
    // Mutators
    //----------------------------------------------------------------------------------------

    /**
     * Mutates multiple Node setters in one function call. For instance, `Node.mutate( { top: 0, left: 5 } );`
     * is equivalent to `Node.left = 5; Node.top = 0;`
     * @public
     *
     * Mutators will be set in the order of the static field MUTATOR_KEYS, which subtypes can add to or modify.
     *
     * @param {Object} [options]
     */
    mutate( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      // Check that there are no conflicting location setters of the bounds of this Node.
      assert( Node.X_BOUNDS_MUTATORS.filter( key => options[ key ] ).length <= 1, 'more than 1 x-mutator' );
      assert( Node.Y_BOUNDS_MUTATORS.filter( key => options[ key ] ).length <= 1, 'more than 1 y-mutator' );

      // Call the mutators of this instance for the setter options that were provided.
      ( this.constructor.MUTATOR_KEYS || Node.MUTATOR_KEYS ).forEach( key => {
        if ( options[ key ] !== null && options[ key ] !== undefined ) { // Only mutate if the option was provided

          // If the key refers to a setter, it will call the setter with the option value.
          if ( typeof this[ key ] === 'function' ) this[ key ]( options[ key ] );
          else this[ key ] = options[ key ]; // ES5 setter.
        }
      } );
    }

    /**
     * Convenience method that sets the one of the following locations of the Node's bounds to the specified point,
     * in the parent coordinate frame.
     *                        top
     *          ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     *          ┃ topLeft     topCenter     topRight    ┃
     *    left  ┃ centerLeft  center (x,y)  centerRight ┃  right
     *          ┃ bottomLeft  bottomCenter  bottomRight ┃
     *          ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
     *                        bottom
     * @public
     * @param {string} name - the name of the location (e.g) topLeft
     * @param {Vector|number} location - the location to set the name to. Use Vector for point locations and numbers
     *                                   for shifting (i.e. left, top, etc.)
     */
    setLocation( name, location ) {
      assert( typeof name === 'string', `invalid name: ${ name }` );
      assert( this._bounds.isFinite(), `Cannot set ${ name } when the Node has invalid (empty/NaN/infinite) bounds.` );

      // Horizontal shift
      if ( [ 'left', 'right', 'centerX' ].includes( name ) ) {
        assert( isFinite( location ), `${ name } should be finite.` );
        return this.translate( Vector.scratch.setXY( location - this[ name ], 0 ) ); // translate and exit
      }

      // Vertical shift
      if ( [ 'top', 'bottom', 'centerY' ].includes( name ) ) {
        assert( isFinite( location ), `${ name } should be finite.` );
        return this.translate( Vector.scratch.setXY( 0, location - this[ name ] ) ); // translate and exit
      }
      // At this point, the location must be a point location
      assert( location instanceof Vector && location.isFinite(), `${ name } should be a finite Vector` );
      this.translate( Vector.scratch.set( location ).subtract( this[ name ] ) );
    }

    /**
     * ES5 Setters of locations of this Node (in the parent coordinate frame). Traditional Mutator methods aren't
     * included to reduce the memory footprint. See setLocation() for details of Node locations and their names.
     * @public
     *
     * @param {*} * - See the property declaration for documentation of the type.
     */
    set topLeft( topLeft ) { this.setLocation( 'topLeft', topLeft ); }
    set topCenter( topCenter ) { this.setLocation( 'topCenter', topCenter ); }
    set topRight( topRight ) { this.setLocation( 'topRight', topRight ); }
    set centerLeft( centerLeft ) { this.setLocation( 'centerLeft', centerLeft ); }
    set center( center ) { this.setLocation( 'center', center ); }
    set centerX( centerX ) { this.setLocation( 'centerX', centerX ); }
    set centerY( centerY ) { this.setLocation( 'centerY', centerY ); }
    set centerRight( centerRight ) { this.setLocation( 'centerRight', centerRight ); }
    set bottomLeft( bottomLeft ) { this.setLocation( 'bottomLeft', bottomLeft ); }
    set bottomCenter( bottomCenter ) { this.setLocation( 'bottomCenter', bottomCenter ); }
    set bottomRight( bottomRight ) { this.setLocation( 'bottomRight', bottomRight ); }
    set left( left ) { this.setLocation( 'left', left ); }
    set right( right ) { this.setLocation( 'right', right ); }
    set top( top ) { this.setLocation( 'top', top ); }
    set bottom( bottom ) { this.setLocation( 'bottom', bottom ); }

    /**
     * Sets whether this Node (and its sub-tree) is visible. Note that if visible=false, this is different from setting
     * opacity to 0 as the Node cannot receive any pointer-events and its cursor is not applied.
     * @public
     *
     * @param {boolean} visible
     */
    set visible( visible ) {
      if ( visible === this._visible ) return; // Exit if setting to the same 'visible'
      assert( typeof visible === 'boolean', `invaid visible: ${ visible }` );
      this._visible = visible;
      this.setAttribute( 'visibility', this._visible ? null : 'hidden' );
    }

    /**
     * Sets the opacity of this Node (and its sub-tree), where 0 is fully transparent, and 1 is fully opaque. Will only
     * show if the Node is visible.
     * @public
     *
     * @param {number} opacity - must be in the range [0, 1]
     */
    set opacity( opacity ) {
      if ( opacity === this._opacity ) return; // Exit if setting to the same opacity
      assert( typeof opacity === 'number' && opacity >= 0 && opacity <= 1, `invaid opacity: ${ opacity }` );
      this._opacity = opacity;
      this.style.opacity = this._opacity; // Update our CSS style.
    }

    /**
     * Sets the CSS cursor string that should be used when the mouse is over this Node. Null is the default, which
     * indicates that ancestor nodes cursor (or the browser default) should be used. If cursor is 'scenery-drag' and a
     * DragListener is applied, the DragListener will apply a custom cursor for dragging.
     * @public
     *
     * @param {string|null} cursor - A CSS cursor string, like 'pointer', or 'none', or 'scenery-drag'
     */
    set cursor( cursor ) {
      if ( cursor === this._cursor ) return; // Exit if setting to the same cursor
      assert( typeof cursor === 'string' || cursor === null, `invalid cursor: ${ cursor }` );
      this._cursor = cursor === 'auto' ? null : cursor;
      this.style.cursor = this._cursor; // Update our CSS style.
    }

    /**
     * Sets the width of this Node's bounding box, keeping the minX the same but expanding/contracting the right border.
     * @public
     *
     * @param {number} width
     */
    set width( width ) {
      if ( width === this._bounds.width ) return; // Exit if setting to the same width
      assert( typeof width === 'number' && isFinite( width ) && width >= 0, `invalid width: ${ width }` );
      this._bounds.maxX = this._bounds.minX + width;
      this._updateMaxDimension();
    }

    /**
     * Sets the height of this Node's bounding box, keeping the minY the same but expanding/contracting the bottom maxY.
     * @public
     *
     * @param {number} height
     */
    set height( height ) {
      if ( height === this._bounds.height ) return; // Exit if setting to the same height
      assert( typeof height === 'number' && isFinite( height ) && height >= 0, `invalid height: ${ height }` );
      this._bounds.maxY = this._bounds.minY + height;
      this._updateMaxDimension();
    }

    /**
     * Sets the maximum width of the Node. Will Scale the Node down if the current width is greater than the maxWidth.
     * @public
     *
     * @param {number|null} maxWidth - if null, there is no maxWidth
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
     * @param {number|null} maxHeight - if null, there is no maxHeight
     */
    set maxHeight( maxHeight ) {
      assert( !maxHeight || ( typeof maxHeight === 'number' && maxHeight > 0 ), `invalid maxHeight: ${ maxHeight }` );
      if ( this._maxHeight !== maxHeight ) {
        this._maxHeight = maxHeight;
        this._updateMaxDimension();
      }
    }

    /**
     * Scales the Node. NOTE: Scale is relative to the CURRENT width and height. To scale to original width and height,
     * see 'set scalar()';
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

        // Set out scalar reference.
        if ( !this._scalar ) this._scalar = a.x === a.y ? a.x : a.copy();
        else if ( this._scalar instanceof Vector ) this._scalar.componentMultiply( a );
        else this._scalar = a.x === a.y ? this._scalar * a.x : a.copy().multiply( this._scalar );

        // Calculate how much to expand our bounds
        const xExpand = this.width / 2 * ( a.x - 1 );
        const yExpand = this.height / 2 * ( a.y - 1 );
        if ( xExpand || yExpand ) this._bounds.expand( xExpand, yExpand, xExpand, yExpand );

        // Ensure the maxWidth and maxHeight flags are satisfied.
        this._updateMaxDimension();
        this.layout( this.screenViewScale );
      }
      else this.scale( Vector.scratch.setXY( a, a ) ); // Forward as `scale( <a, a> )`
    }

    /**
     * Scales the Node. NOTE: Scale is relative to ORIGNAL width and height. To scale to the current width and height,
     * see `scale()`;
     * @public
     *
     * This method is overloaded and has 2 method signatures:
     * @param {number} s - Scales in both the X and Y directions. Example usage: `Node.scalar = 5`;
     *
     * OR:
     * @param {number} vector - Scales in each direction, as <xScale, yScale>
     */
    set scalar( a ) {
      if ( a instanceof Vector ) {
        if ( !( isFinite( this._scalar ) || this._scalar instanceof Vector ) ) this.scale( 1 ); // First time
        if ( this._scalar instanceof Vector && this._scalar.equals( a ) ) return; // Exit if setting to the same scale.
        if ( a.x === this._scalar && a.y === this._scalar ) return; // Exit if setting to the same scale.

        // Get our current scale.
        const currentScalarX = this._scalar instanceof Vector ? this._scalar.x : this._scalar;
        const currentScalarY = this._scalar instanceof Vector ? this._scalar.y : this._scalar;

        this.scale( Vector.scratch.setXY( a.x / currentScalarX, a.y / currentScalarY ) );
      }
      else this.scalar = Vector.scratch.setXY( a, a ); // Forward as `set scalar( <a, a> )`
    }

    /**
     * Translates the Node, in the typical view coordinate frame (where the positive-y is downwards), relative to the
     * current position.
     * @public
     *
     * @param {Vector} translation - the translation amount, given as <xTranslation, yTranslation>.
     */
    translate( translation ) {
      assert( translation instanceof Vector && translation.isFinite(), `invalid translation: ${ translation }` );
      if ( translation.x === 0 && translation.y === 0 ) return; // Exit if setting to the same translation.
      this._bounds.shift( translation.x, translation.y );
      if ( this.parent instanceof Node ) this.parent._recomputeAncestorBounds();
      this.layout( this.screenViewScale );
    }

    /**
     * Modifies the translation of this Node's Transformation by shifting the Node, relative to the ORIGINAL position.
     * @public
     *
     * @param {Vector} translation - translation, given as <xTranslation, yTranslation>.
     */
    set translation( translation ) {
      assert( translation instanceof Vector, `invalid translation: ${ translation }` );
      if ( this.translation.equals( translation ) ) return; // Exit if setting to the same translation.
      this.topLeft = translation;
    }

    /**
     * Rotates this Node's relative to its CURRENT rotation, in radians.
     * IMPORTANT: rotations will not recalculate localBounds and might lead to inaccurate positioning of the Node's
     *            subtree. Thus, it is recommended to only rotate leafs that are symmetrical (like circles).
     * @public
     *
     * @param {number} rotation - In radians
     */
    rotate( rotation ) {
      if ( rotation === 0 ) return; // Exit if setting to the same rotation.
      this.rotation = this.rotation + rotation;
    }

    /**
     * Rotates this Node's relative to its CURRENT rotation, in radians.
     * IMPORTANT: rotations will not recalculate localBounds and might lead to inaccurate positioning of the Node's
     *            subtree. Thus, it is recommended to only rotate leafs that are symmetrical (like circles).
     * @public
     *
     * @param {number} rotation - In radians
     */
    set rotation( rotation ) {
      assert( typeof rotation === 'number' && isFinite( rotation ), `invalid rotation: ${ rotation }` );
      if ( this._rotation === rotation ) return; // Exit if setting to the same rotation.
      this._rotation = rotation;
      this.layout( this.screenViewScale );
    }

    /**
     * Ensures that the maxWidth and/or the maxWidth of this Node are satisfied. Will scale the Node down if these
     * invariants are not satisfied, so that our dimensions fit within the maximum dimensions (maxWidth and maxHeight).
     * @private
     */
    _updateMaxDimension() {
      // Ensure that our ancestor's bounds are correct after updating width/height
      if ( this.parent instanceof Node ) this.parent._recomputeAncestorBounds();

      // Only update if the maxWidth and/or the maxWidth of this Node is not satisfied.
      if ( ( this.maxHeight && this.height > this.maxHeight ) || ( this.maxWidth && this.width > this.maxWidth ) ) {

        // Compute the new Scale given the maxWidth and maxHeight. Use min to ensure that dimensions are smaller.
        const scale = Math.min(
          this._maxWidth ? this._maxWidth / this.width : 1,
          this._maxHeight ? this._maxHeight / this.height : 1
       );

        // Scale the Node to match the maxWidth or maxHeight.
        this.scale( scale );
      }
    }

    /**
     * Layouts the Node and its entire sub-tree, ensuring correct pixel positioning in the window based off this Node's
     * global bounds. Also applies other transformations, including rotation and scale. Requires a scale, in terms of
     * window pixels per ScreenView coordinate, for determining exact pixel coordinates.
     *
     * This method may be overridden in sub-types, but it is required to call the super class's layout method. Node's
     * layout method will position the Node's top-left, meaning sub-types must have their origin at the top-left corner
     * of its Node, where 0 transformation positions the sub-type at the upper-left corner of the ScreenView.
     *
     * This method is generally called in 3 scenarios:
     *   (1) The browser window is resized, meaning that the Node's pixel coordinates will change, but its bounds
     *       don't change. The scale should be different.
     *   (2) The Node's parent/local/global Bounds changes, meaning its ScreenView coordinates have changed, which
     *       incurs a different pixel coordinate.
     *   (3) The Node is scaled/rotated. Scaling technically falls under scenario 2, while rotations don't change
     *       bounds. However, the layout method will apply the CSS scale and rotation transformation, changing the
     *       visual output of the Node in the browser.
     *
     * Internally, this method prioritizes performance to minimize frame rate drops when resizing the browser.
     * @public (sim-core-internal)
     *
     * @param {number|null} scale - scenery scale, in terms of window pixels per ScreenView coordinate.
     */
    layout( scale ) {
      if ( !scale || !this.parent ) return; // Exit if no scale was provided.

      if ( assert.enabled ) { // Only assert sanity checks if assertions are enabled for performance reasons.
        // Sanity checks
        assert( this.bounds.isFinite(), 'bounds are not finite.' );
      }
      /**
       * Access and reference all necessary information to generate the svg transform attribute string.
       * See https://css-tricks.com/transforms-on-svg-elements/ for more information of this attribute.
       *
       * All Numbers are rounded to 10 decimal places. 10 is the largest guaranteed number of digits of the transform
       * attribute. See https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed
       * NOTE: the toFixed calls are inlined for performance reasons, and slight inaccuracies won't be visible.
       */
      const scaleX = ( this._scalar instanceof Vector ? this._scalar.x : this._scalar ).toFixed( 10 );
      const scaleY = ( this._scalar instanceof Vector ? this._scalar.y : this._scalar ).toFixed( 10 );
      const rotation = ( Util.toDegrees( this.rotation ) ).toFixed( 10 );
      const translateX = ( this._bounds.minX * scale / scaleX );  // Scale to convert to pixels.
      const translateY = ( this._bounds.minY * scale / scaleY );  // Scale to convert to pixels.
      const width = ( this.width * scale ).toFixed( 10 );         // Scale to convert to pixels.
      const height = ( this.height * scale ).toFixed( 10 );       // Scale to convert to pixels.

      // Create a flag for the final transform attribute string.
      const transformString = `scale( ${ scaleX } ${ scaleY } )`
                              + ` rotate( ${ rotation } ${ width / 2 } ${ height / 2 } )`
                              + ` translate( ${ translateX } ${ translateY } )`;

      // Set the svg transform attribute and reference the new screenViewScale.
      this.setAttribute( 'transform', transformString );
      this.screenViewScale = scale;

      // Call the layout method on the rest of the sub-tree of this Node.
      this.children.forEach( child => { child.layout( scale ); } );
    }

    /**
     * @override
     * Ensures that all children are Node types, and recomputes this Node's bounds after adding the child. See
     * _recomputeAncestorBounds() for information.
     * @override
     * @public
     *
     * @param {Node} child
     * @returns {Node} - Returns 'this' reference, for chaining
     */
    addChild( child ) {
      assert( child instanceof Node, `invalid child: ${ child }` );
      super.addChild( child );

      this._recomputeAncestorBounds(); // Update this Node's bounds after removing this child.
      this.layout( this.screenViewScale );
      return this;
    }

    /**
     * @override
     * Removes a child Node, and update this Node's bounds after removing this child. See _recomputeAncestorBounds() for
     * more information.
     * @public
     *
     * @param {Node} child
     * @returns {Node} - Returns 'this' reference, for chaining
     */
    removeChild( child ) {
      assert( child instanceof Node, `invalid child: ${ child }` );
      super.removeChild( child );

      this._recomputeAncestorBounds(); // Update this Node's bounds after removing this child.
      this.layout( this.screenViewScale );
      return this;
    }

    /**
     * Recomputes this Node's bounds (in the parent coordinate frame) and will recursively call this method for each
     * parent up to either the ScreenView or to the point where a Node doesn't have a parent. This is called after the
     * addChild() and removeChild() methods to ensure that Bounds are correct after adding/removing children for
     * all Nodes in its ancestor tree.
     * @protected
     *
     * NOTE: if any children have negative parent bounds, all of this Node's children's Bounds, and this Node's bounds,
     *       will be shifted so that all children have positive parent bounds. This Node's bounds will also be adjusted
     *       oppositely so that global positioning of the children is still correct.
     */
    _recomputeAncestorBounds() {

      // First step: Compute the child Bounds of this Node in our local coordinate frame. For now, set to the origin.
      // Use scratchBounds to eliminate new Bounds instances on each recursive layer.
      const childBounds = Bounds.scratch.set( Bounds.ZERO );

      // Next include the Bounds of each of this Node's first generation children, in our local coordinate frame.
      this.children.forEach( child => {
        // Include entirely the bounds of the child. Their bounds is in their parent coordinate frame, which is this
        // Node's local coordinate frame.
        childBounds.includeBounds( child.bounds );
      } );

      // Flag that indicates if any of this Node's children contains negative parent bounds.
      const negativeChildrenBounds = this.children.length && ( childBounds.minX < 0 || childBounds.minY < 0 );

      // If any children have negative parent bounds, shift all of this Node's children's Bounds by the smallest
      // amount (which will be negative) so that all children have positive parent bounds.
      if ( negativeChildrenBounds ) {
        this.children.forEach( child => {
          // Shifts only strictly apply on negative values. Otherwise, no shift.
          child.bounds.shift( Math.max( -childBounds.minX, 0 ), Math.max( -childBounds.minY, 0 ) );
        } );
      }

      // Shift child bounds (which is in the children's parent coordinate frame, or in other words in this Node's
      // local coordinate frame) by this Node's top-left, which converts the child bounds to this Node's parent
      // coordinate frame.
      const childBoundsParent = childBounds.shift( this.left, this.top ); // Child bounds in our parent coordinate frame

      // Set our bounds to child bounds in our parent coordinate frame. We also must include our topLeft for when
      // children are added to keep our bounds consistent. Use the bottom right for negative children bounds.
      this._bounds.set( childBoundsParent.includePoint( negativeChildrenBounds ? this.bottomRight : this.topLeft ) );

      // Recursively call this method for each parent up to either the ScreenView or to the point where a Node doesn't
      // have a parent, making all bounds correct.
      if ( this.parent && !( this.parent instanceof ScreenView ) ) this.parent._recomputeAncestorBounds();
    }

    /**
     * Returns a bounding box for this Node (and its sub-tree) in the global coordinate frame. Must have ScreenView
     * as one of its ancestors, or nothing will be returned.
     * @private
     *
     * @param {Bounds} resultBounds - the bounds to set the result globalBounds to. Passing the same Bounds eliminates
     *                                new Bounds instances on each recursive call, improving the memory footprint.
     * @returns {Bounds|null} - will return null if the Node isn't in the sub-tree of ScreenView.
     */
    _computeGlobalBounds( resultBounds ) {

      // Base-case: If this Node is a 1st generation child of ScreenView, its globalBounds is equivalent to its
      //            parentBounds.
      if ( this.parent instanceof ScreenView ) return this._bounds;

      // Recursively get the parent's global Bounds.
      const parentGlobalBounds = this.parent._computeGlobalBounds( resultBounds );

      // Only return if Node the parent has valid bounds.
      if ( parentGlobalBounds && parentGlobalBounds.isFinite() ) {

        // Shift the parent's global top-left by this Node's top-left (which is in the parent's coordinate frame) to get
        // this Node's globalBounds.
        return resultBounds.setAll(
          parentGlobalBounds.minX + this.left,
          parentGlobalBounds.minY + this.top,
          parentGlobalBounds.minX + this.left + this.width,
          parentGlobalBounds.minY + this.top + this.height
        );
      }
    }
  }

  /*----------------------------------------------------------------------------*
   * Static Constants
   *----------------------------------------------------------------------------*/

  // @protected {string[]} - setter names that modify the x-location of this Node's Bounds, in no particular order.
  Node.X_BOUNDS_MUTATORS = [ 'left', 'right', 'centerX', 'translation', 'topLeft', 'topCenter', 'topRight',
                             'centerLeft', 'center', 'centerRight', 'bottomLeft', 'bottomCenter', 'bottomRight' ];

  // @protected {string[]} - setter names that modify the y-location of this Node's Bounds, in no particular order.
  Node.Y_BOUNDS_MUTATORS = [ 'top', 'bottom', 'centerY', 'translation', 'topLeft', 'topCenter', 'topRight',
                             'centerLeft', 'center', 'centerRight', 'bottomLeft', 'bottomCenter', 'bottomRight' ];

  // @protected {string[]} - setter names used in Node.mutate(), in the order that the setters are called.
  //                         The order is important! Don't change this without knowing the implications.
  Node.MUTATOR_KEYS = [ 'children', 'opacity', 'cursor', 'visible', 'rotation', 'width', 'height', 'scalar',
                        'maxWidth', 'maxHeight', 'translation', 'topLeft', 'topCenter', 'topRight',
                        'centerLeft', 'center', 'centerRight', 'bottomLeft', 'bottomCenter',
                        'bottomRight', 'left', 'right', 'centerX', 'top', 'bottom', 'centerY' ];

  return Node;
} );