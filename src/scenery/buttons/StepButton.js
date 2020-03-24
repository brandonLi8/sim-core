// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Step Button, which displays a circular button with a vertical rectangle bar and a right or left facing equilateral
 * triangle, depending on if it is a forward or a backward Step button.
 *
 * Used generally to allow the user to step the simulation forward or backward by a small increment. It is usually
 * placed next to a PlayPauseButton.
 *
 * The step button is drawn programmatically (as opposed to using an image file) to allow for slight modifications
 * and customizations to the appearance of StepButton.
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

  class StepButton extends Button {

    /**
     * @param {string} direction - 'forward' || 'backward'
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code
     *                             where the options are set in the early portion of the constructor for details.
     */
    constructor( direction, options ) {
      assert( direction === 'forward' || direction === 'backward', `invalid direction: ${ direction }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // button
        baseColor: '#D48D00',     // {string} - the base color of the button.
        radius: 18,               // {number} - the radius of the round Step Button.
        buttonStroke: '#5F4510',  // {string|Gradient} - the stroke of the border of the Step Button.
        buttonStrokeWidth: 0.5,   // {number} - the stroke-width of the border of the Step Button.
        listener: null,           // {function} - the listener called when the button is pressed.

        // bar
        barWidth: 2.7,   // {number} - the width of the vertical rectangle-bar.
        barHeight: 16.2, // {number} - the height of the vertical rectangle-bar.

        // triangle
        triangleSideLength: 2.7, // {number} - the side length of the equilateral triangle.

        // content - applies to both the triangle and the rectangle-bar
        contentFill: 'white',    // {string|Gradient} - the fill of both the triangle and rectangle.
        contentStroke: 'black',  // {string|Gradient} - the stroke of both the triangle and rectangle.
        contentStrokeWidth: 0.5, // {number} - the stroke width of both the triangle and rectangle.
        contentMargin: 5,        // {number} - the margin between the triangle and rectangle.

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      //----------------------------------------------------------------------------------------

      // Create the StepButton's background, which is just a shaded circle.
      const stepButtonBackground = new Circle( options.radius, {
        stroke: options.buttonStroke,
        strokeWidth: options.buttonStrokeWidth,
        shapeRendering: 'geometricPrecision'
      } );

      // The Content of the Step Button is drawn as assuming it is a forwards button. It is later reversed (by scaling
      // negatively) if the button is backwards.

      // Create the Bar of the Step Button.
      const bar = new Rectangle( options.barWidth, options.barHeight, {
        centerY: 0,
        right: -options.contentMargin,
        fill: options.contentFill,
        stroke: options.contentStroke,
        strokeWidth: options.contentStrokeWidth
      } );

      // Create the triangle shape, with the left position at the origin.
      const triangleShape = new Shape()
        .moveTo( options.triangleSideLength / 2 * Math.sqrt( 3 ), 0 )
        .lineTo( 0, -options.triangleSideLength / 2 )
        .lineTo( 0, options.triangleSideLength / 2 )
        .close();

      // Create the triangle.
      const playTriangle = new Path( triangleShape, {
        fill: options.contentFill,
        stroke: options.contentStroke,
        strokeWidth: options.contentStrokeWidth
      } );

      super( stepButtonBackground, new Node().setChildren( [ bar, playTriangle ] ), options );

      // Apply a negative scale if backwards to reverse the direction of the button content.
      if ( direction === 'backward' ) this.scale( -1 );

      //----------------------------------------------------------------------------------------

      // Apply the 3D Gradient strategy to allow the Button to look 3D
      Button.apply3DGradients( this, options.baseColor );

      // Calls the listener passed in the option when the StepButton is pressed. The listener function is not
      // referenced since it is unlinked when interactionStateProperty is disposed, which occurs in the dispose method
      // of the super class.
      options.listener && this.interactionStateProperty.link( interactionState => {
        if ( interactionState === Button.interactionStates.PRESSED ) options.listener();
      } );
    }
  }

  return StepButton;
} );