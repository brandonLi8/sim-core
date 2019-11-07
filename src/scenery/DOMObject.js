// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A Javascript DOM Object for rendering a scene graph.
 * Supports DOM, Canvas, SVG, WebGL, etc. Rendering is handled by the browser.
 *
 * ## General Description:
 *
 *  - For the Document Object Model of HTML5, the display is determined by a tree (called the scene graph). DOM objects
 *    represent a visual object and are linked together in a hierarchal tree.
 *
 *  - DOM objects are only displayed in the browser if their 'parent' is displayed. At the top of the tree, there is a
 *    root object that doesn't have a parent but is displayed, allowing everything else to be displayed.
 *
 *    While code comments attempt to describe this implementation clearly, fully understanding the implementation may
 *    require some general background in collisions detection and response. Some useful references include:
 *      - https://www.w3schools.com/js/js_htmldom.asp
 *      - https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
 *      - https://en.wikipedia.org/wiki/Document_Object_Model
 *
 * ## Usage
 *  - In sim-specific code, DOM objects ** should rarely ** be instantiated.
 *    Instead, create a new Sim and its ScreenViews and use Nodes (see ./Node.js) for structuring the scene graph.
 *    Node will a much cleaner sim-specific API where as DOMObject is directly modifying the DOM.
 *
 *  - DOMObject and its subtypes generally have the last constructor parameter reserved for the 'options' object.
 *    key-value map that specifies relevant options that can be overridden that are used by DOMObject and subtypes.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const merge = require( 'SIM_CORE/util/merge' );

  class DOMObject {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Sub classes
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( options ) {

      assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${ options }` );

      options = merge( {
        //----------------------------------------------------------------------------------------
        // Defaults

        // {string} - the object type, 'div', 'img', 'a', 'path', etc.
        type: 'div',

        // {string} - a namespace URI (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS)
        //            If not provided (or null), `document.createElement()` will be used.
        //            Otherwise, `document.createElementNS( options.namespace )` will be used (usually for svg).
        nameSpace: null,

        // {object} - object that describes its css style. See https://www.w3schools.com/js/js_htmldom_css.asp
        //            Uses normal css key-value pairs.
        style: {
          left: 0,
          top: 0,
          padding: 0,
          margin: 0
        },

        // Attributes
        id: null,         // {string} - if provided, a css id attribute for the object
        class: null,      // {string} - if provided, a css className attribute for the object
        text: null,       // {string} - if provided, a text string that the object displays.
        innerHTML: null,  // {string} - if provided, innerHTML: https://www.w3schools.com/jsref/prop_html_innerhtml.asp
        src: null,        // {string} - if provided, a image's 'src' attribute. ONLY used if options.type is 'img'
        href: null,       // {string} - if provided, a link's url 'src' attribute. ONLY used if options.type is 'a'

        // {object} - object that describes the any other DOMobject attributes that aren't already described above.
        //            See https://www.w3schools.com/jsref/dom_obj_attributes.asp
        attributes: null

      }, options /* recursively override */ );

    }
  }

  return DOMObject;
} );