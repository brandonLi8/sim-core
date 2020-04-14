// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Reset Button, which displays a circular button with a clockwise curved-arc Arrow inside. ResetButton is generally
 * used to reset the state of the simulation to what was loaded in.
 *
 * The reset button is drawn programmatically (as opposed to using an image file) to allow for slight modifications
 * and customizations to the appearance of ResetButton. See ResetButton.generateCurvedArrowShape() method for more
 * documentation.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Button = require( 'SIM_CORE/scenery/components/buttons/Button' );
  const Circle = require( 'SIM_CORE/scenery/Circle' );
  const CurvedArrow = require( 'SIM_CORE/scenery/components/CurvedArrow' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  class ResetButton extends Button {

    /**
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code
     *                             where the options are set in the early portion of the constructor for details.
     */
    constructor( options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // button
        baseColor: '#C32526',   // {string} - the base color of the button.
        listener: null,         // {function} - the listener called when the button is pressed.
        radius: 25.5,           // {number} - the radius of the round Reset Button
        buttonStroke: 'black',  // {string|Gradient} - the stroke of the border of the Reset Button
        buttonStrokeWidth: 0.5, // {number} - the stroke-width of the border of the Reset Button

        // curvedArrow
        curvedArrowFill: 'white',               // {string|Gradient} - the fill color of the button curvedArrow.
        curvedArrowStroke: 'black',             // {string|Gradient} - the stroke color of the button curvedArrow.
        curvedArrowStrokeWidth: 0.5,            // {number} - the stroke width of the button curved Arrow.
        curvedArrowHeadHeight: 9,               // {number} - the head-height of the curved arrow.
        curvedArrowHeadWidth: 13.5,             // {number} - the head-width of the curved arrow.
        curvedArrowTailWidth: 6,                // {number} - the tail-width of the curved arrow.
        curvedArrowRadius: 13,                  // {number} - the radius of the curved arrow.
        curvedArrowStartAngle: Math.PI * 1.65,  // {number} - the start angle of the curved arrow.
        curvedArrowEndAngle: Math.PI * -0.05,   // {number} - the end angle of the curved arrow.

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      //----------------------------------------------------------------------------------------

      // Create the Node that displays the a Curved Arrow shape.
      const curvedArrow = new CurvedArrow( Vector.ZERO,
        options.curvedArrowRadius,
        options.curvedArrowStartAngle,
        options.curvedArrowEndAngle, {
          fill: options.curvedArrowFill,
          stroke: options.curvedArrowStroke,
          strokeWidth: options.curvedArrowStrokeWidth,
          headHeight: options.curvedArrowHeadHeight,
          headWidth: options.curvedArrowHeadWidth,
          tailWidth: options.curvedArrowTailWidth,
          adjustEndAngle: false,
          clockwise: true
        } );

      // Translate the curved Arrow so that the center of the curved arrow is the center of the ResetButton.
      curvedArrow.translate( Vector.scratch.setXY( curvedArrow.right, curvedArrow.bottom ) );

      // Create the ResetButton's background, which is just a shaded circle.
      const resetButtonBackground = new Circle( options.radius, {
        stroke: options.buttonStroke,
        strokeWidth: options.buttonStrokeWidth,
        shapeRendering: 'geometricPrecision'
      } );

      super( resetButtonBackground, new Node().addChild( curvedArrow ), options );

      //----------------------------------------------------------------------------------------

      // Apply the 3D Gradient strategy to allow the Reset Button to look 3D
      Button.apply3DGradients( this, options.baseColor );

      // Calls the listener passed in the option when the ResetButton is pressed. The listener function is not
      // referenced since it is unlinked when interactionStateProperty is disposed, which occurs in the dispose method
      // of the super class.
      options.listener && this.interactionStateProperty.link( interactionState => {
        if ( interactionState === Button.interactionStates.PRESSED ) options.listener();
      } );
    }
  }

  return ResetButton;
} );