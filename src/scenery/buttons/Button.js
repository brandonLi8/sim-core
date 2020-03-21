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
  const Enum = require( 'SIM_CORE/util/Enum' );
  const HoverListener = require( 'SIM_CORE/scenery/events/HoverListener' );
  const LinearGradient = require( 'SIM_CORE/scenery/gradients/LinearGradient' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const PressListener = require( 'SIM_CORE/scenery/events/PressListener' );
  const Property = require( 'SIM_CORE/util/Property' );
  const Vector = require( 'SIM_CORE/util/Vector' );

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
        validValues: Button.interactionStates
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

      // @private {PressListener} - create a PressListener for when the user clicks on the Button
      this._pressListener = new PressListener( this, {
        press: () => { this.interactionStateProperty.value = Button.interactionStates.PRESSED; }
        release: () => { this.interactionStateProperty.value = Button.interactionStates.HOVER; }
      } );

      // @private {HoverListener} - create a HoverListener for when the user hovers over the Button
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
      const xAlignKey = this._xAlign === 'center' : 'centerX' : this._xAlign;
      const yAlignKey = this._yAlign === 'center' : 'centerY' : this._yAlign;

      this.content[ xAlignKey ] = this.background[ xAlignKey ];
      this.content[ yAlignKey ] = this.background[ yAlignKey ];
    }
  }

  // @public (read-only) {Enum} - Enumeration of possible button states.
  Button.interactionStates = new Enum( [
    'IDLE',   // Button is not being interacted with
    'HOVER',  // A pointer is hovering over the button but not pressing down on it
    'PRESSED' // The button is pressed because the user has pressed down on it
  ] );

  return Button;
} );