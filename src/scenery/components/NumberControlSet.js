// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Control Set for changing and displaying the value of a number Property.
 *
 * A NumberControlSet consists of:
 *   - A title Node
 *   - A NumberDisplay of the number Property. See NumberDisplay.js for context.
 *   - A Slider to modify the value of the number Property.
 *
 * The NumberControlSet looks visually like:
 *
 *  title    |number|
 *   ─────▉─────────
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const NumberDisplay = require( 'ROTATIONAL_MOTION/common/view/NumberDisplay' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Range = require( 'SIM_CORE/util/Range' );
  const Slider = require( 'SIM_CORE/scenery/components/Slider' );

  class NumberControlSet extends Node {

    /**
     * @param {Node} title - the title displayed (see the comment at the top of the file for context).
     * @param {Property.<number|null>} numberProperty
     * @param {Range} range - this range of the numberProperty
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     */
    constructor( title, numberProperty, range, options ) {
      assert( title instanceof Node, `invalid title: ${ title }` );
      assert( numberProperty instanceof Property, `invalid numberProperty: ${ numberProperty }` );
      assert( range instanceof Range, `invalid range: ${ range }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {number} margin between the slider and the content above
        sliderTopMargin: 4,

        // {Object} - if provided, these options will be passed to the Slider instance
        sliderOptions: null,

        // {Object} - if provided, these options will be passed to the NumberDisplay instance
        numberDisplayOptions: null,

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      super( options );

      //----------------------------------------------------------------------------------------

      // @protected {*} - see parameter declaration for documentation. Referenced for use in our methods.
      this._title = title;
      this._numberProperty = numberProperty;
      this._range = range;
      this._sliderTopMargin = options.sliderTopMargin;

      // @private {NumberDisplay} - the number display of the NumberControlSet
      this._numberDisplay = new NumberDisplay( numberProperty, range, options.numberDisplayOptions );

      // @private {Slider} (read-only) - the slider of the NumberControlSet.
      this._slider = new Slider( range, numberProperty, options.sliderOptions );

      // @private {boolean} - Indicates if we are in the process of updating the layout of the Panel. Used
      //                      to reduce the number of _recomputeAncestorBounds calls while layouting.
      this._isUpdatingLayout = false;

      //----------------------------------------------------------------------------------------

      // Add the content of the NumberControlSet as children
      this.children = [ this._title, this._numberDisplay, this._slider ];

      // Update the layout of our children.
      this._updateLayout();

      // Apply any additionally Bounds setters
      this.mutate( options );
    }

    /**
     * @override
     * Disposes the NumberControlSet and its listeners so that it can be garbage collected.
     * @public
     */
    dispose() {
      this._slider.dispose();
      this._numberDisplay.dispose();
      super.dispose();
    }

    /**
     * Adds a major tick mark to the slider.
     * @public
     *
     * @param {number} value - the numeric value the tick represents along the range of the slider.
     * @param {Node} [label] - optional label Node (usually a Text Node), placed above the Node.
     * @returns {NumberControlSet} - 'this' reference, for chaining.
     */
    addSliderMajorTick( value, label ) {
      this._slider.addMajorTick( value, label );
      this._updateLayout();
      return this;
    }

    /**
     * Adds a minor tick mark to the slider.
     * @public
     *
     * @param {number} value - the numeric value the tick represents along the range of the slider.
     * @param {Node} [label] - optional label Node (usually a Text Node), placed above the Node.
     * @returns {NumberControlSet} - 'this' reference, for chaining.
     */
    addSliderMinorTick( value, label ) {
      this._slider.addMinorTick( value, label );
      this._updateLayout();
      return this;
    }

    /**
     * Called when the layout of the NumbderControlSet needs to be updated.
     * @private
     *
     * NOTE: Will change the location of its children, and possibly the location of this Node's content.
     */
    _updateLayout() {
      this._isUpdatingLayout = true; // Indicate that we are now updating our layout.

      // First position the title and numberDisplay horizontally relative to the slider.
      this._title.left = this._slider.left;
      this._numberDisplay.right = this._slider.right;

      // Position the title and NumberDisplay vertically relative to the slider.
      if ( this._title.height > this._numberDisplay.height ) {
        this._numberDisplay.centerY = this._title.centerY;
        this._slider.top = this._title.bottom + this._sliderTopMargin;
      }
      else {
        this._title.centerY = this._numberDisplay.centerY;
        this._slider.top = this._numberDisplay.bottom + this._sliderTopMargin;
      }

      this._isUpdatingLayout = false; // Indicate that we are now done updating our layout of our children.
      super._recomputeAncestorBounds();
    }

    /**
     * @override
     * This method is called when a child's Bounds changes. In Node, this method is responsible for adjusting its
     * Bounds and recursively calling the method for each parent up the ancestor tree.
     * @protected
     *
     * This is overridden to reduce redundant calls to this method when we are manually updating our child's Bounds in
     * our _updateLayout method. We remove the super-class functionality when we are still layouting.
     */
    _recomputeAncestorBounds() {
      if ( this._isUpdatingLayout === true ) { /** do nothing **/ }
      else {
        this._updateLayout();
        super._recomputeAncestorBounds(); // now that layouting is finished, forward to the super-class functionality
      }
    }
  }

  return NumberControlSet;
} );