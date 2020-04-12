// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Checkbox, which displays a square box with a check-mark shape inside that changes visibility when toggled.
 * Checkbox is used to allow the user to toggle a Property.<boolean>, where a visible check-mark means this Property's
 * value is true and vise versa.
 *
 * The Checkbox is drawn programmatically (as opposed to using an image file) to allow for slight modifications
 * and customizations to the appearance of Checkbox.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Button = require( 'SIM_CORE/scenery/components/buttons/Button' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Shape = require( 'SIM_CORE/util/Shape' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class Checkbox extends Button {

    /**
     * @param {Property.<boolean>} toggleProperty - the Property to toggle when the Checkbox is pressed. The initial
     *                                              visibility of the check will be determined by the current value.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code
     *                             where the options are set in the early portion of the constructor for details.
     */
    constructor( toggleProperty, options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( toggleProperty instanceof Property && typeof toggleProperty.value === 'boolean',
       `invalid toggleProperty: ${ toggleProperty }` );

      options = {

        // box
        boxStroke: 'black',   // {string|Gradient} - the stroke color of the box background.
        boxFill: 'white',     // {string|Gradient} - the fill color of the box background.
        boxStrokeWidth: 2,    // {number} - the stroke width of the box background.
        boxCornerRadius: 3,   // {number} - the corner radius of the box background.
        boxSize: 19,          // {number} - the width and height of the box background.

        // check
        checkFill: 'black',     // {string|Gradient} - the fill color of the check-mark.
        checkStroke: 'white',   // {string|Gradient} - the stroke color of the check-mark.
        checkStrokeWidth: 0.8,  // {number} - the stroke width of the check-mark.

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      //----------------------------------------------------------------------------------------

      // Create the Checkbox background, which is just a rounded Rectangle.
      const box = new Rectangle( options.boxSize, options.boxSize, {
        stroke: options.boxStroke,
        strokeWidth: options.boxStrokeWidth,
        fill: options.boxFill,
        cornerRadius: options.boxCornerRadius
      } );

      // Create the Check-mark shape, which is drawn as an L rotated.
      const lWidth = options.boxSize * 5 / 8; // ratio determined through experimentation
      const lHeight = lWidth * 27 / 16;       // ratio determined through experimentation
      const barSize = lWidth * 5 / 12;        // ratio determined through experimentation
      const lRotation = Math.PI * 0.27;       // ratio determined through experimentation

      const checkShape = new Shape()
        .moveToPoint( Vector.ZERO )
        .lineToPoint( Vector.scratch.setXY( lWidth, 0 ).rotate( lRotation ) )
        .lineToPoint( Vector.scratch.setXY( lWidth, -lHeight ).rotate( lRotation ) )
        .lineToPoint( Vector.scratch.setXY( lWidth - barSize, -lHeight ).rotate( lRotation ) )
        .lineToPoint( Vector.scratch.setXY( lWidth - barSize, -barSize ).rotate( lRotation ) )
        .lineToPoint( Vector.scratch.setXY( 0, -barSize ).rotate( lRotation ) )
        .close();

      // Create the Node that displays the check. Wrapped with a Node to offset the check slightly towards the right.
      const check = new Node().addChild( new Path( checkShape, {
        fill: options.checkFill,
        stroke: options.checkStroke,
        strokeWidth: options.checkStrokeWidth,
        left: options.boxSize * 2 / 5,    // ratio determined through experimentation
        bottom: options.boxSize * -1 / 12 // ratio determined through experimentation
      } ) );

      super( box, check, options );

      //----------------------------------------------------------------------------------------

      // Ensure validity of additionally location setters in options.
      this.mutate( options );

      // @private {Property.<boolean>} - reference the passed-in toggleProperty
      this._toggleProperty = toggleProperty;

      // @private {function} - listener that adjusts the visibility of the check based on the value of the
      //                       toggleProperty. This listener is unlinked in the dispose method of Checkbox.
      this._togglePropertyObserver = toggleProperty.linkAttribute( check, 'visible' );

      // Listen to when the Checkbox is pressed to toggle the value of the toggleProperty. The listener function is not
      // referenced since it is unlinked when interactionStateProperty is disposed, which occurs in the dispose method
      // of the super class.
      this.interactionStateProperty.link( interactionState => {
        if ( interactionState === Button.interactionStates.PRESSED ) toggleProperty.toggle();
      } );
    }

    /**
     * @override
     * Disposes internal links.
     * @public
     */
    dispose() {
      this._toggleProperty.unlink( this._togglePropertyObserver );
      this._toggleProperty = null; // Un-reference the toggleProperty.
      super.dispose();
    }
  }

  return Checkbox;
} );