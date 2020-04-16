// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * A NumberDisplay, which displays the value of a number Property in a Text Node on top of a background rectangle.
 * The NumberDisplay will update when the number Property updates and will display a em-dash if the value is 'null'.
 *
 * The background of NumberDisplays are a fixed width and height. It is HIGHLY recommended to use
 * NumberDisplay.withRange(), which will determine the size by the largest-sized text within a numeric range.
 * See NumberDisplay.withRange() for more documentation. However, if **ABSOLUTELY** necessary, you can use the
 * constructor, in which you provide the width and height.
 *
 * The NumberDisplay has various key-value options to customize the appearance of the NumberDisplay, including
 * the background Rectangle's appearance, the Text Node's appearance, and the alignment of the TextNode. In addition,
 * you have the option to include a unit, like 'm', to append to the end of the text.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SIM_CORE/scenery/AlignBox' );
  const assert = require( 'SIM_CORE/util/assert' );
  const FlexBox = require( 'SIM_CORE/scenery/FlexBox' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Range = require( 'SIM_CORE/util/Range' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Symbols = require( 'SIM_CORE/util/Symbols' );
  const Text = require( 'SIM_CORE/scenery/Text' );
  const Util = require( 'SIM_CORE/util/Util' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const DEFAULT_OPTIONS = {
    xAlign: 'center',     // {string} - the alignment of the Text: 'left', 'center', or 'right'.
    yAlign: 'center',     // {string} - the alignment of the Text: 'top', 'center', or 'bottom'.
    unit: null,           // {Node} - if provided, this will be appended to the end of the Text as a unit.
    unitAlign: 'center',  // {string} - the alignment of the unit relative to the text: 'bottom', 'center', or 'top'.
    unitSpacing: 6,       // {number} - spacing between a potential Unit node and the text.
    decimalPlaces: 0,     // {number|null} the number of decimal places to show. If null, the full value is displayed.
    cornerRadius: 0,      // {number} - the corner radius of the background

    backgroundFill: 'white',        // {string|Gradient} the fill of the background
    backgroundStroke: 'lightGray',  // {string|Gradient} the stroke of the background
    backgroundStrokeWidth: 1,       // {number} the stroke-width of the background

    // {Object} - if provided, these options will be passed to the Text instance
    textOptions: null
  };

  class NumberDisplay extends Node {

    /**
     * @param {Property.<number|null>} numberProperty
     * @param {number} width - the fixed width of the NumberDisplay. Consider using NumberDisplay.withRange().
     * @param {number} width - the fixed height of the NumberDisplay. Consider using NumberDisplay.withRange().
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     */
    constructor( numberProperty, width, height, options ) {
      assert( numberProperty instanceof Property, `invalid numberProperty: ${ numberProperty }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {
        ...DEFAULT_OPTIONS,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      super( options );

      //----------------------------------------------------------------------------------------

      // @private {*} - see options declaration for documentation. Referenced for use in our methods.
      this._numberProperty = numberProperty;
      this._xAlign = options.xAlign;
      this._yAlign = options.yAlign;
      this._unit = options.unit;
      this._decminalPlaces = options.decimalPlaces;

      // @private {Text} - create the value Node which displays the Text of the number Property.
      this._value = new Text( numberProperty.value, options.textOptions );

      // @private {Rectangle} - create the Rectangle background Node
      this._background = new Rectangle( width, height, {
        cornerRadius: options.cornerRadius,
        fill: options.backgroundFill,
        stroke: options.backgroundStroke,
        strokeWidth: options.backgroundStrokeWidth
      } );

      //----------------------------------------------------------------------------------------

      // @private {AlignBox} - create the content Node of the number display
      this._content = FlexBox.horizontal( {
        align: options.unitAlign,
        spacing: options.unitSpacing,
        children: [ this._value ]
      } );

      // Add the Unit as a child if provided.
      if ( this._unit ) this._content.addChild( this._unit );

      // Add the content of the Number Display as children
      this.children = [ this._background, new AlignBox( this._content, width, height ) ];

      // @private {function} - observer of the numberProperty. To be unlinked in the dispose method.
      this._numberPropertyObserver = this._updateNumberDisplay.bind( this );
      numberProperty.link( this._numberPropertyObserver );

      // Apply any additionally Bounds setters
      this.mutate( options );
    }

    /**
     * @override
     * Disposes the NumberDisplay and its listeners so that it can be garbage collected.
     * @public
     */
    dispose() {
      this._numberProperty.unlink( this._numberPropertyObserver );
      super.dispose();
    }

    /**
     * Called when the slider needs to be updated, usually when the numberProperty of the NumberDisplay changes.
     * @private
     *
     * Updates the Text center location to match the alignments.
     */
    _updateNumberDisplay() {
      // If the Unit Node was provided and isn't a child of our content container, add it as a child.
      if ( this._unit && !this._content.hasChild( this._unit ) ) this._content.addChild( this._unit );

      // Set the text of our value Node.
      if ( isFinite( this._numberProperty.value ) ) {
        if ( this._decminalPlaces === null ) `${ this._value.text = this._numberProperty.value }`;
        else this._value.text = `${ Util.toFixed( this._numberProperty.value, this._decminalPlaces ) }`;
      }
      else {
        this._value.text = Symbols.NO_VALUE; // use em-dash if null value
        this._unit && this._content.removeChild( this._unit ); // if null value don't display the unit Node
      }

      // Ensure that the content fits inside the background
      this._background.topLeft = Vector.ZERO;

      // Strip 'center' to centerX or centerY
      const xAlignKey = this._xAlign === 'center' ? 'centerX' : this._xAlign;
      const yAlignKey = this._yAlign === 'center' ? 'centerY' : this._yAlign;

      this._content[ xAlignKey ] = this._background[ xAlignKey ];
      this._content[ yAlignKey ] = this._background[ yAlignKey ];
    }

    /**
     * Static NumberDisplay creator that determines the width and height from a numeric range.
     * @public
     *
     * @param {Property.<number|null>} numberProperty
     * @param {Range} numberRange
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     * @return {NumberDisplay}
     */
    static withRange( numberProperty, numberRange, options ) {
      assert( numberRange instanceof Range, `invalid numberRange: ${ numberRange }` );

      options = {
        ...DEFAULT_OPTIONS,

        xMargin: 14, // {number} - the x-margin between the longest/tallest Text and the background.
        yMargin: 4,  // {number} - the y-margin between the longest/tallest Text and the background.

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      // Determine the widest value first.
      const min = numberRange.min.toFixed( options.decimalPlaces );
      const max = numberRange.max.toFixed( options.decimalPlaces );
      const longestValueString = min.toString().length > max.toString().length ? min : max;
      const text = new Text( longestValueString, options.textOptions );

      // Determine the width and height of the NumberDisplay, which doesn't change.
      const width = text.width + 2 * options.xMargin + ( options.unit ? options.unit.width : 0 );
      const height = Math.max( text.height, ( options.unit ? options.unit.height : 0 ) || 0 ) + 2 * options.yMargin;

      return new NumberDisplay( numberProperty, width, height, options );
    }
  }

  return NumberDisplay;
} );