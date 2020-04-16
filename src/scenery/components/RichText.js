// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * RichText is similar to Text but interprets the input text as HTML, supporting some in-line tags. It does this by
 * parsing the input HTML and splitting it into multiple Text children recursively.
 *
 * Currently, RichText supports:
 *   - <sub></sub> for subscripts. E.g. new RichText( 'A<sub>c</sub>' );
 *   - <sup></sup> for superscripts. E.g. new RichText( '5<sup>2</sup>' );
 *
 * There are plans to increase the functionality of RichText in the future.
 *
 * NOTE: Encoding HTML entities is required, and malformed HTML is not accepted.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Text = require( 'SIM_CORE/scenery/Text' );

  class RichText extends Node {

    /**
     * @param {string|number} text - The initial text to display. May use empty string if needed.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     */
    constructor( text, options ) {
      assert( typeof text === 'number' || typeof text === 'string', `invalid text: ${ text }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {Object} - if provided, these options will be passed to Text instances
        textOptions: null,

        subScale: 0.69,  // {number} - Sets the scale of any subscript elements
        subXSpacing: 0,  // {number} - Sets horizontal spacing before any subscript elements
        subYOffset: 6,   // {number} - Sets vertical offset for any subscript elements
        supScale: 0.69,  // {number} - Sets the scale for any superscript elements
        supXSpacing: 0,  // {number} - Sets the horizontal offset before any superscript elements
        supYOffset: 1,   // {number} - Sets the vertical offset for any superscript elements


        // Rewrite options so that it overrides the defaults.
        ...options
      };
      super( options );

      //----------------------------------------------------------------------------------------

      // @private {*} - Reference options. See options declaration for documentation.
      this._textOptions = options.textOptions;
      this._subScale = options.subScale;
      this._subXSpacing = options.subXSpacing;
      this._subYOffset = options.subYOffset;
      this._supScale = options.supScale;
      this._supXSpacing = options.supXSpacing;
      this._supYOffset = options.supYOffset;

      // @private {string} - reference our rich text
      this._richText = text;

      // @private {Node} - containers of our RichText lines
      this._textContainer = new Node();
      this._subContainer = new Node();
      this._supContainer = new Node();
      this.children = [ this._textContainer, this._subContainer, this._supContainer ];

      // @private {number} - flag of where to position our next in-line Text Node relative to the last Node.
      this._nextTextPosition = 0;

      // Initialize our RichText sub-tree
      this._buildRichText();

      // Apply any additional Bounds mutators
      this.mutate( options );
    }

    /**
     * @override
     * Sets the html displayed by the RichText.
     * @public
     *
     * @param {string|null} text - if null, nothing is displayed
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setText( text ) {
      if ( text === this._richText ) return; // exit if setting to the same text
      this._buildRichText();
    }

    /**
     * Builds the Rich Text sub-scene graph. This is the main recursive function for constructing the RichText Node
     * sub-tree. Normally called when our rich text changes.
     * @private
     *
     * This parsing our rich text HTML and splits it into multiple Text children.
     * NOTE: this method executes a recursive function, and may incur some performance loss.
     */
    _buildRichText() {
      // Set our testElement's innerHTML to parse our rich Text into in-line components.
      RichText.testElement.element.innerHTML = this._richText;

      // Reset our containers.
      this._textContainer.removeAllChildren();
      this._subContainer.removeAllChildren();
      this._supContainer.removeAllChildren();

      // Bail early if the richText is empty.
      if ( !this._richText ) return;

      // Function that appends each child (with this._appendElement) of a children array and recurses down the tree.
      const appendChildren = children => {
        children.forEach( child => {
          this._appendElement( child ); // Append the child first

          // If the child is a element (not a text element), recurse this function down its sub-tree. Use
          // element.children to NOT include text nodes. See
          // https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes.
          if ( child.nodeType === 1 ) appendChildren( [ ...child.children ] );
        } );
      };

      // Call AppendChildren of the RichText testElement. Use element.childNodes, which includes Text Nodes.
      appendChildren( RichText.testElement.element.childNodes );

      // Position our containers
      this._supContainer.centerY = this._textContainer.centerY - this._supYOffset;
      this._subContainer.centerY = this._textContainer.centerY + this._subYOffset;
    }

    /**
     * Appends a in-line HTMLElement, which is either a <sub>, <sup>, or #text element, to one of our RichText children
     * containers.
     * @private
     *
     * This is called on each recursive in-line element in each buildRichText() call.
     *
     * @param {HTMLElement} element - the in-line element of the Rich Text
     */
    _appendElement( element ) {

      // Create the Text Node to be added to our RichText children containers
      const inlineText = new Text( element.firstChild ?
                                   element.firstChild.textContent :
                                   element.textContent, this._textOptions );

      // Get the element type with element.nodeName. See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
      const type = element.nodeName.toLowerCase();

      // Subscript
      if ( type === 'sub' ) {
        inlineText.scale( this._subScale );
        inlineText.left = this._nextTextPosition + this._subXSpacing;
        this._subContainer.addChild( inlineText );
      }
      // Superscript
      else if ( type === 'sup' ) {
        inlineText.scale( this._supScale );
        inlineText.left = this._nextTextPosition + this._supXSpacing;
        this._supContainer.addChild( inlineText );
      }
      // Plain Text
      else {
        assert( type === '#text', `unrecognized RichText inline tag: ${ type }` );
        inlineText.left = this._nextTextPosition;
        this._textContainer.addChild( inlineText );
      }
      // Update our nextTextPosition flag.
      this._nextTextPosition = inlineText.right;
    }
  }

  // @private {DOMObject} - Test DOMObject element, used to parse html into RichText.
  RichText.testElement = new DOMObject();

  return RichText;
} );