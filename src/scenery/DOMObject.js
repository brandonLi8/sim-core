// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Javascript version of the traditional HTML DOM Object, for rendering a scene graph.
 * Supports DOM, Canvas, SVG, WebGL, etc. Rendering is handled by the browser.
 *
 * ## General Description:
 *  - For the DOM, the display represents a tree (called the scene graph). DOM objects represent a single visual object
 *    and are linked together in a hierarchal tree, which determines the 'order' of rendering.
 *
 *  - DOM objects are only displayed in the browser if their 'parent' (the DOM object that links to it) is displayed.
 *    In other words, if a DOMObject is displayed, its 'children' (what it links to) are also displayed. At the top of
 *    the scene graph, there is a root object that doesn't have a parent but is displayed,
 *    allowing everything else to be displayed.
 *
 *  - While code comments attempt to describe the implementation clearly, fully understanding it may require some
 *    general background. Some useful references include:
 *      - https://www.w3schools.com/js/js_htmldom.asp
 *      - https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
 *      - https://en.wikipedia.org/wiki/Document_Object_Model
 *
 * ## Usage:
 *  - In sim-specific code, DOM objects should RARELY be instantiated.
 *    Instead, create a new Sim and its ScreenViews and use Nodes (see ./Node.js) for structuring the scene graph.
 *    Node (a subtype) will provide a much cleaner sim-specific API compared to DOMObject.
 *
 *  - DOMObject and its subtypes generally have the last constructor parameter reserved for the 'options' object - a
 *    key-value map that specifies relevant options that can be overridden.
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

      const defaults = {

        // {string} - the object type, 'div', 'img', 'a', 'path', etc.
        type: 'div',

        // {string} - a namespace URI (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS)
        //            If not provided (or null), `document.createElement()` will be used.
        //            Otherwise, `document.createElementNS( options.namespace )` will be used (usually for svg).
        nameSpace: null,

        // {object} - object literal that describes its css style. See `pushStyle()` for full documentation.
        style: {
          left: 0,
          top: 0,
          padding: 0,
          margin: 0
        },

        // {string|null} - if provided, adds a text string that the object displays. See `setText()` for documentation.
        text: null,

        // {string|null} - if provided, adds inner html. See https://www.w3schools.com/jsref/prop_html_innerhtml.asp.
        //                 See `setInnerHTML()` for further documentation.
        innerHTML: null,

        children: [], // {DOMObject[]} - ordered array of the children of the DOM object. See `setChildren()`.

        // Attributes
        id: null,     // {string|null} adds the id attribute for the object. See `setID()` for documentation.
        class: null,  // {string|null} adds the class name attribute for the object. See `setClass()` for documentation.
        src: null,    // {string|null} adds a image's 'src' attribute. ONLY used if options.type is 'img'.
        href: null,   // {string|null} adds a link's url 'src' attribute. ONLY used if options.type is 'a'.

        // {object} - object literal that describes the any other attributes that aren't already described above.
        //            See `pushAttributes()` for more context
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


      // @private {HTMLElement} (final) - the actual DOM object. See `getElement()` for read access.
      this._element = document.createElement( this._type );

      // @private {HTMLTestNode} (final) - the text node of the DOM object.
      this._textNode = document.createTextNode( this._text || '' );
      this._element.appendChild( this._textNode );

      // Set the attributes/styles provided in options
      options.attributes && this.pushAttributes( options.attributes ); // validates options.attributes
      options.style && this.pushStyle( options.style ); // validates options.attributes

      //----------------------------------------------------------------------------------------
      this.setID( this._id );                // validates options.id and sets the id.
      this.setClass( this._class );          // validates options.class and sets the class.
      this.setText( this._text );            // validates options.text and sets the text.
      this.setSrc( this._src );              // validates options.src and sets the src only if this._type is a image.
      this.setHref( this._href );            // validates options.href and sets the href only if this._type is a link.
      this.setInnerHTML( this._innerHTML );  // validates options.innerHTML and sets the inner HTML.
      this.setChildren( this._children );    // validates options.children and sets the children.
    }

    //========================================================================================
    // Accessors
    //========================================================================================

    /**
     * Accessors and ES5 getters of a property of this DOM object.
     * @public
     *
     * @returns {*} See the attribute declaration for documentation of the type.
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
    get element() { return this.getElement(); }
    get type() { return this.getType(); }
    get id() { return this.getID(); }
    get class() { return this.getClass(); }
    get text() { return this.getText(); }
    get src() { return this.getSrc(); }
    get href() { return this.getHref(); }
    get innerHTML() { return this.getInnerHTML(); }
    get children() { return this.getChildren(); }

    /**
     * Gets the reference to the CSS Style Declaration Object literal. Modifying this object
     * WILL affect this DOM object.
     * @public
     *
     * @returns {CSSStyleDeclaration}
     */
    getStyle() {
      return this._element.style;
    }
    get style() { return this.getStyle(); }

    /**
     * Gets a attribute based on its name.
     *
     * @param {string} attribute
     * @returns {*}
     */
    getAttribute( attribute ) {
      const attributes = this._element.attributes;

      const attributeObject = attributes.getNamedItem( attribute );
      return attributeObject ? attributeObject.value : null;
    }

    //========================================================================================
    // Mutators
    //========================================================================================

    setType() { return this._type; }
    setID() { return this._id; }
    setClass() { return this._class; }
    setText() { return this._text; }
    setSrc() { return this._src; }
    setHref() { return this._href; }
    setInnerHTML() { return this._innerHTML; }
    setChildren() { return this._children; }
  }


  // setText(), setInnerHTML() pushStyle() setID() setClass

// css
//  See https://www.w3schools.com/js/js_htmldom_css.asp
        //            and https://www.w3schools.com/jsref/dom_obj_style.asp. Overrides recursively.


// pushAttributes
//https://www.w3schools.com/jsref/dom_obj_attributes.asp
  return DOMObject;
} );