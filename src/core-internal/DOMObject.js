// Copyright © 2019 Brandon Li. All rights reserved.

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
 *    the scene graph, there is a root object that is displayed, allowing everything else to be displayed.
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
 *    Instead, create a new Sim and its ScreenViews and use Nodes (see ./Node.js) for structuring the scene graph.
 *    Node (a subtype) will provide a much cleaner sim-specific API compared to DOMObject.
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

  class DOMObject {

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

        // {string} - the DOM object type: 'div', 'img', 'a', 'path', 'svg', etc.
        type: 'div',

        // {string} - a namespace URI - see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS.
        //            If not provided (or null), `document.createElement()` will be used.
        //            Otherwise, `document.createElementNS( options.namespace )` will be used (usually for svg).
        namespace: null,

        // {Object} - object literal that describes its CSS style. See `addStyle()` for full documentation.
        style: {
          left: 0,
          padding: 0,
          margin: 0,
          boxSizing: 'border-box',
          position: 'relative'
        },

        // {string|null} - if not null, adds a text string that the object displays. See `setText()` for documentation.
        text: null,

        // {string|null} - if provided, adds innerHTML. See `setInnerHTML()` for documentation and context.
        innerHTML: null,

        // {DOMObject[]} - ordered array of the children of the DOM object. See `setChildren()` for documentation.
        children: [],

        //----------------------------------------------------------------------------------------
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
      this._innerHTML = options.innerHTML;
      this._children = [];

      // @private {boolean} - indicates if this DOMObject has been disposed. See `dispose()`.
      this._isDisposed = false;

      if ( !options.namespace ) {
        // @private {HTMLElement} (final) - the actual DOM object. See `getElement()` for read access.
        this._element = document.createElement( this._type );
      }
      else {
        assert( typeof options.namespace === 'string', `invalid namespace: ${ options.namespace }` );
        this._element = document.createElementNS( options.namespace, this._type );
      }

      // @private {HTMLTextNode} (final) - the text node of the DOM object.
      this._textNode = document.createTextNode( this._text || '' );
      this._element.appendChild( this._textNode );

      // @protected {DOMObject|null} - the parent of this DOMObject
      this._parent = null;

      // Set the attributes and styles if provided in options, which validates the options
      options.attributes && this.addAttributes( options.attributes );
      options.style && this.addStyle( options.style );

      //----------------------------------------------------------------------------------------
      this.setID( this._id );                // validates options.id and sets the id.
      this.setClass( this._class );          // validates options.class and sets the class.
      this.setText( this._text );            // validates options.text and sets the text.
      this.setSrc( this._src );              // validates options.src and sets the src only if this._type is a image.
      this.setHref( this._href );            // validates options.href and sets the href only if this._type is a link.
      this._innerHTML && this.setInnerHTML( this._innerHTML );  // validates options.innerHTML and sets the inner HTML.
      this.setChildren( options.children );  // validates options.children and sets the children.
    }

    //========================================================================================
    // Accessors
    //========================================================================================

    /**
     * Accessors and ES5 getters of a private property of this DOM object.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    getElement() { return this._element; }
    getType() { return this._type; }
    getID() { return this._id; }
    getClass() { return this._class; }
    getText() { return this._text; }
    getSrc() { return this._src; }
    getHref() { return this._href; }
    getInnerHTML() { return this._innerHTML; }
    getChildren() { return this._children; }
    getParent() { return this._parent; }

    get element() { return this.getElement(); }
    get type() { return this.getType(); }
    get id() { return this.getID(); }
    get class() { return this.getClass(); }
    get text() { return this.getText(); }
    get src() { return this.getSrc(); }
    get href() { return this.getHref(); }
    get innerHTML() { return this.getInnerHTML(); }
    get children() { return this.getChildren(); }
    get parent() { return this.getParent(); }
    get isDisposed() { return this._isDisposed; }

    /**
     * Gets the reference to the CSS Style Declaration Object literal. Modifying this object
     * WILL affect this DOM object. See `addStyle()` for further documentation on this Object.
     * @public
     *
     * @returns {CSSStyleDeclaration}
     */
    getStyle() { return this._element.style; }
    get style() { return this.getStyle(); }

    /**
     * Gets a attribute based on its name.
     *
     * @param {string} attribute
     * @returns {*}
     */
    getAttribute( attribute ) {
      const attributeContainer = this._element.attributes.getNamedItem( attribute );
      return attributeContainer ? attributeContainer.value : null;
    }

    //========================================================================================
    // Mutators
    //========================================================================================

    /**
     * Sets an attribute of this DOMObject, updating this object's properties.
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
     * Sets the id attribute of this DOMObject. DOMObjects can only have one class at a time.
     *
     * @param {string|null} id - null means no id
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setID( id ) { return this.setAttribute( 'id', id ); }
    set id( id ) { this.setID( id ); }

    /**
     * Sets the class attribute of this DOMObject. Can have multiple classes; just pass in a string with a space
     * separating the classes (e.g, setClass( 'class1 class2' )).
     *
     * @param {string|null} class - null means no class
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setClass( className ) { return this.setAttribute( 'class', className ); }
    set class( className ) { this.setClass( className ); }

    /**
     * Sets the 'src' attribute of this DOM object. Errors if this objects type isn't 'img'.
     *
     * @param {string} src
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setSrc( src ) { return this.setAttribute( 'src', src ); }
    set src( src ) { this.setSrc( src ); }

    /**
     * Sets the 'href' attribute of this DOM object. Errors if this objects type isn't 'a'.
     *
     * @param {string} href
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setHref( href ) { return this.setAttribute( 'href', href ); }
    set href( href ) { this.setHref( href ); }

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
     * Sets the innerHTML (which isn't an attribute) of this DOM object. For background, see:
     *  - https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
     *  - See https://www.w3schools.com/jsref/prop_html_innerhtml.asp
     * @public
     *
     * @param {string|null} innerHTML - if null, the innerHTML is set to nothing
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setInnerHTML( innerHTML ) {
      assert( !innerHTML || typeof innerHTML === 'string', `invalid innerHTML: ${ innerHTML }` );
      this._innerHTML = innerHTML;
      this._element.innerHTML = innerHTML;
      return this;
    }
    set innerHTML( innerHTML ) { this.setInnerHTML( innerHTML ); }

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

      this.removeAllChildren();
      this._children = children;
      children.forEach( child => this.addChild( child ) );
      return this;
    }

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

      this._children.splice( this._children.indexOf( child ), 1 );
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
      this._children.forEach( child => this.removeChild( child ) );
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
     * Adds onto this DOMObject's CSS style. For context, see:
     *  - https://www.w3schools.com/js/js_htmldom_css.asp
     *  - https://www.w3schools.com/jsref/dom_obj_style.asp
     *  - https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
     * @public
     *
     * Styles that aren't apart of the element's CSS style object will cause an error.
     *
     * @param {Object} style - object literal that describes the styles to override for the element
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    addStyle( style ) {
      assert( !style || Object.getPrototypeOf( style ) === Object.prototype, `invalid style object: ${ style }` );
      // convenience references
      const contains = styleKey => Object.prototype.hasOwnProperty.call( this._element.style, styleKey );
      const setStyle = ( name, key ) => { this._element.style[ name ] = style[ key ]; };

      // Loop through each key of the style Object literal and add the style.
      Object.keys( style ).forEach( styleKey => {
        const camelStyleKey = styleKey.charAt( 0 ).toUpperCase() + styleKey.slice( 1 );

        if ( contains( styleKey ) ) setStyle( styleKey, styleKey );
        else if ( contains( `moz${ camelStyleKey }` ) ) setStyle( `moz${ camelStyleKey }`, styleKey );
        else if ( contains( `Moz${ camelStyleKey }` ) ) setStyle( `Moz${ camelStyleKey }`, styleKey );
        else if ( contains( `webkit${ camelStyleKey }` ) ) setStyle( `webkit${ camelStyleKey }`, styleKey );
        else if ( contains( `ms${ camelStyleKey }` ) ) setStyle( `ms${ camelStyleKey }`, styleKey );
        else if ( contains( `o${ camelStyleKey }` ) ) setStyle( `o${ camelStyleKey }`, styleKey );
        else { assert( false, `invalid styleKey: ${ styleKey }` ); }

      } );
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
  }

  return DOMObject;
} );