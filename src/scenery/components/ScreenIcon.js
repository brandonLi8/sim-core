// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * ScreenIcon is the icon that is displayed in the navigation-bar for multi-screen simulations. It allows the user to
 * select or change the active Screen of the simulation.
 *
 * The ScreenIcon is responsible for displaying a content Node aligned on top of a background Node. However, it contains
 * a vast options API to customize the appearance of the ScreenIcon when used inside of the NavigationBar.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

define( require => {
  'use strict';

  // modules
  const assert = require( 'SIM_CORE/util/assert' );
  const Node = require( 'SIM_CORE/scenery/Node' );
  const Rectangle = require( 'SIM_CORE/scenery/Rectangle' );

  class ScreenIcon extends Node {

    /**
     * @param {Node} content - the content to display inside of the Rectangle
     * @param {Object} [options] - Various key-value pairs that control the appearance and behavior. See the code where
     *                             the options are set in the early portion of the constructor for details.
     */
    constructor( content, options ) {
      assert( content instanceof Node, `invalid content: ${ content }` );
      assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${ options }` );

      options = {

        backgroundFill: 'white',   // {string|Gradient} - the fill color of the background of the screen-icon
        height: 26,                // {number} the height of the screen-icon background
        width: 38,                 // {number} the width of the screen-icon background
        maxWidthProportion: 0.85,  // {number} max proportion of the background width occupied by screen-icon
        maxHeightProportion: 0.85, // {number} max proportion of the background height occupied by screen-icon

        // navigation-bar
        labelFontSize: 9.5,          // {number} - the font-size of the screen-icon label bellow the Rectangle
        activeIdleOpacity: 1,        // {number} - the opacity of the icon when active and idle
        activeHoverOpacity: 0.9,     // {number} - the opacity of the icon when active and hovered
        activePressedOpacity: 0.95,  // {number} - the opacity of the icon when active and pressed
        inactiveIdleOpacity: 0.5,    // {number} - the opacity of the icon when active and idle
        inactiveHoverOpacity: 0.4,   // {number} - the opacity of the icon when active and hovered
        inactivePressedOpacity: 0.6, // {number} - the opacity of the icon when active and pressed

        // Rewrite options so that it overrides the defaults.
        ...options
      };

      // Create the background.
      const background = new Rectangle( options.width, options.height, { fill: options.backgroundFill } );

      // Constrain the width and height of the content.
      content.maxWidth = options.width * options.maxWidthProportion;
      content.maxHeight = options.height * options.maxHeightProportion;

      // Align the content in the center of the background.
      content.center = background.center;

      super( { ...options, children: [ background, content ] } );

      //----------------------------------------------------------------------------------------

      // @public {number} (read-only) - Reference options that are used in the NavigationBar.
      this.labelFontSize = options.labelFontSize;
      this.activeIdleOpacity = options.activeIdleOpacity;
      this.activeHoverOpacity = options.activeHoverOpacity;
      this.activePressedOpacity = options.activePressedOpacity;
      this.inactiveIdleOpacity = options.inactiveIdleOpacity;
      this.inactiveHoverOpacity = options.inactiveHoverOpacity;
      this.inactivePressedOpacity = options.inactivePressedOpacity;
    }
  }

  return ScreenIcon;
} );