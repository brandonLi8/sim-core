// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Javascript version of the traditional HTML DOM Object, for rendering a scene graph.
 * Supports DOM, Canvas, SVG, WebGL, etc. Rendering is handled by the browser.
 *
 * ## General Description:
 *  - For the DOM, the display represents a tree (called the scene graph). Each DOM object represents a single visual
 *    object and are linked together in a hierarchical tree, which determines the 'order' things appear on the display.
 *
 *  - DOM objects are only displayed in the browser if their 'parent' (the DOM object that links to it) is displayed.
 *    In other words, if a DOMObject is displayed, its 'children' (what it links to) are also displayed. At the top of
 *    the scene graph, there is a root object that is displayed, allowing its entire sub-tree to be displayed.
 *
 *  - While code comments attempt to describe the implementation clearly, fully understanding it may require some
 *    general background. Some useful references include:
 *      - https://en.wikipedia.org/wiki/Scene_graph
 *      - https://www.w3schools.com/js/js_htmldom.asp
 *      - https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
 *      - https://en.wikipedia.org/wiki/Document_Object_Model
 *
 * ## Usage:
 *  - In sim-specific code, the DOMObject class should RARELY be instantiated.
 *    Instead, create a new Sim and its ScreenViews and use scenery Nodes (see ../scenery/Node.js) for structuring the
 *    scene graph. Node (a subtype) will provide a much cleaner sim-specific API using SVG compared to DOMObject.
 *
 *  - DOMObject and its subtypes generally have the last constructor parameter reserved for the 'options' object - a
 *    key-value map that specifies relevant options that can be overridden by the user.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Util = require( 'SIM_CORE/util/Util' );

  class DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      // Defaults for options.
      const defaults = {

        // {string} - the DOM object type: 'div', 'img', 'a', 'path', 'svg', etc.
        type: 'div',

        // {Object} - object literal that describes its CSS style. See `addStyles()` for full documentation.
        style: {
          padding: 0,
          margin: 0,
          boxSizing: 'border-box',
          position: 'relative'
        },

        // {string|null} - if not null, adds a text string that the object displays. See `setText()` for documentation.
        text: null,

        // Attributes
        id: null,     // {string|null} adds the id attribute for the object. See `setID()` for documentation.
        class: null,  // {string|null} adds the class attribute for the object. See `setClass()` for documentation.
        src: null,    // {string|null} adds a image's 'src' attribute. See `setSrc()` for documentation.
        href: null,   // {string|null} adds a link's url 'src' attribute.  See `setHref()` for documentation.

        // {Object} - object literal that describes any other attributes that aren't already described above.
        //            See `addAttributes()` for more context
        attributes: null
      };

      // Rewrite options so that it overrides the defaults.
      options = { ...defaults, ...options };
      options.style = { ...defaults.style, ...options.style };

      assert( typeof options.type === 'string', `invalid options.type: ${ options.type }` );

      //----------------------------------------------------------------------------------------
      // Create the properties of this object.
      // NOTE: all properties with names that start with '_' are assumed to not be private!

      // @private {string} (final) - see defaults for documentation. See `getType()` for read access of the type.
      this._type = options.type;

      // @private {string|null} - see defaults for documentation. Contains getters for read access.
      this._id = options.id;
      this._class = options.class;
      this._src = options.src;
      this._href = options.href;
      this._text = options.text;
      this._children = [];

      // @private {boolean} - indicates if this DOMObject has been disposed. See `dispose()`.
      this._isDisposed = false;

      // @private {HTMLElement} (final) - the actual DOM object. See `getElement()` for read access.
      this._element = DOMObject.SVG_TYPES.includes( this._type ) ?
                        document.createElementNS( DOMObject.SVG_NAMESPACE, this._type ) :
                        document.createElement( this._type );

      // @private {HTMLTextNode} (final) - the text node of the DOM object.
      this._textNode = document.createTextNode( this._text || '' );
      this._element.appendChild( this._textNode );

      // @protected {DOMObject|null} - the parent of this DOMObject
      this._parent = null;

      // Set the attributes and styles if provided in options, which validates the options
      options.attributes && this.addAttributes( options.attributes );
      options.style && this.addStyles( options.style );

      //----------------------------------------------------------------------------------------
      this.setAttribute( 'id', this._id );        // validates options.id and sets the id.
      this.setAttribute( 'class', this._class );  // validates options.class and sets the class.
      this._text && this.setText( this._text );   // validates options.text and sets the text.
      this.setAttribute( 'src', this._src );      // validates options.src and sets the src, if this._type is a image.
      this.setAttribute( 'href', this._href );    // validates options.href and sets the href, if this._type is a link.
    }

    /*----------------------------------------------------------------------------*
     * Accessors
     *----------------------------------------------------------------------------*/
    /**
     * ES5 getters of a private property of this DOM object. Traditional accessors not included to reduce the
     * memory footprint of this class.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get element() { return this._element; }
    get type() { return this._type; }
    get id() { return this._id; }
    get class() { return this._class; }
    get text() { return this._text; }
    get src() { return this._src; }
    get href() { return this._href; }
    get children() { return this._children; }
    get parent() { return this._parent; }
    get isDisposed() { return this._isDisposed; }

    /**
     * Gets the reference to the CSS Style Declaration Object literal. Modifying this object
     * WILL affect this DOM object. See `addStyles()` for further documentation on this Object.
     * @public
     *
     * @returns {CSSStyleDeclaration}
     */
    get style() { return this._element.style; }

    /*----------------------------------------------------------------------------*
     * Mutators
     *----------------------------------------------------------------------------*/

    /**
     * Sets an attribute of this DOMObject, updating this Object's properties.
     * @public
     *
     * @param {string} name - the name of the attribute
     * @param {*} value - the value of the attribute
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setAttribute( name, value ) {
      assert( !name || typeof name === 'string', `invalid name: ${ name }` );

      // Check if the attribute is one of our properties.
      if ( [ 'id', 'class', 'src', 'href' ].includes( name ) ) {
        value && assert( name !== 'src' || this._type === 'img', `cannot set 'src' for type: ${ this._type }` );
        value && assert( name !== 'href' || this._type === 'a', `cannot set 'href' for type: ${ this._type }` );

        this[ `_${ name }` ] = value; // update the property of this class
        this[ `_${ name }` ] ? this._element.setAttribute( name, value ) : this._element.removeAttribute( name );
      }
      else {
        this._element.setAttribute( name, value );
      }
      return this;
    }

    /**
     * Sets the id attribute of this DOMObject. DOMObjects can only have one id at a time.
     *
     * @param {string|null} id - null means no id
     */
    set id( id ) { this.setAttribute( 'id', id ); }

    /**
     * Sets the class attribute of this DOMObject. Can have multiple classes; just pass in a string with a space
     * separating the classes (e.g, setClass( 'class1 class2' )).
     *
     * @param {string|null} class - null means no class
     */
    set class( className ) { this.setAttribute( 'class', className ); }

    /**
     * Sets the 'src' attribute of this DOM object. Errors if this DOMObject's type isn't 'img'.
     *
     * @param {string} src
     */
    set src( src ) { this.setAttribute( 'src', src ); }

    /**
     * Sets the 'href' attribute of this DOM object. Errors if this DOMObject's type isn't 'a'.
     *
     * @param {string} href
     */
    set href( href ) { this.setAttribute( 'href', href ); }

    /**
     * Sets the text of the TextNode of this DOMObject. If this DOMObject is visible, the text will be displayed inside.
     * For background, see https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode.
     * @public
     *
     * @param {string|null} text - if null, nothing is displayed
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setText( text ) {
      assert( !text || typeof text === 'string', `invalid text: ${ text }` );
      this._text = text;
      this._textNode.textContent = this._text;
      return this;
    }
    set text( text ) { this.setText( text ); }

    /**
     * Appends a child DOMObject to our list of children.
     * @public
     *
     * The new child DOMObject will be displayed in front (on top) of all of this DOMObject's other children.
     *
     * @param {DOMObject} child
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    addChild( child ) {
      assert( child instanceof DOMObject, `invalid child: ${ child }` );
      assert( !this.hasChild( child ), 'cannot add child that is already a child.' );
      assert( child !== this, 'cannot add self as a child' );
      assert( !child._isDisposed, 'Tried to add a disposed DOMObject' );

      this._children.push( child );
      child._parent = this;
      this._element.appendChild( child.element );
      return this;
    }

    /**
     * Rewrites the children of the DOMObject to be the passed-in array of DOMObjects.
     * @public
     *
     * @param {DOMObject[]} children
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setChildren( children ) {
      assert( Array.isArray( children ) && children.every( child => child instanceof DOMObject ),
        `invalid children: ${ children }` );
      if ( children.length === this._children.length &&
        children.every( ( child, index ) => this._children[ index ] === child ) ) return this; // Same children array

      this.removeAllChildren();
      children.forEach( child => this.addChild( child ) );
      return this;
    }
    set children( children ) { this.setChildren( children ); }

    /**
     * Removes a child DOMObject from our list of children. Will fail an assertion if the Object is not currently one of
     * our children.
     * @public
     *
     * @param {DOMObject} child
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    removeChild( child ) {
      assert( this.hasChild( child ), 'Attempted to removeChild with a DOMObject that was not a child.' );

      Util.arrayRemove( this.children, child );
      this._element.removeChild( child.element );
      child._parent = null;
      return this;
    }

    /**
     * Removes all children from this DOMObject.
     * @public
     *
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    removeAllChildren() {
      [ ...this._children ].forEach( this.removeChild.bind( this ) );
      return this;
    }

    /**
     * Returns whether a DOMObject is a child of this.
     * @public
     *
     * @param {DOMObject} potentialChild
     * @returns {boolean} - Whether potentialChild is actually our child.
     */
    hasChild( potentialChild ) {
      assert( potentialChild instanceof DOMObject, `invalid potentialChild: ${ potentialChild }` );
      return this._children.includes( potentialChild ) && potentialChild.parent === this;
    }

    /**
     * Moves a child DOMObject to a provided index and adjusts the rest of our children list. Index must be less than
     * the number of children that this DOMObject has.
     * @public
     *
     * @param {DOMObject} child - the child DOMObject to move
     * @param {number} index - the desired index (into the children array) of the child.
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    moveChildToIndex( child, index ) {
      assert( this.hasChild( child ), `invalid child: ${ child }` );
      assert( typeof index === 'number' && index % 1 === 0 && index >= 0 && index < this._children.length,
        `invalid index: ${ index }` );

      if ( this._children[ index ] !== child ) {
        // Use element.insertBefore. See https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
        const referenceNode = index < this._children.length - 1 ? this._children[ index ].element : null;
        this.element.insertBefore( child.element, referenceNode );
        Util.arrayRemove( this._children, child );
        this._children.splice( index, 0, child ); // inserts child at index
      }
      return this;
    }

    /**
     * Moves this DOMObject to the front of the view-port by moving it to the end of its parent's children array.
     * @public
     *
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    moveToFront() {
      if ( this._parent ) {
        return this._parent.moveChildToIndex( this, this._parent.children.length - 1 );
      }
    }

    /**
     * Moves this DOMObject to the back of the view-port by moving it to the start of its parent's children array.
     * @public
     *
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    moveToBack() {
      if ( this._parent ) {
        return this._parent.moveChildToIndex( this, 0 );
      }
    }

    /**
     * Adds onto this DOMObject's CSS style. See DOMObject.addElementStyles for more documentation.
     * @public
     *
     * Styles that aren't apart of the element's CSS style object will cause an error.
     *
     * @param {Object} style - object literal that describes the styles to override for the element
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    addStyles( style ) {
      assert( Object.getPrototypeOf( style ) === Object.prototype, `invalid style object: ${ style }` );

      DOMObject.addElementStyles( this._element, style );
      return this;
    }

    /**
     * Adds onto this DOMObject's attributes. For context, see:
     *  - https://www.w3schools.com/jsref/dom_obj_attributes.asp
     *  - https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
     * @public
     *
     * @param {Object} style - object literal that describes the attributes. All keys are valid.
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    addAttributes( attributes ) {
      assert( !attributes || Object.getPrototypeOf( attributes ) === Object.prototype,
        `invalid attributes object: ${ attributes }` );
      // Loop through each key of the attributes Object literal and add the attribute.
      Object.keys( attributes ).forEach( attribute => {
        this.setAttribute( attribute, attributes[ attribute ] );
      } );
      return this;
    }

    /**
     * Disposes the DOMObject, releasing all references that it maintained.
     * @public
     *
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    dispose() {
      this._isDisposed = true;

      this.removeAllChildren();
      this._parent && this._parent.removeChild( this );
      return this;
    }

    /*----------------------------------------------------------------------------*
     * Static Constants
     *----------------------------------------------------------------------------*/
    /**
     * Static method that adds onto an HTMLElement's CSS style, with additional browser-support. For context, see:
     *  - https://www.w3schools.com/js/js_htmldom_css.asp
     *  - https://www.w3schools.com/jsref/dom_obj_style.asp
     *  - https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
     * @public
     *
     * @param {HTMLElement} element
     * @param {Object} style - object literal that describes the styles to override for the element.
     */
    static addElementStyles( element, style ) {
      assert( element instanceof Element || element instanceof HTMLElement, `invalid element: ${ element }` );
      assert( Object.getPrototypeOf( style ) === Object.prototype, `invalid style object: ${ style }` );

      // convenience functions
      const contains = styleKey => element.style[ styleKey ] !== undefined;
      const setStyle = ( name, key ) => { element.style[ name ] = style[ key ]; };

      // Loop through each key of the style Object literal and add the style.
      Object.keys( style ).forEach( styleKey => {
        const camelStyleKey = styleKey.charAt( 0 ).toUpperCase() + styleKey.slice( 1 );

        if ( contains( styleKey ) ) setStyle( styleKey, styleKey );
        else if ( contains( `moz${ camelStyleKey }` ) ) setStyle( `moz${ camelStyleKey }`, styleKey );
        else if ( contains( `Moz${ camelStyleKey }` ) ) setStyle( `Moz${ camelStyleKey }`, styleKey );
        else if ( contains( `MozOsx${ camelStyleKey }` ) ) setStyle( `MozOsx${ camelStyleKey }`, styleKey );
        else if ( contains( `webkit${ camelStyleKey }` ) ) setStyle( `webkit${ camelStyleKey }`, styleKey );
        else if ( contains( `ms${ camelStyleKey }` ) ) setStyle( `ms${ camelStyleKey }`, styleKey );
        else if ( contains( `o${ camelStyleKey }` ) ) setStyle( `o${ camelStyleKey }`, styleKey );
      } );
    }
  }

  /*----------------------------------------------------------------------------*
   * Static Constants
   *----------------------------------------------------------------------------*/

  // @public (read-only) {string[]} - array of SVG-specific DOMObject element types.
  DOMObject.SVG_TYPES = [ 'svg',
    'g',
    'rect',
    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'text',
    'image',
    'defs',
    'stop',
    'radialGradient',
    'linearGradient' ];

  // @public (read-only) {string} - the namespace used in `document.createElementNS()` for SVG element types. See
  //                                https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS.
  DOMObject.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

  return DOMObject;
} );