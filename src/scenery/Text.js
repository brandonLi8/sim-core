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
      assert( typeof text === 'number' || typeof text === 'string', `invalid text: ${ text }` );
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
      options.text = `${ text }`; // Set the text option to be set in the mutate() call in Node.
      super( options );

      // @private {*} - see options declaration for documentation. Contains getters and setters. Set to what was
      //                provided as they were set in the mutate() call in Node's constructor.
      this._fontStyle = options.fontStyle;
      this._fontWeight = options.fontWeight;
      this._fontSize = options.fontSize;
      this._fontFamily = options.fontFamily;
      this._fill = options.fill;
      this._stroke = options.stroke;
      this._strokeWidth = options.strokeWidth;
      this._textRendering = options.textRendering;
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
     * Sets the text displayed of the Text Node. NOTE: setting the text will change the width of the Text, which
     * keeps the minX the same but expands/contracts the right border See `Node.set width()` for documentation.
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
    }

    /**
     * Sets the font-weight of the Text. See https://www.w3schools.com/cssref/pr_font_weight.asp
     * @public
     *
     * @param {number|string} fontWeight - 'normal', 'bold', 'bolder', 'lighter', 100, 200, 300, 400, ..., 800, or 900
     */
    set fontWeight( fontWeight ) {
      if ( fontWeight === this._fontWeight ) return; // Exit if setting to the same 'fontWeight'
      assert( typeof fontWeight === 'number' ? ( fontWeight <= 900 && fontWeight >= 100 && fontWeight % 100 === 0 ) :
              [ 'normal', 'bold', 'bolder', 'lighter' ].includes( fontWeight ), `invalid fontWeight: ${ fontWeight }` );
      this._fontWeight = fontWeight;
      this._updateTextBounds();
    }

    /**
     * Sets the font-size of the Text, in scenery coordinates.
     * @public
     *
     * @param {number} fontSize
     */
    set fontSize( fontSize ) {
      if ( fontSize === this._fontSize ) return; // Exit if setting to the same 'fontSize'
      assert( typeof fontSize === 'number' && fontSize > 0, `invalid fontSize: ${ fontSize }` );
      this._fontSize = fontSize;
      this._updateTextBounds();
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
      this.layout( this.screenViewScale );
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

    //----------------------------------------------------------------------------------------

    /**
     * Generates the combined CSS3 shorthand font string. See https://www.w3.org/TR/css-fonts-3/#propdef-font.
     * @private
     *
     * @param {number|null} fontScale - factor to scale the font size.
     * @returns {string}
     */
    _generateCSS3FontString( fontScale ) {
      assert( this._fontSize && this._fontFamily && this._fontStyle && this._fontWeight,
        'cannot generate the font string of a degenerate Text Node.' );
      let result = ''; // Create a flag for the final font string.

      // Prepend the style, weight, and stretch if non-normal.
      if ( this._fontStyle !== 'normal' ) { result += this._fontStyle + ' '; }
      if ( this._fontWeight !== 'normal' ) { result += this._fontWeight + ' '; }
      // Add the size and font family.
      result += this._fontSize * fontScale + 'px ' + this._fontFamily;
      return result;
    }

    /**
     * @override
     * Layouts the Text, ensuring that the Text is correctly in its top-left corner with 0 transformations before
     * calling the super class's layout method. Correctly scales the font-size pixel amount within in the ScreenView.
     * @public (sim-core-internal)
     *
     * @param {number|null} scale - scenery scale, in terms of window pixels per ScreenView coordinate.
     */
    layout( scale ) {
      if ( !scale ) return; // Exit if no scale was provided.

      // Set the dominant-baseline attribute to position the Text in the top-left corner with 0 transformation.
      if ( this.element.getAttribute( 'dominant-baseline' ) !== 'hanging' ) {
        this.setAttribute( 'dominant-baseline', 'hanging' );
        this.element.setAttribute( 'stroke-width', this._strokeWidth * scale );
      }

      // Set the CSS font of the Text Node element, correctly passing the scale to scale the font-size pixel amount.
      this.style.font = this._generateCSS3FontString( scale );

      super.layout( scale );
    }

    /**
     * Update the Bounds (width and height) of the Text Node. Called when a font property or the text displayed is
     * changed, resulting in a different width and height of the Text Node.
     * @private
     *
     * Uses Text._approximateTextBounds() to approximate the Bounds of the Text.
     */
    _updateTextBounds() {
      // Must be a valid Text Node.
      if ( this._fontSize && this._fontFamily && this._fontStyle && this._fontWeight ) {

        // Compute the bounds of the Text and set the width and height.
        const approximateTextBounds = Text._approximateTextBounds( this );
        this.width = approximateTextBounds.width;
        this.height = approximateTextBounds.height;

        // At this point, since this is called when a font property changes or when the text displayed is changed,
        // call layout as the font has changed. Layout isn't needed as its minX and minY doesn't change.
        this.style.font = this._generateCSS3FontString( this.screenViewScale );
      }
    }

    /**
     * Approximates the bounds of a Text Node using a DOM-based svg method.
     * Different methods of approximations have been discussed here:
     * https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript.
     *
     * For Text, both the width and the height are needed, so Canvas.measureText does not suffice. Through independent
     * testing, I've found that using an SVG element with a text child is the most accurate of DOM-based solutions.
     * Generally, there are two methods that get the bounds of SVG elements: getBBox() vs getBoundingClientRect().
     * I've tested both of these methods and found that getBoundingClientRect() is by-far faster.
     *
     * Note that text._generateCSS3FontString( 1 ) returns the font in pixels. But since the scale is 1, the pixel
     * amount will be in ScreenView scenery coordinates, meaning the bounds of the text element will also be in scenery
     * coordinates.
     * @public
     *
     * @param {Text} text
     * @returns {DOMRect} - Object that contains width and height fields of the Text Node's bounds.
     */
    static _approximateTextBounds( text ) {

      // Initialize the containers and elements required for SVG text measurement.
      if ( !Text.testSVGText ) {
        Text.testSVGTextParent = new DOMObject( {
          type: 'svg',
          id: 'test-text-size-element',
          style: {
            opacity: 0,
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
      // Set the text and font of the svg text element determine its width and height.
      Text.testSVGText.text = text.text;
      Text.testSVGText.style.font = text._generateCSS3FontString( 1 );

      return Text.testSVGText.element.getBoundingClientRect();
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