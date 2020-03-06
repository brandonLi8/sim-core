// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Text Node that displays text in different fonts, sizes, weights, colors, etc, for scenery.
 *
 * Unlike other Node subtypes, Text will need to approximate its bounds based of the font and the text that is
 * displayed (see Text._approximateTextBounds()). However, this does not guarantee that all text-content is inside of
 * the returned bounds.
 *
 * While code comments attempt to describe the implementation clearly, fully understanding it may require some
 * general background. Some useful references include:
 *    - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
 *    - http://www.w3.org/TR/css3-fonts/
 *    - https://www.w3.org/TR/css-fonts-3/#propdef-font
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const DOMObject = require( 'SIM_CORE/core-internal/DOMObject' );
  const Node = require( 'SIM_CORE/scenery/Node' );

  class Text extends Node {

    /**
     * @param {string|number} text - The initial text to display. May use empty string if needed.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     */
    constructor( text, options ) {
      assert( text && ( typeof text === 'number' || typeof text === 'string' ), `invalid text: ${ text }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( !options || !options.attributes, 'Text sets attributes' );
      assert( !options || !options.width, 'Text sets width' );
      assert( !options || !options.height, 'Text sets height' );
      assert( !options || !options.type, 'Text sets type' );
      assert( !options || !options.text, 'Text should be provided in the first argument' );

      options = {
        type: 'text', // Set the type to a text element. Cannot be overridden.

        fontStyle: 'normal',    // {string} - the font-style of the Text. See `set fontStyle()`.
        fontWeight: 'normal',   // {string|number} - the font-weight of the Text. See `set fontWeight()`.
        fontSize: 12,           // {number} - the font-size of the Text. See `set fontSize()`.
        fontFamily: 'Arial',    // {string} - the css font-family of the Text. See `set fontFamily()`.
        fill: '#000000',        // {string} - Sets the fill color of the Text. See `set fill()`.
        stroke: null,           // {string} - Sets the stroke color of the Text. See `set stroke()`.
        strokeWidth: 0,         // {number} - Sets the stroke width of this Text. See `set strokeWidth()`.
        textRendering: 'auto',  // {string} - Sets the shape-rendering method of this Text. See `set textRendering()`.

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      super( options );

      // @private {*} - see options declaration for documentation. Contains getters and setters. Set to null for now and
      //                to be set in the mutate() call in Text's constructor.
      this._fontStyle;
      this._fontWeight;
      this._fontSize;
      this._fontFamily;
      this._fill;
      this._stroke;
      this._strokeWidth;
      this._textRendering;

      // At this point, set the text option and call mutate again to ensure correct ordering of mutator keys.
      options.text = text;
      this.mutate( options );
    }

    /**
     * ES5 getters of properties specific to Text. Traditional Accessors methods aren't included to reduce the memory
     * footprint.
     * @public
     *
     * @returns {*} See the property declaration for documentation of the type.
     */
    get fontStyle() { return this._fontStyle; }
    get fontWeight() { return this._fontWeight; }
    get fontSize() { return this._fontSize; }
    get fontFamily() { return this._fontFamily; }
    get fill() { return this._fill; }
    get stroke() { return this._stroke; }
    get strokeWidth() { return this._strokeWidth; }
    get textRendering() { return this._textRendering; }
    get text() { return this._text; }

    //----------------------------------------------------------------------------------------

    /**
     * @override
     * Sets the text displayed of the Text Node. NOTE: setting the text will change the width of the Text. Changing the
     * width keeps the minX the same but expands/contracts the right border See `Node.set width()` for documentation.
     * @public
     *
     * @param {string|null} text - if null, nothing is displayed
     * @returns {DOMObject} - Returns 'this' reference, for chaining
     */
    setText( text ) {
      super.setText( text );
      this._updateTextBounds();
    }
    set text( text ) { this.setText( text ); }

    /**
     * Sets the font-style of the Text. See https://www.w3schools.com/cssref/pr_font_font-style.asp.
     * @public
     *
     * @param {string} fontStyle - 'normal', 'italic' or 'oblique'
     */
    set fontStyle( fontStyle ) {
      if ( fontStyle === this._fontStyle ) return; // Exit if setting to the same 'fontStyle'
      assert( [ 'normal', 'italic', 'oblique' ].includes( fontStyle ), `invalid fontStyle: ${ fontStyle }` );
      this._fontStyle = fontStyle;
      this._updateTextBounds();
      this.layout( this._screenViewScale );
    }

    /**
     * Sets the font-weight of the Text. See https://www.w3schools.com/cssref/pr_font_weight.asp
     * @public
     *
     * @param {number|string} fontWeight - 'normal', 'bold', 'bolder', 'lighter', 100, 200, 300, 400, ..., 800, or 900
     */
    set fontWeight( fontWeight ) {
      if ( fontWeight === this._fontWeight) return; // Exit if setting to the same 'fontWeight'
      assert( typeof fontWeight === 'number' ? ( fontWeight <= 900 && fontWeight >= 100 && fontWeight % 100 === 0 ) :
              [ 'normal', 'bold', 'bolder', 'lighter' ].includes( fontWeight ), `invalid fontWeight: ${ fontWeight }` );
      this._fontWeight = fontWeight;
      this._updateTextBounds();
      this.layout( this._screenViewScale );
    }

    /**
     * Sets the font-size of the Text, in scenery coordinates.
     * @public
     *
     * @param {number} fontSize
     */
    set fontSize( fontSize ) {
      if ( fontSize === this._fontSize ) return; // Exit if setting to the same 'fontSize'
      assert( typeof fontSize === 'number', `invalid fontSize: ${ fontSize }` );
      this._fontSize = fontSize;
      this._updateTextBounds();
      this.layout( this._screenViewScale );
    }

    /**
     * Sets the font-family of the Text. See https://www.w3schools.com/cssref/pr_font_font-family.asp.
     * @public
     *
     * @param {string} fontFamily - A comma-separated list of font families, such as 'Times, Arial'
     */
    set fontFamily( fontFamily ) {
      if ( fontFamily === this._fontFamily ) return; // Exit if setting to the same 'fontFamily'
      assert( typeof fontFamily === 'string', `invalid fontFamily: ${ fontFamily }` );
      this._fontFamily = fontFamily;
      this._updateTextBounds();
      this.layout( this._screenViewScale );
    }

    /**
     * Sets the inner-fill color of the Text. See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill.
     * @public
     *
     * @param {string|null} fill
     */
    set fill( fill ) {
      if ( fill === this._fill ) return; // Exit if setting to the same 'fill'
      assert( !fill || typeof fill === 'string', `invalid fill: ${ fill }` );
      this._fill = fill;
      this.element.setAttribute( 'fill', fill );
    }

    /**
     * Sets the outline stroke-color of the Text. See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke
     * @public
     *
     * @param {string|null} stroke
     */
    set stroke( stroke ) {
      if ( stroke === this._stroke ) return; // Exit if setting to the same 'stroke'
      assert( !stroke || typeof stroke === 'string', `invalid stroke: ${ stroke }` );
      this._stroke = stroke;
      this.element.setAttribute( 'stroke', stroke );
    }

    /**
     * Sets the outline stroke-width of the Text. See
     * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width.
     * @public
     *
     * @param {number} strokeWidth
     */
    set strokeWidth( strokeWidth ) {
      if ( strokeWidth === this._strokeWidth ) return; // Exit if setting to the same 'strokeWidth'
      assert( typeof strokeWidth === 'number', `invalid strokeWidth: ${ strokeWidth }` );
      this._strokeWidth = strokeWidth;
      this.element.setAttribute( 'stroke-width', strokeWidth );
    }

    /**
     * Sets the method of rendering of this Text. See
     * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-rendering.
     * @public
     *
     * @param {string} textRendering - must be 'auto' | 'optimizeSpeed' | 'optimizeLegibility' | 'geometricPrecision'
     */
    set textRendering( textRendering ) {
      if ( textRendering === this._textRendering ) return; // Exit if setting to the same 'textRendering'
      assert( [ 'auto', 'optimizeSpeed', 'optimizeLegibility', 'geometricPrecision' ].includes( textRendering ),
        `invalid textRendering: ${ textRendering }` );
      this._textRendering = textRendering;
      this.element.setAttribute( 'text-rendering', textRendering );
    }

    /**
     * Generates the combined CSS3 shorthand font string. See https://www.w3.org/TR/css-fonts-3/#propdef-font.
     * @private
     *
     * @returns {string}
     */
    _generateCSS3FontString() {
      let result = ''; // Create a flag for the final font string.

      // Prepend the style, weight, and stretch if non-normal.
      if ( this._fontStyle !== 'normal' ) { result += this._fontStyle + ' '; }
      if ( this._fontWeight !== 'normal' ) { result += this._fontWeight + ' '; }
      // Add the size and font family .
      result += this._fontSize * ( this._screenViewScale || 1 ) + 'px ' + this._fontFamily;
      return result;
    }

    _updateTextBounds() {
      // Update bounds.
      const textBoundingRect = Text._computeTextBoundingBox( this.text, this._generateCSS3FontString() );
      if ( !textBoundingRect ) return;
      this.width = textBoundingRect.width;
      this.height = textBoundingRect.height;
    }


    layout( scale ) {
      if ( !scale ) return; // Exit if no scale was provided.
      this.setAttribute( 'dominant-baseline', 'hanging' );

      super.layout( scale );

      this.style.font = this._generateCSS3FontString();

    }
 // * Different methods of approximations have been discussed here:
 // * https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript.
 // *
 // * For Text, both the width and the height are needed, so Canvas.measureText does not suffice. Through independent
 // * testing, I've found that using an SVG element with a text child is the most accurate of DOM-based solutions.
 // * Generally, there are two methods that get the bounds of SVG elements: getBBox() vs getBoundingClientRect().
 // * I've tested both of these methods and found that getBoundingClientRect() is by-far faster.
 // *
 // * Note that _computeTextBoundingBox( 1 ) returns the font in pixels. But since the scale is 1, the pixel amount will
 // * be in ScreenView scenery coordinates. Thus, the bounds of the text element will also be in scenery coordinates.
 // *
    static _computeTextBoundingBox( text, font ) {
      if ( !text ) return;
      if ( !Text.testSVGText ) {
        Text.testSVGTextParent = new DOMObject( {
          type: 'svg',
          style: {
            opacity: 0,
            id: 'test-text-size-element',
            whiteSpace: 'nowrap',
            position: 'absolute',
            left: '-65535px', // Ensure that it is not visible to the user.
            top: '-65535px'
          }
        } );
        Text.testSVGText = new DOMObject( { type: 'text', attributes: { 'text-rendering': 'geometricPrecision' } } );
        Text.testSVGTextParent.addChild( Text.testSVGText );
        document.body.appendChild( Text.testSVGTextParent.element );
      }
      // Set the scratch element to the text to determine its width and height.
      Text.testSVGText.text = text;
      Text.testSVGText.style.font = font;

      let timeNow = performance.now();
      const bbBox = Text.testSVGText.element.getBBox();
      const bbBoxTime = performance.now() - timeNow;

      timeNow = performance.now();
      const rect = Text.testSVGText.element.getBoundingClientRect();
      const rectTime = performance.now() - timeNow;

      console.log( `${ bbBox.width } ${ rect.width } bbox: ${ bbBoxTime } rect: ${ rectTime } winner: ${ bbBoxTime > rectTime ? 'rect' : 'bbBox'}` )
      return Text.testSVGText.element.getBBox();
    }
  }
  // @private {DOMObject} - Test DOMObject element, used to find the size of text elements.
  Text.testSVGText;

  // @private {DOMObject} - Container for the SVG test element, which will be connected to the document body.
  Text.testSVGTextParent;

  // @protected @override {string[]} - setter names specific to Text. See Node.MUTATOR_KEYS for documentation.
  Text.MUTATOR_KEYS = [ 'fontSize', 'fontFamily', 'fontStyle', 'fontWeight', 'fontStretch',
                        'fill', 'stroke', 'strokeWidth', 'shapeRendering', 'text', ...Node.MUTATOR_KEYS ];

  return Text;
} );