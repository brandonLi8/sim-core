// Copyright © 2019-2020 Brandon Li. All rights reserved.

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
  const AlignBox = require( 'SIM_CORE/scenery/AlignBox' );
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const FlexBox = require( 'SIM_CORE/scenery/FlexBox' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Range = require( 'SIM_CORE/util/Range' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Symbols = require( 'SIM_CORE/util/Symbols' );
  const Text = require( 'SIM_CORE/scenery/Text' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

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

        subScale: 0.75,  // {number} - Sets the scale of any subscript elements
        subXSpacing: 0,  // {number} - Sets horizontal spacing before any subscript elements
        subYOffset: 0,   // {number} - Sets vertical offset for any subscript elements
        supScale: 0.75,  // {number} - Sets the scale for any superscript elements
        supXSpacing: 0,  // {number} - Sets the horizontal offset before any superscript elements
        supYOffset: 0,   // {number} - Sets the vertical offset for any superscript elements


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

      // Initialize our RichText sub-tree
      this._buildRichText();

      // Apply any additional Bounds mutators
      this.mutate( options );
    }

    /**
     * Builds the Rich Text sub-scene graph.
     * @private
     */
    _buildRichText() {
      RichText.testElement.element.innerHTML = this._richText;

      // Reset our containers.
      this._textContainer.removeAllChildren();
      this._subContainer.removeAllChildren();
      this._supContainer.removeAllChildren();

      // https://stackoverflow.com/questions/22754315/for-loop-for-htmlcollection-elements
      assert.enabled && Array.prototype.forEach.call( RichText.testElement.element.getElementsByTagName( '*' ), element => {

        // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
        assert( [ 'SUB', 'SUP' ].includes( element.nodeName ), `unrecognized RichText tag: ${ element.nodeName }` );
      } );

      let nextTextLeftLocation = 0;
      RichText.testElement.element.childNodes.forEach( element => {
        const text = new Text( element.textContent, this._textOptions );

        if ( element.nodeName === 'SUB' ) {
          text.scale( this._subScale );
          text.left = nextTextLeftLocation + this._subXSpacing;
          this._subContainer.addChild( text );
        }
        else if ( element.nodeName === 'SUP' ) {
          text.scale( this._supScale );
          text.left = nextTextLeftLocation + this._supXSpacing;
          this._supContainer.addChild( text );
        }
        else {
          text.left = nextTextLeftLocation;
          this._textContainer.addChild( text );
        }
        nextTextLeftLocation = text.right;
      } );

      // Position containers
      this._supContainer.top = 0;
      this._textContainer.centerY = this._supContainer.centerY + this._supYOffset;
      this._subContainer.top = this._textContainer.centerY + this._subYOffset;
    }
  }

  // @private {DOMObject} - Test DOMObject element, used to parse html into RichText.
  RichText.testElement = new DOMObject();

  return RichText;
} );