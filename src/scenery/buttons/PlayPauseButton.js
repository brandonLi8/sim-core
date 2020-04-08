// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A Play and Pause Button, which displays a circular button with either a right-pointing equilateral triangle when
 * paused (indicates that pressing will play) or two parallel vertical rectangle-bars when playing (indicates that
 * pressing will pause).
 *
 * Used to allow the user to toggle a Property.<boolean>, where true indicates that the simulation is playing and where
 * false indicates that the simulation is paused.
 *
 * The Play-Pause Button is drawn programmatically (as opposed to using an image file) to allow for slight modifications
 * and customizations to the appearance of Button.
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
  const Property = require( 'SIM_CORE/util/Property' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );
  const Shape = require( 'SIM_CORE/util/Shape' );

  class PlayPauseButton extends Button {

    /**
     * @param {Property.<boolean>} playProperty - the Property to toggle when the Button is pressed. The initial
     *                                            content of the Button will be determined by the current value.
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code
     *                             where the options are set in the early portion of the constructor for details.
     */
    constructor( playProperty, options ) {
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );
      assert( playProperty instanceof Property && typeof playProperty.value === 'boolean',
       `invalid playProperty: ${ playProperty }` );

      options = {

        // button
        baseColor: '#75B4FF',     // {string} - the base color of the button.
        radius: 32,               // {number} - the radius of the round Reset Button.
        buttonStroke: '#343B70',  // {string|Gradient} - the stroke of the border of the Reset Button.
        buttonStrokeWidth: 0.5,   // {number} - the stroke-width of the border of the Reset Button.

        // play triangle
        playTriangleSideLength: 33, // {number} - the side length of the right-facing equilateral play triangle.

        // pause rectangles
        pauseRectangleWidth: 10.5, // {number} - the width of each pause vertical rectangle-bar.
        pauseRectangleHeight: 28,  // {number} - the height of each pause vertical rectangle-bar.
        pauseRectangleMargin: 6,   // {number} - the margin between each pause vertical rectangle-bar.

        // play-pause - applies to both the play triangle and the pause rectangles
        playPauseFill: 'white',     // {string|Gradient} - the fill of both the play triangle and pause rectangles.
        playPauseStroke: '#5A8AC4', // {string|Gradient} - the stroke of both the play triangle and pause rectangles.
        playPauseStrokeWidth: 1,    // {number} - the stroke width of both the play triangle and pause rectangles.

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      //----------------------------------------------------------------------------------------

      // Create the PlayPauseButton's background, which is just a shaded circle.
      const playPauseButtonBackground = new Circle( options.radius, {
        stroke: options.buttonStroke,
        strokeWidth: options.buttonStrokeWidth,
        shapeRendering: 'geometricPrecision'
      } );

      // Create the Pause-rectangles, centered around the origin.
      const leftPauseRectangle = new Rectangle( options.pauseRectangleWidth, options.pauseRectangleHeight, {
        fill: options.playPauseFill,
        stroke: options.playPauseStroke,
        strokeWidth: options.playPauseStrokeWidth,
        right: -options.pauseRectangleMargin / 2
      } );
      const rightPauseRectangle = new Rectangle( options.pauseRectangleWidth, options.pauseRectangleHeight, {
        fill: options.playPauseFill,
        stroke: options.playPauseStroke,
        strokeWidth: options.playPauseStrokeWidth,
        left: options.pauseRectangleMargin / 2
      } );

      // Create the Pause rectangles container.
      const pauseRectanglesContainer = new Node().setChildren( [ rightPauseRectangle, leftPauseRectangle ] );

      // Create the play-triangle shape, with the center position at the origin.
      const playTriangleShape = new Shape()
        .moveTo( 2 / Math.sqrt( 3 ) * options.playTriangleSideLength / 2, 0 )
        .lineTo( -1 / Math.sqrt( 3 ) * options.playTriangleSideLength / 2, -options.playTriangleSideLength / 2 )
        .lineTo( -1 / Math.sqrt( 3 ) * options.playTriangleSideLength / 2, options.playTriangleSideLength / 2 )
        .close();

      // Create the play triangle, shifting to the right so that the origin at the center.
      const playTriangle = new Path( playTriangleShape, {
        fill: options.playPauseFill,
        stroke: options.playPauseStroke,
        strokeWidth: options.playPauseStrokeWidth,
        left: playTriangleShape.bounds.maxX + playTriangleShape.bounds.minX
      } );

      super( playPauseButtonBackground, new Node(), options );

      //----------------------------------------------------------------------------------------

      // Apply the 3D Gradient strategy to allow the Button to look 3D
      Button.apply3DGradients( this, options.baseColor );

      // @private {Property.<boolean>} - reference the passed-in playProperty
      this._playProperty = playProperty;

      // @private {function} - listener that adjusts the children of the content based on the value of the playProperty.
      //                       This listener is unlinked in the dispose method of PlayPauseButton.
      this._playPropertyObserver = isPlaying => {
        this.content.children = [ isPlaying ? pauseRectanglesContainer : playTriangle ];
        this.updatePositioning();
      };
      this._playProperty.link( this._playPropertyObserver );

      // Listen to when the PlayPauseButton is pressed to toggle the value of the playProperty. The listener function is
      // not referenced since it is unlinked when interactionStateProperty is disposed, which occurs in the dispose
      // method of the super class.
      this.interactionStateProperty.link( interactionState => {
        if ( interactionState === Button.interactionStates.PRESSED ) playProperty.toggle();
      } );
    }

    /**
     * @override
     * Disposes internal links.
     * @public
     */
    dispose() {
      this._playProperty.unlink( this._playPropertyObserver );
      this._playProperty = null; // Un-reference the playProperty.
      super.dispose();
    }
  }

  return PlayPauseButton;
} );