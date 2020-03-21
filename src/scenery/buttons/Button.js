// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A base-class abstraction for all Button Node sub-types. This class is generally not meant to be used within
 * sim-specific code. Rather, use any of its subclasses.
 *
 * The Button class is responsible for:
 *   - Handling Drag/Hover/Press Listeners for handling user interaction with the Button.
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
  const HoverListener = require( 'SIM_CORE/scenery/events/HoverListener' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Path = require( 'SIM_CORE/scenery/Path' );
  const PressListener = require( 'SIM_CORE/scenery/events/PressListener' );

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

    }
  }

  return Button;
} );