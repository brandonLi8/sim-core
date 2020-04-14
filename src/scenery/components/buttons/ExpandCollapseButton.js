// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A ExpandCollapseButton is a Button sub-type for expanding/collapsing something. It displays a '-' when open (to
 * collapse) and a '+' when closed (to expand).
 *
 * ExpandCollapseButton is used to allow the user to toggle a Property.<boolean>, to indicates if something should be
 * expanded or collapsed.
 *
 * The ExpandCollapseButton is drawn programmatically (as opposed to using an image file) to allow for slight
 * modifications and customizations to the appearance of ExpandCollapseButton.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict/';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Button = require( 'SIM_CORE/scenery/components/buttons/Button' );
  const ColorWheel = require( 'SIM_CORE/util/ColorWheel' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class ExpandCollapseButton extends Button {

    /**
     * @param {Property.<boolean>} expandedProperty - the Property to toggle when the ExpandCollapseButton is pressed.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code
     *                             where the options are set in the early portion of the constructor for details.
     */
    constructor( expandedProperty, options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( expandedProperty instanceof Property && typeof expandedProperty.value === 'boolean',
       `invalid expandedProperty: ${ expandedProperty }` );

      options = {

        // button
        expandedBaseColor: 'rgb( 255, 85, 0 )',    // {string} - the base color of the button when expanded
        collapsedBaseColor: 'rgb( 0, 179, 0 )', // {string} - the base color of the button when expanded
        buttonSize: 28,              // {number} - the width and height of the button background
        buttonStroke: 'black',       // {string|Gradient} - the stroke of the border of the Button.
        buttonStrokeWidth: 0.5,      // {number} - the stroke-width of the border of the Button.
        buttonCornerRadius: 3,       // {number} - the corner radius of the box background.

        // expand-collapse
        expandCollapseStroke: 'white',  // {string} - the stroke color of the '+' and '-'
        expandCollapseStrokeWidth: 4,   // {number} - the stroke width of the '+' and '-'
        expandCollapseSize: 17,         // {number} - the width and height of the '+' and '-'

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      //----------------------------------------------------------------------------------------

      // Create the ExpandCollapseButton background, which is just a rounded Rectangle.
      const background = new Rectangle( options.buttonSize, options.buttonSize, {
        stroke: options.buttonStroke,
        strokeWidth: options.buttonStrokeWidth,
        cornerRadius: options.buttonCornerRadius
      } );

      // Create the plus '+' Node.
      const plus = new Path( new Shape()
        .moveTo( options.expandCollapseSize / 2, 0 )
        .lineTo( options.expandCollapseSize / 2, options.expandCollapseSize )
        .moveTo( 0, options.expandCollapseSize / 2 )
        .lineTo( options.expandCollapseSize, options.expandCollapseSize / 2 ), {
          stroke: options.expandCollapseStroke,
          strokeWidth: options.expandCollapseStrokeWidth
        } );

      // Create the minus '-' Node.
      const minus = new Path( new Shape()
        .moveTo( 0, options.expandCollapseSize / 2 )
        .lineTo( options.expandCollapseSize, options.expandCollapseSize / 2 ), {
          stroke: options.expandCollapseStroke,
          strokeWidth: options.expandCollapseStrokeWidth
        } );

      super( background, new Node( { children: [ plus, minus ] } ), options );

      //----------------------------------------------------------------------------------------

      // @private {string} - fill colors of the ExpandCollapseButton.
      this._expandedIdleFill = options.expandedBaseColor;
      this._collapsedIdleFill = options.collapsedBaseColor;
      this._expandedHoverFill = ColorWheel.shade( this._expandedIdleFill, 0.3 );
      this._collapsedHoverFill = ColorWheel.shade( this._collapsedIdleFill, 0.3 );

      // Ensure validity of additionally location setters in options.
      this.mutate( options );

      // @private {Property.<boolean>} - reference the passed-in expandedProperty
      this._expandedProperty = expandedProperty;

      // @private {function} - listener that adjusts the visibility of the +/-. This listener is unlinked in the
      //                       dispose method of ExpandCollapseButton.
      this._expandedPropertyObserver = isExpanded => {
        plus.visible = !isExpanded;
        minus.visible = isExpanded;
        this._updateFill( this.interactionStateProperty.value, isExpanded );
      };
      expandedProperty.link( this._expandedPropertyObserver );

      // Listen to when the ExpandCollapseButton is pressed to toggle the value of the expandedProperty. The listener
      // function is not referenced since it is unlinked when interactionStateProperty is disposed, which occurs in
      // the dispose method of the super class.
      this.interactionStateProperty.link( interactionState => {
        this._updateFill( interactionState, expandedProperty.value );
        if ( interactionState === Button.interactionStates.PRESSED ) expandedProperty.toggle();
      } );
    }

    /**
     * @override
     * Disposes internal links.
     * @public
     */
    dispose() {
      this._expandedProperty.unlink( this._expandedPropertyObserver );
      this._expandedProperty = null; // Un-reference the expandedProperty.
      super.dispose();
    }

    /**
     * Updates the fill color of the ExpandCollapseButton. Called when the button is interacted with or when the
     * expandedProperty changes.
     * @private
     *
     * @param {Enum.Member.<Button.interactionStates>} interactionState
     * @param {boolean} expanded
     */
    _updateFill( interactionState, expanded ) {
      if ( interactionState === Button.interactionStates.HOVER ) {
        this.background.fill = expanded ? this._expandedHoverFill : this._collapsedHoverFill;
      }
      else {
        this.background.fill = expanded ? this._expandedIdleFill : this._collapsedIdleFill;
      }
    }
  }

  return ExpandCollapseButton;
} );