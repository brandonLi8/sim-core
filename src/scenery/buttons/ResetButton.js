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
  const Button = require( 'SIM_CORE/scenery/buttons/Button' );
  const Circle = require( 'SIM_CORE/scenery/Circle' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const Shape = require( 'SIM_CORE/util/Shape' );
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
        radius: 21.5,           // {number} - the radius of the round Reset Button
        buttonStroke: 'black',  // {string|Gradient} - the stroke of the border of the Reset Button
        buttonStrokeWidth: 0.5, // {number} - the stroke-width of the border of the Reset Button

        // curvedArrow
        curvedArrowFill: 'white',               // {string|Gradient} - the fill color the button curvedArrow.
        curvedArrowStroke: 'black',             // {string|Gradient} - the stroke color of the button curvedArrow.
        curvedArrowStrokeWidth: 0.5,            // {number} - the stroke width of the button curved Arrow.
        curvedArrowHeadHeight: 8.5,             // {number} - the head-height of the curved arrow.
        curvedArrowHeadWidth: 13,               // {number} - the head-width of the curved arrow.
        curvedArrowTailWidth: 5.7,              // {number} - the tail-width of the curved arrow.
        curvedArrowRadius: 11,                  // {number} - the radius of the curved arrow.
        curvedArrowStartAngle: Math.PI * 1.95,  // {number} - the start angle of the curved arrow.
        curvedArrowEndAngle: Math.PI * 1.65,    // {number} - the end angle of the curved arrow.

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      //----------------------------------------------------------------------------------------

      // Generate the Curved Arrow Shape that goes inside the Reset Button
      const curvedArrowShape = ResetButton.generateCurvedArrowShape(
        options.curvedArrowStartAngle,
        options.curvedArrowEndAngle,
        options.curvedArrowRadius,
        options.curvedArrowHeadHeight,
        options.curvedArrowHeadWidth,
        options.curvedArrowTailWidth
      );

      // Create the Node that displays the curvedArrowShape. Wrapped with a Node to offset the curvedArrow's triangle
      // head which allows the center of the curved arrow be the center of the ResetButton.
      const curvedArrow = new Node().addChild( new Path( curvedArrowShape, {
        fill: options.curvedArrowFill,
        stroke: options.curvedArrowStroke,
        strokeWidth: options.curvedArrowStrokeWidth,
        left: curvedArrowShape.bounds.maxX + curvedArrowShape.bounds.minY,
        top: curvedArrowShape.bounds.maxY + curvedArrowShape.bounds.minY
      } ) );

      // Create the ResetButton's background, which is just a shaded circle.
      const resetButtonBackground = new Circle( options.radius, {
        stroke: options.buttonStroke,
        strokeWidth: options.buttonStrokeWidth,
        shapeRendering: 'geometricPrecision'
      } );

      super( resetButtonBackground, curvedArrow, options );

      // Apply the 3D Gradient strategy to allow the Reset Button to look 3D
      Button.apply3DGradients( this, options.baseColor );
    }
  }

  return ResetButton;
} );