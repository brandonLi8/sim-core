// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A base-class abstraction for all Button Node sub-types. This class is generally not meant to be used within
 * sim-specific code. Rather, use any of its subclasses.
 *
 * The Button class is responsible for:
 *   - Handling Hover and Press Listeners for handling user interaction with the Button.
 *   - Positioning content on-top of a background Path sub-type.
 *   - Providing a static method that makes a Button's background look 3D by highlighting and shading different portions
 *     of a Gradient based off a base-color and applying it as the 'fill'. Will also listen to when the interaction
 *     state of the Button changes to modify the gradient slightly when the button is hovered.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const ColorWheel = require( 'SIM_CORE/util/ColorWheel' );
  const Enum = require( 'SIM_CORE/util/Enum' );
  const HoverListener = require( 'SIM_CORE/scenery/events/HoverListener' );
  const LinearGradient = require( 'SIM_CORE/scenery/gradients/LinearGradient' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const PressListener = require( 'SIM_CORE/scenery/events/PressListener' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Vector = require( 'SIM_CORE/util/Vector' );

  // constants
  const CACHED_BASE_COLOR_GRADIENTS = {}; // Maps base-colors to 3D gradients. See Button.apply3DGradients() for doc.

  class Button extends Node {

    /**
     * @param {Path} background - the background Path (usually sub-type) of the Button
     * @param {Node} content - the content of the Button, placed on top of the background
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. Subclasses
     *                             may have different options for their API. See the code where the options are set in
     *                             the early portion of the constructor for details.
     */
    constructor( background, content, options ) {
      assert( background instanceof Path, `invalid background: ${ background }` );
      assert( content instanceof Node, `invalid content: ${ content }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        // {string} - determines how the content is aligned relative to the background: 'left', 'center', or 'right'.
        xAlign: 'center',

        // {string} - determines how the content is aligned relative to the background: 'top', 'center', or 'bottom'.
        yAlign: 'center',

        // {string} - Alias of the CSS cursor of the Button.
        cursor: 'pointer',

        // Rewrite options so that it overrides the defaults.
        ...options
      };
      options.children = [ background, content ]; // Set the children array to ensure correct order of mutating in Node.
      super( options );

      // @private {string} - see options declaration for documentation.
      this._xAlign = options.xAlign;
      this._yAlign = options.yAlign;

      // @public (read-only) {Property.<Enum.Member.<Button.interactionStates>>} - Property of the current
      //                                                                           interaction state of the Button.
      this.interactionStateProperty = new Property( Button.interactionStates.IDLE, {
        validValues: Button.interactionStates.MEMBERS
      } );

      // @public (read-only) {Gradient} - references to potential 'fills' for backgrounds if this Button is passed to
      //                                  a Button.apply3DGradients() call.
      this.idleFill;
      this.hoverFill;
      this.pressedFill;

      // @public (read-only) {Path} - reference to the background Path provided.
      this.background = background;

      // @public (read-only) {Node} - reference to the content Node provided.
      this.content = content;

      // Position the content and background Nodes of this Button.
      this.updatePositioning();

      //----------------------------------------------------------------------------------------

      // @private {PressListener} - create a PressListener for when the user clicks on the Button. Listener to be
      //                            disposed in the dispose method.
      this._pressListener = new PressListener( this, {
        press: () => { this.interactionStateProperty.value = Button.interactionStates.PRESSED; },
        release: () => { this.interactionStateProperty.value = Button.interactionStates.HOVER; }
      } );

      // @private {HoverListener} - create a HoverListener for when the user hovers over the Button. Listener to be
      //                            disposed in the dispose method.
      this._hoverListener = new HoverListener( this, {
        enter: () => { this.interactionStateProperty.value = Button.interactionStates.HOVER; },
        exit: () => { this.interactionStateProperty.value = Button.interactionStates.IDLE; }
      } );
    }

    /**
     * @override
     * Dispose the Button and its listeners/Properties.
     * @public
     */
    dispose() {
      this.interactionStateProperty.dispose();
      this._pressListener.dispose();
      this._hoverListener.dispose();
      super.dispose();
    }

    /**
     * Repositions the content and background Nodes of this Button to match the aligns provided in the constructor.
     * @public
     *
     * NOTE: this must be manually called if the content Node or background Path changes Bounds.
     */
    updatePositioning() {
      // Ensure that the content fits inside the background Path
      this.content.maxWidth = this.background.width;
      this.content.maxHeight = this.background.height;
      this.background.topLeft = Vector.ZERO;

      // Strip center to centerX or centerY
      const xAlignKey = this._xAlign === 'center' ? 'centerX' : this._xAlign;
      const yAlignKey = this._yAlign === 'center' ? 'centerY' : this._yAlign;

      this.content[ xAlignKey ] = this.background[ xAlignKey ];
      this.content[ yAlignKey ] = this.background[ yAlignKey ];
    }

    /**
     * Applies the 'fill' of a Button's background to make it look 3D by using gradients that create the illusion of
     * shadows and highlights. Will set the 'idleFill', 'hoverFill' and 'pressedFill' properties of the Button, and will
     * automatically switch Gradients when the interaction state changes.
     * @public
     *
     * @param {Button} button - the button to apply the gradents to
     * @param {string} baseColor - any valid CSS color string
     */
    static apply3DGradients( button, baseColor ) {
      assert( !button.idleFill && !button.hoverFill && !button.pressedFill, 'Button already has 3D gradients applied' );

      // If the base-color is cached, used the cached values.
      if ( Object.hasOwnProperty.call( CACHED_BASE_COLOR_GRADIENTS, baseColor ) ) {
        button.idleFill = CACHED_BASE_COLOR_GRADIENTS[ baseColor ].idleFill;
        button.hoverFill = CACHED_BASE_COLOR_GRADIENTS[ baseColor ].hoverFill;
        button.pressedFill = CACHED_BASE_COLOR_GRADIENTS[ baseColor ].pressedFill;
      }
      else {
        // Array of an array of length 2, where the first item represents the shade factor and the second item
        // represents the stop percentage. Each array of length 2 represents a stop of the Gradient.
        // Values were determined through experimentation.
        const stops = [ [ 0.75, 0 ], [ 0.5, 20 ], [ 0.3, 40 ], [ 0, 59 ], [ -0.03, 69 ], [ -0.06, 75 ],
                        [ -0.11, 81 ], [ -0.15, 87 ], [ -0.22, 92.5 ], [ -0.26, 95.5 ], [ -0.30, 100 ] ];

        // Create the Linear Gradients for each fill type.
        button.idleFill = new LinearGradient( 0, 13, 100, 78 );
        button.hoverFill = new LinearGradient( 0, 13, 100, 78 );
        button.pressedFill = new LinearGradient( 0, 13, 100, 78 );

        // Modify the base colors for hover and press events.
        const hoverBaseColor = ColorWheel.shade( baseColor, 0.25 ); // lighten
        const pressedBaseColor = ColorWheel.shade( baseColor, -0.15 ); // darken

        stops.forEach( stop => {
          button.idleFill.addColorStop( ColorWheel.shade( baseColor, stop[ 0 ] ), stop[ 1 ] );
          button.hoverFill.addColorStop( ColorWheel.shade( hoverBaseColor, stop[ 0 ] ), stop[ 1 ] );
          button.pressedFill.addColorStop( ColorWheel.shade( pressedBaseColor, stop[ 0 ] ), stop[ 1 ] );
        } );
      }

      // Apply the fills by listening to the interactionStateProperty. The listener function is not referenced as it is
      // unlinked when interactionStateProperty is disposed, which is disposed in Button's dispose method.
      button.interactionStateProperty.link( interactionState => {
        if ( interactionState === Button.interactionStates.IDLE ) button.background.fill = button.idleFill;
        if ( interactionState === Button.interactionStates.HOVER ) button.background.fill = button.hoverFill;
        if ( interactionState === Button.interactionStates.PRESSED ) button.background.fill = button.pressedFill;
      } );
    }
  }

  // @public (read-only) {Enum} - Enumeration of possible button states.
  Button.interactionStates = new Enum( [
    'IDLE',   // Button is not being interacted with.
    'HOVER',  // A pointer is hovering over the button but not pressing down on it.
    'PRESSED' // The button is pressed because the user has pressed down on it.
  ] );

  return Button;
} );